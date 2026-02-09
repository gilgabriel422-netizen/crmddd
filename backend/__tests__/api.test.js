const request = require('supertest');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

// Importar rutas
const clientesRoutes = require('../routes/clientes');
const usuariosRoutes = require('../routes/usuarios');

// Crear app de Express para pruebas
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use('/api/clientes', clientesRoutes);
app.use('/api/usuarios', usuariosRoutes);

describe('API de Clientes', () => {
  let clienteId;
  let authToken;

  beforeAll(async () => {
    // Login para obtener token
    const loginRes = await request(app)
      .post('/api/usuarios/login')
      .send({
        email: 'admin@crm.com',
        password: 'admin123'
      });
    
    if (loginRes.body.token) {
      authToken = loginRes.body.token;
    }
  });

  describe('GET /api/clientes', () => {
    it('Debe retornar lista de clientes', async () => {
      const res = await request(app)
        .get('/api/clientes');
      
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('POST /api/clientes', () => {
    it('Debe crear un nuevo cliente', async () => {
      const nuevoCliente = {
        nombre: 'Cliente de Prueba',
        empresa: 'Empresa Test S.A.',
        email: `test${Date.now()}@test.com`,
        telefono: '+123456789',
        direccion: 'Calle Test 123',
        ciudad: 'Ciudad Test',
        pais: 'País Test',
        estado: 'prospecto'
      };

      const res = await request(app)
        .post('/api/clientes')
        .send(nuevoCliente);

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.nombre).toBe(nuevoCliente.nombre);
      
      clienteId = res.body.id;
    });
  });

  describe('GET /api/clientes/:id', () => {
    it('Debe obtener un cliente por ID', async () => {
      if (!clienteId) {
        return;
      }

      const res = await request(app)
        .get(`/api/clientes/${clienteId}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('id', clienteId);
      expect(res.body).toHaveProperty('nombre');
    });

    it('Debe retornar 404 si el cliente no existe', async () => {
      const res = await request(app)
        .get('/api/clientes/99999');

      expect(res.statusCode).toBe(404);
    });
  });

  describe('PUT /api/clientes/:id', () => {
    it('Debe actualizar un cliente', async () => {
      if (!clienteId) {
        return;
      }

      const clienteActualizado = {
        nombre: 'Cliente Actualizado',
        empresa: 'Empresa Test S.A.',
        email: `test${Date.now()}@test.com`,
        telefono: '+123456789',
        direccion: 'Calle Test 123',
        ciudad: 'Ciudad Test',
        pais: 'País Test',
        estado: 'activo'
      };

      const res = await request(app)
        .put(`/api/clientes/${clienteId}`)
        .send(clienteActualizado);

      expect(res.statusCode).toBe(200);
      expect(res.body.nombre).toBe(clienteActualizado.nombre);
      expect(res.body.estado).toBe('activo');
    });
  });

  describe('GET /api/clientes/search', () => {
    it('Debe buscar clientes por query', async () => {
      const res = await request(app)
        .get('/api/clientes/search?q=test');

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('DELETE /api/clientes/:id', () => {
    it('Debe eliminar un cliente', async () => {
      if (!clienteId) {
        return;
      }

      const res = await request(app)
        .delete(`/api/clientes/${clienteId}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('mensaje');
    });
  });
});

describe('API de Usuarios', () => {
  describe('POST /api/usuarios/login', () => {
    it('Debe hacer login con credenciales correctas', async () => {
      const res = await request(app)
        .post('/api/usuarios/login')
        .send({
          email: 'admin@crm.com',
          password: 'admin123'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('usuario');
      expect(res.body.usuario).toHaveProperty('email', 'admin@crm.com');
    });

    it('Debe fallar con credenciales incorrectas', async () => {
      const res = await request(app)
        .post('/api/usuarios/login')
        .send({
          email: 'admin@crm.com',
          password: 'wrongpassword'
        });

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('error');
    });

    it('Debe requerir email y password', async () => {
      const res = await request(app)
        .post('/api/usuarios/login')
        .send({});

      expect(res.statusCode).toBe(400);
    });
  });

  describe('GET /api/usuarios', () => {
    it('Debe retornar lista de usuarios', async () => {
      const res = await request(app)
        .get('/api/usuarios');

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });
  });
});
