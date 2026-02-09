const fs = require('fs');
const path = require('path');
const multer = require('multer');
const AdjuntoContrato = require('../models/AdjuntoContrato');

// Configurar multer para subidas de PDF
const uploadsDir = path.join(__dirname, '../uploads');

// Crear directorio si no existe
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('✅ Directorio uploads creado');
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const contratoDir = path.join(uploadsDir, `contrato-${req.params.id}`);
    
    if (!fs.existsSync(contratoDir)) {
      fs.mkdirSync(contratoDir, { recursive: true });
    }
    
    cb(null, contratoDir);
  },
  filename: (req, file, cb) => {
    // Generar nombre único
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    const ext = path.extname(file.originalname);
    cb(null, `${timestamp}-${random}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  // Solo aceptar PDFs
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos PDF'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10 MB máximo
  }
});

const adjuntoController = {
  /**
   * Subir adjunto para un contrato
   */
  subirAdjunto: async (req, res) => {
    try {
      const { id } = req.params;
      const { descripcion, tipo_documento } = req.body;

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No se proporcionó archivo'
        });
      }

      // Ruta relativa para servir el archivo
      const rutaRelativa = `/uploads/contrato-${id}/${req.file.filename}`;
      
      // Crear registro en BD
      const adjunto = await AdjuntoContrato.crear({
        contrato_id: id,
        nombre_original: req.file.originalname,
        nombre_guardado: req.file.filename,
        ruta: rutaRelativa,
        tamaño: req.file.size,
        tipo_mime: 'application/pdf',
        descripcion: descripcion || '',
        tipo_documento: tipo_documento || 'otro',
        usuario_id: req.user?.id || null
      });

      console.log(`✅ PDF subido para contrato ${id}, archivo: ${req.file.originalname}`);

      res.json({
        success: true,
        message: 'Adjunto subido exitosamente',
        data: adjunto
      });
    } catch (error) {
      console.error('❌ Error al subir adjunto:', error);
      
      // Eliminar archivo si hubo error
      if (req.file) {
        fs.unlink(req.file.path, (err) => {
          if (err) console.error('Error al limpiar archivo:', err);
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Error al subir adjunto',
        error: error.message
      });
    }
  },

  /**
   * Obtener adjuntos de un contrato
   */
  obtenerAdjuntos: async (req, res) => {
    try {
      const { id } = req.params;

      const adjuntos = await AdjuntoContrato.getByContratoId(id);

      res.json({
        success: true,
        data: adjuntos,
        count: adjuntos.length
      });
    } catch (error) {
      console.error('❌ Error al obtener adjuntos:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener adjuntos',
        error: error.message
      });
    }
  },

  /**
   * Descargar un adjunto específico
   */
  descargarAdjunto: async (req, res) => {
    try {
      const { id } = req.params;

      const adjunto = await AdjuntoContrato.getById(id);

      if (!adjunto) {
        return res.status(404).json({
          success: false,
          message: 'Adjunto no encontrado'
        });
      }

      const rutaCompleta = path.join(__dirname, '..', adjunto.ruta);

      // Verificar que el archivo existe
      if (!fs.existsSync(rutaCompleta)) {
        return res.status(404).json({
          success: false,
          message: 'Archivo no encontrado en servidor'
        });
      }

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${adjunto.nombre_original}"`);
      res.setHeader('Content-Length', adjunto.tamaño);

      const stream = fs.createReadStream(rutaCompleta);
      stream.pipe(res);

      console.log(`✅ Descarganda adjunto: ${adjunto.nombre_original}`);
    } catch (error) {
      console.error('❌ Error al descargar adjunto:', error);
      res.status(500).json({
        success: false,
        message: 'Error al descargar adjunto',
        error: error.message
      });
    }
  },

  /**
   * Eliminar adjunto
   */
  eliminarAdjunto: async (req, res) => {
    try {
      const { id } = req.params;

      const adjunto = await AdjuntoContrato.getById(id);

      if (!adjunto) {
        return res.status(404).json({
          success: false,
          message: 'Adjunto no encontrado'
        });
      }

      // Eliminar archivo físico
      const rutaCompleta = path.join(__dirname, '..', adjunto.ruta);
      if (fs.existsSync(rutaCompleta)) {
        fs.unlinkSync(rutaCompleta);
      }

      // Eliminar registro de BD
      await AdjuntoContrato.eliminar(id);

      console.log(`✅ Adjunto eliminado: ${adjunto.nombre_original}`);

      res.json({
        success: true,
        message: 'Adjunto eliminado exitosamente'
      });
    } catch (error) {
      console.error('❌ Error al eliminar adjunto:', error);
      res.status(500).json({
        success: false,
        message: 'Error al eliminar adjunto',
        error: error.message
      });
    }
  },

  /**
   * Crear adjunto desde una plantilla (generar PDF automáticamente)
   */
  async crearAdjuntoDesdeePlantilla(req, res) {
    let browser;
    try {
      const { contratoId, plantillaId } = req.params;
      const plantillaContent = req.body.plantilla;

      if (!contratoId || !plantillaId || !plantillaContent) {
        return res.status(400).json({
          success: false,
          message: 'Parámetros requeridos: contratoId, plantillaId y plantilla'
        });
      }

      console.log(`📋 Generando PDF desde plantilla ${plantillaId} para contrato ${contratoId}`);

      // Generar HTML desde la plantilla
      const html = generarHTMLDesdeePlantilla(plantillaId, plantillaContent);

      // Generar PDF con Puppeteer
      const puppeteer = require('puppeteer');
      browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });

      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });

      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20mm',
          right: '15mm',
          bottom: '20mm',
          left: '15mm'
        }
      });

      await browser.close();

      // Crear directorio si no existe
      const contratoDir = path.join(uploadsDir, `contrato-${contratoId}`);
      if (!fs.existsSync(contratoDir)) {
        fs.mkdirSync(contratoDir, { recursive: true });
      }

      // Guardar archiv
      const timestamp = Date.now();
      const random = Math.floor(Math.random() * 10000);
      const nombreGuardado = `${timestamp}-${random}.pdf`;
      const rutaCompleta = path.join(contratoDir, nombreGuardado);

      fs.writeFileSync(rutaCompleta, pdfBuffer);

      // Guardar en base de datos
      const adjunto = await AdjuntoContrato.create({
        contrato_id: contratoId,
        nombre_original: `${plantillaId}.pdf`,
        nombre_guardado: nombreGuardado,
        ruta: `/uploads/contrato-${contratoId}/${nombreGuardado}`,
        tamaño: pdfBuffer.length,
        tipo_documento: mapearTipoPlantilla(plantillaId),
        usuario_id: req.user?.id || null,
        fecha_subida: new Date()
      });

      console.log(`✅ Adjunto creado desde plantilla: ${adjunto.nombre_original}`);

      res.json({
        success: true,
        message: 'Plantilla convertida a PDF y añadida como adjunto',
        adjunto: {
          id: adjunto.id,
          nombre_original: adjunto.nombre_original,
          ruta: adjunto.ruta,
          tamaño: adjunto.tamaño
        }
      });
    } catch (error) {
      console.error('❌ Error al crear adjunto desde plantilla:', error);
      if (browser) await browser.close();
      res.status(500).json({
        success: false,
        message: 'Error al generar PDF desde plantilla',
        error: error.message
      });
    }
  }
};

