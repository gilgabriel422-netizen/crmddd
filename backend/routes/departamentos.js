const express = require('express');
const router = express.Router();
const departamentosController = require('../controllers/departamentosController');

router.get('/', departamentosController.listar);
router.post('/', departamentosController.crear);
router.put('/:id', departamentosController.actualizar);
router.delete('/:id', departamentosController.eliminar);

module.exports = router;
