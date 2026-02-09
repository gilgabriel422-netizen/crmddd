const express = require('express');
const router = express.Router();
const db = require('../config/pg-pool');

// Utilidades para rangos de fechas
const toDateString = (date) => date.toISOString().split('T')[0];

const getDateRange = (period = 'month') => {
  const now = new Date();
  let startDate;
  let endDate;

  switch (period) {
    case 'today':
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
      break;
    case 'yesterday':
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 23, 59, 59);
      break;
    case '13days':
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 13);
      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
      break;
    case 'last_month':
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
      break;
    case 'this_month':
    case 'month':
    default:
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      break;
  }

  return {
    startDate: toDateString(startDate),
    endDate: toDateString(endDate)
  };
};

const normalizeNumber = (value) => (value === null || value === undefined ? 0 : Number(value));

router.get('/dashboard', (req, res) => {
  const period = req.query.period || 'month';
  const { startDate, endDate } = getDateRange(period);

  Promise.all([
    db.query(
      `SELECT COUNT(*)::int AS total_clientes,
              COALESCE(SUM(total_amount), 0) AS total_ventas
       FROM clientes
       WHERE fecha_registro BETWEEN $1 AND $2`,
      [startDate, endDate]
    ),
    db.query(
      `SELECT COUNT(*)::int AS total_cobranzas
       FROM clientes
       WHERE fecha_registro BETWEEN $1 AND $2
         AND payment_status <> 'pagado'`,
      [startDate, endDate]
    ),
    db.query(
      `SELECT COUNT(*)::int AS total_requerimientos
       FROM actividades
       WHERE fecha_actividad::date BETWEEN $1 AND $2`,
      [startDate, endDate]
    )
  ])
    .then(([clientsRes, collectionsRes, requirementsRes]) => {
      const metrics = {
        total_clientes: clientsRes.rows[0]?.total_clientes || 0,
        total_reservas: 0,
        total_requerimientos: requirementsRes.rows[0]?.total_requerimientos || 0,
        total_cobranzas: collectionsRes.rows[0]?.total_cobranzas || 0,
        total_ventas: normalizeNumber(clientsRes.rows[0]?.total_ventas),
        total_reservas_monto: 0,
        reservas_activas: 0,
        reservas_canceladas: 0
      };

      const today = new Date();
      const trendStart = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 6);
      const trendEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
      const trendStartStr = toDateString(trendStart);
      const trendEndStr = toDateString(trendEnd);

      Promise.all([
        db.query(
          `SELECT fecha_registro::date AS fecha, COUNT(*)::int AS nuevos_clientes
           FROM clientes
           WHERE fecha_registro BETWEEN $1 AND $2
           GROUP BY fecha
           ORDER BY fecha`,
          [trendStartStr, trendEndStr]
        ),
        db.query(
          `SELECT fecha_actividad::date AS fecha, COUNT(*)::int AS nuevos_requerimientos
           FROM actividades
           WHERE fecha_actividad::date BETWEEN $1 AND $2
           GROUP BY fecha
           ORDER BY fecha`,
          [trendStartStr, trendEndStr]
        )
      ]).then(([clientsTrendRes, requirementsTrendRes]) => {
        const formatKey = (value) => (value instanceof Date ? toDateString(value) : value);

        const clientsByDate = new Map(
          clientsTrendRes.rows.map((row) => [formatKey(row.fecha), row.nuevos_clientes])
        );
        const requirementsByDate = new Map(
          requirementsTrendRes.rows.map((row) => [formatKey(row.fecha), row.nuevos_requerimientos])
        );

        const trends = [];
        for (let i = 0; i < 7; i += 1) {
          const current = new Date(trendStart.getFullYear(), trendStart.getMonth(), trendStart.getDate() + i);
          const key = toDateString(current);
          trends.push({
            fecha: key,
            nuevos_clientes: clientsByDate.get(key) || 0,
            nuevas_reservas: 0,
            nuevos_requerimientos: requirementsByDate.get(key) || 0
          });
        }

        res.json({
          period,
          dateRange: { startDate, endDate },
          metrics,
          trends
        });
      }).catch((error) => {
        console.error('Error obteniendo tendencias del dashboard:', error);
        res.status(500).json({ error: 'Error al obtener tendencias del dashboard' });
      });
    })
    .catch((error) => {
      console.error('Error obteniendo reporte dashboard:', error);
      res.status(500).json({ error: 'Error al obtener reporte dashboard' });
    });
});

