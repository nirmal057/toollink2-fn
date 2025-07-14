import { authService } from './authService';

// Define comprehensive role permissions matching backend
export const ROLES = {
  ADMIN: 'admin',
  CASHIER: 'cashier',
  WAREHOUSE: 'warehouse',
  CUSTOMER: 'customer',
  EDITOR: 'editor',
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];

// Define comprehensive permissions system
export const PERMISSIONS = {
  // Admin permissions - Full System Access
  FULL_SYSTEM_ACCESS: '*',
  MANAGE_USERS: 'users.manage',
  MANAGE_ROLES: 'users.roles',
  VIEW_AUDIT_LOGS: 'audit.view',
  MANAGE_SYSTEM_CONFIG: 'system.config',
  VIEW_SYSTEM_REPORTS: 'system.reports',
  BULK_USER_OPERATIONS: 'users.bulk',
  
  // Order Management Permissions
  ORDERS_CREATE: 'orders.create',
  ORDERS_VIEW: 'orders.view',
  ORDERS_VIEW_OWN: 'orders.view.own',
  ORDERS_UPDATE: 'orders.update',
  ORDERS_UPDATE_OWN: 'orders.update.own',
  ORDERS_DELETE: 'orders.delete',
  ORDERS_CANCEL_OWN: 'orders.cancel.own',
  ORDERS_APPROVE: 'orders.approve',
  ORDERS_SCHEDULE: 'orders.schedule',
  ORDERS_SPLIT: 'orders.split',
  ORDERS_ANALYTICS: 'orders.analytics',
  ORDERS_FEEDBACK: 'orders.feedback',
  ORDERS_RESCHEDULE_OWN: 'orders.reschedule.own',
  ORDERS_ALLOCATE: 'orders.allocate',
  ORDERS_PREPARE: 'orders.prepare',
  
  // Inventory Management Permissions
  INVENTORY_VIEW: 'inventory.view',
  INVENTORY_VIEW_CATALOG: 'inventory.view.catalog',
  INVENTORY_CREATE: 'inventory.create',
  INVENTORY_UPDATE: 'inventory.update',
  INVENTORY_DELETE: 'inventory.delete',
  INVENTORY_STOCK_IN: 'inventory.stock-in',
  INVENTORY_STOCK_OUT: 'inventory.stock-out',
  INVENTORY_TRANSFER: 'inventory.transfer',
  INVENTORY_ADJUSTMENTS: 'inventory.adjustments',
  INVENTORY_ANALYTICS: 'inventory.analytics',
  INVENTORY_PREDICT: 'inventory.predict',
  INVENTORY_LOW_STOCK: 'inventory.low-stock',
  INVENTORY_SEARCH: 'inventory.search',
  
  // Delivery Management Permissions
  DELIVERY_VIEW: 'delivery.view',
  DELIVERY_VIEW_OWN: 'delivery.view.own',
  DELIVERY_SCHEDULE: 'delivery.schedule',
  DELIVERY_UPDATE: 'delivery.update',
  DELIVERY_COMPLETE: 'delivery.complete',
  DELIVERY_ASSIGN: 'delivery.assign',
  DELIVERY_TRACK_OWN: 'delivery.track.own',
  DELIVERY_RESCHEDULE_OWN: 'delivery.reschedule.own',
  DELIVERY_ANALYTICS: 'delivery.analytics',
  DELIVERY_FEEDBACK_OWN: 'delivery.feedback.own',
  
  // Customer Management Permissions
  CUSTOMERS_VIEW: 'customers.view',
  CUSTOMERS_APPROVE: 'customers.approve',
  CUSTOMERS_UPDATE: 'customers.update',
  
  // Materials & Prediction
  MATERIALS_PREDICT: 'materials.predict',
  MATERIALS_REFILL: 'materials.refill',
  MATERIALS_ANALYTICS: 'materials.analytics',
  
  // Warehouse Operations
  WAREHOUSE_TASKS: 'warehouse.tasks',
  WAREHOUSE_COORDINATION: 'warehouse.coordination',
  WAREHOUSE_REPORTS: 'warehouse.reports',
  
  // Reports & Analytics
  REPORTS_VIEW: 'reports.view',
  REPORTS_ORDERS: 'reports.orders',
  REPORTS_CUSTOMERS: 'reports.customers',
  REPORTS_SALES: 'reports.sales',
  REPORTS_INVENTORY: 'reports.inventory',
  REPORTS_DELIVERY: 'reports.delivery',
  ANALYTICS_VIEW: 'analytics.view',
  DASHBOARD_VIEW: 'dashboard.view',
  
  // Notifications
  NOTIFICATIONS_VIEW: 'notifications.view',
  NOTIFICATIONS_VIEW_OWN: 'notifications.view.own',
  NOTIFICATIONS_SEND: 'notifications.send',
  NOTIFICATIONS_MANAGE: 'notifications.manage',
  NOTIFICATIONS_INVENTORY_ALERTS: 'notifications.inventory-alerts',
  
  // Feedback
  FEEDBACK_VIEW: 'feedback.view',
  FEEDBACK_RESPOND: 'feedback.respond',
  
  // Profile Management
  PROFILE_VIEW: 'profile.view',
  PROFILE_UPDATE: 'profile.update',
  PROFILE_DELETE: 'profile.delete',
  
  // Content Management (Editor)
  CONTENT_EDIT: 'content.edit',
  CONTENT_PUBLISH: 'content.publish',
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];

