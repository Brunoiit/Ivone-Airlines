from fastapi import FastAPI, HTTPException, Depends, status, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List
from bson import ObjectId
from models import get_booking_collection, generate_booking_code
import requests
import uvicorn

app = FastAPI(title="Bookings Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

AUTH_SERVICE_URL = "http://localhost:8001"
FLIGHTS_SERVICE_URL = "http://localhost:8002"

# Modelos Pydantic
class BookingCreate(BaseModel):
    flight_id: int
    user_id: int
    passenger_name: str
    passenger_document: str
    seat_number: str

class BookingResponse(BaseModel):
    id: str
    booking_code: str
    flight_id: int
    user_id: int
    passenger_name: str
    passenger_document: str
    seat_number: str
    status: str
    created_at: str
    checked_in_at: Optional[str] = None

class TicketResponse(BaseModel):
    booking_code: str
    passenger_name: str
    flight_number: str
    origin: str
    destination: str
    departure_time: str
    seat_number: str
    status: str

# Función para verificar token Para mas placer, claro esta
def verify_token(authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token no proporcionado"
        )
    
    try:
        token = authorization.replace("Bearer ", "")
        response = requests.get(f"{AUTH_SERVICE_URL}/auth/verify", params={"token": token})
        
        if response.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token inválido"
            )
        
        return response.json()
    except requests.RequestException:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Servicio de autenticación no disponible"
        )

# Endpoints
@app.get("/")
def root():
    return {
        "service": "Bookings Service",
        "version": "1.0.0",
        "status": "running"
    }

@app.post("/bookings", response_model=BookingResponse, status_code=status.HTTP_201_CREATED)
def create_booking(
    booking_data: BookingCreate,
    user_data: dict = Depends(verify_token)
):
    bookings = get_booking_collection()
    
    # Verificar que el vuelo existe y tiene asientos disponibles
    try:
        flight_response = requests.get(f"{FLIGHTS_SERVICE_URL}/flights/{booking_data.flight_id}")
        if flight_response.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Vuelo no encontrado"
            )
        
        flight = flight_response.json()
        
        if flight["available_seats"] <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No hay asientos disponibles en este vuelo"
            )
    except requests.RequestException:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Servicio de vuelos no disponible"
        )
    
    # Verificar que el asiento no esté ocupado
    existing_booking = bookings.find_one({
        "flight_id": booking_data.flight_id,
        "seat_number": booking_data.seat_number,
        "status": {"$ne": "cancelled"}
    })
    
    if existing_booking:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"El asiento {booking_data.seat_number} ya está reservado"
        )
    
    # Crear reserva
    booking_code = generate_booking_code()
    new_booking = {
        "booking_code": booking_code,
        "flight_id": booking_data.flight_id,
        "user_id": booking_data.user_id,
        "passenger_name": booking_data.passenger_name,
        "passenger_document": booking_data.passenger_document,
        "seat_number": booking_data.seat_number,
        "status": "confirmed",
        "created_at": datetime.utcnow().isoformat(),
        "checked_in_at": None
    }
    
    result = bookings.insert_one(new_booking)
    
    # Actualizar asientos disponibles en el servicio de vuelos
    try:
        requests.put(
            f"{FLIGHTS_SERVICE_URL}/flights/{booking_data.flight_id}/seats",
            params={"seats_to_reserve": 1}
        )
    except requests.RequestException:
        # Revertir la reserva si falla la actualización de asientos
        bookings.delete_one({"_id": result.inserted_id})
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Error al actualizar asientos disponibles"
        )
    
    new_booking["id"] = str(result.inserted_id)
    return new_booking

@app.get("/bookings/{booking_id}", response_model=BookingResponse)
def get_booking(booking_id: str, user_data: dict = Depends(verify_token)):
    bookings = get_booking_collection()
    
    try:
        booking = bookings.find_one({"_id": ObjectId(booking_id)})
    except:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="ID de reserva inválido"
        )
    
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reserva no encontrada"
        )
    
    booking["id"] = str(booking["_id"])
    del booking["_id"]
    return booking

@app.get("/bookings/user/{user_id}", response_model=List[BookingResponse])
def get_user_bookings(user_id: int, user_data: dict = Depends(verify_token)):
    # Verificar que el usuario solo pueda ver sus propias reservas
    if user_data["user_id"] != user_id and user_data["role"] != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tiene permisos para ver estas reservas"
        )
    
    bookings = get_booking_collection()
    user_bookings = list(bookings.find({"user_id": user_id}))
    
    for booking in user_bookings:
        booking["id"] = str(booking["_id"])
        del booking["_id"]
    
    return user_bookings

@app.post("/bookings/{booking_id}/checkin")
def checkin(booking_id: str, user_data: dict = Depends(verify_token)):
    bookings = get_booking_collection()
    
    try:
        booking = bookings.find_one({"_id": ObjectId(booking_id)})
    except:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="ID de reserva inválido"
        )
    
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reserva no encontrada"
        )
    
    if booking["status"] == "cancelled":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No se puede hacer check-in de una reserva cancelada"
        )
    
    if booking["status"] == "checked_in":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ya se realizó el check-in para esta reserva"
        )
    
    # Realizar check-in
    bookings.update_one(
        {"_id": ObjectId(booking_id)},
        {
            "$set": {
                "status": "checked_in",
                "checked_in_at": datetime.utcnow().isoformat()
            }
        }
    )
    
    return {"message": "Check-in realizado exitosamente", "booking_id": booking_id}

@app.get("/bookings/{booking_id}/ticket", response_model=TicketResponse)
def get_ticket(booking_id: str, user_data: dict = Depends(verify_token)):
    bookings = get_booking_collection()
    
    try:
        booking = bookings.find_one({"_id": ObjectId(booking_id)})
    except:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="ID de reserva inválido"
        )
    
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reserva no encontrada"
        )
    
    # Obtener información del vuelo
    try:
        flight_response = requests.get(f"{FLIGHTS_SERVICE_URL}/flights/{booking['flight_id']}")
        if flight_response.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Vuelo no encontrado"
            )
        
        flight = flight_response.json()
    except requests.RequestException:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Servicio de vuelos no disponible"
        )
    
    ticket = {
        "booking_code": booking["booking_code"],
        "passenger_name": booking["passenger_name"],
        "flight_number": flight["flight_number"],
        "origin": flight["origin"],
        "destination": flight["destination"],
        "departure_time": flight["departure_time"],
        "seat_number": booking["seat_number"],
        "status": booking["status"]
    }
    
    return ticket

@app.delete("/bookings/{booking_id}")
def cancel_booking(booking_id: str, user_data: dict = Depends(verify_token)):
    bookings = get_booking_collection()
    
    try:
        booking = bookings.find_one({"_id": ObjectId(booking_id)})
    except:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="ID de reserva inválido"
        )
    
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reserva no encontrada"
        )
    
    if booking["status"] == "cancelled":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La reserva ya está cancelada"
        )
    
    # Cancelar reserva
    bookings.update_one(
        {"_id": ObjectId(booking_id)},
        {"$set": {"status": "cancelled"}}
    )
    
    return {"message": "Reserva cancelada exitosamente"}

if __name__ == "__main__":
    print("Iniciando Bookings Service en http://localhost:8003")
    uvicorn.run(app, host="0.0.0.0", port=8003)
