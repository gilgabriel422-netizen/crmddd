const express = require('express');
const router = express.Router();

// Endpoints mock para auditoría
// TODO: Implementar funcionalidad completa cuando se necesite

router.get('/', (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 100;

  res.json({
    data: [],
    pagination: {
      page,
      limit,
      total: 0,
      totalPages: 1
    }
  });
});

router.get('/stats', (req, res) => {
  res.json({
    total: 0,
    by_action: {},
    by_user: {},
    period: req.query.period || 'all'
  });
});

router.get('/user/:userId', (req, res) => {
  res.json({
    data: []
  });
});

router.get('/action/:action', (req, res) => {
  res.json({
    data: []
  });
});

router.post('/', (req, res) => {
  res.status(201).json({ message: 'Registro de auditoría recibido' });
});

module.exports = router;