router.get('/last-month-summary', (req, res) => {
  const period = req.query.period || 'this_month';
  const { startDate, endDate } = getDateRange(period);

  Promise.all([
    db.query(
      `SELECT COUNT(*)::int AS total_ventas,
              COALESCE(SUM(total_amount), 0) AS total_monto,
              SUM(CASE WHEN payment_status = 'pagado' THEN 1 ELSE 0 END)::int AS ventas_pagadas,
              COALESCE(SUM(CASE WHEN payment_status = 'pagado' THEN total_amount ELSE 0 END), 0) AS monto_pagado
       FROM clientes
       WHERE fecha_registro BETWEEN $1 AND $2`,
      [startDate, endDate]
    ),
    db.query(
      `SELECT COUNT(*) FILTER (WHERE payment_status <> 'pagado')::int AS total_cobranzas,
              COALESCE(SUM(CASE WHEN payment_status <> 'pagado' THEN total_amount ELSE 0 END), 0) AS total_monto,
              SUM(CASE WHEN payment_status = 'pagado' THEN 1 ELSE 0 END)::int AS cobranzas_pagadas,
              COALESCE(SUM(CASE WHEN payment_status = 'pagado' THEN total_amount ELSE 0 END), 0) AS monto_pagado
       FROM clientes
       WHERE fecha_registro BETWEEN $1 AND $2`,
      [startDate, endDate]
    ),
    db.query(
      `SELECT COUNT(*)::int AS total_requerimientos,
              SUM(CASE WHEN completada THEN 1 ELSE 0 END)::int AS completados,
              SUM(CASE WHEN completada THEN 0 ELSE 1 END)::int AS pendientes
       FROM actividades
       WHERE fecha_actividad::date BETWEEN $1 AND $2`,
      [startDate, endDate]
    )
  ])
    .then(([salesRes, collectionsRes, requirementsRes]) => {
      res.json({
        sales: {
          total_ventas: salesRes.rows[0]?.total_ventas || 0,
          total_monto: normalizeNumber(salesRes.rows[0]?.total_monto),
          ventas_pagadas: salesRes.rows[0]?.ventas_pagadas || 0,
          monto_pagado: normalizeNumber(salesRes.rows[0]?.monto_pagado)
        },
        collections: {
          total_cobranzas: collectionsRes.rows[0]?.total_cobranzas || 0,
          total_monto: normalizeNumber(collectionsRes.rows[0]?.total_monto),
          cobranzas_pagadas: collectionsRes.rows[0]?.cobranzas_pagadas || 0,
          monto_pagado: normalizeNumber(collectionsRes.rows[0]?.monto_pagado)
        },
        requirements: {
          total_requerimientos: requirementsRes.rows[0]?.total_requerimientos || 0,
          completados: requirementsRes.rows[0]?.completados || 0,
          pendientes: requirementsRes.rows[0]?.pendientes || 0
        },
        bookings: {
          total_reservas: 0,
          total_monto: 0,
          confirmadas: 0,
          canceladas: 0
        }
      });
    })
    .catch((error) => {
      console.error('Error obteniendo sumatorias del período:', error);
      res.status(500).json({ error: 'Error al obtener sumatorias del período' });
    });
});

router.get('/sales', (req, res) => {
  const period = req.query.period || 'month';
  const { startDate, endDate } = getDateRange(period);

  Promise.all([
    db.query(
      `SELECT COUNT(*)::int AS total_sales,
              COALESCE(SUM(total_amount), 0) AS total_amount,
              SUM(CASE WHEN payment_status = 'pagado' THEN 1 ELSE 0 END)::int AS paid_sales
       FROM clientes
       WHERE fecha_registro BETWEEN $1 AND $2`,
      [startDate, endDate]
    ),
    db.query(
      `SELECT id, first_name, last_name, email, contract_number, total_amount, payment_status, fecha_registro
       FROM clientes
       WHERE fecha_registro BETWEEN $1 AND $2
       ORDER BY fecha_registro DESC`,
      [startDate, endDate]
    )
  ])
    .then(([summaryRes, dataRes]) => {
      res.json({
        data: dataRes.rows,
        summary: {
          total_sales: summaryRes.rows[0]?.total_sales || 0,
          total_amount: normalizeNumber(summaryRes.rows[0]?.total_amount),
          paid_sales: summaryRes.rows[0]?.paid_sales || 0,
          period
        }
      });
    })
    .catch((error) => {
      console.error('Error obteniendo reporte de ventas:', error);
      res.status(500).json({ error: 'Error al obtener reporte de ventas' });
    });
});

