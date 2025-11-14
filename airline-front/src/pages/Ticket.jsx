import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import "./Document.css";

export default function Ticket() {
  const { bookingId } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    axios
      .get(`http://localhost:8003/bookings/${bookingId}/ticket`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setTicket(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setError("Error al cargar el tiquete");
        setLoading(false);
      });
  }, [bookingId, token]);

  if (loading) {
    return (
      <div className="document-container">
        <div className="loading">Cargando tiquete...</div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="document-container">
        <div className="empty-state">No se encontró el tiquete</div>
      </div>
    );
  }

  return (
    <div className="document-container">
      <div className="document-card">
        <div className="document-header">
          <h1>Tiquete Electrónico</h1>
          <p>Conserva este documento para tu viaje</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="document-content">
          <div className="ticket-section">
            <div className="section-title">Información de Reserva</div>
            <div className="info-grid">
              <div className="info-item">
                <label>Código de Reserva</label>
                <p className="value highlight">{ticket.booking_code}</p>
              </div>
              <div className="info-item">
                <label>Pasajero</label>
                <p className="value">{ticket.passenger_name}</p>
              </div>
            </div>
          </div>

          <div className="ticket-section">
            <div className="section-title">Detalles del Vuelo</div>
            <div className="info-grid">
              <div className="info-item">
                <label>Número de Vuelo</label>
                <p className="value">{ticket.flight_number}</p>
              </div>
              <div className="info-item">
                <label>Ruta</label>
                <p className="value">{ticket.origin} → {ticket.destination}</p>
              </div>
              <div className="info-item">
                <label>Asiento</label>
                <p className="value highlight">{ticket.seat_number}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="document-actions">
          <button onClick={() => window.print()} className="print-button">
            Imprimir Tiquete
          </button>
          <button onClick={() => navigate("/my-bookings")} className="back-button">
            Volver a Mis Reservas
          </button>
        </div>
      </div>
    </div>
  );
}