import { useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

export default function CreateFlight() {
  const { token, user } = useAuth();
  const [form, setForm] = useState({
    flight_number: "",
    origin: "",
    destination: "",
    departure_time: "",
    arrival_time: "",
    price: "",
    total_seats: ""
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        "http://localhost:8002/flights",
        { ...form, airline_id: user.user_id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Vuelo creado exitosamente");
    } catch (err) {
      alert("Error al crear vuelo");
    }
  };

  return (
    <div className="form-container">
      <h2>Crear Vuelo</h2>
      <form onSubmit={handleSubmit}>
        <input name="flight_number" placeholder="Número de vuelo" onChange={handleChange} required />
        <input name="origin" placeholder="Origen" onChange={handleChange} required />
        <input name="destination" placeholder="Destino" onChange={handleChange} required />
        <input type="datetime-local" name="departure_time" onChange={handleChange} required />
        <input type="datetime-local" name="arrival_time" onChange={handleChange} required />
        <input name="price" placeholder="Precio" type="number" onChange={handleChange} required />
        <input name="total_seats" placeholder="Asientos totales" type="number" onChange={handleChange} required />
        <button type="submit">Crear Vuelo</button>
      </form>
    </div>
  );
}