router.get('/collections', (req, res) => {
  const period = req.query.period || 'month';
  const { startDate, endDate } = getDateRange(period);

  Promise.all([
    db.query(
      `SELECT COUNT(*) FILTER (WHERE payment_status <> 'pagado')::int AS total_collections,
              COALESCE(SUM(CASE WHEN payment_status <> 'pagado' THEN total_amount ELSE 0 END), 0) AS total_amount,
              COALESCE(SUM(CASE WHEN payment_status = 'pagado' THEN total_amount ELSE 0 END), 0) AS collected,
              COALESCE(SUM(CASE WHEN payment_status <> 'pagado' THEN total_amount ELSE 0 END), 0) AS pending
       FROM clientes
       WHERE fecha_registro BETWEEN $1 AND $2`,
      [startDate, endDate]
    ),
    db.query(
      `SELECT id, first_name, last_name, email, contract_number, total_amount, payment_status, fecha_registro
       FROM clientes
       WHERE fecha_registro BETWEEN $1 AND $2
         AND payment_status <> 'pagado'
       ORDER BY fecha_registro DESC`,
      [startDate, endDate]
    )
  ])
    .then(([summaryRes, dataRes]) => {
      res.json({
        data: dataRes.rows,
        summary: {
          total_collections: summaryRes.rows[0]?.total_collections || 0,
          total_amount: normalizeNumber(summaryRes.rows[0]?.total_amount),
          collected: normalizeNumber(summaryRes.rows[0]?.collected),
          pending: normalizeNumber(summaryRes.rows[0]?.pending),
          period
        }
      });
    })
    .catch((error) => {
      console.error('Error obteniendo reporte de cobranzas:', error);
      res.status(500).json({ error: 'Error al obtener reporte de cobranzas' });
    });
});

router.get('/requirements', (req, res) => {
  const period = req.query.period || 'month';
  const { startDate, endDate } = getDateRange(period);

  Promise.all([
    db.query(
      `SELECT COUNT(*)::int AS total_requirements,
              SUM(CASE WHEN completada THEN 1 ELSE 0 END)::int AS completed,
              SUM(CASE WHEN completada THEN 0 ELSE 1 END)::int AS pending
       FROM actividades
       WHERE fecha_actividad::date BETWEEN $1 AND $2`,
      [startDate, endDate]
    ),
    db.query(
      `SELECT a.id, a.cliente_id, a.tipo, a.titulo, a.descripcion, a.fecha_actividad, a.completada,
              c.first_name, c.last_name, c.contract_number
       FROM actividades a
       LEFT JOIN clientes c ON a.cliente_id = c.id
       WHERE a.fecha_actividad::date BETWEEN $1 AND $2
       ORDER BY a.fecha_actividad DESC`,
      [startDate, endDate]
    )
  ])
    .then(([summaryRes, dataRes]) => {
      res.json({
        data: dataRes.rows,
        summary: {
          total_requirements: summaryRes.rows[0]?.total_requirements || 0,
          completed: summaryRes.rows[0]?.completed || 0,
          pending: summaryRes.rows[0]?.pending || 0,
          period
        }
      });
    })
    .catch((error) => {
      console.error('Error obteniendo reporte de requerimientos:', error);
      res.status(500).json({ error: 'Error al obtener reporte de requerimientos' });
    });
});

router.get('/bookings', (req, res) => {
  res.json({
    data: [],
    summary: {
      total_bookings: 0,
      confirmed: 0,
      canceled: 0,
      period: req.query.period || 'month'
    }
  });
});

router.get('/employee-dashboard', (req, res) => {
  const period = req.query.period || 'this_month';
  const { startDate, endDate } = getDateRange(period);

  Promise.all([
    db.query(
      `SELECT COUNT(*)::int AS total_ventas,
              COALESCE(SUM(total_amount), 0) AS total_monto,
              SUM(CASE WHEN payment_status = 'pagado' THEN 1 ELSE 0 END)::int AS ventas_pagadas,
              COALESCE(SUM(CASE WHEN payment_status = 'pagado' THEN total_amount ELSE 0 END), 0) AS monto_pagado
       FROM clientes
       WHERE fecha_registro BETWEEN $1 AND $2`,
      [startDate, endDate]
    ),
    db.query(
      `SELECT COUNT(*)::int AS total_requerimientos,
              SUM(CASE WHEN completada THEN 1 ELSE 0 END)::int AS completados,
              SUM(CASE WHEN completada THEN 0 ELSE 1 END)::int AS pendientes
       FROM actividades
       WHERE fecha_actividad::date BETWEEN $1 AND $2`,
      [startDate, endDate]
    )
  ])
    .then(([salesRes, requirementsRes]) => {
      res.json({
        data: {
          periodSummary: {
            sales: {
              total_ventas: salesRes.rows[0]?.total_ventas || 0,
              total_monto: normalizeNumber(salesRes.rows[0]?.total_monto),
              ventas_pagadas: salesRes.rows[0]?.ventas_pagadas || 0,
              monto_pagado: normalizeNumber(salesRes.rows[0]?.monto_pagado)
            },
            bookings: { total_reservas: 0, total_monto: 0, confirmadas: 0, canceladas: 0 },
            requirements: {
              total_requerimientos: requirementsRes.rows[0]?.total_requerimientos || 0,
              completados: requirementsRes.rows[0]?.completados || 0,
              pendientes: requirementsRes.rows[0]?.pendientes || 0
            }
          }
        }
      });
    })
    .catch((error) => {
      console.error('Error obteniendo dashboard de empleados:', error);
      res.status(500).json({ error: 'Error al obtener dashboard de empleados' });
    });
});

