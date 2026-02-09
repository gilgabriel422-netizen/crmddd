const db = require('../config/database');

class Actividad {
  // Obtener todas las actividades de un cliente
  static async getByClienteId(clienteId) {
    const result = await db.query(`
      SELECT a.*, u.nombre as usuario_nombre 
      FROM actividades a 
      LEFT JOIN usuarios u ON a.usuario_id = u.id
      WHERE a.cliente_id = $1
      ORDER BY a.fecha_actividad DESC
    `, [clienteId]);
    return result.rows;
  }

  // Obtener actividad por ID
  static async getById(id) {
    const result = await db.query(`
      SELECT a.*, u.nombre as usuario_nombre 
      FROM actividades a 
      LEFT JOIN usuarios u ON a.usuario_id = u.id
      WHERE a.id = $1
    `, [id]);
    return result.rows[0];
  }

  // Obtener todas las actividades
  static async getAll() {
    const result = await db.query(`
      SELECT a.*, u.nombre as usuario_nombre, c.nombre as cliente_nombre 
      FROM actividades a 
      LEFT JOIN usuarios u ON a.usuario_id = u.id
      LEFT JOIN clientes c ON a.cliente_id = c.id
      ORDER BY a.fecha_actividad DESC
      LIMIT 100
    `);
    return result.rows;
  }

  // Crear nueva actividad
  static async create(actividadData) {
    const { cliente_id, contacto_id, usuario_id, tipo, titulo, descripcion, fecha_actividad, completada } = actividadData;
    const result = await db.query(
      `INSERT INTO actividades (cliente_id, contacto_id, usuario_id, tipo, titulo, descripcion, fecha_actividad, completada) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
      [cliente_id, contacto_id || null, usuario_id || null, tipo, titulo, descripcion, fecha_actividad, completada || false]
    );
    return result.rows[0].id;
  }

  // Actualizar actividad
  static async update(id, actividadData) {
    const { tipo, titulo, descripcion, fecha_actividad, completada } = actividadData;
    const result = await db.query(
      `UPDATE actividades 
       SET tipo = $1, titulo = $2, descripcion = $3, fecha_actividad = $4, completada = $5
       WHERE id = $6`,
      [tipo, titulo, descripcion, fecha_actividad, completada, id]
    );
    return result.rowCount;
  }

  // Eliminar actividad
  static async delete(id) {
    const result = await db.query('DELETE FROM actividades WHERE id = $1', [id]);
    return result.rowCount;
  }

  // Marcar actividad como completada
  static async marcarCompletada(id) {
    const result = await db.query('UPDATE actividades SET completada = TRUE WHERE id = $1', [id]);
    return result.rowCount;
  }
}

module.exports = Actividad;
