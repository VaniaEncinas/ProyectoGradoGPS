const request = require("supertest");
const express = require("express");
const pulseraRoutes = require("../src/routes/pulseraRoutes");
const pool = require("../src/config/db");

jest.mock("../src/config/db");

const app = express();
app.use(express.json());
app.use("/api/pulseras", pulseraRoutes);

describe("Pulseras", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /register", () => {
    it("Crea una pulsera correctamente", async () => {
      pool.query
        .mockResolvedValueOnce([[]]) // no existe pulsera previa
        .mockResolvedValueOnce([{ insertId: 1 }]); // inserción exitosa

      const res = await request(app)
        .post("/api/pulseras/register")
        .send({ nombre: "Pulsera Azul", id_usuario: 1 });

      expect(res.statusCode).toBe(201);
      expect(res.body).toEqual({ id_pulsera: 1, nombre: "Pulsera Azul" });
    });

    it("Retorna 400 si faltan datos", async () => {
      const res = await request(app)
        .post("/api/pulseras/register")
        .send({ nombre: "Pulsera Azul" }); // falta id_usuario

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe("Nombre e ID de usuario son obligatorios");
    });

    it("Retorna 400 si ya existe la pulsera", async () => {
      pool.query.mockResolvedValueOnce([[{ id_pulsera: 1 }]]); // ya existe

      const res = await request(app)
        .post("/api/pulseras/register")
        .send({ nombre: "Pulsera Azul", id_usuario: 1 });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe("Pulsera ya registrada para este usuario");
    });
  });

  describe("GET /:id_usuario", () => {
    it("Retorna las pulseras del usuario", async () => {
      const pulserasMock = [{ id_pulsera: 1, nombre: "Pulsera Azul", id_usuario: 1 }];
      pool.query.mockResolvedValueOnce([pulserasMock]);

      const res = await request(app).get("/api/pulseras/1");

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual(pulserasMock);
    });

    it("Retorna 400 si no se proporciona id_usuario", async () => {
      const res = await request(app).get("/api/pulseras/");

      expect(res.statusCode).toBe(404); 
    });
  });

  describe("PATCH /:id", () => {
    it("Actualiza correctamente", async () => {
      pool.query
        .mockResolvedValueOnce([[]]) // no existe otra pulsera con el mismo nombre
        .mockResolvedValueOnce([{ affectedRows: 1 }]); 

      const res = await request(app)
        .patch("/api/pulseras/1")
        .send({ nombre: "Pulsera Actualizada" });

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({ id_pulsera: "1", nombre: "Pulsera Actualizada" });
    });

    it("Retorna 400 si no se proporciona nombre", async () => {
      const res = await request(app)
        .patch("/api/pulseras/1")
        .send({});

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe("El nombre es obligatorio");
    });

    it("Retorna 400 si ya existe la pulsera", async () => {
      pool.query.mockResolvedValueOnce([[{ id_pulsera: 2 }]]); // ya existe pulsera con ese nombre

      const res = await request(app)
        .patch("/api/pulseras/1")
        .send({ nombre: "Pulsera Actualizada" });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe("Pulsera ya registrada");
    });

    it("Retorna 404 si la pulsera no existe", async () => {
      pool.query
        .mockResolvedValueOnce([[]]) // no hay duplicado
        .mockResolvedValueOnce([{ affectedRows: 0 }]); 

      const res = await request(app)
        .patch("/api/pulseras/9")
        .send({ nombre: "Pulsera Nueva" });

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe("Pulsera no encontrada");
    });
  });

  describe("DELETE /:id", () => {
    it("Elimina correctamente la pulsera", async () => {
      pool.query
        .mockResolvedValueOnce([{ affectedRows: 1 }]) 
        .mockResolvedValueOnce([{ affectedRows: 1 }]); 

      const res = await request(app).delete("/api/pulseras/1");

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe("Pulsera eliminada correctamente");
    });

    it("Retorna 404 si la pulsera no existe", async () => {
      pool.query
        .mockResolvedValueOnce([{ affectedRows: 0 }]) 
        .mockResolvedValueOnce([{ affectedRows: 0 }]); 

      const res = await request(app).delete("/api/pulseras/9");

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe("Pulsera no encontrada");
    });
  });
});
