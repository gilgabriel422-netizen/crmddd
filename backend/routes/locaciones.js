const express = require('express');
const router = express.Router();
const locacionesController = require('../controllers/locacionesController');

router.get('/', locacionesController.listar);
router.post('/', locacionesController.crear);
router.put('/:id', locacionesController.actualizar);
router.delete('/:id', locacionesController.eliminar);

module.exports = router;
