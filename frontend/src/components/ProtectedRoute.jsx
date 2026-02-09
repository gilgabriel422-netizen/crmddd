import React, { useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { checkTokenExpiration } from '../services/api'

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()

  // Verificar expiración del token antes de renderizar
  useEffect(() => {
    if (!loading && user) {
      const tokenStatus = checkTokenExpiration(false)
      
      if (tokenStatus === 'expired') {
        console.log('🔐 Token expirado en ProtectedRoute - redirigiendo a inicio')
        
        // Limpiar localStorage
        localStorage.removeItem('authToken')
        localStorage.removeItem('isAuthenticated')
        localStorage.removeItem('user')
        
        // Redirigir a login
        window.location.href = '/'
      }
    }
  }, [user, loading])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/" replace />
  }

  return children
}

export default ProtectedRoute
