import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Send, CheckCircle, Clock } from 'lucide-react';

export default function BandejaMensajesSoporte() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mensajes, setMensajes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMensaje, setSelectedMensaje] = useState(null);
  const [respuesta, setRespuesta] = useState('');
  const [enviandoRespuesta, setEnviandoRespuesta] = useState(false);
  const [filtro, setFiltro] = useState('todos'); // todos, pendientes, respondidos

  useEffect(() => {
    loadMensajes();
    const interval = setInterval(loadMensajes, 30000); // Recargar cada 30 segundos
    return () => clearInterval(interval);
  }, []);

  const loadMensajes = async () => {
    try {
      const api = await import('../services/api');
      const response = await api.default.get('/mensajes');
      // Ordenar por fecha descendente
      const mensajesOrdenados = (response.data || []).sort((a, b) => 
        new Date(b.fecha_creacion) - new Date(a.fecha_creacion)
      );
      setMensajes(mensajesOrdenados);
    } catch (error) {
      console.error('Error loading mensajes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResponder = async () => {
    if (!respuesta.trim()) {
      alert('Por favor escribe una respuesta');
      return;
    }

    if (!selectedMensaje) return;

    setEnviandoRespuesta(true);
    try {
      const api = await import('../services/api');
      const response = await api.default.put(`/mensajes/${selectedMensaje.id}`, {
        respuesta,
        estado: 'respondido',
        fecha_respuesta: new Date().toISOString()
      });

      // Actualizar el mensaje en la lista
      const mensajesActualizados = mensajes.map(m => 
        m.id === selectedMensaje.id ? response.data : m
      );
      setMensajes(mensajesActualizados);
      setSelectedMensaje(response.data);
      setRespuesta('');
      alert('Respuesta enviada exitosamente');
    } catch (error) {
      console.error('Error enviando respuesta:', error);
      alert('Error al enviar la respuesta: ' + (error.response?.data?.error || error.message));
    } finally {
      setEnviandoRespuesta(false);
    }
  };

  const handleMarcarEnProceso = async (mensajeId) => {
    try {
      const api = await import('../services/api');
      const response = await api.default.put(`/mensajes/${mensajeId}`, {
        estado: 'en_proceso'
      });

      const mensajesActualizados = mensajes.map(m => 
        m.id === mensajeId ? response.data : m
      );
      setMensajes(mensajesActualizados);
    } catch (error) {
      console.error('Error actualizando estado:', error);
    }
  };

  const getMensajesFiltrados = () => {
    if (filtro === 'pendientes') {
      return mensajes.filter(m => m.estado === 'pendiente');
    } else if (filtro === 'respondidos') {
      return mensajes.filter(m => m.estado === 'respondido');
    }
    return mensajes;
  };

  const mensajesFiltrados = getMensajesFiltrados();
  const mensajesPendientes = mensajes.filter(m => m.estado === 'pendiente').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-navy-900 to-navy-700 text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-3xl font-bold">Bandeja de Mensajes</h1>
          <button
            onClick={() => navigate('/dashboard-atencion')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition"
          >
            ← Volver
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-navy-900 rounded-lg shadow p-4 text-white">
            <p className="text-white/80 text-sm font-medium">Total de mensajes</p>
            <p className="text-3xl font-bold text-white">{mensajes.length}</p>
          </div>
          <div className="bg-navy-900 rounded-lg shadow p-4 border-l-4 border-yellow-400 text-white">
            <p className="text-white/80 text-sm font-medium">Pendientes</p>
            <p className="text-3xl font-bold text-yellow-300">{mensajesPendientes}</p>
          </div>
          <div className="bg-navy-900 rounded-lg shadow p-4 border-l-4 border-green-400 text-white">
            <p className="text-white/80 text-sm font-medium">Respondidos</p>
            <p className="text-3xl font-bold text-green-300">{mensajes.filter(m => m.estado === 'respondido').length}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Lista de mensajes */}
          <div className="col-span-1 bg-navy-900 rounded-lg shadow text-white">
            <div className="p-4 border-b">
              <h2 className="text-lg font-bold mb-4">Mensajes</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setFiltro('todos')}
                  className={`px-3 py-1 rounded text-sm font-medium transition ${
                    filtro === 'todos' 
                      ? 'bg-white text-navy-900' 
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  Todos
                </button>
                <button
                  onClick={() => setFiltro('pendientes')}
                  className={`px-3 py-1 rounded text-sm font-medium transition ${
                    filtro === 'pendientes' 
                      ? 'bg-white text-navy-900' 
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  Pendientes
                </button>
                <button
                  onClick={() => setFiltro('respondidos')}
                  className={`px-3 py-1 rounded text-sm font-medium transition ${
                    filtro === 'respondidos' 
                      ? 'bg-white text-navy-900' 
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  Respondidos
                </button>
              </div>
            </div>
            <div className="max-h-[calc(100vh-400px)] overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center text-white/70">Cargando mensajes...</div>
              ) : mensajesFiltrados.length > 0 ? (
                mensajesFiltrados.map(msg => (
                  <div
                    key={msg.id}
                    onClick={() => setSelectedMensaje(msg)}
                    className={`p-4 border-b cursor-pointer transition ${
                      selectedMensaje?.id === msg.id
                        ? 'bg-white/10 border-l-4 border-yellow-400'
                        : 'hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-semibold text-sm truncate flex-1 text-white">{msg.asunto}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap font-semibold ${
                        msg.estado === 'respondido' ? 'bg-green-100 text-green-800' :
                        msg.estado === 'en_proceso' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {msg.estado === 'respondido' ? 'Respondido' : 
                         msg.estado === 'en_proceso' ? 'En proceso' : 
                         'Pendiente'}
                      </span>
                    </div>
                    <p className="text-xs text-white/70">
                      {new Date(msg.fecha_creacion).toLocaleDateString('es-ES', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-white/70">No hay mensajes</div>
              )}
            </div>
          </div>

          {/* Detalles del mensaje */}
          <div className="col-span-2">
            {selectedMensaje ? (
              <div className="bg-navy-900 rounded-lg shadow text-white">
                {/* Header del mensaje */}
                <div className="p-6 border-b bg-navy-800">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-bold">{selectedMensaje.asunto}</h2>
                      <p className="text-sm text-white/80 mt-1">
                        Enviado: {new Date(selectedMensaje.fecha_creacion).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <span className={`text-sm px-4 py-2 rounded-full font-semibold ${
                      selectedMensaje.estado === 'respondido' ? 'bg-green-100 text-green-800' :
                      selectedMensaje.estado === 'en_proceso' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {selectedMensaje.estado === 'respondido' ? 'Respondido' : 
                       selectedMensaje.estado === 'en_proceso' ? 'En proceso' : 
                       'Pendiente'}
                    </span>
                  </div>

                  {selectedMensaje.estado === 'pendiente' && (
                    <button
                      onClick={() => handleMarcarEnProceso(selectedMensaje.id)}
                      className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition flex items-center gap-2 text-sm"
                    >
                      <Clock size={16} />
                      Marcar en proceso
                    </button>
                  )}
                </div>

                {/* Mensaje original */}
                <div className="p-6 bg-navy-800 border-b">
                  <p className="text-sm font-semibold text-white/80 mb-3">Mensaje del cliente:</p>
                  <div className="bg-navy-900 p-4 rounded border border-white/10">
                    <p className="text-white whitespace-pre-wrap">{selectedMensaje.contenido}</p>
                  </div>
                </div>

                {/* Respuesta */}
                {selectedMensaje.respuesta ? (
                  <div className="p-6 bg-green-50 border-b border-green-200">
                    <p className="text-sm font-semibold text-green-900 mb-3">Tu respuesta:</p>
                    <div className="bg-white p-4 rounded border border-green-200">
                      <p className="text-gray-700 whitespace-pre-wrap">{selectedMensaje.respuesta}</p>
                    </div>
                    {selectedMensaje.fecha_respuesta && (
                      <p className="text-xs text-green-700 mt-3">
                        Respondido el {new Date(selectedMensaje.fecha_respuesta).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="p-6">
                    <p className="text-sm font-semibold text-white/80 mb-3">Escribir respuesta:</p>
                    <textarea
                      value={respuesta}
                      onChange={(e) => setRespuesta(e.target.value)}
                      placeholder="Escribe tu respuesta aquí..."
                      rows="6"
                      className="w-full p-4 border border-white/10 bg-navy-900 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 resize-none"
                      disabled={enviandoRespuesta}
                    ></textarea>
                    <button
                      onClick={handleResponder}
                      disabled={enviandoRespuesta}
                      className="mt-4 bg-gradient-to-r from-green-500 to-green-600 hover:opacity-90 disabled:opacity-50 text-white font-semibold py-3 px-6 rounded-lg transition flex items-center gap-2"
                    >
                      <Send size={18} />
                      {enviandoRespuesta ? 'Enviando...' : 'Enviar Respuesta'}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-navy-900 rounded-lg shadow p-12 text-center text-white">
                <Clock size={48} className="mx-auto text-white/30 mb-4" />
                <p className="text-xl font-semibold text-white">Selecciona un mensaje</p>
                <p className="text-white/70 mt-2">Elige un mensaje de la lista para ver sus detalles</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
