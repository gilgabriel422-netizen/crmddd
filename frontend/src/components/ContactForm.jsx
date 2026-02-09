import React, { useState } from 'react'
import { Send, Phone, Mail, MapPin, Calendar, Users, Globe } from 'lucide-react'

const ContactForm = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    destino: 'nacional',
    ciudadDestino: '',
    fechaIda: '',
    fechaRetorno: ''
  })

  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido'
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El email no es válido'
    }
    
    if (!formData.telefono.trim()) {
      newErrors.telefono = 'El teléfono es requerido'
    }
    
    if (!formData.ciudadDestino.trim()) {
      newErrors.ciudadDestino = 'La ciudad o país de destino es requerido'
    }
    
    if (!formData.fechaIda) {
      newErrors.fechaIda = 'La fecha de ida es requerida'
    }
    
    if (!formData.fechaRetorno) {
      newErrors.fechaRetorno = 'La fecha de retorno es requerida'
    }
    
    if (formData.fechaIda && formData.fechaRetorno && new Date(formData.fechaIda) >= new Date(formData.fechaRetorno)) {
      newErrors.fechaRetorno = 'La fecha de retorno debe ser posterior a la fecha de ida'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    // Prepare WhatsApp message
    const message = `*Nueva Solicitud de Cotización - Innovation Business*

*Información del Cliente:*
• Nombre: ${formData.nombre}
• Email: ${formData.email}
• Teléfono: ${formData.telefono}

*Detalles del Viaje:*
• Tipo de Destino: ${formData.destino === 'nacional' ? 'Nacional' : 'Internacional'}
• Ciudad/País de Destino: ${formData.ciudadDestino}
• Fecha de Ida: ${formData.fechaIda}
• Fecha de Retorno: ${formData.fechaRetorno}

*Mensaje:*
Hola! Me gustaría recibir una cotización personalizada para este viaje. ¿Podrían ayudarme con más información y opciones disponibles?

¡Gracias!`
    
    // Open WhatsApp with pre-filled message
    const whatsappUrl = `https://wa.me/0999845693?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
    
    // Reset form
    setFormData({
      nombre: '',
      email: '',
      telefono: '',
      destino: 'nacional',
      ciudadDestino: '',
      fechaIda: '',
      fechaRetorno: ''
    })
    
    // Show success message (you could add a toast notification here)
    alert('¡Gracias! Tu solicitud ha sido enviada. Te contactaremos pronto por WhatsApp.')
  }

  return (
    <section id="contacto" className="py-20 bg-gradient-to-b from-gray-900 via-amber-950 to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16 animate-slide-up">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-amber-200 mb-6">
            Solicita tu Cotización
          </h2>
          <p className="text-xl text-amber-100 max-w-3xl mx-auto">
            Completa el formulario y nuestro equipo de expertos te contactará 
            para crear el viaje perfecto según tus preferencias y presupuesto.
          </p>
        </div>

        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Contact Information */}
            <div className="animate-slide-up">
              <h3 className="text-2xl font-bold text-amber-200 mb-6">
                Información de Contacto
              </h3>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-amber-600 text-white p-3 rounded-lg">
                    <Phone size={20} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-amber-200">Teléfono</h4>
                    <p className="text-amber-100">0999845693</p>
                    <p className="text-sm text-amber-300">WhatsApp disponible 24/7</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="bg-amber-600 text-white p-3 rounded-lg">
                    <Mail size={20} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-amber-200">Email</h4>
                    <p className="text-amber-100">innovationbussines@gmail.com</p>
                    <p className="text-sm text-amber-300">Respuesta en 24 horas</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="bg-amber-600 text-white p-3 rounded-lg">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-amber-200">Oficina Principal</h4>
                    <p className="text-amber-100">Quito, Ecuador</p>
                    <p className="text-sm text-amber-300">Atención personalizada</p>
                  </div>
                </div>
              </div>

              {/* Why Choose Us */}
              <div className="mt-8 p-6 bg-gray-800/50 backdrop-blur border border-amber-700/30 rounded-xl">
                <h4 className="font-semibold text-amber-200 mb-4">¿Por qué elegirnos?</h4>
                <ul className="space-y-2 text-sm text-amber-100">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                    Más de 500 clientes satisfechos
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                    Precios competitivos y transparentes
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                    Atención personalizada 24/7
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                    Paquetes personalizados a tu medida
                  </li>
                </ul>
              </div>

            </div>

            {/* Contact Form */}
            <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <form onSubmit={handleSubmit} className="bg-gray-800/50 backdrop-blur border border-amber-700/30 p-8 rounded-2xl shadow-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Nombre */}
                  <div className="md:col-span-2">
                    <label htmlFor="nombre" className="block text-sm font-medium text-amber-200 mb-2">
                      Nombre Completo *
                    </label>
                    <input
                      type="text"
                      id="nombre"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-gray-700/50 text-amber-100 ${
                        errors.nombre ? 'border-red-500' : 'border-amber-700/50'
                      }`}
                      placeholder="Tu nombre completo"
                    />
                    {errors.nombre && (
                      <p className="text-red-400 text-sm mt-1">{errors.nombre}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div className="md:col-span-2">
                    <label htmlFor="email" className="block text-sm font-medium text-amber-200 mb-2">
                      Correo Electrónico *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-gray-700/50 text-amber-100 ${
                        errors.email ? 'border-red-500' : 'border-amber-700/50'
                      }`}
                      placeholder="tu@email.com"
                    />
                    {errors.email && (
                      <p className="text-red-400 text-sm mt-1">{errors.email}</p>
                    )}
                  </div>

                  {/* Teléfono */}
                  <div className="md:col-span-2">
                    <label htmlFor="telefono" className="block text-sm font-medium text-amber-200 mb-2">
                      Teléfono *
                    </label>
                    <input
                      type="tel"
                      id="telefono"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-gray-700/50 text-amber-100 ${
                        errors.telefono ? 'border-red-500' : 'border-amber-700/50'
                      }`}
                      placeholder="+593 99 123 4567"
                    />
                    {errors.telefono && (
                      <p className="text-red-400 text-sm mt-1">{errors.telefono}</p>
                    )}
                  </div>

                  {/* Tipo de Destino */}
                  <div>
                    <label htmlFor="destino" className="block text-sm font-medium text-amber-200 mb-2">
                      Tipo de Destino *
                    </label>
                    <select
                      id="destino"
                      name="destino"
                      value={formData.destino}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-amber-700/50 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-gray-700/50 text-amber-100"
                    >
                      <option value="nacional">Nacional</option>
                      <option value="internacional">Internacional</option>
                    </select>
                  </div>

                  {/* Ciudad/País de Destino */}
                  <div>
                    <label htmlFor="ciudadDestino" className="block text-sm font-medium text-amber-200 mb-2">
                      Ciudad/País de Destino *
                    </label>
                    <input
                      type="text"
                      id="ciudadDestino"
                      name="ciudadDestino"
                      value={formData.ciudadDestino}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-gray-700/50 text-amber-100 ${
                        errors.ciudadDestino ? 'border-red-500' : 'border-amber-700/50'
                      }`}
                      placeholder="Ej: Galápagos, París, Tokio"
                    />
                    {errors.ciudadDestino && (
                      <p className="text-red-400 text-sm mt-1">{errors.ciudadDestino}</p>
                    )}
                  </div>

                  {/* Fecha de Ida */}
                  <div>
                    <label htmlFor="fechaIda" className="block text-sm font-medium text-amber-200 mb-2">
                      Fecha de Ida *
                    </label>
                    <input
                      type="date"
                      id="fechaIda"
                      name="fechaIda"
                      value={formData.fechaIda}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-gray-700/50 text-amber-100 ${
                        errors.fechaIda ? 'border-red-500' : 'border-amber-700/50'
                      }`}
                    />
                    {errors.fechaIda && (
                      <p className="text-red-400 text-sm mt-1">{errors.fechaIda}</p>
                    )}
                  </div>

                  {/* Fecha de Retorno */}
                  <div>
                    <label htmlFor="fechaRetorno" className="block text-sm font-medium text-amber-200 mb-2">
                      Fecha de Retorno *
                    </label>
                    <input
                      type="date"
                      id="fechaRetorno"
                      name="fechaRetorno"
                      value={formData.fechaRetorno}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-gray-700/50 text-amber-100 ${
                        errors.fechaRetorno ? 'border-red-500' : 'border-amber-700/50'
                      }`}
                    />
                    {errors.fechaRetorno && (
                      <p className="text-red-400 text-sm mt-1">{errors.fechaRetorno}</p>
                    )}
                  </div>
              </div>

                {/* Submit Button */}
                <div className="mt-8">
                  <button
                    type="submit"
                    className="btn-primary w-full text-lg py-4 flex items-center justify-center gap-3"
                  >
                    <Send size={20} />
                    Enviar Solicitud
                  </button>
                </div>

                <p className="text-sm text-amber-300 text-center mt-4">
                  Al enviar este formulario, serás redirigido a WhatsApp para completar tu solicitud.
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ContactForm
