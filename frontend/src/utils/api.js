import axios from "axios";

const isLocal = window.location.hostname === "localhost" || 
                window.location.hostname === "127.0.0.1";

const api = axios.create({
  baseURL: isLocal ? "http://localhost:5000/api" : "/api",
});


api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default api;