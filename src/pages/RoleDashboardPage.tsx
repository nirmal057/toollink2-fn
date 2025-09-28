import React, { useState, useEffect } from 'react';
import AdminDashboard from '../components/role-dashboards/AdminDashboard';
import WarehouseDashboard from '../components/role-dashboards/WarehouseDashboard';
import CashierDashboard from '../components/role-dashboards/CashierDashboard';
import CustomerDashboard from '../components/role-dashboards/CustomerDashboard';
import DriverDashboard from '../components/role-dashboards/DriverDashboard';
import EditorDashboard from '../components/role-dashboards/EditorDashboard';

interface User {
    _id: string;
    fullName: string;
    email: string;
    role: string;
    assignedWarehouses?: Array<{
        _id: string;
        name: string;
    }>;
}

interface RoleDashboardPageProps { }

const RoleDashboardPage: React.FC<RoleDashboardPageProps> = () => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [selectedRole, setSelectedRole] = useState<string>('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUserProfile();
    }, []);

    const fetchUserProfile = async () => {
        try {
            const response = await fetch('/api/roles/profile', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await response.json();
            if (data.success) {
                setCurrentUser(data.data);
                setSelectedRole(data.data.role);
            }
        } catch (err) {
            console.error('Failed to fetch user profile:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleRoleSwitch = (role: string) => {
        setSelectedRole(role);
    };

    const renderDashboard = () => {
        switch (selectedRole) {
            case 'admin':
                return <AdminDashboard />;
            case 'warehouse':
                return <WarehouseDashboard />;
            case 'cashier':
                return <CashierDashboard />;
            case 'customer':
            case 'user':
                return <CustomerDashboard />;
            case 'driver':
                return <DriverDashboard />;
            case 'editor':
                return <EditorDashboard />;
            default:
                return <CustomerDashboard />;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    const availableRoles = [
        { value: 'admin', label: '👑 Admin', color: 'bg-red-500' },
        { value: 'warehouse', label: '🏢 Warehouse', color: 'bg-blue-500' },
        { value: 'cashier', label: '💰 Cashier', color: 'bg-green-500' },
        { value: 'customer', label: '🛒 Customer', color: 'bg-purple-500' },
        { value: 'driver', label: '🚚 Driver', color: 'bg-orange-500' },
        { value: 'editor', label: '✏️ Editor', color: 'bg-indigo-500' }
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Role Selector Header */}
            <div className="bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700 p-4">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                {currentUser?.fullName?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {currentUser?.fullName || 'User'}
                                </h2>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {currentUser?.email}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                View as:
                            </span>
                            <div className="flex flex-wrap gap-2">
                                {availableRoles.map((role) => (
                                    <button
                                        key={role.value}
                                        onClick={() => handleRoleSwitch(role.value)}
                                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${selectedRole === role.value
                                                ? `${role.color} text-white shadow-lg scale-105`
                                                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                                            }`}
                                    >
                                        {role.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Current Role Info */}
                    <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                                    Currently viewing: <span className="font-bold">
                                        {availableRoles.find(r => r.value === selectedRole)?.label || selectedRole}
                                    </span>
                                </p>
                                <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                                    Your actual role: {currentUser?.role} |
                                    {currentUser?.assignedWarehouses && currentUser.assignedWarehouses.length > 0 &&
                                        ` Warehouses: ${currentUser.assignedWarehouses.map(w => w.name).join(', ')}`
                                    }
                                </p>
                            </div>
                            <button
                                onClick={() => setSelectedRole(currentUser?.role || 'customer')}
                                className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                            >
                                Switch to My Role
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Dashboard Content */}
            <div className="transition-all duration-300">
                {renderDashboard()}
            </div>

            {/* Role Descriptions Modal Toggle */}
            <div className="fixed bottom-6 right-6">
                <button
                    onClick={() => {
                        const modal = document.getElementById('role-help-modal');
                        if (modal) {
                            modal.classList.toggle('hidden');
                        }
                    }}
                    className="w-12 h-12 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors flex items-center justify-center text-lg font-bold"
                >
                    ?
                </button>
            </div>

            {/* Role Descriptions Modal */}
            <div id="role-help-modal" className="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto">
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Role Descriptions
                            </h3>
                            <button
                                onClick={() => {
                                    const modal = document.getElementById('role-help-modal');
                                    if (modal) {
                                        modal.classList.add('hidden');
                                    }
                                }}
                                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                                <h4 className="font-medium text-red-800 dark:text-red-200">👑 Admin</h4>
                                <p className="text-sm text-red-600 dark:text-red-300">
                                    Full system access, user management, reports, and system configuration
                                </p>
                            </div>

                            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                <h4 className="font-medium text-blue-800 dark:text-blue-200">🏢 Warehouse</h4>
                                <p className="text-sm text-blue-600 dark:text-blue-300">
                                    Inventory management, order processing, and warehouse operations
                                </p>
                            </div>

                            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                <h4 className="font-medium text-green-800 dark:text-green-200">💰 Cashier</h4>
                                <p className="text-sm text-green-600 dark:text-green-300">
                                    Payment processing, POS operations, and receipt generation
                                </p>
                            </div>

                            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                                <h4 className="font-medium text-purple-800 dark:text-purple-200">🛒 Customer</h4>
                                <p className="text-sm text-purple-600 dark:text-purple-300">
                                    Order placement, tracking, and account management
                                </p>
                            </div>

                            <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                                <h4 className="font-medium text-orange-800 dark:text-orange-200">🚚 Driver</h4>
                                <p className="text-sm text-orange-600 dark:text-orange-300">
                                    Delivery management, route planning, and delivery confirmation
                                </p>
                            </div>

                            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                                <h4 className="font-medium text-indigo-800 dark:text-indigo-200">✏️ Editor</h4>
                                <p className="text-sm text-indigo-600 dark:text-indigo-300">
                                    Content management, inventory editing, and bulk operations
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RoleDashboardPage;
