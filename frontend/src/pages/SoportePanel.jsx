import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext'
import NotificationBell from '../components/NotificationBell'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const soporteId = 1; // Cambia por el ID real del usuario soporte

export default function SoportePanel() {
  const { logout } = useAuth()
  const [clientes, setClientes] = useState([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [mensajes, setMensajes] = useState([]);
  const [respuesta, setRespuesta] = useState('');
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');

  // Cargar lista de clientes
  useEffect(() => {
    const cargarClientes = async () => {
      try {
        const res = await fetch(`${API_URL}/clientes`);
        const data = await res.json();
        // Asegura que siempre sea un array
        setClientes(Array.isArray(data) ? data : data.clientes || []);
      } catch (err) {
        setClientes([]); // Si hay error, deja clientes como array vacío
        setError('No se pudieron cargar los clientes');
      }
    };
    cargarClientes();
  }, []);

  // Cargar mensajes del cliente seleccionado
  useEffect(() => {
    if (!clienteSeleccionado) return;
    const cargarMensajes = async () => {
      try {
        const res = await fetch(`${API_URL}/mensajes/${clienteSeleccionado.id}`);
        const data = await res.json();
        setMensajes(data);
      } catch (err) {
        setError('No se pudieron cargar los mensajes');
      }
    };
    cargarMensajes();
  }, [clienteSeleccionado, exito]);

  // Enviar respuesta al cliente
  const handleResponder = async (e) => {
    e.preventDefault();
    setError('');
    setExito('');
    try {
      const res = await fetch(`${API_URL}/mensajes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          remitente_id: soporteId,
          destinatario_id: clienteSeleccionado.id,
          contenido: respuesta,
          tipo: 'soporte'
        })
      });
      if (res.ok) {
        setExito('¡Respuesta enviada!');
        setRespuesta('');
      } else {
        setError('Error al enviar la respuesta');
      }
    } catch (err) {
      setError('Error de conexión');
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>Panel de Soporte</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <NotificationBell />
          <button
            onClick={logout}
            style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #ef4444', color: '#b91c1c', background: 'transparent' }}
          >
            Salir
          </button>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 32 }}>
        {/* Lista de clientes */}
        <div style={{ flex: 1 }}>
          <h3>Clientes</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {Array.isArray(clientes) && clientes.map(cliente => (
              <li key={cliente.id} style={{ marginBottom: 8 }}>
                <button
                  style={{
                    padding: '8px 12px',
                    borderRadius: 6,
                    background: clienteSeleccionado?.id === cliente.id ? '#e0f7fa' : '#f0f0f0',
                    border: 'none',
                    width: '100%',
                    textAlign: 'left'
                  }}
                  onClick={() => setClienteSeleccionado(cliente)}
                >
                  {cliente.nombre || cliente.email || `Cliente #${cliente.id}`}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Mensajes y respuesta */}
        <div style={{ flex: 2 }}>
          {clienteSeleccionado ? (
            <>
              <h3>Mensajes con {clienteSeleccionado.nombre || clienteSeleccionado.email || `Cliente #${clienteSeleccionado.id}`}</h3>
              <div style={{ background: '#f9f9f9', borderRadius: 8, padding: 12, marginBottom: 16, minHeight: 200 }}>
                {mensajes.length === 0 && <div>No hay mensajes aún.</div>}
                {mensajes.map(msg => (
                  <div key={msg.id} style={{
                    marginBottom: 12,
                    textAlign: msg.tipo === 'cliente' ? 'left' : 'right'
                  }}>
                    <div
                      style={{
                        display: 'inline-block',
                        background: msg.tipo === 'cliente' ? '#fffde7' : '#e0f7fa',
                        color: '#333',
                        borderRadius: 6,
                        padding: '8px 12px',
                        maxWidth: '80%'
                      }}
                    >
                      <strong>{msg.tipo === 'cliente' ? 'Cliente' : 'Tú'}:</strong> {msg.contenido}
                      <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>
                        {new Date(msg.fecha_envio).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <form onSubmit={handleResponder}>
                <textarea
                  value={respuesta}
                  onChange={e => setRespuesta(e.target.value)}
                  placeholder="Escribe tu respuesta aquí..."
                  required
                  rows={3}
                  style={{ width: '100%' }}
                />
                <button type="submit" style={{ marginTop: 8 }} disabled={!respuesta}>
                  Responder al cliente
                </button>
              </form>
              {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
              {exito && <div style={{ color: 'green', marginTop: 8 }}>{exito}</div>}
            </>
          ) : (
            <div>Selecciona un cliente para ver y responder mensajes.</div>
          )}
        </div>
      </div>
    </div>
  );
}