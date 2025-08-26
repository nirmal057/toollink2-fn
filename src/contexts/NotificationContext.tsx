import React, { createContext, useContext, useState, ReactNode } from 'react';
import Notification, { NotificationData, NotificationType } from '../components/UI/Notification';

interface NotificationContextType {
    showNotification: (type: NotificationType, title: string, message: string, duration?: number) => void;
    showSuccess: (title: string, message: string, duration?: number) => void;
    showError: (title: string, message: string, duration?: number) => void;
    showWarning: (title: string, message: string, duration?: number) => void;
    showInfo: (title: string, message: string, duration?: number) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};

interface NotificationProviderProps {
    children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
    const [notifications, setNotifications] = useState<NotificationData[]>([]);

    const addNotification = (notification: Omit<NotificationData, 'id'>) => {
        const id = Date.now().toString();
        const newNotification = { ...notification, id };
        setNotifications(prev => [...prev, newNotification]);
    };

    const removeNotification = (id: string) => {
        setNotifications(prev => prev.filter(notification => notification.id !== id));
    };

    const showNotification = (type: NotificationType, title: string, message: string, duration?: number) => {
        addNotification({ type, title, message, duration });
    };

    const showSuccess = (title: string, message: string, duration?: number) => {
        showNotification('success', title, message, duration);
    };

    const showError = (title: string, message: string, duration?: number) => {
        showNotification('error', title, message, duration);
    };

    const showWarning = (title: string, message: string, duration?: number) => {
        showNotification('warning', title, message, duration);
    };

    const showInfo = (title: string, message: string, duration?: number) => {
        showNotification('info', title, message, duration);
    };

    const value = {
        showNotification,
        showSuccess,
        showError,
        showWarning,
        showInfo,
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}

            {/* Notification Container */}
            <div className="fixed top-0 right-0 z-50 p-6 space-y-4 pointer-events-none">
                {notifications.map(notification => (
                    <Notification
                        key={notification.id}
                        notification={notification}
                        onRemove={removeNotification}
                    />
                ))}
            </div>
        </NotificationContext.Provider>
    );
};

export default NotificationContext;
