const express = require('express');
const router = express.Router();
const PaymentAgreement = require('../models/PaymentAgreement');

/**
 * Payment Agreements Routes - Implementación real usando Sequelize
 * 
 * DECISIÓN TÉCNICA: Reemplazar mock con implementación real de Miguel (decisión técnica #3)
 */

// Crear acuerdo de pago
router.post('/', async (req, res) => {
  try {
    const agreement = await PaymentAgreement.create(req.body);
    res.json({ agreement });
  } catch (err) {
    console.error('Error creating payment agreement', err);
    res.status(500).json({ error: 'Error creating payment agreement' });
  }
});

// Obtener acuerdos por cliente
router.get('/client/:clientId', async (req, res) => {
  try {
    const { clientId } = req.params;
    const agreements = await PaymentAgreement.findAll({
      where: { client_id: clientId },
      order: [['created_at', 'DESC']]
    });
    res.json({ agreements });
  } catch (err) {
    console.error('Error fetching payment agreements', err);
    res.status(500).json({ error: 'Error fetching payment agreements' });
  }
});

// Obtener todos los acuerdos
router.get('/', async (req, res) => {
  try {
    const agreements = await PaymentAgreement.findAll({
      order: [['created_at', 'DESC']]
    });
    
    // Formato compatible con frontend existente
    res.json({ 
      agreements,
      pagination: {
        page: 1,
        limit: 100,
        total: agreements.length,
        totalPages: 1
      }
    });
  } catch (err) {
    console.error('Error fetching payment agreements', err);
    res.status(500).json({ error: 'Error fetching payment agreements' });
  }
});

// Estadísticas de acuerdos
router.get('/stats/overview', async (req, res) => {
  try {
    const { Sequelize } = require('sequelize');
    const { Op } = require('sequelize');
    
    const [total, active, completed] = await Promise.all([
      PaymentAgreement.count(),
      PaymentAgreement.count({ where: { status: 'active' } }),
      PaymentAgreement.count({ where: { status: 'completed' } })
    ]);
    
    const pendingResult = await PaymentAgreement.findAll({
      attributes: [
        [Sequelize.fn('SUM', Sequelize.col('total_amount')), 'pending_amount']
      ],
      where: { status: 'active' },
      raw: true
    });
    
    res.json({
      total_agreements: total,
      active_agreements: active,
      completed_agreements: completed,
      pending_amount: parseFloat(pendingResult[0]?.pending_amount || 0)
    });
  } catch (err) {
    console.error('Error fetching agreement stats', err);
    res.status(500).json({ error: 'Error fetching agreement stats' });
  }
});

// Obtener un acuerdo por ID
router.get('/:id', async (req, res) => {
  try {
    const agreement = await PaymentAgreement.findByPk(req.params.id);
    if (!agreement) {
      return res.status(404).json({ error: 'Convenio no encontrado' });
    }
    res.json({ agreement });
  } catch (err) {
    console.error('Error fetching payment agreement', err);
    res.status(500).json({ error: 'Error fetching payment agreement' });
  }
});

// Actualizar estado de un acuerdo
router.patch('/:id/status', async (req, res) => {
  try {
    const agreement = await PaymentAgreement.findByPk(req.params.id);
    if (!agreement) {
      return res.status(404).json({ error: 'Convenio no encontrado' });
    }
    await agreement.update({ status: req.body.status });
    res.json({ agreement });
  } catch (err) {
    console.error('Error updating agreement status', err);
    res.status(500).json({ error: 'Error updating agreement status' });
  }
});

// Actualizar fecha de vencimiento
router.patch('/:id/due-date', async (req, res) => {
  try {
    const agreement = await PaymentAgreement.findByPk(req.params.id);
    if (!agreement) {
      return res.status(404).json({ error: 'Convenio no encontrado' });
    }
    await agreement.update({ end_date: req.body.end_date });
    res.json({ agreement });
  } catch (err) {
    console.error('Error updating agreement due date', err);
    res.status(500).json({ error: 'Error updating agreement due date' });
  }
});

// Eliminar un acuerdo
router.delete('/:id', async (req, res) => {
  try {
    const agreement = await PaymentAgreement.findByPk(req.params.id);
    if (!agreement) {
      return res.status(404).json({ error: 'Convenio no encontrado' });
    }
    await agreement.destroy();
    res.json({ ok: true });
  } catch (err) {
    console.error('Error deleting payment agreement', err);
    res.status(500).json({ error: 'Error deleting payment agreement' });
  }
});

module.exports = router;
