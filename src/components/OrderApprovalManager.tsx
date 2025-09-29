import React, { useState, useEffect } from 'react';
import {
    CheckCircle,
    XCircle,
    Clock,
    User,
    Package,
    MapPin,
    Calendar,
    AlertTriangle,
    Eye
} from 'lucide-react';
import { useNotification } from '../contexts/NotificationContext';

interface PendingOrder {
    _id: string;
    orderNumber: string;
    customerId: {
        fullName: string;
        email: string;
        phone?: string;
    };
    items: Array<{
        materialId: {
            name: string;
            category: string;
            unit: string;
        };
        requestedQty: number;
    }>;
    deliveryAddress: {
        street: string;
        city: string;
        state: string;
        zipCode: string;
        phone?: string;
    };
    createdAt: string;
    notes?: string;
    status: string;
}

const OrderApprovalManager: React.FC = () => {
    const [pendingOrders, setPendingOrders] = useState<PendingOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<PendingOrder | null>(null);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [approvalNotes, setApprovalNotes] = useState('');
    const [actionLoading, setActionLoading] = useState(false);
    const { showSuccess, showError } = useNotification();

    useEffect(() => {
        fetchPendingOrders();
        // Set up periodic refresh
        const interval = setInterval(fetchPendingOrders, 30000); // Refresh every 30 seconds
        return () => clearInterval(interval);
    }, []);

    const fetchPendingOrders = async () => {
        try {
            const response = await fetch('/api/orders/main-orders?status=pending_approval', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch pending orders');
            }

            const result = await response.json();
            if (result.success) {
                setPendingOrders(result.data || []);
            }
        } catch (error: any) {
            console.error('Error fetching pending orders:', error);
            showError('Error', 'Failed to load pending orders');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (orderId: string) => {
        setActionLoading(true);
        try {
            const response = await fetch(`/api/orders/main-order/${orderId}/approve`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ notes: approvalNotes })
            });

            const result = await response.json();

            if (result.success) {
                showSuccess('Order Approved', `Order ${result.data.orderNumber} has been approved successfully`);
                setPendingOrders(orders => orders.filter(order => order._id !== orderId));
                setApprovalNotes('');
                setSelectedOrder(null);
            } else {
                throw new Error(result.error || 'Failed to approve order');
            }
        } catch (error: any) {
            showError('Approval Failed', error.message);
        } finally {
            setActionLoading(false);
        }
    };

    const handleReject = async () => {
        if (!selectedOrder || !rejectReason.trim()) {
            showError('Error', 'Please provide a rejection reason');
            return;
        }

        setActionLoading(true);
        try {
            const response = await fetch(`/api/orders/main-order/${selectedOrder._id}/reject`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ reason: rejectReason })
            });

            const result = await response.json();

            if (result.success) {
                showSuccess('Order Rejected', `Order ${result.data.orderNumber} has been rejected`);
                setPendingOrders(orders => orders.filter(order => order._id !== selectedOrder._id));
                setShowRejectModal(false);
                setRejectReason('');
                setSelectedOrder(null);
            } else {
                throw new Error(result.error || 'Failed to reject order');
            }
        } catch (error: any) {
            showError('Rejection Failed', error.message);
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    <span className="ml-2 text-gray-600">Loading pending orders...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                        <Clock className="h-5 w-5 text-amber-500" />
                        Pending Order Approvals
                        {pendingOrders.length > 0 && (
                            <span className="bg-amber-100 text-amber-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                                {pendingOrders.length}
                            </span>
                        )}
                    </h2>
                    <button
                        onClick={fetchPendingOrders}
                        className="text-sm text-blue-600 hover:text-blue-800"
                    >
                        Refresh
                    </button>
                </div>
            </div>

            <div className="p-6">
                {pendingOrders.length === 0 ? (
                    <div className="text-center py-12">
                        <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
                        <p className="text-gray-500">No pending orders for approval</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {pendingOrders.map((order) => (
                            <div key={order._id} className="border border-gray-200 rounded-lg p-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-3">
                                            <h3 className="text-lg font-medium text-gray-900">
                                                {order.orderNumber}
                                            </h3>
                                            <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                                                Pending Approval
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                            <div className="flex items-start gap-2">
                                                <User className="h-4 w-4 text-gray-400 mt-0.5" />
                                                <div>
                                                    <p className="font-medium text-gray-900">{order.customerId.fullName}</p>
                                                    <p className="text-sm text-gray-500">{order.customerId.email}</p>
                                                    {order.customerId.phone && (
                                                        <p className="text-sm text-gray-500">{order.customerId.phone}</p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-2">
                                                <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                                                <div>
                                                    <p className="text-sm text-gray-900">
                                                        {order.deliveryAddress.street}
                                                    </p>
                                                    <p className="text-sm text-gray-500">
                                                        {order.deliveryAddress.city}, {order.deliveryAddress.state} {order.deliveryAddress.zipCode}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="flex items-center gap-1">
                                                <Package className="h-4 w-4 text-gray-400" />
                                                <span className="text-sm text-gray-600">
                                                    {order.items.length} items
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Calendar className="h-4 w-4 text-gray-400" />
                                                <span className="text-sm text-gray-600">
                                                    {new Date(order.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Order Items Preview */}
                                        <div className="mb-4">
                                            <p className="text-sm font-medium text-gray-700 mb-2">Items:</p>
                                            <div className="space-y-1">
                                                {order.items.slice(0, 3).map((item, index) => (
                                                    <div key={index} className="text-sm text-gray-600 flex justify-between">
                                                        <span>{item.materialId.name}</span>
                                                        <span>{item.requestedQty} {item.materialId.unit}</span>
                                                    </div>
                                                ))}
                                                {order.items.length > 3 && (
                                                    <p className="text-sm text-gray-500 italic">
                                                        +{order.items.length - 3} more items...
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2 ml-4">
                                        <button
                                            onClick={() => setSelectedOrder(order)}
                                            className="flex items-center gap-1 px-3 py-1 text-sm text-blue-600 hover:text-blue-800 border border-blue-200 rounded-md hover:bg-blue-50"
                                        >
                                            <Eye className="h-3 w-3" />
                                            View Details
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Order Details Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium">Order Details - {selectedOrder.orderNumber}</h3>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Customer Info */}
                            <div>
                                <h4 className="font-medium text-gray-900 mb-2">Customer Information</h4>
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <p><strong>Name:</strong> {selectedOrder.customerId.fullName}</p>
                                    <p><strong>Email:</strong> {selectedOrder.customerId.email}</p>
                                    {selectedOrder.customerId.phone && (
                                        <p><strong>Phone:</strong> {selectedOrder.customerId.phone}</p>
                                    )}
                                </div>
                            </div>

                            {/* Delivery Address */}
                            <div>
                                <h4 className="font-medium text-gray-900 mb-2">Delivery Address</h4>
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <p>{selectedOrder.deliveryAddress.street}</p>
                                    <p>{selectedOrder.deliveryAddress.city}, {selectedOrder.deliveryAddress.state} {selectedOrder.deliveryAddress.zipCode}</p>
                                    {selectedOrder.deliveryAddress.phone && (
                                        <p><strong>Contact:</strong> {selectedOrder.deliveryAddress.phone}</p>
                                    )}
                                </div>
                            </div>

                            {/* Items */}
                            <div>
                                <h4 className="font-medium text-gray-900 mb-2">Items Ordered</h4>
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <div className="space-y-2">
                                        {selectedOrder.items.map((item, index) => (
                                            <div key={index} className="flex justify-between items-center">
                                                <div>
                                                    <p className="font-medium">{item.materialId.name}</p>
                                                    <p className="text-sm text-gray-600">{item.materialId.category}</p>
                                                </div>
                                                <span className="font-medium">
                                                    {item.requestedQty} {item.materialId.unit}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Notes */}
                            {selectedOrder.notes && (
                                <div>
                                    <h4 className="font-medium text-gray-900 mb-2">Customer Notes</h4>
                                    <div className="bg-gray-50 p-3 rounded-lg">
                                        <p className="text-gray-700">{selectedOrder.notes}</p>
                                    </div>
                                </div>
                            )}

                            {/* Approval Notes */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Approval Notes (Optional)
                                </label>
                                <textarea
                                    value={approvalNotes}
                                    onChange={(e) => setApprovalNotes(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    rows={3}
                                    placeholder="Add any notes about this approval..."
                                />
                            </div>
                        </div>

                        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    setSelectedOrder(null);
                                    setApprovalNotes('');
                                }}
                                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                                disabled={actionLoading}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => setShowRejectModal(true)}
                                className="flex items-center gap-2 px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700"
                                disabled={actionLoading}
                            >
                                <XCircle className="h-4 w-4" />
                                Reject
                            </button>
                            <button
                                onClick={() => handleApprove(selectedOrder._id)}
                                className="flex items-center gap-2 px-4 py-2 text-white bg-green-600 rounded-md hover:bg-green-700"
                                disabled={actionLoading}
                            >
                                {actionLoading ? (
                                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                                ) : (
                                    <CheckCircle className="h-4 w-4" />
                                )}
                                Approve
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reject Modal */}
            {showRejectModal && selectedOrder && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-md w-full">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-red-600 flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5" />
                                Reject Order
                            </h3>
                        </div>

                        <div className="p-6">
                            <p className="text-gray-700 mb-4">
                                Are you sure you want to reject order <strong>{selectedOrder.orderNumber}</strong>?
                                This action cannot be undone.
                            </p>

                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Rejection Reason *
                            </label>
                            <textarea
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                                rows={3}
                                placeholder="Please provide a clear reason for rejection..."
                                required
                            />
                        </div>

                        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    setShowRejectModal(false);
                                    setRejectReason('');
                                }}
                                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                                disabled={actionLoading}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleReject}
                                className="flex items-center gap-2 px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700"
                                disabled={actionLoading || !rejectReason.trim()}
                            >
                                {actionLoading ? (
                                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                                ) : (
                                    <XCircle className="h-4 w-4" />
                                )}
                                Confirm Rejection
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderApprovalManager;
