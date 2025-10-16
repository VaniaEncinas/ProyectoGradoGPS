const pool = require("../config/db");
const nodemailer = require("nodemailer");

// Función para formatear fecha en hora de Bolivia (La Paz)
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
  }).replace(",", "");
};

// Configuración de nodemailer 
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,  
    pass: process.env.EMAIL_PASS   
  }
});

// Función para enviar correo
const sendEmail = async (to, subject, text) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
    });
  } catch (err) {
    console.error("Error al enviar correo:", err);
  }
};

// Función para verificar zonas y generar alertas
const checkZonasSeguras = async (id_nino, lat, lon, id_usuario) => {
  // Obtener zonas activas del niño
  const [zonas] = await pool.query(
    "SELECT * FROM zonas WHERE id_nino = ? AND id_usuario = ?",
    [id_nino, id_usuario]
  );

  for (const zona of zonas) {
    const distance = getDistanceFromLatLonInMeters(lat, lon, zona.latitud, zona.longitud);
    const dentro = distance <= zona.radio_metros;

    if (!dentro) {
      // Crear alerta de salida de zona segura si no existe ya activa
      const [alertaExistente] = await pool.query(
        "SELECT * FROM alertas WHERE id_nino = ? AND id_zona = ? AND tipo_alerta = 'salida_zona_segura' ORDER BY fecha_hora DESC LIMIT 1",
        [id_nino, zona.id_zona]
      );

      if (alertaExistente.length === 0) {
        const mensaje = `El niño/a ${id_nino} salió de la zona segura: ${zona.nombre_zona}`;
        await pool.query(
          "INSERT INTO alertas (id_nino, id_zona, tipo_alerta, mensaje) VALUES (?, ?, 'salida_zona_segura', ?)",
          [id_nino, zona.id_zona, mensaje]
        );

        // Obtener correo del usuario
        const [userRows] = await pool.query("SELECT email FROM usuarios WHERE id_usuario = ?", [id_usuario]);
        if (userRows.length > 0) {
          sendEmail(userRows[0].email, "Alerta: salida de zona segura", mensaje);
        }
      }
    }
  }
};

// Función para calcular distancia entre coordenadas en metros
const getDistanceFromLatLonInMeters = (lat1, lon1, lat2, lon2) => {
  const R = 6371000; // Radio de la Tierra en metros
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
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

    // Verificar zonas seguras y generar alertas si aplica
    await checkZonasSeguras(id_nino, latitud, longitud, id_usuario);

    res.status(201).json({
      id_ubicacion: result.insertId,
      id_nino,
      nombre: ninoRows[0].nombre,
      latitud,
      longitud,
      fecha_hora: fechaFormateada
    });
  } catch (error) {
    console.error("Error en createUbicacion:", error);
    res.status(500).json({ message: "Error al registrar ubicación" });
  }
};

// Obtener ubicaciones de un niño (por usuario)
const getUbicacionesByNino = async (req, res) => {
  try {
    const { id_nino, id_usuario } = req.params;

    if (!id_nino || !id_usuario) {
      return res.status(400).json({ message: "Se requiere id_nino y id_usuario" });
    }

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
    console.error("Error en getUbicacionesByNino:", error);
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
    console.error("Error en getUbicaciones:", error);
    res.status(500).json({ message: "Error al obtener ubicaciones" });
  }
};

module.exports = {
  createUbicacion,
  getUbicacionesByNino,
  getUbicaciones
};
