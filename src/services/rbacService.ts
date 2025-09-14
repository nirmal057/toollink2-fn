// Role-Based Access Control (RBAC) Service
// This service handles user roles and permissions throughout the application

// Define user roles
export const ROLES = {
  ADMIN: 'admin',
  USER: 'user',
  WAREHOUSE: 'warehouse',
  CASHIER: 'cashier',
  CUSTOMER: 'customer',
  DRIVER: 'driver',
  EDITOR: 'editor'
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];

// Define permissions
export const PERMISSIONS = {
  // System Administration
  FULL_SYSTEM_ACCESS: '*',
  MANAGE_USERS: 'users.manage',
  MANAGE_ROLES: 'users.roles',
  VIEW_AUDIT_LOGS: 'audit.view',
  MANAGE_SYSTEM_CONFIG: 'system.config',
  VIEW_SYSTEM_REPORTS: 'reports.system.view',
  BULK_USER_OPERATIONS: 'users.bulk',

  // User Management
  USER_CREATE: 'users.create',
  USER_READ: 'users.read',
  USER_UPDATE: 'users.update',
  USER_DELETE: 'users.delete',
  USER_APPROVE: 'users.approve',
  USER_SUSPEND: 'users.suspend',

  // Inventory Management
  INVENTORY_VIEW: 'inventory.view',
  INVENTORY_CREATE: 'inventory.create',
  INVENTORY_UPDATE: 'inventory.update',
  INVENTORY_DELETE: 'inventory.delete',
  INVENTORY_STOCK_IN: 'inventory.stock_in',
  INVENTORY_STOCK_OUT: 'inventory.stock_out',
  INVENTORY_ADJUST: 'inventory.adjust',
  INVENTORY_ANALYTICS: 'inventory.analytics',

  // Order Management
  ORDER_VIEW: 'order.view',
  ORDER_CREATE: 'order.create',
  ORDER_UPDATE: 'order.update',
  ORDER_DELETE: 'order.delete',
  ORDER_APPROVE: 'order.approve',
  ORDER_CANCEL: 'order.cancel',
  ORDER_TRACK: 'order.track',
  ORDER_VIEW_ALL: 'order.view_all',

  // Warehouse Management
  WAREHOUSE_VIEW: 'warehouse.view',
  WAREHOUSE_CREATE: 'warehouse.create',
  WAREHOUSE_UPDATE: 'warehouse.update',
  WAREHOUSE_DELETE: 'warehouse.delete',
  WAREHOUSE_MANAGE: 'warehouse.manage',

  // Supplier Management
  SUPPLIER_VIEW: 'supplier.view',
  SUPPLIER_CREATE: 'supplier.create',
  SUPPLIER_UPDATE: 'supplier.update',
  SUPPLIER_DELETE: 'supplier.delete',

  // Material Management
  MATERIAL_VIEW: 'material.view',
  MATERIAL_CREATE: 'material.create',
  MATERIAL_UPDATE: 'material.update',
  MATERIAL_DELETE: 'material.delete',

  // Delivery Management
  DELIVERY_VIEW: 'delivery.view',
  DELIVERY_CREATE: 'delivery.create',
  DELIVERY_UPDATE: 'delivery.update',
  DELIVERY_ASSIGN: 'delivery.assign',
  DELIVERY_TRACK: 'delivery.track',

  // Report Management
  REPORT_VIEW: 'report.view',
  REPORT_CREATE: 'report.create',
  REPORT_EXPORT: 'report.export',
  REPORT_ANALYTICS: 'report.analytics',

  // Notification Management
  NOTIFICATION_VIEW: 'notification.view',
  NOTIFICATION_CREATE: 'notification.create',
  NOTIFICATION_SEND: 'notification.send',

  // Feedback Management
  FEEDBACK_VIEW: 'feedback.view',
  FEEDBACK_RESPOND: 'feedback.respond',

  // Profile Management
  PROFILE_VIEW: 'profile.view',
  PROFILE_UPDATE: 'profile.update',
  PROFILE_DELETE: 'profile.delete',

  // Content Management (Editor)
  CONTENT_EDIT: 'content.edit',
  CONTENT_PUBLISH: 'content.publish',

  // Dashboard Access
  DASHBOARD_VIEW: 'dashboard.view',
  ANALYTICS_VIEW: 'analytics.view',

  // Basic Features
  USE_BASIC_FEATURES: 'use_basic_features'
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];

