import React, { useState, useRef } from 'react';
import './DashboardGold.css';
import Packages from '../components/Packages';
import AdminPanel from './AdminPanel'
import { useAuth } from '../contexts/AuthContext'

// Fórmula Puntos IB según valor de venta
const computePoints = (amount) => {
  const total = Number(amount) || 0
  if (total >= 500 && total <= 1000) return 50
  if (total >= 1001 && total <= 3000) return 100
  if (total >= 3001 && total <= 5000) return 200
  if (total >= 5001) return 300
  return 0
}

export default function DashboardContratos() {
  const { user, logout } = useAuth()
  const [clients, setClients] = useState([])
  const [showNewContractModal, setShowNewContractModal] = useState(false)
  const [newClientData, setNewClientData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    document_number: '',
    contract_number: '',
    contract_value: 0,
    forma_pago: '',
    liner: '',
    closer: '',
    version: 'cliente',
    puntos_ib: 0,
    sala: 'Sala 1'
  })
  const [contratos, setContratos] = useState([]);
  const [reservas, setReservas] = useState([]);
  const [showContrato, setShowContrato] = useState(false);
  const [showReserva, setShowReserva] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false)
  const [adminInitialSection, setAdminInitialSection] = useState(null)
  const beneficiosRef = useRef(null)

  // Load clients on mount — always call hooks in same order
  React.useEffect(() => {
    const load = async () => {
      try {
        const resp = await (await import('../services/api')).clientService.getClients({ limit: 1000 })
        setClients(resp.clients || [])
      } catch (e) {
        console.error('Error loading clients', e)
      }
    }
    load()
  }, [])

  const handleCreateClient = async () => {
    try {
      const api = await import('../services/api')
      const contrato = (newClientData.contract_number || '').trim()
      const cleanContract = contrato.replace(/\s+/g, '').replace(/[^A-Za-z0-9]/g, '') || 'contrato'
      let generatedEmail = newClientData.email
      if (!generatedEmail) {
        if (newClientData.version === 'clienteIB1') generatedEmail = `clienteib1${cleanContract}@kempery.com`
        else if (newClientData.version === 'clienteIB2') generatedEmail = `clienteib2${cleanContract}@kempery.com`
        else generatedEmail = `cliente${cleanContract}@kempery.com`
      }
      const clientPayload = {
        first_name: newClientData.first_name,
        last_name: newClientData.last_name,
        email: generatedEmail,
        phone: newClientData.phone || '',
        document_number: newClientData.document_number || contrato,
        contract_number: contrato,
        total_amount: Number(newClientData.contract_value) || 0,
        total_nights: 0,
        remaining_nights: 0,
        anos: 0,
        categoria_cliente: newClientData.version === 'clienteIB1' ? 'gold' : newClientData.version === 'clienteIB2' ? 'black' : 'blue',
        sala: newClientData.sala || 'Sala 1',
        puntos_ib: newClientData.puntos_ib ?? 0
      }
      const response = await api.clientService.createClient(clientPayload)
      if (response?.usuario?.email && (newClientData.puntos_ib ?? 0) > 0) {
        try {
          const pointsService = (await import('../services/pointsService')).default
          await pointsService.setPointsForUser(response.usuario.email, newClientData.puntos_ib)
        } catch (e) { console.warn('Puntos IB no registrados:', e) }
      }
      alert('Cliente creado')
      setShowNewContractModal(false)
      setNewClientData({ first_name: '', last_name: '', email: '', phone: '', document_number: '', contract_number: '', contract_value: 0, forma_pago: '', liner: '', closer: '', version: 'cliente', puntos_ib: 0, sala: 'Sala 1' })
      const resp = await api.clientService.getClients({ limit: 1000 })
      setClients(resp.clients || [])
    } catch (e) {
      console.error(e)
      alert('Error al crear cliente: ' + (e.response?.data?.error || e.message))
    }
  }

  const handleGoToBeneficios = () => {
    setShowAdminPanel(false)
    setAdminInitialSection(null)
    setTimeout(() => {
      beneficiosRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 0)
  }

  return (
    <div className="min-h-screen bg-yellow-50 text-black">
      <div className="max-w-7xl mx-auto p-6 grid grid-cols-12 gap-6">
        {/* Sidebar */}
        <aside className="col-span-3 bg-yellow-100 rounded-lg p-4 shadow">
          <h2 className="text-xl font-bold mb-4">Menú</h2>
          <ul className="space-y-2 text-sm">
            <li className="py-2 px-3 bg-yellow-200 rounded cursor-pointer hover:bg-yellow-300">Contratos</li>
            <li className="py-2 px-3 rounded hover:bg-yellow-200 cursor-pointer" onClick={() => window.location.href = '/gestion-contratos'}>📋 Gestión de Contratos</li>
            <li className="py-2 px-3 rounded hover:bg-yellow-200 cursor-pointer" onClick={() => window.location.href = '/reservas'}>Reservas</li>
            <li className="py-2 px-3 rounded hover:bg-yellow-200 cursor-pointer" onClick={() => window.location.href = '/beneficios'}>Beneficios</li>
            <li className="py-2 px-3 rounded hover:bg-yellow-200 cursor-pointer" onClick={() => window.location.href = '/contratos-fisicos'}>Contratos Físicos</li>
            <li className="py-2 px-3 rounded hover:bg-yellow-200 cursor-pointer" onClick={() => window.location.href = '/enviar-atencion'}>Enviar a Atención</li>
            <li className="py-2 px-3 rounded hover:bg-red-200 cursor-pointer text-red-700 font-semibold" onClick={logout}>Salir</li>
          </ul>
        </aside>

        {/* Main content */}
        <main className="col-span-9">
          {showAdminPanel ? (
            <AdminPanel initialSection={adminInitialSection} />
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-3xl font-bold">Panel de Contratos</h1>
                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-yellow-700 rounded text-black" onClick={() => setShowNewContractModal(true)}>Nuevo Contrato</button>
                  <button className="px-4 py-2 border rounded" onClick={() => window.location.reload()}>Actualizar</button>
                </div>
              </div>
            </>
          )}

          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <h3 className="font-semibold mb-3">Registro de Clientes</h3>
            <ul>
              {clients.map(c => (
                <li key={c.id} className="py-2 border-b">{c.first_name} {c.last_name} — {c.contract_number} — {c.email}</li>
              ))}
            </ul>
          </div>
        </main>
      </div>

      {/* New Contract Modal - con barra de desplazamiento */}
      {showNewContractModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded shadow max-w-xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold mb-4">Nuevo Contrato (Crear Cliente)</h3>
            <div className="grid grid-cols-1 gap-3">
              <input placeholder="Nombre" value={newClientData.first_name} onChange={e => setNewClientData({ ...newClientData, first_name: e.target.value })} className="border p-2 rounded" />
              <input placeholder="Apellido" value={newClientData.last_name} onChange={e => setNewClientData({ ...newClientData, last_name: e.target.value })} className="border p-2 rounded" />
              <input placeholder="Email (opcional, se genera si está vacío)" value={newClientData.email} onChange={e => setNewClientData({ ...newClientData, email: e.target.value })} className="border p-2 rounded" />
              <input placeholder="Teléfono" value={newClientData.phone} onChange={e => setNewClientData({ ...newClientData, phone: e.target.value })} className="border p-2 rounded" />
              <input placeholder="Cédula / Documento" value={newClientData.document_number} onChange={e => setNewClientData({ ...newClientData, document_number: e.target.value })} className="border p-2 rounded" />
              <input placeholder="Número de contrato" value={newClientData.contract_number} onChange={e => setNewClientData({ ...newClientData, contract_number: e.target.value })} className="border p-2 rounded" />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Valor de la venta (USD)</label>
                <input type="number" step="0.01" min="0" placeholder="0" value={newClientData.contract_value || ''} onChange={e => {
                  const v = parseFloat(e.target.value) || 0
                  setNewClientData({ ...newClientData, contract_value: v, puntos_ib: computePoints(v) })
                }} className="border p-2 rounded w-full" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Forma de pago</label>
                <select value={newClientData.forma_pago} onChange={e => setNewClientData({ ...newClientData, forma_pago: e.target.value })} className="border p-2 rounded w-full">
                  <option value="">Seleccionar...</option>
                  <option value="Contado">Contado</option>
                  <option value="Diferido">Diferido</option>
                  <option value="Transferencia">Transferencia</option>
                </select>
              </div>
              <input placeholder="Liner" value={newClientData.liner} onChange={e => setNewClientData({ ...newClientData, liner: e.target.value })} className="border p-2 rounded" />
              <input placeholder="Cerrador" value={newClientData.closer} onChange={e => setNewClientData({ ...newClientData, closer: e.target.value })} className="border p-2 rounded" />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Versión de cliente</label>
                <div className="flex gap-2 flex-wrap">
                  {[
                    { value: 'cliente', label: 'Blue' },
                    { value: 'clienteIB1', label: 'Gold' },
                    { value: 'clienteIB2', label: 'Black' }
                  ].map(opt => (
                    <button key={opt.value} type="button" onClick={() => setNewClientData({ ...newClientData, version: opt.value })} className={`px-3 py-1 rounded text-sm font-medium ${newClientData.version === opt.value ? 'bg-yellow-500 text-black ring-2 ring-yellow-700' : 'bg-gray-200 text-gray-700'}`}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Puntos IB (calculado)</label>
                <input type="number" readOnly value={newClientData.puntos_ib ?? 0} className="border p-2 rounded w-full bg-gray-100" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sala</label>
                <select value={newClientData.sala} onChange={e => setNewClientData({ ...newClientData, sala: e.target.value })} className="border p-2 rounded w-full">
                  <option value="Sala 1">Sala 1</option>
                  <option value="Sala 2">Sala 2</option>
                </select>
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setShowNewContractModal(false)} className="px-3 py-1 border rounded">Cancelar</button>
              <button onClick={handleCreateClient} className="px-3 py-1 bg-gradient-to-r from-yellow-400 to-yellow-700 text-black rounded">Crear</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
