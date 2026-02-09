const express = require('express');
const router = express.Router();
const db = require('../config/pg-pool');

router.get('/', (req, res) => {
  db.query(
    `SELECT COUNT(*)::int AS total_clients,
            COALESCE(SUM(total_amount), 0) AS total_revenue,
            COUNT(*) FILTER (WHERE payment_status <> 'pagado')::int AS unpaid_clients,
            COUNT(*) FILTER (WHERE payment_status = 'pagado')::int AS paid_clients,
            COUNT(*) FILTER (WHERE fecha_registro >= CURRENT_DATE - INTERVAL '30 days')::int AS new_clients_30_days
     FROM clientes`
  )
    .then((result) => {
      res.json({
        stats: {
          total_clients: result.rows[0]?.total_clients || 0,
          total_revenue: Number(result.rows[0]?.total_revenue || 0),
          unpaid_clients: result.rows[0]?.unpaid_clients || 0,
          new_clients_30_days: result.rows[0]?.new_clients_30_days || 0,
          paid_clients: result.rows[0]?.paid_clients || 0
        }
      });
    })
    .catch((error) => {
      console.error('Error obteniendo estadísticas de clientes:', error);
      res.status(500).json({ error: 'Error al obtener estadísticas de clientes' });
    });
});

module.exports = router;
