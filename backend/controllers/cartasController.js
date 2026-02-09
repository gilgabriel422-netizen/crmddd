const fs = require('fs');
const path = require('path');

// Leer las plantillas
const cartaDiferimiento = require('../carta-diferimiento.json');
const checklistDocumentos = require('../checklist-documentos-entregados.json');
const consentimientoGrabacion = require('../consentimiento-grabacion-imagenes.json');
const contratoPrestacionServicios = require('../contrato-prestacion-servicios.json');
const hojaBienvenida = require('../hoja-bienvenida.json');
const pagareCredito = require('../pagare-credito.json');
const documentoEntendimiento = require('../documento-entendimiento-aceptacion.json');
const solicitudActivacion = require('../solicitud-activacion-contrato.json');
const anexoBeneficiosVentajas = require('../anexo-beneficios-ventajas.json');
const reglasIncorporacion = require('../reglas-incorporacion-documentos.json');

// ===================== CARTA DE DIFERIMIENTO =====================

exports.getCartaDiferimiento = (req, res) => {
  try {
    res.json({
      success: true,
      data: cartaDiferimiento,
      message: 'Plantilla de Carta de Diferimiento obtenida exitosamente'
    });
  } catch (error) {
    console.error('Error obteniendo plantilla:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener la plantilla'
    });
  }
};

exports.generarCartaDiferimiento = (req, res) => {
  try {
    const { cliente, transaccion, empresa } = req.body;

    // Crear una copia de la plantilla
    const carta = JSON.parse(JSON.stringify(cartaDiferimiento));

    // Rellenar con datos si se proporcionan
    if (cliente) {
      carta.cliente = { ...carta.cliente, ...cliente };
    }

    if (transaccion) {
      carta.transaccion = { ...carta.transaccion, ...transaccion };
    }

    if (empresa) {
      carta.empresa = { ...carta.empresa, ...empresa };
    }

    // Agregar fecha actual
    carta.documento.date = new Date().toLocaleDateString('es-ES');

    res.json({
      success: true,
      data: carta,
      message: 'Carta de Diferimiento generada exitosamente'
    });
  } catch (error) {
    console.error('Error generando carta:', error);
    res.status(500).json({
      success: false,
      message: 'Error al generar la carta'
    });
  }
};

// ===================== CHECKLIST DOCUMENTOS ENTREGADOS =====================

exports.getChecklistDocumentos = (req, res) => {
  try {
    res.json({
      success: true,
      data: checklistDocumentos,
      message: 'Plantilla de Checklist de Documentos obtenida exitosamente'
    });
  } catch (error) {
    console.error('Error obteniendo checklist:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener el checklist'
    });
  }
};

exports.generarChecklistDocumentos = (req, res) => {
  try {
    const { 
      documento, 
      cliente, 
      ubicacion, 
      documentos_entregados,
      creado_por 
    } = req.body;

    // Crear una copia de la plantilla
    const checklist = JSON.parse(JSON.stringify(checklistDocumentos));

    // Rellenar con datos si se proporcionan
    if (documento) {
      checklist.documento = { ...checklist.documento, ...documento };
    }

    if (cliente) {
      checklist.cliente = { ...checklist.cliente, ...cliente };
    }

    if (ubicacion) {
      checklist.ubicacion = { ...checklist.ubicacion, ...ubicacion };
    }

    if (documentos_entregados && Array.isArray(documentos_entregados)) {
      documentos_entregados.forEach(doc => {
        const existingDoc = checklist.documentos_entregados.find(d => d.id === doc.id);
        if (existingDoc) {
          Object.assign(existingDoc, doc);
        }
      });
    }

    // Actualizar metadata
    checklist.metadata.creado_por = creado_por || '';
    checklist.metadata.fecha_creacion = new Date().toLocaleDateString('es-ES');

    res.json({
      success: true,
      data: checklist,
      message: 'Checklist de Documentos generado exitosamente'
    });
  } catch (error) {
    console.error('Error generando checklist:', error);
    res.status(500).json({
      success: false,
      message: 'Error al generar el checklist'
    });
  }
};

