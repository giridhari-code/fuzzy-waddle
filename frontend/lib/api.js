// lib/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000", // tumhara backend port
});

export default api;
