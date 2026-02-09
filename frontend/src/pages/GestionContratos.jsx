import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export default function GestionContratos() {
  const { user, logout } = useAuth();
  const [contratos, setContratos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [vistaActual, setVistaActual] = useState('lista'); // lista, crear, detalle
  const [contratoSeleccionado, setContratoSeleccionado] = useState(null);
  const [estadisticas, setEstadisticas] = useState(null);
  const [adjuntos, setAdjuntos] = useState([]);
  const [cargandoAdjuntos, setCargandoAdjuntos] = useState(false);
  const [subiendo, setSubiendo] = useState(false);
  const [plantillasDisponibles, setPlantillasDisponibles] = useState([]);
  const [plantillaSeleccionada, setPlantillaSeleccionada] = useState('');
  const [anexosSeleccionados, setAnexosSeleccionados] = useState([]);
  
  // Plantilla de contrato
  const [plantilla, setPlantilla] = useState({
    cliente: {
      nombres_completos: '',
      ciudad: '',
      pais: 'Ecuador',
      telefono: '',
      cedula: ''
    },
    tarjeta: {
      nombre_tarjetahabiente: '',
      tipo_tarjeta: 'Visa',
      numero_tarjeta: '',
      fecha_caducidad: ''
    },
    autorizacion: {
      empresa: {
        razon_social: 'PACIFIC ADVENTURE PACITURE S.A.S',
        nombre_comercial: 'INNOVATION BUSINESS',
        ruc: '1793230574001'
      },
      valor: {
        monto_numerico: 0,
        monto_letras: ''
      },
      motivo: 'Prestación de servicios turísticos nacionales e internacionales',
      voucher: {
        lote: '',
        referencia: '',
        aprobacion: '',
        modalidad: 'venta'
      }
    },
    contrato: {
      fecha: new Date().toISOString().split('T')[0],
      valor_contrato: 0,
      anos_contrato: 2,
      numero_noches: 10,
      tarjeta_y_banco: '',
      pagare: {
        numero: '',
        fecha_vencimiento: ''
      }
    },
    estadia: {
      internacional: {
        incluye: true,
        numero_pax: 2
      },
      nacional: {
        incluye: true,
        numero_pax: 2
      }
    },
    beneficios: {
      cortesias_por_asistencia: '',
      ofrecimientos_adicionales: ''
    },
    metadata: {
      creado_por: user?.email || 'sistema',
      estado: 'pendiente'
    }
  });

  // Cargar contratos y plantillas
  useEffect(() => {
    cargarContratos();
    cargarEstadisticas();
    cargarPlantillas();
  }, []);

  const getAuthToken = () => localStorage.getItem('authToken') || localStorage.getItem('token');

  const cargarContratos = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      const response = await axios.get(`${API_URL}/contratos`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setContratos(response.data.data || []);
    } catch (error) {
      console.error('Error al cargar contratos:', error);
      alert('Error al cargar contratos');
    } finally {
      setLoading(false);
    }
  };

  const cargarEstadisticas = async () => {
    try {
      const token = getAuthToken();
      const response = await axios.get(`${API_URL}/contratos/estadisticas`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEstadisticas(response.data.data);
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    }
  };

  const cargarPlantillas = async () => {
    try {
      const response = await axios.get(`${API_URL}/plantillas`);
      setPlantillasDisponibles(response.data.data || []);
      console.log('✅ Plantillas cargadas:', response.data.data);
    } catch (error) {
      console.error('Error al cargar plantillas:', error);
    }
  };

  const usarPlantilla = async (plantillaId) => {
    try {
      // Obtener ID del contrato actual
      const contratoId = contratoSeleccionado?.id;
      const response = await axios.get(`${API_URL}/plantillas/${plantillaId}`);
      const contenidoPlantilla = response.data.data || {};

      const esFormulario = Boolean(
        contenidoPlantilla.cliente &&
        contenidoPlantilla.tarjeta &&
        contenidoPlantilla.autorizacion &&
        contenidoPlantilla.contrato
      );

      if (esFormulario) {
        // Si es formulario, llenar los campos del contrato
        setPlantillaSeleccionada(plantillaId);
        setPlantilla(prev => ({
          ...prev,
          cliente: { ...prev.cliente, ...contenidoPlantilla.cliente },
          tarjeta: { ...prev.tarjeta, ...contenidoPlantilla.tarjeta },
          autorizacion: { ...prev.autorizacion, ...contenidoPlantilla.autorizacion },
          contrato: { ...prev.contrato, ...contenidoPlantilla.contrato },
          estadia: { ...prev.estadia, ...(contenidoPlantilla.estadia || {}) },
          beneficios: { ...prev.beneficios, ...(contenidoPlantilla.beneficios || {}) }
        }));
        alert('✅ Plantilla de contrato cargada exitosamente');
      } else {
        setPlantillaSeleccionada(plantillaId);

        setAnexosSeleccionados(prev => {
          const existe = prev.find(anexo => anexo.id === plantillaId);
          if (existe) {
            return prev.map(anexo =>
              anexo.id === plantillaId ? { ...anexo, data: contenidoPlantilla } : anexo
            );
          }
          return [...prev, { id: plantillaId, data: contenidoPlantilla }];
        });

        // Si es un anexo, generar PDF y añadirlo como adjunto
        if (!contratoId) {
          alert('ℹ️ Guarda el contrato para adjuntar esta plantilla como PDF.');
          return;
        }

        console.log(`📄 Generando PDF desde plantilla ${plantillaId} para contrato ${contratoId}`);
        setCargandoAdjuntos(true);

        const respuestaAdjunto = await axios.post(
          `${API_URL}/adjuntos/${contratoId}/desde-plantilla/${plantillaId}`,
          { plantilla: contenidoPlantilla },
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (respuestaAdjunto.data.success) {
          console.log('✅ Plantilla convertida a PDF exitosamente');
          alert(`✅ Plantilla "${plantillaId}" añadida como adjunto al contrato`);
          
          // Recargar lista de adjuntos
          if (contratoId) {
            await cargarAdjuntos(contratoId);
          }
        }
      }
    } catch (error) {
      console.error('Error al usar plantilla:', error);
      alert('❌ Error al procesar plantilla: ' + (error.response?.data?.message || error.message));
    } finally {
      setCargandoAdjuntos(false);
    }
  };

  const crearContrato = async () => {
    try {
      const token = getAuthToken();
      const response = await axios.post(`${API_URL}/contratos/plantilla`, plantilla, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const contratoCreadoId = response.data?.data?.id;
      if (contratoCreadoId && anexosSeleccionados.length > 0) {
        for (const anexo of anexosSeleccionados) {
          await axios.post(
            `${API_URL}/adjuntos/${contratoCreadoId}/desde-plantilla/${anexo.id}`,
            { plantilla: anexo.data },
            {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            }
          );
        }
      }
      
      alert('¡Contrato creado exitosamente! Número: ' + response.data.data.numero_contrato);
      setAnexosSeleccionados([]);
      setVistaActual('lista');
      cargarContratos();
      cargarEstadisticas();
    } catch (error) {
      console.error('Error al crear contrato:', error);
      alert('Error: ' + (error.response?.data?.message || error.message));
    }
  };

  const verDetalle = async (id) => {
    try {
      const token = getAuthToken();
      const response = await axios.get(`${API_URL}/contratos/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setContratoSeleccionado(response.data.data);
      setVistaActual('detalle');
      cargarAdjuntos(id);
    } catch (error) {
      console.error('Error al cargar detalle:', error);
      alert('Error al cargar detalle del contrato');
    }
  };

  const cargarAdjuntos = async (contratoId) => {
    try {
      setCargandoAdjuntos(true);
      const token = getAuthToken();
      const response = await axios.get(`${API_URL}/adjuntos/${contratoId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAdjuntos(response.data.data || []);
    } catch (error) {
      console.error('Error al cargar adjuntos:', error);
      setAdjuntos([]);
    } finally {
      setCargandoAdjuntos(false);
    }
  };

  const subirPDF = async (contratoId, archivo, descripcion = '', tipoDocumento = 'otro') => {
    try {
      setSubiendo(true);
      const token = getAuthToken();
      const formData = new FormData();
      formData.append('pdf', archivo);
      formData.append('descripcion', descripcion);
      formData.append('tipo_documento', tipoDocumento);

      const response = await axios.post(`${API_URL}/adjuntos/${contratoId}/subir`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      alert('✅ PDF subido exitosamente');
      await cargarAdjuntos(contratoId);
      return response.data.data;
    } catch (error) {
      console.error('Error al subir PDF:', error);
      alert('❌ Error al subir PDF: ' + (error.response?.data?.message || error.message));
    } finally {
      setSubiendo(false);
    }
  };

  const descargarPDF = (adjuntoId, nombreOriginal) => {
    const token = getAuthToken();
    const url = `${API_URL}/adjuntos/descargar/${adjuntoId}?token=${token}`;
    
    const link = document.createElement('a');
    link.href = url;
    link.download = nombreOriginal;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const eliminarAdjunto = async (adjuntoId) => {
    if (!window.confirm('¿Eliminar este adjunto?')) return;

    try {
      const token = getAuthToken();
      await axios.delete(`${API_URL}/adjuntos/${adjuntoId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('✅ Adjunto eliminado');
      await cargarAdjuntos(contratoSeleccionado.id);
    } catch (error) {
      console.error('Error al eliminar adjunto:', error);
      alert('❌ Error al eliminar adjunto');
    }
  };

  const verDocumento = (id) => {
    const token = getAuthToken();
    const url = `${API_URL}/contratos/${id}/documento/pdf`;
    window.open(url + `?token=${token}`, '_blank');
  };

  const actualizarCampo = (seccion, campo, valor) => {
    setPlantilla(prev => ({
      ...prev,
      [seccion]: {
        ...prev[seccion],
        [campo]: valor
      }
    }));
  };

  const actualizarCampoAnidado = (seccion, subseccion, campo, valor) => {
    setPlantilla(prev => ({
      ...prev,
      [seccion]: {
        ...prev[seccion],
        [subseccion]: {
          ...prev[seccion][subseccion],
          [campo]: valor
        }
      }
    }));
  };

  const setNestedValue = (obj, path, value) => {
    if (!path.length) return obj;
    const key = path[0];
    const copy = Array.isArray(obj) ? [...obj] : { ...obj };
    if (path.length === 1) {
      copy[key] = value;
      return copy;
    }
    const next = obj && obj[key] !== undefined ? obj[key] : {};
    copy[key] = setNestedValue(next, path.slice(1), value);
    return copy;
  };

  const actualizarAnexoCampo = (anexoId, path, value) => {
    setAnexosSeleccionados(prev =>
      prev.map(anexo => {
        if (anexo.id !== anexoId) return anexo;
        return {
          ...anexo,
          data: setNestedValue(anexo.data, path, value)
        };
      })
    );
  };

  const renderAnexoCampos = (anexoId, data, path = []) => {
    if (!data || typeof data !== 'object') return null;

    return Object.entries(data).map(([key, value]) => {
      const currentPath = [...path, key];

      if (value && typeof value === 'object' && !Array.isArray(value)) {
        return (
          <div key={currentPath.join('.')} className="mt-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">
              {key.replace(/_/g, ' ')}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {renderAnexoCampos(anexoId, value, currentPath)}
            </div>
          </div>
        );
      }

      const inputType = typeof value === 'number' ? 'number' : 'text';
      const inputValue = value === null || value === undefined ? '' : value;

      if (typeof value === 'boolean') {
        return (
          <label key={currentPath.join('.')} className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={Boolean(value)}
              onChange={(e) => actualizarAnexoCampo(anexoId, currentPath, e.target.checked)}
              className="h-4 w-4"
            />
            {key.replace(/_/g, ' ')}
          </label>
        );
      }

      return (
        <input
          key={currentPath.join('.')}
          type={inputType}
          value={inputValue}
          onChange={(e) => actualizarAnexoCampo(anexoId, currentPath, inputType === 'number' ? Number(e.target.value) : e.target.value)}
          placeholder={key.replace(/_/g, ' ')}
          className="border rounded px-3 py-2"
        />
      );
    });
  };

  // Vista: Lista de Contratos
  if (vistaActual === 'lista') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Contratos</h1>
            <div className="flex gap-3">
              <button 
                onClick={() => setVistaActual('crear')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                + Nuevo Contrato
              </button>
              <button 
                onClick={() => window.location.href = '/dashboard-contratos'}
                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Volver
              </button>
            </div>
          </div>

          {/* Estadísticas */}
          {estadisticas && (
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="bg-white p-4 rounded-lg shadow">
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold">{estadisticas.total}</p>
              </div>
              <div className="bg-yellow-100 p-4 rounded-lg shadow">
                <p className="text-sm text-gray-600">Pendientes</p>
                <p className="text-2xl font-bold">{estadisticas.pendientes}</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <p className="text-sm text-gray-600">Activos</p>
                <p className="text-2xl font-bold">{estadisticas.activos}</p>
              </div>
              <div className="bg-blue-100 p-4 rounded-lg shadow">
                <p className="text-sm text-gray-600">Valor Total</p>
                <p className="text-2xl font-bold">${parseFloat(estadisticas.valor_total || 0).toFixed(2)}</p>
              </div>
            </div>
          )}

          {/* Tabla de Contratos */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Número</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Noches</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr><td colSpan="7" className="text-center py-8">Cargando...</td></tr>
                ) : contratos.length === 0 ? (
                  <tr><td colSpan="7" className="text-center py-8 text-gray-500">No hay contratos. Crea uno nuevo.</td></tr>
                ) : (
                  contratos.map(contrato => (
                    <tr key={contrato.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {contrato.numero_contrato}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {contrato.first_name} {contrato.last_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${parseFloat(contrato.valor_contrato || 0).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {contrato.numero_noches || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${contrato.estado === 'activo' ? 'bg-green-100 text-green-800' : ''}
                          ${contrato.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' : ''}
                          ${contrato.estado === 'firmado' ? 'bg-blue-100 text-blue-800' : ''}
                          ${contrato.estado === 'cancelado' ? 'bg-red-100 text-red-800' : ''}
                        `}>
                          {contrato.estado}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(contrato.fecha_creacion).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button 
                          onClick={() => verDetalle(contrato.id)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          Ver
                        </button>
                        <button 
                          onClick={() => verDocumento(contrato.id)}
                          className="text-green-600 hover:text-green-900 mr-3"
                        >
                          📄 Documento
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // Vista: Crear Contrato
  if (vistaActual === 'crear') {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Crear Nuevo Contrato</h1>
            <button 
              onClick={() => setVistaActual('lista')}
              className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              Cancelar
            </button>
          </div>

          {/* Selector de Plantillas */}
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h2 className="text-xl font-bold mb-4">📋 Cargar Plantilla</h2>
            <p className="text-gray-600 mb-4">Selecciona una plantilla de contrato para cargar como base:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {plantillasDisponibles.map((plantilla) => (
                <button 
                  key={plantilla.id}
                  onClick={() => usarPlantilla(plantilla.id)}
                  className="p-4 border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 text-left transition-colors"
                >
                  <div className="font-semibold text-gray-900">{plantilla.nombre}</div>
                  <div className="text-sm text-gray-600">{plantilla.descripcion}</div>
                </button>
              ))}
            </div>
          </div>


          <div className="space-y-6">
            {/* Datos del Cliente */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-bold mb-4">📋 Datos del Cliente</h2>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Nombres completos"
                  value={plantilla.cliente.nombres_completos}
                  onChange={(e) => actualizarCampo('cliente', 'nombres_completos', e.target.value)}
                  className="border rounded px-3 py-2"
                />
                <input
                  type="text"
                  placeholder="Cédula"
                  value={plantilla.cliente.cedula}
                  onChange={(e) => actualizarCampo('cliente', 'cedula', e.target.value)}
                  className="border rounded px-3 py-2"
                />
                <input
                  type="text"
                  placeholder="Teléfono"
                  value={plantilla.cliente.telefono}
                  onChange={(e) => actualizarCampo('cliente', 'telefono', e.target.value)}
                  className="border rounded px-3 py-2"
                />
                <input
                  type="text"
                  placeholder="Ciudad"
                  value={plantilla.cliente.ciudad}
                  onChange={(e) => actualizarCampo('cliente', 'ciudad', e.target.value)}
                  className="border rounded px-3 py-2"
                />
              </div>
            </div>

            {/* Datos de Tarjeta */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-bold mb-4">💳 Datos de Tarjeta</h2>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Nombre tarjetahabiente"
                  value={plantilla.tarjeta.nombre_tarjetahabiente}
                  onChange={(e) => actualizarCampo('tarjeta', 'nombre_tarjetahabiente', e.target.value)}
                  className="border rounded px-3 py-2"
                />
                <select
                  value={plantilla.tarjeta.tipo_tarjeta}
                  onChange={(e) => actualizarCampo('tarjeta', 'tipo_tarjeta', e.target.value)}
                  className="border rounded px-3 py-2"
                >
                  <option value="Visa">Visa</option>
                  <option value="Mastercard">Mastercard</option>
                  <option value="American Express">American Express</option>
                  <option value="Diners">Diners</option>
                </select>
                <input
                  type="text"
                  placeholder="Número de tarjeta"
                  value={plantilla.tarjeta.numero_tarjeta}
                  onChange={(e) => actualizarCampo('tarjeta', 'numero_tarjeta', e.target.value)}
                  className="border rounded px-3 py-2"
                />
                <input
                  type="text"
                  placeholder="MM/YYYY"
                  value={plantilla.tarjeta.fecha_caducidad}
                  onChange={(e) => actualizarCampo('tarjeta', 'fecha_caducidad', e.target.value)}
                  className="border rounded px-3 py-2"
                />
              </div>
            </div>

            {/* Datos del Contrato */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-bold mb-4">📄 Detalles del Contrato</h2>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="number"
                  placeholder="Valor del contrato"
                  value={plantilla.contrato.valor_contrato}
                  onChange={(e) => {
                    actualizarCampo('contrato', 'valor_contrato', parseFloat(e.target.value));
                    actualizarCampoAnidado('autorizacion', 'valor', 'monto_numerico', parseFloat(e.target.value));
                  }}
                  className="border rounded px-3 py-2"
                />
                <input
                  type="number"
                  placeholder="Número de noches"
                  value={plantilla.contrato.numero_noches}
                  onChange={(e) => actualizarCampo('contrato', 'numero_noches', parseInt(e.target.value))}
                  className="border rounded px-3 py-2"
                />
                <input
                  type="number"
                  placeholder="Años de contrato"
                  value={plantilla.contrato.anos_contrato}
                  onChange={(e) => actualizarCampo('contrato', 'anos_contrato', parseInt(e.target.value))}
                  className="border rounded px-3 py-2"
                />
                <input
                  type="text"
                  placeholder="Tarjeta y banco (ej: Visa - Pichincha)"
                  value={plantilla.contrato.tarjeta_y_banco}
                  onChange={(e) => actualizarCampo('contrato', 'tarjeta_y_banco', e.target.value)}
                  className="border rounded px-3 py-2"
                />
              </div>
            </div>

            {/* Autorización/Voucher */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-bold mb-4">✅ Autorización de Pago</h2>
              <div className="grid grid-cols-3 gap-4">
                <input
                  type="text"
                  placeholder="Lote"
                  value={plantilla.autorizacion.voucher.lote}
                  onChange={(e) => actualizarCampoAnidado('autorizacion', 'voucher', 'lote', e.target.value)}
                  className="border rounded px-3 py-2"
                />
                <input
                  type="text"
                  placeholder="Referencia"
                  value={plantilla.autorizacion.voucher.referencia}
                  onChange={(e) => actualizarCampoAnidado('autorizacion', 'voucher', 'referencia', e.target.value)}
                  className="border rounded px-3 py-2"
                />
                <input
                  type="text"
                  placeholder="Aprobación"
                  value={plantilla.autorizacion.voucher.aprobacion}
                  onChange={(e) => actualizarCampoAnidado('autorizacion', 'voucher', 'aprobacion', e.target.value)}
                  className="border rounded px-3 py-2"
                />
              </div>
              <input
                type="text"
                placeholder="Monto en letras (ej: DOS MIL DÓLARES)"
                value={plantilla.autorizacion.valor.monto_letras}
                onChange={(e) => actualizarCampoAnidado('autorizacion', 'valor', 'monto_letras', e.target.value)}
                className="border rounded px-3 py-2 w-full mt-4"
              />
            </div>

            {/* Beneficios */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-bold mb-4">🎁 Beneficios</h2>
              <textarea
                placeholder="Cortesías por asistencia"
                value={plantilla.beneficios.cortesias_por_asistencia}
                onChange={(e) => actualizarCampo('beneficios', 'cortesias_por_asistencia', e.target.value)}
                className="border rounded px-3 py-2 w-full mb-4"
                rows="2"
              />
              <textarea
                placeholder="Ofrecimientos adicionales"
                value={plantilla.beneficios.ofrecimientos_adicionales}
                onChange={(e) => actualizarCampo('beneficios', 'ofrecimientos_adicionales', e.target.value)}
                className="border rounded px-3 py-2 w-full"
                rows="2"
              />
            </div>

            {anexosSeleccionados.length > 0 && (
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">📎 Anexos seleccionados</h2>
                  <span className="text-sm text-gray-500">
                    {anexosSeleccionados.length} anexos
                  </span>
                </div>

                <div className="space-y-6">
                  {anexosSeleccionados.map(anexo => (
                    <div key={anexo.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-semibold text-gray-800">
                          {anexo.id.replace(/-/g, ' ')}
                        </h3>
                        <button
                          type="button"
                          onClick={() => setAnexosSeleccionados(prev => prev.filter(item => item.id !== anexo.id))}
                          className="text-sm text-red-600 hover:text-red-700"
                        >
                          Quitar
                        </button>
                      </div>

                      <div className="space-y-2">
                        {renderAnexoCampos(anexo.id, anexo.data)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Botones */}
            <div className="flex justify-end gap-4">
              <button 
                onClick={() => setVistaActual('lista')}
                className="px-6 py-3 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Cancelar
              </button>
              <button 
                onClick={crearContrato}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Crear Contrato
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Vista: Detalle
  if (vistaActual === 'detalle' && contratoSeleccionado) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Detalle del Contrato</h1>
            <div className="flex gap-2">
              <button 
                onClick={() => verDocumento(contratoSeleccionado.id)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                📄 Ver Documento
              </button>
              <button 
                onClick={() => setVistaActual('lista')}
                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Volver
              </button>
            </div>
          </div>

          {/* Datos Básicos */}
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Número de Contrato</p>
                <p className="text-lg font-bold">{contratoSeleccionado.numero_contrato}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Estado</p>
                <p className="text-lg font-bold">{contratoSeleccionado.estado}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Cliente</p>
                <p className="text-lg">{contratoSeleccionado.first_name} {contratoSeleccionado.last_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Valor</p>
                <p className="text-lg font-bold">${parseFloat(contratoSeleccionado.valor_contrato || 0).toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Noches</p>
                <p className="text-lg">{contratoSeleccionado.numero_noches}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Años</p>
                <p className="text-lg">{contratoSeleccionado.anos_contrato}</p>
              </div>
            </div>
          </div>

          {/* Sección de Adjuntos */}
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h2 className="text-xl font-bold mb-4">📎 Adjuntos (PDFs)</h2>

            {/* Formulario para subir PDF */}
            <div className="mb-6 p-4 bg-gray-50 rounded border-2 border-dashed border-gray-300">
              <h3 className="font-semibold mb-3">Subir nuevo PDF</h3>
              <SubidorPDF 
                contratoId={contratoSeleccionado.id}
                onSubir={(archivo, descripcion, tipo) => subirPDF(contratoSeleccionado.id, archivo, descripcion, tipo)}
                subiendo={subiendo}
              />
            </div>

            {/* Lista de adjuntos */}
            {cargandoAdjuntos ? (
              <p className="text-gray-500">Cargando adjuntos...</p>
            ) : adjuntos.length === 0 ? (
              <p className="text-gray-500 italic">No hay adjuntos subidos para este contrato</p>
            ) : (
              <div className="space-y-2">
                {adjuntos.map((adjunto) => (
                  <div key={adjunto.id} className="flex items-center justify-between p-3 bg-gray-50 rounded border">
                    <div className="flex-1">
                      <p className="font-semibold">{adjunto.nombre_original}</p>
                      {adjunto.descripcion && (
                        <p className="text-sm text-gray-600">{adjunto.descripcion}</p>
                      )}
                      <p className="text-xs text-gray-500">
                        Tipo: {adjunto.tipo_documento} | Tamaño: {(adjunto.tamaño / 1024).toFixed(2)} KB
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => descargarPDF(adjunto.id, adjunto.nombre_original)}
                        className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                      >
                        ⬇ Descargar
                      </button>
                      <button 
                        onClick={() => eliminarAdjunto(adjunto.id)}
                        className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                      >
                        🗑 Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {contratoSeleccionado.datos_completos && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="font-bold mb-2">Datos Completos (JSON)</h3>
              <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto max-h-96">
                {JSON.stringify(contratoSeleccionado.datos_completos, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}

/**
 * Componente para subir PDFs
 */
function SubidorPDF({ contratoId, onSubir, subiendo }) {
  const [archivo, setArchivo] = useState(null);
  const [descripcion, setDescripcion] = useState('');
  const [tipoDocumento, setTipoDocumento] = useState('otro');

  const manejarCambioArchivo = (e) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setArchivo(file);
    } else {
      alert('Por favor selecciona un archivo PDF válido');
      setArchivo(null);
    }
  };

  const manejarEnvio = async (e) => {
    e.preventDefault();
    
    if (!archivo) {
      alert('Por favor selecciona un archivo PDF');
      return;
    }

    await onSubir(archivo, descripcion, tipoDocumento);
    
    // Limpiar formulario
    setArchivo(null);
    setDescripcion('');
    setTipoDocumento('otro');
    
    // Limpiar input
    const fileInput = e.target.querySelector('input[type="file"]');
    if (fileInput) fileInput.value = '';
  };

  return (
    <form onSubmit={manejarEnvio} className="space-y-3">
      <div>
        <label className="block text-sm font-medium mb-1">Seleccionar PDF</label>
        <input 
          type="file"
          accept=".pdf"
          onChange={manejarCambioArchivo}
          disabled={subiendo}
          className="w-full border rounded px-3 py-2"
        />
        {archivo && <p className="text-sm text-green-600 mt-1">✓ {archivo.name}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Tipo de Documento</label>
        <select 
          value={tipoDocumento}
          onChange={(e) => setTipoDocumento(e.target.value)}
          disabled={subiendo}
          className="w-full border rounded px-3 py-2"
        >
          <option value="contrato">Contrato</option>
          <option value="carta_diferimiento">Carta de Diferimiento</option>
          <option value="autorizacion">Autorización</option>
          <option value="beneficios">Beneficios</option>
          <option value="terminos">Términos</option>
          <option value="otro">Otro</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Descripción (opcional)</label>
        <textarea 
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          placeholder="Ej: Documento de prueba, información importante, etc."
          disabled={subiendo}
          className="w-full border rounded px-3 py-2 h-20 resize-none"
        />
      </div>

      <button 
        type="submit"
        disabled={!archivo || subiendo}
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {subiendo ? '⏳ Subiendo...' : '📤 Subir PDF'}
      </button>
    </form>
  );}