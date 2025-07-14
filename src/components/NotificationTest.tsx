import React, { useState, useCallback } from 'react';
import { BellIcon } from 'lucide-react';

// Test component to debug notification functionality
const NotificationTest = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications] = useState([
    {
      id: 1,
      title: 'Test Notification',
      message: 'This is a test notification',
      timestamp: new Date().toISOString(),
      read: false
    }
  ]);

  const toggleNotifications = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Toggle notifications clicked', { showNotifications });
    setShowNotifications(prev => !prev);
  }, [showNotifications]);

  const unreadCount = notifications.filter(n => !n.read).length;

  console.log('NotificationTest render', { showNotifications, unreadCount });

  return (
    <div className="relative">
      <button 
        onClick={toggleNotifications}
        className="relative p-3 rounded-full text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        type="button"
        data-testid="notification-button"
      >
        <BellIcon size={24} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
            {unreadCount}
          </span>
        )}
      </button>

      {showNotifications && (
        <div className="absolute right-0 top-full mt-2 w-96 bg-white shadow-lg rounded-lg border z-50">
          <div className="p-4 border-b">
            <h3 className="font-semibold">Notifications</h3>
          </div>
          <div className="p-4">
            {notifications.map(notification => (
              <div key={notification.id} className="p-2 border-b">
                <div className="font-medium">{notification.title}</div>
                <div className="text-sm text-gray-600">{notification.message}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationTest;
