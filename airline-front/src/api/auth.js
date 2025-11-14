import axios from "axios";
const API = "http://localhost:8001";

export const register = (data) => axios.post(`${API}/register`, data);
export const login = (data) => axios.post(`${API}/login`, data);
