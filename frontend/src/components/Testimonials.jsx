import React, { useState, useEffect } from 'react'
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react'

const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0)

  const testimonials = [
    {
      id: 1,
      name: "María González",
      location: "Quito, Ecuador",
      rating: 5,
      comment: "Mi viaje a Galápagos con Kempery World Travel fue increíble. Todo estuvo perfectamente organizado, desde el alojamiento hasta las excursiones. Los guías eran expertos y conocían cada rincón de las islas. Definitivamente volveré a viajar con ellos.",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
      package: "Galápagos - Aventura Marina"
    },
    {
      id: 2,
      name: "Carlos Rodríguez",
      location: "Guayaquil, Ecuador",
      rating: 5,
      comment: "Excelente experiencia en el Amazonas. El lodge era espectacular y las actividades superaron mis expectativas. El equipo de Kempery se encargó de cada detalle. Recomiendo 100% sus servicios para cualquier destino.",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
      package: "Amazonas Ecuatoriano"
    },
    {
      id: 3,
      name: "Ana Martínez",
      location: "Cuenca, Ecuador",
      rating: 5,
      comment: "Mi viaje a Machu Picchu fue mágico. Kempery World Travel organizó todo perfectamente, incluyendo el tren de lujo y el hotel con vista a las montañas. El guía era muy conocedor y la experiencia fue inolvidable.",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
      package: "Machu Picchu - Perú"
    },
    {
      id: 4,
      name: "Luis Fernández",
      location: "Manta, Ecuador",
      rating: 5,
      comment: "El viaje al Caribe Mexicano fue perfecto. Todo incluido, playas hermosas y actividades divertidas. Kempery se encargó de cada detalle y el precio fue muy competitivo. Ya estoy planeando mi próximo viaje con ellos.",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
      package: "Caribe Mexicano"
    },
    {
      id: 5,
      name: "Patricia López",
      location: "Loja, Ecuador",
      rating: 5,
      comment: "Las montañas de Ecuador son impresionantes y Kempery nos mostró los mejores lugares. El trekking fue desafiante pero gratificante, y las termas fueron el toque perfecto para relajarnos. Una experiencia única.",
      image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
      package: "Montañas de Ecuador"
    }
  ]

  // Auto-advance carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [testimonials.length])

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length)
  }

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  const goToTestimonial = (index) => {
    setCurrentIndex(index)
  }

  return (
    <section id="testimonios" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16 animate-slide-up">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-navy mb-6">
            Lo que dicen nuestros clientes
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Descubre por qué miles de viajeros confían en Kempery World Travel 
            para crear experiencias inolvidables alrededor del mundo.
          </p>
        </div>

        {/* Testimonials Carousel */}
        <div className="relative max-w-4xl mx-auto">
          {/* Quote Icon */}
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
            <div className="bg-navy text-white p-4 rounded-full">
              <Quote size={24} />
            </div>
          </div>

          {/* Testimonial Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 mt-8 animate-fade-in">
            <div className="text-center">
              {/* Rating */}
              <div className="flex justify-center mb-6">
                {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                  <Star key={i} size={24} className="text-yellow-500 fill-current" />
                ))}
              </div>

              {/* Comment */}
              <blockquote className="text-lg md:text-xl text-gray-700 mb-8 leading-relaxed italic">
                "{testimonials[currentIndex].comment}"
              </blockquote>

              {/* Client Info */}
              <div className="flex items-center justify-center gap-4 mb-6">
                <img
                  src={testimonials[currentIndex].image}
                  alt={testimonials[currentIndex].name}
                  className="w-16 h-16 rounded-full object-cover border-4 border-navy"
                />
                <div className="text-left">
                  <h4 className="font-semibold text-navy text-lg">
                    {testimonials[currentIndex].name}
                  </h4>
                  <p className="text-gray-600">{testimonials[currentIndex].location}</p>
                  <p className="text-sm text-accent font-medium">
                    {testimonials[currentIndex].package}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={prevTestimonial}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-shadow duration-300"
          >
            <ChevronLeft size={24} className="text-navy" />
          </button>

          <button
            onClick={nextTestimonial}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-shadow duration-300"
          >
            <ChevronRight size={24} className="text-navy" />
          </button>

          {/* Dots Indicator */}
          <div className="flex justify-center mt-8 space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => goToTestimonial(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentIndex ? 'bg-navy w-8' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          <div className="text-center">
            <div className="text-4xl font-bold text-navy mb-2">500+</div>
            <div className="text-gray-600">Clientes Satisfechos</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-navy mb-2">50+</div>
            <div className="text-gray-600">Destinos Únicos</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-navy mb-2">4.9</div>
            <div className="text-gray-600">Calificación Promedio</div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Testimonials
