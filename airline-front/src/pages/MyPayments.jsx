import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

export default function MyPayments() {
  const { token, user } = useAuth();
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    axios.get(
      `http://localhost:8004/payments/user/${user.user_id}`,
      { headers: { Authorization: `Bearer ${token}` } }
    ).then(res => setPayments(res.data));
  }, []);

  return (
    <div>
      <h2>Mis Pagos</h2>
      {payments.map(p => (
        <div key={p.id}>
          Pago de {p.amount} — {p.status}
        </div>
      ))}
    </div>
  );
}