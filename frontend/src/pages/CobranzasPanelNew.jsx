import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { 
  Users, 
  DollarSign, 
  LogOut, 
  Menu, 
  X,
  Search,
  Plus,
  Eye,
  Edit,
  FileText,
  CreditCard,
  TrendingUp,
  AlertCircle
} from 'lucide-react'
import { clientService } from '../services/api'
import reportService from '../services/reportService'

const CobranzasPanel = () => {
  const { user, logout } = useAuth()
  const [activeModule, setActiveModule] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  
  // Estados para cada módulo
  const [clients, setClients] = useState([])
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  
  // Estados para dashboard de cobranzas
  const [dashboardData, setDashboardData] = useState({
    totalClients: 0,
    unpaidClients: 0,
    totalDebt: 0,
    collectedAmount: 0,
    pendingAmount: 0,
    collectionRate: 0
  })
  const [dashboardLoading, setDashboardLoading] = useState(false)
  const [dashboardPeriod, setDashboardPeriod] = useState('this_month')
  const [periodSummary, setPeriodSummary] = useState({
    sales: { total_ventas: 0, total_monto: 0, ventas_pagadas: 0, monto_pagado: 0 },
    collections: { total_cobranzas: 0, total_monto: 0, cobranzas_pagadas: 0, monto_pagado: 0 }
  })

  // Cargar datos según el módulo activo
  useEffect(() => {
    if (activeModule === 'dashboard') {
      loadDashboardData()
    } else if (activeModule === 'clients') {
      loadClients()
    } else if (activeModule === 'payments') {
      loadPayments()
    }
  }, [activeModule, currentPage, searchTerm, dashboardPeriod])

  const loadClients = async () => {
    try {
      setLoading(true)
      const response = await clientService.getAll(currentPage, 20, searchTerm)
      setClients(response.clients)
      setTotalPages(response.pagination.totalPages)
    } catch (error) {
      console.error('Error loading clients:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadPayments = async () => {
    try {
      setLoading(true)
      // Simular datos de pagos por ahora
      setPayments([
        {
          id: 1,
          client_name: 'Juan Pérez',
          contract_number: 'KWT-001',
          payment_amount: 500,
          payment_date: '2024-10-01',
          payment_method: 'Transferencia',
          receipt_number: 'REC-001'
        }
      ])
    } catch (error) {
      console.error('Error loading payments:', error)
    } finally {
      setLoading(false)
    }
  }

  // Funciones para dashboard de cobranzas
  const loadDashboardData = async () => {
    try {
      setDashboardLoading(true)
      
      // Cargar estadísticas generales de clientes
      const clientsResponse = await clientService.getClientStats()
      const stats = clientsResponse.stats
      
      // Cargar datos del período seleccionado
      const periodData = await reportService.getLastMonthSummary(dashboardPeriod)
      setPeriodSummary(periodData)
      
      // Calcular métricas específicas de cobranzas
      const totalClients = parseInt(stats.total_clients) || 0
      const unpaidClients = parseInt(stats.unpaid_clients) || 0
      const totalRevenue = parseFloat(stats.total_revenue) || 0
      const paidClients = parseInt(stats.paid_clients) || 0
      
      const collectionRate = totalClients > 0 ? (paidClients / totalClients) * 100 : 0
      const pendingAmount = totalRevenue - (parseFloat(periodData.sales?.monto_pagado) || 0)
      
      setDashboardData({
        totalClients,
        unpaidClients,
        totalDebt: totalRevenue,
        collectedAmount: parseFloat(periodData.sales?.monto_pagado) || 0,
        pendingAmount,
        collectionRate
      })
      
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setDashboardLoading(false)
    }
  }

  const handleDashboardPeriodChange = (period) => {
    setDashboardPeriod(period)
    loadDashboardData()
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-EC', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const handleSearch = () => {
    setCurrentPage(1)
    if (activeModule === 'clients') {
      loadClients()
    }
  }

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Selector de período */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Dashboard de Cobranzas</h2>
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">Período:</label>
          <select
            value={dashboardPeriod}
            onChange={(e) => handleDashboardPeriodChange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="yesterday">Ayer</option>
            <option value="last_month">Mes Pasado</option>
            <option value="this_month">Este Mes</option>
          </select>
        </div>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Clientes</p>
              <p className="text-2xl font-bold text-gray-900">
                {dashboardLoading ? '...' : dashboardData.totalClients}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Clientes en Cobranzas</p>
              <p className="text-2xl font-bold text-gray-900">
                {dashboardLoading ? '...' : dashboardData.unpaidClients}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Monto Cobrado</p>
              <p className="text-2xl font-bold text-gray-900">
                {dashboardLoading ? '...' : formatCurrency(dashboardData.collectedAmount)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tasa de Cobranza</p>
              <p className="text-2xl font-bold text-gray-900">
                {dashboardLoading ? '...' : `${dashboardData.collectionRate.toFixed(1)}%`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Detalles del período */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Ventas del Período</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Ventas:</span>
              <span className="font-semibold text-blue-600">
                {dashboardLoading ? '...' : periodSummary.sales.total_ventas}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Monto Total:</span>
              <span className="font-semibold text-blue-600">
                {dashboardLoading ? '...' : formatCurrency(periodSummary.sales.total_monto)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Ventas Pagadas:</span>
              <span className="font-semibold text-green-600">
                {dashboardLoading ? '...' : periodSummary.sales.ventas_pagadas}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Monto Pagado:</span>
              <span className="font-semibold text-green-600">
                {dashboardLoading ? '...' : formatCurrency(periodSummary.sales.monto_pagado)}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Cobranzas del Período</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Cobranzas:</span>
              <span className="font-semibold text-orange-600">
                {dashboardLoading ? '...' : periodSummary.collections.total_cobranzas}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Monto Total:</span>
              <span className="font-semibold text-orange-600">
                {dashboardLoading ? '...' : formatCurrency(periodSummary.collections.total_monto)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Cobranzas Pagadas:</span>
              <span className="font-semibold text-green-600">
                {dashboardLoading ? '...' : periodSummary.collections.cobranzas_pagadas}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Monto Pendiente:</span>
              <span className="font-semibold text-red-600">
                {dashboardLoading ? '...' : formatCurrency(dashboardData.pendingAmount)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Resumen ejecutivo */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 rounded-lg">
        <h3 className="text-xl font-bold mb-4">📊 Resumen Ejecutivo de Cobranzas</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold">{dashboardData.totalClients}</div>
            <div className="text-sm opacity-90">Total Clientes</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{dashboardData.unpaidClients}</div>
            <div className="text-sm opacity-90">En Cobranzas</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{dashboardData.collectionRate.toFixed(1)}%</div>
            <div className="text-sm opacity-90">Tasa de Cobranza</div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderClients = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Clientes</h2>
        <div className="flex space-x-4">
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Buscar cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Search size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contrato
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Monto Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado Pago
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  </td>
                </tr>
              ) : clients.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                    No se encontraron clientes
                  </td>
                </tr>
              ) : (
                clients.map((client) => (
                  <tr key={client.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {client.first_name} {client.last_name}
                      </div>
                      <div className="text-sm text-gray-500">{client.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {client.contract_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(client.total_amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        client.payment_status === 'paid' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {client.payment_status === 'paid' ? 'Pagado' : 'Pendiente'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-900">
                          <Eye size={16} />
                        </button>
                        <button className="text-green-600 hover:text-green-900">
                          <CreditCard size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )

  const renderPayments = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Pagos</h2>
        <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
          <Plus size={16} className="inline mr-2" />
          Nuevo Pago
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contrato
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Monto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Método
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Recibo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                    No se encontraron pagos
                  </td>
                </tr>
              ) : (
                payments.map((payment) => (
                  <tr key={payment.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {payment.client_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {payment.contract_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(payment.payment_amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(payment.payment_date).toLocaleDateString('es-ES')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {payment.payment_method}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {payment.receipt_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-900">
                          <Eye size={16} />
                        </button>
                        <button className="text-green-600 hover:text-green-900">
                          <FileText size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )

  const renderContent = () => {
    switch (activeModule) {
      case 'dashboard':
        return renderDashboard()
      case 'clients':
        return renderClients()
      case 'payments':
        return renderPayments()
      default:
        return renderDashboard()
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:translate-x-0`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">Panel Cobranzas</h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>
        
        <nav className="mt-6">
          <div className="px-3 space-y-1">
            <button
              onClick={() => setActiveModule('dashboard')}
              className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                activeModule === 'dashboard'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <TrendingUp size={20} className="mr-3" />
              Dashboard
            </button>
            <button
              onClick={() => setActiveModule('clients')}
              className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                activeModule === 'clients'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Users size={20} className="mr-3" />
              Clientes
            </button>
            <button
              onClick={() => setActiveModule('payments')}
              className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                activeModule === 'payments'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <CreditCard size={20} className="mr-3" />
              Pagos
            </button>
          </div>
        </nav>
        
        <div className="absolute bottom-0 w-full p-4 border-t border-gray-200">
          <button
            onClick={logout}
            className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-md"
          >
            <LogOut size={20} className="mr-3" />
            Cerrar Sesión
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white shadow">
          <div className="flex items-center justify-between h-16 px-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-gray-500 hover:text-gray-700"
            >
              <Menu size={24} />
            </button>
            <h1 className="text-xl font-bold text-gray-900">Panel Cobranzas</h1>
            <div></div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {renderContent()}
        </div>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}

export default CobranzasPanel
