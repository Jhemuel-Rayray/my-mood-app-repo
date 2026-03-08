import axios from "axios";

const api = axios.create({
  
  baseURL: "https://backend-1-k3zu.onrender.com" 
});

export default api;