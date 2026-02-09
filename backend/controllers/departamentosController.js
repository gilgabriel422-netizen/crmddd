// Controlador para Departamento
const Departamento = require('../models/Departamento');
const Locacion = require('../models/Locacion');

module.exports = {
  async listar(req, res) {
    try {
      const departamentos = await Departamento.findAll({ include: Locacion });
      res.json(departamentos);
    } catch (err) {
      res.status(500).json({ error: 'Error al obtener departamentos' });
    }
  },
  async crear(req, res) {
    try {
      const { nombre, locacionid } = req.body;
      if (!nombre || typeof nombre !== 'string' || nombre.trim() === '') {
        return res.status(400).json({ error: 'El campo "nombre" es obligatorio y debe ser un texto.' });
      }
      if (!locacionid || isNaN(Number(locacionid))) {
        return res.status(400).json({ error: 'El campo "locacionid" es obligatorio y debe ser un número.' });
      }
      const departamento = await Departamento.create({ nombre, locacionid });
      res.status(201).json(departamento);
    } catch (err) {
      res.status(400).json({ error: err.message || 'Error al crear departamento' });
    }
  },
  async actualizar(req, res) {
    try {
      const { id } = req.params;
      const [updated] = await Departamento.update(req.body, { where: { id } });
      if (updated) {
        const departamento = await Departamento.findByPk(id);
        res.json(departamento);
      } else {
        res.status(404).json({ error: 'Departamento no encontrado' });
      }
    } catch (err) {
      res.status(400).json({ error: 'Error al actualizar departamento' });
    }
  },
  async eliminar(req, res) {
    try {
      const { id } = req.params;
      const deleted = await Departamento.destroy({ where: { id } });
      if (deleted) {
        res.json({ mensaje: 'Departamento eliminado' });
      } else {
        res.status(404).json({ error: 'Departamento no encontrado' });
      }
    } catch (err) {
      res.status(400).json({ error: 'Error al eliminar departamento' });
    }
  }
};
