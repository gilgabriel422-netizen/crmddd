const fs = require('fs');
const path = require('path');

const plantillasController = {
  /**
   * Listar todas las plantillas disponibles
   */
  listarPlantillas: (req, res) => {
    try {
      console.log('📋 SOLICITUD: GET /api/plantillas');
      
      // Archivos de plantillas en el backend
      const plantillasDisponibles = [
        {
          id: 'contrato-basico',
          nombre: 'Contrato de Viaje',
          descripcion: 'Plantilla estándar para contratos de servicios turísticos',
          archivo: 'plantilla-contrato-ejemplo.json'
        },
        {
          id: 'autorizacion-cobro-pacifico',
          nombre: 'Autorización de Cobro Pacífico',
          descripcion: 'Autorización de cobro con tarjeta en Banco del Pacífico',
          archivo: 'autorizacion-cobro-pacifico.json'
        },
        {
          id: 'carta-diferimiento',
          nombre: 'Carta de Diferimiento',
          descripcion: 'Documento para solicitud de diferimiento de pagos',
          archivo: 'carta-diferimiento.json'
        },
        {
          id: 'consentimiento-grabacion',
          nombre: 'Consentimiento de Grabación',
          descripcion: 'Autorización para grabar imágenes y video',
          archivo: 'consentimiento-grabacion-imagenes.json'
        },
        {
          id: 'contrato-servicios',
          nombre: 'Contrato de Prestación de Servicios',
          descripcion: 'Acuerdo completo de servicios turísticos',
          archivo: 'contrato-prestacion-servicios.json'
        },
        {
          id: 'pagare',
          nombre: 'Pagaré de Crédito',
          descripcion: 'Documento de crédito y compromisos de pago',
          archivo: 'pagare-credito.json'
        },
        {
          id: 'documento-entendimiento',
          nombre: 'Documento de Entendimiento',
          descripcion: 'Confirmación de términos y condiciones',
          archivo: 'documento-entendimiento-aceptacion.json'
        },
        {
          id: 'hoja-bienvenida',
          nombre: 'Hoja de Bienvenida',
          descripcion: 'Documento informativo de bienvenida al cliente',
          archivo: 'hoja-bienvenida.json'
        },
        {
          id: 'checklist-documentos',
          nombre: 'Checklist de Documentos',
          descripcion: 'Lista de documentos requeridos para el contrato',
          archivo: 'checklist-documentos-entregados.json'
        },
        {
          id: 'solicitud-activacion',
          nombre: 'Solicitud de Activación',
          descripcion: 'Solicitud de activación del contrato',
          archivo: 'solicitud-activacion-contrato.json'
        },
        {
          id: 'anexo-beneficios',
          nombre: 'Anexo de Beneficios',
          descripcion: 'Detalle de beneficios y ventajas del contrato',
          archivo: 'anexo-beneficios-ventajas.json'
        }
      ];

      console.log('✅ Plantillas disponibles listadas');

      res.json({
        success: true,
        data: plantillasDisponibles,
        count: plantillasDisponibles.length
      });
    } catch (error) {
      console.error('❌ Error al listar plantillas:', error);
      res.status(500).json({
        success: false,
        message: 'Error al listar plantillas',
        error: error.message
      });
    }
  },

  /**
   * Obtener contenido de una plantilla específica
   */
  obtenerPlantilla: (req, res) => {
    try {
      const { id } = req.params;

      const plantillasMap = {
        'contrato-basico': 'plantilla-contrato-ejemplo.json',
        'autorizacion-cobro-pacifico': 'autorizacion-cobro-pacifico.json',
        'carta-diferimiento': 'carta-diferimiento.json',
        'consentimiento-grabacion': 'consentimiento-grabacion-imagenes.json',
        'contrato-servicios': 'contrato-prestacion-servicios.json',
        'pagare': 'pagare-credito.json',
        'documento-entendimiento': 'documento-entendimiento-aceptacion.json',
        'hoja-bienvenida': 'hoja-bienvenida.json',
        'checklist-documentos': 'checklist-documentos-entregados.json',
        'solicitud-activacion': 'solicitud-activacion-contrato.json',
        'anexo-beneficios': 'anexo-beneficios-ventajas.json'
      };

      const archivo = plantillasMap[id];

      if (!archivo) {
        return res.status(404).json({
          success: false,
          message: 'Plantilla no encontrada'
        });
      }

      const rutaArchivo = path.join(__dirname, '..', archivo);

      if (!fs.existsSync(rutaArchivo)) {
        return res.status(404).json({
          success: false,
          message: 'Archivo de plantilla no existe'
        });
      }

      const contenido = fs.readFileSync(rutaArchivo, 'utf-8');
      const plantilla = JSON.parse(contenido);

      console.log(`✅ Plantilla ${id} obtenida`);

      res.json({
        success: true,
        data: plantilla,
        id
      });
    } catch (error) {
      console.error('❌ Error al obtener plantilla:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener plantilla',
        error: error.message
      });
    }
  }
};

module.exports = plantillasController;
