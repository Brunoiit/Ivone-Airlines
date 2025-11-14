import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const FlightDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, user } = useAuth();

  const [flight, setFlight] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFlight = async () => {
      try {
        const res = await fetch(`http://localhost:8002/flights/${id}`);
        const data = await res.json();
        setFlight(data);
      } catch (error) {
        console.error("Error al obtener vuelo", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFlight();
  }, [id]);

  const handleReserve = async () => {
    if (!token) {
      alert("Debes iniciar sesión para reservar");
      navigate("/login");
      return;
    }

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
        alert("Reserva realizada con éxito");
        navigate(`/payment/${data.booking_id}`);
      } else {
        alert(data.detail ?? "Error al realizar reserva");
      }
    } catch (error) {
      console.error(error);
      alert("Error inesperado al reservar");
    }
  };

  if (loading) return <p>Cargando...</p>;
  if (!flight) return <p>No se encontró el vuelo</p>;

  return (
    <div className="container">
      <h2>Detalles del Vuelo</h2>
      <p><b>Número:</b> {flight.flight_number}</p>
      <p><b>Origen:</b> {flight.origin}</p>
      <p><b>Destino:</b> {flight.destination}</p>
      <p><b>Salida:</b> {flight.departure_time}</p>
      <p><b>Llegada:</b> {flight.arrival_time}</p>
      <p><b>Precio:</b> ${flight.price}</p>
      <p><b>Sillas disponibles:</b> {flight.available_seats}</p>

      <button
        onClick={handleReserve}
        className="btn btn-primary"
        disabled={!token}
      >
        Reservar
      </button>
    </div>
  );
};

export default FlightDetails;