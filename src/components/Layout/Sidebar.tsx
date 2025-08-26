import { useCallback, useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  ShoppingCartIcon,
  PackageIcon,
  CalendarIcon,
  BellIcon,
  BarChartIcon,
  MessageSquareIcon,
  MailIcon,
  PhoneIcon,
  UserIcon,
  TrendingUpIcon,
  LogOutIcon,
  UsersIcon,
  UserCheckIcon,
  ShieldIcon,
  ActivityIcon
} from 'lucide-react';
import { authService } from '../../services/authService';
import { notificationService } from '../../services/notificationService';
import { safeLogoutWithTimeout } from '../../utils/logoutUtils';
import { useNotification } from '../../contexts/NotificationContext';
import { CustomerApprovalNotificationService } from '../../services/customerApprovalNotificationService';

interface SidebarProps {
  userRole: 'admin' | 'warehouse' | 'cashier' | 'customer';
  onLogout?: () => Promise<void>;
}

const Sidebar = ({ userRole, onLogout }: SidebarProps) => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [pendingApprovalCount, setPendingApprovalCount] = useState(0);
  const { showError } = useNotification();

  // Load unread notification count
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

  // Load pending approval count for admin/cashier
  useEffect(() => {
    const loadPendingApprovalCount = async () => {
      try {
        const count = await CustomerApprovalNotificationService.getPendingCustomerCount(userRole);
        setPendingApprovalCount(count);
      } catch (error) {
        console.error('Error loading pending approval count:', error);
      }
    };

    // Only load for admin/cashier
    if (['admin', 'cashier'].includes(userRole)) {
      loadPendingApprovalCount();

      // Refresh pending approval count every 30 seconds
      const interval = setInterval(loadPendingApprovalCount, 30000);
      return () => clearInterval(interval);
    }
  }, [userRole]); const handleLogout = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      // Show confirmation dialog
      const confirmed = window.confirm('Are you sure you want to sign out? You will need to sign in again to access your account.');
      if (!confirmed) return;

      setIsLoggingOut(true);

      if (onLogout) {
        // Use the parent's logout handler if provided
        await onLogout();
        // The parent handler should handle the redirect, but add fallback
        if (window.location.pathname !== '/auth/login') {
          window.location.replace('/auth/login');
        }
      } else {
        // Fallback to direct authService logout with safe timeout
        await safeLogoutWithTimeout(async () => {
          await authService.logout();
          window.location.replace('/auth/login');
        }, 3000);
      }
    } catch (error) {
      console.error('Sign out failed:', error);
      showError('Sign Out Failed', 'Failed to sign out. Please try again.');
      setIsLoggingOut(false); // Only reset state on error
    }
    // Don't reset isLoggingOut in finally block when using onLogout
    // as the redirect will happen and component will unmount
  }, [onLogout]); const navItems = [
    // Admin Dashboard (first for admins)
    ...(userRole === 'admin' ? [{
      to: '/admin',
      icon: <ShieldIcon size={20} />,
      label: 'Admin Dashboard'
    }] : []),

    // User Management
    ...(userRole === 'admin' ? [{
      to: '/users',
      icon: <UsersIcon size={20} />,
      label: 'User Management'
    }] : []),

    // Customer Approval
    ...(['admin', 'cashier'].includes(userRole) ? [{
      to: '/customer-approval',
      icon: (
        <div className="relative">
          <UserCheckIcon size={20} />
          {pendingApprovalCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-medium shadow-lg animate-pulse">
              {pendingApprovalCount > 9 ? '9+' : pendingApprovalCount}
            </span>
          )}
        </div>
      ),
      label: 'Customer Approval'
    }] : []),

    // Orders
    ...(['admin', 'warehouse', 'cashier'].includes(userRole) ? [{
      to: '/orders',
      icon: <ShoppingCartIcon size={20} />,
      label: 'Orders'
    }] : []),
    ...(userRole === 'customer' ? [{
      to: '/orders',
      icon: <ShoppingCartIcon size={20} />,
      label: 'My Orders'
    }] : []),

    // Inventory
    ...(['admin', 'warehouse'].includes(userRole) ? [{
      to: '/inventory',
      icon: <PackageIcon size={20} />,
      label: 'Inventory'
    }] : []),

    // Deliveries
    ...(['admin', 'warehouse', 'cashier'].includes(userRole) ? [{
      to: '/deliveries',
      icon: <CalendarIcon size={20} />,
      label: 'Deliveries'
    }] : []),
    ...(userRole === 'customer' ? [{
      to: '/deliveries',
      icon: <CalendarIcon size={20} />,
      label: 'Track Deliveries'
    }] : []),

    // Notifications (Enhanced with unread count)
    {
      to: '/notifications',
      icon: (
        <div className="relative">
          <BellIcon size={20} />
          {unreadCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-medium shadow-lg animate-pulse">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </div>
      ),
      label: 'Notifications'
    },

    // Reports (different for admin vs others)
    ...(userRole === 'admin' ? [{
      to: '/admin/reports',
      icon: <BarChartIcon size={20} />,
      label: 'System Reports'
    }] : []),
    ...(['warehouse', 'cashier', 'user'].includes(userRole) ? [{
      to: '/reports',
      icon: <BarChartIcon size={20} />,
      label: 'Reports'
    }] : []),

    // Admin Audit Logs
    ...(userRole === 'admin' ? [{
      to: '/admin/audit-logs',
      icon: <ActivityIcon size={20} />,
      label: 'Audit Logs'
    }] : []),

    // Messages (Admin & Cashier)
    ...(['admin', 'cashier'].includes(userRole) ? [{
      to: '/admin/messages',
      icon: <MailIcon size={20} />,
      label: 'Customer Messages'
    }] : []),

    // Feedback
    {
      to: '/feedback',
      icon: <MessageSquareIcon size={20} />,
      label: userRole === 'customer' ? 'Submit Feedback' : 'Feedback'
    },

    // Contact (only for non-admin users)
    ...(userRole !== 'admin' ? [{
      to: '/contact',
      icon: <PhoneIcon size={20} />,
      label: 'Contact Us'
    }] : []),

    // Profile
    {
      to: '/profile',
      icon: <UserIcon size={20} />,
      label: 'Profile'
    },

    // Material Predictions (Admin only)
    ...(['admin'].includes(userRole) ? [{
      to: '/predictions',
      icon: <TrendingUpIcon size={20} />,
      label: 'Predictions'
    }] : [])
  ]; return (
    <div className="h-full flex flex-col bg-[#0B2545] dark:bg-gray-900 text-white transition-all duration-300 ease-in-out">
      {/* Logo */}
      <div className="flex items-center justify-center h-16 border-b border-[#0B2545]/40 dark:border-gray-700 transition-colors duration-300">
        <div className="flex items-center space-x-2">
          <div className="text-[#FF6B35] w-7 h-7 transition-transform duration-300 hover:scale-110" />
          <span className="text-xl font-bold transition-colors duration-300">ToolLink</span>
        </div>
      </div>
      {/* Navigation Items */}
      <div className="flex-1 py-6 overflow-y-auto">
        <nav className="px-2 space-y-1">
          {navItems.map((item, index) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `
                flex items-center px-4 py-3 text-sm font-medium rounded-md
                transition-all duration-300 ease-in-out
                transform hover:scale-[1.02] hover:translate-x-1
                ${isActive
                  ? 'bg-[#FF6B35] text-white shadow-lg shadow-orange-500/25'
                  : 'text-gray-300 dark:text-gray-400 hover:bg-[#0B2545]/80 dark:hover:bg-gray-700 hover:text-white dark:hover:text-white hover:shadow-md'
                }
              `}
              style={{
                animationDelay: `${index * 50}ms`
              }}
            >
              <span className="mr-3 transition-transform duration-200 group-hover:scale-110">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
      {/* Logout Button */}
      <div className="p-4 border-t border-[#0B2545]/40 dark:border-gray-700 transition-colors duration-300">
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="flex items-center w-full px-4 py-3 text-sm font-medium text-gray-300 dark:text-gray-400 rounded-md hover:bg-[#0B2545]/80 dark:hover:bg-gray-700 hover:text-white dark:hover:text-white transition-all duration-300 ease-in-out disabled:opacity-50 transform hover:scale-[1.02] hover:translate-x-1"
        >
          <LogOutIcon size={20} className="mr-3 transition-transform duration-200 group-hover:scale-110" />
          {isLoggingOut ? 'Logging out...' : 'Logout'}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
