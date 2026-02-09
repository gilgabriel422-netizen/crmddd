import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext'
import NotificationBell from '../components/NotificationBell'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const ContratosFisicosPanel = () => {
  const { logout } = useAuth()
  const [contratos, setContratos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get(`${API_URL}/contratos-fisicos`)
      .then(res => {
        setContratos(res.data);
        setLoading(false);
      })
      .catch(err => {
        setError('Error al cargar contratos físicos');
        setLoading(false);
      });
  }, []);

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Contratos Físicos Escaneados</h2>
        <div className="flex gap-2 items-center">
          <NotificationBell />
          <button
            onClick={() => (window.location.href = '/dashboard-contratos')}
            className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition"
          >
            Volver
          </button>
          <button
            onClick={logout}
            className="px-4 py-2 border rounded text-red-700 hover:bg-red-50"
          >
            Salir
          </button>
        </div>
      </div>
      {loading && <p>Cargando...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {!loading && !error && (
        <table className="min-w-full bg-white border">
          <thead>
            <tr>
              <th className="py-2 px-4 border">ID</th>
              <th className="py-2 px-4 border">Cliente</th>
              <th className="py-2 px-4 border">N° Contrato</th>
              <th className="py-2 px-4 border">Fecha</th>
              <th className="py-2 px-4 border">Archivo</th>
              <th className="py-2 px-4 border">Observaciones</th>
            </tr>
          </thead>
          <tbody>
            {contratos.map(c => (
              <tr key={c.id}>
                <td className="py-2 px-4 border">{c.id}</td>
                <td className="py-2 px-4 border">{c.cliente_id}</td>
                <td className="py-2 px-4 border">{c.numero_contrato}</td>
                <td className="py-2 px-4 border">{c.fecha}</td>
                <td className="py-2 px-4 border">
                  <a href={c.archivo_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Ver archivo</a>
                </td>
                <td className="py-2 px-4 border">{c.observaciones}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ContratosFisicosPanel;
