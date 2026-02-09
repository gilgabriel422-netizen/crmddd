import React, { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function NotificationBell() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [showPanel, setShowPanel] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Desactivado temporalmente hasta que se configure la tabla notificaciones
    // if (user?.id) {
    //   loadNotifications();
    //   const interval = setInterval(loadNotifications, 30000);
    //   return () => clearInterval(interval);
    // }
  }, [user?.id]);

  const loadNotifications = async () => {
    try {
      const api = await import('../services/api');
      // Obtener notificaciones no leídas del usuario actual
      const response = await api.default.get(`/notificaciones/unread/${user?.id}`);
      const notifs = response.data || [];
      setNotifications(notifs);
      setUnreadCount(notifs.filter(n => !n.leida).length);
    } catch (error) {
      // Silenciar error de notificaciones si no existen en BD
    }
  };

  const markAsRead = async (id) => {
    try {
      const api = await import('../services/api');
      await api.default.put(`/notificaciones/${id}`, { leida: true });
      setNotifications(notifications.map(n => n.id === id ? { ...n, leida: true } : n));
      setUnreadCount(Math.max(0, unreadCount - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const deleteNotification = async (id) => {
    try {
      const api = await import('../services/api');
      await api.default.delete(`/notificaciones/${id}`);
      setNotifications(notifications.filter(n => n.id !== id));
      const deleted = notifications.find(n => n.id === id);
      if (deleted && !deleted.leida) {
        setUnreadCount(Math.max(0, unreadCount - 1));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  return (
    <div className="relative">
      {/* Campana */}
      <button
        onClick={() => setShowPanel(!showPanel)}
        className="relative p-2 rounded-full hover:bg-gray-100 transition"
      >
        <Bell size={24} className="text-gray-700" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Panel de notificaciones */}
      {showPanel && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
          <div className="p-4 border-b bg-gray-50 sticky top-0 flex justify-between items-center">
            <h3 className="font-semibold text-lg">Notificaciones</h3>
            <button
              onClick={() => setShowPanel(false)}
              className="p-1 hover:bg-gray-200 rounded"
            >
              <X size={20} />
            </button>
          </div>

          {notifications.length > 0 ? (
            <div className="divide-y">
              {notifications.map(notif => (
                <div
                  key={notif.id}
                  className={`p-4 hover:bg-gray-50 transition cursor-pointer ${!notif.leida ? 'bg-blue-50' : ''}`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1" onClick={() => !notif.leida && markAsRead(notif.id)}>
                      <h4 className="font-semibold text-sm">{notif.titulo}</h4>
                      <p className="text-sm text-gray-600 mt-1">{notif.contenido}</p>
                      <p className="text-xs text-gray-400 mt-2">
                        {notif.fecha ? new Date(notif.fecha).toLocaleDateString() : 'Hoy'}
                      </p>
                      {!notif.leida && (
                        <span className="inline-block mt-2 px-2 py-1 bg-blue-500 text-white text-xs rounded">
                          Nueva
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => deleteNotification(notif.id)}
                      className="p-1 hover:bg-red-100 rounded text-red-500"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              <p>No hay notificaciones</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
