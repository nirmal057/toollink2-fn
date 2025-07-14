import React, { useState, useEffect } from 'react';
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
    Button,
    Input,
    Badge,
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
    Alert,
    AlertDescription,
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui';
import {
    Search,
    Filter,
    Bell,
    Clock,
    CheckCircle,
    AlertTriangle,
    Package,
    Truck,
    Star,
    Camera,
    Edit3,
    MessageSquare,
    RefreshCw,
    TrendingUp,
    Users,
    ShoppingCart,
    BarChart3
} from 'lucide-react';
import InteractiveOrderSystem from './InteractiveOrderSystem';

interface CashierDashboardProps {
    user: {
        _id: string;
        fullName: string;
        role: string;
    };
}

const CashierDashboard: React.FC<CashierDashboardProps> = ({ user }) => {
    const [activeTab, setActiveTab] = useState('overview');
    const [orders, setOrders] = useState([]);
    const [pendingAdjustments, setPendingAdjustments] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [stats, setStats] = useState({
        todayOrders: 0,
        pendingAdjustments: 0,
        completedFeedback: 0,
        avgResponseTime: 0,
        avgSatisfaction: 0
    });
    const [loading, setLoading] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [filters, setFilters] = useState({
        status: 'all',
        search: '',
        dateRange: 'today'
    });

    useEffect(() => {
        loadDashboardData();
        loadPendingAdjustments();
        loadNotifications();

        // Set up real-time updates every 30 seconds
        const interval = setInterval(() => {
            loadDashboardData();
            loadPendingAdjustments();
        }, 30000);

        return () => clearInterval(interval);
    }, []);

    const loadDashboardData = async () => {
        try {
            setLoading(true);

            // Load orders
            const ordersResponse = await fetch('/api/orders?' + new URLSearchParams({
                limit: '50',
                status: filters.status !== 'all' ? filters.status : '',
                search: filters.search
            }), {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });

            const ordersData = await ordersResponse.json();
            if (ordersData.success) {
                setOrders(ordersData.data);
            }

            // Load statistics
            const statsResponse = await fetch('/api/orders/stats', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });

            const statsData = await statsResponse.json();
            if (statsData.success) {
                setStats(prev => ({
                    ...prev,
                    ...statsData.data
                }));
            }

        } catch (error) {
            console.error('Failed to load dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadPendingAdjustments = async () => {
        try {
            const response = await fetch('/api/orders/adjustments/pending', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });

            const data = await response.json();
            if (data.success) {
                setPendingAdjustments(data.data);
                setStats(prev => ({
                    ...prev,
                    pendingAdjustments: data.data.length
                }));
            }
        } catch (error) {
            console.error('Failed to load pending adjustments:', error);
        }
    };

    const loadNotifications = async () => {
        try {
            const response = await fetch('/api/notifications', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });

            const data = await response.json();
            if (data.success) {
                setNotifications(data.data.slice(0, 5)); // Show only recent 5
            }
        } catch (error) {
            console.error('Failed to load notifications:', error);
        }
    };

    const handleQuickStatusUpdate = async (orderId: string, newStatus: string) => {
        try {
            const response = await fetch(`/api/orders/${orderId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (response.ok) {
                loadDashboardData(); // Refresh data
            }
        } catch (error) {
            console.error('Failed to update order status:', error);
        }
    };

    const getStatusBadge = (status: string) => {
        const statusColors = {
            pending: 'bg-yellow-100 text-yellow-800',
            confirmed: 'bg-blue-100 text-blue-800',
            processing: 'bg-orange-100 text-orange-800',
            shipped: 'bg-purple-100 text-purple-800',
            delivered: 'bg-green-100 text-green-800',
            cancelled: 'bg-red-100 text-red-800'
        };

        return (
            <Badge className={statusColors[status] || 'bg-gray-100 text-gray-800'}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
        );
    };

    const getPriorityColor = (priority: string) => {
        const colors = {
            low: 'text-green-600',
            medium: 'text-yellow-600',
            high: 'text-orange-600',
            urgent: 'text-red-600'
        };
        return colors[priority] || 'text-gray-600';
    };

    const renderStatsCard = (title: string, value: string | number, icon: React.ReactNode, color: string, subtitle?: string) => (
        <Card>
            <CardContent className="p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-600">{title}</p>
                        <div className="flex items-center gap-2">
                            <span className={`text-2xl font-bold ${color}`}>{value}</span>
                            {subtitle && (
                                <span className="text-sm text-gray-500">{subtitle}</span>
                            )}
                        </div>
                    </div>
                    <div className={`p-3 rounded-lg ${color.replace('text-', 'bg-').replace('600', '100')}`}>
                        {icon}
                    </div>
                </div>
            </CardContent>
        </Card>
    );

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                Cashier Dashboard
                            </h1>
                            <p className="text-gray-600">
                                Welcome back, {user.fullName}
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            <Button
                                variant="outline"
                                onClick={loadDashboardData}
                                disabled={loading}
                            >
                                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                                Refresh
                            </Button>
                            <div className="relative">
                                <Button variant="outline" size="icon">
                                    <Bell className="w-4 h-4" />
                                </Button>
                                {notifications.length > 0 && (
                                    <Badge className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full px-1 text-xs">
                                        {notifications.length}
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                    {renderStatsCard(
                        "Today's Orders",
                        stats.todayOrders,
                        <ShoppingCart className="w-6 h-6" />,
                        "text-blue-600"
                    )}
                    {renderStatsCard(
                        "Pending Adjustments",
                        stats.pendingAdjustments,
                        <Clock className="w-6 h-6" />,
                        "text-orange-600"
                    )}
                    {renderStatsCard(
                        "Feedback Completed",
                        stats.completedFeedback,
                        <MessageSquare className="w-6 h-6" />,
                        "text-green-600"
                    )}
                    {renderStatsCard(
                        "Avg Response Time",
                        `${stats.avgResponseTime}`,
                        <TrendingUp className="w-6 h-6" />,
                        "text-purple-600",
                        "minutes"
                    )}
                    {renderStatsCard(
                        "Avg Satisfaction",
                        `${stats.avgSatisfaction}`,
                        <Star className="w-6 h-6" />,
                        "text-yellow-600",
                        "/5"
                    )}
                </div>

                {/* Main Content Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="orders">Order Management</TabsTrigger>
                        <TabsTrigger value="adjustments">
                            Adjustments
                            {pendingAdjustments.length > 0 && (
                                <Badge variant="secondary" className="ml-2">
                                    {pendingAdjustments.length}
                                </Badge>
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="feedback">Feedback</TabsTrigger>
                    </TabsList>

                    {/* Overview Tab */}
                    <TabsContent value="overview" className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Recent Orders */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Recent Orders</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {orders.slice(0, 5).map((order) => (
                                            <div key={order._id} className="flex items-center justify-between p-3 border rounded-lg">
                                                <div>
                                                    <p className="font-medium">{order.orderNumber}</p>
                                                    <p className="text-sm text-gray-600">{order.customer?.fullName}</p>
                                                </div>
                                                <div className="text-right">
                                                    {getStatusBadge(order.status)}
                                                    <p className="text-sm text-gray-500 mt-1">
                                                        Rs. {order.finalAmount?.toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Pending Adjustments */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <AlertTriangle className="w-5 h-5 text-orange-500" />
                                        Urgent Adjustments
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {pendingAdjustments
                                            .filter(adj => adj.adjustment.urgency === 'urgent' || adj.adjustment.urgency === 'high')
                                            .slice(0, 3)
                                            .map((adjustment) => (
                                                <div key={adjustment._id} className="flex items-center justify-between p-3 border rounded-lg">
                                                    <div>
                                                        <p className="font-medium">{adjustment.orderNumber}</p>
                                                        <p className="text-sm text-gray-600">
                                                            {adjustment.adjustment.type.replace('_', ' ')}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className={`text-sm font-medium ${getPriorityColor(adjustment.adjustment.urgency)}`}>
                                                            {adjustment.adjustment.urgency}
                                                        </span>
                                                        <p className="text-xs text-gray-500">
                                                            {new Date(adjustment.adjustment.requestedAt).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Quick Actions */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Quick Actions</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <Button
                                        variant="outline"
                                        className="h-20 flex flex-col gap-2"
                                        onClick={() => setActiveTab('orders')}
                                    >
                                        <Package className="w-6 h-6" />
                                        <span>View Orders</span>
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="h-20 flex flex-col gap-2"
                                        onClick={() => setActiveTab('adjustments')}
                                    >
                                        <Edit3 className="w-6 h-6" />
                                        <span>Process Adjustments</span>
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="h-20 flex flex-col gap-2"
                                        onClick={() => setActiveTab('feedback')}
                                    >
                                        <MessageSquare className="w-6 h-6" />
                                        <span>Record Feedback</span>
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="h-20 flex flex-col gap-2"
                                    >
                                        <BarChart3 className="w-6 h-6" />
                                        <span>View Reports</span>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Orders Tab */}
                    <TabsContent value="orders" className="space-y-6">
                        {/* Filters */}
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex flex-wrap gap-4 items-center">
                                    <div className="flex items-center gap-2">
                                        <Search className="w-4 h-4 text-gray-500" />
                                        <Input
                                            placeholder="Search orders..."
                                            value={filters.search}
                                            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                                            className="w-64"
                                        />
                                    </div>
                                    <Select
                                        value={filters.status}
                                        onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
                                    >
                                        <SelectTrigger className="w-40">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Status</SelectItem>
                                            <SelectItem value="pending">Pending</SelectItem>
                                            <SelectItem value="confirmed">Confirmed</SelectItem>
                                            <SelectItem value="processing">Processing</SelectItem>
                                            <SelectItem value="shipped">Shipped</SelectItem>
                                            <SelectItem value="delivered">Delivered</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Button onClick={loadDashboardData} disabled={loading}>
                                        <Filter className="w-4 h-4 mr-2" />
                                        Apply Filters
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Orders Table */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Orders Management</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Order #</TableHead>
                                            <TableHead>Customer</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Amount</TableHead>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {orders.map((order) => (
                                            <TableRow key={order._id}>
                                                <TableCell className="font-medium">
                                                    {order.orderNumber}
                                                </TableCell>
                                                <TableCell>
                                                    <div>
                                                        <p className="font-medium">{order.customer?.fullName}</p>
                                                        <p className="text-sm text-gray-500">{order.customer?.phone}</p>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {getStatusBadge(order.status)}
                                                </TableCell>
                                                <TableCell>
                                                    Rs. {order.finalAmount?.toLocaleString()}
                                                </TableCell>
                                                <TableCell>
                                                    {new Date(order.createdAt).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex gap-2">
                                                        <Dialog>
                                                            <DialogTrigger asChild>
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() => setSelectedOrder(order)}
                                                                >
                                                                    <Edit3 className="w-4 h-4 mr-1" />
                                                                    Manage
                                                                </Button>
                                                            </DialogTrigger>
                                                            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                                                                <DialogHeader>
                                                                    <DialogTitle>
                                                                        Manage Order {order.orderNumber}
                                                                    </DialogTitle>
                                                                </DialogHeader>
                                                                {selectedOrder && (
                                                                    <InteractiveOrderSystem
                                                                        order={selectedOrder}
                                                                        onOrderUpdate={(updatedOrder) => {
                                                                            setSelectedOrder(updatedOrder);
                                                                            loadDashboardData();
                                                                        }}
                                                                    />
                                                                )}
                                                            </DialogContent>
                                                        </Dialog>

                                                        {order.status !== 'delivered' && order.status !== 'cancelled' && (
                                                            <Select
                                                                value={order.status}
                                                                onValueChange={(newStatus) => handleQuickStatusUpdate(order._id, newStatus)}
                                                            >
                                                                <SelectTrigger className="w-32">
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="pending">Pending</SelectItem>
                                                                    <SelectItem value="confirmed">Confirmed</SelectItem>
                                                                    <SelectItem value="processing">Processing</SelectItem>
                                                                    <SelectItem value="shipped">Shipped</SelectItem>
                                                                    <SelectItem value="delivered">Delivered</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Adjustments Tab */}
                    <TabsContent value="adjustments" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Pending Order Adjustments</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {pendingAdjustments.length === 0 ? (
                                    <div className="text-center py-8 text-gray-500">
                                        <Clock size={48} className="mx-auto mb-4 opacity-50" />
                                        <p>No pending adjustment requests</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {pendingAdjustments.map((request) => (
                                            <div key={request._id} className="border rounded-lg p-4">
                                                <div className="flex items-start justify-between mb-2">
                                                    <div>
                                                        <h4 className="font-medium">
                                                            Order {request.orderNumber}
                                                        </h4>
                                                        <p className="text-sm text-gray-600">
                                                            Customer: {request.customer}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <Badge className="mb-1">
                                                            {request.adjustment.status}
                                                        </Badge>
                                                        <p className={`text-sm font-medium ${getPriorityColor(request.adjustment.urgency)}`}>
                                                            {request.adjustment.urgency} priority
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="mb-3">
                                                    <p className="text-sm text-gray-600 mb-1">
                                                        Type: {request.adjustment.type.replace('_', ' ').toUpperCase()}
                                                    </p>
                                                    <p className="text-sm">
                                                        <strong>Reason:</strong> {request.adjustment.reason}
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        Requested {new Date(request.adjustment.requestedAt).toLocaleString()}
                                                    </p>
                                                </div>

                                                <div className="flex gap-2">
                                                    <Dialog>
                                                        <DialogTrigger asChild>
                                                            <Button
                                                                size="sm"
                                                                onClick={() => {
                                                                    // Find the full order object
                                                                    const fullOrder = orders.find(o => o.orderNumber === request.orderNumber);
                                                                    if (fullOrder) setSelectedOrder(fullOrder);
                                                                }}
                                                            >
                                                                <Edit3 className="w-4 h-4 mr-1" />
                                                                Process Adjustment
                                                            </Button>
                                                        </DialogTrigger>
                                                        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                                                            <DialogHeader>
                                                                <DialogTitle>
                                                                    Process Order Adjustment - {request.orderNumber}
                                                                </DialogTitle>
                                                            </DialogHeader>
                                                            {selectedOrder && (
                                                                <InteractiveOrderSystem
                                                                    order={selectedOrder}
                                                                    onOrderUpdate={(updatedOrder) => {
                                                                        setSelectedOrder(updatedOrder);
                                                                        loadPendingAdjustments();
                                                                        loadDashboardData();
                                                                    }}
                                                                />
                                                            )}
                                                        </DialogContent>
                                                    </Dialog>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Feedback Tab */}
                    <TabsContent value="feedback" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Customer Feedback Management</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {orders
                                        .filter(order => order.status === 'delivered' && !order.customerFeedback?.deliveryFeedback)
                                        .slice(0, 10)
                                        .map((order) => (
                                            <div key={order._id} className="border rounded-lg p-4">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <h4 className="font-medium">Order {order.orderNumber}</h4>
                                                        <p className="text-sm text-gray-600">
                                                            Customer: {order.customer?.fullName}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            Delivered: {order.delivery?.actualDate ?
                                                                new Date(order.delivery.actualDate).toLocaleDateString() :
                                                                'Recently'
                                                            }
                                                        </p>
                                                    </div>
                                                    <Dialog>
                                                        <DialogTrigger asChild>
                                                            <Button
                                                                size="sm"
                                                                onClick={() => setSelectedOrder(order)}
                                                            >
                                                                <MessageSquare className="w-4 h-4 mr-1" />
                                                                Record Feedback
                                                            </Button>
                                                        </DialogTrigger>
                                                        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                                                            <DialogHeader>
                                                                <DialogTitle>
                                                                    Record Customer Feedback - {order.orderNumber}
                                                                </DialogTitle>
                                                            </DialogHeader>
                                                            {selectedOrder && (
                                                                <InteractiveOrderSystem
                                                                    order={selectedOrder}
                                                                    onOrderUpdate={(updatedOrder) => {
                                                                        setSelectedOrder(updatedOrder);
                                                                        loadDashboardData();
                                                                    }}
                                                                />
                                                            )}
                                                        </DialogContent>
                                                    </Dialog>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
};

export default CashierDashboard;
