const { createZona, getZonas, updateZona, deleteZona } = require('../src/controllers/zonasController');
const db = require('../src/config/db');
const httpMocks = require('node-mocks-http');
const moment = require('moment-timezone');

jest.mock('../src/config/db');

describe('Zonas Seguras', () => {
  beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterAll(() => {
    console.error.mockRestore();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getZonas', () => {
    it('Devuelve todas las zonas de un usuario', async () => {
      const mockZonas = [{ id_zona: 1, nombre_zona: 'Casa' }];
      db.query.mockResolvedValue([mockZonas]);

      const req = httpMocks.createRequest({
        params: { id_usuario: 5 }
      });
      const res = httpMocks.createResponse();

      await getZonas(req, res);

      expect(db.query).toHaveBeenCalledWith(
        'SELECT * FROM zonas_seguras WHERE id_usuario = ?',
        [5]
      );
      const data = res._getJSONData();
      expect(data).toEqual(mockZonas);
      expect(res.statusCode).toBe(200);
    });

    it('debe manejar errores', async () => {
      db.query.mockRejectedValue(new Error('Error DB'));

      const req = httpMocks.createRequest({ params: { id_usuario: 5 } });
      const res = httpMocks.createResponse();

      await getZonas(req, res);

      expect(res.statusCode).toBe(500);
      expect(res._getJSONData()).toEqual({ message: 'Error al obtener zonas seguras' });
    });
  });

  describe('createZona', () => {
    it('Crea una zona segura', async () => {
      const insertId = 9;
      db.query.mockResolvedValue([{ insertId }]);

      const req = httpMocks.createRequest({
        body: {
          id_nino: 1,
          id_usuario: 5,
          nombre_zona: 'Escuela',
          latitud: -16.5555,
          longitud: -68.15555,
          radio_metros: 50
        }
      });
      const res = httpMocks.createResponse();

      await createZona(req, res);

      expect(db.query).toHaveBeenCalledWith(
        'INSERT INTO zonas_seguras (id_nino, id_usuario, nombre_zona, latitud, longitud, radio_metros, fecha_creacion) VALUES (?, ?, ?, ?, ?, ?, ?)',
        expect.any(Array)
      );

      const data = res._getJSONData();
      expect(data).toEqual({ message: 'Zona segura creada', id_zona: insertId });
    });

    it('Maneja errores', async () => {
      db.query.mockRejectedValue(new Error('Error DB'));

      const req = httpMocks.createRequest({ body: {} });
      const res = httpMocks.createResponse();

      await createZona(req, res);

      expect(res.statusCode).toBe(500);
      expect(res._getJSONData()).toEqual({ message: 'Error al crear zona segura' });
    });
  });

  describe('updateZona', () => {
    it('Actualiza una zona segura', async () => {
      db.query.mockResolvedValue([{}]);

      const req = httpMocks.createRequest({
        params: { id_zona: 1 },
        body: { nombre_zona: 'Parque', latitud: -16.22222, longitud: -68.99999, radio_metros: 30, estado: 'activo' }
      });
      const res = httpMocks.createResponse();

      await updateZona(req, res);

      expect(db.query).toHaveBeenCalledWith(
        'UPDATE zonas_seguras SET nombre_zona = ?, latitud = ?, longitud = ?, radio_metros = ?, estado = ?, fecha_creacion = ? WHERE id_zona = ?',
        expect.any(Array)
      );

      expect(res._getJSONData()).toEqual({ message: 'Zona segura actualizada' });
    });

    it('Maneja errores', async () => {
      db.query.mockRejectedValue(new Error('Error DB'));

      const req = httpMocks.createRequest({ params: { id_zona: 1 }, body: {} });
      const res = httpMocks.createResponse();

      await updateZona(req, res);

      expect(res.statusCode).toBe(500);
      expect(res._getJSONData()).toEqual({ message: 'Error al actualizar zona segura' });
    });
  });

  describe('deleteZona', () => {
    it('Elimina una zona segura', async () => {
      db.query.mockResolvedValue([{}]);

      const req = httpMocks.createRequest({ params: { id_zona: 1 } });
      const res = httpMocks.createResponse();

      await deleteZona(req, res);

      expect(db.query).toHaveBeenCalledWith(
        'DELETE FROM zonas_seguras WHERE id_zona = ?',
        [1]
      );
      expect(res._getJSONData()).toEqual({ message: 'Zona segura eliminada' });
    });

    it('Maneja errores', async () => {
      db.query.mockRejectedValue(new Error('Error DB'));

      const req = httpMocks.createRequest({ params: { id_zona: 1 } });
      const res = httpMocks.createResponse();

      await deleteZona(req, res);

      expect(res.statusCode).toBe(500);
      expect(res._getJSONData()).toEqual({ message: 'Error al eliminar zona segura' });
    });
  });
});
