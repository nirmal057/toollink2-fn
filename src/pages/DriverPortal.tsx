import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TruckIcon, PackageIcon, CheckCircleIcon, ClockIcon, MapPinIcon, PhoneIcon, LogOutIcon, RefreshCwIcon } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface Delivery {
    id: string;
    orderId: string;
    customerName: string;
    customerPhone: string;
    deliveryAddress: string;
    items: Array<{
        name: string;
        quantity: number;
        unit: string;
    }>;
    status: 'assigned' | 'out_from_warehouse' | 'on_the_way' | 'delivered';
    assignedDate: string;
    estimatedDelivery: string;
    priority: 'normal' | 'urgent';
    specialInstructions?: string;
}

const DriverPortal: React.FC = () => {
    const { user, logout } = useAuth();
    const [deliveries, setDeliveries] = useState<Delivery[]>([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Status options for drivers
    const statusOptions = [
        { value: 'out_from_warehouse', label: '✅ Out from Warehouse', icon: '🚛', color: 'bg-blue-500' },
        { value: 'on_the_way', label: '🚛 On the Way', icon: '📍', color: 'bg-yellow-500' },
        { value: 'delivered', label: '📦 Delivered', icon: '✅', color: 'bg-green-500' }
    ];

    // Load assigned deliveries
    const loadDeliveries = async () => {
        try {
            setLoading(true);
            setError(null);
            const token = localStorage.getItem('accessToken');

            const response = await fetch(`http://localhost:5001/api/deliveries/driver/${user?.id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to load deliveries');
            }

            const data = await response.json();
            setDeliveries(data.deliveries || []);
        } catch (err: any) {
            console.error('Error loading deliveries:', err);
            setError(err.message || 'Failed to load deliveries');
        } finally {
            setLoading(false);
        }
    };

    // Update delivery status
    const updateDeliveryStatus = async (deliveryId: string, newStatus: string) => {
        try {
            setUpdating(deliveryId);
            setError(null);
            const token = localStorage.getItem('accessToken');

            const response = await fetch(`http://localhost:5001/api/deliveries/${deliveryId}/status`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    status: newStatus,
                    driverId: user?.id,
                    timestamp: new Date().toISOString()
                })
            });

            if (!response.ok) {
                throw new Error('Failed to update status');
            }

            const result = await response.json();

            // Update local state
            setDeliveries(prev => prev.map(delivery =>
                delivery.id === deliveryId
                    ? { ...delivery, status: newStatus as any }
                    : delivery
            ));

            // Show success message
            alert(`✅ Status updated successfully!\nCustomer will be notified via email.`);

        } catch (err: any) {
            console.error('Error updating status:', err);
            setError(err.message || 'Failed to update status');
            alert('❌ Failed to update status. Please try again.');
        } finally {
            setUpdating(null);
        }
    };

    // Handle logout
    const handleLogout = async () => {
        if (window.confirm('Are you sure you want to logout?')) {
            try {
                await logout();
                window.location.href = '/auth/login';
            } catch (error) {
                console.error('Logout error:', error);
            }
        }
    };

    // Load deliveries on component mount
    useEffect(() => {
        if (user?.role !== 'driver') {
            setError('Access denied. Driver accounts only.');
            return;
        }
        loadDeliveries();
    }, [user]);

    // Access control
    if (user?.role !== 'driver') {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
                    <div className="text-red-500 mb-4">
                        <TruckIcon size={64} className="mx-auto" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
                    <p className="text-gray-600 mb-6">This portal is only accessible to registered drivers.</p>
                    <button
                        onClick={() => window.location.href = '/auth/login'}
                        className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                    >
                        Go to Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="bg-blue-500 p-2 rounded-lg">
                                <TruckIcon size={24} className="text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">Driver Portal</h1>
                                <p className="text-sm text-gray-600">Welcome, {user?.fullName || 'Driver'}</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={loadDeliveries}
                                disabled={loading}
                                className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                                title="Refresh"
                            >
                                <RefreshCwIcon size={20} className={loading ? 'animate-spin' : ''} />
                            </button>
                            <button
                                onClick={handleLogout}
                                className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                                title="Logout"
                            >
                                <LogOutIcon size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto px-4 py-6">
                {/* Error Message */}
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6"
                    >
                        <div className="flex items-center space-x-2 text-red-700">
                            <span className="font-medium">Error:</span>
                            <span>{error}</span>
                        </div>
                    </motion.div>
                )}

                {/* Loading State */}
                {loading ? (
                    <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading your deliveries...</p>
                    </div>
                ) : (
                    <>
                        {/* Summary Cards */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                            {[
                                { label: 'Total Assigned', count: deliveries.length, color: 'bg-blue-500', icon: '📦' },
                                { label: 'Pending', count: deliveries.filter(d => d.status === 'assigned').length, color: 'bg-gray-500', icon: '⏳' },
                                { label: 'In Progress', count: deliveries.filter(d => ['out_from_warehouse', 'on_the_way'].includes(d.status)).length, color: 'bg-yellow-500', icon: '🚛' },
                                { label: 'Delivered', count: deliveries.filter(d => d.status === 'delivered').length, color: 'bg-green-500', icon: '✅' }
                            ].map((stat, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="bg-white rounded-lg shadow-sm p-4 text-center"
                                >
                                    <div className="text-2xl mb-1">{stat.icon}</div>
                                    <div className="text-2xl font-bold text-gray-900">{stat.count}</div>
                                    <div className="text-sm text-gray-600">{stat.label}</div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Deliveries List */}
                        <div className="space-y-4">
                            {deliveries.length === 0 ? (
                                <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                                    <PackageIcon size={48} className="mx-auto text-gray-400 mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Deliveries Assigned</h3>
                                    <p className="text-gray-600">You don't have any deliveries assigned at the moment.</p>
                                </div>
                            ) : (
                                deliveries.map((delivery, index) => (
                                    <motion.div
                                        key={delivery.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
                                    >
                                        {/* Delivery Header */}
                                        <div className="p-4 border-b border-gray-100">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center space-x-3">
                                                    <div className={`p-2 rounded-lg ${delivery.status === 'delivered' ? 'bg-green-100 text-green-600' :
                                                            delivery.status === 'on_the_way' ? 'bg-yellow-100 text-yellow-600' :
                                                                delivery.status === 'out_from_warehouse' ? 'bg-blue-100 text-blue-600' :
                                                                    'bg-gray-100 text-gray-600'
                                                        }`}>
                                                        <PackageIcon size={20} />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold text-gray-900">Delivery #{delivery.id.slice(-6)}</h3>
                                                        <p className="text-sm text-gray-600">Order #{delivery.orderId.slice(-6)}</p>
                                                    </div>
                                                </div>
                                                {delivery.priority === 'urgent' && (
                                                    <span className="bg-red-100 text-red-700 text-xs font-medium px-2 py-1 rounded-full">
                                                        URGENT
                                                    </span>
                                                )}
                                            </div>

                                            {/* Customer Info */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                                <div className="flex items-center space-x-2">
                                                    <MapPinIcon size={16} className="text-gray-400" />
                                                    <div>
                                                        <p className="font-medium text-gray-900">{delivery.customerName}</p>
                                                        <p className="text-gray-600">{delivery.deliveryAddress}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <PhoneIcon size={16} className="text-gray-400" />
                                                    <p className="text-gray-900">{delivery.customerPhone}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Items List */}
                                        <div className="p-4 bg-gray-50">
                                            <h4 className="font-medium text-gray-900 mb-2">Items to Deliver:</h4>
                                            <div className="space-y-1">
                                                {delivery.items.map((item, idx) => (
                                                    <div key={idx} className="flex justify-between text-sm">
                                                        <span className="text-gray-700">{item.name}</span>
                                                        <span className="text-gray-600">{item.quantity} {item.unit}</span>
                                                    </div>
                                                ))}
                                            </div>

                                            {delivery.specialInstructions && (
                                                <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm">
                                                    <strong>Special Instructions:</strong> {delivery.specialInstructions}
                                                </div>
                                            )}
                                        </div>

                                        {/* Status Update Actions */}
                                        <div className="p-4 border-t border-gray-100">
                                            <div className="flex items-center justify-between">
                                                <div className="text-sm">
                                                    <span className="text-gray-600">Current Status: </span>
                                                    <span className={`font-medium ${delivery.status === 'delivered' ? 'text-green-600' :
                                                            delivery.status === 'on_the_way' ? 'text-yellow-600' :
                                                                delivery.status === 'out_from_warehouse' ? 'text-blue-600' :
                                                                    'text-gray-600'
                                                        }`}>
                                                        {statusOptions.find(s => s.value === delivery.status)?.label || 'Assigned'}
                                                    </span>
                                                </div>

                                                {delivery.status !== 'delivered' && (
                                                    <div className="flex space-x-2">
                                                        {statusOptions
                                                            .filter(option => {
                                                                // Show next logical status
                                                                if (delivery.status === 'assigned') return option.value === 'out_from_warehouse';
                                                                if (delivery.status === 'out_from_warehouse') return ['on_the_way', 'delivered'].includes(option.value);
                                                                if (delivery.status === 'on_the_way') return option.value === 'delivered';
                                                                return false;
                                                            })
                                                            .map(option => (
                                                                <button
                                                                    key={option.value}
                                                                    onClick={() => updateDeliveryStatus(delivery.id, option.value)}
                                                                    disabled={updating === delivery.id}
                                                                    className={`px-3 py-1 text-sm font-medium text-white rounded-lg transition-colors ${option.color
                                                                        } hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed`}
                                                                >
                                                                    {updating === delivery.id ? (
                                                                        <RefreshCwIcon size={14} className="animate-spin" />
                                                                    ) : (
                                                                        option.label
                                                                    )}
                                                                </button>
                                                            ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default DriverPortal;

