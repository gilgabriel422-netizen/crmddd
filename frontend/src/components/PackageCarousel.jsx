import React, { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Star, MapPin, Calendar, Users, ArrowRight } from 'lucide-react'

const PackageCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0)
  
  // Los primeros 5 paquetes más populares con fotos de Unsplash
  const packages = [
    {
      id: 1,
      name: "Río de Janeiro - Búzios",
      description: "Disfruta de las playas paradisíacas de Búzios y la vibrante vida nocturna de Río de Janeiro.",
      image: "https://images.unsplash.com/photo-1483729558449-fd1d215e7baf?w=1200&h=600&fit=crop",
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
      image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=600&fit=crop",
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
      image: "https://images.unsplash.com/photo-1501584257286-2b4ec5f87308?w=1200&h=600&fit=crop",
      price: "Desde $699",
      duration: "4 días / 3 noches",
      group: "2-10 personas",
      rating: 4.7,
      type: "Internacional"
    },
    {
      id: 4,
      name: "Santorini - Grecia",
      description: "Sumérgete en la cuna de la civilización occidental con sus islas y monumentos históricos.",
      image: "https://images.unsplash.com/photo-1613395877344-13d4a8e0d049?w=1200&h=600&fit=crop",
      price: "Desde $2,199",
      duration: "10 días / 9 noches",
      group: "2-12 personas",
      rating: 4.9,
      type: "Internacional"
    },
    {
      id: 5,
      name: "Isla Mamey - Panamá",
      description: "Relájate en las paradisíacas playas de Isla Mamey con aguas cristalinas y arena blanca.",
      image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200&h=600&fit=crop",
      price: "Desde $1,199",
      duration: "5 días / 4 noches",
      group: "2-8 personas",
      rating: 4.8,
      type: "Internacional"
    }
  ]

  // Auto-play del carrusel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % packages.length)
    }, 5000) // Cambia cada 5 segundos

    return () => clearInterval(interval)
  }, [packages.length])

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? packages.length - 1 : prevIndex - 1
    )
  }

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % packages.length)
  }

  const goToSlide = (index) => {
    setCurrentIndex(index)
  }

  const openWhatsApp = (packageName) => {
    const message = `Hola! Me interesa el paquete "${packageName}". ¿Podrían darme más información?`
    window.open(`https://wa.me/593999222210?text=${encodeURIComponent(message)}`, '_blank')
  }

  return (
    <div className="relative w-full h-full">
      {/* Carrusel Container */}
      <div className="relative overflow-hidden h-full">
        <div 
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {packages.map((pkg, index) => (
            <div key={pkg.id} className="w-full flex-shrink-0">
              <div className="relative h-screen">
                {/* Imagen de fondo */}
                <div 
                  className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                  style={{ backgroundImage: `url(${pkg.image})` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30"></div>
                </div>

                {/* Contenido del paquete */}
                <div className="relative z-10 h-full flex items-center">
                  <div className="container mx-auto px-6 lg:px-8">
                    <div className="max-w-4xl">
                      {/* Badge de tipo */}
                      <div className="inline-flex items-center px-4 py-2 rounded-full bg-amber-500/30 backdrop-blur-sm border border-amber-400/50 mb-6">
                        <span className="text-amber-200 font-semibold text-sm">{pkg.type}</span>
                      </div>

                      {/* Título - Nombre y tipo separados */}
                      <div className="mb-8">
                        <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-4">
                          {pkg.name.split(' - ')[0]}
                        </h2>
                        <p className="text-2xl md:text-3xl text-amber-200 font-semibold">
                          {pkg.name.split(' - ')[1] || pkg.type}
                        </p>
                      </div>

                      {/* Descripción */}
                      <p className="text-xl md:text-2xl text-gray-200 mb-8 leading-relaxed">
                        {pkg.description}
                      </p>

                      {/* Detalles del paquete */}
                      <div className="flex flex-wrap gap-6 mb-8">
                        <div className="flex items-center gap-2 text-amber-200">
                          <Calendar size={20} />
                          <span className="text-sm font-medium">{pkg.duration}</span>
                        </div>
                        <div className="flex items-center gap-2 text-amber-200">
                          <Users size={20} />
                          <span className="text-sm font-medium">{pkg.group}</span>
                        </div>
                        <div className="flex items-center gap-2 text-amber-300">
                          <Star size={20} className="fill-current" />
                          <span className="text-sm font-medium">{pkg.rating}</span>
                        </div>
                      </div>

                      {/* Precio y CTA */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                        <div className="text-3xl md:text-4xl font-bold text-amber-300">
                          {pkg.price}
                        </div>
                        <button
                          onClick={() => openWhatsApp(pkg.name)}
                          className="btn-secondary text-lg px-8 py-4 flex items-center gap-3 group"
                        >
                          Solicitar información
                          <ArrowRight 
                            size={20} 
                            className="group-hover:translate-x-1 transition-transform duration-300" 
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Botones de navegación */}
        <button
          onClick={goToPrevious}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-3 rounded-full transition-all duration-300 backdrop-blur-sm"
          aria-label="Paquete anterior"
        >
          <ChevronLeft size={24} />
        </button>
        <button
          onClick={goToNext}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-3 rounded-full transition-all duration-300 backdrop-blur-sm"
          aria-label="Siguiente paquete"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      {/* Indicadores flotantes */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3">
        {packages.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 backdrop-blur-sm ${
              index === currentIndex 
                ? 'bg-white scale-125' 
                : 'bg-white/50 hover:bg-white/70'
            }`}
            aria-label={`Ir al paquete ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}

export default PackageCarousel
