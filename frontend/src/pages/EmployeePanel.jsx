import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { 
  Users, 
  Calendar, 
  ClipboardList, 
  LogOut, 
  Menu, 
  X,
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  Filter,
  TrendingUp,
  CheckCircle,
  Clock,
  Download,
  Copy,
  BookOpen,
  FileCheck,
  Plane
} from 'lucide-react'
import { clientService, bookingService, requirementService, documentService, reservationAgendaService, visaAgendaService, flightAgendaService } from '../services/api'
import reportService from '../services/reportService'
import SessionWarning from '../components/SessionWarning'

const EmployeePanel = () => {
  const { user, logout } = useAuth()
  const [activeModule, setActiveModule] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  
  // Estados para cada módulo
  const [clients, setClients] = useState([])
  const [bookings, setBookings] = useState([])
  const [requirements, setRequirements] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  
  // Estados para agenda de reservas
  const [reservationAgendas, setReservationAgendas] = useState([])
  const [reservationAgendaLoading, setReservationAgendaLoading] = useState(false)
  const [reservationAgendaSearch, setReservationAgendaSearch] = useState('')
  const [reservationAgendaStatusFilter, setReservationAgendaStatusFilter] = useState('')
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

  // Estados para agenda de visados
  const [visaAgendas, setVisaAgendas] = useState([])
  const [visaAgendaLoading, setVisaAgendaLoading] = useState(false)
  const [visaAgendaSearch, setVisaAgendaSearch] = useState('')
  const [visaAgendaStatusFilter, setVisaAgendaStatusFilter] = useState('')
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

  // Estados para agenda de vuelos
  const [flightAgendas, setFlightAgendas] = useState([])
  const [flightAgendaLoading, setFlightAgendaLoading] = useState(false)
  const [flightAgendaSearch, setFlightAgendaSearch] = useState('')
  const [flightAgendaStatusFilter, setFlightAgendaStatusFilter] = useState('')
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
  
  // Estados para dashboard de empleados
  const [dashboardData, setDashboardData] = useState({
    totalClients: 0,
    totalBookings: 0,
    totalRequirements: 0,
    completedRequirements: 0,
    pendingRequirements: 0,
    activeBookings: 0
  })
  const [dashboardLoading, setDashboardLoading] = useState(false)
  const [dashboardPeriod, setDashboardPeriod] = useState('this_month')
  const [periodSummary, setPeriodSummary] = useState({
    sales: { total_ventas: 0, total_monto: 0, ventas_pagadas: 0, monto_pagado: 0 },
    bookings: { total_reservas: 0, total_monto: 0, confirmadas: 0, canceladas: 0 },
    requirements: { total_requerimientos: 0, completados: 0, pendientes: 0 }
  })

  // Estados para modales
  const [showNewClientModal, setShowNewClientModal] = useState(false)
  const [showNewBookingModal, setShowNewBookingModal] = useState(false)
  const [showNewRequirementModal, setShowNewRequirementModal] = useState(false)
  const [showClientDetailsModal, setShowClientDetailsModal] = useState(false)
  const [showBookingDetailsModal, setShowBookingDetailsModal] = useState(false)
  const [showRequirementDetailsModal, setShowRequirementDetailsModal] = useState(false)
  const [showPdfViewer, setShowPdfViewer] = useState(false)
  const [pdfUrl, setPdfUrl] = useState(null)
  const [pdfLoading, setPdfLoading] = useState(false)
  const [selectedClient, setSelectedClient] = useState(null)
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [selectedRequirement, setSelectedRequirement] = useState(null)
  
  // Estados para eliminar reserva
  const [showDeleteBookingModal, setShowDeleteBookingModal] = useState(false)
  const [deleteBookingPassword, setDeleteBookingPassword] = useState('')
  const [deleteBookingPasswordError, setDeleteBookingPasswordError] = useState('')
  
  // Estados para modal de WhatsApp
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false)
  const [whatsAppMessage, setWhatsAppMessage] = useState('')

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

  // Estados para nuevo cliente
  const [newClientData, setNewClientData] = useState({
    fecha: new Date().toISOString().split('T')[0],
    contrato: '',
    contrato_suffix: '',
    contrato_number: '0001',
    nombres: '',
    apellidos: '',
    cedula: '',
    telefono: '',
    noches: 0,
    anos: 0,
    anos_indefinido: false,
    bono_internacional: '',
    pago_mixto: 'No',
    cantidad_tarjetas: 1,
    tarjetas: [{ tipo: '', monto: 0, datafast: '' }],
    datafast: 'KMP',
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
    pagare: 'No',
    fecha_pagare: '',
    monto_pagare: 0,
    cantidad_cuotas: 1,
    cuotas_asumidas: 0,
    valor_cuota: 0,
    total_pagare: 0,
    categoria_cliente: ''
  })
  const [newClientLoading, setNewClientLoading] = useState(false)
  
  // Estados para validación del formulario de cliente
  const [clientFormErrors, setClientFormErrors] = useState({})
  const [isClientFormValid, setIsClientFormValid] = useState(false)

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

  // Estados para nueva reserva
  const [showNewBookingForm, setShowNewBookingForm] = useState(false)
  const [contractSearchTerm, setContractSearchTerm] = useState('')
  const [contractSearchResults, setContractSearchResults] = useState([])
  const [showContractSearch, setShowContractSearch] = useState(false)
  const [validatedClient, setValidatedClient] = useState(null)
  const [bookingFormData, setBookingFormData] = useState({
    contract_number: '',
    city: '',
    custom_city: '',
    nights_requested: '',
    people_count: 1,
    additional_adults: 0,
    additional_children: 0,
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
  const [bookingError, setBookingError] = useState('')
  const [bookingLoading, setBookingLoading] = useState(false)

  // Estados para nuevo requerimiento
  const [showNewRequirementForm, setShowNewRequirementForm] = useState(false)
  const [requirementSearchTerm, setRequirementSearchTerm] = useState('')
  const [requirementSearchResults, setRequirementSearchResults] = useState([])
  const [showRequirementSearch, setShowRequirementSearch] = useState(false)
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
  const [requirementError, setRequirementError] = useState('')
  const [requirementLoading, setRequirementLoading] = useState(false)

  // Cargar datos según el módulo activo
  useEffect(() => {
    if (activeModule === 'agenda-reservas') {
      loadReservationAgendas()
    } else if (activeModule === 'agenda-visados') {
      loadVisaAgendas()
    } else if (activeModule === 'agenda-vuelos') {
      loadFlightAgendas()
    } else if (activeModule === 'dashboard') {
      loadDashboardData()
    } else if (activeModule === 'clients') {
      loadClients()
    } else if (activeModule === 'bookings') {
      loadBookings()
    } else if (activeModule === 'requirements') {
      loadRequirements()
    }
  }, [activeModule, currentPage, searchTerm, dashboardPeriod, reservationAgendaSearch, reservationAgendaStatusFilter, visaAgendaSearch, visaAgendaStatusFilter, flightAgendaSearch, flightAgendaStatusFilter])

  const loadClients = async () => {
    try {
      setLoading(true)
      const response = await clientService.getClients({ page: currentPage, limit: 20, search: searchTerm })
      setClients(response.clients)
      setTotalPages(response.pagination.totalPages)
    } catch (error) {
      console.error('Error loading clients:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadBookings = async () => {
    try {
      setLoading(true)
      const response = await bookingService.getBookings()
      setBookings(response.bookings || [])
    } catch (error) {
      console.error('Error loading bookings:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadRequirements = async () => {
    try {
      setLoading(true)
      const response = await requirementService.getRequirements({ page: currentPage, limit: 20, search: searchTerm })
      setRequirements(response.requirements)
      setTotalPages(response.pagination.totalPages)
    } catch (error) {
      console.error('Error loading requirements:', error)
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
    } catch (error) {
      console.error('Error cargando agenda de reservas:', error)
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
      await reservationAgendaService.createReservationAgenda(reservationAgendaFormData)
      await loadReservationAgendas()
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
      alert('Error al crear la agenda de reserva')
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
      await reservationAgendaService.updateReservationAgenda(
        editingReservationAgenda.id,
        reservationAgendaFormData
      )
      await loadReservationAgendas()
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
      alert('Error al actualizar la agenda de reserva')
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
    } catch (error) {
      console.error('Error cargando agenda de visados:', error)
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
      await visaAgendaService.createVisaAgenda(visaAgendaFormData)
      await loadVisaAgendas()
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
      alert('Error al crear la agenda de visado')
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
      await visaAgendaService.updateVisaAgenda(
        editingVisaAgenda.id,
        visaAgendaFormData
      )
      await loadVisaAgendas()
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
      alert('Error al actualizar la agenda de visado')
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
    } catch (error) {
      console.error('Error cargando agenda de vuelos:', error)
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
      await flightAgendaService.createFlightAgenda(flightAgendaFormData)
      await loadFlightAgendas()
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
      alert('Error al crear la agenda de vuelo')
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
      await flightAgendaService.updateFlightAgenda(
        editingFlightAgenda.id,
        flightAgendaFormData
      )
      await loadFlightAgendas()
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
      alert('Error al actualizar la agenda de vuelo')
    }
  }

  // Funciones para dashboard de empleados
  const loadDashboardData = async () => {
    try {
      setDashboardLoading(true)
      
      // Cargar estadísticas generales
      const clientsResponse = await clientService.getClientStats()
      const stats = clientsResponse.stats
      
      // Cargar datos del período seleccionado
      const periodData = await reportService.getEmployeeDashboard(dashboardPeriod)
      setPeriodSummary(periodData?.periodSummary || {
        sales: { total_ventas: 0, total_monto: 0, ventas_pagadas: 0, monto_pagado: 0 },
        bookings: { total_reservas: 0, total_monto: 0, confirmadas: 0, canceladas: 0 },
        requirements: { total_requerimientos: 0, completados: 0, pendientes: 0 }
      })
      
      // Cargar datos específicos de reservas y requerimientos
      const bookingsResponse = await bookingService.getBookings()
      const requirementsResponse = await requirementService.getRequirements({ page: 1, limit: 1000, search: '' })
      
      const totalBookings = bookingsResponse.bookings?.length || 0
      const activeBookings = bookingsResponse.bookings?.filter(b => b.status === 'confirmed').length || 0
      const totalRequirements = requirementsResponse.requirements?.length || 0
      const completedRequirements = requirementsResponse.requirements?.filter(r => r.status === 'completed').length || 0
      const pendingRequirements = requirementsResponse.requirements?.filter(r => r.status === 'pending').length || 0
      
      setDashboardData({
        totalClients: parseInt(stats.total_clients) || 0,
        totalBookings,
        totalRequirements,
        completedRequirements,
        pendingRequirements,
        activeBookings
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

  // Función para calcular el valor total de la reserva
  const calculateTotalReservationValue = (formData) => {
    const baseValue = formData.reservation_value === 'custom' 
      ? parseFloat(formData.custom_value) || 0 
      : parseFloat(formData.reservation_value) || 0;
    
    const peopleCount = parseInt(formData.people_count) || 1;
    const nightsCount = parseInt(formData.nights_requested) || 1;
    const additionalAdults = parseInt(formData.additional_adults) || 0;
    const additionalChildren = parseInt(formData.additional_children) || 0;
    
    // Calcular costo de personas adicionales (solo si hay más de 6 personas)
    let additionalAdultsCost = 0;
    let additionalChildrenCost = 0;
    if (peopleCount > 6) {
      // Adultos adicionales: $30 por noche por persona
      additionalAdultsCost = additionalAdults * 30 * nightsCount;
      // Niños adicionales: $25 por noche por persona
      additionalChildrenCost = additionalChildren * 25 * nightsCount;
    }
    
    // Calcular costo por noches adicionales si excede las noches disponibles
    let extraNightsCost = 0;
    let extraNights = 0;
    if (validatedClient && nightsCount > validatedClient.remaining_nights) {
      extraNights = nightsCount - validatedClient.remaining_nights;
      extraNightsCost = extraNights * 99;
    }
    
    const totalValue = (baseValue * nightsCount) + additionalAdultsCost + additionalChildrenCost + extraNightsCost;
    
    return {
      baseValue,
      nightsCount,
      peopleCount,
      additionalAdults,
      additionalChildren,
      additionalAdultsCost,
      additionalChildrenCost,
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
        CONTRASENA_WIFI: 'Kempery2025',
        INFORMACION_PARA_EL_ACCESO: 'El departamento se encuentra frente a la estación de Policía, dentro de una casa de dos pisos.',
        PROCEDIMIENTOS_DE_ACCESO: 'Las llaves se encuentran en el candado ubicado en la entrada principal. Por favor, retírelas y guárdelas de forma segura durante su estadía.'
      },
      'Cuenca': {
        UBICACION: 'Cuenca',
        UBICACION_DE_MAPS: 'Cuenca, Azuay, Ecuador',
        RED_WIFI: 'KemperyCuenca',
        CONTRASENA_WIFI: 'Kempery2025',
        INFORMACION_PARA_EL_ACCESO: 'El departamento se encuentra frente a la estación de Policía, dentro de una casa de dos pisos.',
        PROCEDIMIENTOS_DE_ACCESO: 'Las llaves se encuentran en el candado ubicado en la entrada principal. Por favor, retírelas y guárdelas de forma segura durante su estadía.'
      },
      'Quito': {
        UBICACION: 'Quito',
        UBICACION_DE_MAPS: 'Quito, Pichincha, Ecuador',
        RED_WIFI: 'KemperyQuito',
        CONTRASENA_WIFI: 'Kempery2025',
        INFORMACION_PARA_EL_ACCESO: 'El departamento se encuentra frente a la estación de Policía, dentro de una casa de dos pisos.',
        PROCEDIMIENTOS_DE_ACCESO: 'Las llaves se encuentran en el candado ubicado en la entrada principal. Por favor, retírelas y guárdelas de forma segura durante su estadía.'
      },
      'Manta': {
        UBICACION: 'Manta',
        UBICACION_DE_MAPS: 'Manta, Manabí, Ecuador',
        RED_WIFI: 'KemperyManta',
        CONTRASENA_WIFI: 'Kempery2025',
        INFORMACION_PARA_EL_ACCESO: 'El departamento se encuentra frente a la estación de Policía, dentro de una casa de dos pisos.',
        PROCEDIMIENTOS_DE_ACCESO: 'Las llaves se encuentran en el candado ubicado en la entrada principal. Por favor, retírelas y guárdelas de forma segura durante su estadía.'
      },
      'Tonsupa': {
        UBICACION: 'Tonsupa',
        UBICACION_DE_MAPS: 'Tonsupa, Esmeraldas, Ecuador',
        RED_WIFI: 'KemperyTonsupa',
        CONTRASENA_WIFI: 'Kempery2025',
        INFORMACION_PARA_EL_ACCESO: 'El departamento se encuentra frente a la estación de Policía, dentro de una casa de dos pisos.',
        PROCEDIMIENTOS_DE_ACCESO: 'Las llaves se encuentran en el candado ubicado en la entrada principal. Por favor, retírelas y guárdelas de forma segura durante su estadía.'
      },
      'Salinas': {
        UBICACION: 'Salinas',
        UBICACION_DE_MAPS: 'Salinas, Santa Elena, Ecuador',
        RED_WIFI: 'KemperySalinas',
        CONTRASENA_WIFI: 'Kempery2025',
        INFORMACION_PARA_EL_ACCESO: 'El departamento se encuentra frente a la estación de Policía, dentro de una casa de dos pisos.',
        PROCEDIMIENTOS_DE_ACCESO: 'Las llaves se encuentran en el candado ubicado en la entrada principal. Por favor, retírelas y guárdelas de forma segura durante su estadía.'
      }
    };
    
    return cityData[city] || {
      UBICACION: city || 'Nuestra ubicación',
      UBICACION_DE_MAPS: city || 'Ecuador',
      RED_WIFI: 'KemperyWiFi',
      CONTRASENA_WIFI: 'Kempery2025',
      INFORMACION_PARA_EL_ACCESO: 'El departamento se encuentra frente a la estación de Policía, dentro de una casa de dos pisos.',
      PROCEDIMIENTOS_DE_ACCESO: 'Las llaves se encuentran en el candado ubicado en la entrada principal. Por favor, retírelas y guárdelas de forma segura durante su estadía.'
    };
  };

  // Función para generar el mensaje de WhatsApp
  const generateWhatsAppMessage = (formData, client) => {
    const city = formData.city === 'Otros' ? formData.custom_city : formData.city;
    const cityData = getCityData(city);
    
    const clienteName = client ? `${client.first_name || ''} ${client.last_name || ''}`.trim() : 'Estimado/a Cliente';
    const ubicacion = cityData.UBICACION;
    const ubicacionMaps = cityData.UBICACION_DE_MAPS;
    const numerosContacto = formData.emergency_contact || 'No especificado';
    const informacionAcceso = cityData.INFORMACION_PARA_EL_ACCESO;
    const procedimientosAcceso = cityData.PROCEDIMIENTOS_DE_ACCESO;
    const redWifi = formData.wifi_name || cityData.RED_WIFI;
    const contrasenaWifi = formData.wifi_password || cityData.CONTRASENA_WIFI;
    
    const message = `📖 Manual de Uso – Bienvenido a ${ubicacion} 🏡



Estimado/a ${clienteName},

Le damos la más cordial bienvenida a nuestro departamento. Deseamos que su estadía sea placentera, por lo que a continuación encontrará información relevante para su comodidad y seguridad.

⸻

🏡 Información General

📍 Dirección: ${ubicacionMaps}

📅 Check-in: A partir de las 15:00

⏳ Check-out: Antes de las 11:00

📞 Contacto de emergencia: ${numerosContacto}

⸻

🔑 Check-in y Acceso

${informacionAcceso}

🔹 Indicaciones para el acceso:

	${informacionAcceso}

🔹 Procedimiento de ingreso:

	${procedimientosAcceso}

🔹 Normativas del Check-in:

	•	El acceso está permitido únicamente para el número de personas debidamente registradas en la reserva de Kempery World Travel. Cualquier persona adicional incurrirá en un costo extra por noche.

	•	En la mesa del comedor, encontrará vinos disponibles. En caso de consumirlos, cada botella tiene un costo adicional de $10.

⸻

⚡️ Uso de Electrodomésticos y Servicios

Wi-Fi 📶

🔹 Red: ${redWifi}

🔹 Contraseña: ${contrasenaWifi}

Cocina 🍳

🔹 Los muebles de cocina cuentan con un sistema de apertura por pulsación. Se recomienda presionarlos suavemente para abrir y cerrarlos con cuidado para evitar daños.

🔹 El basurero de la cocina, se encuentra dentro  del ultimo cajón del mueble.

🔹 En el uso de las ollas, sartenes, etc. Por favor solo utilizar los cucharones plásticos para no rayar el teflon de las mismas.

🔹 Hacer uso responsable de los electrodomésticos.

🔹 Asegurarse de apagar la cocina después de cada uso.

⸻

🚿 Baño y Agua Caliente

🔹 Para activar el agua caliente en la ducha, gire la llave en dirección hacia la cortina de vidrio.

🔹 No arrojar papel higiénico, toallas húmedas ni objetos sólidos en el inodoro.

⸻

🗑 Basura y Reciclaje

🔹 En caso de tener mucha acumulación de basura, pueden sacar y poner en el tacho de basura que se encuentra debajo de las gradas.

⸻

📢 Normas de la Casa

✅ Prohibido fumar dentro de la propiedad.

✅ Evitar ruidos excesivos, especialmente en horarios nocturnos.

✅ No se permiten fiestas ni visitas no autorizadas.

✅ Apagar luces y electrodomésticos al salir del departamento.

✅ El estacionamiento es compartido. En caso de ingresar un vehículo, debe ingresarlo hasta al fondo, para que otros vehículos igual puedan tener acceso. 

✅ Si viaja con mascotas, es su responsabilidad garantizar la limpieza de sus desechos y la eliminación de pelo en muebles y alfombras.

✅ Manchas de sábanas, cobertores o toallas con maquillaje, tinta, sangre, vino u otras sustancias resultará en un cargo adicional por limpieza o reemplazo.

⸻

🔚 Check-out (Salida)

🕛 Hora de salida: Antes de las 11:00am

🔹 Las llaves deberán dejarse en el mismo candado de donde fueron retiradas.

🔹 Antes de salir, verifique que todas las luces y electrodomésticos estén apagados.

🔹 En caso de daños en el departamento, se aplicarán cargos adicionales según corresponda.

⸻

Agradecemos su preferencia y esperamos que tenga una excelente estadía.`;

    return message;
  };

  // Función para copiar al portapapeles
  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('Mensaje copiado al portapapeles');
    } catch (err) {
      // Fallback para navegadores que no soportan clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        alert('Mensaje copiado al portapapeles');
      } catch (err) {
        alert('Error al copiar el mensaje. Por favor, cópielo manualmente.');
      }
      document.body.removeChild(textArea);
    }
  };

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
    } else if (activeModule === 'requirements') {
      loadRequirements()
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES')
  }

  // Funciones para manejar botones
  const handleNewClient = async () => {
    setShowNewClientModal(true)
    
    // Generar siguiente número de contrato
    const nextContractNumber = await generateNextContractNumber()
    
    // Actualizar el número de contrato en el estado
    setNewClientData(prev => ({
      ...prev,
      contrato_number: nextContractNumber
    }))
  }

  const handleNewBooking = () => {
    setShowNewBookingForm(true)
  }

  const handleNewRequirement = () => {
    setShowNewRequirementForm(true)
  }

  const handleViewClientDetails = (client) => {
    setSelectedClient(client)
    setShowClientDetailsModal(true)
  }

  const handleViewBookingDetails = (booking) => {
    setSelectedBooking(booking)
    setShowBookingDetailsModal(true)
  }

  // Función para abrir modal de eliminación de reserva
  const handleDeleteBookingClick = (booking) => {
    setSelectedBooking(booking)
    setShowDeleteBookingModal(true)
    setDeleteBookingPassword('')
    setDeleteBookingPasswordError('')
  }

  // Función para confirmar eliminación de reserva
  const handleConfirmDeleteBooking = async () => {
    if (!deleteBookingPassword) {
      setDeleteBookingPasswordError('Por favor, ingresa la contraseña')
      return
    }
    
    if (deleteBookingPassword !== 'admin2025') {
      setDeleteBookingPasswordError('Contraseña incorrecta')
      return
    }
    
    try {
      setLoading(true)
      await bookingService.deleteBooking(selectedBooking.id, { password: deleteBookingPassword })
      alert('Reserva eliminada exitosamente')
      setShowDeleteBookingModal(false)
      setSelectedBooking(null)
      setDeleteBookingPassword('')
      setDeleteBookingPasswordError('')
      // Recargar reservas
      await loadBookings()
      // Recargar datos del dashboard
      await loadDashboardData()
    } catch (error) {
      console.error('Error deleting booking:', error)
      setDeleteBookingPasswordError(error.response?.data?.error || 'Error al eliminar la reserva')
    } finally {
      setLoading(false)
    }
  }

  const handleViewPdf = async (bookingId) => {
    try {
      setPdfLoading(true)
      setShowPdfViewer(true)
      
      // Obtener el token de autenticación (usar 'authToken' que es la clave correcta)
      const token = localStorage.getItem('authToken')
      
      if (!token) {
        alert('No se encontró el token de autenticación. Por favor, inicie sesión nuevamente.')
        setShowPdfViewer(false)
        setPdfLoading(false)
        return
      }
      
      // Usar la misma configuración de API que el resto de la aplicación
      // Asegurarse de que siempre sea una URL absoluta (no relativa)
      let API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
      
      // Si la URL no comienza con http:// o https://, agregar el protocolo y host
      if (!API_BASE_URL.startsWith('http://') && !API_BASE_URL.startsWith('https://')) {
        // Si es una ruta relativa, construir URL completa
        const protocol = window.location.protocol
        const host = window.location.hostname
        const port = window.location.port ? `:${window.location.port}` : ''
        API_BASE_URL = `${protocol}//${host}${port}${API_BASE_URL.startsWith('/') ? '' : '/'}${API_BASE_URL}`
      }
      
      // Crear URL completa para el PDF con el token de autenticación en el query string
      // El backend debe aceptar el token como query parameter como alternativa al header
      // Asegurarse de que no haya doble barra en la URL
      const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL
      const pdfUrl = `${baseUrl}/documents/download-pdf/${bookingId}?token=${encodeURIComponent(token)}`
      
      console.log('Generando PDF para reserva:', bookingId)
      console.log('API_BASE_URL:', API_BASE_URL)
      console.log('URL del PDF:', pdfUrl)
      console.log('¿Es URL absoluta?', pdfUrl.startsWith('http://') || pdfUrl.startsWith('https://'))
      
      setPdfUrl(pdfUrl)
      setPdfLoading(false)
    } catch (error) {
      console.error('Error obteniendo PDF:', error)
      alert('Error al cargar el PDF. Por favor, intente nuevamente.')
      setShowPdfViewer(false)
      setPdfLoading(false)
    }
  }

  const handleViewRequirementDetails = (requirement) => {
    setSelectedRequirement(requirement)
    setShowRequirementDetailsModal(true)
  }

  // Funciones para nuevo cliente
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
      }
    }
    
    // Si se cambia pago mixto a "No", resetear tarjetas
    if (field === 'pago_mixto' && value === 'No') {
      updatedData.cantidad_tarjetas = 1
      updatedData.tarjetas = [{ tipo: '', monto: 0 }]
    }
    
    // Si se cambia pago mixto a "Si", calcular total basado en tarjetas
    if (field === 'pago_mixto' && value === 'Si') {
      const totalTarjetas = updatedData.tarjetas.reduce((sum, tarjeta) => sum + (parseFloat(tarjeta.monto) || 0), 0)
      const iva = totalTarjetas * 0.15
      const neto = totalTarjetas - iva
      updatedData.total_venta = totalTarjetas
      updatedData.iva = iva
      updatedData.neto = neto
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
    }
    
    setNewClientData(updatedData)
  }

  const handleCreateClient = async () => {
    try {
      setNewClientLoading(true)
      
      // Calcular IVA y neto automáticamente
      const totalVenta = parseFloat(newClientData.total_venta) || 0
      const iva = totalVenta / 1.15 // IVA incluido en el total
      const neto = totalVenta - iva
      
      // Construir el número de contrato completo
      const contratoCompleto = `KMPRY ${newClientData.contrato_suffix} ${newClientData.contrato_number}`
      
      const clientData = {
        ...newClientData,
        contrato: contratoCompleto,
        contract_number: contratoCompleto,
        first_name: newClientData.nombres,
        last_name: newClientData.apellidos,
        email: newClientData.correo_electronico || `${contratoCompleto.toLowerCase().replace(/\s+/g, '')}@kempery.com`,
        phone: newClientData.telefono,
        document_number: newClientData.cedula,
        total_amount: totalVenta,
        iva: iva,
        neto: neto,
        total_nights: newClientData.noches,
        remaining_nights: newClientData.noches,
        international_bonus: newClientData.bono_internacional,
        notas: newClientData.observaciones,
        categoria_cliente: newClientData.categoria_cliente || null,
        pagare: newClientData.pagare === 'Si',
        fecha_pagare: newClientData.pagare === 'Si' ? newClientData.fecha_pagare || null : null,
        monto_pagare: newClientData.pagare === 'Si' ? parseFloat(newClientData.monto_pagare) || null : null,
        pagare_cuotas: newClientData.pagare === 'Si' ? parseInt(newClientData.cantidad_cuotas, 10) || 1 : null,
        pagare_cuotas_asumidas: newClientData.pagare === 'Si' ? parseInt(newClientData.cuotas_asumidas, 10) || 0 : null,
        pagare_valor_cuota: newClientData.pagare === 'Si' ? parseFloat(newClientData.valor_cuota) || null : null,
        pagare_total: newClientData.pagare === 'Si' ? parseFloat(newClientData.total_pagare) || null : null
      }

      await clientService.createClient(clientData)
      
      // Recargar lista de clientes
      loadClients()
      
      // Cerrar modal y limpiar datos
      setShowNewClientModal(false)
      setNewClientData({
        fecha: new Date().toISOString().split('T')[0],
        contrato: '',
        contrato_suffix: '',
        contrato_number: '0001',
        nombres: '',
        apellidos: '',
        cedula: '',
        telefono: '',
        noches: 0,
        anos: 0,
        anos_indefinido: false,
        bono_internacional: '',
        pago_mixto: 'No',
        cantidad_tarjetas: 1,
        tarjetas: [{ tipo: '', monto: 0, datafast: '' }],
        datafast: 'KMP',
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
        pagare: 'No',
        fecha_pagare: '',
        monto_pagare: 0,
        cantidad_cuotas: 1,
        cuotas_asumidas: 0,
        valor_cuota: 0,
        total_pagare: 0,
        categoria_cliente: ''
      })
      
      alert('Cliente creado exitosamente')
      
    } catch (error) {
      console.error('Error creando cliente:', error)
      alert('Error al crear el cliente')
    } finally {
      setNewClientLoading(false)
    }
  }

  // Función para calcular fecha de check-out automáticamente
  const calculateCheckOutDate = (checkInDate, nights) => {
    if (!checkInDate || !nights) return ''
    
    const nightsCount = parseInt(nights) || 0
    if (nightsCount <= 0) return ''
    
    // Parsear la fecha de check-in correctamente (formato YYYY-MM-DD)
    // Usar UTC para evitar problemas de zona horaria
    const [year, month, day] = checkInDate.split('-').map(Number)
    if (!year || !month || !day) return ''
    
    // Crear fecha en UTC para evitar problemas de zona horaria
    const checkIn = new Date(Date.UTC(year, month - 1, day))
    if (isNaN(checkIn.getTime())) return ''
    
    // Agregar el número de noches a la fecha de check-in
    // Si check-in es hoy (10/12) y son 1 noche, check-out es mañana (11/12)
    // Si check-in es hoy (10/12) y son 2 noches, check-out es pasado mañana (12/12)
    const checkOut = new Date(checkIn)
    checkOut.setUTCDate(checkOut.getUTCDate() + nightsCount)
    
    // Formatear como YYYY-MM-DD para el input type="date"
    const checkOutYear = checkOut.getUTCFullYear()
    const checkOutMonth = String(checkOut.getUTCMonth() + 1).padStart(2, '0')
    const checkOutDay = String(checkOut.getUTCDate()).padStart(2, '0')
    
    return `${checkOutYear}-${checkOutMonth}-${checkOutDay}`
  }

  // Funciones para nueva reserva
  const handleBookingFormChange = (field, value) => {
    setBookingFormData(prev => {
      const updated = {
        ...prev,
        [field]: value
      }
      
      // Si cambia la fecha de check-in o el número de noches, calcular automáticamente check-out
      if (field === 'check_in_date' || field === 'nights_requested') {
        const checkInDate = field === 'check_in_date' ? value : prev.check_in_date
        const nights = field === 'nights_requested' ? value : prev.nights_requested
        updated.check_out_date = calculateCheckOutDate(checkInDate, nights)
      }
      
      return updated
    })
    
    // Si cambia el número de personas, actualizar participantes
    if (field === 'people_count') {
      const count = parseInt(value) || 1
      const newParticipants = Array.from({ length: count }, (_, index) => ({
        first_name: participantsData[index]?.first_name || '',
        last_name: participantsData[index]?.last_name || '',
        identification: participantsData[index]?.identification || ''
      }))
      setParticipantsData(newParticipants)
    }
  }

  const handleParticipantChange = (index, field, value) => {
    const newParticipants = [...participantsData]
    newParticipants[index] = {
      ...newParticipants[index],
      [field]: value
    }
    setParticipantsData(newParticipants)
  }

  const handleSearchContracts = async () => {
    if (contractSearchTerm.length !== 4) {
      setBookingError('Por favor ingrese exactamente 4 dígitos')
      return
    }

    try {
      const response = await bookingService.searchContracts(contractSearchTerm)
      setContractSearchResults(response.clients || [])
      setShowContractSearch(true)
      setBookingError('')
    } catch (error) {
      console.error('Error buscando contratos:', error)
      setBookingError('Error al buscar contratos')
    }
  }

  const handleSelectContract = (client) => {
    setValidatedClient(client)
    setBookingFormData(prev => {
      // Inicializar participantes basado en people_count
      const currentPeopleCount = prev.people_count || 1
      const newParticipants = Array.from({ length: currentPeopleCount }, () => ({
        first_name: '',
        last_name: '',
        identification: ''
      }))
      setParticipantsData(newParticipants)
      
      return {
        ...prev,
        contract_number: client.contract_number
      }
    })
    setShowContractSearch(false)
    setContractSearchTerm('')
    setBookingError('')
  }


  const handleCreateBooking = async () => {
    if (!validatedClient) {
      setBookingError('Debes seleccionar un contrato primero')
      return
    }
    
    if (!bookingFormData.city || !bookingFormData.nights_requested || !bookingFormData.people_count || !bookingFormData.contact_source) {
      setBookingError('Por favor completa todos los campos requeridos: ciudad, noches solicitadas, cantidad de personas y fuente de contacto')
      return
    }

    // Validar que si hay más de 6 personas, se especifiquen adultos y niños adicionales
    if (bookingFormData.people_count > 6) {
      const totalAdditional = (parseInt(bookingFormData.additional_adults) || 0) + (parseInt(bookingFormData.additional_children) || 0);
      const expectedAdditional = bookingFormData.people_count - 6;
      if (totalAdditional !== expectedAdditional) {
        setBookingError(`Con ${bookingFormData.people_count} personas, debes especificar ${expectedAdditional} persona(s) adicional(es) (adultos + niños). Actualmente tienes ${totalAdditional}.`)
        return
      }
    }

    if (bookingFormData.city === 'Otros' && !bookingFormData.custom_city?.trim()) {
      setBookingError('Debes especificar el nombre de la ciudad cuando seleccionas "Otros"')
      return
    }

    // Validar participantes: si se proporcionan, deben estar completos
    // Si no se proporcionan, se envía array vacío (opcional)
    if (participantsData && participantsData.length > 0) {
      // Si hay participantes, deben ser exactamente people_count y todos completos
      if (participantsData.length !== parseInt(bookingFormData.people_count)) {
        setBookingError(`Debe proporcionar datos para exactamente ${bookingFormData.people_count} participante(s)`)
        return
      }
      
      const invalidParticipants = participantsData.filter(p => 
        !p.first_name?.trim() || !p.last_name?.trim() || !p.identification?.trim()
      )
      if (invalidParticipants.length > 0) {
        setBookingError(`Por favor completa los datos de todos los participantes (nombre, apellido y cédula)`)
        return
      }
    }

    setBookingError('')

    try {
      // Preparar participants_data: solo enviar si está completo, sino array vacío
      let finalParticipantsData = []
      if (participantsData && participantsData.length > 0) {
        // Verificar que todos tengan datos completos
        const allComplete = participantsData.every(p => 
          p.first_name?.trim() && p.last_name?.trim() && p.identification?.trim()
        )
        if (allComplete && participantsData.length === parseInt(bookingFormData.people_count)) {
          finalParticipantsData = participantsData
        }
      }
      
      const bookingData = {
        contract_number: bookingFormData.contract_number || validatedClient.contract_number,
        city: bookingFormData.city,
        custom_city: bookingFormData.city === 'Otros' ? (bookingFormData.custom_city?.trim() || null) : null,
        nights_requested: parseInt(bookingFormData.nights_requested),
        people_count: parseInt(bookingFormData.people_count),
        additional_adults: bookingFormData.people_count > 6 ? parseInt(bookingFormData.additional_adults) || 0 : 0,
        additional_children: bookingFormData.people_count > 6 ? parseInt(bookingFormData.additional_children) || 0 : 0,
        contact_source: bookingFormData.contact_source,
        observations: bookingFormData.observations?.trim() || null,
        check_in_date: bookingFormData.check_in_date || null,
        check_out_date: bookingFormData.check_out_date || null,
        emergency_contact: bookingFormData.emergency_contact?.trim() || null,
        dietary_restrictions: bookingFormData.dietary_restrictions?.trim() || null,
        special_requests: bookingFormData.special_requests?.trim() || null,
        wifi_name: bookingFormData.wifi_name?.trim() || null,
        wifi_password: bookingFormData.wifi_password?.trim() || null,
        google_maps_link: bookingFormData.google_maps_link?.trim() || null,
        participants_data: finalParticipantsData
      }
      
      console.log('📤 Enviando datos de reserva:', JSON.stringify(bookingData, null, 2))

      const response = await bookingService.createBooking(bookingData)
      
      // Recargar reservas
      await loadBookings()
      
      // Guardar datos antes de limpiar para generar el mensaje
      const formDataForMessage = { ...bookingFormData }
      const clientForMessage = { ...validatedClient }
      
      // Generar mensaje de WhatsApp antes de limpiar los datos
      const whatsAppMsg = generateWhatsAppMessage(formDataForMessage, clientForMessage)
      setWhatsAppMessage(whatsAppMsg)
      
      // Cerrar formulario de reserva
      setShowNewBookingForm(false)
      
      // Limpiar formulario
      setBookingFormData({
        contract_number: '',
        city: '',
        custom_city: '',
        nights_requested: '',
        people_count: 1,
        additional_adults: 0,
        additional_children: 0,
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
      setParticipantsData([])
      setContractSearchTerm('')
      setShowContractSearch(false)
      setValidatedClient(null)
      
      // Mostrar modal de WhatsApp
      setShowWhatsAppModal(true)
    } catch (error) {
      console.error('❌ Error creando reserva:', error)
      console.error('📋 Detalles del error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        request: error.config
      })
      
      const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'Error al crear la reserva'
      setBookingError(errorMessage)
    }
  }

  // Funciones para nuevo requerimiento
  const handleRequirementFormChange = (field, value) => {
    setRequirementFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleRequirementContractSearch = async () => {
    if (!requirementSearchTerm.trim()) {
      setRequirementError('Por favor ingrese el número de contrato')
      return
    }

    try {
      const response = await clientService.searchClientsByContract(requirementSearchTerm)
      setRequirementSearchResults(response.clients || [])
      setShowRequirementSearch(true)
      setRequirementError('')
    } catch (error) {
      console.error('Error buscando contratos:', error)
      setRequirementError('Error al buscar contratos')
    }
  }

  const handleSelectRequirementContract = (client) => {
    setRequirementFormData(prev => ({
      ...prev,
      contract_number: client.contract_number
    }))
    setShowRequirementSearch(false)
    setRequirementSearchTerm('')
    setRequirementError('')
  }

  const handleCreateRequirement = async () => {
    if (!requirementFormData.contract_number.trim()) {
      setRequirementError('Por favor seleccione un contrato')
      return
    }

    if (!requirementFormData.requirement_type.trim()) {
      setRequirementError('Por favor seleccione el tipo de requerimiento')
      return
    }

    if (!requirementFormData.description.trim()) {
      setRequirementError('Por favor ingrese la descripción del requerimiento')
      return
    }

    try {
      setRequirementLoading(true)
      setRequirementError('')

      const requirementData = {
        ...requirementFormData,
        assigned_to: requirementFormData.assigned_to || user?.email || 'Sin asignar'
      }

      await requirementService.createRequirement(requirementData)
      
      // Recargar lista de requerimientos
      loadRequirements()
      
      // Cerrar modal y limpiar datos
      setShowNewRequirementForm(false)
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
      setRequirementError('Error al crear el requerimiento')
    } finally {
      setRequirementLoading(false)
    }
  }

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Selector de período */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Dashboard de Empleados</h2>
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
            <div className="p-2 bg-green-100 rounded-lg">
              <Calendar className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Reservas Activas</p>
              <p className="text-2xl font-bold text-gray-900">
                {dashboardLoading ? '...' : dashboardData.activeBookings}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <ClipboardList className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Requerimientos</p>
              <p className="text-2xl font-bold text-gray-900">
                {dashboardLoading ? '...' : dashboardData.totalRequirements}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completados</p>
              <p className="text-2xl font-bold text-gray-900">
                {dashboardLoading ? '...' : dashboardData.completedRequirements}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Detalles del período */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Ventas del Período</h3>
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
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Reservas del Período</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Reservas:</span>
              <span className="font-semibold text-green-600">
                {dashboardLoading ? '...' : periodSummary?.bookings?.total_reservas ?? 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Monto Total:</span>
              <span className="font-semibold text-green-600">
                {dashboardLoading ? '...' : formatCurrency(periodSummary?.bookings?.total_monto ?? 0)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Confirmadas:</span>
              <span className="font-semibold text-green-600">
                {dashboardLoading ? '...' : periodSummary?.bookings?.confirmadas ?? 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Canceladas:</span>
              <span className="font-semibold text-red-600">
                {dashboardLoading ? '...' : periodSummary?.bookings?.canceladas ?? 0}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Requerimientos del Período</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Requerimientos:</span>
              <span className="font-semibold text-purple-600">
                {dashboardLoading ? '...' : periodSummary?.requirements?.total_requerimientos ?? 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Completados:</span>
              <span className="font-semibold text-green-600">
                {dashboardLoading ? '...' : periodSummary?.requirements?.completados ?? 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Pendientes:</span>
              <span className="font-semibold text-orange-600">
                {dashboardLoading ? '...' : periodSummary?.requirements?.pendientes ?? 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Resumen ejecutivo */}
      <div className="bg-gradient-to-r from-green-600 to-green-800 text-white p-6 rounded-lg">
        <h3 className="text-xl font-bold mb-4">📊 Resumen Ejecutivo de Empleados</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold">{dashboardData.totalClients}</div>
            <div className="text-sm opacity-90">Total Clientes</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{dashboardData.totalBookings}</div>
            <div className="text-sm opacity-90">Total Reservas</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{dashboardData.totalRequirements}</div>
            <div className="text-sm opacity-90">Requerimientos</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{dashboardData.completedRequirements}</div>
            <div className="text-sm opacity-90">Completados</div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderClients = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Gestión de Clientes</h2>
        <button 
          onClick={handleNewClient}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus size={20} />
          Nuevo Cliente
        </button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Buscar clientes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={handleSearch}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Search size={20} />
              Buscar
            </button>
          </div>
        </div>

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
                  Fecha Registro
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
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {client.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {client.phone}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(client.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleViewClientDetails(client)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Ver detalles"
                        >
                          <Eye size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="px-6 py-3 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50"
              >
                Anterior
              </button>
              <span className="text-sm text-gray-700">
                Página {currentPage} de {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )

  const renderBookings = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Gestión de Reservas</h2>
        <button 
          onClick={handleNewBooking}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
        >
          <Plus size={20} />
          Nueva Reserva
        </button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
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
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                  </td>
                </tr>
              ) : bookings.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                    No se encontraron reservas
                  </td>
                </tr>
              ) : (
                bookings.map((booking) => (
                  <tr key={booking.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {booking.client_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {booking.city_display}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {booking.nights_requested}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {booking.people_count}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(booking.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleViewBookingDetails(booking)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Ver detalles"
                        >
                          <Eye size={16} />
                        </button>
                        <button 
                          onClick={() => handleDeleteBookingClick(booking)}
                          className="text-red-600 hover:text-red-900"
                          title="Eliminar reserva"
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

  const renderRequirements = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Gestión de Requerimientos</h2>
        <button 
          onClick={handleNewRequirement}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center gap-2"
        >
          <Plus size={20} />
          Nuevo Requerimiento
        </button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Buscar requerimientos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={handleSearch}
              className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 flex items-center gap-2"
            >
              <Search size={20} />
              Buscar
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Descripción
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
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
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                  </td>
                </tr>
              ) : requirements.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                    No se encontraron requerimientos
                  </td>
                </tr>
              ) : (
                requirements.map((requirement) => (
                  <tr key={requirement.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {requirement.first_name} {requirement.last_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {requirement.requirement_type}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {requirement.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        requirement.status === 'completed' ? 'bg-green-100 text-green-800' :
                        requirement.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {requirement.status === 'completed' ? 'Completado' :
                         requirement.status === 'in_progress' ? 'En Progreso' : 'Pendiente'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(requirement.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleViewRequirementDetails(requirement)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Ver detalles"
                        >
                          <Eye size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="px-6 py-3 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50"
              >
                Anterior
              </button>
              <span className="text-sm text-gray-700">
                Página {currentPage} de {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )

  const renderReservationAgenda = () => (
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
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus size={20} />
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
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Fecha</label>
                <input
                  type="date"
                  value={reservationAgendaFormData.fecha}
                  onChange={(e) => handleReservationAgendaFormChange('fecha', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Socio</label>
                <input
                  type="text"
                  value={reservationAgendaFormData.socio}
                  onChange={(e) => handleReservationAgendaFormChange('socio', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Número de socio"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ciudad</label>
                <input
                  type="text"
                  value={reservationAgendaFormData.ciudad}
                  onChange={(e) => handleReservationAgendaFormChange('ciudad', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ciudad"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
                <input
                  type="text"
                  value={reservationAgendaFormData.nombre}
                  onChange={(e) => handleReservationAgendaFormChange('nombre', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nombre completo"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Destino</label>
                <input
                  type="text"
                  value={reservationAgendaFormData.destino}
                  onChange={(e) => handleReservationAgendaFormChange('destino', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Destino"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Llegada</label>
                <input
                  type="text"
                  value={reservationAgendaFormData.llegada}
                  onChange={(e) => handleReservationAgendaFormChange('llegada', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Fecha de llegada"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Salida</label>
                <input
                  type="text"
                  value={reservationAgendaFormData.salida}
                  onChange={(e) => handleReservationAgendaFormChange('salida', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Fecha de salida"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">PAX</label>
                <input
                  type="text"
                  value={reservationAgendaFormData.pax}
                  onChange={(e) => handleReservationAgendaFormChange('pax', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Número de personas"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Airbnb Nombres</label>
                <input
                  type="text"
                  value={reservationAgendaFormData.airbnb_nombres}
                  onChange={(e) => handleReservationAgendaFormChange('airbnb_nombres', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nombres en Airbnb"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cédulas</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Observación</label>
                <textarea
                  value={reservationAgendaFormData.observacion}
                  onChange={(e) => handleReservationAgendaFormChange('observacion', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder="Observaciones"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Link de conversación Airbnb</label>
                <input
                  type="url"
                  value={reservationAgendaFormData.link_conversacion_airbnb}
                  onChange={(e) => handleReservationAgendaFormChange('link_conversacion_airbnb', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://www.airbnb.com.ec/..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Estatus</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Tarjeta que se usó</label>
                <input
                  type="text"
                  value={reservationAgendaFormData.tarjeta_usada}
                  onChange={(e) => handleReservationAgendaFormChange('tarjeta_usada', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Número de tarjeta"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Valor pagado de reserva</label>
                <input
                  type="text"
                  value={reservationAgendaFormData.valor_pagado_reserva}
                  onChange={(e) => handleReservationAgendaFormChange('valor_pagado_reserva', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="$0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Pago de cliente</label>
                <input
                  type="text"
                  value={reservationAgendaFormData.pago_cliente}
                  onChange={(e) => handleReservationAgendaFormChange('pago_cliente', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="$0.00"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Observaciones Adicionales</label>
                <textarea
                  value={reservationAgendaFormData.observaciones_adicionales}
                  onChange={(e) => handleReservationAgendaFormChange('observaciones_adicionales', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder="Observaciones adicionales"
                />
              </div>
            </div>

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
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {editingReservationAgenda ? 'Actualizar' : 'Crear'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  const renderVisaAgenda = () => (
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
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus size={20} />
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
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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
                    <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
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
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">
                {editingVisaAgenda ? 'Editar Agenda de Visado' : 'Nueva Agenda de Visado'}
              </h3>
              <button
                onClick={() => {
                  setShowVisaAgendaForm(false)
                  setEditingVisaAgenda(null)
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fecha</label>
                <input
                  type="date"
                  value={visaAgendaFormData.fecha}
                  onChange={(e) => handleVisaAgendaFormChange('fecha', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Socio</label>
                <input
                  type="text"
                  value={visaAgendaFormData.socio}
                  onChange={(e) => handleVisaAgendaFormChange('socio', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Socio"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ciudad</label>
                <input
                  type="text"
                  value={visaAgendaFormData.ciudad}
                  onChange={(e) => handleVisaAgendaFormChange('ciudad', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ciudad"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
                <input
                  type="text"
                  value={visaAgendaFormData.nombre}
                  onChange={(e) => handleVisaAgendaFormChange('nombre', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nombre del cliente"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Embajada</label>
                <input
                  type="text"
                  value={visaAgendaFormData.embajada}
                  onChange={(e) => handleVisaAgendaFormChange('embajada', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Embajada"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ADS</label>
                <input
                  type="text"
                  value={visaAgendaFormData.ads}
                  onChange={(e) => handleVisaAgendaFormChange('ads', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="ADS"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Correo</label>
                <input
                  type="email"
                  value={visaAgendaFormData.correo}
                  onChange={(e) => handleVisaAgendaFormChange('correo', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Correo electrónico"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Contraseña</label>
                <input
                  type="password"
                  value={visaAgendaFormData.contrasena}
                  onChange={(e) => handleVisaAgendaFormChange('contrasena', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Contraseña"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Estatus</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de Entrevista Embajada</label>
                <input
                  type="date"
                  value={visaAgendaFormData.fecha_entrevista_embajada}
                  onChange={(e) => handleVisaAgendaFormChange('fecha_entrevista_embajada', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Hora de Entrevista Embajada</label>
                <input
                  type="time"
                  value={visaAgendaFormData.hora_entrevista_embajada}
                  onChange={(e) => handleVisaAgendaFormChange('hora_entrevista_embajada', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fecha para Asesoramiento</label>
                <input
                  type="date"
                  value={visaAgendaFormData.fecha_asesoramiento}
                  onChange={(e) => handleVisaAgendaFormChange('fecha_asesoramiento', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Observaciones</label>
                <textarea
                  value={visaAgendaFormData.observaciones}
                  onChange={(e) => handleVisaAgendaFormChange('observaciones', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder="Observaciones"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Link de Reunión</label>
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
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {editingVisaAgenda ? 'Actualizar' : 'Crear'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  const renderFlightAgenda = () => (
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
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus size={20} />
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
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">
                {editingFlightAgenda ? 'Editar Agenda de Vuelo' : 'Nueva Agenda de Vuelo'}
              </h3>
              <button
                onClick={() => {
                  setShowFlightAgendaForm(false)
                  setEditingFlightAgenda(null)
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fecha</label>
                <input
                  type="date"
                  value={flightAgendaFormData.fecha}
                  onChange={(e) => handleFlightAgendaFormChange('fecha', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Socio</label>
                <input
                  type="text"
                  value={flightAgendaFormData.socio}
                  onChange={(e) => handleFlightAgendaFormChange('socio', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Socio"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ciudad</label>
                <input
                  type="text"
                  value={flightAgendaFormData.ciudad}
                  onChange={(e) => handleFlightAgendaFormChange('ciudad', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ciudad"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
                <input
                  type="text"
                  value={flightAgendaFormData.nombre}
                  onChange={(e) => handleFlightAgendaFormChange('nombre', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nombre del cliente"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Destino</label>
                <input
                  type="text"
                  value={flightAgendaFormData.destino}
                  onChange={(e) => handleFlightAgendaFormChange('destino', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Destino"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Llegada</label>
                <input
                  type="date"
                  value={flightAgendaFormData.llegada}
                  onChange={(e) => handleFlightAgendaFormChange('llegada', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Salida</label>
                <input
                  type="date"
                  value={flightAgendaFormData.salida}
                  onChange={(e) => handleFlightAgendaFormChange('salida', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">PAX</label>
                <input
                  type="number"
                  value={flightAgendaFormData.pax}
                  onChange={(e) => handleFlightAgendaFormChange('pax', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Número de personas"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ruta</label>
                <input
                  type="text"
                  value={flightAgendaFormData.ruta}
                  onChange={(e) => handleFlightAgendaFormChange('ruta', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ruta del vuelo"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Número de Reserva</label>
                <input
                  type="text"
                  value={flightAgendaFormData.numero_reserva}
                  onChange={(e) => handleFlightAgendaFormChange('numero_reserva', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Número de reserva"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Estatus</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Tarjeta que se usó</label>
                <input
                  type="text"
                  value={flightAgendaFormData.tarjeta_usada}
                  onChange={(e) => handleFlightAgendaFormChange('tarjeta_usada', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Tarjeta usada"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Valor Pagado de Reserva</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Pago de Cliente</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Observación</label>
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
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {editingFlightAgenda ? 'Actualizar' : 'Crear'}
              </button>
            </div>
          </div>
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
      case 'bookings':
        return renderBookings()
      case 'requirements':
        return renderRequirements()
      case 'agenda-reservas':
        return renderReservationAgenda()
      case 'agenda-visados':
        return renderVisaAgenda()
      case 'agenda-vuelos':
        return renderFlightAgenda()
      default:
        return renderDashboard()
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <SessionWarning />
      
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:translate-x-0`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">Panel Empleado</h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>
        
        <nav className="mt-6">
          <div className="px-6 py-2">
            <p className="text-sm text-gray-500">Bienvenido, {user?.first_name}</p>
          </div>
          
          <div className="px-3">
            <button
              onClick={() => setActiveModule('dashboard')}
              className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg mb-1 ${
                activeModule === 'dashboard' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <TrendingUp size={20} className="mr-3" />
              Dashboard
            </button>
            
            <button
              onClick={() => setActiveModule('clients')}
              className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg mb-1 ${
                activeModule === 'clients' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Users size={20} className="mr-3" />
              Clientes
            </button>
            
            <button
              onClick={() => setActiveModule('bookings')}
              className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg mb-1 ${
                activeModule === 'bookings' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Calendar size={20} className="mr-3" />
              Reservas
            </button>
            
            <button
              onClick={() => setActiveModule('requirements')}
              className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg mb-1 ${
                activeModule === 'requirements' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <ClipboardList size={20} className="mr-3" />
              Requerimientos
            </button>
            
            <button
              onClick={() => setActiveModule('agenda-reservas')}
              className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg mb-1 ${
                activeModule === 'agenda-reservas' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <BookOpen size={20} className="mr-3" />
              Agenda de Reservas
            </button>
            <button
              onClick={() => setActiveModule('agenda-visados')}
              className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg mb-1 ${
                activeModule === 'agenda-visados' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <FileCheck size={20} className="mr-3" />
              Agenda de Visados
            </button>
            <button
              onClick={() => setActiveModule('agenda-vuelos')}
              className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg mb-1 ${
                activeModule === 'agenda-vuelos' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Plane size={20} className="mr-3" />
              Agenda de Vuelos
            </button>
          </div>
        </nav>
        
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <button
            onClick={logout}
            className="w-full flex items-center px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg"
          >
            <LogOut size={20} className="mr-3" />
            Cerrar Sesión
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-6">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <Menu size={24} />
            </button>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                {user?.first_name} {user?.last_name}
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {renderContent()}
        </div>
      </div>

      {/* Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Modales */}
      {/* Modal Nuevo Cliente */}
      {showNewClientModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Nuevo Cliente
            </h3>
            
            <form className="space-y-4">
              {/* Primera fila */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">FECHA *</label>
                  <input
                    type="date"
                    value={newClientData.fecha}
                    onChange={(e) => handleNewClientChange('fecha', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                      className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="UIO"
                      maxLength="4"
                      required
                    />
                    <input
                      type="text"
                      value={newClientData.contrato_number || '0001'}
                      className="w-20 px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                      readOnly
                    />
                  </div>
                  <div className="mt-1 text-sm text-gray-500">
                    Formato: KMPRY {newClientData.contrato_suffix || 'XXX'} {newClientData.contrato_number || '0001'}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">NOMBRES *</label>
                  <input
                    type="text"
                    value={newClientData.nombres}
                    onChange={(e) => handleNewClientChange('nombres', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ej: Juan Carlos"
                    required
                  />
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ej: Pérez González"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">CÉDULA *</label>
                  <input
                    type="text"
                    value={newClientData.cedula}
                    onChange={(e) => handleNewClientChange('cedula', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ej: 1234567890"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">TELÉFONO *</label>
                  <input
                    type="text"
                    value={newClientData.telefono}
                    onChange={(e) => handleNewClientChange('telefono', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ej: 0987654321"
                    required
                  />
                </div>
              </div>

              {/* Tercera fila */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">NOCHES *</label>
                  <input
                    type="number"
                    value={newClientData.noches}
                    onChange={(e) => handleNewClientChange('noches', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">AÑOS</label>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="anos_indefinido"
                        checked={newClientData.anos_indefinido}
                        onChange={(e) => handleNewClientChange('anos_indefinido', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="anos_indefinido" className="ml-2 text-sm text-gray-700">
                        Indefinido (Contrato Vitalicio)
                      </label>
                    </div>
                    <input
                      type="number"
                      value={newClientData.anos}
                      onChange={(e) => handleNewClientChange('anos', parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                      disabled={newClientData.anos_indefinido}
                      placeholder={newClientData.anos_indefinido ? "Contrato vitalicio" : "Número de años"}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">BONO INTERNACIONAL</label>
                  <input
                    type="text"
                    value={newClientData.bono_internacional}
                    onChange={(e) => handleNewClientChange('bono_internacional', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ej: París"
                  />
                </div>
              </div>

              {/* Cuarta fila */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">PAGO MIXTO</label>
                  <select
                    value={newClientData.pago_mixto}
                    onChange={(e) => handleNewClientChange('pago_mixto', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="No">No</option>
                    <option value="Si">Si</option>
                  </select>
                </div>
                {newClientData.pago_mixto === 'No' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">DATAFAST</label>
                      <select
                        value={newClientData.datafast}
                        onChange={(e) => handleNewClientChange('datafast', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="KMP">KMP</option>
                        <option value="RCC">RCC</option>
                        <option value="Kempery">Kempery</option>
                        <option value="Payphone Zindy">Payphone Zindy</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">TIPO DE TARJETA</label>
                      <input
                        type="text"
                        value={newClientData.tipo_tarjeta}
                        onChange={(e) => handleNewClientChange('tipo_tarjeta', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Ej: Visa, Mastercard"
                      />
                    </div>
                  </>
                )}
              </div>

              {/* Quinta fila - Solo mostrar cuando NO es pago mixto */}
              {newClientData.pago_mixto === 'No' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">TOTAL DE LA VENTA *</label>
                    <input
                      type="number"
                      value={newClientData.total_venta}
                      onChange={(e) => handleNewClientChange('total_venta', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Sexta fila - Forma de pago y tiempo */}
              {newClientData.pago_mixto === 'No' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">FORMA DE PAGO</label>
                    <select
                      value={newClientData.forma_pago}
                      onChange={(e) => handleNewClientChange('forma_pago', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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

              {/* Sexta fila */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">CORREO ELECTRÓNICO</label>
                  <input
                    type="email"
                    value={newClientData.correo_electronico}
                    onChange={(e) => handleNewClientChange('correo_electronico', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="ejemplo@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">LINNER</label>
                  <input
                    type="text"
                    value={newClientData.linner}
                    onChange={(e) => handleNewClientChange('linner', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nombre del linner"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">CLOSER</label>
                  <input
                    type="text"
                    value={newClientData.closer}
                    onChange={(e) => handleNewClientChange('closer', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nombre del closer"
                  />
                </div>
              </div>

              {/* Categoría cliente */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoría
                </label>
                <select
                  value={newClientData.categoria_cliente}
                  onChange={(e) => handleNewClientChange('categoria_cliente', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccionar...</option>
                    <option value="blue">Blue</option>
                    <option value="gold">Gold</option>
                    <option value="black">Black</option>
                </select>
              </div>

              {/* Pagaré */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pagaré
                </label>
                <select
                  value={newClientData.pagare}
                  onChange={(e) => handleNewClientChange('pagare', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="No">No</option>
                  <option value="Si">Sí</option>
                </select>
              </div>

              {/* Campos del pagaré (solo si es "Sí") */}
              {newClientData.pagare === 'Si' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fecha del Pagaré *
                    </label>
                    <input
                      type="date"
                      value={newClientData.fecha_pagare}
                      onChange={(e) => handleNewClientChange('fecha_pagare', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0.00"
                      required={newClientData.pagare === 'Si'}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cantidad de cuotas
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={newClientData.cantidad_cuotas}
                      onChange={(e) => handleNewClientChange('cantidad_cuotas', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cuotas asumidas
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={newClientData.cuotas_asumidas}
                      onChange={(e) => handleNewClientChange('cuotas_asumidas', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Valor cuota
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={newClientData.valor_cuota}
                      onChange={(e) => handleNewClientChange('valor_cuota', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Total pagaré
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={newClientData.total_pagare}
                      onChange={(e) => handleNewClientChange('total_pagare', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              )}

              {/* Observaciones */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">OBSERVACIONES</label>
                <textarea
                  value={newClientData.observaciones}
                  onChange={(e) => handleNewClientChange('observaciones', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder="Observaciones adicionales..."
                />
              </div>
            </form>

            {/* Botones */}
            <div className="flex justify-end gap-4 mt-6">
              <button
                type="button"
                onClick={() => setShowNewClientModal(false)}
                className="px-4 py-2 text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleCreateClient}
                disabled={newClientLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {newClientLoading ? 'Creando...' : 'Crear Cliente'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Nueva Reserva */}
      {showNewBookingForm && (
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ingrese el nombre de la ciudad"
                    />
                  </div>
                )}
              </div>

              {/* Noches y personas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Número de Noches *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={validatedClient?.remaining_nights || 999}
                    value={bookingFormData.nights_requested}
                    onChange={(e) => handleBookingFormChange('nights_requested', parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    Número de Personas *
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        const newCount = Math.max(1, bookingFormData.people_count - 1);
                        handleBookingFormChange('people_count', newCount);
                        // Si baja de 7, resetear adicionales
                        if (newCount <= 6) {
                          handleBookingFormChange('additional_adults', 0);
                          handleBookingFormChange('additional_children', 0);
                        }
                      }}
                      className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-bold"
                      disabled={bookingFormData.people_count <= 1}
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="1"
                      value={bookingFormData.people_count}
                      onChange={(e) => {
                        const newCount = Math.max(1, parseInt(e.target.value) || 1);
                        handleBookingFormChange('people_count', newCount);
                        // Si baja de 7, resetear adicionales
                        if (newCount <= 6) {
                          handleBookingFormChange('additional_adults', 0);
                          handleBookingFormChange('additional_children', 0);
                        }
                      }}
                      className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                    />
                    <button
                      type="button"
                      onClick={() => handleBookingFormChange('people_count', bookingFormData.people_count + 1)}
                      className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-bold"
                    >
                      +
                    </button>
                    <span className="text-sm text-gray-600">
                      {bookingFormData.people_count} persona{bookingFormData.people_count > 1 ? 's' : ''}
                    </span>
                  </div>
                  
                  {/* Campos para personas adicionales cuando hay más de 6 */}
                  {bookingFormData.people_count > 6 && (
                    <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm font-medium text-yellow-800 mb-3">
                        ⚠️ Personas adicionales (más de 6 personas)
                      </p>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Adultos adicionales
                          </label>
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => {
                                const newCount = Math.max(0, bookingFormData.additional_adults - 1);
                                handleBookingFormChange('additional_adults', newCount);
                              }}
                              className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-bold"
                              disabled={bookingFormData.additional_adults <= 0}
                            >
                              -
                            </button>
                            <input
                              type="number"
                              min="0"
                              value={bookingFormData.additional_adults}
                              onChange={(e) => {
                                const newCount = Math.max(0, parseInt(e.target.value) || 0);
                                handleBookingFormChange('additional_adults', newCount);
                              }}
                              className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                            />
                            <button
                              type="button"
                              onClick={() => handleBookingFormChange('additional_adults', bookingFormData.additional_adults + 1)}
                              className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-bold"
                            >
                              +
                            </button>
                          </div>
                          <p className="text-xs text-gray-600 mt-1">
                            $30 por noche por adulto
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Niños adicionales
                          </label>
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => {
                                const newCount = Math.max(0, bookingFormData.additional_children - 1);
                                handleBookingFormChange('additional_children', newCount);
                              }}
                              className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-bold"
                              disabled={bookingFormData.additional_children <= 0}
                            >
                              -
                            </button>
                            <input
                              type="number"
                              min="0"
                              value={bookingFormData.additional_children}
                              onChange={(e) => {
                                const newCount = Math.max(0, parseInt(e.target.value) || 0);
                                handleBookingFormChange('additional_children', newCount);
                              }}
                              className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                            />
                            <button
                              type="button"
                              onClick={() => handleBookingFormChange('additional_children', bookingFormData.additional_children + 1)}
                              className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-bold"
                            >
                              +
                            </button>
                          </div>
                          <p className="text-xs text-gray-600 mt-1">
                            $25 por noche por niño
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 mt-2">
                        Total personas: {6 + bookingFormData.additional_adults + bookingFormData.additional_children} (6 base + {bookingFormData.additional_adults} adultos + {bookingFormData.additional_children} niños)
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Valor de la Reserva */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Valor de la Reserva *
                </label>
                <select
                  value={bookingFormData.reservation_value}
                  onChange={(e) => handleBookingFormChange('reservation_value', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                          {calculation.additionalAdults > 0 && (
                            <p>Adultos adicionales: {calculation.additionalAdults} × $30 × {calculation.nightsCount} noche(s) = ${calculation.additionalAdultsCost.toFixed(2)}</p>
                          )}
                          {calculation.additionalChildren > 0 && (
                            <p>Niños adicionales: {calculation.additionalChildren} × $25 × {calculation.nightsCount} noche(s) = ${calculation.additionalChildrenCost.toFixed(2)}</p>
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

              {/* Datos de participantes */}
              {participantsData.length > 0 && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-800 mb-3">👥 Datos de Participantes</h4>
                  <div className="space-y-3">
                    {participantsData.map((participant, index) => (
                      <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nombres Persona {index + 1}
                          </label>
                          <input
                            type="text"
                            value={participant.first_name}
                            onChange={(e) => handleParticipantChange(index, 'first_name', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Nombres"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Apellidos Persona {index + 1}
                          </label>
                          <input
                            type="text"
                            value={participant.last_name}
                            onChange={(e) => handleParticipantChange(index, 'last_name', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Apellidos"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Cédula Persona {index + 1}
                          </label>
                          <input
                            type="text"
                            value={participant.identification}
                            onChange={(e) => handleParticipantChange(index, 'identification', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Cédula"
                          />
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccionar fuente</option>
                  <option value="Empresa propia">Empresa propia</option>
                  <option value="Airbnb">Airbnb</option>
                  <option value="Booking.com">Booking.com</option>
                  <option value="Referido">Referido</option>
                  <option value="Redes sociales">Redes sociales</option>
                  <option value="Otros">Otros</option>
                </select>
              </div>

              {/* Observaciones */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Observaciones
                </label>
                <textarea
                  value={bookingFormData.observations}
                  onChange={(e) => handleBookingFormChange('observations', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder="Observaciones adicionales sobre la reserva..."
                />
              </div>

              {/* Fechas de check-in y check-out */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de Check-in
                  </label>
                  <input
                    type="date"
                    value={bookingFormData.check_in_date}
                    onChange={(e) => handleBookingFormChange('check_in_date', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de Check-out {bookingFormData.check_in_date && bookingFormData.nights_requested && (
                      <span className="text-xs text-gray-500 font-normal">(calculada automáticamente)</span>
                    )}
                  </label>
                  <input
                    type="date"
                    value={bookingFormData.check_out_date}
                    onChange={(e) => handleBookingFormChange('check_out_date', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Se calculará automáticamente"
                  />
                  {bookingFormData.check_in_date && bookingFormData.nights_requested && bookingFormData.check_out_date && (
                    <p className="text-xs text-gray-500 mt-1">
                      ✓ Calculada: {bookingFormData.check_in_date} + {bookingFormData.nights_requested} noche(s) = {bookingFormData.check_out_date}
                    </p>
                  )}
                </div>
              </div>

              {/* Contacto de emergencia */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contacto de Emergencia
                </label>
                <input
                  type="text"
                  value={bookingFormData.emergency_contact}
                  onChange={(e) => handleBookingFormChange('emergency_contact', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nombre y teléfono de contacto de emergencia"
                />
              </div>

              {/* Restricciones dietéticas */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Restricciones Dietéticas
                </label>
                <textarea
                  value={bookingFormData.dietary_restrictions}
                  onChange={(e) => handleBookingFormChange('dietary_restrictions', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="2"
                  placeholder="Alergias, restricciones alimentarias, etc."
                />
              </div>

              {/* Indicaciones generales */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Indicaciones Generales
                </label>
                <textarea
                  value={bookingFormData.special_requests}
                  onChange={(e) => handleBookingFormChange('special_requests', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder="Indicaciones especiales para la reserva..."
                />
              </div>

              {/* Información adicional */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre Wi-Fi
                  </label>
                  <input
                    type="text"
                    value={bookingFormData.wifi_name}
                    onChange={(e) => handleBookingFormChange('wifi_name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nombre del Wi-Fi"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contraseña Wi-Fi
                  </label>
                  <input
                    type="text"
                    value={bookingFormData.wifi_password}
                    onChange={(e) => handleBookingFormChange('wifi_password', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Contraseña del Wi-Fi"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Enlace Google Maps
                  </label>
                  <input
                    type="url"
                    value={bookingFormData.google_maps_link}
                    onChange={(e) => handleBookingFormChange('google_maps_link', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://maps.google.com/..."
                  />
                </div>
              </div>
            </form>

            {/* Botones */}
            <div className="flex justify-end gap-4 mt-6">
              <button
                type="button"
                onClick={() => setShowNewBookingForm(false)}
                className="px-4 py-2 text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleCreateBooking}
                disabled={bookingLoading || !validatedClient}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {bookingLoading ? 'Creando...' : 'Crear Reserva'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Nuevo Requerimiento */}
      {showNewRequirementForm && (
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                        className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder="Notas adicionales sobre el requerimiento..."
                />
              </div>
            </form>

            {/* Botones */}
            <div className="flex justify-end gap-4 mt-6">
              <button
                type="button"
                onClick={() => setShowNewRequirementForm(false)}
                className="px-4 py-2 text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleCreateRequirement}
                disabled={requirementLoading}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
              >
                {requirementLoading ? 'Creando...' : 'Crear Requerimiento'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Detalles Cliente */}
      {showClientDetailsModal && selectedClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Detalles del Cliente</h3>
              <button
                onClick={() => setShowClientDetailsModal(false)}
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
                <p className="mt-1 text-sm text-gray-900">{selectedClient.phone}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Cédula</label>
                <p className="mt-1 text-sm text-gray-900">{selectedClient.identification}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Número de Contrato</label>
                <p className="mt-1 text-sm text-gray-900">{selectedClient.contract_number}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Total de Noches</label>
                <p className="mt-1 text-sm text-gray-900">{selectedClient.total_nights || 0}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Noches Restantes</label>
                <p className="mt-1 text-sm text-gray-900">{selectedClient.remaining_nights || 0}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Años</label>
                <p className="mt-1 text-sm text-gray-900">
                  {selectedClient.years_indefinido ? 'Contrato Vitalicio (Indefinido)' : selectedClient.years || 0}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Bono Internacional</label>
                <p className="mt-1 text-sm text-gray-900">{selectedClient.international_bonus || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Pago Mixto</label>
                <p className="mt-1 text-sm text-gray-900">{selectedClient.mixed_payment || 'No'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">DataFast</label>
                <p className="mt-1 text-sm text-gray-900">{selectedClient.datafast}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Tipo de Tarjeta</label>
                <p className="mt-1 text-sm text-gray-900">{selectedClient.card_type || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Total de la Venta</label>
                <p className="mt-1 text-sm text-gray-900">${(parseFloat(selectedClient.total_amount) || 0).toFixed(2)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">IVA (15%)</label>
                <p className="mt-1 text-sm text-gray-900">${(parseFloat(selectedClient.tax_amount) || 0).toFixed(2)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Neto</label>
                <p className="mt-1 text-sm text-gray-900">${(parseFloat(selectedClient.net_amount) || 0).toFixed(2)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Estado de Pago</label>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  selectedClient.payment_status === 'paid' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {selectedClient.payment_status === 'paid' ? 'Pagado' : 'Pendiente'}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">En Cobranzas</label>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  selectedClient.in_collections === 'true' 
                    ? 'bg-orange-100 text-orange-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {selectedClient.in_collections === 'true' ? 'Sí' : 'No'}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Linner</label>
                <p className="mt-1 text-sm text-gray-900">{selectedClient.linner || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Closer</label>
                <p className="mt-1 text-sm text-gray-900">{selectedClient.closer || 'N/A'}</p>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Observaciones</label>
                <p className="mt-1 text-sm text-gray-900">{selectedClient.notes || 'Sin observaciones'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Fecha de Registro</label>
                <p className="mt-1 text-sm text-gray-900">{formatDate(selectedClient.created_at)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Última Actualización</label>
                <p className="mt-1 text-sm text-gray-900">{formatDate(selectedClient.updated_at)}</p>
              </div>
            </div>
            
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowClientDetailsModal(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Detalles Reserva */}
      {showBookingDetailsModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Detalles de la Reserva</h3>
              <button
                onClick={() => setShowBookingDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Cliente</label>
                <p className="mt-1 text-sm text-gray-900">{selectedBooking.client_name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Número de Contrato</label>
                <p className="mt-1 text-sm text-gray-900">{selectedBooking.contract_number}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Ciudad</label>
                <p className="mt-1 text-sm text-gray-900">{selectedBooking.city_display}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Noches Solicitadas</label>
                <p className="mt-1 text-sm text-gray-900">{selectedBooking.nights_requested}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Número de Personas</label>
                <p className="mt-1 text-sm text-gray-900">{selectedBooking.people_count}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Estado</label>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  selectedBooking.status === 'confirmed' 
                    ? 'bg-green-100 text-green-800' 
                    : selectedBooking.status === 'pending'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {selectedBooking.status === 'confirmed' ? 'Confirmada' :
                   selectedBooking.status === 'pending' ? 'Pendiente' : 'Cancelada'}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Fuente de Contacto</label>
                <p className="mt-1 text-sm text-gray-900">{selectedBooking.contact_source || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Fecha de Creación</label>
                <p className="mt-1 text-sm text-gray-900">{formatDate(selectedBooking.created_at)}</p>
              </div>
              {selectedBooking.wifi_name && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nombre Wi-Fi</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedBooking.wifi_name}</p>
                </div>
              )}
              {selectedBooking.wifi_password && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Contraseña Wi-Fi</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedBooking.wifi_password}</p>
                </div>
              )}
              {selectedBooking.google_maps_link && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Enlace Google Maps</label>
                  <a 
                    href={selectedBooking.google_maps_link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="mt-1 text-sm text-blue-600 hover:text-blue-800 break-all"
                  >
                    {selectedBooking.google_maps_link}
                  </a>
                </div>
              )}
              {selectedBooking.special_requests && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Indicaciones Generales</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedBooking.special_requests}</p>
                </div>
              )}
              {selectedBooking.participants && selectedBooking.participants.length > 0 && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Participantes</label>
                  <div className="space-y-2">
                    {selectedBooking.participants.map((participant, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded-lg">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                          <div>
                            <span className="font-medium">Nombres:</span> {participant.first_name}
                          </div>
                          <div>
                            <span className="font-medium">Apellidos:</span> {participant.last_name}
                          </div>
                          <div>
                            <span className="font-medium">Cédula:</span> {participant.identification}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => handleViewPdf(selectedBooking.id)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
              >
                <Eye className="h-4 w-4" />
                Ver PDF
              </button>
              <button
                onClick={() => setShowBookingDetailsModal(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Visor de PDF */}
      {showPdfViewer && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 w-full h-full max-w-6xl max-h-[95vh] flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Documento PDF de la Reserva</h3>
              <button
                onClick={() => {
                  setShowPdfViewer(false)
                  setPdfUrl(null)
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="flex-1 border border-gray-300 rounded-lg overflow-hidden bg-gray-100">
              {pdfLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Generando y cargando PDF...</p>
                    <p className="text-sm text-gray-500 mt-2">Esto puede tardar unos segundos</p>
                  </div>
                </div>
              ) : pdfUrl ? (
                <iframe
                  src={pdfUrl}
                  className="w-full h-full"
                  title="PDF Viewer"
                  style={{ minHeight: '600px' }}
                  onError={() => {
                    alert('Error al cargar el PDF. Puede que el documento no se haya generado aún. Por favor, genere el documento primero.');
                    setShowPdfViewer(false);
                  }}
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <p className="text-gray-600 mb-2">No se pudo cargar el PDF</p>
                    <p className="text-sm text-gray-500">Por favor, asegúrese de que el documento haya sido generado primero</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex justify-end gap-3 mt-4">
              {pdfUrl && (
                <a
                  href={pdfUrl}
                  download
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Descargar PDF
                </a>
              )}
              <button
                onClick={() => {
                  setShowPdfViewer(false)
                  setPdfUrl(null)
                }}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Detalles Requerimiento */}
      {showRequirementDetailsModal && selectedRequirement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Detalles del Requerimiento</h3>
              <button
                onClick={() => setShowRequirementDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Tipo de Requerimiento</label>
                <p className="mt-1 text-sm text-gray-900">{selectedRequirement.type}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Cliente</label>
                <p className="mt-1 text-sm text-gray-900">{selectedRequirement.client_name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Número de Contrato</label>
                <p className="mt-1 text-sm text-gray-900">{selectedRequirement.contract_number}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Estado</label>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  selectedRequirement.status === 'completed' 
                    ? 'bg-green-100 text-green-800' 
                    : selectedRequirement.status === 'in_progress'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {selectedRequirement.status === 'completed' ? 'Completado' :
                   selectedRequirement.status === 'in_progress' ? 'En Progreso' : 'Pendiente'}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Asignado a</label>
                <p className="mt-1 text-sm text-gray-900">{selectedRequirement.assigned_to || 'Sin asignar'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Fecha de Creación</label>
                <p className="mt-1 text-sm text-gray-900">{formatDate(selectedRequirement.created_at)}</p>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Descripción</label>
                <p className="mt-1 text-sm text-gray-900">{selectedRequirement.description}</p>
              </div>
              {selectedRequirement.notes && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Notas Adicionales</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedRequirement.notes}</p>
                </div>
              )}
              {selectedRequirement.updated_at && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Última Actualización</label>
                  <p className="mt-1 text-sm text-gray-900">{formatDate(selectedRequirement.updated_at)}</p>
                </div>
              )}
            </div>
            
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowRequirementDetailsModal(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación de eliminación de reserva */}
      {showDeleteBookingModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Eliminar Reserva</h3>
              <button
                onClick={() => {
                  setShowDeleteBookingModal(false)
                  setSelectedBooking(null)
                  setDeleteBookingPassword('')
                  setDeleteBookingPasswordError('')
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <p className="text-sm text-gray-700">
                ¿Estás seguro de que deseas eliminar esta reserva?
              </p>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-gray-900">Cliente: {selectedBooking.client_name}</p>
                <p className="text-sm text-gray-600">Ciudad: {selectedBooking.city_display || 'N/A'}</p>
                <p className="text-sm text-gray-600">Noches: {selectedBooking.nights_requested || 0}</p>
                <p className="text-sm text-gray-600">Personas: {selectedBooking.people_count || 0}</p>
                <p className="text-sm text-gray-600">Fecha: {formatDate(selectedBooking.created_at)}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contraseña de confirmación
                </label>
                <input
                  type="password"
                  value={deleteBookingPassword}
                  onChange={(e) => {
                    setDeleteBookingPassword(e.target.value)
                    setDeleteBookingPasswordError('')
                  }}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                    deleteBookingPasswordError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                  }`}
                  placeholder="Ingresa la contraseña"
                />
                {deleteBookingPasswordError && (
                  <p className="mt-1 text-sm text-red-600">{deleteBookingPasswordError}</p>
                )}
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowDeleteBookingModal(false)
                  setSelectedBooking(null)
                  setDeleteBookingPassword('')
                  setDeleteBookingPasswordError('')
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDeleteBooking}
                disabled={loading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Mensaje para WhatsApp */}
      {showWhatsAppModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Mensaje para WhatsApp</h3>
              <button
                onClick={() => {
                  setShowWhatsAppModal(false)
                  setWhatsAppMessage('')
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Mensaje generado:
                  </label>
                </div>
                <textarea
                  readOnly
                  value={whatsAppMessage}
                  className="w-full h-96 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm font-mono whitespace-pre-wrap"
                  style={{ resize: 'vertical' }}
                />
              </div>
              
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowWhatsAppModal(false)
                    setWhatsAppMessage('')
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Cerrar
                </button>
                <button
                  onClick={async () => {
                    await copyToClipboard(whatsAppMessage)
                    setShowWhatsAppModal(false)
                    setWhatsAppMessage('')
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                >
                  <Copy size={16} />
                  Copiar y cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default EmployeePanel

