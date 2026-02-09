-- Renombrar columnas con ñ a nombres sin ñ
-- Ejecutar una sola vez en la base de datos actual

ALTER TABLE clientes RENAME COLUMN "años" TO anos;
ALTER TABLE clientes RENAME COLUMN "años_indefinido" TO anos_indefinido;
