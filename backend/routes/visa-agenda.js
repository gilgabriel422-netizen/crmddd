const express = require('express');
const router = express.Router();

// Endpoints mock para agenda de visados
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

router.get('/:id', (req, res) => {
  res.status(404).json({ error: 'Agenda de visado no encontrada' });
});

router.post('/', (req, res) => {
  res.status(501).json({ error: 'Funcionalidad no implementada aún' });
});

router.put('/:id', (req, res) => {
  res.status(501).json({ error: 'Funcionalidad no implementada aún' });
});

router.delete('/:id', (req, res) => {
  res.status(501).json({ error: 'Funcionalidad no implementada aún' });
});

module.exports = router;
