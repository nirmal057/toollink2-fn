// User Management Service
// This service handles the centralized user storage and management for the ToolLink system

interface User {
  id: string;
  name: string;
  email: string;
  role: 'warehouse' | 'cashier' | 'customer';
  status: 'active' | 'inactive';
  lastLogin: string;
  activityLog?: {
    action: string;
    timestamp: string;
    details: string;
  }[];
}

interface Role {
  id: string;
  name: string;
  permissions: string[];
  description: string;
  createdAt: string;
  updatedAt: string;
}

class UserManagementService {
  private static instance: UserManagementService;
  private users: User[] = [];
  private roles: Role[] = [];
  private userChangeListeners: Array<(users: User[]) => void> = [];

  private constructor() {
    // Initialize with default users
    this.users = [
      {
        id: 'USR002',
        name: 'Jane Smith',
        email: 'jane@example.com',
        role: 'warehouse',
        status: 'active',
        lastLogin: '2025-06-06T15:45:00'
      },
      {
        id: 'USR003',
        name: 'Mike Johnson',
        email: 'mike@example.com',
        role: 'cashier',
        status: 'inactive',
        lastLogin: '2025-06-05T09:15:00'
      }
    ];

    // Initialize with default roles
    this.roles = [
      {
        id: 'ROLE_WAREHOUSE',
        name: 'Warehouse Manager',
        description: 'Inventory and delivery management',
        permissions: [
          'PERM_INVENTORY_MANAGE',
          'PERM_INVENTORY_STOCK_IN',
          'PERM_INVENTORY_STOCK_OUT',
          'PERM_INVENTORY_ADJUST',
          'PERM_INVENTORY_ALERTS',
          'PERM_INVENTORY_REPORTS',
          'PERM_DELIVERY_SCHEDULE',
          'PERM_DELIVERY_UPDATE'
        ],
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z'
      },
      {
        id: 'ROLE_CASHIER',
        name: 'Cashier',
        description: 'Order management',
        permissions: ['PERM_ORDER_CREATE', 'PERM_ORDER_EDIT'],
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z'
      },
      {
        id: 'ROLE_CUSTOMER',
        name: 'Customer',
        description: 'Customer role with basic order permissions',
        permissions: ['PERM_ORDER_VIEW', 'PERM_ORDER_CREATE'],
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z'
      }
    ];
  }

  public static getInstance(): UserManagementService {
    if (!UserManagementService.instance) {
      UserManagementService.instance = new UserManagementService();
    }
    return UserManagementService.instance;
  }

  /**
   * Add a new user to the system
   */
  public addUser(user: User): User {
    // Check if email already exists
    const existingUser = this.users.find(u => u.email === user.email);
    if (existingUser) {
      throw new Error('A user with this email already exists');
    }

    this.users.push(user);
    this.notifyListeners();
    
    console.log('User added to management system:', user);
    return user;
  }

  /**
   * Get all users
   */
  public getUsers(): User[] {
    return [...this.users];
  }

  /**
   * Get user by ID
   */
  public getUserById(id: string): User | undefined {
    return this.users.find(user => user.id === id);
  }

  /**
   * Get user by email
   */
  public getUserByEmail(email: string): User | undefined {
    return this.users.find(user => user.email === email);
  }

  /**
   * Update user
   */
  public updateUser(id: string, updates: Partial<User>): User {
    const userIndex = this.users.findIndex(user => user.id === id);
    if (userIndex === -1) {
      throw new Error('User not found');
    }

    this.users[userIndex] = { ...this.users[userIndex], ...updates };
    this.notifyListeners();
    
    return this.users[userIndex];
  }

  /**
   * Delete user
   */
  public deleteUser(id: string): boolean {
    const userIndex = this.users.findIndex(user => user.id === id);
    if (userIndex === -1) {
      return false;
    }

    this.users.splice(userIndex, 1);
    this.notifyListeners();
    return true;
  }

  /**
   * Get all roles
   */
  public getRoles(): Role[] {
    return [...this.roles];
  }

  /**
   * Add a new role
   */
  public addRole(roleData: Omit<Role, 'id' | 'createdAt' | 'updatedAt'>): Role {
    const newRole: Role = {
      ...roleData,
      id: `ROLE_${roleData.name.toUpperCase().replace(/\s+/g, '_')}_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    this.roles.push(newRole);
    return newRole;
  }

  /**
   * Update role
   */
  public updateRole(id: string, updates: Omit<Role, 'id' | 'createdAt' | 'updatedAt'>): Role {
    const roleIndex = this.roles.findIndex(role => role.id === id);
    if (roleIndex === -1) {
      throw new Error('Role not found');
    }

    this.roles[roleIndex] = { 
      ...this.roles[roleIndex], 
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    return this.roles[roleIndex];
  }

  /**
   * Delete role
   */
  public deleteRole(id: string): boolean {
    const roleIndex = this.roles.findIndex(role => role.id === id);
    if (roleIndex === -1) {
      return false;
    }

    this.roles.splice(roleIndex, 1);
    return true;
  }

  /**
   * Check if email is already registered
   */
  public isEmailRegistered(email: string): boolean {
    return this.users.some(user => user.email === email);
  }

  /**
   * Subscribe to user changes
   */
  public onUsersChange(callback: (users: User[]) => void): () => void {
    this.userChangeListeners.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.userChangeListeners.indexOf(callback);
      if (index > -1) {
        this.userChangeListeners.splice(index, 1);
      }
    };
  }

  /**
   * Notify all listeners of user changes
   */
  private notifyListeners(): void {
    this.userChangeListeners.forEach(callback => callback(this.getUsers()));
  }

  /**
   * Add activity log entry for a user
   */
  public addUserActivity(userId: string, action: string, details: string): void {
    const user = this.getUserById(userId);
    if (user) {
      if (!user.activityLog) {
        user.activityLog = [];
      }
      
      user.activityLog.push({
        action,
        timestamp: new Date().toISOString(),
        details
      });

      this.notifyListeners();
    }
  }

  /**
   * Get users by role
   */
  public getUsersByRole(role: User['role']): User[] {
    return this.users.filter(user => user.role === role);
  }

  /**
   * Get customer count
   */
  public getCustomerCount(): number {
    return this.getUsersByRole('customer').length;
  }

  /**
   * Get active users count
   */
  public getActiveUsersCount(): number {
    return this.users.filter(user => user.status === 'active').length;
  }
}

export const userManagementService = UserManagementService.getInstance();
export type { User, Role };
