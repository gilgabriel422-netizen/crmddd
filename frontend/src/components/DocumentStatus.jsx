import React from 'react';
import { FileText, CheckCircle, XCircle, Clock, Download, Send } from 'lucide-react';

const DocumentStatus = ({ booking, onGenerateDocument, onSendWhatsApp, onDownloadDocument }) => {
  const getStatusIcon = () => {
    if (booking.document_sent) {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    } else if (booking.document_generated) {
      return <Clock className="h-5 w-5 text-yellow-500" />;
    } else {
      return <XCircle className="h-5 w-5 text-red-500" />;
    }
  };

  const getStatusText = () => {
    if (booking.document_sent) {
      return 'Documento enviado';
    } else if (booking.document_generated) {
      return 'Documento generado';
    } else {
      return 'Documento pendiente';
    }
  };

  const getStatusColor = () => {
    if (booking.document_sent) {
      return 'text-green-600 bg-green-50';
    } else if (booking.document_generated) {
      return 'text-yellow-600 bg-yellow-50';
    } else {
      return 'text-red-600 bg-red-50';
    }
  };

  return (
    <div className="bg-white rounded-lg border p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <FileText className="h-5 w-5 mr-2 text-blue-600" />
          Estado del Documento
        </h3>
        {getStatusIcon()}
      </div>

      <div className="space-y-3">
        {/* Estado actual */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Estado:</span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
            {getStatusText()}
          </span>
        </div>

        {/* Fecha de envío */}
        {booking.document_sent_at && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Enviado:</span>
            <span className="text-sm text-gray-800">
              {new Date(booking.document_sent_at).toLocaleDateString('es-ES')}
            </span>
          </div>
        )}

        {/* Acciones */}
        <div className="flex space-x-2 pt-2">
          {!booking.document_generated && (
            <button
              onClick={() => onGenerateDocument(booking.id)}
              className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              <FileText className="h-4 w-4 mr-1" />
              Generar
            </button>
          )}

          {booking.document_generated && !booking.document_sent && (
            <button
              onClick={() => onSendWhatsApp(booking.id)}
              className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
            >
              <Send className="h-4 w-4 mr-1" />
              Enviar WhatsApp
            </button>
          )}

          {booking.document_generated && (
            <button
              onClick={() => onDownloadDocument(booking.id)}
              className="flex items-center px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
            >
              <Download className="h-4 w-4 mr-1" />
              Descargar
            </button>
          )}
        </div>

        {/* Información de formato */}
        {booking.document_generated && (
          <div className="text-xs text-gray-500 pt-2 border-t">
            <p className="font-medium mb-1">Formatos disponibles:</p>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">DOCX</span>
              {booking.pdf_available && (
                <span className="px-2 py-1 bg-red-100 text-red-700 rounded">PDF</span>
              )}
              {booking.pdf_error && (
                <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs" title={booking.pdf_error}>
                  PDF no disponible
                </span>
              )}
            </div>
          </div>
        )}

        {/* Información adicional */}
        <div className="text-xs text-gray-500 pt-2 border-t">
          <p>El documento incluye:</p>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>Información de acceso y check-in</li>
            <li>Detalles del Wi-Fi</li>
            <li>Fechas de check-in y check-out</li>
            <li>Datos de participantes</li>
            <li>Normas de la casa</li>
            <li>Procedimientos de check-out</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DocumentStatus;
