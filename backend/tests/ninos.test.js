const request = require("supertest");
const express = require("express");
const ninosRoutes = require("../src/routes/ninosRoutes");
const pool = require("../src/config/db");

jest.mock("../src/config/db"); 

const app = express();
app.use(express.json());
app.use("/api/ninos", ninosRoutes);

describe("Niños", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /register", () => {
    it("Registra un niño correctamente", async () => {
      pool.query
        .mockResolvedValueOnce([[]]) // no hay duplicado
        .mockResolvedValueOnce([{ insertId: 1 }]) 
        .mockResolvedValueOnce({}); // asignar pulsera

      const res = await request(app)
        .post("/api/ninos/register")
        .send({
          id_usuario: 1,
          nombre: "Camila",
          fecha_nacimiento: "2025-04-14",
          id_pulsera: 1
        });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty("id_nino", 1);
      expect(res.body.message).toBe("Niño registrado correctamente");
    });

    it("Retorna error si faltan campos", async () => {
      const res = await request(app)
        .post("/api/ninos/register")
        .send({ nombre: "Camila" });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe("Todos los campos son obligatorios");
    });

    it("Retorna error si el niño ya existe", async () => {
      pool.query.mockResolvedValueOnce([[{ id_nino: 1 }]]); 

      const res = await request(app)
        .post("/api/ninos/register")
        .send({
          id_usuario: 1,
          nombre: "Camila",
          fecha_nacimiento: "2025-04-14",
          id_pulsera: 1
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe("Ya existe un niño con ese nombre y fecha de nacimiento");
    });
  });

  describe("GET /user/:id_usuario", () => {
    it("Devuelve la lista de niños de un usuario", async () => {
      const mockRows = [
        { id_nino: 1, nombre: "Camila", fecha_nacimiento: new Date("2025-04-14"), id_pulsera: 1, pulsera_nombre: "Pulsera Azul" }
      ];
      pool.query.mockResolvedValueOnce([mockRows]);

      const res = await request(app).get("/api/ninos/user/1");

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body[0]).toHaveProperty("nombre", "Camila");
    });
  });

  describe("PATCH /update/:id_nino", () => {
    it("Actualiza un niño correctamente", async () => {
      pool.query
        .mockResolvedValueOnce([{ affectedRows: 1 }]) // update nino
        .mockResolvedValueOnce([[{ id_nino: 1, nombre: "Camila Editada", fecha_nacimiento: new Date("2025-04-14"), id_pulsera: 1, pulsera_nombre: "Pulsera Azul" }]]); 
      const res = await request(app)
        .patch("/api/ninos/update/1")
        .send({ nombre: "Camila Editada" });

      expect(res.statusCode).toBe(200);
      expect(res.body.nino.nombre).toBe("Camila Editada");
    });

    it("Retorna error si no se proporcionan campos", async () => {
      const res = await request(app)
        .patch("/api/ninos/update/1")
        .send({});

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe("No se proporcionaron campos para actualizar");
    });

    it("Retorna error si el niño no existe", async () => {
      pool.query.mockResolvedValueOnce([{ affectedRows: 0 }]);
      const res = await request(app)
        .patch("/api/ninos/update/9")
        .send({ nombre: "Aysel" });

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe("Niño no encontrado");
    });
  });

  describe("DELETE /delete/:id_nino", () => {
    it("Elimina un niño correctamente", async () => {
      pool.query
      .mockResolvedValueOnce([{}]) // libera pulsera 
      .mockResolvedValueOnce([{ affectedRows: 1 }]); 
 
      const res = await request(app).delete("/api/ninos/delete/1");

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe("Niño eliminado correctamente");
    });

    it("Retorna error si el niño no existe", async () => {
      pool.query
      .mockResolvedValueOnce([{}]) // liberar pulsera
      .mockResolvedValueOnce([{ affectedRows: 0 }]); 

      const res = await request(app).delete("/api/ninos/delete/9");

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe("Niño no encontrado");
    });
  });
});