exports.validarChecklistDocumentos = (req, res) => {
  try {
    const { documentos_entregados } = req.body;

    if (!documentos_entregados || !Array.isArray(documentos_entregados)) {
      return res.status(400).json({
        success: false,
        message: 'documentos_entregados debe ser un array'
      });
    }

    // Validar que todos los documentos están marcados como entregados y firmados
    const validacion = documentos_entregados.map(doc => ({
      id: doc.id,
      nombre: doc.nombre,
      completo: doc.entregado && doc.firma_cliente
    }));

    const todosCompletos = validacion.every(v => v.completo);
    const documentosIncompletos = validacion.filter(v => !v.completo);

    res.json({
      success: true,
      data: {
        todos_completos: todosCompletos,
        total_documentos: validacion.length,
        documentos_completos: validacion.filter(v => v.completo).length,
        documentos_incompletos: documentosIncompletos
      },
      message: todosCompletos 
        ? 'Todos los documentos han sido completados'
        : `${documentosIncompletos.length} documento(s) pendiente(s)`
    });
  } catch (error) {
    console.error('Error validando checklist:', error);
    res.status(500).json({
      success: false,
      message: 'Error al validar el checklist'
    });
  }
};

// ===================== CONSENTIMIENTO GRABACIÓN IMÁGENES =====================

exports.getConsentimientoGrabacion = (req, res) => {
  try {
    res.json({
      success: true,
      data: consentimientoGrabacion,
      message: 'Plantilla de Consentimiento para Grabación obtenida exitosamente'
    });
  } catch (error) {
    console.error('Error obteniendo consentimiento:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener el consentimiento'
    });
  }
};

exports.generarConsentimientoGrabacion = (req, res) => {
  try {
    const { 
      cliente, 
      documento,
      lugar_grabacion,
      ratificacion_voucher,
      autorizaciones,
      creado_por 
    } = req.body;

    // Crear una copia de la plantilla
    const consentimiento = JSON.parse(JSON.stringify(consentimientoGrabacion));

    // Rellenar con datos si se proporcionan
    if (documento) {
      consentimiento.documento = { ...consentimiento.documento, ...documento };
    }

    if (cliente) {
      consentimiento.cliente = { ...consentimiento.cliente, ...cliente };
    }

    if (lugar_grabacion) {
      consentimiento.lugar_grabacion = { ...consentimiento.lugar_grabacion, ...lugar_grabacion };
    }

    if (ratificacion_voucher) {
      consentimiento.ratificacion_voucher = { ...consentimiento.ratificacion_voucher, ...ratificacion_voucher };
    }

    if (autorizaciones) {
      consentimiento.autorizaciones = { ...consentimiento.autorizaciones, ...autorizaciones };
    }

    // Actualizar metadata
    consentimiento.metadata.creado_por = creado_por || '';
    consentimiento.metadata.fecha_creacion = new Date().toLocaleDateString('es-ES');

    // Establecer fecha del documento si no viene
    if (!consentimiento.documento.fecha) {
      consentimiento.documento.fecha = new Date().toLocaleDateString('es-ES');
    }

    res.json({
      success: true,
      data: consentimiento,
      message: 'Consentimiento para Grabación generado exitosamente'
    });
  } catch (error) {
    console.error('Error generando consentimiento:', error);
    res.status(500).json({
      success: false,
      message: 'Error al generar el consentimiento'
    });
  }
};

