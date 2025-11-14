import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

export default function FlightDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [flight, setFlight] = useState(null);

  useEffect(() => {
    axios.get(`http://localhost:8002/flights/${id}`)
      .then(res => setFlight(res.data));
  }, []);

  const reserve = async () => {
    try {
      const res = await axios.post(
        "http://localhost:8003/bookings",
        {
          flight_id: id,
          user_id: user.user_id,
          passenger_name: user.full_name,
          passenger_document: "CC123456789",
          seat_number: "12A"
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate(`/payment/${res.data.id}`);
    } catch {
      alert("Error al reservar");
    }
  };

  if (!flight) return <p>Cargando...</p>;

  return (
    <div>
      <h2>Vuelo {flight.flight_number}</h2>
      <p>{flight.origin} → {flight.destination}</p>
      <p>Precio: ${flight.price}</p>

      {user?.role === "customer" && (
        <button onClick={reserve}>Reservar asiento</button>
      )}
    </div>
  );
}