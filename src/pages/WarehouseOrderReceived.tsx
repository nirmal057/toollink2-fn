import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    CheckIcon,
    DownloadIcon,
    TruckIcon,
    CalendarIcon,
    ClockIcon,
    UserIcon,
    PhoneIcon,
    MapPinIcon,
    AlertCircleIcon
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useNotification } from '../contexts/NotificationContext';

interface ReceivedOrderData {
    mainOrder: {
        _id: string;
        orderNumber: string;
        customerId: {
            username: string;
            email: string;
            phone?: string;
            address?: string;
        };
        status: string;
        createdAt: string;
        totalAmount: number;
        requestedDeliveryDate: string;
    };
    subOrders: Array<{
        _id: string;
        subOrderNumber: string;
        materialCategory: string;
        warehouseId: {
            _id: string;
            name: string;
            location: string;
            contact: string;
        };
        items: Array<{
            materialId: string;
            materialName: string;
            qty: number;
            unitPrice: number;
            totalPrice: number;
        }>;
        totalAmount: number;
        status: string;
        scheduledAt: string;
        scheduledTime: string;
        estimatedDuration: number;
    }>;
    warehouses: Array<{
        _id: string;
        name: string;
        location: string;
        contact: string;
    }>;
    warehouseStats: {
        totalSubOrders: number;
        totalItems: number;
        totalValue: number;
    };
}

interface Driver {
    _id: string;
    name: string;
    phone: string;
    vehicleNumber: string;
    isAvailable: boolean;
}

