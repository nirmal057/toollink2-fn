import React, { useState, useEffect } from 'react';

interface DriverDashboardProps { }

export const DriverDashboard: React.FC<DriverDashboardProps> = () => {
    const [dashboardData, setDashboardData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/roles/driver/dashboard', {
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

    const updateDeliveryStatus = async (deliveryId: string, status: string, location?: any) => {
        try {
            const response = await fetch(`/api/roles/driver/deliveries/${deliveryId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ status, location })
            });
            const data = await response.json();
            if (data.success) {
                fetchDashboardData(); // Refresh dashboard
            }
            return data;
        } catch (err) {
            console.error('Status update error:', err);
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
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">🚚 Driver Dashboard</h1>
                            <p className="text-gray-600 dark:text-gray-400">Delivery management and route tracking</p>
                        </div>
                        <div className="flex space-x-2">
                            <button
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                onClick={() => window.location.href = '/driver/deliveries'}
                            >
                                📦 My Deliveries
                            </button>
                            <button
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                onClick={() => window.location.href = '/driver/route'}
                            >
                                🗺️ View Route
                            </button>
                        </div>
                    </div>
                </div>

                {/* Daily Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Today's Deliveries</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {dashboardData?.summary?.todayDeliveries || 0}
                                </p>
                            </div>
                            <div className="text-blue-500 text-3xl">📦</div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Deliveries</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {dashboardData?.summary?.pendingDeliveries || 0}
                                </p>
                            </div>
                            <div className="text-orange-500 text-3xl">⏳</div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed Today</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {dashboardData?.summary?.completedDeliveries || 0}
                                </p>
                            </div>
                            <div className="text-green-500 text-3xl">✅</div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Today's Earnings</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    Rs. {dashboardData?.summary?.todayEarnings?.toLocaleString() || '0'}
                                </p>
                            </div>
                            <div className="text-green-600 text-3xl">💰</div>
                        </div>
                    </div>
                </div>

                {/* Main Actions */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            📦 Delivery Management
                        </h3>
                        <div className="space-y-3">
                            <button
                                className="w-full text-left p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                                onClick={() => window.location.href = '/driver/deliveries/pickup'}
                            >
                                <div className="flex items-center justify-between">
                                    <span className="font-medium">📦 Pick Up Packages</span>
                                    <span className="text-blue-600">→</span>
                                </div>
                            </button>

                            <button
                                className="w-full text-left p-3 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                                onClick={() => window.location.href = '/driver/deliveries/deliver'}
                            >
                                <div className="flex items-center justify-between">
                                    <span className="font-medium">🚚 Make Deliveries</span>
                                    <span className="text-green-600">→</span>
                                </div>
                            </button>

                            <button
                                className="w-full text-left p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
                                onClick={() => window.location.href = '/driver/deliveries/proof'}
                            >
                                <div className="flex items-center justify-between">
                                    <span className="font-medium">📸 Submit Delivery Proof</span>
                                    <span className="text-purple-600">→</span>
                                </div>
                            </button>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            🗺️ Route & Navigation
                        </h3>
                        <div className="space-y-3">
                            <button
                                className="w-full text-left p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors"
                                onClick={() => window.location.href = '/driver/route/today'}
                            >
                                <div className="flex items-center justify-between">
                                    <span className="font-medium">🗺️ Today's Route</span>
                                    <span className="text-indigo-600">→</span>
                                </div>
                            </button>

                            <button
                                className="w-full text-left p-3 bg-teal-50 dark:bg-teal-900/20 rounded-lg hover:bg-teal-100 dark:hover:bg-teal-900/30 transition-colors"
                                onClick={() => window.location.href = '/driver/navigation'}
                            >
                                <div className="flex items-center justify-between">
                                    <span className="font-medium">🧭 GPS Navigation</span>
                                    <span className="text-teal-600">→</span>
                                </div>
                            </button>

                            <button
                                className="w-full text-left p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors"
                                onClick={() => window.location.href = '/driver/location'}
                            >
                                <div className="flex items-center justify-between">
                                    <span className="font-medium">📍 Update Location</span>
                                    <span className="text-orange-600">→</span>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Today's Schedule & Pending Deliveries */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            📅 Today's Schedule
                        </h3>
                        <div className="space-y-3">
                            {dashboardData?.deliveries?.today?.slice(0, 5).map((delivery: any, index: number) => (
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
                                            {delivery.status || 'assigned'}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                        Customer: {delivery.customerId?.fullName || 'N/A'}
                                    </p>
                                    <div className="flex space-x-2">
                                        {delivery.status === 'assigned' && (
                                            <button
                                                className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                                                onClick={() => updateDeliveryStatus(delivery._id, 'picked_up')}
                                            >
                                                Pick Up
                                            </button>
                                        )}
                                        {delivery.status === 'picked_up' && (
                                            <button
                                                className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                                                onClick={() => updateDeliveryStatus(delivery._id, 'in_transit')}
                                            >
                                                Start Delivery
                                            </button>
                                        )}
                                        {delivery.status === 'in_transit' && (
                                            <button
                                                className="px-3 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700"
                                                onClick={() => updateDeliveryStatus(delivery._id, 'delivered')}
                                            >
                                                Mark Delivered
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )) || (
                                    <p className="text-gray-500 text-sm">No deliveries scheduled for today</p>
                                )}
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            ⏳ Pending Deliveries
                        </h3>
                        <div className="space-y-3">
                            {dashboardData?.deliveries?.pending?.slice(0, 5).map((delivery: any, index: number) => (
                                <div key={index} className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="font-medium text-gray-900 dark:text-white">
                                            {delivery.orderId?.orderNumber || `Delivery ${index + 1}`}
                                        </p>
                                        <p className="text-sm text-orange-600 font-medium">
                                            Due: {new Date(delivery.scheduledDate || Date.now()).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                        Address: {delivery.deliveryAddress || 'Address not provided'}
                                    </p>
                                    <div className="flex space-x-2">
                                        <button
                                            className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                                            onClick={() => window.location.href = `/driver/delivery/${delivery._id}`}
                                        >
                                            View Details
                                        </button>
                                        <button
                                            className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                                            onClick={() => updateDeliveryStatus(delivery._id, 'picked_up')}
                                        >
                                            Pick Up
                                        </button>
                                    </div>
                                </div>
                            )) || (
                                    <p className="text-gray-500 text-sm">No pending deliveries</p>
                                )}
                        </div>
                    </div>
                </div>

                {/* Completed Deliveries */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        ✅ Completed Deliveries (Today)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {dashboardData?.deliveries?.completed?.slice(0, 6).map((delivery: any, index: number) => (
                            <div key={index} className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="font-medium text-gray-900 dark:text-white">
                                        {delivery.orderId?.orderNumber || `Delivery ${index + 1}`}
                                    </p>
                                    <div className="text-green-500 text-lg">✅</div>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                    Customer: {delivery.customerId?.fullName || 'N/A'}
                                </p>
                                <p className="text-xs text-green-600 dark:text-green-300">
                                    Completed: {new Date(delivery.deliveredAt || Date.now()).toLocaleTimeString()}
                                </p>
                            </div>
                        )) || (
                                <div className="col-span-full">
                                    <p className="text-gray-500 text-sm text-center">No completed deliveries today</p>
                                </div>
                            )}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        ⚡ Quick Actions
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <button
                            className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors text-center"
                            onClick={() => window.location.href = '/driver/deliveries'}
                        >
                            <div className="text-2xl mb-2">📦</div>
                            <p className="text-sm font-medium">View All Deliveries</p>
                        </button>

                        <button
                            className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors text-center"
                            onClick={() => navigator.geolocation.getCurrentPosition(() => { })}
                        >
                            <div className="text-2xl mb-2">📍</div>
                            <p className="text-sm font-medium">Update Location</p>
                        </button>

                        <button
                            className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors text-center"
                            onClick={() => window.location.href = '/driver/earnings'}
                        >
                            <div className="text-2xl mb-2">💰</div>
                            <p className="text-sm font-medium">View Earnings</p>
                        </button>

                        <button
                            className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors text-center"
                            onClick={() => window.location.href = '/driver/support'}
                        >
                            <div className="text-2xl mb-2">🆘</div>
                            <p className="text-sm font-medium">Get Support</p>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DriverDashboard;