// Define role-permission mapping that matches backend
const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [ROLES.ADMIN]: [
    PERMISSIONS.FULL_SYSTEM_ACCESS, // Admin has all permissions
  ],
  
  [ROLES.CASHIER]: [
    // Order Management
    PERMISSIONS.ORDERS_CREATE,
    PERMISSIONS.ORDERS_VIEW,
    PERMISSIONS.ORDERS_UPDATE,
    PERMISSIONS.ORDERS_APPROVE,
    PERMISSIONS.ORDERS_SCHEDULE,
    PERMISSIONS.ORDERS_SPLIT,
    PERMISSIONS.ORDERS_ANALYTICS,
    
    // Customer Management
    PERMISSIONS.CUSTOMERS_APPROVE,
    PERMISSIONS.CUSTOMERS_VIEW,
    PERMISSIONS.CUSTOMERS_UPDATE,
    
    // Inventory (Limited)
    PERMISSIONS.INVENTORY_VIEW,
    PERMISSIONS.INVENTORY_LOW_STOCK,
    PERMISSIONS.INVENTORY_SEARCH,
    
    // Reports
    PERMISSIONS.REPORTS_ORDERS,
    PERMISSIONS.REPORTS_CUSTOMERS,
    PERMISSIONS.REPORTS_SALES,
    
    // Notifications
    PERMISSIONS.NOTIFICATIONS_VIEW,
    PERMISSIONS.NOTIFICATIONS_SEND,
    PERMISSIONS.NOTIFICATIONS_MANAGE,
    
    // Feedback
    PERMISSIONS.FEEDBACK_VIEW,
    PERMISSIONS.FEEDBACK_RESPOND,
  ],
  
  [ROLES.WAREHOUSE]: [
    // Inventory Management (Full)
    PERMISSIONS.INVENTORY_VIEW,
    PERMISSIONS.INVENTORY_UPDATE,
    PERMISSIONS.INVENTORY_CREATE,
    PERMISSIONS.INVENTORY_DELETE,
    PERMISSIONS.INVENTORY_STOCK_IN,
    PERMISSIONS.INVENTORY_STOCK_OUT,
    PERMISSIONS.INVENTORY_TRANSFER,
    PERMISSIONS.INVENTORY_ADJUSTMENTS,
    PERMISSIONS.INVENTORY_ANALYTICS,
    PERMISSIONS.INVENTORY_PREDICT,
    
    // Order Management (Limited)
    PERMISSIONS.ORDERS_VIEW,
    PERMISSIONS.ORDERS_ALLOCATE,
    PERMISSIONS.ORDERS_PREPARE,
    
    // Delivery Management
    PERMISSIONS.DELIVERY_VIEW,
    PERMISSIONS.DELIVERY_SCHEDULE,
    PERMISSIONS.DELIVERY_UPDATE,
    PERMISSIONS.DELIVERY_COMPLETE,
    PERMISSIONS.DELIVERY_ASSIGN,
    PERMISSIONS.DELIVERY_ANALYTICS,
    
    // Materials & Prediction
    PERMISSIONS.MATERIALS_PREDICT,
    PERMISSIONS.MATERIALS_REFILL,
    PERMISSIONS.MATERIALS_ANALYTICS,
    
    // Warehouse Operations
    PERMISSIONS.WAREHOUSE_TASKS,
    PERMISSIONS.WAREHOUSE_COORDINATION,
    PERMISSIONS.WAREHOUSE_REPORTS,
    
    // Notifications
    PERMISSIONS.NOTIFICATIONS_VIEW,
    PERMISSIONS.NOTIFICATIONS_INVENTORY_ALERTS,
  ],
  
  [ROLES.CUSTOMER]: [
    // Order Management (Own Orders Only)
    PERMISSIONS.ORDERS_CREATE,
    PERMISSIONS.ORDERS_VIEW_OWN,
    PERMISSIONS.ORDERS_UPDATE_OWN,
    PERMISSIONS.ORDERS_CANCEL_OWN,
    PERMISSIONS.ORDERS_FEEDBACK,
    PERMISSIONS.ORDERS_RESCHEDULE_OWN,
    
    // Delivery Management (Own Deliveries Only)
    PERMISSIONS.DELIVERY_VIEW_OWN,
    PERMISSIONS.DELIVERY_RESCHEDULE_OWN,
    PERMISSIONS.DELIVERY_TRACK_OWN,
    PERMISSIONS.DELIVERY_FEEDBACK_OWN,
    
    // Profile Management
    PERMISSIONS.PROFILE_VIEW,
    PERMISSIONS.PROFILE_UPDATE,
    PERMISSIONS.PROFILE_DELETE,
    
    // Notifications (Own Only)
    PERMISSIONS.NOTIFICATIONS_VIEW_OWN,
    
    // Basic Inventory View (for ordering)
    PERMISSIONS.INVENTORY_VIEW_CATALOG,
  ],
  
  [ROLES.EDITOR]: [
    // Read-only access for reporting and analytics
    PERMISSIONS.ORDERS_VIEW,
    PERMISSIONS.INVENTORY_VIEW,
    PERMISSIONS.DELIVERY_VIEW,
    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.ANALYTICS_VIEW,
    PERMISSIONS.DASHBOARD_VIEW,
    
    // Content Management
    PERMISSIONS.CONTENT_EDIT,
    PERMISSIONS.CONTENT_PUBLISH,
    
    // Limited notifications
    PERMISSIONS.NOTIFICATIONS_VIEW,
  ],
};

