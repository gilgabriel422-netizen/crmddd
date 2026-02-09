export async function getNotificaciones(usuario_id) {
  const response = await fetch(`http://localhost:5000/api/notificaciones/${usuario_id}`);
  if (!response.ok) throw new Error('Error al obtener notificaciones');
  return await response.json();
}

// Nueva función para obtener clientes con búsqueda y paginación
export async function getClientes({ search = '', page = 1, limit = 20 } = {}) {
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  if (page) params.append('page', page);
  if (limit) params.append('limit', limit);

  const response = await fetch(`http://localhost:5000/api/clientes?${params.toString()}`);
  if (!response.ok) throw new Error('Error al obtener clientes');
  const data = await response.json();
  return data; // Devuelve el objeto completo (clientes + paginación)
}

// --- Sistema de mensajería ---

// Obtener mensajes de una conversación
export async function getMensajes(conversacionId) {
  const response = await fetch(`http://localhost:5000/api/mensajes/${conversacionId}`);
  if (!response.ok) throw new Error('Error al obtener mensajes');
  return await response.json();
}

// Enviar un mensaje (ahora con destinatarioId)
export async function enviarMensaje({ conversacionId, remitenteId, destinatarioId, contenido }) {
  const response = await fetch('http://localhost:5000/api/mensajes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ conversacionId, remitenteId, destinatarioId, contenido }),
  });
  if (!response.ok) throw new Error('Error al enviar mensaje');
  return await response.json();
}

// Obtener mensajes recibidos por el soporte
export async function getMensajesRecibidos(destinatarioId) {
  const response = await fetch(`http://localhost:5000/api/mensajes/recibidos/${destinatarioId}`);
  if (!response.ok) throw new Error('Error al obtener mensajes recibidos');
  return await response.json();
}