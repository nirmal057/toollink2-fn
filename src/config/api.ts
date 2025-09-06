import axios from 'axios';

// API Configuration
export const API_CONFIG = {
  BASE_URL: 'http://localhost:5001',
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/api/auth/login',
      REGISTER: '/api/auth/register',
      LOGOUT: '/api/auth/logout',
      REFRESH: '/api/auth/refresh-token',
      ME: '/api/auth/me',
      FORGOT_PASSWORD: '/api/auth/forgot-password',
      RESET_PASSWORD: '/api/auth/reset-password',
      PENDING_USERS: '/api/auth/pending-users',
      APPROVE_USER: '/api/auth/approve-user',
      REJECT_USER: '/api/auth/reject-user',
      // Alternative endpoints per requirements
      PENDING_CUSTOMERS: '/api/pending-customers',
      APPROVE_CUSTOMER: (id: string) => `/api/approve-customer/${id}`,
      REJECT_CUSTOMER: (id: string) => `/api/reject-customer/${id}`
    },
    USERS: {
      LIST: '/api/users',
      PROFILE: '/api/users/profile',
      UPDATE_PROFILE: '/api/users/profile',
      ACTIVITY: '/api/users/activity'
    },
    ORDERS: {
      LIST: '/api/orders',
      MY_ORDERS: '/api/orders/my-orders',
      CREATE: '/api/orders',
      GET_BY_ID: (id: string) => `/api/orders/${id}`,
      UPDATE: (id: string) => `/api/orders/${id}`,
      DELETE: (id: string) => `/api/orders/${id}`,
      UPDATE_STATUS: (id: string) => `/api/orders/${id}/status`,
      BY_CUSTOMER: (customerId: string) => `/api/orders/customer/${customerId}`
    },
    INVENTORY: {
      LIST: '/api/inventory',
      STATS: '/api/inventory/stats',
      LOW_STOCK: '/api/inventory/low-stock',
      CREATE: '/api/inventory',
      GET_BY_ID: (id: string) => `/api/inventory/${id}`,
      UPDATE: (id: string) => `/api/inventory/${id}`,
      DELETE: (id: string) => `/api/inventory/${id}`,
      UPDATE_QUANTITY: (id: string) => `/api/inventory/${id}/quantity`,
      HISTORY: (id: string) => `/api/inventory/${id}/history`
    },
    DELIVERY: {
      LIST: '/api/delivery',
      STATS: '/api/delivery/stats',
      MY_DELIVERIES: '/api/delivery/my-deliveries',
      CREATE: '/api/delivery',
      GET_BY_ID: (id: string) => `/api/delivery/${id}`,
      UPDATE: (id: string) => `/api/delivery/${id}`,
      DELETE: (id: string) => `/api/delivery/${id}`,
      UPDATE_STATUS: (id: string) => `/api/delivery/${id}/status`
    },
    NOTIFICATIONS: {
      LIST: '/api/notifications',
      ALL: '/api/notifications/all',
      STATS: '/api/notifications/stats',
      UNREAD_COUNT: '/api/notifications/unread-count',
      CREATE: '/api/notifications',
      BROADCAST: '/api/notifications/broadcast',
      MARK_READ: (id: string) => `/api/notifications/${id}/read`,
      MARK_ALL_READ: '/api/notifications/read-all',
      DELETE: (id: string) => `/api/notifications/${id}`
    },
    REPORTS: {
      SALES: '/api/reports/sales',
      INVENTORY: '/api/reports/inventory',
      CUSTOMERS: '/api/reports/customers',
      DELIVERIES: '/api/reports/deliveries',
      FINANCIAL: '/api/reports/financial',
      USER_ACTIVITY: '/api/reports/user-activity'
    },
    FEEDBACK: {
      LIST: '/api/feedback',
      MY_FEEDBACK: '/api/feedback/my-feedback',
      STATS: '/api/feedback/stats',
      TRENDS: '/api/feedback/trends',
      CREATE: '/api/feedback',
      GET_BY_ID: (id: string) => `/api/feedback/${id}`,
      UPDATE: (id: string) => `/api/feedback/${id}`,
      DELETE: (id: string) => `/api/feedback/${id}`,
      RESPOND: (id: string) => `/api/feedback/${id}/respond`
    },
    MESSAGES: {
      LIST: '/api/messages',
      CONTACT: '/api/messages/contact',
      CREATE: '/api/messages',
      GET_BY_ID: (id: string) => `/api/messages/${id}`,
      UPDATE: (id: string) => `/api/messages/${id}`,
      DELETE: (id: string) => `/api/messages/${id}`,
      REPLY: (id: string) => `/api/messages/${id}/reply`,
      UPDATE_STATUS: (id: string) => `/api/messages/${id}/status`
    }
  },
  TIMEOUT: 10000, // 10 seconds
};

// Create axios instance with default config
export const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          console.log('Token expired, attempting refresh...');

          // Try to refresh the token
          const refreshResponse = await axios.post(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.REFRESH}`, {
            refreshToken
          });

          if (refreshResponse.data.success && refreshResponse.data.accessToken) {
            const newAccessToken = refreshResponse.data.accessToken;
            const newRefreshToken = refreshResponse.data.refreshToken;

            // Store new tokens
            localStorage.setItem('accessToken', newAccessToken);
            if (newRefreshToken) {
              localStorage.setItem('refreshToken', newRefreshToken);
            }

            // Update the original request with new token
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

            console.log('Token refreshed successfully, retrying original request');
            return api(originalRequest);
          }
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
      }

      // If refresh fails or no refresh token, redirect to login
      console.log('Refresh failed, redirecting to login');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

// HTTP client configuration
export const createApiHeaders = (token?: string) => {
  // Try to get token from localStorage if not provided
  if (!token) {
    token = localStorage.getItem('accessToken') || undefined;
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
    console.log('Adding token to headers:', token.substring(0, 10) + '...');
  }
  // Removed the else clause that logs "No token available" as it's normal for unauthenticated requests

  return headers;
};

// API response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
