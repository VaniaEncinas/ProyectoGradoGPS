const request = require("supertest");
const express = require("express");
const authRoutes = require("../src/routes/authRoutes");

jest.mock("../src/config/db", () => ({
  query: jest.fn(),
}));
const pool = require("../src/config/db");

jest.mock("bcryptjs", () => ({
  hash: jest.fn(() => "hashed_password"),
  compare: jest.fn(() => true),
}));
const bcrypt = require("bcryptjs");

jest.mock("jsonwebtoken", () => ({
  sign: jest.fn(() => "fake_jwt_token"),
  verify: jest.fn(() => ({ id: 1, email: "vania@test.com" })),
}));
const jwt = require("jsonwebtoken");

const app = express();
app.use(express.json());
app.use("/api/auth", authRoutes);

describe("Login y Registro", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /register", () => {
    it("Registra un nuevo usuario", async () => {
      pool.query
        .mockResolvedValueOnce([[]]) // No existe usuario
        .mockResolvedValueOnce([{ insertId: 1 }]); 

      const res = await request(app).post("/api/auth/register").send({
        nombre: "Vania",
        apellido: "Encinas",
        email: "vania@test.com",
        telefono: "71762345",
        password: "12345",
      });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty("message", "Usuario creado correctamente");
      expect(res.body).toHaveProperty("id_usuario", 1);
      expect(pool.query).toHaveBeenCalledTimes(2);
      expect(bcrypt.hash).toHaveBeenCalledWith("12345", 10);
    });

    it("Retorna 400 si el usuario ya existe", async () => {
      pool.query.mockResolvedValueOnce([[{ id_usuario: 1 }]]); // Usuario existe

      const res = await request(app).post("/api/auth/register").send({
        nombre: "Vania",
        apellido: "Encinas",
        email: "vania@test.com",
        telefono: "71762345",
        password: "12345",
      });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("message", "El usuario ya existe");
    });
  });

  describe("POST /login", () => {
    it("Inicia sesión correctamente", async () => {
      pool.query.mockResolvedValueOnce([[{
        id_usuario: 1,
        nombre: "Vania",
        apellido: "Encinas",
        email: "vania@test.com",
        telefono: "71762345",
        password: "hashed_password"
      }]]);

      const res = await request(app).post("/api/auth/login").send({
        email: "vania@test.com",
        password: "12345",
      });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("message", "Login exitoso");
      expect(res.body).toHaveProperty("token", "fake_jwt_token");
      expect(bcrypt.compare).toHaveBeenCalledWith("12345", "hashed_password");
      expect(jwt.sign).toHaveBeenCalled();
    });

    it("Retorna 401 si el usuario no existe", async () => {
      pool.query.mockResolvedValueOnce([[]]);

      const res = await request(app).post("/api/auth/login").send({
        email: "usuario@test.com",
        password: "12345",
      });

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty("message", "Credenciales inválidas");
    });
  });
});