const WarehouseOrderReceived: React.FC = () => {
    const { mainOrderId } = useParams<{ mainOrderId: string }>();
    const navigate = useNavigate();
    const { } = useAuth();
    const { showError, showSuccess } = useNotification();

    const [orderData, setOrderData] = useState<ReceivedOrderData | null>(null);
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedSubOrder, setSelectedSubOrder] = useState<string | null>(null);
    const [selectedDriver, setSelectedDriver] = useState<string>('');
    const [deliveryNotes, setDeliveryNotes] = useState<string>('');
    const [estimatedDeliveryTime, setEstimatedDeliveryTime] = useState<string>('');
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        if (mainOrderId) {
            fetchOrderData();
            fetchAvailableDrivers();
        }
    }, [mainOrderId]);

    const fetchOrderData = async () => {
        try {
            const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
            const response = await fetch(`http://localhost:5001/api/orders/received/${mainOrderId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setOrderData(data.data);
                } else {
                    showError('Error', 'Failed to load order data');
                }
            } else {
                showError('Error', 'Failed to fetch order data');
            }
        } catch (error) {
            console.error('Error fetching order data:', error);
            showError('Error', 'Failed to load order data');
        } finally {
            setLoading(false);
        }
    };

    const fetchAvailableDrivers = async () => {
        try {
            const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
            const response = await fetch('http://localhost:5001/api/drivers?available=true', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setDrivers(data.data);
                }
            }
        } catch (error) {
            console.error('Error fetching drivers:', error);
        }
    };

    const downloadPDF = async (orderId: string, type: 'main' | 'sub') => {
        try {
            const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
            const response = await fetch(`http://localhost:5001/api/orders/${orderId}/pdf?type=${type}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `order-${orderId}.pdf`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
                showSuccess('Success', 'PDF downloaded successfully');
            } else {
                showError('Error', 'Failed to download PDF');
            }
        } catch (error) {
            console.error('Error downloading PDF:', error);
            showError('Error', 'Failed to download PDF');
        }
    };

    const acceptOrderAndCreateDelivery = async (subOrderId: string) => {
        if (!selectedDriver) {
            showError('Error', 'Please select a driver');
            return;
        }

        setProcessing(true);
        try {
            const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
            const response = await fetch(`http://localhost:5001/api/orders/sub-order/${subOrderId}/accept-and-create-delivery`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    driverId: selectedDriver,
                    deliveryNotes,
                    estimatedDeliveryTime
                })
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    showSuccess('Success', 'Order accepted and delivery created successfully');
                    // Refresh order data
                    fetchOrderData();
                    fetchAvailableDrivers();
                    // Reset form
                    setSelectedSubOrder(null);
                    setSelectedDriver('');
                    setDeliveryNotes('');
                    setEstimatedDeliveryTime('');
                } else {
                    showError('Error', data.error || 'Failed to accept order');
                }
            } else {
                showError('Error', 'Failed to accept order');
            }
        } catch (error) {
            console.error('Error accepting order:', error);
            showError('Error', 'Failed to accept order');
        } finally {
            setProcessing(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!orderData) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <AlertCircleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-semibold text-gray-900 mb-2">Order Not Found</h2>
                    <p className="text-gray-600 mb-4">The requested order could not be found or you don't have access to it.</p>
                    <button
                        onClick={() => navigate('/orders')}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                        Back to Orders
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Received Order</h1>
                        <p className="text-gray-600">Order #{orderData.mainOrder.orderNumber}</p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => downloadPDF(orderData.mainOrder._id, 'main')}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                        >
                            <DownloadIcon className="h-4 w-4" />
                            Download PDF
                        </button>
                        <button
                            onClick={() => navigate('/orders')}
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                        >
                            Back to Orders
                        </button>
                    </div>
                </div>

                {/* Customer Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Customer Information</h3>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <UserIcon className="h-4 w-4 text-gray-500" />
                                <span>{orderData.mainOrder.customerId.username}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <PhoneIcon className="h-4 w-4 text-gray-500" />
                                <span>{orderData.mainOrder.customerId.phone || 'N/A'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <MapPinIcon className="h-4 w-4 text-gray-500" />
                                <span>{orderData.mainOrder.customerId.address || 'N/A'}</span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Order Summary</h3>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span>Total Sub-Orders:</span>
                                <span className="font-semibold">{orderData.warehouseStats.totalSubOrders}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Total Items:</span>
                                <span className="font-semibold">{orderData.warehouseStats.totalItems}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Total Value:</span>
                                <span className="font-semibold">Rs. {orderData.warehouseStats.totalValue.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sub-Orders */}
            <div className="space-y-4">
                {orderData.subOrders.map((subOrder) => (
                    <div key={subOrder._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">
                                    {subOrder.materialCategory} Materials
                                </h3>
                                <p className="text-gray-600">Sub-Order: {subOrder.subOrderNumber}</p>
                                <p className="text-sm text-gray-500">Warehouse: {subOrder.warehouseId.name}</p>
                            </div>
                            <div className="text-right">
                                <div className={`px-3 py-1 rounded-full text-sm font-medium ${subOrder.status === 'pending'
                                        ? 'bg-yellow-100 text-yellow-800'
                                        : subOrder.status === 'accepted_ready_for_delivery'
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-gray-100 text-gray-800'
                                    }`}>
                                    {subOrder.status.replace(/_/g, ' ').toUpperCase()}
                                </div>
                                <p className="text-sm text-gray-500 mt-1">
                                    Rs. {subOrder.totalAmount.toFixed(2)}
                                </p>
                            </div>
                        </div>

                        {/* Schedule Information */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-2">
                                <CalendarIcon className="h-4 w-4 text-gray-500" />
                                <div>
                                    <p className="text-sm text-gray-500">Scheduled Date</p>
                                    <p className="font-medium">{new Date(subOrder.scheduledAt).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <ClockIcon className="h-4 w-4 text-gray-500" />
                                <div>
                                    <p className="text-sm text-gray-500">Scheduled Time</p>
                                    <p className="font-medium">{subOrder.scheduledTime}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <TruckIcon className="h-4 w-4 text-gray-500" />
                                <div>
                                    <p className="text-sm text-gray-500">Estimated Duration</p>
                                    <p className="font-medium">{subOrder.estimatedDuration} minutes</p>
                                </div>
                            </div>
                        </div>

                        {/* Items Table */}
                        <div className="overflow-x-auto mb-4">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-gray-50">
                                        <th className="text-left p-3">Material</th>
                                        <th className="text-center p-3">Quantity</th>
                                        <th className="text-right p-3">Unit Price</th>
                                        <th className="text-right p-3">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {subOrder.items.map((item, index) => (
                                        <tr key={index} className="border-t">
                                            <td className="p-3">{item.materialName}</td>
                                            <td className="text-center p-3">{item.qty}</td>
                                            <td className="text-right p-3">Rs. {item.unitPrice.toFixed(2)}</td>
                                            <td className="text-right p-3">Rs. {item.totalPrice.toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-between items-center">
                            <button
                                onClick={() => downloadPDF(subOrder._id, 'sub')}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                            >
                                <DownloadIcon className="h-4 w-4" />
                                Download PDF
                            </button>

                            {subOrder.status === 'pending' && (
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setSelectedSubOrder(
                                            selectedSubOrder === subOrder._id ? null : subOrder._id
                                        )}
                                        className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                                    >
                                        <CheckIcon className="h-4 w-4" />
                                        Accept & Create Delivery
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Delivery Creation Form */}
                        {selectedSubOrder === subOrder._id && (
                            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                <h4 className="font-semibold text-gray-900 mb-3">Create Delivery</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Select Driver *
                                        </label>
                                        <select
                                            value={selectedDriver}
                                            onChange={(e) => setSelectedDriver(e.target.value)}
                                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            required
                                        >
                                            <option value="">Choose a driver...</option>
                                            {drivers.map((driver) => (
                                                <option key={driver._id} value={driver._id}>
                                                    {driver.name} - {driver.vehicleNumber} ({driver.phone})
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Estimated Delivery Time
                                        </label>
                                        <input
                                            type="datetime-local"
                                            value={estimatedDeliveryTime}
                                            onChange={(e) => setEstimatedDeliveryTime(e.target.value)}
                                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Delivery Notes
                                        </label>
                                        <textarea
                                            value={deliveryNotes}
                                            onChange={(e) => setDeliveryNotes(e.target.value)}
                                            placeholder="Add any special instructions or notes for the delivery..."
                                            rows={3}
                                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end gap-2 mt-4">
                                    <button
                                        onClick={() => setSelectedSubOrder(null)}
                                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                                        disabled={processing}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => acceptOrderAndCreateDelivery(subOrder._id)}
                                        disabled={processing || !selectedDriver}
                                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                        {processing ? (
                                            <>
                                                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                                                Creating...
                                            </>
                                        ) : (
                                            <>
                                                <CheckIcon className="h-4 w-4" />
                                                Confirm & Create Delivery
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default WarehouseOrderReceived;
