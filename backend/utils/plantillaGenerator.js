/**
 * Generador de Plantilla de Contrato
 * Rellena automáticamente la plantilla con datos del contrato
 */

class PlantillaContratoGenerator {
  /**
   * Genera la plantilla completa del contrato con todos los datos
   */
  static generarPlantilla(contratoData) {
    const toNum = (v, def = 0) => {
      const n = Number(v);
      return Number.isFinite(n) ? n : def;
    };

    const safeStr = (v) => (v === null || v === undefined ? '' : String(v));

    // datos_completos puede venir como JSON string desde la BD (depende cómo lo guardes)
    const datosCompletos = this.parseMaybeJSON(contratoData?.datos_completos);

    // ===== Cliente: mezcla contratoData + datosCompletos (si existe)
    const clienteDC = datosCompletos?.cliente || {};
    const clienteEmail =
      clienteDC.email ??
      contratoData.email ??
      contratoData.cliente_email ??
      '';

    const clienteDireccion =
      clienteDC.direccion ??
      contratoData.direccion ??
      contratoData.cliente_direccion ??
      '';

    const clienteFechaNacimiento =
      clienteDC.fecha_nacimiento ??
      contratoData.fecha_nacimiento ??
      contratoData.cliente_fecha_nacimiento ??
      '';

    const clienteEdad =
      toNum(clienteDC.edad ?? contratoData.edad ?? contratoData.cliente_edad, 0) ||
      this.calcularEdad(clienteFechaNacimiento) ||
      '';

    // ===== Comercial / Sala
    const comercialDC = datosCompletos?.comercial || {};
    const vendedorNombre =
      comercialDC.vendedor_nombre ??
      contratoData.vendedor_nombre ??
      '';

    const jefeSala =
      comercialDC.jefe_sala ??
      contratoData.jefe_sala ??
      '';

    const codigoSala =
      comercialDC.codigo_sala ??
      contratoData.codigo_sala ??
      '';

    // ===== Valores financieros
    const valorContrato = toNum(
      datosCompletos?.contrato?.valor_contrato ?? contratoData.valor_contrato,
      0
    );

    const valorPagado = toNum(
      datosCompletos?.contrato?.valor_pagado ?? contratoData.valor_pagado,
      0
    );

    const saldoPendiente = Math.max(
      toNum(
        datosCompletos?.contrato?.saldo_pendiente ?? contratoData.saldo_pendiente,
        valorContrato - valorPagado
      ),
      0
    );

    // ===== Pagaré
    const pagareDC = datosCompletos?.contrato?.pagare || {};
    const pagareNumero =
      pagareDC.numero ??
      contratoData.pagare_numero ??
      '';

    const pagareFechaVenc =
      pagareDC.fecha_vencimiento ??
      contratoData.pagare_fecha_vencimiento ??
      '';

    const pagareTotal =
      toNum(pagareDC.total ?? contratoData.pagare_total, saldoPendiente);

    const pagareCuotas =
      toNum(pagareDC.cuotas ?? contratoData.pagare_cuotas, 0);

    const pagareValorCuota =
      toNum(pagareDC.valor_cuota ?? contratoData.pagare_valor_cuota, 0);

    const plantilla = {
      cliente: {
        nombres_completos: this.extraerNombresCompletos(contratoData),
        ciudad: contratoData.ciudad || '',
        pais: contratoData.pais || 'Ecuador',
        telefono: contratoData.phone || contratoData.telefono || '',
        cedula: contratoData.document_number || contratoData.cedula || '',

        // ✅ Nuevos:
        email: clienteEmail,
        direccion: clienteDireccion,
        fecha_nacimiento: clienteFechaNacimiento,
        edad: clienteEdad
      },

      comercial: {
        vendedor_nombre: vendedorNombre,
        jefe_sala: jefeSala,
        codigo_sala: codigoSala
      },

      tarjeta: this.extraerDatosTarjeta({
        ...contratoData,
        datos_completos: datosCompletos
      }),

      autorizacion: {
        empresa: {
          razon_social: 'INNOVATION BUSSINES',
          nombre_comercial: 'Innovation Bussines',
          ruc: '1793230574001'
        },
        valor: {
          monto_numerico: valorContrato,
          monto_letras: this.numeroALetras(valorContrato)
        },
        motivo: 'Prestación de servicios turísticos nacionales e internacionales',
        voucher: this.extraerVoucher({
          ...contratoData,
          datos_completos: datosCompletos
        }),
        fecha_autorizacion: contratoData.fecha_autorizacion || new Date().toISOString()
      },

      contrato: {
        fecha: contratoData.fecha_contrato || new Date().toISOString().split('T')[0],
        numero_contrato: contratoData.numero_contrato || '',
        valor_contrato: valorContrato,
        valor_pagado: valorPagado,
        saldo_pendiente: saldoPendiente,

        anos_contrato: contratoData.anos_contrato || contratoData.anos || 2,
        tarjeta_y_banco: contratoData.tarjeta_y_banco || '',
        numero_noches: contratoData.numero_noches || contratoData.total_nights || 10,

        pagare: {
          numero: safeStr(pagareNumero),
          fecha_vencimiento: safeStr(pagareFechaVenc),
          total: pagareTotal,
          cuotas: pagareCuotas,
          valor_cuota: pagareValorCuota
        }
      },

      estadia: this.extraerEstadia({
        ...contratoData,
        datos_completos: datosCompletos
      }),

      beneficios: {
        cortesias_por_asistencia:
          contratoData.cortesias_por_asistencia ||
          contratoData.international_bonus ||
          'Cortesías incluidas según contrato',
        ofrecimientos_adicionales:
          contratoData.ofrecimientos_adicionales ||
          'Beneficios adicionales según categoría de cliente'
      },

      aceptacion_cliente: this.extraerAceptacion(contratoData),

      metadata: {
        creado_por: contratoData.creado_por || 'sistema',
        fecha_creacion: contratoData.fecha_creacion || new Date().toISOString(),
        estado: contratoData.estado || 'pendiente'
      }
    };

    return plantilla;
  }

