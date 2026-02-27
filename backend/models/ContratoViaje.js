const pool = require('../config/pg-pool');

class ContratoViaje {
  static generarNumeroContrato() {
    const fecha = new Date();
    const year = fecha.getFullYear().toString().slice(-2);
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `CT${year}${month}-${random}`;
  }

  static async getAll() {
    try {
      const result = await pool.query(`
        SELECT cv.*, 
               c.first_name, c.last_name, c.email,
               ap.estado as estado_pago
        FROM contratos_viajes cv
        LEFT JOIN clientes c ON cv.cliente_id = c.id
        LEFT JOIN autorizaciones_pago ap ON cv.autorizacion_pago_id = ap.id
        ORDER BY cv.fecha_creacion DESC
      `);
      return result.rows;
    } catch (error) {
      console.error('Error en getAll:', error);
      throw error;
    }
  }

  static async getById(id) {
    try {
      const result = await pool.query(
        `SELECT cv.*, 
                c.first_name, c.last_name, c.email, c.phone, c.document_number,
                c.ciudad, c.pais, c.direccion,
                ap.monto_numerico, ap.estado as estado_pago, ap.voucher_referencia
         FROM contratos_viajes cv
         LEFT JOIN clientes c ON cv.cliente_id = c.id
         LEFT JOIN autorizaciones_pago ap ON cv.autorizacion_pago_id = ap.id
         WHERE cv.id = $1`,
        [id]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error en getById:', error);
      throw error;
    }
  }

  static async getByClienteId(clienteId) {
    try {
      const result = await pool.query(
        `SELECT cv.*, 
                ap.monto_numerico, ap.estado as estado_pago
         FROM contratos_viajes cv
         LEFT JOIN autorizaciones_pago ap ON cv.autorizacion_pago_id = ap.id
         WHERE cv.cliente_id = $1
         ORDER BY cv.fecha_creacion DESC`,
        [clienteId]
      );
      return result.rows;
    } catch (error) {
      console.error('Error en getByClienteId:', error);
      throw error;
    }
  }

  static async getByNumeroContrato(numeroContrato) {
    try {
      const result = await pool.query(
        `SELECT cv.*, 
                c.first_name, c.last_name, c.email
         FROM contratos_viajes cv
         LEFT JOIN clientes c ON cv.cliente_id = c.id
         WHERE cv.numero_contrato = $1`,
        [numeroContrato]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error en getByNumeroContrato:', error);
      throw error;
    }
  }

  /**
   * Crear nuevo contrato completo
   * ✅ Inserta cliente_id + nuevos campos (pagaré, comercial, snapshot cliente) + datos_completos JSON.
   */
  static async create(contratoData) {
    try {
      console.log('📝 Creando contrato con datos:', contratoData);

      const {
        numero_contrato,
        fecha_contrato,
        valor_contrato,
        creado_por,
        estado = 'pendiente',
        cliente_id,
        datos_completos,

        // nuevos
        valor_pagado = 0,
        saldo_pendiente = 0,
        pagare_numero = null,
        pagare_fecha_vencimiento = null,
        pagare_total = 0,
        pagare_cuotas = 0,
        pagare_valor_cuota = 0,

        vendedor_nombre = null,
        jefe_sala = null,
        codigo_sala = null,

        cliente_email = null,
        cliente_direccion = null,
        cliente_fecha_nacimiento = null,
        cliente_edad = null
      } = contratoData;

      const clienteId = cliente_id ?? contratoData.clienteId;

      if (!clienteId) {
        const err = new Error('cliente_id es requerido');
        err.status = 400;
        throw err;
      }

      const numContrato = numero_contrato || this.generarNumeroContrato();

      const query = `
        INSERT INTO contratos_viajes (
          numero_contrato, 
          fecha_contrato, 
          valor_contrato, 
          creado_por, 
          estado,
          cliente_id,
          datos_completos,

          valor_pagado,
          saldo_pendiente,
          pagare_numero,
          pagare_fecha_vencimiento,
          pagare_total,
          pagare_cuotas,
          pagare_valor_cuota,

          vendedor_nombre,
          jefe_sala,
          codigo_sala,

          cliente_email,
          cliente_direccion,
          cliente_fecha_nacimiento,
          cliente_edad
        ) VALUES (
          $1,$2,$3,$4,$5,$6,$7,
          $8,$9,$10,$11,$12,$13,$14,
          $15,$16,$17,
          $18,$19,$20,$21
        )
        RETURNING *
      `;

      const result = await pool.query(query, [
        numContrato,
        fecha_contrato || new Date(),
        valor_contrato || 0,
        creado_por || 'sistema',
        estado,
        clienteId,
        datos_completos ? JSON.stringify(datos_completos) : null,

        Number(valor_pagado) || 0,
        Number(saldo_pendiente) || 0,
        pagare_numero,
        pagare_fecha_vencimiento,
        Number(pagare_total) || 0,
        Number(pagare_cuotas) || 0,
        Number(pagare_valor_cuota) || 0,

        vendedor_nombre,
        jefe_sala,
        codigo_sala,

        cliente_email,
        cliente_direccion,
        cliente_fecha_nacimiento,
        cliente_edad
      ]);

      console.log('✅ Contrato creado exitosamente:', result.rows[0]);
      return result.rows[0];
    } catch (error) {
      console.error('❌ Error en create:', error.message);
      throw error;
    }
  }

  static async update(id, contratoData) {
    const {
      valor_contrato,
      anos_contrato,
      tarjeta_y_banco,
      numero_noches,

      pagare_numero,
      pagare_fecha_vencimiento,

      // nuevos
      valor_pagado,
      saldo_pendiente,
      pagare_total,
      pagare_cuotas,
      pagare_valor_cuota,

      vendedor_nombre,
      jefe_sala,
      codigo_sala,

      cliente_email,
      cliente_direccion,
      cliente_fecha_nacimiento,
      cliente_edad,

      estadia_internacional,
      estadia_nacional,
      cortesias_por_asistencia,
      ofrecimientos_adicionales,
      aceptacion_cliente,
      datos_completos,
      estado,
      metadata
    } = contratoData;

    try {
      const result = await pool.query(
        `UPDATE contratos_viajes 
         SET valor_contrato = COALESCE($1, valor_contrato),
             anos_contrato = COALESCE($2, anos_contrato),
             tarjeta_y_banco = COALESCE($3, tarjeta_y_banco),
             numero_noches = COALESCE($4, numero_noches),

             pagare_numero = COALESCE($5, pagare_numero),
             pagare_fecha_vencimiento = COALESCE($6, pagare_fecha_vencimiento),

             valor_pagado = COALESCE($7, valor_pagado),
             saldo_pendiente = COALESCE($8, saldo_pendiente),
             pagare_total = COALESCE($9, pagare_total),
             pagare_cuotas = COALESCE($10, pagare_cuotas),
             pagare_valor_cuota = COALESCE($11, pagare_valor_cuota),

             vendedor_nombre = COALESCE($12, vendedor_nombre),
             jefe_sala = COALESCE($13, jefe_sala),
             codigo_sala = COALESCE($14, codigo_sala),

             cliente_email = COALESCE($15, cliente_email),
             cliente_direccion = COALESCE($16, cliente_direccion),
             cliente_fecha_nacimiento = COALESCE($17, cliente_fecha_nacimiento),
             cliente_edad = COALESCE($18, cliente_edad),

             estadia_internacional = COALESCE($19, estadia_internacional),
             estadia_nacional = COALESCE($20, estadia_nacional),
             cortesias_por_asistencia = COALESCE($21, cortesias_por_asistencia),
             ofrecimientos_adicionales = COALESCE($22, ofrecimientos_adicionales),
             aceptacion_cliente = COALESCE($23, aceptacion_cliente),
             datos_completos = COALESCE($24, datos_completos),
             estado = COALESCE($25, estado),
             metadata = COALESCE($26, metadata)
         WHERE id = $27
         RETURNING *`,
        [
          valor_contrato,
          anos_contrato,
          tarjeta_y_banco,
          numero_noches,

          pagare_numero,
          pagare_fecha_vencimiento,

          valor_pagado,
          saldo_pendiente,
          pagare_total,
          pagare_cuotas,
          pagare_valor_cuota,

          vendedor_nombre,
          jefe_sala,
          codigo_sala,

          cliente_email,
          cliente_direccion,
          cliente_fecha_nacimiento,
          cliente_edad,

          estadia_internacional ? JSON.stringify(estadia_internacional) : null,
          estadia_nacional ? JSON.stringify(estadia_nacional) : null,
          cortesias_por_asistencia,
          ofrecimientos_adicionales,
          aceptacion_cliente ? JSON.stringify(aceptacion_cliente) : null,
          datos_completos ? JSON.stringify(datos_completos) : null,
          estado,
          metadata ? JSON.stringify(metadata) : null,
          id
        ]
      );

      return result.rows[0];
    } catch (error) {
      console.error('Error en update:', error);
      throw error;
    }
  }

  static async firmar(id, datosAceptacion) {
    const { firma, nombre, fecha } = datosAceptacion;

    try {
      const aceptacion = {
        firma,
        nombre,
        fecha: fecha || new Date().toISOString()
      };

      const result = await pool.query(
        `UPDATE contratos_viajes 
         SET aceptacion_cliente = $1,
             estado = 'firmado'
         WHERE id = $2 
         RETURNING *`,
        [JSON.stringify(aceptacion), id]
      );

      return result.rows[0];
    } catch (error) {
      console.error('Error en firmar:', error);
      throw error;
    }
  }

  static async activar(id) {
    try {
      const result = await pool.query(
        `UPDATE contratos_viajes 
         SET estado = 'activo'
         WHERE id = $1 
         RETURNING *`,
        [id]
      );

      return result.rows[0];
    } catch (error) {
      console.error('Error en activar:', error);
      throw error;
    }
  }

  static async cancelar(id, motivo) {
    try {
      const result = await pool.query(
        `UPDATE contratos_viajes 
         SET estado = 'cancelado',
             metadata = jsonb_set(COALESCE(metadata, '{}'::jsonb), '{motivo_cancelacion}', $1)
         WHERE id = $2 
         RETURNING *`,
        [JSON.stringify(motivo), id]
      );

      return result.rows[0];
    } catch (error) {
      console.error('Error en cancelar:', error);
      throw error;
    }
  }

  static async delete(id) {
    try {
      const result = await pool.query(
        'DELETE FROM contratos_viajes WHERE id = $1 RETURNING *',
        [id]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error en delete:', error);
      throw error;
    }
  }

  static async getByEstado(estado) {
    try {
      const result = await pool.query(
        `SELECT cv.*, 
                c.first_name, c.last_name, c.email
         FROM contratos_viajes cv
         LEFT JOIN clientes c ON cv.cliente_id = c.id
         WHERE cv.estado = $1
         ORDER BY cv.fecha_creacion DESC`,
        [estado]
      );
      return result.rows;
    } catch (error) {
      console.error('Error en getByEstado:', error);
      throw error;
    }
  }

  static async getEstadisticas() {
    try {
      const result = await pool.query(`
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN estado = 'pendiente' THEN 1 END) as pendientes,
          COUNT(CASE WHEN estado = 'firmado' THEN 1 END) as firmados,
          COUNT(CASE WHEN estado = 'activo' THEN 1 END) as activos,
          COUNT(CASE WHEN estado = 'cancelado' THEN 1 END) as cancelados,
          COUNT(CASE WHEN estado = 'completado' THEN 1 END) as completados,
          SUM(valor_contrato) as valor_total,
          AVG(valor_contrato) as valor_promedio
        FROM contratos_viajes
      `);
      return result.rows[0];
    } catch (error) {
      console.error('Error en getEstadisticas:', error);
      throw error;
    }
  }
}

module.exports = ContratoViaje;