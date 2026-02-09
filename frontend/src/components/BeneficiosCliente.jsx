import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Gift, TrendingDown, AlertCircle, CheckCircle } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function BeneficiosCliente({ clienteId }) {
  const [beneficios, setBeneficios] = useState([]);
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedTab, setSelectedTab] = useState('disponibles');
  const [showConsumoForm, setShowConsumoForm] = useState(false);
  const [selectedBeneficio, setSelectedBeneficio] = useState(null);
  const [montoConsumir, setMontoConsumir] = useState('');
  const [descripcion, setDescripcion] = useState('');

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (clienteId) {
      cargarBeneficios();
      cargarHistorial();
    }
  }, [clienteId]);

  const cargarBeneficios = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API}/beneficios/cliente/${clienteId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBeneficios(response.data.beneficios || []);
      setError('');
    } catch (err) {
      setError('Error al cargar beneficios: ' + err.response?.data?.error || err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const cargarHistorial = async () => {
    try {
      const response = await axios.get(
        `${API}/beneficios/historial/${clienteId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setHistorial(response.data.historial || []);
    } catch (err) {
      console.error('Error al cargar historial:', err);
    }
  };

  const handleConsumir = async () => {
    if (!selectedBeneficio || !montoConsumir) {
      setError('Selecciona un beneficio e ingresa el monto');
      return;
    }

    try {
      const response = await axios.post(
        `${API}/beneficios/consumir`,
        {
          beneficio_id: selectedBeneficio.id,
          cliente_id: clienteId,
          monto_consumido: parseFloat(montoConsumir),
          descripcion: descripcion || null
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess('Consumo registrado exitosamente (Pendiente de aprobación)');
      setMontoConsumir('');
      setDescripcion('');
      setShowConsumoForm(false);
      setSelectedBeneficio(null);
      
      cargarBeneficios();
      cargarHistorial();

      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al consumir beneficio');
    }
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'confirmado':
        return 'text-green-600 bg-green-50';
      case 'pendiente':
        return 'text-yellow-600 bg-yellow-50';
      case 'rechazado':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getTipoBadge = (tipo) => {
    const tipos = {
      puntos: { color: 'bg-blue-100 text-blue-800', icono: '⭐' },
      descuento: { color: 'bg-green-100 text-green-800', icono: '💰' },
      cortesia: { color: 'bg-purple-100 text-purple-800', icono: '🎁' },
      noche_gratis: { color: 'bg-orange-100 text-orange-800', icono: '🏨' },
      upgrade: { color: 'bg-pink-100 text-pink-800', icono: '⬆️' },
      otro: { color: 'bg-gray-100 text-gray-800', icono: '📦' }
    };
    return tipos[tipo] || tipos.otro;
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Gift className="w-8 h-8 text-purple-600" />
          <h2 className="text-3xl font-bold text-gray-800">Mis Beneficios</h2>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
          <p className="text-green-800">{success}</p>
        </div>
      )}

      <div className="flex gap-2 border-b">
        <button
          onClick={() => setSelectedTab('disponibles')}
          className={`px-6 py-3 font-medium ${
            selectedTab === 'disponibles'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Disponibles
        </button>
        <button
          onClick={() => setSelectedTab('historial')}
          className={`px-6 py-3 font-medium ${
            selectedTab === 'historial'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Historial de Consumos
        </button>
      </div>

      {selectedTab === 'disponibles' && (
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Cargando beneficios...</p>
            </div>
          ) : beneficios.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <Gift className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">No tienes beneficios disponibles en este momento</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {beneficios.map((beneficio) => {
                const porcentajeDisponible = (parseFloat(beneficio.saldo_disponible) / parseFloat(beneficio.valor)) * 100;
                const tipoBg = getTipoBadge(beneficio.tipo);

                return (
                  <div
                    key={beneficio.id}
                    className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${tipoBg.color}`}>
                          {tipoBg.icono} {beneficio.tipo}
                        </span>
                      </div>
                      {beneficio.fecha_vencimiento && (
                        <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
                          Vence: {new Date(beneficio.fecha_vencimiento).toLocaleDateString()}
                        </span>
                      )}
                    </div>

                    <h3 className="text-xl font-bold text-gray-800 mb-2">{beneficio.nombre}</h3>
                    {beneficio.descripcion && (
                      <p className="text-sm text-gray-600 mb-4">{beneficio.descripcion}</p>
                    )}

                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="font-medium text-gray-700">Disponible</span>
                        <span className="text-gray-900 font-bold">
                          ${parseFloat(beneficio.saldo_disponible).toFixed(2)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-blue-600 h-full transition-all"
                          style={{ width: `${Math.min(porcentajeDisponible, 100)}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>${parseFloat(beneficio.saldo_disponible).toFixed(2)} usado</span>
                        <span>${parseFloat(beneficio.valor).toFixed(2)} total</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedBeneficio(beneficio);
                        setShowConsumoForm(true);
                      }}
                      className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-medium"
                    >
                      <TrendingDown className="inline-block w-4 h-4 mr-2" />
                      Consumir
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {selectedTab === 'historial' && (
        <div className="space-y-4">
          {historial.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-600">No hay consumos registrados</p>
            </div>
          ) : (
            <div className="space-y-3">
              {historial.map((consumo) => (
                <div
                  key={consumo.id}
                  className={`border rounded-lg p-4 ${getEstadoColor(consumo.estado)}`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-bold text-lg">{consumo.beneficio_nombre}</h4>
                      <p className="text-sm opacity-75">{consumo.descripcion}</p>
                      {consumo.referencia && (
                        <p className="text-xs opacity-60">Ref: {consumo.referencia}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">${parseFloat(consumo.monto_consumido).toFixed(2)}</p>
                      <span className="inline-block text-xs px-2 py-1 rounded bg-white bg-opacity-50 mt-1">
                        {consumo.estado}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs opacity-75 mt-2">
                    {new Date(consumo.fecha_creacion).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {showConsumoForm && selectedBeneficio && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 space-y-4">
            <h3 className="text-2xl font-bold">Consumir Beneficio</h3>
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm font-medium text-blue-900">{selectedBeneficio.nombre}</p>
              <p className="text-xs text-blue-700 mt-1">
                Disponible: ${parseFloat(selectedBeneficio.saldo_disponible).toFixed(2)}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Monto a Consumir
              </label>
              <input
                type="number"
                value={montoConsumir}
                onChange={(e) => setMontoConsumir(e.target.value)}
                max={selectedBeneficio.saldo_disponible}
                step="0.01"
                placeholder="0.00"
                className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción (opcional)
              </label>
              <textarea
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Motivo del consumo..."
                className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:border-blue-500"
                rows="3"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowConsumoForm(false);
                  setSelectedBeneficio(null);
                  setMontoConsumir('');
                  setDescripcion('');
                }}
                className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleConsumir}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
              >
                Consumir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
