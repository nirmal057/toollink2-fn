import { useCallback, useEffect, useState } from 'react';
import { BellIcon, UserIcon, CheckCircleIcon, ShoppingCartIcon, TruckIcon, AlertTriangleIcon, LogOutIcon, UserCheckIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { authService } from '../../services/authService';
import { safeLogoutWithTimeout } from '../../utils/logoutUtils';
import { CustomerApprovalNotificationService } from '../../services/customerApprovalNotificationService';
import DarkModeToggle from '../UI/DarkModeToggle';

interface Notification {
  id: number;
  type: 'order' | 'delivery' | 'inventory' | 'system' | 'customer-approval';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

interface HeaderProps {
  userRole: 'admin' | 'warehouse' | 'cashier' | 'customer' | string;
}

// Sample notifications data (in a real app, this would come from a backend)
const initialNotifications: Notification[] = [
  {
    id: 1,
    type: 'order',
    title: 'New Order Received',
    message: 'Order #123 has been placed',
    timestamp: new Date().toISOString(),
    read: false
  },
  {
    id: 2,
    type: 'delivery',
    title: 'Delivery Update',
    message: 'Order #120 has been delivered',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    read: false
  },
  {
    id: 3,
    type: 'inventory',
    title: 'Low Stock Alert',
    message: 'Item XYZ is running low',
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    read: true
  }
];

const Header = ({ userRole }: HeaderProps) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);

  // Load approval notifications for cashiers and admins
  useEffect(() => {
    const loadApprovalNotifications = async () => {
      if (['admin', 'cashier'].includes(userRole)) {
        try {
          const approvalNotifications = await CustomerApprovalNotificationService.getPendingCustomerNotifications(userRole);
          
          // Combine with existing notifications
          setNotifications(prev => {
            // Remove old approval notifications
            const nonApprovalNotifications = prev.filter(n => n.type !== 'customer-approval');
            // Add new approval notifications
            return [...nonApprovalNotifications, ...approvalNotifications];
          });
        } catch (error) {
          console.error('Error loading approval notifications:', error);
        }
      }
    };

    loadApprovalNotifications();
    
    // Refresh notifications every 30 seconds
    const interval = setInterval(loadApprovalNotifications, 30000);
    
    return () => clearInterval(interval);
  }, [userRole]);

  // Handle menu toggles
  const toggleNotifications = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowNotifications(prev => !prev);
    setShowUserMenu(false);
  }, []);

  const toggleUserMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowUserMenu(prev => !prev);
    setShowNotifications(false);
  }, []);

  // Close menus when clicking outside
  const handleClickOutside = useCallback((event: MouseEvent | TouchEvent) => {
    const target = event.target as HTMLElement;
    
    // Don't close if clicking inside the menus or buttons
    const notificationContainer = target.closest('.notifications-container');
    const userMenuContainer = target.closest('.user-menu-container');
    const notificationButton = target.closest('[data-notification-button]');
    const userMenuButton = target.closest('[data-user-menu-button]');
    
    if (notificationContainer || userMenuContainer || notificationButton || userMenuButton) {
      return;
    }
    
    setShowUserMenu(false);
    setShowNotifications(false);
  }, []);

  const handleLogout = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      const confirmed = window.confirm('Are you sure you want to sign out?');
      if (!confirmed) return;

      setIsLoggingOut(true);
      // Clear all menus first
      setShowUserMenu(false);
      setShowNotifications(false);

      // Perform logout with safe timeout
      await safeLogoutWithTimeout(async () => {
        await authService.logout();
        window.location.replace('/auth/login');
      }, 3000);
    } catch (error) {
      console.error('Sign out failed:', error);
      window.alert('Failed to sign out. Please try again.');
      setIsLoggingOut(false);
    }
  }, []);

  // Add click outside listener
  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [handleClickOutside]);

  const getRoleLabel = (role: string): string => {
    const roles: Record<string, string> = {
      admin: 'Administrator',
      warehouse: 'Warehouse Manager',
      cashier: 'Cashier',
      customer: 'Customer'
    };
    return roles[role] || 'User';
  };

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'order':
        return <ShoppingCartIcon size={16} className="text-primary-500" />;
      case 'delivery':
        return <TruckIcon size={16} className="text-secondary-500" />;
      case 'inventory':
        return <AlertTriangleIcon size={16} className="text-warning-500" />;
      case 'customer-approval':
        return <UserCheckIcon size={16} className="text-blue-500" />;
      default:
        return <BellIcon size={16} className="text-gray-500" />;
    }
  };

  const markAsRead = (id: number) => {
    setNotifications(notifications.map(notif =>
      notif.id === id ? { ...notif, read: true } : notif
    ));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <>
      <header className="bg-white dark:bg-gray-800 shadow-sm z-50 border-b border-gray-200 dark:border-gray-700 transition-all duration-300 ease-in-out relative header-container">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-xl font-semibold text-gray-800 dark:text-white transition-colors duration-300">
              {getRoleLabel(userRole)} Dashboard
            </h1>
            <div className="flex items-center space-x-4">
              {/* Notification Button */}
              <div className="relative">
                <button 
                  onClick={toggleNotifications}
                  className="p-2 rounded-full text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 relative transition-all duration-300 ease-in-out transform hover:scale-105"
                  title="View notifications"
                  type="button"
                  data-notification-button
                >
                  <span className="sr-only">View notifications</span>
                  <BellIcon size={24} className="transition-transform duration-200 ease-in-out" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-medium">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </button>
              </div>

              {/* Dark Mode Toggle */}
              <DarkModeToggle />

              {/* User Menu */}
              <div className="relative">
                <button 
                  onClick={toggleUserMenu}
                  className="flex items-center p-2 rounded-full text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ease-in-out transform hover:scale-105"
                  disabled={isLoggingOut}
                  title="User menu"
                  type="button"
                  data-user-menu-button
                >
                  <span className="sr-only">Open user menu</span>
                  <div className="w-8 h-8 rounded-full bg-blue-600 dark:bg-blue-500 flex items-center justify-center text-white transition-all duration-300 ease-in-out">
                    <UserIcon size={18} />
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Notification Dropdown - Fixed position overlay */}
      {showNotifications && (
        <div 
          className="fixed inset-0 z-[9998]" 
          onClick={() => setShowNotifications(false)}
        >
          <div 
            className="fixed right-4 sm:right-6 lg:right-8 top-16 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-2xl py-1 border border-gray-200 dark:border-gray-600 z-[9999] animate-in fade-in slide-in-from-top-2 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-600">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Notifications</h3>
                <Link to="/notifications" className="text-sm text-blue-600 hover:text-blue-800 transition-colors duration-200">
                  View all
                </Link>
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 text-center">
                  No notifications
                </div>
              ) : (
                notifications.slice(0, 5).map((notification) => {
                  const isApprovalNotification = notification.type === 'customer-approval';
                  
                  if (isApprovalNotification) {
                    return (
                      <Link
                        key={notification.id}
                        to="/customer-approval"
                        onClick={() => setShowNotifications(false)}
                        className={`block px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 ease-in-out cursor-pointer ${!notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0 mt-1">
                            {getIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {notification.title}
                              <span className="ml-2 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full">
                                Click to review
                              </span>
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{notification.message}</p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                              {new Date(notification.timestamp).toLocaleString()}
                            </p>
                          </div>
                          {!notification.read && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                markAsRead(notification.id);
                                if ((notification as any).userId) {
                                  CustomerApprovalNotificationService.markNotificationRead((notification as any).userId);
                                }
                              }}
                              className="flex-shrink-0 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 ease-in-out"
                              title="Mark as read"
                            >
                              <CheckCircleIcon size={16} className="text-blue-500" />
                            </button>
                          )}
                        </div>
                      </Link>
                    );
                  }

                  return (
                    <div
                      key={notification.id}
                      className={`px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 ease-in-out ${!notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-1">
                          {getIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{notification.title}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{notification.message}</p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            {new Date(notification.timestamp).toLocaleString()}
                          </p>
                        </div>
                        {!notification.read && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(notification.id);
                            }}
                            className="flex-shrink-0 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 ease-in-out"
                            title="Mark as read"
                          >
                            <CheckCircleIcon size={16} className="text-blue-500" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* User Menu Dropdown - Fixed position overlay */}
      {showUserMenu && (
        <div 
          className="fixed inset-0 z-[9998]" 
          onClick={() => setShowUserMenu(false)}
        >
          <div 
            className="fixed right-4 sm:right-6 lg:right-8 top-16 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-2xl py-1 border border-gray-200 dark:border-gray-600 z-[9999] animate-in fade-in slide-in-from-top-2 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <Link
              to="/profile"
              className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 ease-in-out"
              onClick={() => setShowUserMenu(false)}
            >
              <UserIcon size={16} className="mr-2" />
              Your Profile
            </Link>
            <div className="border-t border-gray-100 dark:border-gray-600" />
            <button
              onClick={handleLogout}
              className="flex w-full items-center px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoggingOut}
              type="button"
            >
              <LogOutIcon size={16} className="mr-2" />
              {isLoggingOut ? 'Signing out...' : 'Sign out'}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