exports.validarConsentimientoGrabacion = (req, res) => {
  try {
    const { autorizaciones, firmas } = req.body;

    if (!autorizaciones || typeof autorizaciones !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'autorizaciones debe ser un objeto'
      });
    }

    // Validar que todas las autorizaciones estén en true
    const autorizacionesKeys = Object.keys(autorizaciones);
    const todasAutorizadas = autorizacionesKeys.every(key => autorizaciones[key] === true);
    const autorizacionesFaltantes = autorizacionesKeys.filter(key => autorizaciones[key] !== true);

    // Validar firma
    const firmado = firmas && firmas.cliente && firmas.cliente.firma;

    res.json({
      success: true,
      data: {
        todas_autorizaciones_otorgadas: todasAutorizadas,
        firmado: Boolean(firmado),
        consentimiento_valido: todasAutorizadas && firmado,
        autorizaciones_pendientes: autorizacionesFaltantes
      },
      message: todasAutorizadas && firmado 
        ? 'Consentimiento válido y firmado'
        : 'Consentimiento incompleto - faltan autorizaciones o firma'
    });
  } catch (error) {
    console.error('Error validando consentimiento:', error);
    res.status(500).json({
      success: false,
      message: 'Error al validar el consentimiento'
    });
  }
};

// ===================== CONTRATO PRESTACIÓN SERVICIOS =====================

exports.getContratoPrestacionServicios = (req, res) => {
  try {
    res.json({
      success: true,
      data: contratoPrestacionServicios,
      message: 'Plantilla de Contrato de Prestación de Servicios obtenida exitosamente'
    });
  } catch (error) {
    console.error('Error obteniendo contrato:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener el contrato'
    });
  }
};

exports.generarContratoPrestacionServicios = (req, res) => {
  try {
    const {
      documento,
      contratante,
      precio_y_pago,
      beneficios_hospedaje,
      firmas,
      creado_por
    } = req.body;

    // Crear una copia de la plantilla
    const contrato = JSON.parse(JSON.stringify(contratoPrestacionServicios));

    if (documento) {
      contrato.documento = { ...contrato.documento, ...documento };
    }

    if (contratante) {
      contrato.contratante = { ...contrato.contratante, ...contratante };
    }

    if (precio_y_pago) {
      contrato.precio_y_pago = { ...contrato.precio_y_pago, ...precio_y_pago };
    }

    if (beneficios_hospedaje) {
      contrato.beneficios_hospedaje = { ...contrato.beneficios_hospedaje, ...beneficios_hospedaje };
    }

    if (firmas) {
      contrato.firmas = { ...contrato.firmas, ...firmas };
    }

    // Actualizar metadata
    contrato.metadata.creado_por = creado_por || '';
    contrato.metadata.fecha_creacion = new Date().toLocaleDateString('es-ES');

    // Establecer fecha de firma si no viene
    if (!contrato.documento.fecha_firma) {
      contrato.documento.fecha_firma = new Date().toLocaleDateString('es-ES');
    }

    res.json({
      success: true,
      data: contrato,
      message: 'Contrato de Prestación de Servicios generado exitosamente'
    });
  } catch (error) {
    console.error('Error generando contrato:', error);
    res.status(500).json({
      success: false,
      message: 'Error al generar el contrato'
    });
  }
};

exports.validarContratoPrestacionServicios = (req, res) => {
  try {
    const { firmas, precio_y_pago, contratante } = req.body;

    const firmadoEmpresa = firmas && firmas.empresa && firmas.empresa.firma;
    const firmadoContratante = firmas && firmas.contratante && firmas.contratante.firma;

    const valorTotal = precio_y_pago && typeof precio_y_pago.valor_total_usd === 'number'
      ? precio_y_pago.valor_total_usd
      : null;

    const datosContratanteCompletos = Boolean(
      contratante && contratante.nombres_completos && contratante.cedula
    );

    res.json({
      success: true,
      data: {
        firmado_empresa: Boolean(firmadoEmpresa),
        firmado_contratante: Boolean(firmadoContratante),
        datos_contratante_completos: datosContratanteCompletos,
        valor_total_definido: valorTotal !== null,
        contrato_valido: Boolean(firmadoEmpresa && firmadoContratante && datosContratanteCompletos)
      },
      message: firmadoEmpresa && firmadoContratante && datosContratanteCompletos
        ? 'Contrato válido y firmado'
        : 'Contrato incompleto - faltan firmas o datos del contratante'
    });
  } catch (error) {
    console.error('Error validando contrato:', error);
    res.status(500).json({
      success: false,
      message: 'Error al validar el contrato'
    });
  }
};

// ===================== HOJA DE BIENVENIDA =====================

