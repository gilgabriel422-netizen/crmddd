import React, { useEffect, useState } from 'react';
import { getMensajesRecibidos } from '../api';

export default function IconoCorreoSoporte({ soporteId }) {
  const [cantidad, setCantidad] = useState(0);

  useEffect(() => {
    async function cargar() {
      const mensajes = await getMensajesRecibidos(soporteId);
      setCantidad(mensajes.length);
    }
    cargar();
  }, [soporteId]);

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <span role="img" aria-label="correo" style={{ fontSize: 24 }}>📧</span>
      {cantidad > 0 && (
        <span style={{
          position: 'absolute', top: -5, right: -5, background: 'red', color: 'white',
          borderRadius: '50%', padding: '2px 6px', fontSize: 12
        }}>{cantidad}</span>
      )}
    </div>
  );
}