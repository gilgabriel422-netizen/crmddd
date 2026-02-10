import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { 
  Users, 
  Calendar, 
  FileText, 
  BarChart3, 
  LogOut, 
  Menu, 
  X, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  Search,
  Filter,
  Download,
  ClipboardList,
  History,
  MessageCircle,
  TrendingUp,
  RefreshCw,
  BookOpen,
  FileCheck,
  Plane,
  ChevronDown,
  ChevronUp,
  User,
  DollarSign,
  CalendarCheck,
  Wallet,
  MapPin
} from 'lucide-react'
import { clientService, bookingService, userService, requirementService, paymentService, paymentAgreementService, documentService, reservationAgendaService, visaAgendaService, flightAgendaService } from '../services/api'
import reportService from '../services/reportService'
import auditService from '../services/auditService'
import SessionWarning from '../components/SessionWarning'
import FeaturedPackages from '../components/FeaturedPackages'
import LocacionesDepartamentosAdmin from '../components/LocacionesDepartamentosAdmin'
import PaquetesAdmin from '../components/PaquetesAdmin'
import NotificationBell from '../components/NotificationBell'

// Importar script de diagnóstico
import '../debug-auth'

const AdminPanel = ({ initialSection, panelTitle = 'Admin Panel' }) => {
  const { user, logout } = useAuth()
  const [activeSection, setActiveSection] = useState(initialSection || 'dashboard')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Estados para datos
  const [clients, setClients] = useState([])
  const [bookings, setBookings] = useState([])
  const [stats, setStats] = useState({})
  const [pagination, setPagination] = useState({})
  const [collectionsByArea, setCollectionsByArea] = useState([])
  const [newCollectionClients, setNewCollectionClients] = useState([])
  const [collectionsModuleLoading, setCollectionsModuleLoading] = useState(false)

  // Estados para formularios
  const [showClientForm, setShowClientForm] = useState(false)
  const [editingClient, setEditingClient] = useState(null)
  const [editingBooking, setEditingBooking] = useState(null)
  const [selectedClient, setSelectedClient] = useState(null)
  const [showClientDetails, setShowClientDetails] = useState(false)
  const [selectedClientForHistory, setSelectedClientForHistory] = useState(null)
  const [showClientHistoryModal, setShowClientHistoryModal] = useState(false)
  const [clientHistoryData, setClientHistoryData] = useState(null)
  const [loadingClientHistory, setLoadingClientHistory] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editPassword, setEditPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deletePassword, setDeletePassword] = useState('')
  const [deletePasswordError, setDeletePasswordError] = useState('')
  const [showNewClientForm, setShowNewClientForm] = useState(false)
  const [newClientData, setNewClientData] = useState({
    fecha: '',
    version: 'cliente',
    contrato: '',
    contrato_suffix: '',
    contrato_number: '',
    nombres: '',
    apellidos: '',
    cedula: '',
    telefono: '',
    noches: 0,
    anos: 0,
    anos_indefinido: false,
    bono_internacional: 'No',
    pago_mixto: 'No',
    cantidad_tarjetas: 1,
    tarjetas: [{ tipo: '', monto: 0, datafast: '' }],
    datafast: '',
    tipo_tarjeta: '',
    forma_pago: '',
    tiempo_meses: 0,
    total_venta: 0,
    iva: 0,
    neto: 0,
    correo_electronico: '',
    linner: '',
    closer: '',
    observaciones: '',
    pagare: 'No',
    fecha_pagare: '',
    monto_pagare: 0,
    cantidad_cuotas: 1,
    cuotas_asumidas: 0,
    valor_cuota: 0,
    total_pagare: 0,
    puntos_ib: 0,
    sala: 'Sala 1'
  })

  // Calculadora de Puntos IB según monto de venta (500-1000→50, 1001-3000→100, 3001-5000→200, 5001+→300)
  const computePoints = (amount) => {
    const total = Number(amount) || 0
    if (total >= 500 && total <= 1000) return 50
    if (total >= 1001 && total <= 3000) return 100
    if (total >= 3001 && total <= 5000) return 200
    if (total >= 5001) return 300
    return 0
  }
  
  // Estados para reservas
  const [showBookingForm, setShowBookingForm] = useState(false)
  const [showBookingPreview, setShowBookingPreview] = useState(false)
  const [showEditBookingForm, setShowEditBookingForm] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [bookingFormData, setBookingFormData] = useState({
    contract_number: '',
    city: '',
    custom_city: '',
    nights_requested: '',
    people_count: 1,
    reservation_value: '',
    custom_value: '',
    contact_source: '',
    observations: '',
    check_in_date: '',
    check_out_date: '',
    special_requests: '',
    emergency_contact: '',
    dietary_restrictions: '',
    wifi_name: '',
    wifi_password: '',
    google_maps_link: ''
  })
  const [participantsData, setParticipantsData] = useState([])
  const [validatedClient, setValidatedClient] = useState(null)
  const [bookingError, setBookingError] = useState('')
  const [contractSearchResults, setContractSearchResults] = useState([])
  const [showContractSearch, setShowContractSearch] = useState(false)
  
  // Estados para edición de reservas
  const [editBookingFormData, setEditBookingFormData] = useState({
    contract_number: '',
    city: '',
    custom_city: '',
    nights_requested: '',
    people_count: 1,
    reservation_value: '',
    custom_value: '',
    contact_source: '',
    observations: '',
    check_in_date: '',
    check_out_date: '',
    special_requests: '',
    emergency_contact: '',
    dietary_restrictions: '',
    wifi_name: '',
    wifi_password: '',
    google_maps_link: ''
  })
  const [editParticipantsData, setEditParticipantsData] = useState([])
  const [editValidatedClient, setEditValidatedClient] = useState(null)
  const [editBookingError, setEditBookingError] = useState('')
  const [contractSearchTerm, setContractSearchTerm] = useState('')
  
  // Estados para requerimientos
  const [requirements, setRequirements] = useState([])
  const [showRequirementForm, setShowRequirementForm] = useState(false)
  
  // Estados para reportes mejorados
  const [dashboardPeriod, setDashboardPeriod] = useState('this_month')
  const [dashboardReports, setDashboardReports] = useState(null)
  const [dashboardLoading, setDashboardLoading] = useState(false)
  const [lastMonthSummary, setLastMonthSummary] = useState({
    sales: { total_ventas: 0, total_monto: 0, ventas_pagadas: 0, monto_pagado: 0 },
    collections: { total_cobranzas: 0, total_monto: 0, cobranzas_pagadas: 0, monto_pagado: 0 },
    requirements: { total_requerimientos: 0, completados: 0, pendientes: 0 },
    bookings: { total_reservas: 0, total_monto: 0, confirmadas: 0, canceladas: 0 }
  })
  
  // Estados para notificaciones de pagos
  const [paymentsToday, setPaymentsToday] = useState({
    count: 0,
    amount: 0,
    loading: false
  })
  const [paymentsThisMonth, setPaymentsThisMonth] = useState({
    count: 0,
    amount: 0,
    loading: false
  })

  // Estados para modales de tarjetas del dashboard
  const [showSalesModal, setShowSalesModal] = useState(false)
  const [showCollectionsModal, setShowCollectionsModal] = useState(false)
  const [showBookingsModal, setShowBookingsModal] = useState(false)
  const [showPaymentsTodayModal, setShowPaymentsTodayModal] = useState(false)
  const [showPaymentsThisMonthModal, setShowPaymentsThisMonthModal] = useState(false)
  
  // Estados para datos de los modales
  const [salesClients, setSalesClients] = useState([])
  const [salesClientsLoading, setSalesClientsLoading] = useState(false)
  const [collectionsClients, setCollectionsClients] = useState([])
  const [collectionsClientsLoading, setCollectionsClientsLoading] = useState(false)
  const [periodBookings, setPeriodBookings] = useState([])
  const [periodBookingsLoading, setPeriodBookingsLoading] = useState(false)
  const [todayPayments, setTodayPayments] = useState([])
  const [todayPaymentsLoading, setTodayPaymentsLoading] = useState(false)
  const [thisMonthPayments, setThisMonthPayments] = useState([])
  const [thisMonthPaymentsLoading, setThisMonthPaymentsLoading] = useState(false)
  
  // Estados para historial de auditoría
  const [auditLogs, setAuditLogs] = useState([])
  const [auditLogsLoading, setAuditLogsLoading] = useState(false)
  const [auditLogsError, setAuditLogsError] = useState('')
  const [auditStats, setAuditStats] = useState({
    totalActions: 0,
    actionsByType: {},
    actionsByUser: {},
    recentActivity: []
  })
  
  // Estados para filtros de auditoría
  const [auditFilters, setAuditFilters] = useState({
    startDate: '',
    endDate: '',
    userId: '',
    action: '',
    entityType: ''
  })
  
  // Estados para módulo de reportes
  const [reportsPeriod, setReportsPeriod] = useState('today')
  const [reportsData, setReportsData] = useState({
    sales: null,
    clients: null,
    bookings: null,
    requirements: null
  })
  const [collectionsDetailedData, setCollectionsDetailedData] = useState(null)
  const [collectionsDetailedLoading, setCollectionsDetailedLoading] = useState(false)
  const [reportsLoading, setReportsLoading] = useState(false)
  const [tokenValid, setTokenValid] = useState(true)
  const [requirementFormData, setRequirementFormData] = useState({
    contract_number: '',
    requirement_type: '',
    description: '',
    assigned_to: '',
    notes: '',
    routes: '',
    flight_type: '',
    company_assumes_fee: false,
    destination: '',
    client_paid_amount: '',
    departure_date: '',
    return_date: '',
    number_of_people: '',
    commission_amount: ''
  })
  const [requirementSearchResults, setRequirementSearchResults] = useState([])
  const [showRequirementSearch, setShowRequirementSearch] = useState(false)
  const [requirementSearchTerm, setRequirementSearchTerm] = useState('')
  const [requirementError, setRequirementError] = useState('')
  const [selectedRequirement, setSelectedRequirement] = useState(null)
  const [showRequirementDetails, setShowRequirementDetails] = useState(false)
  const [showRequirementEdit, setShowRequirementEdit] = useState(false)
  const [requirementEditData, setRequirementEditData] = useState({})
  const [clientRequirements, setClientRequirements] = useState([])
  const [showClientRequirements, setShowClientRequirements] = useState(false)
  
  // Estados para validación del formulario de cliente
  const [clientFormErrors, setClientFormErrors] = useState({})
  const [isClientFormValid, setIsClientFormValid] = useState(false)
  
  // Estados para pagos y convenios
  const [payments, setPayments] = useState([])
  const [paymentAgreements, setPaymentAgreements] = useState([])
  const [clientPaymentAgreement, setClientPaymentAgreement] = useState(null)
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [showAgreementForm, setShowAgreementForm] = useState(false)
  const [showReceiptModal, setShowReceiptModal] = useState(false)
  const [selectedClientForPayment, setSelectedClientForPayment] = useState(null)
  const [selectedClientForAgreement, setSelectedClientForAgreement] = useState(null)
  const [paymentFormData, setPaymentFormData] = useState({
    client_id: '',
    payment_agreement_id: '',
    contract_number: '',
    payment_amount: '',
    payment_date: '',
    payment_method: '',
    payment_type: '', // Corriente o Diferido
    payment_time: '', // 3, 6, 9, 12, 24, 36 meses
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
  const [paymentError, setPaymentError] = useState('')
  const [agreementError, setAgreementError] = useState('')
  const [selectedReceipt, setSelectedReceipt] = useState(null)
  
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [showEditForm, setShowEditForm] = useState(false)
  const [editFormData, setEditFormData] = useState({})
  
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

  // Estados para cancelaciones
  const [cancellations, setCancellations] = useState([])
  const [showCancellationForm, setShowCancellationForm] = useState(false)
  const [cancellationFormData, setCancellationFormData] = useState({
    booking_id: '',
    reason: '',
    penalty_amount: '',
    penalty_type: '', // 'porcentaje' o 'monto_fijo'
    penalty_percentage: '',
    notes: ''
  })
  const [cancellationError, setCancellationError] = useState('')
  const [cancellationLoading, setCancellationLoading] = useState(false)
  const [selectedBookingForCancellation, setSelectedBookingForCancellation] = useState(null)
  
  // Estados para cancelación de contratos
  const [cancellationType, setCancellationType] = useState('reservas') // 'reservas' o 'contratos'
  const [selectedContractForCancellation, setSelectedContractForCancellation] = useState(null)
  const [contractCancellationFormData, setContractCancellationFormData] = useState({
    contract_number: '',
    reason: '',
    notes: ''
  })
  const [contractCancellationError, setContractCancellationError] = useState('')
  const [contractCancellationLoading, setContractCancellationLoading] = useState(false)

  // Estados para agenda de reservas
  const [reservationAgendas, setReservationAgendas] = useState([])
  const [reservationAgendaLoading, setReservationAgendaLoading] = useState(false)
  const [reservationAgendaPagination, setReservationAgendaPagination] = useState({})
  const [showReservationAgendaForm, setShowReservationAgendaForm] = useState(false)
  const [editingReservationAgenda, setEditingReservationAgenda] = useState(null)
  const [reservationAgendaFormData, setReservationAgendaFormData] = useState({
    fecha: '',
    socio: '',
    ciudad: '',
    nombre: '',
    destino: '',
    llegada: '',
    salida: '',
    pax: '',
    airbnb_nombres: '',
    cedulas: '',
    observacion: '',
    link_conversacion_airbnb: '',
    estatus: '',
    tarjeta_usada: '',
    valor_pagado_reserva: '',
    pago_cliente: '',
    observaciones_adicionales: ''
  })
  const [reservationAgendaSearch, setReservationAgendaSearch] = useState('')
  const [reservationAgendaStatusFilter, setReservationAgendaStatusFilter] = useState('')

  // Estados para agenda de visados
  const [visaAgendas, setVisaAgendas] = useState([])
  const [visaAgendaLoading, setVisaAgendaLoading] = useState(false)
  const [visaAgendaPagination, setVisaAgendaPagination] = useState({})
  const [showVisaAgendaForm, setShowVisaAgendaForm] = useState(false)
  const [editingVisaAgenda, setEditingVisaAgenda] = useState(null)
  const [visaAgendaFormData, setVisaAgendaFormData] = useState({
    fecha: '',
    socio: '',
    ciudad: '',
    nombre: '',
    embajada: '',
    ads: '',
    correo: '',
    contrasena: '',
    estatus: '',
    fecha_entrevista_embajada: '',
    hora_entrevista_embajada: '',
    fecha_asesoramiento: '',
    observaciones: '',
    link_reunion: ''
  })
  const [visaAgendaSearch, setVisaAgendaSearch] = useState('')
  const [visaAgendaStatusFilter, setVisaAgendaStatusFilter] = useState('')

  // Estados para agenda de vuelos
  const [flightAgendas, setFlightAgendas] = useState([])
  const [flightAgendaLoading, setFlightAgendaLoading] = useState(false)
  const [flightAgendaPagination, setFlightAgendaPagination] = useState({})
  const [showFlightAgendaForm, setShowFlightAgendaForm] = useState(false)
  const [editingFlightAgenda, setEditingFlightAgenda] = useState(null)
  const [flightAgendaFormData, setFlightAgendaFormData] = useState({
    fecha: '',
    socio: '',
    ciudad: '',
    nombre: '',
    destino: '',
    llegada: '',
    salida: '',
    pax: '',
    ruta: '',
    numero_reserva: '',
    estatus: '',
    tarjeta_usada: '',
    valor_pagado_reserva: '',
    pago_cliente: '',
    observacion: ''
  })
  const [flightAgendaSearch, setFlightAgendaSearch] = useState('')
  const [flightAgendaStatusFilter, setFlightAgendaStatusFilter] = useState('')

  // Definir secciones disponibles según el usuario
  const getAvailableSections = () => {
    const allSections = [
      { id: 'dashboard', name: 'Dashboard', icon: BarChart3 },
      { id: 'clientes', name: 'Clientes', icon: Users },
      { id: 'cobranzas', name: 'Cobranzas', icon: DollarSign },
      { id: 'reservas', name: 'Reservas', icon: Calendar },
      { id: 'paquetes', name: 'Paquetes', icon: Plane },
      { id: 'locaciones', name: 'Locaciones / Departamentos', icon: MapPin },
      { id: 'reportes', name: 'Reportes', icon: FileText },
    ];

    // Usuario "Cobranzas" solo tiene acceso a clientes y cobranzas
    if (user?.rol === 'cobranzas' || user?.email === 'cobranzas@kempery.com' || user?.email === 'cobranzas@crm.com') {
      return allSections.filter(section => 
        section.id === 'clientes' || section.id === 'cobranzas'
      );
    }

    // Otros usuarios tienen acceso completo
    return allSections;
  };

  const sections = getAvailableSections();

  // Establecer sección activa por defecto según el usuario
  useEffect(() => {
    if (user) {
      // Verificar token al cargar
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.log('❌ No hay token al cargar AdminPanel, redirigiendo...');
        window.location.href = '/';
        return;
      }
      
      if (user?.rol === 'cobranzas' || user?.email === 'cobranzas@kempery.com' || user?.email === 'cobranzas@crm.com') {
        // Usuario "Cobranzas" inicia en la sección de cobranzas
        setActiveSection('cobranzas');
      } else {
        // Otros usuarios inician en el dashboard
        setActiveSection('dashboard');
      }
    }
  }, [user]);

  // Cargar datos según la sección activa
  useEffect(() => {
    if (activeSection === 'agenda-reservas') {
      loadReservationAgendas();
    } else if (activeSection === 'agenda-visados') {
      loadVisaAgendas();
    } else if (activeSection === 'agenda-vuelos') {
      loadFlightAgendas();
    }
  }, [activeSection, reservationAgendaSearch, reservationAgendaStatusFilter, visaAgendaSearch, visaAgendaStatusFilter, flightAgendaSearch, flightAgendaStatusFilter]);


  // Cargar datos del dashboard
  const loadDashboardData = async () => {
    try {
      setLoading(true)
      
      // Verificar token antes de hacer peticiones
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.log('❌ No hay token, redirigiendo al login...');
        window.location.href = '/';
        return;
      }
      const [clientsStatsRes, bookingsRes] = await Promise.all([
        clientService.getClientStats().catch(() => ({ stats: {} })),
        bookingService.getBookings().catch(() => ({ bookings: [] }))
      ])
      
      const stats = clientsStatsRes?.stats || clientsStatsRes || {}
      const activeBookings = bookingsRes?.bookings?.filter(b => b.status === 'confirmed' || b.status === 'pending').length || 0
      
      setStats({
        totalClients: parseInt(stats.total_clients) || 0,
        activeBookings,
        totalRevenue: parseFloat(stats.total_revenue) || 0,
        pendingPayments: parseInt(stats.unpaid_clients) || 0,
        newClients30Days: parseInt(stats.new_clients_30_days) || 0,
        paidClients: parseInt(stats.paid_clients) || 0
      })
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      setError('Error al cargar los datos del dashboard')
    } finally {
      setLoading(false)
    }
  }

  // Cargar clientes
  const loadClients = async (page = 1, search = '') => {
    try {
      setLoading(true)
      const response = await clientService.getClients({ page, limit: 20, search })
      setClients(response.clients || [])
      setPagination(response.pagination || {})
    } catch (error) {
      console.error('Error loading clients:', error)
      setError('Error al cargar los clientes')
    } finally {
      setLoading(false)
    }
  }

  // Cargar reservas
  const loadBookings = async () => {
    try {
      setLoading(true)
      const response = await bookingService.getBookings()
      setBookings(response.bookings || [])
    } catch (error) {
      console.error('Error loading bookings:', error)
      setError('Error al cargar las reservas')
    } finally {
      setLoading(false)
    }
  }

  // Cargar requerimientos
  const loadRequirements = async () => {
    try {
      setLoading(true)
      const response = await requirementService.getRequirements()
      setRequirements(response.requirements || [])
    } catch (error) {
      console.error('Error loading requirements:', error)
      setError('Error al cargar los requerimientos')
    } finally {
      setLoading(false)
    }
  }

  // Buscar contrato para requerimientos
  const handleRequirementContractSearch = async () => {
    if (!requirementSearchTerm.trim()) {
      setRequirementError('Por favor ingresa el número de contrato')
      return
    }

    try {
      setRequirementError('')
      const response = await requirementService.searchContract(requirementSearchTerm)
      setRequirementSearchResults(response.clients)
      setShowRequirementSearch(true)
    } catch (error) {
      console.error('Error buscando contrato:', error)
      setRequirementError(error.response?.data?.error || 'Error al buscar el contrato')
      setRequirementSearchResults([])
    }
  }

  // Seleccionar contrato de los resultados de búsqueda para requerimientos
  const handleSelectRequirementContract = (client) => {
    setRequirementFormData(prev => ({
      ...prev,
      contract_number: client.contract_number
    }))
    setShowRequirementSearch(false)
    setRequirementSearchResults([])
    setRequirementSearchTerm('')
    setRequirementError('')
  }

  // Manejar cambios en el formulario de requerimientos
  const handleRequirementFormChange = (field, value) => {
    setRequirementFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Crear nuevo requerimiento
  const handleCreateRequirement = async () => {
    try {
      setRequirementError('')
      
      const requirementData = {
        contract_number: requirementFormData.contract_number,
        requirement_type: requirementFormData.requirement_type,
        description: requirementFormData.description,
        assigned_to: requirementFormData.assigned_to,
        notes: requirementFormData.notes
      }

      await requirementService.createRequirement(requirementData)
      
      // Registrar acción de auditoría
      await logAuditAction(
        'CREATE',
        'REQUIREMENT',
        requirementData.id || 'temp',
        null,
        requirementData,
        `Requerimiento creado: ${requirementData.requirement_type} - ${requirementData.contract_number}`
      )
      
      // Recargar requerimientos
      await loadRequirements()
      
      // Cerrar formulario
      setShowRequirementForm(false)
      setRequirementFormData({
        contract_number: '',
        requirement_type: '',
        description: '',
        assigned_to: '',
        notes: '',
        routes: '',
        flight_type: '',
        company_assumes_fee: false,
        destination: '',
        client_paid_amount: '',
        departure_date: '',
        return_date: '',
        number_of_people: '',
        commission_amount: ''
      })
      
      alert('Requerimiento creado exitosamente')
      
    } catch (error) {
      console.error('Error creando requerimiento:', error)
      setRequirementError(error.response?.data?.error || 'Error al crear el requerimiento')
    }
  }

  // Ver detalles del requerimiento
  const handleViewRequirement = async (requirement) => {
    try {
      const response = await requirementService.getRequirement(requirement.id)
      setSelectedRequirement(response.requirement)
      setShowRequirementDetails(true)
    } catch (error) {
      console.error('Error cargando detalles del requerimiento:', error)
      alert('Error al cargar los detalles del requerimiento')
    }
  }

  // Editar requerimiento
  const handleEditRequirement = async (requirement) => {
    try {
      const response = await requirementService.getRequirement(requirement.id)
      setRequirementEditData(response.requirement)
      setShowRequirementEdit(true)
    } catch (error) {
      console.error('Error cargando requerimiento para editar:', error)
      alert('Error al cargar el requerimiento para editar')
    }
  }

  // Actualizar requerimiento
  const handleUpdateRequirement = async () => {
    try {
      setRequirementError('')
      
      const updateData = {
        status: requirementEditData.status,
        notes: requirementEditData.notes
      }

      await requirementService.updateRequirementStatus(requirementEditData.id, updateData)
      
      // Registrar acción de auditoría
      await logAuditAction(
        'UPDATE',
        'REQUIREMENT',
        requirementEditData.id,
        requirementEditData,
        updateData,
        `Requerimiento actualizado: ${requirementEditData.requirement_type} - Estado: ${updateData.status}`
      )
      
      // Recargar requerimientos
      await loadRequirements()
      
      // Cerrar modal
      setShowRequirementEdit(false)
      setRequirementEditData({})
      
      alert('Requerimiento actualizado exitosamente')
      
    } catch (error) {
      console.error('Error actualizando requerimiento:', error)
      setRequirementError(error.response?.data?.error || 'Error al actualizar el requerimiento')
    }
  }

  // Eliminar requerimiento
  const handleDeleteRequirement = async (requirement) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este requerimiento?')) {
      try {
        await requirementService.deleteRequirement(requirement.id)
        
        // Registrar acción de auditoría
        await logAuditAction(
          'DELETE',
          'REQUIREMENT',
          requirement.id,
          requirement,
          null,
          `Requerimiento eliminado: ${requirement.requirement_type} - ${requirement.contract_number}`
        )
        
        // Recargar requerimientos
        await loadRequirements()
        
        alert('Requerimiento eliminado exitosamente')
        
      } catch (error) {
        console.error('Error eliminando requerimiento:', error)
        alert('Error al eliminar el requerimiento')
      }
    }
  }

  // Cargar requerimientos de un cliente específico
  const loadClientRequirements = async (clientId) => {
    try {
      setLoading(true)
      const response = await requirementService.getRequirementsByClient(clientId)
      setClientRequirements(response.requirements || [])
      setShowClientRequirements(true)
    } catch (error) {
      console.error('Error cargando requerimientos del cliente:', error)
      alert('Error al cargar los requerimientos del cliente')
    } finally {
      setLoading(false)
    }
  }

  // Cargar pagos
  const loadPayments = async () => {
    try {
      setLoading(true)
      const response = await paymentService.getPayments()
      setPayments(response.payments || [])
    } catch (error) {
      console.error('Error cargando pagos:', error)
      alert('Error al cargar los pagos')
    } finally {
      setLoading(false)
    }
  }

  // Cargar convenios de pago
  const loadPaymentAgreements = async () => {
    try {
      setLoading(true)
      const response = await paymentAgreementService.getPaymentAgreements()
      setPaymentAgreements(response.agreements || [])
    } catch (error) {
      console.error('Error cargando convenios:', error)
      alert('Error al cargar los convenios de pago')
    } finally {
      setLoading(false)
    }
  }

  // Cargar agenda de reservas
  const loadReservationAgendas = async () => {
    try {
      setReservationAgendaLoading(true)
      const params = {
        page: 1,
        limit: 100,
        ...(reservationAgendaSearch && { search: reservationAgendaSearch }),
        ...(reservationAgendaStatusFilter && { status: reservationAgendaStatusFilter })
      }
      const response = await reservationAgendaService.getReservationAgendas(params)
      setReservationAgendas(response.data || [])
      setReservationAgendaPagination(response.pagination || {})
    } catch (error) {
      console.error('Error cargando agenda de reservas:', error)
      setError('Error al cargar la agenda de reservas')
    } finally {
      setReservationAgendaLoading(false)
    }
  }

  // Manejar cambios en el formulario de agenda de reservas
  const handleReservationAgendaFormChange = (field, value) => {
    setReservationAgendaFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Crear nueva agenda de reserva
  const handleCreateReservationAgenda = async () => {
    try {
      setError('')
      
      await reservationAgendaService.createReservationAgenda(reservationAgendaFormData)
      
      // Recargar agenda
      await loadReservationAgendas()
      
      // Cerrar formulario
      setShowReservationAgendaForm(false)
      setReservationAgendaFormData({
        fecha: '',
        socio: '',
        ciudad: '',
        nombre: '',
        destino: '',
        llegada: '',
        salida: '',
        pax: '',
        airbnb_nombres: '',
        cedulas: '',
        observacion: '',
        link_conversacion_airbnb: '',
        estatus: '',
        tarjeta_usada: '',
        valor_pagado_reserva: '',
        pago_cliente: '',
        observaciones_adicionales: ''
      })
      
      alert('Agenda de reserva creada exitosamente')
      
    } catch (error) {
      console.error('Error creando agenda de reserva:', error)
      setError(error.response?.data?.error || 'Error al crear la agenda de reserva')
    }
  }

  // Editar agenda de reserva
  const handleEditReservationAgenda = (agenda) => {
    setEditingReservationAgenda(agenda)
    setReservationAgendaFormData({
      fecha: agenda.fecha || '',
      socio: agenda.socio || '',
      ciudad: agenda.ciudad || '',
      nombre: agenda.nombre || '',
      destino: agenda.destino || '',
      llegada: agenda.llegada || '',
      salida: agenda.salida || '',
      pax: agenda.pax || '',
      airbnb_nombres: agenda.airbnb_nombres || '',
      cedulas: agenda.cedulas || '',
      observacion: agenda.observacion || '',
      link_conversacion_airbnb: agenda.link_conversacion_airbnb || '',
      estatus: agenda.estatus || '',
      tarjeta_usada: agenda.tarjeta_usada || '',
      valor_pagado_reserva: agenda.valor_pagado_reserva || '',
      pago_cliente: agenda.pago_cliente || '',
      observaciones_adicionales: agenda.observaciones_adicionales || ''
    })
    setShowReservationAgendaForm(true)
  }

  // Actualizar agenda de reserva
  const handleUpdateReservationAgenda = async () => {
    try {
      setError('')
      
      await reservationAgendaService.updateReservationAgenda(
        editingReservationAgenda.id,
        reservationAgendaFormData
      )
      
      // Recargar agenda
      await loadReservationAgendas()
      
      // Cerrar formulario
      setShowReservationAgendaForm(false)
      setEditingReservationAgenda(null)
      setReservationAgendaFormData({
        fecha: '',
        socio: '',
        ciudad: '',
        nombre: '',
        destino: '',
        llegada: '',
        salida: '',
        pax: '',
        airbnb_nombres: '',
        cedulas: '',
        observacion: '',
        link_conversacion_airbnb: '',
        estatus: '',
        tarjeta_usada: '',
        valor_pagado_reserva: '',
        pago_cliente: '',
        observaciones_adicionales: ''
      })
      
      alert('Agenda de reserva actualizada exitosamente')
      
    } catch (error) {
      console.error('Error actualizando agenda de reserva:', error)
      setError(error.response?.data?.error || 'Error al actualizar la agenda de reserva')
    }
  }

  // Eliminar agenda de reserva
  const handleDeleteReservationAgenda = async (agenda) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta agenda de reserva?')) {
      try {
        await reservationAgendaService.deleteReservationAgenda(agenda.id)
        
        // Recargar agenda
        await loadReservationAgendas()
        
        alert('Agenda de reserva eliminada exitosamente')
        
      } catch (error) {
        console.error('Error eliminando agenda de reserva:', error)
        alert('Error al eliminar la agenda de reserva')
      }
    }
  }

  // Cargar agenda de visados
  const loadVisaAgendas = async () => {
    try {
      setVisaAgendaLoading(true)
      const params = {
        page: 1,
        limit: 100,
        ...(visaAgendaSearch && { search: visaAgendaSearch }),
        ...(visaAgendaStatusFilter && { status: visaAgendaStatusFilter })
      }
      const response = await visaAgendaService.getVisaAgendas(params)
      setVisaAgendas(response.data || [])
      setVisaAgendaPagination(response.pagination || {})
    } catch (error) {
      console.error('Error cargando agenda de visados:', error)
      setError('Error al cargar la agenda de visados')
    } finally {
      setVisaAgendaLoading(false)
    }
  }

  // Manejar cambios en el formulario de agenda de visados
  const handleVisaAgendaFormChange = (field, value) => {
    setVisaAgendaFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Crear nueva agenda de visado
  const handleCreateVisaAgenda = async () => {
    try {
      setError('')
      
      await visaAgendaService.createVisaAgenda(visaAgendaFormData)
      
      // Recargar agenda
      await loadVisaAgendas()
      
      // Cerrar formulario
      setShowVisaAgendaForm(false)
      setVisaAgendaFormData({
        fecha: '',
        socio: '',
        ciudad: '',
        nombre: '',
        embajada: '',
        ads: '',
        correo: '',
        contrasena: '',
        estatus: '',
        fecha_entrevista_embajada: '',
        hora_entrevista_embajada: '',
        fecha_asesoramiento: '',
        observaciones: '',
        link_reunion: ''
      })
      
      alert('Agenda de visado creada exitosamente')
      
    } catch (error) {
      console.error('Error creando agenda de visado:', error)
      setError(error.response?.data?.error || 'Error al crear la agenda de visado')
    }
  }

  // Editar agenda de visado
  const handleEditVisaAgenda = (agenda) => {
    setEditingVisaAgenda(agenda)
    setVisaAgendaFormData({
      fecha: agenda.fecha || '',
      socio: agenda.socio || '',
      ciudad: agenda.ciudad || '',
      nombre: agenda.nombre || '',
      embajada: agenda.embajada || '',
      ads: agenda.ads || '',
      correo: agenda.correo || '',
      contrasena: agenda.contrasena || '',
      estatus: agenda.estatus || '',
      fecha_entrevista_embajada: agenda.fecha_entrevista_embajada || '',
      hora_entrevista_embajada: agenda.hora_entrevista_embajada || '',
      fecha_asesoramiento: agenda.fecha_asesoramiento || '',
      observaciones: agenda.observaciones || '',
      link_reunion: agenda.link_reunion || ''
    })
    setShowVisaAgendaForm(true)
  }

  // Actualizar agenda de visado
  const handleUpdateVisaAgenda = async () => {
    try {
      setError('')
      
      await visaAgendaService.updateVisaAgenda(
        editingVisaAgenda.id,
        visaAgendaFormData
      )
      
      // Recargar agenda
      await loadVisaAgendas()
      
      // Cerrar formulario
      setShowVisaAgendaForm(false)
      setEditingVisaAgenda(null)
      setVisaAgendaFormData({
        fecha: '',
        socio: '',
        ciudad: '',
        nombre: '',
        embajada: '',
        ads: '',
        correo: '',
        contrasena: '',
        estatus: '',
        fecha_entrevista_embajada: '',
        hora_entrevista_embajada: '',
        fecha_asesoramiento: '',
        observaciones: '',
        link_reunion: ''
      })
      
      alert('Agenda de visado actualizada exitosamente')
      
    } catch (error) {
      console.error('Error actualizando agenda de visado:', error)
      setError(error.response?.data?.error || 'Error al actualizar la agenda de visado')
    }
  }

  // Eliminar agenda de visado
  const handleDeleteVisaAgenda = async (agenda) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta agenda de visado?')) {
      try {
        await visaAgendaService.deleteVisaAgenda(agenda.id)
        
        // Recargar agenda
        await loadVisaAgendas()
        
        alert('Agenda de visado eliminada exitosamente')
        
      } catch (error) {
        console.error('Error eliminando agenda de visado:', error)
        alert('Error al eliminar la agenda de visado')
      }
    }
  }

  // Cargar agenda de vuelos
  const loadFlightAgendas = async () => {
    try {
      setFlightAgendaLoading(true)
      const params = {
        page: 1,
        limit: 100,
        ...(flightAgendaSearch && { search: flightAgendaSearch }),
        ...(flightAgendaStatusFilter && { status: flightAgendaStatusFilter })
      }
      const response = await flightAgendaService.getFlightAgendas(params)
      setFlightAgendas(response.data || [])
      setFlightAgendaPagination(response.pagination || {})
    } catch (error) {
      console.error('Error cargando agenda de vuelos:', error)
      setError('Error al cargar la agenda de vuelos')
    } finally {
      setFlightAgendaLoading(false)
    }
  }

  // Manejar cambios en el formulario de agenda de vuelos
  const handleFlightAgendaFormChange = (field, value) => {
    setFlightAgendaFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Crear nueva agenda de vuelo
  const handleCreateFlightAgenda = async () => {
    try {
      setError('')
      
      await flightAgendaService.createFlightAgenda(flightAgendaFormData)
      
      // Recargar agenda
      await loadFlightAgendas()
      
      // Cerrar formulario
      setShowFlightAgendaForm(false)
      setFlightAgendaFormData({
        fecha: '',
        socio: '',
        ciudad: '',
        nombre: '',
        destino: '',
        llegada: '',
        salida: '',
        pax: '',
        ruta: '',
        numero_reserva: '',
        estatus: '',
        tarjeta_usada: '',
        valor_pagado_reserva: '',
        pago_cliente: '',
        observacion: ''
      })
      
      alert('Agenda de vuelo creada exitosamente')
      
    } catch (error) {
      console.error('Error creando agenda de vuelo:', error)
      setError(error.response?.data?.error || 'Error al crear la agenda de vuelo')
    }
  }

  // Editar agenda de vuelo
  const handleEditFlightAgenda = (agenda) => {
    setEditingFlightAgenda(agenda)
    setFlightAgendaFormData({
      fecha: agenda.fecha || '',
      socio: agenda.socio || '',
      ciudad: agenda.ciudad || '',
      nombre: agenda.nombre || '',
      destino: agenda.destino || '',
      llegada: agenda.llegada || '',
      salida: agenda.salida || '',
      pax: agenda.pax || '',
      ruta: agenda.ruta || '',
      numero_reserva: agenda.numero_reserva || '',
      estatus: agenda.estatus || '',
      tarjeta_usada: agenda.tarjeta_usada || '',
      valor_pagado_reserva: agenda.valor_pagado_reserva || '',
      pago_cliente: agenda.pago_cliente || '',
      observacion: agenda.observacion || ''
    })
    setShowFlightAgendaForm(true)
  }

  // Actualizar agenda de vuelo
  const handleUpdateFlightAgenda = async () => {
    try {
      setError('')
      
      await flightAgendaService.updateFlightAgenda(
        editingFlightAgenda.id,
        flightAgendaFormData
      )
      
      // Recargar agenda
      await loadFlightAgendas()
      
      // Cerrar formulario
      setShowFlightAgendaForm(false)
      setEditingFlightAgenda(null)
      setFlightAgendaFormData({
        fecha: '',
        socio: '',
        ciudad: '',
        nombre: '',
        destino: '',
        llegada: '',
        salida: '',
        pax: '',
        ruta: '',
        numero_reserva: '',
        estatus: '',
        tarjeta_usada: '',
        valor_pagado_reserva: '',
        pago_cliente: '',
        observacion: ''
      })
      
      alert('Agenda de vuelo actualizada exitosamente')
      
    } catch (error) {
      console.error('Error actualizando agenda de vuelo:', error)
      setError(error.response?.data?.error || 'Error al actualizar la agenda de vuelo')
    }
  }

  // Eliminar agenda de vuelo
  const handleDeleteFlightAgenda = async (agenda) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta agenda de vuelo?')) {
      try {
        await flightAgendaService.deleteFlightAgenda(agenda.id)
        
        // Recargar agenda
        await loadFlightAgendas()
        
        alert('Agenda de vuelo eliminada exitosamente')
        
      } catch (error) {
        console.error('Error eliminando agenda de vuelo:', error)
        alert('Error al eliminar la agenda de vuelo')
      }
    }
  }

  // Cargar payment agreement del cliente
  const loadClientPaymentAgreement = async (clientId) => {
    try {
      const response = await paymentAgreementService.getPaymentAgreementsByClient(clientId)
      if (response.agreements && response.agreements.length > 0) {
        // Obtener el convenio más reciente (ya viene ordenado por created_at DESC)
        setClientPaymentAgreement(response.agreements[0])
      } else {
        setClientPaymentAgreement(null)
      }
    } catch (error) {
      console.error('Error loading payment agreement:', error)
      setClientPaymentAgreement(null)
    }
  }

  // Abrir formulario de pago
  const handleAddPayment = (client) => {
    setSelectedClientForPayment(client)
    setPaymentFormData({
      client_id: client.id,
      payment_agreement_id: client.payment_agreement_id || '',
      contract_number: client.contract_number || '',
      payment_amount: '',
      payment_date: new Date().toISOString().split('T')[0],
      payment_method: '',
      payment_type: '',
      payment_time: '',
      installment_number: '',
      notes: ''
    })
    setShowPaymentForm(true)
  }

  // Función para manejar el botón unificado de pago/convenio
  const handlePaymentAction = (client, action) => {
    if (action === 'payment') {
      handleAddPayment(client)
    } else if (action === 'agreement') {
      handleAddAgreement(client)
    }
  }


  // Abrir formulario de convenio
  const handleAddAgreement = (client) => {
    setSelectedClientForAgreement(client)
    setAgreementFormData({
      client_id: client.id,
      contract_number: client.contract_number || '',
      total_amount: client.total_amount || '',
      installment_count: '',
      installment_amount: '',
      start_date: new Date().toISOString().split('T')[0],
      end_date: '',
      notes: ''
    })
    setShowAgreementForm(true)
  }

  // Manejar cambios en formulario de pago
  const handlePaymentFormChange = (field, value) => {
    setPaymentFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Manejar cambios en formulario de convenio
  const handleAgreementFormChange = (field, value) => {
    setAgreementFormData(prev => {
      const newData = { ...prev, [field]: value }
      
      // Calcular monto por cuota automáticamente
      if (field === 'total_amount' || field === 'installment_count') {
        const total = parseFloat(newData.total_amount) || 0
        const count = parseInt(newData.installment_count) || 0
        if (total > 0 && count > 0) {
          newData.installment_amount = (total / count).toFixed(2)
        }
      }
      
      // Calcular fecha de fin automáticamente (cuotas mensuales)
      if (field === 'start_date' || field === 'installment_count') {
        const startDate = newData.start_date
        const installmentCount = parseInt(newData.installment_count) || 0
        
        if (startDate && installmentCount > 0) {
          const start = new Date(startDate)
          // Agregar el número de cuotas en meses
          start.setMonth(start.getMonth() + installmentCount)
          newData.end_date = start.toISOString().split('T')[0]
        }
      }
      
      return newData
    })
  }

  // Crear pago
  const handleCreatePayment = async () => {
    try {
      setPaymentError('')
      
      const paymentData = {
        ...paymentFormData,
        payment_amount: parseFloat(paymentFormData.payment_amount),
        installment_number: paymentFormData.installment_number ? parseInt(paymentFormData.installment_number) : null
      }

      const response = await paymentService.createPayment(paymentData)
      
      // Registrar acción de auditoría
      await logAuditAction(
        'CREATE',
        'PAYMENT',
        response.id,
        null,
        paymentData,
        `Pago creado: ${paymentData.contract_number} - $${paymentData.payment_amount} - ${paymentData.payment_method}`
      )
      
      // Recargar datos
      await loadUnpaidClients()
      await loadPayments()
      
      // Cerrar formulario
      setShowPaymentForm(false)
      setPaymentFormData({
        client_id: '',
        payment_agreement_id: '',
        contract_number: '',
        payment_amount: '',
        payment_date: '',
        payment_method: '',
        payment_type: '',
        payment_time: '',
        installment_number: '',
        notes: ''
      })
      
      alert('Pago registrado exitosamente')
      
    } catch (error) {
      console.error('Error creando pago:', error)
      setPaymentError(error.response?.data?.error || 'Error al registrar el pago')
    }
  }

  // Crear convenio de pago
  const handleCreateAgreement = async () => {
    try {
      setAgreementError('')
      
      const agreementData = {
        ...agreementFormData,
        total_amount: parseFloat(agreementFormData.total_amount),
        installment_count: parseInt(agreementFormData.installment_count),
        installment_amount: parseFloat(agreementFormData.installment_amount)
      }

      const response = await paymentAgreementService.createPaymentAgreement(agreementData)
      
      // Registrar acción de auditoría
      await logAuditAction(
        'CREATE',
        'PAYMENT_AGREEMENT',
        response.id,
        null,
        agreementData,
        `Convenio de pago creado: ${agreementData.contract_number} - $${agreementData.total_amount} - ${agreementData.installment_count} cuotas`
      )
      
      // Recargar datos
      await loadUnpaidClients()
      await loadPaymentAgreements()
      
      // Cerrar formulario
      setShowAgreementForm(false)
      setAgreementFormData({
        client_id: '',
        contract_number: '',
        total_amount: '',
        installment_count: '',
        installment_amount: '',
        start_date: '',
        end_date: '',
        notes: ''
      })
      
      alert('Convenio de pago creado exitosamente')
      
    } catch (error) {
      console.error('Error creando convenio:', error)
      setAgreementError(error.response?.data?.error || 'Error al crear el convenio de pago')
    }
  }

  // Generar recibo
  const handleGenerateReceipt = (payment) => {
    setSelectedReceipt(payment)
    setShowReceiptModal(true)
  }

  // Cargar clientes en cobranzas con paginación
  const loadUnpaidClients = async (page = 1, search = '') => {
    try {
      setLoading(true)
      // Obtener todos los clientes para filtrar los de cobranzas
      const response = await clientService.getClients({ limit: 1000 })
      const allCollectionClients = response.clients?.filter(client => client.in_collections === 'Si') || []
      
      // Aplicar búsqueda si existe
      let filteredClients = allCollectionClients
      if (search) {
        filteredClients = allCollectionClients.filter(client => 
          client.first_name?.toLowerCase().includes(search.toLowerCase()) ||
          client.last_name?.toLowerCase().includes(search.toLowerCase()) ||
          client.email?.toLowerCase().includes(search.toLowerCase()) ||
          client.contract_number?.toLowerCase().includes(search.toLowerCase())
        )
      }
      
      // Implementar paginación manual
      const clientsPerPage = 20
      const startIndex = (page - 1) * clientsPerPage
      const endIndex = startIndex + clientsPerPage
      const paginatedClients = filteredClients.slice(startIndex, endIndex)
      
      setClients(paginatedClients)
      
      // Actualizar información de paginación
      setPagination({
        currentPage: page,
        totalPages: Math.ceil(filteredClients.length / clientsPerPage),
        totalClients: filteredClients.length,
        hasNext: endIndex < filteredClients.length,
        hasPrev: page > 1
      })
      
      console.log(`Cargados ${paginatedClients.length} de ${filteredClients.length} clientes en cobranzas (página ${page})`)
    } catch (error) {
      console.error('Error loading collection clients:', error)
      setError('Error al cargar los clientes en cobranzas')
    } finally {
      setLoading(false)
    }
  }

  const loadCollectionsModuleData = async () => {
    try {
      setCollectionsModuleLoading(true)
      const response = await clientService.getClients({ limit: 1000 })
      const allClients = response.clients || []

      const getClientDate = (client) => {
        const rawDate = client.created_at || client.fecha_registro || client.fecha_creacion || client.fecha
        const parsed = rawDate ? new Date(rawDate) : new Date(0)
        return Number.isNaN(parsed.getTime()) ? new Date(0) : parsed
      }

      const getClientAmount = (client) => {
        const amount = client.pending_amount || client.agreement_remaining_amount || client.total_amount || 0
        return Number(amount) || 0
      }

      const resolveArea = (client) => {
        return client.cobranza_area || client.area_cobranza || client.linner || client.closer || client.usuario_asignado_nombre || 'General'
      }

      // Clientes nuevos (últimos 10)
      const recentClients = [...allClients]
        .sort((a, b) => getClientDate(b) - getClientDate(a))
        .slice(0, 10)
      setNewCollectionClients(recentClients)

      // Pagos por área (solo clientes en cobranzas)
      const collectionClients = allClients.filter(client => client.in_collections === 'Si')
      const areaMap = new Map()
      collectionClients.forEach((client) => {
        const area = resolveArea(client)
        const current = areaMap.get(area) || { area, total: 0, count: 0 }
        current.total += getClientAmount(client)
        current.count += 1
        areaMap.set(area, current)
      })
      const areaList = Array.from(areaMap.values()).sort((a, b) => b.total - a.total)
      setCollectionsByArea(areaList)
    } catch (error) {
      console.error('Error loading collections module data:', error)
      setCollectionsByArea([])
      setNewCollectionClients([])
    } finally {
      setCollectionsModuleLoading(false)
    }
  }

  // Efectos para cargar datos según la sección activa
  useEffect(() => {
    if (activeSection === 'dashboard') {
      loadDashboardData()
      // Cargar reportes solo si no hay errores de token
      const token = localStorage.getItem('authToken');
      if (token && token.length > 50) { // Verificar que el token tenga un formato válido
        loadDashboardReports(dashboardPeriod)
        loadLastMonthSummary(dashboardPeriod) // Cargar sumatorias del período seleccionado
        loadPaymentsSummary() // Cargar resumen de pagos
        loadPaymentsToday() // Cargar pagos de hoy
        loadPaymentsThisMonth() // Cargar pagos de este mes
      }
    } else if (activeSection === 'clientes') {
      loadClients(currentPage, searchTerm)
    } else if (activeSection === 'cobranzas') {
      loadUnpaidClients(currentPage, searchTerm)
      loadCollectionsModuleData()
    } else if (activeSection === 'reservas') {
      loadBookings()
    } else if (activeSection === 'agenda-reservas') {
      loadReservationAgendas()
    } else if (activeSection === 'reportes') {
      loadReportsData(reportsPeriod)
      loadCollectionsDetailedReport() // Cargar reporte detallado de cobranzas
      loadAuditLogs() // Cargar historial de auditoría
      loadAuditStats() // Cargar estadísticas de auditoría
    }
  }, [activeSection, currentPage, dashboardPeriod, reportsPeriod, reservationAgendaSearch, reservationAgendaStatusFilter])

  // Cargar datos iniciales
  useEffect(() => {
    loadDashboardData()
    loadClients(1, '')
    loadBookings()
  }, [])

  // Formatear fecha
  const formatDateString = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  }

  // Ver detalles del cliente
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
  }

  // Ver historial completo de un cliente
  const handleViewClientCollectionsHistory = async (client) => {
    setSelectedClientForHistory(client)
    setShowClientHistoryModal(true)
    setLoadingClientHistory(true)
    try {
      const data = await reportService.getClientCollectionsHistory(client.id)
      setClientHistoryData(data)
    } catch (error) {
      console.error('Error cargando historial del cliente:', error)
      setClientHistoryData(null)
      alert('Error al cargar el historial: ' + (error.response?.data?.error || error.message))
    } finally {
      setLoadingClientHistory(false)
    }
  }

  // Editar cliente
  const handleEditClient = (client) => {
    setSelectedClient(client)
    setShowEditModal(true)
    setEditPassword('')
    setPasswordError('')
  }

  // Eliminar cliente
  const handleDeleteClient = (client) => {
    setSelectedClient(client)
    setShowDeleteModal(true)
    setDeletePassword('')
    setDeletePasswordError('')
  }

  // Validar formulario de cliente
  const validateClientForm = (data) => {
    const errors = {}
    
    // Validar campos obligatorios
    if (!data.nombres || data.nombres.trim() === '') {
      errors.nombres = 'Los nombres son obligatorios'
    }
    
    if (!data.apellidos || data.apellidos.trim() === '') {
      errors.apellidos = 'Los apellidos son obligatorios'
    }
    
    if (!data.cedula || data.cedula.trim() === '') {
      errors.cedula = 'La cédula es obligatoria'
    } else if (!/^\d{10}$/.test(data.cedula.replace(/\s/g, ''))) {
      errors.cedula = 'La cédula debe tener 10 dígitos'
    }
    
    if (!data.contrato_suffix || data.contrato_suffix.trim() === '') {
      errors.contrato_suffix = 'El sufijo del contrato es obligatorio'
    } else if (!/^[A-Z]{3,4}$/.test(data.contrato_suffix)) {
      errors.contrato_suffix = 'El sufijo debe tener 3-4 letras mayúsculas'
    }
    
    // Validar teléfono (obligatorio)
    if (!data.telefono || data.telefono.trim() === '') {
      errors.telefono = 'El teléfono es obligatorio'
    } else {
      const phoneRegex = /^[0-9\s\-\+\(\)]{7,15}$/
      if (!phoneRegex.test(data.telefono)) {
        errors.telefono = 'El formato del teléfono no es válido'
      }
    }
    
    // Validar noches (obligatorio)
    if (data.noches === undefined || data.noches === null || data.noches === '') {
      errors.noches = 'Las noches son obligatorias'
    } else if (data.noches < 0) {
      errors.noches = 'Las noches no pueden ser negativas'
    }
    
    // Validar años (obligatorio)
    if (data.anos === undefined || data.anos === null || data.anos === '') {
      errors.anos = 'Los años son obligatorios'
    } else if (data.anos < 0) {
      errors.anos = 'Los años no pueden ser negativos'
    }
    
    // Validar bono internacional (obligatorio)
    if (!data.bono_internacional || data.bono_internacional.trim() === '') {
      errors.bono_internacional = 'El bono internacional es obligatorio'
    }
    
    // Validar total de venta (obligatorio)
    if (!data.total_venta || data.total_venta <= 0) {
      errors.total_venta = 'El total de venta es obligatorio y debe ser mayor a 0'
    }
    
    // Validar campos específicos según tipo de pago
    if (data.pago_mixto === 'No') {
      // Validar DATAFAST (obligatorio cuando no es pago mixto)
      if (!data.datafast || data.datafast.trim() === '') {
        errors.datafast = 'DATAFAST es obligatorio'
      }
      
      // Validar tipo de tarjeta (obligatorio cuando no es pago mixto)
      if (!data.tipo_tarjeta || data.tipo_tarjeta.trim() === '') {
        errors.tipo_tarjeta = 'El tipo de tarjeta es obligatorio'
      }
      
      // Validar forma de pago (obligatorio cuando no es pago mixto)
      if (!data.forma_pago || data.forma_pago.trim() === '') {
        errors.forma_pago = 'La forma de pago es obligatoria'
      }
      
      // Validar tiempo si es diferido
      if (data.forma_pago === 'Diferido' && (!data.tiempo_meses || data.tiempo_meses.trim() === '')) {
        errors.tiempo_meses = 'El tiempo es obligatorio cuando se selecciona diferido'
      }
    }
    
    // Validar email si se proporciona
    if (data.correo_electronico && data.correo_electronico.trim() !== '') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(data.correo_electronico)) {
        errors.correo_electronico = 'El formato del email no es válido'
      }
    }
    
    setClientFormErrors(errors)
    setIsClientFormValid(Object.keys(errors).length === 0)
    
    return Object.keys(errors).length === 0
  }

  // Generar siguiente número de contrato
  const generateNextContractNumber = async () => {
    try {
      // Obtener todos los clientes para encontrar el último número usado
      const response = await clientService.getClients({ page: 1, limit: 1000 })
      const clients = response.clients || []
      
      // Filtrar contratos que empiecen con KMPRY y extraer números
      const contractNumbers = clients
        .filter(client => client.contract_number && client.contract_number.startsWith('KMPRY'))
        .map(client => {
          const parts = client.contract_number.split(' ')
          const numberPart = parts[parts.length - 1]
          return parseInt(numberPart) || 0
        })
      
      // Encontrar el número más alto y agregar 1
      const maxNumber = contractNumbers.length > 0 ? Math.max(...contractNumbers) : 0
      const nextNumber = (maxNumber + 1).toString().padStart(4, '0')
      
      return nextNumber
    } catch (error) {
      console.error('Error generando número de contrato:', error)
      return '0001' // Fallback
    }
  }

  // Abrir formulario de nuevo cliente
  const handleNewClient = async () => {
    setShowNewClientForm(true)
    
    // Generar siguiente número de contrato
    const nextContractNumber = await generateNextContractNumber()
    
    // Resetear datos del formulario
    setNewClientData({
      fecha: new Date().toISOString().split('T')[0], // Fecha actual
      contrato: '',
      contrato_suffix: '',
      contrato_number: nextContractNumber,
      nombres: '',
      apellidos: '',
      cedula: '',
      telefono: '',
      noches: 0,
      anos: 0,
      bono_internacional: 'No',
      pago_mixto: 'No',
      cantidad_tarjetas: 1,
      tarjetas: [{ tipo: '', monto: 0, datafast: '' }],
      datafast: '',
      tipo_tarjeta: '',
      forma_pago: '',
      tiempo_meses: '',
      total_venta: 0,
      iva: 0,
      neto: 0,
      correo_electronico: '',
      linner: '',
      closer: '',
      observaciones: '',
      version: 'cliente',
      puntos_ib: 0,
      sala: 'Sala 1'
    })
  }

  // Manejar cambios en el formulario de nuevo cliente
  const handleNewClientChange = (field, value) => {
    const updatedData = { ...newClientData, [field]: value }
    
    // Calcular IVA y NETO automáticamente
    if (field === 'total_venta') {
      const totalVenta = parseFloat(value) || 0
      const iva = totalVenta / 1.15 // IVA incluido en el total
      const neto = totalVenta - iva
      updatedData.total_venta = totalVenta
      updatedData.iva = neto // El IVA es lo que antes era NETO
      updatedData.neto = iva // El NETO es lo que antes era IVA
      updatedData.puntos_ib = computePoints(totalVenta)
    }
    
    // Manejar cambio en cantidad de tarjetas
    if (field === 'cantidad_tarjetas') {
      const cantidad = parseInt(value) || 1
      const tarjetas = []
      for (let i = 0; i < cantidad; i++) {
        tarjetas.push({
          tipo: updatedData.tarjetas[i]?.tipo || '',
          monto: updatedData.tarjetas[i]?.monto || 0,
          datafast: updatedData.tarjetas[i]?.datafast || ''
        })
      }
      updatedData.tarjetas = tarjetas
      updatedData.cantidad_tarjetas = cantidad
      
      // Si es pago mixto, calcular total de la venta
      if (updatedData.pago_mixto === 'Si') {
        const totalTarjetas = tarjetas.reduce((sum, tarjeta) => sum + (parseFloat(tarjeta.monto) || 0), 0)
        const iva = totalTarjetas * 0.15
        const neto = totalTarjetas - iva
        updatedData.total_venta = totalTarjetas
        updatedData.iva = iva
        updatedData.neto = neto
        updatedData.puntos_ib = computePoints(totalTarjetas)
      }
    }

    // Manejar campos de pagaré
    if (field === 'monto_pagare' || field === 'cantidad_cuotas' || field === 'cuotas_asumidas') {
      const monto = parseFloat(field === 'monto_pagare' ? value : updatedData.monto_pagare) || 0
      const cantidad = parseInt(field === 'cantidad_cuotas' ? value : updatedData.cantidad_cuotas) || 1
      const cuotasAsum = parseInt(field === 'cuotas_asumidas' ? value : updatedData.cuotas_asumidas) || 0

      updatedData.monto_pagare = monto
      updatedData.cantidad_cuotas = cantidad
      updatedData.cuotas_asumidas = cuotasAsum

      const valorCuota = cantidad > 0 ? monto / cantidad : 0
      updatedData.valor_cuota = parseFloat(valorCuota.toFixed(2))

      const empresaContribution = cuotasAsum * valorCuota
      updatedData.total_pagare = Math.max(0, parseFloat((monto - empresaContribution).toFixed(2)))
    }
    
    // Si se cambia pago mixto a "No", resetear tarjetas
    if (field === 'pago_mixto' && value === 'No') {
      updatedData.cantidad_tarjetas = 1
      updatedData.tarjetas = [{ tipo: '', monto: 0, datafast: '' }]
    }
    
    // Si se cambia pago mixto a "Si", calcular total basado en tarjetas
    if (field === 'pago_mixto' && value === 'Si') {
      const totalTarjetas = updatedData.tarjetas.reduce((sum, tarjeta) => sum + (parseFloat(tarjeta.monto) || 0), 0)
      const iva = totalTarjetas * 0.15
      const neto = totalTarjetas - iva
      updatedData.total_venta = totalTarjetas
      updatedData.iva = iva
      updatedData.neto = neto
      updatedData.puntos_ib = computePoints(totalTarjetas)
    }
    
    // Si se marca "años indefinido", limpiar el campo de años
    if (field === 'anos_indefinido' && value === true) {
      updatedData.anos = 0
    }
    
    setNewClientData(updatedData)
    
    // Validar formulario en tiempo real
    validateClientForm(updatedData)
  }

  // Manejar cambios en tarjetas individuales
  const handleTarjetaChange = (index, field, value) => {
    const updatedData = { ...newClientData }
    updatedData.tarjetas[index] = {
      ...updatedData.tarjetas[index],
      [field]: field === 'monto' ? parseFloat(value) || 0 : value
    }
    
    // Si es pago mixto, calcular total de la venta
    if (updatedData.pago_mixto === 'Si') {
      const totalTarjetas = updatedData.tarjetas.reduce((sum, tarjeta) => sum + (parseFloat(tarjeta.monto) || 0), 0)
      const iva = totalTarjetas * 0.15
      const neto = totalTarjetas - iva
      updatedData.total_venta = totalTarjetas
      updatedData.iva = iva
      updatedData.neto = neto
      updatedData.puntos_ib = computePoints(totalTarjetas)
    }
    
    setNewClientData(updatedData)
  }

  // Guardar nuevo cliente
  const handleSaveNewClient = async () => {
    try {
      // Construir el número de contrato completo
      const contratoCompleto = `KMPRY ${newClientData.contrato_suffix} ${newClientData.contrato_number}`
      
      // Validar campos requeridos
      if (!newClientData.nombres || !newClientData.apellidos || !newClientData.cedula || !newClientData.contrato_suffix) {
        alert('Por favor completa los campos obligatorios: Nombres, Apellidos, Cédula y Sufijo del Contrato')
        return
      }

      // Preparar datos para enviar al backend (solo campos que existen en la tabla)
      // Generar email según la versión seleccionada si no se proporciona uno
      let generatedEmail = newClientData.correo_electronico || ''
      if (!generatedEmail) {
        const cleanContract = contratoCompleto.replace(/\s+/g, '')
        if (newClientData.version === 'clienteIB1') {
          generatedEmail = `clienteib1${cleanContract}@kempery.com`
        } else if (newClientData.version === 'clienteIB2') {
          generatedEmail = `clienteib2${cleanContract}@kempery.com`
        } else {
          generatedEmail = `cliente${cleanContract}@kempery.com`
        }
      }

      const clientData = {
        first_name: newClientData.nombres,
        last_name: newClientData.apellidos,
        email: generatedEmail,
        rol: newClientData.version,
        pagare: newClientData.pagare === 'Si',
        pagare_fecha: newClientData.fecha_pagare || null,
        pagare_monto: parseFloat(newClientData.monto_pagare) || 0,
        pagare_cuotas: parseInt(newClientData.cantidad_cuotas) || 1,
        pagare_cuotas_asumidas: parseInt(newClientData.cuotas_asumidas) || 0,
        pagare_valor_cuota: parseFloat(newClientData.valor_cuota) || 0,
        pagare_total: parseFloat(newClientData.total_pagare) || 0,
        phone: newClientData.telefono || '',
        document_number: newClientData.cedula,
        contract_number: contratoCompleto,
        city: 'Quito', // Ciudad por defecto
        country: 'Ecuador',
        notes: newClientData.observaciones || '',
        // Campos adicionales que se pueden agregar después
        total_amount: newClientData.total_venta,
        payment_status: 'sin_pago',
        international_bonus: newClientData.bono_internacional,
        total_nights: newClientData.noches,
        remaining_nights: newClientData.noches,
        anos: newClientData.anos ?? 0,
        anos_indefinido: newClientData.anos_indefinido ?? false,
        sala: newClientData.sala ?? 'Sala 1',
        puntos_ib: newClientData.puntos_ib ?? 0,
        categoria_cliente: newClientData.version === 'clienteIB1' ? 'gold' : newClientData.version === 'clienteIB2' ? 'black' : 'blue'
      }

      // Si estamos en modo offline, persistir localmente en localStorage
      const OFFLINE = (import.meta.env.VITE_OFFLINE_MODE ?? 'true') === 'true'
      if (OFFLINE) {
        const stored = JSON.parse(localStorage.getItem('clientes_local') || '[]')
        const newId = stored.length > 0 ? Math.max(...stored.map(c => c.id || 0)) + 1 : Date.now()
        const newClient = {
          id: newId,
          first_name: clientData.first_name,
          last_name: clientData.last_name,
          email: clientData.email,
          phone: clientData.phone,
          document_number: clientData.document_number,
          contract_number: clientData.contract_number,
          city: clientData.city,
          country: clientData.country,
          notes: clientData.notes,
          total_amount: clientData.total_amount,
          payment_status: clientData.payment_status,
          international_bonus: clientData.international_bonus,
          total_nights: clientData.total_nights,
          remaining_nights: clientData.remaining_nights,
          rol: clientData.rol,
          pagare: clientData.pagare,
          pagare_fecha: clientData.pagare_fecha,
          pagare_monto: clientData.pagare_monto,
          pagare_cuotas: clientData.pagare_cuotas,
          pagare_cuotas_asumidas: clientData.pagare_cuotas_asumidas,
          pagare_valor_cuota: clientData.pagare_valor_cuota,
          pagare_total: clientData.pagare_total,
          created_at: new Date().toISOString()
        }
        stored.unshift(newClient)
        localStorage.setItem('clientes_local', JSON.stringify(stored))

        // Actualizar estado local para mostrar inmediatamente
        setClients(prev => [newClient, ...(prev || [])])

        // Registrar auditoría (intento, en modo offline se usará adapter simulado)
        await logAuditAction(
          'CREATE',
          'CLIENT',
          newClient.id,
          null,
          clientData,
          `Cliente creado (local): ${clientData.first_name} ${clientData.last_name} - Contrato: ${contratoCompleto}`
        )

        setShowNewClientForm(false)
        alert('Cliente creado localmente')
      } else {
        const response = await clientService.createClient(clientData)
        console.log('Cliente creado:', response)

        // Registrar Puntos IB del cliente para que aparezcan en los dashboards cliente@/clienteib1@/clienteib2@
        const loginEmail = response?.usuario?.email || response?.credenciales?.email || clientData.email
        const puntosToSet = newClientData.puntos_ib ?? 0
        if (loginEmail && (puntosToSet > 0 || response?.usuario?.id)) {
          try {
            const pointsService = (await import('../services/pointsService')).default
            await pointsService.setPointsForUser(loginEmail, puntosToSet)
          } catch (e) {
            console.warn('No se pudo registrar Puntos IB (se creó el cliente):', e)
          }
        }

        // Registrar acción de auditoría
        await logAuditAction(
          'CREATE',
          'CLIENT',
          response?.cliente?.id ?? response?.id,
          null,
          clientData,
          `Cliente creado: ${clientData.first_name} ${clientData.last_name} - Contrato: ${contratoCompleto}`
        )

        // Recargar la lista de clientes
        await loadClients(currentPage, searchTerm)

        // Cerrar el formulario
        setShowNewClientForm(false)

        // Mostrar mensaje de éxito
        alert('Cliente creado correctamente')
      }
    } catch (error) {
      console.error('Error creando cliente:', error)
      const message = error?.response?.data?.error || error?.response?.data?.details || error?.message || 'Error desconocido'
      alert(`Error al crear el cliente: ${message}`)
    }
  }

  // Funciones para manejar reservas
  const handleViewBooking = async (booking) => {
    try {
      const response = await bookingService.getBooking(booking.id);
      setSelectedBooking(response.booking);
      setShowBookingPreview(true);
    } catch (error) {
      console.error('Error obteniendo detalles de la reserva:', error);
      alert('Error al obtener los detalles de la reserva');
    }
  }

  const handleEditBooking = async (booking) => {
    try {
      // Obtener información de edición primero
      const editInfoResponse = await bookingService.getBookingEditInfo(booking.id);
      const editInfo = editInfoResponse.edit_info;

      // Verificar si se puede editar
      if (!editInfo.can_edit) {
        if (editInfo.is_lost) {
          alert(`Esta reserva ha sido marcada como perdida debido a múltiples ediciones (${editInfo.edit_count} ediciones). No se puede editar más.`);
        } else {
          alert(`Esta reserva ha alcanzado el límite máximo de ediciones (${editInfo.edit_count} ediciones). No se puede editar más.`);
        }
        return;
      }

      // Mostrar advertencia de penalidad si aplica
      if (editInfo.next_penalty > 0) {
        const confirmEdit = window.confirm(
          `⚠️ ADVERTENCIA DE PENALIDAD ⚠️\n\n` +
          `Esta será la edición #${editInfo.edit_count + 1} de esta reserva.\n` +
          `Se aplicará una penalidad de $${editInfo.next_penalty}.\n` +
          `Penalidad total acumulada: $${editInfo.total_penalty + editInfo.next_penalty}\n\n` +
          `Ediciones restantes: ${editInfo.remaining_edits - 1}\n\n` +
          `¿Está seguro de que desea continuar con la edición?`
        );
        
        if (!confirmEdit) {
          return;
        }
      }

      // Obtener detalles completos de la reserva
      const response = await bookingService.getBooking(booking.id);
      const bookingDetails = response.booking;
      
      // Cargar datos del cliente usando la función correcta
      try {
        const clientResponse = await bookingService.validateContract(bookingDetails.contract_number);
        if (clientResponse.client) {
          setEditValidatedClient(clientResponse.client);
        }
      } catch (clientError) {
        console.log('No se pudo cargar el cliente, continuando sin datos del cliente');
        setEditValidatedClient(null);
      }
      
      // Preparar datos del formulario de edición
      setEditBookingFormData({
        contract_number: bookingDetails.contract_number || '',
        city: bookingDetails.city || '',
        custom_city: bookingDetails.custom_city || '',
        nights_requested: bookingDetails.nights_requested || '',
        people_count: bookingDetails.people_count || 1,
        reservation_value: bookingDetails.reservation_value || '',
        custom_value: bookingDetails.reservation_value || '',
        contact_source: bookingDetails.contact_source || '',
        observations: bookingDetails.observations || '',
        check_in_date: bookingDetails.check_in_date || '',
        check_out_date: bookingDetails.check_out_date || '',
        special_requests: bookingDetails.special_requests || '',
        emergency_contact: bookingDetails.emergency_contact || '',
        dietary_restrictions: bookingDetails.dietary_restrictions || '',
        wifi_name: bookingDetails.wifi_name || '',
        wifi_password: bookingDetails.wifi_password || '',
        google_maps_link: bookingDetails.google_maps_link || ''
      });
      
      // Preparar datos de participantes
      setEditParticipantsData(bookingDetails.participants_data || []);
      
      // Establecer la reserva que se está editando
      setEditingBooking(bookingDetails);
      setShowEditBookingForm(true);
      
    } catch (error) {
      console.error('Error obteniendo detalles de la reserva:', error);
      alert('Error al cargar los datos de la reserva para editar');
    }
  }

  const handleDeleteBooking = async (booking) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar la reserva ${booking.booking_number}?`)) {
      try {
        await bookingService.deleteBooking(booking.id);
        
        // Registrar acción de auditoría
        await logAuditAction(
          'DELETE',
          'BOOKING',
          booking.id,
          booking,
          null,
          `Reserva eliminada: ${booking.contract_number} - ${booking.city}`
        )
        
        alert('Reserva eliminada exitosamente');
        fetchBookings(); // Recargar la lista
      } catch (error) {
        console.error('Error eliminando reserva:', error);
        alert('Error al eliminar la reserva');
      }
    }
  }

  const handleSendWhatsAppDocument = async (booking) => {
    try {
      const response = await documentService.generateAndSendDocument(booking.id);
      if (response.message) {
        alert('Documento enviado por WhatsApp exitosamente');
      } else {
        alert('Error al enviar el documento por WhatsApp');
      }
    } catch (error) {
      console.error('Error enviando documento por WhatsApp:', error);
      alert('Error al enviar el documento por WhatsApp');
    }
  }

  // Buscar contratos por últimos 4 dígitos
  const handleSearchContracts = async () => {
    if (!contractSearchTerm.trim()) {
      setBookingError('Por favor ingresa los últimos 4 dígitos del contrato')
      return
    }

    if (!/^\d{4}$/.test(contractSearchTerm)) {
      setBookingError('Debe ingresar exactamente 4 dígitos')
      return
    }

    try {
      setBookingError('')
      const response = await bookingService.searchContracts(contractSearchTerm)
      setContractSearchResults(response.clients)
      setShowContractSearch(true)
    } catch (error) {
      console.error('Error buscando contratos:', error)
      setBookingError(error.response?.data?.error || 'Error al buscar contratos')
      setContractSearchResults([])
    }
  }

  // Seleccionar contrato de los resultados de búsqueda
  const handleSelectContract = (client) => {
    setBookingFormData(prev => ({
      ...prev,
      contract_number: client.contract_number
    }))
    setValidatedClient(client)
    setShowContractSearch(false)
    setContractSearchResults([])
    setContractSearchTerm('')
    setBookingError('')
  }


  // Manejar cambios en el formulario de reserva
  const handleBookingFormChange = (field, value) => {
    setBookingFormData(prev => ({
      ...prev,
      [field]: value
    }))

    // Si cambia la cantidad de personas, actualizar datos de participantes
    if (field === 'people_count') {
      const newCount = parseInt(value) || 1
      setParticipantsData(prev => {
        const newParticipants = []
        for (let i = 0; i < newCount; i++) {
          newParticipants.push(prev[i] || { 
            first_name: '', 
            last_name: '', 
            identification: '',
            relationship: 'Adulto'
          })
        }
        return newParticipants
      })
    }
    
    // Si cambia la ciudad, limpiar ciudad personalizada
    if (field === 'city' && value !== 'Otros') {
      setBookingFormData(prev => ({
        ...prev,
        custom_city: ''
      }))
    }
  }

  // Función para actualizar datos de participantes
  const handleParticipantChange = (index, field, value) => {
    setParticipantsData(prev => {
      const newParticipants = [...prev]
      newParticipants[index] = {
        ...newParticipants[index],
        [field]: value
      }
      return newParticipants
    })
  }

  // Funciones para manejar cambios en el formulario de edición
  const handleEditBookingFormChange = (field, value) => {
    setEditBookingFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Si cambia la cantidad de personas, actualizar participantes
    if (field === 'people_count') {
      const newCount = parseInt(value) || 1
      setEditParticipantsData(prev => {
        const newParticipants = []
        for (let i = 0; i < newCount; i++) {
          newParticipants.push(prev[i] || { 
            first_name: '', 
            last_name: '', 
            identification: '',
            relationship: 'Adulto'
          })
        }
        return newParticipants
      })
    }
    
    // Si cambia la ciudad, limpiar ciudad personalizada
    if (field === 'city' && value !== 'Otros') {
      setEditBookingFormData(prev => ({
        ...prev,
        custom_city: ''
      }))
    }
  }

  const handleEditParticipantChange = (index, field, value) => {
    setEditParticipantsData(prev => {
      const newParticipants = [...prev]
      newParticipants[index] = {
        ...newParticipants[index],
        [field]: value
      }
      return newParticipants
    })
  }

  // Función para cargar reportes del dashboard
  const loadDashboardReports = async (period = 'month') => {
    try {
      setDashboardLoading(true);
      const reportData = await reportService.getDashboardReport(period);
      setDashboardReports(reportData);
    } catch (error) {
      console.error('Error cargando reportes del dashboard:', error);
      
      // Si es un error de autenticación, mostrar datos por defecto
      if (error.response?.status === 403 || error.response?.status === 401) {
        console.log('🔐 Error de autenticación en reportes, usando datos por defecto');
        // Establecer datos por defecto en lugar de mostrar error
        setDashboardReports({
          period: period,
          dateRange: {
            startDate: new Date().toISOString(),
            endDate: new Date().toISOString()
          },
          metrics: {
            total_clientes: '0',
            total_reservas: '0',
            total_requerimientos: '0',
            total_cobranzas: '0',
            total_ventas: '0',
            total_reservas_monto: null,
            reservas_activas: '0',
            reservas_canceladas: '0'
          },
          trends: []
        });
      }
    } finally {
      setDashboardLoading(false);
    }
  };

  // Función para cargar sumatorias del período seleccionado
  const loadLastMonthSummary = async (period = 'this_month') => {
    try {
      console.log(`📊 Cargando sumatorias para ${period}...`);
      const summaryData = await reportService.getLastMonthSummary(period);
      setLastMonthSummary(summaryData);
      console.log(`✅ Sumatorias para ${period} cargadas:`, summaryData);
    } catch (error) {
      console.error('Error cargando sumatorias del período:', error);
      // En caso de error, mantener los valores por defecto
    }
  };

  // Función para cargar resumen de pagos
  const loadPaymentsSummary = async () => {
    try {
      setPaymentsSummaryLoading(true)
      
      // Llamar al servicio de reportes
      const data = await reportService.getPaymentsSummary()
      setPaymentsSummary(data)
      
      console.log('✅ Resumen de pagos cargado:', data)
    } catch (error) {
      console.error('Error cargando resumen de pagos:', error)
      // Establecer valores por defecto en caso de error
      setPaymentsSummary({
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
    } finally {
      setPaymentsSummaryLoading(false)
    }
  }

  // Cargar pagos de hoy
  const loadPaymentsToday = async () => {
    try {
      setPaymentsToday(prev => ({ ...prev, loading: true }))
      
      const today = new Date().toISOString().split('T')[0]
      const response = await paymentService.getPayments({ date: today })
      
      const payments = response.payments || []
      const totalAmount = payments.reduce((sum, payment) => sum + (parseFloat(payment.payment_amount) || 0), 0)
      
      setPaymentsToday({
        count: payments.length,
        amount: totalAmount,
        loading: false
      })
    } catch (error) {
      console.error('Error cargando pagos de hoy:', error)
      setPaymentsToday({
        count: 0,
        amount: 0,
        loading: false
      })
    }
  }

  // Cargar pagos de este mes
  const loadPaymentsThisMonth = async () => {
    try {
      setPaymentsThisMonth(prev => ({ ...prev, loading: true }))
      
      const now = new Date()
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]
      
      const response = await paymentService.getPayments({ 
        start_date: firstDay, 
        end_date: lastDay 
      })
      
      const payments = response.payments || []
      const totalAmount = payments.reduce((sum, payment) => sum + (parseFloat(payment.payment_amount) || 0), 0)
      
      setPaymentsThisMonth({
        count: payments.length,
        amount: totalAmount,
        loading: false
      })
    } catch (error) {
      console.error('Error cargando pagos de este mes:', error)
      setPaymentsThisMonth({
        count: 0,
        amount: 0,
        loading: false
      })
    }
  }

  // Función para obtener el rango de fechas según el período
  const getDateRange = (period) => {
    const now = new Date()
    let startDate, endDate

    switch (period) {
      case 'yesterday':
        const yesterday = new Date(now)
        yesterday.setDate(yesterday.getDate() - 1)
        startDate = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate())
        endDate = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 23, 59, 59)
        break
      case 'last_month':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)
        break
      case 'this_month':
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
        break
    }

    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    }
  }

  // Cargar clientes de ventas del período
  const loadSalesClients = async () => {
    try {
      setSalesClientsLoading(true)
      const { startDate, endDate } = getDateRange(dashboardPeriod)
      
      const response = await clientService.getClients({
        page: 1,
        limit: 1000,
        startDate,
        endDate
      })
      
      setSalesClients(response.clients || [])
    } catch (error) {
      console.error('Error cargando clientes de ventas:', error)
      setSalesClients([])
    } finally {
      setSalesClientsLoading(false)
    }
  }

  // Cargar clientes en cobranzas del período
  const loadCollectionsClients = async () => {
    try {
      setCollectionsClientsLoading(true)
      const { startDate, endDate } = getDateRange(dashboardPeriod)
      
      const response = await clientService.getClients({
        page: 1,
        limit: 1000,
        inCollections: 'Si',
        startDate,
        endDate
      })
      
      setCollectionsClients(response.clients || [])
    } catch (error) {
      console.error('Error cargando clientes en cobranzas:', error)
      setCollectionsClients([])
    } finally {
      setCollectionsClientsLoading(false)
    }
  }

  // Cargar reservas del período
  const loadPeriodBookings = async () => {
    try {
      setPeriodBookingsLoading(true)
      const { startDate, endDate } = getDateRange(dashboardPeriod)
      
      const response = await bookingService.getBookings({
        page: 1,
        limit: 1000,
        startDate,
        endDate
      })
      
      setPeriodBookings(response.bookings || [])
    } catch (error) {
      console.error('Error cargando reservas del período:', error)
      setPeriodBookings([])
    } finally {
      setPeriodBookingsLoading(false)
    }
  }

  // Cargar pagos de hoy (detalle)
  const loadTodayPaymentsDetail = async () => {
    try {
      setTodayPaymentsLoading(true)
      const today = new Date().toISOString().split('T')[0]
      const response = await paymentService.getPayments({ date: today })
      setTodayPayments(response.payments || [])
    } catch (error) {
      console.error('Error cargando detalle de pagos de hoy:', error)
      setTodayPayments([])
    } finally {
      setTodayPaymentsLoading(false)
    }
  }

  // Cargar pagos de este mes (detalle)
  const loadThisMonthPaymentsDetail = async () => {
    try {
      setThisMonthPaymentsLoading(true)
      const now = new Date()
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]
      
      const response = await paymentService.getPayments({ 
        start_date: firstDay, 
        end_date: lastDay 
      })
      
      setThisMonthPayments(response.payments || [])
    } catch (error) {
      console.error('Error cargando detalle de pagos de este mes:', error)
      setThisMonthPayments([])
    } finally {
      setThisMonthPaymentsLoading(false)
    }
  }

  // Handlers para abrir modales
  const handleOpenSalesModal = async () => {
    setShowSalesModal(true)
    await loadSalesClients()
  }

  const handleOpenCollectionsModal = async () => {
    setShowCollectionsModal(true)
    await loadCollectionsClients()
  }

  const handleOpenBookingsModal = async () => {
    setShowBookingsModal(true)
    await loadPeriodBookings()
  }

  const handleOpenPaymentsTodayModal = async () => {
    setShowPaymentsTodayModal(true)
    await loadTodayPaymentsDetail()
  }

  const handleOpenPaymentsThisMonthModal = async () => {
    setShowPaymentsThisMonthModal(true)
    await loadThisMonthPaymentsDetail()
  }

  // Función helper para registrar cambios de auditoría
  const logAuditAction = async (action, entityType, entityId, oldData = null, newData = null, details = '') => {
    try {
      const auditData = {
        action, // CREATE, UPDATE, DELETE, etc.
        entity_type: entityType, // CLIENT, BOOKING, REQUIREMENT, etc.
        entity_id: entityId,
        user_id: user?.id,
        user_email: user?.email,
        user_role: (user?.rol || user?.role) || 'admin',
        old_data: oldData,
        new_data: newData,
        details,
        timestamp: new Date().toISOString(),
        ip_address: 'N/A', // Se puede obtener del backend
        user_agent: navigator.userAgent
      }
      
      await auditService.createAuditLog(auditData)
    } catch (error) {
      console.error('Error registrando acción de auditoría:', error)
      // No lanzar error para no interrumpir el flujo principal
    }
  }

  // Cargar historial de auditoría
  const loadAuditLogs = async (params = {}) => {
    try {
      setAuditLogsLoading(true)
      setAuditLogsError('')
      
      // Combinar filtros con parámetros
      const filterParams = {
        page: 1,
        limit: 100,
        sort: 'timestamp',
        order: 'desc',
        ...auditFilters,
        ...params
      }
      
      // Remover filtros vacíos
      Object.keys(filterParams).forEach(key => {
        if (filterParams[key] === '' || filterParams[key] === null || filterParams[key] === undefined) {
          delete filterParams[key]
        }
      })
      
      const response = await auditService.getAuditLogs(filterParams)
      
      setAuditLogs(response.audit_logs || [])
    } catch (error) {
      console.error('Error cargando historial de auditoría:', error)
      setAuditLogsError('Error al cargar el historial de cambios')
      setAuditLogs([])
    } finally {
      setAuditLogsLoading(false)
    }
  }

  // Manejar cambios en filtros de auditoría
  const handleAuditFilterChange = (field, value) => {
    setAuditFilters(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Aplicar filtros de auditoría
  const applyAuditFilters = () => {
    loadAuditLogs()
  }

  // Limpiar filtros de auditoría
  const clearAuditFilters = () => {
    setAuditFilters({
      startDate: '',
      endDate: '',
      userId: '',
      action: '',
      entityType: ''
    })
    loadAuditLogs()
  }

  // Cargar estadísticas de auditoría
  const loadAuditStats = async () => {
    try {
      const response = await auditService.getAuditStats()
      setAuditStats(response)
    } catch (error) {
      console.error('Error cargando estadísticas de auditoría:', error)
    }
  }

  // Funciones para el módulo de reportes
  const loadReportsData = async (period = 'today') => {
    try {
      setReportsLoading(true);
      console.log('🔄 Cargando datos de reportes para período:', period);
      
      const [salesData, clientsData, bookingsData, requirementsData] = await Promise.all([
        reportService.getSalesReport(period),
        reportService.getCollectionsReport(period),
        reportService.getBookingsReport(period),
        reportService.getRequirementsReport(period)
      ]);
      
      console.log('📊 Datos recibidos:', {
        sales: salesData,
        clients: clientsData,
        bookings: bookingsData,
        requirements: requirementsData
      });
      
      setReportsData({
        sales: salesData,
        clients: clientsData,
        bookings: bookingsData,
        requirements: requirementsData
      });
    } catch (error) {
      console.error('❌ Error cargando datos de reportes:', error);
      
      // Si es un error de autenticación, solo mostrar error sin limpiar token
      if (error.response?.status === 403 || error.response?.status === 401) {
        console.log('🔐 Error de autenticación detectado en reportes:', error.response?.data?.error);
        // No limpiar automáticamente, solo mostrar error
        setError('Error de autenticación. Por favor, recarga la página.');
        return;
      }
      
      // Mostrar datos por defecto en caso de error
      setReportsData({
        sales: { total_sales: 0, new_clients: 0, average_ticket: 0 },
        clients: { total_clients: 0, in_collections: 0, active_clients: 0 },
        bookings: { total_bookings: 0, confirmed_bookings: 0, cancelled_bookings: 0, pending_bookings: 0 },
        requirements: { total_requirements: 0, completed_requirements: 0, pending_requirements: 0 }
      });
    } finally {
      setReportsLoading(false);
    }
  };

  // Cargar reporte detallado de cobranzas
  const loadCollectionsDetailedReport = async () => {
    try {
      setCollectionsDetailedLoading(true);
      const data = await reportService.getCollectionsDetailedReport();
      setCollectionsDetailedData(data);
    } catch (error) {
      console.error('❌ Error cargando reporte detallado de cobranzas:', error);
      setCollectionsDetailedData(null);
    } finally {
      setCollectionsDetailedLoading(false);
    }
  };

  const handleReportsPeriodChange = (period) => {
    setReportsPeriod(period);
    loadReportsData(period);
  };

  const getDateRangeLabel = (period) => {
    const today = new Date();
    switch (period) {
      case 'today':
        return `Hoy (${today.toLocaleDateString('es-ES')})`;
      case 'yesterday':
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        return `Ayer (${yesterday.toLocaleDateString('es-ES')})`;
      case '13days':
        const thirteenDaysAgo = new Date(today);
        thirteenDaysAgo.setDate(thirteenDaysAgo.getDate() - 13);
        return `Hace 13 días (${thirteenDaysAgo.toLocaleDateString('es-ES')})`;
      default:
        return 'Hoy';
    }
  };

  // Funciones de exportación
  const exportSalesReport = () => {
    console.log('🔄 Intentando exportar reporte de ventas...');
    console.log('📊 Datos de ventas:', reportsData.sales);
    
    if (!reportsData.sales) {
      console.log('❌ No hay datos de ventas');
      alert('No hay datos de ventas para exportar');
      return;
    }
    
    const exportData = [
      {
        'Período': getDateRangeLabel(reportsPeriod),
        'Total Ventas': `$${reportsData.sales.total_sales?.toLocaleString() || 0}`,
        'Nuevos Clientes': reportsData.sales.new_clients || 0,
        'Ticket Promedio': `$${reportsData.sales.average_ticket?.toLocaleString() || 0}`
      }
    ];
    
    console.log('📋 Datos a exportar:', exportData);
    console.log('🔧 Llamando a reportService.exportToExcel...');
    
    try {
      reportService.exportToExcel(exportData, 'Reporte_Ventas');
      console.log('✅ Exportación iniciada');
    } catch (error) {
      console.error('❌ Error en exportación:', error);
      alert('Error al exportar el reporte: ' + error.message);
    }
  };

  const exportClientsReport = () => {
    console.log('🔄 Intentando exportar reporte de clientes...');
    
    if (!reportsData.clients) {
      console.log('❌ No hay datos de clientes');
      alert('No hay datos de clientes para exportar');
      return;
    }
    
    const exportData = [
      {
        'Período': getDateRangeLabel(reportsPeriod),
        'Total Clientes': reportsData.clients.total_clients || 0,
        'En Cobranzas': reportsData.clients.in_collections || 0,
        'Clientes Activos': reportsData.clients.active_clients || 0
      }
    ];
    
    console.log('📋 Datos a exportar:', exportData);
    
    try {
      reportService.exportToExcel(exportData, 'Reporte_Clientes');
      console.log('✅ Exportación iniciada');
    } catch (error) {
      console.error('❌ Error en exportación:', error);
      alert('Error al exportar el reporte: ' + error.message);
    }
  };

  const exportBookingsReport = () => {
    console.log('🔄 Intentando exportar reporte de reservas...');
    
    if (!reportsData.bookings) {
      console.log('❌ No hay datos de reservas');
      alert('No hay datos de reservas para exportar');
      return;
    }
    
    const exportData = [
      {
        'Período': getDateRangeLabel(reportsPeriod),
        'Total Reservas': reportsData.bookings.total_bookings || 0,
        'Confirmadas': reportsData.bookings.confirmed_bookings || 0,
        'Canceladas': reportsData.bookings.cancelled_bookings || 0,
        'Pendientes': reportsData.bookings.pending_bookings || 0
      }
    ];
    
    console.log('📋 Datos a exportar:', exportData);
    
    try {
      reportService.exportToExcel(exportData, 'Reporte_Reservas');
      console.log('✅ Exportación iniciada');
    } catch (error) {
      console.error('❌ Error en exportación:', error);
      alert('Error al exportar el reporte: ' + error.message);
    }
  };

  // Función para exportar reporte completo de cobranzas
  const exportCollectionsFullReport = async () => {
    try {
      console.log('🔄 Cargando reporte completo de cobranzas...');
      setCollectionsDetailedLoading(true);
      
      const fullReportData = await reportService.getCollectionsFullReport();
      
      if (!fullReportData || !fullReportData.report || fullReportData.report.length === 0) {
        alert('No hay datos de cobranzas para exportar');
        return;
      }

      // Convertir datos anidados a formato plano para Excel
      const exportData = [];
      
      fullReportData.report.forEach((clientData, index) => {
        const client = clientData.client;
        
        // Si el cliente tiene gestiones, convenios o pagos, crear filas separadas
        const hasManagements = clientData.managements.list.length > 0;
        const hasAgreements = clientData.agreements.list.length > 0;
        const hasPayments = clientData.payments_summary.payments_detail.length > 0;
        
        if (!hasManagements && !hasAgreements && !hasPayments) {
          // Cliente sin actividad - una sola fila
          exportData.push({
            'N°': index + 1,
            'Contrato': client.contract_number,
            'Cliente': `${client.first_name} ${client.last_name}`,
            'Email': client.email,
            'Teléfono': client.phone || 'N/A',
            'Monto Total': formatCurrency(client.total_amount),
            'Deuda Pendiente': formatCurrency(client.pending_debt),
            'Estado Pago': client.payment_status || 'Pendiente',
            'Total Gestiones': 0,
            'Última Gestión': 'N/A',
            'Total Convenios': 0,
            'Convenio - Total': 'N/A',
            'Convenio - Cuotas': 'N/A',
            'Convenio - Valor Cuota': 'N/A',
            'Convenio - Pagado': 'N/A',
            'Convenio - Pendiente': 'N/A',
            'Total Pagos': 0,
            'Total Pagado': formatCurrency(0),
            'Cuotas Pagadas': 0
          });
        } else {
          // Cliente con actividad - crear filas para cada gestión, convenio y pago
          let rowIndex = 0;
          
          // Si hay gestiones, crear una fila por gestión
          if (hasManagements) {
            clientData.managements.list.forEach((management, mgmtIndex) => {
              exportData.push({
                'N°': index + 1,
                'Contrato': client.contract_number,
                'Cliente': `${client.first_name} ${client.last_name}`,
                'Email': client.email,
                'Teléfono': client.phone || 'N/A',
                'Monto Total': formatCurrency(client.total_amount),
                'Deuda Pendiente': formatCurrency(client.pending_debt),
                'Estado Pago': client.payment_status || 'Pendiente',
                'Total Gestiones': clientData.managements.total,
                'Última Gestión': new Date(management.management_date).toLocaleDateString('es-ES'),
                'Gestión - Fecha': new Date(management.management_date).toLocaleDateString('es-ES'),
                'Gestión - Observación': management.observation || 'N/A',
                'Gestión - Realizada Por': management.created_by || 'N/A',
                'Total Convenios': clientData.agreements.total,
                'Convenio - Total': hasAgreements ? formatCurrency(clientData.agreements.list[0].total_amount) : 'N/A',
                'Convenio - Cuotas': hasAgreements ? clientData.agreements.list[0].installment_count : 'N/A',
                'Convenio - Valor Cuota': hasAgreements ? formatCurrency(clientData.agreements.list[0].installment_amount) : 'N/A',
                'Convenio - Pagado': hasAgreements ? formatCurrency(clientData.agreements.list[0].total_paid) : 'N/A',
                'Convenio - Pendiente': hasAgreements ? formatCurrency(clientData.agreements.list[0].remaining_amount) : 'N/A',
                'Total Pagos': clientData.payments_summary.total_payments,
                'Total Pagado': formatCurrency(clientData.payments_summary.total_amount),
                'Cuotas Pagadas': hasAgreements ? clientData.agreements.list[0].payments_made : 0
              });
            });
          }
          
          // Si hay convenios, crear filas adicionales
          if (hasAgreements) {
            clientData.agreements.list.forEach((agreement, agmtIndex) => {
              // Si ya hay filas de gestiones, agregar información de convenio a filas existentes o crear nuevas
              if (exportData.length === 0 || !hasManagements) {
                exportData.push({
                  'N°': index + 1,
                  'Contrato': client.contract_number,
                  'Cliente': `${client.first_name} ${client.last_name}`,
                  'Email': client.email,
                  'Teléfono': client.phone || 'N/A',
                  'Monto Total': formatCurrency(client.total_amount),
                  'Deuda Pendiente': formatCurrency(client.pending_debt),
                  'Estado Pago': client.payment_status || 'Pendiente',
                  'Total Gestiones': clientData.managements.total,
                  'Última Gestión': clientData.managements.list.length > 0 
                    ? new Date(clientData.managements.list[0].management_date).toLocaleDateString('es-ES')
                    : 'N/A',
                  'Total Convenios': clientData.agreements.total,
                  'Convenio - Contrato': agreement.contract_number,
                  'Convenio - Total': formatCurrency(agreement.total_amount),
                  'Convenio - Cuotas': agreement.installment_count,
                  'Convenio - Valor Cuota': formatCurrency(agreement.installment_amount),
                  'Convenio - Fecha Inicio': new Date(agreement.start_date).toLocaleDateString('es-ES'),
                  'Convenio - Fecha Fin': new Date(agreement.end_date).toLocaleDateString('es-ES'),
                  'Convenio - Vencimiento': agreement.due_date ? new Date(agreement.due_date).toLocaleDateString('es-ES') : 'N/A',
                  'Convenio - Estado': agreement.status || 'N/A',
                  'Convenio - Pagado': formatCurrency(agreement.total_paid),
                  'Convenio - Pendiente': formatCurrency(agreement.remaining_amount),
                  'Cuotas Pagadas': agreement.payments_made,
                  'Total Pagos': clientData.payments_summary.total_payments,
                  'Total Pagado': formatCurrency(clientData.payments_summary.total_amount)
                });
              }
              
              // Agregar filas para cada pago del convenio
              if (agreement.payments_detail && agreement.payments_detail.length > 0) {
                agreement.payments_detail.forEach((payment) => {
                  exportData.push({
                    'N°': index + 1,
                    'Contrato': client.contract_number,
                    'Cliente': `${client.first_name} ${client.last_name}`,
                    'Email': client.email,
                    'Teléfono': client.phone || 'N/A',
                    'Monto Total': formatCurrency(client.total_amount),
                    'Deuda Pendiente': formatCurrency(client.pending_debt),
                    'Estado Pago': client.payment_status || 'Pendiente',
                    'Pago - Fecha': new Date(payment.payment_date).toLocaleDateString('es-ES'),
                    'Pago - Monto': formatCurrency(payment.payment_amount),
                    'Pago - Método': payment.payment_method || 'N/A',
                    'Pago - Recibo': payment.receipt_number || 'N/A',
                    'Pago - Cuota #': payment.installment_number || 'N/A',
                    'Pago - Notas': payment.notes || 'N/A',
                    'Pago - Realizado Por': payment.created_by || 'N/A',
                    'Convenio - Total': formatCurrency(agreement.total_amount),
                    'Convenio - Cuotas': agreement.installment_count,
                    'Convenio - Valor Cuota': formatCurrency(agreement.installment_amount)
                  });
                });
              }
            });
          }
          
          // Si no hay gestiones ni convenios pero hay pagos directos
          if (!hasManagements && !hasAgreements && hasPayments) {
            clientData.payments_summary.payments_detail.forEach((payment) => {
              exportData.push({
                'N°': index + 1,
                'Contrato': client.contract_number,
                'Cliente': `${client.first_name} ${client.last_name}`,
                'Email': client.email,
                'Teléfono': client.phone || 'N/A',
                'Monto Total': formatCurrency(client.total_amount),
                'Deuda Pendiente': formatCurrency(client.pending_debt),
                'Estado Pago': client.payment_status || 'Pendiente',
                'Pago - Fecha': new Date(payment.payment_date).toLocaleDateString('es-ES'),
                'Pago - Monto': formatCurrency(payment.payment_amount),
                'Pago - Método': payment.payment_method || 'N/A',
                'Pago - Recibo': payment.receipt_number || 'N/A',
                'Pago - Cuota #': payment.installment_number || 'N/A',
                'Pago - Notas': payment.notes || 'N/A',
                'Pago - Realizado Por': payment.created_by || 'N/A'
              });
            });
          }
        }
      });

      console.log('📋 Datos a exportar:', exportData);
      console.log(`📊 Total de filas: ${exportData.length}`);
      
      reportService.exportToExcel(exportData, `Reporte_Completo_Cobranzas_${new Date().toISOString().split('T')[0]}`);
      console.log('✅ Exportación completada');
      
    } catch (error) {
      console.error('❌ Error exportando reporte completo de cobranzas:', error);
      alert('Error al exportar el reporte: ' + (error.response?.data?.error || error.message));
    } finally {
      setCollectionsDetailedLoading(false);
    }
  };

  const exportRequirementsReport = () => {
    console.log('🔄 Intentando exportar reporte de requerimientos...');
    
    if (!reportsData.requirements) {
      console.log('❌ No hay datos de requerimientos');
      alert('No hay datos de requerimientos para exportar');
      return;
    }
    
    const exportData = [
      {
        'Período': getDateRangeLabel(reportsPeriod),
        'Total Requerimientos': reportsData.requirements.total_requirements || 0,
        'Completados': reportsData.requirements.completed_requirements || 0,
        'Pendientes': reportsData.requirements.pending_requirements || 0
      }
    ];
    
    console.log('📋 Datos a exportar:', exportData);
    
    try {
      reportService.exportToExcel(exportData, 'Reporte_Requerimientos');
      console.log('✅ Exportación iniciada');
    } catch (error) {
      console.error('❌ Error en exportación:', error);
      alert('Error al exportar el reporte: ' + error.message);
    }
  };

  const handleDashboardPeriodChange = (period) => {
    setDashboardPeriod(period);
    loadDashboardReports(period);
  };

  // Funciones para cancelaciones
  const loadCancellations = async () => {
    try {
      setLoading(true)
      // Cargar reservas activas (confirmadas y pendientes) para mostrar en cancelaciones
      const response = await bookingService.getBookings()
      const activeBookings = response.bookings?.filter(booking => 
        booking.status === 'confirmed' || booking.status === 'pending'
      ) || []
      setCancellations(activeBookings)
    } catch (error) {
      console.error('Error loading cancellations:', error)
      setCancellations([])
    } finally {
      setLoading(false)
    }
  }

  const handleCancellationFormChange = (field, value) => {
    setCancellationFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSelectBookingForCancellation = (booking) => {
    setSelectedBookingForCancellation(booking)
    setCancellationFormData(prev => ({
      ...prev,
      booking_id: booking.id
    }))
    setShowCancellationForm(true)
  }

  const handleCreateCancellation = async () => {
    if (!selectedBookingForCancellation) {
      setCancellationError('Debes seleccionar una reserva primero')
      return
    }

    if (!cancellationFormData.reason || !cancellationFormData.penalty_type) {
      setCancellationError('Por favor completa todos los campos requeridos')
      return
    }

    if (cancellationFormData.penalty_type === 'porcentaje' && !cancellationFormData.penalty_percentage) {
      setCancellationError('Debes especificar el porcentaje de penalización')
      return
    }

    if (cancellationFormData.penalty_type === 'monto_fijo' && !cancellationFormData.penalty_amount) {
      setCancellationError('Debes especificar el monto de penalización')
      return
    }

    try {
      setCancellationLoading(true)
      setCancellationError('')

      const cancellationData = {
        booking_id: cancellationFormData.booking_id,
        reason: cancellationFormData.reason,
        penalty_type: cancellationFormData.penalty_type,
        penalty_amount: cancellationFormData.penalty_type === 'monto_fijo' ? 
          parseFloat(cancellationFormData.penalty_amount) : null,
        penalty_percentage: cancellationFormData.penalty_type === 'porcentaje' ? 
          parseFloat(cancellationFormData.penalty_percentage) : null,
        notes: cancellationFormData.notes
      }

      console.log('Datos de cancelación:', cancellationData)
      
      // Registrar en el historial de auditoría
      try {
        await auditService.createAuditLog({
          action: 'booking_cancellation',
          entity_type: 'booking',
          entity_id: cancellationFormData.booking_id,
          user_id: user?.id,
          user_email: user?.email,
          user_role: user?.role,
          old_data: JSON.stringify({
            booking_id: cancellationFormData.booking_id,
            contract_number: selectedBookingForCancellation.contract_number,
            status: selectedBookingForCancellation.status,
            total_value: selectedBookingForCancellation.total_value
          }),
          new_data: JSON.stringify(cancellationData),
          details: `Reserva ${cancellationFormData.booking_id} cancelada. Razón: ${cancellationFormData.reason}. Penalización: ${cancellationFormData.penalty_type}`,
          ip_address: '127.0.0.1',
          user_agent: navigator.userAgent
        })
      } catch (auditError) {
        console.error('Error registrando en auditoría:', auditError)
        // No fallar la cancelación por error de auditoría
      }
      
      // Simular creación exitosa
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Recargar cancelaciones
      await loadCancellations()
      
      // Cerrar formulario
      setShowCancellationForm(false)
      setSelectedBookingForCancellation(null)
      setCancellationFormData({
        booking_id: '',
        reason: '',
        penalty_amount: '',
        penalty_type: '',
        penalty_percentage: '',
        notes: ''
      })
      
      alert('Reserva cancelada exitosamente con penalización aplicada')
    } catch (error) {
      console.error('Error creando cancelación:', error)
      setCancellationError('Error al cancelar la reserva')
    } finally {
      setCancellationLoading(false)
    }
  }

  // Funciones para cancelación de contratos
  const handleSearchContract = async () => {
    if (!contractSearchTerm.trim()) {
      setContractCancellationError('Por favor ingresa el número de contrato')
      return
    }

    try {
      setContractCancellationError('')
      const response = await requirementService.searchContract(contractSearchTerm)
      setContractSearchResults(response.clients || [])
      setShowContractSearch(true)
    } catch (error) {
      console.error('Error buscando contrato:', error)
      setContractCancellationError('Error al buscar el contrato')
      setContractSearchResults([])
    }
  }

  const handleSelectContractForCancellation = (client) => {
    setSelectedContractForCancellation(client)
    setContractCancellationFormData(prev => ({
      ...prev,
      contract_number: client.contract_number
    }))
    setShowContractSearch(false)
    setContractSearchTerm('')
    setContractCancellationError('')
  }

  const handleContractCancellationFormChange = (field, value) => {
    setContractCancellationFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const calculateContractCancellation = (contractValue) => {
    const iva = contractValue * 0.19 // 19% de IVA
    const fixedDeduction = 250 // $250 fijos
    const totalDeduction = iva + fixedDeduction
    const finalValue = contractValue - totalDeduction
    
    return {
      originalValue: contractValue,
      iva: iva,
      fixedDeduction: fixedDeduction,
      totalDeduction: totalDeduction,
      finalValue: finalValue
    }
  }

  const handleCreateContractCancellation = async () => {
    if (!selectedContractForCancellation) {
      setContractCancellationError('Debes seleccionar un contrato primero')
      return
    }

    if (!contractCancellationFormData.reason) {
      setContractCancellationError('Por favor completa la razón de cancelación')
      return
    }

    try {
      setContractCancellationLoading(true)
      setContractCancellationError('')

      const contractValue = parseFloat(selectedContractForCancellation.total_value || 0)
      const calculation = calculateContractCancellation(contractValue)

      const cancellationData = {
        contract_number: contractCancellationFormData.contract_number,
        reason: contractCancellationFormData.reason,
        notes: contractCancellationFormData.notes,
        original_value: calculation.originalValue,
        iva_deduction: calculation.iva,
        fixed_deduction: calculation.fixedDeduction,
        total_deduction: calculation.totalDeduction,
        final_value: calculation.finalValue,
        client_id: selectedContractForCancellation.id
      }

      console.log('Datos de cancelación de contrato:', cancellationData)
      
      // Registrar en el historial de auditoría
      try {
        await auditService.createAuditLog({
          action: 'contract_cancellation',
          entity_type: 'contract',
          entity_id: contractCancellationFormData.contract_number,
          user_id: user?.id,
          user_email: user?.email,
          user_role: user?.role,
          old_data: JSON.stringify({
            contract_number: contractCancellationFormData.contract_number,
            client_name: selectedContractForCancellation.name,
            original_value: calculation.originalValue,
            status: 'active'
          }),
          new_data: JSON.stringify(cancellationData),
          details: `Contrato ${contractCancellationFormData.contract_number} cancelado. Razón: ${contractCancellationFormData.reason}. Valor final: $${calculation.finalValue.toFixed(2)}`,
          ip_address: '127.0.0.1',
          user_agent: navigator.userAgent
        })
      } catch (auditError) {
        console.error('Error registrando en auditoría:', auditError)
        // No fallar la cancelación por error de auditoría
      }
      
      // Simular creación exitosa
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Cerrar formulario
      setShowCancellationForm(false)
      setSelectedContractForCancellation(null)
      setContractCancellationFormData({
        contract_number: '',
        reason: '',
        notes: ''
      })
      
      alert(`Contrato cancelado exitosamente. Valor final: $${calculation.finalValue.toFixed(2)}`)
    } catch (error) {
      console.error('Error creando cancelación de contrato:', error)
      setContractCancellationError('Error al cancelar el contrato')
    } finally {
      setContractCancellationLoading(false)
    }
  }

  // Función para calcular el valor total de la reserva
  const calculateTotalReservationValue = (formData) => {
    const baseValue = formData.reservation_value === 'custom' 
      ? parseFloat(formData.custom_value) || 0 
      : parseFloat(formData.reservation_value) || 0;
    
    const peopleCount = parseInt(formData.people_count) || 1;
    const nightsCount = parseInt(formData.nights_requested) || 1;
    
    // Si hay más de 6 personas, cobrar $35 por persona adicional por noche
    const extraPeople = Math.max(0, peopleCount - 6);
    const extraPeopleCost = extraPeople * 35 * nightsCount;
    
    // Calcular costo por noches adicionales si excede las noches disponibles
    let extraNightsCost = 0;
    let extraNights = 0;
    if (validatedClient && nightsCount > validatedClient.remaining_nights) {
      extraNights = nightsCount - validatedClient.remaining_nights;
      extraNightsCost = extraNights * 99;
    }
    
    const totalValue = (baseValue * nightsCount) + extraPeopleCost + extraNightsCost;
    
    return {
      baseValue,
      nightsCount,
      peopleCount,
      extraPeople,
      extraPeopleCost,
      extraNights,
      extraNightsCost,
      totalValue
    };
  };

  // Función para obtener datos de la ciudad (similar al backend)
  const getCityData = (city) => {
    const cityData = {
      'Baños': {
        UBICACION: 'Baños de Agua Santa',
        UBICACION_DE_MAPS: 'Baños de Agua Santa, Tungurahua, Ecuador',
        RED_WIFI: 'KemperyBaños',
        CONTRASENA_WIFI: 'Kempery2025'
      },
      'Cuenca': {
        UBICACION: 'Cuenca',
        UBICACION_DE_MAPS: 'Cuenca, Azuay, Ecuador',
        RED_WIFI: 'KemperyCuenca',
        CONTRASENA_WIFI: 'Kempery2025'
      },
      'Quito': {
        UBICACION: 'Quito',
        UBICACION_DE_MAPS: 'Quito, Pichincha, Ecuador',
        RED_WIFI: 'KemperyQuito',
        CONTRASENA_WIFI: 'Kempery2025'
      },
      'Manta': {
        UBICACION: 'Manta',
        UBICACION_DE_MAPS: 'Manta, Manabí, Ecuador',
        RED_WIFI: 'KemperyManta',
        CONTRASENA_WIFI: 'Kempery2025'
      },
      'Tonsupa': {
        UBICACION: 'Tonsupa',
        UBICACION_DE_MAPS: 'Tonsupa, Esmeraldas, Ecuador',
        RED_WIFI: 'KemperyTonsupa',
        CONTRASENA_WIFI: 'Kempery2025'
      },
      'Salinas': {
        UBICACION: 'Salinas',
        UBICACION_DE_MAPS: 'Salinas, Santa Elena, Ecuador',
        RED_WIFI: 'KemperySalinas',
        CONTRASENA_WIFI: 'Kempery2025'
      }
    };

    // Si es "Otros", usar la ciudad personalizada
    if (city === 'Otros') {
      return {
        UBICACION: bookingFormData.custom_city || 'Ciudad Personalizada',
        UBICACION_DE_MAPS: `${bookingFormData.custom_city || 'Ciudad Personalizada'}, Ecuador`,
        RED_WIFI: `Kempery${bookingFormData.custom_city || 'Otros'}`,
        CONTRASENA_WIFI: 'Kempery2025'
      };
    }

    return cityData[city] || cityData['Quito']; // Default a Quito si no se encuentra la ciudad
  }

  // Calcular costo adicional por personas extra
  const calculateAdditionalCost = () => {
    const additionalPeople = Math.max(0, bookingFormData.people_count - 6)
    const nights = parseInt(bookingFormData.nights_requested) || 0
    return additionalPeople * nights * 35
  }

  // Calcular costo adicional para edición
  const calculateEditAdditionalCost = () => {
    const additionalPeople = Math.max(0, editBookingFormData.people_count - 6)
    const nights = parseInt(editBookingFormData.nights_requested) || 0
    return additionalPeople * nights * 35
  }

  // Confirmar edición de reserva
  const handleConfirmEditBooking = async () => {
    try {
      setEditBookingError('');

      // Validar campos requeridos
      if (!editBookingFormData.contract_number || !editBookingFormData.city || !editBookingFormData.nights_requested || !editBookingFormData.people_count || !editBookingFormData.contact_source || !editBookingFormData.reservation_value) {
        setEditBookingError('Todos los campos requeridos deben estar completos');
        return;
      }

      if (editBookingFormData.reservation_value === 'custom' && !editBookingFormData.custom_value) {
        setEditBookingError('Debes ingresar un valor personalizado');
        return;
      }

      // Validar participantes
      for (let i = 0; i < editParticipantsData.length; i++) {
        const participant = editParticipantsData[i];
        if (!participant.first_name || !participant.last_name || !participant.identification) {
          setEditBookingError(`El participante ${i + 1} debe tener nombre, apellido e identificación completos`);
          return;
        }
      }

      // Preparar datos para enviar
      const calculation = calculateTotalReservationValue(editBookingFormData);
      
      const bookingData = {
        contract_number: editBookingFormData.contract_number,
        city: editBookingFormData.city,
        custom_city: editBookingFormData.custom_city,
        nights_requested: parseInt(editBookingFormData.nights_requested),
        people_count: parseInt(editBookingFormData.people_count),
        reservation_value: editBookingFormData.reservation_value === 'custom' ? parseFloat(editBookingFormData.custom_value) : parseFloat(editBookingFormData.reservation_value),
        total_value: calculation.totalValue,
        contact_source: editBookingFormData.contact_source,
        observations: editBookingFormData.observations,
        check_in_date: editBookingFormData.check_in_date,
        check_out_date: editBookingFormData.check_out_date,
        emergency_contact: editBookingFormData.emergency_contact,
        dietary_restrictions: editBookingFormData.dietary_restrictions,
        special_requests: editBookingFormData.special_requests,
        wifi_name: editBookingFormData.wifi_name,
        wifi_password: editBookingFormData.wifi_password,
        google_maps_link: editBookingFormData.google_maps_link,
        participants_data: editParticipantsData
      };

      // Actualizar la reserva
      await bookingService.updateBooking(editingBooking.id, bookingData);
      
      // Registrar acción de auditoría
      await logAuditAction(
        'UPDATE',
        'BOOKING',
        editingBooking.id,
        editingBooking,
        bookingData,
        `Reserva actualizada: ${bookingData.contract_number} - ${bookingData.city}`
      )
      
      alert('Reserva actualizada exitosamente');
      
      // Cerrar modal y recargar datos
      setShowEditBookingForm(false);
      setEditingBooking(null);
      fetchBookings();
      
    } catch (error) {
      console.error('Error actualizando reserva:', error);
      setEditBookingError('Error al actualizar la reserva. Verifica los datos e intenta nuevamente.');
    }
  }

  // Mostrar vista previa de la reserva
  const handleShowPreview = () => {
    if (!validatedClient) {
      setBookingError('Debes validar el contrato primero')
      return
    }
    
    if (!bookingFormData.city || !bookingFormData.nights_requested || !bookingFormData.people_count || !bookingFormData.contact_source || !bookingFormData.reservation_value) {
      setBookingError('Por favor completa todos los campos requeridos')
      return
    }

    if (bookingFormData.reservation_value === 'custom' && !bookingFormData.custom_value) {
      setBookingError('Debes ingresar un valor personalizado')
      return
    }

    if (bookingFormData.city === 'Otros' && !bookingFormData.custom_city.trim()) {
      setBookingError('Debes especificar el nombre de la ciudad')
      return
    }

    setBookingError('')
    setShowBookingPreview(true)
  }

  // Confirmar reserva
  const handleConfirmBooking = async () => {
    try {
      const calculation = calculateTotalReservationValue(bookingFormData);
      
      const bookingData = {
        contract_number: bookingFormData.contract_number,
        city: bookingFormData.city,
        custom_city: bookingFormData.city === 'Otros' ? bookingFormData.custom_city : null,
        nights_requested: parseInt(bookingFormData.nights_requested),
        people_count: parseInt(bookingFormData.people_count),
        reservation_value: bookingFormData.reservation_value === 'custom' ? parseFloat(bookingFormData.custom_value) : parseFloat(bookingFormData.reservation_value),
        total_value: calculation.totalValue,
        contact_source: bookingFormData.contact_source,
        observations: bookingFormData.observations,
        check_in_date: bookingFormData.check_in_date,
        check_out_date: bookingFormData.check_out_date,
        emergency_contact: bookingFormData.emergency_contact,
        dietary_restrictions: bookingFormData.dietary_restrictions,
        special_requests: bookingFormData.special_requests,
        participants_data: participantsData
      }

      const response = await bookingService.createBooking(bookingData)
      
      // Registrar acción de auditoría
      await logAuditAction(
        'CREATE',
        'BOOKING',
        response.id,
        null,
        bookingData,
        `Reserva creada: ${bookingData.contract_number} - ${bookingData.city} - ${bookingData.nights_requested} noches`
      )
      
      // Recargar reservas
      await loadBookings()
      
      // Cerrar formularios
      setShowBookingForm(false)
      setShowBookingPreview(false)
      setValidatedClient(null)
      setBookingFormData({
        contract_number: '',
        city: '',
        custom_city: '',
        nights_requested: '',
        people_count: 1,
        reservation_value: '',
        custom_value: '',
        contact_source: '',
        observations: ''
      })
      setParticipantsData([])
      
      alert('Reserva creada exitosamente')
    } catch (error) {
      console.error('Error creando reserva:', error)
      setBookingError(error.response?.data?.error || 'Error al crear la reserva')
    }
  }

  // Validar contraseña para editar
  const handlePasswordSubmit = () => {
    if (editPassword === 'Kempery2025+') {
      setPasswordError('')
      setShowEditModal(false)
      setEditingClient(selectedClient)
      setEditFormData({
        first_name: selectedClient.first_name,
        last_name: selectedClient.last_name,
        email: selectedClient.email,
        phone: selectedClient.phone || '',
        identification: selectedClient.identification || '',
        city: selectedClient.city || '',
        total_amount: selectedClient.total_amount || 0,
        payment_status: selectedClient.payment_status || 'sin_pago',
        contract_number: selectedClient.contract_number || '',
        international_bonus: selectedClient.international_bonus || 'No',
        notes: selectedClient.notes || ''
      })
      setShowEditForm(true)
    } else {
      setPasswordError('Contraseña incorrecta')
    }
  }

  // Validar contraseña para eliminar
  const handleDeletePasswordSubmit = () => {
    if (deletePassword === 'Kempery2025+') {
      setDeletePasswordError('')
      setShowDeleteModal(false)
      // Proceder con la eliminación
      confirmDeleteClient()
    } else {
      setDeletePasswordError('Contraseña incorrecta')
    }
  }

  // Confirmar eliminación del cliente
  const confirmDeleteClient = async () => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar al cliente ${selectedClient.first_name} ${selectedClient.last_name}?\n\nEsta acción no se puede deshacer.`)) {
      try {
        console.log('Iniciando eliminación del cliente:', selectedClient.id)
        await clientService.deleteClient(selectedClient.id)
        console.log('Cliente eliminado exitosamente:', selectedClient.id)
        
        // Registrar acción de auditoría
        await logAuditAction(
          'DELETE',
          'CLIENT',
          selectedClient.id,
          selectedClient,
          null,
          `Cliente eliminado: ${selectedClient.first_name} ${selectedClient.last_name} - Contrato: ${selectedClient.contract_number}`
        )
        
        // Cerrar modales primero
        closeModals()
        
        // Verificar si necesitamos cambiar de página después de eliminar
        const currentClientsCount = clients.length
        console.log('Clientes actuales en la página:', currentClientsCount)
        
        // Si solo había 1 cliente en la página actual y no estamos en la página 1, ir a la página anterior
        if (currentClientsCount === 1 && currentPage > 1) {
          const newPage = currentPage - 1
          console.log('Cambiando a página anterior:', newPage)
          setCurrentPage(newPage)
          await loadClients(newPage, searchTerm)
        } else {
          // Recargar la lista de clientes en la página actual
          console.log('Recargando lista de clientes en página:', currentPage)
          await loadClients(currentPage, searchTerm)
        }
        
        console.log('Lista de clientes recargada')
        
        // Mostrar mensaje de éxito
        alert('Cliente eliminado correctamente')
      } catch (error) {
        console.error('Error eliminando cliente:', error)
        alert('Error al eliminar el cliente')
      }
    }
  }

  // Guardar cambios del cliente
  const handleSaveClient = async () => {
    try {
      const response = await clientService.updateClient(editingClient.id, editFormData)
      console.log('Cliente actualizado:', response)
      
      // Registrar acción de auditoría
      await logAuditAction(
        'UPDATE',
        'CLIENT',
        editingClient.id,
        editingClient,
        editFormData,
        `Cliente actualizado: ${editFormData.first_name} ${editFormData.last_name}`
      )
      
      // Recargar la lista de clientes
      await loadClients(currentPage, searchTerm)
      
      // Cerrar el formulario
      closeModals()
      
      // Mostrar mensaje de éxito
      alert('Cliente actualizado correctamente')
    } catch (error) {
      console.error('Error actualizando cliente:', error)
      alert('Error al actualizar el cliente')
    }
  }

  // Cerrar modales
  const closeModals = () => {
    setShowClientDetails(false)
    setShowEditModal(false)
    setShowEditForm(false)
    setShowDeleteModal(false)
    setShowNewClientForm(false)
    setShowBookingForm(false)
    setShowBookingPreview(false)
    setSelectedClient(null)
    setSelectedBooking(null)
    setValidatedClient(null)
    setEditPassword('')
    setPasswordError('')
    setDeletePassword('')
    setDeletePasswordError('')
    setEditFormData({})
    setBookingFormData({
      contract_number: '',
      city: '',
      custom_city: '',
      nights_requested: '',
      people_count: 1,
      reservation_value: '',
      custom_value: '',
      contact_source: '',
      observations: ''
    })
    setParticipantsData([])
    setBookingError('')
    setContractSearchResults([])
    setShowContractSearch(false)
    setContractSearchTerm('')
    setRequirementFormData({
      contract_number: '',
      requirement_type: '',
      description: '',
      assigned_to: '',
      notes: ''
    })
    setRequirementSearchResults([])
    setShowRequirementSearch(false)
    setRequirementSearchTerm('')
    setRequirementError('')
    setSelectedRequirement(null)
    setShowRequirementDetails(false)
    setShowRequirementEdit(false)
    setRequirementEditData({})
    setClientRequirements([])
    setShowClientRequirements(false)
    setPayments([])
    setPaymentAgreements([])
    setShowPaymentForm(false)
    setShowAgreementForm(false)
    setShowReceiptModal(false)
    setSelectedClientForPayment(null)
    setSelectedClientForAgreement(null)
    setPaymentFormData({
      client_id: '',
      payment_agreement_id: '',
      contract_number: '',
      payment_amount: '',
      payment_date: '',
      payment_method: '',
      payment_type: '',
      payment_time: '',
      installment_number: '',
      notes: ''
    })
    setAgreementFormData({
      client_id: '',
      contract_number: '',
      total_amount: '',
      installment_count: '',
      installment_amount: '',
      start_date: '',
      end_date: '',
      notes: ''
    })
    setPaymentError('')
    setAgreementError('')
    setSelectedReceipt(null)
  }

  // Manejar búsqueda
  const handleSearch = (e) => {
    e.preventDefault()
    setCurrentPage(1)
    // Usar el valor actual del input de búsqueda
    const currentSearchTerm = e.target.search.value || ''
    loadClients(1, currentSearchTerm)
  }

  // Manejar búsqueda en cobranzas
  const handleCollectionsSearch = (e) => {
    e.preventDefault()
    setCurrentPage(1)
    // Usar el valor actual del input de búsqueda
    const currentSearchTerm = e.target.search.value || ''
    loadUnpaidClients(1, currentSearchTerm)
  }

  // Manejar cambio de página
  const handlePageChange = (page) => {
    setCurrentPage(page)
    loadClients(page, searchTerm)
  }

  // Manejar cambio de página en cobranzas
  const handleCollectionsPageChange = (page) => {
    setCurrentPage(page)
    loadUnpaidClients(page, searchTerm)
  }

  // Formatear moneda
  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: currency
    }).format(amount)
  }

  // Determinar rol del cliente a partir de la propiedad `rol` o del email
  const getClientRole = (client) => {
    const email = (client?.email || '').toString().toLowerCase()
    const prefix = email.split('@')[0] || ''
    if (client?.rol) return client.rol
    if (prefix.startsWith('clienteib1')) return 'clienteIB1'
    if (prefix.startsWith('clienteib2')) return 'clienteIB2'
    if (prefix.startsWith('cliente')) return 'cliente'
    return null
  }

  const renderRoleBadge = (client) => {
    const role = getClientRole(client)
    if (!role) return null
    const label = role === 'cliente' ? 'GOLD' : role === 'clienteIB1' ? 'BLUE' : role === 'clienteIB2' ? 'BLACK' : role
    const cls = role === 'cliente' ? 'bg-yellow-400 text-white' : role === 'clienteIB1' ? 'bg-blue-600 text-white' : 'bg-gray-900 text-white'
    return (
      <span className={`text-xs px-2 py-0.5 rounded-full ${cls}`}>
        {label}
      </span>
    )
  }

  // Renderizar contenido según la sección activa
  const renderContent = () => {
    // Verificar si el usuario tiene acceso a la sección actual
    // Incluir tanto las secciones principales como las del menú colapsable "Requerimientos"
    const allAvailableSections = [...sections.map(s => s.id)];
    const hasAccess = allAvailableSections.includes(activeSection);
    
    if (!hasAccess) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-6xl mb-4">🚫</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Acceso Denegado</h2>
            <p className="text-gray-600">No tienes permisos para acceder a este módulo.</p>
          </div>
        </div>
      );
    }

    switch (activeSection) {
      case 'dashboard':
        return (
          <div className="space-y-6 dashboard-dark">
            {/* Selector de período */}
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Dashboard Ejecutivo - Sumatorias del Período</h2>
              <div className="flex items-center space-x-4">
                <NotificationBell />
                <label className="text-sm font-medium text-gray-700 dashboard-period-text">Período:</label>
                <select
                  value={dashboardPeriod}
                  onChange={(e) => handleDashboardPeriodChange(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy font-bold dashboard-period-text bg-blue-900 text-white"
                >
                  <option value="yesterday">Ayer</option>
                  <option value="last_month">Mes Pasado</option>
                  <option value="this_month">Este Mes</option>
                </select>
              </div>
            </div>

            {/* Resumen de Pagos */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 dashboard-data-section">
              {/* Resumen del Último Período */}
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                    Último Período
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

              {/* Resumen del Período Actual */}
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <span className="w-3 h-3 bg-orange-500 rounded-full mr-2"></span>
                    Período Actual
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

            {/* Métricas principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div 
                className="bg-white p-6 rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-shadow"
                onClick={handleOpenSalesModal}
              >
                <div className="flex items-center">
                  <div className="p-2 rounded-lg dashboard-icon">
                    <User className="h-6 w-6" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Ventas del Período</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {dashboardLoading ? '...' : (lastMonthSummary?.sales?.total_ventas || 0)}
                    </p>
                    <p className="text-xs text-gray-500">
                      Monto: {formatCurrency(lastMonthSummary?.sales?.total_monto || 0)}
                    </p>
                  </div>
                </div>
              </div>

              <div 
                className="bg-white p-6 rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-shadow"
                onClick={handleOpenCollectionsModal}
              >
                <div className="flex items-center">
                  <div className="p-2 rounded-lg dashboard-icon">
                    <DollarSign className="h-6 w-6" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Cobranzas del Período</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {dashboardLoading ? '...' : (lastMonthSummary?.collections?.total_cobranzas || 0)}
                    </p>
                    <p className="text-xs text-gray-500">
                      Monto: {formatCurrency(lastMonthSummary?.collections?.total_monto || 0)}
                    </p>
                  </div>
                </div>
              </div>

              <div 
                className="bg-white p-6 rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-shadow"
                onClick={handleOpenBookingsModal}
              >
                <div className="text-center">
                  <div className="flex justify-center mb-3">
                    <div className="p-2 rounded-lg dashboard-icon">
                      <CalendarCheck className="h-6 w-6" />
                    </div>
                  </div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Reservas del Período</p>
                  <p className="text-lg font-bold text-gray-900 break-words">
                    {dashboardLoading ? '...' : (lastMonthSummary?.bookings?.total_reservas || 0)}
                  </p>
                  <p className="text-xs text-gray-500">
                    Monto: {formatCurrency(lastMonthSummary?.bookings?.total_monto || 0)}
                  </p>
                </div>
              </div>
            </div>

            {/* Notificaciones de Pagos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div 
                className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500 cursor-pointer hover:shadow-lg transition-shadow"
                onClick={handleOpenPaymentsTodayModal}
              >
                <div className="flex items-center">
                  <div className="p-2 rounded-lg dashboard-icon">
                    <DollarSign className="h-6 w-6" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Pagos de Hoy</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {paymentsToday.loading ? '...' : paymentsToday.count}
                    </p>
                    <p className="text-xs text-gray-500">
                      Monto: {formatCurrency(paymentsToday.amount)}
                    </p>
                  </div>
                </div>
              </div>

              <div 
                className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500 cursor-pointer hover:shadow-lg transition-shadow"
                onClick={handleOpenPaymentsThisMonthModal}
              >
                <div className="flex items-center">
                  <div className="p-2 rounded-lg dashboard-icon">
                    <Wallet className="h-6 w-6" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Pagos de Este Mes</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {paymentsThisMonth.loading ? '...' : paymentsThisMonth.count}
                    </p>
                    <p className="text-xs text-gray-500">
                      Monto: {formatCurrency(paymentsThisMonth.amount)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Métricas adicionales del período */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Detalle de Ventas del Período</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Ventas:</span>
                    <span className="font-semibold text-blue-600">
                      {dashboardLoading ? '...' : (lastMonthSummary?.sales?.total_ventas || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Ventas Pagadas:</span>
                    <span className="font-semibold text-green-600">
                      {dashboardLoading ? '...' : (lastMonthSummary?.sales?.ventas_pagadas || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Monto Total:</span>
                    <span className="font-semibold text-blue-600">
                      {dashboardLoading ? '...' : formatCurrency(lastMonthSummary?.sales?.total_monto || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Monto Pagado:</span>
                    <span className="font-semibold text-green-600">
                      {dashboardLoading ? '...' : formatCurrency(lastMonthSummary?.sales?.monto_pagado || 0)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Detalle de Cobranzas del Período</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Cobranzas:</span>
                    <span className="font-semibold text-orange-600">
                      {dashboardLoading ? '...' : (lastMonthSummary?.collections?.total_cobranzas || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Cobranzas Pagadas:</span>
                    <span className="font-semibold text-green-600">
                      {dashboardLoading ? '...' : (lastMonthSummary?.collections?.cobranzas_pagadas || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Monto Total:</span>
                    <span className="font-semibold text-orange-600">
                      {dashboardLoading ? '...' : formatCurrency(lastMonthSummary?.collections?.total_monto || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Monto Pagado:</span>
                    <span className="font-semibold text-green-600">
                      {dashboardLoading ? '...' : formatCurrency(lastMonthSummary?.collections?.monto_pagado || 0)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Información adicional del período */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Requerimientos del Período</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Requerimientos:</span>
                    <span className="font-semibold text-orange-600">
                      {dashboardLoading ? '...' : (lastMonthSummary?.requirements?.total_requerimientos || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Completados:</span>
                    <span className="font-semibold text-green-600">
                      {dashboardLoading ? '...' : (lastMonthSummary?.requirements?.completados || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Pendientes:</span>
                    <span className="font-semibold text-yellow-600">
                      {dashboardLoading ? '...' : (lastMonthSummary?.requirements?.pendientes || 0)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Reservas del Período</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Reservas:</span>
                    <span className="font-semibold text-purple-600">
                      {dashboardLoading ? '...' : (lastMonthSummary?.bookings?.total_reservas || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Confirmadas:</span>
                    <span className="font-semibold text-green-600">
                      {dashboardLoading ? '...' : (lastMonthSummary?.bookings?.confirmadas || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Canceladas:</span>
                    <span className="font-semibold text-red-600">
                      {dashboardLoading ? '...' : (lastMonthSummary?.bookings?.canceladas || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Monto Total:</span>
                    <span className="font-semibold text-blue-600">
                      {dashboardLoading ? '...' : formatCurrency(lastMonthSummary?.bookings?.total_monto || 0)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tendencias de los últimos días */}
            {dashboardReports?.trends && dashboardReports.trends.length > 0 && (
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Tendencias de los Últimos 7 Días</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Fecha
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Nuevos Clientes
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Nuevas Reservas
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {dashboardReports.trends.map((trend, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatDateString(trend.fecha)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {trend.nuevos_clientes || 0}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {trend.nuevas_reservas || 0}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Modales de tarjetas */}
            {/* Modal de Ventas del Período */}
            {showSalesModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-gray-900">Clientes del Período - Ventas</h3>
                    <button
                      onClick={() => setShowSalesModal(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>

                  {salesClientsLoading ? (
                    <div className="flex justify-center items-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {salesClients.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">No hay clientes en este período</p>
                      ) : (
                        salesClients.map((client) => (
                          <div
                            key={client.id}
                            className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                            onClick={() => {
                              handleViewClient(client)
                              setShowSalesModal(false)
                            }}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="font-semibold text-gray-900">{client.first_name} {client.last_name}</p>
                                  {renderRoleBadge(client)}
                                </div>
                                <p className="text-sm text-gray-600">Contrato: {client.contract_number}</p>
                                <p className="text-sm text-gray-600">Email: {client.email}</p>
                                <p className="text-sm text-gray-500">
                                  Fecha: {new Date(client.created_at).toLocaleDateString('es-ES')}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-semibold text-blue-600">
                                  {formatCurrency(client.total_amount || 0)}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Modal de Cobranzas del Período */}
            {showCollectionsModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-gray-900">Clientes en Cobranzas del Período</h3>
                    <button
                      onClick={() => setShowCollectionsModal(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>

                  {collectionsClientsLoading ? (
                    <div className="flex justify-center items-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {collectionsClients.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">No hay clientes en cobranzas en este período</p>
                      ) : (
                        collectionsClients.map((client) => (
                          <div
                            key={client.id}
                            className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                            onClick={() => {
                              handleViewClient(client)
                              setShowCollectionsModal(false)
                            }}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="font-semibold text-gray-900">{client.first_name} {client.last_name}</p>
                                  {renderRoleBadge(client)}
                                </div>
                                <p className="text-sm text-gray-600">Contrato: {client.contract_number}</p>
                                <p className="text-sm text-gray-600">Email: {client.email}</p>
                                <p className="text-sm text-gray-500">
                                  Fecha: {new Date(client.created_at).toLocaleDateString('es-ES')}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-semibold text-red-600">
                                  Deuda: {formatCurrency(client.total_amount || 0)}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Modal de Reservas del Período */}
            {showBookingsModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-gray-900">Reservas del Período</h3>
                    <button
                      onClick={() => setShowBookingsModal(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>

                  {periodBookingsLoading ? (
                    <div className="flex justify-center items-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {periodBookings.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">No hay reservas en este período</p>
                      ) : (
                        periodBookings.map((booking) => (
                          <div
                            key={booking.id}
                            className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-semibold text-gray-900">
                                  Cliente: {booking.client_name || 'N/A'}
                                </p>
                                <p className="text-sm text-gray-600">
                                  Check-in: {new Date(booking.check_in).toLocaleDateString('es-ES')}
                                </p>
                                <p className="text-sm text-gray-600">
                                  Check-out: {new Date(booking.check_out).toLocaleDateString('es-ES')}
                                </p>
                                <p className="text-sm text-gray-500">
                                  Estado: <span className={`font-semibold ${
                                    booking.status === 'active' ? 'text-green-600' : 
                                    booking.status === 'cancelled' ? 'text-red-600' : 'text-gray-600'
                                  }`}>
                                    {booking.status === 'active' ? 'Activa' : 
                                     booking.status === 'cancelled' ? 'Cancelada' : booking.status}
                                  </span>
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-semibold text-blue-600">
                                  {formatCurrency(booking.total_price || 0)}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Modal de Pagos de Hoy */}
            {showPaymentsTodayModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-gray-900">Pagos de Hoy</h3>
                    <button
                      onClick={() => setShowPaymentsTodayModal(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>

                  {todayPaymentsLoading ? (
                    <div className="flex justify-center items-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {todayPayments.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">No hay pagos registrados hoy</p>
                      ) : (
                        todayPayments.map((payment) => (
                          <div
                            key={payment.id}
                            className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-semibold text-gray-900">
                                  Cliente: {payment.client_name || 'N/A'}
                                </p>
                                <p className="text-sm text-gray-600">
                                  Fecha: {new Date(payment.payment_date).toLocaleDateString('es-ES')}
                                </p>
                                <p className="text-sm text-gray-600">
                                  Método: {payment.payment_method || 'N/A'}
                                </p>
                                {payment.receipt_number && (
                                  <p className="text-sm text-gray-500">
                                    Recibo: {payment.receipt_number}
                                  </p>
                                )}
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-semibold text-green-600">
                                  {formatCurrency(payment.payment_amount || 0)}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Modal de Pagos de Este Mes */}
            {showPaymentsThisMonthModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-gray-900">Pagos de Este Mes</h3>
                    <button
                      onClick={() => setShowPaymentsThisMonthModal(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>

                  {thisMonthPaymentsLoading ? (
                    <div className="flex justify-center items-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {thisMonthPayments.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">No hay pagos registrados este mes</p>
                      ) : (
                        thisMonthPayments.map((payment) => (
                          <div
                            key={payment.id}
                            className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-semibold text-gray-900">
                                  Cliente: {payment.client_name || 'N/A'}
                                </p>
                                <p className="text-sm text-gray-600">
                                  Fecha: {new Date(payment.payment_date).toLocaleDateString('es-ES')}
                                </p>
                                <p className="text-sm text-gray-600">
                                  Método: {payment.payment_method || 'N/A'}
                                </p>
                                {payment.receipt_number && (
                                  <p className="text-sm text-gray-500">
                                    Recibo: {payment.receipt_number}
                                  </p>
                                )}
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-semibold text-green-600">
                                  {formatCurrency(payment.payment_amount || 0)}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )

        case 'paquetes':
          return (
            <div className="space-y-6">
              <PaquetesAdmin />
            </div>
          )

        case 'locaciones':
          return (
            <div className="space-y-6">
              <LocacionesDepartamentosAdmin />
            </div>
          )

      case 'clientes':
        return (
          <div className="space-y-6">
            <div className="flex flex-wrap justify-between items-center gap-3">
              <h2 className="text-2xl font-bold text-gray-900">Gestión de Clientes</h2>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handleNewClient}
                  className="bg-navy text-white px-4 py-2 rounded-lg hover:bg-navy/90 flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Nuevo Cliente
                </button>
              </div>
            </div>

            {/* Barra de búsqueda */}
            <div className="bg-white p-4 rounded-lg shadow-md">
              <form onSubmit={handleSearch} className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    name="search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar por nombre, email o cédula..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy focus:border-transparent"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-navy text-white px-6 py-2 rounded-lg hover:bg-navy/90"
                >
                  Buscar
                </button>
              </form>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cliente
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Teléfono
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ciudad
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fecha Registro
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {clients.map((client) => (
                      <tr key={client.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="text-sm font-medium text-gray-900">{client.first_name} {client.last_name}</div>
                            {renderRoleBadge(client)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {client.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {client.phone || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {client.city || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDateString(client.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => handleViewClient(client)}
                              className="text-blue-600 hover:text-blue-900"
                              title="Ver detalles"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => loadClientRequirements(client.id)}
                              className="text-purple-600 hover:text-purple-900"
                              title="Ver requerimientos"
                            >
                              <History className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleEditClient(client)}
                              className="text-indigo-600 hover:text-indigo-900"
                              title="Editar cliente"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteClient(client)}
                              className="text-red-600 hover:text-red-900"
                              title="Eliminar cliente"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Paginación */}
            {pagination.totalPages > 1 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={!pagination.hasPrev}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Anterior
                  </button>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={!pagination.hasNext}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Siguiente
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Mostrando{' '}
                      <span className="font-medium">{(currentPage - 1) * 20 + 1}</span>
                      {' '}a{' '}
                      <span className="font-medium">
                        {Math.min(currentPage * 20, pagination.totalClients)}
                      </span>
                      {' '}de{' '}
                      <span className="font-medium">{pagination.totalClients}</span>
                      {' '}resultados
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={!pagination.hasPrev}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Anterior
                      </button>
                      
                      {/* Números de página */}
                      {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                        const pageNum = i + 1
                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              currentPage === pageNum
                                ? 'z-10 bg-navy border-navy text-white'
                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            {pageNum}
                          </button>
                        )
                      })}
                      
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={!pagination.hasNext}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Siguiente
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </div>
        )

      case 'cobranzas':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Gestión de Cobranzas</h2>
              <div className="text-sm text-gray-600">
                {pagination.totalClients || clients.length} clientes en cobranzas
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Pagos por áreas de cobranzas</h3>
                  <DollarSign className="h-5 w-5 text-gold" />
                </div>
                {collectionsModuleLoading ? (
                  <div className="flex items-center justify-center py-6">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-navy"></div>
                    <span className="ml-3 text-gray-600">Cargando...</span>
                  </div>
                ) : collectionsByArea.length === 0 ? (
                  <p className="text-sm text-gray-500">No hay datos de cobranzas por área.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Área
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Clientes
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Total
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {collectionsByArea.map((area) => (
                          <tr key={area.area}>
                            <td className="px-4 py-2 text-sm text-gray-900">
                              {area.area}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-500">
                              {area.count}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-500">
                              {formatCurrency(area.total)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Clientes nuevos</h3>
                  <Users className="h-5 w-5 text-gold" />
                </div>
                {collectionsModuleLoading ? (
                  <div className="flex items-center justify-center py-6">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-navy"></div>
                    <span className="ml-3 text-gray-600">Cargando...</span>
                  </div>
                ) : newCollectionClients.length === 0 ? (
                  <p className="text-sm text-gray-500">No hay clientes nuevos registrados.</p>
                ) : (
                  <div className="space-y-3">
                    {newCollectionClients.map((client) => (
                      <div key={client.id} className="flex items-center justify-between border border-gray-200 rounded-lg p-3">
                        <div>
                          <div className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                            <span>{client.first_name} {client.last_name}</span>
                            {renderRoleBadge(client)}
                          </div>
                          <p className="text-xs text-gray-500">{client.email || 'Sin email'}</p>
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatDateString(client.created_at || client.fecha_registro || client.fecha_creacion)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Barra de búsqueda */}
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <form onSubmit={handleCollectionsSearch} className="flex items-center space-x-4">
                <div className="flex-1">
                  <input
                    type="text"
                    name="search"
                    placeholder="Buscar por nombre, email, contrato..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-navy text-white rounded-lg hover:bg-navy-700 focus:outline-none focus:ring-2 focus:ring-navy"
                >
                  Buscar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm('')
                    setCurrentPage(1)
                    loadUnpaidClients(1, '')
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Limpiar
                </button>
              </form>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Download className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Atención: Clientes con pagos pendientes
                  </h3>
                  <p className="mt-1 text-sm text-red-700">
                    Los siguientes clientes requieren seguimiento para el cobro de sus servicios.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cliente
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Teléfono
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Monto Pendiente
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fecha Registro
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {clients.map((client) => (
                      <tr key={client.id} className="hover:bg-red-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {client.first_name} {client.last_name}
                          </div>
                          {client.contract_number && (
                            <div className="text-xs text-gray-500">
                              Contrato: {client.contract_number}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {client.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {client.phone || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className="text-red-600 font-semibold">
                            {client.pending_amount || client.agreement_remaining_amount 
                              ? formatCurrency(client.pending_amount || client.agreement_remaining_amount) 
                              : client.total_amount 
                                ? formatCurrency(client.total_amount) 
                                : 'No especificado'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDateString(client.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => handleViewClient(client)}
                              className="text-blue-600 hover:text-blue-900"
                              title="Ver detalles"
                            >
                              <Eye className="h-4 w-4" />
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
                              </select>
                            </div>
                            <button 
                              onClick={() => handleEditClient(client)}
                              className="text-indigo-600 hover:text-indigo-900"
                              title="Editar cliente"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteClient(client)}
                              className="text-red-600 hover:text-red-900"
                              title="Eliminar cliente"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Paginación para Cobranzas */}
            {pagination.totalPages > 1 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => handleCollectionsPageChange(currentPage - 1)}
                    disabled={!pagination.hasPrev}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Anterior
                  </button>
                  <button
                    onClick={() => handleCollectionsPageChange(currentPage + 1)}
                    disabled={!pagination.hasNext}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Siguiente
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Mostrando{' '}
                      <span className="font-medium">{(currentPage - 1) * 20 + 1}</span>
                      {' '}a{' '}
                      <span className="font-medium">
                        {Math.min(currentPage * 20, pagination.totalClients)}
                      </span>
                      {' '}de{' '}
                      <span className="font-medium">{pagination.totalClients}</span>
                      {' '}resultados
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={() => handleCollectionsPageChange(currentPage - 1)}
                        disabled={!pagination.hasPrev}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="sr-only">Anterior</span>
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                      {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                        const pageNum = Math.max(1, Math.min(pagination.totalPages - 4, currentPage - 2)) + i;
                        return (
                          <button
                            key={pageNum}
                            onClick={() => handleCollectionsPageChange(pageNum)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              pageNum === currentPage
                                ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                      <button
                        onClick={() => handleCollectionsPageChange(currentPage + 1)}
                        disabled={!pagination.hasNext}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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

            {clients.length === 0 && (
              <div className="text-center py-12">
                <Download className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No hay clientes sin pago</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Todos los clientes están al día con sus pagos.
                </p>
              </div>
            )}
          </div>
        )

      case 'reservas':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Gestión de Reservas</h2>
              <button
                onClick={() => setShowBookingForm(true)}
                className="bg-navy text-white px-4 py-2 rounded-lg hover:bg-navy/90 flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Nueva Reserva
              </button>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        N° Reserva
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cliente
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contrato
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ciudad
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Noches
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Personas
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ediciones
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {bookings.map((booking) => (
                      <tr key={booking.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {booking.booking_number}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {booking.client_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {booking.contract_number}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {booking.city_display || booking.city}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {booking.nights_requested} noches
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {booking.people_count} personas
                          {booking.additional_people > 0 && (
                            <span className="text-orange-600 ml-1">
                              (+{booking.additional_people})
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                            booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                            booking.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {booking.status === 'confirmed' ? 'Confirmada' :
                             booking.status === 'pending' ? 'Pendiente' :
                             booking.status === 'cancelled' ? 'Cancelada' :
                             booking.status === 'completed' ? 'Completada' :
                             booking.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex flex-col">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full mb-1 ${
                              booking.edit_count === 0 ? 'bg-green-100 text-green-800' :
                              booking.edit_count === 1 ? 'bg-yellow-100 text-yellow-800' :
                              booking.edit_count === 2 ? 'bg-orange-100 text-orange-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {booking.edit_count}/3 ediciones
                            </span>
                            {booking.total_penalty > 0 && (
                              <span className="text-xs text-red-600 font-medium">
                                Penalidad: ${booking.total_penalty}
                              </span>
                            )}
                            {booking.is_lost && (
                              <span className="text-xs text-red-600 font-bold">
                                PERDIDA
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => handleViewBooking(booking)}
                              className="text-blue-600 hover:text-blue-900"
                              title="Ver detalles"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleEditBooking(booking)}
                              className="text-indigo-600 hover:text-indigo-900"
                              title="Editar reserva"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteBooking(booking)}
                              className="text-red-600 hover:text-red-900"
                              title="Eliminar reserva"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleSendWhatsAppDocument(booking)}
                              className="text-green-600 hover:text-green-900"
                              title="Enviar documento por WhatsApp"
                            >
                              <MessageCircle className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )

      case 'reportes':
        return (
          <div className="space-y-6">
            {/* Header con selector de período */}
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Reportes y Análisis</h2>
              <div className="flex items-center space-x-4">
                <label className="text-sm font-medium text-gray-700">Período:</label>
                <select
                  value={reportsPeriod}
                  onChange={(e) => handleReportsPeriodChange(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy"
                >
                  <option value="today">Hoy</option>
                  <option value="yesterday">Ayer</option>
                  <option value="13days">Hace 13 días</option>
                </select>
              </div>
            </div>

            {/* Indicador de período seleccionado */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800 font-medium">
                📅 Mostrando datos para: {getDateRangeLabel(reportsPeriod)}
              </p>
            </div>

            {reportsLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy"></div>
                <span className="ml-3 text-gray-600">Cargando reportes...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Reporte de Ventas */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-blue-600" />
                      Reporte de Ventas
                    </h3>
                    <button 
                      onClick={exportSalesReport}
                      className="bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 flex items-center gap-1 text-sm"
                    >
                      <Download className="h-4 w-4" />
                      Exportar
                    </button>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Ventas:</span>
                      <span className="font-semibold text-green-600">
                        {formatCurrency(reportsData.sales?.total_sales || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Nuevos Clientes:</span>
                      <span className="font-semibold">{reportsData.sales?.new_clients || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Ticket Promedio:</span>
                      <span className="font-semibold">
                        {formatCurrency(reportsData.sales?.average_ticket || 0)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Reporte de Clientes */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Users className="h-5 w-5 text-green-600" />
                      Reporte de Clientes
                    </h3>
                    <button 
                      onClick={exportClientsReport}
                      className="bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 flex items-center gap-1 text-sm"
                    >
                      <Download className="h-4 w-4" />
                      Exportar
                    </button>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Clientes:</span>
                      <span className="font-semibold">{reportsData.clients?.total_clients || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">En Cobranzas:</span>
                      <span className="font-semibold text-red-600">
                        {reportsData.clients?.in_collections || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Clientes Activos:</span>
                      <span className="font-semibold text-green-600">
                        {reportsData.clients?.active_clients || 0}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Reporte de Reservas */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-purple-600" />
                      Reporte de Reservas
                    </h3>
                    <button 
                      onClick={exportBookingsReport}
                      className="bg-purple-600 text-white px-3 py-1 rounded-lg hover:bg-purple-700 flex items-center gap-1 text-sm"
                    >
                      <Download className="h-4 w-4" />
                      Exportar
                    </button>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Reservas:</span>
                      <span className="font-semibold">{reportsData.bookings?.total_bookings || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Confirmadas:</span>
                      <span className="font-semibold text-green-600">
                        {reportsData.bookings?.confirmed_bookings || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Canceladas:</span>
                      <span className="font-semibold text-red-600">
                        {reportsData.bookings?.cancelled_bookings || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Pendientes:</span>
                      <span className="font-semibold text-yellow-600">
                        {reportsData.bookings?.pending_bookings || 0}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Reporte de Requerimientos */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <ClipboardList className="h-5 w-5 text-orange-600" />
                      Reporte de Requerimientos
                    </h3>
                    <button 
                      onClick={exportRequirementsReport}
                      className="bg-orange-600 text-white px-3 py-1 rounded-lg hover:bg-orange-700 flex items-center gap-1 text-sm"
                    >
                      <Download className="h-4 w-4" />
                      Exportar
                    </button>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Requerimientos:</span>
                      <span className="font-semibold">{reportsData.requirements?.total_requirements || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Completados:</span>
                      <span className="font-semibold text-green-600">
                        {reportsData.requirements?.completed_requirements || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Pendientes:</span>
                      <span className="font-semibold text-yellow-600">
                        {reportsData.requirements?.pending_requirements || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Resumen ejecutivo */}
            {!reportsLoading && (
              <div className="bg-gradient-to-r from-navy to-blue-600 text-white p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-4">📊 Resumen Ejecutivo</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {formatCurrency((reportsData.sales?.total_sales || 0) + (reportsData.bookings?.total_bookings || 0) * 100)}
                    </div>
                    <div className="text-sm opacity-90">Ingresos Totales</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{reportsData.clients?.total_clients || 0}</div>
                    <div className="text-sm opacity-90">Clientes Totales</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{reportsData.bookings?.total_bookings || 0}</div>
                    <div className="text-sm opacity-90">Reservas Totales</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{reportsData.requirements?.total_requirements || 0}</div>
                    <div className="text-sm opacity-90">Requerimientos</div>
                  </div>
                </div>
              </div>
            )}

            {/* Reporte Detallado de Cobranzas */}
            <div className="mt-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900">📋 Reporte Detallado de Cobranzas</h2>
                <button
                  onClick={exportCollectionsFullReport}
                  disabled={collectionsDetailedLoading}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  <Download className="h-4 w-4" />
                  {collectionsDetailedLoading ? 'Cargando...' : 'Exportar Reporte Completo'}
                </button>
              </div>
              
              {collectionsDetailedLoading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy"></div>
                  <span className="ml-3 text-gray-600">Cargando reporte de cobranzas...</span>
                </div>
              ) : collectionsDetailedData ? (
                <div className="space-y-6">
                  {/* Métricas principales */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-red-500">
                      <h3 className="text-sm font-medium text-gray-600 mb-2">Total Clientes que Deben</h3>
                      <p className="text-3xl font-bold text-red-600">
                        {collectionsDetailedData.total_clientes_deben || 0}
                      </p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-orange-500">
                      <h3 className="text-sm font-medium text-gray-600 mb-2">Total Deuda Global</h3>
                      <p className="text-3xl font-bold text-orange-600">
                        {formatCurrency(collectionsDetailedData.total_deuda_global || 0)}
                      </p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-yellow-500">
                      <h3 className="text-sm font-medium text-gray-600 mb-2">Personas en Cobranzas</h3>
                      <p className="text-3xl font-bold text-yellow-600">
                        {collectionsDetailedData.total_en_cobranzas || 0}
                      </p>
                    </div>
                  </div>

                  {/* Deuda por año */}
                  {collectionsDetailedData.deuda_por_año && collectionsDetailedData.deuda_por_año.length > 0 && (
                    <div className="bg-white p-6 rounded-lg shadow-md">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-blue-600" />
                        Deuda por Año
                      </h3>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Año
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Cantidad de Clientes
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Total Deuda
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {collectionsDetailedData.deuda_por_año.map((item, index) => (
                              <tr key={index} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {item.año}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                  {item.cantidad_clientes}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-red-600">
                                  {formatCurrency(item.total_deuda)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Gestiones realizadas */}
                  {collectionsDetailedData.total_gestiones > 0 && (
                    <div className="bg-white p-6 rounded-lg shadow-md">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <MessageCircle className="h-5 w-5 text-green-600" />
                        Gestiones Realizadas ({collectionsDetailedData.total_gestiones})
                      </h3>
                      <div className="space-y-4 max-h-96 overflow-y-auto">
                        {collectionsDetailedData.gestiones && collectionsDetailedData.gestiones.length > 0 ? (
                          collectionsDetailedData.gestiones.map((gestion, index) => (
                            <div key={gestion.id || index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <button
                                    onClick={() => {
                                      if (gestion.client_id) {
                                        handleViewClientCollectionsHistory({
                                          id: gestion.client_id,
                                          first_name: gestion.client_name?.split(' ')[0] || '',
                                          last_name: gestion.client_name?.split(' ').slice(1).join(' ') || '',
                                          contract_number: gestion.contract_number
                                        })
                                      }
                                    }}
                                    className="font-semibold text-gray-900 hover:text-blue-600 text-left"
                                  >
                                    {gestion.client_name || 'Cliente no especificado'}
                                  </button>
                                  <p className="text-sm text-gray-600">
                                    Contrato: {gestion.contract_number || 'N/A'}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-medium text-gray-700">
                                    {gestion.management_date 
                                      ? new Date(gestion.management_date).toLocaleDateString('es-ES')
                                      : 'Fecha no especificada'}
                                  </p>
                                  {gestion.created_by_name && (
                                    <p className="text-xs text-gray-500">
                                      Por: {gestion.created_by_name}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="mt-2">
                                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                                  {gestion.observation || 'Sin observaciones'}
                                </p>
                              </div>
                              {gestion.created_at && (
                                <p className="text-xs text-gray-400 mt-2">
                                  Registrado: {new Date(gestion.created_at).toLocaleString('es-ES')}
                                </p>
                              )}
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-500 text-center py-4">No hay gestiones registradas</p>
                        )}
                      </div>
                    </div>
                  )}

                  {collectionsDetailedData.total_gestiones === 0 && (
                    <div className="bg-white p-6 rounded-lg shadow-md">
                      <p className="text-gray-500 text-center py-4">No hay gestiones registradas</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <p className="text-gray-500 text-center py-4">No se pudieron cargar los datos de cobranzas</p>
                </div>
              )}
            </div>
          </div>
        )

      case 'cancelaciones':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Gestión de Cancelaciones</h2>
            </div>

            {/* Pestañas para tipo de cancelación */}
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setCancellationType('reservas')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    cancellationType === 'reservas'
                      ? 'border-red-500 text-red-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Cancelar Reservas
                </button>
                <button
                  onClick={() => setCancellationType('contratos')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    cancellationType === 'contratos'
                      ? 'border-red-500 text-red-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Cancelar Contratos
                </button>
              </nav>
            </div>

            {/* Contenido según el tipo de cancelación */}
            {cancellationType === 'reservas' ? (
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Reservas Activas Disponibles para Cancelación</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Las reservas canceladas no aparecerán en esta lista
                  </p>
                </div>
                <div className="p-6">
                  {cancellations.length === 0 ? (
                    <div className="text-center py-12">
                      <X className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No hay reservas activas</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        No hay reservas confirmadas o pendientes para cancelar.
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              N° Reserva
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Contrato
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Ciudad
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Noches
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Personas
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Valor Total
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Estado
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Fecha Creación
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Acciones
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {cancellations.map((booking) => (
                            <tr key={booking.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {booking.booking_number || `#${booking.id}`}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {booking.contract_number}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {booking.city_display || booking.city}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {booking.nights_requested}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {booking.people_count}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                ${booking.total_value?.toFixed(2) || '0.00'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                  booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {booking.status === 'confirmed' ? 'Confirmada' :
                                   booking.status === 'pending' ? 'Pendiente' :
                                   booking.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(booking.created_at).toLocaleDateString('es-ES')}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <button
                                  onClick={() => handleSelectBookingForCancellation(booking)}
                                  className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-lg transition-colors"
                                >
                                  Cancelar
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Cancelación de Contratos</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Busca un contrato para cancelar. Se aplicará deducción de IVA (19%) y $250 fijos.
                  </p>
                </div>
                <div className="p-6">
                  {/* Buscador de contratos */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <h4 className="font-medium text-blue-800 mb-3">🔍 Buscar Contrato</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Número de Contrato
                        </label>
                        <input
                          type="text"
                          value={contractSearchTerm}
                          onChange={(e) => setContractSearchTerm(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Ingresa el número de contrato completo"
                        />
                      </div>
                      <div className="flex items-end">
                        <button
                          onClick={handleSearchContract}
                          className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                        >
                          Buscar
                        </button>
                      </div>
                    </div>
                    {contractCancellationError && (
                      <div className="mt-2 text-sm text-red-600">{contractCancellationError}</div>
                    )}
                  </div>

                  {/* Resultados de búsqueda */}
                  {showContractSearch && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                      <h4 className="font-medium text-gray-800 mb-3">Resultados de búsqueda:</h4>
                      {contractSearchResults.length > 0 ? (
                        <div className="space-y-2">
                          {contractSearchResults.map((client) => (
                            <div
                              key={client.id}
                              onClick={() => handleSelectContractForCancellation(client)}
                              className="p-3 bg-white border border-gray-200 rounded-lg cursor-pointer hover:bg-blue-50 hover:border-blue-300"
                            >
                              <div className="font-medium text-gray-900">{client.full_name || client.name}</div>
                              <div className="text-sm text-gray-600">Contrato: {client.contract_number}</div>
                              <div className="text-sm text-gray-600">Email: {client.email}</div>
                              <div className="text-sm text-gray-600">Valor Total: ${client.total_value?.toFixed(2) || '0.00'}</div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500">No se encontraron contratos con ese número.</p>
                      )}
                    </div>
                  )}

                  {/* Información del contrato seleccionado */}
                  {selectedContractForCancellation && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                      <h4 className="font-medium text-green-800 mb-3">✅ Contrato Seleccionado</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div><strong>Cliente:</strong> {selectedContractForCancellation.full_name || selectedContractForCancellation.name}</div>
                        <div><strong>Contrato:</strong> {selectedContractForCancellation.contract_number}</div>
                        <div><strong>Email:</strong> {selectedContractForCancellation.email}</div>
                        <div><strong>Valor Total:</strong> ${selectedContractForCancellation.total_value?.toFixed(2) || '0.00'}</div>
                      </div>
                      
                      {/* Cálculo de cancelación */}
                      {selectedContractForCancellation.total_value && (
                        <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                          <h5 className="font-medium text-yellow-800 mb-2">💰 Cálculo de Cancelación</h5>
                          {(() => {
                            const calculation = calculateContractCancellation(parseFloat(selectedContractForCancellation.total_value))
                            return (
                              <div className="text-sm space-y-1">
                                <div><strong>Valor original:</strong> ${calculation.originalValue.toFixed(2)}</div>
                                <div><strong>Deducción IVA (19%):</strong> -${calculation.iva.toFixed(2)}</div>
                                <div><strong>Deducción fija:</strong> -${calculation.fixedDeduction.toFixed(2)}</div>
                                <div className="font-bold text-red-600 border-t pt-1">
                                  <strong>Valor final a devolver:</strong> ${calculation.finalValue.toFixed(2)}
                                </div>
                              </div>
                            )
                          })()}
                        </div>
                      )}
                      
                      <div className="mt-4">
                        <button
                          onClick={() => setShowCancellationForm(true)}
                          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                        >
                          Proceder con la Cancelación
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Historial de Cambios */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <History className="h-5 w-5 text-purple-600" />
                  Historial de Cambios
                </h3>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => loadAuditLogs()}
                    className="bg-purple-600 text-white px-3 py-1 rounded-lg hover:bg-purple-700 flex items-center gap-1 text-sm"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Actualizar
                  </button>
                </div>
              </div>

              {/* Filtros de Auditoría */}
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {/* Filtro por fecha inicio */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fecha Inicio
                    </label>
                    <input
                      type="date"
                      value={auditFilters.startDate}
                      onChange={(e) => handleAuditFilterChange('startDate', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  {/* Filtro por fecha fin */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fecha Fin
                    </label>
                    <input
                      type="date"
                      value={auditFilters.endDate}
                      onChange={(e) => handleAuditFilterChange('endDate', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  {/* Filtro por usuario */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Usuario
                    </label>
                    <input
                      type="text"
                      value={auditFilters.userId}
                      onChange={(e) => handleAuditFilterChange('userId', e.target.value)}
                      placeholder="Email del usuario"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  {/* Filtro por acción */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Acción
                    </label>
                    <select
                      value={auditFilters.action}
                      onChange={(e) => handleAuditFilterChange('action', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">Todas las acciones</option>
                      <option value="CREATE">Crear</option>
                      <option value="UPDATE">Actualizar</option>
                      <option value="DELETE">Eliminar</option>
                    </select>
                  </div>

                  {/* Filtro por tipo de entidad */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Entidad
                    </label>
                    <select
                      value={auditFilters.entityType}
                      onChange={(e) => handleAuditFilterChange('entityType', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">Todas las entidades</option>
                      <option value="CLIENT">Cliente</option>
                      <option value="BOOKING">Reserva</option>
                      <option value="REQUIREMENT">Requerimiento</option>
                      <option value="PAYMENT">Pago</option>
                    </select>
                  </div>

                  {/* Botones de acción */}
                  <div className="flex flex-col justify-end space-y-2">
                    <button
                      onClick={applyAuditFilters}
                      className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 text-sm"
                    >
                      Aplicar Filtros
                    </button>
                    <button
                      onClick={clearAuditFilters}
                      className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 text-sm"
                    >
                      Limpiar
                    </button>
                  </div>
                </div>
              </div>

              {auditLogsLoading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                  <span className="ml-3 text-gray-600">Cargando historial...</span>
                </div>
              ) : auditLogsError ? (
                <div className="text-center py-8">
                  <p className="text-red-600">{auditLogsError}</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Fecha/Hora
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Usuario
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Acción
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Entidad
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Detalles
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {auditLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(log.timestamp).toLocaleString('es-ES')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div>
                              <div className="font-medium">{log.user_email}</div>
                              <div className="text-xs text-gray-400">{log.user_role}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              log.action === 'CREATE' ? 'bg-green-100 text-green-800' :
                              log.action === 'UPDATE' ? 'bg-blue-100 text-blue-800' :
                              log.action === 'DELETE' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {log.action}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {log.entity_type}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            <div className="max-w-xs truncate" title={log.details}>
                              {log.details}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  {auditLogs.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No hay registros de cambios disponibles
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )

      case 'agenda-reservas':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Agenda de Reservas</h2>
              <button
                onClick={() => {
                  setEditingReservationAgenda(null)
                  setReservationAgendaFormData({
                    fecha: '',
                    socio: '',
                    ciudad: '',
                    nombre: '',
                    destino: '',
                    llegada: '',
                    salida: '',
                    pax: '',
                    airbnb_nombres: '',
                    cedulas: '',
                    observacion: '',
                    link_conversacion_airbnb: '',
                    estatus: '',
                    tarjeta_usada: '',
                    valor_pagado_reserva: '',
                    pago_cliente: '',
                    observaciones_adicionales: ''
                  })
                  setShowReservationAgendaForm(true)
                }}
                className="bg-navy text-white px-4 py-2 rounded-lg hover:bg-navy/90 flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Nueva Agenda
              </button>
            </div>

            {/* Filtros */}
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Buscar
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={reservationAgendaSearch}
                      onChange={(e) => setReservationAgendaSearch(e.target.value)}
                      placeholder="Nombre, socio, ciudad, destino..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={loadReservationAgendas}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <Search size={16} />
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estatus
                  </label>
                  <select
                    value={reservationAgendaStatusFilter}
                    onChange={(e) => setReservationAgendaStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Todos</option>
                    <option value="CUMPLIDO">Cumplido</option>
                    <option value="Cumplida">Cumplida</option>
                    <option value="PENDIENTE">Pendiente</option>
                    <option value="LISTA">Lista</option>
                    <option value="EJECUTANDOSE">Ejecutándose</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Tabla de agenda de reservas */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              {reservationAgendaLoading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-navy"></div>
                  <span className="ml-3 text-gray-600">Cargando agenda...</span>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Fecha
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Socio
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ciudad
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Nombre
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Destino
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Llegada
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Salida
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          PAX
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Estatus
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {reservationAgendas.length === 0 ? (
                        <tr>
                          <td colSpan="10" className="px-6 py-4 text-center text-gray-500">
                            No hay registros de agenda de reservas
                          </td>
                        </tr>
                      ) : (
                        reservationAgendas.map((agenda) => (
                          <tr key={agenda.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {agenda.fecha ? new Date(agenda.fecha).toLocaleDateString('es-ES') : '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {agenda.socio || '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {agenda.ciudad || '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {agenda.nombre || '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {agenda.destino || '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {agenda.llegada || '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {agenda.salida || '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {agenda.pax || '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                agenda.estatus === 'CUMPLIDO' || agenda.estatus === 'Cumplida' ? 'bg-green-100 text-green-800' :
                                agenda.estatus === 'PENDIENTE' ? 'bg-yellow-100 text-yellow-800' :
                                agenda.estatus === 'LISTA' ? 'bg-blue-100 text-blue-800' :
                                agenda.estatus === 'EJECUTANDOSE' ? 'bg-purple-100 text-purple-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {agenda.estatus || '-'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleEditReservationAgenda(agenda)}
                                  className="text-blue-600 hover:text-blue-900"
                                  title="Editar"
                                >
                                  <Edit size={16} />
                                </button>
                                <button
                                  onClick={() => handleDeleteReservationAgenda(agenda)}
                                  className="text-red-600 hover:text-red-900"
                                  title="Eliminar"
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
              )}
            </div>

            {/* Modal de formulario */}
            {showReservationAgendaForm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-gray-900">
                      {editingReservationAgenda ? 'Editar Agenda de Reserva' : 'Nueva Agenda de Reserva'}
                    </h3>
                    <button
                      onClick={() => {
                        setShowReservationAgendaForm(false)
                        setEditingReservationAgenda(null)
                        setReservationAgendaFormData({
                          fecha: '',
                          socio: '',
                          ciudad: '',
                          nombre: '',
                          destino: '',
                          llegada: '',
                          salida: '',
                          pax: '',
                          airbnb_nombres: '',
                          cedulas: '',
                          observacion: '',
                          link_conversacion_airbnb: '',
                          estatus: '',
                          tarjeta_usada: '',
                          valor_pagado_reserva: '',
                          pago_cliente: '',
                          observaciones_adicionales: ''
                        })
                      }}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fecha
                      </label>
                      <input
                        type="date"
                        value={reservationAgendaFormData.fecha}
                        onChange={(e) => handleReservationAgendaFormChange('fecha', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Socio
                      </label>
                      <input
                        type="text"
                        value={reservationAgendaFormData.socio}
                        onChange={(e) => handleReservationAgendaFormChange('socio', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Número de socio"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ciudad
                      </label>
                      <input
                        type="text"
                        value={reservationAgendaFormData.ciudad}
                        onChange={(e) => handleReservationAgendaFormChange('ciudad', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Ciudad"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre
                      </label>
                      <input
                        type="text"
                        value={reservationAgendaFormData.nombre}
                        onChange={(e) => handleReservationAgendaFormChange('nombre', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Nombre completo"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Destino
                      </label>
                      <input
                        type="text"
                        value={reservationAgendaFormData.destino}
                        onChange={(e) => handleReservationAgendaFormChange('destino', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Destino"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Llegada
                      </label>
                      <input
                        type="text"
                        value={reservationAgendaFormData.llegada}
                        onChange={(e) => handleReservationAgendaFormChange('llegada', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Fecha de llegada"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Salida
                      </label>
                      <input
                        type="text"
                        value={reservationAgendaFormData.salida}
                        onChange={(e) => handleReservationAgendaFormChange('salida', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Fecha de salida"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        PAX
                      </label>
                      <input
                        type="text"
                        value={reservationAgendaFormData.pax}
                        onChange={(e) => handleReservationAgendaFormChange('pax', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Número de personas"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Airbnb Nombres
                      </label>
                      <input
                        type="text"
                        value={reservationAgendaFormData.airbnb_nombres}
                        onChange={(e) => handleReservationAgendaFormChange('airbnb_nombres', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Nombres en Airbnb"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cédulas
                      </label>
                      <select
                        value={reservationAgendaFormData.cedulas}
                        onChange={(e) => handleReservationAgendaFormChange('cedulas', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Seleccionar</option>
                        <option value="SI">Sí</option>
                        <option value="NO">No</option>
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Observación
                      </label>
                      <textarea
                        value={reservationAgendaFormData.observacion}
                        onChange={(e) => handleReservationAgendaFormChange('observacion', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows="3"
                        placeholder="Observaciones"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Link de conversación Airbnb
                      </label>
                      <input
                        type="url"
                        value={reservationAgendaFormData.link_conversacion_airbnb}
                        onChange={(e) => handleReservationAgendaFormChange('link_conversacion_airbnb', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="https://www.airbnb.com.ec/..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Estatus
                      </label>
                      <select
                        value={reservationAgendaFormData.estatus}
                        onChange={(e) => handleReservationAgendaFormChange('estatus', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Seleccionar</option>
                        <option value="CUMPLIDO">Cumplido</option>
                        <option value="Cumplida">Cumplida</option>
                        <option value="PENDIENTE">Pendiente</option>
                        <option value="LISTA">Lista</option>
                        <option value="EJECUTANDOSE">Ejecutándose</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tarjeta que se usó
                      </label>
                      <input
                        type="text"
                        value={reservationAgendaFormData.tarjeta_usada}
                        onChange={(e) => handleReservationAgendaFormChange('tarjeta_usada', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Número de tarjeta"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Valor pagado de reserva
                      </label>
                      <input
                        type="text"
                        value={reservationAgendaFormData.valor_pagado_reserva}
                        onChange={(e) => handleReservationAgendaFormChange('valor_pagado_reserva', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="$0.00"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Pago de cliente
                      </label>
                      <input
                        type="text"
                        value={reservationAgendaFormData.pago_cliente}
                        onChange={(e) => handleReservationAgendaFormChange('pago_cliente', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="$0.00"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Observaciones Adicionales
                      </label>
                      <textarea
                        value={reservationAgendaFormData.observaciones_adicionales}
                        onChange={(e) => handleReservationAgendaFormChange('observaciones_adicionales', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows="3"
                        placeholder="Observaciones adicionales"
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                      {error}
                    </div>
                  )}

                  <div className="flex justify-end gap-3 mt-6">
                    <button
                      onClick={() => {
                        setShowReservationAgendaForm(false)
                        setEditingReservationAgenda(null)
                        setReservationAgendaFormData({
                          fecha: '',
                          socio: '',
                          ciudad: '',
                          nombre: '',
                          destino: '',
                          llegada: '',
                          salida: '',
                          pax: '',
                          airbnb_nombres: '',
                          cedulas: '',
                          observacion: '',
                          link_conversacion_airbnb: '',
                          estatus: '',
                          tarjeta_usada: '',
                          valor_pagado_reserva: '',
                          pago_cliente: '',
                          observaciones_adicionales: ''
                        })
                      }}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={editingReservationAgenda ? handleUpdateReservationAgenda : handleCreateReservationAgenda}
                      className="px-4 py-2 bg-navy text-white rounded-lg hover:bg-navy/90"
                    >
                      {editingReservationAgenda ? 'Actualizar' : 'Crear'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )

      case 'agenda-visados':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Agenda de Visados</h2>
              <button
                onClick={() => {
                  setEditingVisaAgenda(null)
                  setVisaAgendaFormData({
                    fecha: '',
                    socio: '',
                    ciudad: '',
                    nombre: '',
                    embajada: '',
                    ads: '',
                    correo: '',
                    contrasena: '',
                    estatus: '',
                    fecha_entrevista_embajada: '',
                    hora_entrevista_embajada: '',
                    fecha_asesoramiento: '',
                    observaciones: '',
                    link_reunion: ''
                  })
                  setShowVisaAgendaForm(true)
                }}
                className="bg-navy text-white px-4 py-2 rounded-lg hover:bg-navy/90 flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Nueva Agenda
              </button>
            </div>

            {/* Filtros */}
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Buscar
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={visaAgendaSearch}
                      onChange={(e) => setVisaAgendaSearch(e.target.value)}
                      placeholder="Nombre, socio, ciudad, embajada..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={loadVisaAgendas}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <Search size={16} />
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estatus
                  </label>
                  <select
                    value={visaAgendaStatusFilter}
                    onChange={(e) => setVisaAgendaStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Todos</option>
                    <option value="PENDIENTE">Pendiente</option>
                    <option value="EN_PROCESO">En Proceso</option>
                    <option value="COMPLETADO">Completado</option>
                    <option value="CANCELADO">Cancelado</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Tabla de agenda de visados */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              {visaAgendaLoading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-navy"></div>
                  <span className="ml-3 text-gray-600">Cargando agenda...</span>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Fecha
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Socio
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ciudad
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Nombre
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Embajada
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ADS
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Correo
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Estatus
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Fecha Entrevista
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {visaAgendas.length === 0 ? (
                        <tr>
                          <td colSpan="10" className="px-6 py-4 text-center text-gray-500">
                            No hay registros de agenda de visados
                          </td>
                        </tr>
                      ) : (
                        visaAgendas.map((agenda) => (
                          <tr key={agenda.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {agenda.fecha ? new Date(agenda.fecha).toLocaleDateString('es-ES') : '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {agenda.socio || '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {agenda.ciudad || '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {agenda.nombre || '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {agenda.embajada || '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {agenda.ads || '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {agenda.correo || '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                agenda.estatus === 'COMPLETADO' ? 'bg-green-100 text-green-800' :
                                agenda.estatus === 'PENDIENTE' ? 'bg-yellow-100 text-yellow-800' :
                                agenda.estatus === 'EN_PROCESO' ? 'bg-blue-100 text-blue-800' :
                                agenda.estatus === 'CANCELADO' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {agenda.estatus || '-'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {agenda.fecha_entrevista_embajada ? new Date(agenda.fecha_entrevista_embajada).toLocaleDateString('es-ES') : '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleEditVisaAgenda(agenda)}
                                  className="text-blue-600 hover:text-blue-900"
                                  title="Editar"
                                >
                                  <Edit size={16} />
                                </button>
                                <button
                                  onClick={() => handleDeleteVisaAgenda(agenda)}
                                  className="text-red-600 hover:text-red-900"
                                  title="Eliminar"
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
              )}
            </div>

            {/* Modal de formulario */}
            {showVisaAgendaForm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    {editingVisaAgenda ? 'Editar Agenda de Visado' : 'Nueva Agenda de Visado'}
                  </h3>
                  
                  {error && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                      {error}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fecha
                      </label>
                      <input
                        type="date"
                        value={visaAgendaFormData.fecha}
                        onChange={(e) => handleVisaAgendaFormChange('fecha', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Socio
                      </label>
                      <input
                        type="text"
                        value={visaAgendaFormData.socio}
                        onChange={(e) => handleVisaAgendaFormChange('socio', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Socio"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ciudad
                      </label>
                      <input
                        type="text"
                        value={visaAgendaFormData.ciudad}
                        onChange={(e) => handleVisaAgendaFormChange('ciudad', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Ciudad"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre
                      </label>
                      <input
                        type="text"
                        value={visaAgendaFormData.nombre}
                        onChange={(e) => handleVisaAgendaFormChange('nombre', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Nombre del cliente"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Embajada
                      </label>
                      <input
                        type="text"
                        value={visaAgendaFormData.embajada}
                        onChange={(e) => handleVisaAgendaFormChange('embajada', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Embajada"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ADS
                      </label>
                      <input
                        type="text"
                        value={visaAgendaFormData.ads}
                        onChange={(e) => handleVisaAgendaFormChange('ads', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="ADS"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Correo
                      </label>
                      <input
                        type="email"
                        value={visaAgendaFormData.correo}
                        onChange={(e) => handleVisaAgendaFormChange('correo', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Correo electrónico"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Contraseña
                      </label>
                      <input
                        type="password"
                        value={visaAgendaFormData.contrasena}
                        onChange={(e) => handleVisaAgendaFormChange('contrasena', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Contraseña"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Estatus
                      </label>
                      <select
                        value={visaAgendaFormData.estatus}
                        onChange={(e) => handleVisaAgendaFormChange('estatus', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Seleccionar</option>
                        <option value="PENDIENTE">Pendiente</option>
                        <option value="EN_PROCESO">En Proceso</option>
                        <option value="COMPLETADO">Completado</option>
                        <option value="CANCELADO">Cancelado</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fecha de Entrevista Embajada
                      </label>
                      <input
                        type="date"
                        value={visaAgendaFormData.fecha_entrevista_embajada}
                        onChange={(e) => handleVisaAgendaFormChange('fecha_entrevista_embajada', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Hora de Entrevista Embajada
                      </label>
                      <input
                        type="time"
                        value={visaAgendaFormData.hora_entrevista_embajada}
                        onChange={(e) => handleVisaAgendaFormChange('hora_entrevista_embajada', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fecha para Asesoramiento
                      </label>
                      <input
                        type="date"
                        value={visaAgendaFormData.fecha_asesoramiento}
                        onChange={(e) => handleVisaAgendaFormChange('fecha_asesoramiento', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Observaciones
                      </label>
                      <textarea
                        value={visaAgendaFormData.observaciones}
                        onChange={(e) => handleVisaAgendaFormChange('observaciones', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows="3"
                        placeholder="Observaciones"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Link de Reunión
                      </label>
                      <input
                        type="url"
                        value={visaAgendaFormData.link_reunion}
                        onChange={(e) => handleVisaAgendaFormChange('link_reunion', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="https://..."
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 mt-6">
                    <button
                      onClick={() => {
                        setShowVisaAgendaForm(false)
                        setEditingVisaAgenda(null)
                        setVisaAgendaFormData({
                          fecha: '',
                          socio: '',
                          ciudad: '',
                          nombre: '',
                          embajada: '',
                          ads: '',
                          correo: '',
                          contrasena: '',
                          estatus: '',
                          fecha_entrevista_embajada: '',
                          hora_entrevista_embajada: '',
                          fecha_asesoramiento: '',
                          observaciones: '',
                          link_reunion: ''
                        })
                      }}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={editingVisaAgenda ? handleUpdateVisaAgenda : handleCreateVisaAgenda}
                      className="px-4 py-2 bg-navy text-white rounded-lg hover:bg-navy/90"
                    >
                      {editingVisaAgenda ? 'Actualizar' : 'Crear'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )

      case 'agenda-vuelos':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Agenda de Vuelos</h2>
              <button
                onClick={() => {
                  setEditingFlightAgenda(null)
                  setFlightAgendaFormData({
                    fecha: '',
                    socio: '',
                    ciudad: '',
                    nombre: '',
                    destino: '',
                    llegada: '',
                    salida: '',
                    pax: '',
                    ruta: '',
                    numero_reserva: '',
                    estatus: '',
                    tarjeta_usada: '',
                    valor_pagado_reserva: '',
                    pago_cliente: '',
                    observacion: ''
                  })
                  setShowFlightAgendaForm(true)
                }}
                className="bg-navy text-white px-4 py-2 rounded-lg hover:bg-navy/90 flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Nueva Agenda
              </button>
            </div>

            {/* Filtros */}
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Buscar
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={flightAgendaSearch}
                      onChange={(e) => setFlightAgendaSearch(e.target.value)}
                      placeholder="Nombre, socio, ciudad, destino, número de reserva..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={loadFlightAgendas}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <Search size={16} />
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estatus
                  </label>
                  <select
                    value={flightAgendaStatusFilter}
                    onChange={(e) => setFlightAgendaStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Todos</option>
                    <option value="PENDIENTE">Pendiente</option>
                    <option value="TERMINADO">Terminado</option>
                    <option value="CANCELADO">Cancelado</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Tabla de agenda de vuelos */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              {flightAgendaLoading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-navy"></div>
                  <span className="ml-3 text-gray-600">Cargando agenda...</span>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Fecha
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Socio
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ciudad
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Nombre
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Destino
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Llegada
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Salida
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          PAX
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Número Reserva
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Estatus
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {flightAgendas.length === 0 ? (
                        <tr>
                          <td colSpan="11" className="px-6 py-4 text-center text-gray-500">
                            No hay registros de agenda de vuelos
                          </td>
                        </tr>
                      ) : (
                        flightAgendas.map((agenda) => (
                          <tr key={agenda.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {agenda.fecha ? new Date(agenda.fecha).toLocaleDateString('es-ES') : '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {agenda.socio || '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {agenda.ciudad || '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {agenda.nombre || '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {agenda.destino || '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {agenda.llegada ? new Date(agenda.llegada).toLocaleDateString('es-ES') : '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {agenda.salida ? new Date(agenda.salida).toLocaleDateString('es-ES') : '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {agenda.pax || '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {agenda.numero_reserva || '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                agenda.estatus === 'TERMINADO' ? 'bg-green-100 text-green-800' :
                                agenda.estatus === 'PENDIENTE' ? 'bg-yellow-100 text-yellow-800' :
                                agenda.estatus === 'CANCELADO' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {agenda.estatus || '-'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleEditFlightAgenda(agenda)}
                                  className="text-blue-600 hover:text-blue-900"
                                  title="Editar"
                                >
                                  <Edit size={16} />
                                </button>
                                <button
                                  onClick={() => handleDeleteFlightAgenda(agenda)}
                                  className="text-red-600 hover:text-red-900"
                                  title="Eliminar"
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
              )}
            </div>

            {/* Modal de formulario */}
            {showFlightAgendaForm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    {editingFlightAgenda ? 'Editar Agenda de Vuelo' : 'Nueva Agenda de Vuelo'}
                  </h3>
                  
                  {error && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                      {error}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fecha
                      </label>
                      <input
                        type="date"
                        value={flightAgendaFormData.fecha}
                        onChange={(e) => handleFlightAgendaFormChange('fecha', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Socio
                      </label>
                      <input
                        type="text"
                        value={flightAgendaFormData.socio}
                        onChange={(e) => handleFlightAgendaFormChange('socio', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Socio"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ciudad
                      </label>
                      <input
                        type="text"
                        value={flightAgendaFormData.ciudad}
                        onChange={(e) => handleFlightAgendaFormChange('ciudad', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Ciudad"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre
                      </label>
                      <input
                        type="text"
                        value={flightAgendaFormData.nombre}
                        onChange={(e) => handleFlightAgendaFormChange('nombre', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Nombre del cliente"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Destino
                      </label>
                      <input
                        type="text"
                        value={flightAgendaFormData.destino}
                        onChange={(e) => handleFlightAgendaFormChange('destino', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Destino"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Llegada
                      </label>
                      <input
                        type="date"
                        value={flightAgendaFormData.llegada}
                        onChange={(e) => handleFlightAgendaFormChange('llegada', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Salida
                      </label>
                      <input
                        type="date"
                        value={flightAgendaFormData.salida}
                        onChange={(e) => handleFlightAgendaFormChange('salida', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        PAX
                      </label>
                      <input
                        type="number"
                        value={flightAgendaFormData.pax}
                        onChange={(e) => handleFlightAgendaFormChange('pax', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Número de personas"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ruta
                      </label>
                      <input
                        type="text"
                        value={flightAgendaFormData.ruta}
                        onChange={(e) => handleFlightAgendaFormChange('ruta', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Ruta del vuelo"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Número de Reserva
                      </label>
                      <input
                        type="text"
                        value={flightAgendaFormData.numero_reserva}
                        onChange={(e) => handleFlightAgendaFormChange('numero_reserva', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Número de reserva"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Estatus
                      </label>
                      <select
                        value={flightAgendaFormData.estatus}
                        onChange={(e) => handleFlightAgendaFormChange('estatus', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Seleccionar</option>
                        <option value="PENDIENTE">Pendiente</option>
                        <option value="TERMINADO">Terminado</option>
                        <option value="CANCELADO">Cancelado</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tarjeta que se usó
                      </label>
                      <input
                        type="text"
                        value={flightAgendaFormData.tarjeta_usada}
                        onChange={(e) => handleFlightAgendaFormChange('tarjeta_usada', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Tarjeta usada"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Valor Pagado de Reserva
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={flightAgendaFormData.valor_pagado_reserva}
                        onChange={(e) => handleFlightAgendaFormChange('valor_pagado_reserva', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Pago de Cliente
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={flightAgendaFormData.pago_cliente}
                        onChange={(e) => handleFlightAgendaFormChange('pago_cliente', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0.00"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Observación
                      </label>
                      <textarea
                        value={flightAgendaFormData.observacion}
                        onChange={(e) => handleFlightAgendaFormChange('observacion', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows="3"
                        placeholder="Observaciones"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 mt-6">
                    <button
                      onClick={() => {
                        setShowFlightAgendaForm(false)
                        setEditingFlightAgenda(null)
                        setFlightAgendaFormData({
                          fecha: '',
                          socio: '',
                          ciudad: '',
                          nombre: '',
                          destino: '',
                          llegada: '',
                          salida: '',
                          pax: '',
                          ruta: '',
                          numero_reserva: '',
                          estatus: '',
                          tarjeta_usada: '',
                          valor_pagado_reserva: '',
                          pago_cliente: '',
                          observacion: ''
                        })
                      }}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={editingFlightAgenda ? handleUpdateFlightAgenda : handleCreateFlightAgenda}
                      className="px-4 py-2 bg-navy text-white rounded-lg hover:bg-navy/90"
                    >
                      {editingFlightAgenda ? 'Actualizar' : 'Crear'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="flex min-h-screen admin-theme bg-gradient-to-br from-gold-light via-gold to-gold-dark">
      <SessionWarning />
      
      {/* Sidebar para Desktop */}
      <aside className="w-64 bg-black text-white p-6 flex-shrink-0 hidden md:block">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-full bg-white border-2 border-gold flex items-center justify-center">
            <span className="text-gold font-bold text-xl">IB</span>
          </div>
          <div className="text-2xl font-bold">{panelTitle}</div>
        </div>
        <nav>
          <ul>
            {sections.map((section) => (
              <li key={section.id} className="mb-4">
                <button
                  onClick={() => setActiveSection(section.id)}
                  className={`flex items-center w-full text-left py-2 px-4 rounded-lg transition-colors duration-200 ${
                    activeSection === section.id ? 'bg-light-blue' : 'hover:bg-light-blue/70'
                  }`}
                >
                  <section.icon size={20} className="mr-3" />
                  {section.name}
                </button>
              </li>
            ))}
            
            <li className="mt-8">
              <button
                onClick={logout}
                className="flex items-center w-full text-left py-2 px-4 rounded-lg transition-colors duration-200 hover:bg-red-600"
              >
                <LogOut size={20} className="mr-3" />
                Cerrar Sesión
              </button>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden bg-black text-white p-4 flex justify-between items-center w-full">
        <div className="flex items-center gap-2 text-xl font-bold">
          <div className="w-9 h-9 rounded-full bg-white border-2 border-gold flex items-center justify-center">
            <span className="text-gold font-bold text-base">IB</span>
          </div>
          {panelTitle}
        </div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Sidebar */}
      {isSidebarOpen && (
        <aside className="fixed inset-y-0 left-0 w-64 bg-black text-white p-6 z-50 md:hidden">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-3 text-2xl font-bold">
              <div className="w-10 h-10 rounded-full bg-white border-2 border-gold flex items-center justify-center">
                <span className="text-gold font-bold text-lg">IB</span>
              </div>
              {panelTitle}
            </div>
            <button onClick={() => setIsSidebarOpen(false)}>
              <X size={24} />
            </button>
          </div>
          <nav>
            <ul>
              {sections.map((section) => (
                <li key={section.id} className="mb-4">
                  <button
                    onClick={() => {
                      setActiveSection(section.id)
                      setIsSidebarOpen(false)
                    }}
                    className={`flex items-center w-full text-left py-2 px-4 rounded-lg transition-colors duration-200 ${
                      activeSection === section.id ? 'bg-light-blue' : 'hover:bg-light-blue/70'
                    }`}
                  >
                    <section.icon size={20} className="mr-3" />
                    {section.name}
                  </button>
                </li>
              ))}
              
              <li className="mt-8">
                <button
                  onClick={logout}
                  className="flex items-center w-full text-left py-2 px-4 rounded-lg transition-colors duration-200 hover:bg-red-600"
                >
                  <LogOut size={20} className="mr-3" />
                  Cerrar Sesión
                </button>
              </li>
            </ul>
          </nav>
        </aside>
      )}

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}
        
        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-navy"></div>
          </div>
        )}
        
        {!loading && renderContent()}
      </main>

      {/* Modal de detalles del cliente */}
      {showClientDetails && selectedClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Detalles del Cliente</h3>
              <button
                onClick={closeModals}
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
                <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                <p className="mt-1 text-sm text-gray-900">{selectedClient.phone || 'No especificado'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Cédula</label>
                <p className="mt-1 text-sm text-gray-900">{selectedClient.identification || 'No especificado'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Ciudad</label>
                <p className="mt-1 text-sm text-gray-900">{selectedClient.city || 'No especificado'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">País</label>
                <p className="mt-1 text-sm text-gray-900">{selectedClient.country || 'Ecuador'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Fecha de Registro</label>
                <p className="mt-1 text-sm text-gray-900">{formatDateString(selectedClient.created_at)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Estado de Pago</label>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  selectedClient.payment_status === 'pago_completo' ? 'bg-green-100 text-green-800' :
                  selectedClient.payment_status === 'pago_parcial' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {selectedClient.payment_status === 'pago_completo' ? 'Pago Completo' :
                   selectedClient.payment_status === 'pago_parcial' ? 'Pago Parcial' : 'Sin Pago'}
                </span>
              </div>
              {selectedClient.total_amount && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Monto Total</label>
                  <p className="mt-1 text-sm text-gray-900">{formatCurrency(selectedClient.total_amount)}</p>
                </div>
              )}
              {selectedClient.contract_number && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Número de Contrato</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedClient.contract_number}</p>
                </div>
              )}
              {selectedClient.international_bonus && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Bono Internacional</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedClient.international_bonus}</p>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700">Noches Totales</label>
                <p className="mt-1 text-sm text-gray-900">{selectedClient.total_nights || 0} noches</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Noches Restantes</label>
                <p className="mt-1 text-sm text-gray-900">{selectedClient.remaining_nights || 0} noches</p>
              </div>
              {selectedClient.years && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Años de Duración del Contrato</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedClient.years} años</p>
                </div>
              )}
              {clientPaymentAgreement && clientPaymentAgreement.due_date && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Fecha de Vencimiento del Pagaré</label>
                  <p className="mt-1 text-sm font-semibold text-orange-600">
                    {new Date(clientPaymentAgreement.due_date).toLocaleDateString('es-ES')}
                  </p>
                </div>
              )}
              {selectedClient.notes && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Notas</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedClient.notes}</p>
                </div>
              )}
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                onClick={closeModals}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de validación de contraseña para editar */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Validar Contraseña</h3>
              <button
                onClick={closeModals}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <p className="text-sm text-gray-600 mb-4">
              Para editar el cliente <strong>{selectedClient?.first_name} {selectedClient?.last_name}</strong>, 
              ingresa la contraseña de administrador:
            </p>
            
            <div className="mb-4">
              <input
                type="password"
                value={editPassword}
                onChange={(e) => setEditPassword(e.target.value)}
                placeholder="Contraseña"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy"
                onKeyPress={(e) => e.key === 'Enter' && handlePasswordSubmit()}
              />
              {passwordError && (
                <p className="mt-1 text-sm text-red-600">{passwordError}</p>
              )}
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={closeModals}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
              >
                Cancelar
              </button>
              <button
                onClick={handlePasswordSubmit}
                className="bg-navy text-white px-4 py-2 rounded-lg hover:bg-navy/90"
              >
                Validar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de formulario de edición */}
      {showEditForm && editingClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Editar Cliente</h3>
              <button
                onClick={closeModals}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
                  <input
                    type="text"
                    value={editFormData.first_name || ''}
                    onChange={(e) => setEditFormData({...editFormData, first_name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Apellido</label>
                  <input
                    type="text"
                    value={editFormData.last_name || ''}
                    onChange={(e) => setEditFormData({...editFormData, last_name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={editFormData.email || ''}
                    onChange={(e) => setEditFormData({...editFormData, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
                  <input
                    type="text"
                    value={editFormData.phone || ''}
                    onChange={(e) => setEditFormData({...editFormData, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Cédula</label>
                  <input
                    type="text"
                    value={editFormData.identification || ''}
                    onChange={(e) => setEditFormData({...editFormData, identification: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ciudad</label>
                  <input
                    type="text"
                    value={editFormData.city || ''}
                    onChange={(e) => setEditFormData({...editFormData, city: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Número de Contrato</label>
                  <input
                    type="text"
                    value={editFormData.contract_number || ''}
                    onChange={(e) => setEditFormData({...editFormData, contract_number: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Monto Total</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editFormData.total_amount || 0}
                    onChange={(e) => setEditFormData({...editFormData, total_amount: parseFloat(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Estado de Pago</label>
                  <select
                    value={editFormData.payment_status || 'sin_pago'}
                    onChange={(e) => setEditFormData({...editFormData, payment_status: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy"
                  >
                    <option value="sin_pago">Sin Pago</option>
                    <option value="pago_parcial">Pago Parcial</option>
                    <option value="pago_completo">Pago Completo</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bono Internacional</label>
                  <select
                    value={editFormData.international_bonus || 'No'}
                    onChange={(e) => setEditFormData({...editFormData, international_bonus: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy"
                  >
                    <option value="No">No</option>
                    <option value="Si">Si</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de Registro</label>
                  <input
                    type="date"
                    value={editFormData.created_at ? editFormData.created_at.split('T')[0] : ''}
                    onChange={(e) => setEditFormData({...editFormData, created_at: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">En Cobranzas</label>
                  <select
                    value={editFormData.in_collections || 'No'}
                    onChange={(e) => setEditFormData({...editFormData, in_collections: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy"
                  >
                    <option value="No">No</option>
                    <option value="Si">Si</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Noches Totales</label>
                  <input
                    type="number"
                    min="0"
                    value={editFormData.total_nights || ''}
                    onChange={(e) => setEditFormData({...editFormData, total_nights: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy"
                    placeholder="Ej: 7"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Noches Restantes</label>
                  <input
                    type="number"
                    min="0"
                    value={editFormData.remaining_nights || ''}
                    onChange={(e) => setEditFormData({...editFormData, remaining_nights: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy"
                    placeholder="Ej: 5"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notas</label>
                <textarea
                  value={editFormData.notes || ''}
                  onChange={(e) => setEditFormData({...editFormData, notes: e.target.value})}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={closeModals}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveClient}
                  className="bg-navy text-white px-4 py-2 rounded-lg hover:bg-navy/90"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Nuevo Cliente */}
      {showNewClientForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Nuevo Cliente
            </h3>
            
            <form className="space-y-4">
              {/* Selector de versión (Blue / Gold / Black) - opción elegida resaltada */}
              <div className="flex items-center gap-3 mb-2">
                <label className="text-sm font-medium text-gray-700">Versión:</label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleNewClientChange('version', 'cliente')}
                    className={`px-3 py-1 rounded-md text-sm font-semibold ${newClientData.version === 'cliente' ? 'bg-blue-600 text-white ring-2 ring-blue-800' : 'bg-gray-100 text-gray-700'}`}
                  >
                    Blue
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNewClientChange('version', 'clienteIB1')}
                    className={`px-3 py-1 rounded-md text-sm font-semibold ${newClientData.version === 'clienteIB1' ? 'bg-amber-600 text-white ring-2 ring-amber-800' : 'bg-gray-100 text-gray-700'}`}
                  >
                    Gold
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNewClientChange('version', 'clienteIB2')}
                    className={`px-3 py-1 rounded-md text-sm font-semibold ${newClientData.version === 'clienteIB2' ? 'bg-gray-900 text-white ring-2 ring-gray-700' : 'bg-gray-100 text-gray-700'}`}
                  >
                    Black
                  </button>
                </div>
              </div>
              {/* Primera fila */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">FECHA *</label>
                  <input
                    type="date"
                    value={newClientData.fecha}
                    onChange={(e) => handleNewClientChange('fecha', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">CONTRATO *</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value="KMPRY"
                      className="w-20 px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                      readOnly
                    />
                    <input
                      type="text"
                      value={newClientData.contrato_suffix || ''}
                      onChange={(e) => handleNewClientChange('contrato_suffix', e.target.value.toUpperCase())}
                      className={`w-24 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                        clientFormErrors.contrato_suffix 
                          ? 'border-red-500 focus:ring-red-500' 
                          : 'border-gray-300 focus:ring-navy'
                      }`}
                      placeholder="UIO"
                      maxLength="4"
                      required
                    />
                    <input
                      type="text"
                      value={newClientData.contrato_number || '0001'}
                      onChange={(e) => handleNewClientChange('contrato_number', e.target.value)}
                      className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy"
                      placeholder="0001"
                      maxLength="4"
                    />
                  </div>
                  <div className="mt-1 text-sm text-gray-500">
                    Formato: KMPRY {newClientData.contrato_suffix || 'XXX'} {newClientData.contrato_number || '0001'}
                  </div>
                  {clientFormErrors.contrato_suffix && (
                    <p className="mt-1 text-sm text-red-600">{clientFormErrors.contrato_suffix}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">NOMBRES *</label>
                  <input
                    type="text"
                    value={newClientData.nombres}
                    onChange={(e) => handleNewClientChange('nombres', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                      clientFormErrors.nombres 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 focus:ring-navy'
                    }`}
                    placeholder="Ej: Juan Carlos"
                    required
                  />
                  {clientFormErrors.nombres && (
                    <p className="mt-1 text-sm text-red-600">{clientFormErrors.nombres}</p>
                  )}
                </div>
              </div>

              {/* Segunda fila */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">APELLIDOS *</label>
                  <input
                    type="text"
                    value={newClientData.apellidos}
                    onChange={(e) => handleNewClientChange('apellidos', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                      clientFormErrors.apellidos 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 focus:ring-navy'
                    }`}
                    placeholder="Ej: Pérez González"
                    required
                  />
                  {clientFormErrors.apellidos && (
                    <p className="mt-1 text-sm text-red-600">{clientFormErrors.apellidos}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">CÉDULA *</label>
                  <input
                    type="text"
                    value={newClientData.cedula}
                    onChange={(e) => handleNewClientChange('cedula', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                      clientFormErrors.cedula 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 focus:ring-navy'
                    }`}
                    placeholder="Ej: 1234567890"
                    required
                  />
                  {clientFormErrors.cedula && (
                    <p className="mt-1 text-sm text-red-600">{clientFormErrors.cedula}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">TELÉFONO *</label>
                  <input
                    type="tel"
                    value={newClientData.telefono}
                    onChange={(e) => handleNewClientChange('telefono', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                      clientFormErrors.telefono 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 focus:ring-navy'
                    }`}
                    placeholder="Ej: 0999123456"
                    required
                  />
                  {clientFormErrors.telefono && (
                    <p className="mt-1 text-sm text-red-600">{clientFormErrors.telefono}</p>
                  )}
                </div>
              </div>

              {/* Tercera fila */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">NOCHES *</label>
                  <input
                    type="number"
                    min="0"
                    value={newClientData.noches}
                    onChange={(e) => handleNewClientChange('noches', parseInt(e.target.value) || 0)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                      clientFormErrors.noches 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 focus:ring-navy'
                    }`}
                    placeholder="Ej: 7"
                    required
                  />
                  {clientFormErrors.noches && (
                    <p className="mt-1 text-sm text-red-600">{clientFormErrors.noches}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">AÑOS *</label>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="anos_indefinido_admin"
                        checked={newClientData.anos_indefinido}
                        onChange={(e) => handleNewClientChange('anos_indefinido', e.target.checked)}
                        className="h-4 w-4 text-navy focus:ring-navy border-gray-300 rounded"
                      />
                      <label htmlFor="anos_indefinido_admin" className="ml-2 text-sm text-gray-700">
                        Indefinido (Contrato Vitalicio)
                      </label>
                    </div>
                    <input
                      type="number"
                      min="0"
                      value={newClientData.anos}
                      onChange={(e) => handleNewClientChange('anos', parseInt(e.target.value) || 0)}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                        clientFormErrors.anos 
                          ? 'border-red-500 focus:ring-red-500' 
                          : 'border-gray-300 focus:ring-navy'
                      }`}
                      placeholder={newClientData.anos_indefinido ? "Contrato vitalicio" : "Ej: 2"}
                      disabled={newClientData.anos_indefinido}
                      required
                    />
                    {clientFormErrors.anos && (
                      <p className="mt-1 text-sm text-red-600">{clientFormErrors.anos}</p>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">BONO INTERNACIONAL *</label>
                  <select
                    value={newClientData.bono_internacional}
                    onChange={(e) => handleNewClientChange('bono_internacional', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                      clientFormErrors.bono_internacional 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 focus:ring-navy'
                    }`}
                    required
                  >
                    <option value="">Seleccionar...</option>
                    <option value="No">No</option>
                    <option value="Si">Si</option>
                  </select>
                  {clientFormErrors.bono_internacional && (
                    <p className="mt-1 text-sm text-red-600">{clientFormErrors.bono_internacional}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">PAGO MIXTO</label>
                  <select
                    value={newClientData.pago_mixto}
                    onChange={(e) => handleNewClientChange('pago_mixto', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy"
                  >
                    <option value="No">No</option>
                    <option value="Si">Si</option>
                  </select>
                </div>
              </div>

              {/* Cuarta fila - Solo mostrar cuando NO es pago mixto */}
              {newClientData.pago_mixto === 'No' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">DATAFAST</label>
                    <select
                      value={newClientData.datafast}
                      onChange={(e) => handleNewClientChange('datafast', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy"
                    >
                      <option value="">Seleccionar...</option>
                      <option value="KMP">KMP</option>
                      <option value="RCC">RCC</option>
                      <option value="Kempery">Kempery</option>
                      <option value="Payphone Zindy">Payphone Zindy</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">TIPO DE TARJETA</label>
                    <select
                      value={newClientData.tipo_tarjeta}
                      onChange={(e) => handleNewClientChange('tipo_tarjeta', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy"
                    >
                      <option value="">Seleccionar...</option>
                      <option value="Visa">Visa</option>
                      <option value="Mastercard">Mastercard</option>
                      <option value="American Express">American Express</option>
                      <option value="Diners Club">Diners Club</option>
                      <option value="Efectivo">Efectivo</option>
                      <option value="Transferencia">Transferencia</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">TOTAL DE LA VENTA</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={newClientData.total_venta}
                      onChange={(e) => handleNewClientChange('total_venta', parseFloat(e.target.value) || 0)}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                        clientFormErrors.total_venta 
                          ? 'border-red-500 focus:ring-red-500' 
                          : 'border-gray-300 focus:ring-navy'
                      }`}
                      placeholder="Ej: 1000.00"
                    />
                    {clientFormErrors.total_venta && (
                      <p className="mt-1 text-sm text-red-600">{clientFormErrors.total_venta}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Puntos IB (calculado) y Sala - debajo de Total de la venta */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">PUNTOS IB</label>
                  <input
                    type="number"
                    value={newClientData.puntos_ib ?? 0}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                  />
                  <p className="mt-1 text-xs text-gray-500">Calculado según total de venta (500-1000→50, 1001-3000→100, 3001-5000→200, 5001+→300)</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">SALA</label>
                  <select
                    value={newClientData.sala ?? 'Sala 1'}
                    onChange={(e) => handleNewClientChange('sala', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy"
                  >
                    <option value="Sala 1">Sala 1</option>
                    <option value="Sala 2">Sala 2</option>
                  </select>
                </div>
                <div />
              </div>

              {/* Quinta fila - Forma de pago y tiempo */}
              {newClientData.pago_mixto === 'No' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">FORMA DE PAGO</label>
                    <select
                      value={newClientData.forma_pago}
                      onChange={(e) => handleNewClientChange('forma_pago', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy"
                    >
                      <option value="">Seleccionar...</option>
                      <option value="Corriente">Corriente</option>
                      <option value="Diferido">Diferido</option>
                    </select>
                  </div>
                  
                  {/* Campo de tiempo - Solo mostrar cuando es diferido */}
                  {newClientData.forma_pago === 'Diferido' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">TIEMPO</label>
                      <select
                        value={newClientData.tiempo_meses}
                        onChange={(e) => handleNewClientChange('tiempo_meses', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy"
                      >
                        <option value="">Seleccionar...</option>
                        <option value="3">3 meses</option>
                        <option value="6">6 meses</option>
                        <option value="9">9 meses</option>
                        <option value="12">12 meses</option>
                        <option value="24">24 meses</option>
                        <option value="36">36 meses</option>
                      </select>
                    </div>
                  )}
                </div>
              )}

              {/* Campos de pago mixto */}
              {newClientData.pago_mixto === 'Si' && (
                <div className="space-y-4">
                  <div className="border-t pt-4">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Información de Pago Mixto</h4>
                    
                    {/* Cantidad de tarjetas */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Cantidad de Tarjetas</label>
                      <select
                        value={newClientData.cantidad_tarjetas}
                        onChange={(e) => handleNewClientChange('cantidad_tarjetas', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy"
                      >
                        <option value="1">1 Tarjeta</option>
                        <option value="2">2 Tarjetas</option>
                        <option value="3">3 Tarjetas</option>
                        <option value="4">4 Tarjetas</option>
                        <option value="5">5 Tarjetas</option>
                      </select>
                    </div>

                    {/* Detalles de cada tarjeta */}
                    <div className="space-y-4">
                      {newClientData.tarjetas.map((tarjeta, index) => (
                        <div key={index} className="bg-gray-50 p-4 rounded-lg">
                          <h5 className="text-md font-medium text-gray-800 mb-3">Tarjeta {index + 1}</h5>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">DataFast</label>
                              <select
                                value={tarjeta.datafast}
                                onChange={(e) => handleTarjetaChange(index, 'datafast', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy"
                              >
                                <option value="">Seleccionar...</option>
                                <option value="KMP">KMP</option>
                                <option value="RCC">RCC</option>
                                <option value="Kempery">Kempery</option>
                                <option value="Payphone Zindy">Payphone Zindy</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Tarjeta</label>
                              <select
                                value={tarjeta.tipo}
                                onChange={(e) => handleTarjetaChange(index, 'tipo', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy"
                              >
                                <option value="">Seleccionar...</option>
                                <option value="Visa">Visa</option>
                                <option value="Mastercard">Mastercard</option>
                                <option value="American Express">American Express</option>
                                <option value="Diners Club">Diners Club</option>
                                <option value="Discover">Discover</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Monto ($)</label>
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={tarjeta.monto}
                                onChange={(e) => handleTarjetaChange(index, 'monto', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy"
                                placeholder="0.00"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Resumen de montos */}
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                      <h6 className="text-sm font-medium text-blue-800 mb-2">Resumen de Pagos</h6>
                      <div className="text-sm text-blue-700 space-y-1">
                        <p><strong>Total de tarjetas:</strong> {newClientData.cantidad_tarjetas}</p>
                        <p><strong>Suma de montos:</strong> ${newClientData.tarjetas.reduce((sum, tarjeta) => sum + (parseFloat(tarjeta.monto) || 0), 0).toFixed(2)}</p>
                        <p><strong>Total de venta (calculado):</strong> ${newClientData.total_venta.toFixed(2)}</p>
                        <p><strong>IVA (15%):</strong> ${newClientData.iva.toFixed(2)}</p>
                        <p><strong>Neto:</strong> ${newClientData.neto.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Quinta fila - Cálculos automáticos */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">IVA (15%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newClientData.iva.toFixed(2)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">NETO (Total - IVA)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newClientData.neto.toFixed(2)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">CORREO ELECTRÓNICO</label>
                  <input
                    type="email"
                    value={newClientData.correo_electronico}
                    onChange={(e) => handleNewClientChange('correo_electronico', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy"
                    placeholder="Ej: cliente@email.com"
                  />
                </div>
              </div>

              {/* Sexta fila */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">LINNER</label>
                  <input
                    type="text"
                    value={newClientData.linner}
                    onChange={(e) => handleNewClientChange('linner', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy"
                    placeholder="Ej: María González"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">CLOSER</label>
                  <input
                    type="text"
                    value={newClientData.closer}
                    onChange={(e) => handleNewClientChange('closer', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy"
                    placeholder="Ej: Carlos López"
                  />
                </div>
              </div>

              {/* Pagaré */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pagaré
                </label>
                <select
                  value={newClientData.pagare}
                  onChange={(e) => handleNewClientChange('pagare', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy"
                >
                  <option value="No">No</option>
                  <option value="Si">Sí</option>
                </select>
              </div>

              {/* Campos del pagaré (solo si es "Sí") */}
              {newClientData.pagare === 'Si' && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fecha del Pagaré *
                      </label>
                      <input
                        type="date"
                        value={newClientData.fecha_pagare}
                        onChange={(e) => handleNewClientChange('fecha_pagare', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy"
                        required={newClientData.pagare === 'Si'}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Monto del Pagaré *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={newClientData.monto_pagare}
                        onChange={(e) => handleNewClientChange('monto_pagare', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy"
                        placeholder="0.00"
                        required={newClientData.pagare === 'Si'}
                      />
                    </div>
                  </div>

                  {/* Campos adicionales para pagaré */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Cantidad de Cuotas *</label>
                      <input
                        type="number"
                        min="1"
                        value={newClientData.cantidad_cuotas}
                        onChange={(e) => handleNewClientChange('cantidad_cuotas', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy"
                        required={newClientData.pagare === 'Si'}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Cantidad de Cuotas Asumidas *</label>
                      <input
                        type="number"
                        min="0"
                        value={newClientData.cuotas_asumidas}
                        onChange={(e) => handleNewClientChange('cuotas_asumidas', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy"
                        required={newClientData.pagare === 'Si'}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Valor de cada cuota</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={newClientData.valor_cuota}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none"
                      />
                    </div>
                    <div className="md:col-span-3">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Total Pagaré</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={newClientData.total_pagare}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Observaciones */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">OBSERVACIONES</label>
                <textarea
                  value={newClientData.observaciones}
                  onChange={(e) => handleNewClientChange('observaciones', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy"
                  placeholder="Notas adicionales sobre el cliente..."
                />
              </div>

              {/* Botones */}
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={closeModals}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveNewClient}
                  disabled={!isClientFormValid}
                  className={`px-4 py-2 rounded-lg ${
                    isClientFormValid 
                      ? 'bg-navy text-white hover:bg-navy/90' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Crear Cliente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de confirmación de eliminación */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Confirmar Eliminación
            </h3>
            <p className="text-gray-600 mb-4">
              Para eliminar al cliente <strong>{selectedClient?.first_name} {selectedClient?.last_name}</strong>, 
              ingresa la contraseña de administrador:
            </p>
            
            <div className="mb-4">
              <input
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Contraseña de administrador"
                autoFocus
              />
              {deletePasswordError && (
                <p className="text-red-500 text-sm mt-1">{deletePasswordError}</p>
              )}
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={closeModals}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDeletePasswordSubmit}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
              >
                Eliminar Cliente
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Nueva Reserva */}
      {showBookingForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Nueva Reserva
            </h3>
            
            {bookingError && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {bookingError}
              </div>
            )}

            <form className="space-y-4">
              {/* Búsqueda de contrato por últimos 4 dígitos */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-800 mb-3">🔍 Buscar Contrato por Últimos 4 Dígitos</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Últimos 4 dígitos del contrato
                    </label>
                    <input
                      type="text"
                      maxLength="4"
                      value={contractSearchTerm}
                      onChange={(e) => setContractSearchTerm(e.target.value.replace(/\D/g, ''))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ej: 2052"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={handleSearchContracts}
                      className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                      Buscar
                    </button>
                  </div>
                </div>
              </div>

              {/* Resultados de búsqueda de contratos */}
              {showContractSearch && contractSearchResults.length > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-medium text-green-800 mb-3">📋 Contratos Encontrados</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {contractSearchResults.map((client) => (
                      <div
                        key={client.id}
                        onClick={() => handleSelectContract(client)}
                        className="p-3 bg-white border border-green-200 rounded-lg cursor-pointer hover:bg-green-100 transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium text-gray-900">{client.name}</div>
                            <div className="text-sm text-gray-600">Contrato: {client.contract_number}</div>
                            <div className="text-sm text-gray-600">Email: {client.email}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium text-green-600">
                              {client.remaining_nights} de {client.total_nights} noches
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Información del cliente validado */}
              {validatedClient && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-medium text-green-800 mb-2">Cliente Validado</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Nombre:</span> {validatedClient.name}
                    </div>
                    <div>
                      <span className="font-medium">Email:</span> {validatedClient.email}
                    </div>
                    <div>
                      <span className="font-medium">Teléfono:</span> {validatedClient.phone}
                    </div>
                    <div>
                      <span className="font-medium">Noches Disponibles:</span> 
                      <span className="text-green-600 font-bold ml-1">
                        {validatedClient.remaining_nights} de {validatedClient.total_nights}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Selección de ciudad */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ciudad *
                  </label>
                  <select
                    value={bookingFormData.city}
                    onChange={(e) => handleBookingFormChange('city', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy"
                  >
                    <option value="">Seleccionar ciudad</option>
                    <option value="Baños">Baños</option>
                    <option value="Cuenca">Cuenca</option>
                    <option value="Quito">Quito</option>
                    <option value="Manta">Manta</option>
                    <option value="Tonsupa">Tonsupa</option>
                    <option value="Salinas">Salinas</option>
                    <option value="Otros">Otros</option>
                  </select>
                </div>
                {bookingFormData.city === 'Otros' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre de la Ciudad *
                    </label>
                    <input
                      type="text"
                      value={bookingFormData.custom_city}
                      onChange={(e) => handleBookingFormChange('custom_city', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy"
                      placeholder="Ej: Guayaquil"
                    />
                  </div>
                )}
              </div>

              {/* Noches y personas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Noches Solicitadas *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={bookingFormData.nights_requested}
                    onChange={(e) => handleBookingFormChange('nights_requested', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy"
                    placeholder="Ej: 3"
                  />
                  {validatedClient && bookingFormData.nights_requested && parseInt(bookingFormData.nights_requested) > validatedClient.remaining_nights && (
                    <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-800 font-medium">
                        ⚠️ Advertencia: El cliente solo tiene {validatedClient.remaining_nights} noches disponibles
                      </p>
                      <p className="text-sm text-red-700 mt-1">
                        Se cobrarán {parseInt(bookingFormData.nights_requested) - validatedClient.remaining_nights} noches adicionales a $99 cada una
                      </p>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cantidad de Personas *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={bookingFormData.people_count}
                    onChange={(e) => handleBookingFormChange('people_count', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy"
                    placeholder="Ej: 2"
                  />
                  {bookingFormData.people_count > 6 && (
                    <p className="text-sm text-orange-600 mt-1">
                      Costo adicional: ${calculateAdditionalCost()} por {bookingFormData.people_count - 6} persona(s) extra
                    </p>
                  )}
                </div>

                {/* Valor de la Reserva */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Valor de la Reserva *
                  </label>
                  <select
                    value={bookingFormData.reservation_value}
                    onChange={(e) => handleBookingFormChange('reservation_value', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy"
                  >
                    <option value="">Seleccionar valor</option>
                    <option value="49.50">$49.50</option>
                    <option value="59.50">$59.50</option>
                    <option value="79.50">$79.50</option>
                    <option value="99.50">$99.50</option>
                    <option value="custom">PVP (Valor personalizado)</option>
                  </select>
                  
                  {bookingFormData.reservation_value === 'custom' && (
                    <div className="mt-2">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={bookingFormData.custom_value}
                        onChange={(e) => handleBookingFormChange('custom_value', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy"
                        placeholder="Ingrese el valor personalizado"
                      />
                    </div>
                  )}
                  
                  {/* Mostrar cálculo del valor total */}
                  {bookingFormData.reservation_value && bookingFormData.nights_requested && (
                    <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm font-medium text-blue-800">Cálculo del Valor Total:</p>
                      {(() => {
                        const calculation = calculateTotalReservationValue(bookingFormData);
                        return (
                          <div className="text-sm text-blue-700 mt-1">
                            <p>Valor base: ${calculation.baseValue.toFixed(2)} × {calculation.nightsCount} noche(s) = ${(calculation.baseValue * calculation.nightsCount).toFixed(2)}</p>
                            {calculation.extraPeople > 0 && (
                              <p>Personas adicionales: {calculation.extraPeople} × $35 × {calculation.nightsCount} noche(s) = ${calculation.extraPeopleCost.toFixed(2)}</p>
                            )}
                            {calculation.extraNights > 0 && (
                              <p className="text-red-600 font-medium">⚠️ Noches adicionales: {calculation.extraNights} × $99 = ${calculation.extraNightsCost.toFixed(2)}</p>
                            )}
                            <p className="font-semibold mt-1">Total: ${calculation.totalValue.toFixed(2)}</p>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              </div>

              {/* Datos de participantes */}
              {bookingFormData.people_count > 0 && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h4 className="font-medium text-purple-800 mb-3">👥 Datos de Participantes</h4>
                  <div className="space-y-4">
                    {Array.from({ length: bookingFormData.people_count }, (_, index) => (
                      <div key={index} className="bg-white border border-purple-200 rounded-lg p-4">
                        <h5 className="font-medium text-gray-900 mb-3">Persona {index + 1}</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Nombre *
                            </label>
                            <input
                              type="text"
                              value={participantsData[index]?.first_name || ''}
                              onChange={(e) => handleParticipantChange(index, 'first_name', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                              placeholder="Ej: Juan"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Apellido *
                            </label>
                            <input
                              type="text"
                              value={participantsData[index]?.last_name || ''}
                              onChange={(e) => handleParticipantChange(index, 'last_name', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                              placeholder="Ej: Pérez"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Cédula/Pasaporte *
                            </label>
                            <input
                              type="text"
                              value={participantsData[index]?.identification || ''}
                              onChange={(e) => handleParticipantChange(index, 'identification', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                              placeholder="Ej: 1234567890"
                            />
                          </div>
                          <div className="md:col-span-2 lg:col-span-3">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Relación con el titular
                            </label>
                            <select
                              value={participantsData[index]?.relationship || 'Adulto'}
                              onChange={(e) => handleParticipantChange(index, 'relationship', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                            >
                              <option value="Adulto">Adulto</option>
                              <option value="Menor">Menor</option>
                              <option value="Cónyuge">Cónyuge</option>
                              <option value="Hijo(a)">Hijo(a)</option>
                              <option value="Padre/Madre">Padre/Madre</option>
                              <option value="Hermano(a)">Hermano(a)</option>
                              <option value="Amigo(a)">Amigo(a)</option>
                              <option value="Otro">Otro</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Fuente de contacto */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fuente de Contacto *
                </label>
                <select
                  value={bookingFormData.contact_source}
                  onChange={(e) => handleBookingFormChange('contact_source', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy"
                >
                  <option value="">Seleccionar fuente</option>
                  <option value="Empresa Propia">Empresa Propia</option>
                  <option value="Airbnb">Airbnb</option>
                  <option value="Booking.com">Booking.com</option>
                  <option value="Otros">Otros</option>
                </select>
              </div>

              {/* Fechas de estadía */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de Check-in
                  </label>
                  <input
                    type="date"
                    value={bookingFormData.check_in_date}
                    onChange={(e) => handleBookingFormChange('check_in_date', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de Check-out
                  </label>
                  <input
                    type="date"
                    value={bookingFormData.check_out_date}
                    onChange={(e) => handleBookingFormChange('check_out_date', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy"
                  />
                </div>
              </div>

              {/* Información adicional */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contacto de Emergencia
                  </label>
                  <input
                    type="tel"
                    value={bookingFormData.emergency_contact}
                    onChange={(e) => handleBookingFormChange('emergency_contact', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy"
                    placeholder="Ej: +593 99 123 4567"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Restricciones Alimentarias
                  </label>
                  <input
                    type="text"
                    value={bookingFormData.dietary_restrictions}
                    onChange={(e) => handleBookingFormChange('dietary_restrictions', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy"
                    placeholder="Ej: Vegetariano, Sin gluten, etc."
                  />
                </div>
              </div>

              {/* Indicaciones generales */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Indicaciones Generales
                </label>
                <textarea
                  value={bookingFormData.special_requests}
                  onChange={(e) => handleBookingFormChange('special_requests', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy"
                  rows="3"
                  placeholder="Indicaciones generales para la estadía, preferencias de habitación, etc."
                />
              </div>

              {/* Botones */}
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowBookingForm(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleShowPreview}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Vista Previa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Vista Previa de Reserva */}
      {showBookingPreview && validatedClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Vista Previa de la Reserva
            </h3>
            
            <div className="space-y-4">
              {/* Información del cliente */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Información del Cliente</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <div><span className="font-medium">Nombre:</span> {validatedClient.name}</div>
                  <div><span className="font-medium">Contrato:</span> {validatedClient.contract_number}</div>
                  <div><span className="font-medium">Email:</span> {validatedClient.email}</div>
                  <div><span className="font-medium">Teléfono:</span> {validatedClient.phone}</div>
                </div>
              </div>

              {/* Detalles de la reserva */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Detalles de la Reserva</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <div><span className="font-medium">Ciudad:</span> {bookingFormData.city === 'Otros' ? bookingFormData.custom_city : bookingFormData.city}</div>
                  <div><span className="font-medium">Noches:</span> {bookingFormData.nights_requested}</div>
                  <div><span className="font-medium">Personas:</span> {bookingFormData.people_count}</div>
                  <div><span className="font-medium">Fuente:</span> {bookingFormData.contact_source}</div>
                </div>
                {bookingFormData.people_count > 6 && (
                  <div className="mt-2 p-2 bg-orange-100 rounded">
                    <span className="font-medium text-orange-800">
                      Costo adicional: ${calculateAdditionalCost()} por {bookingFormData.people_count - 6} persona(s) extra
                    </span>
                  </div>
                )}
                {bookingFormData.observations && (
                  <div className="mt-2">
                    <span className="font-medium">Observaciones:</span>
                    <p className="text-sm text-gray-600 mt-1">{bookingFormData.observations}</p>
                  </div>
                )}
              </div>

              {/* Información adicional */}
              {(bookingFormData.check_in_date || bookingFormData.check_out_date || bookingFormData.emergency_contact || bookingFormData.dietary_restrictions || bookingFormData.special_requests) && (
                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Información Adicional</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    {bookingFormData.check_in_date && (
                      <div><span className="font-medium">Check-in:</span> {new Date(bookingFormData.check_in_date).toLocaleDateString('es-ES')}</div>
                    )}
                    {bookingFormData.check_out_date && (
                      <div><span className="font-medium">Check-out:</span> {new Date(bookingFormData.check_out_date).toLocaleDateString('es-ES')}</div>
                    )}
                    {bookingFormData.emergency_contact && (
                      <div><span className="font-medium">Contacto Emergencia:</span> {bookingFormData.emergency_contact}</div>
                    )}
                    {bookingFormData.dietary_restrictions && (
                      <div><span className="font-medium">Restricciones Alimentarias:</span> {bookingFormData.dietary_restrictions}</div>
                    )}
                  </div>
                  {bookingFormData.special_requests && (
                    <div className="mt-2">
                      <span className="font-medium">Solicitudes Especiales:</span>
                      <p className="text-sm text-gray-600 mt-1">{bookingFormData.special_requests}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Lista de participantes */}
              {participantsData.length > 0 && (
                <div className="bg-purple-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">👥 Participantes</h4>
                  <div className="space-y-3">
                    {participantsData.map((participant, index) => (
                      <div key={index} className="bg-white border border-purple-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <span className="font-medium text-gray-900 text-lg">
                              {participant.first_name} {participant.last_name}
                            </span>
                            <span className="text-sm text-purple-600 font-medium ml-2">
                              Persona {index + 1}
                            </span>
                          </div>
                          {participant.relationship && (
                            <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                              {participant.relationship}
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-600">
                          <div><span className="font-medium">Cédula:</span> {participant.identification}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Vista previa del documento */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">📄 Vista Previa del Documento</h4>
                <div className="bg-white border border-blue-200 rounded-lg p-4">
                  <div className="space-y-3">
                    {/* Encabezado del documento */}
                    <div className="text-center border-b border-gray-200 pb-3">
                      <h3 className="text-lg font-bold text-gray-900">Manual de Uso - {getCityData(bookingFormData.city).UBICACION}</h3>
                      <p className="text-sm text-gray-600 mt-1">Cliente: {validatedClient.name}</p>
                      <p className="text-sm text-gray-600">Contrato: {validatedClient.contract_number}</p>
                    </div>

                    {/* Información de la reserva */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Ubicación:</span>
                        <p className="text-gray-600">{getCityData(bookingFormData.city).UBICACION}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Noches:</span>
                        <p className="text-gray-600">{bookingFormData.nights_requested}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Personas:</span>
                        <p className="text-gray-600">{bookingFormData.people_count}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Fecha de reserva:</span>
                        <p className="text-gray-600">{new Date().toLocaleDateString('es-ES')}</p>
                      </div>
                    </div>

                    {/* Información de acceso */}
                    <div className="border-t border-gray-200 pt-3">
                      <h4 className="font-medium text-gray-900 mb-2">Información de Acceso</h4>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p><span className="font-medium">Wi-Fi:</span> {bookingFormData.wifi_name || 'No especificado'}</p>
                        <p><span className="font-medium">Contraseña:</span> {bookingFormData.wifi_password || 'No especificada'}</p>
                        <p><span className="font-medium">Contacto:</span> +593 99 922 2210</p>
                        {bookingFormData.google_maps_link && (
                          <p><span className="font-medium">Ubicación Google Maps:</span> <a href={bookingFormData.google_maps_link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Ver ubicación</a></p>
                        )}
                      </div>
                    </div>

                    {/* Participantes */}
                    {participantsData.length > 0 && (
                      <div className="border-t border-gray-200 pt-3">
                        <h4 className="font-medium text-gray-900 mb-2">Participantes</h4>
                        <div className="text-sm text-gray-600">
                          {participantsData.map((participant, index) => (
                            <div key={index} className="flex justify-between">
                              <span>{participant.first_name} {participant.last_name}</span>
                              <span className="text-gray-500">({participant.identification})</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Información adicional */}
                    {(bookingFormData.check_in_date || bookingFormData.check_out_date || bookingFormData.emergency_contact || bookingFormData.dietary_restrictions || bookingFormData.special_requests) && (
                      <div className="border-t border-gray-200 pt-3">
                        <h4 className="font-medium text-gray-900 mb-2">Información Adicional</h4>
                        <div className="text-sm text-gray-600 space-y-1">
                          {bookingFormData.check_in_date && (
                            <p><span className="font-medium">Check-in:</span> {new Date(bookingFormData.check_in_date).toLocaleDateString('es-ES')}</p>
                          )}
                          {bookingFormData.check_out_date && (
                            <p><span className="font-medium">Check-out:</span> {new Date(bookingFormData.check_out_date).toLocaleDateString('es-ES')}</p>
                          )}
                          {bookingFormData.emergency_contact && (
                            <p><span className="font-medium">Contacto de emergencia:</span> {bookingFormData.emergency_contact}</p>
                          )}
                          {bookingFormData.dietary_restrictions && (
                            <p><span className="font-medium">Restricciones alimentarias:</span> {bookingFormData.dietary_restrictions}</p>
                          )}
                          {bookingFormData.special_requests && (
                            <p><span className="font-medium">Solicitudes especiales:</span> {bookingFormData.special_requests}</p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Observaciones */}
                    {bookingFormData.observations && (
                      <div className="border-t border-gray-200 pt-3">
                        <h4 className="font-medium text-gray-900 mb-2">Observaciones</h4>
                        <p className="text-sm text-gray-600">{bookingFormData.observations}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Vista previa del mensaje de WhatsApp */}
              <div className="bg-green-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">📱 Vista Previa del Mensaje de WhatsApp</h4>
                <div className="bg-white border border-green-200 rounded-lg p-4">
                  <div className="text-sm text-gray-700 whitespace-pre-line">
                    {`🏡 *¡Bienvenido/a a ${getCityData(bookingFormData.city).UBICACION}!*

Estimado/a ${validatedClient.name},

Su reserva ha sido confirmada exitosamente. A continuación encontrará los detalles de su estadía:

📋 *Detalles de la Reserva:*
• Ubicación: ${getCityData(bookingFormData.city).UBICACION}
• Noches: ${bookingFormData.nights_requested}
• Personas: ${bookingFormData.people_count}
• Fecha de reserva: ${new Date().toLocaleDateString('es-ES')}

📖 *Manual de Uso:*
Adjunto encontrará el manual completo con toda la información necesaria para su estadía, incluyendo:
• Información de acceso y check-in
• Detalles del Wi-Fi: ${bookingFormData.wifi_name || 'No especificado'}
• Contraseña Wi-Fi: ${bookingFormData.wifi_password || 'No especificada'}
${bookingFormData.google_maps_link ? `• Ubicación: ${bookingFormData.google_maps_link}` : ''}
• Normas de la casa
• Procedimientos de check-out

📞 *Contacto de Emergencia:*
+593 99 922 2210

¡Esperamos que tenga una excelente estadía!

*Kempery World Travel* 🌟`}
                  </div>
                </div>
              </div>

              {/* Resumen de noches */}
              <div className="bg-green-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Resumen de Noches</h4>
                <div className="text-sm">
                  <div>Noches disponibles: <span className="font-bold text-green-600">{validatedClient.remaining_nights}</span></div>
                  <div>Noches solicitadas: <span className="font-bold">{bookingFormData.nights_requested}</span></div>
                  <div>Noches restantes después de la reserva: <span className="font-bold text-blue-600">{validatedClient.remaining_nights - parseInt(bookingFormData.nights_requested || 0)}</span></div>
                </div>
              </div>
            </div>

            {/* Botones */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setShowBookingPreview(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Volver a Editar
              </button>
              <button
                type="button"
                onClick={handleConfirmBooking}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                Confirmar Reserva
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Detalles de Reserva */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Detalles de la Reserva
              </h3>
              <button
                onClick={() => setSelectedBooking(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Información del cliente */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Información del Cliente</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <div><span className="font-medium">Nombre:</span> {selectedBooking.client_name}</div>
                  <div><span className="font-medium">Contrato:</span> {selectedBooking.contract_number}</div>
                  <div><span className="font-medium">Email:</span> {selectedBooking.client_email}</div>
                  <div><span className="font-medium">Teléfono:</span> {selectedBooking.client_phone}</div>
                </div>
              </div>

              {/* Detalles de la reserva */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Detalles de la Reserva</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <div><span className="font-medium">N° Reserva:</span> {selectedBooking.booking_number}</div>
                  <div><span className="font-medium">Ciudad:</span> {selectedBooking.city_display}</div>
                  <div><span className="font-medium">Noches:</span> {selectedBooking.nights_requested}</div>
                  <div><span className="font-medium">Personas:</span> {selectedBooking.people_count}</div>
                  <div><span className="font-medium">Fuente:</span> {selectedBooking.contact_source}</div>
                  <div><span className="font-medium">Estado:</span> 
                    <span className={`ml-1 px-2 py-1 text-xs rounded-full ${
                      selectedBooking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                      selectedBooking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      selectedBooking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedBooking.status === 'confirmed' ? 'Confirmada' :
                       selectedBooking.status === 'pending' ? 'Pendiente' :
                       selectedBooking.status === 'cancelled' ? 'Cancelada' :
                       selectedBooking.status}
                    </span>
                  </div>
                </div>
                {selectedBooking.additional_people > 0 && (
                  <div className="mt-2 p-2 bg-orange-100 rounded">
                    <span className="text-sm text-orange-800">
                      Personas adicionales: {selectedBooking.additional_people} (+${selectedBooking.additional_cost})
                    </span>
                  </div>
                )}
                {selectedBooking.observations && (
                  <div className="mt-2">
                    <span className="font-medium text-sm">Observaciones:</span>
                    <p className="text-sm text-gray-600 mt-1">{selectedBooking.observations}</p>
                  </div>
                )}
              </div>

              {/* Participantes */}
              {selectedBooking.participants_data && selectedBooking.participants_data.length > 0 && (
                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Participantes</h4>
                  <div className="space-y-2">
                    {selectedBooking.participants_data.map((participant, index) => (
                      <div key={index} className="text-sm bg-white p-2 rounded">
                        <span className="font-medium">{participant.first_name} {participant.last_name}</span>
                        <span className="text-gray-500 ml-2">({participant.identification})</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Fechas */}
              <div className="bg-purple-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Fechas</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <div><span className="font-medium">Fecha de creación:</span> {new Date(selectedBooking.created_at).toLocaleDateString('es-ES')}</div>
                  <div><span className="font-medium">Última actualización:</span> {new Date(selectedBooking.updated_at).toLocaleDateString('es-ES')}</div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={() => setSelectedBooking(null)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Edición de Reserva */}
      {showEditBookingForm && editingBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Editar Reserva - {editingBooking.booking_number}
              </h3>
              <button
                onClick={() => {
                  setShowEditBookingForm(false);
                  setEditingBooking(null);
                  setEditValidatedClient(null);
                  setEditBookingError('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {editBookingError && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {editBookingError}
              </div>
            )}

            <form className="space-y-6">
              {/* Información del cliente */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">👤 Información del Cliente</h4>
                {editValidatedClient ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div><span className="font-medium">Nombre:</span> {editValidatedClient.name}</div>
                    <div><span className="font-medium">Contrato:</span> {editValidatedClient.contract_number}</div>
                    <div><span className="font-medium">Email:</span> {editValidatedClient.email}</div>
                    <div><span className="font-medium">Teléfono:</span> {editValidatedClient.phone}</div>
                    <div><span className="font-medium">Noches disponibles:</span> {editValidatedClient.remaining_nights}</div>
                    <div><span className="font-medium">Noches totales:</span> {editValidatedClient.total_nights}</div>
                  </div>
                ) : (
                  <p className="text-gray-500">Cliente no encontrado</p>
                )}
              </div>

              {/* Información básica de la reserva */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ciudad *
                  </label>
                  <select
                    value={editBookingFormData.city}
                    onChange={(e) => handleEditBookingFormChange('city', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy"
                  >
                    <option value="">Seleccionar ciudad</option>
                    <option value="Baños">Baños</option>
                    <option value="Cuenca">Cuenca</option>
                    <option value="Quito">Quito</option>
                    <option value="Manta">Manta</option>
                    <option value="Tonsupa">Tonsupa</option>
                    <option value="Salinas">Salinas</option>
                    <option value="Otros">Otros</option>
                  </select>
                </div>

                {editBookingFormData.city === 'Otros' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ciudad Personalizada *
                    </label>
                    <input
                      type="text"
                      value={editBookingFormData.custom_city}
                      onChange={(e) => handleEditBookingFormChange('custom_city', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy"
                      placeholder="Ej: Guayaquil, Ambato, etc."
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Noches Solicitadas *
                  </label>
                  <input
                    type="number"
                    value={editBookingFormData.nights_requested}
                    onChange={(e) => handleEditBookingFormChange('nights_requested', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy"
                    min="1"
                    max="30"
                    placeholder="Ej: 3"
                  />
                  {editValidatedClient && editBookingFormData.nights_requested && parseInt(editBookingFormData.nights_requested) > editValidatedClient.remaining_nights && (
                    <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-800 font-medium">
                        ⚠️ Advertencia: El cliente solo tiene {editValidatedClient.remaining_nights} noches disponibles
                      </p>
                      <p className="text-sm text-red-700 mt-1">
                        Se cobrarán {parseInt(editBookingFormData.nights_requested) - editValidatedClient.remaining_nights} noches adicionales a $99 cada una
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cantidad de Personas *
                  </label>
                  <input
                    type="number"
                    value={editBookingFormData.people_count}
                    onChange={(e) => handleEditBookingFormChange('people_count', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy"
                    min="1"
                    max="20"
                    placeholder="Ej: 2"
                  />
                </div>

                {/* Valor de la Reserva */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Valor de la Reserva *
                  </label>
                  <select
                    value={editBookingFormData.reservation_value}
                    onChange={(e) => handleEditBookingFormChange('reservation_value', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy"
                  >
                    <option value="">Seleccionar valor</option>
                    <option value="49.50">$49.50</option>
                    <option value="59.50">$59.50</option>
                    <option value="79.50">$79.50</option>
                    <option value="99.50">$99.50</option>
                    <option value="custom">PVP (Valor personalizado)</option>
                  </select>
                  
                  {editBookingFormData.reservation_value === 'custom' && (
                    <div className="mt-2">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={editBookingFormData.custom_value}
                        onChange={(e) => handleEditBookingFormChange('custom_value', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy"
                        placeholder="Ingrese el valor personalizado"
                      />
                    </div>
                  )}
                  
                  {/* Mostrar cálculo del valor total */}
                  {editBookingFormData.reservation_value && editBookingFormData.nights_requested && (
                    <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm font-medium text-blue-800">Cálculo del Valor Total:</p>
                      {(() => {
                        const calculation = calculateTotalReservationValue(editBookingFormData);
                        return (
                          <div className="text-sm text-blue-700 mt-1">
                            <p>Valor base: ${calculation.baseValue.toFixed(2)} × {calculation.nightsCount} noche(s) = ${(calculation.baseValue * calculation.nightsCount).toFixed(2)}</p>
                            {calculation.extraPeople > 0 && (
                              <p>Personas adicionales: {calculation.extraPeople} × $35 × {calculation.nightsCount} noche(s) = ${calculation.extraPeopleCost.toFixed(2)}</p>
                            )}
                            {calculation.extraNights > 0 && (
                              <p className="text-red-600 font-medium">⚠️ Noches adicionales: {calculation.extraNights} × $99 = ${calculation.extraNightsCost.toFixed(2)}</p>
                            )}
                            <p className="font-semibold mt-1">Total: ${calculation.totalValue.toFixed(2)}</p>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fuente de Contacto *
                  </label>
                  <select
                    value={editBookingFormData.contact_source}
                    onChange={(e) => handleEditBookingFormChange('contact_source', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy"
                  >
                    <option value="">Seleccionar fuente</option>
                    <option value="Propia">Propia</option>
                    <option value="Airbnb">Airbnb</option>
                    <option value="Booking.com">Booking.com</option>
                    <option value="Facebook">Facebook</option>
                    <option value="Instagram">Instagram</option>
                    <option value="Referido">Referido</option>
                    <option value="Otros">Otros</option>
                  </select>
                </div>
              </div>

              {/* Información de Wi-Fi */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre de Red Wi-Fi
                  </label>
                  <input
                    type="text"
                    value={editBookingFormData.wifi_name}
                    onChange={(e) => handleEditBookingFormChange('wifi_name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy"
                    placeholder="Ej: KemperyQuito, MiCasa_WiFi, etc."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contraseña Wi-Fi
                  </label>
                  <input
                    type="text"
                    value={editBookingFormData.wifi_password}
                    onChange={(e) => handleEditBookingFormChange('wifi_password', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy"
                    placeholder="Ej: Kempery2025, MiPassword123, etc."
                  />
                </div>
              </div>

              {/* Enlace de Google Maps */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enlace de Google Maps
                </label>
                <input
                  type="url"
                  value={editBookingFormData.google_maps_link}
                  onChange={(e) => handleEditBookingFormChange('google_maps_link', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy"
                  placeholder="https://maps.app.goo.gl/..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  Ingresa el enlace completo de Google Maps de la ubicación específica
                </p>
              </div>

              {/* Fechas de check-in y check-out */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de Check-in
                  </label>
                  <input
                    type="date"
                    value={editBookingFormData.check_in_date}
                    onChange={(e) => handleEditBookingFormChange('check_in_date', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de Check-out
                  </label>
                  <input
                    type="date"
                    value={editBookingFormData.check_out_date}
                    onChange={(e) => handleEditBookingFormChange('check_out_date', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy"
                  />
                </div>
              </div>

              {/* Información adicional */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contacto de Emergencia
                  </label>
                  <input
                    type="text"
                    value={editBookingFormData.emergency_contact}
                    onChange={(e) => handleEditBookingFormChange('emergency_contact', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy"
                    placeholder="Ej: +593 99 123 4567"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Restricciones Alimentarias
                  </label>
                  <input
                    type="text"
                    value={editBookingFormData.dietary_restrictions}
                    onChange={(e) => handleEditBookingFormChange('dietary_restrictions', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy"
                    placeholder="Ej: Vegetariano, Sin gluten, etc."
                  />
                </div>
              </div>

              {/* Indicaciones generales */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Indicaciones Generales
                </label>
                <textarea
                  value={editBookingFormData.special_requests}
                  onChange={(e) => handleEditBookingFormChange('special_requests', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy"
                  rows="3"
                  placeholder="Indicaciones generales para la estadía, preferencias de habitación, etc."
                />
              </div>

              {/* Observaciones */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Observaciones Generales
                </label>
                <textarea
                  value={editBookingFormData.observations}
                  onChange={(e) => handleEditBookingFormChange('observations', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy"
                  rows="3"
                  placeholder="Reglas especiales, cobros adicionales, notas importantes, etc."
                />
              </div>

              {/* Participantes */}
              {editParticipantsData.length > 0 && (
                <div className="bg-purple-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">👥 Participantes ({editParticipantsData.length})</h4>
                  <div className="space-y-4">
                    {editParticipantsData.map((participant, index) => (
                      <div key={index} className="bg-white border border-purple-200 rounded-lg p-4">
                        <div className="flex justify-between items-center mb-3">
                          <h5 className="font-medium text-gray-900">Persona {index + 1}</h5>
                          <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                            {participant.relationship || 'Adulto'}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Nombre *
                            </label>
                            <input
                              type="text"
                              value={participant.first_name || ''}
                              onChange={(e) => handleEditParticipantChange(index, 'first_name', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                              placeholder="Ej: Juan"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Apellido *
                            </label>
                            <input
                              type="text"
                              value={participant.last_name || ''}
                              onChange={(e) => handleEditParticipantChange(index, 'last_name', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                              placeholder="Ej: Pérez"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Cédula *
                            </label>
                            <input
                              type="text"
                              value={participant.identification || ''}
                              onChange={(e) => handleEditParticipantChange(index, 'identification', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                              placeholder="Ej: 1234567890"
                            />
                          </div>
                          <div className="md:col-span-2 lg:col-span-3">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Relación con el titular
                            </label>
                            <select
                              value={participant.relationship || 'Adulto'}
                              onChange={(e) => handleEditParticipantChange(index, 'relationship', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                            >
                              <option value="Adulto">Adulto</option>
                              <option value="Niño">Niño</option>
                              <option value="Bebé">Bebé</option>
                              <option value="Adulto Mayor">Adulto Mayor</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Resumen de costo adicional */}
              {calculateEditAdditionalCost() > 0 && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <h4 className="font-medium text-orange-800 mb-2">💰 Costo Adicional</h4>
                  <p className="text-sm text-orange-700">
                    Personas adicionales: {Math.max(0, editBookingFormData.people_count - 6)} × {editBookingFormData.nights_requested} noches × $35 = ${calculateEditAdditionalCost()}
                  </p>
                </div>
              )}
            </form>

            {/* Botones */}
            <div className="flex justify-end space-x-3 pt-6">
              <button
                type="button"
                onClick={() => {
                  setShowEditBookingForm(false);
                  setEditingBooking(null);
                  setEditValidatedClient(null);
                  setEditBookingError('');
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmEditBooking}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Actualizar Reserva
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Nuevo Requerimiento */}
      {showRequirementForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Nuevo Requerimiento
            </h3>

            {requirementError && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {requirementError}
              </div>
            )}

            <form className="space-y-4">
              {/* Búsqueda de contrato */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-800 mb-3">🔍 Buscar Cliente por Contrato</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Número de Contrato *
                    </label>
                    <input
                      type="text"
                      value={requirementSearchTerm}
                      onChange={(e) => setRequirementSearchTerm(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ej: KMPERY STD 2052"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={handleRequirementContractSearch}
                      className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                      Buscar
                    </button>
                  </div>
                </div>
              </div>

              {/* Resultados de búsqueda */}
              {showRequirementSearch && requirementSearchResults.length > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-medium text-green-800 mb-3">📋 Clientes Encontrados</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {requirementSearchResults.map((client) => (
                      <div
                        key={client.id}
                        onClick={() => handleSelectRequirementContract(client)}
                        className="p-3 bg-white border border-green-200 rounded-lg cursor-pointer hover:bg-green-100 transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium text-gray-900">{client.name}</div>
                            <div className="text-sm text-gray-600">Contrato: {client.contract_number}</div>
                            <div className="text-sm text-gray-600">Email: {client.email}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Contrato seleccionado */}
              {requirementFormData.contract_number && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-medium text-green-800 mb-2">Cliente Seleccionado</h4>
                  <p className="text-sm text-gray-600">Contrato: {requirementFormData.contract_number}</p>
                </div>
              )}

              {/* Tipo de requerimiento */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Requerimiento *
                </label>
                <select
                  value={requirementFormData.requirement_type}
                  onChange={(e) => handleRequirementFormChange('requirement_type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy"
                >
                  <option value="">Seleccionar tipo</option>
                  <option value="Cotización de Vuelos">Cotización de Vuelos</option>
                  <option value="Cotización de Paquetes">Cotización de Paquetes</option>
                </select>
              </div>

              {/* Campos específicos para Cotización de Vuelos */}
              {requirementFormData.requirement_type === 'Cotización de Vuelos' && (
                <>
                  {/* Rutas */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rutas *
                    </label>
                    <textarea
                      value={requirementFormData.routes}
                      onChange={(e) => handleRequirementFormChange('routes', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy"
                      rows="3"
                      placeholder="Ej: Quito - Madrid, Madrid - Barcelona, Barcelona - Quito"
                    />
                  </div>

                  {/* Tipo de vuelo */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo de Vuelo *
                    </label>
                    <select
                      value={requirementFormData.flight_type}
                      onChange={(e) => handleRequirementFormChange('flight_type', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy"
                    >
                      <option value="">Seleccionar tipo de vuelo</option>
                      <option value="IDA/VUELTA">IDA/VUELTA</option>
                      <option value="ONE WAY">ONE WAY</option>
                      <option value="MULTI STOP">MULTI STOP</option>
                    </select>
                  </div>

                  {/* Empresa asume el fee */}
                  <div>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={requirementFormData.company_assumes_fee}
                        onChange={(e) => handleRequirementFormChange('company_assumes_fee', e.target.checked)}
                        className="rounded border-gray-300 text-navy focus:ring-navy"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        La empresa asume el FEE de Emisión
                      </span>
                    </label>
                  </div>
                </>
              )}

              {/* Campos específicos para Cotización de Paquetes */}
              {requirementFormData.requirement_type === 'Cotización de Paquetes' && (
                <>
                  {/* Destino */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Destino del Paquete *
                    </label>
                    <input
                      type="text"
                      value={requirementFormData.destination}
                      onChange={(e) => handleRequirementFormChange('destination', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy"
                      placeholder="Ej: Panamá, Cartagena, Lima, etc."
                    />
                  </div>

                  {/* Valor pagado por el cliente */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Valor Pagado por el Cliente *
                    </label>
                    <input
                      type="number"
                      value={requirementFormData.client_paid_amount}
                      onChange={(e) => handleRequirementFormChange('client_paid_amount', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy"
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                    />
                  </div>

                  {/* Fechas de viaje */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Fecha de ida */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fecha de Ida *
                      </label>
                      <input
                        type="date"
                        value={requirementFormData.departure_date}
                        onChange={(e) => handleRequirementFormChange('departure_date', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy"
                      />
                    </div>

                    {/* Fecha de regreso */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fecha de Regreso *
                      </label>
                      <input
                        type="date"
                        value={requirementFormData.return_date}
                        onChange={(e) => handleRequirementFormChange('return_date', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy"
                      />
                    </div>
                  </div>

                  {/* Cantidad de personas */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cantidad de Personas *
                    </label>
                    <input
                      type="number"
                      value={requirementFormData.number_of_people}
                      onChange={(e) => handleRequirementFormChange('number_of_people', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy"
                      placeholder="1"
                      min="1"
                    />
                  </div>

                  {/* Comisión */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Comisión para la Empresa
                    </label>
                    <input
                      type="number"
                      value={requirementFormData.commission_amount}
                      onChange={(e) => handleRequirementFormChange('commission_amount', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy"
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                    />
                  </div>
                </>
              )}

              {/* Descripción - Solo para otros tipos de requerimientos */}
              {requirementFormData.requirement_type !== 'Cotización de Vuelos' && 
               requirementFormData.requirement_type !== 'Cotización de Paquetes' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción del Requerimiento *
                  </label>
                  <textarea
                    value={requirementFormData.description}
                    onChange={(e) => handleRequirementFormChange('description', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy"
                    rows="4"
                    placeholder="Describe el requerimiento del cliente..."
                  />
                </div>
              )}

              {/* Asignado a */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Asignado a
                </label>
                <input
                  type="text"
                  value={requirementFormData.assigned_to}
                  onChange={(e) => handleRequirementFormChange('assigned_to', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy"
                  placeholder="Ej: Paola, Cristhian"
                />
              </div>

              {/* Notas */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notas Adicionales
                </label>
                <textarea
                  value={requirementFormData.notes}
                  onChange={(e) => handleRequirementFormChange('notes', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy"
                  rows="3"
                  placeholder="Notas adicionales sobre el requerimiento..."
                />
              </div>

              {/* Botones */}
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowRequirementForm(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleCreateRequirement}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                >
                  Crear Requerimiento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Nueva Cancelación */}
      {showCancellationForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {cancellationType === 'reservas' ? 'Cancelar Reserva con Penalización' : 'Cancelar Contrato'}
            </h3>
            
            {(cancellationError || contractCancellationError) && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {cancellationError || contractCancellationError}
              </div>
            )}

            {/* Información según el tipo de cancelación */}
            {cancellationType === 'reservas' && selectedBookingForCancellation && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h4 className="font-medium text-blue-800 mb-3">📋 Información de la Reserva</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div><strong>N° Reserva:</strong> {selectedBookingForCancellation.booking_number || `#${selectedBookingForCancellation.id}`}</div>
                  <div><strong>Contrato:</strong> {selectedBookingForCancellation.contract_number}</div>
                  <div><strong>Ciudad:</strong> {selectedBookingForCancellation.city_display || selectedBookingForCancellation.city}</div>
                  <div><strong>Noches:</strong> {selectedBookingForCancellation.nights_requested}</div>
                  <div><strong>Personas:</strong> {selectedBookingForCancellation.people_count}</div>
                  <div><strong>Valor Total:</strong> ${selectedBookingForCancellation.total_value?.toFixed(2) || '0.00'}</div>
                </div>
              </div>
            )}

            {cancellationType === 'contratos' && selectedContractForCancellation && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h4 className="font-medium text-blue-800 mb-3">📋 Información del Contrato</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div><strong>Cliente:</strong> {selectedContractForCancellation.full_name || selectedContractForCancellation.name}</div>
                  <div><strong>Contrato:</strong> {selectedContractForCancellation.contract_number}</div>
                  <div><strong>Email:</strong> {selectedContractForCancellation.email}</div>
                  <div><strong>Valor Total:</strong> ${selectedContractForCancellation.total_value?.toFixed(2) || '0.00'}</div>
                </div>
                
                {/* Cálculo de cancelación para contratos */}
                {selectedContractForCancellation.total_value && (
                  <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <h5 className="font-medium text-yellow-800 mb-2">💰 Cálculo de Cancelación</h5>
                    {(() => {
                      const calculation = calculateContractCancellation(parseFloat(selectedContractForCancellation.total_value))
                      return (
                        <div className="text-sm space-y-1">
                          <div><strong>Valor original:</strong> ${calculation.originalValue.toFixed(2)}</div>
                          <div><strong>Deducción IVA (19%):</strong> -${calculation.iva.toFixed(2)}</div>
                          <div><strong>Deducción fija:</strong> -${calculation.fixedDeduction.toFixed(2)}</div>
                          <div className="font-bold text-red-600 border-t pt-1">
                            <strong>Valor final a devolver:</strong> ${calculation.finalValue.toFixed(2)}
                          </div>
                        </div>
                      )
                    })()}
                  </div>
                )}
              </div>
            )}

            <form className="space-y-6">
              {/* Razón de cancelación */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Razón de Cancelación *
                </label>
                <textarea
                  value={cancellationType === 'reservas' ? cancellationFormData.reason : contractCancellationFormData.reason}
                  onChange={(e) => cancellationType === 'reservas' 
                    ? handleCancellationFormChange('reason', e.target.value)
                    : handleContractCancellationFormChange('reason', e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  rows="3"
                  placeholder="Describe la razón por la cual se solicita la cancelación..."
                />
              </div>

              {/* Campos específicos para reservas */}
              {cancellationType === 'reservas' && (
                <>
                  {/* Tipo de penalización */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo de Penalización *
                    </label>
                    <select
                      value={cancellationFormData.penalty_type}
                      onChange={(e) => handleCancellationFormChange('penalty_type', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      <option value="">Seleccionar tipo de penalización</option>
                      <option value="porcentaje">Porcentaje del valor total</option>
                      <option value="monto_fijo">Monto fijo</option>
                      <option value="sin_penalizacion">Sin penalización (cancelación gratuita)</option>
                    </select>
                  </div>

                  {/* Campo de penalización según el tipo seleccionado */}
                  {cancellationFormData.penalty_type === 'porcentaje' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Porcentaje de Penalización *
                      </label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          value={cancellationFormData.penalty_percentage}
                          onChange={(e) => handleCancellationFormChange('penalty_percentage', e.target.value)}
                          className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                          placeholder="0"
                        />
                        <span className="text-gray-500">%</span>
                        <div className="text-sm text-gray-600">
                          Penalización: ${((selectedBookingForCancellation?.total_value || 0) * (parseFloat(cancellationFormData.penalty_percentage) || 0) / 100).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  )}

                  {cancellationFormData.penalty_type === 'monto_fijo' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Monto de Penalización *
                      </label>
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-500">$</span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={cancellationFormData.penalty_amount}
                          onChange={(e) => handleCancellationFormChange('penalty_amount', e.target.value)}
                          className="w-40 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                  )}

                  {/* Resumen de la cancelación para reservas */}
                  {(cancellationFormData.penalty_type === 'porcentaje' || cancellationFormData.penalty_type === 'monto_fijo') && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h4 className="font-medium text-yellow-800 mb-2">💰 Resumen de Penalización</h4>
                      <div className="text-sm space-y-1">
                        <div><strong>Valor total de la reserva:</strong> ${selectedBookingForCancellation?.total_value?.toFixed(2) || '0.00'}</div>
                        <div><strong>Penalización aplicada:</strong> 
                          {cancellationFormData.penalty_type === 'porcentaje' 
                            ? ` ${cancellationFormData.penalty_percentage}% = $${((selectedBookingForCancellation?.total_value || 0) * (parseFloat(cancellationFormData.penalty_percentage) || 0) / 100).toFixed(2)}`
                            : ` $${cancellationFormData.penalty_amount || '0.00'}`
                          }
                        </div>
                        <div className="font-bold text-red-600">
                          <strong>Valor a retener (sin devolución):</strong> 
                          {cancellationFormData.penalty_type === 'porcentaje' 
                            ? ` $${((selectedBookingForCancellation?.total_value || 0) * (parseFloat(cancellationFormData.penalty_percentage) || 0) / 100).toFixed(2)}`
                            : ` $${cancellationFormData.penalty_amount || '0.00'}`
                          }
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Notas adicionales */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notas Adicionales
                </label>
                <textarea
                  value={cancellationType === 'reservas' ? cancellationFormData.notes : contractCancellationFormData.notes}
                  onChange={(e) => cancellationType === 'reservas' 
                    ? handleCancellationFormChange('notes', e.target.value)
                    : handleContractCancellationFormChange('notes', e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  rows="3"
                  placeholder="Notas adicionales sobre la cancelación..."
                />
              </div>

              {/* Botones */}
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCancellationForm(false)
                    setSelectedBookingForCancellation(null)
                    setSelectedContractForCancellation(null)
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={cancellationType === 'reservas' ? handleCreateCancellation : handleCreateContractCancellation}
                  disabled={cancellationLoading || contractCancellationLoading}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  {(cancellationLoading || contractCancellationLoading) ? 'Procesando...' : 'Confirmar Cancelación'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Detalles del Requerimiento */}
      {showRequirementDetails && selectedRequirement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Detalles del Requerimiento
            </h3>

            <div className="space-y-4">
              {/* Información del cliente */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Información del Cliente</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <div><span className="font-medium">Nombre:</span> {selectedRequirement.client_name}</div>
                  <div><span className="font-medium">Contrato:</span> {selectedRequirement.contract_number}</div>
                  <div><span className="font-medium">Email:</span> {selectedRequirement.email}</div>
                  <div><span className="font-medium">Teléfono:</span> {selectedRequirement.phone}</div>
                </div>
              </div>

              {/* Detalles del requerimiento */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Detalles del Requerimiento</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <div><span className="font-medium">Tipo:</span> {selectedRequirement.requirement_type}</div>
                  <div><span className="font-medium">Estado:</span> 
                    <span className={`ml-1 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      selectedRequirement.status === 'completed' ? 'bg-green-100 text-green-800' :
                      selectedRequirement.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                      selectedRequirement.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      selectedRequirement.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedRequirement.status === 'completed' ? 'Completado' :
                       selectedRequirement.status === 'in_progress' ? 'En Progreso' :
                       selectedRequirement.status === 'pending' ? 'Pendiente' :
                       selectedRequirement.status === 'cancelled' ? 'Cancelado' :
                       selectedRequirement.status}
                    </span>
                  </div>
                  <div><span className="font-medium">Asignado a:</span> {selectedRequirement.assigned_to || 'Sin asignar'}</div>
                  <div><span className="font-medium">Creado por:</span> {selectedRequirement.created_by}</div>
                  <div><span className="font-medium">Fecha de creación:</span> {new Date(selectedRequirement.created_at).toLocaleString()}</div>
                  {selectedRequirement.completed_at && (
                    <div><span className="font-medium">Fecha de finalización:</span> {new Date(selectedRequirement.completed_at).toLocaleString()}</div>
                  )}
                </div>
              </div>

              {/* Descripción */}
              <div className="bg-green-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Descripción</h4>
                <p className="text-sm text-gray-700">{selectedRequirement.description}</p>
              </div>

              {/* Notas */}
              {selectedRequirement.notes && (
                <div className="bg-purple-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Notas</h4>
                  <p className="text-sm text-gray-700">{selectedRequirement.notes}</p>
                </div>
              )}
            </div>

            {/* Botones */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setShowRequirementDetails(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Editar Requerimiento */}
      {showRequirementEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Editar Requerimiento
            </h3>

            {requirementError && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {requirementError}
              </div>
            )}

            <form className="space-y-4">
              {/* Información del cliente (solo lectura) */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Información del Cliente</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <div><span className="font-medium">Nombre:</span> {requirementEditData.client_name}</div>
                  <div><span className="font-medium">Contrato:</span> {requirementEditData.contract_number}</div>
                  <div><span className="font-medium">Tipo:</span> {requirementEditData.requirement_type}</div>
                  <div><span className="font-medium">Asignado a:</span> {requirementEditData.assigned_to || 'Sin asignar'}</div>
                </div>
              </div>

              {/* Estado del requerimiento */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estado del Requerimiento *
                </label>
                <select
                  value={requirementEditData.status || ''}
                  onChange={(e) => setRequirementEditData(prev => ({...prev, status: e.target.value}))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy"
                >
                  <option value="pending">Pendiente</option>
                  <option value="in_progress">En Progreso</option>
                  <option value="completed">Completado</option>
                  <option value="cancelled">Cancelado</option>
                </select>
              </div>

              {/* Descripción (solo lectura) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción del Requerimiento
                </label>
                <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700">
                  {requirementEditData.description}
                </div>
              </div>

              {/* Notas */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notas Adicionales
                </label>
                <textarea
                  value={requirementEditData.notes || ''}
                  onChange={(e) => setRequirementEditData(prev => ({...prev, notes: e.target.value}))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy"
                  rows="4"
                  placeholder="Agregar notas sobre el progreso del requerimiento..."
                />
              </div>

              {/* Botones */}
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowRequirementEdit(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleUpdateRequirement}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                >
                  Actualizar Requerimiento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Historial de Requerimientos del Cliente */}
      {showClientRequirements && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Historial de Requerimientos del Cliente
            </h3>

            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-navy"></div>
              </div>
            ) : clientRequirements.length === 0 ? (
              <div className="text-center py-8">
                <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Este cliente no tiene requerimientos registrados</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Resumen */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Resumen</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">{clientRequirements.length}</div>
                      <div className="text-gray-600">Total</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-600">
                        {clientRequirements.filter(r => r.status === 'pending').length}
                      </div>
                      <div className="text-gray-600">Pendientes</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {clientRequirements.filter(r => r.status === 'in_progress').length}
                      </div>
                      <div className="text-gray-600">En Progreso</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {clientRequirements.filter(r => r.status === 'completed').length}
                      </div>
                      <div className="text-gray-600">Completados</div>
                    </div>
                  </div>
                </div>

                {/* Lista de requerimientos */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Tipo
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Estado
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Asignado a
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Fecha
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Acciones
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {clientRequirements.map((requirement) => (
                          <tr key={requirement.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {requirement.requirement_type}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                requirement.status === 'completed' ? 'bg-green-100 text-green-800' :
                                requirement.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                                requirement.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                requirement.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {requirement.status === 'completed' ? 'Completado' :
                                 requirement.status === 'in_progress' ? 'En Progreso' :
                                 requirement.status === 'pending' ? 'Pendiente' :
                                 requirement.status === 'cancelled' ? 'Cancelado' :
                                 requirement.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {requirement.assigned_to || 'Sin asignar'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(requirement.created_at).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleViewRequirement(requirement)}
                                  className="text-blue-600 hover:text-blue-900"
                                  title="Ver detalles"
                                >
                                  <Eye className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleEditRequirement(requirement)}
                                  className="text-indigo-600 hover:text-indigo-900"
                                  title="Editar requerimiento"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Botones */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setShowClientRequirements(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Agregar Pago */}
      {showPaymentForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Registrar Pago - {selectedClientForPayment?.first_name} {selectedClientForPayment?.last_name}
            </h3>

            {paymentError && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {paymentError}
              </div>
            )}

            <form className="space-y-4">
              {/* Información del cliente */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Información del Cliente</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <div><span className="font-medium">Nombre:</span> {selectedClientForPayment?.first_name} {selectedClientForPayment?.last_name}</div>
                  <div><span className="font-medium">Contrato:</span> {selectedClientForPayment?.contract_number}</div>
                  <div><span className="font-medium">Email:</span> {selectedClientForPayment?.email}</div>
                  <div><span className="font-medium">Monto Total:</span> ${selectedClientForPayment?.total_amount || 'No especificado'}</div>
                </div>
              </div>

              {/* Monto del pago */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monto del Pago *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={paymentFormData.payment_amount}
                  onChange={(e) => handlePaymentFormChange('payment_amount', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy"
                  placeholder="0.00"
                  required
                />
              </div>

              {/* Fecha del pago */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha del Pago *
                </label>
                <input
                  type="date"
                  value={paymentFormData.payment_date}
                  onChange={(e) => handlePaymentFormChange('payment_date', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy"
                  required
                />
              </div>

              {/* Método de pago */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Método de Pago *
                </label>
                <select
                  value={paymentFormData.payment_method}
                  onChange={(e) => handlePaymentFormChange('payment_method', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy"
                  required
                >
                  <option value="">Seleccionar método</option>
                  <option value="efectivo">Efectivo</option>
                  <option value="transferencia">Transferencia</option>
                  <option value="tarjeta">Tarjeta</option>
                  <option value="cheque">Cheque</option>
                  <option value="otro">Otro</option>
                </select>
              </div>

              {/* Forma de pago - Solo mostrar cuando es tarjeta */}
              {paymentFormData.payment_method === 'tarjeta' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Forma de Pago *
                    </label>
                    <select
                      value={paymentFormData.payment_type}
                      onChange={(e) => handlePaymentFormChange('payment_type', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy"
                      required
                    >
                      <option value="">Seleccionar...</option>
                      <option value="corriente">Corriente</option>
                      <option value="diferido">Diferido</option>
                    </select>
                  </div>
                  
                  {/* Campo de tiempo - Solo mostrar cuando es diferido */}
                  {paymentFormData.payment_type === 'diferido' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tiempo *
                      </label>
                      <select
                        value={paymentFormData.payment_time}
                        onChange={(e) => handlePaymentFormChange('payment_time', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy"
                        required
                      >
                        <option value="">Seleccionar...</option>
                        <option value="3">3 meses</option>
                        <option value="6">6 meses</option>
                        <option value="9">9 meses</option>
                        <option value="12">12 meses</option>
                        <option value="24">24 meses</option>
                        <option value="36">36 meses</option>
                      </select>
                    </div>
                  )}
                </div>
              )}

              {/* Número de cuota (si aplica) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número de Cuota (opcional)
                </label>
                <input
                  type="number"
                  value={paymentFormData.installment_number}
                  onChange={(e) => handlePaymentFormChange('installment_number', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy"
                  placeholder="Ej: 1, 2, 3..."
                />
              </div>

              {/* Notas */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notas Adicionales
                </label>
                <textarea
                  value={paymentFormData.notes}
                  onChange={(e) => handlePaymentFormChange('notes', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy"
                  rows="3"
                  placeholder="Notas sobre el pago..."
                />
              </div>

              {/* Botones */}
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowPaymentForm(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleCreatePayment}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                >
                  Registrar Pago
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Agregar Convenio */}
      {showAgreementForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Crear Convenio de Pago - {selectedClientForAgreement?.first_name} {selectedClientForAgreement?.last_name}
            </h3>

            {agreementError && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {agreementError}
              </div>
            )}

            <form className="space-y-4">
              {/* Información del cliente */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Información del Cliente</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <div><span className="font-medium">Nombre:</span> {selectedClientForAgreement?.first_name} {selectedClientForAgreement?.last_name}</div>
                  <div><span className="font-medium">Contrato:</span> {selectedClientForAgreement?.contract_number}</div>
                  <div><span className="font-medium">Email:</span> {selectedClientForAgreement?.email}</div>
                  <div><span className="font-medium">Monto Total:</span> ${selectedClientForAgreement?.total_amount || 'No especificado'}</div>
                </div>
              </div>

              {/* Monto total */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monto Total del Convenio *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={agreementFormData.total_amount}
                  onChange={(e) => handleAgreementFormChange('total_amount', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy"
                  placeholder="0.00"
                  required
                />
              </div>

              {/* Número de cuotas */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número de Cuotas *
                </label>
                <input
                  type="number"
                  value={agreementFormData.installment_count}
                  onChange={(e) => handleAgreementFormChange('installment_count', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy"
                  placeholder="Ej: 3, 6, 12..."
                  required
                />
              </div>

              {/* Monto por cuota (calculado automáticamente) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monto por Cuota (calculado automáticamente)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={agreementFormData.installment_amount}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                  placeholder="Se calcula automáticamente"
                />
              </div>

              {/* Fecha de inicio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de Inicio *
                </label>
                <input
                  type="date"
                  value={agreementFormData.start_date}
                  onChange={(e) => handleAgreementFormChange('start_date', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy"
                  required
                />
              </div>

              {/* Fecha de fin */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de Fin (calculada automáticamente)
                </label>
                <input
                  type="date"
                  value={agreementFormData.end_date}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                  placeholder="Se calcula automáticamente"
                />
              </div>

              {/* Notas */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notas del Convenio
                </label>
                <textarea
                  value={agreementFormData.notes}
                  onChange={(e) => handleAgreementFormChange('notes', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy"
                  rows="3"
                  placeholder="Términos y condiciones del convenio..."
                />
              </div>

              {/* Botones */}
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAgreementForm(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleCreateAgreement}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
                >
                  Crear Convenio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Recibo */}
      {showReceiptModal && selectedReceipt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Recibo de Pago #{selectedReceipt.receipt_number}
            </h3>

            <div className="space-y-4">
              {/* Información del recibo */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Información del Recibo</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <div><span className="font-medium">Número de Recibo:</span> {selectedReceipt.receipt_number}</div>
                  <div><span className="font-medium">Fecha:</span> {new Date(selectedReceipt.payment_date).toLocaleDateString()}</div>
                  <div><span className="font-medium">Monto:</span> ${selectedReceipt.payment_amount}</div>
                  <div><span className="font-medium">Método:</span> {selectedReceipt.payment_method}</div>
                </div>
              </div>

              {/* Información del cliente */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Información del Cliente</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <div><span className="font-medium">Nombre:</span> {selectedReceipt.first_name} {selectedReceipt.last_name}</div>
                  <div><span className="font-medium">Contrato:</span> {selectedReceipt.contract_number}</div>
                  <div><span className="font-medium">Email:</span> {selectedReceipt.email}</div>
                  <div><span className="font-medium">Teléfono:</span> {selectedReceipt.phone || 'No especificado'}</div>
                </div>
              </div>

              {/* Detalles del pago */}
              {selectedReceipt.installment_number && (
                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Detalles del Convenio</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div><span className="font-medium">Cuota:</span> {selectedReceipt.installment_number}</div>
                    <div><span className="font-medium">Total del Convenio:</span> ${selectedReceipt.agreement_total}</div>
                    <div><span className="font-medium">Cuotas Totales:</span> {selectedReceipt.installment_count}</div>
                    <div><span className="font-medium">Estado:</span> {selectedReceipt.agreement_status}</div>
                  </div>
                </div>
              )}

              {/* Notas */}
              {selectedReceipt.notes && (
                <div className="bg-purple-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Notas</h4>
                  <p className="text-sm text-gray-700">{selectedReceipt.notes}</p>
                </div>
              )}
            </div>

            {/* Botones */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setShowReceiptModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cerrar
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Imprimir Recibo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de historial completo de cliente */}
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

            {loadingClientHistory ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Cargando historial...</span>
              </div>
            ) : clientHistoryData ? (
              <div className="space-y-4">
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
                              <FileText className="h-4 w-4 text-green-600" />
                            </div>
                          )}
                          {item.type === 'agreement' && (
                            <div className="bg-orange-100 rounded-full p-2">
                              <FileText className="h-4 w-4 text-orange-600" />
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-gray-900">
                              {item.type === 'management' && 'Gestión'}
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
                          <p><span className="font-medium">Método:</span> {item.payment_method || 'N/A'}</p>
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
    </div>
  )
}

export default AdminPanel