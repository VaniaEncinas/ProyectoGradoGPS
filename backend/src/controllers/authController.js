const pool = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Faltan datos" });
    }

    // Buscar usuario en DB
    const [rows] = await pool.query(
      "SELECT * FROM usuarios WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    const user = rows[0];

    console.log("Usuario encontrado:", user);
    console.log("Password recibida:", password);
    console.log("Hash en DB:", user.password);

    // Verificar contraseña
    const validPass = await bcrypt.compare(password_recibido, user.password);

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
};
