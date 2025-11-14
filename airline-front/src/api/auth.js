import axios from "axios";

const API_AUTH = "http://localhost:8001/auth";

export const register = (data) => axios.post(`${API_AUTH}/register`, data);
export const login = (data) => axios.post(`${API_AUTH}/login`, data);
export const verify = (token) => axios.get(`${API_AUTH}/verify?token=${token}`);
