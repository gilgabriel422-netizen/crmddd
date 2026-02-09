import React, { useState, useRef } from 'react';
import './DashboardGold.css';
import Packages from '../components/Packages';
import AdminPanel from './AdminPanel'
import { useAuth } from '../contexts/AuthContext'

export default function DashboardContratos() {
  const { user, logout } = useAuth()
  const [clients, setClients] = useState([])
  const [showNewContractModal, setShowNewContractModal] = useState(false)
  const [newClientData, setNewClientData] = useState({ first_name:'', last_name:'', email:'', phone:'', contract_number:'' })
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

  // No local password gate: rely on global auth and direct dashboard access after login

  const handleCreateClient = async () => {
    try {
      const api = await import('../services/api')
      await api.clientService.createClient(newClientData)
      alert('Cliente creado')
      setShowNewContractModal(false)
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

      {/* New Contract Modal */}
      {showNewContractModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow max-w-xl w-full">
            <h3 className="text-xl font-semibold mb-2">Nuevo Contrato (Crear Cliente)</h3>
            <div className="grid grid-cols-1 gap-2">
              <input placeholder="Nombre" value={newClientData.first_name} onChange={e => setNewClientData({...newClientData, first_name: e.target.value})} className="border p-2" />
              <input placeholder="Apellido" value={newClientData.last_name} onChange={e => setNewClientData({...newClientData, last_name: e.target.value})} className="border p-2" />
              <input placeholder="Email" value={newClientData.email} onChange={e => setNewClientData({...newClientData, email: e.target.value})} className="border p-2" />
              <input placeholder="Teléfono" value={newClientData.phone} onChange={e => setNewClientData({...newClientData, phone: e.target.value})} className="border p-2" />
              <input placeholder="Contrato" value={newClientData.contract_number} onChange={e => setNewClientData({...newClientData, contract_number: e.target.value})} className="border p-2" />
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
