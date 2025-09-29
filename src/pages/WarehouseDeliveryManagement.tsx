import React, { useState, useEffect } from 'react';
import {
    Package,
    Truck,
    Calendar,
    Clock,
    User,
    Phone,
    MapPin,
    Plus,
    Filter,
    CheckCircle,
    AlertTriangle,
    XCircle,
    Eye
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useNotification } from '../contexts/NotificationContext';
import CreateDeliveryModal from '../components/CreateDeliveryModal';

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
            username: string;
            email: string;
            phone?: string;
            address?: string;
        };
        requestedDeliveryDate: string;
    };
    warehouseId: {
        _id: string;
        name: string;
        location: string;
        contact: string;
    };
    materialCategory: string;
    items: SubOrderItem[];
    totalAmount: number;
    status: string;
    scheduledAt: string;
    scheduledTime: string;
    estimatedDuration: number;
    createdAt: string;
}

const WarehouseDeliveryManagement: React.FC = () => {
    const { user } = useAuth();
    const { showError } = useNotification();

    // State management
    const [subOrders, setSubOrders] = useState<SubOrder[]>([]);
    const [loading, setLoading] = useState(true);

    // Filter states
    const [filter, setFilter] = useState({
        status: '',
        dateRange: 'all',
        materialCategory: '',
        priority: ''
    });

    // Form states
    const [showDeliveryForm, setShowDeliveryForm] = useState(false);
    const [selectedSubOrder, setSelectedSubOrder] = useState<SubOrder | null>(null);

    // View states
    const [selectedSubOrderDetails, setSelectedSubOrderDetails] = useState<SubOrder | null>(null);
    const [showOrderDetails, setShowOrderDetails] = useState(false);

    useEffect(() => {
        if (user) {
            fetchSubOrders();
        }
    }, [user, filter]);

    const fetchSubOrders = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('accessToken') || localStorage.getItem('token');

            const params = new URLSearchParams();
            if (filter.status) params.append('status', filter.status);
            if (filter.materialCategory) params.append('materialCategory', filter.materialCategory);
            if (filter.dateRange !== 'all') {
                const today = new Date();
                const endDate = new Date();

                switch (filter.dateRange) {
                    case 'today':
                        endDate.setDate(today.getDate());
                        break;
                    case 'week':
                        endDate.setDate(today.getDate() + 7);
                        break;
                    case 'month':
                        endDate.setMonth(today.getMonth() + 1);
                        break;
                }

                params.append('startDate', today.toISOString());
                params.append('endDate', endDate.toISOString());
            }

            const response = await fetch(`http://localhost:5001/api/orders/warehouse/sub-orders?${params.toString()}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setSubOrders(data.data || []);
                } else {
                    showError('Error', 'Failed to load sub-orders');
                }
            } else {
                showError('Error', 'Failed to fetch sub-orders');
            }
        } catch (error) {
            console.error('Error fetching sub-orders:', error);
            showError('Error', 'Failed to load sub-orders');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'accepted_ready_for_delivery':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'assigned':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'in_progress':
                return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'delivered':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'cancelled':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending':
                return <Clock className="h-4 w-4" />;
            case 'accepted_ready_for_delivery':
                return <CheckCircle className="h-4 w-4" />;
            case 'assigned':
                return <Truck className="h-4 w-4" />;
            case 'in_progress':
                return <AlertTriangle className="h-4 w-4" />;
            case 'delivered':
                return <CheckCircle className="h-4 w-4" />;
            case 'cancelled':
                return <XCircle className="h-4 w-4" />;
            default:
                return <Package className="h-4 w-4" />;
        }
    };

    const openDeliveryForm = (subOrder: SubOrder) => {
        setSelectedSubOrder(subOrder);
        setShowDeliveryForm(true);
    };

    const closeDeliveryForm = () => {
        setShowDeliveryForm(false);
        setSelectedSubOrder(null);
    };

    const viewOrderDetails = (subOrder: SubOrder) => {
        setSelectedSubOrderDetails(subOrder);
        setShowOrderDetails(true);
    };

    const closeOrderDetails = () => {
        setShowOrderDetails(false);
        setSelectedSubOrderDetails(null);
    };

    // Filter sub-orders based on current filters
    const filteredSubOrders = subOrders.filter(subOrder => {
        if (filter.status && subOrder.status !== filter.status) return false;
        if (filter.materialCategory && subOrder.materialCategory !== filter.materialCategory) return false;
        return true;
    });

    // Get unique material categories for filter
    const materialCategories = [...new Set(subOrders.map(so => so.materialCategory))];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Delivery Management</h1>
                        <p className="text-gray-600">Manage sub-orders and create deliveries for your warehouse</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Package className="h-5 w-5 text-blue-500" />
                        <span className="text-sm text-gray-600">
                            {filteredSubOrders.length} Sub-Orders
                        </span>
                    </div>
                </div>

                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select
                            value={filter.status}
                            onChange={(e) => setFilter({ ...filter, status: e.target.value })}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">All Statuses</option>
                            <option value="pending">Pending</option>
                            <option value="accepted_ready_for_delivery">Ready for Delivery</option>
                            <option value="assigned">Assigned</option>
                            <option value="in_progress">In Progress</option>
                            <option value="delivered">Delivered</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Material Category</label>
                        <select
                            value={filter.materialCategory}
                            onChange={(e) => setFilter({ ...filter, materialCategory: e.target.value })}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">All Categories</option>
                            {materialCategories.map(category => (
                                <option key={category} value={category}>{category}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
                        <select
                            value={filter.dateRange}
                            onChange={(e) => setFilter({ ...filter, dateRange: e.target.value })}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="all">All Time</option>
                            <option value="today">Today</option>
                            <option value="week">This Week</option>
                            <option value="month">This Month</option>
                        </select>
                    </div>

                    <div className="flex items-end">
                        <button
                            onClick={() => setFilter({ status: '', dateRange: 'all', materialCategory: '', priority: '' })}
                            className="w-full px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 flex items-center justify-center gap-2"
                        >
                            <Filter className="h-4 w-4" />
                            Clear Filters
                        </button>
                    </div>
                </div>
            </div>

            {/* Sub-Orders List */}
            <div className="space-y-4">
                {filteredSubOrders.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                        <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Sub-Orders Found</h3>
                        <p className="text-gray-600">
                            {filter.status || filter.materialCategory || filter.dateRange !== 'all'
                                ? 'No sub-orders match your current filters.'
                                : 'There are currently no sub-orders for your warehouse.'
                            }
                        </p>
                    </div>
                ) : (
                    filteredSubOrders.map((subOrder) => (
                        <div key={subOrder._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            {subOrder.subOrderNumber}
                                        </h3>
                                        <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(subOrder.status)} flex items-center gap-1`}>
                                            {getStatusIcon(subOrder.status)}
                                            {subOrder.status.replace(/_/g, ' ').toUpperCase()}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                                        <div className="flex items-center gap-2">
                                            <Package className="h-4 w-4" />
                                            <span>Main Order: {subOrder.mainOrderId.orderNumber}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <User className="h-4 w-4" />
                                            <span>Customer: {subOrder.mainOrderId.customerId.username}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4" />
                                            <span>Scheduled: {new Date(subOrder.scheduledAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>

                                    <div className="mt-2 text-sm text-gray-600">
                                        <span className="font-medium">Category:</span> {subOrder.materialCategory} |
                                        <span className="font-medium ml-2">Items:</span> {subOrder.items.length} |
                                        <span className="font-medium ml-2">Total:</span> Rs. {subOrder.totalAmount.toFixed(2)}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 ml-4">
                                    <button
                                        onClick={() => viewOrderDetails(subOrder)}
                                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        title="View Details"
                                    >
                                        <Eye className="h-4 w-4" />
                                    </button>

                                    {subOrder.status === 'pending' && (
                                        <button
                                            onClick={() => openDeliveryForm(subOrder)}
                                            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                                        >
                                            <Plus className="h-4 w-4" />
                                            Create Delivery
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Customer & Delivery Info */}
                            <div className="border-t pt-4 mt-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <div className="flex items-center gap-2 text-gray-600 mb-1">
                                            <Phone className="h-4 w-4" />
                                            <span>{subOrder.mainOrderId.customerId.phone || 'N/A'}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <MapPin className="h-4 w-4" />
                                            <span>{subOrder.mainOrderId.customerId.address || 'N/A'}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 text-gray-600 mb-1">
                                            <Clock className="h-4 w-4" />
                                            <span>Time: {subOrder.scheduledTime}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <Calendar className="h-4 w-4" />
                                            <span>Duration: {subOrder.estimatedDuration} mins</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Create Delivery Modal */}
            <CreateDeliveryModal
                isOpen={showDeliveryForm}
                onClose={closeDeliveryForm}
                subOrder={selectedSubOrder}
                onDeliveryCreated={() => {
                    fetchSubOrders(); // Refresh the list
                }}
            />

            {/* Order Details Modal */}
            {showOrderDetails && selectedSubOrderDetails && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-screen overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-gray-900">Sub-Order Details</h2>
                                <button
                                    onClick={closeOrderDetails}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <XCircle className="h-6 w-6" />
                                </button>
                            </div>

                            <div className="space-y-6">
                                {/* Order Info */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Order Information</h3>
                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Sub-Order Number:</span>
                                                <span className="font-medium">{selectedSubOrderDetails.subOrderNumber}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Main Order:</span>
                                                <span className="font-medium">{selectedSubOrderDetails.mainOrderId.orderNumber}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Status:</span>
                                                <span className={`px-2 py-1 rounded text-sm font-medium ${getStatusColor(selectedSubOrderDetails.status)}`}>
                                                    {selectedSubOrderDetails.status.replace(/_/g, ' ').toUpperCase()}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Category:</span>
                                                <span className="font-medium">{selectedSubOrderDetails.materialCategory}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Customer Information</h3>
                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Name:</span>
                                                <span className="font-medium">{selectedSubOrderDetails.mainOrderId.customerId.username}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Email:</span>
                                                <span className="font-medium">{selectedSubOrderDetails.mainOrderId.customerId.email}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Phone:</span>
                                                <span className="font-medium">{selectedSubOrderDetails.mainOrderId.customerId.phone || 'N/A'}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Address:</span>
                                                <span className="font-medium">{selectedSubOrderDetails.mainOrderId.customerId.address || 'N/A'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Items Table */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Items</h3>
                                    <div className="overflow-x-auto">
                                        <table className="w-full border border-gray-200 rounded-lg">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="text-left p-3 font-medium text-gray-900">Material</th>
                                                    <th className="text-center p-3 font-medium text-gray-900">Quantity</th>
                                                    <th className="text-right p-3 font-medium text-gray-900">Unit Price</th>
                                                    <th className="text-right p-3 font-medium text-gray-900">Total</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {selectedSubOrderDetails.items.map((item, index) => (
                                                    <tr key={index} className="border-t">
                                                        <td className="p-3">{item.materialName}</td>
                                                        <td className="text-center p-3">{item.qty}</td>
                                                        <td className="text-right p-3">Rs. {item.unitPrice.toFixed(2)}</td>
                                                        <td className="text-right p-3 font-medium">Rs. {item.totalPrice.toFixed(2)}</td>
                                                    </tr>
                                                ))}
                                                <tr className="border-t bg-gray-50">
                                                    <td colSpan={3} className="p-3 font-medium text-right">Total Amount:</td>
                                                    <td className="p-3 font-bold text-right">Rs. {selectedSubOrderDetails.totalAmount.toFixed(2)}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Schedule Information */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Schedule Information</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-5 w-5 text-gray-500" />
                                            <div>
                                                <p className="text-sm text-gray-500">Scheduled Date</p>
                                                <p className="font-medium">{new Date(selectedSubOrderDetails.scheduledAt).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-5 w-5 text-gray-500" />
                                            <div>
                                                <p className="text-sm text-gray-500">Scheduled Time</p>
                                                <p className="font-medium">{selectedSubOrderDetails.scheduledTime}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Truck className="h-5 w-5 text-gray-500" />
                                            <div>
                                                <p className="text-sm text-gray-500">Estimated Duration</p>
                                                <p className="font-medium">{selectedSubOrderDetails.estimatedDuration} minutes</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex justify-between items-center mt-6 pt-6 border-t">
                                <button
                                    onClick={closeOrderDetails}
                                    className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                                >
                                    Close
                                </button>

                                {selectedSubOrderDetails.status === 'pending' && (
                                    <button
                                        onClick={() => {
                                            closeOrderDetails();
                                            openDeliveryForm(selectedSubOrderDetails);
                                        }}
                                        className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                                    >
                                        <Plus className="h-4 w-4" />
                                        Create Delivery
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WarehouseDeliveryManagement;
