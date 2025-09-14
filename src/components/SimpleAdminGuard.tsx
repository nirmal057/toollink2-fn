import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { rbacService } from '../services/rbacService';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface SimpleAdminGuardProps {
  children: React.ReactNode;
  fallbackPath?: string;
}

const SimpleAdminGuard: React.FC<SimpleAdminGuardProps> = ({ 
  children, 
  fallbackPath = '/dashboard' 
}) => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [checkComplete, setCheckComplete] = useState(false);

  useEffect(() => {
    // Simple, fast check without async operations
    const timer = setTimeout(() => {
      setCheckComplete(true);
    }, 100); // Very short delay to allow auth context to stabilize

    return () => clearTimeout(timer);
  }, []);

  // Fast synchronous admin check with token validation
  const isAdmin = (() => {
    // First check if we have a valid token
    const token = localStorage.getItem('accessToken');
    if (!token) {
      console.log('SimpleAdminGuard: No access token found');
      return false;
    }

    // Multiple quick checks with case insensitivity
    const checks = [
      // Check auth context user
      user?.role?.toLowerCase() === 'admin',
      // Check RBAC service
      rbacService.hasRole('admin'),
      // Check localStorage fallback
      (() => {
        try {
          const localUser = localStorage.getItem('user');
          if (localUser) {
            const userData = JSON.parse(localUser);
            return userData.role?.toLowerCase() === 'admin';
          }
        } catch (error) {
          console.error('Error checking localStorage user:', error);
        }
        return false;
      })()
    ];

    const hasAdminAccess = checks.some(check => check === true);
    
    console.log('SimpleAdminGuard: Quick access check:', {
      isAuthenticated,
      hasToken: !!token,
      userRole: user?.role,
      rbacHasAdmin: rbacService.hasRole('admin'),
      localStorageUser: (() => {
        try {
          const localUser = localStorage.getItem('user');
          return localUser ? JSON.parse(localUser) : null;
        } catch {
          return null;
        }
      })(),
      finalAccess: hasAdminAccess
    });

    return hasAdminAccess;
  })();

  // Show loading only very briefly
  if (!checkComplete) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="mx-auto h-6 w-6 text-blue-500 animate-spin mb-2" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Authentication Required
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Please login with an admin account to access this area.
          </p>
          <button
            onClick={() => navigate('/auth/login')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  // Not admin
  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Access Denied
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            You don't have permission to access this admin area. 
            Admin privileges are required.
          </p>
          <div className="space-y-2">
            <button
              onClick={() => navigate(fallbackPath)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors block w-full"
            >
              Go to Dashboard
            </button>
            <button
              onClick={() => navigate('/auth/login')}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors block w-full"
            >
              Login as Admin
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Admin access granted
  return <>{children}</>;
};

export default SimpleAdminGuard;
