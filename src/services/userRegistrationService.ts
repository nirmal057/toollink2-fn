import { authService } from './authService';
import { API_CONFIG, createApiHeaders, ApiResponse } from '../config/api';

interface CustomerRegistrationData {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  role?: 'customer';
}

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

class UserRegistrationService {
  private static instance: UserRegistrationService;

  private constructor() { }

  public static getInstance(): UserRegistrationService {
    if (!UserRegistrationService.instance) {
      UserRegistrationService.instance = new UserRegistrationService();
    }
    return UserRegistrationService.instance;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${API_CONFIG.BASE_URL}${endpoint}`;

      const response = await fetch(url, {
        ...options,
        headers: {
          ...createApiHeaders(),
          ...options.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  /**
   * Register a new customer using the backend API
   */
  async registerCustomer(registrationData: CustomerRegistrationData): Promise<{
    success: boolean;
    user?: User;
    error?: string;
    requiresApproval?: boolean;
  }> {
    try {      // Prepare registration data for backend
      const registerData = {
        username: registrationData.email.split('@')[0], // Generate username from email
        email: registrationData.email,
        password: registrationData.password,
        fullName: registrationData.fullName,
        phone: registrationData.phone,
        role: 'customer',
      };

      // Use the auth service to register the user
      const result = await authService.register(registerData);

      if (result.success) {
        console.log('Customer registered successfully:', result.user);
        return {
          success: true,
          user: result.user,
          requiresApproval: result.requiresApproval || false,
        };
      }

      return {
        success: false,
        error: result.error || 'Registration failed',
      };
    } catch (error) {
      console.error('Customer registration error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Registration failed. Please try again.',
      };
    }
  }

  /**
   * Check if email is already registered
   */
  async isEmailRegistered(email: string): Promise<boolean> {
    try {
      const response = await this.makeRequest<{ exists: boolean }>(
        `/api/auth/check-email`,
        {
          method: 'POST',
          body: JSON.stringify({ email }),
        }
      );

      return response.data?.exists || false;
    } catch (error) {
      console.error('Email check error:', error);
      // If we can't check, assume it might exist to be safe
      return false;
    }
  }

  /**
   * Validate registration data
   */
  validateRegistrationData(data: CustomerRegistrationData): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!data.fullName || data.fullName.length < 2) {
      errors.push('Full name must be at least 2 characters long');
    }

    if (!data.email || !this.isValidEmail(data.email)) {
      errors.push('Please enter a valid email address');
    }

    if (!data.phone || data.phone.length < 10) {
      errors.push('Please enter a valid phone number');
    }

    if (!data.password || data.password.length < 6) {
      errors.push('Password must be at least 6 characters long');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

export const userRegistrationService = UserRegistrationService.getInstance();
export default userRegistrationService;
export type { CustomerRegistrationData };
