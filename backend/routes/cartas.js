const express = require('express');
const router = express.Router();
const cartasController = require('../controllers/cartasController');

// ===================== CARTA DE DIFERIMIENTO =====================
router.get('/diferimiento', cartasController.getCartaDiferimiento);
router.post('/diferimiento', cartasController.generarCartaDiferimiento);

// ===================== CHECKLIST DOCUMENTOS ENTREGADOS =====================
router.get('/checklist-documentos', cartasController.getChecklistDocumentos);
router.post('/checklist-documentos', cartasController.generarChecklistDocumentos);
router.post('/checklist-documentos/validar', cartasController.validarChecklistDocumentos);

// ===================== CONSENTIMIENTO GRABACIÓN IMÁGENES =====================
router.get('/consentimiento-grabacion', cartasController.getConsentimientoGrabacion);
router.post('/consentimiento-grabacion', cartasController.generarConsentimientoGrabacion);
router.post('/consentimiento-grabacion/validar', cartasController.validarConsentimientoGrabacion);

// ===================== CONTRATO PRESTACIÓN SERVICIOS =====================
router.get('/contrato-prestacion-servicios', cartasController.getContratoPrestacionServicios);
router.post('/contrato-prestacion-servicios', cartasController.generarContratoPrestacionServicios);
router.post('/contrato-prestacion-servicios/validar', cartasController.validarContratoPrestacionServicios);

// ===================== HOJA DE BIENVENIDA =====================
router.get('/hoja-bienvenida', cartasController.getHojaBienvenida);
router.post('/hoja-bienvenida', cartasController.generarHojaBienvenida);

// ===================== PAGARÉ CRÉDITO =====================
router.get('/pagare-credito', cartasController.getPagareCredito);
router.post('/pagare-credito', cartasController.generarPagareCredito);
router.post('/pagare-credito/validar', cartasController.validarPagareCredito);

// ===================== DOCUMENTO ENTENDIMIENTO =====================
router.get('/documento-entendimiento', cartasController.getDocumentoEntendimiento);
router.post('/documento-entendimiento', cartasController.generarDocumentoEntendimiento);
router.post('/documento-entendimiento/validar', cartasController.validarDocumentoEntendimiento);

// ===================== SOLICITUD ACTIVACIÓN CONTRATO =====================
router.get('/solicitud-activacion', cartasController.getSolicitudActivacion);
router.post('/solicitud-activacion', cartasController.generarSolicitudActivacion);
router.post('/solicitud-activacion/validar', cartasController.validarSolicitudActivacion);

// ===================== ANEXO BENEFICIOS Y VENTAJAS =====================
router.get('/anexo-beneficios', cartasController.getAnexoBeneficiosVentajas);
router.post('/anexo-beneficios', cartasController.generarAnexoBeneficiosVentajas);
router.post('/anexo-beneficios/validar', cartasController.validarAnexoBeneficiosVentajas);

// ===================== REGLAS DE INCORPORACIÓN DOCUMENTOS =====================
router.get('/reglas-incorporacion', cartasController.getReglasIncorporacion);
router.post('/reglas-incorporacion/proximo-documento', cartasController.obtenerProximoDocumento);
router.post('/reglas-incorporacion/validar-secuencia', cartasController.validarSecuencia);

module.exports = router;
