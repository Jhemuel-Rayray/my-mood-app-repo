import axios from "axios";
// Sa halip na api.get("/moods"), dapat ay:
await api.get("/api/moods");
await api.post("/api/moods", data);

const api = axios.create({
  // Tanggalin ang /api sa dulo
  baseURL: "https://backend-1-k3zu.onrender.com" 
});

export default api;