const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const os = require("os");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const ninosRoutes = require("./routes/ninosRoutes");
const ubicacionesRoutes = require("./routes/ubicacionesRoutes");
const pulseraRoutes = require("./routes/pulseraRoutes");
const zonaRoutes = require("./routes/zonaRoutes");
const alertasRoutes = require("./routes/alertasRoutes");
const trackerRoutes = require("./routes/trackerRoutes");

const app = express();
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log("Petición recibida:", req.method, req.url);
  console.log("Body:", req.body);
  next();
});

app.use("/api/auth", authRoutes);
app.use("/api/ninos", ninosRoutes);
app.use("/api/ubicaciones", ubicacionesRoutes);
app.use("/api/pulseras", pulseraRoutes);
app.use("/api/zonas", zonaRoutes);
app.use("/api/alertas", alertasRoutes);
app.use("/api/tracker", trackerRoutes);

// Middleware para rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ message: "Ruta no encontrada" });
});

// Crear servidor HTTP
const server = http.createServer(app);

// Configurar Socket.IO
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const usuariosConectados = new Map();

io.on("connection", (socket) => {
  console.log("Usuario conectado, socket id:", socket.id);

  socket.on("joinUser", (id_usuario) => {
    socket.join(`user_${id_usuario}`);
    usuariosConectados.set(socket.id, id_usuario);
    console.log(`Socket ${socket.id} unido a sala user_${id_usuario}`);
  });

  socket.on("disconnect", () => {
    const id_usuario = usuariosConectados.get(socket.id);
    console.log(`Usuario desconectado: socket ${socket.id}, usuario: ${id_usuario}`);
    usuariosConectados.delete(socket.id);
  });
});

app.set("io", io);

const networkInterfaces = os.networkInterfaces();
const localIp =
  Object.values(networkInterfaces)
    .flat()
    .find((iface) => iface.family === "IPv4" && !iface.internal)?.address || "localhost";

const PORT = process.env.PORT || 4000;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor backend corriendo en:`);
  console.log(`Local:   http://localhost:${PORT}`);
  console.log(`Red LAN: http://${require("os").networkInterfaces()["Wi-Fi"][0].address}:${PORT}`);
});
