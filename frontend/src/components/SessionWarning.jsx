import React, { useState, useEffect } from 'react';
import { AlertTriangle, Clock } from 'lucide-react';
import { getTokenTimeRemaining } from '../services/api';

const SessionWarning = () => {
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    const checkSession = () => {
      const remaining = getTokenTimeRemaining();
      setTimeRemaining(remaining);
      
      // Mostrar advertencia si quedan menos de 5 minutos
      if (remaining && remaining < 300 && remaining > 0) {
        setShowWarning(true);
      } else {
        setShowWarning(false);
      }
    };

    // Verificar inmediatamente
    checkSession();

    // Verificar cada 30 segundos
    const interval = setInterval(checkSession, 30000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (!showWarning || !timeRemaining) return null;

  return (
    <div className="fixed top-4 right-4 z-50 bg-yellow-50 border border-yellow-200 rounded-lg p-4 shadow-lg max-w-sm">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <AlertTriangle className="h-5 w-5 text-yellow-600" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-yellow-800">
            Sesión por expirar
          </h3>
          <div className="mt-1 text-sm text-yellow-700">
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              Tiempo restante: {formatTime(timeRemaining)}
            </div>
            <p className="mt-2">
              Tu sesión expirará pronto. Guarda tu trabajo y prepárate para iniciar sesión nuevamente.
            </p>
          </div>
          <div className="mt-3">
            <button
              onClick={() => setShowWarning(false)}
              className="text-sm bg-yellow-100 text-yellow-800 px-3 py-1 rounded hover:bg-yellow-200"
            >
              Entendido
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionWarning;
