const express = require('express');
const router = express.Router();
const contratoController = require('../controllers/contratoController');
const { authenticateToken } = require('../middleware/auth');

// Middleware de autenticación para todas las rutas
router.use((req, res, next) => {
  console.log('🔐 Ejecutando authenticateToken para:', req.method, req.path);
  authenticateToken(req, res, next);
});

/**
 * @route   GET /api/contratos
 * @desc    Obtener todos los contratos
 * @access  Private
 */
router.get('/', contratoController.obtenerTodos);

/**
 * @route   GET /api/contratos/estadisticas
 * @desc    Obtener estadísticas de contratos
 * @access  Private
 */
router.get('/estadisticas', contratoController.obtenerEstadisticas);

/**
 * @route   GET /api/contratos/cliente/:clienteId
 * @desc    Obtener todos los contratos de un cliente
 * @access  Private
 */
router.get('/cliente/:clienteId', contratoController.obtenerPorCliente);

/**
 * @route   GET /api/contratos/estado/:estado
 * @desc    Obtener contratos por estado (pendiente, firmado, activo, cancelado)
 * @access  Private
 */
router.get('/estado/:estado', contratoController.obtenerPorEstado);

/**
 * @route   POST /api/contratos/plantilla
 * @desc    Crear contrato completo desde plantilla JSON
 * @access  Private
 * @body    Plantilla completa del contrato
 */
router.post('/plantilla', contratoController.crearDesdePlantilla);

/**
 * @route   POST /api/contratos
 * @desc    Crear nuevo contrato simple
 * @access  Private
 */
router.post('/', contratoController.crear);

/**
 * @route   GET /api/contratos/:id/plantilla
 * @desc    Generar plantilla JSON rellena del contrato
 * @access  Private
 */
router.get('/:id/plantilla', contratoController.generarPlantilla);

/**
 * @route   GET /api/contratos/:id/documento
 * @desc    Generar documento HTML del contrato
 * @access  Private
 */
router.get('/:id/documento', contratoController.generarDocumento);

/**
 * @route   GET /api/contratos/:id/documento/pdf
 * @desc    Generar documento PDF del contrato
 * @access  Private
 */
router.get('/:id/documento/pdf', contratoController.generarDocumentoPdf);

/**
 * @route   GET /api/contratos/:id
 * @desc    Obtener contrato por ID
 * @access  Private
 */
router.get('/:id', contratoController.obtenerPorId);

/**
 * @route   PUT /api/contratos/:id
 * @desc    Actualizar contrato
 * @access  Private
 */
router.put('/:id', contratoController.actualizar);

/**
 * @route   POST /api/contratos/:id/firmar
 * @desc    Firmar contrato (cliente acepta)
 * @access  Private
 * @body    { firma: string, nombre: string, fecha?: string }
 */
router.post('/:id/firmar', contratoController.firmar);

/**
 * @route   POST /api/contratos/:id/activar
 * @desc    Activar contrato
 * @access  Private
 */
router.post('/:id/activar', contratoController.activar);

/**
 * @route   POST /api/contratos/:id/cancelar
 * @desc    Cancelar contrato
 * @access  Private
 * @body    { motivo: string }
 */
router.post('/:id/cancelar', contratoController.cancelar);

/**
 * @route   DELETE /api/contratos/:id
 * @desc    Eliminar contrato
 * @access  Private (Admin only)
 */
router.delete('/:id', contratoController.eliminar);

module.exports = router;
