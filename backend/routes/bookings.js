const express = require('express');
const router = express.Router();

// Endpoints mock para bookings (reservas)
// TODO: Implementar funcionalidad completa cuando se necesite

router.get('/', (req, res) => {
  // Devolver array vacío por ahora
  res.json([]);
});

router.get('/search-contracts/:term', (req, res) => {
  res.json({
    clients: [],
    data: [],
    term: req.params.term || ''
  });
});

router.get('/:id', (req, res) => {
  res.status(404).json({ error: 'Booking no encontrado' });
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
