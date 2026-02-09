const express = require('express');
const router = express.Router();
const puntosController = require('../controllers/puntosController');

router.get('/:email', puntosController.getByEmail);
router.post('/', puntosController.setPoints);
router.patch('/:email/add', puntosController.addPoints);
router.delete('/clear', puntosController.clearAll);

module.exports = router;
