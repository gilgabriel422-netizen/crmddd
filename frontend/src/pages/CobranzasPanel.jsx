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
  AlertCircle,
  History,
  Clock,
  Trash2
} from 'lucide-react'
import { clientService, paymentService, paymentAgreementService, clientManagementService, clientCollectionsCommentsService } from '../services/api'
import AddClientModal from '../components/AddClientModal'
import reportService from '../services/reportService'
import SessionWarning from '../components/SessionWarning'

const CobranzasPanel = () => {
  const { user, logout } = useAuth()
  const [activeModule, setActiveModule] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  
  // Estados para cada mÃ³dulo
  const [clients, setClients] = useState([])
  const [payments, setPayments] = useState([])
  const [paymentAgreements, setPaymentAgreements] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalClients, setTotalClients] = useState(0)
  
  // Estados para modales
  const [showClientDetails, setShowClientDetails] = useState(false)
  const [showAddClientModal, setShowAddClientModal] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showAgreementModal, setShowAgreementModal] = useState(false)
  const [showManagementModal, setShowManagementModal] = useState(false)
  const [showManagementHistoryModal, setShowManagementHistoryModal] = useState(false)
  const [selectedClient, setSelectedClient] = useState(null)
  const [selectedClientForPayment, setSelectedClientForPayment] = useState(null)
  const [selectedClientForAgreement, setSelectedClientForAgreement] = useState(null)
  const [selectedClientForManagement, setSelectedClientForManagement] = useState(null)
  const [selectedClientForHistory, setSelectedClientForHistory] = useState(null)
  const [clientPaymentAgreement, setClientPaymentAgreement] = useState(null)
  const [clientManagements, setClientManagements] = useState([])
  const [loadingManagements, setLoadingManagements] = useState(false)
  
  // Estados para mÃ³dulo de historial completo
  const [collectionsHistoryData, setCollectionsHistoryData] = useState(null)
  const [collectionsHistoryLoading, setCollectionsHistoryLoading] = useState(false)
  const [collectionsHistoryFilters, setCollectionsHistoryFilters] = useState({
    startDate: '',
    endDate: '',
    clientSearch: ''
  })
  const [showClientHistoryModal, setShowClientHistoryModal] = useState(false)
  const [clientHistoryData, setClientHistoryData] = useState(null)
  const [loadingClientHistory, setLoadingClientHistory] = useState(false)
  const [activeHistoryTab, setActiveHistoryTab] = useState('gestiones')
  
  // Estados para comentarios
  const [clientComments, setClientComments] = useState([])
  const [loadingComments, setLoadingComments] = useState(false)
  
  // Estados para pagos y convenios del cliente
  const [clientPayments, setClientPayments] = useState([])
  const [clientAgreements, setClientAgreements] = useState([])
  const [newComment, setNewComment] = useState('')
  
  // Estados para ver y eliminar pagos
  const [selectedPayment, setSelectedPayment] = useState(null)
  const [showPaymentDetails, setShowPaymentDetails] = useState(false)
  const [showDeletePaymentModal, setShowDeletePaymentModal] = useState(false)
  const [deletePassword, setDeletePassword] = useState('')
  const [deletePasswordError, setDeletePasswordError] = useState('')
  
  // Estados para ver y eliminar convenios
  const [selectedAgreement, setSelectedAgreement] = useState(null)
  const [showAgreementDetails, setShowAgreementDetails] = useState(false)
  const [showDeleteAgreementModal, setShowDeleteAgreementModal] = useState(false)
  const [deleteAgreementPassword, setDeleteAgreementPassword] = useState('')
  const [deleteAgreementPasswordError, setDeleteAgreementPasswordError] = useState('')
  
  // Estados para eliminar todos los convenios
  const [showDeleteAllAgreementsModal, setShowDeleteAllAgreementsModal] = useState(false)
  const [deleteAllAgreementsPassword, setDeleteAllAgreementsPassword] = useState('')
  const [deleteAllAgreementsPasswordError, setDeleteAllAgreementsPasswordError] = useState('')
  
  // Estados para editar fecha de vencimiento del pagarÃ©
  const [editingDueDate, setEditingDueDate] = useState(false)
  const [dueDateValue, setDueDateValue] = useState(null)
  const [savingDueDate, setSavingDueDate] = useState(false)
  
  // Estados para formularios
  const [paymentFormData, setPaymentFormData] = useState({
    client_id: '',
    payment_agreement_id: '',
    contract_number: '',
    payment_amount: '',
    payment_date: '',
    payment_method: '',
    installment_number: '',
    notes: ''
  })
  const [agreementFormData, setAgreementFormData] = useState({
    client_id: '',
    contract_number: '',
    total_amount: '',
    installment_count: '',
    installment_amount: '',
    start_date: '',
    end_date: '',
    notes: ''
  })
  const [managementFormData, setManagementFormData] = useState({
    client_id: '',
    contract_number: '',
    management_date: new Date().toISOString().split('T')[0],
    observation: ''
  })
  
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
  
  // Estados para notificaciones
  const [notifications, setNotifications] = useState({
    todayPayments: [],
    monthlyPayments: [],
    todayAgreements: [],
    monthlyAgreements: []
  })
  const [notificationsLoading, setNotificationsLoading] = useState(false)
  
  // Estados para resumen de pagos
  const [paymentsSummary, setPaymentsSummary] = useState({
    lastPeriod: {
      totalPayments: 0,
      collectedAmount: 0,
      pendingAmount: 0,
      collectionRate: 0
    },
    currentPeriod: {
      totalPending: 0,
      overdueAmount: 0,
      upcomingAmount: 0,
      agreementsPending: 0
    },
    totalOutstanding: {
      totalDebt: 0,
      overdueDebt: 0,
      currentDebt: 0
    }
  })
  const [paymentsSummaryLoading, setPaymentsSummaryLoading] = useState(false)
  const [periodSummary, setPeriodSummary] = useState({
    sales: { total_ventas: 0, total_monto: 0, ventas_pagadas: 0, monto_pagado: 0 },
    collections: { total_cobranzas: 0, total_monto: 0, cobranzas_pagadas: 0, monto_pagado: 0 }
  })

  // Limpiar estado cuando cambia de usuario
  useEffect(() => {
    setPeriodSummary({
      sales: { total_ventas: 0, total_monto: 0, ventas_pagadas: 0, monto_pagado: 0 },
      collections: { total_cobranzas: 0, total_monto: 0, cobranzas_pagadas: 0, monto_pagado: 0 }
    })
  }, [user?.id])

  // Resetear a pÃ¡gina 1 cuando cambia el tÃ©rmino de bÃºsqueda o el mÃ³dulo
  useEffect(() => {
    if (activeModule === 'clients') {
      setCurrentPage(1)
    }
  }, [searchTerm, activeModule])

  // Cargar datos segÃºn el mÃ³dulo activo
  useEffect(() => {
    if (activeModule === 'dashboard') {
      loadDashboardData()
      loadNotifications()
      loadPaymentsSummary()
    } else if (activeModule === 'clients') {
      loadClients()
    } else if (activeModule === 'payments') {
      loadPayments()
    } else if (activeModule === 'agreements') {
      loadAgreements()
    } else if (activeModule === 'history') {
      loadCollectionsHistory()
    }
  }, [activeModule, currentPage, searchTerm, dashboardPeriod])

  const loadClients = async () => {
    try {
      setLoading(true)
      // Cargar todos los clientes para filtrar los que estÃ¡n en cobranzas
      const response = await clientService.getClients({ 
        limit: 1000, 
        search: searchTerm 
      })
      
      // Filtrar solo clientes en cobranzas
      let allCollectionClients = response.clients?.filter(client => 
        client.in_collections === 'Si' || client.in_collections === 'true'
      ) || []
      
      // Aplicar paginaciÃ³n manual
      const clientsPerPage = 20
      const startIndex = (currentPage - 1) * clientsPerPage
      const endIndex = startIndex + clientsPerPage
      const paginatedClients = allCollectionClients.slice(startIndex, endIndex)
      
      setClients(paginatedClients)
      setTotalClients(allCollectionClients.length)
      setTotalPages(Math.max(1, Math.ceil(allCollectionClients.length / clientsPerPage)))
      
    } catch (error) {
      console.error('Error loading clients:', error)
      setClients([])
      setTotalClients(0)
      setTotalPages(1)
    } finally {
      setLoading(false)
    }
  }

  // Cargar clientes en cobranzas con paginaciÃ³n
  const loadUnpaidClients = async (page = 1, search = '') => {
    try {
      setLoading(true)
      // Obtener todos los clientes para filtrar los de cobranzas
      const response = await clientService.getClients({ limit: 1000 })
      const allCollectionClients = response.clients?.filter(client => client.in_collections === 'Si') || []
      
      // Aplicar bÃºsqueda si existe
      let filteredClients = allCollectionClients
      if (search) {
        const searchLower = search.toLowerCase().trim()
        filteredClients = allCollectionClients.filter(client => {
          const contractNumber = client.contract_number?.toLowerCase() || ''
          const lastFourDigits = contractNumber.length >= 4 ? contractNumber.slice(-4) : ''
          return (
            client.first_name?.toLowerCase().includes(searchLower) ||
            client.last_name?.toLowerCase().includes(searchLower) ||
            client.email?.toLowerCase().includes(searchLower) ||
            contractNumber.includes(searchLower) ||
            lastFourDigits === searchLower
          )
        })
      }
      
      // Implementar paginaciÃ³n manual
      const clientsPerPage = 20
      const startIndex = (page - 1) * clientsPerPage
      const endIndex = startIndex + clientsPerPage
      const paginatedClients = filteredClients.slice(startIndex, endIndex)
      
      setClients(paginatedClients)
      setTotalPages(Math.ceil(filteredClients.length / clientsPerPage))
      setCurrentPage(page)
      
    } catch (error) {
      console.error('Error loading unpaid clients:', error)
    } finally {
      setLoading(false)
    }
  }

  // Cargar pagos
  const loadPayments = async () => {
    try {
      setLoading(true)
      const response = await paymentService.getPayments({
        page: currentPage,
        limit: 20,
        search: searchTerm
      })
      setPayments(response.payments || [])
    } catch (error) {
      console.error('Error loading payments:', error)
      setPayments([])
    } finally {
      setLoading(false)
    }
  }
  
  const loadAgreements = async () => {
    try {
      setLoading(true)
      // Resetear a pÃ¡gina 1 si hay un tÃ©rmino de bÃºsqueda
      const pageToLoad = searchTerm ? 1 : currentPage
      console.log('Cargando convenios con parÃ¡metros:', { page: pageToLoad, limit: 20, search: searchTerm })
      const response = await paymentAgreementService.getPaymentAgreements({
        page: pageToLoad,
        limit: 20,
        search: searchTerm || ''
      })
      console.log('Respuesta de convenios:', response)
      console.log('Convenios recibidos:', response.agreements)
      console.log('Cantidad de convenios:', response.agreements?.length || 0)
      const agreements = response.agreements || []
      console.log('Convenios a mostrar:', agreements)
      setPaymentAgreements(agreements)
      if (response.pagination) {
        setTotalPages(response.pagination.totalPages || 1)
      }
    } catch (error) {
      console.error('Error loading agreements:', error)
      setPaymentAgreements([])
    } finally {
      setLoading(false)
    }
  }

  // Cargar convenios de pago
  const loadPaymentAgreements = async () => {
    try {
      setLoading(true)
      // Simular carga de convenios - aquÃ­ deberÃ­as usar el servicio real
      setPaymentAgreements([])
    } catch (error) {
      console.error('Error loading payment agreements:', error)
    } finally {
      setLoading(false)
    }
  }

  // Cargar payment agreement del cliente
  const loadClientPaymentAgreement = async (clientId) => {
    try {
      const response = await paymentAgreementService.getPaymentAgreementsByClient(clientId)
      if (response.agreements && response.agreements.length > 0) {
        // Obtener el convenio mÃ¡s reciente (ya viene ordenado por created_at DESC)
        const agreement = response.agreements[0]
        setClientPaymentAgreement(agreement)
        // Si hay una fecha de vencimiento, inicializar el valor del editor
        if (agreement.due_date && !dueDateValue) {
          setDueDateValue(new Date(agreement.due_date).toISOString().split('T')[0])
        }
      } else {
        setClientPaymentAgreement(null)
      }
    } catch (error) {
      // Silenciosamente ignorar error de agreement (endpoint puede no existir en mock)
      setClientPaymentAgreement(null)
    }
  }

  // Funciones de manejo de pagos y convenios
  const handleViewClient = async (client) => {
    try {
      // Cargar datos completos del cliente desde el backend
      const clientResponse = await clientService.getClient(client.id)
      setSelectedClient(clientResponse.client || client)
    } catch (error) {
      console.error('Error loading client details:', error)
      // Si falla, usar los datos del cliente de la lista
      setSelectedClient(client)
    }
    setShowClientDetails(true)
    // Cargar payment agreement del cliente
    await loadClientPaymentAgreement(client.id)
    // Cargar comentarios del cliente
    await loadClientComments(client.id)
    // Cargar pagos del cliente
    await loadClientPayments(client.id)
    // Cargar convenios del cliente
    await loadClientAgreements(client.id)
  }
  
  // Cargar pagos del cliente
  const loadClientPayments = async (clientId) => {
    try {
      console.log('🔄 CARGANDO PAGOS PARA CLIENTE:', clientId);
      const response = await paymentService.getPaymentsByClient(clientId);
      console.log('📨 RESPUESTA DEL BACKEND:', JSON.stringify(response, null, 2));
      console.log('🎯 PAGOS RECIBIDOS:', response.payments);
      setClientPayments(response.payments || []);
    } catch (error) {
      console.error('Error loading client payments:', error);
      setClientPayments([]);
    }
  }
  
  // Cargar convenios del cliente
  const loadClientAgreements = async (clientId) => {
    try {
      const response = await paymentAgreementService.getPaymentAgreementsByClient(clientId)
      setClientAgreements(response.agreements || [])
    } catch (error) {
      console.error('Error loading client agreements:', error)
      setClientAgreements([])
    }
  }
  
  // Cargar comentarios del cliente
  const loadClientComments = async (clientId) => {
    try {
      setLoadingComments(true)
      const response = await clientCollectionsCommentsService.getClientComments(clientId)
      setClientComments(response.comments || [])
    } catch (error) {
      console.error('Error loading client comments:', error)
      setClientComments([])
    } finally {
      setLoadingComments(false)
    }
  }
  
  // Guardar comentario del cliente
  const handleSaveComment = async () => {
    if (!newComment.trim() || !selectedClient) {
      alert('Por favor, ingresa un comentario')
      return
    }
    
    try {
      setLoadingComments(true)
      await clientCollectionsCommentsService.createClientComment({
        client_id: selectedClient.id,
        comment: newComment.trim()
      })
      
      // Recargar comentarios
      await loadClientComments(selectedClient.id)
      
      // Limpiar el campo
      setNewComment('')
      
      alert('Comentario guardado exitosamente')
    } catch (error) {
      console.error('Error saving comment:', error)
      alert('Error al guardar el comentario: ' + (error.response?.data?.error || error.message))
    } finally {
      setLoadingComments(false)
    }
  }

  // Guardar fecha de vencimiento del pagarÃ©
  const handleSaveDueDate = async () => {
    if (!dueDateValue || !clientPaymentAgreement) {
      alert('Por favor, selecciona una fecha')
      return
    }
    
    try {
      setSavingDueDate(true)
      await paymentAgreementService.updatePaymentAgreementDueDate(clientPaymentAgreement.id, {
        due_date: dueDateValue
      })
      
      // Recargar el convenio de pago
      await loadClientPaymentAgreement(selectedClient.id)
      
      // Cerrar el editor
      setEditingDueDate(false)
      setDueDateValue(null)
      
      alert('Fecha de vencimiento guardada exitosamente')
    } catch (error) {
      console.error('Error saving due date:', error)
      alert('Error al guardar la fecha de vencimiento: ' + (error.response?.data?.error || error.message))
    } finally {
      setSavingDueDate(false)
    }
  }


  const handleAddPayment = (client) => {
    setSelectedClientForPayment(client)
    setPaymentFormData({
      client_id: client.id,
      client_name: `${client.first_name} ${client.last_name}`,
      contract_number: client.contract_number,
      payment_amount: '',
      payment_date: new Date().toISOString().split('T')[0],
      payment_method: '',
      installment_number: '',
      notes: ''
    })
    setShowPaymentModal(true)
  }

  const handleAddAgreement = (client) => {
    setSelectedClientForAgreement(client)
    setAgreementFormData({
      client_id: client.id,
      contract_number: client.contract_number,
      total_amount: client.total_amount || '',
      installment_count: '',
      installment_amount: '',
      start_date: new Date().toISOString().split('T')[0],
      end_date: '',
      notes: ''
    })
    setShowAgreementModal(true)
  }

  // FunciÃ³n para manejar el botÃ³n unificado de pago/convenio/gestiÃ³n
  const handlePaymentAction = (client, action) => {
    if (action === 'payment') {
      handleAddPayment(client)
    } else if (action === 'agreement') {
      handleAddAgreement(client)
    } else if (action === 'management') {
      handleAddManagement(client)
    }
  }

  // FunciÃ³n para abrir modal de gestiÃ³n
  const handleAddManagement = (client) => {
    setSelectedClientForManagement(client)
    setManagementFormData({
      client_id: client.id,
      contract_number: client.contract_number,
      management_date: new Date().toISOString().split('T')[0],
      observation: ''
    })
    setShowManagementModal(true)
  }

  // FunciÃ³n para guardar gestiÃ³n
  const handleSaveManagement = async () => {
    try {
      if (!managementFormData.observation || managementFormData.observation.trim() === '') {
        alert('Por favor, ingresa una observaciÃ³n')
        return
      }
      
      setLoading(true)
      await clientManagementService.createClientManagement(managementFormData)
      alert('GestiÃ³n registrada exitosamente')
      setShowManagementModal(false)
      setSelectedClientForManagement(null)
      setManagementFormData({
        client_id: '',
        contract_number: '',
        management_date: new Date().toISOString().split('T')[0],
        observation: ''
      })
      // Recargar clientes si estamos en la vista de clientes
      if (activeModule === 'clientes') {
        await loadClients()
      }
    } catch (error) {
      console.error('Error saving management:', error)
      alert('Error al guardar la gestiÃ³n: ' + (error.response?.data?.error || error.message))
    } finally {
      setLoading(false)
    }
  }
  
  // FunciÃ³n para guardar pago
  const handleSavePayment = async () => {
    try {
      if (!paymentFormData.client_id || !paymentFormData.payment_amount || 
          !paymentFormData.payment_date || !paymentFormData.payment_method) {
        alert('Por favor, completa todos los campos requeridos (Cliente, Monto, Fecha y MÃ©todo de Pago)')
        return
      }
      
      setLoading(true)
      const paymentData = {
        ...paymentFormData,
        client_id: parseInt(paymentFormData.client_id),
        payment_amount: parseFloat(paymentFormData.payment_amount),
        installment_number: paymentFormData.installment_number ? parseInt(paymentFormData.installment_number) : null,
        booking_id: null
      }
      
      console.log('📤 DATOS QUE ENVIA EL FRONTEND:', paymentData)
      console.log('   - client_id (tipo:' + typeof(paymentData.client_id) + '):', paymentData.client_id)
      console.log('   - client_name:', paymentData.client_name)
      console.log('   - amount:', paymentData.payment_amount)
      console.log('   - method:', paymentData.payment_method)
      
      await paymentService.createPayment(paymentData)
      alert('Pago registrado exitosamente')
      
      // Usar siempre client_id del formulario que SABEMOS está correcto
      const clientIdToLoad = parseInt(paymentFormData.client_id)
      
      if (clientIdToLoad) {
        console.log('✅ CARGANDO PAGOS PARA CLIENTE:', clientIdToLoad)
        await loadClientPayments(clientIdToLoad)
        await loadClientPaymentAgreement(clientIdToLoad)
        await loadClients()
      }
      
      setShowPaymentModal(false)
      setSelectedClientForPayment(null)
      setPaymentFormData({
        client_id: '',
        client_name: '',
        contract_number: '',
        payment_amount: '',
        payment_date: new Date().toISOString().split('T')[0],
        payment_method: '',
        installment_number: '',
        notes: ''
      })
    } catch (error) {
      console.error('Error saving payment:', error)
      alert('Error al guardar el pago: ' + (error.response?.data?.error || error.message))
    } finally {
      setLoading(false)
    }
  }
  
  // FunciÃ³n para ver detalles de un pago
  const handleViewPayment = (payment) => {
    setSelectedPayment(payment)
    setShowPaymentDetails(true)
  }

  // FunciÃ³n para ver detalles de un convenio
  const handleViewAgreement = (agreement) => {
    setSelectedAgreement(agreement)
    setShowAgreementDetails(true)
  }
  
  // FunciÃ³n para abrir modal de eliminaciÃ³n de pago
  const handleDeletePaymentClick = (payment) => {
    setSelectedPayment(payment)
    setShowDeletePaymentModal(true)
    setDeletePassword('')
    setDeletePasswordError('')
  }
  
  // FunciÃ³n para confirmar eliminaciÃ³n de pago
  const handleConfirmDeletePayment = async () => {
    if (!deletePassword) {
      setDeletePasswordError('Por favor, ingresa la contraseÃ±a')
      return
    }
    
    if (deletePassword !== 'admin2025') {
      setDeletePasswordError('ContraseÃ±a incorrecta')
      return
    }
    
    try {
      setLoading(true)
      await paymentService.deletePayment(selectedPayment.id, { password: deletePassword })
      alert('Pago eliminado exitosamente')
      setShowDeletePaymentModal(false)
      setSelectedPayment(null)
      setDeletePassword('')
      setDeletePasswordError('')
      // Recargar pagos
      await loadPayments()
    } catch (error) {
      console.error('Error deleting payment:', error)
      setDeletePasswordError(error.response?.data?.error || 'Error al eliminar el pago')
    } finally {
      setLoading(false)
    }
  }

  // FunciÃ³n para abrir modal de eliminaciÃ³n de convenio
  const handleDeleteAgreementClick = (agreement) => {
    setSelectedAgreement(agreement)
    setShowDeleteAgreementModal(true)
    setDeleteAgreementPassword('')
    setDeleteAgreementPasswordError('')
  }
  
  // FunciÃ³n para confirmar eliminaciÃ³n de convenio
  const handleConfirmDeleteAgreement = async () => {
    if (!deleteAgreementPassword) {
      setDeleteAgreementPasswordError('Por favor, ingresa la contraseÃ±a')
      return
    }
    
    if (deleteAgreementPassword !== 'admin2025') {
      setDeleteAgreementPasswordError('ContraseÃ±a incorrecta')
      return
    }
    
    try {
      setLoading(true)
      await paymentAgreementService.deletePaymentAgreement(selectedAgreement.id, { password: deleteAgreementPassword })
      alert('Convenio eliminado exitosamente')
      setShowDeleteAgreementModal(false)
      setSelectedAgreement(null)
      setDeleteAgreementPassword('')
      setDeleteAgreementPasswordError('')
      // Recargar convenios
      if (activeModule === 'agreements') {
        await loadAgreements()
      }
    } catch (error) {
      console.error('Error deleting agreement:', error)
      setDeleteAgreementPasswordError(error.response?.data?.error || 'Error al eliminar el convenio')
    } finally {
      setLoading(false)
    }
  }

  // FunciÃ³n para abrir modal de eliminaciÃ³n de todos los convenios
  const handleDeleteAllAgreementsClick = () => {
    setShowDeleteAllAgreementsModal(true)
    setDeleteAllAgreementsPassword('')
    setDeleteAllAgreementsPasswordError('')
  }

  // FunciÃ³n para confirmar eliminaciÃ³n de todos los convenios
  const handleConfirmDeleteAllAgreements = async () => {
    if (!deleteAllAgreementsPassword) {
      setDeleteAllAgreementsPasswordError('Por favor, ingresa la contraseÃ±a')
      return
    }
    
    if (deleteAllAgreementsPassword !== 'admin2025') {
      setDeleteAllAgreementsPasswordError('ContraseÃ±a incorrecta')
      return
    }
    
    try {
      setLoading(true)
      const response = await paymentAgreementService.deleteAllPaymentAgreements({ password: deleteAllAgreementsPassword })
      alert(response.message || 'Todos los convenios eliminados exitosamente')
      setShowDeleteAllAgreementsModal(false)
      setDeleteAllAgreementsPassword('')
      setDeleteAllAgreementsPasswordError('')
      // Recargar convenios
      if (activeModule === 'agreements') {
        await loadAgreements()
      }
    } catch (error) {
      console.error('Error deleting all agreements:', error)
      setDeleteAllAgreementsPasswordError(error.response?.data?.error || 'Error al eliminar todos los convenios')
    } finally {
      setLoading(false)
    }
  }
  
  // FunciÃ³n para guardar convenio
  const handleSaveAgreement = async () => {
    try {
      if (!agreementFormData.total_amount || !agreementFormData.installment_count) {
        alert('Por favor, completa todos los campos requeridos')
        return
      }
      
      setLoading(true)
      const agreementData = {
        ...agreementFormData,
        total_amount: parseFloat(agreementFormData.total_amount),
        installment_count: parseInt(agreementFormData.installment_count),
        installment_amount: parseFloat(agreementFormData.installment_amount),
        remaining_amount: parseFloat(agreementFormData.total_amount) // Al crear, el remaining es igual al total
      }
      
      await paymentAgreementService.createPaymentAgreement(agreementData)
      alert('Convenio creado exitosamente')
      
      // Recargar datos del cliente si el modal de detalles estÃ¡ abierto
      if (selectedClient) {
        await loadClientAgreements(selectedClient.id)
        await loadClientPaymentAgreement(selectedClient.id)
        await loadClients()
      }
      
      // Recargar lista de convenios si estamos en el mÃ³dulo de convenios
      if (activeModule === 'agreements') {
        await loadAgreements()
      }
      
      setShowAgreementModal(false)
      setSelectedClientForAgreement(null)
      setAgreementFormData({
        client_id: '',
        contract_number: '',
        total_amount: '',
        installment_count: '',
        installment_amount: '',
        start_date: new Date().toISOString().split('T')[0],
        end_date: '',
        notes: ''
      })
    } catch (error) {
      console.error('Error saving agreement:', error)
      alert('Error al guardar el convenio: ' + (error.response?.data?.error || error.message))
    } finally {
      setLoading(false)
    }
  }

  // Cargar historial completo de cobranzas
  const loadCollectionsHistory = async () => {
    try {
      setCollectionsHistoryLoading(true)
      const data = await reportService.getCollectionsFullReport()
      setCollectionsHistoryData(data)
    } catch (error) {
      console.error('Error cargando historial completo:', error)
      setCollectionsHistoryData(null)
    } finally {
      setCollectionsHistoryLoading(false)
    }
  }

  // Cargar historial completo de un cliente especÃ­fico
  const loadClientHistory = async (clientId, startDate = null, endDate = null) => {
    try {
      setLoadingClientHistory(true)
      const data = await reportService.getClientCollectionsHistory(clientId, startDate, endDate)
      setClientHistoryData(data)
    } catch (error) {
      console.error('Error cargando historial del cliente:', error)
      setClientHistoryData(null)
    } finally {
      setLoadingClientHistory(false)
    }
  }

  // FunciÃ³n para buscar gestiones por rango de fechas
  const handleSearchManagementsByDate = () => {
    if (!collectionsHistoryFilters.startDate || !collectionsHistoryFilters.endDate) {
      return
    }

    // Si hay un cliente seleccionado en el modal, buscar sus gestiones por fecha
    if (selectedClientForHistory && showClientHistoryModal) {
      loadClientHistory(
        selectedClientForHistory.id,
        collectionsHistoryFilters.startDate,
        collectionsHistoryFilters.endDate
      )
    }
    // El filtro se aplica automÃ¡ticamente en el renderizado gracias al estado de collectionsHistoryFilters
    // React re-renderizarÃ¡ automÃ¡ticamente cuando cambien los filtros
  }

  // FunciÃ³n para ver historial completo de un cliente
  const handleViewClientHistory = async (client) => {
    setSelectedClientForHistory(client)
    setShowClientHistoryModal(true)
    // Si hay fechas en los filtros, usarlas para cargar el historial
    const startDate = collectionsHistoryFilters.startDate || null
    const endDate = collectionsHistoryFilters.endDate || null
    await loadClientHistory(client.id, startDate, endDate)
  }

  // FunciÃ³n para ver historial de gestiones (ahora incluye pagos y convenios)
  const handleViewManagementHistory = async (client) => {
    setSelectedClientForHistory(client)
    setShowManagementHistoryModal(true)
    setLoadingManagements(true)
    
    try {
      // Cargar gestiones, pagos y convenios
      const [managementsResponse, historyResponse] = await Promise.all([
        clientManagementService.getClientManagementsByClient(client.id),
        reportService.getClientCollectionsHistory(client.id)
      ])
      setClientManagements(managementsResponse.managements || [])
      setClientHistoryData(historyResponse)
    } catch (error) {
      console.error('Error loading management history:', error)
      setClientManagements([])
      setClientHistoryData(null)
      alert('Error al cargar el historial: ' + (error.response?.data?.error || error.message))
    } finally {
      setLoadingManagements(false)
    }
  }

  // FunciÃ³n para manejar cambios en el formulario de convenio
  const handleAgreementFormChange = (field, value) => {
    setAgreementFormData(prev => {
      const newData = { ...prev, [field]: value }
      
      // Calcular monto por cuota automÃ¡ticamente
      if (field === 'total_amount' || field === 'installment_count') {
        const total = parseFloat(newData.total_amount) || 0
        const count = parseInt(newData.installment_count) || 0
        if (total > 0 && count > 0) {
          newData.installment_amount = (total / count).toFixed(2)
        }
      }
      
      // Calcular fecha de fin automÃ¡ticamente (cuotas mensuales)
      if (field === 'start_date' || field === 'installment_count') {
        const startDate = newData.start_date
        const installmentCount = parseInt(newData.installment_count) || 0
        
        if (startDate && installmentCount > 0) {
          const start = new Date(startDate)
          // Agregar el nÃºmero de cuotas en meses
          start.setMonth(start.getMonth() + installmentCount)
          newData.end_date = start.toISOString().split('T')[0]
        }
      }
      
      return newData
    })
  }

  // FunciÃ³n para cargar resumen de pagos
  const loadPaymentsSummary = async () => {
    try {
      setPaymentsSummaryLoading(true)
      
      const token = localStorage.getItem('authToken')
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
      
      const currentDate = new Date()
      const lastMonth = currentDate.getMonth() === 0 ? 11 : currentDate.getMonth() - 1
      const lastYear = currentDate.getMonth() === 0 ? currentDate.getFullYear() - 1 : currentDate.getFullYear()
      const currentMonth = currentDate.getMonth() + 1
      const currentYear = currentDate.getFullYear()
      
      // Calcular fechas para el Ãºltimo mes
      const lastMonthStart = new Date(lastYear, lastMonth, 1).toISOString().split('T')[0]
      const lastMonthEnd = new Date(lastYear, lastMonth + 1, 0).toISOString().split('T')[0]
      
      // Calcular fechas para el mes actual
      const currentMonthStart = new Date(currentYear, currentMonth - 1, 1).toISOString().split('T')[0]
      const currentMonthEnd = new Date(currentYear, currentMonth, 0).toISOString().split('T')[0]
      
      // Resumen del Ãºltimo perÃ­odo (mes pasado) - usar endpoint de payments con start_date y end_date
      let lastPeriodData = {
        totalPayments: 0,
        collectedAmount: 0,
        pendingAmount: 0,
        collectionRate: 0
      }
      try {
        const lastPeriodResponse = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/payments?start_date=${lastMonthStart}&end_date=${lastMonthEnd}&limit=1000`, { headers })
        if (lastPeriodResponse.ok) {
          const contentType = lastPeriodResponse.headers.get('content-type')
          if (contentType && contentType.includes('application/json')) {
            const data = await lastPeriodResponse.json()
            const payments = data.payments || []
            const totalCollected = payments.reduce((sum, p) => sum + parseFloat(p.payment_amount || 0), 0)
            lastPeriodData = {
              totalPayments: payments.length,
              collectedAmount: totalCollected,
              pendingAmount: 0,
              collectionRate: 0
            }
          }
        }
      } catch (error) {
        console.error('Error cargando Ãºltimo perÃ­odo:', error)
      }
      
      // Resumen del perÃ­odo actual
      let currentPeriodData = {
        totalPending: 0,
        overdueAmount: 0,
        upcomingAmount: 0,
        agreementsPending: 0
      }
      try {
        const currentPeriodResponse = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/payments?start_date=${currentMonthStart}&end_date=${currentMonthEnd}&limit=1000`, { headers })
        if (currentPeriodResponse.ok) {
          const contentType = currentPeriodResponse.headers.get('content-type')
          if (contentType && contentType.includes('application/json')) {
            const data = await currentPeriodResponse.json()
            const payments = data.payments || []
            currentPeriodData = {
              totalPending: payments.length,
              overdueAmount: 0,
              upcomingAmount: 0,
              agreementsPending: 0
            }
          }
        }
      } catch (error) {
        console.error('Error cargando perÃ­odo actual:', error)
      }
      
      // Resumen total de deudas pendientes - usar endpoint de payment-agreements
      let totalOutstandingData = {
        totalDebt: 0,
        overdueDebt: 0,
        currentDebt: 0
      }
      try {
        const totalOutstandingResponse = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/payment-agreements?limit=1000`, { headers })
        if (totalOutstandingResponse.ok) {
          const contentType = totalOutstandingResponse.headers.get('content-type')
          if (contentType && contentType.includes('application/json')) {
            const data = await totalOutstandingResponse.json()
            const agreements = data.agreements || []
            const totalDebt = agreements.reduce((sum, a) => sum + parseFloat(a.remaining_amount || 0), 0)
            totalOutstandingData = {
              totalDebt,
              overdueDebt: 0,
              currentDebt: totalDebt
            }
          }
        }
      } catch (error) {
        console.error('Error cargando deudas pendientes:', error)
      }
      
      setPaymentsSummary({
        lastPeriod: lastPeriodData,
        currentPeriod: currentPeriodData,
        totalOutstanding: totalOutstandingData
      })
    } catch (error) {
      console.error('Error cargando resumen de pagos:', error)
    } finally {
      setPaymentsSummaryLoading(false)
    }
  }

  // FunciÃ³n para cargar notificaciones de cobranzas
  const loadNotifications = async () => {
    try {
      setNotificationsLoading(true)
      
      const today = new Date().toISOString().split('T')[0]
      const currentDate = new Date()
      const currentMonth = currentDate.getMonth() + 1
      const currentYear = currentDate.getFullYear()
      const monthStart = new Date(currentYear, currentMonth - 1, 1).toISOString().split('T')[0]
      const monthEnd = new Date(currentYear, currentMonth, 0).toISOString().split('T')[0]
      
      const apiUrl = import.meta.env.VITE_API_URL || '/api'
      const token = localStorage.getItem('authToken')
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
      
      // Cargar pagos del dÃ­a
      let todayPayments = []
      try {
        const todayPaymentsResponse = await fetch(`${apiUrl}/payments?date=${today}`, { headers })
        if (todayPaymentsResponse.ok) {
          const contentType = todayPaymentsResponse.headers.get('content-type')
          if (contentType && contentType.includes('application/json')) {
            const data = await todayPaymentsResponse.json()
            todayPayments = data.payments || []
          }
        }
      } catch (error) {
        console.error('Error cargando pagos del dÃ­a:', error)
      }
      
      // Cargar pagos del mes
      let monthlyPayments = []
      try {
        const monthlyPaymentsResponse = await fetch(`${apiUrl}/payments?start_date=${monthStart}&end_date=${monthEnd}&limit=1000`, { headers })
        if (monthlyPaymentsResponse.ok) {
          const contentType = monthlyPaymentsResponse.headers.get('content-type')
          if (contentType && contentType.includes('application/json')) {
            const data = await monthlyPaymentsResponse.json()
            monthlyPayments = data.payments || []
          }
        }
      } catch (error) {
        console.error('Error cargando pagos del mes:', error)
      }
      
      // Cargar convenios del dÃ­a (filtrar por fecha de inicio)
      let todayAgreements = []
      try {
        const todayAgreementsResponse = await fetch(`${apiUrl}/payment-agreements?limit=1000`, { headers })
        if (todayAgreementsResponse.ok) {
          const contentType = todayAgreementsResponse.headers.get('content-type')
          if (contentType && contentType.includes('application/json')) {
            const data = await todayAgreementsResponse.json()
            const allAgreements = data.agreements || []
            todayAgreements = allAgreements.filter(a => a.start_date === today)
          }
        }
      } catch (error) {
        console.error('Error cargando convenios del dÃ­a:', error)
      }
      
      // Cargar convenios del mes (filtrar por rango de fechas)
      let monthlyAgreements = []
      try {
        const monthlyAgreementsResponse = await fetch(`${apiUrl}/payment-agreements?limit=1000`, { headers })
        if (monthlyAgreementsResponse.ok) {
          const contentType = monthlyAgreementsResponse.headers.get('content-type')
          if (contentType && contentType.includes('application/json')) {
            const data = await monthlyAgreementsResponse.json()
            const allAgreements = data.agreements || []
            monthlyAgreements = allAgreements.filter(a => {
              const startDate = a.start_date
              return startDate >= monthStart && startDate <= monthEnd
            })
          }
        }
      } catch (error) {
        console.error('Error cargando convenios del mes:', error)
      }
      
      setNotifications({
        todayPayments,
        monthlyPayments,
        todayAgreements,
        monthlyAgreements
      })
    } catch (error) {
      console.error('Error cargando notificaciones:', error)
    } finally {
      setNotificationsLoading(false)
    }
  }

  // Funciones para dashboard de cobranzas
  const loadDashboardData = async () => {
    try {
      setDashboardLoading(true)
      
      // Cargar estadÃ­sticas generales de clientes
      const clientsResponse = await clientService.getClientStats()
      const stats = clientsResponse.stats
      
      // Cargar datos del perÃ­odo seleccionado
      const periodData = await reportService.getCobranzasDashboard(dashboardPeriod)
      setPeriodSummary(periodData)
      
      // Calcular mÃ©tricas especÃ­ficas de cobranzas
      const totalClients = parseInt(stats.total_clients) || 0
      const unpaidClients = parseInt(stats.unpaid_clients) || 0
      const totalRevenue = parseFloat(stats.total_revenue) || 0
      const paidClients = parseInt(stats.paid_clients) || 0
      
      // Usar datos del endpoint especÃ­fico de cobranzas
      const totalSales = parseFloat(periodData.sales?.total_monto) || 0
      const collectedAmount = parseFloat(periodData.sales?.monto_pagado) || 0
      const totalCollections = parseFloat(periodData.collections?.total_monto_cobranzas) || 0
      const collectedCollections = parseFloat(periodData.collections?.monto_cobranzas_pagado) || 0
      
      const collectionRate = totalClients > 0 ? (paidClients / totalClients) * 100 : 0
      const pendingAmount = totalSales - collectedAmount
      
      setDashboardData({
        totalClients,
        unpaidClients,
        totalDebt: totalRevenue,
        collectedAmount,
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
      {/* Selector de perÃ­odo */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Dashboard de Cobranzas</h2>
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">PerÃ­odo:</label>
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

      {/* Notificaciones de Cobranzas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Notificaciones del DÃ­a */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
              Pagos de HOY
            </h3>
            <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              {notifications.todayPayments.length + notifications.todayAgreements.length}
            </span>
          </div>
          
          {notificationsLoading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.todayPayments.length === 0 && notifications.todayAgreements.length === 0 ? (
                <p className="text-gray-500 text-sm">No hay pagos programados para hoy</p>
              ) : (
                <>
                  {notifications.todayPayments.map((payment, index) => (
                    <div key={`payment-${index}`} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{payment.client_name || `${payment.first_name || ''} ${payment.last_name || ''}`.trim() || 'Cliente sin nombre'}</p>
                        <p className="text-sm text-gray-600">
                          Pago: ${(payment.amount || payment.payment_amount || 0).toFixed(2)}
                        </p>
                        {payment.payment_date && (
                          <p className="text-xs text-gray-500">
                            {new Date(payment.payment_date).toLocaleDateString('es-ES')}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {notifications.todayAgreements.map((agreement, index) => (
                    <div key={`agreement-${index}`} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{agreement.client_name}</p>
                        <p className="text-sm text-gray-600">Convenio: ${agreement.installment_amount}</p>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
        </div>

        {/* Notificaciones del Mes - Pagos y Convenios lado a lado */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pagos de ESTE MES */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                Pagos de ESTE MES
              </h3>
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                {notifications.monthlyPayments.length}
              </span>
            </div>
            
            {notificationsLoading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {notifications.monthlyPayments.length === 0 ? (
                  <p className="text-gray-500 text-sm">No hay pagos programados para este mes</p>
                ) : (
                  notifications.monthlyPayments.map((payment, index) => (
                    <div key={`monthly-payment-${index}`} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{payment.client_name || `${payment.first_name || ''} ${payment.last_name || ''}`.trim() || 'Cliente sin nombre'}</p>
                        <p className="text-sm text-gray-600">
                          Pago: ${(payment.amount || payment.payment_amount || 0).toFixed(2)}
                        </p>
                        {(payment.due_date || payment.payment_date) && (
                          <p className="text-xs text-gray-500">
                            {new Date(payment.due_date || payment.payment_date).toLocaleDateString('es-ES')}
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Convenios este mes */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <span className="w-3 h-3 bg-purple-500 rounded-full mr-2"></span>
                Convenios este mes
              </h3>
              <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                {notifications.monthlyAgreements.length}
              </span>
            </div>
            
            {notificationsLoading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
              </div>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {notifications.monthlyAgreements.length === 0 ? (
                  <p className="text-gray-500 text-sm">No hay convenios programados para este mes</p>
                ) : (
                  notifications.monthlyAgreements.map((agreement, index) => (
                    <div key={`monthly-agreement-${index}`} className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{agreement.client_name}</p>
                        <p className="text-sm text-gray-600">Convenio: ${agreement.installment_amount}</p>
                        <p className="text-xs text-gray-500">{new Date(agreement.start_date).toLocaleDateString('es-ES')}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Resumen de Pagos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Resumen del Ãšltimo PerÃ­odo */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
              Ãšltimo PerÃ­odo
            </h3>
            <span className="text-sm text-gray-500">
              {new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
            </span>
          </div>
          
          {paymentsSummaryLoading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Pagos:</span>
                <span className="font-semibold text-gray-900">{paymentsSummary.lastPeriod.totalPayments}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Recaudado:</span>
                <span className="font-semibold text-green-600">${paymentsSummary.lastPeriod.collectedAmount?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Pendiente:</span>
                <span className="font-semibold text-red-600">${paymentsSummary.lastPeriod.pendingAmount?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="flex justify-between items-center border-t pt-2">
                <span className="text-sm text-gray-600">Tasa de Cobranza:</span>
                <span className="font-semibold text-blue-600">{paymentsSummary.lastPeriod.collectionRate?.toFixed(1) || '0.0'}%</span>
              </div>
            </div>
          )}
        </div>

        {/* Resumen del PerÃ­odo Actual */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <span className="w-3 h-3 bg-orange-500 rounded-full mr-2"></span>
              PerÃ­odo Actual
            </h3>
            <span className="text-sm text-gray-500">
              {new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
            </span>
          </div>
          
          {paymentsSummaryLoading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Pendiente:</span>
                <span className="font-semibold text-gray-900">${paymentsSummary.currentPeriod.totalPending?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Vencido:</span>
                <span className="font-semibold text-red-600">${paymentsSummary.currentPeriod.overdueAmount?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Por Vencer:</span>
                <span className="font-semibold text-yellow-600">${paymentsSummary.currentPeriod.upcomingAmount?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="flex justify-between items-center border-t pt-2">
                <span className="text-sm text-gray-600">Convenios Pendientes:</span>
                <span className="font-semibold text-purple-600">{paymentsSummary.currentPeriod.agreementsPending || 0}</span>
              </div>
            </div>
          )}
        </div>

        {/* Resumen Total de Deudas */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
              Total Pendiente
            </h3>
            <span className="text-sm text-gray-500">General</span>
          </div>
          
          {paymentsSummaryLoading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Deuda Total:</span>
                <span className="font-semibold text-gray-900">${paymentsSummary.totalOutstanding.totalDebt?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Deuda Vencida:</span>
                <span className="font-semibold text-red-600">${paymentsSummary.totalOutstanding.overdueDebt?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Deuda Actual:</span>
                <span className="font-semibold text-blue-600">${paymentsSummary.totalOutstanding.currentDebt?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="flex justify-between items-center border-t pt-2">
                <span className="text-sm text-gray-600">% Vencida:</span>
                <span className="font-semibold text-red-600">
                  {paymentsSummary.totalOutstanding.totalDebt > 0 
                    ? ((paymentsSummary.totalOutstanding.overdueDebt / paymentsSummary.totalOutstanding.totalDebt) * 100).toFixed(1)
                    : '0.0'
                  }%
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MÃ©tricas principales */}
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

      {/* Detalles del perÃ­odo */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Ventas del PerÃ­odo</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Ventas:</span>
              <span className="font-semibold text-blue-600">
                {dashboardLoading ? '...' : periodSummary?.sales?.total_ventas ?? 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Monto Total:</span>
              <span className="font-semibold text-blue-600">
                {dashboardLoading ? '...' : formatCurrency(periodSummary?.sales?.total_monto ?? 0)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Ventas Pagadas:</span>
              <span className="font-semibold text-green-600">
                {dashboardLoading ? '...' : periodSummary?.sales?.ventas_pagadas ?? 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Monto Pagado:</span>
              <span className="font-semibold text-green-600">
                {dashboardLoading ? '...' : formatCurrency(periodSummary?.sales?.monto_pagado ?? 0)}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Cobranzas del PerÃ­odo</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Cobranzas:</span>
              <span className="font-semibold text-orange-600">
                {dashboardLoading ? '...' : periodSummary?.collections?.total_cobranzas ?? 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Monto Total:</span>
              <span className="font-semibold text-orange-600">
                {dashboardLoading ? '...' : formatCurrency(periodSummary?.collections?.total_monto ?? 0)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Cobranzas Pagadas:</span>
              <span className="font-semibold text-green-600">
                {dashboardLoading ? '...' : periodSummary?.collections?.cobranzas_pagadas ?? 0}
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
        <h3 className="text-xl font-bold mb-4">ðŸ“Š Resumen Ejecutivo de Cobranzas</h3>
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
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Clientes</h2>
          {!loading && totalClients > 0 && (
            <p className="text-sm text-gray-600 mt-1">
              Total: <span className="font-semibold">{totalClients}</span> clientes en cobranzas
              {totalPages > 1 && (
                <> â€¢ PÃ¡gina <span className="font-semibold">{currentPage}</span> de <span className="font-semibold">{totalPages}</span></>
              )}
            </p>
          )}
        </div>
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
            <button
              onClick={() => setShowAddClientModal(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
            >
              <Plus size={16} />
              Nuevo Cliente
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
                      {formatCurrency(client.pending_amount || client.agreement_remaining_amount || client.total_amount || 0)}
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
                        <button 
                          onClick={() => handleViewClient(client)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Ver detalles"
                        >
                          <Eye size={16} />
                        </button>
                        <button 
                          onClick={() => handleViewManagementHistory(client)}
                          className="text-purple-600 hover:text-purple-900"
                          title="Ver historial de gestiones"
                        >
                          <History size={16} />
                        </button>
                        <div className="relative">
                          <select
                            onChange={(e) => handlePaymentAction(client, e.target.value)}
                            className="text-orange-600 hover:text-orange-900 bg-transparent border-none cursor-pointer"
                            defaultValue=""
                          >
                            <option value="" disabled>Acciones</option>
                            <option value="payment">Agregar Pago</option>
                            <option value="agreement">Agregar Convenio</option>
                            <option value="management">Agregar GestiÃ³n</option>
                          </select>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Controles de paginaciÃ³n */}
        {!loading && totalClients > 0 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => {
                  if (currentPage > 1) {
                    setCurrentPage(currentPage - 1)
                  }
                }}
                disabled={currentPage === 1}
                className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                  currentPage === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Anterior
              </button>
              <button
                onClick={() => {
                  if (currentPage < totalPages) {
                    setCurrentPage(currentPage + 1)
                  }
                }}
                disabled={currentPage === totalPages}
                className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                  currentPage === totalPages
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Siguiente
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Mostrando <span className="font-medium">{((currentPage - 1) * 20) + 1}</span> - <span className="font-medium">{Math.min(currentPage * 20, totalClients)}</span> de{' '}
                  <span className="font-medium">{totalClients}</span> clientes
                  {totalPages > 1 && (
                    <> (PÃ¡gina <span className="font-medium">{currentPage}</span> de <span className="font-medium">{totalPages}</span>)</>
                  )}
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => {
                      if (currentPage > 1) {
                        setCurrentPage(currentPage - 1)
                      }
                    }}
                    disabled={currentPage === 1}
                    className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                      currentPage === 1
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <span className="sr-only">Anterior</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                  
                  {/* NÃºmeros de pÃ¡gina */}
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          currentPage === pageNum
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => {
                      if (currentPage < totalPages) {
                        setCurrentPage(currentPage + 1)
                      }
                    }}
                    disabled={currentPage === totalPages}
                    className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                      currentPage === totalPages
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <span className="sr-only">Siguiente</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )

  const renderPayments = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Pagos</h2>
        <button 
          onClick={() => {
            setShowPaymentModal(true)
            setSelectedClientForPayment(null)
            setPaymentFormData({
              client_id: '',
              contract_number: '',
              payment_amount: '',
              payment_date: new Date().toISOString().split('T')[0],
              payment_method: '',
              installment_number: '',
              notes: ''
            })
          }}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
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
                  MÃ©todo
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
                        <button 
                          onClick={() => handleViewPayment(payment)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Ver detalles"
                        >
                          <Eye size={16} />
                        </button>
                        <button 
                          onClick={() => handleDeletePaymentClick(payment)}
                          className="text-red-600 hover:text-red-900"
                          title="Eliminar pago"
                        >
                          <Trash2 size={16} />
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

  const renderAgreements = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Convenios de Pago</h2>
        <div className="flex gap-2">
          <button 
            onClick={handleDeleteAllAgreementsClick}
            className="hidden px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center"
          >
            <Trash2 size={16} className="inline mr-2" />
            Eliminar Todos
          </button>
          <button 
            onClick={() => {
              setActiveModule('clients')
              alert('Por favor selecciona un cliente de la lista y usa la opcion "Agregar Convenio" desde el menu de acciones')
            }}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Plus size={16} className="inline mr-2" />
            Nuevo Convenio
          </button>
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
                  Pendiente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cuotas
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha Inicio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-6 py-4 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                  </td>
                </tr>
              ) : paymentAgreements.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                    No se encontraron convenios (Total: {paymentAgreements.length})
                  </td>
                </tr>
              ) : (
                paymentAgreements.map((agreement) => {
                  console.log('Renderizando convenio:', agreement)
                  return (
                  <tr key={agreement.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {agreement.client_name || `${agreement.first_name || ''} ${agreement.last_name || ''}`.trim() || 'Cliente sin nombre'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {agreement.contract_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(agreement.total_amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(agreement.remaining_amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {agreement.installment_count}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        agreement.status === 'active' ? 'bg-green-100 text-green-800' :
                        agreement.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {agreement.status === 'active' ? 'Activo' :
                         agreement.status === 'completed' ? 'Completado' :
                         'Cancelado'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {agreement.start_date ? new Date(agreement.start_date).toLocaleDateString('es-ES') : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleViewAgreement(agreement)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Ver detalles"
                        >
                          <Eye size={16} />
                        </button>
                        <button 
                          onClick={() => handleDeleteAgreementClick(agreement)}
                          className="text-red-600 hover:text-red-900"
                          title="Eliminar convenio"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )

  const renderHistory = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Historial Completo de Cobranzas</h2>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Inicio</label>
            <input
              type="date"
              value={collectionsHistoryFilters.startDate}
              onChange={(e) => setCollectionsHistoryFilters({...collectionsHistoryFilters, startDate: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Fin</label>
            <input
              type="date"
              value={collectionsHistoryFilters.endDate}
              onChange={(e) => setCollectionsHistoryFilters({...collectionsHistoryFilters, endDate: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Buscar Cliente</label>
            <input
              type="text"
              value={collectionsHistoryFilters.clientSearch}
              onChange={(e) => setCollectionsHistoryFilters({...collectionsHistoryFilters, clientSearch: e.target.value})}
              placeholder="Nombre, email o contrato..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={handleSearchManagementsByDate}
              disabled={!collectionsHistoryFilters.startDate || !collectionsHistoryFilters.endDate}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Search size={16} />
              Buscar Gestiones
            </button>
          </div>
        </div>
      </div>

      {/* Lista de clientes con historial */}
      {collectionsHistoryLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Cargando historial...</span>
        </div>
      ) : collectionsHistoryData && collectionsHistoryData.report ? (
        <div className="space-y-4">
          {/* Mensaje cuando hay filtro de fechas activo */}
          {collectionsHistoryFilters.startDate && collectionsHistoryFilters.endDate && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-blue-800">
                <strong>Filtro de fechas activo:</strong> Las gestiones se mostrarÃ¡n filtradas entre{' '}
                {new Date(collectionsHistoryFilters.startDate).toLocaleDateString('es-ES')} y{' '}
                {new Date(collectionsHistoryFilters.endDate).toLocaleDateString('es-ES')} cuando veas el historial de cada cliente.
              </p>
            </div>
          )}
          
          {collectionsHistoryData.report
            .filter(clientData => {
              // Filtro por bÃºsqueda de cliente
              if (collectionsHistoryFilters.clientSearch) {
                const search = collectionsHistoryFilters.clientSearch.toLowerCase()
                const matchesSearch = (
                  clientData.client.first_name?.toLowerCase().includes(search) ||
                  clientData.client.last_name?.toLowerCase().includes(search) ||
                  clientData.client.email?.toLowerCase().includes(search) ||
                  clientData.client.contract_number?.toLowerCase().includes(search)
                )
                if (!matchesSearch) return false
              }
              
              // Si hay filtro de fechas, mostrar solo clientes que tienen gestiones en ese rango
              if (collectionsHistoryFilters.startDate && collectionsHistoryFilters.endDate) {
                // Obtener la lista de gestiones del cliente
                const managementsList = clientData.managements?.list || []
                
                // Si no tiene gestiones, no mostrar
                if (!managementsList || managementsList.length === 0) {
                  return false
                }
                
                // Crear fechas de comparaciÃ³n (copias para no modificar las originales)
                const startDate = new Date(collectionsHistoryFilters.startDate)
                startDate.setHours(0, 0, 0, 0) // Iniciar desde el inicio del dÃ­a
                
                const endDate = new Date(collectionsHistoryFilters.endDate)
                endDate.setHours(23, 59, 59, 999) // Incluir todo el dÃ­a final
                
                // Verificar si el cliente tiene gestiones en el rango de fechas
                const hasManagementsInRange = managementsList.some(m => {
                  if (!m || !m.management_date) return false
                  
                  try {
                    const managementDate = new Date(m.management_date)
                    managementDate.setHours(0, 0, 0, 0) // Normalizar a inicio del dÃ­a
                    return managementDate >= startDate && managementDate <= endDate
                  } catch (error) {
                    console.error('Error procesando fecha de gestiÃ³n:', error, m)
                    return false
                  }
                })
                
                // Solo mostrar clientes que tienen gestiones en el rango de fechas
                return hasManagementsInRange
              }
              
              return true
            })
            .map((clientData) => (
              <div key={clientData.client.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {clientData.client.first_name} {clientData.client.last_name}
                    </h3>
                    <p className="text-sm text-gray-600">Contrato: {clientData.client.contract_number}</p>
                    <p className="text-sm text-gray-600">Email: {clientData.client.email}</p>
                  </div>
                  <button
                    onClick={() => handleViewClientHistory(clientData.client)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                  >
                    <Eye size={16} />
                    Ver Historial
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Gestiones:</span>
                    <span className="ml-2 font-semibold">{clientData.managements.total}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Convenios:</span>
                    <span className="ml-2 font-semibold">{clientData.agreements.total}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Pagos:</span>
                    <span className="ml-2 font-semibold">{clientData.payments_summary.total_payments}</span>
                  </div>
                </div>
              </div>
            ))}
        </div>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <p className="text-gray-500 text-center py-4">No se encontraron datos de historial</p>
        </div>
      )}
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
      case 'agreements':
        return renderAgreements()
      case 'history':
        return renderHistory()
      default:
        return renderDashboard()
    }
  }


  // Función para agregar nuevo cliente
  const handleAddClient = async () => {
    if (!newClientFormData.first_name || !newClientFormData.last_name || !newClientFormData.email || !newClientFormData.contract_number) {
      alert('Por favor, completa todos los campos requeridos')
      return
    }

    try {
      setLoading(true)
      const response = await clientService.createClient({
        first_name: newClientFormData.first_name,
        last_name: newClientFormData.last_name,
        email: newClientFormData.email,
        phone: newClientFormData.phone || '',
        contract_number: newClientFormData.contract_number,
        status: newClientFormData.status || 'activo'
      })

      console.log('Cliente creado:', response.data)
      alert('✅ Cliente creado exitosamente')
      setShowAddClientModal(false)
      setNewClientFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        contract_number: '',
        status: 'activo'
      })
      
      // Recargar la lista de clientes
      setCurrentPage(1)
      await loadClients()
    } catch (err) {
      console.error('Error al crear cliente:', err)
      alert('Error: ' + (err.response?.data?.error || err.message))
    } finally {
      setLoading(false)
    }
  }
  return (
    <div className="min-h-screen bg-gray-100">
      <SessionWarning />
      
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
            <button
              onClick={() => setActiveModule('agreements')}
              className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                activeModule === 'agreements'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <FileText size={20} className="mr-3" />
              Convenios
            </button>
            <button
              onClick={() => setActiveModule('history')}
              className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                activeModule === 'history'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <History size={20} className="mr-3" />
              Historial Completo
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

      {/* Modales */}
    {/* Modal de detalles del cliente */}
    {showClientDetails && selectedClient && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-900">Detalles del Cliente</h3>
            <button
              onClick={() => setShowClientDetails(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nombre Completo</label>
              <p className="mt-1 text-sm text-gray-900">{selectedClient.first_name} {selectedClient.last_name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <p className="mt-1 text-sm text-gray-900">{selectedClient.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">TelÃ©fono</label>
              <p className="mt-1 text-sm text-gray-900">{selectedClient.phone || 'No especificado'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">CÃ©dula</label>
              <p className="mt-1 text-sm text-gray-900">{selectedClient.identification || 'No especificado'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Contrato</label>
              <p className="mt-1 text-sm text-gray-900">{selectedClient.contract_number}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Total de Venta</label>
              <p className="mt-1 text-sm text-gray-900">{formatCurrency(selectedClient.total_amount || 0)}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Valor Pendiente</label>
              <p className="mt-1 text-sm font-semibold text-red-600">
                {formatCurrency(selectedClient.agreement_remaining_amount || selectedClient.pending_amount || 0)}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Estado de Pago</label>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                selectedClient.payment_status === 'paid' ? 'bg-green-100 text-green-800' :
                selectedClient.payment_status === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {selectedClient.payment_status === 'paid' ? 'Pagado' :
                 selectedClient.payment_status === 'partial' ? 'Pago Parcial' : 'Pendiente'}
              </span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">En Cobranzas</label>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                selectedClient.in_collections === 'Si' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
              }`}>
                {selectedClient.in_collections === 'Si' ? 'SÃ­' : 'No'}
              </span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">AÃ±os de DuraciÃ³n del Contrato</label>
              <p className="mt-1 text-sm text-gray-900">{selectedClient.years ? `${selectedClient.years} aÃ±os` : 'No especificado'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Fecha de Vencimiento del PagarÃ©</label>
              {clientPaymentAgreement && clientPaymentAgreement.due_date ? (
                <div className="flex items-center gap-2">
                  <p className="mt-1 text-sm font-semibold text-orange-600">
                    {new Date(clientPaymentAgreement.due_date).toLocaleDateString('es-ES')}
                  </p>
                  <button
                    onClick={() => setEditingDueDate(true)}
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    Editar
                  </button>
                </div>
              ) : (
                <div className="mt-1">
                  <button
                    onClick={() => setEditingDueDate(true)}
                    className="text-sm text-blue-600 hover:text-blue-800 underline"
                  >
                    Agregar fecha de vencimiento
                  </button>
                </div>
              )}
              {editingDueDate && (
                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="date"
                    value={dueDateValue || (clientPaymentAgreement?.due_date ? new Date(clientPaymentAgreement.due_date).toISOString().split('T')[0] : '')}
                    onChange={(e) => setDueDateValue(e.target.value)}
                    className="px-2 py-1 text-sm border border-gray-300 rounded"
                  />
                  <button
                    onClick={handleSaveDueDate}
                    disabled={!dueDateValue || savingDueDate}
                    className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
                  >
                    {savingDueDate ? 'Guardando...' : 'Guardar'}
                  </button>
                  <button
                    onClick={() => {
                      setEditingDueDate(false)
                      setDueDateValue(null)
                    }}
                    className="px-3 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                  >
                    Cancelar
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* SecciÃ³n de Pagos */}
          <div className="mt-6 border-t border-gray-200 pt-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Pagos Registrados</h4>
            {clientPayments.length > 0 ? (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {clientPayments.map((payment) => (
                  <div key={payment.id} className="bg-green-50 rounded-lg p-3 border border-green-200">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {formatCurrency(payment.amount || payment.payment_amount || 0)}
                        </p>
                        <p className="text-xs text-gray-600">
                          {payment.method || payment.payment_method || 'N/A'} - {new Date(payment.date || payment.payment_date || payment.created_at).toLocaleDateString('es-ES')}
                        </p>
                        {payment.installment_number && (
                          <p className="text-xs text-gray-500">Cuota #{payment.installment_number}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No hay pagos registrados</p>
            )}
          </div>

          {/* SecciÃ³n de Convenios */}
          <div className="mt-6 border-t border-gray-200 pt-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Convenios de Pago</h4>
            {clientAgreements.length > 0 ? (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {clientAgreements.map((agreement) => (
                  <div key={agreement.id} className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Total: {formatCurrency(agreement.total_amount || 0)}
                        </p>
                        <p className="text-xs text-gray-600">
                          {agreement.installment_count} cuotas de {formatCurrency(agreement.installment_amount || 0)}
                        </p>
                        <p className="text-xs text-gray-500">
                          Pendiente: {formatCurrency(agreement.remaining_amount || 0)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {agreement.start_date && new Date(agreement.start_date).toLocaleDateString('es-ES')} - 
                          {agreement.end_date && new Date(agreement.end_date).toLocaleDateString('es-ES')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No hay convenios registrados</p>
            )}
          </div>

          {/* SecciÃ³n de Comentarios */}
          <div className="mt-6 border-t border-gray-200 pt-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Comentarios de Cobranzas</h4>
            
            {/* Lista de comentarios */}
            {loadingComments ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              </div>
            ) : clientComments.length > 0 ? (
              <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
                {clientComments.map((comment) => (
                  <div key={comment.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{comment.comment}</p>
                    </div>
                    <div className="text-xs text-gray-500">
                      {comment.created_by_first_name && comment.created_by_last_name
                        ? `${comment.created_by_first_name} ${comment.created_by_last_name}`
                        : comment.created_by_email || 'Sistema'}
                      {' - '}
                      {new Date(comment.created_at).toLocaleString('es-ES')}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 mb-4">No hay comentarios registrados</p>
            )}

            {/* Formulario para nuevo comentario */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Agregar Comentario</label>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
                placeholder="Escribe un comentario sobre este cliente..."
              />
              <button
                onClick={handleSaveComment}
                disabled={!newComment.trim() || loadingComments}
                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Guardar Comentario
              </button>
            </div>
          </div>
        </div>
      </div>
    )}

    {/* Modal de agregar pago */}
    {showPaymentModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Agregar Pago {selectedClientForPayment ? `- ${selectedClientForPayment.first_name} ${selectedClientForPayment.last_name}` : ''}
          </h3>

          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cliente</label>
              <select
                value={paymentFormData.client_id}
                onChange={(e) => {
                  const selectedClient = clients.find(c => c.id === parseInt(e.target.value))
                  setPaymentFormData({
                    ...paymentFormData,
                    client_id: e.target.value,
                    client_name: selectedClient ? `${selectedClient.first_name} ${selectedClient.last_name}` : ''
                  })
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleccionar cliente...</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>
                    {client.first_name} {client.last_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Monto del Pago</label>
              <input
                type="number"
                step="0.01"
                value={paymentFormData.payment_amount}
                onChange={(e) => setPaymentFormData({...paymentFormData, payment_amount: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Fecha del Pago</label>
              <input
                type="date"
                value={paymentFormData.payment_date}
                onChange={(e) => setPaymentFormData({...paymentFormData, payment_date: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">MÃ©todo de Pago</label>
              <select
                value={paymentFormData.payment_method}
                onChange={(e) => setPaymentFormData({...paymentFormData, payment_method: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleccionar...</option>
                <option value="Transferencia">Transferencia</option>
                <option value="Efectivo">Efectivo</option>
                <option value="Tarjeta">Tarjeta</option>
                <option value="Cheque">Cheque</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">NÃºmero de Cuota</label>
              <input
                type="number"
                value={paymentFormData.installment_number}
                onChange={(e) => setPaymentFormData({...paymentFormData, installment_number: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Notas</label>
              <textarea
                value={paymentFormData.notes}
                onChange={(e) => setPaymentFormData({...paymentFormData, notes: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
                placeholder="Notas adicionales..."
              />
            </div>
          </form>
          
          <div className="flex justify-end gap-4 mt-6">
            <button
              onClick={() => setShowPaymentModal(false)}
              className="px-4 py-2 text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              Cancelar
            </button>
            <button
              onClick={handleSavePayment}
              disabled={loading || !paymentFormData.payment_amount || !paymentFormData.payment_method}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Guardando...' : 'Registrar Pago'}
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Modal de agregar convenio */}
    {showAgreementModal && selectedClientForAgreement && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Agregar Convenio - {selectedClientForAgreement.first_name} {selectedClientForAgreement.last_name}
          </h3>
          
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Total del Convenio</label>
              <input
                type="number"
                step="0.01"
                value={agreementFormData.total_amount}
                onChange={(e) => handleAgreementFormChange('total_amount', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">NÃºmero de Cuotas</label>
              <input
                type="number"
                value={agreementFormData.installment_count}
                onChange={(e) => handleAgreementFormChange('installment_count', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Monto por Cuota (calculado automÃ¡ticamente)</label>
              <input
                type="number"
                step="0.01"
                value={agreementFormData.installment_amount}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                placeholder="Se calcula automÃ¡ticamente"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de Inicio</label>
              <input
                type="date"
                value={agreementFormData.start_date}
                onChange={(e) => handleAgreementFormChange('start_date', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de Fin (calculada automÃ¡ticamente)</label>
              <input
                type="date"
                value={agreementFormData.end_date}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                placeholder="Se calcula automÃ¡ticamente"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Notas</label>
              <textarea
                value={agreementFormData.notes}
                onChange={(e) => setAgreementFormData({...agreementFormData, notes: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
                placeholder="Notas adicionales..."
              />
            </div>
          </form>
          
          <div className="flex justify-end gap-4 mt-6">
            <button
              onClick={() => setShowAgreementModal(false)}
              className="px-4 py-2 text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              Cancelar
            </button>
            <button
              onClick={handleSaveAgreement}
              disabled={loading || !agreementFormData.total_amount || !agreementFormData.installment_count}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Guardando...' : 'Crear Convenio'}
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Modal de agregar gestiÃ³n */}
    {showManagementModal && selectedClientForManagement && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Agregar GestiÃ³n - {selectedClientForManagement.first_name} {selectedClientForManagement.last_name}
          </h3>
          
          <form className="space-y-4">
            {/* InformaciÃ³n del cliente (readonly) */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">InformaciÃ³n del Cliente</h4>
              <div className="text-sm space-y-1">
                <div><span className="font-medium">Nombre:</span> {selectedClientForManagement.first_name} {selectedClientForManagement.last_name}</div>
                <div><span className="font-medium">Contrato:</span> {selectedClientForManagement.contract_number}</div>
              </div>
            </div>
            
            {/* Fecha de gestiÃ³n */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de GestiÃ³n</label>
              <input
                type="date"
                value={managementFormData.management_date}
                onChange={(e) => setManagementFormData({...managementFormData, management_date: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            {/* ObservaciÃ³n */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">ObservaciÃ³n *</label>
              <textarea
                value={managementFormData.observation}
                onChange={(e) => setManagementFormData({...managementFormData, observation: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="4"
                placeholder="Describe la gestiÃ³n realizada..."
                required
              />
            </div>
          </form>
          
          <div className="flex justify-end gap-4 mt-6">
            <button
              onClick={() => {
                setShowManagementModal(false)
                setSelectedClientForManagement(null)
              }}
              className="px-4 py-2 text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              Cancelar
            </button>
            <button
              onClick={handleSaveManagement}
              disabled={!managementFormData.observation || managementFormData.observation.trim() === '' || loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Guardando...' : 'Guardar GestiÃ³n'}
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Modal de historial de gestiones */}
    {showManagementHistoryModal && selectedClientForHistory && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                Historial Completo
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {selectedClientForHistory.first_name} {selectedClientForHistory.last_name} - 
                Contrato: {selectedClientForHistory.contract_number}
              </p>
            </div>
            <button
              onClick={() => {
                setShowManagementHistoryModal(false)
                setSelectedClientForHistory(null)
                setClientManagements([])
                setClientHistoryData(null)
                setActiveHistoryTab('gestiones')
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 mb-4">
            <button
              onClick={() => setActiveHistoryTab('gestiones')}
              className={`px-4 py-2 font-medium text-sm ${
                activeHistoryTab === 'gestiones'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Gestiones ({clientManagements.length})
            </button>
            <button
              onClick={() => setActiveHistoryTab('pagos')}
              className={`px-4 py-2 font-medium text-sm ${
                activeHistoryTab === 'pagos'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Pagos ({clientHistoryData?.summary?.total_payments || 0})
            </button>
            <button
              onClick={() => setActiveHistoryTab('convenios')}
              className={`px-4 py-2 font-medium text-sm ${
                activeHistoryTab === 'convenios'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Convenios ({clientHistoryData?.summary?.total_agreements || 0})
            </button>
          </div>

          {loadingManagements ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Cargando historial...</span>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Tab de Gestiones */}
              {activeHistoryTab === 'gestiones' && (
                <>
                  {clientManagements.length === 0 ? (
                    <div className="text-center py-12">
                      <History className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 text-lg">No hay gestiones registradas</p>
                    </div>
                  ) : (
                    <>
                      {clientManagements.length > 0 && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                          <div className="flex items-center gap-2">
                            <Clock className="h-5 w-5 text-blue-600" />
                            <div>
                              <p className="text-sm font-medium text-blue-900">Ãšltima GestiÃ³n</p>
                              <p className="text-sm text-blue-700">
                                {new Date(clientManagements[0].management_date).toLocaleDateString('es-ES', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                                {clientManagements[0].created_by_name && (
                                  <span> - Por: {clientManagements[0].created_by_name}</span>
                                )}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                      <div className="space-y-3">
                        {clientManagements.map((management, index) => (
                          <div key={management.id || index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex items-center gap-2">
                                <div className="bg-purple-100 rounded-full p-2">
                                  <History className="h-4 w-4 text-purple-600" />
                                </div>
                                <div>
                                  <p className="font-semibold text-gray-900">GestiÃ³n #{clientManagements.length - index}</p>
                                  <p className="text-sm text-gray-600">
                                    {new Date(management.management_date).toLocaleDateString('es-ES', {
                                      year: 'numeric',
                                      month: 'long',
                                      day: 'numeric'
                                    })}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                {management.created_by_name && (
                                  <p className="text-xs text-gray-500">Por: {management.created_by_name}</p>
                                )}
                                <p className="text-xs text-gray-400">
                                  {new Date(management.created_at).toLocaleString('es-ES')}
                                </p>
                              </div>
                            </div>
                            <div className="mt-3 pt-3 border-t border-gray-200">
                              <p className="text-sm text-gray-700 whitespace-pre-wrap">{management.observation || 'Sin observaciones'}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </>
              )}

              {/* Tab de Pagos */}
              {activeHistoryTab === 'pagos' && (
                <>
                  {clientHistoryData?.history?.filter(h => h.type === 'payment').length === 0 ? (
                    <div className="text-center py-12">
                      <CreditCard className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 text-lg">No hay pagos registrados</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {clientHistoryData?.history?.filter(h => h.type === 'payment').map((payment, index) => (
                        <div key={payment.id || index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                              <div className="bg-green-100 rounded-full p-2">
                                <CreditCard className="h-4 w-4 text-green-600" />
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">Pago #{index + 1}</p>
                                <p className="text-sm text-gray-600">
                                  {new Date(payment.payment_date).toLocaleDateString('es-ES')}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-green-600">{formatCurrency(payment.payment_amount)}</p>
                              {payment.created_by_name && (
                                <p className="text-xs text-gray-500">Por: {payment.created_by_name}</p>
                              )}
                            </div>
                          </div>
                          <div className="mt-3 pt-3 border-t border-gray-200 grid grid-cols-2 gap-2 text-sm">
                            <div><span className="font-medium">MÃ©todo:</span> {payment.payment_method || 'N/A'}</div>
                            <div><span className="font-medium">Recibo:</span> {payment.receipt_number || 'N/A'}</div>
                            {payment.installment_number && (
                              <div><span className="font-medium">Cuota #:</span> {payment.installment_number}</div>
                            )}
                            {payment.notes && (
                              <div className="col-span-2"><span className="font-medium">Notas:</span> {payment.notes}</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {/* Tab de Convenios */}
              {activeHistoryTab === 'convenios' && (
                <>
                  {clientHistoryData?.history?.filter(h => h.type === 'agreement').length === 0 ? (
                    <div className="text-center py-12">
                      <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 text-lg">No hay convenios registrados</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {clientHistoryData?.history?.filter(h => h.type === 'agreement').map((agreement, index) => (
                        <div key={agreement.id || index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                              <div className="bg-orange-100 rounded-full p-2">
                                <FileText className="h-4 w-4 text-orange-600" />
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">Convenio #{index + 1}</p>
                                <p className="text-sm text-gray-600">Contrato: {agreement.contract_number}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-orange-600">{formatCurrency(agreement.total_amount)}</p>
                              {agreement.created_by_name && (
                                <p className="text-xs text-gray-500">Por: {agreement.created_by_name}</p>
                              )}
                            </div>
                          </div>
                          <div className="mt-3 pt-3 border-t border-gray-200 grid grid-cols-2 gap-2 text-sm">
                            <div><span className="font-medium">Cuotas:</span> {agreement.installment_count}</div>
                            <div><span className="font-medium">Valor Cuota:</span> {formatCurrency(agreement.installment_amount)}</div>
                            <div><span className="font-medium">Pagado:</span> {formatCurrency(agreement.total_paid || 0)}</div>
                            <div><span className="font-medium">Pendiente:</span> {formatCurrency(agreement.remaining_amount)}</div>
                            {agreement.due_date && (
                              <div className="col-span-2">
                                <span className="font-medium">Vencimiento:</span> {new Date(agreement.due_date).toLocaleDateString('es-ES')}
                              </div>
                            )}
                            {agreement.notes && (
                              <div className="col-span-2"><span className="font-medium">Notas:</span> {agreement.notes}</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          <div className="flex justify-end mt-6">
            <button
              onClick={() => {
                setShowManagementHistoryModal(false)
                setSelectedClientForHistory(null)
                setClientManagements([])
                setClientHistoryData(null)
                setActiveHistoryTab('gestiones')
              }}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Modal de historial completo de cliente (desde mÃ³dulo historial) */}
    {showClientHistoryModal && selectedClientForHistory && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Historial Completo</h3>
              <p className="text-sm text-gray-600 mt-1">
                {selectedClientForHistory.first_name} {selectedClientForHistory.last_name} - 
                Contrato: {selectedClientForHistory.contract_number}
              </p>
            </div>
            <button
              onClick={() => {
                setShowClientHistoryModal(false)
                setSelectedClientForHistory(null)
                setClientHistoryData(null)
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Filtros de fecha para buscar gestiones */}
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Buscar gestiones por rango de fechas</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Inicio</label>
                <input
                  type="date"
                  value={collectionsHistoryFilters.startDate}
                  onChange={(e) => setCollectionsHistoryFilters({...collectionsHistoryFilters, startDate: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Fin</label>
                <input
                  type="date"
                  value={collectionsHistoryFilters.endDate}
                  onChange={(e) => setCollectionsHistoryFilters({...collectionsHistoryFilters, endDate: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-end gap-2">
                <button
                  onClick={handleSearchManagementsByDate}
                  disabled={!collectionsHistoryFilters.startDate || !collectionsHistoryFilters.endDate}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Search size={16} />
                  Buscar Gestiones
                </button>
                <button
                  onClick={async () => {
                    setCollectionsHistoryFilters({...collectionsHistoryFilters, startDate: '', endDate: ''})
                    if (selectedClientForHistory) {
                      await loadClientHistory(selectedClientForHistory.id)
                    }
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  title="Limpiar filtros"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          </div>

          {loadingClientHistory ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Cargando historial...</span>
            </div>
          ) : clientHistoryData ? (
            <div className="space-y-4">
              {/* Mensaje cuando hay filtros de fecha activos */}
              {collectionsHistoryFilters.startDate && collectionsHistoryFilters.endDate && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                  <p className="text-sm text-blue-800">
                    <strong>Filtro activo:</strong> Mostrando gestiones entre{' '}
                    {new Date(collectionsHistoryFilters.startDate).toLocaleDateString('es-ES')} y{' '}
                    {new Date(collectionsHistoryFilters.endDate).toLocaleDateString('es-ES')}
                  </p>
                </div>
              )}
              
              {clientHistoryData.history && clientHistoryData.history.length > 0 ? (
                clientHistoryData.history.map((item, index) => (
                  <div key={item.id || index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        {item.type === 'management' && (
                          <div className="bg-purple-100 rounded-full p-2">
                            <History className="h-4 w-4 text-purple-600" />
                          </div>
                        )}
                        {item.type === 'payment' && (
                          <div className="bg-green-100 rounded-full p-2">
                            <CreditCard className="h-4 w-4 text-green-600" />
                          </div>
                        )}
                        {item.type === 'agreement' && (
                          <div className="bg-orange-100 rounded-full p-2">
                            <FileText className="h-4 w-4 text-orange-600" />
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-gray-900">
                            {item.type === 'management' && 'GestiÃ³n'}
                            {item.type === 'payment' && `Pago - ${formatCurrency(item.payment_amount)}`}
                            {item.type === 'agreement' && `Convenio - ${formatCurrency(item.total_amount)}`}
                          </p>
                          <p className="text-sm text-gray-600">
                            {new Date(item.date).toLocaleDateString('es-ES', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                      {item.created_by_name && (
                        <p className="text-xs text-gray-500">Por: {item.created_by_name}</p>
                      )}
                    </div>
                    {item.type === 'management' && item.observation && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{item.observation}</p>
                      </div>
                    )}
                    {item.type === 'payment' && (
                      <div className="mt-3 pt-3 border-t border-gray-200 text-sm">
                        <p><span className="font-medium">MÃ©todo:</span> {item.payment_method || 'N/A'}</p>
                        <p><span className="font-medium">Recibo:</span> {item.receipt_number || 'N/A'}</p>
                      </div>
                    )}
                    {item.type === 'agreement' && (
                      <div className="mt-3 pt-3 border-t border-gray-200 text-sm">
                        <p><span className="font-medium">Cuotas:</span> {item.installment_count}</p>
                        <p><span className="font-medium">Valor Cuota:</span> {formatCurrency(item.installment_amount)}</p>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-12">No hay historial registrado</p>
              )}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-12">No se pudo cargar el historial</p>
          )}

          <div className="flex justify-end mt-6">
            <button
              onClick={() => {
                setShowClientHistoryModal(false)
                setSelectedClientForHistory(null)
                setClientHistoryData(null)
              }}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Modal de detalles del pago */}
    {showPaymentDetails && selectedPayment && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-900">Detalles del Pago</h3>
            <button
              onClick={() => {
                setShowPaymentDetails(false)
                setSelectedPayment(null)
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Cliente</label>
              <p className="mt-1 text-sm text-gray-900">{selectedPayment.client_name || `${selectedPayment.first_name || ''} ${selectedPayment.last_name || ''}`.trim() || 'N/A'}</p>
            </div>
            
            {selectedPayment.contract_number && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Contrato</label>
                <p className="mt-1 text-sm text-gray-900">{selectedPayment.contract_number}</p>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Monto</label>
              <p className="mt-1 text-sm text-gray-900 font-semibold">{formatCurrency(selectedPayment.payment_amount || selectedPayment.amount || 0)}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Fecha</label>
              <p className="mt-1 text-sm text-gray-900">
                {selectedPayment.payment_date ? new Date(selectedPayment.payment_date).toLocaleDateString('es-ES') : 'N/A'}
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">MÃ©todo de Pago</label>
              <p className="mt-1 text-sm text-gray-900">{selectedPayment.payment_method || 'N/A'}</p>
            </div>
            
            {selectedPayment.receipt_number && (
              <div>
                <label className="block text-sm font-medium text-gray-700">NÃºmero de Recibo</label>
                <p className="mt-1 text-sm text-gray-900">{selectedPayment.receipt_number}</p>
              </div>
            )}
            
            {selectedPayment.installment_number && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Cuota NÃºmero</label>
                <p className="mt-1 text-sm text-gray-900">#{selectedPayment.installment_number}</p>
              </div>
            )}
            
            {selectedPayment.notes && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Notas</label>
                <p className="mt-1 text-sm text-gray-900">{selectedPayment.notes}</p>
              </div>
            )}
          </div>
          
          <div className="flex justify-end mt-6">
            <button
              onClick={() => {
                setShowPaymentDetails(false)
                setSelectedPayment(null)
              }}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Modal de confirmaciÃ³n de eliminaciÃ³n de pago */}
    {showDeletePaymentModal && selectedPayment && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-900">Eliminar Pago</h3>
            <button
              onClick={() => {
                setShowDeletePaymentModal(false)
                setSelectedPayment(null)
                setDeletePassword('')
                setDeletePasswordError('')
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          <div className="space-y-4">
            <p className="text-sm text-gray-700">
              Â¿EstÃ¡s seguro de que deseas eliminar este pago?
            </p>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm font-medium text-gray-900">Cliente: {selectedPayment.client_name || `${selectedPayment.first_name || ''} ${selectedPayment.last_name || ''}`.trim() || 'N/A'}</p>
              <p className="text-sm text-gray-600">Monto: {formatCurrency(selectedPayment.payment_amount || selectedPayment.amount || 0)}</p>
              <p className="text-sm text-gray-600">Fecha: {selectedPayment.payment_date ? new Date(selectedPayment.payment_date).toLocaleDateString('es-ES') : 'N/A'}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ContraseÃ±a de confirmaciÃ³n
              </label>
              <input
                type="password"
                value={deletePassword}
                onChange={(e) => {
                  setDeletePassword(e.target.value)
                  setDeletePasswordError('')
                }}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                  deletePasswordError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                }`}
                placeholder="Ingresa la contraseÃ±a"
              />
              {deletePasswordError && (
                <p className="mt-1 text-sm text-red-600">{deletePasswordError}</p>
              )}
            </div>
          </div>
          
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={() => {
                setShowDeletePaymentModal(false)
                setSelectedPayment(null)
                setDeletePassword('')
                setDeletePasswordError('')
              }}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirmDeletePayment}
              disabled={loading}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Eliminando...' : 'Eliminar'}
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Modal de detalles del convenio */}
    {showAgreementDetails && selectedAgreement && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-900">Detalles del Convenio</h3>
            <button
              onClick={() => {
                setShowAgreementDetails(false)
                setSelectedAgreement(null)
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Cliente</label>
              <p className="mt-1 text-sm text-gray-900">{selectedAgreement.client_name || `${selectedAgreement.first_name || ''} ${selectedAgreement.last_name || ''}`.trim() || 'Cliente sin nombre'}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Contrato</label>
              <p className="mt-1 text-sm text-gray-900">{selectedAgreement.contract_number}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Monto Total</label>
              <p className="mt-1 text-sm text-gray-900 font-semibold">{formatCurrency(selectedAgreement.total_amount)}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Monto Pendiente</label>
              <p className="mt-1 text-sm text-gray-900">{formatCurrency(selectedAgreement.remaining_amount)}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">NÃºmero de Cuotas</label>
              <p className="mt-1 text-sm text-gray-900">{selectedAgreement.installment_count}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Valor por Cuota</label>
              <p className="mt-1 text-sm text-gray-900">{formatCurrency(selectedAgreement.installment_amount)}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Estado</label>
              <p className="mt-1 text-sm text-gray-900">
                {selectedAgreement.status === 'active' ? 'Activo' :
                 selectedAgreement.status === 'completed' ? 'Completado' :
                 'Cancelado'}
              </p>
            </div>
            
            {selectedAgreement.start_date && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Fecha de Inicio</label>
                <p className="mt-1 text-sm text-gray-900">
                  {new Date(selectedAgreement.start_date).toLocaleDateString('es-ES')}
                </p>
              </div>
            )}
            
            {selectedAgreement.end_date && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Fecha de Fin</label>
                <p className="mt-1 text-sm text-gray-900">
                  {new Date(selectedAgreement.end_date).toLocaleDateString('es-ES')}
                </p>
              </div>
            )}
            
            {selectedAgreement.due_date && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Fecha de Vencimiento</label>
                <p className="mt-1 text-sm text-gray-900">
                  {new Date(selectedAgreement.due_date).toLocaleDateString('es-ES')}
                </p>
              </div>
            )}
            
            {selectedAgreement.notes && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Notas</label>
                <p className="mt-1 text-sm text-gray-900">{selectedAgreement.notes}</p>
              </div>
            )}
          </div>
          
          <div className="flex justify-end mt-6">
            <button
              onClick={() => {
                setShowAgreementDetails(false)
                setSelectedAgreement(null)
              }}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Modal de confirmaciÃ³n de eliminaciÃ³n de convenio */}
    {showDeleteAgreementModal && selectedAgreement && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-900">Eliminar Convenio</h3>
            <button
              onClick={() => {
                setShowDeleteAgreementModal(false)
                setSelectedAgreement(null)
                setDeleteAgreementPassword('')
                setDeleteAgreementPasswordError('')
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          <div className="space-y-4">
            <p className="text-sm text-gray-700">
              Â¿EstÃ¡s seguro de que deseas eliminar este convenio?
            </p>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm font-medium text-gray-900">Cliente: {selectedAgreement.client_name || `${selectedAgreement.first_name || ''} ${selectedAgreement.last_name || ''}`.trim() || 'Cliente sin nombre'}</p>
              <p className="text-sm text-gray-600">Contrato: {selectedAgreement.contract_number}</p>
              <p className="text-sm text-gray-600">Monto Total: {formatCurrency(selectedAgreement.total_amount)}</p>
              <p className="text-sm text-gray-600">Pendiente: {formatCurrency(selectedAgreement.remaining_amount)}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ContraseÃ±a de confirmaciÃ³n
              </label>
              <input
                type="password"
                value={deleteAgreementPassword}
                onChange={(e) => {
                  setDeleteAgreementPassword(e.target.value)
                  setDeleteAgreementPasswordError('')
                }}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                  deleteAgreementPasswordError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                }`}
                placeholder="Ingresa la contraseÃ±a"
              />
              {deleteAgreementPasswordError && (
                <p className="mt-1 text-sm text-red-600">{deleteAgreementPasswordError}</p>
              )}
            </div>
          </div>
          
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={() => {
                setShowDeleteAgreementModal(false)
                setSelectedAgreement(null)
                setDeleteAgreementPassword('')
                setDeleteAgreementPasswordError('')
              }}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirmDeleteAgreement}
              disabled={loading}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Eliminando...' : 'Eliminar'}
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Modal de confirmaciÃ³n de eliminaciÃ³n de todos los convenios */}
    {showDeleteAllAgreementsModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-900">Eliminar Todos los Convenios</h3>
            <button
              onClick={() => {
                setShowDeleteAllAgreementsModal(false)
                setDeleteAllAgreementsPassword('')
                setDeleteAllAgreementsPasswordError('')
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          <div className="space-y-4">
            <p className="text-sm text-gray-700">
              âš ï¸ <strong>ADVERTENCIA:</strong> Esta acciÃ³n eliminarÃ¡ TODOS los convenios de pago. Esta acciÃ³n no se puede deshacer.
            </p>
            
            <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
              <p className="text-sm font-medium text-red-900">
                Total de convenios a eliminar: {paymentAgreements.length}
              </p>
              <p className="text-xs text-red-700 mt-1">
                Si hay pagos asociados a algÃºn convenio, la operaciÃ³n fallarÃ¡. Debes eliminar los pagos primero.
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ContraseÃ±a de confirmaciÃ³n
              </label>
              <input
                type="password"
                value={deleteAllAgreementsPassword}
                onChange={(e) => {
                  setDeleteAllAgreementsPassword(e.target.value)
                  setDeleteAllAgreementsPasswordError('')
                }}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                  deleteAllAgreementsPasswordError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                }`}
                placeholder="Ingresa la contraseÃ±a"
              />
              {deleteAllAgreementsPasswordError && (
                <p className="mt-1 text-sm text-red-600">{deleteAllAgreementsPasswordError}</p>
              )}
            </div>
          </div>
          
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={() => {
                setShowDeleteAllAgreementsModal(false)
                setDeleteAllAgreementsPassword('')
                setDeleteAllAgreementsPasswordError('')
              }}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirmDeleteAllAgreements}
              disabled={loading}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Eliminando...' : 'Eliminar Todos'}
            </button>
          </div>
        </div>
      </div>
    )}
    </div>
  )
}

export default CobranzasPanel


