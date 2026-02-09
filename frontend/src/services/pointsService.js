import api from './api';

/**
 * PointsService - Sistema de puntos basado completamente en backend
 * 
 * DECISIÓN TÉCNICA: Solo backend (sin localStorage)
 * Razón: Proyecto se desplegará en S3 + EC2, necesitamos fuente de verdad centralizada
 */

// Obtener puntos desde backend
export async function getPointsForUser(email) {
  if (!email) return 0;
  
  try {
    const response = await api.get(`/puntos/${email}`);
    return response.data.puntos || 0;
  } catch (err) {
    console.error('Error fetching points from backend', err);
    // Retornar 0 si hay error (no usar cache local)
    return 0;
  }
}

// Establecer puntos en backend
export async function setPointsForUser(email, amount, cliente_id = null) {
  if (!email) {
    throw new Error('Email es requerido para establecer puntos');
  }
  
  try {
    const response = await api.post('/puntos', { 
      email, 
      puntos: amount, 
      cliente_id 
    });
    return response.data.puntos;
  } catch (err) {
    console.error('Error setting points in backend', err);
    throw err;
  }
}

// Agregar puntos en backend
export async function addPointsForUser(email, delta) {
  if (!email) {
    throw new Error('Email es requerido para agregar puntos');
  }
  
  try {
    const response = await api.patch(`/puntos/${email}/add`, { delta });
    return response.data.puntos;
  } catch (err) {
    console.error('Error adding points in backend', err);
    throw err;
  }
}

// Limpiar todos los puntos (solo admin)
export async function clearAllPoints() {
  try {
    const response = await api.delete('/puntos/clear');
    return response.data.ok;
  } catch (err) {
    console.error('Error clearing all points', err);
    throw err;
  }
}

export default {
  getPointsForUser,
  setPointsForUser,
  addPointsForUser,
  clearAllPoints
};
