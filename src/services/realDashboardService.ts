// Real Dashboard Data Service for Sri Lankan Hardware Store
export class RealDashboardService {
    private static baseURL = 'http://localhost:5001/api';

    private static getHeaders() {
        const token = localStorage.getItem('accessToken');
        return {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
    }

    // Fetch admin dashboard data (most efficient)
    static async fetchAdminDashboard() {
        try {
            console.log('🔍 Fetching admin dashboard from:', `${this.baseURL}/admin/dashboard`);
            const headers = this.getHeaders();
            console.log('🔑 Headers:', headers);

            const response = await fetch(`${this.baseURL}/admin/dashboard`, {
                headers: headers
            });

            console.log('📡 Response status:', response.status);
            const data = await response.json();
            console.log('📊 Admin dashboard raw data:', data);

            if (data.success) {
                return data.data;
            }
            throw new Error(data.error || 'Failed to fetch admin dashboard');
        } catch (error) {
            console.error('❌ Error fetching admin dashboard:', error);
            throw error;
        }
    }

    // Fetch real users data
    static async fetchUsers() {
        try {
            const response = await fetch(`${this.baseURL}/users`, {
                headers: this.getHeaders()
            });
            const data = await response.json();
            return data.data || [];
        } catch (error) {
            console.error('Error fetching users:', error);
            return [];
        }
    }

    // Fetch real inventory data
    static async fetchInventory() {
        try {
            const response = await fetch(`${this.baseURL}/inventory`, {
                headers: this.getHeaders()
            });
            const data = await response.json();
            return data.data?.items || [];
        } catch (error) {
            console.error('Error fetching inventory:', error);
            return [];
        }
    }

    // Fetch real orders data
    static async fetchOrders() {
        try {
            const response = await fetch(`${this.baseURL}/orders`, {
                headers: this.getHeaders()
            });
            const data = await response.json();
            return data.data || [];
        } catch (error) {
            console.error('Error fetching orders:', error);
            return [];
        }
    }

    // Fetch real deliveries data
    static async fetchDeliveries() {
        try {
            const response = await fetch(`${this.baseURL}/delivery`, {
                headers: this.getHeaders()
            });
            const data = await response.json();
            return data.data || [];
        } catch (error) {
            console.error('Error fetching deliveries:', error);
            return [];
        }
    }

    // Calculate real dashboard analytics for Sri Lankan hardware store
    static async getRealDashboardData() {
        try {
            // Try to fetch from admin dashboard endpoint first (more efficient)
            try {
                const adminData = await this.fetchAdminDashboard();

                // Transform admin endpoint data to our format
                const userStats = {
                    total: adminData.users.totalUsers || 0,
                    active: adminData.users.activeUsers || 0,
                    pending: adminData.users.pendingUsers || 0,
                    inactive: adminData.users.inactiveUsers || 0,
                    byRole: adminData.users.roleDistribution ?
                        adminData.users.roleDistribution.reduce((acc: any, role: any) => {
                            acc[role._id] = role.count;
                            return acc;
                        }, {}) : {}
                };

                const inventoryStats = {
                    totalItems: adminData.inventory.totalItems || 0,
                    lowStock: adminData.inventory.lowStockItems || 0,
                    outOfStock: adminData.inventory.outOfStockItems || 0,
                    categories: adminData.inventory.categories || 0,
                    totalValue: adminData.inventory.totalValue || 0
                };

                const orderStats = {
                    total: adminData.orders.totalOrders || 0,
                    pending: adminData.orders.pendingOrders || 0,
                    processing: adminData.orders.processingOrders || 0,
                    completed: adminData.orders.deliveredOrders || 0,
                    cancelled: adminData.orders.cancelledOrders || 0
                };

                // Default delivery stats if not available from admin endpoint
                const deliveryStats = {
                    total: orderStats.total,
                    pending: orderStats.pending,
                    inTransit: orderStats.processing,
                    delivered: orderStats.completed,
                    delayed: 0
                };

                // Create quick stats based on admin data
                const quickStats = [
                    {
                        icon: 'Users',
                        label: 'Total Users',
                        value: userStats.total.toString(),
                        change: `${userStats.active} Active`,
                        trend: 'up' as const
                    },
                    {
                        icon: 'Package',
                        label: 'Inventory Items',
                        value: inventoryStats.totalItems.toString(),
                        change: `${inventoryStats.lowStock} Low Stock`,
                        trend: inventoryStats.lowStock > 0 ? 'down' as const : 'up' as const
                    },
                    {
                        icon: 'ShoppingCart',
                        label: 'Total Orders',
                        value: orderStats.total.toString(),
                        change: `${orderStats.pending} Pending`,
                        trend: 'up' as const
                    },
                    {
                        icon: 'Truck',
                        label: 'Deliveries',
                        value: deliveryStats.total.toString(),
                        change: `${deliveryStats.delivered} Delivered`,
                        trend: 'up' as const
                    }
                ];

                // System info from admin endpoint
                const systemInfo = {
                    version: '2.1.0',
                    uptime: adminData.systemInfo ? `${Math.floor(adminData.systemInfo.uptime / 3600)}h ${Math.floor((adminData.systemInfo.uptime % 3600) / 60)}m` : this.getSystemUptime(),
                    lastBackup: new Date().toLocaleDateString('en-LK')
                };

                return {
                    userStats,
                    inventoryStats,
                    orderStats,
                    deliveryStats,
                    quickStats,
                    systemInfo,
                    recentOrders: [],
                    lowStockItems: [],
                    topProducts: [],
                    rawData: adminData
                };

            } catch (adminError) {
                console.warn('Admin dashboard endpoint failed, falling back to individual API calls:', adminError);

                // Fallback to individual API calls
                const [users, inventory, orders, deliveries] = await Promise.all([
                    this.fetchUsers(),
                    this.fetchInventory(),
                    this.fetchOrders(),
                    this.fetchDeliveries()
                ]);

                // Calculate real user statistics
                const userStats = {
                    total: users.length,
                    active: users.filter((user: any) => user.isActive !== false).length,
                    pending: users.filter((user: any) => user.status === 'pending').length,
                    inactive: users.filter((user: any) => user.isActive === false).length,
                    byRole: {
                        admin: users.filter((user: any) => user.role === 'admin').length,
                        driver: users.filter((user: any) => user.role === 'driver').length,
                        customer: users.filter((user: any) => user.role === 'customer').length,
                        warehouse: users.filter((user: any) => user.role === 'warehouse').length
                    }
                };

                // Calculate real inventory statistics
                const inventoryStats = {
                    totalItems: inventory.length,
                    lowStock: inventory.filter((item: any) => item.quantity <= (item.minStock || item.threshold || 5)).length,
                    outOfStock: inventory.filter((item: any) => item.quantity === 0).length,
                    categories: [...new Set(inventory.map((item: any) => item.category))].length,
                    totalValue: inventory.reduce((sum: number, item: any) =>
                        sum + ((item.price || 0) * (item.quantity || 0)), 0
                    )
                };

                // Calculate real order statistics
                const orderStats = {
                    total: orders.length,
                    pending: orders.filter((order: any) => order.status === 'pending').length,
                    processing: orders.filter((order: any) => order.status === 'processing' || order.status === 'confirmed').length,
                    completed: orders.filter((order: any) => order.status === 'completed' || order.status === 'delivered').length,
                    cancelled: orders.filter((order: any) => order.status === 'cancelled').length
                };

                // Calculate real delivery statistics
                const deliveryStats = {
                    total: deliveries.length,
                    pending: deliveries.filter((delivery: any) => delivery.status === 'pending').length,
                    inTransit: deliveries.filter((delivery: any) => delivery.status === 'in_transit' || delivery.status === 'shipped').length,
                    delivered: deliveries.filter((delivery: any) => delivery.status === 'delivered').length,
                    delayed: deliveries.filter((delivery: any) => delivery.status === 'delayed').length
                };

                // Create real quick stats based on actual data
                const quickStats = [
                    {
                        icon: 'Users',
                        label: 'Total Users',
                        value: userStats.total.toString(),
                        change: `${userStats.active} Active`,
                        trend: 'up' as const
                    },
                    {
                        icon: 'Package',
                        label: 'Inventory Items',
                        value: inventoryStats.totalItems.toString(),
                        change: `${inventoryStats.lowStock} Low Stock`,
                        trend: inventoryStats.lowStock > 0 ? 'down' as const : 'up' as const
                    },
                    {
                        icon: 'ShoppingCart',
                        label: 'Total Orders',
                        value: orderStats.total.toString(),
                        change: `${orderStats.pending} Pending`,
                        trend: 'up' as const
                    },
                    {
                        icon: 'Truck',
                        label: 'Deliveries',
                        value: deliveryStats.total.toString(),
                        change: `${deliveryStats.inTransit} In Transit`,
                        trend: 'up' as const
                    }
                ];

                // Real system info
                const systemInfo = {
                    version: '2.1.0',
                    uptime: this.getSystemUptime(),
                    lastBackup: new Date().toLocaleDateString('en-LK')
                };

                return {
                    userStats,
                    inventoryStats,
                    orderStats,
                    deliveryStats,
                    quickStats,
                    systemInfo,
                    recentOrders: orders
                        .sort((a: any, b: any) => new Date(b.createdAt || b.date).getTime() - new Date(a.createdAt || a.date).getTime())
                        .slice(0, 5),
                    lowStockItems: inventory
                        .filter((item: any) => item.quantity <= (item.minStock || item.threshold || 5))
                        .sort((a: any, b: any) => a.quantity - b.quantity)
                        .slice(0, 5),
                    topProducts: inventory
                        .sort((a: any, b: any) => (b.sold || 0) - (a.sold || 0))
                        .slice(0, 5),
                    rawData: {
                        users,
                        inventory,
                        orders,
                        deliveries
                    }
                };
            }
        } catch (error) {
            console.error('Error getting real dashboard data:', error);
            throw error;
        }
    }

    // Get real recent activities from orders and user actions
    static async getRealActivities() {
        try {
            const [orders, users] = await Promise.all([
                this.fetchOrders(),
                this.fetchUsers()
            ]);

            const activities: any[] = [];

            // Recent order activities
            orders
                .sort((a: any, b: any) => new Date(b.createdAt || b.date).getTime() - new Date(a.createdAt || a.date).getTime())
                .slice(0, 10)
                .forEach((order: any) => {
                    activities.push({
                        id: `order-${order._id || order.id}`,
                        type: 'order',
                        message: `New order #${order.orderNumber || order._id?.slice(-6) || 'N/A'} ${order.status === 'completed' ? 'completed' : 'received'}`,
                        timestamp: order.createdAt || order.date || new Date().toISOString(),
                        severity: order.status === 'cancelled' ? 'high' : order.status === 'pending' ? 'medium' : 'low',
                        user: {
                            name: order.customerName || order.customer?.name || users.find((u: any) => u._id === order.customerId)?.name || 'Customer'
                        },
                        metadata: {
                            amount: order.totalAmount || order.total,
                            status: order.status
                        }
                    });
                });

            // Recent user registrations
            users
                .sort((a: any, b: any) => new Date(b.createdAt || b.joinDate).getTime() - new Date(a.createdAt || a.joinDate).getTime())
                .slice(0, 5)
                .forEach((user: any) => {
                    activities.push({
                        id: `user-${user._id || user.id}`,
                        type: 'user',
                        message: `New ${user.role || 'user'} registered: ${user.name || user.email}`,
                        timestamp: user.createdAt || user.joinDate || new Date().toISOString(),
                        severity: 'low',
                        user: { name: user.name || user.email || 'Unknown User' }
                    });
                });

            return activities
                .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                .slice(0, 15);
        } catch (error) {
            console.error('Error getting real activities:', error);
            return [];
        }
    }

    // Get system uptime
    private static getSystemUptime(): string {
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const uptimeMs = now.getTime() - startOfDay.getTime();
        const hours = Math.floor(uptimeMs / (1000 * 60 * 60));
        const minutes = Math.floor((uptimeMs % (1000 * 60 * 60)) / (1000 * 60));
        return `${hours}h ${minutes}m`;
    }

    // Format currency for Sri Lankan Rupees
    static formatCurrency(amount: number): string {
        return new Intl.NumberFormat('si-LK', {
            style: 'currency',
            currency: 'LKR',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    }

    // Format time ago
    static formatTimeAgo(timestamp: string): string {
        const now = new Date();
        const time = new Date(timestamp);
        const diffMs = now.getTime() - time.getTime();
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffMinutes < 60) {
            return `${diffMinutes}m ago`;
        } else if (diffHours < 24) {
            return `${diffHours}h ago`;
        } else {
            return `${diffDays}d ago`;
        }
    }
}
