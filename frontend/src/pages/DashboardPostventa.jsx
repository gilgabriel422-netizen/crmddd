import React, { useState, useEffect } from 'react';
import './DashboardGold.css';
import { useAuth } from '../contexts/AuthContext';
import NotificationBell from '../components/NotificationBell';
import api from '../services/api';

const SECCIONES = { clientes: 'clientes', contactos: 'contactos', cancelaciones: 'cancelaciones' };

export default function DashboardPostventa() {
  const { user, logout } = useAuth();
  const [seccionActiva, setSeccionActiva] = useState(SECCIONES.clientes);
  const [clientes, setClientes] = useState([]);
  const [contactos, setContactos] = useState([]);
  const [loadingContactos, setLoadingContactos] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const apiMod = await import('../services/api');
        const resp = await apiMod.clientService.getClients({ limit: 1000 });
        const users = await apiMod.userService.getUsers();
        const postUser = (users.users || users).find(u => u.email === 'postventa@crm.com' || u.email === 'postventa');
        const filtered = (resp.clients || []).filter(c => postUser ? c.usuario_asignado_id === postUser.id : (c.usuario_asignado_nombre || '').toLowerCase().includes('postven'));
        setClientes(filtered);
      } catch (e) { console.error(e); }
    };
    load();
  }, []);

  useEffect(() => {
    if (seccionActiva !== SECCIONES.contactos) return;
    let cancelled = false;
    setLoadingContactos(true);
    api.get('/contactos')
      .then(res => { if (!cancelled) setContactos(Array.isArray(res.data) ? res.data : (res.data?.data ?? [])); })
      .catch(() => { if (!cancelled) setContactos([]); })
      .finally(() => { if (!cancelled) setLoadingContactos(false); });
    return () => { cancelled = true; };
  }, [seccionActiva]);

  const menuItem = (key, label) => (
    <li
      key={key}
      onClick={() => setSeccionActiva(key)}
      className={`py-2 px-3 rounded cursor-pointer ${seccionActiva === key ? 'bg-yellow-200 font-medium' : 'hover:bg-yellow-200'}`}
    >
      {label}
    </li>
  );

  return (
    <div className="min-h-screen bg-yellow-50 text-black">
      <div className="max-w-7xl mx-auto p-6 grid grid-cols-12 gap-6">
        <aside className="col-span-3 bg-yellow-100 rounded-lg p-4 shadow">
          <h2 className="text-xl font-bold mb-4">Menú - Postventa</h2>
          <ul className="space-y-2">
            {menuItem(SECCIONES.clientes, 'Clientes')}
            {menuItem(SECCIONES.contactos, 'Contactos')}
            {menuItem(SECCIONES.cancelaciones, 'Cancelaciones')}
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

          {seccionActiva === SECCIONES.clientes && (
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-2xl font-bold mb-2">Clientes enviados a Postventa</h2>
              <ul>
                {clientes.map((c, i) => (
                  <li key={i} className="border-b py-1">{c.first_name} {c.last_name} — {c.email} — Contrato: {c.contract_number}</li>
                ))}
              </ul>
            </div>
          )}

          {seccionActiva === SECCIONES.contactos && (
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-2xl font-bold mb-2">Contactos</h2>
              {loadingContactos ? (
                <p className="text-gray-600">Cargando contactos...</p>
              ) : contactos.length === 0 ? (
                <p className="text-gray-600">No hay contactos registrados.</p>
              ) : (
                <ul className="space-y-2">
                  {contactos.map((c, i) => (
                    <li key={c.id ?? i} className="border-b py-2 flex flex-wrap gap-x-4 gap-y-1">
                      <span className="font-medium">{c.nombre ?? '—'}</span>
                      {c.cargo && <span className="text-gray-600">{c.cargo}</span>}
                      {c.email && <span>{c.email}</span>}
                      {c.telefono && <span>{c.telefono}</span>}
                      {c.es_principal && <span className="text-amber-600 text-sm">Principal</span>}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {seccionActiva === SECCIONES.cancelaciones && (
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-2xl font-bold mb-2">Cancelaciones</h2>
              <p className="text-gray-600">Solicitudes y gestiones de cancelación. Aquí podrás ver las solicitudes de cancelación de contratos cuando estén disponibles.</p>
              <div className="mt-4 p-4 bg-gray-50 rounded border border-gray-200">
                <p className="text-sm text-gray-500">No hay solicitudes de cancelación pendientes.</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
