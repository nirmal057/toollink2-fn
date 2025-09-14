import { API_CONFIG, createApiHeaders } from '../config/api';
import { rbacService } from './rbacService';
import { AuthTokenManager } from '../utils/authTokenManager';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  role?: string;
}

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

class AuthService {
  private static instance: AuthService;

  private constructor() { }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  } async login(credentials: LoginCredentials): Promise<{ success: boolean; user?: User; error?: string; errorType?: string; remainingAttempts?: number }> {
    try {
      // First try the backend API
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.LOGIN}`;

      console.log('Attempting login with API:', url);

      const response = await fetch(url, {
        method: 'POST',
        headers: createApiHeaders(),
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      console.log('Login response:', data);

      // Check if the response contains the expected data structure
      if (response.ok && data.success) {
        // Handle the actual backend response structure
        const user = data.user;
        const accessToken = data.accessToken;
        const refreshToken = data.refreshToken;

        if (user && accessToken) {
          console.log('Login successful - token received');

          // Store tokens and user data
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('token', accessToken); // For compatibility with OrderManagement component
          localStorage.setItem('refreshToken', refreshToken || accessToken);
          localStorage.setItem('user', JSON.stringify(user));

          // Set current user in RBAC service
          rbacService.setCurrentUser({ role: user.role as any });

          console.log('Login successful, user stored and RBAC initialized');
          return { success: true, user };
        }
      }

      // Handle specific error for pending approval
      if (data.pendingApproval) {
        return {
          success: false,
          error: data.message || 'Your account is pending approval',
          errorType: 'approval'
        };
      }

      // Handle 401 Unauthorized specifically
      if (response.status === 401) {
        return {
          success: false,
          error: data.message || 'Invalid email or password',
          errorType: 'INVALID_CREDENTIALS'
        };
      }

      // Other login failures
      return {
        success: false,
        error: data.message || 'Login failed. Please try again.',
        errorType: 'credentials'
      };

    } catch (error) {
      console.error('Login error:', error);

      // Log detailed error for debugging
      console.error('Authentication server connection failed:', {
        error: error,
        message: error instanceof Error ? error.message : 'Unknown error',
        url: `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.LOGIN}`
      });

      return {
        success: false,
        error: 'Could not connect to authentication server. Please check if the backend server is running on http://localhost:5001',
        errorType: 'connection'
      };
    }
  }

  async register(userData: RegisterData): Promise<{ success: boolean; user?: User; error?: string; errorType?: string; requiresApproval?: boolean }> {
    try {
      // First try the backend API
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.REGISTER}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: createApiHeaders(),
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // If user is auto-approved and has tokens, store them
        if (data.user && data.accessToken && !data.requiresApproval) {
          const { user, accessToken, refreshToken } = data;

          // Store tokens and user data
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('token', accessToken); // For compatibility with OrderManagement component
          localStorage.setItem('refreshToken', refreshToken);
          localStorage.setItem('user', JSON.stringify(user));

          // Set current user in RBAC service
          rbacService.setCurrentUser({ role: user.role as any });

          console.log('Registration successful, user stored:', user);
          return { success: true, user };
        } else {
          // User registered but requires approval
          console.log('Registration successful, awaiting approval');
          return {
            success: true,
            requiresApproval: data.requiresApproval,
            user: data.user
          };
        }
      } else {
        // Registration failed
        return {
          success: false,
          error: data.error || 'Registration failed',
          errorType: data.errorType
        };
      }

    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        error: 'Could not connect to registration server. Please check if the backend server is running.',
        errorType: 'connection'
      };
    }
  }

  async logout(): Promise<void> {
    try {
      const refreshToken = localStorage.getItem('refreshToken');

      if (refreshToken) {
        // Try to logout from server
        const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.LOGOUT}`;

        try {
          await fetch(url, {
            method: 'POST',
            headers: createApiHeaders(),
            body: JSON.stringify({ refreshToken }),
          });
        } catch (error) {
          // Ignore server errors during logout
          console.warn('Server logout failed, proceeding with local cleanup:', error);
        }
      }

      // Use token manager to clear all authentication data
      AuthTokenManager.clearAuthData();

      // Clear RBAC service
      rbacService.setCurrentUser(null);

      // Clear any cookies (if used)
      document.cookie.split(";").forEach(cookie => {
        const eqPos = cookie.indexOf("=");
        const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
      });
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear authentication data even if server call fails
      AuthTokenManager.clearAuthData();
      // Clear RBAC service
      rbacService.setCurrentUser(null);
    }
  }

  async refreshToken(): Promise<boolean> {
    try {
      const refreshToken = localStorage.getItem('refreshToken');

      if (!refreshToken) {
        return false;
      }

      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.REFRESH}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: createApiHeaders(),
        body: JSON.stringify({ refreshToken }),
      });

      const data = await response.json();

      if (response.ok && data.success && data.accessToken) {
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('token', data.accessToken); // For compatibility with OrderManagement component
        return true;
      }

      return false;
    } catch (error) {
      console.error('Token refresh error:', error);
      return false;
    }
  }

  async getCurrentUserFromServer(): Promise<User | null> {
    try {
      const token = localStorage.getItem('accessToken');

      if (!token) {
        return null;
      }

      // Check if token is expired before making the request
      if (AuthTokenManager.isTokenExpired(token)) {
        console.log('Token is expired, clearing auth data');
        AuthTokenManager.clearAuthData();
        return null;
      }

      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.ME}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: createApiHeaders(token),
      });

      const data = await response.json();

      if (response.ok && data.success && data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
        // Set current user in RBAC service
        rbacService.setCurrentUser({ role: data.user.role as any });
        return data.user;
      }

      // Handle authentication errors
      if (response.status === 401) {
        console.log('Server returned 401, clearing auth data');
        AuthTokenManager.clearAuthData();
        return null;
      }

      return null;
    } catch (error) {
      console.error('Get current user error:', error);
      // If it's a network error, don't clear auth data
      // If it's an auth error, the server would have returned 401
      return null;
    }
  }

  async forgotPassword(email: string): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.FORGOT_PASSWORD || '/auth/forgot-password'}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: createApiHeaders(),
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      return {
        success: data.success,
        message: data.message,
        error: data.error,
      };
    } catch (error) {
      console.error('Forgot password error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send reset email'
      };
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.RESET_PASSWORD}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: createApiHeaders(),
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await response.json();

      return {
        success: data.success,
        message: data.message,
        error: data.error,
      };
    } catch (error) {
      console.error('Reset password error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to reset password'
      };
    }
  }

  isAuthenticated(): boolean {
    // Use the token manager to validate authentication state
    return AuthTokenManager.validateAndCleanAuthState();
  }

  getCurrentUser(): User | null {
    // First validate the authentication state
    if (!AuthTokenManager.validateAndCleanAuthState()) {
      return null;
    }

    const userStr = localStorage.getItem('user');
    if (!userStr) return null;

    try {
      return JSON.parse(userStr);
    } catch (error) {
      console.error('Error parsing user data:', error);
      AuthTokenManager.clearAuthData();
      return null;
    }
  }

  getToken(): string | null {
    return localStorage.getItem('accessToken');
  }
}

// Create and export the singleton instance
const authService = AuthService.getInstance();
export { authService };
export default authService;
