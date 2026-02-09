const pool = require('../config/pg-pool');

class AutorizacionPago {
  /**
   * Obtener todas las autorizaciones de un cliente
   */
  static async getByClienteId(clienteId) {
    try {
      const result = await pool.query(
        `SELECT ap.*, ct.ultimos_digitos, ct.tipo_tarjeta
         FROM autorizaciones_pago ap
         LEFT JOIN clientes_tarjetas ct ON ap.tarjeta_id = ct.id
         WHERE ap.cliente_id = $1 
         ORDER BY ap.fecha_creacion DESC`,
        [clienteId]
      );
      return result.rows;
    } catch (error) {
      console.error('Error en getByClienteId:', error);
      throw error;
    }
  }

  /**
   * Obtener autorización por ID
   */
  static async getById(id) {
    try {
      const result = await pool.query(
        `SELECT ap.*, ct.ultimos_digitos, ct.tipo_tarjeta
         FROM autorizaciones_pago ap
         LEFT JOIN clientes_tarjetas ct ON ap.tarjeta_id = ct.id
         WHERE ap.id = $1`,
        [id]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error en getById:', error);
      throw error;
    }
  }

  /**
   * Crear nueva autorización de pago
   */
  static async create(autorizacionData) {
    const {
      cliente_id,
      tarjeta_id,
      empresa_razon_social = 'PACIFIC ADVENTURE PACITURE S.A.S',
      empresa_nombre_comercial = 'INNOVATION BUSINESS',
      empresa_ruc = '1793230574001',
      monto_numerico,
      monto_letras,
      moneda = 'USD',
      motivo = 'Prestación de servicios turísticos nacionales e internacionales',
      descripcion,
      voucher_lote,
      voucher_referencia,
      voucher_aprobacion,
      voucher_modalidad = 'venta',
      estado = 'pendiente',
      fecha_autorizacion,
      metadata = {}
    } = autorizacionData;

    try {
      const result = await pool.query(
        `INSERT INTO autorizaciones_pago (
          cliente_id, tarjeta_id, empresa_razon_social, empresa_nombre_comercial,
          empresa_ruc, monto_numerico, monto_letras, moneda, motivo, descripcion,
          voucher_lote, voucher_referencia, voucher_aprobacion, voucher_modalidad,
          estado, fecha_autorizacion, metadata
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17) 
        RETURNING *`,
        [
          cliente_id, tarjeta_id, empresa_razon_social, empresa_nombre_comercial,
          empresa_ruc, monto_numerico, monto_letras, moneda, motivo, descripcion,
          voucher_lote, voucher_referencia, voucher_aprobacion, voucher_modalidad,
          estado, fecha_autorizacion || new Date(), JSON.stringify(metadata)
        ]
      );

      return result.rows[0];
    } catch (error) {
      console.error('Error en create:', error);
      throw error;
    }
  }

  /**
   * Actualizar autorización
   */
  static async update(id, autorizacionData) {
    const {
      voucher_lote,
      voucher_referencia,
      voucher_aprobacion,
      voucher_modalidad,
      estado,
      fecha_autorizacion,
      metadata
    } = autorizacionData;

    try {
      const result = await pool.query(
        `UPDATE autorizaciones_pago 
         SET voucher_lote = COALESCE($1, voucher_lote),
             voucher_referencia = COALESCE($2, voucher_referencia),
             voucher_aprobacion = COALESCE($3, voucher_aprobacion),
             voucher_modalidad = COALESCE($4, voucher_modalidad),
             estado = COALESCE($5, estado),
             fecha_autorizacion = COALESCE($6, fecha_autorizacion),
             metadata = COALESCE($7, metadata)
         WHERE id = $8 
         RETURNING *`,
        [
          voucher_lote,
          voucher_referencia,
          voucher_aprobacion,
          voucher_modalidad,
          estado,
          fecha_autorizacion,
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

  /**
   * Aprobar autorización
   */
  static async aprobar(id, datosAprobacion = {}) {
    const {
      voucher_referencia,
      voucher_aprobacion,
      voucher_lote
    } = datosAprobacion;

    try {
      const result = await pool.query(
        `UPDATE autorizaciones_pago 
         SET estado = 'aprobada',
             fecha_autorizacion = CURRENT_TIMESTAMP,
             voucher_referencia = COALESCE($1, voucher_referencia),
             voucher_aprobacion = COALESCE($2, voucher_aprobacion),
             voucher_lote = COALESCE($3, voucher_lote)
         WHERE id = $4 
         RETURNING *`,
        [voucher_referencia, voucher_aprobacion, voucher_lote, id]
      );

      return result.rows[0];
    } catch (error) {
      console.error('Error en aprobar:', error);
      throw error;
    }
  }

  /**
   * Rechazar autorización
   */
  static async rechazar(id, motivo) {
    try {
      const result = await pool.query(
        `UPDATE autorizaciones_pago 
         SET estado = 'rechazada',
             metadata = jsonb_set(COALESCE(metadata, '{}'::jsonb), '{motivo_rechazo}', $1)
         WHERE id = $2 
         RETURNING *`,
        [JSON.stringify(motivo), id]
      );

      return result.rows[0];
    } catch (error) {
      console.error('Error en rechazar:', error);
      throw error;
    }
  }

  /**
   * Cancelar autorización
   */
  static async cancelar(id) {
    try {
      const result = await pool.query(
        `UPDATE autorizaciones_pago 
         SET estado = 'cancelada'
         WHERE id = $1 
         RETURNING *`,
        [id]
      );

      return result.rows[0];
    } catch (error) {
      console.error('Error en cancelar:', error);
      throw error;
    }
  }

  /**
   * Eliminar autorización
   */
  static async delete(id) {
    try {
      const result = await pool.query(
        'DELETE FROM autorizaciones_pago WHERE id = $1 RETURNING *',
        [id]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error en delete:', error);
      throw error;
    }
  }

  /**
   * Obtener autorizaciones aprobadas de un cliente
   */
  static async getAprobadas(clienteId) {
    try {
      const result = await pool.query(
        `SELECT * FROM autorizaciones_pago 
         WHERE cliente_id = $1 AND estado = 'aprobada'
         ORDER BY fecha_autorizacion DESC`,
        [clienteId]
      );
      return result.rows;
    } catch (error) {
      console.error('Error en getAprobadas:', error);
      throw error;
    }
  }

  /**
   * Buscar por referencia de voucher
   */
  static async getByReferencia(referencia) {
    try {
      const result = await pool.query(
        'SELECT * FROM autorizaciones_pago WHERE voucher_referencia = $1',
        [referencia]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error en getByReferencia:', error);
      throw error;
    }
  }
}

module.exports = AutorizacionPago;
