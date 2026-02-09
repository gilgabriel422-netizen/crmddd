import React from 'react'
import { Users, MapPin, Star, Award } from 'lucide-react'

const StatsSection = () => {
  const stats = [
    {
      icon: Users,
      number: "500+",
      label: "Clientes Satisfechos",
      description: "Más de 500 viajeros han confiado en nosotros"
    },
    {
      icon: MapPin,
      number: "50+",
      label: "Destinos Únicos",
      description: "Exploramos los mejores lugares de Ecuador"
    },
    {
      icon: Star,
      number: "4.9",
      label: "Calificación Promedio",
      description: "Excelente servicio según nuestros clientes"
    },
    {
      icon: Award,
      number: "5+",
      label: "Años de Experiencia",
      description: "Líderes en turismo de calidad"
    }
  ]

  return (
    <section className="py-20 bg-navy">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">
            ¿Por qué elegir Kempery World Travel?
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Somos más que una agencia de viajes, somos tu compañero de aventuras
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center group">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-accent rounded-full mb-6 group-hover:bg-white group-hover:text-navy transition-all duration-300">
                  <stat.icon size={32} className="text-white group-hover:text-navy" />
                </div>
                <div className="text-4xl font-bold text-white mb-2">{stat.number}</div>
                <div className="text-xl font-semibold text-accent mb-2">{stat.label}</div>
                <div className="text-gray-300 text-sm">{stat.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default StatsSection