router.get('/cobranzas-dashboard', (req, res) => {
  const period = req.query.period || 'this_month';
  const { startDate, endDate } = getDateRange(period);

  db.query(
    `SELECT COUNT(*) FILTER (WHERE payment_status <> 'pagado')::int AS total_clients,
            COALESCE(SUM(CASE WHEN payment_status <> 'pagado' THEN total_amount ELSE 0 END), 0) AS pending_amount,
            COALESCE(SUM(CASE WHEN payment_status = 'pagado' THEN total_amount ELSE 0 END), 0) AS collected_amount
     FROM clientes
     WHERE fecha_registro BETWEEN $1 AND $2`,
    [startDate, endDate]
  )
    .then((result) => {
      const pending = normalizeNumber(result.rows[0]?.pending_amount);
      const collected = normalizeNumber(result.rows[0]?.collected_amount);
      const total = pending + collected;
      res.json({
        data: {
          total_clients: result.rows[0]?.total_clients || 0,
          total_amount: pending,
          collected,
          pending,
          collection_rate: total > 0 ? (collected / total) * 100 : 0,
          period
        }
      });
    })
    .catch((error) => {
      console.error('Error obteniendo dashboard de cobranzas:', error);
      res.status(500).json({ error: 'Error al obtener dashboard de cobranzas' });
    });
});

router.get('/collections-detailed', (req, res) => {
  Promise.all([
    db.query(
      `SELECT COUNT(*)::int AS total_clientes_deben,
              COALESCE(SUM(total_amount), 0) AS total_deuda_global,
              COUNT(*) FILTER (WHERE payment_status = 'moroso')::int AS total_en_cobranzas
       FROM clientes
       WHERE payment_status <> 'pagado'`
    ),
    db.query(
      `SELECT EXTRACT(YEAR FROM fecha_registro)::int AS año,
              COUNT(*)::int AS cantidad_clientes,
              COALESCE(SUM(total_amount), 0) AS total_deuda
       FROM clientes
       WHERE payment_status <> 'pagado'
       GROUP BY año
       ORDER BY año DESC`
    ),
    db.query(
      `SELECT a.id,
              a.cliente_id AS client_id,
              (c.first_name || ' ' || c.last_name) AS client_name,
              c.contract_number,
              a.fecha_actividad AS management_date,
              a.descripcion AS observation,
              a.fecha_creacion AS created_at,
              u.nombre AS created_by_name
       FROM actividades a
       LEFT JOIN clientes c ON a.cliente_id = c.id
       LEFT JOIN usuarios u ON a.usuario_id = u.id
       ORDER BY a.fecha_actividad DESC
       LIMIT 50`
    )
  ])
    .then(([summaryRes, debtByYearRes, gestionesRes]) => {
      res.json({
        total_clientes_deben: summaryRes.rows[0]?.total_clientes_deben || 0,
        total_deuda_global: normalizeNumber(summaryRes.rows[0]?.total_deuda_global),
        total_en_cobranzas: summaryRes.rows[0]?.total_en_cobranzas || 0,
        deuda_por_año: debtByYearRes.rows || [],
        total_gestiones: gestionesRes.rows.length,
        gestiones: gestionesRes.rows || []
      });
    })
    .catch((error) => {
      console.error('Error obteniendo reporte detallado de cobranzas:', error);
      res.status(500).json({ error: 'Error al obtener reporte detallado de cobranzas' });
    });
});

router.get('/collections-full-report', (req, res) => {
  db.query(
    `SELECT id,
            first_name,
            last_name,
            email,
            contract_number,
            payment_status,
            total_amount,
            fecha_registro
     FROM clientes
     WHERE payment_status <> 'pagado'
     ORDER BY fecha_registro DESC`
  )
    .then((result) => {
      res.json({ data: result.rows });
    })
    .catch((error) => {
      console.error('Error obteniendo reporte completo de cobranzas:', error);
      res.status(500).json({ error: 'Error al obtener reporte completo de cobranzas' });
    });
});

