import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:4000/api";

const API = axios.create({
  baseURL: BASE_URL,
});

// añade token a cada petición
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// USUARIOS
export const registerRequest = (data) => API.post("/auth/register", data);
export const loginRequest = (data) => API.post("/auth/login", data);
export const getUserRequest = () => API.get("/auth/user");
export const updateUserRequest = (data) => API.patch("/auth/update", data);
export const deleteUserRequest = () => API.delete("/auth/delete");

// NIÑOS
export const registerNinoRequest = (data) => API.post("/ninos/register", data);
export const getNinosByUsuarioRequest = (id_usuario) =>
  API.get(`/ninos/user/${id_usuario}`);
export const updateNinoRequest = (id_nino, data) =>
  API.patch(`/ninos/update/${id_nino}`, data);
export const deleteNinoRequest = (id_nino) =>
  API.delete(`/ninos/delete/${id_nino}`);

// PULSERAS
export const getPulserasByUsuarioRequest = (id_usuario) =>
  API.get(`/pulseras/${id_usuario}`);
export const registerPulseraRequest = (data) =>
  API.post("/pulseras/register", data);
export const updatePulseraRequest = (id, data) =>
  API.patch(`/pulseras/${id}`, data);
export const deletePulseraRequest = (id) => API.delete(`/pulseras/${id}`);

// ZONAS SEGURAS
export const getZonasRequest = (id_usuario) => API.get(`/zonas/${id_usuario}`);
export const createZonaRequest = (data) => API.post("/zonas", data);
export const updateZonaRequest = (id_zona, data) =>
  API.patch(`/zonas/${id_zona}`, data);
export const deleteZonaRequest = (id_zona) => API.delete(`/zonas/${id_zona}`);

// ALERTAS
export const getAlertasByNinoRequest = (id_nino) =>
  API.get(`/alertas/nino/${id_nino}`);
export const deleteAlertaRequest = (id_alerta) =>
  API.delete(`/alertas/${id_alerta}`);