class RBACService {
  /**
   * Check if a user has a specific permission
   */
  hasPermission(userRole: Role, permission: Permission): boolean {
    if (!userRole || !ROLE_PERMISSIONS[userRole]) {
      return false;
    }

    const rolePermissions = ROLE_PERMISSIONS[userRole];
    
    // Admin has all permissions
    if (rolePermissions.includes(PERMISSIONS.FULL_SYSTEM_ACCESS)) {
      return true;
    }

    // Check direct permissions
    return rolePermissions.includes(permission);
  }

  /**
   * Get all permissions for a user role
   */
  getRolePermissions(userRole: Role): Permission[] {
    if (!userRole || !ROLE_PERMISSIONS[userRole]) {
      return [];
    }

    return ROLE_PERMISSIONS[userRole];
  }

  /**
   * Check if user can access own resources only
   */
  isOwnResourceAccess(permission: Permission): boolean {
    return permission.includes('.own');
  }

  /**
   * Get user capabilities based on role
   */
  getUserCapabilities(userRole: Role) {
    const permissions = this.getRolePermissions(userRole);

    return {
      role: userRole,
      permissions,
      canManageUsers: this.hasPermission(userRole, PERMISSIONS.MANAGE_USERS),
      canManageOrders: this.hasPermission(userRole, PERMISSIONS.ORDERS_VIEW),
      canManageInventory: this.hasPermission(userRole, PERMISSIONS.INVENTORY_VIEW),
      canManageDeliveries: this.hasPermission(userRole, PERMISSIONS.DELIVERY_VIEW),
      canViewReports: this.hasPermission(userRole, PERMISSIONS.REPORTS_VIEW),
      canApproveCustomers: this.hasPermission(userRole, PERMISSIONS.CUSTOMERS_APPROVE),
      isAdmin: userRole === ROLES.ADMIN,
      isCashier: userRole === ROLES.CASHIER,
      isWarehouse: userRole === ROLES.WAREHOUSE,
      isCustomer: userRole === ROLES.CUSTOMER,
      isEditor: userRole === ROLES.EDITOR
    };
  }

  /**
   * Check if user is authenticated and has required role
   */
  async requireRole(requiredRoles: Role[]): Promise<boolean> {
    try {
      const user = await authService.getCurrentUser();
      if (!user) {
        return false;
      }

      return requiredRoles.includes(user.role as Role);
    } catch (error) {
      console.error('Role check error:', error);
      return false;
    }
  }

  /**
   * Check if user can perform action
   */
  async canPerformAction(action: Permission): Promise<boolean> {
    try {
      const user = await authService.getCurrentUser();
      if (!user) {
        return false;
      }

      return this.hasPermission(user.role as Role, action);
    } catch (error) {
      console.error('Action permission check error:', error);
      return false;
    }
  }

