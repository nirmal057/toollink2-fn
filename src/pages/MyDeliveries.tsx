import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Package, Truck, CheckCircle, AlertCircle, XCircle, User, Eye } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { API_CONFIG } from '../config/api';

interface SubOrderItem {
    materialId: string;
    materialName: string;
    qty: number;
    unitPrice: number;
    totalPrice: number;
}

interface SubOrder {
    _id: string;
    subOrderNumber: string;
    mainOrderId: {
        _id: string;
        orderNumber: string;
        customerId: {
            fullName: string;
            email: string;
            username: string;
        };
        requestedDeliveryDate: string;
    };
    warehouseCode: string;
    materialCategory: string;
    items: SubOrderItem[];
    totalAmount: number;
    scheduledAt: string;
    scheduledTime: string;
    status: string;
    createdAt: string;
}

const MyDeliveries: React.FC = () => {
    const { user } = useAuth();
    const [subOrders, setSubOrders] = useState<SubOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedSubOrder, setSelectedSubOrder] = useState<SubOrder | null>(null);
    const [filter, setFilter] = useState({
        status: '',
        dateRange: 'all'
    });

    // Warehouse category mapping
    const warehouseCategoryMap: { [key: string]: string } = {
        'WM': 'Tools & Equipment',
        'W1': 'Sand & Aggregates',
        'W2': 'Blocks & Masonry',
        'W3': 'Steel & Metal'
    };

    useEffect(() => {
        console.log('MyDeliveries - Current user:', user);
        console.log('MyDeliveries - Warehouse code:', user?.warehouseCode);

        if (user && user.warehouseCode) {
            fetchMySubOrders();
        } else if (user && !user.warehouseCode) {
            setError('No warehouse code assigned to your account. Please contact administrator.');
        }
    }, [user, filter]);

    const fetchMySubOrders = async () => {
        try {
            setLoading(true);
            setError(null);

            if (!user?.warehouseCode) {
                setError('Warehouse code not found. Please contact administrator.');
                return;
            }

            const params = new URLSearchParams();
            if (filter.status) params.append('status', filter.status);
            if (filter.dateRange !== 'all') params.append('dateRange', filter.dateRange);

            const url = `${API_CONFIG.BASE_URL}/api/orders/sub-orders/warehouse/${user.warehouseCode}?${params}`;
            console.log('Fetching sub-orders from:', url);

            const token = localStorage.getItem('accessToken');
            console.log('Using token:', token?.substring(0, 20) + '...');

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('Response status:', response.status);
            const data = await response.json();
            console.log('Response data:', data);

            if (data.success) {
                setSubOrders(data.subOrders || []);
                console.log(`Found ${data.subOrders?.length || 0} sub-orders for warehouse ${user.warehouseCode}`);
            } else {
                setError(data.error || 'Failed to fetch sub-orders');
            }
        } catch (err) {
            console.error('Error fetching sub-orders:', err);
            setError('Failed to connect to server');
        } finally {
            setLoading(false);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status.toLowerCase()) {
            case 'created': return <Clock className="w-5 h-5 text-blue-500" />;
            case 'scheduled': return <Calendar className="w-5 h-5 text-purple-500" />;
            case 'prepared': return <Package className="w-5 h-5 text-orange-500" />;
            case 'dispatched': return <Truck className="w-5 h-5 text-indigo-500" />;
            case 'delivered': return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'failed': return <XCircle className="w-5 h-5 text-red-500" />;
            case 'rescheduled': return <AlertCircle className="w-5 h-5 text-yellow-500" />;
            default: return <Package className="w-5 h-5 text-gray-500" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'created': return 'bg-blue-100 text-blue-800';
            case 'scheduled': return 'bg-purple-100 text-purple-800';
            case 'prepared': return 'bg-orange-100 text-orange-800';
            case 'dispatched': return 'bg-indigo-100 text-indigo-800';
            case 'delivered': return 'bg-green-100 text-green-800';
            case 'failed': return 'bg-red-100 text-red-800';
            case 'rescheduled': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
                </div>
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
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                🚚 My Deliveries - {user?.warehouseCode} Warehouse
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400">
                                {user?.warehouseCode && warehouseCategoryMap[user.warehouseCode]} Sub-Orders
                            </p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-500">
                                Total: {subOrders.length} sub-orders
                            </span>
                            <button
                                onClick={fetchMySubOrders}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                🔄 Refresh
                            </button>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Status Filter
                            </label>
                            <select
                                value={filter.status}
                                onChange={(e) => setFilter(prev => ({ ...prev, status: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                            >
                                <option value="">All Statuses</option>
                                <option value="created">Created</option>
                                <option value="scheduled">Scheduled</option>
                                <option value="prepared">Prepared</option>
                                <option value="dispatched">Dispatched</option>
                                <option value="delivered">Delivered</option>
                                <option value="failed">Failed</option>
                                <option value="rescheduled">Rescheduled</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Date Range
                            </label>
                            <select
                                value={filter.dateRange}
                                onChange={(e) => setFilter(prev => ({ ...prev, dateRange: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                            >
                                <option value="all">All Time</option>
                                <option value="today">Today</option>
                                <option value="week">This Week</option>
                                <option value="month">This Month</option>
                            </select>
                        </div>

                        <div className="flex items-end">
                            <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
                                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Warehouse: {user?.warehouseCode}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                    {user?.warehouseCode && warehouseCategoryMap[user.warehouseCode]}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                        {error}
                    </div>
                )}

                {/* Sub-Orders List */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                            Sub-Orders ({subOrders.length})
                        </h2>
                    </div>

                    {subOrders.length === 0 ? (
                        <div className="p-8 text-center">
                            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500 dark:text-gray-400">
                                No sub-orders found for your warehouse.
                            </p>
                            {user?.warehouseCode && (
                                <p className="text-sm text-gray-400 mt-2">
                                    Warehouse: {user.warehouseCode} ({warehouseCategoryMap[user.warehouseCode]})
                                </p>
                            )}
                            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                <p className="text-sm text-blue-600 dark:text-blue-400">
                                    💡 <strong>To see sub-orders here:</strong>
                                </p>
                                <ul className="text-xs text-blue-500 dark:text-blue-300 mt-2 list-disc list-inside">
                                    <li>Main orders need to be created with materials matching your warehouse category</li>
                                    <li>System automatically splits orders into warehouse-specific sub-orders</li>
                                    <li>Your warehouse ({user?.warehouseCode}) handles: {user?.warehouseCode && warehouseCategoryMap[user.warehouseCode]}</li>
                                </ul>
                            </div>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-200 dark:divide-gray-700">
                            {subOrders.map((subOrder) => (
                                <div key={subOrder._id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center space-x-3">
                                            {getStatusIcon(subOrder.status)}
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                    {subOrder.subOrderNumber}
                                                </h3>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    Main Order: {subOrder.mainOrderId.orderNumber}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(subOrder.status)}`}>
                                                {subOrder.status.charAt(0).toUpperCase() + subOrder.status.slice(1)}
                                            </span>
                                            <button
                                                onClick={() => setSelectedSubOrder(subOrder)}
                                                className="p-2 text-blue-600 hover:bg-blue-100 rounded-full transition-colors"
                                            >
                                                <Eye className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                        <div>
                                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                                <User className="w-4 h-4 mr-2" />
                                                Customer: {subOrder.mainOrderId.customerId.fullName}
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1">
                                                {subOrder.mainOrderId.customerId.email}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                                <Calendar className="w-4 h-4 mr-2" />
                                                Scheduled: {formatDate(subOrder.scheduledAt)}
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1">
                                                Time: {subOrder.scheduledTime}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                                <Package className="w-4 h-4 mr-2" />
                                                Items: {subOrder.items.length}
                                            </div>
                                            <div className="text-xs font-semibold text-green-600 mt-1">
                                                Total: Rs. {subOrder.totalAmount.toFixed(2)}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                                        <p className="text-sm text-gray-700 dark:text-gray-300">
                                            <span className="font-medium">Category:</span> {subOrder.materialCategory}
                                        </p>
                                        <div className="mt-2">
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Items: </span>
                                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                                {subOrder.items.slice(0, 2).map(item => item.materialName).join(', ')}
                                                {subOrder.items.length > 2 && ` +${subOrder.items.length - 2} more`}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Sub-Order Details Modal */}
                {selectedSubOrder && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                        Sub-Order Details
                                    </h2>
                                    <button
                                        onClick={() => setSelectedSubOrder(null)}
                                        className="text-gray-500 hover:text-gray-700 text-2xl"
                                    >
                                        ×
                                    </button>
                                </div>
                            </div>

                            <div className="p-6 space-y-6">
                                {/* Sub-Order Info */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                                            Sub-Order Information
                                        </h3>
                                        <div className="space-y-2 text-sm">
                                            <p><span className="font-medium">Sub-Order Number:</span> {selectedSubOrder.subOrderNumber}</p>
                                            <p><span className="font-medium">Main Order:</span> {selectedSubOrder.mainOrderId.orderNumber}</p>
                                            <p><span className="font-medium">Warehouse:</span> {selectedSubOrder.warehouseCode}</p>
                                            <p><span className="font-medium">Category:</span> {selectedSubOrder.materialCategory}</p>
                                            <p><span className="font-medium">Status:</span>
                                                <span className={`ml-2 px-2 py-1 rounded text-xs ${getStatusColor(selectedSubOrder.status)}`}>
                                                    {selectedSubOrder.status.charAt(0).toUpperCase() + selectedSubOrder.status.slice(1)}
                                                </span>
                                            </p>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                                            Customer Information
                                        </h3>
                                        <div className="space-y-2 text-sm">
                                            <p><span className="font-medium">Name:</span> {selectedSubOrder.mainOrderId.customerId.fullName}</p>
                                            <p><span className="font-medium">Email:</span> {selectedSubOrder.mainOrderId.customerId.email}</p>
                                            <p><span className="font-medium">Username:</span> {selectedSubOrder.mainOrderId.customerId.username}</p>
                                            <p><span className="font-medium">Scheduled Date:</span> {formatDate(selectedSubOrder.scheduledAt)}</p>
                                            <p><span className="font-medium">Scheduled Time:</span> {selectedSubOrder.scheduledTime}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Items List */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                                        Items ({selectedSubOrder.items.length})
                                    </h3>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full bg-white dark:bg-gray-800">
                                            <thead>
                                                <tr className="bg-gray-50 dark:bg-gray-700">
                                                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Material</th>
                                                    <th className="px-4 py-2 text-center text-sm font-medium text-gray-700 dark:text-gray-300">Quantity</th>
                                                    <th className="px-4 py-2 text-right text-sm font-medium text-gray-700 dark:text-gray-300">Unit Price</th>
                                                    <th className="px-4 py-2 text-right text-sm font-medium text-gray-700 dark:text-gray-300">Total</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                                {selectedSubOrder.items.map((item, index) => (
                                                    <tr key={index}>
                                                        <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">{item.materialName}</td>
                                                        <td className="px-4 py-2 text-sm text-center text-gray-700 dark:text-gray-300">{item.qty}</td>
                                                        <td className="px-4 py-2 text-sm text-right text-gray-700 dark:text-gray-300">Rs. {item.unitPrice.toFixed(2)}</td>
                                                        <td className="px-4 py-2 text-sm text-right font-medium text-gray-900 dark:text-white">Rs. {item.totalPrice.toFixed(2)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                            <tfoot>
                                                <tr className="bg-gray-50 dark:bg-gray-700">
                                                    <td colSpan={3} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 text-right">
                                                        Sub-Order Total:
                                                    </td>
                                                    <td className="px-4 py-2 text-sm font-bold text-green-600 text-right">
                                                        Rs. {selectedSubOrder.totalAmount.toFixed(2)}
                                                    </td>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyDeliveries;
