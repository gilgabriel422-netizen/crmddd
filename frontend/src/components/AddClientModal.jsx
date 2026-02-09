import React, { useState } from 'react'
import { X, Plus } from 'lucide-react'
import { clientService } from '../services/api'

const AddClientModal = ({ isOpen, onClose, onClientAdded }) => {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    contract_number: '',
    status: 'activo',
    categoria_cliente: '',
    pagare: 'No',
    fecha_pagare: '',
    monto_pagare: '',
    cantidad_cuotas: 1,
    cuotas_asumidas: 0
  })

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.first_name || !formData.last_name || !formData.email || !formData.contract_number) {
      alert('Por favor, completa todos los campos requeridos')
      return
    }
    if (!formData.categoria_cliente) {
      alert('Por favor, selecciona la categoría del cliente (Blue, Gold o Black)')
      return
    }

    const payload = {
      ...formData,
      pagare: formData.pagare === 'Si',
      pagare_cuotas: formData.pagare === 'Si' ? parseInt(formData.cantidad_cuotas, 10) || 1 : null,
      pagare_cuotas_asumidas: formData.pagare === 'Si' ? parseInt(formData.cuotas_asumidas, 10) || 0 : null,
      fecha_pagare: formData.pagare === 'Si' && formData.fecha_pagare ? formData.fecha_pagare : null,
      monto_pagare: formData.pagare === 'Si' && formData.monto_pagare ? parseFloat(formData.monto_pagare) : null
    }

    try {
      setLoading(true)
      const response = await clientService.createClient(payload)
      console.log('✅ Cliente creado:', response.data)
      
      alert('✅ Cliente creado exitosamente')
      
      // Limpiar formulario
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        contract_number: '',
        status: 'activo',
        categoria_cliente: '',
        pagare: 'No',
        fecha_pagare: '',
        monto_pagare: '',
        cantidad_cuotas: 1,
        cuotas_asumidas: 0
      })
      
      // Notificar al componente padre
      if (onClientAdded) {
        onClientAdded()
      }
      
      // Cerrar modal
      onClose()
    } catch (err) {
      console.error('Error al crear cliente:', err)
      alert('Error: ' + (err.response?.data?.error || err.message))
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Nuevo Cliente</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nombre *</label>
            <input
              type="text"
              required
              value={formData.first_name}
              onChange={(e) => setFormData({...formData, first_name: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nombre"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Apellido *</label>
            <input
              type="text"
              required
              value={formData.last_name}
              onChange={(e) => setFormData({...formData, last_name: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Apellido"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="email@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Teléfono (opcional)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Número de Contrato *</label>
            <input
              type="text"
              required
              value={formData.contract_number}
              onChange={(e) => setFormData({...formData, contract_number: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="CONT-0001"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Categoría *</label>
            <select
              required
              value={formData.categoria_cliente}
              onChange={(e) => setFormData({...formData, categoria_cliente: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Seleccionar...</option>
              <option value="blue">Blue</option>
              <option value="gold">Gold</option>
              <option value="black">Black</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Pagaré</label>
            <select
              value={formData.pagare}
              onChange={(e) => setFormData({...formData, pagare: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="No">No</option>
              <option value="Si">Sí</option>
            </select>
          </div>
          {formData.pagare === 'Si' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fecha pagaré</label>
                <input
                  type="date"
                  value={formData.fecha_pagare}
                  onChange={(e) => setFormData({...formData, fecha_pagare: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Monto pagaré</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.monto_pagare}
                  onChange={(e) => setFormData({...formData, monto_pagare: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cantidad de cuotas</label>
                <input
                  type="number"
                  min="1"
                  value={formData.cantidad_cuotas}
                  onChange={(e) => setFormData({...formData, cantidad_cuotas: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cuotas asumidas</label>
                <input
                  type="number"
                  min="0"
                  value={formData.cuotas_asumidas}
                  onChange={(e) => setFormData({...formData, cuotas_asumidas: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </>
          )}

          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Plus size={16} />
              {loading ? 'Guardando...' : 'Guardar Cliente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddClientModal
