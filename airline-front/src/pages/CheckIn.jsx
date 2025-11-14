import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import "./Action.css";

export default function CheckIn() {
  const { bookingId } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleCheckIn = async () => {
    setLoading(true);
    setError("");

    try {
      await axios.post(
        `http://localhost:8003/bookings/${bookingId}/checkin`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess(true);
      setTimeout(() => {
        navigate(`/ticket/${bookingId}`);
      }, 1500);
    } catch (err) {
      setError(err?.response?.data?.detail || "Error al realizar check-in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="action-container">
      <div className="action-card">
        <div className="action-header">
          <h1>Check-In de Vuelo</h1>
          <p>Confirma tu entrada al vuelo</p>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">✓ Check-in realizado con éxito</div>}

        <div className="action-content">
          <div className="info-box">
            <p>Código de Reserva</p>
            <p className="highlight">{bookingId}</p>
          </div>
          <p className="info-text">
            Estás a punto de realizar el check-in. Una vez confirmado, recibirás tu código de embarque.
          </p>
        </div>

        <div className="action-buttons">
          <button
            onClick={handleCheckIn}
            className="primary-button"
            disabled={loading || success}
          >
            {loading ? "Procesando..." : success ? "Check-in Realizado" : "Confirmar Check-in"}
          </button>
          <button
            onClick={() => navigate("/my-bookings")}
            className="secondary-button"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}