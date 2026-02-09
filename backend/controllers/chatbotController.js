// Base de datos de preguntas frecuentes
const faqDatabase = [
  // 🧳 Información general
  {
    id: 1,
    category: 'Información General',
    keywords: ['servicios', 'ofrecen', 'qué'],
    question: '¿Qué servicios ofrece la agencia?',
    answer: 'Ofrecemos paquetes turísticos nacionales e internacionales, vuelos, hoteles, tours, traslados y asesoría personalizada para tus viajes. 🌍✈️'
  },
  {
    id: 2,
    category: 'Información General',
    keywords: ['destinos', 'dónde', 'viajar', 'países'],
    question: '¿En qué destinos trabajan?',
    answer: 'Trabajamos con destinos nacionales e internacionales. Puedes consultarnos por el destino que desees y te ayudamos a armar tu viaje ideal. ✈️'
  },
  {
    id: 3,
    category: 'Paquetes Turísticos',
    keywords: ['paquete', 'incluye', 'qué'],
    question: '¿Qué incluyen los paquetes turísticos?',
    answer: 'Nuestros paquetes pueden incluir vuelo, hotel, traslados, tours y asistencia. El contenido exacto depende del paquete elegido. 📦'
  },
  {
    id: 4,
    category: 'Paquetes Turísticos',
    keywords: ['personalizar', 'medida', 'custom'],
    question: '¿Puedo personalizar un paquete turístico?',
    answer: 'Sí 😊 Podemos armar un paquete personalizado según tu presupuesto, fechas y destino. Escríbenos tus preferencias.'
  },
  {
    id: 5,
    category: 'Paquetes Turísticos',
    keywords: ['todo incluido', 'all inclusive'],
    question: '¿Tienen paquetes todo incluido?',
    answer: 'Sí, contamos con paquetes todo incluido en varios destinos. Escríbenos el destino que te interesa. 🏖️'
  },
  {
    id: 6,
    category: 'Precios y Pagos',
    keywords: ['precio', 'costo', 'cuánto', 'valor'],
    question: '¿Cuáles son los precios de los paquetes?',
    answer: 'Los precios varían según destino, fechas y disponibilidad. Si deseas una cotización exacta, indícanos tu destino y fechas. 💰'
  },
  {
    id: 7,
    category: 'Precios y Pagos',
    keywords: ['pago', 'forma', 'método', 'tarjeta'],
    question: '¿Qué métodos de pago aceptan?',
    answer: 'Aceptamos transferencias bancarias, tarjetas de crédito y débito, y otros métodos según el país. 💳'
  },
  {
    id: 8,
    category: 'Precios y Pagos',
    keywords: ['cuota', 'parcial', 'mensual'],
    question: '¿Puedo pagar en cuotas?',
    answer: 'Sí, ofrecemos pagos en cuotas con tarjeta de crédito, sujeto a condiciones. 📅'
  },
  {
    id: 9,
    category: 'Reservas',
    keywords: ['reservar', 'cómo', 'booking'],
    question: '¿Cómo puedo reservar un paquete?',
    answer: 'Puedes reservar escribiéndonos por este chat. Un asesor te guiará en todo el proceso. 😊'
  },
  {
    id: 10,
    category: 'Reservas',
    keywords: ['anticipación', 'cuándo', 'tiempo'],
    question: '¿Con cuánta anticipación debo reservar?',
    answer: 'Recomendamos reservar con al menos 1 mes de anticipación para mejores precios y disponibilidad. 📆'
  },
  {
    id: 11,
    category: 'Hoteles y Vuelos',
    keywords: ['vuelo', 'incluido', 'pasaje'],
    question: '¿Los vuelos están incluidos en los paquetes?',
    answer: 'Algunos paquetes incluyen vuelos y otros no. Esto se especifica en cada oferta. 🛫'
  },
  {
    id: 12,
    category: 'Hoteles y Vuelos',
    keywords: ['hotel', 'alojamiento', 'hospedaje'],
    question: '¿Puedo elegir el hotel?',
    answer: 'Sí, puedes elegir el hotel según disponibilidad y categoría. 🏨'
  },
  {
    id: 13,
    category: 'Documentación',
    keywords: ['pasaporte', 'visa', 'documentos'],
    question: '¿Necesito pasaporte o visa?',
    answer: 'Depende del destino. Te asesoramos sobre los requisitos migratorios antes de viajar. 📄'
  },
  {
    id: 14,
    category: 'Documentación',
    keywords: ['visa', 'ayuda', 'trámite'],
    question: '¿La agencia ayuda con la visa?',
    answer: 'Te brindamos orientación y acompañamiento en el proceso de visa, según el país. 📋'
  },
  {
    id: 15,
    category: 'Cambios y Cancelaciones',
    keywords: ['cancelar', 'cancelación', 'reembolso'],
    question: '¿Puedo cancelar mi viaje?',
    answer: 'Las cancelaciones están sujetas a las políticas del proveedor. Escríbenos para revisar tu caso. 🔄'
  },
  {
    id: 16,
    category: 'Cambios y Cancelaciones',
    keywords: ['cambiar', 'fecha', 'modificar'],
    question: '¿Puedo cambiar la fecha del viaje?',
    answer: 'Sí, dependiendo de la disponibilidad y condiciones del paquete. 📅'
  },
  {
    id: 17,
    category: 'Atención al Cliente',
    keywords: ['asesor', 'hablar', 'contacto'],
    question: '¿Cómo puedo hablar con un asesor?',
    answer: 'Un asesor puede atenderte en cualquier momento. Déjanos tu consulta y te responderemos pronto. 👨‍💼'
  },
  {
    id: 18,
    category: 'Atención al Cliente',
    keywords: ['horario', 'atienden', 'abierto'],
    question: '¿Cuál es su horario de atención?',
    answer: 'Atendemos de lunes a viernes de 9:00 a 18:00 y sábados de 9:00 a 13:00. ⏰'
  }
];

