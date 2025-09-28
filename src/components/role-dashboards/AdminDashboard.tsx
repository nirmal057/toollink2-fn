import React, { useState, useEffect } from 'react';

interface AdminDashboardProps { }

export const AdminDashboard: React.FC<AdminDashboardProps> = () => {
    const [dashboardData, setDashboardData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/roles/admin/dashboard', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await response.json();
            setDashboardData(data.data);
        } catch (err: any) {
            setError(err.message || 'Failed to load dashboard');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-red-500">{error}</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">👑 Admin Dashboard</h1>
                            <p className="text-gray-600 dark:text-gray-400">System management and overview</p>
                        </div>
                        <div className="flex space-x-2">
                            <button
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                onClick={() => window.location.href = '/admin/reports'}
                            >
                                📊 Reports
                            </button>
                            <button
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                onClick={() => window.location.href = '/admin/users'}
                            >
                                👥 Manage Users
                            </button>
                        </div>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Users</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {dashboardData?.summary?.totalUsers || 0}
                                </p>
                            </div>
                            <div className="text-blue-500 text-3xl">👥</div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Orders</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {dashboardData?.summary?.totalOrders || 0}
                                </p>
                            </div>
                            <div className="text-green-500 text-3xl">🛒</div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Warehouses</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {dashboardData?.summary?.totalWarehouses || 0}
                                </p>
                            </div>
                            <div className="text-orange-500 text-3xl">🏢</div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Revenue</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    Rs. {dashboardData?.summary?.monthlyRevenue?.toLocaleString() || '0'}
                                </p>
                            </div>
                            <div className="text-green-600 text-3xl">💰</div>
                        </div>
                    </div>
                </div>

                {/* Admin Actions */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            🔧 System Management
                        </h3>
                        <div className="space-y-3">
                            <button
                                className="w-full text-left p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                                onClick={() => window.location.href = '/admin/users'}
                            >
                                <div className="flex items-center justify-between">
                                    <span className="font-medium">👥 User Management</span>
                                    <span className="text-blue-600">→</span>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    Create, edit, and manage user accounts
                                </p>
                            </button>

                            <button
                                className="w-full text-left p-3 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                                onClick={() => window.location.href = '/admin/warehouses'}
                            >
                                <div className="flex items-center justify-between">
                                    <span className="font-medium">🏢 Warehouse Management</span>
                                    <span className="text-green-600">→</span>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    Manage warehouse operations and assignments
                                </p>
                            </button>

                            <button
                                className="w-full text-left p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
                                onClick={() => window.location.href = '/admin/inventory'}
                            >
                                <div className="flex items-center justify-between">
                                    <span className="font-medium">📦 Inventory Overview</span>
                                    <span className="text-purple-600">→</span>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    Monitor inventory levels across all warehouses
                                </p>
                            </button>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            📊 Analytics & Reports
                        </h3>
                        <div className="space-y-3">
                            <button
                                className="w-full text-left p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors"
                                onClick={() => window.location.href = '/admin/reports/sales'}
                            >
                                <div className="flex items-center justify-between">
                                    <span className="font-medium">💹 Sales Reports</span>
                                    <span className="text-indigo-600">→</span>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    Generate detailed sales analytics
                                </p>
                            </button>

                            <button
                                className="w-full text-left p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors"
                                onClick={() => window.location.href = '/admin/reports/delivery'}
                            >
                                <div className="flex items-center justify-between">
                                    <span className="font-medium">🚚 Delivery Reports</span>
                                    <span className="text-orange-600">→</span>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    Track delivery performance and metrics
                                </p>
                            </button>

                            <button
                                className="w-full text-left p-3 bg-teal-50 dark:bg-teal-900/20 rounded-lg hover:bg-teal-100 dark:hover:bg-teal-900/30 transition-colors"
                                onClick={() => window.location.href = '/admin/audit'}
                            >
                                <div className="flex items-center justify-between">
                                    <span className="font-medium">🔍 Audit Logs</span>
                                    <span className="text-teal-600">→</span>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    Review system activity and changes
                                </p>
                            </button>
                        </div>
                    </div>
                </div>

                {/* System Status */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        🔔 System Status & Alerts
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                            <div className="flex items-center">
                                <div className="text-green-500 text-xl mr-3">✅</div>
                                <div>
                                    <p className="font-medium text-green-800 dark:text-green-200">System Healthy</p>
                                    <p className="text-sm text-green-600 dark:text-green-300">All services operational</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                            <div className="flex items-center">
                                <div className="text-yellow-500 text-xl mr-3">⚠️</div>
                                <div>
                                    <p className="font-medium text-yellow-800 dark:text-yellow-200">Pending Approvals</p>
                                    <p className="text-sm text-yellow-600 dark:text-yellow-300">3 users need approval</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <div className="flex items-center">
                                <div className="text-blue-500 text-xl mr-3">📊</div>
                                <div>
                                    <p className="font-medium text-blue-800 dark:text-blue-200">Recent Activity</p>
                                    <p className="text-sm text-blue-600 dark:text-blue-300">High system usage today</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
