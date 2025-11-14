import { useState, useEffect } from 'react';
import './MyBookings.css';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');

        const response = await fetch(`http://localhost:8003/bookings/user/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setBookings(data);
        } else {
          setError('No se pudieron cargar las reservas');
        }
      } catch (err) {
        setError('Error al conectar con el servidor: ' + err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookings();
  }, []);

  if (isLoading) {
    return (
      <div className="my-bookings-container">
        <div className="loading">⏳ Cargando reservas...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-bookings-container">
        <div className="error-message">❌ {error}</div>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="my-bookings-container">
        <div className="empty-state">
          <h2>Sin Reservas</h2>
          <p>Aún no has realizado ninguna reserva. ¡Comienza a buscar vuelos!</p>
          <a href="/" className="back-link">Buscar Vuelos</a>
        </div>
      </div>
    );
  }

  return (
    <div className="my-bookings-container">
      <div className="bookings-header">
        <h1>Mis Reservas</h1>
        <p>Total de reservas: {bookings.length}</p>
      </div>

      <div className="bookings-grid">
        {bookings.map((booking) => (
          <div key={booking.id} className="booking-card">
            <div className="booking-header">
              <span className={`status ${booking.status.toLowerCase()}`}>
                {booking.status === 'confirmed' && '✅'}
                {booking.status === 'pending' && '⏳'}
                {booking.status === 'cancelled' && '❌'}
                {booking.status}
              </span>
            </div>
            <div className="booking-details">
              <div className="detail-row">
                <span className="label">Ruta:</span>
                <span className="value">{booking.flight?.departure_city} → {booking.flight?.arrival_city}</span>
              </div>
              <div className="detail-row">
                <span className="label">Salida:</span>
                <span className="value">{new Date(booking.flight?.departure_time).toLocaleString('es-ES')}</span>
              </div>
              <div className="detail-row">
                <span className="label">Asientos:</span>
                <span className="value">{booking.num_passengers}</span>
              </div>
              <div className="detail-row">
                <span className="label">Total:</span>
                <span className="value">${(booking.total_price || 0).toFixed(2)}</span>
              </div>
            </div>
            <div className="booking-actions">
              <button className="action-button">Descargar Boleto</button>
              <button className="action-button secondary">Rastrear Vuelo</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyBookings;