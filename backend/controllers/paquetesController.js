// Controlador para Paquetes Turísticos
const Paquete = require('../models/Paquete');

module.exports = {
  async listar(req, res) {
    try {
      const { activo } = req.query;
      const where = activo !== undefined ? { activo: activo === 'true' } : {};
      const paquetes = await Paquete.findAll({ where });
      res.json(paquetes);
    } catch (err) {
      res.status(500).json({ error: 'Error al obtener paquetes' });
    }
  },

  async obtenerPorId(req, res) {
    try {
      const { id } = req.params;
      const paquete = await Paquete.findByPk(id);
      if (!paquete) {
        return res.status(404).json({ error: 'Paquete no encontrado' });
      }
      res.json(paquete);
    } catch (err) {
      res.status(500).json({ error: 'Error al obtener paquete' });
    }
  },

  async crear(req, res) {
    try {
      const { nombre, descripcion, precio, duracion, imagen, grupo, calificacion, tipo, activo } = req.body;
      
      if (!nombre || typeof nombre !== 'string' || nombre.trim() === '') {
        return res.status(400).json({ error: 'El campo "nombre" es obligatorio.' });
      }
      if (!precio || isNaN(Number(precio))) {
        return res.status(400).json({ error: 'El campo "precio" es obligatorio y debe ser un número.' });
      }

      const paquete = await Paquete.create({ 
        nombre, 
        descripcion, 
        precio, 
        duracion, 
        imagen,
        grupo,
        calificacion,
        tipo,
        activo: activo !== false
      });
      
      res.status(201).json(paquete);
    } catch (err) {
      res.status(400).json({ error: err.message || 'Error al crear paquete' });
    }
  },

  async actualizar(req, res) {
    try {
      const { id } = req.params;
      const { nombre, descripcion, precio, duracion, imagen, grupo, calificacion, tipo, activo } = req.body;
      
      const [updated] = await Paquete.update(
        { nombre, descripcion, precio, duracion, imagen, grupo, calificacion, tipo, activo, fecha_actualizacion: new Date() }, 
        { where: { id } }
      );
      
      if (updated) {
        const paquete = await Paquete.findByPk(id);
        res.json(paquete);
      } else {
        res.status(404).json({ error: 'Paquete no encontrado' });
      }
    } catch (err) {
      res.status(400).json({ error: 'Error al actualizar paquete' });
    }
  },

  async eliminar(req, res) {
    try {
      const { id } = req.params;
      const deleted = await Paquete.destroy({ where: { id } });
      if (deleted) {
        res.json({ mensaje: 'Paquete eliminado' });
      } else {
        res.status(404).json({ error: 'Paquete no encontrado' });
      }
    } catch (err) {
      res.status(400).json({ error: 'Error al eliminar paquete' });
    }
  },

  async desactivar(req, res) {
    try {
      const { id } = req.params;
      const [updated] = await Paquete.update(
        { activo: false, fecha_actualizacion: new Date() },
        { where: { id } }
      );
      if (updated) {
        const paquete = await Paquete.findByPk(id);
        res.json(paquete);
      } else {
        res.status(404).json({ error: 'Paquete no encontrado' });
      }
    } catch (err) {
      res.status(400).json({ error: 'Error al desactivar paquete' });
    }
  }
};
