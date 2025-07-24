import React, { useState, useEffect } from 'react';
import './UserManagement.css';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'Customer',
        status: 'Active'
    });

    const API_BASE = 'http://localhost:5000/api/usersNew';

    // Fetch users from backend
    const fetchUsers = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (searchTerm) params.append('search', searchTerm);
            if (roleFilter) params.append('role', roleFilter);
            if (statusFilter) params.append('status', statusFilter);
            params.append('limit', '1000');

            const response = await fetch(`${API_BASE}?${params}`);
            const data = await response.json();

            if (data.success) {
                setUsers(data.data);
            } else {
                setError(data.message || 'Failed to fetch users');
            }
        } catch (err) {
            setError('Error fetching users: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    // Create new user
    const createUser = async (userData) => {
        try {
            const response = await fetch(API_BASE, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });

            const data = await response.json();

            if (data.success) {
                fetchUsers(); // Refresh the list
                return { success: true };
            } else {
                return { success: false, error: data.message || 'Failed to create user' };
            }
        } catch (err) {
            return { success: false, error: 'Error creating user: ' + err.message };
        }
    };

    // Update user
    const updateUser = async (id, userData) => {
        try {
            const response = await fetch(`${API_BASE}/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });

            const data = await response.json();

            if (data.success) {
                fetchUsers(); // Refresh the list
                return { success: true };
            } else {
                return { success: false, error: data.message || 'Failed to update user' };
            }
        } catch (err) {
            return { success: false, error: 'Error updating user: ' + err.message };
        }
    };

    // Delete user
    const deleteUser = async (id) => {
        if (!window.confirm('Are you sure you want to delete this user?')) {
            return;
        }

        try {
            const response = await fetch(`${API_BASE}/${id}`, {
                method: 'DELETE',
            });

            const data = await response.json();

            if (data.success) {
                fetchUsers(); // Refresh the list
                alert('User deleted successfully');
            } else {
                alert(data.message || 'Failed to delete user');
            }
        } catch (err) {
            alert('Error deleting user: ' + err.message);
        }
    };

    // Handle form submission
    const handleSubmit = async (e) => {
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
    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
            alert('Please select an Excel file (.xlsx or .xls)');
            return;
        }

        setUploading(true);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch(`${API_BASE}/upload-excel`, {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (data.success) {
                alert(`Successfully imported ${data.data.inserted} users!`);
                fetchUsers(); // Refresh the list
            } else {
                alert(data.message || 'Failed to upload file');
            }
        } catch (err) {
            alert('Error uploading file: ' + err.message);
        } finally {
            setUploading(false);
            e.target.value = ''; // Reset file input
        }
    };

    // Open edit modal
    const openEditModal = (user) => {
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
        setFormData({ name: '', email: '', password: '', role: 'Customer', status: 'Active' });
        setShowModal(true);
    };

    // Load users on component mount and when filters change
    useEffect(() => {
        fetchUsers();
    }, [searchTerm, roleFilter, statusFilter]);

    return (
        <div className="user-management">
            <div className="header">
                <h1>User Management</h1>
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
                </select>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="filter-select"
                >
                    <option value="">All Status</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
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
                                            {user.role}
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
                                    minLength="6"
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
