import React, { useState, useEffect } from 'react'
import './DashboardGold.css'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import NotificationBell from '../components/NotificationBell'

const MODULES = [
  { id: 'bandeja', name: 'Bandeja de Mensajes', icon: '📧' },
  { id: 'requerimientos', name: 'Requerimientos', icon: '📋' },
  { id: 'asignados', name: 'Clientes asignados a Atención', icon: '👥' },
  { id: 'clientes', name: 'Clientes', icon: '📇' },
  { id: 'reservas', name: 'Reservas Pendientes', icon: '📅' },
  { id: 'historial', name: 'Historial / Postventa', icon: '📂' }
]

export default function DashboardAtencionCliente() {
  const { authed, logout } = useAuth()
  const navigate = useNavigate()
  const [activeModule, setActiveModule] = useState('bandeja')
  const [requerimientos, setRequerimientos] = useState([])
  const [postventa] = useState([])
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
  const [selectedCliente, setSelectedCliente] = useState(null)
  const [clients, setClients] = useState([])
  const [allClients, setAllClients] = useState([])
  const [reservasPendientes, setReservasPendientes] = useState([])
  const [loadingReservas, setLoadingReservas] = useState(false)
  const [showWelcomeModal, setShowWelcomeModal] = useState(false)
  const [welcomeTemplate, setWelcomeTemplate] = useState('')
  const [welcomePhone, setWelcomePhone] = useState('')
  const [selectedWelcomeClientId, setSelectedWelcomeClientId] = useState('')

  useEffect(() => {
    if (!authed) return
    const load = async () => {
      try {
        const api = await import('../services/api')
        const resp = await api.clientService.getClients({ limit: 1000 })
        const users = await api.userService.getUsers()
        const atencionUser = (users.users || users).find(
          (u) => u.email === 'atencion@crm.com' || u.email === 'atencion'
        )
        const filtered = (resp.clients || []).filter((c) =>
          atencionUser
            ? c.usuario_asignado_id === atencionUser.id
            : (c.usuario_asignado_nombre || '').toLowerCase().includes('atenci')
        )
        setClients(filtered)
        setAllClients(resp.clients || [])
        cargarReservasPendientes()
      } catch (e) {
        console.error(e)
      }
    }
    load()
  }, [authed])

  const cargarReservasPendientes = async () => {
    try {
      setLoadingReservas(true)
      const api = await import('../services/api')
      const response = await api.default.get('/api/reservas')
      const reservas = Array.isArray(response.data) ? response.data : []
      const pendientes = reservas.filter(r => r.estado === 'pendiente')
      setReservasPendientes(pendientes)
    } catch (error) {
      setReservasPendientes([])
    } finally {
      setLoadingReservas(false)
    }
  }

  const openWelcome = () => {
    setSelectedWelcomeClientId('')
    setWelcomeTemplate('')
    setWelcomePhone('')
    setShowWelcomeModal(true)
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
    const cliente = allClients.find((c) => String(c.id) === String(requerimientoForm.cliente_id))
    const clienteNombre = cliente ? `${cliente.first_name} ${cliente.last_name}` : requerimientoForm.cliente_id ? `Cliente #${requerimientoForm.cliente_id}` : 'Sin asignar'
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
    setSelectedPostventaIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  const selectAllPostventa = () => {
    setSelectedPostventaIds(clients.map((c) => c.id))
  }

  const deselectAllPostventa = () => {
    setSelectedPostventaIds([])
  }

  const handleEnviarSeleccionadosAPostventa = async () => {
    if (selectedPostventaIds.length === 0) {
      alert('Selecciona al menos un cliente.')
      return
    }
    setEnviarPostventaSaving(true)
    try {
      const api = await import('../services/api')
      const users = await api.userService.getUsers()
      const post = (users.users || users).find((u) => u.email === 'postventa@crm.com' || u.email === 'postventa')
      if (!post) {
        alert('Usuario Postventa no encontrado')
        setEnviarPostventaSaving(false)
        return
      }
      const currentUser = JSON.parse(localStorage.getItem('user') || 'null')
      for (const clientId of selectedPostventaIds) {
        await api.clientService.updateClient(clientId, { usuario_asignado_id: post.id })
        try {
          await api.default.post('/client-transfers', {
            clientId,
            fromUserId: currentUser?.id || null,
            toUserId: post.id,
            reason: 'Enviado a Postventa desde Atención'
          })
        } catch (err) {
          console.warn('Registro de transferencia falló', err)
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
          <button
            className="w-full px-3 py-2 border rounded text-red-700 hover:bg-red-50 font-medium"
            onClick={logout}
          >
            Salir
          </button>
        </div>
      </aside>

      {/* Contenido principal */}
      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-5xl mx-auto flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-black">
            {MODULES.find(m => m.id === activeModule)?.name || 'Panel de Atención'}
          </h1>
          <div className="flex items-center gap-2">
            <NotificationBell />
          </div>
        </div>

        {/* Módulo: Bandeja de Mensajes */}
        {activeModule === 'bandeja' && (
          <div className="bg-white bg-opacity-80 rounded-lg shadow p-6">
            <button
              className="w-full max-w-xs px-4 py-3 bg-gradient-to-r from-yellow-400 to-yellow-700 text-black rounded font-semibold hover:opacity-90"
              onClick={() => navigate('/bandeja-mensajes')}
            >
              📧 Ir a Bandeja de Mensajes
            </button>
          </div>
        )}

        {/* Módulo: Requerimientos */}
        {activeModule === 'requerimientos' && (
          <div className="bg-white bg-opacity-80 rounded-lg shadow p-6">
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

        {/* Módulo: Clientes asignados a Atención */}
        {activeModule === 'asignados' && (
          <div className="bg-white bg-opacity-80 rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-black">Clientes asignados a Atención</h3>
              <button
                className="px-3 py-1 bg-gradient-to-r from-yellow-400 to-yellow-700 text-black rounded"
                onClick={openEnviarPostventaModal}
              >
                Enviar a Postventa
              </button>
            </div>
            <ul className="space-y-2">
              {clients.length === 0 ? (
                <li className="text-gray-600">No hay clientes asignados</li>
              ) : (
                clients.map((c) => (
                  <li key={c.id} className="flex justify-between items-center border-b py-2">
                    <div>
                      <div className="font-semibold text-black">{c.first_name} {c.last_name}</div>
                      <div className="text-sm text-gray-700">{c.email}</div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        className="px-2 py-1 bg-gradient-to-r from-yellow-400 to-yellow-700 text-black rounded text-sm"
                        onClick={async () => {
                          try {
                            const api = await import('../services/api')
                            const users = await api.userService.getUsers()
                            const post = (users.users || users).find(u => u.email === 'postventa@crm.com' || u.email === 'postventa')
                            if (!post) return alert('Usuario Postventa no encontrado')
                            await api.clientService.updateClient(c.id, { usuario_asignado_id: post.id })
                            try {
                              const currentUser = JSON.parse(localStorage.getItem('user') || 'null')
                              await api.default.post('/client-transfers', {
                                clientId: c.id,
                                fromUserId: currentUser?.id || null,
                                toUserId: post.id,
                                reason: 'Enviado a Postventa desde Atención'
                              })
                            } catch (err) { console.warn('Registro de transferencia falló', err) }
                            alert('Enviado a Postventa')
                            setClients(prev => prev.filter(x => x.id !== c.id))
                          } catch (e) { console.error(e); alert('Error: ' + (e.message || e)) }
                        }}
                      >
                        Enviar a Postventa
                      </button>
                      <button className="px-2 py-1 border rounded text-sm" onClick={() => alert('Crear reserva (no implementado)')}>Crear Reserva</button>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>
        )}

        {/* Módulo: Clientes (todos) + Dar bienvenida */}
        {activeModule === 'clientes' && (
          <div className="bg-white bg-opacity-80 rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-black">Todos los clientes</h3>
              <button
                className="px-4 py-2 bg-green-600 text-white rounded font-medium hover:bg-green-700"
                onClick={openWelcome}
              >
                Dar bienvenida
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-4">Listado de todos los clientes creados. Usa &quot;Dar bienvenida&quot; para enviar mensaje por WhatsApp.</p>
            <div className="overflow-x-auto max-h-[60vh] overflow-y-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-100 sticky top-0">
                  <tr>
                    <th className="p-2 font-semibold text-black">Nombre</th>
                    <th className="p-2 font-semibold text-black">Email</th>
                    <th className="p-2 font-semibold text-black">Contrato</th>
                  </tr>
                </thead>
                <tbody>
                  {allClients.length === 0 ? (
                    <tr><td colSpan={3} className="p-4 text-gray-600">No hay clientes registrados</td></tr>
                  ) : (
                    allClients.map((c) => (
                      <tr key={c.id} className="border-b hover:bg-gray-50">
                        <td className="p-2 font-medium">{c.first_name} {c.last_name}</td>
                        <td className="p-2 text-gray-700">{c.email}</td>
                        <td className="p-2 text-gray-700">{c.contract_number || '—'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Módulo: Reservas Pendientes */}
        {activeModule === 'reservas' && (
          <div className="bg-white bg-opacity-80 rounded-lg shadow p-6">
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
                        <p className="text-sm text-gray-700">
                          📅 {res.fecha_entrada ? new Date(res.fecha_entrada).toLocaleDateString('es-ES') : 'N/A'} - {res.fecha_salida ? new Date(res.fecha_salida).toLocaleDateString('es-ES') : 'N/A'}
                        </p>
                        <p className="text-sm text-gray-700">👥 {res.personas} {res.personas === 1 ? 'persona' : 'personas'} | {res.noches} {res.noches === 1 ? 'noche' : 'noches'}</p>
                        {res.tipo_habitacion && <p className="text-sm text-gray-700">🏨 Tipo: {res.tipo_habitacion}</p>}
                        {res.observaciones && <p className="text-sm text-gray-700 mt-1">📝 {res.observaciones}</p>}
                      </div>
                      <button
                        className="ml-2 px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-sm"
                        onClick={() => alert('Función para confirmar reserva próximamente')}
                      >
                        Confirmar
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Módulo: Historial / Postventa */}
        {activeModule === 'historial' && (
          <div className="bg-white bg-opacity-80 rounded-lg shadow p-6">
            <h3 className="text-xl font-bold text-black mb-4">Historial / Postventa</h3>
            <ul>
              {postventa.length === 0 ? (
                <li className="text-gray-600">No hay registros</li>
              ) : (
                postventa.map((p, i) => (
                  <li key={i} className="border-b py-2 text-black">{p.cliente} - {p.motivo}</li>
                ))
              )}
            </ul>
          </div>
        )}
      </main>

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
                  <button
                    type="button"
                    className="text-sm text-blue-600 hover:underline"
                    onClick={selectAllPostventa}
                  >
                    Seleccionar todos
                  </button>
                  <button
                    type="button"
                    className="text-sm text-gray-600 hover:underline"
                    onClick={deselectAllPostventa}
                  >
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
              <button
                type="button"
                className="px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                onClick={closeEnviarPostventaModal}
              >
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
                    <option key={c.id} value={c.id}>{c.first_name} {c.last_name} — {c.contract_number || c.email}</option>
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
              <button
                type="button"
                className="px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                onClick={closeRequerimientoModal}
              >
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

      {/* Modal Dar bienvenida */}
      {showWelcomeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full shadow-xl">
            <h3 className="text-lg font-semibold mb-4">Enviar bienvenida por WhatsApp</h3>
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Elegir cliente</label>
              <select
                className="w-full border p-2 rounded"
                value={selectedWelcomeClientId}
                onChange={(e) => {
                  const id = e.target.value || ''
                  setSelectedWelcomeClientId(id)
                  const client = (allClients || []).find((x) => String(x.id) === String(id))
                  if (client) {
                    setWelcomePhone((client.phone || client.telefono || client.telefono_movil || '').toString().replace(/\D/g, ''))
                    if (!welcomeTemplate.trim()) setWelcomeTemplate(`¡Hola ${client.first_name} ${client.last_name}!\n\nBienvenido a Innovation Business. Tu contrato ${client.contract_number || ''} ha sido registrado correctamente.\n\nSi necesitas asistencia, responde a este mensaje.`)
                  }
                }}
              >
                <option value="">-- Seleccionar cliente --</option>
                {(allClients || []).map((c) => (
                  <option key={c.id} value={c.id}>{c.first_name} {c.last_name} — {c.email}</option>
                ))}
              </select>
            </div>
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Plantilla de bienvenida</label>
              <textarea value={welcomeTemplate} onChange={(e) => setWelcomeTemplate(e.target.value)} className="w-full h-36 border p-2 rounded" placeholder="Escribe el mensaje de bienvenida..." />
            </div>
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Número de teléfono (se completa al elegir cliente)</label>
              <input value={welcomePhone} onChange={(e) => setWelcomePhone(e.target.value)} placeholder="Ej: 593987654321" className="w-full border p-2 rounded" />
            </div>
            <div className="flex gap-2 justify-end">
              <button type="button" className="px-3 py-1 border rounded" onClick={() => setShowWelcomeModal(false)}>Cancelar</button>
              <button
                type="button"
                className="px-3 py-1 bg-green-600 text-white rounded"
                onClick={() => {
                  const digits = (welcomePhone || '').toString().replace(/\D/g, '')
                  if (!digits) return alert('Ingresa un número de teléfono válido')
                  const message = welcomeTemplate || '¡Hola! Bienvenido a Innovation Business.'
                  const url = `https://wa.me/${digits}?text=${encodeURIComponent(message)}`
                  window.open(url, '_blank')
                  setShowWelcomeModal(false)
                }}
              >
                Enviar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
