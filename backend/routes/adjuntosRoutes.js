const express = require('express');
const router = express.Router();
const { adjuntoController, upload } = require('../controllers/adjuntoController');
const { authenticateToken } = require('../middleware/auth');

// Todas las rutas requieren autenticación
router.use(authenticateToken);

/**
 * @route   POST /api/adjuntos/:id/subir
 * @desc    Subir un PDF adjunto a un contrato
 * @access  Private
 */
router.post('/:id/subir', upload.single('pdf'), adjuntoController.subirAdjunto);

/**
 * @route   GET /api/adjuntos/:id
 * @desc    Obtener todos los adjuntos de un contrato
 * @access  Private
 */
router.get('/:id', adjuntoController.obtenerAdjuntos);

/**
 * @route   GET /api/adjuntos/descargar/:id
 * @desc    Descargar un adjunto específico
 * @access  Private
 */
router.get('/descargar/:id', adjuntoController.descargarAdjunto);

/**
 * @route   DELETE /api/adjuntos/:id
 * @desc    Eliminar un adjunto
 * @access  Private
 */
router.delete('/:id', adjuntoController.eliminarAdjunto);

/**
 * @route   POST /api/adjuntos/:contratoId/desde-plantilla/:plantillaId
 * @desc    Crear adjunto generando PDF desde una plantilla
 * @access  Private
 */
router.post('/:contratoId/desde-plantilla/:plantillaId', adjuntoController.crearAdjuntoDesdeePlantilla);

module.exports = router;
