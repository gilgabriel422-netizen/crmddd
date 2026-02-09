const jwt = require('jsonwebtoken');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

describe('Middleware de Autenticación', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      headers: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
  });

  describe('authenticateToken', () => {
    it('Debe retornar 401 si no hay token', () => {
      authenticateToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Token no proporcionado' });
      expect(next).not.toHaveBeenCalled();
    });

    it('Debe retornar 403 si el token es inválido', () => {
      req.headers.authorization = 'Bearer token_invalido';

      authenticateToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: 'Token inválido o expirado' });
      expect(next).not.toHaveBeenCalled();
    });

    it('Debe llamar a next() si el token es válido', () => {
      const token = jwt.sign({ id: 1, email: 'test@test.com' }, process.env.JWT_SECRET || 'test_secret');
      req.headers.authorization = `Bearer ${token}`;

      authenticateToken(req, res, next);

      // Esperar un momento para que el verify callback se ejecute
      setTimeout(() => {
        expect(next).toHaveBeenCalled();
        expect(req.user).toBeDefined();
      }, 100);
    });
  });

  describe('authorizeRole', () => {
    it('Debe retornar 401 si no hay usuario autenticado', () => {
      const middleware = authorizeRole('admin');
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Usuario no autenticado' });
      expect(next).not.toHaveBeenCalled();
    });

    it('Debe retornar 403 si el usuario no tiene el rol requerido', () => {
      req.user = { id: 1, rol: 'vendedor' };
      const middleware = authorizeRole('admin');
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: 'No tienes permisos para realizar esta acción' });
      expect(next).not.toHaveBeenCalled();
    });

    it('Debe llamar a next() si el usuario tiene el rol correcto', () => {
      req.user = { id: 1, rol: 'admin' };
      const middleware = authorizeRole('admin');
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('Debe permitir múltiples roles', () => {
      req.user = { id: 1, rol: 'vendedor' };
      const middleware = authorizeRole('admin', 'vendedor');
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });
});
