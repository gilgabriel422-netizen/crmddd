-- Añadir columna sala a clientes (Sala 1 / Sala 2)
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS sala VARCHAR(20) DEFAULT 'Sala 1';
