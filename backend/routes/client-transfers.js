const express = require('express');
const router = express.Router();
const controller = require('../controllers/clientTransfersController');

// Crear una transferencia (audit log)
router.post('/', controller.createTransfer);

// Listar transferencias (solo para depuración)
router.get('/', controller.listTransfers);

module.exports = router;
