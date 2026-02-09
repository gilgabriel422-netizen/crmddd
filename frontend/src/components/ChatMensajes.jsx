import React, { useEffect, useState } from 'react';
import { getMensajes, enviarMensaje } from '../api';

export default function ChatMensajes({ conversacionId, remitenteId }) {
  const [mensajes, setMensajes] = useState([]);
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const [cargando, setCargando] = useState(false);

  // Cargar mensajes al montar el componente o cambiar la conversación
  useEffect(() => {
    async function cargarMensajes() {
      setCargando(true);
      try {
        const data = await getMensajes(conversacionId);
        setMensajes(data.mensajes || data); // Ajusta según la respuesta de tu backend
      } catch (error) {
        alert('Error al cargar mensajes');
      }
      setCargando(false);
    }
    if (conversacionId) cargarMensajes();
  }, [conversacionId]);

  // Enviar mensaje
  async function handleEnviar(e) {
    e.preventDefault();
    if (!nuevoMensaje.trim()) return;
    try {
      await enviarMensaje({ conversacionId, remitenteId, contenido: nuevoMensaje });
      setNuevoMensaje('');
      // Recargar mensajes después de enviar
      const data = await getMensajes(conversacionId);
      setMensajes(data.mensajes || data);
    } catch (error) {
      alert('Error al enviar mensaje');
    }
  }

  return (
    <div style={{ border: '1px solid #ccc', padding: 16, borderRadius: 8, maxWidth: 400 }}>
      <h3>Chat</h3>
      <div style={{ minHeight: 200, maxHeight: 300, overflowY: 'auto', marginBottom: 8 }}>
        {cargando ? (
          <div>Cargando...</div>
        ) : mensajes.length === 0 ? (
          <div>No hay mensajes.</div>
        ) : (
          mensajes.map((msg, idx) => (
            <div key={idx} style={{ margin: '8px 0', textAlign: msg.remitenteId === remitenteId ? 'right' : 'left' }}>
              <span style={{ background: '#f1f1f1', padding: 6, borderRadius: 4 }}>
                <b>{msg.remitenteNombre || msg.remitenteId}:</b> {msg.contenido}
              </span>
            </div>
          ))
        )}
      </div>
      <form onSubmit={handleEnviar} style={{ display: 'flex', gap: 8 }}>
        <input
          type="text"
          value={nuevoMensaje}
          onChange={e => setNuevoMensaje(e.target.value)}
          placeholder="Escribe un mensaje..."
          style={{ flex: 1 }}
        />
        <button type="submit">Enviar</button>
      </form>
    </div>
  );
}