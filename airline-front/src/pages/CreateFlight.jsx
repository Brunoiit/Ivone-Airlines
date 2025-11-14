import { useState } from 'react';
import './CreateFlight.css';

const CreateFlight = () => {
  const [formData, setFormData] = useState({
    departure_city: '',
    arrival_city: '',
    departure_time: '',
    arrival_time: '',
    price: '',
    available_seats: '',
    aircraft_type: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const validateForm = () => {
    const newErrors = {};

    if (!formData.departure_city.trim()) newErrors.departure_city = 'La ciudad de salida es requerida';
    if (!formData.arrival_city.trim()) newErrors.arrival_city = 'La ciudad de llegada es requerida';
    if (!formData.departure_time) newErrors.departure_time = 'La hora de salida es requerida';
    if (!formData.arrival_time) newErrors.arrival_time = 'La hora de llegada es requerida';
    if (!formData.price || parseFloat(formData.price) <= 0) newErrors.price = 'El precio debe ser mayor a 0';
    if (!formData.available_seats || parseInt(formData.available_seats) <= 0) newErrors.available_seats = 'Los asientos disponibles deben ser mayor a 0';
    if (!formData.aircraft_type.trim()) newErrors.aircraft_type = 'El tipo de aeronave es requerido';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const airlineId = localStorage.getItem('userId');

      const payload = {
        flight_number: `FL-${Date.now()}`,
        origin: formData.departure_city,
        destination: formData.arrival_city,
        departure_time: formData.departure_time,
        arrival_time: formData.arrival_time,
        price: parseFloat(formData.price),
        available_seats: parseInt(formData.available_seats),
        total_seats: parseInt(formData.available_seats),
        airline_id: airlineId
      };

      console.log("📌 Enviando:", payload);

      const response = await fetch('http://localhost:8002/flights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setSuccessMessage('Vuelo creado exitosamente');
        setFormData({
          departure_city: '',
          arrival_city: '',
          departure_time: '',
          arrival_time: '',
          price: '',
          available_seats: '',
          aircraft_type: ''
        });
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        const error = await response.json();
        setErrors({ submit: error.message || 'Error al crear el vuelo' });
      }
    } catch (err) {
      setErrors({ submit: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="create-flight-container">
      <div className="create-flight-card">
        <div className="create-flight-header">
          <h1>Crear Nuevo Vuelo</h1>
          <p>Completa los detalles del vuelo que deseas publicar</p>
        </div>

        {successMessage && <div className="success-message">{successMessage}</div>}
        {errors.submit && <div className="error-message">❌ {errors.submit}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="departure_city">Ciudad de Salida *</label>
              <input type="text" id="departure_city" name="departure_city" value={formData.departure_city} onChange={handleChange} placeholder="Ciudad" className={errors.departure_city ? 'error' : ''} />
              {errors.departure_city && <span className="error-text">{errors.departure_city}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="arrival_city">Ciudad de Llegada *</label>
              <input type="text" id="arrival_city" name="arrival_city" value={formData.arrival_city} onChange={handleChange} placeholder="Ciudad" className={errors.arrival_city ? 'error' : ''} />
              {errors.arrival_city && <span className="error-text">{errors.arrival_city}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="departure_time">Hora de Salida *</label>
              <input type="datetime-local" id="departure_time" name="departure_time" value={formData.departure_time} onChange={handleChange} className={errors.departure_time ? 'error' : ''} />
              {errors.departure_time && <span className="error-text">{errors.departure_time}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="arrival_time">Hora de Llegada *</label>
              <input type="datetime-local" id="arrival_time" name="arrival_time" value={formData.arrival_time} onChange={handleChange} className={errors.arrival_time ? 'error' : ''} />
              {errors.arrival_time && <span className="error-text">{errors.arrival_time}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="price">Precio (COP) *</label>
              <input type="number" id="price" name="price" value={formData.price} onChange={handleChange} placeholder="0" step="100" min="0" className={errors.price ? 'error' : ''} />
              {errors.price && <span className="error-text">{errors.price}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="available_seats">Asientos Disponibles *</label>
              <input type="number" id="available_seats" name="available_seats" value={formData.available_seats} onChange={handleChange} placeholder="Asientos disponibles" min="1" className={errors.available_seats ? 'error' : ''} />
              {errors.available_seats && <span className="error-text">{errors.available_seats}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="aircraft_type">Tipo de Aeronave *</label>
              <select
                id="aircraft_type"
                name="aircraft_type"
                value={formData.aircraft_type}
                onChange={handleChange}
                className={errors.aircraft_type ? 'error' : ''}
              >
                <option value="">Seleccione</option>
                <option value="Airbus A320">Airbus A320</option>
                <option value="Airbus A330">Airbus A330</option>
                <option value="Boeing 737">Boeing 737</option>
                <option value="Boeing 777">Boeing 777</option>
                <option value="Embraer 190">Embraer 190</option>
              </select>
              {errors.aircraft_type && (
                <span className="error-text">{errors.aircraft_type}</span>
              )}
            </div>
          </div>

          <button type="submit" disabled={isSubmitting} className="submit-button">
            {isSubmitting ? 'Creando...' : 'Crear Vuelo'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateFlight;
