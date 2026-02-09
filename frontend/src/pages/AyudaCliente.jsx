import React from 'react';
import SoporteMensajeCliente from '../components/SoporteMensajeCliente';
import { useAuth } from '../contexts/AuthContext';

export default function AyudaCliente() {
  const { user } = useAuth();

  if (!user) return <div>Cargando...</div>;

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: 24 }}>
      <h2 style={{ marginBottom: 16 }}>Ayuda</h2>
      <div style={{
        background: '#fff',
        borderRadius: 8,
        boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
        padding: 24
      }}>
        <p style={{ marginBottom: 16 }}>
          ¿Necesitas soporte? Escribe tu consulta, queja o sugerencia y nuestro equipo de atención al cliente te responderá lo antes posible.
        </p>
        <SoporteMensajeCliente clienteId={user.id} />
      </div>
    </div>
  );
}