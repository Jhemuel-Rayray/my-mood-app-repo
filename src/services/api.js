import axios from "axios";

const api = axios.create({
  // If you don't have your Render URL yet, use this placeholder 
  // so the build passes. Update it later!
  baseURL: "https://backend-1-k3zu.onrender.com" 
});

// THIS IS THE LINE YOU ARE MISSING
export default api;