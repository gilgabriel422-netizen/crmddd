import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Search, Filter, Eye, Edit, Trash2, FileText, Send, Download } from 'lucide-react';
import { bookingService } from '../services/api';
import DocumentStatus from './DocumentStatus';

const BookingManagement = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Estados para el formulario de nueva reserva
  const [newBooking, setNewBooking] = useState({
    contract_number: '',
    city: '',
    custom_city: '',
    nights_requested: 1,
    people_count: 1,
    contact_source: '',
    observations: '',
    participants_data: []
  });

  const [availableCities] = useState([
    'Baños', 'Cuenca', 'Quito', 'Manta', 'Tonsupa', 'Salinas', 'Otros'
  ]);

  useEffect(() => {
    fetchBookings();
  }, [currentPage, searchTerm]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await bookingService.getAll({
        page: currentPage,
        limit: 10,
        search: searchTerm
      });
      setBookings(response.bookings || []);
      setTotalPages(response.pagination?.totalPages || 1);
    } catch (error) {
      setError('Error cargando reservas');
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchBookings();
  };

  const handleCreateBooking = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await bookingService.create(newBooking);
      if (response.success) {
        setShowCreateModal(false);
        setNewBooking({
          contract_number: '',
          city: '',
          custom_city: '',
          nights_requested: 1,
          people_count: 1,
          contact_source: '',
          observations: '',
          participants_data: []
        });
        fetchBookings();
        alert('Reserva creada exitosamente');
      }
    } catch (error) {
      setError('Error creando reserva');
      console.error('Error creating booking:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateDocument = async (bookingId) => {
    try {
      const response = await fetch(`/api/documents/generate-reservation/${bookingId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        alert('Documento generado exitosamente');
        fetchBookings();
      } else {
        alert('Error generando documento');
      }
    } catch (error) {
      console.error('Error generating document:', error);
      alert('Error generando documento');
    }
  };

  const handleSendWhatsApp = async (bookingId) => {
    try {
      const response = await fetch(`/api/documents/send-whatsapp/${bookingId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        alert('Documento enviado por WhatsApp exitosamente');
        fetchBookings();
      } else {
        alert('Error enviando documento por WhatsApp');
      }
    } catch (error) {
      console.error('Error sending WhatsApp:', error);
      alert('Error enviando documento por WhatsApp');
    }
  };

  const handleDownloadDocument = async (bookingId) => {
    try {
      const response = await fetch(`/api/documents/download/${bookingId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Manual_Reserva_${bookingId}.docx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert('Error descargando documento');
      }
    } catch (error) {
      console.error('Error downloading document:', error);
      alert('Error descargando documento');
    }
  };

  const handleViewDetails = (booking) => {
    setSelectedBooking(booking);
    setShowDetailsModal(true);
  };

  const renderParticipantsData = (participantsData) => {
    if (!participantsData || participantsData.length === 0) {
      return <span className="text-gray-500">No especificado</span>;
    }
    
    return (
      <div className="space-y-1">
        {participantsData.map((participant, index) => (
          <div key={index} className="text-sm">
            <span className="font-medium">{participant.first_name} {participant.last_name}</span>
            <span className="text-gray-500 ml-2">({participant.identification})</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 flex items-center">
          <Calendar className="h-6 w-6 mr-2 text-blue-600" />
          Gestión de Reservas
        </h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5 mr-2" />
          Nueva Reserva
        </button>
      </div>

      {/* Barra de búsqueda */}
      <div className="flex items-center space-x-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por número de reserva, cliente o ciudad..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        <button
          onClick={handleSearch}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Buscar
        </button>
      </div>

      {/* Lista de reservas */}
      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div key={booking.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-2">
                    <h3 className="text-lg font-semibold text-gray-800">
                      {booking.booking_number}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                      booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {booking.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Cliente:</span>
                      <p>{booking.client_name}</p>
                    </div>
                    <div>
                      <span className="font-medium">Ciudad:</span>
                      <p>{booking.city_display}</p>
                    </div>
                    <div>
                      <span className="font-medium">Noches:</span>
                      <p>{booking.nights_requested}</p>
                    </div>
                    <div>
                      <span className="font-medium">Personas:</span>
                      <p>{booking.people_count}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleViewDetails(booking)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Ver detalles"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              {/* Estado del documento */}
              <div className="mt-4 pt-4 border-t">
                <DocumentStatus
                  booking={booking}
                  onGenerateDocument={handleGenerateDocument}
                  onSendWhatsApp={handleSendWhatsApp}
                  onDownloadDocument={handleDownloadDocument}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 mt-6">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Anterior
          </button>
          <span className="px-3 py-2 text-sm text-gray-600">
            Página {currentPage} de {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Siguiente
          </button>
        </div>
      )}

      {/* Modal de detalles */}
      {showDetailsModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-800">
                Detalles de la Reserva
              </h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="font-medium text-gray-600">Número de Reserva:</span>
                  <p className="text-gray-800">{selectedBooking.booking_number}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Estado:</span>
                  <p className="text-gray-800">{selectedBooking.status}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Cliente:</span>
                  <p className="text-gray-800">{selectedBooking.client_name}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Ciudad:</span>
                  <p className="text-gray-800">{selectedBooking.city_display}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Noches:</span>
                  <p className="text-gray-800">{selectedBooking.nights_requested}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Personas:</span>
                  <p className="text-gray-800">{selectedBooking.people_count}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Fuente de Contacto:</span>
                  <p className="text-gray-800">{selectedBooking.contact_source}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Fecha de Creación:</span>
                  <p className="text-gray-800">
                    {new Date(selectedBooking.created_at).toLocaleDateString('es-ES')}
                  </p>
                </div>
              </div>
              
              {selectedBooking.observations && (
                <div>
                  <span className="font-medium text-gray-600">Observaciones:</span>
                  <p className="text-gray-800 mt-1">{selectedBooking.observations}</p>
                </div>
              )}
              
              {selectedBooking.participants_data && selectedBooking.participants_data.length > 0 && (
                <div>
                  <span className="font-medium text-gray-600">Participantes:</span>
                  <div className="mt-2">
                    {renderParticipantsData(selectedBooking.participants_data)}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de nueva reserva */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-800">
                Nueva Reserva
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleCreateBooking} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Número de Contrato
                  </label>
                  <input
                    type="text"
                    value={newBooking.contract_number}
                    onChange={(e) => setNewBooking({...newBooking, contract_number: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ciudad
                  </label>
                  <select
                    value={newBooking.city}
                    onChange={(e) => setNewBooking({...newBooking, city: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Seleccionar ciudad</option>
                    {availableCities.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>
                
                {newBooking.city === 'Otros' && (
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre de la Ciudad
                    </label>
                    <input
                      type="text"
                      value={newBooking.custom_city}
                      onChange={(e) => setNewBooking({...newBooking, custom_city: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required={newBooking.city === 'Otros'}
                    />
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Noches Solicitadas
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={newBooking.nights_requested}
                    onChange={(e) => setNewBooking({...newBooking, nights_requested: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cantidad de Personas
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={newBooking.people_count}
                    onChange={(e) => setNewBooking({...newBooking, people_count: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fuente de Contacto
                  </label>
                  <select
                    value={newBooking.contact_source}
                    onChange={(e) => setNewBooking({...newBooking, contact_source: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Seleccionar fuente</option>
                    <option value="Kempery World Travel">Kempery World Travel</option>
                    <option value="Airbnb">Airbnb</option>
                    <option value="Booking.com">Booking.com</option>
                    <option value="Referido">Referido</option>
                    <option value="Otros">Otros</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Observaciones
                </label>
                <textarea
                  value={newBooking.observations}
                  onChange={(e) => setNewBooking({...newBooking, observations: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="3"
                />
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Creando...' : 'Crear Reserva'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingManagement;