// Función para calcular similitud entre strings
const calcularSimilitud = (str1, str2) => {
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();
  
  if (s1 === s2) return 1;
  
  const limpiar = (s) => s.replace(/[^a-záéíóúñ\s]/g, '').trim();
  const s1Limpio = limpiar(s1);
  const s2Limpio = limpiar(s2);
  
  const palabras1 = s1Limpio.split(/\s+/).filter(p => p.length > 2);
  const palabras2 = s2Limpio.split(/\s+/).filter(p => p.length > 2);
  
  if (palabras1.length === 0 || palabras2.length === 0) return 0;
  
  let coincidencias = 0;
  palabras1.forEach(p1 => {
    palabras2.forEach(p2 => {
      if (p1 === p2 || p1.includes(p2) || p2.includes(p1)) {
        coincidencias++;
        return;
      }
      const chars1 = p1.split('').filter(c => p2.includes(c));
      if (chars1.length / Math.max(p1.length, p2.length) > 0.7) {
        coincidencias += 0.5;
      }
    });
  });
  
  return coincidencias / Math.max(palabras1.length, palabras2.length);
};

// Función para responder preguntas generales
const respuestaGeneralista = (pregunta) => {
  const p = pregunta.toLowerCase();
  
  if (p.includes('horario') || p.includes('atienden')) {
    return 'Nuestro horario es:\n\n⏰ Lunes a Viernes: 9:00 AM - 6:00 PM\n⏰ Sábado: 9:00 AM - 2:00 PM\n\n📱 WhatsApp 24/7: +593 99 922 2210';
  }
  
  if (p.includes('ubicación') || p.includes('dirección') || p.includes('dónde están')) {
    return 'Nos ubicamos en:\n\n📍 Calle Principal 123, Quito - Ecuador\n\n📱 WhatsApp: +593 99 922 2210\n📧 Email: info@innovationbusiness.com';
  }
  
  if (p.includes('empresa') || p.includes('quién es') || p.includes('nosotros')) {
    return 'Somos una agencia de viajes con +10 años de experiencia. ✈️';
  }
  
  return null;
};

// Exportar funciones del controlador
exports.responderPregunta = async (req, res) => {
  try {
    const { pregunta } = req.body;

    if (!pregunta || pregunta.trim().length === 0) {
      return res.status(400).json({ 
        error: 'Por favor escribe una pregunta',
        respuesta: '¿En qué puedo ayudarte? Cuéntame sobre tus dudas o necesidades turísticas.'
      });
    }

    const preguntaLimpia = pregunta.toLowerCase().trim();
    let mejorRespuesta = null;
    let mejorPuntaje = 0;

    // Buscar la mejor coincidencia en FAQ
    faqDatabase.forEach(faq => {
      // Verificar coincidencia por palabras clave
      const palabrasCoinciden = faq.keywords.some(keyword => 
        preguntaLimpia.includes(keyword)
      );

      if (palabrasCoinciden) {
        const similitud = calcularSimilitud(pregunta, faq.question);
        if (similitud > mejorPuntaje) {
          mejorPuntaje = similitud;
          mejorRespuesta = faq;
        }
      }
    });

    // Si no hay coincidencia exacta, buscar por similitud general
    if (mejorPuntaje < 0.25) {
      faqDatabase.forEach(faq => {
        const similitud = calcularSimilitud(pregunta, faq.question);
        if (similitud > mejorPuntaje) {
          mejorPuntaje = similitud;
          mejorRespuesta = faq;
        }
      });
    }

    // Si encontramos una respuesta en FAQ con buena similitud
    if (mejorRespuesta && mejorPuntaje > 0.15) {
      return res.json({
        respuesta: mejorRespuesta.answer,
        preguntaRelacionada: mejorRespuesta.question,
        confianza: Math.round(mejorPuntaje * 100)
      });
    }

    // Intentar responder con respuestas generales
    const respuestaGeneral = respuestaGeneralista(pregunta);
    if (respuestaGeneral) {
      return res.json({
        respuesta: respuestaGeneral,
        confianza: 70
      });
    }

    // Respuesta por defecto amigable
    res.json({
      respuesta: '😊 Entiendo tu pregunta. Aunque no tengo una respuesta específica preparada, nuestro equipo puede ayudarte mejor.\n\n📱 Contáctanos por:\n• WhatsApp: +593 99 922 2210 (respuesta rápida)\n• Email: info@innovationbusiness.com\n• O llama durante nuestro horario: Lunes-Viernes 9AM-6PM\n\n¿Hay algo más en lo que pueda ayudarte?',
      confianza: 50
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener todas las preguntas frecuentes
exports.obtenerFAQ = async (req, res) => {
  try {
    const faqs = faqDatabase.map(faq => ({
      id: faq.id,
      question: faq.question,
      answer: faq.answer
    }));
    res.json(faqs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
