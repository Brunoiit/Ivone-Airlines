from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime
import os

MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://admin:admin123@mongodb-db:27017/")
client = MongoClient(MONGODB_URL)
db = client["airline-bookings"]
bookings_collection = db["bookings"]


class Booking:
    """Modelo de Booking para MongoDB"""
    def __init__(self, user_id, flight_id, passenger_name, passenger_document, 
                 seat_number=None, booking_code=None, status="confirmed", created_at=None):
        self.user_id = user_id
        self.flight_id = flight_id
        self.passenger_name = passenger_name
        self.passenger_document = passenger_document
        self.seat_number = seat_number
        self.booking_code = booking_code
        self.status = status
        self.created_at = created_at or datetime.utcnow()

    def to_dict(self):
        """Convierte el objeto a diccionario para MongoDB"""
        return {
            "user_id": self.user_id,
            "flight_id": self.flight_id,
            "passenger_name": self.passenger_name,
            "passenger_document": self.passenger_document,
            "seat_number": self.seat_number,
            "booking_code": self.booking_code,
            "status": self.status,
            "created_at": self.created_at,
        }


def get_db():
    """Devuelve la colección de MongoDB para reservas"""
    return bookings_collection


def booking_helper(booking_doc) -> dict:
    """Convierte documento de MongoDB a formato JSON"""
    return {
        "id": str(booking_doc.get("_id")),
        "booking_code": booking_doc.get("booking_code"),
        "user_id": booking_doc.get("user_id"),
        "flight_id": booking_doc.get("flight_id"),
        "passenger_name": booking_doc.get("passenger_name"),
        "passenger_document": booking_doc.get("passenger_document"),
        "seat_number": booking_doc.get("seat_number"),
        "status": booking_doc.get("status"),
        "created_at": booking_doc.get("created_at"),
    }