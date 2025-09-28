interface DashboardStats {
    totalUsers: number;
    totalOrders: number;
    totalInventory: number;
    totalWarehouses: number;
    totalDrivers: number;
    monthlyRevenue: number;
}

interface RecentActivity {
    orders: Array<{
        _id: string;
        orderNumber: string;
        customer: { fullName: string; email: string };
        totalAmount: number;
        status: string;
        createdAt: string;
    }>;
    alerts: Array<{
        _id: string;
        title: string;
        message: string;
        type: string;
        createdAt: string;
    }>;
}

interface AdminDashboardData {
    summary: DashboardStats;
    recentActivity: RecentActivity;
}

export const AdminDashboard: React.FC = () => {
    const [dashboardData, setDashboardData] = useState<AdminDashboardData | null>(null);
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

    const handleUserManagement = async (action: string, userData?: any) => {
        try {
            const response = await fetch(`/api/roles/admin/users/${action}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(userData)
            });
            const data = await response.json();
            fetchDashboardData();
            return data;
        } catch (err: any) {
            throw new Error(err.message || `Failed to ${action} user`);
        }
    };

    const generateReport = async (reportType: string, filters?: any) => {
        try {
            const response = await fetch(`/api/roles/admin/reports/${reportType}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ filters })
            });
            return await response.json();
        } catch (err: any) {
            throw new Error(err.message || 'Failed to generate report');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error || !dashboardData) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-red-500">{error || 'No data available'}</div>
            </div>
        );
    }

    const { summary, recentActivity } = dashboardData;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
                            <p className="text-gray-600 dark:text-gray-400">System management and overview</p>
                        </div>
                        <div className="flex space-x-2">
                            <button
                                onClick={() => generateReport('sales')}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                📊 Generate Report
                            </button>
                            <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                                ⚙️ Settings
                            </button>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Users</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{summary.totalUsers}</p>
                            </div>
                            <div className="text-blue-500 text-2xl">👥</div>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">Active users in system</p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Orders</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{summary.totalOrders}</p>
                            </div>
                            <div className="text-green-500 text-2xl">🛒</div>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">All time orders</p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Inventory Items</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{summary.totalInventory}</p>
                            </div>
                            <div className="text-purple-500 text-2xl">📦</div>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">Items in inventory</p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Monthly Revenue</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    Rs. {summary.monthlyRevenue?.toLocaleString()}
                                </p>
                            </div>
                            <div className="text-green-500 text-2xl">💰</div>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">This month's revenue</p>
                    </div>
                </div>

                {/* Secondary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Warehouses</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{summary.totalWarehouses}</p>
                            </div>
                            <div className="text-orange-500 text-2xl">🏢</div>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">Active warehouses</p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Drivers</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{summary.totalDrivers}</p>
                            </div>
                            <div className="text-blue-500 text-2xl">🚚</div>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">Active drivers</p>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Recent Orders */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Orders</h3>
                        <div className="space-y-4">
                            {recentActivity.orders?.slice(0, 5).map((order) => (
                                <div key={order._id} className="flex items-center justify-between border-b pb-2">
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white">{order.orderNumber}</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">{order.customer?.fullName}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium text-gray-900 dark:text-white">Rs. {order.totalAmount}</p>
                                        <span
                                            className={`px-2 py-1 text-xs rounded-full ${order.status === 'delivered'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-yellow-100 text-yellow-800'
                                                }`}
                                        >
                                            {order.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* System Alerts */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                            ⚠️ System Alerts
                        </h3>
                        <div className="space-y-4">
                            {recentActivity.alerts?.slice(0, 5).map((alert) => (
                                <div key={alert._id} className="flex items-start space-x-3 border-b pb-2">
                                    <div className="text-red-500 text-sm mt-1">⚠️</div>
                                    <div>
                                        <p className="font-medium text-sm text-gray-900 dark:text-white">{alert.title}</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">{alert.message}</p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {new Date(alert.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            {(!recentActivity.alerts || recentActivity.alerts.length === 0) && (
                                <p className="text-gray-500 text-sm">No active alerts</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                        className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                        onClick={() => handleUserManagement('list')}
                    >
                        👥 Manage Users
                    </button>
                    <button
                        className="w-full py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
                        onClick={() => generateReport('inventory')}
                    >
                        📊 Inventory Report
                    </button>
                    <button
                        className="w-full py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
                        onClick={() => generateReport('delivery')}
                    >
                        🚚 Delivery Report
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
