const request = require("supertest");
const express = require("express");
const {
  createUbicacion
} = require("../src/controllers/ubicacionesController");

jest.mock("../src/config/db", () => ({
  query: jest.fn()
}));

jest.mock("nodemailer", () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn()
  })
}));

jest.mock("../src/controllers/ubicacionesController", () => {
  const original = jest.requireActual("../src/controllers/ubicacionesController");
  return {
    ...original,
    checkZonasSeguras: jest.fn().mockResolvedValue()
  };
});

const pool = require("../src/config/db");
const nodemailer = require("nodemailer");

const app = express();
app.use(express.json());

app.post("/ubicaciones", createUbicacion);

const transport = nodemailer.createTransport();

describe("Ubicaciones", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("Retorna 400 si faltan campos obligatorios", async () => {
    const res = await request(app).post("/ubicaciones").send({
      id_nino: 1,
      latitud: -16.5
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Todos los campos son obligatorios");
  });

  test("Retorna 403 si el niño no pertenece al usuario", async () => {
    pool.query.mockResolvedValueOnce([[]]); // Niño no encontrado

    const res = await request(app).post("/ubicaciones").send({
      id_nino: 1,
      latitud: -16.5555,
      longitud: -68.1111,
      id_usuario: 9
    });

    expect(res.statusCode).toBe(403);
    expect(res.body.message).toBe(
      "No tienes permisos para registrar ubicación de este niño"
    );
  });

  test("Inserta ubicación y devuelve 201", async () => {
    pool.query.mockResolvedValueOnce([[{ id_nino: 1, nombre: "Camila" }]]);
    pool.query.mockResolvedValueOnce([{ insertId: 2 }]);
    pool.query.mockResolvedValueOnce([[]]);

    const res = await request(app).post("/ubicaciones").send({
      id_nino: 1,
      latitud: -16.5555,
      longitud: -68.1111,
      id_usuario: 5
    });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("id_ubicacion", 2);
    expect(res.body).toHaveProperty("latitud", -16.5555);
    expect(res.body).toHaveProperty("longitud", -68.1111);
    expect(res.body).toHaveProperty("nombre", "Camila");
  });

  test("Retorna 500 si ocurre un error interno", async () => {
    const originalConsoleError = console.error;
    console.error = jest.fn();
    pool.query.mockResolvedValueOnce([[{ id_nino: 1, nombre: "Camila" }]]);
    pool.query.mockRejectedValueOnce(new Error("DB error"));

    const res = await request(app).post("/ubicaciones").send({
      id_nino: 1,
      latitud: -16.5555,
      longitud: -68.1111,
      id_usuario: 5
    });

    expect(res.statusCode).toBe(500);
    expect(res.body.message).toBe("Error al registrar ubicación");
  });
});
