import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/authService';
import { socketService } from '../services/socketService';
import RealtimeNotificationContainer, { RealtimeNotification } from './RealtimeNotifications';
import './UserManagement.css';
import './RealtimeNotifications.css';
import { useNotification } from '../contexts/NotificationContext';

interface User {
    _id: string;
    name: string;
    email: string;
    role: string;
    status: string;
    lastLogin?: string;
}

interface FormData {
    name: string;
    email: string;
    password: string;
    role: string;
    status: string;
}

const UserManagement: React.FC = () => {
    const { user, isAuthenticated } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [showModal, setShowModal] = useState<boolean>(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [uploading, setUploading] = useState<boolean>(false);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [roleFilter, setRoleFilter] = useState<string>('');
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [realtimeNotifications, setRealtimeNotifications] = useState<RealtimeNotification[]>([]);
    const [isSocketConnected, setIsSocketConnected] = useState<boolean>(false);
    const { showError, showSuccess } = useNotification();

    // Form state
    const [formData, setFormData] = useState<FormData>({
        name: '',
        email: '',
        password: '',
        role: 'customer',
        status: 'Active'
    });

    const API_BASE = 'http://localhost:5000/api';

    // Add notification helper function
    const addNotification = (type: 'success' | 'info' | 'warning' | 'error', title: string, message: string) => {
        const notification: RealtimeNotification = {
            id: Date.now().toString(),
            type,
            title,
            message,
            timestamp: new Date()
        };
        setRealtimeNotifications(prev => [...prev, notification]);
    };

    // Remove notification helper function
    const removeNotification = (id: string) => {
        setRealtimeNotifications(prev => prev.filter(n => n.id !== id));
    };

    // Get auth token from authService
    const getAuthHeaders = () => {
        const token = authService.getToken();
        return {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        };
    };

    // Fetch users from backend
    const fetchUsers = useCallback(async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (searchTerm) params.append('search', searchTerm);
            if (roleFilter) params.append('role', roleFilter);
            if (statusFilter) params.append('status', statusFilter);
            params.append('limit', '1000');

            const response = await fetch(`${API_BASE}/users?${params}`, {
                headers: getAuthHeaders()
            });

            if (response.status === 401) {
                setError('Authentication required. Please login.');
                return;
            }

            const data = await response.json();

            if (data.success) {
                // Handle different response formats
                const users = data.data || data.users || [];
                // Transform backend user data to match frontend format
                const transformedUsers = users.map((user: any) => ({
                    _id: user._id || user.id,
                    name: user.fullName || user.name,
                    email: user.email,
                    role: user.role,
                    status: user.isActive ? 'Active' : 'Inactive',
                    lastLogin: user.lastLogin
                }));
                setUsers(transformedUsers);
            } else {
                setError(data.message || 'Failed to fetch users');
            }
        } catch (err: any) {
            setError('Error fetching users: ' + (err?.message || 'Unknown error'));
        } finally {
            setLoading(false);
        }
    }, [searchTerm, roleFilter, statusFilter]);

    // Create new user
    const createUser = async (userData: FormData) => {
        try {
            // Transform to backend format
            const backendData = {
                username: userData.email.split('@')[0], // Generate username from email
                email: userData.email,
                password: userData.password,
                fullName: userData.name,
                role: userData.role.toLowerCase(), // Backend expects lowercase roles
                isActive: userData.status === 'Active',
                isApproved: userData.status === 'Active'
            };

            const response = await fetch(`${API_BASE}/users`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(backendData),
            });

            if (response.status === 401) {
                return { success: false, error: 'Authentication required. Please login.' };
            }

            const data = await response.json();

            if (data.success) {
                fetchUsers(); // Refresh the list
                return { success: true };
            } else {
                return { success: false, error: data.message || 'Failed to create user' };
            }
        } catch (err: any) {
            return { success: false, error: 'Error creating user: ' + (err?.message || 'Unknown error') };
        }
    };

    // Update user
    const updateUser = async (id: string, userData: FormData) => {
        try {
            // Transform to backend format
            const backendData: any = {
                fullName: userData.name,
                role: userData.role.toLowerCase(),
                isActive: userData.status === 'Active',
                isApproved: userData.status === 'Active'
            };

            // Only include password if it's provided
            if (userData.password && userData.password.trim()) {
                backendData.password = userData.password;
            }

            const response = await fetch(`${API_BASE}/users/${id}`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify(backendData),
            });

            if (response.status === 401) {
                return { success: false, error: 'Authentication required. Please login.' };
            }

            const data = await response.json();

            if (data.success) {
                fetchUsers(); // Refresh the list
                return { success: true };
            } else {
                return { success: false, error: data.message || 'Failed to update user' };
            }
        } catch (err: any) {
            return { success: false, error: 'Error updating user: ' + (err?.message || 'Unknown error') };
        }
    };

    // Delete user
    const deleteUser = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this user?')) {
            return;
        }

        try {
            const response = await fetch(`${API_BASE}/users/${id}`, {
                method: 'DELETE',
                headers: getAuthHeaders(),
            });

            if (response.status === 401) {
                showError('Authentication Required', 'Authentication required. Please login.');
                return;
            }

            const data = await response.json();

            if (data.success) {
                fetchUsers(); // Refresh the list
                showSuccess('Success', 'User deleted successfully');
            } else {
                showError('Error', data.message || 'Failed to delete user');
            }
        } catch (err: any) {
            showError('Error', 'Error deleting user: ' + (err?.message || 'Unknown error'));
        }
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        let result;
        if (editingUser) {
            result = await updateUser(editingUser._id, formData);
        } else {
            result = await createUser(formData);
        }

        if (result.success) {
            setShowModal(false);
            setEditingUser(null);
            setFormData({ name: '', email: '', password: '', role: 'Customer', status: 'Active' });
        } else {
            alert(result.error);
        }

        setLoading(false);
    };

    // Handle Excel file upload
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
            alert('Please select an Excel file (.xlsx or .xls)');
            return;
        }

        setUploading(true);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch(`${API_BASE}/users/upload-excel`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                },
                body: formData,
            });

            if (response.status === 401) {
                alert('Authentication required. Please login.');
                return;
            }

            const data = await response.json();

            if (data.success) {
                alert(`Successfully imported ${data.data.inserted} users!`);
                fetchUsers(); // Refresh the list
            } else {
                alert(data.message || 'Failed to upload file');
            }
        } catch (err: any) {
            alert('Error uploading file: ' + (err?.message || 'Unknown error'));
        } finally {
            setUploading(false);
            e.target.value = ''; // Reset file input
        }
    };

    // Open edit modal
    const openEditModal = (user: User) => {
        setEditingUser(user);
        setFormData({
            name: user.name,
            email: user.email,
            password: '', // Don't pre-fill password for security
            role: user.role,
            status: user.status
        });
        setShowModal(true);
    };

    // Open create modal
    const openCreateModal = () => {
        setEditingUser(null);
        setFormData({ name: '', email: '', password: '', role: 'customer', status: 'Active' });
        setShowModal(true);
    };

    // Load users on component mount and when filters change
    useEffect(() => {
        if (!isAuthenticated) {
            setError('Please login to access user management');
            setLoading(false);
            return;
        }

        if (user?.role !== 'admin') {
            setError('Admin access required for user management');
            setLoading(false);
            return;
        }

        fetchUsers();
    }, [searchTerm, roleFilter, statusFilter, isAuthenticated, user]);

    // Set up Socket.IO connection and real-time event listeners
    useEffect(() => {
        if (!isAuthenticated || user?.role !== 'admin') {
            return;
        }

        // Connect to Socket.IO server
        socketService.connect();

        // Update connection status
        setIsSocketConnected(socketService.isConnected());

        // Set up real-time event listeners
        socketService.onUserCreated((data) => {
            console.log('🔄 Real-time: User created', data);
            // Refresh the user list to include the new user
            fetchUsers();
            // Show notification
            addNotification('success', 'User Created', data.message);
        });

        socketService.onUserUpdated((data) => {
            console.log('🔄 Real-time: User updated', data);
            // Update the user in the current list
            setUsers(prevUsers =>
                prevUsers.map(u =>
                    u._id === data.user.id
                        ? {
                            ...u,
                            name: data.user.fullName,
                            email: data.user.email,
                            role: data.user.role,
                            status: data.user.isActive ? 'Active' : 'Inactive'
                        }
                        : u
                )
            );
            // Show notification
            addNotification('info', 'User Updated', data.message);
        });

        socketService.onUserDeleted((data) => {
            console.log('🔄 Real-time: User deleted', data);
            // Remove the user from the current list
            setUsers(prevUsers => prevUsers.filter(u => u._id !== data.user.id));
            // Show notification
            addNotification('warning', 'User Deleted', data.message);
        });

        // Cleanup function
        return () => {
            socketService.removeUserListeners();
            socketService.disconnect();
        };
    }, [isAuthenticated, user, fetchUsers]);

    // Show authentication error if not logged in
    if (!isAuthenticated) {
        return (
            <div className="user-management">
                <div className="error-message">
                    Please login to access user management
                </div>
            </div>
        );
    }

    // Show access denied if not admin
    if (user?.role !== 'admin') {
        return (
            <div className="user-management">
                <div className="error-message">
                    Admin access required for user management
                </div>
            </div>
        );
    }

    return (
        <div className="user-management">
            {/* Real-time Notifications */}
            <RealtimeNotificationContainer
                notifications={realtimeNotifications}
                onRemoveNotification={removeNotification}
            />

            <div className="header">
                <h1>User Management</h1>

                {/* Real-time Connection Status */}
                <div className={`realtime-status ${isSocketConnected ? 'connected' : 'disconnected'}`}>
                    <div className="realtime-status-dot"></div>
                    {isSocketConnected ? 'Real-time updates active' : 'Real-time updates disconnected'}
                </div>

                <div className="header-actions">
                    <button className="btn btn-primary" onClick={openCreateModal}>
                        Add New User
                    </button>
                    <div className="file-upload">
                        <input
                            type="file"
                            accept=".xlsx,.xls"
                            onChange={handleFileUpload}
                            disabled={uploading}
                            id="excel-upload"
                            style={{ display: 'none' }}
                        />
                        <label htmlFor="excel-upload" className={`btn btn-secondary ${uploading ? 'disabled' : ''}`}>
                            {uploading ? 'Uploading...' : 'Upload Excel'}
                        </label>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="filters">
                <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                />
                <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="filter-select"
                >
                    <option value="">All Roles</option>
                    <option value="admin">Admin</option>
                    <option value="warehouse">Warehouse Manager</option>
                    <option value="cashier">Cashier</option>
                    <option value="customer">Customer</option>
                    <option value="user">User</option>
                    <option value="driver">Driver</option>
                    <option value="editor">Editor</option>
                </select>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="filter-select"
                >
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                </select>
            </div>

            {/* Error message */}
            {error && <div className="error-message">{error}</div>}

            {/* Users table */}
            {loading ? (
                <div className="loading">Loading users...</div>
            ) : (
                <div className="users-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Status</th>
                                <th>Last Login</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user._id}>
                                    <td>{user.name}</td>
                                    <td>{user.email}</td>
                                    <td>
                                        <span className={`role-badge role-${user.role.toLowerCase().replace(' ', '-')}`}>
                                            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`status-badge status-${user.status.toLowerCase()}`}>
                                            {user.status}
                                        </span>
                                    </td>
                                    <td>
                                        {user.lastLogin
                                            ? new Date(user.lastLogin).toLocaleDateString()
                                            : 'Never'
                                        }
                                    </td>
                                    <td>
                                        <button
                                            className="btn btn-sm btn-primary"
                                            onClick={() => openEditModal(user)}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className="btn btn-sm btn-danger"
                                            onClick={() => deleteUser(user._id)}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {users.length === 0 && !loading && (
                        <div className="empty-state">No users found</div>
                    )}
                </div>
            )}

            {/* Modal for create/edit user */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <h2>{editingUser ? 'Edit User' : 'Create New User'}</h2>
                            <button
                                className="close-btn"
                                onClick={() => setShowModal(false)}
                            >
                                ×
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="modal-body">
                            <div className="form-group">
                                <label htmlFor="name">Name:</label>
                                <input
                                    type="text"
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="email">Email:</label>
                                <input
                                    type="email"
                                    id="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="password">
                                    Password {editingUser && '(leave blank to keep current)'}:
                                </label>
                                <input
                                    type="password"
                                    id="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required={!editingUser}
                                    minLength={6}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="role">Role:</label>
                                <select
                                    id="role"
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    required
                                >
                                    <option value="customer">Customer</option>
                                    <option value="cashier">Cashier</option>
                                    <option value="warehouse">Warehouse Manager</option>
                                    <option value="user">User</option>
                                    <option value="driver">Driver</option>
                                    <option value="editor">Editor</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label htmlFor="status">Status:</label>
                                <select
                                    id="status"
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    required
                                >
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                    <option value="Pending">Pending</option>
                                    <option value="Approved">Approved</option>
                                </select>
                            </div>
                            <div className="modal-footer">
                                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
                                    Cancel
                                </button>
                                <button type="submit" disabled={loading} className="btn btn-primary">
                                    {loading ? 'Saving...' : (editingUser ? 'Update User' : 'Create User')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;