exports.getHojaBienvenida = (req, res) => {
  try {
    res.json({
      success: true,
      data: hojaBienvenida,
      message: 'Hoja de Bienvenida obtenida exitosamente'
    });
  } catch (error) {
    console.error('Error obteniendo hoja de bienvenida:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener la hoja de bienvenida'
    });
  }
};

exports.generarHojaBienvenida = (req, res) => {
  try {
    const { documento, mensaje_bienvenida, creado_por } = req.body;

    // Crear una copia de la plantilla
    const hoja = JSON.parse(JSON.stringify(hojaBienvenida));

    if (documento) {
      hoja.documento = { ...hoja.documento, ...documento };
    }

    if (mensaje_bienvenida) {
      hoja.mensaje_bienvenida = { ...hoja.mensaje_bienvenida, ...mensaje_bienvenida };
    }

    // Actualizar metadata
    hoja.metadata.creado_por = creado_por || '';
    hoja.metadata.fecha_creacion = new Date().toLocaleDateString('es-ES');

    // Establecer fecha de emisión si no viene
    if (!hoja.documento.fecha_emision) {
      hoja.documento.fecha_emision = new Date().toLocaleDateString('es-ES');
    }

    res.json({
      success: true,
      data: hoja,
      message: 'Hoja de Bienvenida generada exitosamente'
    });
  } catch (error) {
    console.error('Error generando hoja de bienvenida:', error);
    res.status(500).json({
      success: false,
      message: 'Error al generar la hoja de bienvenida'
    });
  }
};

// ===================== PAGARÉ CRÉDITO =====================

exports.getPagareCredito = (req, res) => {
  try {
    res.json({
      success: true,
      data: pagareCredito,
      message: 'Plantilla de Pagaré obtenida exitosamente'
    });
  } catch (error) {
    console.error('Error obteniendo pagaré:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener el pagaré'
    });
  }
};

exports.generarPagareCredito = (req, res) => {
  try {
    const {
      documento,
      deudor,
      obligacion,
      plan_pago,
      relacion_contractual,
      firmas,
      creado_por
    } = req.body;

    const pagare = JSON.parse(JSON.stringify(pagareCredito));

    if (documento) {
      pagare.documento = { ...pagare.documento, ...documento };
    }

    if (deudor) {
      pagare.deudor = { ...pagare.deudor, ...deudor };
    }

    if (obligacion) {
      pagare.obligacion = { ...pagare.obligacion, ...obligacion };
    }

    if (plan_pago) {
      pagare.plan_pago = { ...pagare.plan_pago, ...plan_pago };
    }

    if (relacion_contractual) {
      pagare.relacion_contractual = { ...pagare.relacion_contractual, ...relacion_contractual };
    }

    if (firmas) {
      pagare.firmas = { ...pagare.firmas, ...firmas };
    }

    pagare.metadata.creado_por = creado_por || '';
    pagare.metadata.fecha_creacion = new Date().toLocaleDateString('es-ES');

    if (!pagare.documento.fecha_suscripcion) {
      pagare.documento.fecha_suscripcion = new Date().toLocaleDateString('es-ES');
    }

    res.json({
      success: true,
      data: pagare,
      message: 'Pagaré generado exitosamente'
    });
  } catch (error) {
    console.error('Error generando pagaré:', error);
    res.status(500).json({
      success: false,
      message: 'Error al generar el pagaré'
    });
  }
};

exports.validarPagareCredito = (req, res) => {
  try {
    const { firmas, obligacion, deudor } = req.body;

    const firmadoAcreedor = firmas && firmas.acreedor && firmas.acreedor.firma;
    const firmadoDeudor = firmas && firmas.deudor && firmas.deudor.firma;

    const montoDefinido = obligacion && typeof obligacion.monto_total_usd === 'number';
    const datosDeudorCompletos = Boolean(deudor && deudor.nombres_completos && deudor.cedula);

    res.json({
      success: true,
      data: {
        firmado_acreedor: Boolean(firmadoAcreedor),
        firmado_deudor: Boolean(firmadoDeudor),
        datos_deudor_completos: datosDeudorCompletos,
        monto_definido: montoDefinido,
        pagare_valido: Boolean(firmadoAcreedor && firmadoDeudor && datosDeudorCompletos && montoDefinido)
      },
      message: firmadoAcreedor && firmadoDeudor && datosDeudorCompletos && montoDefinido
        ? 'Pagaré válido y firmado'
        : 'Pagaré incompleto - faltan firmas o datos'
    });
  } catch (error) {
    console.error('Error validando pagaré:', error);
    res.status(500).json({
      success: false,
      message: 'Error al validar el pagaré'
    });
  }
};

