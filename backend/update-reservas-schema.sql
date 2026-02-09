-- Desactivar FK temporalmente
ALTER TABLE reservas DROP CONSTRAINT IF EXISTS reservas_cliente_id_fkey;

-- Hacer cliente_id nullable
ALTER TABLE reservas ALTER COLUMN cliente_id DROP NOT NULL;

-- Agregar nuevas columnas si no existen
ALTER TABLE reservas ADD COLUMN IF NOT EXISTS usuario_id INTEGER;
ALTER TABLE reservas ADD COLUMN IF NOT EXISTS paquete_id INTEGER;
ALTER TABLE reservas ADD COLUMN IF NOT EXISTS tipo_habitacion VARCHAR(100);

-- Verificar estructura
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'reservas'
ORDER BY ordinal_position;
