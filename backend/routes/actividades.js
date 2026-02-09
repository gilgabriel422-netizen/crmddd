const express = require('express');
const router = express.Router();
const actividadesController = require('../controllers/actividadesController');

// Rutas para actividades
router.get('/', actividadesController.getAllActividades);
router.get('/cliente/:clienteId', actividadesController.getActividadesByCliente);
router.get('/:id', actividadesController.getActividadById);
router.post('/', actividadesController.createActividad);
router.put('/:id', actividadesController.updateActividad);
router.put('/:id/completar', actividadesController.marcarCompletada);
router.delete('/:id', actividadesController.deleteActividad);

module.exports = router;
