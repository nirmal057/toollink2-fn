import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BellIcon, 
  FilterIcon, 
  MailIcon, 
  TrashIcon, 
  EyeIcon, 
  ShoppingCartIcon, 
  TruckIcon, 
  PackageIcon, 
  UserIcon, 
  ShieldIcon, 
  SettingsIcon, 
  ClockIcon, 
  StarIcon, 
  AlertTriangleIcon
} from 'lucide-react';
import { notificationService, Notification } from '../services/notificationService';

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationService.getNotifications();
      setNotifications(response.notifications || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(notifications.map(notif => 
        notif._id === id ? { ...notif, isRead: true } : notif
      ));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(notifications.map(notif => ({ ...notif, isRead: true })));
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await notificationService.deleteNotification(id);
      setNotifications(notifications.filter(notif => notif._id !== id));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const clearAllNotifications = async () => {
    try {
      // Delete all notifications one by one since there's no clearAll method
      const deletePromises = notifications.map(notif => 
        notificationService.deleteNotification(notif._id)
      );
      await Promise.all(deletePromises);
      setNotifications([]);
    } catch (error) {
      console.error('Error clearing all notifications:', error);
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notification.isRead;
    return notification.category === filter;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'order': return ShoppingCartIcon;
      case 'delivery': return TruckIcon;
      case 'inventory': return PackageIcon;
      case 'user': return UserIcon;
      case 'security': return ShieldIcon;
      case 'system': return SettingsIcon;
      default: return BellIcon;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
          <p className="text-lg font-medium text-gray-600 dark:text-gray-300">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Beautiful Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-8 transition-colors duration-300"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-gradient-to-r from-green-500 to-blue-600 rounded-2xl shadow-lg">
                <BellIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 via-green-600 to-blue-600 dark:from-white dark:via-green-400 dark:to-blue-400 bg-clip-text text-transparent">
                  Notifications
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  {notifications.length} total notifications, {notifications.filter(n => !n.isRead).length} unread
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {notifications.filter(n => !n.isRead).length > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  Mark All Read
                </button>
              )}
              
              {notifications.length > 0 && (
                <button
                  onClick={clearAllNotifications}
                  className="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  Clear All
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Professional Filter Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-300"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-r from-green-500 to-blue-600 rounded-xl">
              <FilterIcon className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Filter by Category</h2>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {[
              { key: 'all', label: 'All', icon: BellIcon, color: 'from-gray-500 to-slate-600' },
              { key: 'unread', label: 'Unread', icon: MailIcon, color: 'from-red-500 to-pink-500' },
              { key: 'order', label: 'Orders', icon: ShoppingCartIcon, color: 'from-blue-500 to-cyan-500' },
              { key: 'delivery', label: 'Delivery', icon: TruckIcon, color: 'from-green-500 to-emerald-500' },
              { key: 'inventory', label: 'Stock', icon: PackageIcon, color: 'from-orange-500 to-yellow-500' },
              { key: 'user', label: 'Users', icon: UserIcon, color: 'from-orange-500 to-yellow-500' },
              { key: 'security', label: 'Security', icon: ShieldIcon, color: 'from-red-500 to-orange-500' },
              { key: 'system', label: 'System', icon: SettingsIcon, color: 'from-gray-500 to-slate-500' }
            ].map(({ key, label, icon: Icon, color }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`group flex flex-col items-center space-y-2 p-4 rounded-2xl font-medium transition-all duration-300 hover:scale-105 ${
                  filter === key
                    ? `bg-gradient-to-r ${color} text-white shadow-lg`
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <Icon className={`h-5 w-5 ${filter === key ? 'text-white' : ''} group-hover:animate-pulse`} />
                <span className="text-sm font-medium">{label}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Beautiful Notifications Grid */}
        <div className="space-y-4">
          {filteredNotifications.map((notification: Notification, index: number) => {
            const CategoryIcon = getCategoryIcon(notification.category);
            
            return (
              <motion.div 
                key={notification._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className={`relative bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 transition-all duration-300 hover:shadow-xl ${
                  !notification.isRead ? 'ring-2 ring-blue-500/20 bg-blue-50/50 dark:bg-blue-900/10' : ''
                }`}
              >
                {/* Unread Indicator */}
                {!notification.isRead && (
                  <div className="absolute -top-2 -right-2">
                    <div className="w-4 h-4 bg-blue-500 rounded-full shadow-lg"></div>
                  </div>
                )}
                
                <div className="flex items-start gap-4">
                  {/* Category Icon */}
                  <div className={`flex-shrink-0 p-3 rounded-2xl shadow-lg ${
                    notification.category === 'order' ? 'bg-gradient-to-r from-blue-500 to-cyan-500' :
                    notification.category === 'delivery' ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                    notification.category === 'inventory' ? 'bg-gradient-to-r from-orange-500 to-yellow-500' :
                    notification.category === 'user' ? 'bg-gradient-to-r from-purple-500 to-pink-500' :
                    notification.category === 'security' ? 'bg-gradient-to-r from-red-500 to-orange-500' :
                    'bg-gradient-to-r from-gray-500 to-slate-500'
                  }`}>
                    <CategoryIcon className="h-6 w-6 text-white" />
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2 line-clamp-2">
                          {notification.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4 line-clamp-3">
                          {notification.message}
                        </p>
                        
                        {/* Meta Information */}
                        <div className="flex flex-wrap items-center gap-3">
                          <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                            <ClockIcon className="h-4 w-4" />
                            <span>{formatDate(notification.createdAt)}</span>
                          </div>
                          
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium shadow-sm ${
                            notification.category === 'order' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                            notification.category === 'delivery' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                            notification.category === 'inventory' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' :
                            notification.category === 'user' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' :
                            notification.category === 'security' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
                            'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                          }`}>
                            {notification.category}
                          </span>
                          
                          {notification.priority === 'high' && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-orange-400 to-red-400 text-white shadow-lg">
                              <StarIcon className="h-3 w-3 mr-1" />
                              High Priority
                            </span>
                          )}
                          {notification.priority === 'critical' && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg animate-pulse">
                              <AlertTriangleIcon className="h-3 w-3 mr-1" />
                              Critical
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex flex-col gap-2">
                        {!notification.isRead && (
                          <button 
                            onClick={() => markAsRead(notification._id)} 
                            className="p-3 rounded-xl bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50 transition-all duration-300 hover:scale-110 shadow-lg" 
                            title="Mark as read"
                          >
                            <EyeIcon className="h-5 w-5" />
                          </button>
                        )}
                        <button 
                          onClick={() => deleteNotification(notification._id)} 
                          className="p-3 rounded-xl bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-all duration-300 hover:scale-110 shadow-lg" 
                          title="Delete notification"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
          
          {/* Empty State */}
          {filteredNotifications.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center py-20"
            >
              <div className="relative max-w-md mx-auto">
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-xl flex items-center justify-center shadow-lg">
                  <BellIcon className="h-10 w-10 text-gray-400 dark:text-gray-500" />
                </div>
                <div className="space-y-4">
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-800 via-green-600 to-blue-600 dark:from-white dark:via-green-400 dark:to-blue-400 bg-clip-text text-transparent">
                    All caught up!
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 max-w-sm mx-auto">
                    {filter === 'all' 
                      ? "You don't have any notifications right now. We'll let you know when something new comes up!" 
                      : `No ${filter} notifications found. Try checking other categories or come back later.`
                    }
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;
