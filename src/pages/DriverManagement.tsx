import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TruckIcon, UserPlusIcon, MailIcon, PhoneIcon, EditIcon, TrashIcon, CheckCircleIcon, SearchIcon, FilterIcon } from 'lucide-react';
import { useToast } from '../contexts/GlobalNotificationContext';

interface Driver {
    id: string;
    fullName: string;
    email: string;
    phone: string;
    licenseNumber: string;
    vehicleInfo: {
        type: string;
        plateNumber: string;
        capacity: string;
    };
    status: 'active' | 'inactive' | 'suspended';
    createdAt: string;
    totalDeliveries: number;
    rating: number;
}

interface Delivery {
    id: string;
    orderId: string;
    customerName: string;
    customerEmail: string;
    deliveryAddress: string;
    status: 'assigned' | 'out_from_warehouse' | 'on_the_way' | 'delivered';
    driverId?: string;
    assignedDate?: string;
    priority: 'normal' | 'urgent';
}

interface AddDriverFormProps {
    onSubmit: (driverData: any) => void;
    onCancel: () => void;
    loading: boolean;
}

const AddDriverForm: React.FC<AddDriverFormProps> = ({ onSubmit, onCancel, loading }) => {
    const toast = useToast();
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        phone: '',
        licenseNumber: '',
        vehicleType: '',
        plateNumber: '',
        vehicleCapacity: ''
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
        if (!formData.password) newErrors.password = 'Password is required';
        else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
        if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
        if (!formData.licenseNumber.trim()) newErrors.licenseNumber = 'License number is required';
        if (!formData.vehicleType.trim()) newErrors.vehicleType = 'Vehicle type is required';
        if (!formData.plateNumber.trim()) newErrors.plateNumber = 'Plate number is required';
        if (!formData.vehicleCapacity.trim()) newErrors.vehicleCapacity = 'Vehicle capacity is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validateForm()) {
            toast.info('🔄 Creating Driver Account...', 'Please wait while we set up the new driver profile.');
            const driverData = {
                fullName: formData.fullName,
                email: formData.email,
                password: formData.password,
                phone: formData.phone,
                licenseNumber: formData.licenseNumber,
                vehicleInfo: {
                    type: formData.vehicleType,
                    plateNumber: formData.plateNumber,
                    capacity: formData.vehicleCapacity
                }
            };
            onSubmit(driverData);
        } else {
            toast.warning('⚠️ Form Incomplete', 'Please fill in all required fields before submitting.');
        }
    };

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                </label>
                <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => handleChange('fullName', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.fullName ? 'border-red-500' : 'border-gray-300'
                        }`}
                    placeholder="Enter driver's full name"
                />
                {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
            </div>

            {/* Email */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address *
                </label>
                <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.email ? 'border-red-500' : 'border-gray-300'
                        }`}
                    placeholder="driver@example.com"
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password *
                </label>
                <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.password ? 'border-red-500' : 'border-gray-300'
                        }`}
                    placeholder="Enter secure password"
                />
                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
            </div>

            {/* Phone */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number *
                </label>
                <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.phone ? 'border-red-500' : 'border-gray-300'
                        }`}
                    placeholder="+94771234567"
                />
                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
            </div>

            {/* License Number */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    License Number *
                </label>
                <input
                    type="text"
                    value={formData.licenseNumber}
                    onChange={(e) => handleChange('licenseNumber', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.licenseNumber ? 'border-red-500' : 'border-gray-300'
                        }`}
                    placeholder="DL123456789"
                />
                {errors.licenseNumber && <p className="text-red-500 text-sm mt-1">{errors.licenseNumber}</p>}
            </div>

            {/* Vehicle Type */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vehicle Type *
                </label>
                <select
                    value={formData.vehicleType}
                    onChange={(e) => handleChange('vehicleType', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.vehicleType ? 'border-red-500' : 'border-gray-300'
                        }`}
                >
                    <option value="">Select vehicle type</option>
                    <option value="Motorcycle">Motorcycle</option>
                    <option value="Three Wheeler">Three Wheeler</option>
                    <option value="Pickup Truck">Pickup Truck</option>
                    <option value="Van">Van</option>
                    <option value="Truck">Truck</option>
                    <option value="Mini Truck">Mini Truck</option>
                </select>
                {errors.vehicleType && <p className="text-red-500 text-sm mt-1">{errors.vehicleType}</p>}
            </div>

            {/* Plate Number */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Plate Number *
                </label>
                <input
                    type="text"
                    value={formData.plateNumber}
                    onChange={(e) => handleChange('plateNumber', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.plateNumber ? 'border-red-500' : 'border-gray-300'
                        }`}
                    placeholder="CAR-1234"
                />
                {errors.plateNumber && <p className="text-red-500 text-sm mt-1">{errors.plateNumber}</p>}
            </div>

            {/* Vehicle Capacity */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vehicle Capacity *
                </label>
                <input
                    type="text"
                    value={formData.vehicleCapacity}
                    onChange={(e) => handleChange('vehicleCapacity', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.vehicleCapacity ? 'border-red-500' : 'border-gray-300'
                        }`}
                    placeholder="1 Ton / 50 kg / 5 items"
                />
                {errors.vehicleCapacity && <p className="text-red-500 text-sm mt-1">{errors.vehicleCapacity}</p>}
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-4">
                <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-lg hover:from-green-600 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'Adding...' : 'Add Driver'}
                </button>
            </div>
        </form>
    );
};

