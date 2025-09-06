/**
 * Integrated Data Service - Connects Users, Orders, Inventory, and Deliveries
 * Removes fake data and creates real relationships between entities
 */

interface User {
    id: string;
    fullName: string;
    email: string;
    role: 'admin' | 'warehouse' | 'cashier' | 'customer' | 'driver';
    isActive: boolean;
    createdAt: string;
    orderCount?: number;
    deliveryCount?: number;
}

interface InventoryItem {
    id: string;
    name: string;
    category: string;
    currentStock: number;
    minimumStock: number;
    unitPrice: number;
    totalValue: number;
    lastUpdated: string;
    ordersUsingThis?: number;
}

interface Order {
    id: string;
    orderNumber: string;
    customerId: string;
    customerName: string;
    items: Array<{
        inventoryId: string;
        name: string;
        quantity: number;
        unitPrice: number;
    }>;
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    totalAmount: number;
    createdAt: string;
    deliveryId?: string;
}

interface Delivery {
    id: string;
    orderId: string;
    driverId?: string;
    driverName?: string;
    customerName: string;
    deliveryAddress: string;
    status: 'assigned' | 'out_from_warehouse' | 'on_the_way' | 'delivered';
    scheduledDate?: string;
    deliveredDate?: string;
    createdAt: string;
}

interface IntegratedData {
    users: User[];
    inventory: InventoryItem[];
    orders: Order[];
    deliveries: Delivery[];
    analytics: {
        totalUsers: number;
        activeUsers: number;
        totalOrders: number;
        completedOrders: number;
        pendingOrders: number;
        totalInventoryValue: number;
        lowStockItems: number;
        totalDeliveries: number;
        completedDeliveries: number;
        orderSuccessRate: number;
        deliverySuccessRate: number;
    };
}

class IntegratedDataService {
    private static baseUrl = 'http://localhost:5001/api';

