import React from 'react'
import { Star, Quote } from 'lucide-react'
import WhatsAppQR from './WhatsAppQR'

const TestimonialsSection = () => {
  const testimonials = [
    {
      id: 1,
      name: "María González",
      location: "Quito, Ecuador",
      rating: 5,
      text: "Increíble experiencia en Galápagos. El servicio fue excepcional y los guías muy profesionales. Definitivamente volveré a viajar con Kempery World Travel.",
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80"
    },
    {
      id: 2,
      name: "Carlos Rodríguez",
      location: "Guayaquil, Ecuador",
      rating: 5,
      text: "El tour por la Amazonía fue una experiencia única. El lodge era perfecto y las actividades muy bien organizadas. Recomiendo 100% esta agencia.",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80"
    },
    {
      id: 3,
      name: "Ana Martínez",
      location: "Cuenca, Ecuador",
      rating: 5,
      text: "Excelente atención al cliente y paquetes muy completos. El tour por Quito colonial fue fascinante. Sin duda la mejor agencia de viajes del país.",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80"
    }
  ]

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Lo que dicen nuestros clientes
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Miles de viajeros han confiado en nosotros para sus aventuras
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              {/* Quote Icon */}
              <div className="text-accent mb-4">
                <Quote size={32} />
              </div>

              {/* Rating */}
              <div className="flex items-center gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} size={20} className="text-yellow-400 fill-current" />
                ))}
              </div>

              {/* Testimonial Text */}
              <p className="text-gray-600 mb-6 leading-relaxed">
                "{testimonial.text}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-4">
                <img 
                  src={testimonial.image} 
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-500">{testimonial.location}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* QR and Map Section */}
        <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-8 h-96">
          {/* WhatsApp QR */}
          <div className="bg-white rounded-2xl p-8 shadow-lg flex flex-col justify-center items-center">
            <WhatsAppQR />
          </div>

          {/* Map */}
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Nuestra Ubicación
            </h3>
            <div className="h-80 rounded-lg overflow-hidden">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3989.799173023333!2d-78.4881939!3d-0.17750690000000002!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x91d59a8f3e4e5e1f%3A0x91b216daec2496df!2sColegio%20De%20Administradores!5e0!3m2!1ses-419!2sec!4v1758207017912!5m2!1ses-419!2sec"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Ubicación de Kempery World Travel"
              ></iframe>
            </div>
            <div className="mt-4 text-center">
              <a
                href="https://www.google.com/maps/place/Colegio+De+Administradores/@-0.1775069,-78.4881939,17z/data=!3m1!4b1!4m6!3m5!1s0x91d59a8f3e4e5e1f:0x91b216daec2496df!8m2!3d-0.1775069!4d-78.4881939!16s%2Fg%2F11c0q8q8q8"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-navy hover:bg-navy/90 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 text-sm"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                Ver en Google Maps
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default TestimonialsSection
