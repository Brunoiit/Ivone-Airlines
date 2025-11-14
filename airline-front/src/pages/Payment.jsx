import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import "./Payment.css";

export default function Payment() {
  const { bookingId } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [cardNumber, setCardNumber] = useState("4111111111111111");
  const [expiryDate, setExpiryDate] = useState("12/25");
  const [cvv, setCvv] = useState("123");

  const handlePay = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await axios.post(
        "http://localhost:8004/payments/process",
        {
          booking_id: bookingId,
          amount: 450,
          payment_method: "credit_card",
          card_number: cardNumber,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate(`/invoice/${res.data.id}`);
    } catch (err) {
      setError(err?.response?.data?.detail || "Error al procesar el pago");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="payment-container">
      <div className="payment-card">
        <div className="payment-header">
          <h1>Pago de Reserva</h1>
          <p>Completa tu reserva de vuelo</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="payment-form">
          <div className="form-section">
            <h3>Información de Tarjeta</h3>

            <div className="form-group">
              <label>Número de Tarjeta</label>
              <input
                type="text"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 16))}
                placeholder="4111 1111 1111 1111"
                maxLength="16"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Fecha de Vencimiento</label>
                <input
                  type="text"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  placeholder="MM/YY"
                  maxLength="5"
                />
              </div>
              <div className="form-group">
                <label>CVV</label>
                <input
                  type="text"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                  placeholder="123"
                  maxLength="3"
                />
              </div>
            </div>
          </div>

          <div className="payment-summary">
            <h3>Resumen del Pago</h3>
            <div className="summary-row">
              <span>Reserva Vuelo:</span>
              <span>$450.00</span>
            </div>
            <div className="summary-row">
              <span>Impuestos:</span>
              <span>$0.00</span>
            </div>
            <div className="summary-total">
              <span>Total:</span>
              <span>$450000</span>
            </div>
          </div>
        </div>

        <div className="payment-actions">
          <button
            onClick={handlePay}
            className="pay-button"
            disabled={loading}
          >
            {loading ? "Procesando..." : "Pagar Ahora"}
          </button>
          <button
            onClick={() => navigate("/")}
            className="cancel-button"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}