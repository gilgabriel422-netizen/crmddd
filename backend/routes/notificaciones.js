const express = require('express');
const router = express.Router();
const notificacionesController = require('../controllers/notificacionesController');

// Obtener todas las notificaciones
router.get('/', notificacionesController.getAllNotificaciones);

// Obtener notificaciones no leídas de un usuario
router.get('/unread/:usuarioId', notificacionesController.getUnreadNotificaciones);

// Crear nueva notificación
router.post('/', notificacionesController.createNotificacion);

// Marcar notificación como leída
router.patch('/:id/read', notificacionesController.markAsRead);

// Marcar todas las notificaciones como leídas
router.patch('/user/:usuarioId/read-all', notificacionesController.markAllAsRead);

// Eliminar notificación
router.delete('/:id', notificacionesController.deleteNotificacion);

module.exports = router;