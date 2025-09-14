export interface OrderItem {
  name: string;
  quantity: number;
}

export interface Order {
  id: string;
  customer: string;
  email: string; // Added email field
  items: OrderItem[];
  status: 'Pending' | 'Processing' | 'Delivered' | 'Cancelled';
  date: string;
  address: string;
  contact: string;
  preferredDate: string;
  preferredTime: string;
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
}
