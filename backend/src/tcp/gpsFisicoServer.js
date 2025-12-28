const net = require("net");
const axios = require("axios");

const PORT = 9000;
const INTERNAL_URL = "http://localhost:3000/api/gps-fisico/internal";

const server = net.createServer(socket => {
  console.log("📡 GPS físico conectado");

  socket.on("data", async data => {
    const raw = data.toString();
    console.log("📥 RAW GPS:", raw);

    /**
     * EJEMPLO de parseo (luego ajustamos al real del G200)
     */
    const partes = raw.trim().split(",");

    const body = {
      deviceId: partes[0],
      lat: partes[1],
      lon: partes[2],
      timestamp: new Date()
    };

    try {
      await axios.post(INTERNAL_URL, body);
    } catch (err) {
      console.error("Error enviando al backend:", err.message);
    }
  });
});

server.listen(PORT, () => {
  console.log(`🚀 GPS físico escuchando en puerto ${PORT}`);
});
