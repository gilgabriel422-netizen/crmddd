const pool = require('../config/pg-pool');

module.exports = {
  // Obtener beneficios de un cliente
  async getBeneficiosPorCliente(req, res) {
    try {
      const { cliente_id } = req.params;

      const result = await pool.query(
        `SELECT id, cliente_id, tipo, nombre, descripcion, valor, saldo_disponible, 
                fecha_vencimiento, activo, fecha_creacion
         FROM beneficios 
         WHERE cliente_id = $1 AND activo = true
         ORDER BY fecha_creacion DESC`,
        [cliente_id]
      );

      res.json({
        beneficios: result.rows,
        total: result.rows.length
      });
    } catch (error) {
      console.error('Error al obtener beneficios:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Crear nuevo beneficio para cliente
  async crearBeneficio(req, res) {
    try {
      const { cliente_id, tipo, nombre, descripcion, valor, fecha_vencimiento } = req.body;

      if (!cliente_id || !tipo || !nombre || !valor) {
        return res.status(400).json({
          error: 'cliente_id, tipo, nombre y valor son requeridos'
        });
      }

      const result = await pool.query(
        `INSERT INTO beneficios (cliente_id, tipo, nombre, descripcion, valor, saldo_disponible, fecha_vencimiento, activo)
         VALUES ($1, $2, $3, $4, $5, $6, $7, true)
         RETURNING *`,
        [cliente_id, tipo, nombre, descripcion, valor, valor, fecha_vencimiento || null]
      );

      res.status(201).json({
        mensaje: 'Beneficio creado exitosamente',
        beneficio: result.rows[0]
      });
    } catch (error) {
      console.error('Error al crear beneficio:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Consumir beneficio
  async consumirBeneficio(req, res) {
    try {
      const { beneficio_id, cliente_id, monto_consumido, descripcion, referencia } = req.body;

      // Validar datos
      if (!beneficio_id || !cliente_id || !monto_consumido) {
        return res.status(400).json({
          error: 'beneficio_id, cliente_id y monto_consumido son requeridos'
        });
      }

      // Verificar que el beneficio existe y pertenece al cliente
      const beneficioResult = await pool.query(
        `SELECT id, saldo_disponible, fecha_vencimiento FROM beneficios 
         WHERE id = $1 AND cliente_id = $2 AND activo = true`,
        [beneficio_id, cliente_id]
      );

      if (beneficioResult.rows.length === 0) {
        return res.status(404).json({
          error: 'Beneficio no encontrado o no activo'
        });
      }

      const beneficio = beneficioResult.rows[0];

      // Verificar saldo disponible
      if (parseFloat(beneficio.saldo_disponible) < parseFloat(monto_consumido)) {
        return res.status(400).json({
          error: 'Saldo insuficiente. Disponible: ' + beneficio.saldo_disponible
        });
      }

      // Verificar vencimiento
      if (beneficio.fecha_vencimiento && new Date(beneficio.fecha_vencimiento) < new Date()) {
        return res.status(400).json({
          error: 'Beneficio vencido'
        });
      }

      // Registrar consumo
      const consumoResult = await pool.query(
        `INSERT INTO consumo_beneficios (beneficio_id, cliente_id, monto_consumido, descripcion, referencia, estado)
         VALUES ($1, $2, $3, $4, $5, 'pendiente')
         RETURNING *`,
        [beneficio_id, cliente_id, monto_consumido, descripcion || null, referencia || null]
      );

      // Actualizar saldo disponible
      const nuevoSaldo = parseFloat(beneficio.saldo_disponible) - parseFloat(monto_consumido);
      
      await pool.query(
        `UPDATE beneficios 
         SET saldo_disponible = $1, fecha_actualizacion = NOW()
         WHERE id = $2`,
        [nuevoSaldo, beneficio_id]
      );

      res.status(201).json({
        mensaje: 'Consumo de beneficio registrado exitosamente',
        consumo: consumoResult.rows[0],
        nuevo_saldo: nuevoSaldo
      });
    } catch (error) {
      console.error('Error al consumir beneficio:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Confirmar consumo de beneficio (por admin/user)
  async confirmarConsumo(req, res) {
    try {
      const { consumo_id } = req.params;
      const { aprobado_por } = req.body;

      const result = await pool.query(
        `UPDATE consumo_beneficios 
         SET estado = 'confirmado', 
             aprobado_por = $1, 
             fecha_confirmacion = NOW()
         WHERE id = $2
         RETURNING *`,
        [aprobado_por || null, consumo_id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Consumo no encontrado' });
      }

      res.json({
        mensaje: 'Consumo confirmado exitosamente',
        consumo: result.rows[0]
      });
    } catch (error) {
      console.error('Error al confirmar consumo:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Rechazar consumo de beneficio
  async rechazarConsumo(req, res) {
    try {
      const { consumo_id } = req.params;

      // Obtener el consumo para reversar el saldo
      const consumoResult = await pool.query(
        `SELECT beneficio_id, monto_consumido FROM consumo_beneficios WHERE id = $1`,
        [consumo_id]
      );

      if (consumoResult.rows.length === 0) {
        return res.status(404).json({ error: 'Consumo no encontrado' });
      }

      const { beneficio_id, monto_consumido } = consumoResult.rows[0];

      // Revertir saldo
      await pool.query(
        `UPDATE beneficios 
         SET saldo_disponible = saldo_disponible + $1
         WHERE id = $2`,
        [monto_consumido, beneficio_id]
      );

      // Marcar como rechazado
      const result = await pool.query(
        `UPDATE consumo_beneficios 
         SET estado = 'rechazado'
         WHERE id = $1
         RETURNING *`,
        [consumo_id]
      );

      res.json({
        mensaje: 'Consumo rechazado y saldo revertido',
        consumo: result.rows[0]
      });
    } catch (error) {
      console.error('Error al rechazar consumo:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Obtener historial de consumos por cliente
  async getHistorialConsumo(req, res) {
    try {
      const { cliente_id } = req.params;

      const result = await pool.query(
        `SELECT cb.id, cb.beneficio_id, b.nombre as beneficio_nombre, 
                cb.monto_consumido, cb.descripcion, cb.referencia, 
                cb.estado, cb.fecha_creacion, cb.fecha_confirmacion
         FROM consumo_beneficios cb
         JOIN beneficios b ON cb.beneficio_id = b.id
         WHERE cb.cliente_id = $1
         ORDER BY cb.fecha_creacion DESC`,
        [cliente_id]
      );

      res.json({
        historial: result.rows,
        total: result.rows.length
      });
    } catch (error) {
      console.error('Error al obtener historial:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Obtener consumos pendientes de aprobación
  async getConsumosPendientes(req, res) {
    try {
      const result = await pool.query(
        `SELECT cb.id, cb.cliente_id, c.first_name, c.last_name, c.email,
                cb.beneficio_id, b.nombre as beneficio_nombre,
                cb.monto_consumido, cb.descripcion, cb.referencia,
                cb.fecha_creacion
         FROM consumo_beneficios cb
         JOIN clientes c ON cb.cliente_id = c.id
         JOIN beneficios b ON cb.beneficio_id = b.id
         WHERE cb.estado = 'pendiente'
         ORDER BY cb.fecha_creacion ASC`
      );

      res.json({
        pendientes: result.rows,
        total: result.rows.length
      });
    } catch (error) {
      console.error('Error al obtener consumos pendientes:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Actualizar saldo de beneficio
  async actualizarSaldo(req, res) {
    try {
      const { beneficio_id } = req.params;
      const { saldo_disponible } = req.body;

      if (saldo_disponible === undefined) {
        return res.status(400).json({ error: 'saldo_disponible es requerido' });
      }

      const result = await pool.query(
        `UPDATE beneficios 
         SET saldo_disponible = $1, fecha_actualizacion = NOW()
         WHERE id = $2
         RETURNING *`,
        [saldo_disponible, beneficio_id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Beneficio no encontrado' });
      }

      res.json({
        mensaje: 'Saldo actualizado exitosamente',
        beneficio: result.rows[0]
      });
    } catch (error) {
      console.error('Error al actualizar saldo:', error);
      res.status(500).json({ error: error.message });
    }
  }
};
