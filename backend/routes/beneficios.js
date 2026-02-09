const express = require('express');
const router = express.Router();
const beneficiosController = require('../controllers/beneficiosController');
const { authenticateToken } = require('../middleware/auth');

// Obtener beneficios de un cliente
router.get('/cliente/:cliente_id', authenticateToken, beneficiosController.getBeneficiosPorCliente);

// Crear nuevo beneficio
router.post('/', authenticateToken, beneficiosController.crearBeneficio);

// Consumir beneficio
router.post('/consumir', authenticateToken, beneficiosController.consumirBeneficio);

// Confirmar consumo (admin)
router.patch('/consumo/:consumo_id/confirmar', authenticateToken, beneficiosController.confirmarConsumo);

// Rechazar consumo (admin)
router.patch('/consumo/:consumo_id/rechazar', authenticateToken, beneficiosController.rechazarConsumo);

// Obtener historial de consumos
router.get('/historial/:cliente_id', authenticateToken, beneficiosController.getHistorialConsumo);

// Obtener consumos pendientes (admin)
router.get('/admin/pendientes', authenticateToken, beneficiosController.getConsumosPendientes);

// Actualizar saldo
router.patch('/:beneficio_id/saldo', authenticateToken, beneficiosController.actualizarSaldo);

module.exports = router;
