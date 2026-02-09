import React from 'react'
import { Star, Quote, MapPin, Calendar, Heart } from 'lucide-react'

const Experiencias = () => {
  const experiences = [
    {
      id: 1,
      name: "María González",
      location: "Quito, Ecuador",
      destination: "Islas Galápagos",
      duration: "5 días / 4 noches",
      rating: 5,
      text: "¡Una experiencia inolvidable! Las tortugas gigantes, los leones marinos y la diversidad marina me dejaron sin palabras. El guía naturalista era muy profesional y conocía cada detalle de las islas. Definitivamente volveré.",
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
      tripImage: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      highlights: ["Tortugas gigantes", "Snorkeling", "Leones marinos", "Guía naturalista"]
    },
    {
      id: 2,
      name: "Carlos Rodríguez",
      location: "Guayaquil, Ecuador",
      destination: "Amazonía Ecuatoriana",
      duration: "4 días / 3 noches",
      rating: 5,
      text: "El lodge en la selva era espectacular. Las caminatas nocturnas fueron emocionantes y pudimos ver animales que nunca habíamos visto. El personal del lodge muy atento y las comidas deliciosas. Una experiencia única.",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
      tripImage: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      highlights: ["Lodge en la selva", "Caminatas nocturnas", "Observación de aves", "Comidas incluidas"]
    },
    {
      id: 3,
      name: "Ana Martínez",
      location: "Cuenca, Ecuador",
      destination: "Quito Colonial",
      duration: "2 días / 1 noche",
      rating: 5,
      text: "El tour por el centro histórico de Quito fue fascinante. La arquitectura colonial, la Mitad del Mundo y el teleférico con vistas espectaculares. El guía bilingüe muy preparado. Recomiendo 100% esta experiencia.",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
      tripImage: "https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      highlights: ["Centro histórico", "Mitad del mundo", "Teleférico", "Guía bilingüe"]
    },
    {
      id: 4,
      name: "Roberto Silva",
      location: "Ambato, Ecuador",
      destination: "Avenida de los Volcanes",
      duration: "3 días / 2 noches",
      rating: 5,
      text: "Los paisajes andinos son impresionantes. Visitamos varios volcanes, pueblos indígenas y mercados tradicionales. La organización del viaje fue perfecta y el alojamiento muy cómodo. Una experiencia cultural increíble.",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
      tripImage: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      highlights: ["Volcanes andinos", "Pueblos indígenas", "Mercados tradicionales", "Paisajes únicos"]
    },
    {
      id: 5,
      name: "Patricia López",
      location: "Manta, Ecuador",
      destination: "Costa del Pacífico",
      duration: "3 días / 2 noches",
      rating: 5,
      text: "La costa ecuatoriana es hermosa. Disfrutamos de playas paradisíacas, avistamiento de ballenas y deliciosa comida marina. El hotel frente al mar era perfecto. Una escapada relajante y memorable.",
      image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
      tripImage: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      highlights: ["Playas paradisíacas", "Avistamiento de ballenas", "Comida marina", "Hotel frente al mar"]
    },
    {
      id: 6,
      name: "Diego Herrera",
      location: "Loja, Ecuador",
      destination: "Vilcabamba - Valle de la Longevidad",
      duration: "2 días / 1 noche",
      rating: 5,
      text: "Vilcabamba es un lugar mágico. El clima perfecto, la gente longeva y los paisajes verdes son únicos. Hicimos caminatas, visitamos fincas orgánicas y nos relajamos completamente. Una experiencia rejuvenecedora.",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80",
      tripImage: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      highlights: ["Valle de la longevidad", "Fincas orgánicas", "Caminatas", "Clima perfecto"]
    }
  ]

  return (
    <section id="experiencias" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Experiencias de Nuestros Viajeros
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Descubre las historias reales de nuestros clientes y las experiencias únicas que vivieron con nosotros
          </p>
        </div>

        {/* Experiences Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {experiences.map((experience) => (
            <div key={experience.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              {/* Trip Image */}
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={experience.tripImage} 
                  alt={experience.destination}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
                  <div className="flex items-center gap-1">
                    <MapPin size={14} className="text-navy" />
                    <span className="text-sm font-semibold text-navy">{experience.destination}</span>
                  </div>
                </div>
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
                  <div className="flex items-center gap-1">
                    <Calendar size={14} className="text-navy" />
                    <span className="text-sm font-semibold text-navy">{experience.duration}</span>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Quote Icon */}
                <div className="text-accent mb-4">
                  <Quote size={24} />
                </div>

                {/* Rating */}
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(experience.rating)].map((_, i) => (
                    <Star key={i} size={16} className="text-yellow-400 fill-current" />
                  ))}
                </div>

                {/* Testimonial Text */}
                <p className="text-gray-600 mb-6 leading-relaxed text-sm">
                  "{experience.text}"
                </p>

                {/* Highlights */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Destacados del viaje:</h4>
                  <div className="flex flex-wrap gap-2">
                    {experience.highlights.map((highlight, index) => (
                      <span key={index} className="bg-light-blue/10 text-light-blue text-xs px-2 py-1 rounded-full">
                        {highlight}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Author */}
                <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                  <img 
                    src={experience.image} 
                    alt={experience.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-semibold text-gray-900">{experience.name}</div>
                    <div className="text-sm text-gray-500">{experience.location}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <div className="bg-navy rounded-2xl p-12 text-white">
            <h3 className="text-3xl font-bold mb-4">¿Quieres vivir tu propia experiencia?</h3>
            <p className="text-xl text-gray-300 mb-8">
              Únete a nuestros viajeros satisfechos y crea recuerdos inolvidables
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="https://wa.me/593999222210?text=Hola! Me gustaría obtener información sobre sus paquetes turísticos."
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-8 rounded-lg transition-all duration-300 transform hover:scale-105"
              >
                Contactar por WhatsApp
              </a>
              <a 
                href="/paquetes"
                className="bg-accent hover:bg-accent/90 text-navy font-bold py-4 px-8 rounded-lg transition-all duration-300 transform hover:scale-105"
              >
                Ver Paquetes Disponibles
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Experiencias