// ===================== DOCUMENTO ENTENDIMIENTO Y ACEPTACIÓN =====================

exports.getDocumentoEntendimiento = (req, res) => {
  try {
    res.json({
      success: true,
      data: documentoEntendimiento,
      message: 'Plantilla de Documento de Entendimiento obtenida exitosamente'
    });
  } catch (error) {
    console.error('Error obteniendo documento de entendimiento:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener el documento de entendimiento'
    });
  }
};

exports.generarDocumentoEntendimiento = (req, res) => {
  try {
    const { documento, contrato, aceptaciones, beneficiarios, creado_por } = req.body;

    const doc = JSON.parse(JSON.stringify(documentoEntendimiento));

    if (documento) {
      doc.documento = { ...doc.documento, ...documento };
    }

    if (contrato) {
      doc.contrato = { ...doc.contrato, ...contrato };
    }

    if (aceptaciones && Array.isArray(aceptaciones)) {
      aceptaciones.forEach(item => {
        const existing = doc.aceptaciones.find(a => a.id === item.id);
        if (existing) {
          Object.assign(existing, item);
        }
      });
    }

    if (beneficiarios && Array.isArray(beneficiarios)) {
      beneficiarios.forEach((b, index) => {
        if (doc.beneficiarios[index]) {
          doc.beneficiarios[index] = { ...doc.beneficiarios[index], ...b };
        }
      });
    }

    doc.metadata.creado_por = creado_por || '';
    doc.metadata.fecha_creacion = new Date().toLocaleDateString('es-ES');

    if (!doc.documento.fecha) {
      doc.documento.fecha = new Date().toLocaleDateString('es-ES');
    }

    res.json({
      success: true,
      data: doc,
      message: 'Documento de Entendimiento generado exitosamente'
    });
  } catch (error) {
    console.error('Error generando documento de entendimiento:', error);
    res.status(500).json({
      success: false,
      message: 'Error al generar el documento de entendimiento'
    });
  }
};

exports.validarDocumentoEntendimiento = (req, res) => {
  try {
    const { aceptaciones } = req.body;

    if (!aceptaciones || !Array.isArray(aceptaciones)) {
      return res.status(400).json({
        success: false,
        message: 'aceptaciones debe ser un array'
      });
    }

    const validacion = aceptaciones.map(a => ({
      id: a.id,
      aceptado: a.aceptado === true,
      firmado: Boolean(a.firma)
    }));

    const todosAceptados = validacion.every(v => v.aceptado && v.firmado);
    const pendientes = validacion.filter(v => !(v.aceptado && v.firmado));

    res.json({
      success: true,
      data: {
        todos_aceptados: todosAceptados,
        total_items: validacion.length,
        items_pendientes: pendientes
      },
      message: todosAceptados
        ? 'Documento de entendimiento completo'
        : `${pendientes.length} item(s) pendiente(s)`
    });
  } catch (error) {
    console.error('Error validando documento de entendimiento:', error);
    res.status(500).json({
      success: false,
      message: 'Error al validar el documento de entendimiento'
    });
  }
};

// ===================== SOLICITUD ACTIVACIÓN CONTRATO =====================

exports.getSolicitudActivacion = (req, res) => {
  try {
    res.json({
      success: true,
      data: solicitudActivacion,
      message: 'Plantilla de Solicitud de Activación obtenida exitosamente'
    });
  } catch (error) {
    console.error('Error obteniendo solicitud de activación:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener la solicitud de activación'
    });
  }
};

