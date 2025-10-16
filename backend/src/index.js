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

const app = express();
app.use(cors());
app.use(express.json());

// Middleware para debug
app.use((req, res, next) => {
  console.log("Petición recibida:", req.method, req.url);
  console.log("Body:", req.body);
  next();
});

// Rutas
app.use("/api/auth", authRoutes);
app.use("/api/ninos", ninosRoutes);
app.use("/api/ubicaciones", ubicacionesRoutes);
app.use("/api/pulseras", pulseraRoutes);
app.use("/api/zonas", zonaRoutes);
app.use("/api/alertas", alertasRoutes);

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

// Map para llevar seguimiento de usuarios y sus sockets
const usuariosConectados = new Map();

// Conexión de sockets
io.on("connection", (socket) => {
  console.log("⚡ Usuario conectado, socket id:", socket.id);

  // Unirse a la sala de su usuario
  socket.on("joinUser", (id_usuario) => {
    socket.join(`user_${id_usuario}`);
    usuariosConectados.set(socket.id, id_usuario);
    console.log(`🔔 Socket ${socket.id} unido a sala user_${id_usuario}`);
  });

  // Desconexión
  socket.on("disconnect", () => {
    const id_usuario = usuariosConectados.get(socket.id);
    console.log(`❌ Usuario desconectado, socket id: ${socket.id}, usuario: ${id_usuario}`);
    usuariosConectados.delete(socket.id);
  });
});

// Hacer io accesible desde otros archivos
app.set("io", io);

// Obtener IP local automáticamente
const networkInterfaces = os.networkInterfaces();
const localIp =
  Object.values(networkInterfaces)
    .flat()
    .find((iface) => iface.family === "IPv4" && !iface.internal)?.address || "localhost";

// Puerto del servidor Node
const PORT = process.env.PORT || 4000;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor backend corriendo en:`);
  console.log(`Local:   http://localhost:${PORT}`);
  console.log(`Red LAN: http://${require("os").networkInterfaces()["Wi-Fi"][0].address}:${PORT}`);
});

