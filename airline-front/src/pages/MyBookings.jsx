import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

export default function MyBookings() {
  const { token, user } = useAuth();
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    axios.get(
      `http://localhost:8003/bookings/user/${user.user_id}`,
      { headers: { Authorization: `Bearer ${token}` } }
    ).then(res => setBookings(res.data));
  }, []);

  return (
    <div>
      <h2>Mis Reservas</h2>
      {bookings.map(b => (
        <div key={b.id}>
          {b.booking_code} — {b.status}
          <Link to={`/ticket/${b.id}`}>Ver ticket</Link>
          {b.status !== "checked_in" && (
            <Link to={`/checkin/${b.id}`}>Check-in</Link>
          )}
        </div>
      ))}
    </div>
  );
}