const express = require('express');
const router = express.Router();
const contactosController = require('../controllers/contactosController');

// Rutas para contactos
router.get('/', contactosController.getAllContactos);
router.get('/cliente/:clienteId', contactosController.getContactosByCliente);
router.get('/:id', contactosController.getContactoById);
router.post('/', contactosController.createContacto);
router.put('/:id', contactosController.updateContacto);
router.delete('/:id', contactosController.deleteContacto);

module.exports = router;
