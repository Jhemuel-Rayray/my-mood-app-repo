import axios from "axios";

const api = axios.create({
  // Tanggalin ang /api sa dulo para hindi mag-doble
  baseURL: "https://backend-1-k3zu.onrender.com" 
});

export default api;