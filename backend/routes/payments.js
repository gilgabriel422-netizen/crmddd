const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');
const { Op } = require('sequelize');

/**
 * Payments Routes - Implementación real usando Sequelize
 * 
 * DECISIÓN TÉCNICA: Reemplazar mock con implementación real de Miguel (decisión técnica #3)
 */

// Crear un pago
router.post('/', async (req, res) => {
  try {
    const payment = await Payment.create(req.body);
    res.json({ payment });
  } catch (err) {
    console.error('Error creating payment', err);
    res.status(500).json({ error: 'Error creating payment' });
  }
});

// Obtener pagos por cliente
router.get('/client/:clientId', async (req, res) => {
  try {
    const { clientId } = req.params;
    const payments = await Payment.findAll({
      where: { client_id: clientId },
      order: [['payment_date', 'DESC']]
    });
    res.json({ payments });
  } catch (err) {
    console.error('Error fetching payments', err);
    res.status(500).json({ error: 'Error fetching payments' });
  }
});

// Obtener todos los pagos (con filtros opcionales)
router.get('/', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const where = {};
    if (startDate && endDate) {
      where.payment_date = {
        [Op.between]: [startDate, endDate]
      };
    }
    const payments = await Payment.findAll({
      where,
      order: [['payment_date', 'DESC']]
    });
    res.json({ payments });
  } catch (err) {
    console.error('Error fetching payments', err);
    res.status(500).json({ error: 'Error fetching payments' });
  }
});

// Estadísticas de pagos (compatibilidad con frontend existente)
router.get('/stats/overview', async (req, res) => {
  try {
    const { Sequelize } = require('sequelize');
    const result = await Payment.findAll({
      attributes: [
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'total_payments'],
        [Sequelize.fn('SUM', Sequelize.col('payment_amount')), 'total_amount']
      ],
      raw: true
    });
    
    res.json({
      total_payments: parseInt(result[0]?.total_payments || 0),
      total_amount: parseFloat(result[0]?.total_amount || 0)
    });
  } catch (err) {
    console.error('Error fetching payment stats', err);
    res.status(500).json({ error: 'Error fetching payment stats' });
  }
});

// Obtener un pago por ID
router.get('/:id', async (req, res) => {
  try {
    const payment = await Payment.findByPk(req.params.id);
    if (!payment) {
      return res.status(404).json({ error: 'Payment no encontrado' });
    }
    res.json({ payment });
  } catch (err) {
    console.error('Error fetching payment', err);
    res.status(500).json({ error: 'Error fetching payment' });
  }
});

// Actualizar un pago
router.put('/:id', async (req, res) => {
  try {
    const payment = await Payment.findByPk(req.params.id);
    if (!payment) {
      return res.status(404).json({ error: 'Payment no encontrado' });
    }
    await payment.update(req.body);
    res.json({ payment });
  } catch (err) {
    console.error('Error updating payment', err);
    res.status(500).json({ error: 'Error updating payment' });
  }
});

// Eliminar un pago
router.delete('/:id', async (req, res) => {
  try {
    const payment = await Payment.findByPk(req.params.id);
    if (!payment) {
      return res.status(404).json({ error: 'Payment no encontrado' });
    }
    await payment.destroy();
    res.json({ ok: true });
  } catch (err) {
    console.error('Error deleting payment', err);
    res.status(500).json({ error: 'Error deleting payment' });
  }
});

module.exports = router;
