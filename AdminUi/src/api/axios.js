import axios from "axios";

const instance = axios.create({
  baseURL: "http://localhost:8000/api",
});

// 🔥 TOKEN AUTO ADD
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default instance;

//https://property-platform.onrender.com/api
// https://property-invest-platform.onrender.com/api
// http://localhost:8000/api