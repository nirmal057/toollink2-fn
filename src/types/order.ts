export interface OrderItem {
  name: string;
  quantity: number;
  warehouse?: string; // Added warehouse for the item
  category?: string; // Added category for display
  unit?: string; // Added unit for display
  materialId?: string; // Material ID for new backend system
  price?: number; // Price for calculations
}

export interface Order {
  id: string;
  orderNumber?: string;
  customer: string;
  email: string; // Added email field
  items: OrderItem[];
  status: 'Pending' | 'Processing' | 'Confirmed' | 'Shipped' | 'Delivered' | 'Cancelled' | 'Pending Approval' | 'Rejected' | 'pending_approval' | 'approved' | 'rejected';
  date: string;
  address: string;
  contact: string;
  preferredDate: string;
  preferredTime: string;
  warehouse?: string; // Added warehouse field
  warehouseConfirmed?: boolean; // Added warehouse confirmation field
  warehouses?: string[]; // Added array of warehouses involved in the order
  totalAmount?: number; // Total amount for order
  finalAmount?: number; // Final amount after calculations
  subOrderCount?: number; // Number of sub-orders created
  warehouseBreakdown?: any[]; // Breakdown by warehouse
}

export interface OrderFormData {
  customer: string;
  email: string;
  address: string;
  contact: string;
  items: OrderItem[];
  status: Order['status'];
  preferredDate: string;
  preferredTime: string;
  warehouse?: string; // Added warehouse field
  warehouseConfirmed?: boolean; // Added warehouse confirmation field
}
