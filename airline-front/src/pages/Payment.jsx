import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

export default function Payment() {
  const { bookingId } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();

  const pay = async () => {
    try {
      const res = await axios.post(
        "http://localhost:8004/payments/process",
        {
          booking_id: bookingId,
          amount: 450,
          payment_method: "credit_card",
          card_number: "4111111111111111"
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate(`/invoice/${res.data.id}`);
    } catch {
      alert("Error en el pago");
    }
  };

  return (
    <div>
      <h2>Pago de reserva</h2>
      <button onClick={pay}>Pagar ahora</button>
    </div>
  );
}