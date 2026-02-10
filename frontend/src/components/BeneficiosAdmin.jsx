import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Plus, Edit2, Trash2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function BeneficiosAdmin() {
  const [clientes, setClientes] = useState([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [beneficios, setBeneficios] = useState([]);
  const [consumosPendientes, setConsumosPendientes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedTab, setSelectedTab] = useState('crear');
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    cliente_id: '',
    tipo: 'puntos',
    nombre: '',
    descripcion: '',
    valor: '',
    fecha_vencimiento: ''
  });

  const token = localStorage.getItem('authToken');

  useEffect(() => {
    cargarClientes();
    cargarConsumosPendientes();
  }, []);

  useEffect(() => {
    if (clienteSeleccionado) {
      cargarBeneficios(clienteSeleccionado);
    }
  }, [clienteSeleccionado]);

  const cargarClientes = async () => {
    try {
      const response = await axios.get(`${API}/clientes`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setClientes(response.data);
    } catch (err) {
      console.error('Error al cargar clientes:', err);
    }
  };

  const cargarBeneficios = async (clienteId) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API}/beneficios/cliente/${clienteId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBeneficios(response.data.beneficios || []);
    } catch (err) {
      console.error('Error al cargar beneficios:', err);
    } finally {
      setLoading(false);
    }
  };

  const cargarConsumosPendientes = async () => {
    try {
      const response = await axios.get(`${API}/beneficios/admin/pendientes`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setConsumosPendientes(response.data.pendientes || []);
    } catch (err) {
      console.error('Error al cargar consumos pendientes:', err);
    }
  };

  const handleCrearBeneficio = async (e) => {
    e.preventDefault();
    if (!formData.cliente_id || !formData.nombre || !formData.valor) {
      setError('Completa todos los campos requeridos');
      return;
    }

    try {
      await axios.post(`${API}/beneficios`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSuccess('Beneficio creado exitosamente');
      setFormData({
        cliente_id: '',
        tipo: 'puntos',
        nombre: '',
        descripcion: '',
        valor: '',
        fecha_vencimiento: ''
      });
      setShowForm(false);

      if (clienteSeleccionado) {
        cargarBeneficios(clienteSeleccionado);
      }

      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al crear beneficio');
    }
  };

  const handleConfirmarConsumo = async (consumoId) => {
    try {
      const userId = localStorage.getItem('userId') || 1;
      await axios.patch(
        `${API}/beneficios/consumo/${consumoId}/confirmar`,
        { aprobado_por: userId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess('Consumo confirmado');
      cargarConsumosPendientes();
      if (clienteSeleccionado) {
        cargarBeneficios(clienteSeleccionado);
      }

      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al confirmar');
    }
  };

  const handleRechazarConsumo = async (consumoId) => {
    try {
      await axios.patch(
        `${API}/beneficios/consumo/${consumoId}/rechazar`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess('Consumo rechazado');
      cargarConsumosPendientes();
      if (clienteSeleccionado) {
        cargarBeneficios(clienteSeleccionado);
      }

      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al rechazar');
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Gestión de Beneficios</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nuevo Beneficio
        </button>
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
          onClick={() => setSelectedTab('crear')}
          className={`px-6 py-3 font-medium ${
            selectedTab === 'crear'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Crear Beneficio
        </button>
        <button
          onClick={() => setSelectedTab('gestionar')}
          className={`px-6 py-3 font-medium ${
            selectedTab === 'gestionar'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Beneficios del Cliente
        </button>
        <button
          onClick={() => setSelectedTab('pendientes')}
          className={`px-6 py-3 font-medium relative ${
            selectedTab === 'pendientes'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Consumos Pendientes
          {consumosPendientes.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
              {consumosPendientes.length}
            </span>
          )}
        </button>
      </div>

      {selectedTab === 'crear' && showForm && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4">Crear Nuevo Beneficio</h2>
          <form onSubmit={handleCrearBeneficio} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cliente *
              </label>
              <select
                value={formData.cliente_id}
                onChange={(e) => setFormData({ ...formData, cliente_id: e.target.value })}
                className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:border-blue-500"
                required
              >
                <option value="">Selecciona un cliente</option>
                {clientes.map((cliente) => (
                  <option key={cliente.id} value={cliente.id}>
                    {cliente.first_name} {cliente.last_name} - {cliente.email}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo *
                </label>
                <select
                  value={formData.tipo}
                  onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:border-blue-500"
                >
                  <option value="puntos">Puntos</option>
                  <option value="descuento">Descuento</option>
                  <option value="cortesia">Cortesía</option>
                  <option value="noche_gratis">Noche Gratis</option>
                  <option value="upgrade">Upgrade</option>
                  <option value="otro">Otro</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Valor ($) *
                </label>
                <input
                  type="number"
                  value={formData.valor}
                  onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                  step="0.01"
                  min="0"
                  className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre *
              </label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:border-blue-500"
                placeholder="Nombre del beneficio"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción
              </label>
              <textarea
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:border-blue-500"
                placeholder="Descripción del beneficio"
                rows="3"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de Vencimiento
              </label>
              <input
                type="date"
                value={formData.fecha_vencimiento}
                onChange={(e) => setFormData({ ...formData, fecha_vencimiento: e.target.value })}
                className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-medium"
              >
                Crear Beneficio
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {selectedTab === 'gestionar' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Selecciona un Cliente
            </label>
            <select
              value={clienteSeleccionado || ''}
              onChange={(e) => setClienteSeleccionado(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:border-blue-500"
            >
              <option value="">Elige un cliente...</option>
              {clientes.map((cliente) => (
                <option key={cliente.id} value={cliente.id}>
                  {cliente.first_name} {cliente.last_name} - {cliente.email}
                </option>
              ))}
            </select>
          </div>

          {clienteSeleccionado && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {loading ? (
                <div className="text-center py-8">
                  <p className="text-gray-600">Cargando beneficios...</p>
                </div>
              ) : beneficios.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg col-span-2">
                  <p className="text-gray-600">Este cliente no tiene beneficios</p>
                </div>
              ) : (
                beneficios.map((beneficio) => (
                  <div
                    key={beneficio.id}
                    className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg transition"
                  >
                    <h4 className="font-bold text-lg mb-2">{beneficio.nombre}</h4>
                    <p className="text-sm text-gray-600 mb-3">{beneficio.descripcion}</p>

                    <div className="space-y-2 mb-4 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tipo:</span>
                        <span className="font-medium">{beneficio.tipo}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Valor Total:</span>
                        <span className="font-medium">${parseFloat(beneficio.valor).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Saldo Disponible:</span>
                        <span className="font-bold text-blue-600">
                          ${parseFloat(beneficio.saldo_disponible).toFixed(2)}
                        </span>
                      </div>
                      {beneficio.fecha_vencimiento && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Vencimiento:</span>
                          <span className="text-red-600 font-medium">
                            {new Date(beneficio.fecha_vencimiento).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {selectedTab === 'pendientes' && (
        <div className="space-y-4">
          {consumosPendientes.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-600">No hay consumos pendientes de aprobación</p>
            </div>
          ) : (
            <div className="space-y-3">
              {consumosPendientes.map((consumo) => (
                <div key={consumo.id} className="bg-white border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-bold text-lg">
                        {consumo.first_name} {consumo.last_name}
                      </h4>
                      <p className="text-sm text-gray-600">{consumo.email}</p>
                      <p className="text-sm font-medium mt-1">{consumo.beneficio_nombre}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-blue-600">
                        ${parseFloat(consumo.monto_consumido).toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(consumo.fecha_creacion).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {consumo.descripcion && (
                    <p className="text-sm text-gray-600 mb-3 p-2 bg-gray-50 rounded">
                      {consumo.descripcion}
                    </p>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleConfirmarConsumo(consumo.id)}
                      className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Confirmar
                    </button>
                    <button
                      onClick={() => handleRechazarConsumo(consumo.id)}
                      className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 flex items-center justify-center gap-2"
                    >
                      <XCircle className="w-4 h-4" />
                      Rechazar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