const DriverManagement: React.FC<{ userRole: string }> = ({ userRole }) => {
    const toast = useToast();
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [deliveries, setDeliveries] = useState<Delivery[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'drivers' | 'deliveries'>('drivers');
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [showAddDriverModal, setShowAddDriverModal] = useState(false);
    const [addDriverLoading, setAddDriverLoading] = useState(false);

    // Check permissions
    if (!['admin', 'warehouse'].includes(userRole)) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
                    <div className="text-red-500 mb-4">
                        <TruckIcon size={64} className="mx-auto" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
                    <p className="text-gray-600">Only admin and warehouse managers can access driver management.</p>
                </div>
            </div>
        );
    }

    // Load drivers
    const loadDrivers = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch('http://localhost:5001/api/drivers', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setDrivers(data.drivers || []);
            }
        } catch (error) {
            console.error('Error loading drivers:', error);
            toast.error('🚫 Loading Failed', 'Unable to fetch drivers list. Please check your connection and try again.');
        }
    };

    // Load unassigned deliveries
    const loadDeliveries = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch('http://localhost:5001/api/drivers/unassigned', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setDeliveries(data.deliveries || []);
            }
        } catch (error) {
            console.error('Error loading deliveries:', error);
            toast.error('📦 Loading Failed', 'Unable to fetch delivery assignments. Please refresh the page.');
        }
    };

    // Assign delivery to driver
    const assignDelivery = async (deliveryId: string, driverId: string) => {
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`http://localhost:5001/api/drivers/${deliveryId}/assign`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    driverId,
                    assignedBy: userRole,
                    assignedDate: new Date().toISOString()
                })
            });

            if (response.ok) {
                toast.success('🚚 Delivery Assigned Successfully!', 'Driver has been notified via email and can view details in the Driver Portal.');
                // Send notification email to driver
                await sendDriverNotification(driverId, deliveryId);
                setShowAssignModal(false);
                setSelectedDelivery(null);
                await loadDeliveries(); // Refresh list
            } else {
                throw new Error('Failed to assign delivery');
            }
        } catch (error) {
            console.error('Error assigning delivery:', error);
            toast.error('❌ Assignment Failed', 'Unable to assign delivery to driver. Please try again or contact support.');
        }
    };

    // Send driver notification email
    const sendDriverNotification = async (driverId: string, deliveryId: string) => {
        try {
            const token = localStorage.getItem('accessToken');
            await fetch(`http://localhost:5001/api/notifications/driver-assignment`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    driverId,
                    deliveryId,
                    portalLink: `${window.location.origin}/driver-portal`
                })
            });
        } catch (error) {
            console.error('Error sending driver notification:', error);
        }
    };

    // Add new driver
    const addDriver = async (driverData: any) => {
        try {
            setAddDriverLoading(true);
            const token = localStorage.getItem('accessToken');

            // Prepare driver data with all required fields
            const driverPayload = {
                username: driverData.email.split('@')[0], // Generate username from email
                email: driverData.email,
                password: driverData.password,
                fullName: driverData.fullName,
                phone: driverData.phone,
                role: 'driver',
                licenseNumber: driverData.licenseNumber,
                vehicleType: driverData.vehicleType,
                plateNumber: driverData.plateNumber,
                vehicleCapacity: driverData.vehicleCapacity,
                isApproved: true,
                isActive: true,
                emailVerified: true
            };

            const response = await fetch('http://localhost:5001/api/users', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(driverPayload)
            });

            const result = await response.json();

            if (result.success) {
                toast.success('🎉 Driver Added Successfully!', `Welcome ${driverData.fullName}! Account created and welcome email sent.`);
                setShowAddDriverModal(false);
                await loadDrivers(); // Refresh drivers list
            } else {
                throw new Error(result.error || 'Failed to add driver');
            }
        } catch (error) {
            console.error('Error adding driver:', error);
            toast.error('❌ Failed to Add Driver', error instanceof Error ? error.message : 'Unable to create new driver account. Please try again.');
        } finally {
            setAddDriverLoading(false);
        }
    };

    // Load data on component mount
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            await Promise.all([loadDrivers(), loadDeliveries()]);
            setLoading(false);
        };
        loadData();
    }, []);

    // Filter functions
    const filteredDrivers = drivers.filter(driver => {
        const matchesSearch = driver.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            driver.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            driver.phone.includes(searchTerm);
        const matchesStatus = statusFilter === 'all' || driver.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const filteredDeliveries = deliveries.filter(delivery => {
        const matchesSearch = delivery.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            delivery.deliveryAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
            delivery.orderId.includes(searchTerm);
        return matchesSearch;
    });

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-xl">
                                    <TruckIcon size={32} className="text-white" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900">Driver Management</h1>
                                    <p className="text-gray-600 mt-1">Manage drivers and delivery assignments</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowAddDriverModal(true)}
                                className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-green-600 hover:to-blue-700 flex items-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl"
                            >
                                <UserPlusIcon size={20} />
                                Add Driver
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Tabs */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 mb-6">
                    <div className="border-b border-gray-200">
                        <nav className="flex space-x-8 px-6">
                            {[
                                { id: 'drivers', label: 'Drivers', count: drivers.length },
                                { id: 'deliveries', label: 'Unassigned Deliveries', count: deliveries.length }
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`flex items-center space-x-2 px-4 py-4 text-sm font-medium border-b-2 transition-all duration-200 ${activeTab === tab.id
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    <span>{tab.label}</span>
                                    <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                                        {tab.count}
                                    </span>
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Search and Filter */}
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1 relative">
                                <SearchIcon size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder={`Search ${activeTab}...`}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            {activeTab === 'drivers' && (
                                <div className="relative">
                                    <FilterIcon size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        className="pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="all">All Status</option>
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                        <option value="suspended">Suspended</option>
                                    </select>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Drivers Tab */}
                    {activeTab === 'drivers' && (
                        <div className="p-6">
                            {filteredDrivers.length === 0 ? (
                                <div className="text-center py-12">
                                    <TruckIcon size={48} className="mx-auto text-gray-400 mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Drivers Found</h3>
                                    <p className="text-gray-600">
                                        {searchTerm ? 'No drivers match your search criteria.' : 'Start by adding your first driver.'}
                                    </p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {filteredDrivers.map((driver) => (
                                        <motion.div
                                            key={driver.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="bg-gray-50 rounded-lg p-6 border border-gray-200 hover:shadow-md transition-shadow"
                                        >
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                                                        {driver.fullName.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold text-gray-900">{driver.fullName}</h3>
                                                        <p className="text-sm text-gray-600">License: {driver.licenseNumber}</p>
                                                    </div>
                                                </div>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${driver.status === 'active' ? 'bg-green-100 text-green-700' :
                                                    driver.status === 'inactive' ? 'bg-gray-100 text-gray-700' :
                                                        'bg-red-100 text-red-700'
                                                    }`}>
                                                    {driver.status}
                                                </span>
                                            </div>

                                            <div className="space-y-2 text-sm">
                                                <div className="flex items-center space-x-2">
                                                    <MailIcon size={16} className="text-gray-400" />
                                                    <span className="text-gray-700">{driver.email}</span>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <PhoneIcon size={16} className="text-gray-400" />
                                                    <span className="text-gray-700">{driver.phone}</span>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <TruckIcon size={16} className="text-gray-400" />
                                                    <span className="text-gray-700">
                                                        {driver.vehicleInfo.type} - {driver.vehicleInfo.plateNumber}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="mt-4 pt-4 border-t border-gray-200">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-600">Deliveries:</span>
                                                    <span className="font-medium">{driver.totalDeliveries}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-600">Rating:</span>
                                                    <span className="font-medium">⭐ {driver.rating}/5</span>
                                                </div>
                                            </div>

                                            <div className="mt-4 flex space-x-2">
                                                <button className="flex-1 bg-blue-500 text-white px-3 py-2 rounded text-sm hover:bg-blue-600 transition-colors">
                                                    <EditIcon size={16} className="inline mr-1" />
                                                    Edit
                                                </button>
                                                <button className="px-3 py-2 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200 transition-colors">
                                                    <TrashIcon size={16} />
                                                </button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Deliveries Tab */}
                    {activeTab === 'deliveries' && (
                        <div className="p-6">
                            {filteredDeliveries.length === 0 ? (
                                <div className="text-center py-12">
                                    <CheckCircleIcon size={48} className="mx-auto text-green-400 mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">All Deliveries Assigned</h3>
                                    <p className="text-gray-600">No unassigned deliveries at the moment.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {filteredDeliveries.map((delivery) => (
                                        <motion.div
                                            key={delivery.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="bg-gray-50 rounded-lg p-6 border border-gray-200"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-3 mb-2">
                                                        <h3 className="font-semibold text-gray-900">
                                                            Delivery #{delivery.id.slice(-6)}
                                                        </h3>
                                                        <span className="text-sm text-gray-600">
                                                            Order #{delivery.orderId.slice(-6)}
                                                        </span>
                                                        {delivery.priority === 'urgent' && (
                                                            <span className="bg-red-100 text-red-700 text-xs font-medium px-2 py-1 rounded-full">
                                                                URGENT
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-gray-700 mb-1">
                                                        <strong>Customer:</strong> {delivery.customerName}
                                                    </p>
                                                    <p className="text-gray-700">
                                                        <strong>Address:</strong> {delivery.deliveryAddress}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        setSelectedDelivery(delivery);
                                                        setShowAssignModal(true);
                                                    }}
                                                    className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                                                >
                                                    Assign Driver
                                                </button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Assignment Modal */}
                {showAssignModal && selectedDelivery && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white rounded-lg p-6 max-w-md w-full"
                        >
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                Assign Driver to Delivery #{selectedDelivery.id.slice(-6)}
                            </h3>

                            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                                <p><strong>Customer:</strong> {selectedDelivery.customerName}</p>
                                <p><strong>Address:</strong> {selectedDelivery.deliveryAddress}</p>
                            </div>

                            <div className="space-y-2 mb-6">
                                {drivers.filter(d => d.status === 'active').map((driver) => (
                                    <button
                                        key={driver.id}
                                        onClick={() => assignDelivery(selectedDelivery.id, driver.id)}
                                        className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors"
                                    >
                                        <div className="font-medium">{driver.fullName}</div>
                                        <div className="text-sm text-gray-600">
                                            {driver.vehicleInfo.type} - {driver.vehicleInfo.plateNumber}
                                        </div>
                                    </button>
                                ))}
                            </div>

                            <div className="flex space-x-3">
                                <button
                                    onClick={() => setShowAssignModal(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}

                {/* Add Driver Modal */}
                {showAddDriverModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white rounded-lg p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto"
                        >
                            <h3 className="text-lg font-semibold text-gray-900 mb-6">
                                Add New Driver
                            </h3>

                            <AddDriverForm
                                onSubmit={addDriver}
                                onCancel={() => setShowAddDriverModal(false)}
                                loading={addDriverLoading}
                            />
                        </motion.div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DriverManagement;

