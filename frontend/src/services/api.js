import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:4000/api",
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 📌 USUARIOS
export const registerRequest = (data) => API.post("/auth/register", data);
export const loginRequest = (data) => API.post("/auth/login", data);
export const getUserRequest = () => API.get("/auth/user");
export const updateUserRequest = (data) => API.patch("/auth/update", data);
export const deleteUserRequest = () => API.delete("/auth/delete");

// 📌 NIÑOS
export const registerNinoRequest = (data) => API.post("/ninos/register", data);
export const getNinosByUsuarioRequest = (id_usuario) =>
  API.get(`/ninos/user/${id_usuario}`);
export const updateNinoRequest = (id_nino, data) =>
  API.patch(`/ninos/update/${id_nino}`, data);
export const deleteNinoRequest = (id_nino) =>
  API.delete(`/ninos/delete/${id_nino}`);

// 📌 PULSERAS
export const getPulserasRequest = () => API.get("/pulseras");
export const registerPulseraRequest = (data) => API.post("/pulseras/register", data);
export const updatePulseraRequest = (id, data) => API.patch(`/pulseras/${id}`, data);
export const deletePulseraRequest = (id) => API.delete(`/pulseras/${id}`);

