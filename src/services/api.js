import axios from "axios";

// src/services/api.js
const api = axios.create({
  baseURL: 'https://backend-1-k3zu.onrender.com/api' // Added /api here
});

export default api;