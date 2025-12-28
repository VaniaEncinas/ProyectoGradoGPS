const express = require("express");
const router = express.Router();
const gpsFisicoController = require("../controllers/gpsFisicoController");

// ruta interna (no pública)
router.post("/internal", gpsFisicoController.receiveFromGpsFisico);

module.exports = router;
