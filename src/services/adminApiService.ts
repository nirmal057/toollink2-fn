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
  _id: string;
  action: string;
  userId?: {
    _id: string;
    username: string;
    email: string;
    fullName: string;
    profile?: any;
    isLocked?: boolean;
    id: string;
  } | null;
  targetId?: string;
  targetType?: string;
  details: any;
  ipAddress: string;
  userAgent?: string;
  timestamp: string;
  status: string;
}

// ===== Enhanced Prediction System Interfaces =====

export interface MaterialDemandPrediction {
  itemId: string;
  itemName: string;
  category: string;
  warehouseId: string;
  warehouseName: string;
  currentStock: number;
  unit: string;

  // Prediction data
  predictedDemand: {
    nextMonth: number;
    next3Months: number;
    peakSeason: {
      month: string;
      demandIncrease: number; // percentage
    };
  };

  // Analysis insights
  trendAnalysis: {
    trend: 'increasing' | 'decreasing' | 'stable' | 'seasonal';
    confidence: number; // percentage
    seasonalPattern: {
      highDemandMonths: string[];
      lowDemandMonths: string[];
    };
  };

  // Refill recommendations
  refillRecommendation: {
    urgencyLevel: 'critical' | 'high' | 'medium' | 'low';
    recommendedQuantity: number;
    estimatedStockoutDate: string;
    supplierLeadTime: number; // days
    orderByDate: string;
    estimatedCost: number;
  };

  // Historical context
  historicalData: {
    last12MonthsUsage: number[];
    averageMonthlyDemand: number;
    maxMonthlyDemand: number;
    minMonthlyDemand: number;
  };
}

export interface PredictionDashboard {
  overview: {
    totalItemsTracked: number;
    criticalItems: number;
    highPriorityItems: number;
    totalPredictedCost: number;
    potentialStockouts: number;
  };

  predictions: MaterialDemandPrediction[];

  warehouseInsights: {
    warehouseId: string;
    warehouseName: string;
    totalItems: number;
    criticalItems: number;
    predictedMonthlyDemand: number;
  }[];

  seasonalInsights: {
    currentSeason: string;
    seasonalMultiplier: number;
    upcomingEvents: {
      event: string;
      expectedImpact: number;
      affectedCategories: string[];
    }[];
  };
}

export interface SmartRefillAlert {
  id: string;
  itemId: string;
  itemName: string;
  warehouseId: string;
  warehouseName: string;
  alertType: 'stockout_warning' | 'seasonal_prep' | 'demand_spike' | 'supplier_delay';
  severity: 'critical' | 'high' | 'medium' | 'info';
  message: string;
  recommendedAction: string;
  quantityNeeded: number;
  estimatedCost: number;
  orderByDate: string;
  createdAt: string;
  acknowledged: boolean;
}

export interface DeliveryOptimization {
  routeId: string;
  deliveryDate: string;
  vehicleType: string;
  capacity: number;

  optimizedRoute: {
    stops: {
      customerId: string;
      customerName: string;
      address: string;
      deliveryWindow: string;
      items: {
        itemId: string;
        itemName: string;
        quantity: number;
        weight: number;
      }[];
      estimatedArrival: string;
    }[];

    totalDistance: number;
    estimatedDuration: number;
    fuelCost: number;
    driverHours: number;
  };

  efficiency: {
    capacityUtilization: number; // percentage
    timeEfficiency: number; // percentage
    costSavings: number;
    carbonFootprintReduction: number;
  };
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

