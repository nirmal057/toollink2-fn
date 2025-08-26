import React, { useState, useEffect } from 'react';
import { CalendarIcon, TruckIcon, PlusIcon, ChevronLeftIcon, ChevronRightIcon, TrashIcon } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useNotification } from '../contexts/NotificationContext';

interface Delivery {
  id: string;
  orderId: string;
  customer: string;
  address: string;
  timeSlot: string;
  date: string;
  status: 'Scheduled' | 'In Transit' | 'Delivered' | 'Cancelled';
  driver: string;
  notes?: string;
  district: string;
}

interface DeliveryFormData {
  orderId: string;
  customer: string;
  address: string;
  date: string;
  timeSlot: string;
  driver: string;
  notes: string;
  district: string;
  status?: 'Scheduled' | 'In Transit' | 'Delivered' | 'Cancelled';
}

// Sri Lankan districts for delivery areas
const DELIVERY_AREAS = [
  'Colombo',
  'Gampaha',
  'Kalutara',
  'Kandy',
  'Galle',
  'Matara',
  'Kurunegala',
  'Puttalam'
];

// Available local time slots
const TIME_SLOTS = [
  '08:00-10:00',
  '10:00-12:00',
  '13:00-15:00',
  '15:00-17:00',
  '17:00-19:00'
];

// Local drivers
const DRIVERS = [
  'Kumara Perera',
  'Nimal Silva',
  'Mohamed Farook',
  'Raj Patel',
  'Samantha Fernando'
];

// Sample delivery data
const initialDeliveries: Delivery[] = [
  {
    id: 'DEL-001',
    orderId: 'ORD-7892',
    customer: 'Royal Builders',
    address: '123 Galle Road, Colombo 04',
    timeSlot: '09:00-11:00',
    date: new Date().toISOString().split('T')[0],
    status: 'Scheduled',
    driver: 'Kumara Perera',
    notes: 'Delivery to construction site, call site manager',
    district: 'Colombo'
  },
  {
    id: 'DEL-002',
    orderId: 'ORD-7893',
    customer: 'Lanka Contractors',
    address: '45 Kandy Road, Kiribathgoda',
    timeSlot: '13:00-15:00',
    date: new Date().toISOString().split('T')[0],
    status: 'In Transit',
    driver: 'Nimal Silva',
    notes: 'Heavy machinery delivery, need forklift',
    district: 'Gampaha'
  },
  // Past deliveries - these should be read-only
  {
    id: 'DEL-003',
    orderId: 'ORD-7885',
    customer: 'ABC Construction',
    address: '78 Negombo Road, Wattala',
    timeSlot: '10:00-12:00',
    date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Yesterday
    status: 'Delivered',
    driver: 'Mohamed Farook',
    notes: 'Delivered successfully to site manager',
    district: 'Gampaha'
  },
  {
    id: 'DEL-004',
    orderId: 'ORD-7880',
    customer: 'Prime Developers',
    address: '156 High Level Road, Nugegoda',
    timeSlot: '14:00-16:00',
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 days ago
    status: 'Delivered',
    driver: 'Raj Patel',
    notes: 'Materials delivered for foundation work',
    district: 'Colombo'
  },
  {
    id: 'DEL-005',
    orderId: 'ORD-7875',
    customer: 'Metro Holdings',
    address: '89 Baseline Road, Colombo 09',
    timeSlot: '08:00-10:00',
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 3 days ago
    status: 'Delivered',
    driver: 'Samantha Fernando',
    notes: 'Cement and aggregate delivery completed',
    district: 'Colombo'
  }
];

interface DeliveryCalendarProps {
  userRole: string;
}

