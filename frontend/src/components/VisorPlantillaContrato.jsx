import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const VisorPlantillaContrato = ({ cliente }) => {
  const [plantilla, setPlantilla] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mostrarPlantilla, setMostrarPlantilla] = useState(false);

  const cargarPlantilla = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('authToken')
      
      // Buscar contratos del cliente
      const response = await axios.get(`${API_URL}/contratos/cliente/${cliente.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.data && response.data.data.length > 0) {
        const contratoId = response.data.data[0].id;
        
        // Generar plantilla
        const plantillaResponse = await axios.get(`${API_URL}/contratos/${contratoId}/plantilla`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        setPlantilla(plantillaResponse.data.data);
        setMostrarPlantilla(true);
      } else {
        setError('No hay contratos asociados a tu cuenta');
      }
    } catch (err) {
      console.error('Error al cargar plantilla:', err);
      setError('Error al cargar la plantilla del contrato');
    } finally {
      setLoading(false);
    }
  };

  const descargarPDF = async () => {
    try {
      const token = localStorage.getItem('authToken');
      
      // Buscar contratos del cliente
      const response = await axios.get(`${API_URL}/contratos/cliente/${cliente.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.data && response.data.data.length > 0) {
        const contratoId = response.data.data[0].id;
        window.open(`${API_URL}/contratos/${contratoId}/documento?token=${token}`, '_blank');
      }
    } catch (err) {
      console.error('Error al descargar:', err);
      alert('Error al descargar el documento');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <button
          onClick={cargarPlantilla}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? 'Cargando...' : '📋 Ver Plantilla'}
        </button>
        <button
          onClick={descargarPDF}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          📄 Descargar Documento
        </button>
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 p-3 rounded">
          {error}
        </div>
      )}

      {mostrarPlantilla && plantilla && (
        <div className="bg-white p-6 rounded-lg shadow-md border-2 border-blue-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-blue-900">Plantilla de Contrato</h3>
            <button
              onClick={() => setMostrarPlantilla(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          {/* Datos del Cliente */}
          <div className="mb-6">
            <h4 className="font-semibold text-gray-800 mb-3 pb-2 border-b-2 border-blue-300">
              📋 Datos del Cliente
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Nombre</p>
                <p className="font-semibold">{plantilla.cliente.nombres_completos}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Cédula</p>
                <p className="font-semibold">{plantilla.cliente.cedula}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Teléfono</p>
                <p className="font-semibold">{plantilla.cliente.telefono}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Ciudad</p>
                <p className="font-semibold">{plantilla.cliente.ciudad}</p>
              </div>
            </div>
          </div>

          {/* Datos de Tarjeta */}
          <div className="mb-6">
            <h4 className="font-semibold text-gray-800 mb-3 pb-2 border-b-2 border-green-300">
              💳 Datos de Tarjeta
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Tarjetahabiente</p>
                <p className="font-semibold">{plantilla.tarjeta.nombre_tarjetahabiente}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Tipo</p>
                <p className="font-semibold">{plantilla.tarjeta.tipo_tarjeta}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Últimos Dígitos</p>
                <p className="font-semibold">**** {plantilla.tarjeta.numero_tarjeta.slice(-4)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Caducidad</p>
                <p className="font-semibold">{plantilla.tarjeta.fecha_caducidad}</p>
              </div>
            </div>
          </div>

          {/* Detalles del Contrato */}
          <div className="mb-6">
            <h4 className="font-semibold text-gray-800 mb-3 pb-2 border-b-2 border-purple-300">
              📄 Detalles del Contrato
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Número de Contrato</p>
                <p className="font-semibold text-blue-600">{plantilla.contrato.numero_contrato}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Fecha</p>
                <p className="font-semibold">{new Date(plantilla.contrato.fecha).toLocaleDateString('es-EC')}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Valor del Contrato</p>
                <p className="font-semibold text-green-600">${plantilla.contrato.valor_contrato.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Años de Duración</p>
                <p className="font-semibold">{plantilla.contrato.anos_contrato} años</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Número de Noches</p>
                <p className="font-semibold">{plantilla.contrato.numero_noches} noches</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Tarjeta y Banco</p>
                <p className="font-semibold">{plantilla.contrato.tarjeta_y_banco}</p>
              </div>
            </div>
          </div>

          {/* Autorización de Pago */}
          <div className="mb-6">
            <h4 className="font-semibold text-gray-800 mb-3 pb-2 border-b-2 border-yellow-300">
              ✅ Autorización de Pago
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Monto</p>
                <p className="font-semibold">${plantilla.autorizacion.valor.monto_numerico.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">En Letras</p>
                <p className="font-semibold text-sm">{plantilla.autorizacion.valor.monto_letras}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Voucher Lote</p>
                <p className="font-semibold">{plantilla.autorizacion.voucher.lote}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Referencia</p>
                <p className="font-semibold">{plantilla.autorizacion.voucher.referencia}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Aprobación</p>
                <p className="font-semibold">{plantilla.autorizacion.voucher.aprobacion}</p>
              </div>
            </div>
          </div>

          {/* Estadía */}
          <div className="mb-6">
            <h4 className="font-semibold text-gray-800 mb-3 pb-2 border-b-2 border-pink-300">
              🏨 Estadía Incluida
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 p-3 rounded">
                <p className="text-sm text-gray-600">Estadía Internacional</p>
                <p className="font-semibold">
                  {plantilla.estadia.internacional.incluye ? '✓ Incluida' : '✗ No incluida'}
                </p>
                <p className="text-sm text-gray-600">{plantilla.estadia.internacional.numero_pax} personas</p>
              </div>
              <div className="bg-green-50 p-3 rounded">
                <p className="text-sm text-gray-600">Estadía Nacional</p>
                <p className="font-semibold">
                  {plantilla.estadia.nacional.incluye ? '✓ Incluida' : '✗ No incluida'}
                </p>
                <p className="text-sm text-gray-600">{plantilla.estadia.nacional.numero_pax} personas</p>
              </div>
            </div>
          </div>

          {/* Beneficios */}
          <div className="mb-6">
            <h4 className="font-semibold text-gray-800 mb-3 pb-2 border-b-2 border-orange-300">
              🎁 Beneficios
            </h4>
            <div className="space-y-3">
              <div className="bg-yellow-50 p-3 rounded">
                <p className="text-sm text-gray-600">Cortesías por Asistencia</p>
                <p className="font-semibold">{plantilla.beneficios.cortesias_por_asistencia}</p>
              </div>
              <div className="bg-orange-50 p-3 rounded">
                <p className="text-sm text-gray-600">Ofrecimientos Adicionales</p>
                <p className="font-semibold">{plantilla.beneficios.ofrecimientos_adicionales}</p>
              </div>
            </div>
          </div>

          {/* Empresa */}
          <div className="bg-gray-50 p-4 rounded border border-gray-200">
            <h4 className="font-semibold text-gray-800 mb-2">Empresa</h4>
            <p className="text-sm"><strong>Razón Social:</strong> {plantilla.autorizacion.empresa.razon_social}</p>
            <p className="text-sm"><strong>Nombre Comercial:</strong> {plantilla.autorizacion.empresa.nombre_comercial}</p>
            <p className="text-sm"><strong>RUC:</strong> {plantilla.autorizacion.empresa.ruc}</p>
          </div>

          {/* JSON Completo */}
          <details className="mt-6 border border-gray-300 rounded p-3 bg-gray-50">
            <summary className="cursor-pointer font-semibold text-gray-700 hover:text-gray-900">
              📝 Ver JSON Completo
            </summary>
            <pre className="mt-3 bg-gray-800 text-gray-100 p-4 rounded overflow-auto max-h-96 text-xs">
              {JSON.stringify(plantilla, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
};

export default VisorPlantillaContrato;
