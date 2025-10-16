const express = require("express");
const router = express.Router();
const {
  registerPulsera,
  getPulserasByUsuario,
  updatePulsera,
  deletePulsera,
} = require("../controllers/pulseraController");

// Crear pulsera
router.post("/register", registerPulsera);

// Obtener pulseras de un usuario
router.get("/:id_usuario", getPulserasByUsuario);

// Actualizar pulsera
router.patch("/:id", updatePulsera);

// Eliminar pulsera
router.delete("/:id", deletePulsera);

module.exports = router;
