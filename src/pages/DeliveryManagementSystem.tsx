import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    TruckIcon, MapPinIcon, ClockIcon, PackageIcon,
    CalendarIcon, UserIcon, CheckCircleIcon, XCircleIcon,
    SearchIcon, PlusIcon, EditIcon, EyeIcon, NavigationIcon,
    StarIcon, InfoIcon, Users, Building, Settings
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useNotification } from '../contexts/NotificationContext';

// Types for delivery management
interface DeliveryItem {
    inventoryId: string;
    itemName: string;
    category: string;
    quantity: number;
    warehouse: string;
    unit: string;
}

interface DeliveryAddress {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    additionalInfo?: string;
    coordinates?: {
        latitude: number;
        longitude: number;
    };
}

interface StatusHistory {
    status: string;
    timestamp: string;
    updatedBy: string;
    notes: string;
    location?: {
        latitude: number;
        longitude: number;
    };
}

interface Delivery {
    id: string;
    trackingNumber: string;
    orderId: string;
    orderNumber?: string;
    warehouseName: string;
    warehouseId: string;
    items: DeliveryItem[];
    deliveryDate: string;
    timeSlot: string;
    status: 'scheduled' | 'assigned' | 'out_from_warehouse' | 'on_the_way' | 'delivered' | 'failed' | 'cancelled';
    priority: 'normal' | 'urgent' | 'critical';
    deliveryAddress: DeliveryAddress;
    customerName: string;
    customerEmail: string;
    contactNumber: string;
    alternateContact?: string;
    specialInstructions?: string;
    statusHistory: StatusHistory[];
    assignedDriver?: {
        id: string;
        name: string;
        phone: string;
        email: string;
        vehicleInfo: {
            type: string;
            plateNumber: string;
            capacity: string;
        };
        rating: number;
    };
    estimatedDeliveryTime?: {
        start: string;
        end: string;
    };
    actualDeliveryTime?: string;
    deliveryProof?: string;
    signature?: string;
    driverNotes?: string;
    customerNotes?: string;
    adminNotes?: string;
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    updatedBy: string;
}

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
    status: 'active' | 'inactive' | 'suspended' | 'busy';
    currentLocation?: {
        latitude: number;
        longitude: number;
    };
    totalDeliveries: number;
    successfulDeliveries: number;
    rating: number;
    isAvailable: boolean;
    currentDeliveries: number;
    maxDeliveries: number;
}

interface FilterOptions {
    status: string;
    priority: string;
    warehouse: string;
    driver: string;
    dateRange: {
        start: string;
        end: string;
    };
    search: string;
}

