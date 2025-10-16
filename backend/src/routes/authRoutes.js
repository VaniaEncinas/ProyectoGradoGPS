const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No autorizado" });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secreto123");
    req.user = decoded; 
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token inválido" });
  }
};

router.post("/register", async (req, res) => {
  try {
    const { nombre, apellido, email, telefono, password } = req.body;

    if (!nombre || !apellido || !email || !telefono || !password) {
      return res.status(400).json({ message: "Faltan datos" });
    }

    // Verificar si el usuario ya existe
    const [existing] = await pool.query(
      "SELECT * FROM usuarios WHERE email = ?",
      [email]
    );
    if (existing.length > 0) {
      return res.status(400).json({ message: "El usuario ya existe" });
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insertar en DB
    const [result] = await pool.query(
  "INSERT INTO usuarios (nombre, apellido, email, telefono, password) VALUES (?, ?, ?, ?, ?)",
  [nombre, apellido, email, telefono || "", hashedPassword]
);

res.status(201).json({ 
  message: "Usuario creado correctamente", 
  id_usuario: result.insertId 
});

  } catch (err) {
    console.error("ERROR EN REGISTER:", err);
    res.status(500).json({ message: "Error en el servidor", error: err.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Faltan datos" });
    }

    const [rows] = await pool.query(
      "SELECT * FROM usuarios WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    const user = rows[0];

    // Verificar contraseña
    const validPass = await bcrypt.compare(password, user.password);
    if (!validPass) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    // Generar token JWT
    const token = jwt.sign(
      { id: user.id_usuario, email: user.email },
      process.env.JWT_SECRET || "secreto123",
      { expiresIn: "1h" }
    );

    // Respuesta exitosa
    res.json({
      message: "Login exitoso",
      token,
      user: {
        id: user.id_usuario,
        nombre: user.nombre,
        apellido: user.apellido,
        email: user.email,
        telefono: user.telefono
      }
    });
  } catch (err) {
    console.error("ERROR EN LOGIN:", err);
    res.status(500).json({ message: "Error en el servidor", error: err.message });
  }
});

router.get("/user", authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id_usuario, nombre, apellido, email, telefono FROM usuarios WHERE id_usuario = ?",
      [req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error("ERROR EN GET USER:", err);
    res.status(500).json({ message: "Error en el servidor", error: err.message });
  }
});

router.patch("/update", authMiddleware, async (req, res) => {
  try {
    const { nombre, apellido, telefono, password } = req.body;

    let query = "UPDATE usuarios SET ";
    const params = [];

    if (nombre) { query += "nombre = ?, "; params.push(nombre); }
    if (apellido) { query += "apellido = ?, "; params.push(apellido); }
    if (telefono) { query += "telefono = ?, "; params.push(telefono); }
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      query += "password = ?, ";
      params.push(hashedPassword);
    }

    // Quitar la última coma y espacio
    query = query.slice(0, -2);
    query += " WHERE id_usuario = ?";
    params.push(req.user.id);

    await pool.query(query, params);

    // Consultar el usuario actualizado
    const [rows] = await pool.query(
      "SELECT id_usuario, nombre, apellido, email, telefono FROM usuarios WHERE id_usuario = ?",
      [req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const updatedUser = rows[0];

    // Devolver igual que login
    res.json({
      message: "Usuario actualizado correctamente",
      user: {
        id: updatedUser.id_usuario,
        nombre: updatedUser.nombre,
        apellido: updatedUser.apellido,
        email: updatedUser.email,
        telefono: updatedUser.telefono,
      },
    });
  } catch (err) {
    console.error("ERROR EN UPDATE USER:", err);
    res.status(500).json({ message: "Error en el servidor", error: err.message });
  }
});


router.delete("/delete", authMiddleware, async (req, res) => {
  try {
    await pool.query(
      "DELETE FROM usuarios WHERE id_usuario = ?",
      [req.user.id]
    );
    res.json({ message: "Usuario eliminado correctamente" });
  } catch (err) {
    console.error("ERROR EN DELETE USER:", err);
    res.status(500).json({ message: "Error en el servidor", error: err.message });
  }
});

module.exports = router;
