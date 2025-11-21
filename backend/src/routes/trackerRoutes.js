const express = require("express");
const router = express.Router();

const trackerController = require("../controllers/trackerController");

router.post("/", trackerController.receiveLocation); //redirigir todas la peticiones al controlador del GPS

module.exports = router;
