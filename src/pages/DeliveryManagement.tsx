import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Package, Truck, CheckCircle, AlertCircle, XCircle, MapPin, Phone, User } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface DeliveryItem {
    inventoryId: string;
    itemName: string;
    category: string;
    quantity: number;
    warehouse: string;
}

interface Delivery {
    id: string;
    trackingNumber: string;
    warehouseName: string;
    items: DeliveryItem[];
    deliveryDate: string;
    timeSlot: string;
    status: string;
    deliveryAddress: {
        street: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
        additionalInfo?: string;
    };
    customerEmail: string;
    contactNumber: string;
    specialInstructions?: string;
    statusHistory: Array<{
        status: string;
        timestamp: string;
        notes: string;
    }>;
    orderNumber?: string;
    createdAt: string;
}

const DeliveryManagement: React.FC<{ userRole: string }> = ({ userRole }) => {
    const { user } = useAuth();
    const [deliveries, setDeliveries] = useState<Delivery[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState({
        status: '',
        date: '',
        warehouseId: '',
        searchTerm: ''
    });
    const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalDeliveries: 0
    });

    const isCustomer = userRole === 'customer';
    const canManageDeliveries = ['admin', 'warehouse', 'cashier'].includes(userRole);

    useEffect(() => {
        fetchDeliveries();
    }, [filter, pagination.currentPage]);

    const fetchDeliveries = async () => {
        try {
            setLoading(true);
            let url = '/api/delivery';
            const params = new URLSearchParams();

            if (isCustomer) {
                // Customer can only see their own deliveries
                url = '/api/delivery/customer';
                params.append('email', user?.email || '');
            } else {
                // Admin, warehouse, cashier can see all deliveries
                if (filter.status) params.append('status', filter.status);
                if (filter.date) params.append('date', filter.date);
                if (filter.warehouseId) params.append('warehouseId', filter.warehouseId);
                params.append('page', pagination.currentPage.toString());
            }

            const response = await fetch(`${url}?${params}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (data.success) {
                setDeliveries(data.deliveries);
                if (data.pagination) {
                    setPagination(data.pagination);
                }
            }
        } catch (error) {
            console.error('Error fetching deliveries:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateDeliveryStatus = async (deliveryId: string, status: string, notes: string = '') => {
        try {
            const response = await fetch(`/api/delivery/${deliveryId}/status`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status, notes })
            });

            const data = await response.json();

            if (data.success) {
                fetchDeliveries(); // Refresh the list
                if (selectedDelivery && selectedDelivery.id === deliveryId) {
                    setSelectedDelivery({ ...selectedDelivery, status });
                }
            }
        } catch (error) {
            console.error('Error updating delivery status:', error);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'scheduled':
                return <Clock className="w-5 h-5 text-blue-500" />;
            case 'in_transit':
                return <Truck className="w-5 h-5 text-orange-500" />;
            case 'delivered':
                return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'failed':
                return <XCircle className="w-5 h-5 text-red-500" />;
            case 'cancelled':
                return <AlertCircle className="w-5 h-5 text-gray-500" />;
            default:
                return <Package className="w-5 h-5 text-gray-400" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'scheduled':
                return 'bg-blue-100 text-blue-800';
            case 'in_transit':
                return 'bg-orange-100 text-orange-800';
            case 'delivered':
                return 'bg-green-100 text-green-800';
            case 'failed':
                return 'bg-red-100 text-red-800';
            case 'cancelled':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-600';
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatTimeSlot = (slot: string) => {
        switch (slot) {
            case 'morning':
                return '9:00 AM - 12:00 PM';
            case 'afternoon':
                return '1:00 PM - 5:00 PM';
            case 'evening':
                return '6:00 PM - 8:00 PM';
            default:
                return slot;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {isCustomer ? 'My Deliveries' : 'Delivery Management'}
                </h1>
                <p className="text-gray-600 dark:text-gray-300">
                    {isCustomer
                        ? 'Track your order deliveries and get real-time updates'
                        : 'Manage and track all delivery schedules across warehouses'
                    }
                </p>
            </div>

            {/* Filters */}
            {!isCustomer && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Status
                            </label>
                            <select
                                value={filter.status}
                                onChange={(e) => setFilter({ ...filter, status: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                            >
                                <option value="">All Statuses</option>
                                <option value="scheduled">Scheduled</option>
                                <option value="in_transit">In Transit</option>
                                <option value="delivered">Delivered</option>
                                <option value="failed">Failed</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Date
                            </label>
                            <input
                                type="date"
                                value={filter.date}
                                onChange={(e) => setFilter({ ...filter, date: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Warehouse
                            </label>
                            <select
                                value={filter.warehouseId}
                                onChange={(e) => setFilter({ ...filter, warehouseId: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                            >
                                <option value="">All Warehouses</option>
                                <option value="river_sand_warehouse">River Sand Warehouse</option>
                                <option value="metal_warehouse">Metal Products Warehouse</option>
                                <option value="wood_warehouse">Wood & Timber Warehouse</option>
                                <option value="concrete_warehouse">Concrete Products Warehouse</option>
                            </select>
                        </div>

                        <div className="flex items-end">
                            <button
                                onClick={() => setFilter({ status: '', date: '', warehouseId: '', searchTerm: '' })}
                                className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
                            >
                                Clear Filters
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delivery List */}
            <div className="space-y-4">
                {deliveries.length === 0 ? (
                    <div className="text-center py-12">
                        <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                            No deliveries found
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400">
                            {isCustomer
                                ? "You don't have any scheduled deliveries yet."
                                : "No deliveries match your current filters."
                            }
                        </p>
                    </div>
                ) : (
                    deliveries.map((delivery) => (
                        <div
                            key={delivery.id}
                            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center space-x-3">
                                    {getStatusIcon(delivery.status)}
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                            {delivery.trackingNumber}
                                        </h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {delivery.warehouseName}
                                        </p>
                                    </div>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(delivery.status)}`}>
                                    {delivery.status.replace('_', ' ').toUpperCase()}
                                </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                <div className="flex items-center space-x-2">
                                    <Calendar className="w-4 h-4 text-gray-400" />
                                    <span className="text-sm text-gray-600 dark:text-gray-300">
                                        {formatDate(delivery.deliveryDate)}
                                    </span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Clock className="w-4 h-4 text-gray-400" />
                                    <span className="text-sm text-gray-600 dark:text-gray-300">
                                        {formatTimeSlot(delivery.timeSlot)}
                                    </span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Package className="w-4 h-4 text-gray-400" />
                                    <span className="text-sm text-gray-600 dark:text-gray-300">
                                        {delivery.items.length} item(s)
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center space-x-2 mb-4">
                                <MapPin className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-600 dark:text-gray-300">
                                    {delivery.deliveryAddress.street}, {delivery.deliveryAddress.city}
                                </span>
                            </div>

                            {!isCustomer && (
                                <div className="flex items-center space-x-2 mb-4">
                                    <User className="w-4 h-4 text-gray-400" />
                                    <span className="text-sm text-gray-600 dark:text-gray-300">
                                        {delivery.customerEmail}
                                    </span>
                                    <Phone className="w-4 h-4 text-gray-400 ml-4" />
                                    <span className="text-sm text-gray-600 dark:text-gray-300">
                                        {delivery.contactNumber}
                                    </span>
                                </div>
                            )}

                            <div className="flex justify-between items-center">
                                <button
                                    onClick={() => setSelectedDelivery(delivery)}
                                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
                                >
                                    View Details
                                </button>

                                {canManageDeliveries && delivery.status === 'scheduled' && (
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => updateDeliveryStatus(delivery.id, 'in_transit')}
                                            className="px-3 py-1 bg-orange-100 text-orange-800 rounded-md text-sm font-medium hover:bg-orange-200 transition-colors"
                                        >
                                            Start Delivery
                                        </button>
                                        <button
                                            onClick={() => updateDeliveryStatus(delivery.id, 'cancelled')}
                                            className="px-3 py-1 bg-red-100 text-red-800 rounded-md text-sm font-medium hover:bg-red-200 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                )}

                                {canManageDeliveries && delivery.status === 'in_transit' && (
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => updateDeliveryStatus(delivery.id, 'delivered')}
                                            className="px-3 py-1 bg-green-100 text-green-800 rounded-md text-sm font-medium hover:bg-green-200 transition-colors"
                                        >
                                            Mark Delivered
                                        </button>
                                        <button
                                            onClick={() => updateDeliveryStatus(delivery.id, 'failed')}
                                            className="px-3 py-1 bg-red-100 text-red-800 rounded-md text-sm font-medium hover:bg-red-200 transition-colors"
                                        >
                                            Mark Failed
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Pagination */}
            {!isCustomer && pagination.totalPages > 1 && (
                <div className="flex justify-center items-center space-x-4 mt-8">
                    <button
                        disabled={pagination.currentPage === 1}
                        onClick={() => setPagination({ ...pagination, currentPage: pagination.currentPage - 1 })}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Previous
                    </button>
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                        Page {pagination.currentPage} of {pagination.totalPages}
                    </span>
                    <button
                        disabled={pagination.currentPage === pagination.totalPages}
                        onClick={() => setPagination({ ...pagination, currentPage: pagination.currentPage + 1 })}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Next
                    </button>
                </div>
            )}

            {/* Delivery Details Modal */}
            {selectedDelivery && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-6">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                    Delivery Details
                                </h2>
                                <button
                                    onClick={() => setSelectedDelivery(null)}
                                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                >
                                    <XCircle className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="space-y-6">
                                {/* Basic Info */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                                        Tracking Information
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Tracking Number</p>
                                            <p className="font-medium text-gray-900 dark:text-white">{selectedDelivery.trackingNumber}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Warehouse</p>
                                            <p className="font-medium text-gray-900 dark:text-white">{selectedDelivery.warehouseName}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Delivery Date</p>
                                            <p className="font-medium text-gray-900 dark:text-white">{formatDate(selectedDelivery.deliveryDate)}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Time Slot</p>
                                            <p className="font-medium text-gray-900 dark:text-white">{formatTimeSlot(selectedDelivery.timeSlot)}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Items */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                                        Items ({selectedDelivery.items.length})
                                    </h3>
                                    <div className="space-y-2">
                                        {selectedDelivery.items.map((item, index) => (
                                            <div key={index} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
                                                <div>
                                                    <p className="font-medium text-gray-900 dark:text-white">{item.itemName}</p>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">{item.category}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-medium text-gray-900 dark:text-white">Qty: {item.quantity}</p>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">{item.warehouse}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Address */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                                        Delivery Address
                                    </h3>
                                    <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded">
                                        <p className="text-gray-900 dark:text-white">
                                            {selectedDelivery.deliveryAddress.street}
                                        </p>
                                        <p className="text-gray-900 dark:text-white">
                                            {selectedDelivery.deliveryAddress.city}, {selectedDelivery.deliveryAddress.state} {selectedDelivery.deliveryAddress.zipCode}
                                        </p>
                                        <p className="text-gray-900 dark:text-white">
                                            {selectedDelivery.deliveryAddress.country}
                                        </p>
                                        {selectedDelivery.deliveryAddress.additionalInfo && (
                                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                                {selectedDelivery.deliveryAddress.additionalInfo}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Status History */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                                        Status History
                                    </h3>
                                    <div className="space-y-2">
                                        {selectedDelivery.statusHistory.map((history, index) => (
                                            <div key={index} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
                                                <div className="flex items-center space-x-2">
                                                    {getStatusIcon(history.status)}
                                                    <span className="font-medium text-gray-900 dark:text-white">
                                                        {history.status.replace('_', ' ').toUpperCase()}
                                                    </span>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm text-gray-600 dark:text-gray-300">
                                                        {new Date(history.timestamp).toLocaleString()}
                                                    </p>
                                                    {history.notes && (
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                                            {history.notes}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DeliveryManagement;
