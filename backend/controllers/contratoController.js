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
   * ✅ Incluye pagaré, snapshot cliente, comercial/sala y datos_completos enriquecido.
   */
  async crearDesdePlantilla(req, res) {
    try {
      console.log('✅ POST /contratos/plantilla recibido');

      const plantilla = req.body;

      // ===== Helpers
      const toNum = (v, def = 0) => {
        const n = Number(v);
        return Number.isFinite(n) ? n : def;
      };

      const calcularEdad = (fechaISO) => {
        if (!fechaISO) return null;
        const n = new Date(fechaISO);
        if (Number.isNaN(n.getTime())) return null;
        const hoy = new Date();
        let edad = hoy.getFullYear() - n.getFullYear();
        const m = hoy.getMonth() - n.getMonth();
        if (m < 0 || (m === 0 && hoy.getDate() < n.getDate())) edad--;
        return edad;
      };

      // ===== 1) cliente_id robusto
      const rawClienteId =
        plantilla?.cliente_id ??
        plantilla?.contrato?.cliente_id ??
        plantilla?.cliente?.id ??
        plantilla?.clienteId ??
        plantilla?.clienteID;

      const cliente_id = Number(rawClienteId);

      if (!cliente_id) {
        return res.status(400).json({
          success: false,
          message: 'cliente_id es requerido'
        });
      }

      // ===== 2) Validar cliente existe
      const clienteDB = await Cliente.getById(cliente_id);
      if (!clienteDB) {
        return res.status(400).json({
          success: false,
          message: 'cliente_id no existe'
        });
      }

      // ===== 3) Pagaré / Financiero
      const valor_contrato = toNum(plantilla?.contrato?.valor_contrato, 0);
      const valor_pagado = toNum(plantilla?.contrato?.valor_pagado ?? plantilla?.valor_pagado, 0);
      const saldo_pendiente = Math.max(valor_contrato - valor_pagado, 0);

      const pagareObj = plantilla?.contrato?.pagare || {};
      const pagare_numero =
        pagareObj?.numero ??
        plantilla?.pagare_numero ??
        null;

      const pagare_fecha_vencimiento =
        pagareObj?.fecha_vencimiento ??
        plantilla?.pagare_fecha_vencimiento ??
        null;

      const pagare_total = toNum(
        pagareObj?.total ?? plantilla?.pagare_total,
        saldo_pendiente
      );

      const pagare_cuotas = toNum(
        pagareObj?.cuotas ?? plantilla?.pagare_cuotas,
        0
      );

      const pagare_valor_cuota = toNum(
        pagareObj?.valor_cuota ?? plantilla?.pagare_valor_cuota,
        0
      );

      // ===== 4) Comercial / Sala
      const comercial = plantilla?.comercial || {};
      const vendedor_nombre = comercial?.vendedor_nombre ?? plantilla?.vendedor_nombre ?? null;
      const jefe_sala = comercial?.jefe_sala ?? plantilla?.jefe_sala ?? null;
      const codigo_sala = comercial?.codigo_sala ?? plantilla?.codigo_sala ?? null;

      // ===== 5) Snapshot cliente (prioriza lo que vino del formulario, si no usa BD)
      const clienteForm = plantilla?.cliente || {};
      const cliente_email = clienteForm?.email ?? clienteDB?.email ?? null;
      const cliente_direccion = clienteForm?.direccion ?? clienteDB?.direccion ?? null;

      const cliente_fecha_nacimiento =
        clienteForm?.fecha_nacimiento ??
        clienteDB?.fecha_nacimiento ??
        null;

      const cliente_edad =
        clienteForm?.edad ??
        calcularEdad(cliente_fecha_nacimiento);

      // ===== 6) datos_completos enriquecido (para PDF y auditoría)
      const datos_completos = {
        ...plantilla,
        cliente_id,
        comercial: {
          ...(plantilla.comercial || {}),
          vendedor_nombre,
          jefe_sala,
          codigo_sala
        },
        contrato: {
          ...(plantilla.contrato || {}),
          valor_contrato,
          valor_pagado,
          saldo_pendiente,
          pagare: {
            ...(plantilla.contrato?.pagare || {}),
            numero: pagare_numero,
            fecha_vencimiento: pagare_fecha_vencimiento,
            total: pagare_total,
            cuotas: pagare_cuotas,
            valor_cuota: pagare_valor_cuota
          }
        },
        cliente: {
          ...(plantilla.cliente || {}),
          email: cliente_email,
          direccion: cliente_direccion,
          fecha_nacimiento: cliente_fecha_nacimiento,
          edad: cliente_edad
        }
      };

      // ===== 7) contratoData para INSERT
      const contratoData = {
        cliente_id,
        numero_contrato: `CONT-${Date.now()}`,
        valor_contrato,
        fecha_contrato: plantilla?.contrato?.fecha ? new Date(plantilla.contrato.fecha) : new Date(),
        creado_por: req.user?.email || 'sistema',
        estado: 'pendiente',
        datos_completos,

        // columnas financieras/pagaré
        valor_pagado,
        saldo_pendiente,
        pagare_numero,
        pagare_fecha_vencimiento,
        pagare_total,
        pagare_cuotas,
        pagare_valor_cuota,

        // columnas comercial/sala
        vendedor_nombre,
        jefe_sala,
        codigo_sala,

        // snapshot cliente
        cliente_email,
        cliente_direccion,
        cliente_fecha_nacimiento,
        cliente_edad
      };

      const contrato = await ContratoViaje.create(contratoData);
      console.log('✅ Contrato guardado en BD:', contrato.id);

      return res.status(201).json({
        success: true,
        message: 'Contrato creado exitosamente',
        data: contrato
      });
    } catch (error) {
      console.error('❌ Error al crear contrato:', error);
      return res.status(500).json({
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

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Length', pdfBuffer.length);
      res.setHeader('Content-Disposition', `inline; filename="contrato-${id}.pdf"`);
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Accept-Ranges', 'bytes');

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