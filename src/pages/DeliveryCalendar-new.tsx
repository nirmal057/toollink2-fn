import React, { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Package, Clock, MapPin, Filter } from 'lucide-react';

interface CalendarDelivery {
    id: string;
    timeSlot: string;
    status: string;
    warehouseName: string;
    customerEmail: string;
    itemCount: number;
}

interface CalendarData {
    [date: string]: CalendarDelivery[];
}

const DeliveryCalendar: React.FC<{ userRole: string }> = ({ userRole }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [calendarData, setCalendarData] = useState<CalendarData>({});
    const [loading, setLoading] = useState(true);
    const [selectedWarehouse, setSelectedWarehouse] = useState('');
    const [selectedDate, setSelectedDate] = useState<string | null>(null);

    const canManageDeliveries = ['admin', 'warehouse', 'cashier'].includes(userRole);

    useEffect(() => {
        fetchCalendarData();
    }, [currentDate, selectedWarehouse]);

    const fetchCalendarData = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                month: (currentDate.getMonth()).toString(),
                year: currentDate.getFullYear().toString()
            });

            if (selectedWarehouse) {
                params.append('warehouseId', selectedWarehouse);
            }

            const response = await fetch(`/api/delivery/calendar?${params}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (data.success) {
                setCalendarData(data.calendarData);
            }
        } catch (error) {
            console.error('Error fetching calendar data:', error);
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
        switch (status) {
            case 'scheduled':
                return 'bg-blue-500';
            case 'in_transit':
                return 'bg-orange-500';
            case 'delivered':
                return 'bg-green-500';
            case 'failed':
                return 'bg-red-500';
            case 'cancelled':
                return 'bg-gray-500';
            default:
                return 'bg-gray-400';
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

    const isToday = (day: number) => {
        const today = new Date();
        return today.getDate() === day &&
            today.getMonth() === currentDate.getMonth() &&
            today.getFullYear() === currentDate.getFullYear();
    };

    const isPastDate = (day: number) => {
        const today = new Date();
        const cellDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        return cellDate < today;
    };

    const formatTimeSlot = (slot: string) => {
        switch (slot) {
            case 'morning':
                return '9AM-12PM';
            case 'afternoon':
                return '1PM-5PM';
            case 'evening':
                return '6PM-8PM';
            default:
                return slot;
        }
    };

    const renderCalendarDays = () => {
        const daysInMonth = getDaysInMonth(currentDate);
        const firstDay = getFirstDayOfMonth(currentDate);
        const days = [];

        // Empty cells for days before the first day of the month
        for (let i = 0; i < firstDay; i++) {
            days.push(
                <div key={`empty-${i}`} className="h-32 border border-gray-200 dark:border-gray-700"></div>
            );
        }

        // Days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const dateKey = formatDateKey(day);
            const dayDeliveries = calendarData[dateKey] || [];
            const isCurrentDay = isToday(day);
            const isPast = isPastDate(day);

            days.push(
                <div
                    key={day}
                    className={`h-32 border border-gray-200 dark:border-gray-700 p-2 overflow-y-auto cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 ${isCurrentDay ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-600' : ''
                        } ${isPast ? 'bg-gray-50 dark:bg-gray-800/50' : ''}`}
                    onClick={() => setSelectedDate(selectedDate === dateKey ? null : dateKey)}
                >
                    <div className={`text-sm font-medium mb-1 ${isCurrentDay ? 'text-blue-600 dark:text-blue-400' :
                            isPast ? 'text-gray-400 dark:text-gray-500' :
                                'text-gray-900 dark:text-white'
                        }`}>
                        {day}
                    </div>

                    <div className="space-y-1">
                        {dayDeliveries.slice(0, 3).map((delivery, index) => (
                            <div
                                key={index}
                                className={`text-xs p-1 rounded text-white ${getStatusColor(delivery.status)}`}
                                title={`${delivery.warehouseName} - ${delivery.customerEmail} - ${delivery.itemCount} items`}
                            >
                                <div className="truncate">
                                    {formatTimeSlot(delivery.timeSlot)}
                                </div>
                                <div className="truncate">
                                    {delivery.warehouseName.split(' ')[0]}
                                </div>
                            </div>
                        ))}

                        {dayDeliveries.length > 3 && (
                            <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                +{dayDeliveries.length - 3} more
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        return days;
    };

    if (!canManageDeliveries) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        Access Denied
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                        You don't have permission to view the delivery calendar.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    Delivery Calendar
                </h1>
                <p className="text-gray-600 dark:text-gray-300">
                    View and manage delivery schedules across all warehouses
                </p>
            </div>

            {/* Controls */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
                    {/* Calendar Navigation */}
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => navigateMonth('prev')}
                            className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>

                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </h2>

                        <button
                            onClick={() => navigateMonth('next')}
                            className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Warehouse Filter */}
                    <div className="flex items-center space-x-2">
                        <Filter className="w-4 h-4 text-gray-400" />
                        <select
                            value={selectedWarehouse}
                            onChange={(e) => setSelectedWarehouse(e.target.value)}
                            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        >
                            <option value="">All Warehouses</option>
                            <option value="river_sand_warehouse">River Sand Warehouse</option>
                            <option value="metal_warehouse">Metal Products Warehouse</option>
                            <option value="wood_warehouse">Wood & Timber Warehouse</option>
                            <option value="concrete_warehouse">Concrete Products Warehouse</option>
                        </select>
                    </div>
                </div>

                {/* Legend */}
                <div className="mt-4 flex flex-wrap items-center space-x-6">
                    <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-blue-500 rounded"></div>
                        <span className="text-sm text-gray-600 dark:text-gray-300">Scheduled</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-orange-500 rounded"></div>
                        <span className="text-sm text-gray-600 dark:text-gray-300">In Transit</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-green-500 rounded"></div>
                        <span className="text-sm text-gray-600 dark:text-gray-300">Delivered</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-red-500 rounded"></div>
                        <span className="text-sm text-gray-600 dark:text-gray-300">Failed</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-gray-500 rounded"></div>
                        <span className="text-sm text-gray-600 dark:text-gray-300">Cancelled</span>
                    </div>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
                {/* Day Headers */}
                <div className="grid grid-cols-7 bg-gray-50 dark:bg-gray-700">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                        <div key={day} className="p-3 text-center text-sm font-medium text-gray-700 dark:text-gray-300">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Calendar Days */}
                {loading ? (
                    <div className="grid grid-cols-7" style={{ height: '640px' }}>
                        <div className="col-span-7 flex items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-7">
                        {renderCalendarDays()}
                    </div>
                )}
            </div>

            {/* Selected Date Details */}
            {selectedDate && calendarData[selectedDate] && (
                <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Deliveries for {new Date(selectedDate).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}
                    </h3>

                    <div className="space-y-3">
                        {calendarData[selectedDate].map((delivery, index) => (
                            <div key={index} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                                <div className="flex items-center space-x-4">
                                    <div className={`w-3 h-3 rounded-full ${getStatusColor(delivery.status)}`}></div>
                                    <div>
                                        <div className="flex items-center space-x-2">
                                            <Clock className="w-4 h-4 text-gray-400" />
                                            <span className="font-medium text-gray-900 dark:text-white">
                                                {formatTimeSlot(delivery.timeSlot)}
                                            </span>
                                        </div>
                                        <div className="flex items-center space-x-2 mt-1">
                                            <MapPin className="w-4 h-4 text-gray-400" />
                                            <span className="text-sm text-gray-600 dark:text-gray-300">
                                                {delivery.warehouseName}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <p className="text-sm text-gray-600 dark:text-gray-300">
                                        {delivery.customerEmail}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {delivery.itemCount} item(s)
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default DeliveryCalendar;
