const db = require('../config/pg-pool');

class Notificacion {
  static async crear({ usuario_id, mensaje, tipo = 'info', leida = false }) {
    const result = await db.query(
      `INSERT INTO notificaciones (usuario_id, mensaje, tipo, leida, fecha_creacion)
       VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
       RETURNING *`,
      [usuario_id, mensaje, tipo, leida]
    );
    return result.rows[0];
  }

  static async obtenerPorUsuario(usuario_id) {
    const result = await db.query(
      `SELECT * FROM notificaciones WHERE usuario_id = $1 ORDER BY fecha_creacion DESC`,
      [usuario_id]
    );
    return result.rows;
  }

  static async marcarComoLeida(id) {
    await db.query(
      `UPDATE notificaciones SET leida = true WHERE id = $1`,
      [id]
    );
  }
}

module.exports = Notificacion;