    /**
     * Get authentication headers
     */
    private static getAuthHeaders() {
        const token = localStorage.getItem('accessToken');
        return {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
    }

    /**
     * Fetch all integrated data with real relationships
     */
    static async fetchIntegratedData(): Promise<IntegratedData> {
        try {
            console.log('🔄 IntegratedDataService: Starting data fetch...');
            const headers = this.getAuthHeaders();
            console.log('🔑 Headers prepared:', { hasAuth: !!headers.Authorization });

            // Fetch all data in parallel
            console.log('📡 Fetching data from APIs...');
            const [usersResponse, inventoryResponse, ordersResponse, deliveriesResponse] = await Promise.all([
                fetch(`${this.baseUrl}/users`, { headers }),
                fetch(`${this.baseUrl}/inventory`, { headers }),
                fetch(`${this.baseUrl}/orders`, { headers }),
                fetch(`${this.baseUrl}/delivery`, { headers })
            ]);

            console.log('📊 API Responses received:', {
                users: usersResponse.status,
                inventory: inventoryResponse.status,
                orders: ordersResponse.status,
                deliveries: deliveriesResponse.status
            });

            // Parse responses
            const usersData = await usersResponse.json();
            const inventoryData = await inventoryResponse.json();
            const ordersData = await ordersResponse.json();
            const deliveriesData = await deliveriesResponse.json();

            console.log('🔍 Raw API data:', {
                usersData: { success: usersData.success, count: usersData.data?.length },
                inventoryData: { success: inventoryData.success, count: inventoryData.data?.items?.length },
                ordersData: { success: ordersData.success, count: ordersData.data?.length },
                deliveriesData: { success: deliveriesData.success, count: deliveriesData.data?.length }
            });

            // Extract actual data arrays - fix field mapping
            const users = usersData.data || [];
            const inventory = inventoryData.data?.items || inventoryData.items || [];
            const orders = ordersData.data || [];
            const deliveries = deliveriesData.data || [];

            console.log('📋 Extracted arrays:', {
                users: users.length,
                inventory: inventory.length,
                orders: orders.length,
                deliveries: deliveries.length
            });

            // Create relationships and calculate analytics
            const enrichedData = this.createRelationships(users, inventory, orders, deliveries);

            console.log('✅ IntegratedDataService: Data processing complete!', {
                analytics: enrichedData.analytics
            });

            return enrichedData;
        } catch (error) {
            console.error('❌ IntegratedDataService Error:', error);
            throw new Error('Failed to fetch integrated data');
        }
    }

    /**
     * Create relationships between entities and calculate real analytics
     */
    private static createRelationships(
        users: any[],
        inventory: any[],
        orders: any[],
        deliveries: any[]
    ): IntegratedData {

        // Enrich users with their order and delivery counts
        const enrichedUsers: User[] = users.map(user => ({
            id: user._id || user.id,
            fullName: user.fullName,
            email: user.email,
            role: user.role,
            isActive: user.isActive,
            createdAt: user.createdAt,
            orderCount: orders.filter(order => order.customerId === (user._id || user.id)).length,
            deliveryCount: user.role === 'driver'
                ? deliveries.filter(delivery => delivery.driverId === (user._id || user.id)).length
                : 0
        }));

        // Enrich inventory with order usage
        const enrichedInventory: InventoryItem[] = inventory.map(item => {
            const itemOrders = orders.filter(order =>
                order.items?.some((orderItem: any) => orderItem.inventory?._id === (item._id || item.id) || orderItem.inventoryId === (item._id || item.id))
            );

            return {
                id: item._id || item.id,
                name: item.name,
                category: item.category,
                currentStock: item.current_stock || item.quantity || 0,
                minimumStock: item.min_stock_level || item.threshold || 0,
                unitPrice: item.selling_price || item.cost || 0,
                totalValue: (item.current_stock || item.quantity || 0) * (item.selling_price || item.cost || 0),
                lastUpdated: item.updated_at || item.updatedAt || new Date().toISOString(),
                ordersUsingThis: itemOrders.length
            };
        });

        // Enrich orders with customer and delivery information
        const enrichedOrders: Order[] = orders.map(order => {
            const customer = users.find(user => (user._id || user.id) === (order.customer?._id || order.customerId));
            const delivery = deliveries.find(del => del.orderId === (order._id || order.id));

            return {
                id: order._id || order.id,
                orderNumber: order.orderNumber,
                customerId: order.customer?._id || order.customerId || '',
                customerName: order.customer?.fullName || customer?.fullName || 'Unknown Customer',
                items: order.items || [],
                status: order.status,
                totalAmount: order.finalAmount || order.totalAmount || 0,
                createdAt: order.createdAt,
                deliveryId: delivery?.id
            };
        });

        // Enrich deliveries with order and driver information
        const enrichedDeliveries: Delivery[] = deliveries.map(delivery => {
            const order = orders.find(ord => (ord._id || ord.id) === delivery.orderId);
            const driver = users.find(user => (user._id || user.id) === delivery.driver || user.fullName === delivery.driver);

            return {
                id: delivery._id || delivery.id,
                orderId: delivery.orderId,
                driverId: delivery.driver || delivery.driverId,
                driverName: typeof delivery.driver === 'string' ? delivery.driver : driver?.fullName || 'Unassigned',
                customerName: delivery.customer || order?.customer?.fullName || 'Unknown',
                deliveryAddress: delivery.address || '',
                status: delivery.status,
                scheduledDate: delivery.scheduledDate,
                deliveredDate: delivery.deliveredDate,
                createdAt: delivery.createdAt || new Date().toISOString()
            };
        });

        // Calculate real analytics
        const activeUsers = enrichedUsers.filter(user => user.isActive).length;
        const completedOrders = enrichedOrders.filter(order => order.status === 'delivered').length;
        const pendingOrders = enrichedOrders.filter(order => ['pending', 'processing'].includes(order.status)).length;
        const totalInventoryValue = enrichedInventory.reduce((sum, item) => sum + item.totalValue, 0);
        const lowStockItems = enrichedInventory.filter(item => item.currentStock <= item.minimumStock).length;
        const completedDeliveries = enrichedDeliveries.filter(delivery => delivery.status === 'delivered').length;

        const analytics = {
            totalUsers: enrichedUsers.length,
            activeUsers,
            totalOrders: enrichedOrders.length,
            completedOrders,
            pendingOrders,
            totalInventoryValue,
            lowStockItems,
            totalDeliveries: enrichedDeliveries.length,
            completedDeliveries,
            orderSuccessRate: enrichedOrders.length > 0 ? Math.round((completedOrders / enrichedOrders.length) * 100) : 0,
            deliverySuccessRate: enrichedDeliveries.length > 0 ? Math.round((completedDeliveries / enrichedDeliveries.length) * 100) : 0
        };

        return {
            users: enrichedUsers,
            inventory: enrichedInventory,
            orders: enrichedOrders,
            deliveries: enrichedDeliveries,
            analytics
        };
    }

    /**
     * Get customer order history
     */
    static async getCustomerOrderHistory(customerId: string): Promise<Order[]> {
        const data = await this.fetchIntegratedData();
        return data.orders.filter(order => order.customerId === customerId);
    }

    /**
     * Get driver delivery history
     */
    static async getDriverDeliveryHistory(driverId: string): Promise<Delivery[]> {
        const data = await this.fetchIntegratedData();
        return data.deliveries.filter(delivery => delivery.driverId === driverId);
    }

    /**
     * Get inventory usage analytics
     */
    static async getInventoryUsageAnalytics(): Promise<InventoryItem[]> {
        const data = await this.fetchIntegratedData();
        return data.inventory.sort((a, b) => (b.ordersUsingThis || 0) - (a.ordersUsingThis || 0));
    }

    /**
     * Get order fulfillment pipeline
     */
    static async getOrderFulfillmentPipeline() {
        const data = await this.fetchIntegratedData();

        return {
            pendingOrders: data.orders.filter(order => order.status === 'pending'),
            processingOrders: data.orders.filter(order => order.status === 'processing'),
            readyForDelivery: data.orders.filter(order => order.status === 'shipped'),
            delivered: data.orders.filter(order => order.status === 'delivered'),
            unassignedDeliveries: data.deliveries.filter(delivery => !delivery.driverId),
            activeDeliveries: data.deliveries.filter(delivery =>
                ['assigned', 'out_from_warehouse', 'on_the_way'].includes(delivery.status)
            )
        };
    }
}

export default IntegratedDataService;
export type { IntegratedData, User, InventoryItem, Order, Delivery };
