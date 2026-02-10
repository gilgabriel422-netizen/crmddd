import React from 'react'
import { FileText, Gift, HelpCircle, Menu, X, LogOut, BookOpen, Award, MessageCircle, Inbox, Package, MapPin } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import WhatsAppFloat from '../components/WhatsAppFloat'
import { useAuth } from '../contexts/AuthContext'
import NotificationBell from '../components/NotificationBell'
import VisorPlantillaContrato from '../components/VisorPlantillaContrato'
import BeneficiosCliente from '../components/BeneficiosCliente'
import SolicitarReserva from '../components/SolicitarReserva'
import ReservasPaquetesCliente from '../components/ReservasPaquetesCliente'
import NochesNacionales from '../components/NochesNacionales'

const ClientePanel = () => {
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
  const navigate = useNavigate()

  const formatDate = (value) => {
    if (!value) return '—'
    return new Date(value).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const [puntosIB, setPuntosIB] = React.useState(0)
  React.useEffect(() => {
    const email = user?.email || cliente?.email
    if (!email) return
    const load = async () => {
      try {
        const pointsService = (await import('../services/pointsService')).default
        const pts = await pointsService.getPointsForUser(email)
        setPuntosIB(pts ?? 0)
      } catch (e) { setPuntosIB(0) }
    }
    load()
  }, [user?.email, cliente?.email])

  const formatPuntos = (puntos) => {
    return (puntos ?? 0).toLocaleString('es-ES')
  }

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

  const sections = [
    { id: 'contrato', name: 'Contrato', icon: FileText },
    { id: 'beneficios', name: 'Beneficios', icon: Gift },
    { id: 'puntos-ib', name: 'Puntos IB', icon: Award },
    { id: 'reservas', name: 'Reservas', icon: Package },
    { id: 'noches-nacionales', name: 'Noches nacionales', icon: MapPin },
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
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Beneficios</h2>
            {(cliente?.anos != null || cliente?.remaining_nights != null || cliente?.total_nights != null) && (
              <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
                <h3 className="font-semibold text-gray-800 mb-2">Beneficios de tu contrato (registrados al darte de alta)</h3>
                <div className="flex flex-wrap gap-4 text-sm">
                  {cliente?.anos != null && <span><strong>Años de contrato:</strong> {cliente.anos === 0 ? 'Indefinido' : cliente.anos}</span>}
                  {cliente?.total_nights != null && <span><strong>Noches totales:</strong> {cliente.total_nights}</span>}
                  {cliente?.remaining_nights != null && <span><strong>Noches disponibles:</strong> {cliente.remaining_nights}</span>}
                </div>
              </div>
            )}
            <BeneficiosCliente clienteId={user?.id || cliente?.id} />
          </div>
        )
      case 'puntos-ib':
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Puntos IB</h2>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 p-6 rounded-lg text-white">
                <h3 className="text-lg font-semibold mb-2">Tus Puntos IB</h3>
                <p className="text-4xl font-bold">{formatPuntos(puntosIB)}</p>
                <p className="text-sm mt-2">Puntos disponibles (asignados al crear tu cliente por admin/contratos)</p>
              </div>
              <div className="mt-6 bg-gray-800 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-white mb-3">¿Cómo funcionan los Puntos IB?</h3>
                <ul className="space-y-2 text-sm text-gray-200">
                  <li className="flex items-start"><span className="text-green-400 mr-2">✓</span><span>Se asignan según el valor de tu venta al darte de alta</span></li>
                  <li className="flex items-start"><span className="text-green-400 mr-2">✓</span><span>Canjéalos por descuentos en reservas (ej. Noches nacionales)</span></li>
                  <li className="flex items-start"><span className="text-green-400 mr-2">✓</span><span>1 USD = 1 Punto IB en uso para pagos</span></li>
                </ul>
              </div>
            </div>
          </div>
        )
      case 'reservas':
        return <ReservasPaquetesCliente />
      case 'noches-nacionales':
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Noches nacionales</h2>
            <NochesNacionales />
          </div>
        )
      case 'solicitar-reserva':
        return (
          <SolicitarReserva clienteId={user?.id || cliente?.id} />
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
              <div className="flex justify-center mt-6">
                <a
                  href="https://wa.me/0984707978?text=¡Hola! Me gustaría obtener información sobre los paquetes turísticos de Innovation Business."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg shadow transition-all text-lg"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path fill="#fff" d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.472-.148-.67.15-.198.297-.767.966-.94 1.164-.173.198-.347.223-.644.075-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.151-.174.2-.298.3-.497.099-.198.05-.372-.025-.52-.075-.148-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.372-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.1 3.2 5.077 4.363.709.306 1.262.489 1.694.626.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.288.173-1.413-.074-.124-.272-.198-.57-.347zm-5.421 7.617h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.999-3.648-.235-.374A9.86 9.86 0 0 1 0 11.513C0 5.156 5.373 0 12 0c3.181 0 6.167 1.237 8.413 3.484C22.658 5.73 24 8.718 24 11.898c0 6.357-5.373 11.101-12 11.101zm6.545-17.546A8.919 8.919 0 0 0 12 2.003C6.065 2.003 1.13 6.94 1.13 11.898c0 2.062.805 4.012 2.29 5.605l.327.344-.593 2.166 2.225-.584.342.203a8.936 8.936 0 0 0 4.28 1.09h.002c4.934 0 8.87-3.936 8.87-8.793 0-2.362-.924-4.58-2.603-6.384z"/></svg>
                  WhatsApp
                </a>
              </div>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-900 via-blue-700 to-blue-500 text-white">
      {/* Sidebar desktop */}
      <aside className="w-64 bg-black text-white p-6 flex-shrink-0 hidden md:block">
          <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-full bg-white border-2 border-gold flex items-center justify-center">
            <span className="text-gold font-bold text-xl">IB</span>
          </div>
          <div className="text-2xl font-bold">Cliente Blue</div>
        </div>
        <nav className="flex flex-col h-full">
          <ul className="flex-1">
            {sections.map((section) => (
              <li key={section.id} className="mb-4">
                <button
                  onClick={() => setActiveSection(section.id)}
                  className={`flex items-center w-full text-left py-2 px-4 rounded-lg transition-colors duration-200 ${
                    activeSection === section.id ? 'bg-gold text-black' : 'hover:bg-white/10'
                  }`}
                >
                  <section.icon size={20} className="mr-3" />
                  {section.name}
                </button>
              </li>
            ))}
            {/* Botón cerrar sesión */}
            <li className="mt-auto pt-8 border-t border-white/10">
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

      {/* Mobile header */}
      <div className="md:hidden bg-black text-white p-4 flex justify-between items-center w-full">
        <div className="flex items-center gap-2 text-xl font-bold">
          <div className="w-9 h-9 rounded-full bg-white border-2 border-gold flex items-center justify-center">
            <span className="text-gold font-bold text-base">IB</span>
          </div>
          Cliente Panel
        </div>
        <div className="flex items-center gap-2">
          <NotificationBell />
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile sidebar */}
      {isSidebarOpen && (
        <aside className="fixed inset-y-0 left-0 w-64 bg-black text-white p-6 z-50 md:hidden">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-3 text-2xl font-bold">
              <div className="w-10 h-10 rounded-full bg-white border-2 border-gold flex items-center justify-center">
                <span className="text-gold font-bold text-lg">IB</span>
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
                      activeSection === section.id ? 'bg-gold text-black' : 'hover:bg-white/10'
                    }`}
                  >
                    <section.icon size={20} className="mr-3" />
                    {section.name}
                  </button>
                </li>
              ))}
              {/* Botón cerrar sesión mobile */}
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

      {/* Mobile main content */}
      <main className="md:hidden flex-1 p-8 overflow-y-auto">
        {renderContent()}
      </main>
    </div>
  )
}

export default ClientePanel
