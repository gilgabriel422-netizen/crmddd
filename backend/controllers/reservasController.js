const Reserva = require('../models/Reserva');
const Cliente = require('../models/Cliente');
const Mensaje = require('../models/Mensaje');
const sequelize = require('../config/database');

exports.getAllReservas = async (req, res) => {
  try {
    // Usar raw query para evitar problemas con FK
    const result = await sequelize.query(`
      SELECT * FROM reservas 
      ORDER BY fecha_creacion DESC
    `, {
      type: sequelize.QueryTypes.SELECT
    });
    
    console.log('✅ Reservas obtenidas:', result.length);
    res.json(result);
  } catch (error) {
    console.error('Error al obtener reservas:', error);
    res.status(500).json({ error: 'Error al obtener reservas', detalle: error.message });
  }
};

exports.getReservaById = async (req, res) => {
  try {
    const reserva = await Reserva.findByPk(req.params.id, {
      include: [{ model: Cliente, attributes: ['id', 'first_name', 'last_name', 'email'] }]
    });
    if (!reserva) {
      return res.status(404).json({ error: 'Reserva no encontrada' });
    }
    res.json(reserva);
  } catch (error) {
    console.error('Error al obtener reserva:', error);
    res.status(500).json({ error: 'Error al obtener reserva' });
  }
};

exports.createReserva = async (req, res) => {
  try {
    const { 
      cliente_id, 
      usuario_id,
      paquete_id,
      fecha_inicio, 
      fecha_fin, 
      cantidad_noches, 
      cantidad_personas, 
      tipo_habitacion,
      estado,
      observaciones 
    } = req.body;

    // Usar usuario_id del token si no viene en el body
    const userIdFromToken = req.user?.id;
    const finalClienteId = cliente_id || usuario_id || userIdFromToken;

    if (!finalClienteId) {
      return res.status(400).json({ error: 'usuario_id requerido' });
    }

    console.log('📝 Creando reserva con datos:', {
      cliente_id: finalClienteId,
      paquete_id,
      fecha_inicio,
      fecha_fin,
      cantidad_noches,
      cantidad_personas,
      tipo_habitacion
    });
    
    // Usar raw query para evitar validaciones de FK
    const result = await sequelize.query(`
      INSERT INTO reservas (
        cliente_id, numero_reserva, fecha_entrada, fecha_salida, 
        noches, personas, estado, observaciones, tipo_habitacion, paquete_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `, {
      bind: [
        finalClienteId,
        `RES-${Date.now()}`,
        fecha_inicio,
        fecha_fin,
        cantidad_noches,
        cantidad_personas,
        estado || 'pendiente',
        observaciones,
        tipo_habitacion,
        paquete_id
      ],
      type: sequelize.QueryTypes.SELECT
    });

    console.log('✅ Reserva creada:', result);

    const reservaCreada = result[0] || result;
    const numeroReserva = reservaCreada?.numero_reserva || `RES-${Date.now()}`;
    // Crear mensaje en bandeja para que llegue a atención al cliente
    try {
      await Mensaje.create({
        asunto: `Nueva reserva ${numeroReserva}`,
        contenido: `Reserva creada: ${numeroReserva}\nCliente ID: ${finalClienteId}\nEntrada: ${fecha_inicio || reservaCreada?.fecha_entrada || 'N/A'}\nSalida: ${fecha_fin || reservaCreada?.fecha_salida || 'N/A'}\nNoches: ${cantidad_noches || reservaCreada?.noches || 'N/A'}\nPersonas: ${cantidad_personas || reservaCreada?.personas || 'N/A'}${observaciones ? '\nObservaciones: ' + observaciones : ''}`,
        usuario_id: finalClienteId,
        tipo_remitente: 'cliente',
        estado: 'pendiente'
      });
    } catch (errMsg) {
      console.warn('No se pudo crear mensaje de reserva en bandeja:', errMsg.message);
    }
    
    res.status(201).json(reservaCreada);
  } catch (error) {
    console.error('❌ Error al crear reserva:', error);
    res.status(500).json({ error: 'Error al crear reserva', detalle: error.message });
  }
};

exports.updateReserva = async (req, res) => {
  try {
    const { id } = req.params;
    const { fecha_entrada, fecha_salida, noches, personas, ciudad, valor_total, estado, observaciones } = req.body;

    const reserva = await Reserva.findByPk(id);
    if (!reserva) {
      return res.status(404).json({ error: 'Reserva no encontrada' });
    }

    await reserva.update({
      fecha_entrada,
      fecha_salida,
      noches,
      personas,
      ciudad,
      valor_total,
      estado,
      observaciones
    });

    res.json(reserva);
  } catch (error) {
    console.error('Error al actualizar reserva:', error);
    res.status(500).json({ error: 'Error al actualizar reserva' });
  }
};

exports.deleteReserva = async (req, res) => {
  try {
    const reserva = await Reserva.findByPk(req.params.id);
    if (!reserva) {
      return res.status(404).json({ error: 'Reserva no encontrada' });
    }

    await reserva.destroy();
    res.json({ message: 'Reserva eliminada' });
  } catch (error) {
    console.error('Error al eliminar reserva:', error);
    res.status(500).json({ error: 'Error al eliminar reserva' });
  }
};

exports.searchReservasByContrato = async (req, res) => {
  try {
    const { ultimos_4_digitos } = req.query;
    const reservas = await Reserva.findAll({
      where: {
        numero_reserva: {
          [require('sequelize').Op.like]: `%${ultimos_4_digitos}`
        }
      },
      include: [{ model: Cliente, attributes: ['id', 'first_name', 'last_name'] }]
    });
    res.json(reservas);
  } catch (error) {
    console.error('Error al buscar reservas:', error);
    res.status(500).json({ error: 'Error al buscar reservas' });
  }
};
