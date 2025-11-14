import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

export default function Invoice() {
  const { paymentId } = useParams();
  const { token } = useAuth();
  const [invoice, setInvoice] = useState(null);

  useEffect(() => {
    axios.get(`http://localhost:8004/payments/${paymentId}/invoice`,
      { headers: { Authorization: `Bearer ${token}` } }
    ).then(res => setInvoice(res.data));
  }, []);

  if (!invoice) return <p>Cargando...</p>;

  return (
    <div>
      <h2>Factura #{invoice.invoice_number}</h2>
      <p>Monto: ${invoice.amount}</p>
      <p>Fecha: {invoice.created_at}</p>
    </div>
  );
}