import React from 'react'
import { Link } from 'react-router-dom'
import { MapPin, Calendar, Users, Star, ArrowRight } from 'lucide-react'

const FeaturedPackages = () => {
  const featuredPackages = [
    {
      id: 1,
      title: "Galápagos Santa Cruz",
      description: "Descubre las islas encantadas con tours guiados por expertos naturalistas",
      price: "Desde $1,299",
      duration: "5 días / 4 noches",
      image: "/images/paquetes/GalapagosSantaCruz.jpeg",
      rating: 4.9,
      reviews: 127,
      features: ["Tortugas gigantes", "Snorkeling", "Guía naturalista", "Alojamiento incluido"]
    },
    {
      id: 2,
      title: "India Triángulo de Oro",
      description: "Explora los tesoros culturales de Delhi, Jaipur y Agra con el Taj Mahal",
      price: "Desde $1,899",
      duration: "8 días / 7 noches",
      image: "/images/paquetes/IndiaTrianguloOro.jpeg",
      rating: 4.8,
      reviews: 89,
      features: ["Taj Mahal", "Palacio de Amber", "Fuerte Rojo", "Guía local"]
    },
    {
      id: 3,
      title: "Esencias de Grecia",
      description: "Descubre la cuna de la civilización occidental con sus islas paradisíacas",
      price: "Desde $1,599",
      duration: "7 días / 6 noches",
      image: "/images/paquetes/EsenciasGrecia.jpeg",
      rating: 4.7,
      reviews: 203,
      features: ["Santorini", "Mykonos", "Atenas", "Crucero incluido"]
    }
  ]

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Paquetes Destacados
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Descubre nuestros paquetes más populares y vive experiencias únicas en Ecuador
          </p>
        </div>

        {/* Packages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {featuredPackages.map((pkg) => (
            <div key={pkg.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              {/* Image */}
              <div className="relative h-64 overflow-hidden">
                <img 
                  src={pkg.image} 
                  alt={pkg.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
                  <span className="text-sm font-semibold text-navy">{pkg.price}</span>
                </div>
                <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
                  <div className="flex items-center gap-1">
                    <Star size={16} className="text-yellow-400 fill-current" />
                    <span className="text-sm font-semibold text-gray-900">{pkg.rating}</span>
                    <span className="text-sm text-gray-600">({pkg.reviews})</span>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{pkg.title}</h3>
                <p className="text-gray-600 mb-4">{pkg.description}</p>
                
                {/* Duration */}
                <div className="flex items-center gap-2 mb-4">
                  <Calendar size={16} className="text-light-blue" />
                  <span className="text-sm text-gray-600">{pkg.duration}</span>
                </div>

                {/* Features */}
                <div className="space-y-2 mb-6">
                  {pkg.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-light-blue rounded-full"></div>
                      <span className="text-sm text-gray-600">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                <Link 
                  to="/paquetes" 
                  className="w-full bg-light-blue hover:bg-navy text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 group"
                >
                  Ver Detalles
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center">
          <Link 
            to="/paquetes"
            className="inline-flex items-center gap-2 bg-navy hover:bg-navy/90 text-white font-bold py-4 px-8 rounded-lg transition-all duration-300 transform hover:scale-105"
          >
            <MapPin size={20} />
            Ver Todos los Paquetes
            <ArrowRight size={20} />
          </Link>
        </div>
      </div>
    </section>
  )
}

export default FeaturedPackages