// Role to permissions mapping
const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [ROLES.ADMIN]: [
    // Admin has full system access
    PERMISSIONS.FULL_SYSTEM_ACCESS
  ],

  [ROLES.USER]: [
    PERMISSIONS.USE_BASIC_FEATURES,
    PERMISSIONS.PROFILE_VIEW,
    PERMISSIONS.PROFILE_UPDATE,
    PERMISSIONS.DASHBOARD_VIEW
  ],

  [ROLES.WAREHOUSE]: [
    // Inventory Management
    PERMISSIONS.INVENTORY_VIEW,
    PERMISSIONS.INVENTORY_CREATE,
    PERMISSIONS.INVENTORY_UPDATE,
    PERMISSIONS.INVENTORY_STOCK_IN,
    PERMISSIONS.INVENTORY_STOCK_OUT,
    PERMISSIONS.INVENTORY_ADJUST,
    PERMISSIONS.INVENTORY_ANALYTICS,

    // Warehouse Management
    PERMISSIONS.WAREHOUSE_VIEW,
    PERMISSIONS.WAREHOUSE_UPDATE,
    PERMISSIONS.WAREHOUSE_MANAGE,

    // Material Management
    PERMISSIONS.MATERIAL_VIEW,
    PERMISSIONS.MATERIAL_CREATE,
    PERMISSIONS.MATERIAL_UPDATE,

    // Supplier Management
    PERMISSIONS.SUPPLIER_VIEW,
    PERMISSIONS.SUPPLIER_CREATE,
    PERMISSIONS.SUPPLIER_UPDATE,

    // Delivery Management
    PERMISSIONS.DELIVERY_VIEW,
    PERMISSIONS.DELIVERY_CREATE,
    PERMISSIONS.DELIVERY_UPDATE,
    PERMISSIONS.DELIVERY_ASSIGN,
    PERMISSIONS.DELIVERY_TRACK,

    // Orders (warehouse perspective)
    PERMISSIONS.ORDER_VIEW,
    PERMISSIONS.ORDER_UPDATE,
    PERMISSIONS.ORDER_TRACK,

    // Basic Features
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.PROFILE_VIEW,
    PERMISSIONS.PROFILE_UPDATE,
    PERMISSIONS.USE_BASIC_FEATURES
  ],

  [ROLES.CASHIER]: [
    // Order Management
    PERMISSIONS.ORDER_VIEW,
    PERMISSIONS.ORDER_CREATE,
    PERMISSIONS.ORDER_UPDATE,
    PERMISSIONS.ORDER_APPROVE,
    PERMISSIONS.ORDER_CANCEL,
    PERMISSIONS.ORDER_TRACK,
    PERMISSIONS.ORDER_VIEW_ALL,

    // Customer Management
    PERMISSIONS.USER_APPROVE,
    PERMISSIONS.USER_READ,

    // Inventory (read-only)
    PERMISSIONS.INVENTORY_VIEW,

    // Materials (read-only)
    PERMISSIONS.MATERIAL_VIEW,

    // Reports
    PERMISSIONS.REPORT_VIEW,
    PERMISSIONS.REPORT_CREATE,
    PERMISSIONS.ANALYTICS_VIEW,

    // Basic Features
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.PROFILE_VIEW,
    PERMISSIONS.PROFILE_UPDATE,
    PERMISSIONS.USE_BASIC_FEATURES
  ],

  [ROLES.CUSTOMER]: [
    // Order Management (customer perspective)
    PERMISSIONS.ORDER_VIEW,
    PERMISSIONS.ORDER_CREATE,
    PERMISSIONS.ORDER_TRACK,

    // Materials (browsing)
    PERMISSIONS.MATERIAL_VIEW,

    // Feedback
    PERMISSIONS.FEEDBACK_VIEW,

    // Profile Management
    PERMISSIONS.PROFILE_VIEW,
    PERMISSIONS.PROFILE_UPDATE,

    // Basic Features
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.USE_BASIC_FEATURES
  ],

  [ROLES.DRIVER]: [
    // Delivery Management
    PERMISSIONS.DELIVERY_VIEW,
    PERMISSIONS.DELIVERY_UPDATE,
    PERMISSIONS.DELIVERY_TRACK,

    // Orders (delivery perspective)
    PERMISSIONS.ORDER_VIEW,
    PERMISSIONS.ORDER_TRACK,

    // Profile Management
    PERMISSIONS.PROFILE_VIEW,
    PERMISSIONS.PROFILE_UPDATE,

    // Basic Features
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.USE_BASIC_FEATURES
  ],

  [ROLES.EDITOR]: [
    // Content Management
    PERMISSIONS.CONTENT_EDIT,
    PERMISSIONS.CONTENT_PUBLISH,

    // Material Management (content perspective)
    PERMISSIONS.MATERIAL_VIEW,
    PERMISSIONS.MATERIAL_CREATE,
    PERMISSIONS.MATERIAL_UPDATE,

    // Basic Features
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.PROFILE_VIEW,
    PERMISSIONS.PROFILE_UPDATE,
    PERMISSIONS.USE_BASIC_FEATURES
  ]
};

// Current user state (this would normally come from authentication context)
let currentUser: { role: Role } | null = null;

// Service class for RBAC operations
class RBACService {
  /**
   * Set the current user (called from auth context)
   */
  setCurrentUser(user: { role: Role } | null) {
    currentUser = user;
  }

  /**
   * Get the current user with fallback to localStorage
   */
  getCurrentUser(): { role: Role } | null {
    // First check the internal state
    if (currentUser) {
      return currentUser;
    }

    // Fallback to localStorage if internal state is null
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        if (userData && userData.role) {
          // Update internal state
          currentUser = { role: userData.role };
          console.log('RBAC: Restored user from localStorage:', currentUser);
          return currentUser;
        }
      }
    } catch (error) {
      console.error('RBAC: Error reading user from localStorage:', error);
    }

    return null;
  }
  /**
   * Check if the current user has a specific permission
   */
  hasPermission(permission: Permission): boolean {
    const user = this.getCurrentUser(); // Use the enhanced getter
    if (!user || !permission) return false;

    // Admin has full system access - explicit check with case insensitivity
    if (user.role?.toLowerCase() === 'admin') {
      return true;
    }

    const rolePermissions = ROLE_PERMISSIONS[user.role];
    if (!rolePermissions) return false;

    // Check for wildcard permission
    if (rolePermissions.includes(PERMISSIONS.FULL_SYSTEM_ACCESS)) {
      return true;
    }

    return rolePermissions.includes(permission);
  }

  /**
   * Check if the current user has a specific role
   */
  hasRole(role: Role): boolean {
    const user = this.getCurrentUser(); // Use the enhanced getter
    if (!user) return false;
    return user.role?.toLowerCase() === role?.toLowerCase();
  }

  /**
   * Check if the current user has any of the specified roles
   */
  hasAnyRole(roles: Role[]): boolean {
    const user = this.getCurrentUser(); // Use the enhanced getter
    if (!user) return false;

    // Admin users have access to everything
    if (user.role?.toLowerCase() === 'admin') {
      return true;
    }

    return roles.includes(user.role);
  }

  /**
   * Check if the current user can access a specific route
   */
  canAccessRoute(route: string): boolean {
    if (!currentUser) return false;

    const routePermissions: Record<string, Permission[]> = {
      '/admin': [PERMISSIONS.FULL_SYSTEM_ACCESS, PERMISSIONS.MANAGE_USERS],
      '/users': [PERMISSIONS.USER_READ, PERMISSIONS.MANAGE_USERS],
      '/inventory': [PERMISSIONS.INVENTORY_VIEW],
      '/orders': [PERMISSIONS.ORDER_VIEW],
      '/warehouses': [PERMISSIONS.WAREHOUSE_VIEW],
      '/suppliers': [PERMISSIONS.SUPPLIER_VIEW],
      '/materials': [PERMISSIONS.MATERIAL_VIEW],
      '/deliveries': [PERMISSIONS.DELIVERY_VIEW],
      '/reports': [PERMISSIONS.REPORT_VIEW],
      '/analytics': [PERMISSIONS.ANALYTICS_VIEW],
      '/dashboard': [PERMISSIONS.DASHBOARD_VIEW],
      '/profile': [PERMISSIONS.PROFILE_VIEW]
    };

    const requiredPermissions = routePermissions[route];
    if (!requiredPermissions) return true; // Allow access to routes without specific permissions

    return requiredPermissions.some(permission => this.hasPermission(permission));
  }

  /**
   * Check if a user with a specific role has a permission (static method)
   */
  static hasPermissionForRole(userRole: Role, permission: Permission): boolean {
    if (!userRole || !permission) return false;

    const rolePermissions = ROLE_PERMISSIONS[userRole];
    if (!rolePermissions) return false;

    // Admin has full system access
    if (rolePermissions.includes(PERMISSIONS.FULL_SYSTEM_ACCESS)) {
      return true;
    }

    return rolePermissions.includes(permission);
  }

  /**
   * Get all permissions for a role
   */
  static getRolePermissions(role: Role): Permission[] {
    return ROLE_PERMISSIONS[role] || [];
  }

  /**
   * Get user-friendly role name
   */
  static getRoleName(role: Role): string {
    const roleNames: Record<Role, string> = {
      [ROLES.ADMIN]: 'Administrator',
      [ROLES.USER]: 'User',
      [ROLES.WAREHOUSE]: 'Warehouse Manager',
      [ROLES.CASHIER]: 'Cashier',
      [ROLES.CUSTOMER]: 'Customer',
      [ROLES.DRIVER]: 'Driver',
      [ROLES.EDITOR]: 'Content Editor'
    };

    return roleNames[role] || role;
  }
}

// Export instance (lowercase for named export)
export const rbacService = new RBACService();

// Export class as well for flexibility
export { RBACService };

// Export default
export default rbacService;
