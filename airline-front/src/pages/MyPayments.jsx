import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "./List.css";

export default function MyPayments() {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;

    axios
      .get(`http://localhost:8004/payments/user/${user.user_id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setPayments(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setError("Error al cargar pagos");
        setLoading(false);
      });
  }, [user, token]);

  if (loading) {
    return (
      <div className="list-container">
        <div className="loading">Cargando pagos...</div>
      </div>
    );
  }

  return (
    <div className="list-container">
      <div className="list-card">
        <div className="list-header">
          <h1>Mis Pagos</h1>
          <p>Historial de pagos realizados</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        {payments.length === 0 ? (
          <div className="empty-state">
            <p>No tienes pagos registrados</p>
            <button onClick={() => navigate("/")} className="primary-button">
              Buscar Vuelos
            </button>
          </div>
        ) : (
          <div className="list-content">
            {payments.map((payment) => (
              <div key={payment.id} className="list-item">
                <div className="item-main">
                  <div className="item-title">Pago #{payment.id}</div>
                  <div className="item-subtitle">
                    Monto: <strong>${payment.amount}</strong>
                  </div>
                </div>
                <div className="item-status">
                  <span className={`status-badge ${payment.status}`}>
                    {payment.status === 'completed' ? '✓ Completado' : payment.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}