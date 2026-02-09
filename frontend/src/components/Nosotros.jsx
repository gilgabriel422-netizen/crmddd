import React from 'react'
import { Users, Award, Globe, Heart, CheckCircle, Star } from 'lucide-react'

const Nosotros = () => {
  const stats = [
    { number: "500+", label: "Clientes Satisfechos", icon: Users },
    { number: "50+", label: "Destinos Únicos", icon: Globe },
    { number: "4.9", label: "Calificación Promedio", icon: Star },
    { number: "5+", label: "Años de Experiencia", icon: Award }
  ]

  const valores = [
    {
      icon: Heart,
      title: "Pasión por los Viajes",
      description: "Creamos experiencias únicas que conectan a las personas con culturas, paisajes y momentos inolvidables alrededor del mundo."
    },
    {
      icon: CheckCircle,
      title: "Calidad Garantizada",
      description: "Trabajamos solo con proveedores certificados y ofrecemos servicios de la más alta calidad para garantizar tu satisfacción."
    },
    {
      icon: Users,
      title: "Atención Personalizada",
      description: "Cada viaje es único. Nuestro equipo de expertos diseña itinerarios personalizados según tus preferencias y necesidades."
    },
    {
      icon: Globe,
      title: "Compromiso Ambiental",
      description: "Promovemos el turismo sostenible y responsable, cuidando los destinos para las futuras generaciones."
    }
  ]

  return (
    <section id="nosotros" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16 animate-slide-up">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-navy mb-6">
            Acerca de Nosotros
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            En Kempery World Travel, creemos que cada viaje es una oportunidad 
            para descubrir, aprender y crear recuerdos que durarán toda la vida.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
          {stats.map((stat, index) => (
            <div 
              key={index} 
              className="text-center animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="bg-navy text-white p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <stat.icon size={32} />
              </div>
              <div className="text-3xl font-bold text-navy mb-2">{stat.number}</div>
              <div className="text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <div className="animate-slide-up">
            <div className="bg-gradient-to-br from-navy to-light-blue text-white p-8 rounded-2xl">
              <h3 className="text-2xl font-bold mb-4">Nuestra Misión</h3>
              <p className="text-lg leading-relaxed">
                Promover el turismo / turismo inmobiliario como una alternativa de desarrollo para el país, 
                amigable con el medio ambiente; ofreciendo a nuestros clientes y socios paquetes de viajes, 
                hospedajes exclusivos en nuestros departamentos, excursiones y cruceros que superen sus 
                expectativas a través de las habilidades y experiencia de sus colaboradores.
              </p>
            </div>
          </div>
          
          <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="bg-gradient-to-br from-light-blue to-accent text-white p-8 rounded-2xl">
              <h3 className="text-2xl font-bold mb-4">Nuestra Visión</h3>
              <p className="text-lg leading-relaxed">
                KEMPERY operadora turística se visualiza como una alternativa de viajes, que ofrecerá 
                sus servicios a turistas y empresas, nacionales y extranjeras, logrando convertirse 
                en una referencia nacional e internacional.
              </p>
            </div>
          </div>
        </div>

        {/* Values */}
        <div className="animate-slide-up">
          <h3 className="text-3xl font-bold text-navy text-center mb-12">Nuestros Valores</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {valores.map((valor, index) => (
              <div 
                key={index} 
                className="bg-gray-50 p-6 rounded-xl hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  <div className="bg-navy text-white p-3 rounded-lg flex-shrink-0">
                    <valor.icon size={24} />
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold text-navy mb-3">{valor.title}</h4>
                    <p className="text-gray-600 leading-relaxed">{valor.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Team Section */}
        <div className="mt-16 text-center animate-slide-up">
          <h3 className="text-3xl font-bold text-navy mb-8">Nuestro Equipo</h3>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Un equipo de profesionales apasionados por los viajes, con años de experiencia 
            y conocimiento profundo de los destinos más fascinantes del mundo.
          </p>
          <div className="bg-gradient-to-r from-navy to-light-blue text-white p-8 rounded-2xl">
            <h4 className="text-2xl font-bold mb-4">¿Listo para tu próxima aventura?</h4>
            <p className="text-lg mb-6">
              Permítenos ser parte de tu historia de viajes. Contáctanos y descubre 
              cómo podemos hacer realidad tus sueños de viaje.
            </p>
            <button 
              onClick={() => window.open('https://wa.me/593999222210?text=Hola! Me gustaría conocer más sobre sus servicios de viaje.', '_blank')}
              className="bg-white text-navy font-bold py-3 px-8 rounded-lg hover:bg-gray-100 transition-all duration-300"
            >
              Contáctanos Ahora
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Nosotros
