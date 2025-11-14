from pymongo import MongoClient
from datetime import datetime
import random
import string

MONGODB_URL = "mongodb://admin:admin123@localhost:27017/"
client = MongoClient(MONGODB_URL)
db = client["flight_bookings"]
bookings_collection = db["bookings"]

def generate_booking_code():
    """Genera un código de reserva único de 6 caracteres"""
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))

def get_booking_collection():
    return bookings_collection
