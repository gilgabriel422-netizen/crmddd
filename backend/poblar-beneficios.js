#!/usr/bin/env node
const pool = require('./config/pg-pool');

async function poblarBeneficios() {
  console.log('🎁 Poblando beneficios de ejemplo...\n');

  try {
    // Obtener clientes
    const clientesResult = await pool.query('SELECT id FROM clientes LIMIT 5');
    const clientes = clientesResult.rows;

    if (clientes.length === 0) {
      console.log('⚠️  No hay clientes en la base de datos');
      process.exit(1);
    }

    let insertados = 0;

    // Beneficios de ejemplo
    const beneficios = [
      {
        tipo: 'puntos',
        nombre: 'Puntos de Compra',
        descripcion: '30% del valor en puntos de compensación',
        valor: 270450.89
      },
      {
        tipo: 'descuento',
        nombre: 'Descuento 15% Próximo Viaje',
        descripcion: 'Descuento aplicable a próximas compras',
        valor: 5000.00
      },
      {
        tipo: 'noche_gratis',
        nombre: 'Noche de Hotel Gratis',
        descripcion: '1 noche en hotel 5 estrellas',
        valor: 300.00
      },
      {
        tipo: 'cortesia',
        nombre: 'Cortesía de Comidas',
        descripcion: 'Cortesía en restaurantes asociados',
        valor: 200.00
      },
      {
        tipo: 'upgrade',
        nombre: 'Upgrade de Habitación',
        descripcion: 'Upgrade a suite deluxe',
        valor: 150.00
      }
    ];

    // Asignar beneficios a cada cliente
    for (const cliente of clientes) {
      for (const beneficio of beneficios) {
        try {
          await pool.query(
            `INSERT INTO beneficios 
             (cliente_id, tipo, nombre, descripcion, valor, saldo_disponible, activo, fecha_creacion, fecha_actualizacion)
             VALUES ($1, $2, $3, $4, $5, $6, true, NOW(), NOW())`,
            [
              cliente.id,
              beneficio.tipo,
              beneficio.nombre,
              beneficio.descripcion,
              beneficio.valor,
              beneficio.valor
            ]
          );
          insertados++;
          console.log(`  ✓ Cliente ${cliente.id}: ${beneficio.nombre}`);
        } catch (error) {
          console.log(`  ✗ Error insertando para cliente ${cliente.id}: ${error.message}`);
        }
      }
    }

    console.log(`\n✅ Se insertaron ${insertados} beneficios correctamente\n`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

poblarBeneficios();
