const Cliente = require('../models/Cliente');
const Usuario = require('../models/Usuario');
const Actividad = require('../models/Actividad');
const Contacto = require('../models/Contacto');

describe('Modelo Cliente', () => {
  it('Debe tener método getAll', () => {
    expect(typeof Cliente.getAll).toBe('function');
  });

  it('Debe tener método getById', () => {
    expect(typeof Cliente.getById).toBe('function');
  });

  it('Debe tener método create', () => {
    expect(typeof Cliente.create).toBe('function');
  });

  it('Debe tener método update', () => {
    expect(typeof Cliente.update).toBe('function');
  });

  it('Debe tener método delete', () => {
    expect(typeof Cliente.delete).toBe('function');
  });

  it('Debe tener método search', () => {
    expect(typeof Cliente.search).toBe('function');
  });
});

describe('Modelo Usuario', () => {
  it('Debe tener método getAll', () => {
    expect(typeof Usuario.getAll).toBe('function');
  });

  it('Debe tener método getById', () => {
    expect(typeof Usuario.getById).toBe('function');
  });

  it('Debe tener método getByEmail', () => {
    expect(typeof Usuario.getByEmail).toBe('function');
  });

  it('Debe tener método create', () => {
    expect(typeof Usuario.create).toBe('function');
  });

  it('Debe tener método validatePassword', () => {
    expect(typeof Usuario.validatePassword).toBe('function');
  });
});

describe('Modelo Actividad', () => {
  it('Debe tener método getAll', () => {
    expect(typeof Actividad.getAll).toBe('function');
  });

  it('Debe tener método getByClienteId', () => {
    expect(typeof Actividad.getByClienteId).toBe('function');
  });

  it('Debe tener método create', () => {
    expect(typeof Actividad.create).toBe('function');
  });

  it('Debe tener método marcarCompletada', () => {
    expect(typeof Actividad.marcarCompletada).toBe('function');
  });
});

describe('Modelo Contacto', () => {
  it('Debe tener método getByClienteId', () => {
    expect(typeof Contacto.getByClienteId).toBe('function');
  });

  it('Debe tener método getById', () => {
    expect(typeof Contacto.getById).toBe('function');
  });

  it('Debe tener método create', () => {
    expect(typeof Contacto.create).toBe('function');
  });

  it('Debe tener método update', () => {
    expect(typeof Contacto.update).toBe('function');
  });

  it('Debe tener método delete', () => {
    expect(typeof Contacto.delete).toBe('function');
  });
});
