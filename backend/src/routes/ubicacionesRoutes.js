const express = require("express");
const router = express.Router();
const {
  createUbicacion,
  getUbicacionesByNino,
  getUbicaciones
} = require("../controllers/ubicacionesController");

// Registrar ubicación
router.post("/", createUbicacion);

// Obtener todas las ubicaciones de los niños del usuario
router.get("/usuario/:id_usuario", getUbicaciones);

// Obtener ubicaciones de un niño específico
router.get("/nino/:id_nino/:id_usuario", getUbicacionesByNino);

module.exports = router;
