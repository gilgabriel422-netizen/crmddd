const ContratoViaje = require('../models/ContratoViaje');
const AutorizacionPago = require('../models/AutorizacionPago');
const Tarjeta = require('../models/Tarjeta');
const Cliente = require('../models/Cliente');
const PlantillaGenerator = require('../utils/plantillaGenerator');

/**
 * Controlador para gestión de contratos de viaje
 */
const contratoController = {
  /**
   * Obtener todos los contratos
   */
  async obtenerTodos(req, res) {
    try {
      const contratos = await ContratoViaje.getAll();
      res.json({
        success: true,
        data: contratos,
        count: contratos.length
      });
    } catch (error) {
      console.error('Error al obtener contratos:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener contratos',
        error: error.message
      });
    }
  },

  /**
   * Obtener contrato por ID
   */
  async obtenerPorId(req, res) {
    try {
      const { id } = req.params;
      const contrato = await ContratoViaje.getById(id);

      if (!contrato) {
        return res.status(404).json({
          success: false,
          message: 'Contrato no encontrado'
        });
      }

      res.json({
        success: true,
        data: contrato
      });
    } catch (error) {
      console.error('Error al obtener contrato:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener contrato',
        error: error.message
      });
    }
  },

  /**
   * Obtener contratos de un cliente
   */
  async obtenerPorCliente(req, res) {
    try {
      const { clienteId } = req.params;
      const contratos = await ContratoViaje.getByClienteId(clienteId);

      res.json({
        success: true,
        data: contratos,
        count: contratos.length
      });
    } catch (error) {
      console.error('Error al obtener contratos del cliente:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener contratos del cliente',
        error: error.message
      });
    }
  },

  /**
   * Crear contrato completo desde plantilla
   */
  async crearDesdePlantilla(req, res) {
    try {
      const plantilla = req.body;

      // 1. Validar cliente existe o crearlo
      let cliente_id = plantilla.cliente_id;
      
      if (!cliente_id && plantilla.cliente) {
        // Crear cliente si no existe
        const clienteData = {
          first_name: plantilla.cliente.nombres_completos?.split(' ')[0] || '',
          last_name: plantilla.cliente.nombres_completos?.split(' ').slice(1).join(' ') || '',
          document_number: plantilla.cliente.cedula,
          phone: plantilla.cliente.telefono,
          ciudad: plantilla.cliente.ciudad,
          pais: plantilla.cliente.pais,
          status: 'activo'
        };
        
        const clienteCreado = await Cliente.create(clienteData);
        cliente_id = clienteCreado.id;
      }

      // 2. Crear tarjeta si existe
      let tarjeta_id = null;
      if (plantilla.tarjeta && plantilla.tarjeta.numero_tarjeta) {
        const tarjetaCreada = await Tarjeta.create({
          cliente_id,
          nombre_tarjetahabiente: plantilla.tarjeta.nombre_tarjetahabiente,
          tipo_tarjeta: plantilla.tarjeta.tipo_tarjeta,
          numero_tarjeta: plantilla.tarjeta.numero_tarjeta,
          fecha_caducidad: plantilla.tarjeta.fecha_caducidad,
          es_principal: true
        });
        tarjeta_id = tarjetaCreada.id;
      }

      // 3. Crear autorización de pago
      let autorizacion_pago_id = null;
      if (plantilla.autorizacion) {
        const autorizacionCreada = await AutorizacionPago.create({
          cliente_id,
          tarjeta_id,
          empresa_razon_social: plantilla.autorizacion.empresa?.razon_social,
          empresa_nombre_comercial: plantilla.autorizacion.empresa?.nombre_comercial,
          empresa_ruc: plantilla.autorizacion.empresa?.ruc,
          monto_numerico: plantilla.autorizacion.valor?.monto_numerico || 0,
          monto_letras: plantilla.autorizacion.valor?.monto_letras,
          motivo: plantilla.autorizacion.motivo,
          voucher_lote: plantilla.autorizacion.voucher?.lote,
          voucher_referencia: plantilla.autorizacion.voucher?.referencia,
          voucher_aprobacion: plantilla.autorizacion.voucher?.aprobacion,
          voucher_modalidad: plantilla.autorizacion.voucher?.modalidad,
          fecha_autorizacion: plantilla.autorizacion.fecha_autorizacion,
          estado: 'pendiente',
          metadata: plantilla.metadata || {}
        });
        autorizacion_pago_id = autorizacionCreada.id;
      }

      // 4. Crear contrato
      const contratoData = {
        cliente_id,
        autorizacion_pago_id,
        fecha_contrato: plantilla.contrato?.fecha || new Date(),
        valor_contrato: plantilla.contrato?.valor_contrato || plantilla.autorizacion?.valor?.monto_numerico || 0,
        anos_contrato: plantilla.contrato?.anos_contrato,
        tarjeta_y_banco: plantilla.contrato?.tarjeta_y_banco,
        numero_noches: plantilla.contrato?.numero_noches,
        pagare_numero: plantilla.contrato?.pagare?.numero,
        pagare_fecha_vencimiento: plantilla.contrato?.pagare?.fecha_vencimiento,
        estadia_internacional: plantilla.estadia?.internacional,
        estadia_nacional: plantilla.estadia?.nacional,
        cortesias_por_asistencia: plantilla.beneficios?.cortesias_por_asistencia,
        ofrecimientos_adicionales: plantilla.beneficios?.ofrecimientos_adicionales,
        aceptacion_cliente: plantilla.aceptacion_cliente,
        datos_completos: plantilla, // Guardar plantilla completa
        creado_por: plantilla.metadata?.creado_por || req.user?.email || 'sistema',
        metadata: plantilla.metadata || {}
      };

      const contrato = await ContratoViaje.create(contratoData);

      res.status(201).json({
        success: true,
        message: 'Contrato creado exitosamente',
        data: contrato
      });
    } catch (error) {
      console.error('Error al crear contrato:', error);
      res.status(500).json({
        success: false,
        message: 'Error al crear contrato',
        error: error.message
      });
    }
  },

  /**
   * Crear contrato simple
   */
  async crear(req, res) {
    try {
      const contrato = await ContratoViaje.create(req.body);

      res.status(201).json({
        success: true,
        message: 'Contrato creado exitosamente',
        data: contrato
      });
    } catch (error) {
      console.error('Error al crear contrato:', error);
      res.status(500).json({
        success: false,
        message: 'Error al crear contrato',
        error: error.message
      });
    }
  },

  /**
   * Actualizar contrato
   */
  async actualizar(req, res) {
    try {
      const { id } = req.params;
      const contrato = await ContratoViaje.update(id, req.body);

      if (!contrato) {
        return res.status(404).json({
          success: false,
          message: 'Contrato no encontrado'
        });
      }

      res.json({
        success: true,
        message: 'Contrato actualizado exitosamente',
        data: contrato
      });
    } catch (error) {
      console.error('Error al actualizar contrato:', error);
      res.status(500).json({
        success: false,
        message: 'Error al actualizar contrato',
        error: error.message
      });
    }
  },

  /**
   * Firmar contrato
   */
  async firmar(req, res) {
    try {
      const { id } = req.params;
      const { firma, nombre, fecha } = req.body;

      if (!firma || !nombre) {
        return res.status(400).json({
          success: false,
          message: 'Firma y nombre son requeridos'
        });
      }

      const contrato = await ContratoViaje.firmar(id, { firma, nombre, fecha });

      if (!contrato) {
        return res.status(404).json({
          success: false,
          message: 'Contrato no encontrado'
        });
      }

      res.json({
        success: true,
        message: 'Contrato firmado exitosamente',
        data: contrato
      });
    } catch (error) {
      console.error('Error al firmar contrato:', error);
      res.status(500).json({
        success: false,
        message: 'Error al firmar contrato',
        error: error.message
      });
    }
  },

  /**
   * Activar contrato
   */
  async activar(req, res) {
    try {
      const { id } = req.params;
      const contrato = await ContratoViaje.activar(id);

      if (!contrato) {
        return res.status(404).json({
          success: false,
          message: 'Contrato no encontrado'
        });
      }

      res.json({
        success: true,
        message: 'Contrato activado exitosamente',
        data: contrato
      });
    } catch (error) {
      console.error('Error al activar contrato:', error);
      res.status(500).json({
        success: false,
        message: 'Error al activar contrato',
        error: error.message
      });
    }
  },

  /**
   * Cancelar contrato
   */
  async cancelar(req, res) {
    try {
      const { id } = req.params;
      const { motivo } = req.body;

      const contrato = await ContratoViaje.cancelar(id, motivo);

      if (!contrato) {
        return res.status(404).json({
          success: false,
          message: 'Contrato no encontrado'
        });
      }

      res.json({
        success: true,
        message: 'Contrato cancelado exitosamente',
        data: contrato
      });
    } catch (error) {
      console.error('Error al cancelar contrato:', error);
      res.status(500).json({
        success: false,
        message: 'Error al cancelar contrato',
        error: error.message
      });
    }
  },

  /**
   * Eliminar contrato
   */
  async eliminar(req, res) {
    try {
      const { id } = req.params;
      const contrato = await ContratoViaje.delete(id);

      if (!contrato) {
        return res.status(404).json({
          success: false,
          message: 'Contrato no encontrado'
        });
      }

      res.json({
        success: true,
        message: 'Contrato eliminado exitosamente'
      });
    } catch (error) {
      console.error('Error al eliminar contrato:', error);
      res.status(500).json({
        success: false,
        message: 'Error al eliminar contrato',
        error: error.message
      });
    }
  },

  /**
   * Obtener contratos por estado
   */
  async obtenerPorEstado(req, res) {
    try {
      const { estado } = req.params;
      const contratos = await ContratoViaje.getByEstado(estado);

      res.json({
        success: true,
        data: contratos,
        count: contratos.length
      });
    } catch (error) {
      console.error('Error al obtener contratos por estado:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener contratos por estado',
        error: error.message
      });
    }
  },

  /**
   * Obtener estadísticas de contratos
   */
  async obtenerEstadisticas(req, res) {
    try {
      const estadisticas = await ContratoViaje.getEstadisticas();

      res.json({
        success: true,
        data: estadisticas
      });
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener estadísticas',
        error: error.message
      });
    }
  },

  /**
   * Generar plantilla rellena del contrato
   */
  async generarPlantilla(req, res) {
    try {
      const { id } = req.params;
      const contrato = await ContratoViaje.getById(id);

      if (!contrato) {
        return res.status(404).json({
          success: false,
          message: 'Contrato no encontrado'
        });
      }

      // Generar plantilla con datos del contrato
      const plantilla = PlantillaGenerator.generarPlantilla(contrato);

      res.json({
        success: true,
        data: plantilla
      });
    } catch (error) {
      console.error('Error al generar plantilla:', error);
      res.status(500).json({
        success: false,
        message: 'Error al generar plantilla',
        error: error.message
      });
    }
  },

  /**
   * Generar documento HTML del contrato
   */
  async generarDocumento(req, res) {
    try {
      const { id } = req.params;
      const contrato = await ContratoViaje.getById(id);

      if (!contrato) {
        return res.status(404).json({
          success: false,
          message: 'Contrato no encontrado'
        });
      }

      // Generar plantilla y HTML
      const plantilla = PlantillaGenerator.generarPlantilla(contrato);
      const html = PlantillaGenerator.generarHTML(plantilla);

      res.setHeader('Content-Type', 'text/html');
      res.send(html);
    } catch (error) {
      console.error('Error al generar documento:', error);
      res.status(500).json({
        success: false,
        message: 'Error al generar documento',
        error: error.message
      });
    }
  },

  /**
   * Generar documento PDF del contrato
   */
  async generarDocumentoPdf(req, res) {
    let browser;
    try {
      const { id } = req.params;
      console.log('📄 Generando PDF para contrato ID:', id);
      
      const contrato = await ContratoViaje.getById(id);
      console.log('📋 Contrato obtenido:', contrato ? 'SÍ' : 'NO');

      if (!contrato) {
        console.log('❌ Contrato no encontrado');
        return res.status(404).json({
          success: false,
          message: 'Contrato no encontrado'
        });
      }

      console.log('🔧 Generando plantilla...');
      const plantilla = PlantillaGenerator.generarPlantilla(contrato);
      console.log('🌐 Generando HTML...');
      const html = PlantillaGenerator.generarHTML(plantilla);
      console.log('✅ HTML generado, longitud:', html.length);

      console.log('🚀 Iniciando Puppeteer...');
      const puppeteer = require('puppeteer');
      browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      console.log('✅ Puppeteer iniciado');

      const page = await browser.newPage();
      console.log('📄 Página creada, cargando contenido...');
      await page.setContent(html, { waitUntil: 'networkidle0' });
      console.log('✅ Contenido cargado, generando PDF...');
      
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
      console.log('✅ PDF generado, tamaño:', pdfBuffer.length, 'bytes');

      // Configurar headers correctamente
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Length', pdfBuffer.length);
      res.setHeader('Content-Disposition', `inline; filename="contrato-${id}.pdf"`);
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Accept-Ranges', 'bytes');
      
      // Enviar el buffer directamente
      res.end(pdfBuffer, 'binary');
      console.log('✅ PDF enviado al cliente');
    } catch (error) {
      console.error('❌ ERROR COMPLETO al generar PDF:', error);
      console.error('❌ Stack trace:', error.stack);
      res.status(500).json({
        success: false,
        message: 'Error al generar PDF',
        error: error.message,
        stack: error.stack
      });
    } finally {
      if (browser) {
        console.log('🔒 Cerrando navegador...');
        await browser.close();
      }
    }
  }
};

module.exports = contratoController;