exports.generarSolicitudActivacion = (req, res) => {
  try {
    const { documento, contrato, solicitante, declaraciones, creado_por } = req.body;

    const solicitud = JSON.parse(JSON.stringify(solicitudActivacion));

    if (documento) {
      solicitud.documento = { ...solicitud.documento, ...documento };
    }

    if (contrato) {
      solicitud.contrato = { ...solicitud.contrato, ...contrato };
    }

    if (solicitante) {
      solicitud.solicitante = { ...solicitud.solicitante, ...solicitante };
    }

    if (declaraciones) {
      solicitud.declaraciones = { ...solicitud.declaraciones, ...declaraciones };
    }

    solicitud.metadata.creado_por = creado_por || '';
    solicitud.metadata.fecha_creacion = new Date().toLocaleDateString('es-ES');

    if (!solicitud.documento.fecha_solicitud) {
      solicitud.documento.fecha_solicitud = new Date().toLocaleDateString('es-ES');
    }

    res.json({
      success: true,
      data: solicitud,
      message: 'Solicitud de Activación generada exitosamente'
    });
  } catch (error) {
    console.error('Error generando solicitud de activación:', error);
    res.status(500).json({
      success: false,
      message: 'Error al generar la solicitud de activación'
    });
  }
};

exports.validarSolicitudActivacion = (req, res) => {
  try {
    const { declaraciones, firmas } = req.body;

    if (!declaraciones || typeof declaraciones !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'declaraciones debe ser un objeto'
      });
    }

    const todasDeclaraciones = Object.keys(declaraciones).every(
      key => declaraciones[key] === true
    );

    const firmaSolicitante = firmas && firmas.solicitante && firmas.solicitante.firma;

    res.json({
      success: true,
      data: {
        declaraciones_completas: todasDeclaraciones,
        firmado: Boolean(firmaSolicitante),
        solicitud_valida: Boolean(todasDeclaraciones && firmaSolicitante)
      },
      message: todasDeclaraciones && firmaSolicitante
        ? 'Solicitud de activación válida y firmada'
        : 'Solicitud incompleta - faltan declaraciones o firma'
    });
  } catch (error) {
    console.error('Error validando solicitud de activación:', error);
    res.status(500).json({
      success: false,
      message: 'Error al validar la solicitud de activación'
    });
  }
};

// ===================== ANEXO BENEFICIOS Y VENTAJAS =====================

exports.getAnexoBeneficiosVentajas = (req, res) => {
  try {
    res.json({
      success: true,
      data: anexoBeneficiosVentajas,
      message: 'Plantilla de Anexo de Beneficios obtenida exitosamente'
    });
  } catch (error) {
    console.error('Error obteniendo anexo de beneficios:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener el anexo de beneficios'
    });
  }
};

exports.generarAnexoBeneficiosVentajas = (req, res) => {
  try {
    const { documento, contrato, titular, declaracion_general, creado_por } = req.body;

    const anexo = JSON.parse(JSON.stringify(anexoBeneficiosVentajas));

    if (documento) {
      anexo.documento = { ...anexo.documento, ...documento };
    }

    if (contrato) {
      anexo.contrato = { ...anexo.contrato, ...contrato };
    }

    if (titular) {
      anexo.titular = { ...anexo.titular, ...titular };
    }

    if (declaracion_general) {
      anexo.declaracion_general = { ...anexo.declaracion_general, ...declaracion_general };
    }

    anexo.metadata.creado_por = creado_por || '';
    anexo.metadata.fecha_creacion = new Date().toLocaleDateString('es-ES');

    if (!anexo.documento.fecha_firma) {
      anexo.documento.fecha_firma = new Date().toLocaleDateString('es-ES');
    }

    res.json({
      success: true,
      data: anexo,
      message: 'Anexo de Beneficios generado exitosamente'
    });
  } catch (error) {
    console.error('Error generando anexo de beneficios:', error);
    res.status(500).json({
      success: false,
      message: 'Error al generar el anexo de beneficios'
    });
  }
};

