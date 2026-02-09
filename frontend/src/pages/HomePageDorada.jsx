import React, { useState } from 'react'
import { ChevronLeft, ChevronRight, MapPin, DollarSign, Star } from 'lucide-react'
import TestimonialsPremium from '../components/TestimonialsPremium'

const HomePageDorada = () => {
  const [currentSlide, setCurrentSlide] = useState(0)

  // Paquetes turísticos con imágenes
  const packages = [
    {
      id: 1,
      city: 'Cartagena',
      country: 'Colombia',
      price: 800,
      image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=500&fit=crop',
      description: 'Explora la magia de la ciudad amurallada',
      rating: 4.8,
      days: 5
    },
    {
      id: 2,
      city: 'Galápagos',
      country: 'Ecuador',
      price: 800,
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=500&fit=crop',
      description: 'Descubre la vida silvestre única del planeta',
      rating: 4.9,
      days: 7
    },
    {
      id: 3,
      city: 'Punta Cana',
      country: 'República Dominicana',
      price: 800,
      image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=500&fit=crop',
      description: 'Relájate en playas paradisíacas',
      rating: 4.7,
      days: 6
    },
    {
      id: 4,
      city: 'Cartagena',
      country: 'Colombia',
      price: 800,
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=500&fit=crop',
      description: 'Romance y cultura en cada rincón',
      rating: 4.8,
      days: 5
    }
  ]

  // Navegar al siguiente slide
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % packages.length)
  }

  // Navegar al slide anterior
  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + packages.length) % packages.length)
  }

  // Ir a un slide específico
  const goToSlide = (index) => {
    setCurrentSlide(index)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      {/* Hero Section con Video de Fondo */}
      <section className="relative h-screen bg-gradient-to-r from-amber-900 via-amber-800 to-yellow-700 flex items-center justify-center overflow-hidden">
        {/* Video de Fondo */}
        <video
          autoPlay
          muted
          loop
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        >
          <source
            src="https://videos.pexels.com/video-files/3045163/3045163-sd_640_360_25fps.mp4"
            type="video/mp4"
          />
        </video>
        {/* Fondo decorativo */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl"></div>
          <div className="absolute top-40 right-20 w-72 h-72 bg-amber-300 rounded-full mix-blend-multiply filter blur-3xl"></div>
        </div>

        <div className="relative z-10 text-center px-6">
          <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 drop-shadow-lg">
            Innovation Business
          </h1>
          <p className="text-2xl md:text-3xl text-amber-100 mb-8 drop-shadow">
            Descubre los Mejores Destinos del Mundo
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <button className="px-8 py-4 bg-white text-amber-900 font-bold rounded-lg hover:bg-amber-50 transition text-lg">
              Explorar Paquetes
            </button>
            <button className="px-8 py-4 bg-amber-300 text-amber-900 font-bold rounded-lg hover:bg-amber-400 transition text-lg">
              Contactarnos
            </button>
          </div>
        </div>
      </section>

      {/* Slider de Paquetes */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-amber-900 mb-12">
            Nuestros Paquetes Destacados
          </h2>

          {/* Slider Principal */}
          <div className="relative h-96 md:h-96 mb-8 rounded-2xl overflow-hidden shadow-2xl">
            {/* Imagen del Slide Actual */}
            <img
              src={packages[currentSlide].image}
              alt={packages[currentSlide].city}
              className="w-full h-full object-cover transition-opacity duration-500"
            />

            {/* Overlay con Información */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent flex flex-col justify-end p-8">
              <h3 className="text-4xl font-bold text-white mb-2">
                {packages[currentSlide].city}
              </h3>
              <p className="text-amber-200 text-lg mb-4">
                {packages[currentSlide].country}
              </p>
              <p className="text-white text-lg mb-6">
                {packages[currentSlide].description}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Star className="text-yellow-300 fill-yellow-300" />
                  <span className="text-white font-semibold">{packages[currentSlide].rating}</span>
                </div>
                <div className="text-right">
                  <p className="text-amber-200 text-sm">Desde</p>
                  <p className="text-3xl font-bold text-yellow-300">
                    ${packages[currentSlide].price}
                  </p>
                </div>
              </div>
            </div>

            {/* Botones de Navegación */}
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-amber-500 hover:bg-amber-600 text-white p-3 rounded-full transition z-10 shadow-lg"
            >
              <ChevronLeft size={28} />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-amber-500 hover:bg-amber-600 text-white p-3 rounded-full transition z-10 shadow-lg"
            >
              <ChevronRight size={28} />
            </button>
          </div>

          {/* Tarjetas de Paquetes */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {packages.map((pkg, index) => (
              <div
                key={pkg.id}
                onClick={() => goToSlide(index)}
                className={`cursor-pointer rounded-lg overflow-hidden shadow-lg transition transform hover:scale-105 ${
                  index === currentSlide
                    ? 'ring-4 ring-amber-500 scale-105'
                    : 'ring-2 ring-amber-200'
                }`}
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={pkg.image}
                    alt={pkg.city}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-0 right-0 bg-amber-500 text-white px-4 py-2 font-bold">
                    ${pkg.price}
                  </div>
                </div>
                <div className="p-4 bg-gradient-to-b from-amber-50 to-yellow-50">
                  <h4 className="text-lg font-bold text-amber-900 mb-1">
                    {pkg.city}
                  </h4>
                  <p className="text-amber-700 text-sm mb-3">{pkg.country}</p>
                  <div className="flex items-center justify-between text-amber-900">
                    <span className="text-sm flex items-center gap-1">
                      <MapPin size={16} className="text-amber-600" />
                      {pkg.days} días
                    </span>
                    <span className="text-sm flex items-center gap-1">
                      <Star size={16} className="fill-amber-500 text-amber-500" />
                      {pkg.rating}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Indicadores de Slide */}
          <div className="flex justify-center gap-3">
            {packages.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-3 rounded-full transition ${
                  index === currentSlide
                    ? 'bg-amber-500 w-8'
                    : 'bg-amber-200 w-3 hover:bg-amber-300'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Características */}
      <section className="py-16 px-6 bg-gradient-to-r from-amber-50 to-yellow-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-amber-900 mb-12">
            Por Qué Elegir Innovation Business
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'Mejores Precios',
                description: 'Garantizamos los mejores precios del mercado para tus viajes',
                icon: '💰'
              },
              {
                title: 'Atención 24/7',
                description: 'Soporte constante durante toda tu experiencia de viaje',
                icon: '🛎️'
              },
              {
                title: 'Destinos Exclusivos',
                description: 'Acceso a lugares únicos y experiencias inolvidables',
                icon: '✈️'
              }
            ].map((feature, idx) => (
              <div
                key={idx}
                className="p-8 bg-white rounded-xl shadow-lg hover:shadow-xl transition border-2 border-amber-200 hover:border-amber-500"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-amber-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-amber-700">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Premium Section */}
      <TestimonialsPremium />

      {/* CTA Section */}
      <section className="py-16 px-6 bg-gradient-to-r from-amber-900 via-amber-800 to-yellow-700">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            ¿Listo para tu Próxima Aventura?
          </h2>
          <p className="text-xl text-amber-100 mb-8">
            Planifica tu viaje ideal con Innovation Business hoy mismo
          </p>
          <button className="px-8 py-4 bg-yellow-300 text-amber-900 font-bold text-lg rounded-lg hover:bg-yellow-400 transition shadow-lg">
            Reservar Ahora
          </button>
        </div>
      </section>
    </div>
  )
}

export default HomePageDorada
