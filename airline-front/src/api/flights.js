import axios from "axios";
const API = "http://localhost:8002";

export const searchFlights = (origin, destination, date) =>
  axios.get(`${API}/flights/search`, { params: { origin, destination, date } });

export const createFlight = (token, data) =>
  axios.post(`${API}/flights`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });