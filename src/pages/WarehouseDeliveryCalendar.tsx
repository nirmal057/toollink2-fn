import React, { useState, useEffect } from 'react';
import {
    Calendar,
    ChevronLeft,
    ChevronRight,
    Package,
    Clock,
    MapPin,
    Truck,
    User,
    Phone,
    Filter,
    CheckCircle,
    AlertTriangle,
    XCircle
} from 'lucide-react';
import { useNotification } from '../contexts/NotificationContext';

interface CalendarDelivery {
    _id: string;
    trackingNumber: string;
    warehouseName: string;
    deliveryDate: string;
    timeSlot: string;
    status: string;
    customerEmail: string;
    customerName: string;
    customerPhone?: string;
    deliveryAddress: {
        street: string;
        city: string;
        state: string;
        zipCode: string;
        phone?: string;
    };
    subOrderId: {
        _id: string;
        subOrderNumber: string;
        materialCategory: string;
        totalAmount: number;
        items: Array<{
            materialName: string;
            qty: number;
            unitPrice: number;
        }>;
    };
    driverId: {
        _id: string;
        name: string;
        phone: string;
        vehicleNumber: string;
        vehicleType?: string;
    };
    estimatedDuration: number;
    priority: string;
    notes?: string;
    specialInstructions?: string;
    createdAt: string;
}

interface CalendarData {
    [date: string]: CalendarDelivery[];
}

