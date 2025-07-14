import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { rbacService } from '../services/rbacService';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface AdminRouteGuardProps {
  children: React.ReactNode;
  fallbackPath?: string;
}

const AdminRouteGuard: React.FC<AdminRouteGuardProps> = ({ 
  children, 
  fallbackPath = '/dashboard' 
}) => {
  const { isAuthenticated, user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    const checkAdminAccess = async () => {
      setIsChecking(true);
      
      try {
        console.log('AdminRouteGuard: Starting access check...');
        
        // Add timeout to prevent hanging
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Timeout: User refresh took too long')), 5000);
        });

        // First ensure user session is fresh (with timeout)
        if (isAuthenticated && refreshUser) {
          console.log('AdminRouteGuard: Refreshing user session...');
          try {
            await Promise.race([refreshUser(), timeoutPromise]);
            console.log('AdminRouteGuard: User session refreshed successfully');
          } catch (refreshError) {
            console.warn('AdminRouteGuard: User refresh failed:', refreshError);
            // Continue with existing user data if refresh fails
          }
        }

        // Multiple access checks
        const checks = [
          // Check auth context user
          user?.role === 'admin',
          // Check RBAC service
          rbacService.hasRole('admin'),
          // Check localStorage fallback
          (() => {
            try {
              const localUser = localStorage.getItem('user');
              if (localUser) {
                const userData = JSON.parse(localUser);
                return userData.role === 'admin';
              }
            } catch (error) {
              console.error('Error checking localStorage user:', error);
            }
            return false;
          })(),
          // Check token validity
          (() => {
            const token = localStorage.getItem('accessToken');
            return !!token;
          })()
        ];

        const hasAdminAccess = checks.some(check => check === true);
        
        console.log('AdminRouteGuard: Access check results:', {
          isAuthenticated,
          userRole: user?.role,
          rbacHasAdmin: rbacService.hasRole('admin'),
          localStorageCheck: checks[2],
          hasValidToken: checks[3],
          finalAccess: hasAdminAccess
        });

        if (!isAuthenticated) {
          console.log('AdminRouteGuard: Not authenticated, redirecting to login');
          navigate('/auth/login', { replace: true });
          return;
        }

        if (!hasAdminAccess) {
          console.log('AdminRouteGuard: No admin access, redirecting to fallback');
          setHasAccess(false);
          setIsChecking(false);
          return;
        }

        setHasAccess(true);
      } catch (error) {
        console.error('AdminRouteGuard: Error checking access:', error);
        setHasAccess(false);
      } finally {
        setIsChecking(false);
      }
    };

    checkAdminAccess();
  }, [isAuthenticated, user?.role, navigate, fallbackPath]); // Removed refreshUser from dependencies

  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="mx-auto h-8 w-8 text-blue-500 animate-spin mb-4" />
          <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
            Verifying Access...
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Checking your admin privileges
          </p>
        </div>
      </div>
    );
  }

  if (!hasAccess && !isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Access Denied
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            You don't have permission to access this admin area.
            {!isAuthenticated && " Please login with an admin account."}
          </p>
          <div className="space-y-2">
            <button
              onClick={() => navigate(fallbackPath)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors block w-full"
            >
              Go to Dashboard
            </button>
            {!isAuthenticated && (
              <button
                onClick={() => navigate('/auth/login')}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors block w-full"
              >
                Login
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AdminRouteGuard;