  // ===== Helpers JSON / fechas
  static parseMaybeJSON(v) {
    if (!v) return null;
    if (typeof v === 'object') return v;
    if (typeof v !== 'string') return null;
    try {
      return JSON.parse(v);
    } catch {
      return null;
    }
  }

  static calcularEdad(fechaISO) {
    if (!fechaISO) return null;
    const n = new Date(fechaISO);
    if (Number.isNaN(n.getTime())) return null;
    const hoy = new Date();
    let edad = hoy.getFullYear() - n.getFullYear();
    const m = hoy.getMonth() - n.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < n.getDate())) edad--;
    return edad;
  }

  /**
   * Extrae nombres completos del cliente
   */
  static extraerNombresCompletos(data) {
    if (data.first_name && data.last_name) {
      return `${data.first_name} ${data.last_name}`;
    }
    return data.nombres_completos || '';
  }

  /**
   * Extrae datos de tarjeta
   */
  static extraerDatosTarjeta(data) {
    const dc = this.parseMaybeJSON(data?.datos_completos);

    // Si tiene datos_completos guardados
    if (dc?.tarjeta) {
      return dc.tarjeta;
    }

    // Si tiene tarjetas en JSON
    if (data.tarjetas && typeof data.tarjetas === 'string') {
      try {
        const tarjetas = JSON.parse(data.tarjetas);
        if (Array.isArray(tarjetas) && tarjetas.length > 0) {
          return {
            nombre_tarjetahabiente: tarjetas[0].nombre || '',
            tipo_tarjeta: data.tipo_tarjeta || 'Visa',
            numero_tarjeta: tarjetas[0].numero || '',
            fecha_caducidad: tarjetas[0].vencimiento || ''
          };
        }
      } catch (e) {
        console.error('Error parseando tarjetas:', e);
      }
    }

    // Datos básicos
    return {
      nombre_tarjetahabiente: this.extraerNombresCompletos(data),
      tipo_tarjeta: data.tipo_tarjeta || 'Visa',
      numero_tarjeta: '',
      fecha_caducidad: ''
    };
  }

  /**
   * Extrae datos del voucher
   */
  static extraerVoucher(data) {
    const dc = this.parseMaybeJSON(data?.datos_completos);

    if (dc?.autorizacion?.voucher) {
      return dc.autorizacion.voucher;
    }

    return {
      lote: data.lote || '',
      referencia: data.datafast || data.referencia || '',
      aprobacion: data.aprobacion || '',
      modalidad: 'venta'
    };
  }

  /**
   * Extrae datos de estadía
   */
  static extraerEstadia(data) {
    const dc = this.parseMaybeJSON(data?.datos_completos);

    // Prioridad: datos_completos
    if (dc?.estadia) return dc.estadia;

    if (data.estadia_internacional || data.estadia_nacional) {
      return {
        internacional:
          typeof data.estadia_internacional === 'string'
            ? JSON.parse(data.estadia_internacional)
            : data.estadia_internacional || { incluye: true, numero_pax: 2 },
        nacional:
          typeof data.estadia_nacional === 'string'
            ? JSON.parse(data.estadia_nacional)
            : data.estadia_nacional || { incluye: true, numero_pax: 2 }
      };
    }

    return {
      internacional: {
        incluye: data.international_bonus === 'Sí' || data.international_bonus === true,
        numero_pax: 2
      },
      nacional: {
        incluye: true,
        numero_pax: 2
      }
    };
  }

  /**
   * Extrae aceptación del cliente
   */
  static extraerAceptacion(data) {
    if (data.aceptacion_cliente) {
      return typeof data.aceptacion_cliente === 'string'
        ? JSON.parse(data.aceptacion_cliente)
        : data.aceptacion_cliente;
    }

    return {
      firma: '',
      nombre: this.extraerNombresCompletos(data),
      fecha: ''
    };
  }

  /**
   * Convierte número a letras (español)
   * ✅ FIX: corregido el bug de "const entero" que se reasignaba.
   */
  static numeroALetras(numero) {
    if (!Number.isFinite(Number(numero))) numero = 0;
    numero = Number(numero);

    if (numero === 0) return 'CERO DÓLARES AMERICANOS';

    let entero = Math.floor(numero);
    const decimal = Math.round((numero - entero) * 100);

    let resultado = '';

    // Miles
    if (entero >= 1000) {
      const miles = Math.floor(entero / 1000);
      if (miles === 1) resultado += 'MIL ';
      else resultado += this.convertirMenorMil(miles) + ' MIL ';
      entero = entero % 1000;
    }

    // Centenas, decenas y unidades
    if (entero > 0) resultado += this.convertirMenorMil(entero);

    resultado = resultado.trim();

    if (decimal > 0) {
      resultado += ` CON ${decimal}/100`;
    }

    return resultado + ' DÓLARES AMERICANOS';
  }

  static convertirMenorMil(numero) {
    const unidades = ['', 'UNO', 'DOS', 'TRES', 'CUATRO', 'CINCO', 'SEIS', 'SIETE', 'OCHO', 'NUEVE'];
    const decenas = ['', '', 'VEINTE', 'TREINTA', 'CUARENTA', 'CINCUENTA', 'SESENTA', 'SETENTA', 'OCHENTA', 'NOVENTA'];
    const especiales = ['DIEZ', 'ONCE', 'DOCE', 'TRECE', 'CATORCE', 'QUINCE', 'DIECISÉIS', 'DIECISIETE', 'DIECIOCHO', 'DIECINUEVE'];
    const centenas = ['', 'CIENTO', 'DOSCIENTOS', 'TRESCIENTOS', 'CUATROCIENTOS', 'QUINIENTOS', 'SEISCIENTOS', 'SETECIENTOS', 'OCHOCIENTOS', 'NOVECIENTOS'];

    let resultado = '';

    // Centenas
    const c = Math.floor(numero / 100);
    if (c > 0) {
      if (numero === 100) return 'CIEN';
      resultado += centenas[c] + ' ';
      numero = numero % 100;
    }

    // Decenas y unidades
    if (numero >= 10 && numero < 20) {
      resultado += especiales[numero - 10];
    } else {
      const d = Math.floor(numero / 10);
      const u = numero % 10;

      if (d > 0) {
        resultado += decenas[d];
        if (u > 0) resultado += ' Y ' + unidades[u];
      } else if (u > 0) {
        resultado += unidades[u];
      }
    }

    return resultado.trim();
  }

  /**
   * Genera HTML del contrato para imprimir/PDF
   */
  static generarHTML(plantilla) {
    const safe = (v) => (v === null || v === undefined ? '' : String(v));
    const money = (n) => {
      const x = Number(n);
      if (!Number.isFinite(x)) return '0.00';
      return x.toFixed(2);
    };
    const dateEC = (d) => {
      if (!d) return '';
      const dt = new Date(d);
      if (Number.isNaN(dt.getTime())) return safe(d);
      return dt.toLocaleDateString('es-EC');
    };
    const dateTimeEC = (d) => {
      if (!d) return '';
      const dt = new Date(d);
      if (Number.isNaN(dt.getTime())) return safe(d);
      return dt.toLocaleString('es-EC');
    };

    const ult4 = (s) => {
      const str = safe(s);
      if (!str) return '';
      return str.slice(-4);
    };

    return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Contrato de Viaje - ${safe(plantilla.contrato.numero_contrato)}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; color: #333; }
    .header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #0066cc; padding-bottom: 20px; }
    .logo { font-size: 24px; font-weight: bold; color: #0066cc; }
    .section { margin: 25px 0; padding: 15px; border: 1px solid #ddd; border-radius: 8px; background: #f9f9f9; }
    .section-title { font-weight: bold; font-size: 18px; color: #0066cc; margin-bottom: 15px; border-bottom: 2px solid #0066cc; padding-bottom: 5px; }
    .field { margin: 10px 0; padding: 8px; background: white; border-radius: 4px; }
    .field-label { font-weight: bold; color: #555; display: inline-block; min-width: 200px; }
    .field-value { color: #000; }
    .footer { margin-top: 40px; text-align: center; border-top: 2px solid #0066cc; padding-top: 20px; }
    .firma-box { margin: 40px 0; padding: 20px; border: 2px dashed #999; text-align: center; }
    @media print { body { margin: 20px; } .section { page-break-inside: avoid; } }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">${safe(plantilla.autorizacion.empresa.nombre_comercial)}</div>
    <div>${safe(plantilla.autorizacion.empresa.razon_social)}</div>
    <div>RUC: ${safe(plantilla.autorizacion.empresa.ruc)}</div>
    <h2>CONTRATO DE SERVICIOS TURÍSTICOS</h2>
    <div><strong>N° ${safe(plantilla.contrato.numero_contrato)}</strong></div>
  </div>

  <div class="section">
    <div class="section-title">📋 DATOS DEL CLIENTE</div>
    <div class="field"><span class="field-label">Nombre Completo:</span> <span class="field-value">${safe(plantilla.cliente.nombres_completos)}</span></div>
    <div class="field"><span class="field-label">Cédula/Pasaporte:</span> <span class="field-value">${safe(plantilla.cliente.cedula)}</span></div>
    <div class="field"><span class="field-label">Teléfono:</span> <span class="field-value">${safe(plantilla.cliente.telefono)}</span></div>
    <div class="field"><span class="field-label">Email:</span> <span class="field-value">${safe(plantilla.cliente.email)}</span></div>
    <div class="field"><span class="field-label">Dirección:</span> <span class="field-value">${safe(plantilla.cliente.direccion)}</span></div>
    <div class="field"><span class="field-label">Fecha de nacimiento:</span> <span class="field-value">${dateEC(plantilla.cliente.fecha_nacimiento)}</span></div>
    <div class="field"><span class="field-label">Edad:</span> <span class="field-value">${safe(plantilla.cliente.edad)}</span></div>
    <div class="field"><span class="field-label">Ciudad:</span> <span class="field-value">${safe(plantilla.cliente.ciudad)}</span></div>
    <div class="field"><span class="field-label">País:</span> <span class="field-value">${safe(plantilla.cliente.pais)}</span></div>
  </div>

  <div class="section">
    <div class="section-title">👥 VENTAS / SALA</div>
    <div class="field"><span class="field-label">Vendedor:</span> <span class="field-value">${safe(plantilla.comercial?.vendedor_nombre)}</span></div>
    <div class="field"><span class="field-label">Jefe de sala:</span> <span class="field-value">${safe(plantilla.comercial?.jefe_sala)}</span></div>
    <div class="field"><span class="field-label">Código de sala:</span> <span class="field-value">${safe(plantilla.comercial?.codigo_sala)}</span></div>
  </div>

  <div class="section">
    <div class="section-title">💳 DATOS DE PAGO</div>
    <div class="field"><span class="field-label">Tarjetahabiente:</span> <span class="field-value">${safe(plantilla.tarjeta.nombre_tarjetahabiente)}</span></div>
    <div class="field"><span class="field-label">Tipo de Tarjeta:</span> <span class="field-value">${safe(plantilla.tarjeta.tipo_tarjeta)}</span></div>
    <div class="field"><span class="field-label">Última tarjeta:</span> <span class="field-value">${ult4(plantilla.tarjeta.numero_tarjeta) ? `**** ${ult4(plantilla.tarjeta.numero_tarjeta)}` : ''}</span></div>
  </div>

  <div class="section">
    <div class="section-title">📄 DETALLES DEL CONTRATO</div>
    <div class="field"><span class="field-label">Fecha del Contrato:</span> <span class="field-value">${dateEC(plantilla.contrato.fecha)}</span></div>
    <div class="field"><span class="field-label">Valor del Contrato:</span> <span class="field-value">$${money(plantilla.contrato.valor_contrato)} USD</span></div>
    <div class="field"><span class="field-label">Valor en Letras:</span> <span class="field-value">${safe(plantilla.autorizacion.valor.monto_letras)}</span></div>
    <div class="field"><span class="field-label">Duración:</span> <span class="field-value">${safe(plantilla.contrato.anos_contrato)} años</span></div>
    <div class="field"><span class="field-label">Número de Noches:</span> <span class="field-value">${safe(plantilla.contrato.numero_noches)} noches</span></div>
    <div class="field"><span class="field-label">Tarjeta y Banco:</span> <span class="field-value">${safe(plantilla.contrato.tarjeta_y_banco)}</span></div>
  </div>

  <div class="section">
    <div class="section-title">💰 RESUMEN FINANCIERO</div>
    <div class="field"><span class="field-label">Total contrato:</span> <span class="field-value">$${money(plantilla.contrato.valor_contrato)} USD</span></div>
    <div class="field"><span class="field-label">Valor pagado:</span> <span class="field-value">$${money(plantilla.contrato.valor_pagado)} USD</span></div>
    <div class="field"><span class="field-label">Saldo pendiente:</span> <span class="field-value">$${money(plantilla.contrato.saldo_pendiente)} USD</span></div>
  </div>

  <div class="section">
    <div class="section-title">✅ AUTORIZACIÓN DE PAGO</div>
    <div class="field"><span class="field-label">Lote:</span> <span class="field-value">${safe(plantilla.autorizacion.voucher.lote)}</span></div>
    <div class="field"><span class="field-label">Referencia:</span> <span class="field-value">${safe(plantilla.autorizacion.voucher.referencia)}</span></div>
    <div class="field"><span class="field-label">Aprobación:</span> <span class="field-value">${safe(plantilla.autorizacion.voucher.aprobacion)}</span></div>
    <div class="field"><span class="field-label">Modalidad:</span> <span class="field-value">${safe(plantilla.autorizacion.voucher.modalidad)}</span></div>
    <div class="field"><span class="field-label">Fecha Autorización:</span> <span class="field-value">${dateTimeEC(plantilla.autorizacion.fecha_autorizacion)}</span></div>
  </div>

  <div class="section">
    <div class="section-title">🏨 ESTADÍA INCLUIDA</div>
    <div class="field">
      <span class="field-label">Estadía Internacional:</span>
      <span class="field-value">
        ${plantilla.estadia.internacional.incluye ? '✓ Incluida' : '✗ No incluida'} - ${safe(plantilla.estadia.internacional.numero_pax)} personas
      </span>
    </div>
    <div class="field">
      <span class="field-label">Estadía Nacional:</span>
      <span class="field-value">
        ${plantilla.estadia.nacional.incluye ? '✓ Incluida' : '✗ No incluida'} - ${safe(plantilla.estadia.nacional.numero_pax)} personas
      </span>
    </div>
  </div>

  <div class="section">
    <div class="section-title">🎁 BENEFICIOS</div>
    <div class="field"><span class="field-label">Cortesías por Asistencia:</span> <div class="field-value">${safe(plantilla.beneficios.cortesias_por_asistencia)}</div></div>
    <div class="field"><span class="field-label">Ofrecimientos Adicionales:</span> <div class="field-value">${safe(plantilla.beneficios.ofrecimientos_adicionales)}</div></div>
  </div>

  <div class="section">
    <div class="section-title">💳 PAGARÉ</div>
    <div class="field"><span class="field-label">Número de Pagaré:</span> <span class="field-value">${safe(plantilla.contrato.pagare.numero)}</span></div>
    <div class="field"><span class="field-label">Fecha de Vencimiento:</span> <span class="field-value">${dateEC(plantilla.contrato.pagare.fecha_vencimiento)}</span></div>
    <div class="field"><span class="field-label">Total pagaré:</span> <span class="field-value">$${money(plantilla.contrato.pagare.total)} USD</span></div>
    <div class="field"><span class="field-label">Cuotas:</span> <span class="field-value">${safe(plantilla.contrato.pagare.cuotas)}</span></div>
    <div class="field"><span class="field-label">Valor cuota:</span> <span class="field-value">$${money(plantilla.contrato.pagare.valor_cuota)} USD</span></div>
  </div>

  <div class="section">
    <div class="section-title">📝 TÉRMINOS Y CONDICIONES</div>
    <div class="field-value" style="padding: 15px;">
      <p><strong>Motivo:</strong> ${safe(plantilla.autorizacion.motivo)}</p>
      <p>El cliente autoriza a ${safe(plantilla.autorizacion.empresa.nombre_comercial)}
      para realizar el cargo correspondiente por el valor especificado en este contrato.</p>
      <p>El cliente reconoce haber leído y aceptado los términos y condiciones del presente contrato.</p>
    </div>
  </div>

  <div class="firma-box">
    <p><strong>ACEPTACIÓN DEL CLIENTE</strong></p>
    <p>________________________________</p>
    <p><strong>${safe(plantilla.cliente.nombres_completos)}</strong></p>
    <p>C.I.: ${safe(plantilla.cliente.cedula)}</p>
    <p>Fecha: ${new Date().toLocaleDateString('es-EC')}</p>
  </div>

  <div class="footer">
    <p><small>Documento generado electrónicamente el ${new Date().toLocaleString('es-EC')}</small></p>
    <p><small>Estado: ${safe(plantilla.metadata.estado).toUpperCase()}</small></p>
  </div>
</body>
</html>
    `;
  }
}

module.exports = PlantillaContratoGenerator;