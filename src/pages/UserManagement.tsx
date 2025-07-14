import React, { useState, useEffect } from 'react';
import {
  UserIcon,
  PlusIcon,
  EditIcon,
  TrashIcon,
  XIcon,
  Activity,
  Download,
  Eye
} from 'lucide-react';
import { userApiService, User, CreateUserData, UpdateUserData } from '../services/userApiService';
import { adminApiService } from '../services/adminApiService';
import { rbacService, PERMISSIONS } from '../services/rbacService';

interface UserModalProps {
  user?: User;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (user: CreateUserData | UpdateUserData) => void;
}

const UserModal: React.FC<UserModalProps> = ({ user, isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    fullName: user?.fullName || user?.name || '',
    phone: user?.phone || '+94',
    password: '',
    role: user?.role || 'customer',
    status: user?.status || 'active',
    // Sri Lankan specific fields
    nicNumber: user?.nicNumber || '',
    address: {
      street: user?.address?.street || '',
      city: user?.address?.city || '',
      district: user?.address?.district || '',
      province: user?.address?.province || '',
      postalCode: user?.address?.postalCode || ''
    }
  });

  // Reset form when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        fullName: user.fullName || user.name || '',
        phone: user.phone || '+94',
        password: '',
        role: user.role || 'customer',
        status: user.status || 'active',
        nicNumber: user.nicNumber || '',
        address: {
          street: user.address?.street || '',
          city: user.address?.city || '',
          district: user.address?.district || '',
          province: user.address?.province || '',
          postalCode: user.address?.postalCode || ''
        }
      });
    } else {
      setFormData({
        username: '',
        email: '',
        fullName: '',
        phone: '+94',
        password: '',
        role: 'customer',
        status: 'active',
        nicNumber: '',
        address: {
          street: '',
          city: '',
          district: '',
          province: '',
          postalCode: ''
        }
      });
    }
  }, [user]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate phone number (only if provided)
    if (formData.phone && formData.phone.trim() && formData.phone.length !== 12) { // +94 + 9 digits = 12 characters
      alert('Please enter a complete 9-digit mobile number in format +94XXXXXXXXX.');
      return;
    }

    if (user) {
      // Editing existing user - only send updateable fields
      const updateData: UpdateUserData = {
        fullName: formData.fullName,
        phone: formData.phone,
        role: formData.role as User['role'],
        status: formData.status as User['status'],
        nicNumber: formData.nicNumber,
        address: formData.address
      };
      onSubmit(updateData);
    } else {
      // Creating new user - send all required fields
      // When admin creates user, they should be auto-approved
      const createData: CreateUserData = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        phone: formData.phone || undefined,
        role: formData.role as User['role'],
        nicNumber: formData.nicNumber,
        address: formData.address
      };
      onSubmit(createData);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-2 sm:p-4 md:p-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-[95vw] xs:max-w-[90vw] sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl transition-all duration-300 max-h-[95vh] sm:max-h-[90vh] overflow-hidden border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
          <div>
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
              {user ? 'Edit User' : 'Add New User'}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {user ? 'Update user information and permissions' : 'Create a new user account'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
          >
            <XIcon size={20} />
          </button>
        </div>

        {/* Form Content */}
        <div className="overflow-y-auto max-h-[calc(95vh-140px)] sm:max-h-[calc(90vh-140px)]">
          <form onSubmit={handleSubmit} className="p-4 sm:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {/* Username Field - Only for new users */}
              {!user && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Username <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={e => setFormData(prev => ({ ...prev, username: e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-3 text-sm sm:text-base focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                    placeholder="Enter unique username"
                  />
                </div>
              )}

              {/* Email Field */}
              <div className="md:col-span-1">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  disabled={!!user}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-3 text-sm sm:text-base focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
                  placeholder="user@example.com"
                />
                {user && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Email cannot be changed for existing users
                  </p>
                )}
              </div>

              {/* Full Name Field */}
              <div className="md:col-span-1">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={e => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-3 text-sm sm:text-base focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  placeholder="e.g., W.A. Saman Kumara Perera"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Include initials and full name as per NIC
                </p>
              </div>

              {/* NIC Number Field */}
              <div className="md:col-span-1">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  NIC Number
                </label>
                <input
                  type="text"
                  value={formData.nicNumber}
                  onChange={e => setFormData(prev => ({ ...prev, nicNumber: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-3 text-sm sm:text-base focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  placeholder="e.g., 199012345678 or 901234567V"
                  pattern="^[0-9]{9}[vVxX]$|^[0-9]{12}$"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Enter 12-digit new NIC or 10-digit old NIC (with V/X)
                </p>
              </div>

              {/* Phone Field */}
              <div className="md:col-span-1">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 font-medium">
                    +94
                  </span>
                  <input
                    type="tel"
                    required
                    value={formData.phone.startsWith('+94') ? formData.phone.substring(3) : formData.phone}
                    onChange={e => {
                      const value = e.target.value.replace(/\D/g, ''); // Only allow digits
                      if (value.length <= 9) {
                        setFormData(prev => ({ ...prev, phone: '+94' + value }));
                      }
                    }}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white pl-12 pr-4 py-3 text-sm sm:text-base focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                    placeholder="77 123 4567"
                    maxLength={9}
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Enter 9 digits after +94 (e.g., 771234567)
                </p>
              </div>

              {/* Password Field - Only for new users */}
              {!user && (
                <div className="md:col-span-1">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={e => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-3 text-sm sm:text-base focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                    placeholder="Create a secure password"
                    minLength={6}
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Minimum 6 characters required
                  </p>
                </div>
              )}

              {/* Role Field */}
              <div className="md:col-span-1">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  User Role <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.role}
                  onChange={e => setFormData(prev => ({ ...prev, role: e.target.value as User['role'] }))}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-3 text-sm sm:text-base focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                >
                  <option key="modal-role-customer" value="customer">Customer</option>
                  <option key="modal-role-cashier" value="cashier">Cashier</option>
                  <option key="modal-role-warehouse" value="warehouse">Warehouse Manager</option>
                  <option key="modal-role-admin" value="admin">Administrator</option>
                </select>
              </div>

              {/* Status Field */}
              <div className="md:col-span-1">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Account Status <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.status}
                  onChange={e => setFormData(prev => ({ ...prev, status: e.target.value as User['status'] }))}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-3 text-sm sm:text-base focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                >
                  <option key="modal-status-active" value="active">Active</option>
                  <option key="modal-status-inactive" value="inactive">Inactive</option>
                  <option key="modal-status-pending" value="pending">Pending Approval</option>
                </select>
              </div>

              {/* Address Section - Sri Lankan Specific */}
              <div className="md:col-span-2">
                <h3 className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-4 border-b border-gray-200 dark:border-gray-600 pb-2">
                  Address Details
                </h3>
              </div>

              {/* Street Address */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Street Address
                </label>
                <input
                  type="text"
                  value={formData.address.street}
                  onChange={e => setFormData(prev => ({
                    ...prev,
                    address: { ...prev.address, street: e.target.value }
                  }))}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-3 text-sm sm:text-base focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  placeholder="e.g., No. 123, Galle Road, Bambalapitiya"
                />
              </div>

              {/* City */}
              <div className="md:col-span-1">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  City/Town
                </label>
                <input
                  type="text"
                  value={formData.address.city}
                  onChange={e => setFormData(prev => ({
                    ...prev,
                    address: { ...prev.address, city: e.target.value }
                  }))}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-3 text-sm sm:text-base focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  placeholder="e.g., Colombo, Kandy, Galle"
                />
              </div>

              {/* District */}
              <div className="md:col-span-1">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  District
                </label>
                <select
                  value={formData.address.district}
                  onChange={e => setFormData(prev => ({
                    ...prev,
                    address: { ...prev.address, district: e.target.value }
                  }))}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-3 text-sm sm:text-base focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                >
                  <option value="">Select District</option>
                  <option value="Ampara">Ampara</option>
                  <option value="Anuradhapura">Anuradhapura</option>
                  <option value="Badulla">Badulla</option>
                  <option value="Batticaloa">Batticaloa</option>
                  <option value="Colombo">Colombo</option>
                  <option value="Galle">Galle</option>
                  <option value="Gampaha">Gampaha</option>
                  <option value="Hambantota">Hambantota</option>
                  <option value="Jaffna">Jaffna</option>
                  <option value="Kalutara">Kalutara</option>
                  <option value="Kandy">Kandy</option>
                  <option value="Kegalle">Kegalle</option>
                  <option value="Kilinochchi">Kilinochchi</option>
                  <option value="Kurunegala">Kurunegala</option>
                  <option value="Mannar">Mannar</option>
                  <option value="Matale">Matale</option>
                  <option value="Matara">Matara</option>
                  <option value="Monaragala">Monaragala</option>
                  <option value="Mullaitivu">Mullaitivu</option>
                  <option value="Nuwara Eliya">Nuwara Eliya</option>
                  <option value="Polonnaruwa">Polonnaruwa</option>
                  <option value="Puttalam">Puttalam</option>
                  <option value="Ratnapura">Ratnapura</option>
                  <option value="Trincomalee">Trincomalee</option>
                  <option value="Vavuniya">Vavuniya</option>
                </select>
              </div>

              {/* Province */}
              <div className="md:col-span-1">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Province
                </label>
                <select
                  value={formData.address.province}
                  onChange={e => setFormData(prev => ({
                    ...prev,
                    address: { ...prev.address, province: e.target.value }
                  }))}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-3 text-sm sm:text-base focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                >
                  <option value="">Select Province</option>
                  <option value="Western">Western Province</option>
                  <option value="Central">Central Province</option>
                  <option value="Southern">Southern Province</option>
                  <option value="Northern">Northern Province</option>
                  <option value="Eastern">Eastern Province</option>
                  <option value="North Western">North Western Province</option>
                  <option value="North Central">North Central Province</option>
                  <option value="Uva">Uva Province</option>
                  <option value="Sabaragamuwa">Sabaragamuwa Province</option>
                </select>
              </div>

              {/* Postal Code */}
              <div className="md:col-span-1">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Postal Code
                </label>
                <input
                  type="text"
                  value={formData.address.postalCode}
                  onChange={e => setFormData(prev => ({
                    ...prev,
                    address: { ...prev.address, postalCode: e.target.value }
                  }))}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-3 text-sm sm:text-base focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  placeholder="e.g., 10400, 20000, 80000"
                  pattern="[0-9]{5}"
                  maxLength={5}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Enter 5-digit Sri Lankan postal code
                </p>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 sm:gap-4 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-6 py-3 text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600 rounded-lg transition-colors focus:ring-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-3 text-sm sm:text-base font-medium text-white bg-primary-600 hover:bg-primary-700 focus:bg-primary-700 rounded-lg transition-colors focus:ring-2 focus:ring-primary-500 shadow-sm"
              >
                {user ? 'Save Changes' : 'Create User'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<User['role'] | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<User['status'] | 'all'>('all');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  // Admin-specific state
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  // Force refresh key to ensure re-renders
  const [refreshKey, setRefreshKey] = useState(0);

  // Initialize RBAC and check permissions
  const initializeRBAC = () => {
    try {
      // Ensure user data is available
      const user = localStorage.getItem('user');
      if (user) {
        const userData = JSON.parse(user);
        console.log('UserManagement: Current user data:', userData);
        console.log('UserManagement: User role:', userData.role);
        return userData.role === 'admin'; // Direct admin check as fallback
      }
    } catch (error) {
      console.error('UserManagement: Error initializing RBAC:', error);
    }
    return false;
  };

  // Check if current user is admin with fallback
  const getUserPermissions = () => {
    const directAdminCheck = initializeRBAC();

    return {
      isAdmin: rbacService.hasPermission(PERMISSIONS.MANAGE_USERS) || directAdminCheck,
      canViewAuditLogs: rbacService.hasPermission(PERMISSIONS.VIEW_AUDIT_LOGS) || directAdminCheck,
      canBulkOperations: rbacService.hasPermission(PERMISSIONS.BULK_USER_OPERATIONS) || directAdminCheck
    };
  };

  const { isAdmin, canViewAuditLogs, canBulkOperations } = getUserPermissions();

  console.log('UserManagement: Permissions check result:', { isAdmin, canViewAuditLogs, canBulkOperations });

  // Load users from backend
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      console.log('UserManagement: loadUsers called - fetching fresh data from toollink database');
      setLoading(true);

      // Clear current state first to ensure fresh render
      setUsers([]);
      setSelectedUsers(new Set());

      // Add a small delay to ensure state is cleared
      await new Promise(resolve => setTimeout(resolve, 100));

      const userList = await userApiService.getUsers();
      console.log('UserManagement: Received users from toollink database:', userList.length, 'users');
      console.log('UserManagement: User list details from database:', userList.map(u => ({ id: u.id, email: u.email, fullName: u.fullName })));

      // Update state and force re-render
      setUsers(userList);
      setRefreshKey(prev => prev + 1); // Force component re-render
      console.log('UserManagement: State updated with', userList.length, 'users from database, refresh key:', refreshKey + 1);

    } catch (error) {
      console.error('UserManagement: Failed to load users from database:', error);
      showNotification('Failed to load users from database', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Utility function to show notifications
  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000); // Auto-hide after 5 seconds
  };

  // Filter users based on search and filters
  const filteredUsers = users.filter(user => {
    const matchesSearch =
      (user.fullName?.toLowerCase() || user.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.username?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Handle select all
  const handleSelectAll = (isSelected: boolean) => {
    if (isSelected) {
      const allUserIds = filteredUsers
        .map(user => (user.id || (user as any)._id)?.toString())
        .filter(Boolean);
      setSelectedUsers(new Set(allUserIds));
    } else {
      setSelectedUsers(new Set());
    }
  };
  const handleAddUser = async (userData: CreateUserData) => {
    try {
      console.log('UserManagement: handleAddUser called - adding user to database:', userData);

      // Call API to create user in database
      const result = await userApiService.createUser(userData);
      console.log('UserManagement: User successfully created in database:', result);

      // Immediately refresh to show current database state
      console.log('UserManagement: Refreshing user list to show current database state');
      await loadUsers();

      showNotification(
        `User "${userData.fullName}" successfully added to database!`,
        'success'
      );

      setShowModal(false);
      console.log('UserManagement: Add user to database process completed');
    } catch (error) {
      console.error('UserManagement: Failed to add user to database:', error);
      showNotification(
        `Failed to add user to database: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'error'
      );
    }
  };
  const handleEditUser = async (userData: UpdateUserData) => {
    if (!selectedUser) return;

    try {
      // Ensure we have a valid user ID - handle both id and _id
      const userId = selectedUser.id || (selectedUser as any)._id;
      if (!userId) {
        throw new Error('User ID is missing');
      }

      console.log('UserManagement: handleEditUser called - updating user in database');
      console.log('UserManagement: Updating user in database:', { userId, selectedUser, userData });

      // Call API to update user in database
      const result = await userApiService.updateUser(userId, userData);
      console.log('UserManagement: User successfully updated in database:', result);

      // Immediately refresh to show current database state
      console.log('UserManagement: Refreshing user list to show current database state');
      await loadUsers();

      showNotification(
        `User "${userData.fullName}" successfully updated in database!`,
        'success'
      );

      setShowModal(false);
      setSelectedUser(undefined);
      console.log('UserManagement: Edit user in database process completed');
    } catch (error) {
      console.error('UserManagement: Failed to update user in database:', error);
      showNotification(
        `Failed to update user in database: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'error'
      );
    }
  };

  const handleDeleteUser = async (userId: string) => {
    // Ensure we have a valid user ID
    if (!userId) {
      console.error('UserManagement: No user ID provided for deletion');
      showNotification('Cannot delete user: Invalid user ID', 'error');
      return;
    }

    const userToDelete = users.find(user => (user.id === userId) || ((user as any)._id === userId));
    if (!userToDelete) {
      console.error('UserManagement: User not found in local list:', userId);
      showNotification('User not found', 'error');
      return;
    }

    if (window.confirm(`Are you sure you want to PERMANENTLY DELETE user "${userToDelete.fullName || userToDelete.name}" from the database? This cannot be undone!`)) {
      try {
        console.log('UserManagement: handleDeleteUser called - permanently removing user from database');
        console.log('UserManagement: Permanently deleting user from database:', { userId, userToDelete });

        // Call API to permanently delete user from database
        await userApiService.deleteUser(userId);
        console.log('UserManagement: User permanently deleted from database');

        // Immediately refresh to show current database state
        console.log('UserManagement: Refreshing user list to show current database state');
        await loadUsers();

        // Force a second refresh after a short delay to ensure consistency
        setTimeout(async () => {
          console.log('UserManagement: Secondary refresh to ensure database consistency');
          await loadUsers();
        }, 1000);

        showNotification(
          `User "${userToDelete.fullName || userToDelete.name}" permanently deleted from database!`,
          'success'
        );

        console.log('UserManagement: Delete user from database process completed');
      } catch (error) {
        console.error('UserManagement: Failed to delete user from database:', error);

        // Handle different types of errors
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';

        if (errorMessage.includes('User not found') || errorMessage.includes('404')) {
          showNotification('User has already been deleted from database', 'info');
          await loadUsers(); // Refresh to show current state
        } else if (errorMessage.includes('Cannot delete your own account')) {
          showNotification('You cannot delete your own account', 'error');
        } else if (errorMessage.includes('permission') || errorMessage.includes('unauthorized')) {
          showNotification('You do not have permission to delete this user', 'error');
        } else {
          showNotification(
            `Failed to delete user from database: ${errorMessage}`,
            'error'
          );
        }
      }
    }
  };
  const handleModalSubmit = (userData: CreateUserData | UpdateUserData) => {
    console.log('UserManagement: handleModalSubmit called with:', userData);
    console.log('UserManagement: selectedUser:', selectedUser);
    console.log('UserManagement: isAdmin permission:', isAdmin);

    if (!isAdmin) {
      console.error('UserManagement: No admin permission - blocking operation');
      showNotification('You do not have permission to manage users', 'error');
      return;
    }

    if (selectedUser) {
      console.log('UserManagement: Editing existing user');
      handleEditUser(userData as UpdateUserData);
    } else {
      console.log('UserManagement: Creating new user');
      handleAddUser(userData as CreateUserData);
    }
  };

  // Admin-specific functions
  const handleSelectUser = (userId: string, isSelected: boolean) => {
    setSelectedUsers(prev => {
      const newSet = new Set(prev);
      if (isSelected) {
        newSet.add(userId);
      } else {
        newSet.delete(userId);
      }
      return newSet;
    });
  };

  const handleBulkStatusChange = async (newStatus: User['status']) => {
    if (selectedUsers.size === 0) return;

    try {
      setBulkActionLoading(true);
      const operation = newStatus === 'active' ? 'activate' : 'deactivate';
      const userIds = Array.from(selectedUsers).map(id => parseInt(id));
      await adminApiService.bulkUserOperation(operation, userIds);

      await loadUsers();
      setSelectedUsers(new Set());
      showNotification(`Updated status for ${selectedUsers.size} users`, 'success');
    } catch (error) {
      console.error('Bulk status update failed:', error);
      showNotification('Failed to update user status', 'error');
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleBulkRoleChange = async (newRole: User['role']) => {
    if (selectedUsers.size === 0) return;

    try {
      setBulkActionLoading(true);
      const userIds = Array.from(selectedUsers).map(id => parseInt(id));
      await adminApiService.bulkUserOperation('change_role', userIds, { role: newRole });

      await loadUsers();
      setSelectedUsers(new Set());
      showNotification(`Updated role for ${selectedUsers.size} users`, 'success');
    } catch (error) {
      console.error('Bulk role update failed:', error);
      showNotification('Failed to update user roles', 'error');
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedUsers.size === 0) return;

    if (window.confirm(`Are you sure you want to delete ${selectedUsers.size} users? This action cannot be undone.`)) {
      try {
        setBulkActionLoading(true);
        const userIds = Array.from(selectedUsers).map(id => parseInt(id));
        await adminApiService.bulkUserOperation('delete', userIds);

        await loadUsers();
        setSelectedUsers(new Set());
        showNotification(`Deleted ${selectedUsers.size} users`, 'success');
      } catch (error) {
        console.error('Bulk delete failed:', error);
        showNotification('Failed to delete users', 'error');
      } finally {
        setBulkActionLoading(false);
      }
    }
  };

  const exportUsers = async () => {
    try {
      // Simple CSV export of user data
      const csvHeader = 'Username,Email,Full Name,Role,Status,Phone,Last Login\n';
      const csvData = users.map(user => [
        user.username || '',
        user.email,
        user.fullName || user.name || '',
        user.role,
        user.status,
        user.phone || '',
        user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'
      ].join(',')).join('\n');

      const fullCsv = csvHeader + csvData;
      const blob = new Blob([fullCsv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `users_export_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      showNotification('User data exported successfully', 'success');
    } catch (error) {
      console.error('Export failed:', error);
      showNotification('Failed to export user data', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 space-y-4 xs:space-y-6 p-4 xs:p-6 relative">
      {/* Beautiful background pattern */}
      <div className="absolute inset-0 opacity-5 dark:opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0l-2 4 2 4z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")"
        }}></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto space-y-6">
        {/* Notification */}
        {notification && (
          <div className={`fixed top-4 right-4 z-50 max-w-sm xs:max-w-md p-3 xs:p-4 rounded-lg shadow-lg border-l-4 ${notification.type === 'success'
            ? 'bg-green-50 dark:bg-green-900 border-green-500 text-green-800 dark:text-green-200'
            : notification.type === 'error'
              ? 'bg-red-50 dark:bg-red-900 border-red-500 text-red-800 dark:text-red-200'
              : 'bg-blue-50 dark:bg-blue-900 border-blue-500 text-blue-800 dark:text-blue-200'
            }`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-xs xs:text-sm font-medium">{notification.message}</p>
              </div>
              <button
                onClick={() => setNotification(null)}
                className="ml-3 flex-shrink-0 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
              >
                <XIcon size={16} />
              </button>
            </div>
          </div>
        )}      {/* Header */}
        <div className="flex flex-col xs:flex-row justify-between items-start xs:items-center gap-4">
          <div>
            <h1 className="text-xl xs:text-2xl font-bold text-gray-800 dark:text-white">
              User Management
            </h1>
            {isAdmin && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Total: {users.length} users • Refresh #{refreshKey}
                {selectedUsers.size > 0 && (
                  <span className="ml-2 text-primary-600 dark:text-primary-400">
                    • {selectedUsers.size} selected
                  </span>
                )}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {/* Admin Actions */}
            {isAdmin && (
              <>
                {canViewAuditLogs && (
                  <button
                    onClick={() => window.location.href = '/admin/audit-logs'}
                    className="flex items-center px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                  >
                    <Activity size={16} className="mr-2" />
                    Audit Logs
                  </button>
                )}
                <button
                  onClick={exportUsers}
                  className="flex items-center px-3 py-2 text-sm bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800"
                >
                  <Download size={16} className="mr-2" />
                  Export
                </button>
                <button
                  onClick={() => {
                    console.log('Manual refresh clicked');
                    loadUsers();
                  }}
                  className="flex items-center px-3 py-2 text-sm bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-200 dark:hover:bg-green-800"
                  title="Refresh user list from database"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                    <polyline points="23 4 23 10 17 10"></polyline>
                    <polyline points="1 20 1 14 7 14"></polyline>
                    <path d="m3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                  </svg>
                  Refresh
                </button>
              </>
            )}
            <button
              onClick={() => {
                setSelectedUser(undefined);
                setShowModal(true);
              }}
              className="flex items-center justify-center px-3 xs:px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 text-sm xs:text-base"
            >
              <PlusIcon size={18} className="mr-2" />
              Add User
            </button>
          </div>
        </div>

        {/* Bulk Actions Bar */}
        {isAdmin && canBulkOperations && selectedUsers.size > 0 && (
          <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg p-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-primary-700 dark:text-primary-300">
                  {selectedUsers.size} users selected
                </span>
                <div className="flex items-center space-x-2">
                  <select
                    onChange={(e) => {
                      if (e.target.value === 'active' || e.target.value === 'inactive') {
                        handleBulkStatusChange(e.target.value as User['status']);
                      }
                      e.target.value = '';
                    }}
                    className="text-xs px-2 py-1 border border-primary-300 dark:border-primary-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    disabled={bulkActionLoading}
                  >
                    <option key="status-default" value="">Change Status</option>
                    <option key="status-active" value="active">Activate</option>
                    <option key="status-inactive" value="inactive">Deactivate</option>
                  </select>
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        handleBulkRoleChange(e.target.value as User['role']);
                      }
                      e.target.value = '';
                    }}
                    className="text-xs px-2 py-1 border border-primary-300 dark:border-primary-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    disabled={bulkActionLoading}
                  >
                    <option key="role-default" value="">Change Role</option>
                    <option key="role-admin" value="admin">Admin</option>
                    <option key="role-cashier" value="cashier">Cashier</option>
                    <option key="role-warehouse" value="warehouse">Warehouse Manager</option>
                    <option key="role-customer" value="customer">Customer</option>
                  </select>
                  <button
                    onClick={handleBulkDelete}
                    disabled={bulkActionLoading}
                    className="flex items-center px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
                  >
                    <TrashIcon size={14} className="mr-1" />
                    Delete
                  </button>
                </div>
              </div>
              <button
                onClick={() => setSelectedUsers(new Set())}
                className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                Clear Selection
              </button>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as User['role'] | 'all')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option key="filter-role-all" value="all">All Roles</option>
              <option key="filter-role-admin" value="admin">Admin</option>
              <option key="filter-role-cashier" value="cashier">Cashier</option>
              <option key="filter-role-warehouse" value="warehouse">Warehouse Manager</option>
              <option key="filter-role-customer" value="customer">Customer</option>
            </select>
          </div>
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as User['status'] | 'all')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option key="filter-status-all" value="all">All Status</option>
              <option key="filter-status-active" value="active">Active</option>
              <option key="filter-status-inactive" value="inactive">Inactive</option>
              <option key="filter-status-pending" value="pending">Pending</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
              <p className="mt-2 text-gray-600 dark:text-gray-400">Loading users...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">            <table key={refreshKey} className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  {isAdmin && canBulkOperations && (
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedUsers.size === filteredUsers.length && filteredUsers.length > 0}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                    </th>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Last Login
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredUsers.map((user, index) => (
                  <tr key={user.id || (user as any)._id || user.email || `user-${index}`} className={(user.id && selectedUsers.has(user.id)) || ((user as any)._id && selectedUsers.has((user as any)._id)) ? 'bg-primary-50 dark:bg-primary-900/20' : ''}>
                    {isAdmin && canBulkOperations && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          key={`checkbox-${user.id || (user as any)._id || user.email || `user-${index}`}`}
                          type="checkbox"
                          checked={(user.id && selectedUsers.has(user.id)) || ((user as any)._id && selectedUsers.has((user as any)._id)) || false}
                          onChange={(e) => {
                            const userId = user.id || (user as any)._id;
                            if (userId) {
                              handleSelectUser(userId, e.target.checked);
                            }
                          }}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-primary-500 flex items-center justify-center">
                            <UserIcon size={20} className="text-white" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {user.fullName || user.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                          {user.username && (
                            <div className="text-xs text-gray-400 dark:text-gray-500">@{user.username}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${user.role === 'admin' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                        user.role === 'cashier' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                          user.role === 'warehouse' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                            'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                        }`}>
                        {user.role === 'warehouse' ? 'Warehouse Manager' : user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${user.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                        user.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                          'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {isAdmin && (
                          <button
                            key={`audit-${user.id || (user as any)._id || user.email || `user-${index}`}`}
                            onClick={() => window.location.href = `/admin/user/${user.id || (user as any)._id}/audit`}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-600"
                            title="View user activity"
                          >
                            <Eye size={16} />
                          </button>
                        )}
                        <button
                          key={`edit-${user.id || (user as any)._id || user.email || `user-${index}`}`}
                          onClick={() => {
                            console.log('Edit button clicked for user:', user);
                            setSelectedUser(user);
                            setShowModal(true);
                          }}
                          className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-600"
                          title="Edit user"
                        >
                          <EditIcon size={16} />
                        </button>
                        {isAdmin && (
                          <button
                            key={`delete-${user.id || (user as any)._id || user.email || `user-${index}`}`}
                            onClick={() => {
                              const userId = user.id || (user as any)._id;
                              console.log('Delete button clicked for user:', { user, userId });
                              if (userId) {
                                handleDeleteUser(userId);
                              } else {
                                console.error('No valid user ID found for deletion');
                                showNotification('Cannot delete user: Invalid user ID', 'error');
                              }
                            }}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-600"
                            title="Delete user"
                          >
                            <TrashIcon size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
              {filteredUsers.length === 0 && !loading && (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                  No users found matching your criteria.
                </div>
              )}
            </div>
          )}
        </div>

        {/* User Modal */}
        <UserModal
          user={selectedUser}
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setSelectedUser(undefined);
          }}
          onSubmit={handleModalSubmit}
        />
      </div>
    </div>
  );
};

export default UserManagement;