const DeliveryManagementSystem: React.FC<{ userRole: string }> = ({ userRole }) => {
    const { user } = useAuth();
    const { showSuccess, showError } = useNotification();

    // State management
    const [deliveries, setDeliveries] = useState<Delivery[]>([]);
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
    const [viewMode, setViewMode] = useState<'list' | 'grid' | 'map'>('list');
    const [activeTab, setActiveTab] = useState<'all' | 'assigned' | 'in-progress' | 'completed' | 'failed'>('all');
    const [showDetails, setShowDetails] = useState(false);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [filters, setFilters] = useState<FilterOptions>({
        status: 'all',
        priority: 'all',
        warehouse: 'all',
        driver: 'all',
        dateRange: {
            start: '',
            end: ''
        },
        search: ''
    });

    // Sort and pagination
    const [sortBy, setSortBy] = useState<'date' | 'status' | 'priority' | 'customer'>('date');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Form states for different actions
    const [statusUpdateForm, setStatusUpdateForm] = useState({
        status: '',
        notes: '',
        location: null as { latitude: number; longitude: number } | null
    });

    // Load data based on user role
    useEffect(() => {
        loadDeliveries();
        if (['admin', 'warehouse', 'cashier'].includes(userRole)) {
            loadDrivers();
        }
    }, [userRole, filters]);

    // API calls
    const loadDeliveries = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('accessToken');

            let endpoint = '/api/delivery-management/deliveries';

            // All role-based filtering is handled by the backend based on the user's token

            const queryParams = new URLSearchParams();

            // Add filters as query parameters
            if (filters.status !== 'all') queryParams.append('status', filters.status);
            if (filters.priority !== 'all') queryParams.append('priority', filters.priority);
            if (filters.warehouse !== 'all') queryParams.append('warehouse', filters.warehouse);
            if (filters.driver !== 'all') queryParams.append('driver', filters.driver);
            if (filters.dateRange.start) queryParams.append('startDate', filters.dateRange.start);
            if (filters.dateRange.end) queryParams.append('endDate', filters.dateRange.end);
            if (filters.search) queryParams.append('search', filters.search);

            const fullEndpoint = `${endpoint}?${queryParams.toString()}`;

            const response = await fetch(`http://localhost:5001${fullEndpoint}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                setDeliveries(data.deliveries || []);
            }
        } catch (error) {
            console.error('Error loading deliveries:', error);
            showError('Error Loading', 'Failed to load deliveries');
        } finally {
            setLoading(false);
        }
    };

    const loadDrivers = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch('http://localhost:5001/api/delivery-management/drivers?available=true', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                setDrivers(data.drivers || []);
            }
        } catch (error) {
            console.error('Error loading drivers:', error);
        }
    };

    // Status management functions
    const updateDeliveryStatus = async (deliveryId: string, newStatus: string, notes: string = '', location?: any) => {
        try {
            const token = localStorage.getItem('accessToken');
            let endpoint = '';

            endpoint = `/api/delivery-management/deliveries/${deliveryId}/status`;

            const response = await fetch(`http://localhost:5001${endpoint}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    status: newStatus,
                    notes,
                    location,
                    timestamp: new Date().toISOString()
                })
            });

            if (response.ok) {
                showSuccess('Status Updated', 'Delivery status updated successfully');
                loadDeliveries();
                setShowStatusModal(false);
                setStatusUpdateForm({ status: '', notes: '', location: null });
            } else {
                throw new Error('Failed to update status');
            }
        } catch (error) {
            console.error('Error updating delivery status:', error);
            showError('Update Failed', 'Failed to update delivery status');
        }
    };

    const assignDeliveryToDriver = async (deliveryId: string, driverId: string) => {
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`http://localhost:5001/api/delivery-management/deliveries/${deliveryId}/assign`, {
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
                showSuccess('Driver Assigned', 'Delivery assigned to driver successfully');
                loadDeliveries();
                setShowAssignModal(false);
            } else {
                throw new Error('Failed to assign delivery');
            }
        } catch (error) {
            console.error('Error assigning delivery:', error);
            showError('Assignment Failed', 'Failed to assign delivery to driver');
        }
    };

    // Filter and sort functions
    const getFilteredDeliveries = () => {
        let filtered = deliveries;

        // Apply filters
        if (filters.status !== 'all') {
            filtered = filtered.filter(d => d.status === filters.status);
        }

        if (filters.priority !== 'all') {
            filtered = filtered.filter(d => d.priority === filters.priority);
        }

        if (filters.warehouse !== 'all') {
            filtered = filtered.filter(d => d.warehouseId === filters.warehouse);
        }

        if (filters.driver !== 'all') {
            filtered = filtered.filter(d => d.assignedDriver?.id === filters.driver);
        }

        if (filters.search) {
            filtered = filtered.filter(d =>
                d.trackingNumber.toLowerCase().includes(filters.search.toLowerCase()) ||
                d.customerName.toLowerCase().includes(filters.search.toLowerCase()) ||
                d.orderNumber?.toLowerCase().includes(filters.search.toLowerCase())
            );
        }

        if (filters.dateRange.start && filters.dateRange.end) {
            filtered = filtered.filter(d => {
                const deliveryDate = new Date(d.deliveryDate);
                const startDate = new Date(filters.dateRange.start);
                const endDate = new Date(filters.dateRange.end);
                return deliveryDate >= startDate && deliveryDate <= endDate;
            });
        }

        // Apply tab filter
        switch (activeTab) {
            case 'assigned':
                filtered = filtered.filter(d => d.status === 'assigned');
                break;
            case 'in-progress':
                filtered = filtered.filter(d => ['out_from_warehouse', 'on_the_way'].includes(d.status));
                break;
            case 'completed':
                filtered = filtered.filter(d => d.status === 'delivered');
                break;
            case 'failed':
                filtered = filtered.filter(d => ['failed', 'cancelled'].includes(d.status));
                break;
        }

        // Sort deliveries
        filtered.sort((a, b) => {
            let aValue, bValue;

            switch (sortBy) {
                case 'date':
                    aValue = new Date(a.deliveryDate).getTime();
                    bValue = new Date(b.deliveryDate).getTime();
                    break;
                case 'status':
                    aValue = a.status;
                    bValue = b.status;
                    break;
                case 'priority':
                    const priorityOrder = { 'critical': 3, 'urgent': 2, 'normal': 1 };
                    aValue = priorityOrder[a.priority as keyof typeof priorityOrder];
                    bValue = priorityOrder[b.priority as keyof typeof priorityOrder];
                    break;
                case 'customer':
                    aValue = a.customerName.toLowerCase();
                    bValue = b.customerName.toLowerCase();
                    break;
                default:
                    return 0;
            }

            if (sortOrder === 'asc') {
                return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
            } else {
                return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
            }
        });

        return filtered;
    };

    // Utility functions
    const getStatusColor = (status: string) => {
        const colors = {
            'scheduled': 'bg-gray-100 text-gray-800',
            'assigned': 'bg-blue-100 text-blue-800',
            'out_from_warehouse': 'bg-yellow-100 text-yellow-800',
            'on_the_way': 'bg-orange-100 text-orange-800',
            'delivered': 'bg-green-100 text-green-800',
            'failed': 'bg-red-100 text-red-800',
            'cancelled': 'bg-gray-100 text-gray-800'
        };
        return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
    };

    const getPriorityColor = (priority: string) => {
        const colors = {
            'normal': 'bg-green-100 text-green-800',
            'urgent': 'bg-yellow-100 text-yellow-800',
            'critical': 'bg-red-100 text-red-800'
        };
        return colors[priority as keyof typeof colors] || 'bg-gray-100 text-gray-800';
    };

    const getStatusIcon = (status: string) => {
        const icons = {
            'scheduled': <CalendarIcon className="w-4 h-4" />,
            'assigned': <UserIcon className="w-4 h-4" />,
            'out_from_warehouse': <TruckIcon className="w-4 h-4" />,
            'on_the_way': <NavigationIcon className="w-4 h-4" />,
            'delivered': <CheckCircleIcon className="w-4 h-4" />,
            'failed': <XCircleIcon className="w-4 h-4" />,
            'cancelled': <XCircleIcon className="w-4 h-4" />
        };
        return icons[status as keyof typeof icons] || <InfoIcon className="w-4 h-4" />;
    };

    // Role-based action permissions
    const canAssignDriver = () => ['admin', 'warehouse', 'cashier'].includes(userRole);
    const canUpdateStatus = () => ['admin', 'warehouse', 'cashier', 'driver'].includes(userRole);

    const canCreateDelivery = () => ['admin', 'warehouse', 'cashier'].includes(userRole);

    // Get available status transitions based on current status and role
    const getAvailableStatusTransitions = (currentStatus: string) => {
        const transitions = {
            'scheduled': ['assigned', 'cancelled'],
            'assigned': ['out_from_warehouse', 'cancelled'],
            'out_from_warehouse': ['on_the_way', 'failed'],
            'on_the_way': ['delivered', 'failed'],
            'delivered': [],
            'failed': ['scheduled'],
            'cancelled': ['scheduled']
        };

        let available = transitions[currentStatus as keyof typeof transitions] || [];

        // Filter based on user role
        if (userRole === 'driver') {
            // Drivers can only progress forward in the delivery process
            available = available.filter(status =>
                ['out_from_warehouse', 'on_the_way', 'delivered', 'failed'].includes(status)
            );
        } else if (userRole === 'customer') {
            // Customers cannot change status
            available = [];
        }

        return available;
    };

    // Pagination
    const filteredDeliveries = getFilteredDeliveries();
    const totalPages = Math.ceil(filteredDeliveries.length / itemsPerPage);
    const paginatedDeliveries = filteredDeliveries.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const renderRoleBasedHeader = () => {
        const roleHeaders = {
            admin: {
                title: "🏢 Admin Delivery Management",
                subtitle: "Comprehensive delivery oversight and management",
                icon: <Settings className="w-8 h-8" />
            },
            warehouse: {
                title: "🏭 Warehouse Delivery Management",
                subtitle: "Manage outbound deliveries and driver assignments",
                icon: <Building className="w-8 h-8" />
            },
            cashier: {
                title: "💰 Cashier Delivery Management",
                subtitle: "Process and track customer deliveries",
                icon: <Users className="w-8 h-8" />
            },
            driver: {
                title: "🚛 Driver Portal",
                subtitle: "Your delivery assignments and route management",
                icon: <TruckIcon className="w-8 h-8" />
            },
            customer: {
                title: "📦 My Deliveries",
                subtitle: "Track your orders and delivery status",
                icon: <PackageIcon className="w-8 h-8" />
            }
        };

        const header = roleHeaders[userRole as keyof typeof roleHeaders] || roleHeaders.customer;

        return (
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-4">
                    <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
                        {header.icon}
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            {header.title}
                        </h1>
                        <p className="text-gray-600 dark:text-gray-300 mt-1">
                            {header.subtitle}
                        </p>
                    </div>
                </div>

                {canCreateDelivery() && (
                    <button
                        onClick={() => {/* Handle create delivery */ }}
                        className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <PlusIcon className="w-5 h-5" />
                        <span>Create Delivery</span>
                    </button>
                )}
            </div>
        );
    };

    const renderFiltersAndTabs = () => (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
            {/* Tabs */}
            <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1 mb-6">
                {[
                    { key: 'all', label: 'All Deliveries', count: deliveries.length },
                    { key: 'assigned', label: 'Assigned', count: deliveries.filter(d => d.status === 'assigned').length },
                    { key: 'in-progress', label: 'In Progress', count: deliveries.filter(d => ['out_from_warehouse', 'on_the_way'].includes(d.status)).length },
                    { key: 'completed', label: 'Completed', count: deliveries.filter(d => d.status === 'delivered').length },
                    { key: 'failed', label: 'Issues', count: deliveries.filter(d => ['failed', 'cancelled'].includes(d.status)).length }
                ].map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key as any)}
                        className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.key
                                ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                                : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
                            }`}
                    >
                        {tab.label}
                        {tab.count > 0 && (
                            <span className="ml-2 px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 text-xs rounded-full">
                                {tab.count}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-4">
                {/* Search */}
                <div className="lg:col-span-2">
                    <div className="relative">
                        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search deliveries..."
                            value={filters.search}
                            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        />
                    </div>
                </div>

                {/* Status Filter */}
                <select
                    value={filters.status}
                    onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                    <option value="all">All Status</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="assigned">Assigned</option>
                    <option value="out_from_warehouse">Out from Warehouse</option>
                    <option value="on_the_way">On the Way</option>
                    <option value="delivered">Delivered</option>
                    <option value="failed">Failed</option>
                    <option value="cancelled">Cancelled</option>
                </select>

                {/* Priority Filter */}
                <select
                    value={filters.priority}
                    onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                    <option value="all">All Priority</option>
                    <option value="normal">Normal</option>
                    <option value="urgent">Urgent</option>
                    <option value="critical">Critical</option>
                </select>

                {/* Date Range */}
                <input
                    type="date"
                    value={filters.dateRange.start}
                    onChange={(e) => setFilters(prev => ({
                        ...prev,
                        dateRange: { ...prev.dateRange, start: e.target.value }
                    }))}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />

                <input
                    type="date"
                    value={filters.dateRange.end}
                    onChange={(e) => setFilters(prev => ({
                        ...prev,
                        dateRange: { ...prev.dateRange, end: e.target.value }
                    }))}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
            </div>

            {/* Sort and View Options */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                        <option value="date">Sort by Date</option>
                        <option value="status">Sort by Status</option>
                        <option value="priority">Sort by Priority</option>
                        <option value="customer">Sort by Customer</option>
                    </select>

                    <button
                        onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                        className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                        {sortOrder === 'asc' ? '↑' : '↓'}
                    </button>
                </div>

                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => setViewMode('list')}
                        className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                    >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                        </svg>
                    </button>
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                    >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M3 3a1 1 0 000 2h.75v1.5a.75.75 0 001.5 0V5h.75a1 1 0 000-2H3zM3 9a1 1 0 000 2h.75v1.5a.75.75 0 001.5 0V11H6a1 1 0 000-2H3zM3 15a1 1 0 000 2h.75v1.5a.75.75 0 001.5 0V17H6a1 1 0 000-2H3z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );

    const renderDeliveryCard = (delivery: Delivery) => (
        <motion.div
            key={delivery.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-shadow border border-gray-200 dark:border-gray-700"
        >
            {/* Card Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <TruckIcon className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {delivery.trackingNumber}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Order: {delivery.orderNumber || 'N/A'}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(delivery.priority)}`}>
                            {delivery.priority.toUpperCase()}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(delivery.status)}`}>
                            {getStatusIcon(delivery.status)}
                            <span>{delivery.status.replace('_', ' ').toUpperCase()}</span>
                        </span>
                    </div>
                </div>

                {/* Customer and Address */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center space-x-2">
                        <UserIcon className="w-5 h-5 text-gray-400" />
                        <div>
                            <p className="font-medium text-gray-900 dark:text-white">{delivery.customerName}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{delivery.customerEmail}</p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <MapPinIcon className="w-5 h-5 text-gray-400" />
                        <div>
                            <p className="text-sm text-gray-900 dark:text-white">{delivery.deliveryAddress.street}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {delivery.deliveryAddress.city}, {delivery.deliveryAddress.state}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Delivery Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center space-x-2">
                        <CalendarIcon className="w-5 h-5 text-gray-400" />
                        <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">Delivery Date</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {new Date(delivery.deliveryDate).toLocaleDateString()}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <ClockIcon className="w-5 h-5 text-gray-400" />
                        <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">Time Slot</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{delivery.timeSlot}</p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <PackageIcon className="w-5 h-5 text-gray-400" />
                        <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">Items</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {delivery.items.length} item(s)
                            </p>
                        </div>
                    </div>
                </div>

                {/* Assigned Driver */}
                {delivery.assignedDriver && (
                    <div className="flex items-center space-x-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg mb-4">
                        <UserIcon className="w-5 h-5 text-gray-400" />
                        <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                Driver: {delivery.assignedDriver.name}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {delivery.assignedDriver.phone} • {delivery.assignedDriver.vehicleInfo.plateNumber}
                            </p>
                        </div>
                        <div className="ml-auto flex items-center space-x-1">
                            <StarIcon className="w-4 h-4 text-yellow-500" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                {delivery.assignedDriver.rating}
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {/* Card Actions */}
            <div className="p-6">
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => {
                            setSelectedDelivery(delivery);
                            setShowDetails(true);
                        }}
                        className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
                    >
                        <EyeIcon className="w-4 h-4" />
                        <span>View Details</span>
                    </button>

                    <div className="flex items-center space-x-2">
                        {canUpdateStatus() && getAvailableStatusTransitions(delivery.status).length > 0 && (
                            <button
                                onClick={() => {
                                    setSelectedDelivery(delivery);
                                    setShowStatusModal(true);
                                }}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                            >
                                Update Status
                            </button>
                        )}

                        {canAssignDriver() && !delivery.assignedDriver && delivery.status === 'scheduled' && (
                            <button
                                onClick={() => {
                                    setSelectedDelivery(delivery);
                                    setShowAssignModal(true);
                                }}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Assign Driver
                            </button>
                        )}

                        {userRole === 'driver' && delivery.assignedDriver?.id === user?.id && (
                            <div className="flex space-x-2">
                                {getAvailableStatusTransitions(delivery.status).map(status => (
                                    <button
                                        key={status}
                                        onClick={() => updateDeliveryStatus(delivery.id, status)}
                                        className={`px-3 py-2 text-sm rounded-lg text-white ${status === 'delivered' ? 'bg-green-600 hover:bg-green-700' :
                                                status === 'failed' ? 'bg-red-600 hover:bg-red-700' :
                                                    'bg-blue-600 hover:bg-blue-700'
                                            }`}
                                    >
                                        {status.replace('_', ' ').toUpperCase()}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );

    const renderDeliveryList = () => (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Delivery Details
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Customer
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Delivery Info
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Driver
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {paginatedDeliveries.map((delivery) => (
                            <tr key={delivery.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div>
                                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                                            {delivery.trackingNumber}
                                        </div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                            Order: {delivery.orderNumber || 'N/A'}
                                        </div>
                                    </div>
                                </td>

                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div>
                                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                                            {delivery.customerName}
                                        </div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                            {delivery.customerEmail}
                                        </div>
                                    </div>
                                </td>

                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div>
                                        <div className="text-sm text-gray-900 dark:text-white">
                                            {new Date(delivery.deliveryDate).toLocaleDateString()}
                                        </div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                            {delivery.timeSlot}
                                        </div>
                                    </div>
                                </td>

                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center space-x-2">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(delivery.status)}`}>
                                            {getStatusIcon(delivery.status)}
                                            <span className="ml-1">{delivery.status.replace('_', ' ').toUpperCase()}</span>
                                        </span>
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(delivery.priority)}`}>
                                            {delivery.priority.toUpperCase()}
                                        </span>
                                    </div>
                                </td>

                                <td className="px-6 py-4 whitespace-nowrap">
                                    {delivery.assignedDriver ? (
                                        <div>
                                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                {delivery.assignedDriver.name}
                                            </div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                                {delivery.assignedDriver.phone}
                                            </div>
                                        </div>
                                    ) : (
                                        <span className="text-sm text-gray-500 dark:text-gray-400">
                                            Not assigned
                                        </span>
                                    )}
                                </td>

                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => {
                                                setSelectedDelivery(delivery);
                                                setShowDetails(true);
                                            }}
                                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                                        >
                                            <EyeIcon className="w-4 h-4" />
                                        </button>

                                        {canUpdateStatus() && getAvailableStatusTransitions(delivery.status).length > 0 && (
                                            <button
                                                onClick={() => {
                                                    setSelectedDelivery(delivery);
                                                    setShowStatusModal(true);
                                                }}
                                                className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                                            >
                                                <EditIcon className="w-4 h-4" />
                                            </button>
                                        )}

                                        {canAssignDriver() && !delivery.assignedDriver && delivery.status === 'scheduled' && (
                                            <button
                                                onClick={() => {
                                                    setSelectedDelivery(delivery);
                                                    setShowAssignModal(true);
                                                }}
                                                className="text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300"
                                            >
                                                <UserIcon className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderPagination = () => (
        <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-700 dark:text-gray-300">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredDeliveries.length)} of {filteredDeliveries.length} deliveries
            </div>

            <div className="flex items-center space-x-2">
                <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Previous
                </button>

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = i + 1;
                    const isActive = page === currentPage;

                    return (
                        <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`px-3 py-2 text-sm rounded-lg ${isActive
                                    ? 'bg-blue-600 text-white'
                                    : 'border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                                }`}
                        >
                            {page}
                        </button>
                    );
                })}

                <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Next
                </button>
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
            <div className="max-w-7xl mx-auto">
                {renderRoleBasedHeader()}
                {renderFiltersAndTabs()}

                {/* Main Content */}
                <div className="space-y-6">
                    {viewMode === 'list' ? (
                        renderDeliveryList()
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                            {paginatedDeliveries.map(renderDeliveryCard)}
                        </div>
                    )}

                    {filteredDeliveries.length === 0 && (
                        <div className="text-center py-12">
                            <PackageIcon className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                                No deliveries found
                            </h3>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                Try adjusting your filters or create a new delivery.
                            </p>
                        </div>
                    )}

                    {filteredDeliveries.length > 0 && renderPagination()}
                </div>

                {/* Status Update Modal */}
                {showStatusModal && selectedDelivery && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full"
                        >
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                Update Delivery Status
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        New Status
                                    </label>
                                    <select
                                        value={statusUpdateForm.status}
                                        onChange={(e) => setStatusUpdateForm(prev => ({ ...prev, status: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                    >
                                        <option value="">Select Status</option>
                                        {getAvailableStatusTransitions(selectedDelivery.status).map(status => (
                                            <option key={status} value={status}>
                                                {status.replace('_', ' ').toUpperCase()}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Notes (Optional)
                                    </label>
                                    <textarea
                                        value={statusUpdateForm.notes}
                                        onChange={(e) => setStatusUpdateForm(prev => ({ ...prev, notes: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                        rows={3}
                                        placeholder="Add any notes about this status update..."
                                    />
                                </div>
                            </div>

                            <div className="flex space-x-3 mt-6">
                                <button
                                    onClick={() => setShowStatusModal(false)}
                                    className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        if (statusUpdateForm.status) {
                                            updateDeliveryStatus(
                                                selectedDelivery.id,
                                                statusUpdateForm.status,
                                                statusUpdateForm.notes,
                                                statusUpdateForm.location
                                            );
                                        }
                                    }}
                                    disabled={!statusUpdateForm.status}
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Update Status
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}

                {/* Assign Driver Modal */}
                {showAssignModal && selectedDelivery && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full"
                        >
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                Assign Driver to Delivery #{selectedDelivery.trackingNumber}
                            </h3>

                            <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                <p><strong>Customer:</strong> {selectedDelivery.customerName}</p>
                                <p><strong>Address:</strong> {selectedDelivery.deliveryAddress.street}</p>
                            </div>

                            <div className="space-y-2 mb-6">
                                {drivers?.filter(d => d.status === 'active' && d.isAvailable).map((driver) => (
                                    <button
                                        key={driver.id}
                                        onClick={() => assignDeliveryToDriver(selectedDelivery.id, driver.id)}
                                        className="w-full text-left p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900 hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
                                    >
                                        <div className="font-medium text-gray-900 dark:text-white">{driver.fullName}</div>
                                        <div className="text-sm text-gray-600 dark:text-gray-400">
                                            {driver.vehicleInfo.type} - {driver.vehicleInfo.plateNumber} | Rating: {driver.rating}⭐
                                        </div>
                                        <div className="text-sm text-gray-600 dark:text-gray-400">
                                            Current deliveries: {driver.currentDeliveries}/{driver.maxDeliveries}
                                        </div>
                                    </button>
                                ))}
                            </div>

                            <div className="flex space-x-3">
                                <button
                                    onClick={() => setShowAssignModal(false)}
                                    className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                                >
                                    Cancel
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}

                {/* Delivery Details Modal */}
                {showDetails && selectedDelivery && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-screen overflow-y-auto"
                        >
                            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                        Delivery Details - {selectedDelivery.trackingNumber}
                                    </h2>
                                    <button
                                        onClick={() => setShowDetails(false)}
                                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                    >
                                        <XCircleIcon className="w-6 h-6" />
                                    </button>
                                </div>
                            </div>

                            <div className="p-6 space-y-6">
                                {/* Status and Priority */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Status</h3>
                                        <div className="flex items-center space-x-2">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedDelivery.status)}`}>
                                                {getStatusIcon(selectedDelivery.status)}
                                                <span className="ml-1">{selectedDelivery.status.replace('_', ' ').toUpperCase()}</span>
                                            </span>
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(selectedDelivery.priority)}`}>
                                                {selectedDelivery.priority.toUpperCase()}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Customer Information */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Customer Information</h3>
                                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Name</p>
                                                <p className="text-gray-900 dark:text-white">{selectedDelivery.customerName}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Email</p>
                                                <p className="text-gray-900 dark:text-white">{selectedDelivery.customerEmail}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Contact Number</p>
                                                <p className="text-gray-900 dark:text-white">{selectedDelivery.contactNumber}</p>
                                            </div>
                                            {selectedDelivery.alternateContact && (
                                                <div>
                                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Alternate Contact</p>
                                                    <p className="text-gray-900 dark:text-white">{selectedDelivery.alternateContact}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Delivery Address */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Delivery Address</h3>
                                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                                        <p className="text-gray-900 dark:text-white">{selectedDelivery.deliveryAddress.street}</p>
                                        <p className="text-gray-900 dark:text-white">
                                            {selectedDelivery.deliveryAddress.city}, {selectedDelivery.deliveryAddress.state} {selectedDelivery.deliveryAddress.zipCode}
                                        </p>
                                        <p className="text-gray-900 dark:text-white">{selectedDelivery.deliveryAddress.country}</p>
                                        {selectedDelivery.deliveryAddress.additionalInfo && (
                                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                                {selectedDelivery.deliveryAddress.additionalInfo}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Items */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Items</h3>
                                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                                        <div className="space-y-2">
                                            {selectedDelivery.items.map((item, index) => (
                                                <div key={index} className="flex justify-between items-center border-b border-gray-200 dark:border-gray-600 pb-2">
                                                    <div>
                                                        <p className="font-medium text-gray-900 dark:text-white">{item.itemName}</p>
                                                        <p className="text-sm text-gray-600 dark:text-gray-300">{item.category} • {item.warehouse}</p>
                                                    </div>
                                                    <p className="text-gray-900 dark:text-white">{item.quantity} {item.unit}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Status History */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Status History</h3>
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
                                                    <p className="text-sm text-gray-900 dark:text-white">
                                                        {new Date(history.timestamp).toLocaleString()}
                                                    </p>
                                                    <p className="text-xs text-gray-600 dark:text-gray-300">
                                                        by {history.updatedBy}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Special Instructions */}
                                {selectedDelivery.specialInstructions && (
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Special Instructions</h3>
                                        <div className="bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 p-4 rounded-lg">
                                            <p className="text-gray-900 dark:text-white">{selectedDelivery.specialInstructions}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DeliveryManagementSystem;