exports.validarAnexoBeneficiosVentajas = (req, res) => {
  try {
    const { firmas, declaracion_general } = req.body;

    const firmaEmpresa = firmas && firmas.empresa && firmas.empresa.firma;
    const firmaTitular = firmas && firmas.titular && firmas.titular.firma;

    const declaracionesCompletas = declaracion_general
      ? Object.keys(declaracion_general).every(key => declaracion_general[key] === true)
      : false;

    res.json({
      success: true,
      data: {
        firmado_empresa: Boolean(firmaEmpresa),
        firmado_titular: Boolean(firmaTitular),
        declaraciones_completas: declaracionesCompletas,
        anexo_valido: Boolean(firmaEmpresa && firmaTitular && declaracionesCompletas)
      },
      message: firmaEmpresa && firmaTitular && declaracionesCompletas
        ? 'Anexo de beneficios válido y firmado'
        : 'Anexo incompleto - faltan firmas o declaraciones'
    });
  } catch (error) {
    console.error('Error validando anexo de beneficios:', error);
    res.status(500).json({
      success: false,
      message: 'Error al validar el anexo de beneficios'
    });
  }
};

// ===================== REGLAS DE INCORPORACIÓN DOCUMENTOS =====================

exports.getReglasIncorporacion = (req, res) => {
  try {
    res.json({
      success: true,
      data: reglasIncorporacion,
      message: 'Reglas de incorporación de documentos obtenidas exitosamente'
    });
  } catch (error) {
    console.error('Error obteniendo reglas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener las reglas'
    });
  }
};

exports.obtenerProximoDocumento = (req, res) => {
  try {
    const { documentos_agregados } = req.body;

    if (!documentos_agregados || !Array.isArray(documentos_agregados)) {
      return res.status(400).json({
        success: false,
        message: 'documentos_agregados debe ser un array de tipos'
      });
    }

    const documentosDisponibles = reglasIncorporacion.reglas_generales.secuencia_minima_obligatoria;
    const proximos = documentosDisponibles.filter(id => !documentos_agregados.includes(id));
    const proximoId = proximos.length > 0 ? proximos[0] : null;
    const proximoDocumento = proximoId 
      ? reglasIncorporacion.reglas_incorporacion_documentos.documentos.find(d => d.id === proximoId)
      : null;

    res.json({
      success: true,
      data: {
        proximo_documento: proximoDocumento,
        documentos_pendientes: proximos,
        flujo_completado: proximos.length === 0
      },
      message: proximoDocumento 
        ? `Próximo documento: ${proximoDocumento.nombre}`
        : 'Flujo de documentos completado'
    });
  } catch (error) {
    console.error('Error obteniendo próximo documento:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener el próximo documento'
    });
  }
};

exports.validarSecuencia = (req, res) => {
  try {
    const { documentos_presentes, tipo_cliente } = req.body;

    if (!documentos_presentes || !Array.isArray(documentos_presentes)) {
      return res.status(400).json({
        success: false,
        message: 'documentos_presentes debe ser un array'
      });
    }

    const reglas = reglasIncorporacion.reglas_generales;
    const obligatorios = reglas.secuencia_minima_obligatoria;
    const faltantes = obligatorios.filter(id => !documentos_presentes.includes(id));
    const secuenciaValida = faltantes.length === 0;

    res.json({
      success: true,
      data: {
        secuencia_valida: secuenciaValida,
        documentos_faltantes: faltantes,
        documentos_faltantes_nombres: faltantes.map(id => {
          const doc = reglasIncorporacion.reglas_incorporacion_documentos.documentos.find(d => d.id === id);
          return doc ? doc.nombre : `Documento ID ${id}`;
        })
      },
      message: secuenciaValida 
        ? 'Secuencia válida - cliente puede usar servicios'
        : `Faltan ${faltantes.length} documento(s) obligatorio(s)`
    });
  } catch (error) {
    console.error('Error validando secuencia:', error);
    res.status(500).json({
      success: false,
      message: 'Error al validar la secuencia'
    });
  }
};

