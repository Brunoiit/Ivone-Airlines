import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

export default function Ticket() {
  const { bookingId } = useParams();
  const { token } = useAuth();
  const [ticket, setTicket] = useState(null);

  useEffect(() => {
    axios.get(
      `http://localhost:8003/bookings/${bookingId}/ticket`,
      { headers: { Authorization: `Bearer ${token}` } }
    ).then(res => setTicket(res.data));
  }, []);

  if (!ticket) return <p>Cargando...</p>;

  return (
    <div>
      <h2>Tiquete electrónico</h2>
      <p>Código: {ticket.booking_code}</p>
      <p>Pasajero: {ticket.passenger_name}</p>
      <p>Vuelo: {ticket.flight_number} — {ticket.origin} → {ticket.destination}</p>
      <p>Asiento: {ticket.seat_number}</p>
    </div>
  );
}