import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusIcon, SearchIcon, FilterIcon, EditIcon, TrashIcon, XIcon, AlertTriangleIcon, TruckIcon, CalendarIcon, ClockIcon } from 'lucide-react';
import { Order, OrderFormData, OrderItem } from '../types/order';
import { createDeliveryTimeSlot, isWithinBusinessHours, getAvailableTimeSlots, BUSINESS_HOURS } from '../utils/timeUtils';
import { motion } from 'framer-motion';
import { useNotification } from '../contexts/NotificationContext';
import { useAuth } from '../hooks/useAuth';

const defaultFormData: OrderFormData = {
  customer: '',
  email: '',
  address: '',
  contact: '+94',
  items: [{ name: '', quantity: 1 }],
  status: 'Pending',
  preferredDate: new Date().toISOString().split('T')[0],
  preferredTime: '09:00'
};

const OrderManagement = ({ userRole }: { userRole: string }) => {
  const navigate = useNavigate();
  const { user } = useAuth(); // Access user information including email
  const [orders, setOrders] = useState<Order[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [formData, setFormData] = useState<OrderFormData>(defaultFormData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetchingOrders, setFetchingOrders] = useState(true);
  // Delete confirmation modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const { showError, showSuccess, showWarning } = useNotification();

  // Fetch orders and inventory from backend
  useEffect(() => {
    fetchOrders();
    fetchInventory();

    // Request browser notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          console.log('Browser notifications enabled for warehouse confirmations');
        }
      });
    }
  }, []);

  // Fetch orders
  const fetchOrders = async () => {
    try {
      setFetchingOrders(true);
      setError(null);

      // Get existing token from localStorage
      const token = localStorage.getItem('token');

      if (!token) {
        throw new Error('No authentication token found. Please login again.');
      }

      // Determine the correct endpoint based on user role
      const endpoint = 'http://localhost:5001/api/orders?limit=50';  // Backend handles role-based filtering automatically      // Fetch orders with authentication
      const ordersResponse = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!ordersResponse.ok) {
        throw new Error('Failed to fetch orders');
      }

      const ordersData = await ordersResponse.json();

      if (ordersData.success && ordersData.data) {
        // Transform backend order data to frontend format
        const transformedOrders = ordersData.data.map((order: any) => ({
          id: order.orderNumber || order._id,
          customer: order.customer?.fullName || order.customer?.name || 'Unknown Customer',
          email: order.customerEmail || order.customer?.email || '',
          items: order.items?.map((item: any) => ({
            name: item.inventory?.name || item.name || 'Unknown Item',
            quantity: item.quantity || 0
          })) || [],
          status: transformStatus(order.status),
          date: order.createdAt ? new Date(order.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          address: order.shippingAddress?.street || order.customer?.address || 'Address not provided',
          contact: order.shippingAddress?.phone || order.customer?.phone || '+94',
          preferredDate: order.delivery?.estimatedDate ? new Date(order.delivery.estimatedDate).toISOString().split('T')[0] : '',
          preferredTime: '09:00'
        }));

        setOrders(transformedOrders);
      } else {
        console.warn('No orders found or invalid response format');
        setOrders([]);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch orders');
      // Fall back to empty array instead of static data
      setOrders([]);
    } finally {
      setFetchingOrders(false);
    }
  };

  // Fetch inventory items
  const fetchInventory = async () => {
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        console.warn('No authentication token found for inventory fetch');
        return;
      }

      const response = await fetch('http://localhost:5001/api/inventory?limit=100', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data?.items) {
          setInventory(data.data.items);
        }
      }
    } catch (error) {
      console.error('Failed to fetch inventory:', error);
    }
  };

  // Transform backend status to frontend status
  const transformStatus = (backendStatus: string): string => {
    const statusMap: { [key: string]: string } = {
      'pending': 'Pending',
      'confirmed': 'Confirmed',
      'processing': 'Processing',
      'shipped': 'Shipped',
      'delivered': 'Delivered',
      'cancelled': 'Cancelled'
    };
    return statusMap[backendStatus] || 'Pending';
  };

  // Form handling functions
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleItemChange = (index: number, field: keyof OrderItem, value: string) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => {
        if (i === index) {
          return {
            ...item,
            [field]: field === 'name' ? value : Number(value)
          };
        }
        return item;
      })
    }));
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { name: '', quantity: 1 }]
    }));
  };

  const removeItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate phone number
    if (formData.contact.length !== 12) { // +94 + 9 digits = 12 characters
      showError('Invalid Phone Number', 'Please enter a complete 9-digit mobile number.');
      return;
    }

    // Validate preferred delivery date is not in the past
    if (formData.preferredDate) {
      const selectedDate = new Date(formData.preferredDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset time to start of day for accurate comparison

      if (selectedDate < today) {
        showError('Invalid Date', 'Cannot schedule delivery for past dates. Please select today or a future date.');
        return;
      }
    }

    if (!validateTimeSlot(formData.preferredTime)) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Transform items to match backend expectations
      const transformedItems = [];

      for (const item of formData.items) {
        // Find inventory item by name
        const inventoryItem = inventory.find(inv => inv.name.toLowerCase().includes(item.name.toLowerCase()));

        if (!inventoryItem) {
          throw new Error(`Inventory item not found for: ${item.name}`);
        }

        transformedItems.push({
          inventory: inventoryItem._id,
          quantity: item.quantity,
          unitPrice: inventoryItem.selling_price || 100,
          totalPrice: item.quantity * (inventoryItem.selling_price || 100),
          notes: item.name
        });
      }

      // Create order payload for backend
      const orderPayload = {
        items: transformedItems,
        customerEmail: formData.email, // Send email to backend
        shippingAddress: {
          street: formData.address,
          city: "Colombo",
          state: "Western",
          zipCode: "00100",
          phone: formData.contact
        },
        billingAddress: {
          street: formData.address,
          city: "Colombo",
          state: "Western",
          zipCode: "00100",
          phone: formData.contact
        },
        delivery: {
          method: 'delivery',
          estimatedDate: formData.preferredDate
        },
        paymentMethod: 'cash',
        notes: `Customer: ${formData.customer}, Preferred delivery: ${formData.preferredDate} at ${formData.preferredTime}`
      };

      // Get stored token
      const token = localStorage.getItem('token');

      if (!token) {
        throw new Error('No authentication token found. Please login again.');
      }

      // Send to backend with authentication and correct port
      const response = await fetch('http://localhost:5001/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderPayload)
      });

      const result = await response.json();

      if (result.success) {
        // Refresh orders from backend to get the actual created order
        await fetchOrders();

        setShowCreateModal(false);
        setSelectedOrder(null);
        setFormData(defaultFormData);
        showSuccess('Order Created', `Order created successfully! Order ID: ${result.data?.orderNumber || 'Generated'}`);

        // Navigate to delivery calendar for scheduling if it's a new order
        if (!selectedOrder) {
          navigate('/deliveries', {
            state: {
              newOrder: {
                orderId: result.data?.orderNumber || result.data?._id,
                customer: formData.customer,
                address: formData.address,
                date: formData.preferredDate,
                timeSlot: createDeliveryTimeSlot(formData.preferredTime)
              },
              autoSchedule: true
            }
          });
        }
      } else {
        setError(result.message || result.error || 'Failed to create order');
      }
    } catch (err) {
      console.error('Order creation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to process order');
    } finally {
      setLoading(false);
    }
  };

  const handleEditOrder = (order: Order) => {
    setSelectedOrder(order);
    setFormData({
      customer: order.customer,
      email: order.email || '',
      address: order.address,
      contact: order.contact,
      items: order.items,
      status: order.status,
      preferredDate: order.preferredDate,
      preferredTime: order.preferredTime
    });
    setShowCreateModal(true);
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.email && order.email.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = filterStatus === 'all' || order.status.toLowerCase() === filterStatus.toLowerCase();
    return matchesSearch && matchesStatus;
  });
  const handleDeleteOrder = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) {
      showError('Error', 'Order not found');
      return;
    }

    // Show beautiful delete confirmation modal
    setOrderToDelete(order);
    setShowDeleteModal(true);
  };

  const confirmDeleteOrder = async () => {
    if (!orderToDelete) return;

    setDeleteLoading(true);
    try {
      // Call API to delete order from backend or just remove locally for now
      setOrders(orders.filter(order => order.id !== orderToDelete.id));
      showSuccess('Success', 'Order deleted successfully');
    } catch (err) {
      showError('Error', 'Failed to delete order');
    } finally {
      setDeleteLoading(false);
      setShowDeleteModal(false);
      setOrderToDelete(null);
    }
  };

  const cancelDeleteOrder = () => {
    setShowDeleteModal(false);
    setOrderToDelete(null);
  };

  const validateTimeSlot = (time: string): boolean => {
    try {
      if (!isWithinBusinessHours(time)) {
        setError('Selected time must be within business hours (9 AM - 5 PM)');
        return false;
      }
      createDeliveryTimeSlot(time);
      setError(null);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid time slot');
      return false;
    }
  };

  // Customer-specific handlers
  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setFormData({
      customer: order.customer,
      email: order.email || '',
      address: order.address,
      contact: order.contact,
      items: order.items,
      status: order.status,
      preferredDate: order.preferredDate,
      preferredTime: order.preferredTime
    });
    setShowCreateModal(true);
  };

  const handleFeedback = (order: Order) => {
    navigate('/feedback', {
      state: {
        orderId: order.id,
        orderDetails: order
      }
    });
  };

  const handleRequestChange = (order: Order) => {
    // For now, just show a notification - could be expanded to a modal
    showWarning('Request Changes', `Request changes for order ${order.id}. This feature allows you to request delivery time changes or special instructions.`);
  };

  // Admin status change handlers
  const canChangeFromStatus = (currentStatus: string, newStatus: string): boolean => {
    const statusOrder = ['Pending', 'Processing', 'Confirmed', 'Shipped', 'Delivered'];
    const currentIndex = statusOrder.indexOf(currentStatus);
    const newIndex = statusOrder.indexOf(newStatus);

    // Can only move forward in the status chain or stay the same
    return newIndex >= currentIndex || newStatus === currentStatus;
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const token = localStorage.getItem('token');

      // If changing to shipped status and user is not admin, block the change
      if (newStatus === 'Shipped' && userRole !== 'admin') {
        showError('Access Denied', 'Only administrators can change orders to shipped status.');
        return;
      }

      // Find the current order to get warehouse and customer information
      const currentOrder = orders.find(order => order.id === orderId);
      const previousStatus = currentOrder?.status;

      const response = await fetch(`http://localhost:5001/api/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: newStatus,
          warehouseConfirmed: newStatus === 'Confirmed',
          confirmedBy: userRole,
          confirmedAt: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update order status');
      }

      // Handle warehouse confirmation notifications
      if (newStatus === 'Confirmed' && previousStatus !== 'Confirmed' && currentOrder) {
        await handleWarehouseConfirmation(currentOrder, orderId);
      }

      // Refresh orders list
      fetchOrders();
      showSuccess('Status Updated', `Order status changed to ${newStatus}`);
    } catch (error) {
      console.error('Error updating order status:', error);
      showError('Update Failed', 'Failed to update order status. Please try again.');
    }
  };

  // Handle warehouse confirmation notifications
  const handleWarehouseConfirmation = async (order: Order, orderId: string) => {
    try {
      const token = localStorage.getItem('token');
      const warehouseName = order.warehouse || 'Main Store';

      // Send notification and email to customer
      const notificationResponse = await fetch(`http://localhost:5001/api/notifications/warehouse-confirmation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          orderId: orderId,
          customerEmail: order.email,
          customerName: order.customer,
          warehouse: warehouseName,
          orderItems: order.items,
          orderDate: order.date,
          deliveryDate: order.preferredDate,
          deliveryTime: order.preferredTime
        })
      });

      if (notificationResponse.ok) {
        // Show in-app notification
        showSuccess(
          'Customer Notified',
          `Customer ${order.customer} has been notified via email about order confirmation from ${warehouseName}`
        );

        // You can also add a browser notification if supported
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(`Order Confirmed - ${warehouseName}`, {
            body: `Order #${orderId} confirmed for ${order.customer}`,
            icon: '/favicon.ico'
          });
        }
      } else {
        showWarning('Notification Failed', 'Order was confirmed but customer notification failed. Please contact customer manually.');
      }
    } catch (error) {
      console.error('Error sending warehouse confirmation notification:', error);
      showWarning('Notification Error', 'Order confirmed successfully, but there was an issue sending customer notification.');
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-3 sm:p-4 lg:p-6">
      {/* Beautiful background pattern */}
      <div className="absolute inset-0 opacity-5 dark:opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='7' cy='7' r='7'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")"
        }}></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto space-y-4 sm:space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
        >
          <div className="w-full sm:w-auto">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-800 via-blue-600 to-purple-600 dark:from-white dark:via-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
              {userRole === 'customer' ? 'My Orders' : 'Order Management'}
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1 sm:mt-2">
              {userRole === 'customer' ? 'Track and manage your orders' : 'Manage all customer orders'}
            </p>
          </div>

          {(userRole === 'customer' || ['admin', 'cashier'].includes(userRole)) && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              onClick={() => setShowCreateModal(true)}
              className="flex items-center px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg sm:rounded-xl
                         hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl
                         focus:outline-none focus:ring-2 focus:ring-blue-500/20 w-full sm:w-auto justify-center text-sm sm:text-base font-medium"
            >
              <PlusIcon size={18} className="mr-2" />
              {userRole === 'customer' ? 'Place Order' : 'Create Order'}
            </motion.button>
          )}
        </motion.div>      {/* Customer-specific order stats - Enhanced Responsive */}
        {userRole === 'customer' && (
          <>
            {/* Upcoming Delivery Alert */}
            {orders.some(order =>
              ['Pending', 'Processing'].includes(order.status) &&
              order.preferredDate &&
              new Date(order.preferredDate) >= new Date() &&
              order.email === user?.email
            ) && (
                <div className="mb-4 sm:mb-6">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 border-l-4 border-blue-500 p-4 rounded-lg shadow-sm">
                    <div className="flex items-start">
                      <TruckIcon className="h-6 w-6 text-blue-500 mr-3 flex-shrink-0" />
                      <div>
                        <h3 className="font-medium text-blue-700 dark:text-blue-300">Upcoming Deliveries</h3>
                        <div className="mt-2 space-y-2">
                          {orders
                            .filter(order =>
                              ['Pending', 'Processing'].includes(order.status) &&
                              order.preferredDate &&
                              new Date(order.preferredDate) >= new Date() &&
                              order.email === user?.email
                            )
                            .sort((a, b) => new Date(a.preferredDate).getTime() - new Date(b.preferredDate).getTime())
                            .slice(0, 3)
                            .map(order => (
                              <div key={`upcoming-${order.id}`} className="flex justify-between items-center text-sm">
                                <div>
                                  <span className="font-medium text-gray-700 dark:text-gray-300">Order #{order.id}</span>
                                  <span className="text-gray-600 dark:text-gray-400"> • </span>
                                  <span className="text-gray-600 dark:text-gray-400">
                                    {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                                  </span>
                                </div>
                                <div className="flex items-center">
                                  <CalendarIcon className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-1" />
                                  <span className="text-gray-700 dark:text-gray-300 font-medium">
                                    {new Date(order.preferredDate).toLocaleDateString()} {order.preferredTime}
                                  </span>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg shadow transition-colors duration-300 hover:shadow-md">
                <h3 className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium">Total Orders</h3>
                <p className="text-lg sm:text-2xl font-bold text-gray-800 dark:text-white mt-1">{orders.length}</p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg shadow transition-colors duration-300 hover:shadow-md">
                <h3 className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium">Active Orders</h3>
                <p className="text-lg sm:text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                  {orders.filter(o => ['Pending', 'Processing'].includes(o.status)).length}
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg shadow transition-colors duration-300 hover:shadow-md">
                <h3 className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium">Delivered</h3>
                <p className="text-lg sm:text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                  {orders.filter(o => o.status === 'Delivered').length}
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg shadow transition-colors duration-300 hover:shadow-md">
                <h3 className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium">This Month</h3>
                <p className="text-lg sm:text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">
                  {orders.filter(o => new Date(o.date).getMonth() === new Date().getMonth()).length}
                </p>
              </div>
            </div>

            {/* Dedicated Delivery Schedule Section for Customers */}
            {orders.some(order => order.preferredDate && order.email === user?.email) && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-5 mb-6">
                <div className="flex items-center mb-4">
                  <CalendarIcon className="h-5 w-5 text-blue-500 mr-2" />
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white">Your Delivery Schedule</h3>
                </div>

                <div className="overflow-hidden">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {orders
                      .filter(order =>
                        order.preferredDate &&
                        new Date(order.preferredDate) >= new Date() &&
                        ['Pending', 'Processing'].includes(order.status) &&
                        order.email === user?.email
                      )
                      .sort((a, b) => new Date(a.preferredDate).getTime() - new Date(b.preferredDate).getTime())
                      .slice(0, 6)
                      .map(order => (
                        <div
                          key={`delivery-${order.id}`}
                          className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20 border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex flex-col"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center">
                              <TruckIcon className="h-4 w-4 text-blue-500 mr-2" />
                              <span className="font-medium text-gray-800 dark:text-white">Order #{order.id}</span>
                            </div>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${{
                              Processing: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
                              Pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
                              Confirmed: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
                              Shipped: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
                              Delivered: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
                              Cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            }[order.status]}`}>
                              {order.status}
                            </span>
                          </div>

                          <div className="flex items-center mt-2 text-sm text-gray-600 dark:text-gray-400">
                            <CalendarIcon className="h-4 w-4 mr-2" />
                            <span className="font-medium">{new Date(order.preferredDate).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                          </div>

                          <div className="flex items-center mt-1 text-sm text-gray-600 dark:text-gray-400">
                            <ClockIcon className="h-4 w-4 mr-2" />
                            <span>{order.preferredTime}</span>
                          </div>

                          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {order.items.length} {order.items.length === 1 ? 'item' : 'items'}: {order.items.map(item => item.name).join(', ')}
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>

                  {orders.filter(order =>
                    order.preferredDate &&
                    new Date(order.preferredDate) >= new Date() &&
                    ['Pending', 'Processing'].includes(order.status) &&
                    order.email === user?.email
                  ).length === 0 && (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <CalendarIcon className="h-10 w-10 mx-auto mb-3 opacity-40" />
                        <p>No upcoming deliveries scheduled</p>
                        <button
                          onClick={() => setShowCreateModal(true)}
                          className="mt-3 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                        >
                          Place a New Order
                        </button>
                      </div>
                    )}
                </div>
              </div>
            )}
          </>
        )}

        {/* Search and Filter - Enhanced Responsive */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="relative flex-1">
            <SearchIcon size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 z-10" />
            <input
              type="text"
              placeholder={userRole === 'customer' ? 'Search your orders...' : 'Search by ID, customer name or email...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 focus:border-[#FF6B35] focus:ring focus:ring-[#FF6B35] focus:ring-opacity-50 py-3 px-4 transition-all duration-200 text-sm sm:text-base"
            />
            {userRole !== 'customer' && searchTerm.length === 0 && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 pl-2">
                Find orders using customer email, name, or order ID
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <FilterIcon size={20} className="text-gray-400 dark:text-gray-500 flex-shrink-0" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="flex-1 min-w-0 sm:flex-initial sm:w-auto rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-[#FF6B35] focus:ring focus:ring-[#FF6B35] focus:ring-opacity-50 py-3 px-4 text-sm sm:text-base transition-all duration-200"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
        {/* Orders Table - Responsive */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden transition-colors duration-300">
          {/* Loading State */}
          {fetchingOrders && (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF6B35]"></div>
                <p className="text-gray-600 dark:text-gray-400">Loading orders from database...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && !fetchingOrders && (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="text-red-500 text-4xl">⚠️</div>
                <p className="text-red-600 dark:text-red-400">{error}</p>
                <button
                  onClick={fetchOrders}
                  className="bg-[#FF6B35] hover:bg-[#FF6B35]/90 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                >
                  Retry
                </button>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!fetchingOrders && !error && filteredOrders.length === 0 && (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="text-gray-400 text-4xl">📦</div>
                <p className="text-gray-600 dark:text-gray-400">
                  {orders.length === 0 ? 'No orders found in the database' : 'No orders match your search criteria'}
                </p>
                {orders.length === 0 && userRole !== 'customer' && (
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-[#FF6B35] hover:bg-[#FF6B35]/90 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                  >
                    Create First Order
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Orders List */}
          {!fetchingOrders && !error && filteredOrders.length > 0 && (
            <>
              {/* Mobile Card View - Enhanced for small screens */}
              <div className="block lg:hidden">
                <div className="p-2 sm:p-4 space-y-3 sm:space-y-4">
                  {filteredOrders.map((order) => (
                    <div key={order.id} className="bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-4 border border-gray-200 dark:border-gray-600 shadow-sm">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3 space-y-2 sm:space-y-0">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base truncate">{order.id}</h3>
                          {userRole !== 'customer' && (
                            <>
                              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">{order.customer}</p>
                              {order.email && <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{order.email}</p>}
                            </>
                          )}
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${{
                          Processing: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
                          Pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
                          Confirmed: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
                          Shipped: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
                          Delivered: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
                          Cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }[order.status]}
                          }`}>
                          {order.status}
                        </span>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium text-gray-700 dark:text-gray-300">Items: </span>
                          <span className="text-gray-600 dark:text-gray-400">
                            {order.items.map(item => `${item.name} (${item.quantity})`).join(', ')}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700 dark:text-gray-300">Date: </span>
                          <span className="text-gray-600 dark:text-gray-400">{new Date(order.date).toLocaleDateString()}</span>
                        </div>
                        {userRole !== 'customer' && (
                          <div>
                            <span className="font-medium text-gray-700 dark:text-gray-300">Warehouse: </span>
                            <span className="text-gray-600 dark:text-gray-400">{order.warehouse || 'Main Store'}</span>
                          </div>
                        )}
                        {userRole === 'customer' && (
                          <div>
                            <span className="font-medium text-gray-700 dark:text-gray-300">Delivery: </span>
                            {order.email === user?.email ? (
                              <div className="mt-1 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                <CalendarIcon className="w-3 h-3 mr-1" />
                                {new Date(order.preferredDate).toLocaleDateString()}
                                <span className="mx-1">•</span>
                                <ClockIcon className="w-3 h-3 mr-1" />
                                {order.preferredTime}
                              </div>
                            ) : (
                              <span className="text-gray-600 dark:text-gray-400">
                                {new Date(order.preferredDate).toLocaleDateString()} at {order.preferredTime}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-gray-200 dark:border-gray-600">
                        {userRole === 'customer' ? (
                          <>
                            <button
                              onClick={() => handleViewOrder(order)}
                              className="text-[#FF6B35] hover:text-[#FF6B35]/80 px-3 py-1.5 text-xs border border-[#FF6B35] rounded-lg flex-1 sm:flex-none"
                            >
                              View Details
                            </button>
                            {order.status === 'Delivered' && (
                              <button
                                onClick={() => handleFeedback(order)}
                                className="text-green-600 hover:text-green-800 px-3 py-1.5 text-xs border border-green-600 rounded-lg flex-1 sm:flex-none"
                              >
                                Feedback
                              </button>
                            )}
                            {['Pending', 'Processing'].includes(order.status) && (
                              <button
                                onClick={() => handleRequestChange(order)}
                                className="text-blue-600 hover:text-blue-800 px-3 py-1.5 text-xs border border-blue-600 rounded-lg flex-1 sm:flex-none"
                              >
                                Request Change
                              </button>
                            )}
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleViewOrder(order)}
                              className="text-[#FF6B35] hover:text-[#FF6B35]/80 px-3 py-1.5 text-xs border border-[#FF6B35] rounded-lg flex-1 sm:flex-none"
                            >
                              View Details
                            </button>
                            <select
                              value={order.status}
                              onChange={(e) => handleStatusChange(order.id, e.target.value)}
                              disabled={order.status === 'Shipped' && userRole !== 'admin'}
                              className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg bg-white disabled:bg-gray-100 disabled:cursor-not-allowed flex-1 sm:flex-none min-w-0"
                            >
                              <option value="Pending" disabled={!canChangeFromStatus(order.status, 'Pending')}>
                                Pending
                              </option>
                              <option value="Processing" disabled={!canChangeFromStatus(order.status, 'Processing')}>
                                Processing
                              </option>
                              <option value="Confirmed" disabled={!canChangeFromStatus(order.status, 'Confirmed')}>
                                Confirmed
                              </option>
                              <option value="Shipped" disabled={!canChangeFromStatus(order.status, 'Shipped')}>
                                Shipped
                              </option>
                              <option value="Delivered" disabled={!canChangeFromStatus(order.status, 'Delivered')}>
                                Delivered
                              </option>
                            </select>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Desktop Table View - Enhanced Responsive */}
              <div className="hidden lg:block">
                <div className="overflow-x-auto shadow ring-1 ring-black ring-opacity-5 rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Order ID
                        </th>
                        {userRole !== 'customer' && (
                          <>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Customer
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Email
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                              Warehouse
                            </th>
                          </>
                        )}
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Items
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          {userRole === 'customer' ? 'Order Date' : 'Date'}
                        </th>
                        {userRole === 'customer' && (
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Delivery
                          </th>
                        )}
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {filteredOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            {order.id}
                          </td>
                          {userRole !== 'customer' && (
                            <>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                {order.customer}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                {order.email}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                  {order.warehouse || 'Main Store'}
                                </span>
                              </td>
                            </>
                          )}
                          <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                            <div className="max-w-xs truncate">
                              {order.items.map(item => `${item.name} (${item.quantity})`).join(', ')}
                            </div>
                            <div className="text-xs text-gray-400 dark:text-gray-500">
                              {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${{
                              Processing: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
                              Pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
                              Confirmed: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
                              Shipped: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
                              Delivered: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
                              Cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            }[order.status]
                              }`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {new Date(order.date).toLocaleDateString()}
                          </td>
                          {userRole === 'customer' && (
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {order.email === user?.email && (
                                <div className="flex flex-col">
                                  <div className="font-medium text-blue-600 dark:text-blue-400">
                                    {new Date(order.preferredDate).toLocaleDateString()}
                                  </div>
                                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-1 flex items-center">
                                    <ClockIcon className="w-3 h-3 mr-1" />
                                    {order.preferredTime}
                                  </div>
                                </div>
                              )}
                              {order.email !== user?.email && (
                                <div>
                                  <div>{new Date(order.preferredDate).toLocaleDateString()}</div>
                                  <div className="text-xs text-gray-400 dark:text-gray-500">{order.preferredTime}</div>
                                </div>
                              )}
                            </td>
                          )}
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end space-x-2">
                              {userRole === 'customer' ? (
                                <>
                                  <button
                                    onClick={() => handleViewOrder(order)}
                                    className="text-[#FF6B35] hover:text-[#FF6B35]/80 px-2 py-1 text-xs border border-[#FF6B35] rounded"
                                  >
                                    View Details
                                  </button>
                                  {order.status === 'Delivered' && (
                                    <button
                                      onClick={() => handleFeedback(order)}
                                      className="text-green-600 hover:text-green-800 px-2 py-1 text-xs border border-green-600 rounded"
                                    >
                                      Feedback
                                    </button>
                                  )}
                                  {['Pending', 'Processing'].includes(order.status) && (
                                    <button
                                      onClick={() => handleRequestChange(order)}
                                      className="text-blue-600 hover:text-blue-800 px-2 py-1 text-xs border border-blue-600 rounded"
                                    >
                                      Request Change
                                    </button>
                                  )}
                                </>
                              ) : (
                                <>
                                  <button
                                    onClick={() => handleEditOrder(order)}
                                    className="text-[#FF6B35] hover:text-[#FF6B35]/80 mr-3"
                                  >
                                    <EditIcon size={18} />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteOrder(order.id)}
                                    className="text-red-600 hover:text-red-800"
                                  >
                                    <TrashIcon size={18} />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
        {/* Create/Edit Order Modal - Responsive */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto transition-all duration-300 mx-auto">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {selectedOrder ? 'Edit Order' : 'Create New Order'}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                    {selectedOrder ? 'Update order details and save changes' : 'Fill in the details to create a new order'}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setSelectedOrder(null);
                    setFormData(defaultFormData);
                  }}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200"
                >
                  <XIcon size={20} />
                </button>
              </div>
              <div className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Customer Information - Enhanced Responsive Layout */}
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 border border-gray-200 dark:border-gray-600">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Customer Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Customer Name *
                        </label>
                        <input
                          type="text"
                          name="customer"
                          required
                          value={formData.customer}
                          onChange={handleInputChange}
                          placeholder="e.g., W.A. Saman Kumara Perera"
                          className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-[#FF6B35] focus:ring-2 focus:ring-[#FF6B35] focus:ring-opacity-50 transition-all duration-200 px-3 py-2"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Email
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="customer@example.com"
                          className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-[#FF6B35] focus:ring-2 focus:ring-[#FF6B35] focus:ring-opacity-50 transition-all duration-200 px-3 py-2"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Mobile Number *
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 font-medium z-10">
                            +94
                          </span>
                          <input
                            type="tel"
                            name="contact"
                            required
                            value={formData.contact.startsWith('+94') ? formData.contact.substring(3) : formData.contact}
                            onChange={e => {
                              const value = e.target.value.replace(/\D/g, ''); // Only allow digits
                              if (value.length <= 9) {
                                setFormData(prev => ({ ...prev, contact: '+94' + value }));
                              }
                            }}
                            placeholder="77 123 4567"
                            maxLength={9}
                            className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-[#FF6B35] focus:ring-2 focus:ring-[#FF6B35] focus:ring-opacity-50 pl-12 pr-3 py-2 transition-all duration-200"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Delivery Address - Enhanced */}
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 border border-gray-200 dark:border-gray-600">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Delivery Address
                    </h3>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Full Delivery Address *
                      </label>
                      <textarea
                        name="address"
                        required
                        rows={3}
                        value={formData.address}
                        onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                        placeholder="e.g., No. 123, Galle Road, Bambalapitiya, Colombo 04"
                        className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-[#FF6B35] focus:ring-2 focus:ring-[#FF6B35] focus:ring-opacity-50 resize-none px-3 py-2 transition-all duration-200"
                      />
                    </div>
                  </div>

                  {/* Order Items - Enhanced Responsive Design */}
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 border border-gray-200 dark:border-gray-600">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          Order Items
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          Select items from our inventory catalog
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={addItem}
                        className="flex items-center px-4 py-2 text-sm bg-gradient-to-r from-[#FF6B35] to-[#FF8A65] text-white rounded-lg hover:from-[#FF6B35]/90 hover:to-[#FF8A65]/90 transition-all duration-200 shadow-md hover:shadow-lg w-full sm:w-auto justify-center"
                      >
                        <PlusIcon size={16} className="mr-2" />
                        Add Item
                      </button>
                    </div>

                    <div className="space-y-4 max-h-80 overflow-y-auto">
                      {formData.items.map((item, index) => {
                        const selectedItem = inventory.find(invItem => invItem.name === item.name);
                        return (
                          <div key={index} className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              {/* Item Selection */}
                              <div className="md:col-span-2 space-y-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                  📦 Select Item *
                                </label>
                                <div className="relative">
                                  <select
                                    required
                                    value={item.name}
                                    onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-[#FF6B35] focus:ring-2 focus:ring-[#FF6B35]/20 px-3 py-2 transition-all duration-200 appearance-none cursor-pointer"
                                    style={{
                                      backgroundImage: `url("data:image/svg+xml;charset=UTF-8,${encodeURIComponent('<svg fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>')}")`,
                                      backgroundRepeat: 'no-repeat',
                                      backgroundPosition: 'right 0.75rem center',
                                      backgroundSize: '1rem 1rem'
                                    }}
                                  >
                                    <option value="" className="text-gray-500">🔍 Choose an item from inventory...</option>
                                    {inventory.map((invItem) => (
                                      <option key={invItem._id} value={invItem.name} className="font-normal">
                                        {invItem.name} • {invItem.unit} • Rs. {invItem.selling_price}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                {selectedItem && (
                                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-2 text-sm">
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1">
                                      <span className="text-blue-700 dark:text-blue-300">
                                        📂 Category: {selectedItem.category}
                                      </span>
                                      <span className="text-blue-700 dark:text-blue-300">
                                        📏 Unit: {selectedItem.unit}
                                      </span>
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Quantity Input */}
                              <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                  📊 Quantity * {selectedItem && `(${selectedItem.unit})`}
                                </label>
                                <div className="flex items-center gap-2">
                                  <div className="relative flex-1">
                                    <input
                                      type="number"
                                      required
                                      min="0.1"
                                      step="0.1"
                                      value={item.quantity}
                                      onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                                      className="w-full rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-[#FF6B35] focus:ring-2 focus:ring-[#FF6B35]/20 px-3 py-2 transition-all duration-200 text-center"
                                      placeholder="0"
                                    />
                                    {selectedItem && (
                                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-500 dark:text-gray-400">
                                        {selectedItem.unit}
                                      </span>
                                    )}
                                  </div>
                                  {formData.items.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() => removeItem(index)}
                                      className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200 border border-red-200 hover:border-red-300 dark:border-red-800 dark:hover:border-red-700"
                                      title="Remove this item"
                                    >
                                      <TrashIcon size={16} />
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Items Summary */}
                    {formData.items.some(item => item.name && item.quantity) && (
                      <div className="mt-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                        <h4 className="text-sm font-medium text-green-700 dark:text-green-300 mb-2">
                          📋 Order Summary ({formData.items.filter(item => item.name && item.quantity).length} items)
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-green-600 dark:text-green-400">
                          {formData.items.filter(item => item.name && item.quantity).map((item, index) => (
                            <div key={index} className="flex justify-between items-center">
                              <span className="font-medium">{item.name}</span>
                              <span className="bg-green-100 dark:bg-green-800 px-2 py-1 rounded">
                                {item.quantity} {inventory.find(inv => inv.name === item.name)?.unit || 'units'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Order Details - Enhanced Responsive Grid */}
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 border border-gray-200 dark:border-gray-600">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Order Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Order Status */}
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Order Status
                        </label>
                        <select
                          name="status"
                          value={formData.status}
                          onChange={handleInputChange}
                          className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-[#FF6B35] focus:ring-2 focus:ring-[#FF6B35] focus:ring-opacity-50 px-3 py-2 transition-all duration-200"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Processing">Processing</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </div>

                      {/* Preferred Date - Enhanced with calendar icon and help text */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Preferred Delivery Date
                          </label>
                          {user?.email && (
                            <span className="text-xs text-blue-600 dark:text-blue-400">
                              For {user.email}
                            </span>
                          )}
                        </div>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <CalendarIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                          </div>
                          <input
                            type="date"
                            name="preferredDate"
                            value={formData.preferredDate}
                            onChange={handleInputChange}
                            min={new Date().toISOString().split('T')[0]}
                            className="pl-10 w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-[#FF6B35] focus:ring-2 focus:ring-[#FF6B35] focus:ring-opacity-50 px-3 py-2 transition-all duration-200"
                          />
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Select a date for your delivery. Must be today or a future date.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Time Slot - Enhanced Responsive Layout */}
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 border border-gray-200 dark:border-gray-600">
                    <div className="space-y-3">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Delivery Time Slot
                      </h3>
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Preferred Time
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <ClockIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                          </div>
                          <input
                            type="time"
                            name="preferredTime"
                            value={formData.preferredTime}
                            onChange={(e) => {
                              handleInputChange(e);
                              validateTimeSlot(e.target.value);
                            }}
                            min={BUSINESS_HOURS.start}
                            max={BUSINESS_HOURS.end}
                            className="pl-10 w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-[#FF6B35] focus:ring-2 focus:ring-[#FF6B35] focus:ring-opacity-50 px-3 py-2 transition-all duration-200"
                          />
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Select a time between {BUSINESS_HOURS.start} and {BUSINESS_HOURS.end} for delivery.
                        </p>
                      </div>
                      <div className="flex items-end">
                        <button
                          type="button"
                          onClick={() => {
                            const timeSlots = getAvailableTimeSlots();
                            if (timeSlots.length > 0) {
                              const newTime = timeSlots[0];
                              setFormData(prev => ({
                                ...prev,
                                preferredTime: newTime
                              }));
                              validateTimeSlot(newTime);
                            }
                          }}
                          className="px-4 py-2 text-sm bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-600 dark:to-gray-500 dark:text-white rounded-lg hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-500 dark:hover:to-gray-400 transition-all duration-200 shadow-sm hover:shadow-md w-full sm:w-auto"
                        >
                          Suggest Time
                        </button>
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Business hours: {BUSINESS_HOURS.start} - {BUSINESS_HOURS.end}
                      </p>
                    </div>
                    {error && (
                      <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <p className="text-sm text-red-600 dark:text-red-400 text-center">{error}</p>
                      </div>
                    )}
                  </div>

                  {/* Form Actions - Enhanced Centered Layout */}
                  <div className="flex flex-col sm:flex-row justify-center gap-3 pt-6 border-t border-gray-200 dark:border-gray-600">
                    <button
                      type="button"
                      onClick={() => {
                        setShowCreateModal(false);
                        setSelectedOrder(null);
                        setFormData(defaultFormData);
                        setError(null);
                      }}
                      className="px-6 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 w-full sm:w-auto"
                      disabled={loading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-3 bg-gradient-to-r from-[#FF6B35] to-[#FF8A65] text-white rounded-lg hover:from-[#FF6B35]/90 hover:to-[#FF8A65]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl w-full sm:w-auto flex items-center justify-center font-medium"
                      disabled={loading || Boolean(error)}
                    >
                      {loading ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processing...
                        </span>
                      ) : selectedOrder ? (
                        '💾 Save Changes'
                      ) : (
                        '🚀 Create Order'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Beautiful Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300 border border-gray-200 dark:border-gray-700">
              <div className="p-6 text-center">
                {/* Warning Icon */}
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/30 dark:to-red-800/30 rounded-full flex items-center justify-center">
                  <AlertTriangleIcon
                    size={32}
                    className="text-red-600 dark:text-red-400"
                  />
                </div>

                {/* Title */}
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Delete Order
                </h3>

                {/* Message */}
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Are you sure you want to permanently delete order{' '}
                  <span className="font-semibold text-gray-900 dark:text-white">
                    "#{orderToDelete?.id}"
                  </span>{' '}
                  for customer{' '}
                  <span className="font-semibold text-gray-900 dark:text-white">
                    "{orderToDelete?.customer}"
                  </span>
                  ?<br />
                  <span className="text-sm text-red-600 dark:text-red-400 font-medium">
                    This action cannot be undone!
                  </span>
                </p>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <button
                    onClick={cancelDeleteOrder}
                    disabled={deleteLoading}
                    className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDeleteOrder}
                    disabled={deleteLoading}
                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg font-medium transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {deleteLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Deleting...
                      </>
                    ) : (
                      <>
                        <TrashIcon size={16} />
                        Delete Order
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderManagement;
