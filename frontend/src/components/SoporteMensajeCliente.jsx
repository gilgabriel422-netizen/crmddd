import React, { useState, useEffect } from 'react';

export default function SoporteMensajeCliente({ clienteId }) {
  const [mensaje, setMensaje] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [mensajes, setMensajes] = useState([]);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');

  // ID del soporte (puedes cambiarlo por el real)
  const soporteId = 1;

  // Cargar mensajes del cliente
  useEffect(() => {
    const cargarMensajes = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/mensajes/${clienteId}`); // <-- URL ajustada
        const data = await res.json();
        setMensajes(data);
      } catch (err) {
        setError('No se pudieron cargar los mensajes');
      }
    };
    cargarMensajes();
  }, [clienteId, exito]);

  // Enviar mensaje
  const handleEnviar = async (e) => {
    e.preventDefault();
    setEnviando(true);
    setError('');
    setExito('');
    try {
      const res = await fetch('http://localhost:5000/api/mensajes', { // <-- URL ajustada
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          remitente_id: clienteId,
          destinatario_id: soporteId,
          contenido: mensaje,
          tipo: 'cliente'
        })
      });
      if (res.ok) {
        setExito('¡Mensaje enviado!');
        setMensaje('');
      } else {
        setError('Error al enviar el mensaje');
      }
    } catch (err) {
      setError('Error de conexión');
    }
    setEnviando(false);
  };

  return (
    <div>
      <h3>¿Tienes una consulta o sugerencia?</h3>
      <form onSubmit={handleEnviar}>
        <textarea
          value={mensaje}
          onChange={e => setMensaje(e.target.value)}
          placeholder="Escribe tu mensaje aquí..."
          required
          rows={4}
          style={{ width: '100%' }}
        />
        <button type="submit" style={{ marginTop: 8 }} disabled={enviando || !mensaje}>
          Enviar a Soporte
        </button>
      </form>
      {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
      {exito && <div style={{ color: 'green', marginTop: 8 }}>{exito}</div>}

      <div style={{ marginTop: 24 }}>
        <h4>Historial de mensajes</h4>
        <div style={{ background: '#f9f9f9', borderRadius: 8, padding: 12 }}>
          {mensajes.length === 0 && <div>No hay mensajes aún.</div>}
          {mensajes.map((msg) => (
            <div key={msg.id} style={{
              marginBottom: 12,
              textAlign: msg.tipo === 'cliente' ? 'right' : 'left'
            }}>
              <div
                style={{
                  display: 'inline-block',
                  background: msg.tipo === 'cliente' ? '#e0f7fa' : '#fffde7',
                  color: '#333',
                  borderRadius: 6,
                  padding: '8px 12px',
                  maxWidth: '80%'
                }}
              >
                <strong>{msg.tipo === 'cliente' ? 'Tú' : 'Soporte'}:</strong> {msg.contenido}
                <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>
                  {new Date(msg.fecha_envio).toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}