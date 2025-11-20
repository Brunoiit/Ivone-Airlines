from fastapi import FastAPI, HTTPException, Depends, status, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List
import requests
import random
import string
from bson import ObjectId

from models import get_db, Booking, booking_helper

app = FastAPI(title="Bookings Service", version="1.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

AUTH_URL = "http://auth-service:8001/auth/verify-token"
FLIGHTS_SERVICE_URL = "http://flights-service:8002"

# Schemas de entrada
class BookingCreate(BaseModel):
    flight_id: int
    passenger_name: str
    passenger_document: str
    seat_number: Optional[str] = None

# Schemas de salida
class BookingResponse(BaseModel):
    id: str
    booking_code: str
    flight_id: int
    user_id: int
    passenger_name: str
    passenger_document: str
    seat_number: Optional[str]
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


def verify_token(authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Token no proporcionado")

    try:
        token = authorization.replace("Bearer ", "")
        response = requests.get(f"{AUTH_URL}/auth/verify", params={"token": token})

        if response.status_code != 200:
            raise HTTPException(status_code=401, detail="Token inválido")

        return response.json()
    except requests.RequestException:
        raise HTTPException(status_code=503, detail="Servicio de autenticación no disponible")


def generate_booking_code():
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))


@app.post("/bookings", response_model=BookingResponse, status_code=201)
def create_booking(
    booking_data: BookingCreate,
    user_data: dict = Depends(verify_token),
    db = Depends(get_db)
):
    # Verificar vuelo
    flight_response = requests.get(f"{FLIGHTS_SERVICE_URL}/flights/{booking_data.flight_id}")
    if flight_response.status_code != 200:
        raise HTTPException(status_code=404, detail="El vuelo no existe")

    flight = flight_response.json()

    # Descontar asiento
    seat_response = requests.put(
        f"{FLIGHTS_SERVICE_URL}/flights/{booking_data.flight_id}/seats",
        params={"seats_to_reserve": 1}
    )

    if seat_response.status_code != 200:
        raise HTTPException(status_code=400, detail="No hay asientos disponibles")

    # Crear reserva
    booking = Booking(
        user_id=user_data.get("user_id"),
        flight_id=booking_data.flight_id,
        passenger_name=booking_data.passenger_name,
        passenger_document=booking_data.passenger_document,
        seat_number=booking_data.seat_number,
        booking_code=generate_booking_code(),
        status="confirmed"
    )

    # Insertar en MongoDB
    result = db.insert_one(booking.to_dict())
    booking_doc = db.find_one({"_id": result.inserted_id})

    return booking_helper(booking_doc)


@app.get("/bookings/{booking_id}", response_model=BookingResponse)
def get_booking(
    booking_id: str,
    user_data: dict = Depends(verify_token),
    db = Depends(get_db)
):
    # Validar ObjectId
    if not ObjectId.is_valid(booking_id):
        raise HTTPException(status_code=400, detail="ID de reserva inválido")

    # Buscar en MongoDB
    booking = db.find_one({"_id": ObjectId(booking_id)})
    
    if not booking:
        raise HTTPException(status_code=404, detail="Reserva no encontrada")

    # Verificar que el usuario sea propietario de la reserva
    if booking.get("user_id") != user_data.get("user_id"):
        raise HTTPException(status_code=403, detail="No tienes permiso para ver esta reserva")

    return booking_helper(booking)


@app.get("/bookings", response_model=List[BookingResponse])
def list_bookings(
    user_data: dict = Depends(verify_token),
    db = Depends(get_db)
):
    # Listar todas las reservas del usuario
    bookings = list(db.find({"user_id": user_data.get("user_id")}))
    
    return [booking_helper(booking) for booking in bookings]


@app.put("/bookings/{booking_id}/cancel", response_model=BookingResponse)
def cancel_booking(
    booking_id: str,
    user_data: dict = Depends(verify_token),
    db = Depends(get_db)
):
    # Validar ObjectId
    if not ObjectId.is_valid(booking_id):
        raise HTTPException(status_code=400, detail="ID de reserva inválido")

    # Buscar en MongoDB
    booking = db.find_one({"_id": ObjectId(booking_id)})
    
    if not booking:
        raise HTTPException(status_code=404, detail="Reserva no encontrada")

    # Verificar que el usuario sea propietario
    if booking.get("user_id") != user_data.get("user_id"):
        raise HTTPException(status_code=403, detail="No tienes permiso para cancelar esta reserva")

    # Actualizar estado a cancelada
    db.update_one(
        {"_id": ObjectId(booking_id)},
        {"$set": {"status": "cancelled"}}
    )

    # Liberar asiento
    requests.put(
        f"{FLIGHTS_SERVICE_URL}/flights/{booking.get('flight_id')}/seats",
        params={"seats_to_release": 1}
    )

    # Obtener la reserva actualizada
    updated_booking = db.find_one({"_id": ObjectId(booking_id)})

    return booking_helper(updated_booking)


@app.get("/health")
def health_check():
    return {"status": "ok", "service": "bookings-service"}