from fastapi import FastAPI, HTTPException, Depends, status, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session
from datetime import datetime
from typing import List
from models import Payment, get_db
import requests
import uuid
import uvicorn

app = FastAPI(title="Payments Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

AUTH_SERVICE_URL = "http://localhost:8001"

# Modelos Pydantic
class PaymentCreate(BaseModel):
    booking_id: str
    amount: float
    payment_method: str  # credit_card, debit_card, paypal, etc. money es money no importa de donde proceda
    card_number: str  # Simulado, porque no nos dejaran adquirir funtes de recursos de manera ilegitima

class PaymentResponse(BaseModel):
    id: int
    booking_id: str
    user_id: int
    amount: float
    payment_method: str
    transaction_id: str
    status: str
    created_at: datetime

class InvoiceResponse(BaseModel):
    payment_id: int
    booking_id: str
    amount: float
    payment_method: str
    transaction_id: str
    status: str
    created_at: str
    invoice_number: str

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

def generate_transaction_id():
    """Genera un ID de transacción único"""
    return f"TXN-{uuid.uuid4().hex[:12].upper()}"

def simulate_payment_processing(card_number: str, amount: float):
    """Simula el procesamiento de pago con una pasarela"""
    # Simulación: rechazar si el último dígito de la tarjeta es 0 (Como para que vean que si se valida)
    if card_number[-1] == '0':
        return False
    return True

# Endpoints
@app.get("/")
def root():
    return {
        "service": "Payments Service",
        "version": "1.0.0",
        "status": "running"
    }

@app.post("/payments/process", response_model=PaymentResponse, status_code=status.HTTP_201_CREATED)
def process_payment(
    payment_data: PaymentCreate,
    db: Session = Depends(get_db),
    user_data: dict = Depends(verify_token)
):
    # Validar método de pago, asegurando que "todo llegue"
    valid_methods = ["credit_card", "debit_card", "paypal", "bank_transfer"]
    if payment_data.payment_method not in valid_methods:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Método de pago inválido. Use: {', '.join(valid_methods)}"
        )
    
    # Validar monto
    if payment_data.amount <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El monto debe ser mayor a 0"
        )
    
    # Generar ID de transacción
    transaction_id = generate_transaction_id()
    
    # Simular procesamiento de pago, Ante todo el drama
    payment_successful = simulate_payment_processing(
        payment_data.card_number,
        payment_data.amount
    )
    
    payment_status = "completed" if payment_successful else "failed"
    
    # Crear registro de pago
    new_payment = Payment(
        booking_id=payment_data.booking_id,
        user_id=user_data["user_id"],
        amount=payment_data.amount,
        payment_method=payment_data.payment_method,
        transaction_id=transaction_id,
        status=payment_status
    )
    
    db.add(new_payment)
    db.commit()
    db.refresh(new_payment)
    
    if not payment_successful:
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail="Pago rechazado. Verifique sus datos de pago."
        )
    
    return new_payment

@app.get("/payments/{payment_id}", response_model=PaymentResponse)
def get_payment(
    payment_id: int,
    db: Session = Depends(get_db),
    user_data: dict = Depends(verify_token)
):
    payment = db.query(Payment).filter(Payment.id == payment_id).first()
    
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pago no encontrado"
        )
    
    # Verificar que el usuario solo pueda ver sus propios pagos
    if payment.user_id != user_data["user_id"] and user_data["role"] != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tiene permisos para ver este pago"
        )
    
    return payment

@app.get("/payments/user/{user_id}", response_model=List[PaymentResponse])
def get_user_payments(
    user_id: int,
    db: Session = Depends(get_db),
    user_data: dict = Depends(verify_token)
):
    # Verificar permisos
    if user_data["user_id"] != user_id and user_data["role"] != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tiene permisos para ver estos pagos"
        )
    
    payments = db.query(Payment).filter(Payment.user_id == user_id).all()
    return payments

@app.get("/payments/{payment_id}/invoice", response_model=InvoiceResponse)
def get_invoice(
    payment_id: int,
    db: Session = Depends(get_db),
    user_data: dict = Depends(verify_token)
):
    payment = db.query(Payment).filter(Payment.id == payment_id).first()
    
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pago no encontrado"
        )
    
    # Verificar permisos
    if payment.user_id != user_data["user_id"] and user_data["role"] != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tiene permisos para ver esta factura"
        )
    
    if payment.status != "completed":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No se puede generar factura para un pago no completado"
        )
    
    invoice = {
        "payment_id": payment.id,
        "booking_id": payment.booking_id,
        "amount": float(payment.amount),
        "payment_method": payment.payment_method,
        "transaction_id": payment.transaction_id,
        "status": payment.status,
        "created_at": payment.created_at.isoformat(),
        "invoice_number": f"INV-{payment.id:06d}"
    }
    
    return invoice

@app.post("/payments/{payment_id}/refund")
def refund_payment(
    payment_id: int,
    db: Session = Depends(get_db),
    user_data: dict = Depends(verify_token)
):
    payment = db.query(Payment).filter(Payment.id == payment_id).first()
    
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pago no encontrado"
        )
    
    if payment.status != "completed":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Solo se pueden reembolsar pagos completados"
        )
    
    if payment.status == "refunded":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Este pago ya fue reembolsado"
        )
    
    # Actualizar estado
    payment.status = "refunded"
    db.commit()
    
    return {"message": "Reembolso procesado exitosamente", "payment_id": payment_id}

if __name__ == "__main__":
    print("Iniciando Payments Service en http://localhost:8004")
    uvicorn.run(app, host="0.0.0.0", port=8004)
