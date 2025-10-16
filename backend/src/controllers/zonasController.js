const db = require('../config/db');
const moment = require('moment-timezone'); 

// Listar todas las zonas de un usuario
exports.getZonas = async (req, res) => {
    const { id_usuario } = req.params;
    try {
        const [rows] = await db.query(
            'SELECT * FROM zonas_seguras WHERE id_usuario = ?',
            [id_usuario]
        );
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener zonas seguras' });
    }
};

// Crear una zona segura
exports.createZona = async (req, res) => {
    const { id_nino, id_usuario, nombre_zona, latitud, longitud, radio_metros } = req.body;

    // Fecha y hora de Bolivia
    const fechaBolivia = moment().tz("America/La_Paz").format('YYYY-MM-DD HH:mm:ss');

    try {
        const [result] = await db.query(
            'INSERT INTO zonas_seguras (id_nino, id_usuario, nombre_zona, latitud, longitud, radio_metros, fecha_creacion) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [id_nino, id_usuario, nombre_zona, latitud, longitud, radio_metros, fechaBolivia]
        );
        res.json({ message: 'Zona segura creada', id_zona: result.insertId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al crear zona segura' });
    }
};

// Editar una zona segura
exports.updateZona = async (req, res) => {
    const { id_zona } = req.params;
    const { nombre_zona, latitud, longitud, radio_metros, estado } = req.body;

    // Fecha y hora de modificación en Bolivia 
    const fechaModificacion = moment().tz("America/La_Paz").format('YYYY-MM-DD HH:mm:ss');

    try {
        await db.query(
            'UPDATE zonas_seguras SET nombre_zona = ?, latitud = ?, longitud = ?, radio_metros = ?, estado = ?, fecha_creacion = ? WHERE id_zona = ?',
            [nombre_zona, latitud, longitud, radio_metros, estado, fechaModificacion, id_zona]
        );
        res.json({ message: 'Zona segura actualizada' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al actualizar zona segura' });
    }
};

// Eliminar una zona segura
exports.deleteZona = async (req, res) => {
    const { id_zona } = req.params;
    try {
        await db.query('DELETE FROM zonas_seguras WHERE id_zona = ?', [id_zona]);
        res.json({ message: 'Zona segura eliminada' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al eliminar zona segura' });
    }
};
