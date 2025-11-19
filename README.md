# Sistema de Reservas de Vuelos – Microservicios con Python (Linux)

## Arquitectura del Sistema

### Microservicios
1. Auth Service (Puerto 8001) – Autenticación y gestión de usuarios  
2. Flights Service (Puerto 8002) – Gestión de vuelos y disponibilidad  
3. Bookings Service (Puerto 8003) – Reservas y tiquetes electrónicos  
4. Payments Service (Puerto 8004) – Procesamiento de pagos y facturación

### Bases de Datos
- PostgreSQL (Puerto 5432) – Para Auth, Flights y Payments  
- MongoDB (Puerto 27017) – Para Bookings

---

## Instalación y Configuración

### Prerrequisitos
1. Docker y Docker Compose instalados  
2. Python 3.9+ instalado  
3. Git (opcional)

---

### Paso 1: Preparar el Proyecto 
bash
mkdir Airline
cd Airline

---

### Paso 2: Levantar las Bases de Datos con Docker
docker-compose up -d
docker ps

### Paso 3: Inicializar la Base de Datos PostgreSQL
cat init-db.sql | docker exec -i postgres-db psql -U admin -d flight_system
docker exec -it postgres-db psql -U admin -d flight_system -c "\dt"

### Paso 4: Instalar Dependencias de Python
python3 -m venv venv
source venv/bin/activate

pip install -r auth-service/requirements.txt
pip install -r flights-service/requirements.txt
pip install -r bookings-service/requirements.txt
pip install -r payments-service/requirements.txt

### Paso 5: Iniciar los Microservicios (Caso de emergencia)
# Terminal 1
cd auth-service
python app.py

# Terminal 2
cd flights-service
python app.py

# Terminal 3
cd bookings-service
python app.py

# Terminal 4
cd payments-service
python app.py

# Probar el Sistema

## Ejecutar el script de demostración
python demo_script.py

# Comandos de prueba con curl

## 1. Registrar Aerolínea
curl -X POST http://localhost:8001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "aerolinea@vuelos.com",
    "password": "admin123",
    "full_name": "Aerolíneas del Cielo",
    "role": "airline"
  }'

## 2. Login
curl -X POST http://localhost:8001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "aerolinea@vuelos.com",
    "password": "admin123"
  }'

## 3. Crear Vuelo
curl -X POST http://localhost:8002/flights \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_TOKEN_AQUI" \
  -d '{
    "flight_number": "AC123",
    "origin": "BOG",
    "destination": "MIA",
    "departure_time": "2024-12-25T10:00:00",
    "arrival_time": "2024-12-25T15:00:00",
    "price": 350.00,
    "total_seats": 180,
    "airline_id": 1
  }'

## 4. Buscar Vuelos
curl "http://localhost:8002/flights/search?origin=BOG&destination=MIA&date=2024-12-25"

## 5. Crear Reserva
curl -X POST http://localhost:8003/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_TOKEN_USUARIO" \
  -d '{
    "flight_id": 1,
    "user_id": 2,
    "passenger_name": "Juan Pérez",
    "passenger_document": "123456789",
    "seat_number": "12A"
  }'

## 6. Procesar Pago
curl -X POST http://localhost:8004/payments/process \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_TOKEN_USUARIO" \
  -d '{
    "booking_id": "BOOKING_ID_MONGODB",
    "amount": 350.00,
    "payment_method": "credit_card",
    "card_number": "4111111111111111"
  }'

## Estructura de la Base de Datos

### PostgreSQL

Tabla: users
- id (PK)
- email (unique)
- password_hash
- full_name
- role (customer/airline/admin)
- created_at

Tabla: flights
- id (PK)
- flight_number
- origin (código IATA)
- destination (código IATA)
- departure_time
- arrival_time
- price
- available_seats
- total_seats
- airline_id (FK -> users)

Tabla: payments
- id (PK)
- booking_id (referencia a MongoDB)
- user_id (FK -> users)
- amount
- payment_method
- transaction_id
- status (pending/completed/failed)
- created_at

### MongoDB

Colección: bookings
{
  "_id": "ObjectId",
  "booking_code": "ABC123",
  "flight_id": 1,
  "user_id": 2,
  "passenger_name": "Juan Pérez",
  "passenger_document": "123456789",
  "seat_number": "12A",
  "status": "confirmed/checked_in/cancelled",
  "created_at": "ISODate",
  "checked_in_at": "ISODate"
}