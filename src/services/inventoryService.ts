import { API_CONFIG, api } from '../config/api';

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  threshold: number;
  location: string;
  lastUpdated: string;
  // Backend fields
  warehouse?: string;
  warehouseCode?: string;
  description?: string;
  sku?: string;
  current_stock?: number;
  min_stock_level?: number;
  max_stock_level?: number;
  supplier_info?: {
    name?: string;
    contact?: string;
    email?: string;
    phone?: string;
    address?: string;
  };
  status?: 'active' | 'inactive' | 'discontinued';
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
  low_stock_alert?: boolean;
  barcode?: string;
  weight?: number;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
    unit?: string;
  };
  tags?: string[];
}

export interface InventoryStats {
  total: number;
  active: number;
  inactive: number;
  low_stock: number;
  categories: number;
}

export interface CreateInventoryItem {
  name: string;
  category: string;
  quantity: number;
  unit: string;
  threshold: number;
  location: string;
  warehouse?: string;
  warehouseCode?: string;
  description?: string;
  sku?: string;
  supplier_info?: {
    name?: string;
    contact?: string;
    email?: string;
    phone?: string;
    address?: string;
  };
  min_stock_level?: number;
  max_stock_level?: number;
  current_stock?: number;
  status?: 'active' | 'inactive' | 'discontinued';
  low_stock_alert?: boolean;
  barcode?: string;
  weight?: number;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
    unit?: string;
  };
  tags?: string[];
}

export interface UpdateInventoryItem extends Partial<CreateInventoryItem> {
  id: string;
}

