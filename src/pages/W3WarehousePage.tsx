import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Package, Truck, CheckCircle, AlertCircle, XCircle, User, MapPin } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { API_CONFIG } from '../config/api';

interface SubOrderItem {
    materialId: string;
    materialName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    _id: string;
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

const W3WarehousePage: React.FC = () => {
    const { user } = useAuth();
    const [subOrders, setSubOrders] = useState<SubOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState({
        status: '',
        dateRange: 'all'
    });

    useEffect(() => {
        console.log('W3 Warehouse - Current user:', user);
        console.log('W3 Warehouse - Warehouse code:', user?.warehouseCode);

        if (user && user.warehouseCode === 'W3') {
            fetchW3SubOrders();
        } else if (user && user.warehouseCode !== 'W3') {
            setError('Access denied. This page is only for W3 (Steel & Metal) warehouse staff.');
        }
    }, [user, filter]);

    const fetchW3SubOrders = async () => {
        try {
            setLoading(true);
            setError(null);

            const params = new URLSearchParams();
            if (filter.status) params.append('status', filter.status);
            if (filter.dateRange !== 'all') params.append('dateRange', filter.dateRange);

            const url = `${API_CONFIG.BASE_URL}/api/orders/sub-orders/warehouse/W3?${params}`;
            console.log('Fetching W3 sub-orders from:', url);

            const token = localStorage.getItem('accessToken');
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();
            console.log('W3 Response data:', data);

            if (data.success) {
                setSubOrders(data.subOrders || []);
                console.log(`Found ${data.subOrders?.length || 0} sub-orders for W3 warehouse`);
            } else {
                setError(data.error || 'Failed to fetch W3 sub-orders');
            }
        } catch (err) {
            console.error('Error fetching W3 sub-orders:', err);
            setError('Failed to connect to server');
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
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500"></div>
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
                                <MapPin className="w-8 h-8 text-purple-600 mr-3" />
                                W3 - Steel & Metal Warehouse
                            </h1>
                            <p className="text-gray-600 dark:text-gray-300 mt-2">
                                Manage your steel, metal, and reinforcement deliveries and sub-orders
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-600 dark:text-gray-300">Warehouse Code: <span className="font-bold text-purple-600">W3</span></p>
                            <p className="text-sm text-gray-600 dark:text-gray-300">User: {user?.email}</p>
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
                                onChange={(e) => setFilter({...filter, status: e.target.value})}
                                className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            >
                                <option value="">All Statuses</option>
                                <option value="pending">Pending</option>
                                <option value="scheduled">Scheduled</option>
                                <option value="prepared">Prepared</option>
                                <option value="dispatched">Dispatched</option>
                                <option value="delivered">Delivered</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Date Range
                            </label>
                            <select
                                value={filter.dateRange}
                                onChange={(e) => setFilter({...filter, dateRange: e.target.value})}
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
                {!error && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                Steel & Metal Sub-Orders ({subOrders.length})
                            </h2>
                        </div>

                        {subOrders.length === 0 ? (
                            <div className="p-12 text-center">
                                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                    No Sub-Orders Found
                                </h3>
                                <p className="text-gray-600 dark:text-gray-300">
                                    There are currently no sub-orders for W3 warehouse.
                                </p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-200 dark:divide-gray-700">
                                {subOrders.map((subOrder) => (
                                    <div key={subOrder._id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                        <div className="flex items-center justify-between mb-4">
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                    {subOrder.subOrderNumber}
                                                </h3>
                                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                                    Main Order: {subOrder.mainOrderId?.orderNumber}
                                                </p>
                                            </div>
                                            <div className="flex items-center space-x-3">
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(subOrder.status)}`}>
                                                    {getStatusIcon(subOrder.status)}
                                                    <span className="ml-1">{subOrder.status}</span>
                                                </span>
                                            </div>
                                        </div>

                                        {/* Customer Info */}
                                        <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                            <div className="flex items-center mb-2">
                                                <User className="w-4 h-4 text-gray-600 mr-2" />
                                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                    Customer Information
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-700 dark:text-gray-300">
                                                Name: {subOrder.mainOrderId?.customerId?.fullName}
                                            </p>
                                            <p className="text-sm text-gray-700 dark:text-gray-300">
                                                Email: {subOrder.mainOrderId?.customerId?.email}
                                            </p>
                                        </div>

                                        {/* Items */}
                                        <div className="mb-4">
                                            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                                                Steel & Metal Items:
                                            </h4>
                                            <div className="space-y-2">
                                                {subOrder.items.map((item) => (
                                                    <div key={item._id} className="flex justify-between items-center p-2 bg-purple-50 dark:bg-purple-900 rounded">
                                                        <span className="text-sm text-gray-900 dark:text-white">
                                                            {item.materialName}
                                                        </span>
                                                        <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
                                                            Qty: {item.quantity}
                                                        </span>
                                                    </div>
                                                ))}
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
                )}
            </div>
        </div>
    );
};

export default W3WarehousePage;