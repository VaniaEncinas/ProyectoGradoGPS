const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const ninosRoutes = require("./routes/ninosRoutes");
const ubicacionesRoutes = require("./routes/ubicacionesRoutes");
const pulseraRoutes = require("./routes/pulseraRoutes"); // 👈 Importamos rutas de pulsera

const app = express();
app.use(cors());
app.use(express.json());

// Middleware para debug
app.use((req, res, next) => {
  console.log("📥 Petición recibida:", req.method, req.url);
  console.log("📦 Body:", req.body);
  next();
});

// Rutas
app.use("/api/auth", authRoutes);
app.use("/api/ninos", ninosRoutes);
app.use("/api/ubicaciones", ubicacionesRoutes);
app.use("/api/pulseras", pulseraRoutes); // 👈 Registramos rutas pulsera

// Middleware para rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ message: "Ruta no encontrada" });
});

// Puerto del servidor Node
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor backend corriendo en http://localhost:${PORT}`);
});
