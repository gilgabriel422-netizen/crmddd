import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Calendar, MapPin, Users, AlertCircle, CheckCircle } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function SolicitarReserva({ clienteId }) {
  const [destinos, setDestinos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [enviando, setEnviando] = useState(false);

  const [formData, setFormData] = useState({
    destino: '',
    fechaInicio: '',
    fechaFin: '',
    personas: 1,
    noches: 1,
    tipoHabitacion: 'estandar',
    comentarios: ''
  });

  const token = localStorage.getItem('token');

  useEffect(() => {
    cargarDestinos();
  }, []);

  const cargarDestinos = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/paquetes`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDestinos(response.data || []);
      setError('');
    } catch (err) {
      console.error('Error cargando destinos:', err);
      setDestinos([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const calcularNoches = () => {
    if (formData.fechaInicio && formData.fechaFin) {
      const inicio = new Date(formData.fechaInicio);
      const fin = new Date(formData.fechaFin);
      const noches = Math.ceil((fin - inicio) / (1000 * 60 * 60 * 24));
      return noches > 0 ? noches : 1;
    }
    return 1;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.destino || !formData.fechaInicio || !formData.fechaFin) {
      setError('Por favor completa los campos requeridos');
      return;
    }

    try {
      setEnviando(true);
      setError('');

      const noches = calcularNoches();
      const reservaData = {
        cliente_id: clienteId,
        paquete_id: parseInt(formData.destino),
        fecha_inicio: formData.fechaInicio,
        fecha_fin: formData.fechaFin,
        cantidad_noches: noches,
        cantidad_personas: parseInt(formData.personas),
        tipo_habitacion: formData.tipoHabitacion,
        estado: 'pendiente',
        observaciones: formData.comentarios
      };

      const response = await axios.post(`${API}/reservas`, reservaData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSuccess('¡Reserva solicitada exitosamente! El equipo de ventas se contactará contigo pronto.');
      setFormData({
        destino: '',
        fechaInicio: '',
        fechaFin: '',
        personas: 1,
        noches: 1,
        tipoHabitacion: 'estandar',
        comentarios: ''
      });

      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.response?.data?.mensaje || 'Error al solicitar reserva';
      setError(errorMsg);
      console.error(err);
    } finally {
      setEnviando(false);
    }
  };

  const noches = calcularNoches();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Solicitar Reserva</h2>
        <p className="text-gray-600">Selecciona un destino y fechas para solicitar tu reserva</p>
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

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-lg shadow-md">
        
        {/* Destino */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Destino / Paquete *
          </label>
          {loading ? (
            <p className="text-sm text-gray-600">Cargando destinos...</p>
          ) : (
            <select
              name="destino"
              value={formData.destino}
              onChange={handleInputChange}
              className="w-full border-2 border-gray-300 rounded-lg p-3 focus:outline-none focus:border-blue-500"
              required
            >
              <option value="">Selecciona un destino...</option>
              {destinos.map((destino) => (
                <option key={destino.id} value={destino.id}>
                  {destino.nombre} - ${parseFloat(destino.precio).toFixed(2)}
                </option>
              ))}
            </select>
          )}
          {formData.destino && (
            <p className="text-sm text-gray-600 mt-2">
              {destinos.find(d => d.id === parseInt(formData.destino))?.descripcion}
            </p>
          )}
        </div>

        {/* Fechas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Fecha de Inicio *
            </label>
            <input
              type="date"
              name="fechaInicio"
              value={formData.fechaInicio}
              onChange={handleInputChange}
              className="w-full border-2 border-gray-300 rounded-lg p-3 focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Fecha de Fin *
            </label>
            <input
              type="date"
              name="fechaFin"
              value={formData.fechaFin}
              onChange={handleInputChange}
              className="w-full border-2 border-gray-300 rounded-lg p-3 focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Noches
            </label>
            <div className="w-full border-2 border-gray-300 rounded-lg p-3 bg-gray-50 text-center font-bold text-lg">
              {noches} {noches === 1 ? 'noche' : 'noches'}
            </div>
          </div>
        </div>

        {/* Personas y tipo de habitación */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Cantidad de Personas *
            </label>
            <select
              name="personas"
              value={formData.personas}
              onChange={handleInputChange}
              className="w-full border-2 border-gray-300 rounded-lg p-3 focus:outline-none focus:border-blue-500"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <option key={n} value={n}>
                  {n} {n === 1 ? 'persona' : 'personas'}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Tipo de Habitación
            </label>
            <select
              name="tipoHabitacion"
              value={formData.tipoHabitacion}
              onChange={handleInputChange}
              className="w-full border-2 border-gray-300 rounded-lg p-3 focus:outline-none focus:border-blue-500"
            >
              <option value="estandar">Estándar</option>
              <option value="superior">Superior</option>
              <option value="deluxe">Deluxe</option>
              <option value="suite">Suite</option>
            </select>
          </div>
        </div>

        {/* Comentarios */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Comentarios Especiales
          </label>
          <textarea
            name="comentarios"
            value={formData.comentarios}
            onChange={handleInputChange}
            placeholder="Ej: Celebración especial, requerimientos dietéticos, etc."
            className="w-full border-2 border-gray-300 rounded-lg p-3 focus:outline-none focus:border-blue-500"
            rows={4}
          />
        </div>

        {/* Resumen */}
        {formData.destino && (
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-3">Resumen de Solicitud</h3>
            <div className="space-y-2 text-sm text-blue-900">
              <div className="flex justify-between">
                <span>Destino:</span>
                <span className="font-semibold">{destinos.find(d => d.id === parseInt(formData.destino))?.nombre}</span>
              </div>
              <div className="flex justify-between">
                <span>Fechas:</span>
                <span className="font-semibold">{formData.fechaInicio} a {formData.fechaFin}</span>
              </div>
              <div className="flex justify-between">
                <span>Noches:</span>
                <span className="font-semibold">{noches}</span>
              </div>
              <div className="flex justify-between">
                <span>Personas:</span>
                <span className="font-semibold">{formData.personas}</span>
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={enviando}
          className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <Calendar className="w-5 h-5" />
          {enviando ? 'Enviando solicitud...' : 'Solicitar Reserva'}
        </button>

        <p className="text-center text-sm text-gray-600">
          Un asesor de ventas se contactará contigo para confirmar los detalles de tu reserva.
        </p>
      </form>
    </div>
  );
}
