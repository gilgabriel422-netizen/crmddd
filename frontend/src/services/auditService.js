import api from './api'

const auditService = {
  // Crear entrada de auditoría
  createAuditLog: async (auditData) => {
    try {
      const response = await api.post('/audit-logs', auditData)
      return response.data
    } catch (error) {
      console.error('Error creando entrada de auditoría:', error)
      throw error
    }
  },

  // Obtener historial de auditoría
  getAuditLogs: async (params = {}) => {
    try {
      const response = await api.get('/audit-logs', { params })
      return response.data
    } catch (error) {
      console.error('Error obteniendo historial de auditoría:', error)
      throw error
    }
  },

  // Obtener historial por usuario
  getAuditLogsByUser: async (userId, params = {}) => {
    try {
      const response = await api.get(`/audit-logs/user/${userId}`, { params })
      return response.data
    } catch (error) {
      console.error('Error obteniendo historial por usuario:', error)
      throw error
    }
  },

  // Obtener historial por tipo de acción
  getAuditLogsByAction: async (action, params = {}) => {
    try {
      const response = await api.get(`/audit-logs/action/${action}`, { params })
      return response.data
    } catch (error) {
      console.error('Error obteniendo historial por acción:', error)
      throw error
    }
  },

  // Obtener estadísticas de auditoría
  getAuditStats: async (params = {}) => {
    try {
      const response = await api.get('/audit-logs/stats', { params })
      return response.data
    } catch (error) {
      console.error('Error obteniendo estadísticas de auditoría:', error)
      throw error
    }
  }
}

export default auditService
