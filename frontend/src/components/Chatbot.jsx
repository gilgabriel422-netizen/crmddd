import React, { useState, useRef, useEffect } from 'react';
import { Send, MessageCircle, X, Minus } from 'lucide-react';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      text: '✨ ¡Hola! Bienvenido a nuestra agencia de viajes ✈️\n\nEstoy aquí para ayudarte con paquetes turísticos, precios, destinos y reservas.\n\n¿A dónde te gustaría viajar? 🌴'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [faqs, setFaqs] = useState([]);
  const [clientData, setClientData] = useState({
    nombre: '',
    destino: '',
    fechas: '',
    email: '',
    telefono: ''
  });
  const [showForm, setShowForm] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchFAQs();
  }, []);

  const fetchFAQs = async () => {
    try {
      const response = await axios.get(`${API}/chatbot/faq`);
      setFaqs(response.data);
    } catch (error) {
      console.error('Error al cargar FAQs:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!inputValue.trim()) return;

    // Agregar mensaje del usuario
    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      text: inputValue
    };

    setMessages([...messages, userMessage]);
    setInputValue('');
    setLoading(true);

    try {
      const response = await axios.post(`${API}/chatbot/pregunta`, {
        pregunta: inputValue
      });

      const botMessage = {
        id: messages.length + 2,
        type: 'bot',
        text: response.data.respuesta,
        confianza: response.data.confianza
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = {
        id: messages.length + 2,
        type: 'bot',
        text: '😕 Lo siento, tuve un problema. Por favor, intenta de nuevo o contáctanos directamente por WhatsApp.'
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleFAQClick = async (question) => {
    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      text: question
    };

    setMessages([...messages, userMessage]);
    setLoading(true);

    try {
      const response = await axios.post(`${API}/chatbot/pregunta`, {
        pregunta: question
      });

      const botMessage = {
        id: messages.length + 2,
        type: 'bot',
        text: response.data.respuesta,
        confianza: response.data.confianza
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = {
        id: messages.length + 2,
        type: 'bot',
        text: '😕 Lo siento, tuve un problema. Por favor, intenta de nuevo.'
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleSendClientData = () => {
    if (!clientData.nombre || !clientData.destino) {
      alert('Por favor completa al menos tu nombre y destino.');
      return;
    }

    const mensaje = `📋 *Consulta de cliente:*\n\n👤 Nombre: ${clientData.nombre}\n🌍 Destino: ${clientData.destino}\n📅 Fechas: ${clientData.fechas || 'No especificadas'}\n📧 Email: ${clientData.email || 'No proporcionado'}\n📱 Teléfono: ${clientData.telefono || 'No proporcionado'}`;

    // Enviar por WhatsApp
    window.open(`https://wa.me/593999845693?text=${encodeURIComponent(mensaje)}`, '_blank');

    setClientData({ nombre: '', destino: '', fechas: '', email: '', telefono: '' });
    setShowForm(false);

    const botMessage = {
      id: messages.length + 1,
      type: 'bot',
      text: '✅ Perfecto! Tu consulta ha sido enviada a nuestro equipo de asesores. Te responderemos en máximo 2 horas por WhatsApp. 😊'
    };

    setMessages(prev => [...prev, botMessage]);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 z-40"
      >
        <MessageCircle size={24} />
        <span className="hidden sm:inline text-sm font-semibold">Ayuda</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 left-6 w-96 max-w-[90vw] bg-white rounded-lg shadow-2xl flex flex-col z-50 h-[600px] max-h-[80vh]">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-t-lg flex items-center justify-between">
        <div>
          <h3 className="font-bold text-lg">Asistente Virtual</h3>
          <p className="text-xs text-blue-100">Responde tus preguntas 24/7</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="hover:bg-blue-500 p-1 rounded transition"
          >
            <Minus size={18} />
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="hover:bg-blue-500 p-1 rounded transition"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {messages.map((message, index) => (
              <div key={message.id}>
                {/* Mensaje */}
                <div className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-xs px-4 py-2 rounded-lg ${
                      message.type === 'user'
                        ? 'bg-blue-600 text-white rounded-br-none'
                        : 'bg-gray-200 text-gray-800 rounded-bl-none'
                    } whitespace-pre-wrap break-words text-sm`}
                  >
                    {message.text}
                  </div>
                </div>

                {/* Mostrar botones de FAQ solo después del primer mensaje del bot */}
                {index === 0 && message.type === 'bot' && faqs.length > 0 && !loading && (
                  <div className="mt-3 space-y-2">
                    <p className="text-xs text-gray-600 font-semibold px-2">Puedo ayudarte con:</p>
                    {faqs.map((faq) => (
                      <button
                        key={faq.id}
                        onClick={() => handleFAQClick(faq.question)}
                        className="w-full text-left px-3 py-2 bg-blue-50 hover:bg-blue-100 border border-blue-300 rounded text-xs text-gray-700 transition hover:text-blue-700 hover:border-blue-500"
                      >
                        ❓ {faq.question}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg rounded-bl-none">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form onSubmit={handleSendMessage} className="border-t border-gray-200 p-4 bg-white rounded-b-lg">
            {showForm ? (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-gray-700">Nombre:</label>
                  <input
                    type="text"
                    value={clientData.nombre}
                    onChange={(e) => setClientData({...clientData, nombre: e.target.value})}
                    placeholder="Tu nombre"
                    className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700">Destino:</label>
                  <input
                    type="text"
                    value={clientData.destino}
                    onChange={(e) => setClientData({...clientData, destino: e.target.value})}
                    placeholder="¿A dónde quieres viajar?"
                    className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700">Fechas (opcional):</label>
                  <input
                    type="text"
                    value={clientData.fechas}
                    onChange={(e) => setClientData({...clientData, fechas: e.target.value})}
                    placeholder="Ej: del 15 al 22 de marzo"
                    className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700">Email (opcional):</label>
                  <input
                    type="email"
                    value={clientData.email}
                    onChange={(e) => setClientData({...clientData, email: e.target.value})}
                    placeholder="Tu email"
                    className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700">Teléfono (opcional):</label>
                  <input
                    type="tel"
                    value={clientData.telefono}
                    onChange={(e) => setClientData({...clientData, telefono: e.target.value})}
                    placeholder="Tu teléfono"
                    className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleSendClientData}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition text-sm font-semibold"
                  >
                    Enviar a Asesor 📞
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 bg-gray-400 hover:bg-gray-500 text-white py-2 rounded-lg transition text-sm"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Escribe tu pregunta..."
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 text-sm"
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={loading || !inputValue.trim()}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white p-2 rounded-lg transition flex items-center justify-center"
                >
                  <Send size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(true)}
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg transition text-sm font-semibold"
                  title="Hablar con un asesor"
                >
                  👨‍💼
                </button>
              </div>
            )}
          </form>
        </>
      )}
    </div>
  );
}
