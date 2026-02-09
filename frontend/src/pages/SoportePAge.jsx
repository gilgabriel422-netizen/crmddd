import React from 'react';
import ChatMensajes from '../components/ChatMensajes';

export default function SoportePage() {
  // Estos valores deben venir de tu lógica real (usuario logueado y conversación activa)
  const idConversacion = "1"; // Reemplaza por el ID real de la conversación
  const idUsuarioActual = "123"; // Reemplaza por el ID real del usuario logueado

  return (
    <div>
      <h2>Soporte al Cliente</h2>
      <ChatMensajes conversacionId={idConversacion} remitenteId={idUsuarioActual} />
    </div>
  );
}