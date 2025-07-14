const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000/api';

// Order interfaces
export interface Order {
  id: number;
  order_number: string;
  customer_id: number;
  cashier_id?: number;
  warehouse_id?: number;
  delivery_batch_id?: number;
  order_type: 'main' | 'sub';
  parent_order_id?: number;
  status: 'draft' | 'pending' | 'confirmed' | 'processing' | 'ready' | 'dispatched' | 'delivered' | 'cancelled' | 'returned';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  total_amount: number;
  tax_amount?: number;
  discount_amount?: number;
  payment_status: 'pending' | 'partial' | 'paid' | 'refunded' | 'cancelled';
  payment_method?: string;
  payment_reference?: string;
  delivery_address: string;
  delivery_instructions?: string;
  requested_delivery_date?: string;
  confirmed_delivery_date?: string;
  actual_delivery_date?: string;
  notes?: string;
  customer_feedback?: string;
  feedback_rating?: number;
  feedback_photos?: string[];
  last_status_update?: string;
  created_by?: number;
  updated_by?: number;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id?: number;
  order_id?: number;
  material_id: number;
  warehouse_id?: number;
  quantity: number;
  unit: string;
  base_quantity: number;
  allocated_quantity?: number;
  unit_price: number;
  total_price: number;
  tax_rate?: number;
  discount_rate?: number;
  status: 'pending' | 'confirmed' | 'allocated' | 'prepared' | 'dispatched' | 'delivered';
  notes?: string;
}

export interface CreateOrderRequest {
  items: OrderItem[];
  delivery_address: string;
  delivery_instructions?: string;
  requested_delivery_date?: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  notes?: string;
}

export interface OrderAdjustment {
  material_id: number;
  action: 'add' | 'remove' | 'modify';
  quantity?: number;
  new_unit_price?: number;
  warehouse_id?: number;
}

export interface BulkOrderOperation {
  operation: 'status_update' | 'priority_update' | 'warehouse_reassign' | 'cancel';
  order_ids: number[];
  data: {
    status?: string;
    priority?: string;
    warehouse_id?: number;
  };
}

export interface DeliveryOptimization {
  warehouse_id: number;
  delivery_date: string;
  driver_id?: number;
}

export interface OrderAnalytics {
  start_date?: string;
  end_date?: string;
  warehouse_id?: number;
}

export interface MaterialDemandForecast {
  material_id?: number;
  warehouse_id?: number;
  forecast_days?: number;
}

// Utility function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
};

// Helper function for API requests
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const config: RequestInit = {
    headers: getAuthHeaders(),
    ...options
  };

  const response = await fetch(url, config);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'API request failed');
  }

  return data;
};

export const orderApiService = {
  // Basic order operations
  getAllOrders: async (params?: {
    status?: string;
    customerId?: number;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }) => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          query.append(key, value.toString());
        }
      });
    }
    return apiRequest(`/orders?${query.toString()}`);
  },

  getMyOrders: async (params?: {
    status?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }) => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          query.append(key, value.toString());
        }
      });
    }
    return apiRequest(`/orders/my-orders?${query.toString()}`);
  },

  getOrderById: async (id: number) => {
    return apiRequest(`/orders/${id}`);
  },

  createOrder: async (orderData: CreateOrderRequest) => {
    return apiRequest('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData)
    });
  },

  updateOrder: async (id: number, orderData: Partial<Order>) => {
    return apiRequest(`/orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(orderData)
    });
  },

  deleteOrder: async (id: number) => {
    return apiRequest(`/orders/${id}`, {
      method: 'DELETE'
    });
  },

  // Status and workflow management
  updateOrderStatus: async (id: number, status: string, notes?: string) => {
    return apiRequest(`/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, notes })
    });
  },

  splitOrder: async (id: number, splits: any[]) => {
    return apiRequest(`/orders/${id}/split`, {
      method: 'POST',
      body: JSON.stringify({ splits })
    });
  },

  adjustOrder: async (id: number, adjustments: OrderAdjustment[], reason: string, notify_customer: boolean = false) => {
    return apiRequest(`/orders/${id}/adjust`, {
      method: 'POST',
      body: JSON.stringify({ adjustments, reason, notify_customer })
    });
  },

  // Delivery management
  scheduleDelivery: async (id: number, deliveryData: {
    delivery_date: string;
    delivery_time_start?: string;
    delivery_time_end?: string;
    driver_id?: number;
    vehicle_number?: string;
    delivery_instructions?: string;
    warehouse_id?: number;
  }) => {
    return apiRequest(`/orders/${id}/schedule-delivery`, {
      method: 'POST',
      body: JSON.stringify(deliveryData)
    });
  },

  getOrderTracking: async (id: number) => {
    return apiRequest(`/orders/${id}/tracking`);
  },

  requestReschedule: async (id: number, requested_date: string, reason: string) => {
    return apiRequest(`/orders/${id}/reschedule`, {
      method: 'POST',
      body: JSON.stringify({ requested_date, reason })
    });
  },

  // Customer interaction
  submitFeedback: async (id: number, feedback: string, rating: number, photos?: string[]) => {
    return apiRequest(`/orders/${id}/feedback`, {
      method: 'POST',
      body: JSON.stringify({ feedback, rating, photos })
    });
  },

  // Advanced features
  bulkOrderOperations: async (operations: BulkOrderOperation) => {
    return apiRequest('/orders/bulk-operations', {
      method: 'POST',
      body: JSON.stringify(operations)
    });
  },

  optimizeDeliveryRoute: async (optimizationData: DeliveryOptimization) => {
    return apiRequest('/orders/optimize-delivery', {
      method: 'POST',
      body: JSON.stringify(optimizationData)
    });
  },

  // Analytics and reporting
  getOrderAnalytics: async (params: OrderAnalytics) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        query.append(key, value.toString());
      }
    });
    return apiRequest(`/orders/analytics/overview?${query.toString()}`);
  },

  getMaterialDemandForecast: async (params: MaterialDemandForecast) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        query.append(key, value.toString());
      }
    });
    return apiRequest(`/orders/analytics/demand-forecast?${query.toString()}`);
  },

  // Customer-specific routes (admin only)
  getOrdersByCustomer: async (customerId: number, params?: {
    status?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }) => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          query.append(key, value.toString());
        }
      });
    }
    return apiRequest(`/orders/customer/${customerId}?${query.toString()}`);
  }
};

export default orderApiService;
