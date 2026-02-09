const express = require('express');
const router = express.Router();
const plantillasController = require('../controllers/plantillasController');

/**
 * @route   GET /api/plantillas
 * @desc    Listar todas las plantillas disponibles
 * @access  Public
 */
router.get('/', plantillasController.listarPlantillas);

/**
 * @route   GET /api/plantillas/:id
 * @desc    Obtener contenido de una plantilla específica
 * @access  Public
 */
router.get('/:id', plantillasController.obtenerPlantilla);

module.exports = router;
