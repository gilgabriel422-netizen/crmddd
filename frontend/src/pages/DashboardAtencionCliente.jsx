import React, { useState, useEffect } from 'react'
import './DashboardGold.css'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import NotificationBell from '../components/NotificationBell'

export default function DashboardAtencionCliente() {
  const { authed, logout } = useAuth()
  const navigate = useNavigate()
  const [requerimientos] = useState([])
  const [postventa] = useState([])
  const [showRequerimiento, setShowRequerimiento] = useState(false)
  const [showEnviarPostventa, setShowEnviarPostventa] = useState(false)
  const [selectedCliente, setSelectedCliente] = useState(null)
  const [clients, setClients] = useState([])
  const [reservasPendientes, setReservasPendientes] = useState([])
  const [loadingReservas, setLoadingReservas] = useState(false)

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
        
        // Cargar reservas pendientes
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
      console.log('📍 Cargando reservas desde /api/reservas...')
      const response = await api.default.get('/api/reservas')
      console.log('📦 Respuesta recibida:', response.data)
      const reservas = Array.isArray(response.data) ? response.data : []
      console.log('🔍 Total de reservas:', reservas.length)
      const pendientes = reservas.filter(r => r.estado === 'pendiente')
      console.log('⏳ Reservas pendientes:', pendientes.length, pendientes)
      setReservasPendientes(pendientes)
    } catch (error) {
      console.error('❌ Error cargando reservas:', error)
      setReservasPendientes([])
    } finally {
      setLoadingReservas(false)
    }
  }

  return (
    <div className="dashboard-gold-bg min-h-screen p-6">
      <div className="max-w-6xl mx-auto flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-black">Panel de Atención</h1>
        <div className="flex items-center gap-4">
          <NotificationBell />
          <button
            className="px-4 py-2 border rounded text-red-700 hover:bg-red-50"
            onClick={logout}
          >
            Salir
          </button>
        </div>
      </div>
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="col-span-1 bg-white bg-opacity-80 rounded-lg shadow p-4">
          <h2 className="text-xl font-bold mb-2 text-black">Panel Atención</h2>
          <button
            className="w-full mb-2 px-3 py-2 bg-gradient-to-r from-yellow-400 to-yellow-700 text-black rounded hover:opacity-90 font-semibold"
            onClick={() => navigate('/bandeja-mensajes')}
          >
            📧 Bandeja de Mensajes
          </button>
          <button
            className="w-full mb-2 px-3 py-2 bg-gradient-to-r from-yellow-400 to-yellow-700 text-black rounded"
            onClick={() => setShowRequerimiento(true)}
          >
            Nuevo Requerimiento
          </button>
          <h3 className="font-semibold mt-2">Requerimientos</h3>
          <ul>
            {requerimientos.map((r, i) => (
              <li key={i} className="border-b py-1">
                {r.cliente} - {r.detalle}
              </li>
            ))}
          </ul>
        </div>

        <div className="col-span-2 space-y-6">
          <div className="bg-white bg-opacity-80 rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-black">Clientes asignados a Atención</h2>
              <div className="flex gap-2">
                <button className="px-3 py-1 bg-gradient-to-r from-yellow-400 to-yellow-700 text-black rounded" onClick={() => setShowEnviarPostventa(true)}>Enviar a Postventa</button>
              </div>
            </div>
            <ul className="mt-4">
              {clients.map((c) => (
                <li key={c.id} className="flex justify-between items-center border-b py-2">
                  <div>
                    <div className="font-semibold">{c.first_name} {c.last_name}</div>
                    <div className="text-sm text-gray-700">{c.email}</div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      className="px-2 py-1 bg-gradient-to-r from-yellow-400 to-yellow-700 text-black rounded"
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
                    <button className="px-2 py-1 border rounded" onClick={() => alert('Crear reserva (no implementado)')}>Crear Reserva</button>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white bg-opacity-80 rounded-lg shadow p-4">
            <h2 className="text-xl font-bold text-black">Historial / Postventa</h2>
            <ul>
              {postventa.map((p, i) => (
                <li key={i} className="border-b py-1">{p.cliente} - {p.motivo}</li>
              ))}
            </ul>
          </div>

          <div className="bg-white bg-opacity-80 rounded-lg shadow p-4">
            <h2 className="text-xl font-bold text-black">📅 Reservas Pendientes</h2>
            {loadingReservas ? (
              <p className="text-gray-600">Cargando reservas...</p>
            ) : reservasPendientes.length === 0 ? (
              <p className="text-gray-600">No hay reservas pendientes</p>
            ) : (
              <ul className="mt-4 space-y-3">
                {reservasPendientes.map((res) => (
                  <li key={res.id} className="border-l-4 border-yellow-500 bg-yellow-50 p-3 rounded">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-semibold">Reserva #{res.numero_reserva}</p>
                        <p className="text-sm text-gray-700">
                          Cliente ID: {res.cliente_id || res.usuario_id}
                        </p>
                        <p className="text-sm text-gray-700">
                          📅 {res.fecha_entrada ? new Date(res.fecha_entrada).toLocaleDateString('es-ES') : 'N/A'} - {res.fecha_salida ? new Date(res.fecha_salida).toLocaleDateString('es-ES') : 'N/A'}
                        </p>
                        <p className="text-sm text-gray-700">
                          👥 {res.personas} {res.personas === 1 ? 'persona' : 'personas'} | {res.noches} {res.noches === 1 ? 'noche' : 'noches'}
                        </p>
                        {res.tipo_habitacion && (
                          <p className="text-sm text-gray-700">
                            🏨 Tipo: {res.tipo_habitacion}
                          </p>
                        )}
                        {res.observaciones && (
                          <p className="text-sm text-gray-700 mt-1">
                            📝 {res.observaciones}
                          </p>
                        )}
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
        </div>
      </div>
    </div>
  )
}
