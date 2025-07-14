import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { notificationService } from '../services/notificationService';

interface ToastNotification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
}

interface GlobalNotificationContextType {
  // Toast notifications
  toasts: ToastNotification[];
  addToast: (toast: Omit<ToastNotification, 'id'>) => void;
  removeToast: (id: string) => void;
  
  // System notifications
  unreadCount: number;
  refreshUnreadCount: () => void;
  
  // Real-time updates
  isConnected: boolean;
}

const GlobalNotificationContext = createContext<GlobalNotificationContextType | undefined>(undefined);

export const useGlobalNotifications = () => {
  const context = useContext(GlobalNotificationContext);
  if (context === undefined) {
    throw new Error('useGlobalNotifications must be used within a GlobalNotificationProvider');
  }
  return context;
};

interface GlobalNotificationProviderProps {
  children: ReactNode;
}

export const GlobalNotificationProvider: React.FC<GlobalNotificationProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(true);

  // Generate unique ID for toasts
  const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9);

  // Add toast notification
  const addToast = (toast: Omit<ToastNotification, 'id'>) => {
    const id = generateId();
    const newToast: ToastNotification = {
      ...toast,
      id,
      duration: toast.duration || 5000
    };

    setToasts(prev => [...prev, newToast]);

    // Auto-remove toast after duration
    const duration = newToast.duration || 5000;
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  };

  // Remove toast notification
  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  // Refresh unread count
  const refreshUnreadCount = async () => {
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
      setIsConnected(true);
    } catch (error) {
      console.error('Failed to refresh unread count:', error);
      setIsConnected(false);
    }
  };

  // Initialize and setup periodic refresh
  useEffect(() => {
    // Initial load
    refreshUnreadCount();

    // Refresh every 30 seconds
    const interval = setInterval(refreshUnreadCount, 30000);

    return () => clearInterval(interval);
  }, []);

  // Listen for notification events (you can extend this for WebSocket integration)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'notification_update') {
        refreshUnreadCount();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const value: GlobalNotificationContextType = {
    toasts,
    addToast,
    removeToast,
    unreadCount,
    refreshUnreadCount,
    isConnected
  };

  return (
    <GlobalNotificationContext.Provider value={value}>
      {children}
    </GlobalNotificationContext.Provider>
  );
};

// Helper hook for easy toast notifications
export const useToast = () => {
  const { addToast } = useGlobalNotifications();

  return {
    success: (title: string, message?: string) => 
      addToast({ type: 'success', title, message: message || '' }),
    error: (title: string, message?: string) => 
      addToast({ type: 'error', title, message: message || '' }),
    warning: (title: string, message?: string) => 
      addToast({ type: 'warning', title, message: message || '' }),
    info: (title: string, message?: string) => 
      addToast({ type: 'info', title, message: message || '' })
  };
};
