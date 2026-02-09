const pool = require('./config/pg-pool');

async function crearContratoParaCliente10() {
  try {
    console.log('Creando contrato para cliente ID 10...\n');

    // Generar número único de contrato
    const fecha = new Date();
    const year = fecha.getFullYear().toString().slice(-2);
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const numeroContrato = `CT${year}${month}-${random}`;

    const result = await pool.query(
      `INSERT INTO contratos_viajes (
        cliente_id, numero_contrato, fecha_contrato, estado, creado_por
      ) VALUES ($1, $2, $3, $4, $5)
      RETURNING id, numero_contrato, cliente_id, estado`,
      [10, numeroContrato, new Date(), 'pendiente', 'admin']
    );

    console.log('Contrato creado exitosamente:');
    console.log(`   ID: ${result.rows[0].id}`);
    console.log(`   Numero: ${result.rows[0].numero_contrato}`);
    console.log(`   Cliente: ${result.rows[0].cliente_id}`);
    console.log(`   Estado: ${result.rows[0].estado}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error al crear contrato:', error.message);
    process.exit(1);
  }
}

crearContratoParaCliente10();
