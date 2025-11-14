import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './BookingDetails.css';

const BookingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const token = localStorage.getItem('token');
        
        const response = await fetch(`http://localhost:8003/bookings/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setBooking(data);
        } else {
          setError('No se pudo cargar la información de la reserva');
        }
      } catch (err) {
        setError('Error al conectar con el servidor: ' + err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBooking();
  }, [id]);

  if (isLoading) {
    return (
      <div className="booking-details-container">
        <div className="loading">Cargando detalles de la reserva...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="booking-details-container">
        <button className="back-button" onClick={() => navigate('/my-bookings')}>
          ← Volver
        </button>
        <div className="error-message">❌ {error}</div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="booking-details-container">
        <button className="back-button" onClick={() => navigate('/my-bookings')}>
          ← Volver
        </button>
        <div className="error-message">Reserva no encontrada</div>
      </div>
    );
  }

  const departureTime = new Date(booking.flight?.departure_time);
  const arrivalTime = new Date(booking.flight?.arrival_time);
  const flightDuration = Math.round((arrivalTime - departureTime) / (1000 * 60));

  return (
    <div className="booking-details-container">
      <button className="back-button" onClick={() => navigate('/my-bookings')}>
        ← Volver a Reservas
      </button>

      <div className="details-content">
        {/* Encabezado */}
        <div className="details-header">
          <div>
            <h1>Detalles de la Reserva</h1>
            <p className="booking-id">ID de Reserva: {booking.id}</p>
          </div>
          <span className={`status-badge ${booking.status.toLowerCase()}`}>
            {booking.status === 'confirmed' && 'CONFIRMADA'}
            {booking.status === 'pending' && 'PENDIENTE'}
            {booking.status === 'cancelled' && 'CANCELADA'}
          </span>
        </div>

        {/* Información del Vuelo */}
        <div className="details-card flight-info">
          <h2>✈️ Información del Vuelo</h2>
          <div className="flight-route">
            <div className="route-airport">
              <div className="airport-code">{booking.flight?.departure_city?.substring(0, 3).toUpperCase()}</div>
              <div className="airport-name">{booking.flight?.departure_city}</div>
            </div>
            <div className="route-arrow">
              <span className="duration">{flightDuration}m</span>
            </div>
            <div className="route-airport">
              <div className="airport-code">{booking.flight?.arrival_city?.substring(0, 3).toUpperCase()}</div>
              <div className="airport-name">{booking.flight?.arrival_city}</div>
            </div>
          </div>

          <div className="flight-times">
            <div className="time-section">
              <label>Salida</label>
              <div className="time">{departureTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</div>
              <div className="date">{departureTime.toLocaleDateString('es-ES')}</div>
            </div>
            <div className="time-section">
              <label>Llegada</label>
              <div className="time">{arrivalTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</div>
              <div className="date">{arrivalTime.toLocaleDateString('es-ES')}</div>
            </div>
          </div>

          <div className="flight-details-grid">
            <div className="detail">
              <span className="label">Aeronave:</span>
              <span className="value">{booking.flight?.aircraft_type}</span>
            </div>
            <div className="detail">
              <span className="label">Vuelo:</span>
              <span className="value">FL-{booking.flight?.id}</span>
            </div>
            <div className="detail">
              <span className="label">Aerolínea:</span>
              <span className="value">{booking.flight?.airline_id}</span>
            </div>
          </div>
        </div>

        {/* Información del Pasajero */}
        <div className="details-card passenger-info">
          <h2>Información del Pasajero</h2>
          <div className="passenger-grid">
            <div className="detail">
              <span className="label">Pasajeros:</span>
              <span className="value">{booking.num_passengers}</span>
            </div>
            <div className="detail">
              <span className="label">Asientos:</span>
              <span className="value">{booking.seat_number || 'Pendiente de asignar'}</span>
            </div>
          </div>
        </div>

        {/* Información de Precios */}
        <div className="details-card pricing-info">
          <h2>Detalles de Pago</h2>
          <div className="price-breakdown">
            <div className="price-row">
              <span>Precio por pasajero:</span>
              <span className="value">${booking.flight?.price.toFixed(2)}</span>
            </div>
            <div className="price-row">
              <span>Cantidad de pasajeros:</span>
              <span className="value">{booking.num_passengers}</span>
            </div>
            <div className="price-row separator">
              <span>Subtotal:</span>
              <span className="value">${(booking.flight?.price * booking.num_passengers).toFixed(2)}</span>
            </div>
            <div className="price-row total">
              <span>Total:</span>
              <span className="value">${booking.total_price.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div className="details-actions">
          {booking.status === 'confirmed' && (
            <>
              <button className="action-button primary">Descargar Boleto</button>
              <button className="action-button secondary">Realizar Check-in</button>
              <button className="action-button secondary">Mostrar QR</button>
            </>
          )}
          {booking.status === 'pending' && (
            <>
              <button className="action-button primary">Completar Pago</button>
              <button className="action-button secondary">Cancelar Reserva</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingDetails;