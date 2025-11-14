import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

export default function CheckIn() {
  const { bookingId } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();

  const doCheckIn = async () => {
    await axios.post(
      `http://localhost:8003/bookings/${bookingId}/checkin`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    navigate(`/ticket/${bookingId}`);
  };

  return (
    <div>
      <h2>Check-In</h2>
      <button onClick={doCheckIn}>Hacer Check-In</button>
    </div>
  );
}