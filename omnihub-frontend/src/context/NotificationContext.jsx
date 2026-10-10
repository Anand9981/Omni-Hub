import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);

  const dismissNotification = useCallback((id) => {
    setNotifications((current) => current.filter((item) => item.id !== id));
  }, []);

  const notify = useCallback(
    ({ title, message, type = 'info', duration = 4000 }) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const entry = { id, title, message, type, createdAt: new Date().toISOString() };
      setNotifications((current) => [entry, ...current].slice(0, 5));

      if (duration > 0 && typeof window !== 'undefined') {
        window.setTimeout(() => {
          dismissNotification(id);
        }, duration);
      }
      return id;
    },
    [dismissNotification],
  );

  const success = useCallback(
    (message, title = 'Success') => notify({ title, message, type: 'success' }),
    [notify],
  );

  const error = useCallback(
    (message, title = 'Error') => notify({ title, message, type: 'error' }),
    [notify],
  );

  const info = useCallback(
    (message, title = 'Notice') => notify({ title, message, type: 'info' }),
    [notify],
  );

  const value = useMemo(
    () => ({
      notifications,
      notify,
      success,
      error,
      info,
      dismissNotification,
    }),
    [notifications, notify, success, error, info, dismissNotification],
  );

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    return {
      notifications: [],
      notify: () => {},
      success: () => {},
      error: () => {},
      info: () => {},
      dismissNotification: () => {},
    };
  }
  return context;
}

export default NotificationContext;
