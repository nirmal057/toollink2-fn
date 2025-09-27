import { API_CONFIG, createApiHeaders } from '../config/api';

export interface Notification {
  _id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'urgent';
  category: 'system' | 'order' | 'delivery' | 'inventory' | 'user' | 'payment' | 'security' | 'maintenance';
  priority: 'low' | 'normal' | 'high' | 'critical';
  status: 'draft' | 'sent' | 'delivered' | 'read' | 'failed';
  isRead: boolean;
  createdAt: string;
  readAt?: string;
  recipient: {
    userId?: string;
    role?: string;
    specific: boolean;
  };
  sender: {
    userId?: string;
    system: boolean;
    name?: string;
  };
  relatedEntityId?: string;
  relatedEntityType?: string;
  expiresAt?: string;
  isArchived: boolean;
  metadata?: {
    orderId?: string;
    orderNumber?: string;
    customerName?: string;
    amount?: number;
    inventoryId?: string;
    itemName?: string;
    currentStock?: number;
    minLevel?: number;
    sku?: string;
    deliveryId?: string;
    status?: string;
    trackingNumber?: string;
    userId?: string;
    userName?: string;
    userEmail?: string;
    userRole?: string;
    [key: string]: any;
  };
}

export interface NotificationFilters {
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
  category?: string;
  priority?: string;
  includeArchived?: boolean;
}

export interface NotificationResponse {
  success: boolean;
  notifications: Notification[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  unreadCount: number;
}

class NotificationService {
  private static instance: NotificationService;

  private constructor() { }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async getNotifications(filters: NotificationFilters = {}): Promise<NotificationResponse> {
    try {
      const token = localStorage.getItem('accessToken');
      const queryParams = new URLSearchParams();

      if (filters.page) queryParams.append('page', filters.page.toString());
      if (filters.limit) queryParams.append('limit', filters.limit.toString());
      if (filters.unreadOnly) queryParams.append('unreadOnly', filters.unreadOnly.toString());
      if (filters.category) queryParams.append('category', filters.category);
      if (filters.priority) queryParams.append('priority', filters.priority);
      if (filters.includeArchived) queryParams.append('includeArchived', filters.includeArchived.toString());

      const url = `${API_CONFIG.BASE_URL}/api/notifications?${queryParams.toString()}`;

      const response = await fetch(url, {
        headers: createApiHeaders(token || undefined)
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch notifications: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch notifications');
      }

      return data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  }

  async getUnreadCount(): Promise<number> {
    try {
      const token = localStorage.getItem('accessToken');

      // If no token, return 0 without making API call
      if (!token) {
        return 0;
      }

      const url = `${API_CONFIG.BASE_URL}/api/notifications/unread-count`;

      const response = await fetch(url, {
        headers: createApiHeaders(token)
      });

      if (!response.ok) {
        // If unauthorized, clear token and return 0
        if (response.status === 401) {
          localStorage.removeItem('accessToken');
          return 0;
        }
        throw new Error(`Failed to fetch unread count: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch unread count');
      }

      return data.data?.count || 0;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      return 0;
    }
  }

  async markAsRead(notificationId: string): Promise<void> {
    try {
      const token = localStorage.getItem('accessToken');
      const url = `${API_CONFIG.BASE_URL}/api/notifications/${notificationId}/read`;

      const response = await fetch(url, {
        method: 'PUT',
        headers: createApiHeaders(token || undefined)
      });

      if (!response.ok) {
        throw new Error(`Failed to mark notification as read: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to mark notification as read');
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  async markAllAsRead(): Promise<void> {
    try {
      const token = localStorage.getItem('accessToken');
      const url = `${API_CONFIG.BASE_URL}/api/notifications/mark-all-read`;

      const response = await fetch(url, {
        method: 'PUT',
        headers: createApiHeaders(token || undefined)
      });

      if (!response.ok) {
        throw new Error(`Failed to mark all notifications as read: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to mark all notifications as read');
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  async deleteNotification(notificationId: string): Promise<void> {
    try {
      const token = localStorage.getItem('accessToken');
      const url = `${API_CONFIG.BASE_URL}/api/notifications/${notificationId}`;

      const response = await fetch(url, {
        method: 'DELETE',
        headers: createApiHeaders(token || undefined)
      });

      if (!response.ok) {
        throw new Error(`Failed to delete notification: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to delete notification');
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }

  async createNotification(notification: Partial<Notification>): Promise<Notification> {
    try {
      const token = localStorage.getItem('accessToken');
      const url = `${API_CONFIG.BASE_URL}/api/notifications`;

      const response = await fetch(url, {
        method: 'POST',
        headers: createApiHeaders(token || undefined),
        body: JSON.stringify(notification)
      });

      if (!response.ok) {
        throw new Error(`Failed to create notification: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to create notification');
      }

      return data.notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  // Helper method to get notification icon based on type and category
  getNotificationIcon(notification: Notification): string {
    switch (notification.category) {
      case 'order':
        return '🛒';
      case 'delivery':
        return '🚚';
      case 'inventory':
        return '📦';
      case 'payment':
        return '💳';
      case 'user':
        return '👤';
      case 'security':
        return '🔒';
      case 'system':
        return '⚙️';
      case 'maintenance':
        return '🔧';
      default:
        return '🔔';
    }
  }

  // Helper method to get notification color based on type and priority
  getNotificationColor(notification: Notification): string {
    if (notification.priority === 'critical') return 'red';
    if (notification.priority === 'high') return 'orange';
    if (notification.type === 'error') return 'red';
    if (notification.type === 'warning') return 'yellow';
    if (notification.type === 'success') return 'green';
    return 'blue';
  }

  // Handle notification click - mark as read and return redirect URL
  async handleNotificationClick(notificationId: string): Promise<{ redirectUrl: string }> {
    const response = await fetch(`${API_CONFIG.BASE_URL}/notifications/${notificationId}/click`, {
      method: 'POST',
      headers: createApiHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to process notification click');
    }

    return response.json();
  }
}

export const notificationService = NotificationService.getInstance();
