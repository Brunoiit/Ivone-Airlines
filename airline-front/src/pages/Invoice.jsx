import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import "./Document.css";

export default function Invoice() {
  const { paymentId } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    axios
      .get(`http://localhost:8004/payments/${paymentId}/invoice`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setInvoice(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setError("Error al cargar la factura");
        setLoading(false);
      });
  }, [paymentId, token]);

  if (loading) {
    return (
      <div className="document-container">
        <div className="loading">Cargando factura...</div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="document-container">
        <div className="empty-state">No se encontró la factura</div>
      </div>
    );
  }

  return (
    <div className="document-container">
      <div className="document-card">
        <div className="document-header">
          <h1>Factura #{invoice.invoice_number}</h1>
          <p>Comprobante de pago</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="document-content">
          <div className="invoice-section">
            <div className="section-title">Detalles de Pago</div>
            <div className="info-grid">
              <div className="info-item">
                <label>Monto</label>
                <p className="value highlight">${invoice.amount}</p>
              </div>
              <div className="info-item">
                <label>Fecha</label>
                <p className="value">{new Date(invoice.created_at).toLocaleDateString('es-ES')}</p>
              </div>
              <div className="info-item">
                <label>Estado</label>
                <p className="value status-paid">✓ Pagado</p>
              </div>
            </div>
          </div>
        </div>

        <div className="document-actions">
          <button onClick={() => window.print()} className="print-button">
            Imprimir Factura
          </button>
          <button onClick={() => navigate("/my-payments")} className="back-button">
            Volver a Mis Pagos
          </button>
        </div>
      </div>
    </div>
  );
}