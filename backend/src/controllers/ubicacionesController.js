const pool = require("../config/db");

// Función para formatear fecha en hora de Bolivia (America/La_Paz)
const formatDate = (date) => {
  return new Date(date).toLocaleString("es-BO", {
    timeZone: "America/La_Paz",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  }).replace(",", ""); // quitamos la coma entre fecha y hora
};

// Crear nueva ubicación
const createUbicacion = async (req, res) => {
  try {
    const { id_nino, latitud, longitud, id_usuario } = req.body;

    if (!id_nino || !latitud || !longitud || !id_usuario) {
      return res.status(400).json({ message: "Todos los campos son obligatorios" });
    }

    // Verificamos que el niño pertenece al usuario
    const [ninoRows] = await pool.query(
      "SELECT * FROM ninos WHERE id_nino = ? AND id_usuario = ?",
      [id_nino, id_usuario]
    );

    if (ninoRows.length === 0) {
      return res.status(403).json({ message: "No tienes permisos para registrar ubicación de este niño" });
    }

    const [result] = await pool.query(
      "INSERT INTO ubicaciones (id_nino, latitud, longitud, fecha_hora) VALUES (?, ?, ?, NOW())",
      [id_nino, latitud, longitud]
    );

    const fechaFormateada = formatDate(new Date());

    res.status(201).json({
      id_ubicacion: result.insertId,
      id_nino,
      nombre: ninoRows[0].nombre, // <-- agregamos el nombre
      latitud,
      longitud,
      fecha_hora: fechaFormateada
    });
  } catch (error) {
    console.error("❌ Error en createUbicacion:", error);
    res.status(500).json({ message: "Error al registrar ubicación" });
  }
};

// Obtener ubicaciones de un niño, filtrado por usuario
const getUbicacionesByNino = async (req, res) => {
  try {
    const { id_nino, id_usuario } = req.params;

    if (!id_nino || !id_usuario) {
      return res.status(400).json({ message: "Se requiere id_nino y id_usuario" });
    }

    // Verificamos que el niño pertenece al usuario
    const [ninoRows] = await pool.query(
      "SELECT * FROM ninos WHERE id_nino = ? AND id_usuario = ?",
      [id_nino, id_usuario]
    );

    if (ninoRows.length === 0) {
      return res.status(403).json({ message: "No tienes permisos para ver este niño" });
    }

    const [rows] = await pool.query(
      "SELECT u.*, n.nombre FROM ubicaciones u INNER JOIN ninos n ON u.id_nino = n.id_nino WHERE u.id_nino = ? ORDER BY u.fecha_hora DESC",
      [id_nino]
    );

    const ubicaciones = rows.map(u => ({
      ...u,
      fecha_hora: formatDate(u.fecha_hora)
    }));

    res.json(ubicaciones);
  } catch (error) {
    console.error("❌ Error en getUbicacionesByNino:", error);
    res.status(500).json({ message: "Error al obtener ubicaciones" });
  }
};

// Obtener todas las ubicaciones de los niños del usuario
const getUbicaciones = async (req, res) => {
  try {
    const { id_usuario } = req.params;

    if (!id_usuario) {
      return res.status(400).json({ message: "Se requiere el id del usuario" });
    }

    const [rows] = await pool.query(
      `SELECT u.id_ubicacion, u.id_nino, u.latitud, u.longitud, u.fecha_hora, n.nombre
       FROM ubicaciones u
       INNER JOIN ninos n ON u.id_nino = n.id_nino
       WHERE n.id_usuario = ?
       ORDER BY u.fecha_hora DESC`,
      [id_usuario]
    );

    const ubicaciones = rows.map(u => ({
      ...u,
      fecha_hora: formatDate(u.fecha_hora)
    }));

    res.json(ubicaciones);
  } catch (error) {
    console.error("❌ Error en getUbicaciones:", error);
    res.status(500).json({ message: "Error al obtener ubicaciones" });
  }
};

module.exports = {
  createUbicacion,
  getUbicacionesByNino,
  getUbicaciones
};
