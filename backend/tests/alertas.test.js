const httpMocks = require('node-mocks-http');
const pool = require('../src/config/db');

jest.mock('../src/config/db');
jest.mock('nodemailer', () => {
  return {
    createTransport: () => ({
      sendMail: jest.fn().mockResolvedValue(true)
    })
  };
});

const { crearAlerta, getAlertasByNino, deleteAlerta } = require('../src/controllers/alertasController');

describe('Alertas', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => {});   // Oculta console.log
    jest.spyOn(console, 'error').mockImplementation(() => {}); // Oculta console.error
  });

  afterAll(() => {
    console.log.mockRestore();
    console.error.mockRestore();
  });

  describe('crearAlerta', () => {
    it('Crea una alerta y envia correo', async () => {
      const insertId = 1;
      pool.query
        .mockResolvedValueOnce([{ insertId }]) 
        .mockResolvedValueOnce([ 
          [{
            email: 'vania@email.com',
            nombre_nino: 'Camila',
            nombre_pulsera: 'Pulsera Actualizada',
            nombre_zona: 'Casa'
          }]
        ]);

      const ioMock = { to: jest.fn().mockReturnValue({ emit: jest.fn() }) };
      const req = httpMocks.createRequest({
        body: {
          id_nino: 1,
          id_zona: 2,
          tipo_alerta: 'salida_zona_segura',
          mensaje: 'Niño fuera de zona segura'
        },
        io: ioMock
      });
      const res = httpMocks.createResponse();

      await crearAlerta(req, res);

      expect(pool.query).toHaveBeenCalledTimes(2);
      expect(res.statusCode).toBe(201);

      const data = res._getJSONData();
      expect(data.alerta).toHaveProperty('id_alerta', insertId);
      expect(data.alerta).toHaveProperty('tipo_alerta', 'salida_zona_segura');
    });

    it('Maneja errores de base de datos', async () => {
      pool.query.mockRejectedValue(new Error('DB error'));
      const req = httpMocks.createRequest({ body: { id_nino: 1, tipo_alerta: 'salida_zona_segura', mensaje: 'Mensaje' } });
      const res = httpMocks.createResponse();

      await crearAlerta(req, res);

      expect(res.statusCode).toBe(500);
      expect(res._getJSONData()).toEqual({
        message: 'Error al crear alerta',
        error: 'DB error'
      });
    });

    it('Valida campos obligatorios', async () => {
      const req = httpMocks.createRequest({ body: {} });
      const res = httpMocks.createResponse();

      await crearAlerta(req, res);

      expect(res.statusCode).toBe(400);
      expect(res._getJSONData()).toEqual({
        message: 'id_nino, tipo_alerta y mensaje son obligatorios'
      });
    });
  });

  describe('getAlertasByNino', () => {
    it('Devuelve alertas de un niño', async () => {
      const mockAlertas = [{ id_alerta: 1, mensaje: 'Niño fuera de zona segura' }];
      pool.query.mockResolvedValue([mockAlertas]);

      const req = httpMocks.createRequest({ params: { id_nino: 1 } });
      const res = httpMocks.createResponse();

      await getAlertasByNino(req, res);

      expect(pool.query).toHaveBeenCalledWith(
        "SELECT * FROM alertas WHERE id_nino = ? ORDER BY fecha_hora DESC",
        [1]
      );
      expect(res._getJSONData()).toEqual(mockAlertas);
    });
  });

  describe('deleteAlerta', () => {
    it('Elimina una alerta', async () => {
      pool.query.mockResolvedValue([{}]);

      const req = httpMocks.createRequest({ params: { id_alerta: 1 } });
      const res = httpMocks.createResponse();

      await deleteAlerta(req, res);

      expect(pool.query).toHaveBeenCalledWith(
        "DELETE FROM alertas WHERE id_alerta = ?",
        [1]
      );
      expect(res._getJSONData()).toEqual({ message: "Alerta eliminada correctamente" });
    });
  });
});
