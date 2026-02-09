const express = require('express');
const router = express.Router();
const Mensaje = require('../models/Mensaje');

// GET todos los mensajes (para la bandeja de soporte)
router.get('/', async (req, res) => {
  try {
    const mensajes = await Mensaje.findAll({
      order: [['fecha_creacion', 'DESC']]
    });
    res.json(mensajes);
  } catch (error) {
    console.error('Error obteniendo mensajes:', error);
    res.status(500).json({ error: 'Error obteniendo mensajes' });
  }
});

// POST crear un nuevo mensaje
router.post('/', async (req, res) => {
  try {
    console.log('📨 POST /api/mensajes recibida');
    console.log('📦 Body completo:', req.body);
    const { asunto, contenido, usuario_id, tipo_remitente, estado } = req.body;

    console.log('📌 Asunto:', asunto, 'Tipo:', typeof asunto);
    console.log('📌 Contenido:', contenido?.substring(0, 50), 'Tipo:', typeof contenido);
    console.log('📌 Usuario ID:', usuario_id, 'Tipo:', typeof usuario_id);
    console.log('📌 Tipo remitente:', tipo_remitente);
    console.log('📌 Estado:', estado);

    // Validación
    if (!asunto || !contenido || !usuario_id) {
      console.log('❌ Validación fallida');
      return res.status(400).json({ error: 'Faltan campos: asunto, contenido, usuario_id' });
    }

    console.log('✅ Validación exitosa, creando mensaje...');
    const mensaje = await Mensaje.create({
      asunto,
      contenido,
      usuario_id,
      tipo_remitente: tipo_remitente || 'cliente',
      estado: estado || 'pendiente',
      fecha_creacion: new Date()
    });

    console.log('✅ Mensaje creado exitosamente:', mensaje.id);
    res.status(201).json(mensaje);
  } catch (error) {
    console.error('Error creando mensaje:', error);
    console.error('Stack:', error.stack);
    res.status(500).json({ error: 'Error creando mensaje', detalle: error.message });
  }
});

// PUT actualizar un mensaje (para responder)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { respuesta, estado, fecha_respuesta } = req.body;

    const mensaje = await Mensaje.findByPk(id);
    if (!mensaje) {
      return res.status(404).json({ error: 'Mensaje no encontrado' });
    }

    // Actualizar campos si se envían
    if (respuesta !== undefined) {
      mensaje.respuesta = respuesta;
    }
    if (estado !== undefined) {
      mensaje.estado = estado;
    }
    if (fecha_respuesta !== undefined) {
      mensaje.fecha_respuesta = fecha_respuesta;
    }

    await mensaje.save();
    res.json(mensaje);
  } catch (error) {
    console.error('Error actualizando mensaje:', error);
    res.status(500).json({ error: 'Error actualizando mensaje' });
  }
});

// DELETE eliminar un mensaje
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const mensaje = await Mensaje.findByPk(id);
    if (!mensaje) {
      return res.status(404).json({ error: 'Mensaje no encontrado' });
    }

    await mensaje.destroy();
    res.json({ message: 'Mensaje eliminado correctamente' });
  } catch (error) {
    console.error('Error eliminando mensaje:', error);
    res.status(500).json({ error: 'Error eliminando mensaje' });
  }
});

module.exports = router;