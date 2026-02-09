#!/usr/bin/env node

/**
 * Script para crear clientes de prueba con sus usuarios asociados
 * Uso: node crear-cliente-rapido.js
 */

const axios = require('axios');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const pregunta = (texto) => {
  return new Promise((resolve) => {
    rl.question(texto, resolve);
  });
};

async function main() {
  console.log('\n╔════════════════════════════════════════╗');
  console.log('║  🎯 CREAR CLIENTE CON USUARIO         ║');
  console.log('╚════════════════════════════════════════╝\n');

  try {
    // Solicitar datos del cliente
    console.log('📝 Ingresa los datos del cliente:\n');
    const nombre = await pregunta('Nombre: ');
    const apellido = await pregunta('Apellido: ');
    const email = await pregunta('Email: ');
    const telefono = await pregunta('Teléfono: ');
    const cedula = await pregunta('Cédula/Documento: ');
    const empresa = await pregunta('Empresa (opcional): ');

    console.log('\n👤 Selecciona el tipo de cliente:');
    console.log('1. Blue (Cliente Estándar)');
    console.log('2. Gold (IB1 - Premium)');
    console.log('3. Black (IB2 - VIP)');
    
    const tipoRespuesta = await pregunta('\nSelecciona (1, 2 o 3): ');
    
    const tiposCliente = {
      '1': 'blue',
      '2': 'gold',
      '3': 'black'
    };

    const rolCliente = tiposCliente[tipoRespuesta] || 'blue';
    const tiposNombre = { blue: 'Blue (Estándar)', gold: 'Gold (Premium)', black: 'Black (VIP)' };

    console.log(`\n✅ Tipo seleccionado: ${tiposNombre[rolCliente]}`);

    // Crear cliente
    console.log('\n⏳ Creando cliente y usuario...\n');

    const response = await axios.post(
      'http://localhost:5000/api/clientes/crear-con-usuario',
      {
        clienteData: {
          first_name: nombre,
          last_name: apellido,
          email: email,
          phone: telefono,
          document_number: cedula,
          empresa: empresa,
          status: 'activo'
        },
        rolCliente: rolCliente
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data.success) {
      console.log('╔════════════════════════════════════════╗');
      console.log('║  ✅ CLIENTE CREADO EXITOSAMENTE      ║');
      console.log('╚════════════════════════════════════════╝\n');

      console.log('📋 DATOS DEL CLIENTE:');
      console.log(`   ID: ${response.data.cliente.id}`);
      console.log(`   Nombre: ${response.data.cliente.nombre}`);
      console.log(`   Email: ${response.data.cliente.email}`);
      console.log(`   Tipo: ${tiposNombre[rolCliente]}\n`);

      console.log('👤 CREDENCIALES DE USUARIO:');
      console.log(`   Email: ${response.data.credenciales.email}`);
      console.log(`   Contraseña: ${response.data.credenciales.password}`);
      console.log(`   Rol: ${response.data.credenciales.rol}\n`);

      console.log('🌐 ACCESO:');
      console.log('   URL: http://localhost:3000/login');
      console.log(`   Usuario: ${response.data.credenciales.email}`);
      console.log(`   Contraseña: ${response.data.credenciales.password}\n`);

      console.log('💡 COPIAR Y COMPARTIR CON EL CLIENTE:');
      console.log('═══════════════════════════════════════');
      console.log(`Email: ${response.data.credenciales.email}`);
      console.log(`Contraseña: ${response.data.credenciales.password}`);
      console.log('═══════════════════════════════════════\n');
    } else {
      console.log('❌ Error:', response.data.message);
    }
  } catch (error) {
    console.error('❌ Error al crear cliente:', error.response?.data || error.message);
  } finally {
    rl.close();
  }
}

main();
