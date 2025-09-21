export interface OrderItem {
  name: string;
  quantity: number;
  warehouse?: string; // Added warehouse for the item
  category?: string; // Added category for display
  unit?: string; // Added unit for display
  price?: number; // Added price for calculations
}

export interface Order {
  id: string;
  orderNumber?: string;
  customer: string;
  email: string; // Added email field
  items: OrderItem[];
  status: 'Pending' | 'Processing' | 'Confirmed' | 'Shipped' | 'Delivered' | 'Cancelled' | 'Pending Approval' | 'Rejected';
  date: string;
  address: string;
  contact: string;
  preferredDate: string;
  preferredTime: string;
  warehouse?: string; // Added warehouse field
  warehouseConfirmed?: boolean; // Added warehouse confirmation field
  totalAmount?: number;
  finalAmount?: number;
  warehouses?: string[]; // Added array of warehouses involved in the order
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
