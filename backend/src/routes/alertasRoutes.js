const express = require("express");
const router = express.Router();
const alertasController = require("../controllers/alertasController");

// Crear alerta y enviar correo
router.post("/create", alertasController.crearAlerta);

// Obtener alertas por niño
router.get("/nino/:id_nino", alertasController.getAlertasByNino);

// Eliminar alerta (opcional)
router.delete("/:id_alerta", alertasController.deleteAlerta);

module.exports = router;
