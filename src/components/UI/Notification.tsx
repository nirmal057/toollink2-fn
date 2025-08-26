import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface NotificationData {
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    duration?: number;
}

interface NotificationProps {
    notification: NotificationData;
    onRemove: (id: string) => void;
}

const Notification: React.FC<NotificationProps> = ({ notification, onRemove }) => {
    const [isVisible, setIsVisible] = useState(true);
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        if (notification.duration !== 0) {
            const timer = setTimeout(() => {
                handleClose();
            }, notification.duration || 5000);

            return () => clearTimeout(timer);
        }
    }, [notification.duration]);

    const handleClose = () => {
        setIsExiting(true);
        setTimeout(() => {
            setIsVisible(false);
            onRemove(notification.id);
        }, 300);
    };

    const getIcon = () => {
        switch (notification.type) {
            case 'success':
                return <CheckCircle className="h-6 w-6" />;
            case 'error':
                return <XCircle className="h-6 w-6" />;
            case 'warning':
                return <AlertTriangle className="h-6 w-6" />;
            case 'info':
                return <Info className="h-6 w-6" />;
        }
    };

    const getStyles = () => {
        switch (notification.type) {
            case 'success':
                return {
                    container: 'bg-green-50 border-green-200 text-green-800',
                    icon: 'text-green-400',
                    button: 'text-green-500 hover:text-green-600'
                };
            case 'error':
                return {
                    container: 'bg-red-50 border-red-200 text-red-800',
                    icon: 'text-red-400',
                    button: 'text-red-500 hover:text-red-600'
                };
            case 'warning':
                return {
                    container: 'bg-yellow-50 border-yellow-200 text-yellow-800',
                    icon: 'text-yellow-400',
                    button: 'text-yellow-500 hover:text-yellow-600'
                };
            case 'info':
                return {
                    container: 'bg-blue-50 border-blue-200 text-blue-800',
                    icon: 'text-blue-400',
                    button: 'text-blue-500 hover:text-blue-600'
                };
        }
    };

    const styles = getStyles();

    if (!isVisible) return null;

    return (
        <div
            className={`
        ${styles.container}
        pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg border shadow-lg
        transform transition-all duration-300 ease-in-out
        ${isExiting ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'}
      `}
        >
            <div className="p-4">
                <div className="flex items-start">
                    <div className={`flex-shrink-0 ${styles.icon}`}>
                        {getIcon()}
                    </div>
                    <div className="ml-3 w-0 flex-1 pt-0.5">
                        <p className="text-sm font-medium">{notification.title}</p>
                        <p className="mt-1 text-sm">{notification.message}</p>
                    </div>
                    <div className="ml-4 flex flex-shrink-0">
                        <button
                            className={`
                inline-flex rounded-md ${styles.button}
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
              `}
                            onClick={handleClose}
                        >
                            <span className="sr-only">Close</span>
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Notification;
