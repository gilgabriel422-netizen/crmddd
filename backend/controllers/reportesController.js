const pool = require('../config/pg-pool');
const { sequelize } = require('../config/database');

// Obtener resumen del mes/período
exports.getLastMonthSummary = async (req, res) => {
  try {
    const { period = 'this_month' } = req.query;

    // Obtener ventas - todos los clientes
    const ventasResult = await pool.query(
      `SELECT 
        COUNT(*) as total_ventas,
        COALESCE(SUM(total_amount::numeric), 0) as total_monto
      FROM clientes`
    );
    console.log('🔍 Ventas result:', ventasResult.rows[0]);

    // Obtener cobranzas (pagos confirmados)
    const cobranzasResult = await pool.query(
      `SELECT 
        COUNT(*) as total_cobranzas,
        COALESCE(SUM(monto_numerico::numeric), 0) as total_monto
      FROM autorizaciones_pago
      WHERE estado = 'confirmado'`
    );
    console.log('🔍 Cobranzas result:', cobranzasResult.rows[0]);

    // Obtener reservas
    const reservasResult = await pool.query(
      `SELECT 
        COUNT(*) as total_reservas,
        COALESCE(SUM(valor_total::numeric), 0) as total_monto
      FROM reservas`
    );
    console.log('🔍 Reservas result:', reservasResult.rows[0]);

    const summary = {
      period,
      sales: {
        total_ventas: parseInt(ventasResult.rows[0]?.total_ventas || 0),
        total_monto: parseFloat(ventasResult.rows[0]?.total_monto || 0)
      },
      collections: {
        total_cobranzas: parseInt(cobranzasResult.rows[0]?.total_cobranzas || 0),
        total_monto: parseFloat(cobranzasResult.rows[0]?.total_monto || 0)
      },
      bookings: {
        total_reservas: parseInt(reservasResult.rows[0]?.total_reservas || 0),
        total_monto: parseFloat(reservasResult.rows[0]?.total_monto || 0)
      }
    };

    console.log('📊 SUMMARY COMPLETO ENVIADO AL FRONTEND:', JSON.stringify(summary, null, 2));
    res.json(summary);
  } catch (error) {
    console.error('Error al obtener resumen del período:', error);
    res.status(500).json({ error: error.message });
  }
};

// Obtener resumen de pagos
exports.getPaymentsSummary = async (req, res) => {
  try {
    // Total de clientes y monto total
    const clientesResult = await pool.query(
      `SELECT COUNT(*) as total_clientes, COALESCE(SUM(total_amount::numeric), 0) as total_monto
       FROM clientes`
    );

    // Pagos realizados
    const pagosResult = await pool.query(
      `SELECT COUNT(*) as total_pagos, COALESCE(SUM(monto_numerico::numeric), 0) as total_pagado
       FROM autorizaciones_pago
       WHERE estado = 'confirmado'`
    );

    const totalClientes = parseFloat(clientesResult.rows[0]?.total_monto || 0);
    const totalPagado = parseFloat(pagosResult.rows[0]?.total_pagado || 0);
    const pendiente = totalClientes - totalPagado;

    const summary = {
      lastPeriod: {
        totalPayments: parseInt(pagosResult.rows[0]?.total_pagos || 0),
        collectedAmount: totalPagado,
        pendingAmount: pendiente,
        collectionRate: totalClientes > 0 ? (totalPagado / totalClientes) * 100 : 0
      },
      currentPeriod: {
        totalPending: parseInt(clientesResult.rows[0]?.total_clientes || 0),
        overdueAmount: 0,
        upcomingAmount: pendiente,
        agreementsPending: 0
      },
      totalOutstanding: {
        totalDebt: totalClientes,
        overdueDebt: 0,
        currentDebt: pendiente
      }
    };

    res.json(summary);
  } catch (error) {
    console.error('Error al obtener resumen de pagos:', error);
    res.status(500).json({ error: error.message });
  }
};

// Obtener reporte de ventas
exports.getSalesReport = async (req, res) => {
  try {
    const { period = 'month' } = req.query;

    const ventas = await pool.query(
      `SELECT 
        COUNT(*) as total,
        COALESCE(SUM(total_amount::numeric), 0) as monto
      FROM clientes`
    );

    res.json({
      period,
      data: ventas.rows,
      summary: {
        total_registros: parseInt(ventas.rows[0]?.total || 0),
        total_monto: parseFloat(ventas.rows[0]?.monto || 0)
      }
    });
  } catch (error) {
    console.error('Error al obtener reporte de ventas:', error);
    res.status(500).json({ error: error.message });
  }
};

// Obtener reporte de cobranzas
exports.getCollectionsReport = async (req, res) => {
  try {
    const { period = 'month' } = req.query;

    const cobranzas = await pool.query(
      `SELECT 
        COUNT(*) as total,
        COALESCE(SUM(monto_numerico::numeric), 0) as monto,
        estado
      FROM autorizaciones_pago
      GROUP BY estado`
    );

    res.json({
      period,
      data: cobranzas.rows,
      summary: {
        total_registros: cobranzas.rows.length,
        total_monto: cobranzas.rows.reduce((sum, c) => sum + parseFloat(c.monto || 0), 0)
      }
    });
  } catch (error) {
    console.error('Error al obtener reporte de cobranzas:', error);
    res.status(500).json({ error: error.message });
  }
};
