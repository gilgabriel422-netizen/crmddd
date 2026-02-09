import React, { useState } from 'react';
import './DashboardGold.css';
import { useAuth } from '../contexts/AuthContext'
import NotificationBell from '../components/NotificationBell'

export default function DashboardPostventa() {
  const { user, logout } = useAuth()
  const [clientes, setClientes] = useState([]);

  React.useEffect(() => {
    const load = async () => {
      try {
        const api = await import('../services/api')
        const resp = await api.clientService.getClients({ limit: 1000 })
        const users = await api.userService.getUsers()
        const postUser = (users.users || users).find(u => u.email === 'postventa@crm.com' || u.email === 'postventa')
        const filtered = (resp.clients || []).filter(c => postUser ? c.usuario_asignado_id === postUser.id : (c.usuario_asignado_nombre || '').toLowerCase().includes('postven'))
        setClientes(filtered)
      } catch (e) { console.error(e) }
    }
    load()
  }, [])

  return (
    <div className="min-h-screen bg-yellow-50 text-black">
      <div className="max-w-7xl mx-auto p-6 grid grid-cols-12 gap-6">
        <aside className="col-span-3 bg-yellow-100 rounded-lg p-4 shadow">
          <h2 className="text-xl font-bold mb-4">Menú - Postventa</h2>
          <ul className="space-y-2">
            <li className="py-2 px-3 bg-yellow-200 rounded">Clientes</li>
            <li className="py-2 px-3 rounded hover:bg-yellow-200 cursor-pointer">Contactos</li>
            <li className="py-2 px-3 rounded hover:bg-yellow-200 cursor-pointer">Cancelaciones</li>
          </ul>
        </aside>

        <main className="col-span-9">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold">Panel de Postventa</h1>
            <div className="flex gap-2 items-center">
              <NotificationBell />
              <button className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-yellow-700 rounded text-black" onClick={() => window.location.reload()}>Actualizar</button>
              <button className="px-4 py-2 border rounded text-red-700 hover:bg-red-50" onClick={logout}>Salir</button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-2xl font-bold mb-2">Clientes enviados a Postventa</h2>
            <ul>
              {clientes.map((c, i) => (
                <li key={i} className="border-b py-1">{c.first_name} {c.last_name} — {c.email} — Contrato: {c.contract_number}</li>
              ))}
            </ul>
          </div>
        </main>
      </div>
    </div>
  );
}
