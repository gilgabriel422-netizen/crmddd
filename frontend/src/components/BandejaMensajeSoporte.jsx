import React, { useEffect, useState } from 'react';
import { getMensajesRecibidos } from '../api';

export default function BandejaMensajesSoporte({ soporteId }) {
  const [mensajes, setMensajes] = useState([]);

  useEffect(() => {
    async function cargarMensajes() {
      const data = await getMensajesRecibidos(soporteId);
      setMensajes(data);
    }
    cargarMensajes();
  }, [soporteId]);

  return (
    <div>
      <h3>Bandeja de Entrada</h3>
      {mensajes.length === 0 ? (
        <div>No hay mensajes nuevos.</div>
      ) : (
        <ul>
          {mensajes.map(msg => (
            <li key={msg.id}>
              <b>De:</b> {msg.remitenteId} <br />
              <b>Mensaje:</b> {msg.contenido}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}