/**
 * Generar HTML desde una plantilla JSON
 */
function generarHTMLDesdeePlantilla(plantillaId, contenido) {
  // Función para renderizar un objeto como tabla HTML
  const renderizarSeccion = (titulo, datos, index) => {
    const filas = Object.entries(datos)
      .map(([clave, valor]) => {
        const valorTexto = typeof valor === 'object' ? JSON.stringify(valor) : (valor || '');
        return `
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; font-weight: 500; background-color: #f5f5f5; width: 30%;">
              ${clave.replace(/_/g, ' ').toUpperCase()}
            </td>
            <td style="padding: 8px; border: 1px solid #ddd;">
              ${valorTexto}
            </td>
          </tr>
        `;
      })
      .join('');

    return `
      <div style="margin-top: 20px;">
        <h3 style="color: #1a365d; border-bottom: 2px solid #4299e1; padding-bottom: 8px;">
          ${titulo}
        </h3>
        <table style="width: 100%; border-collapse: collapse;">
          ${filas}
        </table>
      </div>
    `;
  };

  const secciones = Object.entries(contenido)
    .map(([clave, valor], index) => {
      if (typeof valor === 'object' && valor !== null) {
        const tituloFormato = clave
          .split('_')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
        return renderizarSeccion(tituloFormato, valor, index);
      }
      return '';
    })
    .join('');

  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Plantilla - ${plantillaId}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          background-color: #f9f9f9;
        }
        .container {
          max-width: 900px;
          margin: 0 auto;
          padding: 30px;
          background-color: white;
          line-height: 1.8;
        }
        .header {
          text-align: center;
          border-bottom: 3px solid #4299e1;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .header h1 {
          color: #1a365d;
          font-size: 24px;
          margin-bottom: 5px;
        }
        .header p {
          color: #666;
          font-size: 14px;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #ddd;
          font-size: 12px;
          color: #999;
          text-align: center;
        }
        h3 {
          color: #1a365d;
          margin-top: 20px;
          margin-bottom: 10px;
          font-size: 16px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 15px;
        }
        td {
          padding: 10px;
          border: 1px solid #ddd;
        }
        @media print {
          body {
            background-color: white;
          }
          .container {
            max-width: 100%;
            padding: 0;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Documento - ${plantillaId.replace(/-/g, ' ').toUpperCase()}</h1>
          <p>Generado automáticamente por Innovation Business</p>
        </div>

        ${secciones}

        <div class="footer">
          <p>Este documento ha sido generado automáticamente y forma parte del sistema de gestión de contratos.</p>
          <p>Fecha de generación: ${new Date().toLocaleDateString('es-ES')}</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Mapear ID de plantilla a tipo de documento
 */
function mapearTipoPlantilla(plantillaId) {
  const mapeo = {
    'contrato-basico': 'contrato',
    'carta-diferimiento': 'carta_diferimiento',
    'consentimiento-grabacion': 'autorizacion',
    'contrato-servicios': 'contrato',
    'pagare': 'otro',
    'documento-entendimiento': 'terminos',
    'hoja-bienvenida': 'otro',
    'checklist-documentos': 'otro',
    'anexo-beneficios': 'beneficios'
  };
  return mapeo[plantillaId] || 'otro';
}

module.exports = {
  adjuntoController,
  upload
};
