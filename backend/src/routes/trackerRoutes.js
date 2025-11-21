const express = require("express");
const router = express.Router();

const trackerController = require("../controllers/trackerController");

// Aquí redirigimos TODAS las peticiones al controlador correcto
router.post("/", trackerController.receiveLocation);

module.exports = router;
