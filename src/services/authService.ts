import { API_CONFIG, createApiHeaders } from '../config/api';
import { rbacService } from './rbacService';

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

  // Mock users for development when backend is not available
  private mockUsers = [
    {
      id: '1',
      email: 'admin@toollink.com',
      password: 'admin123',
      name: 'Admin User',
      role: 'admin',
      isActive: true,
      createdAt: new Date().toISOString()
    },
    {
      id: '2',
      email: 'user@toollink.com',
      password: 'user123',
      name: 'Regular User',
      role: 'customer',
      isActive: true,
      createdAt: new Date().toISOString()
    },
    {
      id: '3',
      email: 'warehouse@toollink.com',
      password: 'warehouse123',
      name: 'Warehouse Manager',
      role: 'warehouse',
      isActive: true,
      createdAt: new Date().toISOString()
    },
    {
      id: '4',
      email: 'cashier@toollink.com',
      password: 'cashier123',
      name: 'Cashier User',
      role: 'cashier',
      isActive: true,
      createdAt: new Date().toISOString()
    }
  ];

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

      // Fall back to mock authentication in development
      if (process.env.NODE_ENV === 'development') {
        console.warn('Backend not available, using mock authentication');
        return this.mockLogin(credentials);
      }

      return {
        success: false,
        error: 'Could not connect to authentication server',
        errorType: 'connection'
      };
    }
  }

  private mockLogin(credentials: LoginCredentials): { success: boolean; user?: User; error?: string; errorType?: string } {
    console.log('Using mock authentication for development');

    // Find user in mock data
    const mockUser = this.mockUsers.find(u =>
      u.email === credentials.email && u.password === credentials.password
    );

    if (mockUser) {
      const { password, ...userWithoutPassword } = mockUser;
      const user = userWithoutPassword as User;

      // Generate mock tokens
      const accessToken = 'mock-access-token-' + Date.now();
      const refreshToken = 'mock-refresh-token-' + Date.now();

      // Store tokens and user data
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));

      // Set current user in RBAC service
      rbacService.setCurrentUser({ role: user.role as any });

      console.log('Mock login successful, user stored:', user);
      return { success: true, user };
    }

    return {
      success: false,
      error: 'Invalid email or password',
      errorType: 'invalid_credentials'
    };
  } async register(userData: RegisterData): Promise<{ success: boolean; user?: User; error?: string; errorType?: string; requiresApproval?: boolean }> {
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

      // If backend failed, fall back to mock registration
      return this.mockRegister(userData);

    } catch (error) {
      console.warn('Backend not available, using mock registration:', error);
      // Fall back to mock registration
      return this.mockRegister(userData);
    }
  }

  private mockRegister(userData: RegisterData): { success: boolean; user?: User; error?: string; errorType?: string } {
    console.log('Using mock registration for development');

    // Check if email already exists
    const existingUser = this.mockUsers.find(u => u.email === userData.email);
    if (existingUser) {
      return {
        success: false,
        error: 'Email already registered',
        errorType: 'duplicate_email'
      };
    }    // Create new user
    const newUser: User = {
      id: (this.mockUsers.length + 1).toString(),
      email: userData.email,
      name: userData.fullName,
      role: userData.role || 'customer',
      isActive: true,
      createdAt: new Date().toISOString()
    };

    // Add to mock users (for this session)
    this.mockUsers.push({
      ...newUser,
      password: userData.password
    });

    // Generate mock tokens
    const accessToken = 'mock-access-token-' + Date.now();
    const refreshToken = 'mock-refresh-token-' + Date.now();

    // Store tokens and user data
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(newUser));

    // Set current user in RBAC service
    rbacService.setCurrentUser({ role: newUser.role as any });

    console.log('Mock registration successful, user stored:', newUser);
    return { success: true, user: newUser };
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

      // Clear local storage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');

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
      // Still clear local storage even if server call fails
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
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

      return null;
    } catch (error) {
      console.error('Get current user error:', error);
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
    const token = localStorage.getItem('accessToken');
    return !!token;
  }

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;

    try {
      return JSON.parse(userStr);
    } catch (error) {
      console.error('Error parsing user data:', error);
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
