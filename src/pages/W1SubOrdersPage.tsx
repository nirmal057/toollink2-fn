import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Package, Truck, CheckCircle, AlertCircle, XCircle, User } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { API_CONFIG } from '../config/api';

// W1 Warehouse Category Mapping
const W1_CATEGORIES = {
    'W1-001': 'Sand & Aggregate',
    'W1-002': 'Fine Sand',
    'W1-005': 'River Sand',
    'W1-008': 'Aggregate',
    'W1-010': 'Stone Chips'
};

// Helper function to get category ID from material name
const getCategoryId = (materialName: string): string => {
    const name = materialName.toLowerCase();

    if (name.includes('fine') || name.includes('fine sand')) return 'W1-002';
    if (name.includes('river') || name.includes('river sand')) return 'W1-005';
    if (name.includes('aggregate')) return 'W1-008';
    if (name.includes('stone') || name.includes('chip')) return 'W1-010';

    return 'W1-001'; // Default to general category
};

// Helper function to get category name from ID
const getCategoryName = (categoryId: string): string => {
    return W1_CATEGORIES[categoryId as keyof typeof W1_CATEGORIES] || 'Sand & Aggregate';
};

interface SubOrderItem {
    materialId: string;
    materialName: string;
    categoryId?: string; // Warehouse category ID (e.g., W1-002, W1-005)
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    _id: string;
}

