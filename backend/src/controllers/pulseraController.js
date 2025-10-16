const pool = require("../config/db");

// Crear pulsera
const registerPulsera = async (req, res) => {
  try {
    const { nombre, id_usuario } = req.body;

    if (!nombre || !id_usuario) {
      return res.status(400).json({ message: "Nombre e ID de usuario son obligatorios" });
    }

    // Verificar si ya existe una pulsera con ese nombre para el mismo usuario
    const [exist] = await pool.query(
      "SELECT * FROM pulsera WHERE nombre = ? AND id_usuario = ?",
      [nombre, id_usuario]
    );

    if (exist.length > 0) {
      return res.status(400).json({ message: "Pulsera ya registrada para este usuario" });
    }

    const [result] = await pool.query(
      "INSERT INTO pulsera (nombre, id_usuario) VALUES (?, ?)",
      [nombre, id_usuario]
    );

    res.status(201).json({ id_pulsera: result.insertId, nombre });
  } catch (err) {
    console.error("ERROR EN REGISTER PULSERA:", err);
    res.status(500).json({ message: "Error al registrar la pulsera" });
  }
};

// Obtener pulseras por usuario (solo del usuario actual)
const getPulserasByUsuario = async (req, res) => {
  try {
    const { id_usuario } = req.params;

    if (!id_usuario) {
      return res.status(400).json({ message: "Se requiere el id del usuario" });
    }

    const [rows] = await pool.query(
      "SELECT * FROM pulsera WHERE id_usuario = ?",
      [id_usuario]
    );

    res.status(200).json(rows);
  } catch (err) {
    console.error("ERROR EN GET PULSERAS:", err);
    res.status(500).json({ message: "Error al obtener pulseras" });
  }
};

// Actualizar pulsera
const updatePulsera = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre } = req.body;

    if (!nombre) return res.status(400).json({ message: "El nombre es obligatorio" });

    const [exist] = await pool.query(
      "SELECT * FROM pulsera WHERE nombre = ? AND id_pulsera != ?",
      [nombre, id]
    );
    if (exist.length > 0) {
      return res.status(400).json({ message: "Pulsera ya registrada" });
    }

    const [result] = await pool.query(
      "UPDATE pulsera SET nombre = ? WHERE id_pulsera = ?",
      [nombre, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Pulsera no encontrada" });
    }

    res.status(200).json({ id_pulsera: id, nombre });
  } catch (err) {
    console.error("ERROR EN UPDATE PULSERA:", err);
    res.status(500).json({ message: "Error al actualizar la pulsera" });
  }
};

// Eliminar pulsera
const deletePulsera = async (req, res) => {
  try {
    const { id } = req.params;

    // Liberar pulsera de cualquier niño
    await pool.query("UPDATE ninos SET id_pulsera = NULL WHERE id_pulsera = ?", [id]);

    const [result] = await pool.query("DELETE FROM pulsera WHERE id_pulsera = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Pulsera no encontrada" });
    }

    res.status(200).json({ message: "Pulsera eliminada correctamente" });
  } catch (err) {
    console.error("ERROR EN DELETE PULSERA:", err);
    res.status(500).json({ message: "Error al eliminar la pulsera" });
  }
};

module.exports = {
  registerPulsera,
  getPulserasByUsuario,
  updatePulsera,
  deletePulsera,
};
