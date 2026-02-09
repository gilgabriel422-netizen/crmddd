const express = require('express');
const router = express.Router();
const paquetesController = require('../controllers/paquetesController');

router.get('/', paquetesController.listar);
router.get('/:id', paquetesController.obtenerPorId);
router.post('/', paquetesController.crear);
router.put('/:id', paquetesController.actualizar);
router.patch('/:id/desactivar', paquetesController.desactivar);
router.delete('/:id', paquetesController.eliminar);

module.exports = router;
