const pool = require("../config/db");
const axios = require("axios");

function getDistanceFromLatLonInMeters(lat1, lon1, lat2, lon2) {
  lat1 = Number(lat1);
  lon1 = Number(lon1);
  lat2 = Number(lat2);
  lon2 = Number(lon2);

  const R = 6371000; // radio de la tierra en metros
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

exports.receiveLocation = async (req, res) => {
  try {
    console.log("\nPetición recibida:", req.method, req.originalUrl);
    console.log("Body:", req.body);
    console.log("Query:", req.query);

    const deviceId =
      req.body.device_id ||
      req.body.deviceId ||
      req.body.id ||
      req.query.device_id ||
      req.query.deviceId ||
      req.query.id;

    const lat =
      req.body.location?.coords?.latitude ||
      req.body.latitude ||
      req.body.lat ||
      req.query.lat;

    const lon =
      req.body.location?.coords?.longitude ||
      req.body.longitude ||
      req.body.lon ||
      req.query.lon;

    const timestamp =
      req.body.location?.timestamp ||
      req.body.timestamp ||
      req.query.timestamp ||
      new Date();

    if (!deviceId || lat == null || lon == null) {
      console.log("Faltan datos:", { deviceId, lat, lon });
      return res.status(400).json({ error: "Faltan datos (deviceId, lat, lon)" });
    }

    const latNum = Number(lat);
    const lonNum = Number(lon);

    const [rows] = await pool.query(
      "SELECT id_nino, id_usuario FROM pulsera WHERE nombre = ? LIMIT 1",
      [deviceId]
    );

    if (rows.length === 0) {
      console.log("Pulsera no registrada:", deviceId);
      return res.status(404).json({ error: "Pulsera no registrada" });
    }

    const { id_nino, id_usuario } = rows[0];

    await pool.query(
      "INSERT INTO ubicaciones (id_nino, latitud, longitud, fecha_hora) VALUES (?, ?, ?, ?)",
      [id_nino, latNum, lonNum, timestamp]
    );

    console.log("Ubicación guardada:", { id_nino, latNum, lonNum });

    const io = req.app.get("io");
    if (io && id_usuario) {
      io.to(`user_${id_usuario}`).emit("ubicacionNueva", {
        id_nino,
        lat: latNum,
        lon: lonNum,
        timestamp
      });
    }

    const [zonas] = await pool.query(
      "SELECT id_zona, nombre_zona AS nombre, latitud, longitud, radio_metros, alerta_enviada FROM zonas_seguras WHERE id_nino = ? AND estado = 'activo'",
      [id_nino]
    );

    console.log("ZONAS ACTIVAS ENCONTRADAS:", zonas);
    console.log("Ubicación recibida:", latNum, lonNum);

    for (const zona of zonas) {
      const distancia = getDistanceFromLatLonInMeters(
        latNum,
        lonNum,
        zona.latitud,
        zona.longitud
      );

      console.log(`Distancia a zona '${zona.nombre}': ${distancia} metros`);
      console.log(`Radio permitido: ${zona.radio_metros} metros`);
      console.log(`Alerta enviada previamente: ${zona.alerta_enviada}`);

      // niño fuera de la zona segura 
      if (distancia > zona.radio_metros && zona.alerta_enviada === 0) {
        console.log(`Niño ${id_nino} salió de la zona segura: ${zona.nombre}`);

        try {
          const alertResponse = await axios.post(`${process.env.ALERTAS_URL}/create`, {
            id_nino,
            id_zona: zona.id_zona,
            tipo_alerta: "salida_zona_segura",
            mensaje: `El niño salió de la zona segura (${zona.nombre}).`
          });
          console.log("Alerta enviada:", alertResponse.data);

          await pool.query(
            "UPDATE zonas_seguras SET alerta_enviada = 1 WHERE id_zona = ?",
            [zona.id_zona]
          );
        } catch (err) {
          console.log("Error enviando alerta:", err.response?.data || err.message);
        }

        if (io && id_usuario) {
          io.to(`user_${id_usuario}`).emit("nuevaAlerta", {
            id_nino,
            nombre_zona: zona.nombre,
            tipo_alerta: "salida_zona_segura",
            fecha_hora: new Date()
          });
        }
      }

      // niño dentro de la zona segura y alerta previamente enviada
      if (distancia <= zona.radio_metros && zona.alerta_enviada === 1) {
        await pool.query(
          "UPDATE zonas_seguras SET alerta_enviada = 0 WHERE id_zona = ?",
          [zona.id_zona]
        );
        console.log(`Niño ${id_nino} volvió a la zona segura: ${zona.nombre}, alerta reiniciada`);
      }
    }

    return res.status(200).json({ mensaje: "Ubicación guardada y alertas procesadas" });

  } catch (error) {
    console.error("Error en /api/tracker:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};