router.get('/collections-history/:clientId', (req, res) => {
  const clientId = req.params.clientId;
  db.query(
    `SELECT a.id,
            a.fecha_actividad AS date,
            a.descripcion AS observation,
            a.fecha_creacion AS created_at,
            u.nombre AS created_by_name
     FROM actividades a
     LEFT JOIN usuarios u ON a.usuario_id = u.id
     WHERE a.cliente_id = $1
     ORDER BY a.fecha_actividad DESC`,
    [clientId]
  )
    .then((result) => {
      const history = result.rows.map((row) => ({
        id: row.id,
        type: 'management',
        date: row.date,
        observation: row.observation,
        created_by_name: row.created_by_name
      }));

      res.json({ history });
    })
    .catch((error) => {
      console.error('Error obteniendo historial de cobranzas:', error);
      res.status(500).json({ error: 'Error al obtener historial de cobranzas' });
    });
});

router.get('/payments-summary', (req, res) => {
  const now = new Date();
  const currentStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const currentEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  const lastStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

  Promise.all([
    db.query(
      `SELECT COUNT(*) FILTER (WHERE payment_status = 'pagado')::int AS total_payments,
              COALESCE(SUM(CASE WHEN payment_status = 'pagado' THEN total_amount ELSE 0 END), 0) AS collected_amount,
              COALESCE(SUM(CASE WHEN payment_status <> 'pagado' THEN total_amount ELSE 0 END), 0) AS pending_amount
       FROM clientes
       WHERE fecha_registro BETWEEN $1 AND $2`,
      [toDateString(lastStart), toDateString(lastEnd)]
    ),
    db.query(
      `SELECT COALESCE(SUM(CASE WHEN payment_status <> 'pagado' THEN total_amount ELSE 0 END), 0) AS total_pending,
              COALESCE(SUM(CASE WHEN payment_status = 'moroso' THEN total_amount ELSE 0 END), 0) AS overdue_amount,
              COALESCE(SUM(CASE WHEN payment_status IN ('sin_pago', 'pago_parcial') THEN total_amount ELSE 0 END), 0) AS upcoming_amount,
              COUNT(*) FILTER (WHERE payment_status = 'pago_parcial')::int AS agreements_pending
       FROM clientes
       WHERE fecha_registro BETWEEN $1 AND $2`,
      [toDateString(currentStart), toDateString(currentEnd)]
    ),
    db.query(
      `SELECT COALESCE(SUM(CASE WHEN payment_status <> 'pagado' THEN total_amount ELSE 0 END), 0) AS total_debt,
              COALESCE(SUM(CASE WHEN payment_status = 'moroso' THEN total_amount ELSE 0 END), 0) AS overdue_debt,
              COALESCE(SUM(CASE WHEN payment_status IN ('sin_pago', 'pago_parcial') THEN total_amount ELSE 0 END), 0) AS current_debt
       FROM clientes`
    )
  ])
    .then(([lastPeriodRes, currentPeriodRes, totalRes]) => {
      const collected = normalizeNumber(lastPeriodRes.rows[0]?.collected_amount);
      const pending = normalizeNumber(lastPeriodRes.rows[0]?.pending_amount);
      const total = collected + pending;
      res.json({
        lastPeriod: {
          totalPayments: lastPeriodRes.rows[0]?.total_payments || 0,
          collectedAmount: collected,
          pendingAmount: pending,
          collectionRate: total > 0 ? (collected / total) * 100 : 0
        },
        currentPeriod: {
          totalPending: normalizeNumber(currentPeriodRes.rows[0]?.total_pending),
          overdueAmount: normalizeNumber(currentPeriodRes.rows[0]?.overdue_amount),
          upcomingAmount: normalizeNumber(currentPeriodRes.rows[0]?.upcoming_amount),
          agreementsPending: currentPeriodRes.rows[0]?.agreements_pending || 0
        },
        totalOutstanding: {
          totalDebt: normalizeNumber(totalRes.rows[0]?.total_debt),
          overdueDebt: normalizeNumber(totalRes.rows[0]?.overdue_debt),
          currentDebt: normalizeNumber(totalRes.rows[0]?.current_debt)
        }
      });
    })
    .catch((error) => {
      console.error('Error obteniendo resumen de pagos:', error);
      res.status(500).json({ error: 'Error al obtener resumen de pagos' });
    });
});

module.exports = router;
