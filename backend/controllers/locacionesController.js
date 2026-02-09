// Controlador para Locacion
const Locacion = require('../models/Locacion');

module.exports = {
  async listar(req, res) {
    try {
      const locaciones = await Locacion.findAll();
      res.json(locaciones);
    } catch (err) {
      res.status(500).json({ error: 'Error al obtener locaciones' });
    }
  },
  async crear(req, res) {
    try {
      const { nombre, direccion } = req.body;
      if (!nombre || typeof nombre !== 'string' || nombre.trim() === '') {
        return res.status(400).json({ error: 'El campo "nombre" es obligatorio y debe ser un texto.' });
      }
      // direccion puede ser opcional, pero si se requiere, agregar validación aquí
      const locacion = await Locacion.create({ nombre, direccion });
      res.status(201).json(locacion);
    } catch (err) {
      res.status(400).json({ error: err.message || 'Error al crear locacion' });
    }
  },
  async actualizar(req, res) {
    try {
      const { id } = req.params;
      const [updated] = await Locacion.update(req.body, { where: { id } });
      if (updated) {
        const locacion = await Locacion.findByPk(id);
        res.json(locacion);
      } else {
        res.status(404).json({ error: 'Locacion no encontrada' });
      }
    } catch (err) {
      res.status(400).json({ error: 'Error al actualizar locacion' });
    }
  },
  async eliminar(req, res) {
    try {
      const { id } = req.params;
      const deleted = await Locacion.destroy({ where: { id } });
      if (deleted) {
        res.json({ mensaje: 'Locacion eliminada' });
      } else {
        res.status(404).json({ error: 'Locacion no encontrada' });
      }
    } catch (err) {
      res.status(400).json({ error: 'Error al eliminar locacion' });
    }
  }
};
