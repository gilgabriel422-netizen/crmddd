import React from 'react'
import { FileText, Gift, HelpCircle, Menu, X, LogOut, BookOpen, Award, Inbox, MessageCircle } from 'lucide-react'
import WhatsAppFloat from '../components/WhatsAppFloat'
import { useAuth } from '../contexts/AuthContext'
import NotificationBell from '../components/NotificationBell'
import VisorPlantillaContrato from '../components/VisorPlantillaContrato'
import BeneficiosCliente from '../components/BeneficiosCliente'
import SolicitarReserva from '../components/SolicitarReserva'

const ClienteIB1Panel = () => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false)
  const [activeSection, setActiveSection] = React.useState('contrato')
  const [asunto, setAsunto] = React.useState('')
  const [nuevoMensaje, setNuevoMensaje] = React.useState('')
  const [enviando, setEnviando] = React.useState(false)
  const [successMessage, setSuccessMessage] = React.useState('')
  const [respuestas, setRespuestas] = React.useState([])
  const [loadingRespuestas, setLoadingRespuestas] = React.useState(true)
  const [contratos, setContratos] = React.useState([])
  const [loadingContratos, setLoadingContratos] = React.useState(true)
  const [contratosError, setContratosError] = React.useState('')
    const [cliente, setCliente] = React.useState(null)
    const [loadingCliente, setLoadingCliente] = React.useState(true)
  const { logout, user } = useAuth()

  const formatDate = (value) => {
    if (!value) return '—'
    return new Date(value).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Calcular puntos del cliente (30% del total_amount)
  const calcularPuntos = () => {
    if (!cliente || !cliente.total_amount) return 0
    return Math.floor(parseFloat(cliente.total_amount) * 0.30)
  }

  const formatPuntos = (puntos) => {
    return puntos.toLocaleString('es-ES')
  }

  // useEffect para cargar el cliente basado en usuario_asignado_id
  React.useEffect(() => {
    if (!user) return
    const loadCliente = async () => {
      setLoadingCliente(true)
      try {
        const api = await import('../services/api')
        // Obtener todos los clientes y filtrar por usuario_asignado_id
        const response = await api.default.get('/clientes')
        const clientes = response.data?.clients || []
        const clienteAsignado = clientes.find(c => Number(c.usuario_asignado_id) === Number(user.id))
        if (clienteAsignado) {
          setCliente(clienteAsignado)
        } else {
          setCliente(null)
        }
      } catch (error) {
        console.error('Error cargando cliente:', error)
        setCliente(null)
      } finally {
        setLoadingCliente(false)
      }
    }
    loadCliente()
  }, [user])

  // useEffect para cargar contratos
  React.useEffect(() => {
    if (!user) return
    const loadContratos = async () => {
      setLoadingContratos(true)
      setContratosError('')
      try {
        const api = await import('../services/api')
        const usuario_id = user?.usuario_id || user?.id || user?.userId
        if (!usuario_id) {
          setLoadingContratos(false)
          return
        }
        let response
        try {
          response = await api.default.get(`/contratos-fisicos/cliente/${usuario_id}`)
        } catch (error) {
          response = await api.default.get('/contratos-fisicos')
        }
        const data = Array.isArray(response.data) ? response.data : []
        const filtrados = data.filter(c => Number(c.cliente_id) === Number(usuario_id))
        setContratos(filtrados)
      } catch (error) {
        console.error('Error cargando contratos:', error)
        setContratosError('No se pudieron cargar los contratos.')
      } finally {
        setLoadingContratos(false)
      }
    }
    loadContratos()
  }, [user])

  const handleEnviarMensaje = async (e) => {
    e.preventDefault()

    if (!asunto.trim() || !nuevoMensaje.trim()) {
      alert('Por favor completa el asunto y el mensaje')
      return
    }

    setEnviando(true)
    try {
      const api = await import('../services/api')
      const usuario_id = user?.usuario_id || user?.id || user?.userId

      if (!usuario_id) {
        alert('Error: No se pudo obtener tu ID de usuario. Por favor recarga la página.')
        setEnviando(false)
        return
      }

      const data = {
        asunto,
        contenido: nuevoMensaje,
        usuario_id: parseInt(usuario_id, 10),
        tipo_remitente: 'cliente',
        estado: 'pendiente'
      }

      const response = await api.default.post('/mensajes', data)
      if (response.data) {
        setAsunto('')
        setNuevoMensaje('')
        setSuccessMessage('¡Mensaje enviado exitosamente!')
        setTimeout(() => setSuccessMessage(''), 3000)
      }
    } catch (error) {
      console.error('Error enviando mensaje:', error)
      alert('Error al enviar el mensaje: ' + (error.response?.data?.error || error.message))
    } finally {
      setEnviando(false)
    }
  }

  React.useEffect(() => {
    if (!user) return
    const loadRespuestas = async () => {
      try {
        const api = await import('../services/api')
        const usuario_id = user?.usuario_id || user?.id || user?.userId
        if (!usuario_id) {
          setLoadingRespuestas(false)
          return
        }
        const response = await api.default.get('/mensajes')
        const data = response.data || []
        const usuarioId = Number(usuario_id)
        const filtradas = data
          .filter(m => Number(m.usuario_id) === usuarioId && m.respuesta)
          .sort((a, b) => new Date(b.fecha_respuesta || b.fecha_creacion) - new Date(a.fecha_respuesta || a.fecha_creacion))
        setRespuestas(filtradas)
      } catch (error) {
        console.error('Error cargando respuestas:', error)
      } finally {
        setLoadingRespuestas(false)
      }
    }
    loadRespuestas()
  }, [user])

  const sections = [
    { id: 'contrato', name: 'Contrato', icon: FileText },
    { id: 'beneficios', name: 'Beneficios', icon: Gift },
    { id: 'puntos-compensacion', name: 'Puntos / Compensación', icon: Award },
    { id: 'solicitar-reserva', name: 'Solicitar Reserva', icon: BookOpen },
    { id: 'enviar-atencion', name: 'Enviar a Atención', icon: MessageCircle },
    { id: 'bandeja-respuestas', name: 'Bandeja de Respuestas', icon: Inbox },
    { id: 'ayuda', name: 'Ayuda', icon: HelpCircle }
  ]

  const renderContent = () => {
    switch (activeSection) {
      case 'contrato':
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Contrato</h2>
            <VisorPlantillaContrato cliente={cliente} />
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="font-semibold mb-3">Contratos Físicos</h3>
              {loadingContratos ? (
                <p className="text-sm text-gray-600">Cargando contratos...</p>
              ) : contratosError ? (
                <p className="text-sm text-red-600">{contratosError}</p>
              ) : contratos.length === 0 ? (
                <p className="text-sm text-gray-600">No hay contratos asociados a tu cuenta.</p>
              ) : (
                <div className="space-y-4">
                  {contratos.map((c) => (
                    <div key={c.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-semibold text-gray-900">Contrato #{c.numero_contrato}</p>
                        <span className="text-xs text-gray-500">{formatDate(c.fecha)}</span>
                      </div>
                      {c.observaciones && (
                        <p className="text-sm text-gray-600 mt-2 whitespace-pre-wrap">{c.observaciones}</p>
                      )}
                      {c.archivo_url && (
                        <a
                          href={c.archivo_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-block mt-3 text-sm text-blue-600 hover:underline"
                        >
                          Ver contrato
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )
      case 'beneficios':
        return (
          <BeneficiosCliente clienteId={cliente?.id} />
        )
      case 'puntos-compensacion':
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Puntos / Compensación</h2>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 p-6 rounded-lg text-white">
                  <h3 className="text-lg font-semibold mb-2">Tus Puntos Actuales</h3>
                  <p className="text-4xl font-bold">{formatPuntos(calcularPuntos())}</p>
                  <p className="text-sm mt-2">Puntos disponibles para canjear</p>
                </div>
                <div className="bg-gradient-to-br from-blue-400 to-blue-600 p-6 rounded-lg text-white">
                  <h3 className="text-lg font-semibold mb-2">Sistema de Acumulación</h3>
                  <p className="text-3xl font-bold">30%</p>
                  <p className="text-sm mt-2">Del valor de cada compra se convierte en puntos</p>
                </div>
              </div>
              
              <div className="mt-6 bg-gray-800 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-white mb-3">¿Cómo funcionan los puntos?</h3>
                <ul className="space-y-2 text-sm text-gray-200">
                  <li className="flex items-start">
                    <span className="text-green-400 mr-2">✓</span>
                    <span>Por cada compra, acumulas el 30% del valor en puntos</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-400 mr-2">✓</span>
                    <span>Canjea tus puntos por descuentos en futuras reservas</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-400 mr-2">✓</span>
                    <span>Accede a premios y beneficios exclusivos</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-400 mr-2">✓</span>
                    <span>Tus puntos no tienen fecha de vencimiento</span>
                  </li>
                </ul>
              </div>

              <div className="mt-6 bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Historial de Puntos</h3>
                <p className="text-sm text-gray-600">No hay movimientos registrados aún</p>
              </div>
            </div>
          </div>
        )
      case 'solicitar-reserva':
        return (
          <SolicitarReserva clienteId={cliente?.id} />
        )
      case 'enviar-atencion':
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Enviar a Atención</h2>
            {successMessage && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                {successMessage}
              </div>
            )}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <form onSubmit={handleEnviarMensaje} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Asunto</label>
                  <input
                    type="text"
                    value={asunto}
                    onChange={(e) => setAsunto(e.target.value)}
                    placeholder="Ej: Consulta sobre mi reserva, problema técnico, etc."
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={enviando}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Mensaje</label>
                  <textarea
                    value={nuevoMensaje}
                    onChange={(e) => setNuevoMensaje(e.target.value)}
                    placeholder="Describe tu problema o consulta de forma detallada..."
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={6}
                    disabled={enviando}
                  />
                </div>
                <button
                  type="submit"
                  disabled={enviando}
                  className="w-full px-4 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
                >
                  {enviando ? 'Enviando...' : 'Enviar Mensaje'}
                </button>
              </form>
            </div>
          </div>
        )
      case 'bandeja-respuestas':
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Bandeja de Respuestas</h2>
            <div className="bg-white p-6 rounded-lg shadow-md">
              {loadingRespuestas ? (
                <p className="text-sm text-gray-600">Cargando respuestas...</p>
              ) : respuestas.length === 0 ? (
                <p className="text-sm text-gray-600">No tienes respuestas todavía.</p>
              ) : (
                <div className="space-y-4">
                  {respuestas.map((msg) => (
                    <div key={msg.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold text-gray-900">{msg.asunto}</p>
                          <p className="text-xs text-gray-500">
                            Respondido: {new Date(msg.fecha_respuesta || msg.fecha_creacion).toLocaleDateString('es-ES', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                        <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 font-semibold">Respondido</span>
                      </div>
                      <div className="mt-3">
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{msg.respuesta}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )
      case 'ayuda':
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Ayuda</h2>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <p className="text-sm text-gray-600 mb-4">
                ¿Necesitas soporte? Aquí puedes ver los canales de ayuda y preguntas frecuentes.
              </p>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  // Version selector: GOLD / BLUE / BLACK - default BLUE for this panel
  const [version, setVersion] = React.useState('GOLD')

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-emerald-200 via-teal-300 to-emerald-400 text-black">
      <aside className="w-64 bg-black text-white p-6 flex-shrink-0 hidden md:block">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-full bg-white border-2 border-blue-600 flex items-center justify-center">
            <span className="text-yellow-600 font-bold text-xl">IB</span>
          </div>
          <div className="text-2xl font-bold">Cliente Gold</div>
        </div>
        <nav>
          <ul>
            {sections.map((section) => (
              <li key={section.id} className="mb-4">
                <button
                  onClick={() => setActiveSection(section.id)}
                  className={`flex items-center w-full text-left py-2 px-4 rounded-lg transition-colors duration-200 ${
                    activeSection === section.id ? 'bg-blue-300 text-black' : 'hover:bg-white/10'
                  }`}
                >
                  <section.icon size={20} className="mr-3" />
                  {section.name}
                </button>
              </li>
            ))}
            <li className="mt-8">
              <button
                onClick={logout}
                className="flex items-center w-full text-left py-2 px-4 rounded-lg transition-colors duration-200 hover:bg-white/10 text-red-400"
              >
                <LogOut size={20} className="mr-3" />
                Cerrar Sesión
              </button>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Desktop header */}
      <div className="hidden md:flex flex-col flex-1">
        <div className="bg-gradient-to-r from-blue-900 via-blue-700 to-blue-500 text-white p-4 flex justify-end items-center border-b border-blue-600">
          <NotificationBell />
        </div>

        {/* Main content area */}
        <div className="flex-1 overflow-auto p-8">
          {renderContent()}
        </div>
      </div>

      <div className="md:hidden bg-black text-white p-4 flex justify-between items-center w-full">
        <div className="flex items-center gap-2 text-xl font-bold">
          <div className="w-9 h-9 rounded-full bg-white border-2 border-blue-600 flex items-center justify-center">
            <span className="text-yellow-600 font-bold text-base">IB</span>
          </div>
          Cliente Gold
        </div>
        <div className="flex items-center gap-2">
          <NotificationBell />
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {isSidebarOpen && (
        <aside className="fixed inset-y-0 left-0 w-64 bg-black text-white p-6 z-50 md:hidden">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-3 text-2xl font-bold">
              <div className="w-10 h-10 rounded-full bg-white border-2 border-blue-600 flex items-center justify-center">
                <span className="text-blue-400 font-bold text-lg">IB</span>
              </div>
              Cliente Panel
            </div>
            <button onClick={() => setIsSidebarOpen(false)}>
              <X size={24} />
            </button>
          </div>
          <nav>
            <ul>
              {sections.map((section) => (
                <li key={section.id} className="mb-4">
                  <button
                    onClick={() => {
                      setActiveSection(section.id)
                      setIsSidebarOpen(false)
                    }}
                    className={`flex items-center w-full text-left py-2 px-4 rounded-lg transition-colors duration-200 ${
                      activeSection === section.id ? 'bg-blue-300 text-black' : 'hover:bg-white/10'
                    }`}
                  >
                    <section.icon size={20} className="mr-3" />
                    {section.name}
                  </button>
                </li>
              ))}
              <li className="mt-8">
                <button
                  onClick={() => {
                    logout()
                    setIsSidebarOpen(false)
                  }}
                  className="flex items-center w-full text-left py-2 px-4 rounded-lg transition-colors duration-200 hover:bg-white/10 text-red-400"
                >
                  <LogOut size={20} className="mr-3" />
                  Cerrar Sesión
                </button>
              </li>
            </ul>
          </nav>
        </aside>
      )}

      <main className="md:hidden flex-1 p-8 overflow-y-auto">
        {/* Version selector */}
        <div className="mb-6 flex items-center gap-3">
          <button onClick={() => setVersion('BLUE')} className={`px-4 py-2 rounded-md font-semibold border-2 mr-2 ${version==='BLUE' ? 'bg-blue-500 text-white border-blue-700 shadow-lg' : 'bg-white text-blue-700 border-blue-300 hover:bg-blue-50'}`}>
            BLUE
          </button>
          <button onClick={() => setVersion('GOLD')} className={`px-4 py-2 rounded-md font-semibold border-2 mr-2 ${version==='GOLD' ? 'text-black border-yellow-600 shadow-lg' : 'text-yellow-700 border-yellow-300 hover:bg-yellow-50'}`} style={version==='GOLD' ? {background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)'} : {background: 'white'}}>
            GOLD
          </button>
          <button onClick={() => setVersion('BLACK')} className={`px-4 py-2 rounded-md font-semibold border-2 ${version==='BLACK' ? 'bg-gray-800 text-white border-gray-900 shadow-lg' : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-50'}`}>
            BLACK
          </button>
        </div>

        {renderContent()}
      </main>
    </div>
  )
}

export default ClienteIB1Panel
