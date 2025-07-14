import axios from 'axios';
import { API_CONFIG } from '../config/api';

export interface Activity {
  id: string;
  type: 'user' | 'order' | 'inventory' | 'system' | 'auth' | 'notification';
  action: string;
  message: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  metadata?: {
    orderId?: string;
    productId?: string;
    userId?: string;
    inventoryId?: string;
    [key: string]: any;
  };
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  link?: string; // Where to navigate when clicked
}

export class ActivityService {
  private static instance: ActivityService;
  private activities: Activity[] = [];

  static getInstance(): ActivityService {
    if (!ActivityService.instance) {
      ActivityService.instance = new ActivityService();
    }
    return ActivityService.instance;
  }

  // Log a new activity
  async logActivity(activity: Omit<Activity, 'id' | 'timestamp'>): Promise<void> {
    const newActivity: Activity = {
      ...activity,
      id: `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString()
    };

    // Add to local storage immediately
    this.activities.unshift(newActivity);
    this.saveToLocalStorage();

    // Try to send to backend
    try {
      await axios.post(`${API_CONFIG.BASE_URL}/api/activities`, newActivity);
    } catch (error) {
      console.warn('Failed to save activity to backend:', error);
    }
  }

  // Get recent activities
  async getRecentActivities(limit: number = 10): Promise<Activity[]> {
    try {
      // Try to fetch from backend first
      const response = await axios.get(`${API_CONFIG.BASE_URL}/api/activities?limit=${limit}`);
      this.activities = response.data || [];
      this.saveToLocalStorage();
      return this.activities;
    } catch (error) {
      console.warn('Failed to fetch activities from backend, using local storage:', error);
      // Fallback to local storage
      this.loadFromLocalStorage();
      return this.activities.slice(0, limit);
    }
  }

  // Get activities by type
  getActivitiesByType(type: Activity['type'], limit: number = 5): Activity[] {
    return this.activities.filter(activity => activity.type === type).slice(0, limit);
  }

  // Save to localStorage
  private saveToLocalStorage(): void {
    try {
      localStorage.setItem('toollink_activities', JSON.stringify(this.activities.slice(0, 100))); // Keep only last 100
    } catch (error) {
      console.warn('Failed to save activities to localStorage:', error);
    }
  }

  // Load from localStorage
  private loadFromLocalStorage(): void {
    try {
      const stored = localStorage.getItem('toollink_activities');
      if (stored) {
        this.activities = JSON.parse(stored);
      } else {
        this.initializeMockActivities();
      }
    } catch (error) {
      console.warn('Failed to load activities from localStorage:', error);
      this.initializeMockActivities();
    }
  }

  // Initialize with some mock activities for demonstration
  private initializeMockActivities(): void {
    const mockActivities: Activity[] = [
      {
        id: 'act_001',
        type: 'user',
        action: 'user_login',
        message: 'Admin user logged in successfully',
        user: {
          id: 'user_001',
          name: 'Nimal Perera',
          email: 'admin1@toollink.lk',
          role: 'admin'
        },
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 minutes ago
        severity: 'low',
        link: '/admin/users'
      },
      {
        id: 'act_002',
        type: 'order',
        action: 'order_created',
        message: 'New order created by customer',
        user: {
          id: 'user_008',
          name: 'Ravi Builders Pvt Ltd',
          email: 'customer1@toollink.lk',
          role: 'customer'
        },
        metadata: {
          orderId: 'ORD-2024-001',
          totalAmount: 25750
        },
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 minutes ago
        severity: 'medium',
        link: '/admin/orders'
      },
      {
        id: 'act_003',
        type: 'inventory',
        action: 'inventory_low_stock',
        message: 'Low stock alert for Power Drill Set',
        user: {
          id: 'system',
          name: 'Inventory System',
          email: 'system@toollink.lk',
          role: 'system'
        },
        metadata: {
          productId: 'PRD-001',
          currentStock: 5,
          minStock: 10
        },
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
        severity: 'high',
        link: '/admin/inventory'
      },
      {
        id: 'act_004',
        type: 'user',
        action: 'user_registered',
        message: 'New customer registration pending approval',
        user: {
          id: 'user_pending_001',
          name: 'Lanka Construction Co.',
          email: 'info@lankaconstruction.lk',
          role: 'customer'
        },
        timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(), // 45 minutes ago
        severity: 'medium',
        link: '/admin/users?filter=pending'
      },
      {
        id: 'act_005',
        type: 'order',
        action: 'order_shipped',
        message: 'Order shipped to customer',
        user: {
          id: 'user_003',
          name: 'Thilina Karunaratne',
          email: 'manager1@toollink.lk',
          role: 'warehouse'
        },
        metadata: {
          orderId: 'ORD-2023-298',
          trackingNumber: 'TRK-2024-001'
        },
        timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(), // 1 hour ago
        severity: 'low',
        link: '/admin/orders'
      },
      {
        id: 'act_006',
        type: 'system',
        action: 'backup_completed',
        message: 'Daily system backup completed successfully',
        user: {
          id: 'system',
          name: 'Backup System',
          email: 'system@toollink.lk',
          role: 'system'
        },
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        severity: 'low',
        link: '/admin/system'
      },
      {
        id: 'act_007',
        type: 'inventory',
        action: 'inventory_updated',
        message: 'Inventory restocked for Hardware Tools',
        user: {
          id: 'user_012',
          name: 'Nadeeka Jayasinghe',
          email: 'clerk1@toollink.lk',
          role: 'inventory_clerk'
        },
        metadata: {
          productId: 'PRD-045',
          quantityAdded: 50
        },
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
        severity: 'low',
        link: '/admin/inventory'
      },
      {
        id: 'act_008',
        type: 'auth',
        action: 'failed_login_attempt',
        message: 'Multiple failed login attempts detected',
        user: {
          id: 'unknown',
          name: 'Unknown User',
          email: 'suspicious@example.com',
          role: 'unknown'
        },
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
        severity: 'high',
        link: '/admin/security'
      }
    ];

    this.activities = mockActivities;
    this.saveToLocalStorage();
  }

  // Generate activity link based on type and metadata
  getActivityLink(activity: Activity): string {
    if (activity.link) return activity.link;

    switch (activity.type) {
      case 'user':
        return activity.action === 'user_registered' ? '/admin/users?filter=pending' : '/admin/users';
      case 'order':
        return activity.metadata?.orderId ? `/admin/orders?search=${activity.metadata.orderId}` : '/admin/orders';
      case 'inventory':
        return activity.metadata?.productId ? `/admin/inventory?search=${activity.metadata.productId}` : '/admin/inventory';
      case 'system':
        return '/admin/system';
      case 'auth':
        return '/admin/security';
      case 'notification':
        return '/admin/notifications';
      default:
        return '/admin';
    }
  }

  // Get activity icon based on type
  getActivityIcon(activity: Activity): string {
    switch (activity.type) {
      case 'user': return 'Users';
      case 'order': return 'ShoppingCart';
      case 'inventory': return 'Package';
      case 'system': return 'Server';
      case 'auth': return 'Shield';
      case 'notification': return 'Bell';
      default: return 'Activity';
    }
  }

  // Get activity color based on severity
  getActivityColor(activity: Activity): string {
    switch (activity.severity) {
      case 'critical': return 'bg-red-100 dark:bg-red-900/30 text-red-600';
      case 'high': return 'bg-orange-100 dark:bg-orange-900/30 text-orange-600';
      case 'medium': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-600';
      case 'low': return 'bg-green-100 dark:bg-green-900/30 text-green-600';
      default: return 'bg-gray-100 dark:bg-gray-900/30 text-gray-600';
    }
  }

  // Format time ago
  formatTimeAgo(timestamp: string): string {
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffMs = now.getTime() - activityTime.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${diffDays} days ago`;
  }
}

export const activityService = ActivityService.getInstance();
