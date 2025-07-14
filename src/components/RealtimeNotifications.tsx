import React, { useEffect } from 'react';

interface RealtimeNotification {
    id: string;
    type: 'success' | 'info' | 'warning' | 'error';
    title: string;
    message: string;
    timestamp: Date;
}

interface RealtimeNotificationProps {
    notification: RealtimeNotification;
    onClose: (id: string) => void;
}

const RealtimeNotificationItem: React.FC<RealtimeNotificationProps> = ({ notification, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose(notification.id);
        }, 5000); // Auto-close after 5 seconds

        return () => clearTimeout(timer);
    }, [notification.id, onClose]);

    const getIcon = () => {
        switch (notification.type) {
            case 'success': return '✅';
            case 'info': return 'ℹ️';
            case 'warning': return '⚠️';
            case 'error': return '❌';
            default: return 'ℹ️';
        }
    };

    const getTypeClass = () => {
        switch (notification.type) {
            case 'success': return 'notification-success';
            case 'info': return 'notification-info';
            case 'warning': return 'notification-warning';
            case 'error': return 'notification-error';
            default: return 'notification-info';
        }
    };

    return (
        <div className={`realtime-notification ${getTypeClass()}`}>
            <div className="notification-icon">{getIcon()}</div>
            <div className="notification-content">
                <div className="notification-title">{notification.title}</div>
                <div className="notification-message">{notification.message}</div>
                <div className="notification-time">
                    {notification.timestamp.toLocaleTimeString()}
                </div>
            </div>
            <button
                className="notification-close"
                onClick={() => onClose(notification.id)}
            >
                ×
            </button>
        </div>
    );
};

interface RealtimeNotificationContainerProps {
    notifications: RealtimeNotification[];
    onRemoveNotification: (id: string) => void;
}

const RealtimeNotificationContainer: React.FC<RealtimeNotificationContainerProps> = ({
    notifications,
    onRemoveNotification
}) => {
    if (notifications.length === 0) return null;

    return (
        <div className="realtime-notifications-container">
            {notifications.map(notification => (
                <RealtimeNotificationItem
                    key={notification.id}
                    notification={notification}
                    onClose={onRemoveNotification}
                />
            ))}
        </div>
    );
};

export default RealtimeNotificationContainer;
export type { RealtimeNotification };
