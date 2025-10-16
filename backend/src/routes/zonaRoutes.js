const express = require('express');
const router = express.Router();
const { getZonas, createZona, updateZona, deleteZona } = require('../controllers/zonasController');

// Listar todas las zonas de un usuario
router.get('/:id_usuario', getZonas);

// Crear una zona segura
router.post('/', createZona);

// Editar una zona segura (actualizar)
router.patch('/:id_zona', updateZona);

// Eliminar una zona segura
router.delete('/:id_zona', deleteZona);

module.exports = router;
