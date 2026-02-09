import React from 'react'
import { useAuth } from '../contexts/AuthContext'
import AdminPanel from '../pages/AdminPanel'

const AdminPanelWrapper = () => {
  const { user, logout } = useAuth()

  // Verificar que el usuario sea admin
  // El backend CRM usa 'rol' (español), pero también verificamos 'role' (inglés) por compatibilidad
  const userRole = user?.rol || user?.role;
  
  if (userRole !== 'admin') {
    console.log('🔍 AdminPanelWrapper - Usuario:', user);
    console.log('🔍 AdminPanelWrapper - Rol detectado:', userRole);
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Acceso Denegado</h2>
          <p className="text-gray-600 mb-6">No tienes permisos para acceder al panel de administración.</p>
          <p className="text-sm text-gray-500 mb-4">Rol detectado: <strong>{userRole || 'undefined'}</strong></p>
          <button
            onClick={logout}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700"
          >
            Cerrar Sesión
          </button>
        </div>
      </div>
    )
  }

  return <AdminPanel />
}

export default AdminPanelWrapper
