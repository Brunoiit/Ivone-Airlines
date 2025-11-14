from fastapi import FastAPI, HTTPException, Depends, status, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session
from datetime import datetime
from typing import Optional, List
from models import Flight, get_db
import requests
import uvicorn
import random

app = FastAPI(title="Flights Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

AUTH_SERVICE_URL = "http://localhost:8001"

# Modelos Pydantic
class FlightCreate(BaseModel):
    flight_number: str
    origin: str
    destination: str
    departure_time: datetime
    arrival_time: datetime
    price: float
    total_seats: int
    airline_id: int

class FlightUpdate(BaseModel):
    price: Optional[float] = None
    available_seats: Optional[int] = None

class FlightResponse(BaseModel):
    id: int
    flight_number: str
    origin: str
    destination: str
    departure_time: datetime
    arrival_time: datetime
    price: float
    available_seats: int
    total_seats: int
    airline_id: int
    created_at: datetime

# Función para verificar token, para mas placer
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
        "service": "Flights Service",
        "version": "1.0.0",
        "status": "running"
    }

@app.post("/flights", response_model=FlightResponse, status_code=status.HTTP_201_CREATED)
def create_flight(
    flight_data: FlightCreate,
    db: Session = Depends(get_db),
    user_data: dict = Depends(verify_token)
):
    # Validamos lo siguiente para que no se pasen de listos y claro esta, para mas placer
    # Solo aerolíneas pueden crear vuelos
    if user_data["role"] != "airline":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo aerolíneas pueden crear vuelos"
        )
    
    # Verificar que el vuelo no exista
    existing_flight = db.query(Flight).filter(Flight.flight_number == flight_data.flight_number).first()
    if existing_flight:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El número de vuelo ya existe"
        )
    
    # Validaciones
    if flight_data.departure_time >= flight_data.arrival_time:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La hora de llegada debe ser posterior a la de salida"
        )
    
    if flight_data.total_seats <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El número total de asientos debe ser mayor a 0"
        )
    
    # Crear vuelo
    new_flight = Flight(
        flight_number = f"FL-{random.randint(1000, 9999)}",
        origin=flight_data.origin.upper(),
        destination=flight_data.destination.upper(),
        departure_time=flight_data.departure_time,
        arrival_time=flight_data.arrival_time,
        price=flight_data.price,
        available_seats=flight_data.total_seats,
        total_seats=flight_data.total_seats,
        airline_id=flight_data.airline_id
    )
    
    db.add(new_flight)
    db.commit()
    db.refresh(new_flight)
    
    return new_flight

@app.get("/flights/search", response_model=List[FlightResponse])
def search_flights(
    origin: Optional[str] = None,
    destination: Optional[str] = None,
    date: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Flight)
    
    if origin:
        query = query.filter(Flight.origin == origin.upper())
    
    if destination:
        query = query.filter(Flight.destination == destination.upper())
    
    if date:
        try:
            date_obj = datetime.strptime(date, "%Y-%m-%d")
            query = query.filter(
                Flight.departure_time >= date_obj,
                Flight.departure_time < datetime(date_obj.year, date_obj.month, date_obj.day, 23, 59, 59)
            )
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Formato de fecha inválido. Use YYYY-MM-DD"
            )
    
    flights = query.filter(Flight.available_seats > 0).all()
    return flights

@app.get("/flights/{flight_id}", response_model=FlightResponse)
def get_flight(flight_id: int, db: Session = Depends(get_db)):
    flight = db.query(Flight).filter(Flight.id == flight_id).first()
    if not flight:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vuelo no encontrado"
        )
    return flight

@app.put("/flights/{flight_id}/seats")
def update_seats(
    flight_id: int,
    seats_to_reserve: int,
    db: Session = Depends(get_db)
):
    flight = db.query(Flight).filter(Flight.id == flight_id).first()
    if not flight:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vuelo no encontrado"
        )
    
    if flight.available_seats < seats_to_reserve:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No hay suficientes asientos disponibles"
        )
    
    flight.available_seats -= seats_to_reserve
    db.commit()
    db.refresh(flight)
    
    return {"message": "Asientos actualizados", "available_seats": flight.available_seats}

@app.delete("/flights/{flight_id}")
def delete_flight(
    flight_id: int,
    db: Session = Depends(get_db),
    user_data: dict = Depends(verify_token)
):
    if user_data["role"] not in ["airline", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tiene permisos para eliminar vuelos"
        )
    
    flight = db.query(Flight).filter(Flight.id == flight_id).first()
    if not flight:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vuelo no encontrado"
        )
    
    db.delete(flight)
    db.commit()
    
    return {"message": "Vuelo eliminado exitosamente"}

if __name__ == "__main__":
    print("Iniciando Flights Service en http://localhost:8002")
    uvicorn.run(app, host="0.0.0.0", port=8002)