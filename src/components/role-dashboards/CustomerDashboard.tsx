import React, { useState, useEffect } from 'react';

interface CustomerDashboardProps { }

export const CustomerDashboard: React.FC<CustomerDashboardProps> = () => {
    const [dashboardData, setDashboardData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/roles/customer/dashboard', {
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

    const trackOrder = async (orderId: string) => {
        try {
            const response = await fetch(`/api/roles/customer/orders/${orderId}/track`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await response.json();
            return data;
        } catch (err) {
            console.error('Order tracking error:', err);
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
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">🛒 Customer Dashboard</h1>
                            <p className="text-gray-600 dark:text-gray-400">Track orders and manage your account</p>
                        </div>
                        <div className="flex space-x-2">
                            <button
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                onClick={() => window.location.href = '/orders/create'}
                            >
                                🛒 New Order
                            </button>
                            <button
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                onClick={() => window.location.href = '/orders'}
                            >
                                📋 My Orders
                            </button>
                        </div>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Orders</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {dashboardData?.summary?.totalOrders || 0}
                                </p>
                            </div>
                            <div className="text-blue-500 text-3xl">📦</div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Deliveries</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {dashboardData?.summary?.pendingDeliveries || 0}
                                </p>
                            </div>
                            <div className="text-green-500 text-3xl">🚚</div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Notifications</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {dashboardData?.summary?.notifications || 0}
                                </p>
                            </div>
                            <div className="text-orange-500 text-3xl">🔔</div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Rewards Points</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">0</p>
                            </div>
                            <div className="text-purple-500 text-3xl">⭐</div>
                        </div>
                    </div>
                </div>

                {/* Main Actions */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            🛒 Shopping
                        </h3>
                        <div className="space-y-3">
                            <button
                                className="w-full text-left p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                                onClick={() => window.location.href = '/orders/create'}
                            >
                                <div className="flex items-center justify-between">
                                    <span className="font-medium">🛒 Place New Order</span>
                                    <span className="text-blue-600">→</span>
                                </div>
                            </button>

                            <button
                                className="w-full text-left p-3 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                                onClick={() => window.location.href = '/inventory'}
                            >
                                <div className="flex items-center justify-between">
                                    <span className="font-medium">📦 Browse Products</span>
                                    <span className="text-green-600">→</span>
                                </div>
                            </button>

                            <button
                                className="w-full text-left p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
                                onClick={() => window.location.href = '/cart'}
                            >
                                <div className="flex items-center justify-between">
                                    <span className="font-medium">🛍️ View Shopping Cart</span>
                                    <span className="text-purple-600">→</span>
                                </div>
                            </button>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            📋 Order Management
                        </h3>
                        <div className="space-y-3">
                            <button
                                className="w-full text-left p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors"
                                onClick={() => window.location.href = '/orders'}
                            >
                                <div className="flex items-center justify-between">
                                    <span className="font-medium">📋 View All Orders</span>
                                    <span className="text-orange-600">→</span>
                                </div>
                            </button>

                            <button
                                className="w-full text-left p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors"
                                onClick={() => window.location.href = '/orders/track'}
                            >
                                <div className="flex items-center justify-between">
                                    <span className="font-medium">🔍 Track Orders</span>
                                    <span className="text-indigo-600">→</span>
                                </div>
                            </button>

                            <button
                                className="w-full text-left p-3 bg-teal-50 dark:bg-teal-900/20 rounded-lg hover:bg-teal-100 dark:hover:bg-teal-900/30 transition-colors"
                                onClick={() => window.location.href = '/feedback'}
                            >
                                <div className="flex items-center justify-between">
                                    <span className="font-medium">⭐ Leave Feedback</span>
                                    <span className="text-teal-600">→</span>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Recent Orders & Deliveries */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            📦 Recent Orders
                        </h3>
                        <div className="space-y-3">
                            {dashboardData?.recentOrders?.slice(0, 5).map((order: any, index: number) => (
                                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white">
                                            {order.orderNumber || `Order ${index + 1}`}
                                        </p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {new Date(order.createdAt || Date.now()).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium text-gray-900 dark:text-white">
                                            Rs. {order.totalAmount?.toLocaleString() || '0'}
                                        </p>
                                        <span className={`px-2 py-1 text-xs rounded-full ${order.status === 'delivered'
                                                ? 'bg-green-100 text-green-800'
                                                : order.status === 'shipped'
                                                    ? 'bg-blue-100 text-blue-800'
                                                    : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {order.status || 'pending'}
                                        </span>
                                    </div>
                                </div>
                            )) || (
                                    <p className="text-gray-500 text-sm">No recent orders</p>
                                )}
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            🚚 Active Deliveries
                        </h3>
                        <div className="space-y-3">
                            {dashboardData?.deliveries?.slice(0, 5).map((delivery: any, index: number) => (
                                <div key={index} className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="font-medium text-gray-900 dark:text-white">
                                            {delivery.orderId?.orderNumber || `Delivery ${index + 1}`}
                                        </p>
                                        <span className={`px-2 py-1 text-xs rounded-full ${delivery.status === 'delivered'
                                                ? 'bg-green-100 text-green-800'
                                                : delivery.status === 'in_transit'
                                                    ? 'bg-blue-100 text-blue-800'
                                                    : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {delivery.status || 'scheduled'}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Expected: {new Date(delivery.scheduledDate || Date.now()).toLocaleDateString()}
                                        </p>
                                        <button
                                            className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                                            onClick={() => trackOrder(delivery.orderId?._id || '')}
                                        >
                                            Track
                                        </button>
                                    </div>
                                </div>
                            )) || (
                                    <p className="text-gray-500 text-sm">No active deliveries</p>
                                )}
                        </div>
                    </div>
                </div>

                {/* Notifications */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        🔔 Recent Notifications
                    </h3>
                    <div className="space-y-3">
                        {dashboardData?.notifications?.slice(0, 5).map((notification: any, index: number) => (
                            <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                <div className="text-blue-500 text-lg mt-1">🔔</div>
                                <div className="flex-1">
                                    <p className="font-medium text-gray-900 dark:text-white">
                                        {notification.title || `Notification ${index + 1}`}
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                        {notification.message || 'No message available'}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {new Date(notification.createdAt || Date.now()).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        )) || (
                                <p className="text-gray-500 text-sm">No recent notifications</p>
                            )}
                    </div>
                </div>

                {/* Account Actions */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        ⚡ Quick Actions
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <button
                            className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors text-center"
                            onClick={() => window.location.href = '/orders/create'}
                        >
                            <div className="text-2xl mb-2">🛒</div>
                            <p className="text-sm font-medium">New Order</p>
                        </button>

                        <button
                            className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors text-center"
                            onClick={() => window.location.href = '/orders/track'}
                        >
                            <div className="text-2xl mb-2">🔍</div>
                            <p className="text-sm font-medium">Track Order</p>
                        </button>

                        <button
                            className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors text-center"
                            onClick={() => window.location.href = '/profile'}
                        >
                            <div className="text-2xl mb-2">👤</div>
                            <p className="text-sm font-medium">My Profile</p>
                        </button>

                        <button
                            className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors text-center"
                            onClick={() => window.location.href = '/support'}
                        >
                            <div className="text-2xl mb-2">🆘</div>
                            <p className="text-sm font-medium">Support</p>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomerDashboard;
