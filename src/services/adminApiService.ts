import { api } from '../config/api';

export interface AdminDashboard {
  userStats: {
    total: number;
    active: number;
    pending: number;
    inactive: number;
    byRole: Record<string, number>;
  };
  systemInfo: {
    serverTime: string;
    version: string;
    environment: string;
    uptime?: string;
    lastBackup?: string;
  };
  analytics?: {
    totalOrders: number;
    monthlyRevenue: number;
    activeProjects: number;
    completedTasks: number;
    systemLoad: number;
    memoryUsage: number;
    storageUsed: number;
    responseTime: number;
  };
  recentActivity?: Array<{
    type: string;
    message: string;
    time: string;
    user: string;
  }>;
  quickStats?: Array<{
    label: string;
    value: string | number;
    change: string;
    trend: 'up' | 'down';
    icon: string;
  }>;
}

export interface AuditLog {
  id: number;
  userId: string;
  action: string;
  details: string;
  timestamp: string;
  ipAddress: string;
}

export interface SystemConfig {
  general: {
    siteName: string;
    version: string;
    timezone: string;
    language: string;
  };
  security: {
    passwordMinLength: number;
    sessionTimeout: number;
    maxLoginAttempts: number;
    twoFactorRequired: boolean;
  };
  features: {
    userRegistration: boolean;
    emailVerification: boolean;
    customerApproval: boolean;
    inventoryTracking: boolean;
  };
  limits: {
    maxUsers: number;
    maxOrders: number;
    maxFileSize: string;
  };
}

class AdminApiService {
  private static instance: AdminApiService;

  private constructor() {}

  public static getInstance(): AdminApiService {
    if (!AdminApiService.instance) {
      AdminApiService.instance = new AdminApiService();
    }
    return AdminApiService.instance;
  }

  /**
   * Get admin dashboard statistics
   */
  async getDashboard(): Promise<AdminDashboard> {
    try {
      // Call the admin dashboard endpoint
      const response = await api.get('/admin/dashboard');
      if (response.data.success) {
        return response.data.dashboard;
      }
      throw new Error(response.data.error || 'Failed to load dashboard');
    } catch (error: any) {
      console.error('Error loading admin dashboard:', error);
      
      // Check if it's a 404 or route not found error
      if (error.response?.status === 404 || error.message?.includes('Route not found')) {
        throw new Error('Admin dashboard endpoint not available. Please check server configuration.');
      }
      
      // Check if it's an authentication error
      if (error.response?.status === 401) {
        throw new Error('Authentication required. Please login again.');
      }
      
      if (error.response?.status === 403) {
        throw new Error('Access denied. Admin privileges required.');
      }
      
      throw new Error(error.response?.data?.error || error.message || 'Failed to load dashboard');
    }
  }

  /**
   * Get system audit logs
   */
  async getAuditLogs(page = 1, limit = 50, filters?: { action?: string; userId?: string }): Promise<{
    logs: AuditLog[];
    pagination: { page: number; limit: number; total: number; pages: number };
  }> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(filters?.action && { action: filters.action }),
        ...(filters?.userId && { userId: filters.userId })
      });

      const response = await api.get(`/admin/audit-logs?${params}`);
      if (response.data.success) {
        return response.data.auditLogs;
      }
      throw new Error(response.data.error || 'Failed to load audit logs');
    } catch (error: any) {
      console.error('Error loading audit logs:', error);
      throw new Error(error.response?.data?.error || 'Failed to load audit logs');
    }
  }

  /**
   * Perform bulk user operations
   */
  async bulkUserOperation(operation: string, userIds: number[], data?: any): Promise<void> {
    try {
      const response = await api.post('/admin/users/bulk', {
        operation,
        userIds,
        ...(data && { data })
      });
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Bulk operation failed');
      }
    } catch (error: any) {
      console.error('Error performing bulk operation:', error);
      throw new Error(error.response?.data?.error || 'Bulk operation failed');
    }
  }

  /**
   * Get system configuration
   */
  async getSystemConfig(): Promise<SystemConfig> {
    try {
      const response = await api.get('/admin/config');
      if (response.data.success) {
        return response.data.config;
      }
      throw new Error(response.data.error || 'Failed to load system configuration');
    } catch (error: any) {
      console.error('Error loading system config:', error);
      throw new Error(error.response?.data?.error || 'Failed to load system configuration');
    }
  }

  /**
   * Update system configuration
   */
  async updateSystemConfig(section: string, settings: any): Promise<void> {
    try {
      const response = await api.put('/admin/config', {
        section,
        settings
      });
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to update configuration');
      }
    } catch (error: any) {
      console.error('Error updating system config:', error);
      throw new Error(error.response?.data?.error || 'Failed to update configuration');
    }
  }

  /**
   * Get system reports
   */
  async getSystemReports(): Promise<Record<string, any>> {
    try {
      const response = await api.get('/admin/reports');
      if (response.data.success) {
        return response.data.reports;
      }
      throw new Error(response.data.error || 'Failed to load system reports');
    } catch (error: any) {
      console.error('Error loading system reports:', error);
      throw new Error(error.response?.data?.error || 'Failed to load system reports');
    }
  }
}

export const adminApiService = AdminApiService.getInstance();
