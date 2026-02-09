import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Reservas() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadClientes = async () => {
      try {
        const api = await import('../services/api');
        const response = await api.clientService.getClients({ limit: 1000 });
        setClientes(response.clients || []);
      } catch (error) {
        console.error('Error loading clientes:', error);
      } finally {
        setLoading(false);
      }
    };
    loadClientes();
  }, []);

  return (
    <div className="min-h-screen bg-yellow-50 text-black">
      <div className="max-w-7xl mx-auto p-6 grid grid-cols-12 gap-6">
        {/* Sidebar */}
        <aside className="col-span-3 bg-yellow-100 rounded-lg p-4 shadow">
          <h2 className="text-xl font-bold mb-4">Menú</h2>
          <ul className="space-y-2 text-sm">
            <li className="py-2 px-3 rounded hover:bg-yellow-200 cursor-pointer" onClick={() => navigate('/dashboard-contratos')}>Contratos</li>
            <li className="py-2 px-3 bg-yellow-200 rounded cursor-pointer hover:bg-yellow-300">Reservas</li>
            <li className="py-2 px-3 rounded hover:bg-yellow-200 cursor-pointer" onClick={() => navigate('/beneficios')}>Beneficios</li>
            <li className="py-2 px-3 rounded hover:bg-yellow-200 cursor-pointer" onClick={() => navigate('/contratos-fisicos')}>Contratos Físicos</li>
            <li className="py-2 px-3 rounded hover:bg-yellow-200 cursor-pointer" onClick={() => navigate('/dashboard-atencion')}>Enviar a Atención</li>
            <li className="py-2 px-3 rounded hover:bg-red-200 cursor-pointer text-red-700 font-semibold" onClick={logout}>Salir</li>
          </ul>
        </aside>

        {/* Main content */}
        <main className="col-span-9">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold">Reservas</h1>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            {loading ? (
              <p>Cargando reservas...</p>
            ) : clientes.length > 0 ? (
              <div className="space-y-4">
                {clientes.map(cliente => (
                  <div key={cliente.id} className="p-4 border rounded-lg hover:bg-gray-50">
                    <h3 className="font-semibold text-lg">{cliente.first_name} {cliente.last_name}</h3>
                    <p className="text-gray-600">Contrato: {cliente.contract_number}</p>
                    <p className="text-gray-600">Email: {cliente.email}</p>
                    <p className="text-gray-600">Teléfono: {cliente.phone}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p>No hay reservas</p>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

