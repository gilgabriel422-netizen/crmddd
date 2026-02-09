const express = require('express');
const router = express.Router();

// Endpoints mock para requerimientos
// TODO: Implementar funcionalidad completa cuando se necesite

router.get('/', (req, res) => {
  res.json({ requirements: [], pagination: { page: 1, limit: 100, total: 0, totalPages: 1 } });
});

router.get('/stats/overview', (req, res) => {
  res.json({
    total_requirements: 0,
    completed: 0,
    pending: 0
  });
});

router.get('/search-contract/:contractNumber', (req, res) => {
  res.json({ requirements: [] });
});

router.get('/client/:clientId', (req, res) => {
  res.json({ requirements: [] });
});

router.get('/:id', (req, res) => {
  res.status(404).json({ error: 'Requerimiento no encontrado' });
});

router.post('/', (req, res) => {
  res.status(501).json({ error: 'Funcionalidad no implementada aún' });
});

router.patch('/:id/status', (req, res) => {
  res.status(501).json({ error: 'Funcionalidad no implementada aún' });
});

router.delete('/:id', (req, res) => {
  res.status(501).json({ error: 'Funcionalidad no implementada aún' });
});

module.exports = router;
