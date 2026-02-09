-- ========================================
-- MIGRACIÓN: Sistema de Contratos de Viaje
-- Descripción: Tablas para gestionar contratos, tarjetas y autorizaciones
-- Fecha: 2026-02-05
-- ========================================

-- 1. TABLA: clientes_tarjetas
-- Almacena información de tarjetas de crédito/débito de clientes
CREATE TABLE IF NOT EXISTS clientes_tarjetas (
  id SERIAL PRIMARY KEY,
  cliente_id INTEGER NOT NULL,
  nombre_tarjetahabiente VARCHAR(255) NOT NULL,
  tipo_tarjeta VARCHAR(50), -- Visa, Mastercard, Amex, etc.
  numero_tarjeta VARCHAR(255), -- Encriptado - solo últimos 4 dígitos visibles
  ultimos_digitos VARCHAR(4),
  fecha_caducidad VARCHAR(7), -- MM/YYYY
  es_principal BOOLEAN DEFAULT false,
  estado VARCHAR(20) DEFAULT 'activa', -- activa, bloqueada, expirada
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE
);

-- Índices para tarjetas
CREATE INDEX idx_tarjetas_cliente ON clientes_tarjetas(cliente_id);
CREATE INDEX idx_tarjetas_estado ON clientes_tarjetas(estado);

-- 2. TABLA: autorizaciones_pago
-- Registra autorizaciones de pago procesadas
CREATE TABLE IF NOT EXISTS autorizaciones_pago (
  id SERIAL PRIMARY KEY,
  cliente_id INTEGER NOT NULL,
  tarjeta_id INTEGER,
  
  -- Datos de empresa
  empresa_razon_social VARCHAR(255) DEFAULT 'PACIFIC ADVENTURE PACITURE S.A.S',
  empresa_nombre_comercial VARCHAR(255) DEFAULT 'INNOVATION BUSINESS',
  empresa_ruc VARCHAR(50) DEFAULT '1793230574001',
  
  -- Valor y moneda
  monto_numerico DECIMAL(10, 2) NOT NULL,
  monto_letras TEXT,
  moneda VARCHAR(10) DEFAULT 'USD',
  
  -- Motivo y descripción
  motivo TEXT DEFAULT 'Prestación de servicios turísticos nacionales e internacionales',
  descripcion TEXT,
  
  -- Datos del voucher/transacción
  voucher_lote VARCHAR(50),
  voucher_referencia VARCHAR(100),
  voucher_aprobacion VARCHAR(100),
  voucher_modalidad VARCHAR(50), -- venta, preautorización, etc.
  
  -- Estado y auditoría
  estado VARCHAR(30) DEFAULT 'pendiente', -- pendiente, aprobada, rechazada, cancelada
  fecha_autorizacion TIMESTAMP,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Metadata adicional
  metadata JSONB,
  
  FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE,
  FOREIGN KEY (tarjeta_id) REFERENCES clientes_tarjetas(id) ON DELETE SET NULL
);

-- Índices para autorizaciones
CREATE INDEX idx_autorizaciones_cliente ON autorizaciones_pago(cliente_id);
CREATE INDEX idx_autorizaciones_estado ON autorizaciones_pago(estado);
CREATE INDEX idx_autorizaciones_fecha ON autorizaciones_pago(fecha_autorizacion);
CREATE INDEX idx_autorizaciones_referencia ON autorizaciones_pago(voucher_referencia);

-- 3. TABLA: contratos_viajes
-- Almacena el contrato completo de viaje del cliente
CREATE TABLE IF NOT EXISTS contratos_viajes (
  id SERIAL PRIMARY KEY,
  cliente_id INTEGER NOT NULL,
  autorizacion_pago_id INTEGER,
  
  -- Identificación del contrato
  numero_contrato VARCHAR(50) UNIQUE NOT NULL,
  fecha_contrato DATE NOT NULL,
  
  -- Datos del contrato
  valor_contrato DECIMAL(10, 2) NOT NULL,
  anos_contrato INTEGER,
  tarjeta_y_banco TEXT,
  numero_noches INTEGER,
  
  -- Pagaré
  pagare_numero VARCHAR(50),
  pagare_fecha_vencimiento DATE,
  
  -- Estadía
  estadia_internacional JSONB, -- {incluye: boolean, numero_pax: integer}
  estadia_nacional JSONB, -- {incluye: boolean, numero_pax: integer}
  
  -- Beneficios
  cortesias_por_asistencia TEXT,
  ofrecimientos_adicionales TEXT,
  
  -- Aceptación del cliente
  aceptacion_cliente JSONB, -- {firma: string, nombre: string, fecha: string}
  
  -- Estado del contrato
  estado VARCHAR(30) DEFAULT 'pendiente', -- pendiente, firmado, activo, cancelado, completado
  
  -- Datos completos en JSON (plantilla completa)
  datos_completos JSONB,
  
  -- Metadata y auditoría
  metadata JSONB,
  creado_por VARCHAR(100),
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE,
  FOREIGN KEY (autorizacion_pago_id) REFERENCES autorizaciones_pago(id) ON DELETE SET NULL
);

-- Índices para contratos
CREATE INDEX idx_contratos_cliente ON contratos_viajes(cliente_id);
CREATE INDEX idx_contratos_numero ON contratos_viajes(numero_contrato);
CREATE INDEX idx_contratos_estado ON contratos_viajes(estado);
CREATE INDEX idx_contratos_fecha ON contratos_viajes(fecha_contrato);

-- 4. TRIGGERS para actualizar fecha_actualizacion automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_actualizacion = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tarjetas_updated_at BEFORE UPDATE ON clientes_tarjetas 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_autorizaciones_updated_at BEFORE UPDATE ON autorizaciones_pago 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contratos_updated_at BEFORE UPDATE ON contratos_viajes 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- DATOS DE EJEMPLO (opcional - descomentar para testing)
-- ========================================

-- Insertar tarjeta de ejemplo
-- INSERT INTO clientes_tarjetas (cliente_id, nombre_tarjetahabiente, tipo_tarjeta, ultimos_digitos, fecha_caducidad)
-- VALUES (1, 'Juan Perez', 'Visa', '1234', '12/2026');

-- Comentarios finales
COMMENT ON TABLE clientes_tarjetas IS 'Almacena tarjetas de crédito/débito de clientes';
COMMENT ON TABLE autorizaciones_pago IS 'Registra autorizaciones de pago procesadas';
COMMENT ON TABLE contratos_viajes IS 'Almacena contratos de viaje completos con todos los datos';
