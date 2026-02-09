const db = require('./config/database');

async function poblarPaquetes() {
  try {
    console.log('🔄 Poblando base de datos con paquetes turísticos...\n');

    // Limpiar paquetes existentes
    console.log('🧹 Limpiando paquetes existentes...');
    await db.query('DELETE FROM paquetes WHERE id > 0');
    console.log('✅ Paquetes limpiados\n');

    // Datos de paquetes turísticos del frontend
    const paquetes = [
      {
        nombre: "Río de Janeiro - Búzios",
        descripcion: "Disfruta de las playas paradisíacas de Búzios y la vibrante vida nocturna de Río de Janeiro.",
        imagen: "/images/paquetes/RioBuzios.jpeg",
        precio: 1299,
        duracion: "7 días / 6 noches",
        grupo: "2-8 personas",
        calificacion: 4.9,
        tipo: "Internacional",
        activo: true
      },
      {
        nombre: "Panamá - Medellín",
        descripcion: "Explora la modernidad de Panamá y la cultura paisa de Medellín en un viaje inolvidable.",
        imagen: "/images/paquetes/PanamaMedellin.jpeg",
        precio: 899,
        duracion: "6 días / 5 noches",
        grupo: "2-6 personas",
        calificacion: 4.8,
        tipo: "Internacional",
        activo: true
      },
      {
        nombre: "Bogotá Clásico",
        descripcion: "Descubre la capital colombiana con su rica historia, cultura y gastronomía.",
        imagen: "/images/paquetes/BogotaClasico.jpeg",
        precio: 699,
        duracion: "4 días / 3 noches",
        grupo: "2-10 personas",
        calificacion: 4.7,
        tipo: "Internacional",
        activo: true
      },
      {
        nombre: "Esencias de Grecia",
        descripcion: "Sumérgete en la cuna de la civilización occidental con sus islas y monumentos históricos.",
        imagen: "/images/paquetes/EsenciasGrecia.jpeg",
        precio: 2199,
        duracion: "10 días / 9 noches",
        grupo: "2-12 personas",
        calificacion: 4.9,
        tipo: "Internacional",
        activo: true
      },
      {
        nombre: "Panamá - Isla Mamey",
        descripcion: "Relájate en las paradisíacas playas de Isla Mamey con aguas cristalinas y arena blanca.",
        imagen: "/images/paquetes/PanamaIslaMamey.jpeg",
        precio: 1199,
        duracion: "5 días / 4 noches",
        grupo: "2-8 personas",
        calificacion: 4.8,
        tipo: "Internacional",
        activo: true
      },
      {
        nombre: "Joyas del Este - Nueva York",
        descripcion: "Experimenta la Gran Manzana con sus icónicos lugares y la vibrante vida urbana.",
        imagen: "/images/paquetes/JoyasEsteNewYork.jpeg",
        precio: 1899,
        duracion: "6 días / 5 noches",
        grupo: "2-15 personas",
        calificacion: 4.9,
        tipo: "Internacional",
        activo: true
      },
      {
        nombre: "Galápagos - Santa Cruz",
        descripcion: "Explora las islas encantadas con tours guiados y encuentros únicos con la fauna marina.",
        imagen: "/images/paquetes/GalapagosSantaCruz.jpeg",
        precio: 1499,
        duracion: "5 días / 4 noches",
        grupo: "2-8 personas",
        calificacion: 4.9,
        tipo: "Nacional",
        activo: true
      },
      {
        nombre: "India - Triángulo de Oro",
        descripcion: "Descubre Delhi, Jaipur y Agra con sus majestuosos monumentos y rica cultura.",
        imagen: "/images/paquetes/DelhiJaipurAmberAbhaneriAgra.jpeg",
        precio: 1799,
        duracion: "8 días / 7 noches",
        grupo: "2-12 personas",
        calificacion: 4.8,
        tipo: "Internacional",
        activo: true
      },
      {
        nombre: "Estéreo Picnic",
        descripcion: "Vive la experiencia del festival de música más importante de Colombia.",
        imagen: "/images/paquetes/EstereoPicnic.jpeg",
        precio: 599,
        duracion: "3 días / 2 noches",
        grupo: "2-6 personas",
        calificacion: 4.6,
        tipo: "Internacional",
        activo: true
      },
      {
        nombre: "India - Triángulo de Oro",
        descripcion: "Recorre los destinos más emblemáticos de la India con guías expertos.",
        imagen: "/images/paquetes/IndiaTrianguloOro.jpeg",
        precio: 1699,
        duracion: "9 días / 8 noches",
        grupo: "2-10 personas",
        calificacion: 4.8,
        tipo: "Internacional",
        activo: true
      },
      {
        nombre: "Lima - Huacachina",
        descripcion: "Descubre la capital gastronómica de América y el oasis de Huacachina.",
        imagen: "/images/paquetes/LimaHuacachina.jpeg",
        precio: 799,
        duracion: "5 días / 4 noches",
        grupo: "2-8 personas",
        calificacion: 4.7,
        tipo: "Internacional",
        activo: true
      },
      {
        nombre: "Guatapé",
        descripcion: "Explora el pueblo más colorido de Colombia con su famosa Piedra del Peñol.",
        imagen: "/images/paquetes/Guatape.jpeg",
        precio: 399,
        duracion: "2 días / 1 noche",
        grupo: "2-6 personas",
        calificacion: 4.5,
        tipo: "Internacional",
        activo: true
      },
      {
        nombre: "San Andrés - Carnaval",
        descripcion: "Disfruta del carnaval más colorido del Caribe en las paradisíacas islas de San Andrés.",
        imagen: "/images/paquetes/SanAndresCarnaval.jpeg",
        precio: 899,
        duracion: "4 días / 3 noches",
        grupo: "2-8 personas",
        calificacion: 4.8,
        tipo: "Internacional",
        activo: true
      },
      {
        nombre: "Panamá Navideño",
        descripcion: "Vive la magia de la Navidad en Panamá con sus tradiciones y festividades únicas.",
        imagen: "/images/paquetes/PanamaNavideno.jpeg",
        precio: 1099,
        duracion: "5 días / 4 noches",
        grupo: "2-8 personas",
        calificacion: 4.8,
        tipo: "Internacional",
        activo: true
      },
      {
        nombre: "Cali Salsero",
        descripcion: "Sumérgete en la capital mundial de la salsa con sus ritmos y cultura vibrante.",
        imagen: "/images/paquetes/CaliSalsero.jpeg",
        precio: 599,
        duracion: "3 días / 2 noches",
        grupo: "2-6 personas",
        calificacion: 4.6,
        tipo: "Internacional",
        activo: true
      },
      {
        nombre: "Santander Máximo",
        descripcion: "Explora los paisajes más espectaculares de Santander con aventura y naturaleza.",
        imagen: "/images/paquetes/SantanderMaximo.jpeg",
        precio: 799,
        duracion: "4 días / 3 noches",
        grupo: "2-8 personas",
        calificacion: 4.7,
        tipo: "Internacional",
        activo: true
      },
      {
        nombre: "Turquía - Bursa & Egipto",
        descripcion: "Descubre la rica historia de Turquía y los misterios del antiguo Egipto.",
        imagen: "/images/paquetes/TurquiaBursaEgipto.jpeg",
        precio: 2499,
        duracion: "12 días / 11 noches",
        grupo: "2-15 personas",
        calificacion: 4.9,
        tipo: "Internacional",
        activo: true
      }
    ];

    console.log('📦 Insertando paquetes turísticos...');
    let insertados = 0;

    for (const paquete of paquetes) {
      try {
        const result = await db.query(
          `INSERT INTO paquetes (nombre, descripcion, imagen, precio, duracion, grupo, calificacion, tipo, activo, fecha_creacion, fecha_actualizacion) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW()) 
           RETURNING id`,
          [
            paquete.nombre,
            paquete.descripcion,
            paquete.imagen,
            paquete.precio,
            paquete.duracion,
            paquete.grupo,
            paquete.calificacion,
            paquete.tipo,
            paquete.activo
          ]
        );
        insertados++;
        console.log(`  ✓ ${paquete.nombre}`);
      } catch (error) {
        console.log(`  ✗ Error al insertar ${paquete.nombre}: ${error.message}`);
      }
    }

    console.log(`\n✅ Se insertaron ${insertados} paquetes correctamente\n`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al poblar paquetes:', error.message);
    process.exit(1);
  }
}

poblarPaquetes();
