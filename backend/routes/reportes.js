const express = require('express');
const router = express.Router();
const reportesController = require('../controllers/reportesController');
const { authenticateToken } = require('../middleware/auth');

// Obtener resumen del período
router.get('/summary', authenticateToken, reportesController.getLastMonthSummary);

// Obtener resumen de pagos
router.get('/payments-summary', authenticateToken, reportesController.getPaymentsSummary);

// Obtener reporte de ventas
router.get('/sales', authenticateToken, reportesController.getSalesReport);

// Obtener reporte de cobranzas
router.get('/collections', authenticateToken, reportesController.getCollectionsReport);

module.exports = router;
