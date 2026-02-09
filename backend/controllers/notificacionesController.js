const Notificacion = require('../models/Notificacion');

// Obtener todas las notificaciones
exports.getAllNotificaciones = async (req, res) => {
  try {
    const { usuarioId } = req.query;
    
    let whereClause = {};
    if (usuarioId) {
      whereClause.usuario_id = usuarioId;
    }

    const notificaciones = await Notificacion.findAll({
      where: whereClause,
      order: [['fecha_creacion', 'DESC']]
    });

    res.json(notificaciones);
  } catch (error) {
    console.error('Error al obtener notificaciones:', error);
    res.status(500).json({ error: 'Error al obtener notificaciones' });
  }
};

// Obtener notificaciones no leídas
exports.getUnreadNotificaciones = async (req, res) => {
  try {
    const { usuarioId } = req.params;

    const notificaciones = await Notificacion.findAll({
      where: {
        usuario_id: usuarioId,
        leida: false
      },
      order: [['fecha_creacion', 'DESC']]
    });

    res.json(notificaciones);
  } catch (error) {
    console.error('Error al obtener notificaciones no leídas:', error);
    res.status(500).json({ error: 'Error al obtener notificaciones no leídas' });
  }
};

// Crear notificación
exports.createNotificacion = async (req, res) => {
  try {
    const notificacionData = req.body;

    const nuevaNotificacion = await Notificacion.create(notificacionData);
    res.status(201).json(nuevaNotificacion);
  } catch (error) {
    console.error('Error al crear notificación:', error);
    res.status(500).json({ error: 'Error al crear notificación' });
  }
};

// Marcar como leída
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    await Notificacion.update(
      { leida: true },
      { where: { id } }
    );

    res.json({ message: 'Notificación marcada como leída' });
  } catch (error) {
    console.error('Error al marcar notificación como leída:', error);
    res.status(500).json({ error: 'Error al marcar notificación como leída' });
  }
};

// Marcar todas como leídas
exports.markAllAsRead = async (req, res) => {
  try {
    const { usuarioId } = req.params;

    await Notificacion.update(
      { leida: true },
      { where: { usuario_id: usuarioId, leida: false } }
    );

    res.json({ message: 'Todas las notificaciones marcadas como leídas' });
  } catch (error) {
    console.error('Error al marcar todas como leídas:', error);
    res.status(500).json({ error: 'Error al marcar todas como leídas' });
  }
};

// Eliminar notificación
exports.deleteNotificacion = async (req, res) => {
  try {
    const { id } = req.params;

    await Notificacion.destroy({ where: { id } });
    res.json({ message: 'Notificación eliminada' });
  } catch (error) {
    console.error('Error al eliminar notificación:', error);
    res.status(500).json({ error: 'Error al eliminar notificación' });
  }
};
