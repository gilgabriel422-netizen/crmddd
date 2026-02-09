import React from 'react'
import { Star, MapPin, Calendar, Users, ArrowRight } from 'lucide-react'

const Packages = () => {
  const packages = [
    {
      id: 1,
      name: "Río de Janeiro - Búzios",
      description: "Disfruta de las playas paradisíacas de Búzios y la vibrante vida nocturna de Río de Janeiro.",
      image: "/images/paquetes/RioBuzios.jpeg",
      price: "Desde $1,299",
      duration: "7 días / 6 noches",
      group: "2-8 personas",
      rating: 4.9,
      type: "Internacional"
    },
    {
      id: 2,
      name: "Panamá - Medellín",
      description: "Explora la modernidad de Panamá y la cultura paisa de Medellín en un viaje inolvidable.",
      image: "/images/paquetes/PanamaMedellin.jpeg",
      price: "Desde $899",
      duration: "6 días / 5 noches",
      group: "2-6 personas",
      rating: 4.8,
      type: "Internacional"
    },
    {
      id: 3,
      name: "Bogotá Clásico",
      description: "Descubre la capital colombiana con su rica historia, cultura y gastronomía.",
      image: "/images/paquetes/BogotaClasico.jpeg",
      price: "Desde $699",
      duration: "4 días / 3 noches",
      group: "2-10 personas",
      rating: 4.7,
      type: "Internacional"
    },
    {
      id: 4,
      name: "Esencias de Grecia",
      description: "Sumérgete en la cuna de la civilización occidental con sus islas y monumentos históricos.",
      image: "/images/paquetes/EsenciasGrecia.jpeg",
      price: "Desde $2,199",
      duration: "10 días / 9 noches",
      group: "2-12 personas",
      rating: 4.9,
      type: "Internacional"
    },
    {
      id: 5,
      name: "Panamá - Isla Mamey",
      description: "Relájate en las paradisíacas playas de Isla Mamey con aguas cristalinas y arena blanca.",
      image: "/images/paquetes/PanamaIslaMamey.jpeg",
      price: "Desde $1,199",
      duration: "5 días / 4 noches",
      group: "2-8 personas",
      rating: 4.8,
      type: "Internacional"
    },
    {
      id: 6,
      name: "Joyas del Este - Nueva York",
      description: "Experimenta la Gran Manzana con sus icónicos lugares y la vibrante vida urbana.",
      image: "/images/paquetes/JoyasEsteNewYork.jpeg",
      price: "Desde $1,899",
      duration: "6 días / 5 noches",
      group: "2-15 personas",
      rating: 4.9,
      type: "Internacional"
    },
    {
      id: 7,
      name: "Galápagos - Santa Cruz",
      description: "Explora las islas encantadas con tours guiados y encuentros únicos con la fauna marina.",
      image: "/images/paquetes/GalapagosSantaCruz.jpeg",
      price: "Desde $1,499",
      duration: "5 días / 4 noches",
      group: "2-8 personas",
      rating: 4.9,
      type: "Nacional"
    },
    {
      id: 8,
      name: "India - Triángulo de Oro",
      description: "Descubre Delhi, Jaipur y Agra con sus majestuosos monumentos y rica cultura.",
      image: "/images/paquetes/DelhiJaipurAmberAbhaneriAgra.jpeg",
      price: "Desde $1,799",
      duration: "8 días / 7 noches",
      group: "2-12 personas",
      rating: 4.8,
      type: "Internacional"
    },
    {
      id: 9,
      name: "Estéreo Picnic",
      description: "Vive la experiencia del festival de música más importante de Colombia.",
      image: "/images/paquetes/EstereoPicnic.jpeg",
      price: "Desde $599",
      duration: "3 días / 2 noches",
      group: "2-6 personas",
      rating: 4.6,
      type: "Internacional"
    },
    {
      id: 10,
      name: "India - Triángulo de Oro",
      description: "Recorre los destinos más emblemáticos de la India con guías expertos.",
      image: "/images/paquetes/IndiaTrianguloOro.jpeg",
      price: "Desde $1,699",
      duration: "9 días / 8 noches",
      group: "2-10 personas",
      rating: 4.8,
      type: "Internacional"
    },
    {
      id: 11,
      name: "Lima - Huacachina",
      description: "Descubre la capital gastronómica de América y el oasis de Huacachina.",
      image: "/images/paquetes/LimaHuacachina.jpeg",
      price: "Desde $799",
      duration: "5 días / 4 noches",
      group: "2-8 personas",
      rating: 4.7,
      type: "Internacional"
    },
    {
      id: 12,
      name: "Guatapé",
      description: "Explora el pueblo más colorido de Colombia con su famosa Piedra del Peñol.",
      image: "/images/paquetes/Guatape.jpeg",
      price: "Desde $399",
      duration: "2 días / 1 noche",
      group: "2-6 personas",
      rating: 4.5,
      type: "Internacional"
    },
    {
      id: 13,
      name: "San Andrés - Carnaval",
      description: "Disfruta del carnaval más colorido del Caribe en las paradisíacas islas de San Andrés.",
      image: "/images/paquetes/SanAndresCarnaval.jpeg",
      price: "Desde $899",
      duration: "4 días / 3 noches",
      group: "2-8 personas",
      rating: 4.8,
      type: "Internacional"
    },
    {
      id: 14,
      name: "Bogotá Clásico",
      description: "Una experiencia completa de la capital colombiana con sus principales atractivos.",
      image: "/images/paquetes/BogotaClasic.jpeg",
      price: "Desde $699",
      duration: "4 días / 3 noches",
      group: "2-10 personas",
      rating: 4.7,
      type: "Internacional"
    },
    {
      id: 15,
      name: "Panamá Navideño",
      description: "Vive la magia de la Navidad en Panamá con sus tradiciones y festividades únicas.",
      image: "/images/paquetes/PanamaNavideno.jpeg",
      price: "Desde $1,099",
      duration: "5 días / 4 noches",
      group: "2-8 personas",
      rating: 4.8,
      type: "Internacional"
    },
    {
      id: 16,
      name: "Cali Salsero",
      description: "Sumérgete en la capital mundial de la salsa con sus ritmos y cultura vibrante.",
      image: "/images/paquetes/CaliSalsero.jpeg",
      price: "Desde $599",
      duration: "3 días / 2 noches",
      group: "2-6 personas",
      rating: 4.6,
      type: "Internacional"
    },
    {
      id: 17,
      name: "Santander Máximo",
      description: "Explora los paisajes más espectaculares de Santander con aventura y naturaleza.",
      image: "/images/paquetes/SantanderMaximo.jpeg",
      price: "Desde $799",
      duration: "4 días / 3 noches",
      group: "2-8 personas",
      rating: 4.7,
      type: "Internacional"
    },
    {
      id: 18,
      name: "Turquía - Bursa & Egipto",
      description: "Descubre la rica historia de Turquía y los misterios del antiguo Egipto.",
      image: "/images/paquetes/TurquiaBursaEgipto.jpeg",
      price: "Desde $2,499",
      duration: "12 días / 11 noches",
      group: "2-15 personas",
      rating: 4.9,
      type: "Internacional"
    }
  ]

  const openWhatsApp = (packageName) => {
    const message = `Hola! Me interesa el paquete "${packageName}". ¿Podrían darme más información?`
    window.open(`https://wa.me/593999222210?text=${encodeURIComponent(message)}`, '_blank')
  }

  return (
    <section id="paquetes" className="py-20 bg-gradient-to-b from-gray-900 via-amber-950 to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16 animate-slide-up">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-amber-200 mb-6">
            Paquetes Turísticos Activos
          </h2>
          <p className="text-xl text-amber-100 max-w-3xl mx-auto">
            Descubre nuestras ofertas más populares y planifica tu próxima aventura 
            con paquetes personalizados para todos los gustos y presupuestos.
          </p>
        </div>

        {/* Packages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {packages.map((pkg, index) => (
            <div 
              key={pkg.id} 
              className="card overflow-hidden animate-slide-up bg-gray-800/50 backdrop-blur border border-amber-700/30 hover:border-amber-500/50 transition-colors duration-300"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Package Image */}
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={pkg.image} 
                  alt={pkg.name}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                />
                <div className="absolute top-4 left-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    pkg.type === 'Nacional' 
                      ? 'bg-amber-600 text-white' 
                      : 'bg-amber-500 text-white'
                  }`}>
                    {pkg.type}
                  </span>
                </div>
                <div className="absolute top-4 right-4 flex items-center gap-1 bg-amber-600/90 px-2 py-1 rounded-full">
                  <Star size={14} className="text-amber-200 fill-current" />
                  <span className="text-sm font-semibold text-amber-100">{pkg.rating}</span>
                </div>
              </div>

              {/* Package Content */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-amber-200 mb-3">{pkg.name}</h3>
                <p className="text-amber-100 mb-4 line-clamp-3">{pkg.description}</p>
                
                {/* Package Details */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-amber-300">
                    <Calendar size={16} />
                    <span>{pkg.duration}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-amber-300">
                    <Users size={16} />
                    <span>{pkg.group}</span>
                  </div>
                </div>

                {/* Price and CTA */}
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold text-amber-300">{pkg.price}</div>
                  <button
                    onClick={() => openWhatsApp(pkg.name)}
                    className="btn-secondary flex items-center gap-2"
                  >
                    Ver más
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <button
            onClick={() => openWhatsApp("todos los paquetes")}
            className="btn-primary text-lg px-8 py-4"
          >
            Ver todos los paquetes
          </button>
        </div>
      </div>
    </section>
  )
}

export default Packages
