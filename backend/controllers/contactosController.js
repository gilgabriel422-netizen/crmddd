const Contacto = require('../models/Contacto');

// Obtener todos los contactos
exports.getAllContactos = async (req, res) => {
  try {
    const contactos = await Contacto.getAll();
    res.json(contactos);
  } catch (error) {
    console.error('Error al obtener contactos:', error);
    res.status(500).json({ error: 'Error al obtener contactos' });
  }
};

// Obtener contactos de un cliente
exports.getContactosByCliente = async (req, res) => {
  try {
    const contactos = await Contacto.getByClienteId(req.params.clienteId);
    res.json(contactos);
  } catch (error) {
    console.error('Error al obtener contactos:', error);
    res.status(500).json({ error: 'Error al obtener contactos' });
  }
};

// Obtener contacto por ID
exports.getContactoById = async (req, res) => {
  try {
    const contacto = await Contacto.getById(req.params.id);
    if (!contacto) {
      return res.status(404).json({ error: 'Contacto no encontrado' });
    }
    res.json(contacto);
  } catch (error) {
    console.error('Error al obtener contacto:', error);
    res.status(500).json({ error: 'Error al obtener contacto' });
  }
};

// Crear nuevo contacto
exports.createContacto = async (req, res) => {
  try {
    const contactoId = await Contacto.create(req.body);
    const nuevoContacto = await Contacto.getById(contactoId);
    res.status(201).json(nuevoContacto);
  } catch (error) {
    console.error('Error al crear contacto:', error);
    res.status(500).json({ error: 'Error al crear contacto' });
  }
};

// Actualizar contacto
exports.updateContacto = async (req, res) => {
  try {
    const affectedRows = await Contacto.update(req.params.id, req.body);
    if (affectedRows === 0) {
      return res.status(404).json({ error: 'Contacto no encontrado' });
    }
    const contactoActualizado = await Contacto.getById(req.params.id);
    res.json(contactoActualizado);
  } catch (error) {
    console.error('Error al actualizar contacto:', error);
    res.status(500).json({ error: 'Error al actualizar contacto' });
  }
};

// Eliminar contacto
exports.deleteContacto = async (req, res) => {
  try {
    const affectedRows = await Contacto.delete(req.params.id);
    if (affectedRows === 0) {
      return res.status(404).json({ error: 'Contacto no encontrado' });
    }
    res.json({ mensaje: 'Contacto eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar contacto:', error);
    res.status(500).json({ error: 'Error al eliminar contacto' });
  }
};
