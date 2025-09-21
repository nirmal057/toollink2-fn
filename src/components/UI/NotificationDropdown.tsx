import { useState, useEffect, useRef } from 'react';
import { BellIcon, XIcon, CheckCircleIcon } from 'lucide-react';
import { notificationService, Notification } from '../../services/notificationService';

interface NotificationDropdownProps {
  className?: string;
}

const NotificationDropdown = ({ className = '' }: NotificationDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load recent notifications
  const loadRecentNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationService.getNotifications({
        limit: 5,
        page: 1
      });
      setNotifications(response.notifications);
      setUnreadCount(response.unreadCount);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load unread count on mount
  useEffect(() => {
    const loadUnreadCount = async () => {
      try {
        const count = await notificationService.getUnreadCount();
        setUnreadCount(count);
      } catch (error) {
        console.error('Error loading unread count:', error);
      }
    };

    loadUnreadCount();

    // Refresh unread count every 30 seconds
    const interval = setInterval(loadUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  // Load notifications when dropdown opens
  useEffect(() => {
    if (isOpen && notifications.length === 0) {
      loadRecentNotifications();
    }
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications(prev =>
        prev.map(notif =>
          notif._id === notificationId
            ? { ...notif, isRead: true, status: 'read' as const }
            : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const getIcon = (category: string) => {
    const iconMap: { [key: string]: string } = {
      order: '🛒',
      delivery: '🚚',
      inventory: '📦',
      user: '👤',
      security: '🔒',
      system: '⚙️',
      payment: '💳',
      maintenance: '🔧'
    };
    return iconMap[category] || '🔔';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Enhanced Notification Bell Button - More prominent */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-3 bg-blue-600 hover:bg-blue-700 text-white transition-all duration-300 rounded-full hover:shadow-xl hover:scale-110 transform shadow-lg border-2 border-white"
        title="Notifications"
        style={{ minWidth: '48px', minHeight: '48px' }}
      >
        <BellIcon size={24} className={unreadCount > 0 ? 'animate-pulse' : ''} />
        {unreadCount > 0 && (
          <span className="notification-badge absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold shadow-lg border-2 border-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
        {/* Test indicator */}
        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border border-white"></div>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop to catch clicks */}
          <div
            className="fixed inset-0 z-[99999]"
            onClick={() => setIsOpen(false)}
          />

          {/* Enhanced Dropdown content - positioned in upper right corner */}
          <div className="absolute right-0 mt-3 w-96 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 z-[100000] overflow-hidden transform animate-in slide-in-from-top-5 fade-in duration-200" style={{ zIndex: 100000 }}>
            {/* Enhanced Header with gradient */}
            <div className="flex items-center justify-between p-5 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 border-b border-gray-200 dark:border-gray-600">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
                  <BellIcon size={18} className="text-white" />
                </div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                  Notifications
                </h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-2 rounded-xl hover:bg-white/70 dark:hover:bg-gray-600/70 transition-all duration-200 hover:scale-105"
              >
                <XIcon size={18} />
              </button>
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                  Loading notifications...
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-xl flex items-center justify-center">
                    <BellIcon className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="font-medium">All caught up!</p>
                  <p className="text-sm mt-1">No new notifications</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                  {notifications.map((notification) => (
                    <div
                      key={notification._id}
                      className={`p-4 hover:bg-gradient-to-r hover:from-slate-50 hover:via-green-50 hover:to-blue-50 dark:hover:from-gray-700 dark:hover:via-gray-600 dark:hover:to-gray-700 transition-all duration-200 ${!notification.isRead ? 'bg-gradient-to-r from-blue-50 via-green-50 to-slate-50 dark:from-blue-900/20 dark:via-green-900/10 dark:to-gray-800 border-l-4 border-blue-500' : ''
                        }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-gradient-to-r from-green-500 to-blue-600 flex items-center justify-center text-white shadow-lg">
                          <span className="text-sm">
                            {getIcon(notification.category)}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                              {notification.title}
                            </p>
                            {!notification.isRead && (
                              <button
                                onClick={() => markAsRead(notification._id)}
                                className="ml-2 flex-shrink-0 text-green-500 hover:text-green-600 p-1 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-all duration-200"
                                title="Mark as read"
                              >
                                <CheckCircleIcon size={14} />
                              </button>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mt-1 leading-relaxed">
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-2 mt-3">
                            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                              {formatDate(notification.createdAt)}
                            </span>
                            <span className="text-xs px-2 py-1 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 text-gray-600 dark:text-gray-300 rounded-full font-medium">
                              {notification.category}
                            </span>
                            {notification.priority === 'high' && (
                              <span className="text-xs px-2 py-1 bg-gradient-to-r from-orange-400 to-red-400 text-white rounded-full font-medium shadow-sm">
                                High
                              </span>
                            )}
                            {notification.priority === 'critical' && (
                              <span className="text-xs px-2 py-1 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-full font-medium shadow-sm animate-pulse">
                                Critical
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Enhanced Footer */}
            {notifications.length > 0 && (
              <div className="p-3 bg-gradient-to-r from-slate-50 via-green-50 to-blue-100 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 border-t border-gray-100 dark:border-gray-600">
                <a
                  href="/notifications"
                  className="block text-center text-sm font-medium bg-gradient-to-r from-green-600 to-blue-600 dark:from-green-400 dark:to-blue-400 bg-clip-text text-transparent hover:from-green-700 hover:to-blue-700 transition-all duration-200 py-1 rounded-lg hover:bg-white/50 dark:hover:bg-gray-600/30"
                  onClick={() => setIsOpen(false)}
                >
                  View all notifications →
                </a>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationDropdown;
