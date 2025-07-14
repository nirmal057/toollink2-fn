import { useState, useEffect } from 'react';
import { BellIcon, ShoppingCartIcon, TruckIcon, AlertTriangleIcon, CheckCircleIcon, XIcon, RefreshCwIcon, FilterIcon, PackageIcon, UserIcon, ShieldIcon, SettingsIcon } from 'lucide-react';
import { notificationService, Notification, NotificationFilters } from '../services/notificationService';

const Notifications = ({
  userRole
}: {
  userRole: string;
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [notificationFilter, setNotificationFilter] = useState<NotificationFilters>({ 
    page: 1, 
    limit: 20, 
    unreadOnly: false 
  });
  const [unreadCount, setUnreadCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Load notifications
  const loadNotifications = async (filters: NotificationFilters = notificationFilter) => {
    try {
      setLoading(true);
      setError(null);
      const response = await notificationService.getNotifications(filters);
      setNotifications(response.notifications);
      setUnreadCount(response.unreadCount);
      setTotalPages(response.pagination.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load notifications');
      console.error('Error loading notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load notifications on component mount and filter changes
  useEffect(() => {
    const newFilter = { ...notificationFilter };
    
    if (filter === 'unread') {
      newFilter.unreadOnly = true;
    } else if (filter !== 'all') {
      newFilter.category = filter;
      newFilter.unreadOnly = false;
    } else {
      newFilter.unreadOnly = false;
      delete newFilter.category;
    }
    
    setNotificationFilter(newFilter);
    loadNotifications(newFilter);
  }, [filter]);

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
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      await notificationService.deleteNotification(notificationId);
      setNotifications(prev => prev.filter(notif => notif._id !== notificationId));
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, isRead: true, status: 'read' as const }))
      );
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  const filteredNotifications = notifications.filter((notif: Notification) => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notif.isRead;
    return notif.category === filter;
  });

  const getIcon = (category: string) => {
    switch (category) {
      case 'order':
        return <ShoppingCartIcon size={20} className="text-blue-500" />;
      case 'delivery':
        return <TruckIcon size={20} className="text-green-500" />;
      case 'inventory':
        return <PackageIcon size={20} className="text-orange-500" />;
      case 'user':
        return <UserIcon size={20} className="text-purple-500" />;
      case 'security':
        return <ShieldIcon size={20} className="text-red-500" />;
      case 'system':
        return <SettingsIcon size={20} className="text-gray-500" />;
      case 'payment':
        return <AlertTriangleIcon size={20} className="text-yellow-500" />;
      default:
        return <BellIcon size={20} className="text-gray-500" />;
    }
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

  if (loading) {
    return (
      <div className="space-y-4 xs:space-y-6 p-4 xs:p-6">
        <div className="flex justify-center items-center py-12">
          <RefreshCwIcon className="animate-spin h-8 w-8 text-gray-400" />
          <span className="ml-2 text-gray-600 dark:text-gray-300">Loading notifications...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4 xs:space-y-6 p-4 xs:p-6">
        <div className="flex flex-col items-center justify-center py-12">
          <AlertTriangleIcon className="h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Failed to load notifications</h2>
          <p className="text-gray-600 dark:text-gray-300 text-center mb-4">{error}</p>
          <button 
            onClick={() => loadNotifications()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 xs:space-y-6 p-4 xs:p-6">
      {/* Header */}
      <div className="flex flex-col xs:flex-row justify-between items-start xs:items-center gap-4">
        <div>
          <h1 className="text-xl xs:text-2xl font-bold text-gray-800 dark:text-white">Notifications</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-gray-600 dark:text-gray-300">
              You have {unreadCount} unread notification{unreadCount === 1 ? '' : 's'}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => loadNotifications()}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            title="Refresh"
          >
            <RefreshCwIcon size={20} />
          </button>
          {unreadCount > 0 && (
            <button 
              onClick={markAllAsRead} 
              className="text-sm text-blue-500 hover:text-blue-600 transition-colors"
            >
              Mark all as read
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex space-x-2 xs:space-x-4 overflow-x-auto pb-2 scrollbar-hide">
        <button 
          onClick={() => setFilter('all')} 
          className={`px-3 xs:px-4 py-2 rounded-full text-xs xs:text-sm font-medium whitespace-nowrap transition-colors ${
            filter === 'all' 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          All
        </button>
        <button 
          onClick={() => setFilter('unread')} 
          className={`px-3 xs:px-4 py-2 rounded-full text-xs xs:text-sm font-medium whitespace-nowrap transition-colors ${
            filter === 'unread' 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          Unread
        </button>
        <button 
          onClick={() => setFilter('order')} 
          className={`px-3 xs:px-4 py-2 rounded-full text-xs xs:text-sm font-medium whitespace-nowrap transition-colors ${
            filter === 'order' 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          Orders
        </button>
        <button 
          onClick={() => setFilter('delivery')} 
          className={`px-3 xs:px-4 py-2 rounded-full text-xs xs:text-sm font-medium whitespace-nowrap transition-colors ${
            filter === 'delivery' 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          Deliveries
        </button>
        <button 
          onClick={() => setFilter('inventory')} 
          className={`px-3 xs:px-4 py-2 rounded-full text-xs xs:text-sm font-medium whitespace-nowrap transition-colors ${
            filter === 'inventory' 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          Inventory
        </button>
        <button 
          onClick={() => setFilter('user')} 
          className={`px-3 xs:px-4 py-2 rounded-full text-xs xs:text-sm font-medium whitespace-nowrap transition-colors ${
            filter === 'user' 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          Users
        </button>
      </div>

      {/* Notifications List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden transition-colors duration-300">
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {filteredNotifications.map((notification: Notification) => (
            <div 
              key={notification._id} 
              className={`p-3 xs:p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                !notification.isRead ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500' : ''
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start space-x-3 flex-1">
                  <div className="flex-shrink-0 mt-1">
                    {getIcon(notification.category)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {notification.title}
                    </h3>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                      {notification.message}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(notification.createdAt)}
                      </p>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                        {notification.category}
                      </span>
                      {notification.priority === 'high' && (
                        <span className="text-xs px-2 py-1 rounded-full bg-orange-100 text-orange-600">
                          High Priority
                        </span>
                      )}
                      {notification.priority === 'critical' && (
                        <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-600">
                          Critical
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2 flex-shrink-0">
                  {!notification.isRead && (
                    <button 
                      onClick={() => markAsRead(notification._id)} 
                      className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors" 
                      title="Mark as read"
                    >
                      <CheckCircleIcon size={18} className="text-green-500" />
                    </button>
                  )}
                  <button 
                    onClick={() => deleteNotification(notification._id)} 
                    className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors" 
                    title="Delete"
                  >
                    <XIcon size={18} className="text-gray-400 hover:text-red-500" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          
          {filteredNotifications.length === 0 && (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              <BellIcon className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No notifications</h3>
              <p className="text-sm">
                {filter === 'all' 
                  ? "You don't have any notifications yet." 
                  : `No ${filter} notifications found.`
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;
