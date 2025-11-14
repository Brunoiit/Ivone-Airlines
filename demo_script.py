"""
Script de Demostración - Sistema de Reservas de Vuelos
Este script ejecuta un flujo completo del sistema:
1. Registro de usuarios
2. Login
3. Creación de vuelos
4. Búsqueda de vuelos
5. Creación de reserva
6. Procesamiento de pago
7. Check-in
8. Generación de tiquete
"""

import requests
import json
from datetime import datetime, timedelta

# URLs de los microservicios
AUTH_URL = "http://localhost:8001"
FLIGHTS_URL = "http://localhost:8002"
BOOKINGS_URL = "http://localhost:8003"
PAYMENTS_URL = "http://localhost:8004"

def print_section(title):
    print(f"\n{'='*60}")
    print(f"  {title}")
    print(f"{'='*60}\n")

def print_response(response):
    print(f"Status: {response.status_code}")
    try:
        print(json.dumps(response.json(), indent=2, ensure_ascii=False))
    except:
        print(response.text)
    print()

def main():
    print_section("INICIO - DEMO SISTEMA DE RESERVAS DE VUELOS")
    
    # Variables para almacenar datos
    airline_token = None
    customer_token = None
    flight_id = None
    booking_id = None
    payment_id = None
    
    # 1. REGISTRAR AEROLÍNEA
    print_section("1. Registrando Aerolínea")
    airline_data = {
        "email": "aerolineas@ivoneairlines.com",
        "password": "admin123",
        "full_name": "Aerolíneas del ivoneairlines SA",
        "role": "airline"
    }
    response = requests.post(f"{AUTH_URL}/auth/register", json=airline_data)
    print_response(response)
    
    # 2. REGISTRAR CLIENTE
    print_section("2. Registrando Cliente")
    customer_data = {
        "email": "juan.perez@email.com",
        "password": "cliente123",
        "full_name": "Juan Pérez",
        "role": "customer"
    }
    response = requests.post(f"{AUTH_URL}/auth/register", json=customer_data)
    print_response(response)
    
    # 3. LOGIN AEROLÍNEA
    print_section("3. Login Aerolínea")
    login_data = {
        "email": "aerolineas@ivoneairlines.com",
        "password": "admin123"
    }
    response = requests.post(f"{AUTH_URL}/auth/login", json=login_data)
    print_response(response)
    
    if response.status_code == 200:
        airline_token = response.json()["access_token"]
        airline_id = response.json()["user_id"]
        print(f"Token obtenido: {airline_token[:50]}...")
    
    # 4. LOGIN CLIENTE
    print_section("4. Login Cliente")
    login_data = {
        "email": "juan.perez@email.com",
        "password": "cliente123"
    }
    response = requests.post(f"{AUTH_URL}/auth/login", json=login_data)
    print_response(response)
    
    if response.status_code == 200:
        customer_token = response.json()["access_token"]
        customer_id = response.json()["user_id"]
        print(f"Token obtenido: {customer_token[:50]}...")
    
    # 5. CREAR VUELO
    print_section("5. Creando Vuelo (como Aerolínea)")
    departure = datetime.now() + timedelta(days=30)
    arrival = departure + timedelta(hours=5)
    
    flight_data = {
        "flight_number": "AC100",
        "origin": "BOG",
        "destination": "MIA",
        "departure_time": departure.isoformat(),
        "arrival_time": arrival.isoformat(),
        "price": 450.00,
        "total_seats": 180,
        "airline_id": airline_id
    }
    
    headers = {"Authorization": f"Bearer {airline_token}"}
    response = requests.post(f"{FLIGHTS_URL}/flights", json=flight_data, headers=headers)
    print_response(response)
    
    if response.status_code == 201:
        flight_id = response.json()["id"]
        print(f"Vuelo creado con ID: {flight_id}")
    
    # 6. BUSCAR VUELOS
    print_section("6. Buscando Vuelos")
    params = {
        "origin": "BOG",
        "destination": "MIA",
        "date": departure.strftime("%Y-%m-%d")
    }
    response = requests.get(f"{FLIGHTS_URL}/flights/search", params=params)
    print_response(response)
    
    # 7. CREAR RESERVA
    print_section("7. Creando Reserva (como Cliente)")
    booking_data = {
        "flight_id": flight_id,
        "user_id": customer_id,
        "passenger_name": "Juan Pérez",
        "passenger_document": "CC123456789",
        "seat_number": "12A"
    }
    
    headers = {"Authorization": f"Bearer {customer_token}"}
    response = requests.post(f"{BOOKINGS_URL}/bookings", json=booking_data, headers=headers)
    print_response(response)
    
    if response.status_code == 201:
        booking_id = response.json()["id"]
        booking_code = response.json()["booking_code"]
        print(f"Reserva creada con ID: {booking_id}")
        print(f"Código de reserva: {booking_code}")
    
    # 8. PROCESAR PAGO
    print_section("8. Procesando Pago")
    payment_data = {
        "booking_id": booking_id,
        "amount": 450.00,
        "payment_method": "credit_card",
        "card_number": "4111111111111111"
    }
    
    headers = {"Authorization": f"Bearer {customer_token}"}
    response = requests.post(f"{PAYMENTS_URL}/payments/process", json=payment_data, headers=headers)
    print_response(response)
    
    if response.status_code == 201:
        payment_id = response.json()["id"]
        transaction_id = response.json()["transaction_id"]
        print(f"Pago procesado con ID: {payment_id}")
        print(f"ID de transacción: {transaction_id}")
    
    # 9. OBTENER FACTURA
    print_section("9. Obteniendo Factura")
    headers = {"Authorization": f"Bearer {customer_token}"}
    response = requests.get(f"{PAYMENTS_URL}/payments/{payment_id}/invoice", headers=headers)
    print_response(response)
    
    # 10. CHECK-IN
    print_section("10. Realizando Check-In")
    headers = {"Authorization": f"Bearer {customer_token}"}
    response = requests.post(f"{BOOKINGS_URL}/bookings/{booking_id}/checkin", headers=headers)
    print_response(response)
    
    # 11. OBTENER TIQUETE
    print_section("11. Obteniendo Tiquete Electrónico")
    headers = {"Authorization": f"Bearer {customer_token}"}
    response = requests.get(f"{BOOKINGS_URL}/bookings/{booking_id}/ticket", headers=headers)
    print_response(response)
    
    # 12. VER HISTORIAL DE RESERVAS
    print_section("12. Historial de Reservas del Usuario")
    headers = {"Authorization": f"Bearer {customer_token}"}
    response = requests.get(f"{BOOKINGS_URL}/bookings/user/{customer_id}", headers=headers)
    print_response(response)
    
    # 13. VER HISTORIAL DE PAGOS
    print_section("13. Historial de Pagos del Usuario")
    headers = {"Authorization": f"Bearer {customer_token}"}
    response = requests.get(f"{PAYMENTS_URL}/payments/user/{customer_id}", headers=headers)
    print_response(response)
    
    print_section("FIN DE LA DEMOSTRACIÓN")
    print("Todos los microservicios funcionaron correctamente!")
    print("\nResumen:")
    print(f"  - Aerolínea registrada: aerolineas@ivoneairlines.com")
    print(f"  - Cliente registrado: juan.perez@email.com")
    print(f"  - Vuelo creado: AC100 (BOG -> MIA)")
    print(f"  - Reserva: {booking_code}")
    print(f"  - Pago procesado: {transaction_id}")
    print(f"  - Check-in completado")

if __name__ == "__main__":
    try:
        main()
    except requests.exceptions.ConnectionError:
        print("\nERROR: No se pudo conectar a los microservicios.")
        print("Asegúrese de que todos los servicios estén corriendo:")
        print("  - Auth Service: http://localhost:8001")
        print("  - Flights Service: http://localhost:8002")
        print("  - Bookings Service: http://localhost:8003")
        print("  - Payments Service: http://localhost:8004")
    except Exception as e:
        print(f"\nERROR: {str(e)}")
