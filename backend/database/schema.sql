-- Tabla de paquetes turísticos
CREATE TABLE IF NOT EXISTS paquetes (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT,
  precio DECIMAL(10,2) NOT NULL,
  duracion INTEGER, -- en días
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- Tabla de departamentos
CREATE TABLE IF NOT EXISTS departamentos (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  locacionId INTEGER NOT NULL REFERENCES locaciones(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS locaciones (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  direccion VARCHAR(255)
);
-- CRM Database Schema
-- PostgreSQL

-- Eliminar tablas existentes si existen
DROP TABLE IF EXISTS actividades CASCADE;
DROP TABLE IF EXISTS contactos CASCADE;
DROP TABLE IF EXISTS clientes CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;

CREATE TABLE usuarios (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  rol VARCHAR(20) DEFAULT 'vendedor' CHECK (rol IN ('admin', 'gerente', 'vendedor', 'cobranzas', 'servicio', 'contracto', 'contratos', 'atencion', 'postventa', 'blue', 'gold', 'black')),
  activo BOOLEAN DEFAULT TRUE,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE clientes (
  id SERIAL PRIMARY KEY,
  -- Información personal
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  nombre VARCHAR(200) GENERATED ALWAYS AS (first_name || ' ' || last_name) STORED,
  document_number VARCHAR(20),
  email VARCHAR(100) UNIQUE NOT NULL,
  phone VARCHAR(20),
  
  -- Información del contrato
  contract_number VARCHAR(50) UNIQUE NOT NULL,
  fecha_registro DATE DEFAULT CURRENT_DATE,
  status VARCHAR(20) DEFAULT 'activo' CHECK (status IN ('activo', 'inactivo', 'moroso', 'prospecto', 'contactado', 'calificado', 'propuesta', 'negociacion', 'ganado', 'perdido')),
  
  -- Información de paquete
  total_nights INTEGER DEFAULT 0,
  remaining_nights INTEGER DEFAULT 0,
  anos INTEGER DEFAULT 0,
  anos_indefinido BOOLEAN DEFAULT FALSE,
  international_bonus VARCHAR(10) DEFAULT 'No' CHECK (international_bonus IN ('Si', 'No')),
  
  -- Información financiera
  total_amount DECIMAL(10, 2) DEFAULT 0,
  iva DECIMAL(10, 2) DEFAULT 0,
  neto DECIMAL(10, 2) DEFAULT 0,
  payment_status VARCHAR(20) DEFAULT 'sin_pago' CHECK (payment_status IN ('sin_pago', 'pago_parcial', 'pagado', 'moroso')),
  categoria_cliente VARCHAR(10) CHECK (categoria_cliente IS NULL OR categoria_cliente IN ('blue', 'gold', 'black')),
  
  -- Información de pago
  pago_mixto VARCHAR(10) DEFAULT 'No' CHECK (pago_mixto IN ('Si', 'No')),
  cantidad_tarjetas INTEGER DEFAULT 1,
  tarjetas JSONB,
  datafast VARCHAR(50),
  tipo_tarjeta VARCHAR(50),
  forma_pago VARCHAR(20),
  tiempo_meses VARCHAR(10),
  
  -- Información de pagaré
  pagare VARCHAR(10) DEFAULT 'No' CHECK (pagare IN ('Si', 'No')),
  fecha_pagare DATE,
  monto_pagare DECIMAL(10, 2),
  pagare_cuotas INTEGER,
  pagare_cuotas_asumidas INTEGER,
  pagare_valor_cuota DECIMAL(10, 2),
  pagare_total DECIMAL(10, 2),
  
  -- Personal de ventas
  linner VARCHAR(100),
  closer VARCHAR(100),
  
  -- Información de ubicación y contacto
  empresa VARCHAR(100),
  telefono VARCHAR(20),
  direccion TEXT,
  ciudad VARCHAR(100),
  pais VARCHAR(100),
  
  -- Gestión interna
  usuario_asignado_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
  notas TEXT,
  
  -- Timestamps
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de contactos
CREATE TABLE contactos (
  id SERIAL PRIMARY KEY,
  cliente_id INTEGER NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  nombre VARCHAR(100) NOT NULL,
  cargo VARCHAR(100),
  email VARCHAR(100),
  telefono VARCHAR(20),
  es_principal BOOLEAN DEFAULT FALSE,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de actividades
CREATE TABLE actividades (
  id SERIAL PRIMARY KEY,
  cliente_id INTEGER NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  contacto_id INTEGER REFERENCES contactos(id) ON DELETE SET NULL,
  usuario_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
  tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('llamada', 'email', 'reunion', 'tarea', 'nota')),
  titulo VARCHAR(200) NOT NULL,
  descripcion TEXT,
  fecha_actividad TIMESTAMP NOT NULL,
  completada BOOLEAN DEFAULT FALSE,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para mejorar el rendimiento
CREATE INDEX idx_clientes_usuario ON clientes(usuario_asignado_id);
CREATE INDEX idx_clientes_status ON clientes(status);
CREATE INDEX idx_clientes_contract_number ON clientes(contract_number);
CREATE INDEX idx_clientes_email ON clientes(email);
CREATE INDEX idx_clientes_document_number ON clientes(document_number);
CREATE INDEX idx_clientes_payment_status ON clientes(payment_status);
CREATE INDEX idx_clientes_fecha_registro ON clientes(fecha_registro);
CREATE INDEX idx_contactos_cliente ON contactos(cliente_id);
CREATE INDEX idx_actividades_cliente ON actividades(cliente_id);
CREATE INDEX idx_actividades_usuario ON actividades(usuario_id);
CREATE INDEX idx_actividades_fecha ON actividades(fecha_actividad);
-- Tabla de reservas (completamente funcional)
DROP TABLE IF EXISTS reservas CASCADE;
CREATE TABLE IF NOT EXISTS reservas (
  id SERIAL PRIMARY KEY,
  cliente_id INTEGER NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  numero_reserva VARCHAR(50) UNIQUE NOT NULL,
  fecha_entrada DATE,
  fecha_salida DATE,
  noches INTEGER,
  personas INTEGER DEFAULT 1,
  ciudad VARCHAR(100),
  valor_total DECIMAL(10, 2) DEFAULT 0,
  estado VARCHAR(20) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'confirmada', 'cancelada', 'completada')),
  observaciones TEXT,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reservas_cliente ON reservas(cliente_id);
CREATE INDEX idx_reservas_numero ON reservas(numero_reserva);
CREATE INDEX idx_reservas_estado ON reservas(estado);
CREATE INDEX idx_reservas_fecha ON reservas(fecha_creacion);

-- Tabla de puntos (sistema de compensación)
CREATE TABLE IF NOT EXISTS puntos (
  id SERIAL PRIMARY KEY,
  cliente_id INTEGER,
  email VARCHAR(100),
  puntos INTEGER DEFAULT 0,
  actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_puntos_email ON puntos(email);
CREATE INDEX IF NOT EXISTS idx_puntos_cliente_id ON puntos(cliente_id);

-- Tabla de client managements
CREATE TABLE IF NOT EXISTS client_managements (
  id SERIAL PRIMARY KEY,
  client_id INTEGER,
  type TEXT,
  from_user TEXT,
  note TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_client_managements_client_id ON client_managements(client_id);

-- Tabla de payments
CREATE TABLE IF NOT EXISTS payments (
  id SERIAL PRIMARY KEY,
  client_id INTEGER,
  payment_amount NUMERIC(12,2) NOT NULL,
  payment_date DATE NOT NULL,
  payment_method TEXT,
  notes TEXT,
  receipt_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de payment agreements
CREATE TABLE IF NOT EXISTS payment_agreements (
  id SERIAL PRIMARY KEY,
  client_id INTEGER NOT NULL,
  contract_number TEXT,
  total_amount NUMERIC(12,2) NOT NULL,
  installment_count INTEGER NOT NULL,
  installment_amount NUMERIC(12,2) NOT NULL,
  start_date DATE,
  end_date DATE,
  notes TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_client_id ON payments(client_id);
CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(payment_date);
CREATE INDEX IF NOT EXISTS idx_payment_agreements_client_id ON payment_agreements(client_id);