const WarehouseDeliveryCalendar: React.FC = () => {
    const { showError } = useNotification();

    const [currentDate, setCurrentDate] = useState(new Date());
    const [calendarData, setCalendarData] = useState<CalendarData>({});
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [selectedDelivery, setSelectedDelivery] = useState<CalendarDelivery | null>(null);
    const [showDeliveryDetails, setShowDeliveryDetails] = useState(false);

    // Filter states
    const [filter, setFilter] = useState({
        status: '',
        priority: '',
        materialCategory: ''
    });

    useEffect(() => {
        fetchCalendarData();
    }, [currentDate, filter]);

    const fetchCalendarData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('accessToken') || localStorage.getItem('token');

            const params = new URLSearchParams({
                month: currentDate.getMonth().toString(),
                year: currentDate.getFullYear().toString()
            });

            if (filter.status) params.append('status', filter.status);
            if (filter.priority) params.append('priority', filter.priority);
            if (filter.materialCategory) params.append('materialCategory', filter.materialCategory);

            const response = await fetch(`http://localhost:5001/api/delivery/warehouse/calendar?${params.toString()}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setCalendarData(data.calendarData || {});
                } else {
                    showError('Error', 'Failed to load calendar data');
                }
            } else {
                showError('Error', 'Failed to fetch calendar data');
            }
        } catch (error) {
            console.error('Error fetching calendar data:', error);
            showError('Error', 'Failed to load calendar data');
        } finally {
            setLoading(false);
        }
    };

    const getDaysInMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'assigned':
                return 'bg-blue-500';
            case 'in_progress':
            case 'picked_up':
                return 'bg-yellow-500';
            case 'in_transit':
                return 'bg-orange-500';
            case 'delivered':
                return 'bg-green-500';
            case 'failed':
            case 'cancelled':
                return 'bg-red-500';
            default:
                return 'bg-gray-400';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority.toLowerCase()) {
            case 'urgent':
                return 'border-l-4 border-red-500';
            case 'high':
                return 'border-l-4 border-orange-500';
            case 'normal':
                return 'border-l-4 border-blue-500';
            case 'low':
                return 'border-l-4 border-gray-500';
            default:
                return 'border-l-4 border-gray-400';
        }
    };

    const navigateMonth = (direction: 'prev' | 'next') => {
        const newDate = new Date(currentDate);
        if (direction === 'prev') {
            newDate.setMonth(newDate.getMonth() - 1);
        } else {
            newDate.setMonth(newDate.getMonth() + 1);
        }
        setCurrentDate(newDate);
    };

    const formatDateKey = (day: number) => {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        return date.toISOString().split('T')[0];
    };

    const formatTime = (timeSlot: string) => {
        if (!timeSlot) return '';
        try {
            const time = new Date(`1970-01-01T${timeSlot}`);
            return time.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            });
        } catch {
            return timeSlot;
        }
    };

    const getTodayDeliveries = () => {
        const today = new Date().toISOString().split('T')[0];
        return calendarData[today] || [];
    };

    const getUpcomingDeliveries = () => {
        const today = new Date();
        const upcoming: CalendarDelivery[] = [];

        Object.entries(calendarData).forEach(([date, deliveries]) => {
            const deliveryDate = new Date(date);
            if (deliveryDate >= today) {
                upcoming.push(...deliveries);
            }
        });

        return upcoming.sort((a, b) => new Date(a.deliveryDate).getTime() - new Date(b.deliveryDate).getTime());
    };

    const viewDeliveryDetails = (delivery: CalendarDelivery) => {
        setSelectedDelivery(delivery);
        setShowDeliveryDetails(true);
    };

    const closeDeliveryDetails = () => {
        setShowDeliveryDetails(false);
        setSelectedDelivery(null);
    };

    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const renderCalendarDay = (day: number) => {
        const dateKey = formatDateKey(day);
        const deliveries = calendarData[dateKey] || [];
        const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();
        const isSelected = selectedDate === dateKey;

        return (
            <div
                key={day}
                className={`min-h-[120px] p-2 border border-gray-200 cursor-pointer transition-colors hover:bg-gray-50 ${isToday ? 'bg-blue-50 border-blue-300' : ''
                    } ${isSelected ? 'bg-blue-100 border-blue-400' : ''}`}
                onClick={() => setSelectedDate(selectedDate === dateKey ? null : dateKey)}
            >
                <div className={`font-medium mb-1 ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
                    {day}
                </div>
                <div className="space-y-1">
                    {deliveries.slice(0, 3).map((delivery, index) => (
                        <div
                            key={index}
                            className={`text-xs p-1 rounded cursor-pointer hover:opacity-80 ${getPriorityColor(delivery.priority)}`}
                            style={{ backgroundColor: `${getStatusColor(delivery.status)}20` }}
                            onClick={(e) => {
                                e.stopPropagation();
                                viewDeliveryDetails(delivery);
                            }}
                        >
                            <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span className="font-medium">{formatTime(delivery.timeSlot)}</span>
                            </div>
                            <div className="truncate">{delivery.subOrderId.subOrderNumber}</div>
                            <div className="truncate text-gray-600">{delivery.customerName}</div>
                        </div>
                    ))}
                    {deliveries.length > 3 && (
                        <div className="text-xs text-gray-500 font-medium">
                            +{deliveries.length - 3} more
                        </div>
                    )}
                </div>
            </div>
        );
    };

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
                        <h1 className="text-2xl font-bold text-gray-900">Delivery Calendar</h1>
                        <p className="text-gray-600">Manage and track warehouse deliveries</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-sm text-gray-600">
                            <span className="font-medium">Today:</span> {getTodayDeliveries().length} deliveries
                        </div>
                        <div className="text-sm text-gray-600">
                            <span className="font-medium">Upcoming:</span> {getUpcomingDeliveries().length} deliveries
                        </div>
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
                            <option value="assigned">Assigned</option>
                            <option value="in_progress">In Progress</option>
                            <option value="in_transit">In Transit</option>
                            <option value="delivered">Delivered</option>
                            <option value="failed">Failed</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                        <select
                            value={filter.priority}
                            onChange={(e) => setFilter({ ...filter, priority: e.target.value })}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">All Priorities</option>
                            <option value="urgent">Urgent</option>
                            <option value="high">High</option>
                            <option value="normal">Normal</option>
                            <option value="low">Low</option>
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
                            <option value="Tools & Equipment">Tools & Equipment</option>
                            <option value="Sand & Aggregates">Sand & Aggregates</option>
                            <option value="Blocks & Masonry">Blocks & Masonry</option>
                            <option value="Steel & Metal">Steel & Metal</option>
                        </select>
                    </div>

                    <div className="flex items-end">
                        <button
                            onClick={() => setFilter({ status: '', priority: '', materialCategory: '' })}
                            className="w-full px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 flex items-center justify-center gap-2"
                        >
                            <Filter className="h-4 w-4" />
                            Clear Filters
                        </button>
                    </div>
                </div>
            </div>

            {/* Calendar Navigation */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
                <div className="flex items-center justify-between p-4 border-b">
                    <button
                        onClick={() => navigateMonth('prev')}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </button>

                    <h2 className="text-xl font-semibold text-gray-900">
                        {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                    </h2>

                    <button
                        onClick={() => navigateMonth('next')}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ChevronRight className="h-5 w-5" />
                    </button>
                </div>

                {/* Calendar Grid */}
                <div className="p-4">
                    {/* Week headers */}
                    <div className="grid grid-cols-7 gap-px mb-2">
                        {weekDays.map((day) => (
                            <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Calendar days */}
                    <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden">
                        {/* Empty cells for days before month start */}
                        {Array.from({ length: getFirstDayOfMonth(currentDate) }).map((_, index) => (
                            <div key={`empty-${index}`} className="min-h-[120px] bg-gray-50"></div>
                        ))}

                        {/* Days of the month */}
                        {Array.from({ length: getDaysInMonth(currentDate) }).map((_, index) =>
                            renderCalendarDay(index + 1)
                        )}
                    </div>
                </div>
            </div>

            {/* Selected Date Details */}
            {selectedDate && calendarData[selectedDate] && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Deliveries for {new Date(selectedDate).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}
                    </h3>

                    <div className="space-y-3">
                        {calendarData[selectedDate].map((delivery) => (
                            <div
                                key={delivery._id}
                                className={`p-4 border rounded-lg cursor-pointer hover:shadow-md transition-shadow ${getPriorityColor(delivery.priority)}`}
                                onClick={() => viewDeliveryDetails(delivery)}
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h4 className="font-semibold text-gray-900">{delivery.subOrderId.subOrderNumber}</h4>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(delivery.status)}`}>
                                                {delivery.status.replace(/_/g, ' ').toUpperCase()}
                                            </span>
                                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                {delivery.priority.toUpperCase()}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                                            <div className="flex items-center gap-2">
                                                <Clock className="h-4 w-4" />
                                                <span>{formatTime(delivery.timeSlot)} ({delivery.estimatedDuration} mins)</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <User className="h-4 w-4" />
                                                <span>{delivery.customerName}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Truck className="h-4 w-4" />
                                                <span>{delivery.driverId.name} - {delivery.driverId.vehicleNumber}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Today's Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Today's Deliveries */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Deliveries</h3>
                    {getTodayDeliveries().length === 0 ? (
                        <div className="text-center py-8">
                            <Package className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                            <p className="text-gray-500">No deliveries scheduled for today</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {getTodayDeliveries().slice(0, 5).map((delivery) => (
                                <div
                                    key={delivery._id}
                                    className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                                    onClick={() => viewDeliveryDetails(delivery)}
                                >
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <div className="font-medium text-gray-900">{delivery.subOrderId.subOrderNumber}</div>
                                            <div className="text-sm text-gray-600">{delivery.customerName}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-medium">{formatTime(delivery.timeSlot)}</div>
                                            <div className={`text-xs px-2 py-1 rounded-full text-white ${getStatusColor(delivery.status)}`}>
                                                {delivery.status.replace(/_/g, ' ')}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {getTodayDeliveries().length > 5 && (
                                <div className="text-center text-sm text-gray-500">
                                    +{getTodayDeliveries().length - 5} more deliveries today
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Statistics */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistics</h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                            <div className="flex items-center gap-2">
                                <CheckCircle className="h-5 w-5 text-blue-500" />
                                <span className="font-medium">Completed Today</span>
                            </div>
                            <span className="font-bold text-blue-600">
                                {getTodayDeliveries().filter(d => d.status === 'delivered').length}
                            </span>
                        </div>

                        <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                            <div className="flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                                <span className="font-medium">In Progress</span>
                            </div>
                            <span className="font-bold text-yellow-600">
                                {getTodayDeliveries().filter(d => ['in_progress', 'in_transit'].includes(d.status)).length}
                            </span>
                        </div>

                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-2">
                                <Clock className="h-5 w-5 text-gray-500" />
                                <span className="font-medium">Pending</span>
                            </div>
                            <span className="font-bold text-gray-600">
                                {getTodayDeliveries().filter(d => d.status === 'assigned').length}
                            </span>
                        </div>

                        <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                            <div className="flex items-center gap-2">
                                <XCircle className="h-5 w-5 text-red-500" />
                                <span className="font-medium">Failed/Cancelled</span>
                            </div>
                            <span className="font-bold text-red-600">
                                {getTodayDeliveries().filter(d => ['failed', 'cancelled'].includes(d.status)).length}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Delivery Details Modal */}
            {showDeliveryDetails && selectedDelivery && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-screen overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-gray-900">Delivery Details</h2>
                                <button
                                    onClick={closeDeliveryDetails}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <XCircle className="h-6 w-6" />
                                </button>
                            </div>

                            <div className="space-y-6">
                                {/* Status and Basic Info */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="p-4 bg-gray-50 rounded-lg">
                                        <h3 className="font-semibold text-gray-900 mb-2">Status</h3>
                                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium text-white ${getStatusColor(selectedDelivery.status)}`}>
                                            {selectedDelivery.status === 'delivered' && <CheckCircle className="h-4 w-4" />}
                                            {['in_progress', 'in_transit'].includes(selectedDelivery.status) && <AlertTriangle className="h-4 w-4" />}
                                            {['failed', 'cancelled'].includes(selectedDelivery.status) && <XCircle className="h-4 w-4" />}
                                            {selectedDelivery.status.replace(/_/g, ' ').toUpperCase()}
                                        </div>
                                    </div>

                                    <div className="p-4 bg-gray-50 rounded-lg">
                                        <h3 className="font-semibold text-gray-900 mb-2">Priority</h3>
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${selectedDelivery.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                                                selectedDelivery.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                                                    selectedDelivery.priority === 'normal' ? 'bg-blue-100 text-blue-800' :
                                                        'bg-gray-100 text-gray-800'
                                            }`}>
                                            {selectedDelivery.priority.toUpperCase()}
                                        </span>
                                    </div>

                                    <div className="p-4 bg-gray-50 rounded-lg">
                                        <h3 className="font-semibold text-gray-900 mb-2">Tracking</h3>
                                        <p className="text-sm text-gray-600">{selectedDelivery.trackingNumber}</p>
                                    </div>
                                </div>

                                {/* Schedule Info */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-blue-50 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-5 w-5 text-blue-500" />
                                        <div>
                                            <p className="text-sm text-blue-600">Delivery Date</p>
                                            <p className="font-medium">{new Date(selectedDelivery.deliveryDate).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-5 w-5 text-blue-500" />
                                        <div>
                                            <p className="text-sm text-blue-600">Time Slot</p>
                                            <p className="font-medium">{formatTime(selectedDelivery.timeSlot)}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Truck className="h-5 w-5 text-blue-500" />
                                        <div>
                                            <p className="text-sm text-blue-600">Duration</p>
                                            <p className="font-medium">{selectedDelivery.estimatedDuration} minutes</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Customer Information */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Customer Information</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <User className="h-4 w-4 text-gray-500" />
                                                    <span className="font-medium">Name:</span>
                                                    <span>{selectedDelivery.customerName}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Phone className="h-4 w-4 text-gray-500" />
                                                    <span className="font-medium">Phone:</span>
                                                    <span>{selectedDelivery.customerPhone || 'N/A'}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium">Email:</span>
                                                    <span>{selectedDelivery.customerEmail}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <div className="flex items-start gap-2">
                                                <MapPin className="h-4 w-4 text-gray-500 mt-1" />
                                                <div>
                                                    <span className="font-medium">Delivery Address:</span>
                                                    <p className="text-gray-600 mt-1">
                                                        {selectedDelivery.deliveryAddress.street}<br />
                                                        {selectedDelivery.deliveryAddress.city}, {selectedDelivery.deliveryAddress.state}<br />
                                                        {selectedDelivery.deliveryAddress.zipCode}
                                                        {selectedDelivery.deliveryAddress.phone && (
                                                            <><br />Phone: {selectedDelivery.deliveryAddress.phone}</>
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Driver Information */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Driver Information</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                                        <div>
                                            <span className="font-medium">Name:</span>
                                            <p className="text-gray-600">{selectedDelivery.driverId.name}</p>
                                        </div>
                                        <div>
                                            <span className="font-medium">Phone:</span>
                                            <p className="text-gray-600">{selectedDelivery.driverId.phone}</p>
                                        </div>
                                        <div>
                                            <span className="font-medium">Vehicle:</span>
                                            <p className="text-gray-600">
                                                {selectedDelivery.driverId.vehicleNumber}
                                                {selectedDelivery.driverId.vehicleType && ` (${selectedDelivery.driverId.vehicleType})`}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Sub-Order Details */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Sub-Order Details</h3>
                                    <div className="border rounded-lg overflow-hidden">
                                        <div className="bg-gray-50 p-4 border-b">
                                            <div className="flex justify-between items-center">
                                                <span className="font-medium">Sub-Order: {selectedDelivery.subOrderId.subOrderNumber}</span>
                                                <span className="font-medium">Category: {selectedDelivery.subOrderId.materialCategory}</span>
                                                <span className="font-medium">Total: Rs. {selectedDelivery.subOrderId.totalAmount.toFixed(2)}</span>
                                            </div>
                                        </div>

                                        <div className="overflow-x-auto">
                                            <table className="w-full">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th className="text-left p-3 font-medium">Material</th>
                                                        <th className="text-center p-3 font-medium">Quantity</th>
                                                        <th className="text-right p-3 font-medium">Unit Price</th>
                                                        <th className="text-right p-3 font-medium">Total</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {selectedDelivery.subOrderId.items.map((item, index) => (
                                                        <tr key={index} className="border-t">
                                                            <td className="p-3">{item.materialName}</td>
                                                            <td className="text-center p-3">{item.qty}</td>
                                                            <td className="text-right p-3">Rs. {item.unitPrice.toFixed(2)}</td>
                                                            <td className="text-right p-3">Rs. {(item.qty * item.unitPrice).toFixed(2)}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>

                                {/* Notes and Instructions */}
                                {(selectedDelivery.notes || selectedDelivery.specialInstructions) && (
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Notes & Instructions</h3>
                                        <div className="space-y-3">
                                            {selectedDelivery.notes && (
                                                <div className="p-3 bg-yellow-50 rounded-lg">
                                                    <span className="font-medium text-yellow-800">Delivery Notes:</span>
                                                    <p className="text-yellow-700 mt-1">{selectedDelivery.notes}</p>
                                                </div>
                                            )}
                                            {selectedDelivery.specialInstructions && (
                                                <div className="p-3 bg-blue-50 rounded-lg">
                                                    <span className="font-medium text-blue-800">Special Instructions:</span>
                                                    <p className="text-blue-700 mt-1">{selectedDelivery.specialInstructions}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="flex justify-end mt-6 pt-6 border-t">
                                <button
                                    onClick={closeDeliveryDetails}
                                    className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WarehouseDeliveryCalendar;
