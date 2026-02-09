const Actividad = require('../models/Actividad');

// Obtener todas las actividades
exports.getAllActividades = async (req, res) => {
  try {
    const actividades = await Actividad.getAll();
    res.json(actividades);
  } catch (error) {
    console.error('Error al obtener actividades:', error);
    res.status(500).json({ error: 'Error al obtener actividades' });
  }
};

// Obtener actividades de un cliente
exports.getActividadesByCliente = async (req, res) => {
  try {
    const actividades = await Actividad.getByClienteId(req.params.clienteId);
    res.json(actividades);
  } catch (error) {
    console.error('Error al obtener actividades:', error);
    res.status(500).json({ error: 'Error al obtener actividades' });
  }
};

// Obtener actividad por ID
exports.getActividadById = async (req, res) => {
  try {
    const actividad = await Actividad.getById(req.params.id);
    if (!actividad) {
      return res.status(404).json({ error: 'Actividad no encontrada' });
    }
    res.json(actividad);
  } catch (error) {
    console.error('Error al obtener actividad:', error);
    res.status(500).json({ error: 'Error al obtener actividad' });
  }
};

// Crear nueva actividad
exports.createActividad = async (req, res) => {
  try {
    // Mapear campos del request al formato del modelo
    const actividadData = {
      cliente_id: req.body.cliente_id,
      contacto_id: req.body.contacto_id,
      usuario_id: req.body.usuario_id || null,
      tipo: req.body.tipo,
      titulo: req.body.asunto || req.body.titulo,
      descripcion: req.body.descripcion,
      fecha_actividad: req.body.fecha || req.body.fecha_actividad,
      completada: req.body.estado === 'completada' || req.body.completada || false
    };
    
    const actividadId = await Actividad.create(actividadData);
    const nuevaActividad = await Actividad.getById(actividadId);
    res.status(201).json(nuevaActividad);
  } catch (error) {
    console.error('Error al crear actividad:', error);
    res.status(500).json({ error: 'Error al crear actividad' });
  }
};

// Actualizar actividad
exports.updateActividad = async (req, res) => {
  try {
    // Mapear campos del request al formato del modelo
    const actividadData = {
      tipo: req.body.tipo,
      titulo: req.body.asunto || req.body.titulo,
      descripcion: req.body.descripcion,
      fecha_actividad: req.body.fecha || req.body.fecha_actividad,
      completada: req.body.estado === 'completada' || req.body.completada || false
    };
    
    const affectedRows = await Actividad.update(req.params.id, actividadData);
    if (affectedRows === 0) {
      return res.status(404).json({ error: 'Actividad no encontrada' });
    }
    const actividadActualizada = await Actividad.getById(req.params.id);
    res.json(actividadActualizada);
  } catch (error) {
    console.error('Error al actualizar actividad:', error);
    res.status(500).json({ error: 'Error al actualizar actividad' });
  }
};

// Eliminar actividad
exports.deleteActividad = async (req, res) => {
  try {
    const affectedRows = await Actividad.delete(req.params.id);
    if (affectedRows === 0) {
      return res.status(404).json({ error: 'Actividad no encontrada' });
    }
    res.json({ mensaje: 'Actividad eliminada exitosamente' });
  } catch (error) {
    console.error('Error al eliminar actividad:', error);
    res.status(500).json({ error: 'Error al eliminar actividad' });
  }
};

// Marcar actividad como completada
exports.marcarCompletada = async (req, res) => {
  try {
    const affectedRows = await Actividad.marcarCompletada(req.params.id);
    if (affectedRows === 0) {
      return res.status(404).json({ error: 'Actividad no encontrada' });
    }
    const actividadActualizada = await Actividad.getById(req.params.id);
    res.json(actividadActualizada);
  } catch (error) {
    console.error('Error al marcar actividad como completada:', error);
    res.status(500).json({ error: 'Error al marcar actividad como completada' });
  }
};
