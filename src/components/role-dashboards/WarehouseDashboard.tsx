import React, { useState, useEffect } from 'react';

interface WarehouseDashboardProps { }

export const WarehouseDashboard: React.FC<WarehouseDashboardProps> = () => {
    const [dashboardData, setDashboardData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/roles/warehouse/dashboard', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await response.json();
            setDashboardData(data.data);
        } catch (err) {
            console.error('Dashboard fetch error:', err);
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

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">🏢 Warehouse Dashboard</h1>
                            <p className="text-gray-600 dark:text-gray-400">Inventory management and order processing</p>
                        </div>
                        <div className="flex space-x-2">
                            <button
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                onClick={() => window.location.href = '/warehouse/inventory'}
                            >
                                📦 Manage Inventory
                            </button>
                            <button
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                onClick={() => window.location.href = '/warehouse/orders'}
                            >
                                📋 Process Orders
                            </button>
                        </div>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Items</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {dashboardData?.summary?.totalItems || 0}
                                </p>
                            </div>
                            <div className="text-blue-500 text-3xl">📦</div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Orders</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {dashboardData?.summary?.pendingOrders || 0}
                                </p>
                            </div>
                            <div className="text-orange-500 text-3xl">⏳</div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Today's Deliveries</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {dashboardData?.summary?.todayDeliveries || 0}
                                </p>
                            </div>
                            <div className="text-green-500 text-3xl">🚚</div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Stock Alerts</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {dashboardData?.summary?.stockAlerts || 0}
                                </p>
                            </div>
                            <div className="text-red-500 text-3xl">⚠️</div>
                        </div>
                    </div>
                </div>

                {/* Main Actions */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            📦 Inventory Management
                        </h3>
                        <div className="space-y-3">
                            <button
                                className="w-full text-left p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                                onClick={() => window.location.href = '/warehouse/inventory/update'}
                            >
                                <div className="flex items-center justify-between">
                                    <span className="font-medium">📝 Update Stock Levels</span>
                                    <span className="text-blue-600">→</span>
                                </div>
                            </button>

                            <button
                                className="w-full text-left p-3 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                                onClick={() => window.location.href = '/warehouse/inventory/add'}
                            >
                                <div className="flex items-center justify-between">
                                    <span className="font-medium">➕ Add New Items</span>
                                    <span className="text-green-600">→</span>
                                </div>
                            </button>

                            <button
                                className="w-full text-left p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
                                onClick={() => window.location.href = '/warehouse/inventory/transfer'}
                            >
                                <div className="flex items-center justify-between">
                                    <span className="font-medium">🔄 Transfer Stock</span>
                                    <span className="text-purple-600">→</span>
                                </div>
                            </button>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            📋 Order Processing
                        </h3>
                        <div className="space-y-3">
                            <button
                                className="w-full text-left p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors"
                                onClick={() => window.location.href = '/warehouse/orders/pending'}
                            >
                                <div className="flex items-center justify-between">
                                    <span className="font-medium">⏳ Process Pending Orders</span>
                                    <span className="text-orange-600">→</span>
                                </div>
                            </button>

                            <button
                                className="w-full text-left p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors"
                                onClick={() => window.location.href = '/warehouse/orders/prepare'}
                            >
                                <div className="flex items-center justify-between">
                                    <span className="font-medium">📦 Prepare for Delivery</span>
                                    <span className="text-indigo-600">→</span>
                                </div>
                            </button>

                            <button
                                className="w-full text-left p-3 bg-teal-50 dark:bg-teal-900/20 rounded-lg hover:bg-teal-100 dark:hover:bg-teal-900/30 transition-colors"
                                onClick={() => window.location.href = '/warehouse/deliveries'}
                            >
                                <div className="flex items-center justify-between">
                                    <span className="font-medium">🚚 Schedule Deliveries</span>
                                    <span className="text-teal-600">→</span>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Alerts & Recent Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            ⚠️ Stock Alerts
                        </h3>
                        <div className="space-y-3">
                            {dashboardData?.alerts?.slice(0, 5).map((alert: any, index: number) => (
                                <div key={index} className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                                    <p className="font-medium text-red-800 dark:text-red-200">
                                        {alert.name || `Item ${index + 1}`}
                                    </p>
                                    <p className="text-sm text-red-600 dark:text-red-300">
                                        Low stock: {alert.current_stock || 0} remaining
                                    </p>
                                </div>
                            )) || (
                                    <p className="text-gray-500 text-sm">No stock alerts</p>
                                )}
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            📈 Recent Orders
                        </h3>
                        <div className="space-y-3">
                            {dashboardData?.orders?.slice(0, 5).map((order: any, index: number) => (
                                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white">
                                            {order.orderNumber || `Order ${index + 1}`}
                                        </p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {order.customer?.fullName || 'Customer'}
                                        </p>
                                    </div>
                                    <span className={`px-2 py-1 text-xs rounded-full ${order.status === 'pending'
                                            ? 'bg-yellow-100 text-yellow-800'
                                            : 'bg-green-100 text-green-800'
                                        }`}>
                                        {order.status || 'pending'}
                                    </span>
                                </div>
                            )) || (
                                    <p className="text-gray-500 text-sm">No recent orders</p>
                                )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WarehouseDashboard;
