const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Importar Sequelize y modelos para sincronización
const sequelize = require('./config/database');
const Usuario = require('./models/Usuario');
console.log('✅ Usuario model loaded');

// Importar todos los modelos Sequelize
const Paquete = require('./models/Paquete');
const ContratoFisico = require('./models/ContratoFisico');
const Locacion = require('./models/Locacion');
const Departamento = require('./models/Departamento');
const Mensaje = require('./models/Mensaje');
const Notificacion = require('./models/Notificacion');
const Actividad = require('./models/Actividad');
const Contacto = require('./models/Contacto');
const Reserva = require('./models/Reserva');
const Punto = require('./models/Punto');
const ClientManagement = require('./models/ClientManagement');
const Payment = require('./models/Payment');
const PaymentAgreement = require('./models/PaymentAgreement');
console.log('✅ Sequelize models loaded');

const app = express();

// Middleware
app.use(cors({
  origin: '*', // Permitir todos los orígenes en desarrollo
  credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Importar rutas
const clientesRoutes = require('./routes/clientes');
const contactosRoutes = require('./routes/contactos');
const actividadesRoutes = require('./routes/actividades');
const usuariosRoutes = require('./routes/usuarios');

// Importar rutas de innovation
const chatbotRoutes = require('./routes/chatbot');
const contratosFisicosRoutes = require('./routes/contratos-fisicos');
const departamentosRoutes = require('./routes/departamentos');
const locacionesRoutes = require('./routes/locaciones');
const mensajesRoutes = require('./routes/mensajes');
const paquetesRoutes = require('./routes/paquetes');
const notificacionesRoutes = require('./routes/notificaciones');
const reservasRoutes = require('./routes/reservas');
const puntosRoutes = require('./routes/puntos');
const clientManagementsRoutes = require('./routes/client-managements');

// Importar rutas mock (para compatibilidad con frontend)
const bookingsRoutes = require('./routes/bookings');
const paymentsRoutes = require('./routes/payments');
const reportsRoutes = require('./routes/reports');
const statsRoutes = require('./routes/stats');
const auditLogsRoutes = require('./routes/audit-logs');
const paymentAgreementsRoutes = require('./routes/payment-agreements');
const requirementsRoutes = require('./routes/requirements');
const reservationAgendaRoutes = require('./routes/reservation-agenda');
const visaAgendaRoutes = require('./routes/visa-agenda');
const flightAgendaRoutes = require('./routes/flight-agenda');
const clientTransfersRoutes = require('./routes/client-transfers');
const contratoRoutes = require('./routes/contratoRoutes');
const reportesRoutes = require('./routes/reportes');
const beneficiosRoutes = require('./routes/beneficios');
const cartasRoutes = require('./routes/cartas');
const adjuntosRoutes = require('./routes/adjuntosRoutes');
const plantillasRoutes = require('./routes/plantillasRoutes');

// Usar rutas
app.use('/api/clientes', clientesRoutes);
app.use('/api/contactos', contactosRoutes);
app.use('/api/actividades', actividadesRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/contratos', contratoRoutes);

// Rutas de innovation
app.use('/api/paquetes', paquetesRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/notificaciones', notificacionesRoutes);
app.use('/api/mensajes', mensajesRoutes);
app.use('/api/locaciones', locacionesRoutes);
app.use('/api/departamentos', departamentosRoutes);
app.use('/api/contratos-fisicos', contratosFisicosRoutes);
app.use('/api/reservas', reservasRoutes);
app.use('/api/puntos', puntosRoutes);
app.use('/api/client-managements', clientManagementsRoutes);
app.use('/api/reportes', reportesRoutes);
app.use('/api/beneficios', beneficiosRoutes);
app.use('/api/cartas', cartasRoutes);
app.use('/api/adjuntos', adjuntosRoutes);
app.use('/api/plantillas', plantillasRoutes);

// Servir archivos estáticos (uploads)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rutas mock (para evitar errores 404 en el frontend)
app.use('/api/bookings', bookingsRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/payment-agreements', paymentAgreementsRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/audit-logs', auditLogsRoutes);
app.use('/api/requirements', requirementsRoutes);
app.use('/api/reservation-agenda', reservationAgendaRoutes);
app.use('/api/visa-agenda', visaAgendaRoutes);
app.use('/api/flight-agenda', flightAgendaRoutes);
app.use('/api/client-transfers', clientTransfersRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ mensaje: 'API CRM funcionando correctamente' });
});

// Servir el cliente de prueba
app.get('/test', (req, res) => {
  res.sendFile(path.join(__dirname, 'test-client.html'));
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Algo salió mal!' });
});

const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0'; // Escuchar en todas las interfaces

// Sincronizar base de datos e iniciar servidor
async function iniciar() {
  try {
    // Ejecutar migraciones SQL primero (si existen)
    try {
      const migrationPath = path.join(__dirname, 'database', 'migrations', 'create-contratos-tables.sql');
      if (fs.existsSync(migrationPath)) {
        const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
        await sequelize.query(migrationSQL);
        console.log('✅ Migración de contratos ejecutada');
      }
    } catch (migrationError) {
      // Si la migración ya se ejecutó o hay un error, continuar
      console.log('⚠️ Migración de contratos:', migrationError.message.includes('already exists') ? 'Ya existe' : migrationError.message);
    }

    // Sincronizar Sequelize con la base de datos (sin recrear tablas)
    await sequelize.sync({ alter: false });
    console.log('✅ Sequelize sincronizado con la base de datos');

    // Actualizar usuario con email incorrecto
    try {
      await sequelize.query(
        `UPDATE usuarios SET email = '0005@cliente.crm.com' 
         WHERE email LIKE '%KMPRY SDSD%'`
      );
    } catch (updateErr) {
      // Si falla, continuar de todas formas
    }

    const server = app.listen(PORT, HOST, () => {
      console.log(`Servidor corriendo en el puerto ${PORT}`);
      console.log(`Accede a la API en http://localhost:${PORT}`);
      console.log(`Estado: ${server.listening ? '✅ Escuchando' : '❌ No escuchando'}`);
    });

    server.on('error', (error) => {
      console.error('❌ Error al iniciar el servidor:', error);
      process.exit(1);
    });

    server.on('listening', () => {
      const addr = server.address();
      console.log('✅ Socket abierto exitosamente');
      console.log(`   Dirección: ${addr.address}`);
      console.log(`   Puerto: ${addr.port}`);
      console.log(`   Familia: ${addr.family}`);
    });
  } catch (error) {
    console.error('❌ Error al sincronizar la base de datos:', error);
    process.exit(1);
  }
}

iniciar();
