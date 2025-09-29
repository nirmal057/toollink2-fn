import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { authService } from '../services/authService';
import { rbacService, Role, Permission } from '../services/rbacService';
import { AuthTokenManager } from '../utils/authTokenManager';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  warehouseCode?: string; // Warehouse code for warehouse users (W1, W2, W3, WM)
  isActive: boolean;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; errorType?: string; remainingAttempts?: number }>;
  register: (userData: any) => Promise<{ success: boolean; error?: string; requiresApproval?: boolean }>;
  logout: () => Promise<void>;
  hasPermission: (permission: Permission) => boolean;
  hasRole: (role: Role) => boolean;
  hasAnyRole: (roles: Role[]) => boolean;
  canAccessRoute: (route: string) => boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Enhanced authentication check with fallback
  const isAuthenticated = React.useMemo(() => {
    // Check multiple sources for authentication state
    const hasUser = !!user;
    const hasToken = authService.isAuthenticated();
    const localUser = authService.getCurrentUser();

    return hasUser || (hasToken && localUser !== null);
  }, [user]);

  // Enhanced user sync with localStorage and RBAC service
  const syncUserState = React.useCallback(() => {
    try {
      // Use the token manager to validate state
      if (!AuthTokenManager.validateAndCleanAuthState()) {
        if (user) {
          console.log('Auth: Clearing invalid user state');
          setUser(null);
          rbacService.setCurrentUser(null);
        }
        return false;
      }

      const storedUser = authService.getCurrentUser();
      const token = localStorage.getItem('accessToken');

      if (storedUser && token) {
        // Update state if user is different
        if (!user || user.id !== storedUser.id || user.role !== storedUser.role) {
          console.log('Auth: Syncing user state:', storedUser);
          setUser(storedUser);
        }

        // Always ensure RBAC is synced
        rbacService.setCurrentUser({ role: storedUser.role as Role });

        return true;
      } else if (user) {
        // Clear user if no stored data
        console.log('Auth: Clearing stale user state');
        setUser(null);
        rbacService.setCurrentUser(null);
        return false;
      }
    } catch (error) {
      console.error('Auth: Error syncing user state:', error);
      setUser(null);
      rbacService.setCurrentUser(null);
      AuthTokenManager.clearAuthData();
      return false;
    }

    return false;
  }, [user]);

  // Ensure RBAC service is always synced with current user
  useEffect(() => {
    if (user && user.role) {
      rbacService.setCurrentUser({ role: user.role as Role });
      console.log('Auth: RBAC service synced with user:', user.role);
    } else if (!user) {
      rbacService.setCurrentUser(null);
      console.log('Auth: RBAC service cleared');
    }
  }, [user]);

  // Enhanced storage sync with more frequent checks
  useEffect(() => {
    // Initial sync
    syncUserState();

    // Set up periodic sync to handle navigation and session restoration
    const syncInterval = setInterval(syncUserState, 2000); // Check every 2 seconds (reduced from 500ms)

    // Listen for storage events (cross-tab synchronization)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'user' || e.key === 'accessToken') {
        console.log('Auth: Storage changed, syncing user state');
        syncUserState();
      }
    };

    // Listen for force logout events
    const handleForceLogout = () => {
      console.log('Auth: Force logout event received');
      setUser(null);
      rbacService.setCurrentUser(null);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('auth:forceLogout', handleForceLogout);

    return () => {
      clearInterval(syncInterval);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('auth:forceLogout', handleForceLogout);
    };
  }, [syncUserState]);// Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const currentUser = authService.getCurrentUser();
        if (currentUser && authService.isAuthenticated()) {
          setUser(currentUser);
          // Set current user in RBAC service
          rbacService.setCurrentUser({ role: currentUser.role as Role });

          // Try to refresh user data from server
          try {
            const serverUser = await authService.getCurrentUserFromServer();
            if (serverUser) {
              setUser(serverUser);
              rbacService.setCurrentUser({ role: serverUser.role as Role });
            }
          } catch (error) {
            console.warn('Could not refresh user from server:', error);
            // Keep using cached user data
          }
        } else {
          // Clear any stale data
          await authService.logout();
          setUser(null);
          rbacService.setCurrentUser(null);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setUser(null);
        rbacService.setCurrentUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Auto-refresh token
  useEffect(() => {
    if (!isAuthenticated) return;

    const refreshInterval = setInterval(async () => {
      try {
        const refreshed = await authService.refreshToken();
        if (!refreshed) {
          // Token refresh failed, logout user
          await logout();
        }
      } catch (error) {
        console.error('Token refresh error:', error);
        await logout();
      }
    }, 14 * 60 * 1000); // Refresh every 14 minutes

    return () => clearInterval(refreshInterval);
  }, [isAuthenticated]);
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const result = await authService.login({ email, password });

      if (result.success && result.user) {
        setUser(result.user);
        // Set current user in RBAC service for permission checking
        rbacService.setCurrentUser({ role: result.user.role as Role });
        return { success: true };
      }

      return {
        success: false,
        error: result.error,
        errorType: result.errorType,
        remainingAttempts: result.remainingAttempts
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Login failed'
      };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: any) => {
    setIsLoading(true);
    try {
      const result = await authService.register(userData);

      if (result.success) {
        // Only set user if they don't require approval
        if (result.user && !result.requiresApproval) {
          setUser(result.user);
        }
        return {
          success: true,
          requiresApproval: result.requiresApproval
        };
      }

      return { success: false, error: result.error };
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Registration failed'
      };
    } finally {
      setIsLoading(false);
    }
  };
  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
      setUser(null);
      rbacService.setCurrentUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      // Clear user state even if logout fails
      setUser(null);
      rbacService.setCurrentUser(null);
    } finally {
      setIsLoading(false);
    }
  };
  const refreshUser = async () => {
    try {
      console.log('useAuth: Starting user refresh...');

      // Add timeout to prevent hanging
      const timeoutPromise = new Promise<null>((_, reject) => {
        setTimeout(() => reject(new Error('User refresh timeout')), 3000);
      });

      const refreshPromise = authService.getCurrentUserFromServer();
      const serverUser = await Promise.race([refreshPromise, timeoutPromise]);

      if (serverUser && typeof serverUser === 'object' && 'role' in serverUser) {
        console.log('useAuth: User refresh successful:', serverUser);
        setUser(serverUser);
        rbacService.setCurrentUser({ role: serverUser.role as Role });
      } else {
        console.log('useAuth: No valid user data returned from server');
      }
    } catch (error) {
      console.error('Refresh user error:', error);
      // Don't throw the error, just log it and continue
    }
  };

  const hasPermission = (permission: Permission): boolean => {
    return rbacService.hasPermission(permission);
  };

  const hasRole = (role: Role): boolean => {
    return rbacService.hasRole(role);
  };

  const hasAnyRole = (roles: Role[]): boolean => {
    return rbacService.hasAnyRole(roles);
  };

  const canAccessRoute = (route: string): boolean => {
    return rbacService.canAccessRoute(route);
  };

  const contextValue: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    hasPermission,
    hasRole,
    hasAnyRole,
    canAccessRoute,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Hook for protected routes
export function useProtectedRoute(allowedRoles?: Role[]) {
  const { isAuthenticated, hasAnyRole, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        // Redirect to login
        window.location.href = '/login';
        return;
      }

      if (allowedRoles && !hasAnyRole(allowedRoles)) {
        // Redirect to unauthorized page or dashboard
        window.location.href = '/unauthorized';
        return;
      }
    }
  }, [isAuthenticated, isLoading, allowedRoles, hasAnyRole]);

  return { isAuthenticated, isLoading };
}

// Component wrapper for role-based rendering
interface RoleGuardProps {
  children: ReactNode;
  roles?: Role[];
  permissions?: Permission[];
  fallback?: ReactNode;
}

export function RoleGuard({ children, roles, permissions, fallback = null }: RoleGuardProps) {
  const { hasAnyRole, hasPermission, user } = useAuth();

  // Admin users have access to everything
  if (user?.role?.toLowerCase() === 'admin') {
    return <>{children}</>;
  }

  // Check role access
  if (roles && !hasAnyRole(roles)) {
    return <>{fallback}</>;
  }

  // Check permission access
  if (permissions && !permissions.some(permission => hasPermission(permission))) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
