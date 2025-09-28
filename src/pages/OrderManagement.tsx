import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusIcon, SearchIcon, FilterIcon, EditIcon, TrashIcon, XIcon, AlertTriangleIcon, TruckIcon, CalendarIcon, ClockIcon, CheckIcon, User, MapPin, Package, ShoppingCart, Plus, Trash2, Save, X } from 'lucide-react';
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
  items: [{ name: '', quantity: 1, warehouse: '', category: '', unit: '' }],
  status: 'Pending',
  preferredDate: new Date().toISOString().split('T')[0],
  preferredTime: '09:00'
};

const OrderManagement = ({ userRole }: { userRole: string }) => {
  const navigate = useNavigate();
  const { user } = useAuth(); // Access user information including email
  const [orders, setOrders] = useState<Order[]>([]);
  const [subOrders, setSubOrders] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewMode, setViewMode] = useState<'orders' | 'sub-orders'>('orders');

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [formData, setFormData] = useState<OrderFormData>(defaultFormData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetchingOrders, setFetchingOrders] = useState(true);
  // Delete confirmation modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  // Reject modal state
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [orderToReject, setOrderToReject] = useState<Order | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectLoading, setRejectLoading] = useState(false);
  const { showError, showSuccess, showWarning } = useNotification();

  // Additional state for the form modal
  const [showForm, setShowForm] = useState(false);
  const [showInlineForm, setShowInlineForm] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);

  // Category browsing states
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showItemBrowser, setShowItemBrowser] = useState(false);
  const [itemSearchTerm, setItemSearchTerm] = useState('');

  // Delivery date management
  const [currentDateDeliveryCount, setCurrentDateDeliveryCount] = useState<number>(0);

  // Calculate available warehouses
  const availableWarehouses = Array.from(new Set(inventory.map(item => item.warehouse || 'main_warehouse'))).sort();

  // Function to check existing deliveries for a specific date
  const checkDeliveriesForDate = async (date: string): Promise<number> => {
    try {
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
      if (!token) return 0;

      const response = await fetch(`http://localhost:5001/api/delivery?date=${date}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        return data.deliveries ? data.deliveries.length : 0;
      }
      return 0;
    } catch (error) {
      console.error('Error checking deliveries:', error);
      return 0;
    }
  };

  // Function to find next available delivery date (starting 3 days from now)
  const findNextAvailableDeliveryDate = async (): Promise<string> => {
    const baseDate = new Date();
    baseDate.setDate(baseDate.getDate() + 3); // Start checking from 3 days from now

    let checkDate = new Date(baseDate);
    let maxIterations = 30; // Prevent infinite loop, check up to 30 days ahead

    while (maxIterations > 0) {
      const dateString = checkDate.toISOString().split('T')[0];
      const existingDeliveries = await checkDeliveriesForDate(dateString);

      // If no deliveries exist for this date, or less than a reasonable limit (e.g., 10), use this date
      if (existingDeliveries < 10) {
        return dateString;
      }

      // Move to next day
      checkDate.setDate(checkDate.getDate() + 1);
      maxIterations--;
    }

    // Fallback to 3 days from now if no suitable date found
    return baseDate.toISOString().split('T')[0];
  };

  // Initialize form with auto delivery date
  const initializeFormWithDeliveryDate = async () => {
    const autoDeliveryDate = await findNextAvailableDeliveryDate();
    setFormData(prev => ({
      ...prev,
      preferredDate: autoDeliveryDate
    }));
    // Update delivery count for the initial date
    const count = await checkDeliveriesForDate(autoDeliveryDate);
    setCurrentDateDeliveryCount(count);
  };

  // Reset form with new auto delivery date
  const resetFormWithAutoDeliveryDate = async () => {
    await setupNewOrderForm();
  };

  // Update delivery count when date changes
  const handleDateChange = async (newDate: string) => {
    setFormData(prev => ({ ...prev, preferredDate: newDate }));
    const count = await checkDeliveriesForDate(newDate);
    setCurrentDateDeliveryCount(count);
  };

  // Helper function to set up new order form with auto-fill
  const setupNewOrderForm = async () => {
    setSelectedOrder(null);
    const autoDeliveryDate = await findNextAvailableDeliveryDate();
    setFormData({
      ...defaultFormData,
      customer: user?.fullName || user?.name || '',
      email: user?.email || '',
      contact: user?.phone || '+94',
      preferredDate: autoDeliveryDate
    });
    // Update delivery count for the new date
    const count = await checkDeliveriesForDate(autoDeliveryDate);
    setCurrentDateDeliveryCount(count);
  };

  // Fetch orders and inventory from backend
  useEffect(() => {
    fetchOrders();
    fetchInventory();
    if (userRole === 'warehouse') {
      fetchSubOrders();
    }

    // Initialize auto delivery date when component mounts
    initializeFormWithDeliveryDate();

    // Request browser notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          console.log('Browser notifications enabled for warehouse confirmations');
        }
      });
    }
  }, []);

  // Auto-fill form when opening for new orders
  useEffect(() => {
    if (showInlineForm && !selectedOrder && !formData.customer && userRole === 'customer') {
      // If form is open but not auto-filled for customer, auto-fill it
      setFormData(prev => ({
        ...prev,
        customer: user?.fullName || user?.name || '',
        email: user?.email || '',
        contact: user?.phone || '+94'
      }));
    }
  }, [showInlineForm, selectedOrder, user, userRole]);

  // Fetch orders
  const fetchOrders = async () => {
    try {
      setFetchingOrders(true);
      setError(null);

      // Get existing token from localStorage
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token');

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
          id: order._id, // Use MongoDB _id for API calls
          orderNumber: order.orderNumber, // Keep orderNumber for display
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
          preferredTime: '09:00',
          totalAmount: order.totalAmount || 0,
          finalAmount: order.finalAmount || order.totalAmount || 0
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
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token');

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

  // Fetch sub-orders (for warehouse users)
  const fetchSubOrders = async () => {
    try {
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token');

      if (!token) {
        console.warn('No authentication token found for sub-orders fetch');
        return;
      }

      const response = await fetch('http://localhost:5001/api/orders/sub-orders?limit=50', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setSubOrders(data.data);
        }
      }
    } catch (error) {
      console.error('Failed to fetch sub-orders:', error);
    }
  };

  // Update sub-order status
  const updateSubOrderStatus = async (subOrderId: string, status: string, notes?: string) => {
    try {
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token');

      const response = await fetch(`http://localhost:5001/api/orders/sub-order/${subOrderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status, notes })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Refresh sub-orders
          fetchSubOrders();
          showSuccess('Status Updated', `Sub-order status updated to ${status}`);
        }
      } else {
        throw new Error('Failed to update sub-order status');
      }
    } catch (error) {
      console.error('Failed to update sub-order status:', error);
      showError('Update Failed', 'Failed to update sub-order status');
    }
  };

  // Transform backend status to frontend status
  const transformStatus = (backendStatus: string): string => {
    const statusMap: { [key: string]: string } = {
      'pending': 'Pending',
      'Pending Approval': 'Pending Approval',
      'Confirmed': 'Confirmed',
      'Rejected': 'Rejected',
      'confirmed': 'Confirmed',
      'processing': 'Processing',
      'shipped': 'Shipped',
      'delivered': 'Delivered',
      'cancelled': 'Cancelled'
    };
    return statusMap[backendStatus] || 'Pending';
  };

  // Warehouse helper functions
  const getWarehouseDisplayName = (warehouse: string): string => {
    const displayNames: { [key: string]: string } = {
      'warehouse1': 'Warehouse 1 (River Sand & Soil)',
      'warehouse2': 'Warehouse 2 (Bricks & Masonry)',
      'warehouse3': 'Warehouse 3 (Metals & Steel)',
      'main_warehouse': 'Main Warehouse (Tools & Equipment)',
      'all': 'All Warehouses'
    };
    return displayNames[warehouse] || warehouse;
  };

  // Group inventory by warehouse
  const getInventoryByWarehouse = () => {
    const grouped: { [key: string]: any[] } = {};
    inventory.forEach(item => {
      const warehouse = item.warehouse || 'main_warehouse';
      if (!grouped[warehouse]) {
        grouped[warehouse] = [];
      }
      grouped[warehouse].push(item);
    });
    return grouped;
  };

  // Category icon mapping for better visual identification
  const getCategoryIcon = (category: string): string => {
    const iconMap: { [key: string]: string } = {
      'construction': '🏗️',
      'building': '🏢',
      'electrical': '⚡',
      'plumbing': '🔧',
      'paint': '🎨',
      'hardware': '⚙️',
      'safety': '🛡️',
      'automotive': '🚗',
      'home': '🏠',
      'tools': '🛠️',
      'cement': '🏗️',
      'sand': '🏖️',
      'brick': '🧱',
      'steel': '🔩',
      'wood': '🪵',
      'tile': '🔲',
      'pipe': '🔧',
      'wire': '⚡',
      'default': '📦'
    };

    const categoryLower = category.toLowerCase();
    // Find matching icon by checking if category contains any keyword
    for (const [key, icon] of Object.entries(iconMap)) {
      if (categoryLower.includes(key) || key.includes(categoryLower)) {
        return icon;
      }
    }
    return iconMap.default;
  };

  // Get all available categories from inventory
  const getAvailableCategories = () => {
    const categories = new Set(inventory.map(item => item.category || 'uncategorized').filter(Boolean));
    return Array.from(categories).sort();
  };

  // Filter inventory by category and search term
  const getFilteredInventory = () => {
    return inventory.filter(item => {
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const matchesSearch = itemSearchTerm === '' ||
        item.name.toLowerCase().includes(itemSearchTerm.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(itemSearchTerm.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  };

  // Send notifications to relevant warehouses based on order items
  const sendWarehouseNotifications = async (orderData: any, formData: OrderFormData) => {
    try {
      // Get unique warehouses from order items
      const warehouseItems = new Map<string, any[]>();

      for (const item of formData.items) {
        const inventoryItem = inventory.find(inv => inv.name.toLowerCase() === item.name.toLowerCase());
        if (inventoryItem && inventoryItem.warehouse) {
          const warehouse = inventoryItem.warehouse;
          if (!warehouseItems.has(warehouse)) {
            warehouseItems.set(warehouse, []);
          }
          warehouseItems.get(warehouse)!.push({
            name: item.name,
            quantity: item.quantity,
            category: inventoryItem.category,
            unit: inventoryItem.unit
          });
        }
      }

      // Send notification to each relevant warehouse
      for (const [warehouse, items] of warehouseItems) {
        const token = localStorage.getItem('accessToken') || localStorage.getItem('token');

        const notificationData = {
          type: 'NEW_ORDER_RECEIVED',
          title: `New Order #${orderData.orderNumber || orderData._id}`,
          message: `New order received with ${items.length} items for your warehouse`,
          recipientRole: 'warehouse',
          recipientWarehouse: warehouse,
          priority: 'high',
          metadata: {
            orderId: orderData._id || orderData.orderNumber,
            orderNumber: orderData.orderNumber,
            customer: formData.customer,
            customerEmail: formData.email,
            warehouse: warehouse,
            itemCount: items.length,
            items: items,
            totalAmount: orderData.totalAmount || 0,
            preferredDate: formData.preferredDate,
            preferredTime: formData.preferredTime
          }
        };

        await fetch('http://localhost:5001/api/notifications', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(notificationData)
        });

        console.log(`📦 Notification sent to ${warehouse} warehouse for ${items.length} items`);
      }

      showSuccess('Notifications Sent', `Warehouses notified about the new order`);
    } catch (error) {
      console.error('Failed to send warehouse notifications:', error);
      showWarning('Notification Warning', 'Order created successfully, but warehouse notifications may have failed');
    }
  };

  // Send notifications to admin/cashier for order approval
  const sendApprovalNotifications = async (orderData: any, formData: OrderFormData) => {
    try {
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token');

      const notificationData = {
        type: 'ORDER_APPROVAL_REQUIRED',
        title: `Order Approval Required #${orderData.orderNumber || orderData._id}`,
        message: `New order from ${formData.customer} requires approval. ${formData.items.length} items ordered.`,
        recipientRole: 'admin,cashier', // Both admin and cashier can approve
        priority: 'high',
        metadata: {
          orderId: orderData._id || orderData.orderNumber,
          orderNumber: orderData.orderNumber,
          customer: formData.customer,
          customerEmail: formData.email,
          customerPhone: formData.contact,
          itemCount: formData.items.length,
          items: formData.items,
          totalAmount: orderData.totalAmount || 0,
          preferredDate: formData.preferredDate,
          preferredTime: formData.preferredTime,
          address: formData.address
        }
      };

      await fetch('http://localhost:5001/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(notificationData)
      });

      console.log(`📋 Approval notification sent to admin/cashier for order ${orderData.orderNumber}`);
    } catch (error) {
      console.error('Failed to send approval notifications:', error);
      showWarning('Notification Warning', 'Order submitted, but approval notifications may have failed');
    }
  };

  // Get all available warehouses from inventory
  const getAvailableWarehouses = () => {
    const warehouses = new Set(inventory.map(item => item.warehouse || 'main_warehouse'));
    return Array.from(warehouses).sort();
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
          if (field === 'name') {
            // When item name changes, update associated warehouse and price info
            const selectedItem = inventory.find(invItem => invItem.name === value);
            return {
              ...item,
              name: value,
              warehouse: selectedItem?.warehouse || '',
              category: selectedItem?.category || '',
              unit: selectedItem?.unit || ''
            };
          } else if (field === 'quantity') {
            return {
              ...item,
              [field]: Number(value)
            };
          } else {
            return {
              ...item,
              [field]: value
            };
          }
        }
        return item;
      })
    }));
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { name: '', quantity: 1, warehouse: '', category: '', unit: '', price: 0 }]
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

    // Validate phone number - ensure +94 and 9 digits
    if (!formData.contact.startsWith('+94') || formData.contact.length !== 12) {
      showError('Invalid Phone Number', 'Phone number must be in format +94XXXXXXXXX (9 digits after +94)');
      return;
    }

    // Validate that the 9 digits after +94 are all numeric
    const phoneDigits = formData.contact.substring(3);
    if (!/^\d{9}$/.test(phoneDigits)) {
      showError('Invalid Phone Number', 'Please enter exactly 9 digits after +94 (e.g., +94771234567)');
      return;
    }

    // Validate preferred delivery date is not in the past
    if (formData.preferredDate) {
      const selectedDate = new Date(formData.preferredDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset time to start of day for accurate comparison

      if (selectedDate < today) {
        showError('Invalid Date', 'Cannot select past dates. Please select today or a future date.');
        return;
      }
    }

    if (!validateTimeSlot(formData.preferredTime)) {
      return;
    }

    // Check for delivery conflicts and auto-adjust if needed
    let finalDeliveryDate = formData.preferredDate;
    const existingDeliveries = await checkDeliveriesForDate(finalDeliveryDate);

    if (existingDeliveries >= 10) { // If too many deliveries on selected date
      showWarning('Delivery Date Adjusted', `Selected date has ${existingDeliveries} deliveries. Finding next available date...`);
      finalDeliveryDate = await findNextAvailableDeliveryDate();

      // Update form data with new date
      setFormData(prev => ({
        ...prev,
        preferredDate: finalDeliveryDate
      }));

      showSuccess('Date Updated', `Delivery date automatically adjusted to ${new Date(finalDeliveryDate).toLocaleDateString()} to avoid conflicts.`);
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
          unitPrice: 0,
          totalPrice: 0,
          notes: item.name
        });
      }

      // Create order payload for backend
      const orderPayload = {
        items: transformedItems,
        customerEmail: formData.email || user?.email || '', // Use form email or logged-in user email
        customerName: formData.customer, // Include customer name
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
          estimatedDate: finalDeliveryDate
        },
        paymentMethod: 'cash',
        status: userRole === 'customer' ? 'Pending Approval' : formData.status, // Customer orders need approval
        notes: userRole === 'customer'
          ? `Customer: ${formData.customer}, Contact: ${formData.contact}`
          : `Customer: ${formData.customer}, Contact: ${formData.contact}, Preferred delivery: ${formData.preferredDate} at ${formData.preferredTime}`
      };

      // Get stored token
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token');

      if (!token) {
        throw new Error('No authentication token found. Please login again.');
      }

      // Send to basic orders endpoint that works with standalone MongoDB
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

        // Send notifications based on user role and order status
        if (userRole === 'customer') {
          // For customer orders, notify admin/cashier for approval
          await sendApprovalNotifications(result.data, formData);
          showSuccess('Order Submitted', `Order submitted for approval! Order ID: ${result.data?.orderNumber || 'Generated'}. You will be notified once approved.`);
        } else {
          // For admin/cashier orders, send warehouse notifications directly
          await sendWarehouseNotifications(result.data, formData);
          showSuccess('Order Created', `Order created successfully! Order ID: ${result.data?.orderNumber || 'Generated'}`);
        }

        setShowInlineForm(false);
        setSelectedOrder(null);
        await resetFormWithAutoDeliveryDate();

        // Navigate to delivery calendar for scheduling if it's a new order and user is not customer
        if (!selectedOrder && userRole !== 'customer') {
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
    setShowInlineForm(true);
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
    setShowInlineForm(true);
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

  // Approve order
  const handleApproveOrder = async (orderId: string, notes: string = '') => {
    try {
      console.log('=== APPROVE ORDER DEBUG ===');
      console.log('Order ID:', orderId);
      console.log('Notes:', notes);

      const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
      console.log('Token available:', token ? 'YES' : 'NO');
      console.log('Token preview:', token ? token.substring(0, 20) + '...' : 'none');

      if (!token) {
        showError('Authentication Error', 'No authentication token found. Please login again.');
        return;
      }

      const url = `http://localhost:5001/api/orders/${orderId}/approve`;
      console.log('Request URL:', url);

      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ notes })
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      const result = await response.json();
      console.log('Response data:', result);

      if (response.ok && result.success) {
        console.log('✅ Approval successful');
        await fetchOrders(); // Refresh orders list

        // Send warehouse notifications after approval
        const approvedOrder = orders.find(o => o.id === orderId);
        if (approvedOrder) {
          await sendWarehouseNotifications(result.data || approvedOrder, {
            customer: approvedOrder.customer,
            email: approvedOrder.email || '',
            contact: approvedOrder.contact,
            address: approvedOrder.address,
            items: approvedOrder.items,
            status: 'Confirmed',
            preferredDate: approvedOrder.preferredDate,
            preferredTime: approvedOrder.preferredTime
          });
        }

        showSuccess('Order Approved', 'Order has been approved and warehouses have been notified successfully.');
      } else {
        console.error('❌ Approval failed:', result);
        throw new Error(result.error || `HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('❌ Error approving order:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      showError('Approval Failed', `Failed to approve order: ${errorMessage}`);
    }
  };

  // Reject order with reason
  const handleRejectOrder = async (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (order) {
      setOrderToReject(order);
      setShowRejectModal(true);
      setRejectReason('');
    }
  };

  // Confirm reject order
  const confirmRejectOrder = async () => {
    if (!orderToReject || !rejectReason.trim()) {
      showError('Rejection Reason Required', 'Please provide a reason for rejecting this order.');
      return;
    }

    setRejectLoading(true);
    try {
      console.log('=== REJECT ORDER DEBUG ===');
      console.log('Order ID:', orderToReject.id);
      console.log('Reason:', rejectReason.trim());

      const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
      console.log('Token available:', token ? 'YES' : 'NO');

      if (!token) {
        showError('Authentication Error', 'No authentication token found. Please login again.');
        return;
      }

      const url = `http://localhost:5001/api/orders/${orderToReject.id}/reject`;
      console.log('Request URL:', url);

      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ reason: rejectReason.trim() })
      });

      console.log('Response status:', response.status);
      const result = await response.json();
      console.log('Response data:', result);

      if (response.ok && result.success) {
        console.log('✅ Rejection successful');
        await fetchOrders(); // Refresh orders list
        showSuccess('Order Rejected', 'Order has been rejected and inventory restored.');
        setShowRejectModal(false);
        setOrderToReject(null);
        setRejectReason('');
      } else {
        console.error('❌ Rejection failed:', result);
        throw new Error(result.error || `HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('❌ Error rejecting order:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      showError('Rejection Failed', `Failed to reject order: ${errorMessage}`);
    } finally {
      setRejectLoading(false);
    }
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
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token');

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
            <div className="flex flex-col sm:flex-row gap-3">
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                onClick={async () => {
                  if (!showInlineForm) {
                    await setupNewOrderForm();
                  }
                  setShowInlineForm(!showInlineForm);
                }}
                className="flex items-center px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg sm:rounded-xl
                           hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl
                           focus:outline-none focus:ring-2 focus:ring-blue-500/20 w-full sm:w-auto justify-center text-sm sm:text-base font-medium"
              >
                <PlusIcon size={18} className="mr-2" />
                {showInlineForm ? 'Hide Form' : (userRole === 'customer' ? 'Place Order' : 'Create Order')}
              </motion.button>


            </div>
          )}
        </motion.div>

        {/* Warehouse View Toggle */}
        {userRole === 'warehouse' && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                View Mode
              </h3>
              <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('orders')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${viewMode === 'orders'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                    }`}
                >
                  <TruckIcon className="w-4 h-4 mr-2 inline" />
                  Main Orders
                </button>
                <button
                  onClick={() => setViewMode('sub-orders')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${viewMode === 'sub-orders'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                    }`}
                >
                  <CalendarIcon className="w-4 h-4 mr-2 inline" />
                  My Deliveries
                </button>
              </div>
            </div>

            {viewMode === 'sub-orders' && (
              <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-4">
                  <span>📦 Total: {subOrders.length}</span>
                  <span>🔄 Pending: {subOrders.filter(so => ['created', 'scheduled'].includes(so.status)).length}</span>
                  <span>🚛 In Progress: {subOrders.filter(so => ['prepared', 'dispatched'].includes(so.status)).length}</span>
                  <span>✅ Completed: {subOrders.filter(so => so.status === 'delivered').length}</span>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Inline Order Form */}
        {showInlineForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 mb-6 overflow-hidden"
          >
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-3">
                <PlusIcon className="w-6 h-6" />
                {userRole === 'customer' ? 'Place New Order' : 'Create New Order'}
              </h3>
              <p className="text-blue-100 mt-1">Fill in the details below to create your order</p>
            </div>

            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Customer Information */}
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-500" />
                    Customer Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Customer Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="customer"
                        required
                        value={formData.customer}
                        onChange={handleInputChange}
                        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        placeholder={userRole === 'customer' ? user?.fullName || user?.name || "Your name" : "Enter customer name"}
                        disabled={userRole === 'customer' && formData.customer === (user?.fullName || user?.name)}
                      />
                      {userRole === 'customer' && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Ordering as: {user?.fullName || user?.name || user?.email}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Email Address {userRole === 'customer' && <span className="text-red-500">*</span>}
                      </label>
                      <input
                        type="email"
                        name="email"
                        required={userRole === 'customer'}
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        placeholder={userRole === 'customer' ? user?.email || "your@email.com" : "customer@example.com"}
                        disabled={userRole === 'customer' && formData.email === user?.email}
                      />
                      {userRole === 'customer' && (
                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                          Using your registered email: {user?.email}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Contact Number <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 font-medium text-sm z-10">
                          +94
                        </span>
                        <input
                          type="tel"
                          name="contact"
                          required
                          value={formData.contact.startsWith('+94') ? formData.contact.substring(3) : formData.contact}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '');
                            if (value.length <= 9) {
                              setFormData(prev => ({ ...prev, contact: '+94' + value }));
                            }
                          }}
                          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white pl-12 pr-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                          placeholder="771234567"
                          maxLength={9}
                        />
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Enter 9 digits after +94 (e.g., 771234567) {userRole === 'customer' && user?.phone ? `• Current: ${user.phone}` : ''}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Delivery Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="address"
                        required
                        value={formData.address}
                        onChange={handleInputChange}
                        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        placeholder="Enter delivery address"
                      />
                    </div>
                  </div>
                </div>

                {/* Order Items with Category Browser */}
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      <Package className="w-5 h-5 text-green-500" />
                      Order Items
                    </h4>
                    <button
                      type="button"
                      onClick={() => setShowItemBrowser(!showItemBrowser)}
                      className="flex items-center gap-2 px-3 py-2 bg-green-500 hover:bg-green-600 text-white text-sm rounded-lg transition-colors duration-200"
                    >
                      <Package className="w-4 h-4" />
                      Browse Items by Category
                    </button>
                  </div>



                  {/* Item Browser Modal */}
                  {showItemBrowser && (
                    <div className="mb-6 border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-white dark:bg-gray-800">
                      <div className="flex items-center justify-between mb-4">
                        <h5 className="font-medium text-gray-900 dark:text-white">Browse Available Items</h5>
                        <button
                          type="button"
                          onClick={() => setShowItemBrowser(false)}
                          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      {/* Category Filter */}
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Filter by Category
                        </label>
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedCategory('all')}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${selectedCategory === 'all'
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                              }`}
                          >
                            📦 All Items
                          </button>
                          {getAvailableCategories().map(category => (
                            <button
                              key={category}
                              type="button"
                              onClick={() => setSelectedCategory(category)}
                              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${selectedCategory === category
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                                }`}
                            >
                              {getCategoryIcon(category)} {category}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Search Bar */}
                      <div className="mb-4">
                        <input
                          type="text"
                          placeholder="Search items..."
                          value={itemSearchTerm}
                          onChange={(e) => setItemSearchTerm(e.target.value)}
                          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        />
                      </div>

                      {/* Items Grid */}
                      <div className="max-h-64 overflow-y-auto">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {getFilteredInventory().map((inventoryItem, idx) => {
                            const availableStock = inventoryItem.current_stock || inventoryItem.quantity || 0;
                            const unit = inventoryItem.unit || 'pcs';

                            return (
                              <div
                                key={idx}
                                className="border border-gray-200 dark:border-gray-600 rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                              >
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="text-lg">{getCategoryIcon(inventoryItem.category || 'uncategorized')}</span>
                                  <div className="flex-1">
                                    <div className="font-medium text-gray-900 dark:text-white text-sm">{inventoryItem.name}</div>
                                    <div className="text-xs text-gray-600 dark:text-gray-400">
                                      {inventoryItem.warehouse || 'main_warehouse'} • {inventoryItem.category || 'uncategorized'}
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-xs font-medium text-green-600 dark:text-green-400">
                                    Stock: {availableStock} {unit}
                                  </span>
                                  {availableStock > 0 && (
                                    <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded">
                                      Available
                                    </span>
                                  )}
                                </div>

                                {availableStock > 0 ? (
                                  <div className="grid grid-cols-3 gap-1">
                                    {[1, Math.ceil(availableStock / 4), Math.ceil(availableStock / 2)].filter(qty => qty <= availableStock).map(qty => (
                                      <button
                                        key={qty}
                                        type="button"
                                        onClick={() => {
                                          const newItem = {
                                            name: inventoryItem.name,
                                            quantity: qty,
                                            warehouse: inventoryItem.warehouse || 'main_warehouse',
                                            category: inventoryItem.category || 'uncategorized',
                                            unit: inventoryItem.unit || 'pcs'
                                          };
                                          setFormData(prev => ({
                                            ...prev,
                                            items: [...prev.items, newItem]
                                          }));
                                        }}
                                        className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                                      >
                                        +{qty}
                                      </button>
                                    ))}
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    disabled
                                    className="w-full px-2 py-1 text-xs bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 rounded cursor-not-allowed"
                                  >
                                    Out of Stock
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                        {getFilteredInventory().length === 0 && (
                          <div className="text-center text-gray-500 dark:text-gray-400 py-4">
                            No items found matching your criteria
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Selected Items */}
                  {formData.items.map((item, index) => (
                    <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 mb-4 bg-white dark:bg-gray-800">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Item Name <span className="text-red-500">*</span>
                          </label>
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{getCategoryIcon(item.category || 'uncategorized')}</span>
                            <input
                              type="text"
                              value={item.name}
                              onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                              className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                              placeholder="Enter item name"
                              required
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Quantity <span className="text-red-500">*</span>
                          </label>
                          {(() => {
                            const inventoryItem = inventory.find(inv => inv.name.toLowerCase() === item.name.toLowerCase());
                            const availableStock = inventoryItem?.current_stock || inventoryItem?.quantity || 0;
                            const unit = inventoryItem?.unit || 'pcs';

                            return (
                              <div>
                                <div className="flex items-center gap-2">
                                  <input
                                    type="number"
                                    min="0.1"
                                    step="0.1"
                                    value={item.quantity}
                                    onChange={(e) => {
                                      const value = parseFloat(e.target.value) || 0;
                                      handleItemChange(index, 'quantity', value.toString());
                                    }}
                                    className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                    placeholder="0"
                                    required
                                  />
                                  <span className="text-sm text-gray-500 dark:text-gray-400 font-medium min-w-[40px]">
                                    {unit}
                                  </span>
                                </div>
                                {inventoryItem && (
                                  <div className="mt-1 flex items-center justify-between text-xs">
                                    <span className="text-gray-500 dark:text-gray-400">
                                      Available: {availableStock} {unit}
                                    </span>
                                    {availableStock > 0 && (
                                      <div className="flex gap-1">
                                        {[1, 5, 10, availableStock < 25 ? availableStock : 25].filter((qty, idx, arr) => qty <= availableStock && arr.indexOf(qty) === idx).map(qty => (
                                          <button
                                            key={qty}
                                            type="button"
                                            onClick={() => handleItemChange(index, 'quantity', qty.toString())}
                                            className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                                          >
                                            {qty}
                                          </button>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                )}
                                {inventoryItem && parseFloat(item.quantity) > availableStock && (
                                  <p className="text-xs text-red-500 mt-1">
                                    ⚠️ Requested quantity exceeds available stock ({availableStock} {unit})
                                  </p>
                                )}
                              </div>
                            );
                          })()}
                        </div>
                        <div className="flex items-end">
                          <button
                            type="button"
                            onClick={() => removeItem(index)}
                            disabled={formData.items.length === 1}
                            className="w-full bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                          >
                            <Trash2 className="w-4 h-4 mx-auto" />
                          </button>
                        </div>
                      </div>
                      {item.warehouse && (
                        <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                          Warehouse: {item.warehouse} • Category: {item.category || 'uncategorized'}
                        </div>
                      )}
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={addItem}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200"
                  >
                    <Plus className="w-4 h-4" />
                    Add Item Manually
                  </button>
                </div>

                {/* Delivery Preferences */}
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5 text-purple-500" />
                    Delivery Preferences
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Preferred Date
                      </label>
                      <input
                        type="date"
                        name="preferredDate"
                        value={formData.preferredDate}
                        onChange={(e) => handleDateChange(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs text-blue-600 dark:text-blue-400">
                          📅 Auto-set to 3 days from now. May adjust if busy.
                        </p>
                        {currentDateDeliveryCount > 0 && (
                          <p className="text-xs text-orange-600 dark:text-orange-400">
                            🚚 {currentDateDeliveryCount} deliveries scheduled
                          </p>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Preferred Time
                      </label>
                      <select
                        name="preferredTime"
                        value={formData.preferredTime}
                        onChange={handleInputChange}
                        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="09:00">9:00 AM</option>
                        <option value="10:00">10:00 AM</option>
                        <option value="11:00">11:00 AM</option>
                        <option value="14:00">2:00 PM</option>
                        <option value="15:00">3:00 PM</option>
                        <option value="16:00">4:00 PM</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200 dark:border-gray-600">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg font-medium transition-all duration-200 disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        {userRole === 'customer' ? 'Place Order' : 'Create Order'}
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={async () => {
                      setShowInlineForm(false);
                      await resetFormWithAutoDeliveryDate();
                    }}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-all duration-200"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                </div>

                {/* Error Display */}
                {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                      <AlertTriangleIcon className="w-5 h-5" />
                      <span className="font-medium">Error</span>
                    </div>
                    <p className="text-red-600 dark:text-red-400 mt-1">{error}</p>
                  </div>
                )}
              </form>
            </div>
          </motion.div>
        )}

        {/* Customer-specific order stats - Enhanced Responsive */}
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
                                  <span className="font-medium text-gray-700 dark:text-gray-300">Order #{order.orderNumber || order.id}</span>
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
          {/* Status Filter (Admin/Cashier only) */}
          {userRole !== 'customer' && (
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
          )}
        </div>
        {/* Orders/Sub-Orders Table - Responsive */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden transition-colors duration-300">
          {/* Loading State */}
          {fetchingOrders && (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF6B35]"></div>
                <p className="text-gray-600 dark:text-gray-400">
                  {userRole === 'warehouse' && viewMode === 'sub-orders' ? 'Loading sub-orders...' : 'Loading orders from database...'}
                </p>
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
                    onClick={async () => {
                      await setupNewOrderForm();
                      setShowInlineForm(true);
                    }}
                    className="bg-[#FF6B35] hover:bg-[#FF6B35]/90 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                  >
                    Create First Order
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Conditional Content Based on View Mode */}
          {userRole === 'warehouse' && viewMode === 'sub-orders' ? (
            /* Sub-Orders View for Warehouse Users */
            <>
              {subOrders.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <div className="flex flex-col items-center space-y-4 text-center">
                    <div className="text-gray-400 text-4xl">📋</div>
                    <p className="text-gray-600 dark:text-gray-400">
                      No sub-orders assigned to your warehouses
                    </p>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Sub-Order
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Main Order
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Category
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Customer
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Scheduled
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
                      {subOrders.map((subOrder) => (
                        <tr key={subOrder._id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            {subOrder.subOrderNumber}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                            {subOrder.mainOrderId?.orderNumber}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                              {subOrder.materialCategory}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                            <div>
                              <div className="font-medium">
                                {subOrder.mainOrderId?.customerId?.fullName || 'Unknown'}
                              </div>
                              <div className="text-xs text-gray-500">
                                {subOrder.mainOrderId?.customerId?.email}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                            <div>
                              <div>{new Date(subOrder.scheduledAt).toLocaleDateString()}</div>
                              <div className="text-xs text-gray-500">{subOrder.scheduledTime}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${{
                              'created': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
                              'scheduled': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
                              'prepared': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
                              'dispatched': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
                              'delivered': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
                              'failed': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
                              'rescheduled': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                            }[subOrder.status] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                              }`}>
                              {subOrder.status.charAt(0).toUpperCase() + subOrder.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                            Rs. {subOrder.totalAmount?.toLocaleString() || '0'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            {subOrder.status !== 'delivered' && subOrder.status !== 'failed' && (
                              <select
                                value={subOrder.status}
                                onChange={(e) => updateSubOrderStatus(subOrder._id, e.target.value)}
                                className="text-xs rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                              >
                                <option value="created">Created</option>
                                <option value="scheduled">Scheduled</option>
                                <option value="prepared">Prepared</option>
                                <option value="dispatched">Dispatched</option>
                                <option value="delivered">Delivered</option>
                                <option value="rescheduled">Rescheduled</option>
                              </select>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          ) : (
            /* Regular Orders View */
            <>
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
                        onClick={async () => {
                          await setupNewOrderForm();
                          setShowInlineForm(true);
                        }}
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
                  <div className="block md:hidden">
                    <div className="p-2 sm:p-4 space-y-3 sm:space-y-4">
                      {filteredOrders.map((order) => (
                        <div key={order.id} className="bg-white dark:bg-gray-800 rounded-lg p-3 sm:p-4 border border-gray-200 dark:border-gray-600 shadow-sm">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3 space-y-2 sm:space-y-0">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base truncate">{order.orderNumber || order.id}</h3>
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
                              'Pending Approval': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
                              Confirmed: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
                              Shipped: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
                              Delivered: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
                              Cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
                              Rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
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
                            {order.finalAmount && order.finalAmount > 0 && (
                              <div>
                                <span className="font-medium text-gray-700 dark:text-gray-300">Amount: </span>
                                <span className="text-gray-600 dark:text-gray-400">LKR {order.finalAmount.toLocaleString()}</span>
                              </div>
                            )}
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
                                {order.status === 'Pending Approval' ? (
                                  <>
                                    <button
                                      onClick={() => handleApproveOrder(order.id)}
                                      className="text-green-600 hover:text-green-800 px-3 py-1.5 text-xs border border-green-600 rounded-lg flex items-center justify-center gap-1 flex-1 sm:flex-none"
                                      title="Approve Order"
                                    >
                                      <CheckIcon size={14} />
                                      Approve
                                    </button>
                                    <button
                                      onClick={() => handleRejectOrder(order.id)}
                                      className="text-red-600 hover:text-red-800 px-3 py-1.5 text-xs border border-red-600 rounded-lg flex items-center justify-center gap-1 flex-1 sm:flex-none"
                                      title="Reject Order"
                                    >
                                      <XIcon size={14} />
                                      Reject
                                    </button>
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
                                      className="px-3 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white disabled:bg-gray-100 disabled:cursor-not-allowed flex-1 sm:flex-none min-w-0"
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
                                    <button
                                      onClick={() => handleEditOrder(order)}
                                      className="text-[#FF6B35] hover:text-[#FF6B35]/80 px-3 py-1.5 text-xs border border-[#FF6B35] rounded-lg"
                                      title="Edit Order"
                                    >
                                      <EditIcon size={14} />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteOrder(order.id)}
                                      className="text-red-600 hover:text-red-800 px-3 py-1.5 text-xs border border-red-600 rounded-lg"
                                      title="Delete Order"
                                    >
                                      <TrashIcon size={14} />
                                    </button>
                                  </>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Desktop Table View - Enhanced Responsive */}
                  <div className="hidden md:block">
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
                                {order.orderNumber || order.id}
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
                                  'Pending Approval': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
                                  Confirmed: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
                                  Shipped: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
                                  Delivered: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
                                  Cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
                                  Rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
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
                                      {order.status === 'Pending Approval' ? (
                                        <>
                                          <button
                                            onClick={() => handleApproveOrder(order.id)}
                                            className="text-green-600 hover:text-green-800 mr-2 px-2 py-1 text-xs border border-green-600 rounded flex items-center"
                                            title="Approve Order"
                                          >
                                            <CheckIcon size={14} className="mr-1" />
                                            Approve
                                          </button>
                                          <button
                                            onClick={() => handleRejectOrder(order.id)}
                                            className="text-red-600 hover:text-red-800 px-2 py-1 text-xs border border-red-600 rounded flex items-center"
                                            title="Reject Order"
                                          >
                                            <XIcon size={14} className="mr-1" />
                                            Reject
                                          </button>
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
            </>
          )}
        </div>



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
                  Are you sure you want to permanently delete this order? This action cannot be undone.
                </p>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 dark:focus:ring-offset-gray-800 transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      // Handle delete logic here
                      setShowDeleteModal(false);
                    }}
                    className="flex-1 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-red-500 to-red-600 border border-transparent rounded-lg hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-all duration-200"
                  >
                    Delete
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
