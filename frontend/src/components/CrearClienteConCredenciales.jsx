import React, { useState } from 'react'
import { Copy, Check, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import axios from 'axios'

const CrearClienteConCredenciales = ({ isOpen, onClose, onSuccess }) => {
  const [step, setStep] = useState('form') // 'form' o 'credenciales'
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [copiedField, setCopiedField] = useState(null)
  const [credenciales, setCredenciales] = useState(null)

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    document_number: '',
    contract_number: '',
    empresa: '',
    ciudad: '',
    pais: '',
    rolCliente: 'blue'
  })

  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    if (!formData.first_name.trim()) newErrors.first_name = 'Nombre requerido'
    if (!formData.last_name.trim()) newErrors.last_name = 'Apellido requerido'
    if (!formData.email.trim()) newErrors.email = 'Email requerido'
    if (!formData.phone.trim()) newErrors.phone = 'Teléfono requerido'
    if (!formData.document_number.trim()) newErrors.document_number = 'Documento requerido'
    if (!formData.contract_number.trim()) newErrors.contract_number = 'Contrato requerido'
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleCreateClient = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setLoading(true)
    try {
      const response = await axios.post(
        'http://localhost:5000/api/clientes/crear-con-usuario',
        {
          clienteData: {
            first_name: formData.first_name,
            last_name: formData.last_name,
            email: formData.email,
            phone: formData.phone,
            document_number: formData.document_number,
            contract_number: formData.contract_number,
            empresa: formData.empresa,
            ciudad: formData.ciudad,
            pais: formData.pais,
            status: 'activo'
          },
          rolCliente: formData.rolCliente
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        }
      )

      if (response.data.success) {
        setCredenciales(response.data.credenciales)
        setStep('credenciales')
        if (onSuccess) onSuccess(response.data)
      }
    } catch (error) {
      console.error('Error al crear cliente:', error)
      alert('Error al crear cliente: ' + (error.response?.data?.message || error.message))
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const handleClose = () => {
    setStep('form')
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      document_number: '',
      contract_number: '',
      empresa: '',
      ciudad: '',
      pais: '',
      rolCliente: 'blue'
    })
    setErrors({})
    setCredenciales(null)
    setShowPassword(false)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold">
            {step === 'form' ? '➕ Crear Cliente con Usuario' : '✅ Credenciales Generadas'}
          </h2>
          <button
            onClick={handleClose}
            className="text-white hover:bg-blue-700 p-2 rounded-lg transition"
          >
            ✕
          </button>
        </div>

        <div className="p-6">
          {step === 'form' ? (
            // FORMULARIO DE CREACIÓN
            <form onSubmit={handleCreateClient} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Nombre */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    placeholder="Juan"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.first_name ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.first_name && <p className="text-red-500 text-xs mt-1">{errors.first_name}</p>}
                </div>

                {/* Apellido */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Apellido *
                  </label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    placeholder="Pérez"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.last_name ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.last_name && <p className="text-red-500 text-xs mt-1">{errors.last_name}</p>}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="juan@empresa.com"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>

                {/* Teléfono */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teléfono *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+593 999 123456"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.phone ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                </div>

                {/* Documento */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cédula/Documento *
                  </label>
                  <input
                    type="text"
                    name="document_number"
                    value={formData.document_number}
                    onChange={handleChange}
                    placeholder="1234567890"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.document_number ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.document_number && <p className="text-red-500 text-xs mt-1">{errors.document_number}</p>}
                </div>

                {/* Contrato */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Número de Contrato *
                  </label>
                  <input
                    type="text"
                    name="contract_number"
                    value={formData.contract_number}
                    onChange={handleChange}
                    placeholder="CT2602-0001"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.contract_number ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.contract_number && <p className="text-red-500 text-xs mt-1">{errors.contract_number}</p>}
                </div>

                {/* Empresa (opcional) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Empresa
                  </label>
                  <input
                    type="text"
                    name="empresa"
                    value={formData.empresa}
                    onChange={handleChange}
                    placeholder="Mi Empresa S.A."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Ciudad */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ciudad
                  </label>
                  <input
                    type="text"
                    name="ciudad"
                    value={formData.ciudad}
                    onChange={handleChange}
                    placeholder="Quito"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* País */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    País
                  </label>
                  <input
                    type="text"
                    name="pais"
                    value={formData.pais}
                    onChange={handleChange}
                    placeholder="Ecuador"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Rol del Cliente */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Cliente *
                  </label>
                  <select
                    name="rolCliente"
                    value={formData.rolCliente}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="blue">Blue (Estándar)</option>
                    <option value="gold">Gold (Premium)</option>
                    <option value="black">Black (VIP)</option>
                  </select>
                </div>
              </div>

              {/* Botones */}
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition flex items-center gap-2"
                >
                  {loading ? '⏳ Creando...' : '✅ Crear Cliente'}
                </button>
              </div>
            </form>
          ) : (
            // PANTALLA DE CREDENCIALES
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800 font-medium">✅ Cliente y usuario creados exitosamente</p>
              </div>

              {/* Credenciales */}
              <div className="space-y-4">
                {/* Email de Usuario */}
                <div className="border rounded-lg p-4 bg-gray-50">
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Mail size={16} /> Email de Usuario para Login
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={credenciales.email}
                      readOnly
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-white font-mono"
                    />
                    <button
                      onClick={() => copyToClipboard(credenciales.email, 'email')}
                      className={`p-2 rounded-lg transition ${
                        copiedField === 'email'
                          ? 'bg-green-500 text-white'
                          : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                      }`}
                      title="Copiar"
                    >
                      {copiedField === 'email' ? <Check size={20} /> : <Copy size={20} />}
                    </button>
                  </div>
                </div>

                {/* Contraseña */}
                <div className="border rounded-lg p-4 bg-gray-50">
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Lock size={16} /> Contraseña
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={credenciales.password}
                      readOnly
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-white font-mono"
                    />
                    <button
                      onClick={() => setShowPassword(!showPassword)}
                      className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition"
                      title="Mostrar/Ocultar"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                    <button
                      onClick={() => copyToClipboard(credenciales.password, 'password')}
                      className={`p-2 rounded-lg transition ${
                        copiedField === 'password'
                          ? 'bg-green-500 text-white'
                          : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                      }`}
                      title="Copiar"
                    >
                      {copiedField === 'password' ? <Check size={20} /> : <Copy size={20} />}
                    </button>
                  </div>
                </div>

                {/* Rol */}
                <div className="border rounded-lg p-4 bg-gray-50">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rol/Tipo</label>
                  <div className="px-3 py-2 bg-white rounded-lg font-mono">
                    {credenciales.rol === 'blue' && '🔵 Blue (Cliente Estándar)'}
                    {credenciales.rol === 'gold' && '🟡 Gold (Cliente Premium)'}
                    {credenciales.rol === 'black' && '⚫ Black (Cliente VIP)'}
                  </div>
                </div>
              </div>

              {/* Instrucciones */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-bold text-blue-900 mb-2">📋 Instrucciones para compartir con el cliente:</h3>
                <ol className="text-blue-800 text-sm space-y-1 ml-4 list-decimal">
                  <li>Copia las credenciales haciendo clic en los botones</li>
                  <li>Comparte el email y contraseña con el cliente por email seguro</li>
                  <li>El cliente accede en: http://localhost:3000/login</li>
                  <li>En su panel, verá su contrato y podrá descargar la plantilla</li>
                </ol>
              </div>

              {/* Botones Finales */}
              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => {
                    // Copiar resumen
                    const resumen = `Email: ${credenciales.email}\nContraseña: ${credenciales.password}`
                    copyToClipboard(resumen, 'resumen')
                  }}
                  className={`px-4 py-2 rounded-lg transition flex items-center gap-2 ${
                    copiedField === 'resumen'
                      ? 'bg-green-600 text-white'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {copiedField === 'resumen' ? <Check size={18} /> : <Copy size={18} />}
                  {copiedField === 'resumen' ? 'Copiado' : 'Copiar Todo'}
                </button>
                <button
                  onClick={handleClose}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                >
                  Cerrar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CrearClienteConCredenciales
