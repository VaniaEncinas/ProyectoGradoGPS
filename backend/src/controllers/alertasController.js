const pool = require("../config/db");
const nodemailer = require("nodemailer");
const EMAIL_ADMIN = process.env.ADMIN_EMAIL;

// CONFIGURACIÓN DEL TRANSPORTE DE GMAIL 
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

// FUNCIÓN AUXILIAR PARA ENVIAR CORREO 
const enviarCorreo = async (to, subject, html) => {
  try {
    await transporter.sendMail({
      from: `"Sistema GPS Pulsera" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`📧 Correo enviado a ${to}`);
  } catch (err) {
    console.error("❌ Error enviando correo:", err);
    throw err;
  }
};

// CREAR ALERTA 
const crearAlerta = async (req, res) => {
  try {
    const { id_nino, id_zona = null, tipo_alerta, mensaje } = req.body;
    const io = req.io;

    if (!id_nino || !tipo_alerta || !mensaje) {
      return res
        .status(400)
        .json({ message: "id_nino, tipo_alerta y mensaje son obligatorios" });
    }

    // Guardar alerta en la base de datos
    const [result] = await pool.query(
      `
      INSERT INTO alertas (id_nino, id_zona, tipo_alerta, mensaje)
      VALUES (?, ?, ?, ?)
      `,
      [id_nino, id_zona, tipo_alerta, mensaje]
    );

    // Obtener información del usuario, niño, pulsera y zona
    const [rows] = await pool.query(
      `
      SELECT u.email, n.nombre AS nombre_nino, p.nombre AS nombre_pulsera, zs.nombre_zona
      FROM usuarios u
      JOIN ninos n ON n.id_usuario = u.id_usuario
      LEFT JOIN pulsera p ON p.id_pulsera = n.id_pulsera
      LEFT JOIN zonas_seguras zs ON zs.id_zona = ?
      WHERE n.id_nino = ?
      `,
      [id_zona, id_nino]
    );

    const nombre_zona = rows[0]?.nombre_zona || null;

    const alertaNueva = {
      id_alerta: result.insertId,
      id_nino,
      id_zona,
      tipo_alerta,
      mensaje,
      fecha_hora: new Date(),
      nombre_zona, 
    };

    if (rows.length > 0) {
      const { email, nombre_nino, nombre_pulsera } = rows[0];

      // Asunto y mensaje HTML
      let asunto = "Alerta del sistema";
      let html = "";

      switch (tipo_alerta) {
        case "salida_zona_segura":
          asunto = "⚠️ Niño fuera de zona segura";
          html = `
          <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #d93630ff;">⚠️ Niño fuera de zona segura</h2>
            <p>Tu niño(a) <strong>${nombre_nino}</strong> ha salido de la zona segura <strong>${nombre_zona || "Sin nombre"}</strong>.</p>
            <ul>
              <li><strong>Pulsera:</strong> ${nombre_pulsera || "Sin pulsera"}</li>
              <li><strong>Tipo de alerta:</strong> Salida de zona segura</li>
              <li><strong>Mensaje:</strong> ${mensaje}</li>
              <li><strong>Fecha:</strong> ${new Date().toLocaleString()}</li>
            </ul>
            <p>Por favor verifica su ubicación lo antes posible.</p>
            <hr />
            <p style="font-size: 12px; color: #888;">Sistema GPS Pulsera © ${new Date().getFullYear()}</p>
          </div>
          `;
          break;

        case "bateria_baja":
          asunto = "🔋 Batería baja del dispositivo";
          html = `
          <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #f0ad4e;">🔋 Batería baja del dispositivo</h2>
            <p>El dispositivo de tu niño(a) <strong>${nombre_nino}</strong> tiene batería baja.</p>
            <ul>
              <li><strong>Pulsera:</strong> ${nombre_pulsera || "Sin pulsera"}</li>
              <li><strong>Tipo de alerta:</strong> Batería baja</li>
              <li><strong>Mensaje:</strong> ${mensaje}</li>
              <li><strong>Fecha:</strong> ${new Date().toLocaleString()}</li>
            </ul>
            <p>Por favor recarga el dispositivo pronto.</p>
            <hr />
            <p style="font-size: 12px; color: #888;">Sistema GPS Pulsera © ${new Date().getFullYear()}</p>
          </div>
          `;
          break;

        default:
          asunto = `🔔 Alerta: ${tipo_alerta}`;
          html = `
          <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
            <h2>🔔 Alerta del sistema</h2>
            <p>Tu niño(a) <strong>${nombre_nino}</strong> tiene una nueva alerta.</p>
            <ul>
              <li><strong>Pulsera:</strong> ${nombre_pulsera || "Sin pulsera"}</li>
              <li><strong>Zona:</strong> ${nombre_zona || "Sin zona"}</li>
              <li><strong>Tipo de alerta:</strong> ${tipo_alerta}</li>
              <li><strong>Mensaje:</strong> ${mensaje}</li>
              <li><strong>Fecha:</strong> ${new Date().toLocaleString()}</li>
            </ul>
            <hr />
            <p style="font-size: 12px; color: #888;">Sistema GPS Pulsera © ${new Date().getFullYear()}</p>
          </div>
          `;
      }

      // Enviar correo en formato HTML
      try {
        await enviarCorreo(email, asunto, html);
      } catch (err) {
        console.error("Error al enviar correo:", err.message);
      }

      // enviar correo a la administración de la unidad educativa
      try {
        const htmlAdmin = `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #e81a1aff;">Aviso de alerta para administración</h2>
        <p>Se ha generado una alerta del estudiante <strong>${nombre_nino}</strong>.</p>
        <ul>
        <li><strong>Tipo de alerta:</strong> ${tipo_alerta}</li>
        <li><strong>Zona:</strong> ${nombre_zona}</li>
        <li><strong>Pulsera:</strong> ${nombre_pulsera}</li>
        <li><strong>Fecha:</strong> ${new Date().toLocaleString()}</li>
        </ul>
        <p>Por favor verifica su ubicación lo antes posible.</p>
        </div>
  `;

        await enviarCorreo(
        EMAIL_ADMIN,
        `Aviso de alerta de ${tipo_alerta}`,
        htmlAdmin
     );

  console.log(`📧 Correo de alerta enviado a ${EMAIL_ADMIN}`);
} catch (err) {
  console.error("❌ Error enviando correo administrativo:", err.message);
}

      // Emitir alerta en tiempo real 
      if (io) {
        io.to(email).emit("nuevaAlerta", alertaNueva);
        console.log(`📡 Emitida alerta a ${email}`);
      }
    }

    res.status(201).json({
      message: "Alerta creada correctamente",
      alerta: alertaNueva,
    });
  } catch (err) {
    console.error("Error creando alerta:", err);
    res.status(500).json({
      message: "Error al crear alerta",
      error: err.message,
    });
  }
};

// OBTENER ALERTAS POR NIÑO 
const getAlertasByNino = async (req, res) => {
  try {
    const { id_nino } = req.params;

    if (!id_nino)
      return res.status(400).json({ message: "Se requiere id_nino" });

    const [rows] = await pool.query(
      "SELECT * FROM alertas WHERE id_nino = ? ORDER BY fecha_hora DESC",
      [id_nino]
    );

    res.json(rows);
  } catch (err) {
    console.error("Error obteniendo alertas:", err);
    res.status(500).json({ message: "Error al obtener alertas" });
  }
};

// ELIMINAR ALERTA 
const deleteAlerta = async (req, res) => {
  try {
    const { id_alerta } = req.params;

    if (!id_alerta)
      return res.status(400).json({ message: "Se requiere id_alerta" });

    await pool.query("DELETE FROM alertas WHERE id_alerta = ?", [id_alerta]);

    res.json({ message: "Alerta eliminada correctamente" });
  } catch (err) {
    console.error("Error eliminando alerta:", err);
    res.status(500).json({ message: "Error al eliminar alerta" });
  }
};

module.exports = {
  crearAlerta,
  getAlertasByNino,
  deleteAlerta,
};
