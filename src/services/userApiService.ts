import { api } from '../config/api';

export interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  fullName: string;
  phone?: string;
  role: 'admin' | 'warehouse' | 'cashier' | 'customer' | 'driver' | 'editor' | 'user';
  status: 'active' | 'inactive' | 'pending';
  lastLogin?: string;
  createdAt?: string;
  isVerified?: boolean;
  // Sri Lankan specific fields
  nicNumber?: string;
  address?: {
    street?: string;
    city?: string;
    district?: string;
    province?: string;
    postalCode?: string;
  };
}

export interface CreateUserData {
  username: string;
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  role: User['role'];
  // Sri Lankan specific fields
  nicNumber?: string;
  address?: {
    street?: string;
    city?: string;
    district?: string;
    province?: string;
    postalCode?: string;
  };
}

export interface UpdateUserData {
  fullName?: string;
  email?: string;
  phone?: string;
  role?: User['role'];
  status?: User['status'];
  // Sri Lankan specific fields
  nicNumber?: string;
  address?: {
    street?: string;
    city?: string;
    district?: string;
    province?: string;
    postalCode?: string;
  };
}

class UserApiService {
  private static instance: UserApiService;
  private userChangeListeners: Array<(users: User[]) => void> = [];

  private constructor() { }

  public static getInstance(): UserApiService {
    if (!UserApiService.instance) {
      UserApiService.instance = new UserApiService();
    }
    return UserApiService.instance;
  }
  /**
   * Get all users from backend database
   */
  async getUsers(): Promise<User[]> {
    try {
      // Use main users endpoint with authentication and cache-busting
      // This fetches all users from the 'toollink' database 'users' collection
      const response = await api.get(`/api/users?limit=1000&page=1&_t=${Date.now()}`);
      console.log('Raw users response:', response.data);

      // The API returns: {success: true, data: [...], pagination: {...}}
      // So we need to access response.data.data to get the users array
      const users = response.data.data || [];
      console.log('Extracted users array from database:', users);
      console.log('Total users from toollink database:', users.length);

      if (!Array.isArray(users)) {
        console.error('Expected users array but got:', typeof users);
        return [];
      }

      // Map backend user format to frontend User interface
      const mappedUsers = users.map((user: any) => {
        const mappedUser: User = {
          id: user.id || user._id,
          username: user.username || user.email.split('@')[0],
          email: user.email,
          name: user.fullName || user.name,
          fullName: user.fullName || user.name,
          phone: user.phone || '',
          role: user.role.toLowerCase() as User['role'],
          status: (user.isActive ? 'active' : 'inactive') as User['status'],
          lastLogin: user.lastLogin,
          createdAt: user.createdAt,
          isVerified: user.emailVerified || user.isVerified,
          nicNumber: user.nicNumber,
          address: user.address || {}
        };

        console.log('Mapped user from database:', { original: user, mapped: mappedUser });
        return mappedUser;
      });

      console.log('Final mapped users from database:', mappedUsers.length);
      return mappedUsers;
    } catch (error) {
      console.error('Error fetching users from database:', error);
      throw new Error('Failed to fetch users from database');
    }
  }
  /**
   * Create a new user and save to database
   */
  async createUser(userData: CreateUserData): Promise<User> {
    try {
      // Map frontend data structure to backend structure
      const backendData = {
        username: userData.username,
        email: userData.email,
        password: userData.password,
        fullName: userData.fullName, // Map fullName correctly
        phone: userData.phone,
        role: userData.role, // Use role directly without mapping
        nicNumber: userData.nicNumber,
        address: userData.address
      };

      console.log('Creating user in database with data:', backendData);

      // Use main users endpoint to save to database
      const response = await api.post('/api/users', backendData);

      if (response.data.success) {
        console.log('User successfully created in database:', response.data.user);
        // Refresh users list after creation
        this.notifyListeners();
        // Handle different response structures
        return response.data.user || response.data.data;
      }
      throw new Error(response.data.message || response.data.error || 'Failed to create user in database');
    } catch (error: any) {
      console.error('Error creating user in database:', error);
      throw new Error(error.response?.data?.message || error.response?.data?.error || 'Failed to create user in database');
    }
  }

  /**
   * Update user in database
   */
  async updateUser(userId: string, updates: UpdateUserData): Promise<User> {
    try {
      console.log('UserApiService.updateUser called with:', { userId, updates });

      // Map frontend data structure to backend structure
      const backendData: any = {};
      if (updates.fullName) backendData.fullName = updates.fullName;
      if (updates.email) backendData.email = updates.email;
      if (updates.phone) backendData.phone = updates.phone;
      if (updates.role) backendData.role = updates.role; // Use role directly
      if (updates.status !== undefined) backendData.isActive = updates.status === 'active';
      if (updates.nicNumber !== undefined) backendData.nicNumber = updates.nicNumber;
      if (updates.address !== undefined) backendData.address = updates.address;

      console.log('Updating user in database with data:', backendData);

      const response = await api.put(`/api/users/${userId}`, backendData);
      console.log('Update response from database:', response.data);

      if (response.data.success) {
        console.log('User successfully updated in database');
        this.notifyListeners();
        return response.data.user || response.data.data;
      }
      throw new Error(response.data.error || 'Failed to update user in database');
    } catch (error: any) {
      console.error('Error updating user in database:', error);
      console.error('Error response:', error.response?.data);
      throw new Error(error.response?.data?.error || error.response?.data?.message || 'Failed to update user in database');
    }
  }

  /**
   * Delete user from database (hard delete - permanently removes from database)
   */
  async deleteUser(userId: string): Promise<boolean> {
    try {
      console.log('UserApiService.deleteUser called - permanently removing user from database:', { userId });

      // Add cache-busting parameter to ensure fresh data
      const response = await api.delete(`/api/users/${userId}?_t=${Date.now()}`);
      console.log('Delete response from database:', response.data);

      if (response.data.success) {
        // Force a fresh reload of users after successful deletion
        console.log('UserApiService: User permanently deleted from database, forcing fresh reload of users...');
        this.notifyListeners();
        return true;
      }
      throw new Error(response.data.error || 'Failed to permanently delete user from database');
    } catch (error: any) {
      console.error('Error permanently deleting user from database:', error);
      console.error('Error response:', error.response?.data);
      throw new Error(error.response?.data?.error || error.response?.data?.message || 'Failed to permanently delete user from database');
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<User | null> {
    try {
      const response = await api.get(`/api/users/${userId}`);
      return response.data.user || null;
    } catch (error) {
      console.error('Error fetching user:', error);
      return null;
    }
  }

  /**
   * Subscribe to user changes
   */
  onUsersChange(callback: (users: User[]) => void): () => void {
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
  private async notifyListeners(): Promise<void> {
    try {
      const users = await this.getUsers();
      this.userChangeListeners.forEach(callback => callback(users));
    } catch (error) {
      console.error('Error notifying listeners:', error);
    }
  }
}

export const userApiService = UserApiService.getInstance();
export default userApiService;