const DeliveryCalendar: React.FC<DeliveryCalendarProps> = ({ userRole }) => {
  const { state } = useLocation();
  const [deliveries, setDeliveries] = useState<Delivery[]>(initialDeliveries);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const { showError } = useNotification();

  // Group deliveries by orderId
  const deliveriesByOrder = deliveries.reduce((acc, delivery) => {
    if (!acc[delivery.orderId]) {
      acc[delivery.orderId] = [];
    }
    acc[delivery.orderId].push(delivery);
    return acc;
  }, {} as Record<string, Delivery[]>);

  // Get unique order IDs
  const orderIds = [...new Set(deliveries.map(d => d.orderId))];

  // Filter deliveries based on selected order and district
  const filteredDeliveries = deliveries.filter(d => {
    const matchesOrder = !selectedOrderId || d.orderId === selectedOrderId;
    const matchesDistrict = !selectedDistrict || d.district === selectedDistrict;
    return matchesOrder && matchesDistrict;
  });

  // Initialize formData with auto-scheduled order if available
  const [formData, setFormData] = useState<DeliveryFormData>({
    orderId: '',
    customer: '',
    address: '',
    date: new Date().toISOString().split('T')[0],
    timeSlot: TIME_SLOTS[0],
    driver: DRIVERS[0],
    notes: '',
    district: ''
  });

  // Check for auto-scheduling from order creation
  useEffect(() => {
    if (state?.newOrder && state.autoSchedule) {
      setFormData(prev => ({
        ...prev,
        orderId: state.newOrder.orderId,
        customer: state.newOrder.customer,
        address: state.newOrder.address,
        date: state.newOrder.date,
        timeSlot: state.newOrder.timeSlot
      }));
      setShowCreateModal(true);
    }
  }, [state]);

  // Check availability
  const isTimeSlotAvailable = (date: string, timeSlot: string, driver: string, district: string, excludeDeliveryId?: string) => {
    const maxDeliveriesPerDistrictPerSlot = 3; // Maximum deliveries allowed per district in a time slot

    const deliveriesInSlot = deliveries.filter(
      d => d.date === date &&
        d.timeSlot === timeSlot &&
        d.district === district &&
        d.id !== excludeDeliveryId
    );

    // Check if driver is already booked
    const driverBooked = deliveries.some(
      d => d.date === date &&
        d.timeSlot === timeSlot &&
        d.driver === driver &&
        d.id !== excludeDeliveryId
    );

    return !driverBooked && deliveriesInSlot.length < maxDeliveriesPerDistrictPerSlot;
  };

  // Add new delivery with validation
  const handleAddDelivery = (e: React.FormEvent) => {
    e.preventDefault();

    // Check if the selected date is in the past
    const selectedDate = new Date(formData.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day for accurate comparison

    if (selectedDate < today) {
      showError('Invalid Date', 'Cannot schedule delivery for past dates. Please select today or a future date.');
      return;
    }

    if (!isTimeSlotAvailable(formData.date, formData.timeSlot, formData.driver, formData.district)) {
      showError('Time Slot Unavailable', 'This time slot is not available. Please check driver availability and maximum deliveries per district.');
      return;
    }

    const newDelivery: Delivery = {
      id: `DEL-${Math.random().toString(36).substr(2, 9)}`,
      status: 'Scheduled',
      ...formData
    };

    setDeliveries([...deliveries, newDelivery]);
    setShowCreateModal(false);
    resetForm();
  };

  // Remove delivery
  const handleRemoveDelivery = (deliveryId: string) => {
    if (window.confirm('Are you sure you want to remove this delivery? This action cannot be undone.')) {
      setDeliveries(deliveries.filter(d => d.id !== deliveryId));
    }
  };

  // Update existing delivery
  // Check for auto-scheduling from order creation
  useEffect(() => {
    if (state?.newOrder && state.autoSchedule) {
      setFormData(prev => ({
        ...prev,
        orderId: state.newOrder.orderId,
        customer: state.newOrder.customer,
        address: state.newOrder.address
      }));
      setShowCreateModal(true);
    }
  }, [state]);

  const handleUpdateDelivery = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedDelivery) return;

    // Check if the selected date is in the past
    const selectedDate = new Date(formData.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day for accurate comparison

    if (selectedDate < today) {
      showError('Invalid Date', 'Cannot schedule delivery for past dates. Please select today or a future date.');
      return;
    }

    if (!isTimeSlotAvailable(formData.date, formData.timeSlot, formData.driver, formData.district, selectedDelivery.id)) {
      showError('Time Slot Unavailable', 'This time slot is not available. Please check driver availability and maximum deliveries per district.');
      return;
    }

    setDeliveries(deliveries.map(delivery =>
      delivery.id === selectedDelivery.id
        ? { ...delivery, ...formData }
        : delivery
    ));
    setShowCreateModal(false);
    resetForm();
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      orderId: '',
      customer: '',
      address: '',
      date: new Date().toISOString().split('T')[0],
      timeSlot: TIME_SLOTS[0],
      driver: DRIVERS[0],
      notes: '',
      district: ''
    });
    setSelectedDelivery(null);
  };

  // Check availability
  // Removed unused function

  // Calendar navigation
  const navigateMonth = (direction: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  // Generate calendar days
  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: (Date | null)[] = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }

    // Add days of the month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const handleStatusUpdate = (deliveryId: string, newStatus: Delivery['status']) => {
    setDeliveries(deliveries.map(delivery =>
      delivery.id === deliveryId
        ? { ...delivery, status: newStatus }
        : delivery
    ));
  };

  const getDeliveryCountForDate = (date: Date) => {
    return filteredDeliveries.filter(delivery =>
      new Date(delivery.date).toDateString() === date.toDateString()
    ).length;
  };

  const days = getDaysInMonth();

  return (
    <div className="space-y-4 xs:space-y-6 p-4 xs:p-6">
      <div className="flex flex-col xs:flex-row justify-between items-start xs:items-center gap-4">
        <h1 className="text-xl xs:text-2xl font-bold text-gray-800 dark:text-white">Delivery Calendar</h1>

        <div className="flex items-center gap-2 xs:gap-4">
          {/* Month Navigation */}
          <div className="flex items-center gap-1 xs:gap-2">
            <button
              onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))}
              className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <ChevronLeftIcon size={18} className="text-gray-600 dark:text-gray-400" />
            </button>
            <span className="text-sm xs:text-lg font-medium min-w-[100px] xs:min-w-[120px] text-center text-gray-800 dark:text-white">
              {currentDate.toLocaleDateString('default', { month: 'long', year: 'numeric' })}
            </span>
            <button
              onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))}
              className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <ChevronRightIcon size={18} className="text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Order Filter and View Controls */}
      <div className="mb-4 xs:mb-6 flex flex-col xs:flex-row gap-4 items-start xs:items-center justify-between">
        <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-2 xs:gap-4 w-full xs:w-auto">
          {/* Order Filter */}
          <select
            value={selectedOrderId || ''}
            onChange={(e) => setSelectedOrderId(e.target.value || null)}
            className="rounded-lg border-gray-300 dark:border-gray-600 focus:border-[#FF6B35] focus:ring focus:ring-[#FF6B35] focus:ring-opacity-50 dark:bg-gray-700 dark:text-white text-sm xs:text-base"
          >
            <option value="">All Orders</option>
            {orderIds.map(orderId => {
              const orderDeliveries = deliveriesByOrder[orderId];
              const customerName = orderDeliveries[0]?.customer;
              return (
                <option key={orderId} value={orderId}>
                  {orderId} - {customerName}
                </option>
              );
            })}
          </select>

          {/* District Filter */}
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="rounded-lg border-gray-300 focus:border-[#FF6B35] focus:ring focus:ring-[#FF6B35] focus:ring-opacity-50"
          >
            <option value="">All Districts</option>
            {DELIVERY_AREAS.map(district => (
              <option key={district} value={district}>
                {district}
              </option>
            ))}
          </select>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1 rounded-md ${viewMode === 'calendar'
                ? 'bg-white shadow-sm text-[#FF6B35]'
                : 'text-gray-600 hover:text-gray-900 '
                }`}
            >
              <CalendarIcon size={18} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 rounded-md ${viewMode === 'list'
                ? 'bg-white shadow-sm text-[#FF6B35]'
                : 'text-gray-600 hover:text-gray-900 '
                }`}
            >
              <TruckIcon size={18} />
            </button>
          </div>
        </div>
        {['admin', 'warehouse'].includes(userRole) && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center px-4 py-2 bg-[#FF6B35] text-white rounded-lg hover:bg-[#FF6B35]/90"
          >
            <PlusIcon size={20} className="mr-2" />
            Schedule Delivery
          </button>
        )}
      </div>

      {viewMode === 'list' ? (
        // List View
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {filteredDeliveries.length === 0 ? (
            <div className="p-6 text-center text-gray-500 ">
              No deliveries scheduled
            </div>
          ) : (
            <div className="divide-y divide-gray-200 ">
              {filteredDeliveries.map(delivery => {
                const deliveryDate = new Date(delivery.date);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const isPastDelivery = deliveryDate < today;

                return (
                  <div
                    key={delivery.id}
                    className={`p-4 transition-colors ${isPastDelivery ? 'opacity-60 bg-gray-50' : 'hover:bg-gray-50'}`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 ">
                          Order #{delivery.orderId}
                          {isPastDelivery && (
                            <span className="text-sm text-gray-500 ml-2">(Past Delivery)</span>
                          )}
                        </h3>
                        <p className="text-sm text-gray-500 ">{delivery.customer}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            if (isPastDelivery) {
                              showError('Past Delivery', 'Cannot edit deliveries from past dates. This delivery is read-only.');
                              return;
                            }
                            setSelectedDelivery(delivery);
                            setFormData({
                              orderId: delivery.orderId,
                              customer: delivery.customer,
                              address: delivery.address,
                              date: delivery.date,
                              timeSlot: delivery.timeSlot,
                              driver: delivery.driver,
                              notes: delivery.notes || '',
                              district: delivery.district
                            });
                            setShowCreateModal(true);
                          }}
                          className={`p-2 ${isPastDelivery
                            ? 'text-gray-400 cursor-not-allowed'
                            : 'text-gray-600 hover:text-[#FF6B35]'
                            }`}
                          disabled={isPastDelivery}
                        >
                          {isPastDelivery ? 'View' : 'Edit'}
                        </button>
                        <button
                          onClick={() => {
                            if (isPastDelivery) {
                              showError('Past Delivery', 'Cannot delete deliveries from past dates.');
                              return;
                            }
                            handleRemoveDelivery(delivery.id);
                          }}
                          className={`p-2 ${isPastDelivery
                            ? 'text-gray-400 cursor-not-allowed'
                            : 'text-gray-600 hover:text-red-600'
                            }`}
                          disabled={isPastDelivery}
                        >
                          <TrashIcon size={18} />
                        </button>
                      </div>
                    </div>
                    <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500 ">Date</p>
                        <p className="mt-1 ">{new Date(delivery.date).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500 ">Time Slot</p>
                        <p className="mt-1 ">{delivery.timeSlot}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500 ">Driver</p>
                        <p className="mt-1 ">{delivery.driver}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500 ">District</p>
                        <p className="mt-1 ">{delivery.district}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500 ">Status</p>
                        <select
                          value={delivery.status}
                          onChange={(e) => {
                            if (isPastDelivery) {
                              showError('Past Delivery', 'Cannot change status of past deliveries.');
                              return;
                            }
                            handleStatusUpdate(delivery.id, e.target.value as Delivery['status']);
                          }}
                          className={`mt-1 text-sm rounded-full px-2.5 py-0.5 border-0 focus:ring-2 focus:ring-offset-0
                          ${delivery.status === 'Delivered' ? 'bg-green-100 text-green-800 focus:ring-green-500' :
                              delivery.status === 'In Transit' ? 'bg-blue-100 text-blue-800 focus:ring-blue-500' :
                                delivery.status === 'Cancelled' ? 'bg-red-100 text-red-800 focus:ring-red-500' :
                                  'bg-yellow-100 text-yellow-800 focus:ring-yellow-500'
                            }`}
                          disabled={isPastDelivery}
                        >
                          <option value="Scheduled">Scheduled</option>
                          <option value="In Transit">In Transit</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </div>
                    </div>
                    {delivery.notes && (
                      <div className="mt-2">
                        <p className="text-sm font-medium text-gray-500 ">Notes</p>
                        <p className="mt-1 text-sm text-gray-600 ">{delivery.notes}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        // Calendar View
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <CalendarIcon size={24} className="text-[#FF6B35] mr-2" />
              <h2 className="text-xl font-semibold ">
                {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
              </h2>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => navigateMonth(-1)}
                className="p-2 rounded-full hover:bg-gray-100 "
              >
                <ChevronLeftIcon size={20} className="" />
              </button>
              <button
                onClick={() => navigateMonth(1)}
                className="p-2 rounded-full hover:bg-gray-100 "
              >
                <ChevronRightIcon size={20} className="" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1">
            {/* Week days header */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="p-2 text-center text-sm font-medium text-gray-600 ">
                {day}
              </div>
            ))}

            {/* Calendar days */}
            {days.map((date, i) => {
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const isPastDate = date && date < today;
              const isToday = date && date.toDateString() === new Date().toDateString();

              return (
                <div
                  key={i}
                  className={`${date ? 'min-h-[120px] p-3 border rounded-lg ' +
                    (isToday
                      ? 'bg-primary-50 border-primary-200 '
                      : isPastDate
                        ? 'bg-gray-50 border-gray-300 opacity-80 '
                        : 'bg-white border-gray-200 ')
                    : ''
                    }`}
                >
                  {date && (
                    <>
                      <div className="flex justify-between items-center mb-2">                      <span className={`text-sm font-medium ${isToday
                          ? 'text-primary-600 '
                          : isPastDate
                            ? 'text-gray-500 '
                            : 'text-gray-900 '
                        }`}>
                        {date.getDate()}
                        {isPastDate && (
                          <span className="text-[10px] text-gray-400 ml-1">(Past)</span>
                        )}
                      </span>
                        {getDeliveryCountForDate(date) > 0 && (
                          <span className="bg-[#FF6B35] text-white text-xs px-2 py-1 rounded-full">
                            {getDeliveryCountForDate(date)}
                          </span>
                        )}
                      </div>

                      <div className="space-y-1">
                        {filteredDeliveries
                          .filter(d => new Date(d.date).toDateString() === date.toDateString())
                          .sort((a, b) => a.timeSlot.localeCompare(b.timeSlot))
                          .map(delivery => {
                            const deliveryDate = new Date(delivery.date);
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            const isPastDelivery = deliveryDate < today;

                            return (
                              <div
                                key={delivery.id}
                                className={`p-2 rounded text-xs transition-opacity ${isPastDelivery
                                    ? 'cursor-not-allowed opacity-60'
                                    : 'cursor-pointer hover:opacity-90'
                                  } ${delivery.status === 'Delivered'
                                    ? 'bg-green-100 text-green-800 '
                                    : delivery.status === 'In Transit'
                                      ? 'bg-blue-100 text-blue-800 '
                                      : delivery.status === 'Cancelled'
                                        ? 'bg-red-100 text-red-800 '
                                        : 'bg-yellow-100 text-yellow-800 '
                                  }`}
                                onClick={() => {
                                  const deliveryDate = new Date(delivery.date);
                                  const today = new Date();
                                  today.setHours(0, 0, 0, 0);

                                  // Only allow editing if delivery is today or in the future
                                  if (deliveryDate >= today) {
                                    setSelectedDelivery(delivery);
                                    setFormData({
                                      orderId: delivery.orderId,
                                      customer: delivery.customer,
                                      address: delivery.address,
                                      date: delivery.date,
                                      timeSlot: delivery.timeSlot,
                                      driver: delivery.driver,
                                      notes: delivery.notes || '',
                                      district: delivery.district,
                                      status: delivery.status
                                    });
                                    setShowCreateModal(true);
                                  } else {
                                    // For past deliveries, show read-only view
                                    showError('Past Delivery', 'Cannot edit deliveries from past dates. This delivery is read-only.');
                                  }
                                }}
                              >
                                <div className="flex items-center gap-1">
                                  <TruckIcon size={12} />
                                  <span className="font-medium truncate">{delivery.orderId}</span>
                                  {isPastDelivery && (
                                    <span className="text-[10px] opacity-70">(Past)</span>
                                  )}
                                </div>
                                <div className="flex justify-between items-center mt-1 text-[10px]">
                                  <span className="truncate">{delivery.customer}</span>
                                  <span>{delivery.timeSlot.split('-')[0]}</span>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Schedule Delivery Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <h2 className="text-xl font-bold mb-4 ">
              {selectedDelivery ? 'Edit Delivery' : 'Schedule Delivery'}
            </h2>
            <form onSubmit={selectedDelivery ? handleUpdateDelivery : handleAddDelivery} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Order ID
                  </label>
                  <input
                    type="text"
                    value={formData.orderId}
                    onChange={e => setFormData({ ...formData, orderId: e.target.value })}
                    className="w-full rounded-lg border-gray-300 focus:border-[#FF6B35] focus:ring focus:ring-[#FF6B35] focus:ring-opacity-50"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Customer Name
                  </label>
                  <input
                    type="text"
                    value={formData.customer}
                    onChange={e => setFormData({ ...formData, customer: e.target.value })}
                    className="w-full rounded-lg border-gray-300 focus:border-[#FF6B35] focus:ring focus:ring-[#FF6B35] focus:ring-opacity-50"
                    required
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Delivery Address
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                    className="w-full rounded-lg border-gray-300 focus:border-[#FF6B35] focus:ring focus:ring-[#FF6B35] focus:ring-opacity-50"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full rounded-lg border-gray-300 focus:border-[#FF6B35] focus:ring focus:ring-[#FF6B35] focus:ring-opacity-50"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Time Slot
                  </label>
                  <select
                    value={formData.timeSlot}
                    onChange={e => setFormData({ ...formData, timeSlot: e.target.value })}
                    className="w-full rounded-lg border-gray-300 focus:border-[#FF6B35] focus:ring focus:ring-[#FF6B35] focus:ring-opacity-50"
                    required
                  >
                    {TIME_SLOTS.map(slot => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Assign Driver
                  </label>
                  <select
                    value={formData.driver}
                    onChange={e => setFormData({ ...formData, driver: e.target.value })}
                    className="w-full rounded-lg border-gray-300 focus:border-[#FF6B35] focus:ring focus:ring-[#FF6B35] focus:ring-opacity-50"
                    required
                  >
                    {DRIVERS.map(driver => (
                      <option key={driver} value={driver}>
                        {driver}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Delivery District
                  </label>
                  <select
                    value={formData.district}
                    onChange={e => setFormData({ ...formData, district: e.target.value })}
                    className="w-full rounded-lg border-gray-300 focus:border-[#FF6B35] focus:ring focus:ring-[#FF6B35] focus:ring-opacity-50"
                    required
                  >
                    <option value="">Select District</option>
                    {DELIVERY_AREAS.map(area => (
                      <option key={area} value={area}>{area}</option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Special Instructions (Sinhala/Tamil/English)
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full rounded-lg border-gray-300 focus:border-[#FF6B35] focus:ring focus:ring-[#FF6B35] focus:ring-opacity-50"
                    rows={3}
                    placeholder="Add delivery instructions in any language..."
                  />
                </div>
              </div>
              <div className="flex justify-end mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 mr-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#FF6B35] text-white rounded hover:bg-[#FF6B35]/90"
                >
                  {selectedDelivery ? 'Update Delivery' : 'Add Delivery'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryCalendar;
