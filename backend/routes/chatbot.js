const express = require('express');
const router = express.Router();
const chatbotController = require('../controllers/chatbotController');

// Endpoint para procesar preguntas del chatbot
router.post('/pregunta', chatbotController.responderPregunta);

// Endpoint para obtener todas las preguntas frecuentes
router.get('/faq', chatbotController.obtenerFAQ);

module.exports = router;
