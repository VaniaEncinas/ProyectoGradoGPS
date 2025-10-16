const express = require("express");
const router = express.Router();
const {
  registerNino,
  getNinosByUsuario,
  updateNino,
  deleteNino
} = require("../controllers/ninoController");

// Registrar un niño
router.post("/register", registerNino);

// Obtener todos los niños de un usuario
router.get("/user/:id_usuario", getNinosByUsuario);

// Actualizar un niño
router.patch("/update/:id_nino", updateNino);

// Eliminar un niño
router.delete("/delete/:id_nino", deleteNino);

module.exports = router;
