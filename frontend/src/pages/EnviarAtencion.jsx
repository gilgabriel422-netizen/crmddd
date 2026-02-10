import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Send, Trash2 } from 'lucide-react';

export default function EnviarAtencion() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mensajes, setMensajes] = useState([]);
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const [asunto, setAsunto] = useState('');
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const getClientPanelPath = () => {
    const role = (user?.rol || user?.role || '').toString().toLowerCase();
    if (role === 'gold' || role === 'clienteib1' || role === 'cliente_ib1') return '/cliente-ib1';
    if (role === 'black' || role === 'clienteib2' || role === 'cliente_ib2') return '/cliente-black';
    return '/cliente';
  };

  const getVolverPath = () => {
    if (location.state?.from) return location.state.from;
    const email = (user?.email || '').toString().toLowerCase();
    if (email === 'contratos@crm.com' || email === 'contratos') return '/dashboard-contratos';
    const role = (user?.rol || user?.role || '').toString().toLowerCase();
    if (role === 'contratos') return '/dashboard-contratos';
    return getClientPanelPath();
  };

  useEffect(() => {
    loadMensajes();
  }, [user?.id]);

  const loadMensajes = async () => {
    try {
      const api = await import('../services/api');
      // Obtener mensajes del usuario actual
      const response = await api.default.get('/mensajes');
      const allMensajes = response.data || [];
      // Filtrar mensajes del usuario actual
      const userMensajes = allMensajes.filter(m => m.usuario_id === user?.id || m.cliente_id === user?.id);
      setMensajes(userMensajes);
    } catch (error) {
      console.error('Error loading mensajes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnviarMensaje = async (e) => {
    e.preventDefault();
    
    if (!asunto.trim() || !nuevoMensaje.trim()) {
      alert('Por favor completa el asunto y el mensaje');
      return;
    }

    setEnviando(true);
    try {
      const api = await import('../services/api');
      
      // Obtener usuario_id desde diferentes posibilidades del objeto user
      const usuario_id = user?.usuario_id || user?.id || user?.userId;
      
      if (!usuario_id) {
        alert('Error: No se pudo obtener tu ID de usuario. Por favor recarga la página.');
        setEnviando(false);
        return;
      }
      
      const data = {
        asunto,
        contenido: nuevoMensaje,
        usuario_id: parseInt(usuario_id),
        tipo_remitente: 'cliente',
        estado: 'pendiente'
      };

      console.log('Enviando mensaje con datos:', data);
      const response = await api.default.post('/mensajes', data);
      
      if (response.data) {
        setMensajes([...mensajes, response.data]);
        setAsunto('');
        setNuevoMensaje('');
        setSuccessMessage('¡Mensaje enviado exitosamente!');
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error enviando mensaje:', error);
      alert('Error al enviar el mensaje: ' + (error.response?.data?.error || error.message));
    } finally {
      setEnviando(false);
    }
  };

  const handleEliminarMensaje = async (id) => {
    if (window.confirm('¿Estás seguro que deseas eliminar este mensaje?')) {
      try {
        const api = await import('../services/api');
        await api.default.delete(`/mensajes/${id}`);
        setMensajes(mensajes.filter(m => m.id !== id));
      } catch (error) {
        console.error('Error eliminando mensaje:', error);
        alert('Error al eliminar el mensaje');
      }
    }
  };

  return (
    <div className="min-h-screen bg-yellow-50 text-black">
      <div className="max-w-7xl mx-auto p-6 grid grid-cols-12 gap-6">
        {/* Sidebar */}
        <aside className="col-span-3 bg-yellow-100 rounded-lg p-4 shadow">
          <h2 className="text-xl font-bold mb-4">Menú</h2>
          <ul className="space-y-2 text-sm">
            <li className="py-2 px-3 rounded hover:bg-yellow-200 cursor-pointer" onClick={() => navigate(getVolverPath())}>Volver al Panel</li>
            <li className="py-2 px-3 bg-yellow-200 rounded cursor-pointer hover:bg-yellow-300">Enviar a Atención</li>
            <li className="py-2 px-3 rounded hover:bg-red-200 cursor-pointer text-red-700 font-semibold" onClick={logout}>Salir</li>
          </ul>
        </aside>

        {/* Main content */}
        <main className="col-span-9">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold">Enviar mensaje a Atención al Cliente</h1>
          </div>

          {successMessage && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              {successMessage}
            </div>
          )}

          {/* Formulario de nuevo mensaje */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h3 className="text-xl font-semibold mb-4">Enviar Mensaje a Atención</h3>
            <form onSubmit={handleEnviarMensaje} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Asunto</label>
                <input
                  type="text"
                  value={asunto}
                  onChange={(e) => setAsunto(e.target.value)}
                  placeholder="Ej: Consulta sobre mi reserva, Problema técnico, etc."
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  disabled={enviando}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Mensaje</label>
                <textarea
                  value={nuevoMensaje}
                  onChange={(e) => setNuevoMensaje(e.target.value)}
                  placeholder="Describe tu problema o consulta de forma detallada..."
                  rows="6"
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  disabled={enviando}
                ></textarea>
              </div>
              <button
                type="submit"
                disabled={enviando}
                className="w-full bg-gradient-to-r from-yellow-400 to-yellow-700 text-black font-semibold py-3 rounded-lg hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Send size={20} />
                {enviando ? 'Enviando...' : 'Enviar Mensaje'}
              </button>
            </form>
          </div>

          {/* Historial de mensajes */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold mb-4">Historial de Mensajes</h3>
            {loading ? (
              <p className="text-center text-gray-500">Cargando mensajes...</p>
            ) : mensajes.length > 0 ? (
              <div className="space-y-4">
                {mensajes.map((msg) => (
                  <div key={msg.id} className="p-4 border rounded-lg hover:bg-gray-50 transition">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold text-lg">{msg.asunto || 'Sin asunto'}</h4>
                        <p className="text-sm text-gray-500">
                          {msg.fecha_creacion ? new Date(msg.fecha_creacion).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          }) : 'Fecha no disponible'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
                          msg.estado === 'respondido' ? 'bg-green-100 text-green-800' :
                          msg.estado === 'en_proceso' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {msg.estado === 'respondido' ? 'Respondido' : 
                           msg.estado === 'en_proceso' ? 'En proceso' : 
                           'Pendiente'}
                        </span>
                        <button
                          onClick={() => handleEliminarMensaje(msg.id)}
                          className="p-2 hover:bg-red-100 rounded text-red-500"
                          title="Eliminar mensaje"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded mb-3">
                      <p className="text-gray-700 whitespace-pre-wrap">{msg.contenido}</p>
                    </div>

                    {msg.respuesta && (
                      <div className="bg-green-50 p-4 rounded border-l-4 border-green-500">
                        <p className="text-sm font-semibold text-green-900 mb-2">Respuesta del equipo de atención:</p>
                        <p className="text-gray-700">{msg.respuesta}</p>
                        {msg.fecha_respuesta && (
                          <p className="text-xs text-gray-500 mt-2">
                            Respondido el {new Date(msg.fecha_respuesta).toLocaleDateString('es-ES')}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p className="text-lg">No hay mensajes aún</p>
                <p className="text-sm">Envía tu primer mensaje a atención al cliente arriba</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