  /**
   * Get navigation items based on user role
   */
  getNavigationItems(userRole: Role) {
    const capabilities = this.getUserCapabilities(userRole);
    const navigationItems = [];

    // Dashboard (always available for authenticated users)
    navigationItems.push({
      name: 'Dashboard',
      path: '/dashboard',
      icon: 'dashboard',
      available: true
    });

    // Orders
    if (capabilities.canManageOrders || this.hasPermission(userRole, PERMISSIONS.ORDERS_CREATE)) {
      navigationItems.push({
        name: 'Orders',
        path: '/orders',
        icon: 'orders',
        available: true
      });
    }

    // Inventory
    if (capabilities.canManageInventory) {
      navigationItems.push({
        name: 'Inventory',
        path: '/inventory',
        icon: 'inventory',
        available: true
      });
    }

    // Delivery Calendar
    if (capabilities.canManageDeliveries || this.hasPermission(userRole, PERMISSIONS.DELIVERY_SCHEDULE)) {
      navigationItems.push({
        name: 'Delivery Calendar',
        path: '/delivery-calendar',
        icon: 'calendar',
        available: true
      });
    }

    // Reports
    if (capabilities.canViewReports) {
      navigationItems.push({
        name: 'Reports',
        path: '/reports',
        icon: 'reports',
        available: true
      });
    }

    // Admin functions
    if (capabilities.isAdmin) {
      navigationItems.push(
        {
          name: 'User Management',
          path: '/user-management',
          icon: 'users',
          available: true
        },
        {
          name: 'Customer Approval',
          path: '/customer-approval',
          icon: 'approval',
          available: true
        },
        {
          name: 'Admin Dashboard',
          path: '/admin',
          icon: 'admin',
          available: true
        },
        {
          name: 'System Reports',
          path: '/admin/reports',
          icon: 'system-reports',
          available: true
        },
        {
          name: 'Audit Logs',
          path: '/admin/audit-logs',
          icon: 'audit',
          available: true
        }
      );
    }

    // Cashier specific
    if (capabilities.isCashier) {
      navigationItems.push({
        name: 'Customer Approval',
        path: '/customer-approval',
        icon: 'approval',
        available: true
      });
    }

    // Customer specific
    if (capabilities.isCustomer) {
      navigationItems.push({
        name: 'My Orders',
        path: '/customer/orders',
        icon: 'my-orders',
        available: true
      });
    }

    // Warehouse specific
    if (capabilities.isWarehouse) {
      navigationItems.push({
        name: 'Material Prediction',
        path: '/material-prediction',
        icon: 'prediction',
        available: true
      });
    }

    // Common items
    navigationItems.push(
      {
        name: 'Notifications',
        path: '/notifications',
        icon: 'notifications',
        available: true
      },
      {
        name: 'Profile',
        path: '/profile',
        icon: 'profile',
        available: true
      }
    );

    return navigationItems;
  }

  /**
   * Check if current user can access a route
   */
  async canAccessRoute(path: string): Promise<boolean> {
    try {
      const user = await authService.getCurrentUser();
      if (!user) {
        return false;
      }

      const userRole = user.role as Role;
      
      // Define route access rules
      const routeAccess: Record<string, Permission[]> = {
        '/admin': [PERMISSIONS.FULL_SYSTEM_ACCESS],
        '/admin/dashboard': [PERMISSIONS.FULL_SYSTEM_ACCESS],
        '/admin/audit-logs': [PERMISSIONS.VIEW_AUDIT_LOGS],
        '/admin/reports': [PERMISSIONS.VIEW_SYSTEM_REPORTS],
        '/user-management': [PERMISSIONS.MANAGE_USERS],
        '/customer-approval': [PERMISSIONS.CUSTOMERS_APPROVE],
        '/orders': [PERMISSIONS.ORDERS_VIEW, PERMISSIONS.ORDERS_VIEW_OWN, PERMISSIONS.ORDERS_CREATE],
        '/inventory': [PERMISSIONS.INVENTORY_VIEW, PERMISSIONS.INVENTORY_VIEW_CATALOG],
        '/delivery-calendar': [PERMISSIONS.DELIVERY_VIEW, PERMISSIONS.DELIVERY_VIEW_OWN, PERMISSIONS.DELIVERY_SCHEDULE],
        '/reports': [PERMISSIONS.REPORTS_VIEW],
        '/material-prediction': [PERMISSIONS.MATERIALS_PREDICT],
        '/notifications': [PERMISSIONS.NOTIFICATIONS_VIEW, PERMISSIONS.NOTIFICATIONS_VIEW_OWN],
        '/profile': [PERMISSIONS.PROFILE_VIEW],
        '/feedback': [PERMISSIONS.FEEDBACK_VIEW],
      };

      const requiredPermissions = routeAccess[path];
      if (!requiredPermissions) {
        // Allow access to routes not in the access control list
        return true;
      }

      // User needs at least one of the required permissions
      return requiredPermissions.some(permission => this.hasPermission(userRole, permission));
    } catch (error) {
      console.error('Route access check error:', error);
      return false;
    }
  }
}

// Export singleton instance
export const rbacService = new RBACService();

export default rbacService;
