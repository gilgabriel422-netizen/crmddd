-- Limpiar paquetes existentes
DELETE FROM paquetes WHERE id > 0;

-- Insertar paquetes turísticos
INSERT INTO paquetes (nombre, descripcion, imagen, precio, duracion, grupo, calificacion, tipo, activo, fecha_creacion, fecha_actualizacion) VALUES
('Río de Janeiro - Búzios', 'Disfruta de las playas paradisíacas de Búzios y la vibrante vida nocturna de Río de Janeiro.', '/images/paquetes/RioBuzios.jpeg', 1299.00, '7 días / 6 noches', '2-8 personas', 4.9, 'Internacional', true, NOW(), NOW()),
('Panamá - Medellín', 'Explora la modernidad de Panamá y la cultura paisa de Medellín en un viaje inolvidable.', '/images/paquetes/PanamaMedellin.jpeg', 899.00, '6 días / 5 noches', '2-6 personas', 4.8, 'Internacional', true, NOW(), NOW()),
('Bogotá Clásico', 'Descubre la capital colombiana con su rica historia, cultura y gastronomía.', '/images/paquetes/BogotaClasico.jpeg', 699.00, '4 días / 3 noches', '2-10 personas', 4.7, 'Internacional', true, NOW(), NOW()),
('Esencias de Grecia', 'Sumérgete en la cuna de la civilización occidental con sus islas y monumentos históricos.', '/images/paquetes/EsenciasGrecia.jpeg', 2199.00, '10 días / 9 noches', '2-12 personas', 4.9, 'Internacional', true, NOW(), NOW()),
('Panamá - Isla Mamey', 'Relájate en las paradisíacas playas de Isla Mamey con aguas cristalinas y arena blanca.', '/images/paquetes/PanamaIslaMamey.jpeg', 1199.00, '5 días / 4 noches', '2-8 personas', 4.8, 'Internacional', true, NOW(), NOW()),
('Joyas del Este - Nueva York', 'Experimenta la Gran Manzana con sus icónicos lugares y la vibrante vida urbana.', '/images/paquetes/JoyasEsteNewYork.jpeg', 1899.00, '6 días / 5 noches', '2-15 personas', 4.9, 'Internacional', true, NOW(), NOW()),
('Galápagos - Santa Cruz', 'Explora las islas encantadas con tours guiados y encuentros únicos con la fauna marina.', '/images/paquetes/GalapagosSantaCruz.jpeg', 1499.00, '5 días / 4 noches', '2-8 personas', 4.9, 'Nacional', true, NOW(), NOW()),
('India - Triángulo de Oro', 'Descubre Delhi, Jaipur y Agra con sus majestuosos monumentos y rica cultura.', '/images/paquetes/DelhiJaipurAmberAbhaneriAgra.jpeg', 1799.00, '8 días / 7 noches', '2-12 personas', 4.8, 'Internacional', true, NOW(), NOW()),
('Estéreo Picnic', 'Vive la experiencia del festival de música más importante de Colombia.', '/images/paquetes/EstereoPicnic.jpeg', 599.00, '3 días / 2 noches', '2-6 personas', 4.6, 'Internacional', true, NOW(), NOW()),
('India - Triángulo de Oro', 'Recorre los destinos más emblemáticos de la India con guías expertos.', '/images/paquetes/IndiaTrianguloOro.jpeg', 1699.00, '9 días / 8 noches', '2-10 personas', 4.8, 'Internacional', true, NOW(), NOW()),
('Lima - Huacachina', 'Descubre la capital gastronómica de América y el oasis de Huacachina.', '/images/paquetes/LimaHuacachina.jpeg', 799.00, '5 días / 4 noches', '2-8 personas', 4.7, 'Internacional', true, NOW(), NOW()),
('Guatapé', 'Explora el pueblo más colorido de Colombia con su famosa Piedra del Peñol.', '/images/paquetes/Guatape.jpeg', 399.00, '2 días / 1 noche', '2-6 personas', 4.5, 'Internacional', true, NOW(), NOW()),
('San Andrés - Carnaval', 'Disfruta del carnaval más colorido del Caribe en las paradisíacas islas de San Andrés.', '/images/paquetes/SanAndresCarnaval.jpeg', 899.00, '4 días / 3 noches', '2-8 personas', 4.8, 'Internacional', true, NOW(), NOW()),
('Panamá Navideño', 'Vive la magia de la Navidad en Panamá con sus tradiciones y festividades únicas.', '/images/paquetes/PanamaNavideno.jpeg', 1099.00, '5 días / 4 noches', '2-8 personas', 4.8, 'Internacional', true, NOW(), NOW()),
('Cali Salsero', 'Sumérgete en la capital mundial de la salsa con sus ritmos y cultura vibrante.', '/images/paquetes/CaliSalsero.jpeg', 599.00, '3 días / 2 noches', '2-6 personas', 4.6, 'Internacional', true, NOW(), NOW()),
('Santander Máximo', 'Explora los paisajes más espectaculares de Santander con aventura y naturaleza.', '/images/paquetes/SantanderMaximo.jpeg', 799.00, '4 días / 3 noches', '2-8 personas', 4.7, 'Internacional', true, NOW(), NOW()),
('Turquía - Bursa & Egipto', 'Descubre la rica historia de Turquía y los misterios del antiguo Egipto.', '/images/paquetes/TurquiaBursaEgipto.jpeg', 2499.00, '12 días / 11 noches', '2-15 personas', 4.9, 'Internacional', true, NOW(), NOW());

-- Confirmar que se insertaron
SELECT COUNT(*) as total_paquetes FROM paquetes;
