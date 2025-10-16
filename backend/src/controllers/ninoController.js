const pool = require("../config/db");

// Registrar un niño
exports.registerNino = async (req, res) => {
  try {
    const { id_usuario, nombre, fecha_nacimiento, id_pulsera } = req.body;

    if (!id_usuario || !nombre || !fecha_nacimiento || !id_pulsera) {
      return res.status(400).json({ message: "Todos los campos son obligatorios" });
    }

    // Validar duplicado
    const [existing] = await pool.query(
      "SELECT * FROM ninos WHERE id_usuario = ? AND nombre = ? AND fecha_nacimiento = ?",
      [id_usuario, nombre, fecha_nacimiento]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: "Ya existe un niño con ese nombre y fecha de nacimiento" });
    }

    // Insertar niño
    const [rows] = await pool.query(
      "INSERT INTO ninos (id_usuario, nombre, fecha_nacimiento, id_pulsera) VALUES (?, ?, ?, ?)",
      [id_usuario, nombre, fecha_nacimiento, id_pulsera]
    );

    const id_nino = rows.insertId;

    // Asignar pulsera
    await pool.query(
      "UPDATE pulsera SET id_nino = ? WHERE id_pulsera = ?",
      [id_nino, id_pulsera]
    );

    res.status(201).json({ message: "Niño registrado correctamente", id_nino });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ message: "La pulsera ya está registrada" });
    }
    console.error("ERROR EN REGISTER NIÑO:", error);
    res.status(500).json({ message: "Error en el servidor", error: error.message });
  }
};

// Obtener todos los niños de un usuario
exports.getNinosByUsuario = async (req, res) => {
  try {
    const { id_usuario } = req.params;
    const [rows] = await pool.query(
      `SELECT n.id_nino, n.nombre, n.fecha_nacimiento,
              n.id_pulsera, p.nombre AS pulsera_nombre
       FROM ninos n
       LEFT JOIN pulsera p ON p.id_pulsera = n.id_pulsera
       WHERE n.id_usuario = ?`,
      [id_usuario]
    );

    const formattedRows = rows.map(nino => ({
      id_nino: nino.id_nino,
      nombre: nino.nombre,
      fecha_nacimiento: nino.fecha_nacimiento
        ? nino.fecha_nacimiento.toISOString().split("T")[0]
        : null,
      pulsera: nino.id_pulsera
        ? { id_pulsera: nino.id_pulsera, nombre: nino.pulsera_nombre }
        : null
    }));

    res.json(formattedRows);
  } catch (error) {
    console.error("ERROR EN GET NIÑOS:", error);
    res.status(500).json({ message: "Error en el servidor", error: error.message });
  }
};

// Actualizar un niño
exports.updateNino = async (req, res) => {
  try {
    const { id_nino } = req.params;
    const { nombre, fecha_nacimiento, id_pulsera } = req.body;

    const params = [];
    let query = "UPDATE ninos SET ";
    if (nombre) { query += "nombre = ?, "; params.push(nombre); }
    if (fecha_nacimiento) { query += "fecha_nacimiento = ?, "; params.push(fecha_nacimiento); }
    if (id_pulsera !== undefined) { query += "id_pulsera = ?, "; params.push(id_pulsera); }

    if (params.length === 0) return res.status(400).json({ message: "No se proporcionaron campos para actualizar" });

    query = query.slice(0, -2) + " WHERE id_nino = ?";
    params.push(id_nino);

    const [result] = await pool.query(query, params);
    if (result.affectedRows === 0) return res.status(404).json({ message: "Niño no encontrado" });

    if (id_pulsera !== undefined) {
      // Liberar pulsera anterior
      await pool.query("UPDATE pulsera SET id_nino = NULL WHERE id_nino = ? AND id_pulsera != ?", [id_nino, id_pulsera]);
      // Asignar nueva pulsera
      await pool.query("UPDATE pulsera SET id_nino = ? WHERE id_pulsera = ?", [id_nino, id_pulsera]);
    }

    const [updatedRows] = await pool.query(
      `SELECT n.id_nino, n.nombre, n.fecha_nacimiento,
              n.id_pulsera, p.nombre AS pulsera_nombre
       FROM ninos n
       LEFT JOIN pulsera p ON p.id_pulsera = n.id_pulsera
       WHERE n.id_nino = ?`,
      [id_nino]
    );

    const updatedNino = updatedRows[0];

    res.json({
      message: "Niño actualizado correctamente",
      nino: {
        id_nino: updatedNino.id_nino,
        nombre: updatedNino.nombre,
        fecha_nacimiento: updatedNino.fecha_nacimiento
          ? updatedNino.fecha_nacimiento.toISOString().split("T")[0]
          : null,
        pulsera: updatedNino.id_pulsera
          ? { id_pulsera: updatedNino.id_pulsera, nombre: updatedNino.pulsera_nombre }
          : null
      }
    });
  } catch (error) {
    console.error("ERROR EN PATCH UPDATE NIÑO:", error);
    res.status(500).json({ message: "Error en el servidor", error: error.message });
  }
};

// Eliminar un niño
exports.deleteNino = async (req, res) => {
  try {
    const { id_nino } = req.params;

    // Liberar pulsera
    await pool.query("UPDATE pulsera SET id_nino = NULL WHERE id_nino = ?", [id_nino]);

    const [result] = await pool.query("DELETE FROM ninos WHERE id_nino = ?", [id_nino]);
    if (result.affectedRows === 0) return res.status(404).json({ message: "Niño no encontrado" });

    res.json({ message: "Niño eliminado correctamente" });
  } catch (error) {
    console.error("ERROR EN DELETE NIÑO:", error);
    res.status(500).json({ message: "Error en el servidor", error: error.message });
  }
};