class InventoryService {  // Map backend inventory item to frontend format
  private mapBackendToFrontend(backendItem: any): InventoryItem {
    return {
      id: backendItem._id?.toString() || backendItem.id?.toString() || '',
      name: backendItem.name || '',
      category: backendItem.category || '',
      quantity: backendItem.current_stock || backendItem.quantity || 0,
      unit: backendItem.unit || 'pieces',
      threshold: backendItem.min_stock_level || backendItem.threshold || 0,
      location: backendItem.location || backendItem.warehouse || '',
      lastUpdated: backendItem.updatedAt || backendItem.updated_at
        ? new Date(backendItem.updatedAt || backendItem.updated_at).toISOString().split('T')[0]
        : backendItem.createdAt || backendItem.created_at
          ? new Date(backendItem.createdAt || backendItem.created_at).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0],
      description: backendItem.description || '',
      sku: backendItem.sku || '',
      current_stock: backendItem.current_stock || backendItem.quantity || 0,
      min_stock_level: backendItem.min_stock_level || backendItem.threshold || 0,
      max_stock_level: backendItem.max_stock_level || 1000,
      warehouse: backendItem.warehouse || '',
      warehouseCode: backendItem.warehouseCode || backendItem.warehouse || '',
      supplier_info: typeof backendItem.supplier_info === 'object'
        ? backendItem.supplier_info
        : { name: backendItem.supplier_info || '', contact: '', phone: '' },
      status: backendItem.status || 'active',
      created_at: backendItem.createdAt || backendItem.created_at,
      updated_at: backendItem.updatedAt || backendItem.updated_at,
      created_by: backendItem.created_by,
      updated_by: backendItem.updated_by,
      low_stock_alert: backendItem.low_stock_alert || (backendItem.current_stock || 0) <= (backendItem.min_stock_level || 0),
      barcode: backendItem.barcode || '',
      weight: backendItem.weight || 0,
      dimensions: backendItem.dimensions || { length: 0, width: 0, height: 0, unit: 'cm' },
      tags: backendItem.tags || []
    };
  }
  // Map frontend item to backend format
  private mapFrontendToBackend(frontendItem: CreateInventoryItem | UpdateInventoryItem): any {
    const sku = frontendItem.sku || this.generateTempSku(frontendItem.category || '');

    // Extract supplier info properly
    const supplierInfo = typeof frontendItem.supplier_info === 'object' && frontendItem.supplier_info
      ? frontendItem.supplier_info
      : { name: (frontendItem.supplier_info as any) || '', contact: '', phone: '', email: '', address: '' };

    return {
      name: frontendItem.name,
      category: frontendItem.category,
      description: frontendItem.description || '',
      sku: sku,
      quantity: frontendItem.quantity || 0,
      current_stock: frontendItem.current_stock || frontendItem.quantity || 0,
      unit: frontendItem.unit || 'pieces',
      threshold: frontendItem.threshold || 10,
      min_stock_level: frontendItem.min_stock_level || frontendItem.threshold || 10,
      max_stock_level: frontendItem.max_stock_level || (frontendItem.quantity || 0) * 10 || 1000,
      location: frontendItem.location || frontendItem.warehouse || 'WM',
      warehouse: frontendItem.warehouse || 'WM',
      warehouseCode: frontendItem.warehouseCode || frontendItem.warehouse || 'WM',
      supplier_info: {
        name: supplierInfo.name || '',
        contact: supplierInfo.contact || '',
        phone: supplierInfo.phone || '',
        email: supplierInfo.email || '',
        address: supplierInfo.address || ''
      },
      status: frontendItem.status || 'active',
      low_stock_alert: frontendItem.low_stock_alert !== false,
      barcode: frontendItem.barcode || '',
      weight: frontendItem.weight || 0,
      dimensions: frontendItem.dimensions || {
        length: 0,
        width: 0,
        height: 0,
        unit: 'cm'
      },
      tags: frontendItem.tags || []
    };
  }

  // Generate a temporary SKU if none provided
  private generateTempSku(category: string): string {
    const prefix = category ? category.substring(0, 3).toUpperCase() : 'ITM';
    const timestamp = Date.now().toString().slice(-6);
    return `${prefix}-${timestamp}`;
  }

  // Get all inventory items
  async getAllItems(filters?: {
    category?: string;
    search?: string;
    inStock?: boolean;
    lowStock?: boolean;
    page?: number;
    limit?: number;
  }): Promise<{ items: InventoryItem[]; pagination?: any }> {
    try {
      const params = new URLSearchParams();

      if (filters?.category && filters.category !== 'all') {
        params.append('category', filters.category);
      }
      if (filters?.search) {
        params.append('search', filters.search);
      }
      if (filters?.inStock) {
        params.append('inStock', 'true');
      }
      if (filters?.lowStock) {
        params.append('lowStock', 'true');
      }
      if (filters?.page) {
        params.append('page', filters.page.toString());
      }
      if (filters?.limit) {
        params.append('limit', filters.limit.toString());
      }

      const queryString = params.toString();
      const url = `${API_CONFIG.ENDPOINTS.INVENTORY.LIST}${queryString ? `?${queryString}` : ''}`;

      const response = await api.get(url);

      if (response.data.success) {
        const items = Array.isArray(response.data.items)
          ? response.data.items.map(this.mapBackendToFrontend)
          : [];

        return {
          items,
          pagination: response.data.pagination
        };
      } else {
        throw new Error(response.data.error || 'Failed to fetch inventory items');
      }
    } catch (error: any) {
      console.error('Get inventory items error:', error);
      throw new Error(error.response?.data?.error || error.message || 'Failed to fetch inventory items');
    }
  }

  // Get inventory item by ID
  async getItemById(id: string): Promise<InventoryItem> {
    try {
      const response = await api.get(API_CONFIG.ENDPOINTS.INVENTORY.GET_BY_ID(id));

      if (response.data.success) {
        return this.mapBackendToFrontend(response.data.item);
      } else {
        throw new Error(response.data.error || 'Failed to fetch inventory item');
      }
    } catch (error: any) {
      console.error('Get inventory item error:', error);
      throw new Error(error.response?.data?.error || error.message || 'Failed to fetch inventory item');
    }
  }

  // Create new inventory item (with smart duplicate handling)
  async createItem(itemData: CreateInventoryItem): Promise<{ item: InventoryItem; action: string; message: string; details?: any }> {
    try {
      const backendData = this.mapFrontendToBackend(itemData);
      const response = await api.post(API_CONFIG.ENDPOINTS.INVENTORY.CREATE, backendData);

      if (response.data.success) {
        return {
          item: this.mapBackendToFrontend(response.data.data),
          action: response.data.action || 'created',
          message: response.data.message || 'Inventory item processed successfully',
          details: response.data.details
        };
      } else {
        throw new Error(response.data.error || 'Failed to create inventory item');
      }
    } catch (error: any) {
      console.error('Create inventory item error:', error);
      throw new Error(error.response?.data?.error || error.message || 'Failed to create inventory item');
    }
  }

  // Update inventory item
  async updateItem(id: string, itemData: Partial<CreateInventoryItem>): Promise<InventoryItem> {
    try {
      const backendData = this.mapFrontendToBackend({ ...itemData, id } as UpdateInventoryItem);
      const response = await api.put(API_CONFIG.ENDPOINTS.INVENTORY.UPDATE(id), backendData);

      if (response.data.success) {
        return this.mapBackendToFrontend(response.data.item);
      } else {
        throw new Error(response.data.error || 'Failed to update inventory item');
      }
    } catch (error: any) {
      console.error('Update inventory item error:', error);
      throw new Error(error.response?.data?.error || error.message || 'Failed to update inventory item');
    }
  }

  // Delete inventory item
  async deleteItem(id: string): Promise<void> {
    try {
      const response = await api.delete(API_CONFIG.ENDPOINTS.INVENTORY.DELETE(id));

      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to delete inventory item');
      }
    } catch (error: any) {
      console.error('Delete inventory item error:', error);
      throw new Error(error.response?.data?.error || error.message || 'Failed to delete inventory item');
    }
  }

  // Get inventory statistics
  async getStats(): Promise<InventoryStats> {
    try {
      console.log('Fetching inventory stats from:', API_CONFIG.ENDPOINTS.INVENTORY.STATS);
      const response = await api.get(API_CONFIG.ENDPOINTS.INVENTORY.STATS);
      console.log('Full response:', response.data);

      if (response.data.success) {
        // Map backend stats to frontend format
        const backendStats = response.data.data;
        console.log('Backend stats:', backendStats);
        const mappedStats = {
          total: backendStats.totalItems || 0,
          active: backendStats.activeItems || 0,
          inactive: backendStats.inactiveItems || 0,
          low_stock: backendStats.lowStockItems || 0,
          categories: backendStats.categories || 0
        };
        console.log('Mapped stats:', mappedStats);
        return mappedStats;
      } else {
        throw new Error(response.data.error || 'Failed to fetch inventory statistics');
      }
    } catch (error: any) {
      console.error('Get inventory stats error:', error);
      // Return default stats if API fails
      return {
        total: 0,
        active: 0,
        inactive: 0,
        low_stock: 0,
        categories: 0
      };
    }
  }

  // Get low stock items
  async getLowStockItems(): Promise<InventoryItem[]> {
    try {
      const response = await api.get(API_CONFIG.ENDPOINTS.INVENTORY.LOW_STOCK);

      if (response.data.success) {
        return Array.isArray(response.data.items)
          ? response.data.items.map(this.mapBackendToFrontend)
          : [];
      } else {
        throw new Error(response.data.error || 'Failed to fetch low stock items');
      }
    } catch (error: any) {
      console.error('Get low stock items error:', error);
      return [];
    }
  }

  // Update item quantity
  async updateQuantity(id: string, quantity: number, adjustmentType: 'set' | 'add' | 'subtract' = 'set', reason?: string): Promise<InventoryItem> {
    try {
      const response = await api.put(API_CONFIG.ENDPOINTS.INVENTORY.UPDATE_QUANTITY(id), {
        quantity,
        adjustment_type: adjustmentType,
        reason: reason || 'Manual adjustment'
      });

      if (response.data.success) {
        return this.mapBackendToFrontend(response.data.item);
      } else {
        throw new Error(response.data.error || 'Failed to update inventory quantity');
      }
    } catch (error: any) {
      console.error('Update inventory quantity error:', error);
      throw new Error(error.response?.data?.error || error.message || 'Failed to update inventory quantity');
    }
  }
}

export const inventoryService = new InventoryService();
