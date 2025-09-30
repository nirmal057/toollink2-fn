import { useCallback, useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  ShoppingCartIcon,
  PackageIcon,
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
  ActivityIcon,
  AlertCircleIcon,
  PlusIcon,
  TruckIcon,
  CalendarIcon,
  ClipboardListIcon,

  WrenchIcon
} from 'lucide-react';
import NotificationDropdown from '../UI/NotificationDropdown';
import { authService } from '../../services/authService';
import { safeLogoutWithTimeout } from '../../utils/logoutUtils';
import { useNotification } from '../../contexts/NotificationContext';
import { CustomerApprovalNotificationService } from '../../services/customerApprovalNotificationService';
import { useAuth } from '../../hooks/useAuth';

interface SidebarProps {
  userRole: 'admin' | 'warehouse' | 'cashier' | 'customer';
  onLogout?: () => Promise<void>;
}

const Sidebar = ({ userRole, onLogout }: SidebarProps) => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [pendingApprovalCount, setPendingApprovalCount] = useState(0);
  const { user } = useAuth();
  const { showError } = useNotification();

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
  }, [userRole]);

  const handleLogout = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowLogoutModal(true);
  }, []);

  const confirmLogout = useCallback(async () => {
    try {
      setShowLogoutModal(false);
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
  }, [onLogout, showError]);

  const cancelLogout = useCallback(() => {
    setShowLogoutModal(false);
  }, []);

  // Normalize role to handle case sensitivity
  const normalizedRole = userRole?.toLowerCase?.() || userRole;
  const isAdmin = normalizedRole === 'admin';

  const navItems = [
    // Admin Dashboard (first for admins)
    ...(isAdmin ? [{
      to: '/admin',
      icon: <ShieldIcon size={20} />,
      label: 'Admin Dashboard'
    }] : []),

    // User Management
    ...(isAdmin ? [{
      to: '/users',
      icon: <UsersIcon size={20} />,
      label: 'User Management'
    }] : []),

    // Customer Approval
    ...([normalizedRole].includes('admin') || ['cashier'].includes(normalizedRole) ? [{
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
    ...([normalizedRole].includes('admin') || ['warehouse', 'cashier'].includes(normalizedRole) ? [{
      to: '/orders',
      icon: <ShoppingCartIcon size={20} />,
      label: 'Orders'
    }] : []),
    ...(normalizedRole === 'customer' ? [{
      to: '/orders',
      icon: <ShoppingCartIcon size={20} />,
      label: 'My Orders'
    }] : []),

    // Inventory
    ...([normalizedRole].includes('admin') || ['warehouse'].includes(normalizedRole) ? [{
      to: '/inventory',
      icon: <PackageIcon size={20} />,
      label: 'Inventory'
    }] : []),

    // Quick Add Inventory (Admin & Warehouse only)
    ...([normalizedRole].includes('admin') || ['warehouse'].includes(normalizedRole) ? [{
      to: '/inventory/quick-add',
      icon: <PlusIcon size={20} />,
      label: 'Quick Add Inventory'
    }] : []),

    // Delivery Management (All authenticated users can access)
    {
      to: '/delivery-management',
      icon: <TruckIcon size={20} />,
      label: 'Delivery Management'
    },

    // Warehouse-Specific Pages (Warehouse only - shows warehouse-specific sub-orders)
    ...(normalizedRole === 'warehouse' && user?.warehouseCode ? [{
      to: user.warehouseCode === 'W1' ? '/warehouse/w1/sub-orders' :
        user.warehouseCode === 'W2' ? '/warehouse/w2/sub-orders' :
          user.warehouseCode === 'W3' ? '/warehouse/w3/sub-orders' :
            user.warehouseCode === 'WM' ? '/warehouse/wm/sub-orders' : '/my-deliveries',
      icon: user.warehouseCode === 'W1' ? <PackageIcon size={20} /> :
        user.warehouseCode === 'W2' ? <PackageIcon size={20} /> :
          user.warehouseCode === 'W3' ? <ShieldIcon size={20} /> :
            user.warehouseCode === 'WM' ? <WrenchIcon size={20} /> : <ClipboardListIcon size={20} />,
      label: user.warehouseCode === 'W1' ? 'W1 - Sub-Orders' :
        user.warehouseCode === 'W2' ? 'W2 - Sub-Orders' :
          user.warehouseCode === 'W3' ? 'W3 - Sub-Orders' :
            user.warehouseCode === 'WM' ? 'WM - Sub-Orders' : 'My Deliveries'
    }] : []),

    // Warehouse Delivery Management (Warehouse only)
    ...(normalizedRole === 'warehouse' ? [{
      to: '/warehouse/delivery-management',
      icon: <TruckIcon size={20} />,
      label: 'Delivery Management'
    }] : []),

    // Warehouse Delivery Calendar (Warehouse only)
    ...(normalizedRole === 'warehouse' ? [{
      to: '/warehouse/delivery-calendar',
      icon: <CalendarIcon size={20} />,
      label: 'Delivery Calendar'
    }] : []),

    // Driver Management (Admin & Warehouse only)
    ...([normalizedRole].includes('admin') || ['warehouse'].includes(normalizedRole) ? [{
      to: '/driver-management',
      icon: <TruckIcon size={20} />,
      label: 'Driver Management'
    }] : []),

    // Activities (Admin only)
    ...(isAdmin ? [{
      to: '/admin/activities',
      icon: <ActivityIcon size={20} />,
      label: 'System Activities'
    }] : []),

    // Reports (different for admin vs others)
    ...(isAdmin ? [{
      to: '/admin/reports',
      icon: <BarChartIcon size={20} />,
      label: 'System Reports'
    }] : []),
    ...(['warehouse', 'cashier', 'user'].includes(normalizedRole) ? [{
      to: '/reports',
      icon: <BarChartIcon size={20} />,
      label: 'Reports'
    }] : []),

    // Admin Audit Logs
    ...(isAdmin ? [{
      to: '/admin/audit-logs',
      icon: <ActivityIcon size={20} />,
      label: 'Audit Logs'
    }] : []),

    // Messages (Admin & Cashier)
    ...([normalizedRole].includes('admin') || ['cashier'].includes(normalizedRole) ? [{
      to: '/admin/messages',
      icon: <MailIcon size={20} />,
      label: 'Customer Messages'
    }] : []),

    // Material Predictions (Admin only)
    ...(isAdmin ? [{
      to: '/predictions',
      icon: <TrendingUpIcon size={20} />,
      label: 'Material Predictions'
    }] : []),

    // Feedback
    {
      to: '/feedback',
      icon: <MessageSquareIcon size={20} />,
      label: normalizedRole === 'customer' ? 'Submit Feedback' : 'Feedback'
    },

    // Contact (only for customers)
    ...(normalizedRole === 'customer' ? [{
      to: '/contact',
      icon: <PhoneIcon size={20} />,
      label: 'Contact Us'
    }] : []),

    // Profile (accessible to all users)
    {
      to: '/profile',
      icon: <UserIcon size={20} />,
      label: 'Profile'
    }
  ];

  return (
    <div className="h-full flex flex-col bg-[#0B2545] dark:bg-gray-900 text-white transition-all duration-300 ease-in-out">
      {/* Logo with Notification Icon */}
      <div className="flex items-center justify-between h-16 border-b border-[#0B2545]/40 dark:border-gray-700 transition-colors duration-300 px-4">
        <div className="flex items-center space-x-2">
          <div className="text-[#FF6B35] w-7 h-7 transition-transform duration-300 hover:scale-110" />
          <span className="text-xl font-bold transition-colors duration-300">ToolLink</span>
        </div>

        {/* Notification Dropdown */}
        <NotificationDropdown className="relative" />
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

      {/* Beautiful Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300 scale-100 animate-in">
            {/* Modal Header */}
            <div className="p-6 text-center border-b border-gray-200 dark:border-gray-700">
              <div className="mx-auto flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-orange-400 to-red-500 mb-4">
                <AlertCircleIcon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Confirm Logout
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                Are you sure you want to logout? You will need to sign in again to access your account.
              </p>
            </div>

            {/* Modal Actions */}
            <div className="p-6 flex flex-col sm:flex-row gap-3">
              <button
                onClick={cancelLogout}
                className="flex-1 px-6 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-all duration-200 transform hover:scale-[1.02]"
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                disabled={isLoggingOut}
                className="flex-1 px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-orange-500 to-red-600 border border-transparent rounded-xl hover:from-orange-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
              >
                {isLoggingOut ? (
                  <div className="flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Logging out...
                  </div>
                ) : (
                  'Yes, Logout'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