interface SubOrder {
    _id: string;
    subOrderNumber: string;
    warehouseId?: string; // Warehouse database ID
    mainOrderId: {
        _id: string;
        orderNumber: string;
        customerId: {
            fullName: string;
            email: string;
            username: string;
            phone?: string;
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
    // Existing customer information fields in database
    customerInfo?: {
        customerId?: string;
        customerName?: string;
        customerEmail?: string;
        customerPhone?: string;
    };
    deliveryAddress?: {
        street?: string;
        city?: string;
        state?: string;
        zipCode?: string;
        country?: string;
        phone?: string;
        fullAddress?: string;
    };
    mainOrderDetails?: {
        orderNumber?: string;
        notes?: string;
    };
}

const W1SubOrdersPage: React.FC = () => {
    const { user } = useAuth();
    const [subOrders, setSubOrders] = useState<SubOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState({
        status: '',
        dateRange: 'all'
    });

    useEffect(() => {
        console.log('W1 Sub-Orders - Current user:', user);
        console.log('W1 Sub-Orders - Warehouse code:', user?.warehouseCode);

        if (user) {
            fetchW1SubOrders();
        }
    }, [user, filter]);

    // Auto-refresh every 30 seconds
    useEffect(() => {
        let intervalId: NodeJS.Timeout;

        if (user && !loading && !error) {
            intervalId = setInterval(() => {
                console.log('Auto-refreshing W1 sub-orders...');
                fetchW1SubOrders();
            }, 30000);
        }

        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, [user, loading, error]);

    const fetchW1SubOrders = async () => {
        try {
            setLoading(true);
            setError(null);

            const params = new URLSearchParams();
            if (filter.status) params.append('status', filter.status);
            if (filter.dateRange !== 'all') params.append('dateRange', filter.dateRange);

            const url = `${API_CONFIG.BASE_URL}/api/orders/sub-orders/my-warehouse?${params}`;
            console.log('Fetching W1 warehouse SubOrders from SubOrders collection:', url);

            const token = localStorage.getItem('accessToken');
            if (!token) {
                setError('No authentication token found. Please login again.');
                return;
            }

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();
            console.log('W1 Warehouse SubOrders Response data:', data);

            if (data.success) {
                if (data.warehouseCode === 'W1' || user?.warehouseCode === 'W1' || user?.email?.includes('house1')) {
                    setSubOrders(data.subOrders || []);
                    console.log(`Found ${data.subOrders?.length || 0} warehouse items for W1 warehouse`);
                } else if (data.warehouseCode && data.warehouseCode !== 'W1') {
                    setError(`Access denied. This page is for W1 (Sand & Aggregates) warehouse sub-orders, but you are assigned to ${data.warehouseCode} warehouse.`);
                } else {
                    setSubOrders(data.subOrders || []);
                }
            } else {
                setError(data.error || 'Failed to fetch W1 warehouse items');
            }
        } catch (err) {
            console.error('Error fetching W1 warehouse items:', err);
            setError('Failed to connect to server. Please check your internet connection.');
        } finally {
            setLoading(false);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending': return <Clock className="w-5 h-5 text-blue-500" />;
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
            case 'pending': return 'bg-blue-100 text-blue-800';
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
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
                                <Package className="w-8 h-8 text-blue-600 mr-3" />
                                W1 - Sand & Aggregates Sub-Orders
                            </h1>
                            <p className="text-gray-600 dark:text-gray-300 mt-2">
                                Manage all sub-orders for sand, aggregates, and construction materials
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-600 dark:text-gray-300">Warehouse: <span className="font-bold text-blue-600">W1</span></p>
                            <p className="text-sm text-gray-600 dark:text-gray-300">User: {user?.email}</p>
                            <button
                                onClick={fetchW1SubOrders}
                                disabled={loading}
                                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
                            >
                                {loading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        Refreshing...
                                    </>
                                ) : (
                                    <>
                                        🔄 Refresh
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6">
                    <div className="flex flex-wrap gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Status Filter
                            </label>
                            <select
                                value={filter.status}
                                onChange={(e) => setFilter({ ...filter, status: e.target.value })}
                                className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            >
                                <option value="">All Statuses</option>
                                <option value="pending">Pending</option>
                                <option value="scheduled">Scheduled</option>
                                <option value="prepared">Prepared</option>
                                <option value="dispatched">Dispatched</option>
                                <option value="delivered">Delivered</option>
                                <option value="failed">Failed</option>
                                <option value="rescheduled">Rescheduled</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Date Range
                            </label>
                            <select
                                value={filter.dateRange}
                                onChange={(e) => setFilter({ ...filter, dateRange: e.target.value })}
                                className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            >
                                <option value="all">All Time</option>
                                <option value="today">Today</option>
                                <option value="week">This Week</option>
                                <option value="month">This Month</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Error Display */}
                {error && (
                    <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg p-4 mb-6">
                        <div className="flex items-center">
                            <XCircle className="w-5 h-5 text-red-500 mr-2" />
                            <p className="text-red-800 dark:text-red-200">{error}</p>
                        </div>
                    </div>
                )}

                {/* Sub-Orders List */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                            <Package className="w-6 h-6 text-blue-600 mr-2" />
                            Sand & Aggregates Sub-Orders ({subOrders.length})
                        </h2>
                        <p className="text-gray-600 dark:text-gray-300 mt-1">
                            All sub-orders assigned to W1 warehouse for sand, gravel, and aggregate materials
                        </p>
                    </div>

                    {subOrders.length === 0 ? (
                        <div className="p-12 text-center">
                            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                No Sub-Orders Found
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300">
                                There are currently no sub-orders for W1 warehouse.
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-200 dark:divide-gray-700">
                            {subOrders.map((subOrder) => (
                                <div key={subOrder._id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                    {/* Sub-Order Header */}
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                {subOrder.subOrderNumber}
                                            </h3>
                                            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
                                                <span>Main Order: {subOrder.mainOrderId?.orderNumber}</span>
                                                <span className="bg-blue-100 dark:bg-blue-800 px-2 py-1 rounded text-xs font-mono">
                                                    Warehouse: W1
                                                </span>
                                                {subOrder._id && (
                                                    <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs font-mono">
                                                        ID: {subOrder._id.slice(-6)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center mt-2 sm:mt-0">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center ${getStatusColor(subOrder.status)}`}>
                                                {getStatusIcon(subOrder.status)}
                                                <span className="ml-1">{subOrder.status}</span>
                                            </span>
                                        </div>
                                    </div>

                                    {/* Customer Info */}
                                    <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900 rounded-lg">
                                        <div className="flex items-center mb-2">
                                            <User className="w-4 h-4 text-gray-600 mr-2" />
                                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                Customer Information
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-700 dark:text-gray-300">
                                            Name: {subOrder.customerInfo?.customerName ||
                                                subOrder.mainOrderId?.customerId?.fullName ||
                                                'Not available'}
                                        </p>
                                        <p className="text-sm text-gray-700 dark:text-gray-300">
                                            Email: {subOrder.customerInfo?.customerEmail ||
                                                subOrder.mainOrderId?.customerId?.email ||
                                                'Not available'}
                                        </p>
                                        {(subOrder.customerInfo?.customerPhone || subOrder.mainOrderId?.customerId?.phone) && (
                                            <p className="text-sm text-gray-700 dark:text-gray-300">
                                                Phone: {subOrder.customerInfo?.customerPhone ||
                                                    subOrder.mainOrderId?.customerId?.phone}
                                            </p>
                                        )}
                                    </div>

                                    {/* Items */}
                                    <div className="mb-4">
                                        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                                            Sand & Aggregates Items:
                                        </h4>
                                        <div className="space-y-2">
                                            {subOrder.items.map((item) => {
                                                const categoryId = item.categoryId || getCategoryId(item.materialName);
                                                const categoryName = getCategoryName(categoryId);

                                                return (
                                                    <div key={item._id} className="p-3 bg-blue-50 dark:bg-blue-900 rounded-lg border-l-4 border-blue-500">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <Package className="w-4 h-4 text-blue-600" />
                                                                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                                        {item.materialName}
                                                                    </span>
                                                                </div>
                                                                <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                                                                    <span className="bg-blue-100 dark:bg-blue-800 px-2 py-1 rounded font-mono">
                                                                        {categoryId}
                                                                    </span>
                                                                    <span>•</span>
                                                                    <span>{categoryName}</span>
                                                                </div>
                                                            </div>
                                                            <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                                                                Qty: {item.quantity}
                                                            </span>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Dates */}
                                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
                                        <span>Created: {formatDate(subOrder.createdAt)}</span>
                                        {subOrder.mainOrderId?.requestedDeliveryDate && (
                                            <span>Delivery: {formatDate(subOrder.mainOrderId.requestedDeliveryDate)}</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default W1SubOrdersPage;
