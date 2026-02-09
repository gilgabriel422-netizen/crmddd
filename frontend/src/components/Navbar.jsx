import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Menu, X, LogOut, LogIn } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { user, login, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      // Usar el servicio de autenticación del contexto
      const result = await login(email, password)
      
      if (result.success) {
        setShowLogin(false)
        setEmail('')
        setPassword('')
        // La redirección se maneja en el AuthContext
      } else {
        setError(result.message || 'Error al iniciar sesión. Verifica tus credenciales.')
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Error al iniciar sesión. Verifica tus credenciales.')
      console.error('Error en login:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const demoUsers = [
    { email: 'admin@crm.com', password: 'admin123', label: 'Admin' },
    { email: 'cobranzas@crm.com', password: 'admin123', label: 'Cobranzas' },
    { email: 'contratos@crm.com', password: 'admin123', label: 'Contratos' },
    { email: 'atencion@crm.com', password: 'admin123', label: 'Atención' },
    { email: 'postventa@crm.com', password: 'admin123', label: 'Postventa' },
    { email: 'clientes@crm.com', password: 'admin123', label: 'Cliente Blue' },
    { email: 'clienteib1@crm.com', password: 'admin123', label: 'Cliente Gold' },
    { email: 'clienteib2@crm.com', password: 'admin123', label: 'Cliente Black' }
  ]

  return (
    <>
      <nav className="sticky top-0 z-50 bg-gradient-to-r from-amber-900 to-amber-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex-shrink-0 flex items-center gap-2">
              <div className="text-2xl font-bold text-yellow-300 hover:text-yellow-200 transition">
                🌟 Innovation Business
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-8">
                <Link to="/" className="text-amber-50 hover:text-yellow-300 px-3 py-2 text-sm font-medium transition-colors">
                  INICIO
                </Link>
                <Link to="/paquetes" className="text-amber-50 hover:text-yellow-300 px-3 py-2 text-sm font-medium transition-colors">
                  PAQUETES
                </Link>
                <Link to="/experiencias" className="text-amber-50 hover:text-yellow-300 px-3 py-2 text-sm font-medium transition-colors">
                  EXPERIENCIAS
                </Link>
                <Link to="/contactanos" className="text-amber-50 hover:text-yellow-300 px-3 py-2 text-sm font-medium transition-colors">
                  CONTACTO
                </Link>
              </div>
            </div>

            {/* Buttons */}
            <div className="hidden md:flex items-center gap-4">
              {user ? (
                <>
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-yellow-300 flex items-center justify-center">
                      <span className="text-amber-900 font-bold text-sm">
                        {(user && user.name && typeof user.name === 'string' && user.name.length > 0)
                          ? user.name.charAt(0).toUpperCase()
                          : <span className="opacity-50">?</span>}
                      </span>
                    </div>
                    <span className="text-amber-50 text-sm">{(user && user.name) ? user.name : 'Usuario'}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition"
                  >
                    <LogOut size={16} />
                    <span>Salir</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setShowLogin(true)}
                  className="flex items-center space-x-2 btn-primary"
                >
                  <LogIn size={16} />
                  <span>Iniciar Sesión</span>
                </button>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center gap-2">
              {user && (
                <div className="w-8 h-8 rounded-full bg-yellow-300 flex items-center justify-center">
                  <span className="text-amber-900 font-bold text-sm">
                    {(user && user.name && typeof user.name === 'string' && user.name.length > 0)
                      ? user.name.charAt(0).toUpperCase()
                      : <span className="opacity-50">?</span>}
                  </span>
                </div>
              )}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-amber-50 hover:text-yellow-300 focus:outline-none"
              >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden bg-amber-800">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link to="/" className="text-yellow-300 font-semibold block px-3 py-2 text-base hover:bg-amber-700 rounded" onClick={() => setIsOpen(false)}>
              INICIO
            </Link>
            <Link to="/paquetes" className="text-amber-50 hover:text-yellow-300 hover:bg-amber-700 block px-3 py-2 text-base font-medium rounded" onClick={() => setIsOpen(false)}>
              PAQUETES
            </Link>
            <Link to="/experiencias" className="text-amber-50 hover:text-yellow-300 hover:bg-amber-700 block px-3 py-2 text-base font-medium rounded" onClick={() => setIsOpen(false)}>
              EXPERIENCIAS
            </Link>
            <Link to="/contactanos" className="text-amber-50 hover:text-yellow-300 hover:bg-amber-700 block px-3 py-2 text-base font-medium rounded" onClick={() => setIsOpen(false)}>
              CONTACTO
            </Link>
            <div className="pt-2 border-t border-amber-700">
              {user ? (
                <button
                  onClick={() => {
                    handleLogout()
                    setIsOpen(false)
                  }}
                  className="block w-full text-left px-4 py-2 text-red-300 hover:bg-amber-700 rounded transition"
                >
                  Cerrar Sesión
                </button>
              ) : (
                <button
                  onClick={() => {
                    setShowLogin(true)
                    setIsOpen(false)
                  }}
                  className="block w-full text-left px-4 py-2 text-yellow-300 hover:bg-amber-700 rounded transition"
                >
                  Iniciar Sesión
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-8">
            <h2 className="text-2xl font-bold text-amber-900 mb-2">Iniciar Sesión</h2>
            <p className="text-gray-600 text-sm mb-6">Acceso de Prueba - Innovation Business</p>

            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-amber-900 mb-1">
                  Usuario/Email
                </label>
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin, paola, cobranzas"
                  className="w-full px-4 py-2 border-2 border-amber-200 rounded focus:outline-none focus:border-amber-500 text-gray-800"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-amber-900 mb-1">
                  Contraseña
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2 border-2 border-amber-200 rounded focus:outline-none focus:border-amber-500 text-gray-800"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-amber-500 to-yellow-400 text-amber-900 font-bold py-3 rounded hover:from-amber-600 hover:to-yellow-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Cargando...' : 'Entrar'}
              </button>
            </form>

            <div className="mt-6 border-t pt-4">
              <p className="text-xs font-semibold text-gray-600 mb-3 uppercase">Usuarios de Prueba</p>
              <div className="space-y-2">
                {demoUsers.map((user) => (
                  <button
                    key={user.email}
                    onClick={() => {
                      setEmail(user.email)
                      setPassword(user.password)
                    }}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm py-2 px-3 rounded transition text-left border border-gray-300"
                  >
                    <span className="font-semibold">{user.label}</span>
                    <span className="text-gray-600 text-xs"> ({user.email})</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 text-center">
              <button
                onClick={() => {
                  setShowLogin(false)
                  setError('')
                }}
                className="text-amber-600 hover:text-amber-800 font-medium text-sm"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Navbar
