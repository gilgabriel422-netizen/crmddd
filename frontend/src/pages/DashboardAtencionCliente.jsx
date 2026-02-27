import React, { useState, useEffect, useMemo } from 'react'
import './DashboardGold.css'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import NotificationBell from '../components/NotificationBell'

const MODULES = [
  { id: 'bandeja', name: 'Bandeja de Mensajes', icon: '📧' },
  { id: 'plantilla', name: 'Plantilla de Bienvenida', icon: '💬' },
  { id: 'requerimientos', name: 'Requerimientos', icon: '📋' },
  { id: 'asignados', name: 'Clientes asignados a Atención', icon: '👥' },
  { id: 'clientes', name: 'Clientes', icon: '📇' },
  { id: 'reservas', name: 'Reservas Pendientes', icon: '📅' },
  { id: 'historial', name: 'Historial / Postventa', icon: '📂' }
]

const CONTACTOS = {
  atencionTelefonos: ['+593 98 147 3845', '+593 98 147 3276'],
  whatsappPrincipal: '098 147 3276',
  whatsappDigits: '593981473276',
  correoAtencion: 'servicioalclienteinnovations@gmail.com',
  correoPostventa: '',
  horario: 'De lunes a viernes, de 10:00 AM a 5:00 PM'
}

export default function DashboardAtencionCliente() {
  const { authed, logout } = useAuth()
  const navigate = useNavigate()

  const [activeModule, setActiveModule] = useState('bandeja')

  const [requerimientos, setRequerimientos] = useState([])
  const [showRequerimiento, setShowRequerimiento] = useState(false)
  const [requerimientoForm, setRequerimientoForm] = useState({
    cliente_id: '',
    tipo: 'Documentación',
    descripcion: '',
    notas: ''
  })
  const [requerimientoError, setRequerimientoError] = useState('')
  const [requerimientoSaving, setRequerimientoSaving] = useState(false)

  const [showEnviarPostventa, setShowEnviarPostventa] = useState(false)
  const [selectedPostventaIds, setSelectedPostventaIds] = useState([])
  const [enviarPostventaSaving, setEnviarPostventaSaving] = useState(false)

  const [clients, setClients] = useState([])
  const [allClients, setAllClients] = useState([])

  const [reservasPendientes, setReservasPendientes] = useState([])
  const [loadingReservas, setLoadingReservas] = useState(false)

  // ✅ “Plantilla de bienvenida”
  const [welcomePhone, setWelcomePhone] = useState('') // ✅ aquí se coloca el número del cliente
  const [selectedWelcomeClientId, setSelectedWelcomeClientId] = useState('')
  const [welcomeEjecutivo, setWelcomeEjecutivo] = useState('Estefany Aguirre')

  // =========================
  // ✅ BITÁCORA (localStorage)
  // =========================
  const BITACORA_KEY = 'bitacora_atencion_v1'
  const [bitacora, setBitacora] = useState([])

  const loadBitacora = () => {
    try {
      const raw = localStorage.getItem(BITACORA_KEY)
      const saved = raw ? JSON.parse(raw) : []
      setBitacora(Array.isArray(saved) ? saved : [])
    } catch (e) {
      console.error('Error cargando bitácora', e)
      setBitacora([])
    }
  }

  const addBitacora = (item) => {
    const entry = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      created_at: new Date().toISOString(),
      ...item
    }
    setBitacora((prev) => {
      const next = [entry, ...prev]
      try {
        localStorage.setItem(BITACORA_KEY, JSON.stringify(next))
      } catch (e) {
        console.error('No se pudo guardar bitácora', e)
      }
      return next
    })
  }

  const clearBitacora = () => {
    if (!window.confirm('¿Seguro que deseas borrar la bitácora?')) return
    localStorage.removeItem(BITACORA_KEY)
    setBitacora([])
  }

  useEffect(() => {
    if (!authed) return

    const load = async () => {
      try {
        const api = await import('../services/api')

        const resp = await api.clientService.getClients({ limit: 1000 })
        const rawClients = Array.isArray(resp?.clients) ? resp.clients : []

        const usersResp = await api.userService.getUsers()
        const users = Array.isArray(usersResp?.users) ? usersResp.users : (Array.isArray(usersResp) ? usersResp : [])

        const atencionUser = users.find(
          (u) => (u?.email || '').toLowerCase() === 'atencion@crm.com' || (u?.email || '').toLowerCase() === 'atencion'
        )

        let filtered = rawClients
        if (atencionUser?.id) {
          filtered = rawClients.filter((c) => String(c.usuario_asignado_id) === String(atencionUser.id))
        } else {
          const byName = rawClients.filter((c) => ((c.usuario_asignado_nombre || '') + '').toLowerCase().includes('atenci'))
          filtered = byName.length > 0 ? byName : rawClients
        }

        setClients(filtered)
        setAllClients(rawClients)

        await cargarReservasPendientes()
        loadBitacora()
      } catch (e) {
        console.error(e)
      }
    }

    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authed])

  const cargarReservasPendientes = async () => {
    try {
      setLoadingReservas(true)
      const api = await import('../services/api')
      const response = await api.default.get('/reservas')
      const reservas = Array.isArray(response.data) ? response.data : []
      const pendientes = reservas.filter((r) => (r.estado || '').toLowerCase() === 'pendiente')
      setReservasPendientes(pendientes)
    } catch (error) {
      console.error('Error cargando reservas:', error)
      setReservasPendientes([])
    } finally {
      setLoadingReservas(false)
    }
  }

  // ✅ helpers de teléfono
  const toDigits = (val) => (val || '').toString().replace(/\D/g, '')
  const normalizeEcuadorToWaMe = (digits) => {
    // acepta 098..., 09..., 593..., +593...
    let d = toDigits(digits)
    if (!d) return ''
    if (d.startsWith('0') && d.length === 10) {
      d = `593${d.slice(1)}`
    }
    // si ya viene 5939... se deja
    return d
  }

  const plantillaOficial = useMemo(() => {
    const client = (allClients || []).find((x) => String(x.id) === String(selectedWelcomeClientId))
    const clienteNombre = client ? `${client.first_name} ${client.last_name}` : 'Belisario'

    return `💼 ¡Bienvenido(a) a la exclusividad de la familia Innovation business! 🤝✨
Buenos días estimad@ ${clienteNombre} le saluda ${welcomeEjecutivo} su ejecutivo asignado  🤗
Nos complace enormemente contar con su confianza y le agradecemos sinceramente por elegir a Innovation business como su aliado en su planificación de viajes. Nuestro compromiso es ofrecerle una atención personalizada y un servicio de excelencia en cada una de nuestras áreas.

En Innovation business, brindamos una amplia gama de servicios pensados en su bienestar y comodidad:
 🌎 Turismo / Visas | 🌐 Importación | ✈️ Work & Travel

Sabemos que cada cliente es único, por eso nos enfocamos en ofrecer soluciones confiables, seguras y adaptadas a su necesidad, asegurándonos de que su experiencia con nosotros sea siempre satisfactoria.

📋🕕 Horario de atención: ${CONTACTOS.horario}. En caso de requerimientos especiales, nuestro equipo estará disponible para brindarle asistencia oportuna.

📞🧑‍💻 Atención al cliente: Si tiene alguna consulta, solicitud o desea más información sobre nuestros servicios, puede contactarnos:
📧 Correo: ${CONTACTOS.correoAtencion}
📲 WhatsApp: ${CONTACTOS.whatsappPrincipal}

📝🧑‍💼 Requerimientos o solicitudes: Para garantizar una atención ágil y ordenada,  con la prioridad que merece.`
  }, [allClients, selectedWelcomeClientId, welcomeEjecutivo])

  const copiarPlantilla = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      alert('Plantilla copiada ✅')
    } catch (e) {
      console.error(e)
      alert('No se pudo copiar. Revisa permisos del navegador.')
    }
  }

  const abrirWhatsApp = (text) => {
    const normalized = normalizeEcuadorToWaMe(welcomePhone)
    const phone = normalized || CONTACTOS.whatsappDigits
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const handleRequerimientoChange = (field, value) => {
    setRequerimientoForm((prev) => ({ ...prev, [field]: value }))
    setRequerimientoError('')
  }

  const closeRequerimientoModal = () => {
    setShowRequerimiento(false)
    setRequerimientoForm({ cliente_id: '', tipo: 'Documentación', descripcion: '', notas: '' })
    setRequerimientoError('')
  }

  const handleGuardarRequerimiento = () => {
    if (!requerimientoForm.descripcion.trim()) {
      setRequerimientoError('Ingresa la descripción del requerimiento.')
      return
    }
    setRequerimientoSaving(true)
    setRequerimientoError('')

    const cliente = (allClients || []).find((c) => String(c.id) === String(requerimientoForm.cliente_id))
    const clienteNombre = cliente
      ? `${cliente.first_name} ${cliente.last_name}`
      : requerimientoForm.cliente_id
        ? `Cliente #${requerimientoForm.cliente_id}`
        : 'Sin asignar'

    setRequerimientos((prev) => [
      ...prev,
      {
        id: Date.now(),
        cliente: clienteNombre,
        tipo: requerimientoForm.tipo,
        detalle: requerimientoForm.descripcion,
        notas: requerimientoForm.notas,
        created_at: new Date().toISOString()
      }
    ])

    addBitacora({
      cliente: clienteNombre,
      motivo: `Requerimiento creado (${requerimientoForm.tipo})`
    })

    setRequerimientoSaving(false)
    closeRequerimientoModal()
  }

  const openEnviarPostventaModal = () => {
    setSelectedPostventaIds([])
    setShowEnviarPostventa(true)
  }

  const closeEnviarPostventaModal = () => {
    setShowEnviarPostventa(false)
    setSelectedPostventaIds([])
    setEnviarPostventaSaving(false)
  }

  const togglePostventaClient = (id) => {
    setSelectedPostventaIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  const selectAllPostventa = () => setSelectedPostventaIds(clients.map((c) => c.id))
  const deselectAllPostventa = () => setSelectedPostventaIds([])

  const handleEnviarSeleccionadosAPostventa = async () => {
    if (selectedPostventaIds.length === 0) {
      alert('Selecciona al menos un cliente.')
      return
    }
    setEnviarPostventaSaving(true)
    try {
      const api = await import('../services/api')
      const usersResp = await api.userService.getUsers()
      const users = Array.isArray(usersResp?.users) ? usersResp.users : (Array.isArray(usersResp) ? usersResp : [])

      const post = users.find(
        (u) => (u.email || '').toLowerCase() === 'postventa@crm.com' || (u.email || '').toLowerCase() === 'postventa'
      )
      if (!post) {
        alert('Usuario Postventa no encontrado')
        setEnviarPostventaSaving(false)
        return
      }

      const currentUser = JSON.parse(localStorage.getItem('user') || 'null')

      for (const clientId of selectedPostventaIds) {
        await api.clientService.updateClient(clientId, { usuario_asignado_id: post.id })

        const cl = (allClients || []).find((x) => String(x.id) === String(clientId))
        addBitacora({
          cliente: cl ? `${cl.first_name} ${cl.last_name}` : `Cliente #${clientId}`,
          motivo: 'Enviado a Postventa desde Atención'
        })

        try {
          await api.default.post('/client-transfers', {
            clientId,
            fromUserId: currentUser?.id || null,
            toUserId: post.id,
            reason: 'Enviado a Postventa desde Atención'
          })
        } catch (err) {
          console.warn('Registro de transferencia falló (backend)', err)
        }
      }

      setClients((prev) => prev.filter((c) => !selectedPostventaIds.includes(c.id)))
      alert(`Se envió a Postventa: ${selectedPostventaIds.length} cliente(s).`)
      closeEnviarPostventaModal()
    } catch (e) {
      console.error(e)
      alert('Error: ' + (e.message || e))
    } finally {
      setEnviarPostventaSaving(false)
    }
  }

  const moduloNombre = MODULES.find((m) => m.id === activeModule)?.name || ''

  return (
    <div className="dashboard-gold-bg min-h-screen flex">
      {/* Sidebar módulos */}
      <aside className="w-56 bg-white bg-opacity-90 shadow-lg flex-shrink-0 p-3">
        <h2 className="text-lg font-bold text-black mb-3 px-2">Panel de Atención</h2>
        <nav className="space-y-1">
          {MODULES.map((m) => (
            <button
              key={m.id}
              onClick={() => setActiveModule(m.id)}
              className={`w-full text-left px-3 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
                activeModule === m.id
                  ? 'bg-gradient-to-r from-yellow-400 to-yellow-700 text-black'
                  : 'text-gray-700 hover:bg-yellow-100'
              }`}
            >
              <span>{m.icon}</span>
              <span className="text-sm">{m.name}</span>
            </button>
          ))}
        </nav>
        <div className="mt-4 pt-4 border-t border-gray-200">
          <button className="w-full px-3 py-2 border rounded text-red-700 hover:bg-red-50 font-medium" onClick={logout}>
            Salir
          </button>
        </div>
      </aside>

      {/* Contenido principal */}
      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-5xl mx-auto flex items-center justify-between mb-3">
          <div>
            <h1 className="text-2xl font-bold text-black">Dashboard Atención</h1>
            <div className="text-sm text-gray-700 mt-1">
              Módulo actual: <span className="font-semibold">{moduloNombre}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <NotificationBell />
          </div>
        </div>

        <div className="max-w-5xl mx-auto mb-3">
          <h2 className="text-xl font-bold text-black">{moduloNombre}</h2>
        </div>

        {/* Bandeja */}
        {activeModule === 'bandeja' && (
          <div className="bg-white bg-opacity-80 rounded-lg shadow p-6 max-w-5xl mx-auto">
            <button
              className="w-full max-w-xs px-4 py-3 bg-gradient-to-r from-yellow-400 to-yellow-700 text-black rounded font-semibold hover:opacity-90"
              onClick={() => navigate('/bandeja-mensajes')}
            >
              📧 Ir a Bandeja de Mensajes
            </button>
          </div>
        )}

        {/* Plantilla */}
        {activeModule === 'plantilla' && (
          <div className="bg-white bg-opacity-80 rounded-lg shadow p-6 max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ejecutivo asignado</label>
                <input
                  value={welcomeEjecutivo}
                  onChange={(e) => setWelcomeEjecutivo(e.target.value)}
                  className="w-full border p-2 rounded"
                  placeholder="Ej: Estefany Aguirre"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cliente (opcional)</label>
                <select
                  className="w-full border p-2 rounded"
                  value={selectedWelcomeClientId}
                  onChange={(e) => {
                    const id = e.target.value || ''
                    setSelectedWelcomeClientId(id)

                    // ✅ si escoges cliente, autocompleta el teléfono
                    const client = (allClients || []).find((x) => String(x.id) === String(id))
                    if (client) {
                      const raw = client.phone || client.telefono || client.telefono_movil || ''
                      setWelcomePhone(raw ? raw.toString() : '')
                    } else {
                      // si es manual, deja el campo como esté (no lo borra)
                    }
                  }}
                >
                  <option value="">-- Manual (sin cliente) --</option>
                  {(allClients || []).map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.first_name} {c.last_name} — {c.email}
                    </option>
                  ))}
                </select>
              </div>

              {/* ✅ AQUÍ pones el número del cliente */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Número del cliente (WhatsApp)</label>
                <input
                  value={welcomePhone}
                  onChange={(e) => setWelcomePhone(e.target.value)}
                  className="w-full border p-2 rounded"
                  placeholder="Ej: 0981473276 o 593981473276"
                />
                <div className="text-xs text-gray-600 mt-1">
                  Si queda vacío, se usa el WhatsApp principal: {CONTACTOS.whatsappPrincipal}
                </div>
              </div>
            </div>

            <label className="block text-sm font-medium text-gray-700 mb-1">Plantilla oficial</label>
            <textarea value={plantillaOficial} readOnly className="w-full h-72 border p-2 rounded bg-gray-50" />

            <div className="flex flex-wrap gap-2 mt-3">
              <button type="button" className="px-3 py-2 border rounded" onClick={() => copiarPlantilla(plantillaOficial)}>
                Copiar plantilla
              </button>
              <button type="button" className="px-3 py-2 bg-green-600 text-white rounded" onClick={() => abrirWhatsApp(plantillaOficial)}>
                Abrir WhatsApp con plantilla
              </button>
            </div>
          </div>
        )}

        {/* Requerimientos */}
        {activeModule === 'requerimientos' && (
          <div className="bg-white bg-opacity-80 rounded-lg shadow p-6 max-w-5xl mx-auto">
            <button
              className="mb-4 px-4 py-2 bg-gradient-to-r from-yellow-400 to-yellow-700 text-black rounded font-semibold"
              onClick={() => setShowRequerimiento(true)}
            >
              Nuevo Requerimiento
            </button>
            <h3 className="font-semibold text-black mb-2">Requerimientos</h3>
            <ul>
              {requerimientos.length === 0 ? (
                <li className="text-gray-600">No hay requerimientos registrados</li>
              ) : (
                requerimientos.map((r) => (
                  <li key={r.id} className="border-b py-2 text-black">
                    <span className="font-medium">{r.cliente}</span> — {r.tipo}: {r.detalle}
                  </li>
                ))
              )}
            </ul>
          </div>
        )}

        {/* Reservas */}
        {activeModule === 'reservas' && (
          <div className="bg-white bg-opacity-80 rounded-lg shadow p-6 max-w-5xl mx-auto">
            <h3 className="text-xl font-bold text-black mb-4">📅 Reservas Pendientes</h3>
            {loadingReservas ? (
              <p className="text-gray-600">Cargando reservas...</p>
            ) : reservasPendientes.length === 0 ? (
              <p className="text-gray-600">No hay reservas pendientes</p>
            ) : (
              <ul className="space-y-3">
                {reservasPendientes.map((res) => (
                  <li key={res.id} className="border-l-4 border-yellow-500 bg-yellow-50 p-3 rounded">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-semibold">Reserva #{res.numero_reserva}</p>
                        <p className="text-sm text-gray-700">Cliente ID: {res.cliente_id || res.usuario_id}</p>
                      </div>
                      <button className="ml-2 px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-sm" onClick={() => alert('Función para confirmar reserva próximamente')}>
                        Confirmar
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Historial / Bitácora */}
        {activeModule === 'historial' && (
          <div className="bg-white bg-opacity-80 rounded-lg shadow p-6 max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-black">Historial / Postventa (Bitácora)</h3>
              <button className="px-3 py-1 border rounded text-sm" onClick={clearBitacora}>
                Borrar bitácora
              </button>
            </div>

            {bitacora.length === 0 ? (
              <p className="text-gray-600">
                Aún no hay registros. Se crean cuando:
                <br />• envías un cliente a Postventa
                <br />• registras un requerimiento
              </p>
            ) : (
              <ul>
                {bitacora.map((p) => (
                  <li key={p.id} className="border-b py-3 text-black">
                    <div className="font-medium">{p.cliente}</div>
                    <div className="text-sm text-gray-700">{p.motivo}</div>
                    <div className="text-xs text-gray-500">{new Date(p.created_at).toLocaleString('es-ES')}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </main>

      {/* Modal Nuevo Requerimiento */}
      {showRequerimiento && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Nuevo Requerimiento</h3>

            {requerimientoError && (
              <div className="mb-3 p-2 bg-red-50 border border-red-200 text-red-700 rounded text-sm">
                {requerimientoError}
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cliente (opcional)</label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  value={requerimientoForm.cliente_id}
                  onChange={(e) => handleRequerimientoChange('cliente_id', e.target.value)}
                >
                  <option value="">— Sin asignar —</option>
                  {(allClients || []).map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.first_name} {c.last_name} — {c.contract_number || c.email}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  value={requerimientoForm.tipo}
                  onChange={(e) => handleRequerimientoChange('tipo', e.target.value)}
                >
                  <option value="Documentación">Documentación</option>
                  <option value="Consulta">Consulta</option>
                  <option value="Seguimiento">Seguimiento</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción *</label>
                <textarea
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  rows={3}
                  value={requerimientoForm.descripcion}
                  onChange={(e) => handleRequerimientoChange('descripcion', e.target.value)}
                  placeholder="Describe el requerimiento..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notas (opcional)</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  value={requerimientoForm.notas}
                  onChange={(e) => handleRequerimientoChange('notas', e.target.value)}
                  placeholder="Notas adicionales"
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end mt-4">
              <button type="button" className="px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50" onClick={closeRequerimientoModal}>
                Cancelar
              </button>
              <button
                type="button"
                className="px-3 py-2 bg-gradient-to-r from-yellow-400 to-yellow-700 text-black rounded-lg font-medium hover:opacity-90 disabled:opacity-50"
                disabled={requerimientoSaving}
                onClick={handleGuardarRequerimiento}
              >
                {requerimientoSaving ? 'Guardando...' : 'Registrar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Enviar a Postventa */}
      {showEnviarPostventa && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full shadow-xl max-h-[85vh] flex flex-col">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Enviar clientes a Postventa</h3>
            <p className="text-sm text-gray-600 mb-3">Elige uno o varios clientes para reasignarlos a Postventa.</p>

            {clients.length === 0 ? (
              <p className="text-gray-500 py-4">No hay clientes asignados a Atención.</p>
            ) : (
              <>
                <div className="flex gap-3 mb-3">
                  <button type="button" className="text-sm text-blue-600 hover:underline" onClick={selectAllPostventa}>
                    Seleccionar todos
                  </button>
                  <button type="button" className="text-sm text-gray-600 hover:underline" onClick={deselectAllPostventa}>
                    Deseleccionar todos
                  </button>
                </div>

                <ul className="border border-gray-200 rounded-lg overflow-y-auto flex-1 min-h-0 space-y-0 divide-y divide-gray-100">
                  {clients.map((c) => (
                    <li key={c.id} className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={selectedPostventaIds.includes(c.id)}
                        onChange={() => togglePostventaClient(c.id)}
                        className="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
                      />
                      <div className="flex-1 min-w-0">
                        <span className="font-medium text-gray-900">{c.first_name} {c.last_name}</span>
                        <span className="text-gray-500 text-sm ml-1">{c.email}</span>
                      </div>
                    </li>
                  ))}
                </ul>

                <p className="text-sm text-gray-500 mt-2">
                  {selectedPostventaIds.length} de {clients.length} seleccionado(s)
                </p>
              </>
            )}

            <div className="flex gap-2 justify-end mt-4 pt-3 border-t border-gray-200">
              <button type="button" className="px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50" onClick={() => setShowEnviarPostventa(false)}>
                Cancelar
              </button>
              <button
                type="button"
                className="px-3 py-2 bg-gradient-to-r from-yellow-400 to-yellow-700 text-black rounded-lg font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={clients.length === 0 || selectedPostventaIds.length === 0 || enviarPostventaSaving}
                onClick={handleEnviarSeleccionadosAPostventa}
              >
                {enviarPostventaSaving ? 'Enviando...' : `Enviar ${selectedPostventaIds.length > 0 ? `(${selectedPostventaIds.length})` : ''} a Postventa`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}