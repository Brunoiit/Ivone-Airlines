import { useState, useEffect } from 'react';
import './SearchFlights.css';

const SearchFlights = () => {
  const [searchParams, setSearchParams] = useState({
    departure_city: '',
    arrival_city: '',
    departure_date: ''
  });

  const [flights, setFlights] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearchChange = (e) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSearch = async (e) => {
    e.preventDefault();

    if (!searchParams.departure_city || !searchParams.arrival_city) {
      setError('Por favor completa los campos de origen y destino');
      return;
    }

    setIsLoading(true);
    setError('');
    setHasSearched(true);

    try {
      const params = new URLSearchParams({
        departure_city: searchParams.departure_city,
        arrival_city: searchParams.arrival_city,
        ...(searchParams.departure_date && { departure_date: searchParams.departure_date })
      });

      const response = await fetch(`http://localhost:8002/flights/search?${params}`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setFlights(data);
        if (data.length === 0) {
          setError('No se encontraron vuelos para los criterios especificados');
        }
      } else {
        setError('Error al buscar vuelos');
      }
    } catch (err) {
      setError('Error de conexión: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookFlight = (flightId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Debes iniciar sesión para reservar un vuelo');
      return;
    }
    window.location.href = `/booking/${flightId}`;
  };

  return (
    <div className="search-flights-container">
      <div className="search-header">
        <h1>Buscar Vuelos</h1>
        <p>Encuentra los mejores vuelos para tu viaje</p>
      </div>

      <form onSubmit={handleSearch} className="search-form">
        <div className="search-grid">
          <div className="form-group">
            <label htmlFor="departure_city">Ciudad de Salida</label>
            <input
              type="text"
              id="departure_city"
              name="departure_city"
              value={searchParams.departure_city}
              onChange={handleSearchChange}
              placeholder="Ciudad de Origen"
            />
          </div>

          <div className="form-group">
            <label htmlFor="arrival_city">Ciudad de Llegada</label>
            <input
              type="text"
              id="arrival_city"
              name="arrival_city"
              value={searchParams.arrival_city}
              onChange={handleSearchChange}
              placeholder="Ciudad Destino"
            />
          </div>

          <div className="form-group">
            <label htmlFor="departure_date">Fecha de Salida (Opcional)</label>
            <input
              type="date"
              id="departure_date"
              name="departure_date"
              value={searchParams.departure_date}
              onChange={handleSearchChange}
            />
          </div>
        </div>

        <button type="submit" disabled={isLoading} className="search-button">
          {isLoading ? 'Buscando...' : 'Buscar Vuelos'}
        </button>
      </form>

      {error && (
        <div className="error-message">
          ❌ {error}
        </div>
      )}

      {hasSearched && flights.length > 0 && (
        <div className="results-container">
          <h2>Resultados ({flights.length} vuelos encontrados)</h2>
          <div className="flights-grid">
            {flights.map((flight) => (
              <div key={flight.id} className="flight-card">
                <div className="flight-header">
                  <div className="cities">
                    <span className="city">{flight.departure_city}</span>
                    <span className="arrow">→</span>
                    <span className="city">{flight.arrival_city}</span>
                  </div>
                </div>

                <div className="flight-details">
                  <div className="time-info">
                    <div className="time">
                      <span className="label">Salida</span>
                      <span className="value">{new Date(flight.departure_time).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="duration">
                      <span className="label">Duración</span>
                      <span className="value">2h 30m</span>
                    </div>
                    <div className="time">
                      <span className="label">Llegada</span>
                      <span className="value">{new Date(flight.arrival_time).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>

                  <div className="flight-info">
                    <div className="info-item">
                      <span className="icon">✈️</span>
                      <span>{flight.aircraft_type}</span>
                    </div>
                    <div className="info-item">
                      <span className="icon">💺</span>
                      <span>{flight.available_seats} asientos disponibles</span>
                    </div>
                  </div>
                </div>

                <div className="flight-footer">
                  <div className="price">
                    <span className="label">Precio por persona</span>
                    <span className="amount">${flight.price.toFixed(2)}</span>
                  </div>
                  <button
                    onClick={() => handleBookFlight(flight.id)}
                    className="book-button"
                  >
                    Reservar Ahora
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {hasSearched && flights.length === 0 && !error && (
        <div className="empty-state">
          <h2>Sin resultados</h2>
          <p>Intenta con otros criterios de búsqueda</p>
        </div>
      )}
    </div>
  );
};

export default SearchFlights;