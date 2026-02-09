import React from 'react'
import PackageCarousel from './PackageCarousel'

const Hero = () => {
  return (
    <section className="relative w-full h-screen overflow-hidden bg-black">
      {/* VIDEO DE FONDO */}
      <video 
        autoPlay 
        muted 
        loop 
        playsInline
        className="absolute top-1/2 left-1/2 w-full h-full object-cover transform -translate-x-1/2 -translate-y-1/2"
        style={{ zIndex: 1 }}
      >
        <source 
          src="https://videos.pexels.com/video-files/3045163/3045163-sd_640_360_25fps.mp4" 
          type="video/mp4" 
        />
        Tu navegador no soporta videos HTML5
      </video>

      {/* OVERLAY OSCURO */}
      <div 
        className="absolute inset-0"
        style={{ 
          backgroundColor: 'rgba(0, 0, 0, 0.45)',
          zIndex: 2 
        }}
      ></div>

      {/* CONTENIDO - HERO TEXT */}
      <div 
        className="relative w-full h-full flex flex-col justify-center items-center text-center text-white"
        style={{ zIndex: 3 }}
      >
        <div className="space-y-6 px-4 md:px-8">
          {/* Título Principal */}
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold tracking-wider drop-shadow-2xl">
            Innovation Business
          </h1>

          {/* Subtítulo */}
          <p className="text-lg md:text-2xl opacity-90 drop-shadow-lg font-light">
            Descubre Nuevos Destinos
          </p>

          {/* Descripción */}
          <p className="text-base md:text-lg opacity-75 drop-shadow-md max-w-2xl mx-auto">
            Experiencias de viaje únicas y personalizadas te esperan
          </p>

          {/* Botones */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <button className="px-8 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg transition transform hover:scale-105 shadow-lg">
              Explorar Destinos
            </button>
            <button className="px-8 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white/10 transition backdrop-blur-sm">
              Reservar Ahora
            </button>
          </div>
        </div>
      </div>

      {/* CARRUSEL DE PAQUETES */}
      <div className="relative w-full h-full" style={{ zIndex: 4 }}>
        <PackageCarousel />
      </div>
    </section>
  )
}

export default Hero
