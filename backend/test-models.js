#!/usr/bin/env node
try {
  console.log('1. Iniciando...');
  require('dotenv').config();
  console.log('2. Dotenv cargado');
  
  const sequelize = require('./config/database');
  console.log('3. Sequelize conectado');
  
  const Usuario = require('./models/Usuario');
  console.log('4. Usuario model cargado');
  
  const Paquete = require('./models/Paquete');
  console.log('5. Paquete model cargado');
  
  const ContratoFisico = require('./models/ContratoFisico');
  console.log('6. ContratoFisico model cargado');
  
  const Locacion = require('./models/Locacion');
  console.log('7. Locacion model cargado');
  
  const Departamento = require('./models/Departamento');
  console.log('8. Departamento model cargado');
  
  const Mensaje = require('./models/Mensaje');
  console.log('9. Mensaje model cargado');
  
  const Notificacion = require('./models/Notificacion');
  console.log('10. Notificacion model cargado');
  
  const Actividad = require('./models/Actividad');
  console.log('11. Actividad model cargado');
  
  const Contacto = require('./models/Contacto');
  console.log('12. Contacto model cargado');
  
  const Reserva = require('./models/Reserva');
  console.log('13. Reserva model cargado');
  
  console.log('\n✅ Todos los modelos cargaron correctamente!');
} catch (error) {
  console.error('❌ Error:', error.message);
  console.error('Stack:', error.stack);
}
