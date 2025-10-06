const express = require("express");
const router = express.Router();
const pool = require("../config/db");

// Crear pulsera
router.post("/register", async (req, res) => {
  try {
    const { nombre } = req.body;

    if (!nombre) return res.status(400).json({ message: "Nombre de la pulsera es obligatorio" });

    const [exist] = await pool.query("SELECT * FROM pulsera WHERE nombre = ?", [nombre]);
    if (exist.length > 0) return res.status(400).json({ message: "Pulsera ya registrada" });

    const [result] = await pool.query("INSERT INTO pulsera (nombre) VALUES (?)", [nombre]);
    res.status(201).json({ id_pulsera: result.insertId, nombre });
  } catch (err) {
    console.error("ERROR EN REGISTER PULSERA:", err);
    res.status(500).json({ message: "Error al registrar la pulsera" });
  }
});

// Obtener todas las pulseras
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM pulsera");
    res.status(200).json(rows);
  } catch (err) {
    console.error("ERROR EN GET PULSERAS:", err);
    res.status(500).json({ message: "Error al obtener pulseras" });
  }
});

// Actualizar pulsera
router.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre } = req.body;

    if (!nombre) return res.status(400).json({ message: "Nombre de la pulsera es obligatorio" });

    const [exist] = await pool.query("SELECT * FROM pulsera WHERE nombre = ? AND id_pulsera != ?", [nombre, id]);
    if (exist.length > 0) return res.status(400).json({ message: "Pulsera ya registrada" });

    const [result] = await pool.query("UPDATE pulsera SET nombre = ? WHERE id_pulsera = ?", [nombre, id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: "Pulsera no encontrada" });

    res.status(200).json({ id_pulsera: id, nombre });
  } catch (err) {
    console.error("ERROR EN UPDATE PULSERA:", err);
    res.status(500).json({ message: "Error al actualizar la pulsera" });
  }
});

// Eliminar pulsera
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Liberar la referencia de la pulsera en cualquier niño que la tenga
    await pool.query("UPDATE ninos SET id_pulsera = NULL WHERE id_pulsera = ?", [id]);

    const [result] = await pool.query("DELETE FROM pulsera WHERE id_pulsera = ?", [id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: "Pulsera no encontrada" });

    res.status(200).json({ message: "Pulsera eliminada correctamente" });
  } catch (err) {
    console.error("ERROR EN DELETE PULSERA:", err);
    res.status(500).json({ message: "Error al eliminar la pulsera" });
  }
});

module.exports = router;
