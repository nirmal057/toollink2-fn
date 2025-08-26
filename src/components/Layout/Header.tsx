import { useCallback, useEffect, useState } from 'react';
import { UserIcon, LogOutIcon, LogInIcon, ShieldIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { authService } from '../../services/authService';
import { safeLogoutWithTimeout } from '../../utils/logoutUtils';
import { useAuth } from '../../hooks/useAuth';
import { rbacService } from '../../services/rbacService';
import DarkModeToggle from '../UI/DarkModeToggle';
import NotificationDropdown from '../UI/NotificationDropdown';
import { useNotification } from '../../contexts/NotificationContext';

interface HeaderProps {
  userRole: 'admin' | 'warehouse' | 'cashier' | 'customer' | string;
}

const Header = ({ userRole }: HeaderProps) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const { showError } = useNotification();

  // Debug render
  console.log('Header render', {
    showUserMenu,
    userRole,
    isAuthenticated,
    user
  });

  // Handle menu toggles
  const toggleUserMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowUserMenu(prev => !prev);
  }, []);

  // Close menus when clicking outside
  const handleClickOutside = useCallback((event: MouseEvent | TouchEvent) => {
    const target = event.target as HTMLElement;

    // Don't close if clicking inside the menus or buttons
    const userMenuContainer = target.closest('.user-menu-container');
    const userMenuButton = target.closest('[data-user-menu-button]');

    if (userMenuContainer || userMenuButton) {
      return;
    }

    setShowUserMenu(false);
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

      // Perform logout with safe timeout
      await safeLogoutWithTimeout(async () => {
        await authService.logout();
        window.location.replace('/auth/login');
      }, 3000);
    } catch (error) {
      console.error('Sign out failed:', error);
      showError('Sign Out Failed', 'Failed to sign out. Please try again.');
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

  return (
    <>
      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes connectedPulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.05);
          }
        }

        @keyframes signalWave {
          0% {
            transform: scale(0.8);
            opacity: 1;
          }
          100% {
            transform: scale(2);
            opacity: 0;
          }
        }

        .animate-connected-pulse {
          animation: connectedPulse 2s infinite;
        }

        .animate-signal-wave {
          animation: signalWave 1.5s infinite;
        }
      `}</style>

      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 transition-all duration-300 ease-in-out fixed top-0 left-0 right-0 header-container" style={{ zIndex: 9999 }}>
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-xl font-semibold text-gray-800 dark:text-white transition-colors duration-300">
              {isAuthenticated ? `${getRoleLabel(userRole)} Dashboard` : 'ToolLink Dashboard'}
            </h1>
            <div className="flex items-center space-x-4">
              {/* Dark Mode Toggle */}
              <DarkModeToggle />

              {/* Notifications - Only show for authenticated users */}
              {isAuthenticated && (
                <NotificationDropdown />
              )}

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

      {/* User Menu Dropdown - Fixed position overlay with maximum z-index */}
      {showUserMenu && (
        <div
          className="fixed inset-0"
          style={{ zIndex: 2147483646 }}
          onClick={() => setShowUserMenu(false)}
        >
          <div
            className="fixed right-4 sm:right-6 lg:right-8 top-16 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-2xl py-1 border border-gray-200 dark:border-gray-600 animate-in fade-in slide-in-from-top-2 duration-200 user-menu-container"
            style={{
              zIndex: 2147483647,
              transform: 'translateZ(0)',
              backfaceVisibility: 'hidden'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {isAuthenticated ? (
              // Authenticated user menu items
              <>
                {/* Admin Dashboard Link - only show for admin users */}
                {(user?.role === 'admin' || rbacService.hasRole('admin')) && (
                  <>
                    <Link
                      to="/admin"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 ease-in-out"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <ShieldIcon size={16} className="mr-2" />
                      Admin Dashboard
                    </Link>
                    <div className="border-t border-gray-100 dark:border-gray-600" />
                  </>
                )}

                <Link
                  to="/profile"
                  className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 ease-in-out"
                  onClick={() => setShowUserMenu(false)}
                >
                  <UserIcon size={16} className="mr-2" />
                  Profile
                </Link>
                <div className="border-t border-gray-100 dark:border-gray-600" />
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isLoggingOut}
                  type="button"
                >
                  <LogOutIcon size={16} className="mr-2" />
                  {isLoggingOut ? 'Signing out...' : 'Sign Out'}
                </button>
              </>
            ) : (
              // Not authenticated user menu items
              <Link
                to="/auth/login"
                className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 ease-in-out"
                onClick={() => setShowUserMenu(false)}
              >
                <LogInIcon size={16} className="mr-2" />
                Log In
              </Link>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
