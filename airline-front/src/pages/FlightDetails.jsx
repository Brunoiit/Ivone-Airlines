import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./FlightDetails.css";

const FlightDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, user } = useAuth();

  const [flight, setFlight] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reserving, setReserving] = useState(false);

  useEffect(() => {
    const fetchFlight = async () => {
      try {
        const res = await fetch(`http://localhost:8002/flights/${id}`);
        const data = await res.json();
        setFlight(data);
      } catch (err) {
        setError("Error al obtener detalles del vuelo");
      } finally {
        setLoading(false);
      }
    };

    fetchFlight();
  }, [id]);

  const handleReserve = async () => {
    if (!token) {
      navigate("/login");
      return;
    }

    setReserving(true);
    try {
      const res = await fetch("http://localhost:8003/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          user_id: user.user_id,
          flight_id: Number(id),
        }),
      });

      const data = await res.json();

      if (res.status === 201) {
        navigate(`/payment/${data.booking_id}`);
      } else {
        setError(data.detail ?? "Error al realizar la reserva");
      }
    } catch (err) {
      setError("Error inesperado al reservar");
    } finally {
      setReserving(false);
    }
  };

  if (loading) {
    return (
      <div className="flight-details-container">
        <div className="loading">Cargando detalles del vuelo...</div>
      </div>
    );
  }

  if (!flight) {
    return (
      <div className="flight-details-container">
        <div className="empty-state">No se encontró el vuelo solicitado</div>
      </div>
    );
  }

  return (
    <div className="flight-details-container">
      <div className="flight-details-card">
        <div className="flight-header">
          <h1>Detalles del Vuelo</h1>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="flight-info">
          <div className="info-section">
            <h3>Información del Vuelo</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>Número de Vuelo</label>
                <p className="value">{flight.flight_number}</p>
              </div>
              <div className="info-item">
                <label>Ruta</label>
                <p className="value">{flight.origin} → {flight.destination}</p>
              </div>
            </div>
          </div>

          <div className="info-section">
            <h3>Horarios</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>Salida</label>
                <p className="value">{new Date(flight.departure_time).toLocaleString('es-ES')}</p>
              </div>
              <div className="info-item">
                <label>Llegada</label>
                <p className="value">{new Date(flight.arrival_time).toLocaleString('es-ES')}</p>
              </div>
            </div>
          </div>

          <div className="info-section">
            <h3>Disponibilidad y Tarifa</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>Sillas Disponibles</label>
                <p className="value">{flight.available_seats}</p>
              </div>
              <div className="info-item">
                <label>Precio por Pasajero</label>
                <p className="value price">${flight.price}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flight-actions">
          <button
            onClick={handleReserve}
            className="reserve-button"
            disabled={flight.available_seats === 0 || reserving || !token}
          >
            {reserving ? "Procesando..." : "Reservar Vuelo"}
          </button>
          <button onClick={() => navigate("/")} className="back-button">
            Volver a Búsqueda
          </button>
        </div>
      </div>
    </div>
  );
};

export default FlightDetails;