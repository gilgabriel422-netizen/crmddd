import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// ============= RESERVAS =============
export const reservasService = {
  getAll: async () => {
    try {
      const response = await axios.get(`${API_URL}/reservas`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener reservas:', error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/reservas/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener reserva:', error);
      throw error;
    }
  },

  create: async (data) => {
    try {
      const response = await axios.post(`${API_URL}/reservas`, data);
      return response.data;
    } catch (error) {
      console.error('Error al crear reserva:', error);
      throw error;
    }
  },

  update: async (id, data) => {
    try {
      const response = await axios.put(`${API_URL}/reservas/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error al actualizar reserva:', error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      await axios.delete(`${API_URL}/reservas/${id}`);
      return { success: true };
    } catch (error) {
      console.error('Error al eliminar reserva:', error);
      throw error;
    }
  },

  search: async (ultimos_4_digitos) => {
    try {
      const response = await axios.get(`${API_URL}/reservas/search?ultimos_4_digitos=${ultimos_4_digitos}`);
      return response.data;
    } catch (error) {
      console.error('Error al buscar reservas:', error);
      throw error;
    }
  }
};

// ============= PAQUETES =============
export const paquetesService = {
  getAll: async () => {
    try {
      const response = await axios.get(`${API_URL}/paquetes`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener paquetes:', error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/paquetes/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener paquete:', error);
      throw error;
    }
  },

  create: async (data) => {
    try {
      const response = await axios.post(`${API_URL}/paquetes`, data);
      return response.data;
    } catch (error) {
      console.error('Error al crear paquete:', error);
      throw error;
    }
  },

  update: async (id, data) => {
    try {
      const response = await axios.put(`${API_URL}/paquetes/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error al actualizar paquete:', error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      await axios.delete(`${API_URL}/paquetes/${id}`);
      return { success: true };
    } catch (error) {
      console.error('Error al eliminar paquete:', error);
      throw error;
    }
  }
};

// ============= MENSAJES =============
export const mensajesService = {
  getAll: async () => {
    try {
      const response = await axios.get(`${API_URL}/mensajes`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener mensajes:', error);
      throw error;
    }
  },

  create: async (data) => {
    try {
      const response = await axios.post(`${API_URL}/mensajes`, data);
      return response.data;
    } catch (error) {
      console.error('Error al crear mensaje:', error);
      throw error;
    }
  },

  update: async (id, data) => {
    try {
      const response = await axios.put(`${API_URL}/mensajes/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error al actualizar mensaje:', error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      await axios.delete(`${API_URL}/mensajes/${id}`);
      return { success: true };
    } catch (error) {
      console.error('Error al eliminar mensaje:', error);
      throw error;
    }
  }
};

// ============= NOTIFICACIONES =============
export const notificacionesService = {
  getAll: async () => {
    try {
      const response = await axios.get(`${API_URL}/notificaciones`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener notificaciones:', error);
      return [];
    }
  },

  create: async (data) => {
    try {
      const response = await axios.post(`${API_URL}/notificaciones`, data);
      return response.data;
    } catch (error) {
      console.error('Error al crear notificación:', error);
      throw error;
    }
  },

  markAsRead: async (id) => {
    try {
      const response = await axios.put(`${API_URL}/notificaciones/${id}`, { leida: true });
      return response.data;
    } catch (error) {
      console.error('Error al marcar notificación:', error);
      throw error;
    }
  }
};

// ============= CHATBOT =============
export const chatbotService = {
  sendMessage: async (message) => {
    try {
      const response = await axios.post(`${API_URL}/chatbot/pregunta`, { pregunta: message });
      return response.data;
    } catch (error) {
      console.error('Error en chatbot:', error);
      throw error;
    }
  },

  getFAQ: async () => {
    try {
      const response = await axios.get(`${API_URL}/chatbot/faq`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener FAQ:', error);
      return [];
    }
  }
};

// ============= CONTRATOS FÍSICOS =============
export const contratosFisicosService = {
  getAll: async () => {
    try {
      const response = await axios.get(`${API_URL}/contratos-fisicos`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener contratos:', error);
      throw error;
    }
  },

  create: async (data) => {
    try {
      const response = await axios.post(`${API_URL}/contratos-fisicos`, data);
      return response.data;
    } catch (error) {
      console.error('Error al crear contrato:', error);
      throw error;
    }
  },

  update: async (id, data) => {
    try {
      const response = await axios.put(`${API_URL}/contratos-fisicos/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error al actualizar contrato:', error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      await axios.delete(`${API_URL}/contratos-fisicos/${id}`);
      return { success: true };
    } catch (error) {
      console.error('Error al eliminar contrato:', error);
      throw error;
    }
  }
};

// ============= LOCACIONES =============
export const locacionesService = {
  getAll: async () => {
    try {
      const response = await axios.get(`${API_URL}/locaciones`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener locaciones:', error);
      throw error;
    }
  },

  create: async (data) => {
    try {
      const response = await axios.post(`${API_URL}/locaciones`, data);
      return response.data;
    } catch (error) {
      console.error('Error al crear locación:', error);
      throw error;
    }
  },

  update: async (id, data) => {
    try {
      const response = await axios.put(`${API_URL}/locaciones/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error al actualizar locación:', error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      await axios.delete(`${API_URL}/locaciones/${id}`);
      return { success: true };
    } catch (error) {
      console.error('Error al eliminar locación:', error);
      throw error;
    }
  }
};

// ============= DEPARTAMENTOS =============
export const departamentosService = {
  getAll: async () => {
    try {
      const response = await axios.get(`${API_URL}/departamentos`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener departamentos:', error);
      throw error;
    }
  },

  create: async (data) => {
    try {
      const response = await axios.post(`${API_URL}/departamentos`, data);
      return response.data;
    } catch (error) {
      console.error('Error al crear departamento:', error);
      throw error;
    }
  },

  update: async (id, data) => {
    try {
      const response = await axios.put(`${API_URL}/departamentos/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error al actualizar departamento:', error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      await axios.delete(`${API_URL}/departamentos/${id}`);
      return { success: true };
    } catch (error) {
      console.error('Error al eliminar departamento:', error);
      throw error;
    }
  }
};