  private constructor() { }

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
      const response = await api.get('/api/admin/dashboard');
      if (response.data.success) {
        const backendData = response.data.data;

        // Transform backend data to match AdminDashboard interface
        const transformedData: AdminDashboard = {
          userStats: {
            total: backendData.users?.totalUsers || 0,
            active: backendData.users?.activeUsers || 0,
            pending: backendData.users?.pendingUsers || 0,
            inactive: backendData.users?.inactiveUsers || 0,
            byRole: {
              admin: 0,
              customer: 0,
              cashier: 0,
              "warehouse manager": 0
            }
          },
          systemInfo: {
            serverTime: backendData.systemInfo?.timestamp || new Date().toISOString(),
            version: backendData.systemInfo?.nodeVersion || '1.0.0',
            environment: 'production',
            uptime: backendData.systemInfo?.uptime ? `${Math.floor(backendData.systemInfo.uptime / 86400)} days` : 'Unknown',
            lastBackup: '1 hour ago'
          },
          analytics: {
            totalOrders: backendData.orders?.totalOrders || 0,
            monthlyRevenue: backendData.orders?.totalRevenue || 0,
            activeProjects: backendData.inventory?.totalItems || 0,
            completedTasks: backendData.orders?.completedOrders || 0,
            systemLoad: Math.round((backendData.systemInfo?.memoryUsage?.used || 0) / (1024 * 1024)),
            memoryUsage: Math.round(((backendData.systemInfo?.memoryUsage?.used || 0) / (backendData.systemInfo?.memoryUsage?.total || 1)) * 100),
            storageUsed: 45,
            responseTime: 120
          },
          quickStats: [
            {
              label: "Today's Orders",
              value: backendData.orders?.todayOrders || 0,
              change: '+5%',
              trend: 'up' as const,
              icon: 'ShoppingCart'
            },
            {
              label: 'Active Users',
              value: backendData.users?.activeUsers || 0,
              change: '+2%',
              trend: 'up' as const,
              icon: 'Users'
            },
            {
              label: 'Total Revenue',
              value: `$${(backendData.orders?.totalRevenue || 0).toLocaleString()}`,
              change: '+8%',
              trend: 'up' as const,
              icon: 'DollarSign'
            }
          ]
        };

        // Get role distribution from backend if available
        if (backendData.users?.roleDistribution) {
          backendData.users.roleDistribution.forEach((role: any) => {
            // Map warehouse to "warehouse manager" and filter out unwanted roles
            let mappedRole = role._id;
            if (role._id === 'warehouse') {
              mappedRole = 'warehouse manager';
            }

            // Only include allowed roles (exclude support and manager)
            if (['admin', 'customer', 'cashier', 'warehouse manager'].includes(mappedRole)) {
              transformedData.userStats.byRole[mappedRole] = role.count;
            }
          });
        }

        return transformedData;
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

      const response = await api.get(`/api/admin/audit-logs?${params}`);
      if (response.data.success) {
        return {
          logs: response.data.data,
          pagination: response.data.pagination
        };
      }
      throw new Error(response.data.error || 'Failed to load audit logs');
    } catch (error: any) {
      console.error('Error loading audit logs:', error);
      throw new Error(error.response?.data?.error || 'Failed to load audit logs');
    }
  }

  /**
   * Bulk user operations
   */
  async bulkUserOperation(operation: string, userIds: number[], data?: any): Promise<void> {
    try {
      const response = await api.post('/api/admin/users/bulk', {
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
      const response = await api.get('/api/admin/config');
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
      const response = await api.put('/api/admin/config', {
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
      const response = await api.get('/api/admin/reports');

      if (response.data.success) {
        return response.data.data || response.data.reports || {};
      }
      throw new Error(response.data.error || 'Failed to load system reports');
    } catch (error: any) {
      console.error('❌ Error loading system reports:', error);
      console.error('❌ Error response:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);
      console.error('❌ Error config:', error.config);

      if (error.response?.status === 404) {
        throw new Error('Endpoint not found. Check if backend server is running on port 5000 and admin routes are configured.');
      }

      throw new Error(error.response?.data?.error || error.message || 'Failed to load system reports');
    }
  }

  // ===== 🚀 ENHANCED NOVELTY FUNCTIONS =====

  /**
   * ToolLink DemandSense: Get comprehensive material demand predictions
   * Uses 24-month historical data with seasonal pattern recognition
   */
  async getPredictionDashboard(warehouseId?: string): Promise<PredictionDashboard> {
    try {
      const params = warehouseId ? `?warehouseId=${warehouseId}` : '';
      const response = await api.get(`/api/predictions/dashboard${params}`);

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.error || 'Failed to load prediction dashboard');
    } catch (error: any) {
      console.error('Error loading prediction dashboard:', error);
      throw new Error(error.response?.data?.error || 'Failed to load prediction dashboard');
    }
  }

  /**
   * Get detailed material demand prediction for specific items
   */
  async getMaterialPredictions(filters?: {
    warehouseId?: string;
    category?: string;
    urgencyLevel?: string;
    limit?: number;
  }): Promise<MaterialDemandPrediction[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.warehouseId) params.append('warehouseId', filters.warehouseId);
      if (filters?.category) params.append('category', filters.category);
      if (filters?.urgencyLevel) params.append('urgencyLevel', filters.urgencyLevel);
      if (filters?.limit) params.append('limit', filters.limit.toString());

      const response = await api.get(`/api/predictions/materials?${params}`);

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.error || 'Failed to load material predictions');
    } catch (error: any) {
      console.error('Error loading material predictions:', error);
      throw new Error(error.response?.data?.error || 'Failed to load material predictions');
    }
  }

  /**
   * Get smart refill alerts with AI-powered recommendations
   */
  async getRefillAlerts(acknowledged = false): Promise<SmartRefillAlert[]> {
    try {
      const response = await api.get(`/api/predictions/alerts?acknowledged=${acknowledged}`);

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.error || 'Failed to load refill alerts');
    } catch (error: any) {
      console.error('Error loading refill alerts:', error);
      throw new Error(error.response?.data?.error || 'Failed to load refill alerts');
    }
  }

  /**
   * Acknowledge refill alert
   */
  async acknowledgeAlert(alertId: string): Promise<void> {
    try {
      const response = await api.put(`/api/predictions/alerts/${alertId}/acknowledge`);

      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to acknowledge alert');
      }
    } catch (error: any) {
      console.error('Error acknowledging alert:', error);
      throw new Error(error.response?.data?.error || 'Failed to acknowledge alert');
    }
  }

  /**
   * Generate automatic refill order based on predictions
   */
  async generateRefillOrder(itemId: string, warehouseId: string, quantity?: number): Promise<{
    orderId: string;
    estimatedCost: number;
    supplierInfo: any;
    deliveryDate: string;
  }> {
    try {
      const response = await api.post('/api/predictions/generate-order', {
        itemId,
        warehouseId,
        ...(quantity && { quantity })
      });

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.error || 'Failed to generate refill order');
    } catch (error: any) {
      console.error('Error generating refill order:', error);
      throw new Error(error.response?.data?.error || 'Failed to generate refill order');
    }
  }

  /**
   * Smart Delivery Route Optimization
   * Second novelty function: AI-powered delivery route planning
   */
  async optimizeDeliveryRoutes(date: string, vehicleType?: string): Promise<DeliveryOptimization[]> {
    try {
      const params = new URLSearchParams({ date });
      if (vehicleType) params.append('vehicleType', vehicleType);

      const response = await api.get(`/api/delivery/optimize?${params}`);

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.error || 'Failed to optimize delivery routes');
    } catch (error: any) {
      console.error('Error optimizing delivery routes:', error);
      throw new Error(error.response?.data?.error || 'Failed to optimize delivery routes');
    }
  }

  /**
   * Get delivery performance analytics
   */
  async getDeliveryAnalytics(period = '30d'): Promise<{
    totalDeliveries: number;
    onTimeDeliveries: number;
    averageDeliveryTime: number;
    fuelSavings: number;
    carbonFootprintReduction: number;
    customerSatisfaction: number;
  }> {
    try {
      const response = await api.get(`/api/delivery/analytics?period=${period}`);

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.error || 'Failed to load delivery analytics');
    } catch (error: any) {
      console.error('Error loading delivery analytics:', error);
      throw new Error(error.response?.data?.error || 'Failed to load delivery analytics');
    }
  }
}

export const adminApiService = AdminApiService.getInstance();
