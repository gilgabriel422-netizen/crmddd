import React, { useState } from 'react'
import { Star, ChevronLeft, ChevronRight } from 'lucide-react'

const TestimonialsPremium = () => {
  const [currentIndex, setCurrentIndex] = useState(0)

  const testimonials = [
    {
      id: 1,
      name: 'María García',
      role: 'Ejecutiva de Ventas',
      text: 'Innovation Business transformó mi forma de viajar. Los paquetes son increíbles y el servicio es excelente. ¡Ya boqueé mis próximas 3 vacaciones!',
      rating: 5,
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop',
      destination: 'Cartagena, Colombia'
    },
    {
      id: 2,
      name: 'Juan Rodríguez',
      role: 'Abogado',
      text: 'Después de muchos años viajando con otras agencias, encontré en Innovation Business la calidad y personalización que buscaba. Los destinos exclusivos son una joya.',
      rating: 5,
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop',
      destination: 'Galápagos, Ecuador'
    },
    {
      id: 3,
      name: 'Sofía López',
      role: 'Empresaria',
      text: 'El mejor viaje que he hecho fue con Innovation Business. Todo estaba perfectamente organizado, desde el transporte hasta los hoteles. Atención de primer nivel.',
      rating: 5,
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop',
      destination: 'Punta Cana, R.D.'
    },
    {
      id: 4,
      name: 'Carlos Mendez',
      role: 'Ingeniero',
      text: 'Viajé con mi familia completa. Innovation Business se encargó de cada detalle. Los precios eran competitivos y la calidad superó todas mis expectativas.',
      rating: 5,
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop',
      destination: 'Bogotá Clásico'
    }
  ]

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length)
  }

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  const currentTestimonial = testimonials[currentIndex]

  return (
    <section className="py-20 px-6 bg-gradient-to-b from-white to-amber-50">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold !text-black mb-4 drop-shadow-md" style={{ color: '#000000' }}>
            ✨ Lo Que Dicen Nuestros Viajeros
          </h2>
          <p className="text-lg !text-black max-w-3xl mx-auto font-semibold" style={{ color: '#000000' }}>
            Experiencias reales de clientes que ya han transformado sus viajes con Innovation Business
          </p>
        </div>

        {/* Testimonial Card */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 border-2 border-amber-200">
            {/* Rating */}
            <div className="flex gap-1 mb-6">
              {[...Array(currentTestimonial.rating)].map((_, i) => (
                <Star key={i} size={24} className="fill-yellow-400 text-yellow-400" />
              ))}
            </div>

            {/* Testimonial Text */}
            <p className="text-xl md:text-2xl text-gray-700 mb-8 font-light italic leading-relaxed">
              "{currentTestimonial.text}"
            </p>

            {/* Author Info */}
            <div className="flex items-center gap-4 mb-8">
              <img
                src={currentTestimonial.image}
                alt={currentTestimonial.name}
                className="w-16 h-16 rounded-full object-cover border-2 border-amber-300"
              />
              <div>
                <h4 className="text-lg font-bold text-amber-900">
                  {currentTestimonial.name}
                </h4>
                <p className="text-amber-700 text-sm font-medium">
                  {currentTestimonial.role}
                </p>
                <p className="text-gray-500 text-sm">
                  📍 {currentTestimonial.destination}
                </p>
              </div>
            </div>

            {/* Navigation Dots */}
            <div className="flex gap-2 mb-6">
              {testimonials.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-3 rounded-full transition-all ${
                    idx === currentIndex
                      ? 'bg-amber-500 w-8'
                      : 'bg-amber-200 w-3 hover:bg-amber-300'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex gap-4 justify-center mt-8">
            <button
              onClick={prevTestimonial}
              className="p-3 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-900 transition shadow-md"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={nextTestimonial}
              className="p-3 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-900 transition shadow-md"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
          {[
            { number: '2,500+', label: 'Viajeros Felices' },
            { number: '4.9/5', label: 'Calificación Promedio' },
            { number: '50+', label: 'Destinos Disponibles' }
          ].map((stat, idx) => (
            <div key={idx} className="text-center">
              <p className="text-4xl font-bold !text-black mb-2" style={{ color: '#000000' }}>
                {stat.number}
              </p>
              <p className="!text-black font-semibold" style={{ color: '#000000' }}>{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default TestimonialsPremium
