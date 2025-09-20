import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, Package, ShoppingCart, Shield, Activity as ActivityIcon, Bell, Search,
  CheckCircle, RefreshCw, AlertCircle, Clock, ArrowUpRight, ArrowDownRight, ArrowRight,
  Eye, UserCheck, UserX, AlertTriangle, BarChart3, Truck, User, Settings,
  MessageSquare, TrendingUp, UserPlus, Archive
} from 'lucide-react';
import { RealDashboardService } from '../services/realDashboardService';
import InventoryCategoryChart from '../components/InventoryCategoryChart';

interface DashboardData {
  userStats: {
    total: number;
    active: number;
    pending: number;
    inactive: number;
    byRole: Record<string, number>;
  };
  inventoryStats: {
    totalItems: number;
    lowStock: number;
    categories: number;
    totalValue: number;
  };
  orderStats: {
    total: number;
    pending: number;
    processing: number;
    completed: number;
  };
  deliveryStats: {
    total: number;
    pending: number;
    inTransit: number;
    delivered: number;
  };
  quickStats: Array<{
    icon: string;
    label: string;
    value: string;
    change: string;
    trend: 'up' | 'down';
  }>;
  systemInfo: {
    version: string;
    uptime: string;
    lastBackup: string;
  };
}

interface Activity {
  id: string;
  type: string;
  message: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  user: { name: string };
  metadata?: Record<string, any>;
}

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  threshold: number;
}

const AdminDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Mock user for demo
  const isAuthenticated = true;

  // Inventory management state
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingInventory, setLoadingInventory] = useState(false);

  // Filter items based on search
  const filteredItems = inventoryItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const loadInventoryItems = async () => {
    setLoadingInventory(true);
    try {
      // Fetch real inventory data from backend
      const realInventory = await RealDashboardService.fetchInventory();

      // Transform real inventory data to match our interface
      const transformedItems: InventoryItem[] = realInventory.map((item: any) => ({
        id: item._id || item.id,
        name: item.name || item.itemName || 'Unknown Item',
        category: item.category || 'Uncategorized',
        quantity: item.quantity || item.current_stock || 0,
        unit: item.unit || 'pcs',
        threshold: item.threshold || item.min_stock_level || 10
      }));

      setInventoryItems(transformedItems);
    } catch (error) {
      console.error('Failed to load inventory items:', error);
      // Fallback to empty array if real data fails
      setInventoryItems([]);
    } finally {
      setLoadingInventory(false);
    }
  };

  const loadActivities = async () => {
    try {
      // Fetch real activities from backend
      const realActivities = await RealDashboardService.getRealActivities();
      setActivities(realActivities);
    } catch (error) {
      console.error('Failed to load activities:', error);
      // Fallback to empty array if real data fails
      setActivities([]);
    }
  };

  const handleActivityClick = (activity: Activity) => {
    console.log('Activity clicked:', activity);
  };

  const getActivityIconComponent = (activity: Activity) => {
    const iconMap: Record<string, any> = {
      'user_login': Users,
      'user_logout': Users,
      'order_created': ShoppingCart,
      'order_updated': ShoppingCart,
      'inventory_updated': Package,
      'system_error': AlertCircle,
      'system_login': Shield,
      'data_access': Eye,
      'user_management': Users,
      'inventory_check': Package,
      'system_health': CheckCircle
    };

    return iconMap[activity.type] || ActivityIcon;
  };

  const getActivityColor = (activity: Activity) => {
    const colorMap: Record<string, string> = {
      'low': 'bg-green-500',
      'medium': 'bg-blue-500',
      'high': 'bg-orange-500',
      'critical': 'bg-red-500'
    };
    return colorMap[activity.severity] || 'bg-gray-500';
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const loadIntegratedDashboard = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch real dashboard data from backend
      const realData = await RealDashboardService.getRealDashboardData();

      // Debug log to verify data
      console.log('🔍 Real Dashboard Data:', realData);

      // Transform real data to match our interface
      const transformedData: DashboardData = {
        userStats: realData.userStats,
        inventoryStats: realData.inventoryStats,
        orderStats: realData.orderStats,
        deliveryStats: realData.deliveryStats,
        quickStats: realData.quickStats,
        systemInfo: realData.systemInfo
      };

      console.log('✅ Transformed Dashboard Data:', transformedData);
      setDashboardData(transformedData);

    } catch (error) {
      console.error('AdminDashboard: Error loading dashboard:', error);
      setError(error instanceof Error ? error.message : 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadIntegratedDashboard();
      loadActivities();
      loadInventoryItems();
    }
  }, [isAuthenticated]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Error</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={loadIntegratedDashboard}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Beautiful Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {dashboardData?.quickStats?.map((stat, index) => {
            const IconComponent = stat.icon === 'ShoppingCart' ? ShoppingCart :
              stat.icon === 'Users' ? Users :
                stat.icon === 'Truck' ? Truck :
                  stat.icon === 'CheckCircle' ? CheckCircle : ActivityIcon;

            const gradientClasses = [
              'from-blue-500 via-blue-600 to-blue-700',
              'from-green-500 via-emerald-600 to-green-700',
              'from-orange-500 via-red-500 to-red-600',
              'from-purple-500 via-indigo-600 to-purple-700'
            ];

            const bgClasses = [
              'from-blue-50 via-blue-100 to-indigo-100 dark:from-blue-900/20 dark:via-blue-800/30 dark:to-indigo-900/20',
              'from-green-50 via-emerald-100 to-green-100 dark:from-green-900/20 dark:via-emerald-800/30 dark:to-green-900/20',
              'from-orange-50 via-red-100 to-red-100 dark:from-orange-900/20 dark:via-red-800/30 dark:to-red-900/20',
              'from-purple-50 via-indigo-100 to-purple-100 dark:from-purple-900/20 dark:via-indigo-800/30 dark:to-purple-900/20'
            ];

            return (
              <div
                key={index}
                className={`group relative bg-gradient-to-br ${bgClasses[index]} rounded-3xl p-6 shadow-xl border border-white/50 dark:border-gray-700/50 hover:shadow-2xl transition-all duration-500 hover:scale-105 cursor-pointer overflow-hidden`}
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-xl transform translate-x-6 -translate-y-6 group-hover:scale-125 transition-transform duration-500"></div>
                <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full blur-lg transform -translate-x-4 translate-y-4 group-hover:scale-125 transition-transform duration-500"></div>

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-4 bg-gradient-to-br ${gradientClasses[index]} rounded-2xl shadow-2xl group-hover:rotate-6 transition-transform duration-500`}>
                      <IconComponent className="h-8 w-8 text-white group-hover:scale-110 transition-transform duration-300" />
                    </div>

                    <div className={`flex items-center px-3 py-2 rounded-full text-sm font-semibold shadow-lg ${stat.trend === 'up'
                      ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white'
                      : 'bg-gradient-to-r from-red-400 to-red-500 text-white'
                      }`}>
                      {stat.trend === 'up' ? (
                        <ArrowUpRight className="h-4 w-4 mr-1" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4 mr-1" />
                      )}
                      {stat.change}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
                      {stat.value}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 font-medium">
                      {stat.label}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Beautiful User Analytics */}
          <div className="lg:col-span-2 bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/50 dark:from-gray-800 dark:via-blue-900/10 dark:to-indigo-900/20 rounded-3xl shadow-xl p-8 border border-white/50 dark:border-gray-700/50 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-200/20 to-indigo-300/20 rounded-full blur-3xl transform translate-x-16 -translate-y-16"></div>

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-xl">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">User Analytics</h3>
                    <p className="text-gray-600 dark:text-gray-400">Real-time user management</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2 bg-white/70 dark:bg-gray-800/70 rounded-xl px-4 py-2 backdrop-blur-sm shadow-lg">
                    <Eye className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Live Data</span>
                  </div>
                  <div className="px-4 py-2 bg-gradient-to-r from-green-400 to-emerald-500 text-white rounded-xl text-sm font-semibold shadow-lg">
                    ✨ Connected
                  </div>
                </div>
              </div>

              {/* User Stats Grid */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Users</p>
                      <p className="text-2xl font-bold text-blue-600">{dashboardData?.userStats?.total || '0'}</p>
                    </div>
                    <Users className="h-8 w-8 text-blue-500" />
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active</p>
                      <p className="text-2xl font-bold text-green-600">{dashboardData?.userStats?.active || '0'}</p>
                    </div>
                    <UserCheck className="h-8 w-8 text-green-500" />
                  </div>
                </div>

                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending</p>
                      <p className="text-2xl font-bold text-yellow-600">{dashboardData?.userStats?.pending || '0'}</p>
                    </div>
                    <Clock className="h-8 w-8 text-yellow-500" />
                  </div>
                </div>

                <div className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Inactive</p>
                      <p className="text-2xl font-bold text-red-600">{dashboardData?.userStats?.inactive || '0'}</p>
                    </div>
                    <UserX className="h-8 w-8 text-red-500" />
                  </div>
                </div>
              </div>

              {/* Beautiful Role Distribution */}
              <div>
                <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
                    <Shield className="h-5 w-5 text-white" />
                  </div>
                  <span>Role Distribution</span>
                </h4>

                <div className="grid md:grid-cols-3 gap-6">
                  {['Admin', 'Driver', 'Customer'].map((role, index) => {
                    const roleCount = dashboardData?.userStats?.byRole?.[role.toLowerCase()] || 0;
                    const colors = [
                      'from-purple-500 to-indigo-600',
                      'from-green-500 to-emerald-600',
                      'from-blue-500 to-cyan-600'
                    ];
                    const icons = [Shield, Truck, User];
                    const Icon = icons[index];

                    return (
                      <div
                        key={role}
                        className="group relative bg-white/70 dark:bg-gray-800/70 rounded-2xl p-6 backdrop-blur-sm shadow-xl border border-white/50 dark:border-gray-700/50 hover:shadow-2xl transition-all duration-500 hover:scale-105 cursor-pointer overflow-hidden"
                      >
                        <div className={`absolute inset-0 bg-gradient-to-br ${colors[index]} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>

                        <div className="relative z-10">
                          <div className={`w-16 h-16 bg-gradient-to-br ${colors[index]} rounded-2xl flex items-center justify-center mb-4 shadow-xl group-hover:rotate-6 transition-transform duration-500`}>
                            <Icon className="h-8 w-8 text-white" />
                          </div>

                          <div className="space-y-2">
                            <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                              {role}s
                            </h4>
                            <p className="text-3xl font-extrabold text-gray-800 dark:text-gray-200">
                              {roleCount}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Active {role.toLowerCase()}s
                            </p>
                          </div>

                          <div className="mt-4 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className={`h-full bg-gradient-to-r ${colors[index]} rounded-full transform transition-all duration-1000 ease-out`}
                              style={{ width: `${Math.min((roleCount / 50) * 100, 100)}%` }}
                            ></div>
                          </div>
                        </div>

                        <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${colors[index]} opacity-10 rounded-bl-full group-hover:scale-125 transition-transform duration-500`}></div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Beautiful Recent Activity */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-white via-purple-50/30 to-pink-50/50 dark:from-gray-800 dark:via-purple-900/10 dark:to-pink-900/20 rounded-3xl shadow-xl p-8 border border-white/50 dark:border-gray-700/50 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-48 h-48 bg-gradient-to-br from-purple-200/20 to-pink-300/20 rounded-full blur-3xl transform -translate-x-8 -translate-y-8"></div>

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl shadow-xl">
                      <Bell className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Recent Activity</h3>
                      <p className="text-gray-600 dark:text-gray-400">Latest system events</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 bg-white/70 dark:bg-gray-800/70 rounded-xl px-4 py-2 backdrop-blur-sm shadow-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Live Updates</span>
                  </div>
                </div>

                <div className="space-y-4">
                  {activities.slice(0, 5).map((activity, index) => {
                    const IconComponent = getActivityIconComponent(activity);
                    const colorClass = getActivityColor(activity);
                    const timeAgo = formatTimeAgo(activity.timestamp);

                    return (
                      <div
                        key={activity.id}
                        onClick={() => handleActivityClick(activity)}
                        className="group relative bg-white/60 dark:bg-gray-800/60 rounded-2xl p-5 backdrop-blur-sm border border-white/30 dark:border-gray-700/30 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] cursor-pointer"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-500 to-pink-500 rounded-r-full group-hover:w-2 transition-all duration-300"></div>

                        <div className="flex items-start space-x-4 ml-4">
                          <div className={`p-3 rounded-2xl shadow-lg ${colorClass} group-hover:scale-110 transition-transform duration-300`}>
                            <IconComponent className="h-5 w-5 text-white" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-sm font-bold text-gray-900 dark:text-white">
                                {activity.message}
                              </p>
                              <div className={`px-3 py-1 text-xs rounded-full font-semibold ${activity.severity === 'critical' ? 'bg-red-100 text-red-700' :
                                activity.severity === 'high' ? 'bg-orange-100 text-orange-700' :
                                  activity.severity === 'medium' ? 'bg-blue-100 text-blue-700' :
                                    'bg-green-100 text-green-700'
                                }`}>
                                {activity.severity}
                              </div>
                            </div>

                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 flex items-center space-x-2">
                              <Clock className="h-3 w-3" />
                              <span>{timeAgo} • {activity.user.name}</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  <div className="pt-4 text-center">
                    <button
                      onClick={() => navigate('/admin/activities')}
                      className="group inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                    >
                      <span>View All Activities</span>
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Inventory Category Distribution Chart */}
        <div className="mb-8">
          <InventoryCategoryChart
            height={400}
            showControls={true}
            chartType="pie"
            className="shadow-xl"
          />
        </div>

        {/* Quick Inventory View */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Package className="h-6 w-6 text-green-500" />
              Quick Inventory View
            </h3>
            <button
              onClick={loadInventoryItems}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <RefreshCw className={`h-4 w-4 ${loadingInventory ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Package className="h-5 w-5 text-blue-500" />
                Current Inventory
              </h4>
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto">
              {loadingInventory ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
                </div>
              ) : filteredItems.length > 0 ? (
                filteredItems.map((item) => (
                  <div key={item.id} className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <h5 className="font-medium text-gray-900 dark:text-white truncate">{item.name}</h5>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{item.category} • {item.quantity} {item.unit}</p>
                        {item.quantity <= item.threshold && (
                          <div className="flex items-center gap-1 mt-1">
                            <AlertTriangle className="h-3 w-3 text-orange-500" />
                            <span className="text-xs text-orange-600 dark:text-orange-400">Low stock</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 ml-3">
                        <span className="text-sm font-medium text-gray-900 dark:text-white min-w-[3rem] text-center bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                          {item.quantity}
                        </span>
                        <div className={`w-2 h-2 rounded-full ${item.quantity > item.threshold ? 'bg-green-500' : 'bg-orange-500'}`} title={item.quantity > item.threshold ? 'In stock' : 'Low stock'}></div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  {searchTerm ? 'No items found' : 'No inventory items yet'}
                </div>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
              <button
                onClick={() => navigate('/inventory')}
                className="w-full text-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium text-sm"
              >
                View Full Inventory →
              </button>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Quick Actions</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[
              { title: 'User Management', icon: Users, color: 'from-blue-500 to-blue-600', link: '/users' },
              { title: 'Inventory Control', icon: Package, color: 'from-green-500 to-green-600', link: '/inventory' },
              { title: 'Order Management', icon: ShoppingCart, color: 'from-orange-500 to-red-600', link: '/orders' },
              { title: 'Driver Management', icon: User, color: 'from-purple-500 to-purple-600', link: '/driver-management' },
              { title: 'Delivery Tracking', icon: Truck, color: 'from-blue-500 to-blue-600', link: '/deliveries' },
              { title: 'Customer Approval', icon: UserPlus, color: 'from-indigo-500 to-indigo-600', link: '/customer-approval' },
              { title: 'System Reports', icon: BarChart3, color: 'from-orange-500 to-red-500', link: '/admin/reports' },
              { title: 'Activity Logs', icon: ActivityIcon, color: 'from-yellow-500 to-yellow-600', link: '/admin/activities' },
              { title: 'Audit Logs', icon: Archive, color: 'from-gray-500 to-gray-600', link: '/admin/audit-logs' },
              { title: 'Message Center', icon: MessageSquare, color: 'from-teal-500 to-teal-600', link: '/admin/messages' },
              { title: 'Material Prediction', icon: TrendingUp, color: 'from-pink-500 to-pink-600', link: '/predictions' },
              { title: 'System Settings', icon: Settings, color: 'from-gray-500 to-gray-600', link: '/admin/settings' }
            ].map((action, index) => (
              <button
                key={index}
                onClick={() => window.location.href = action.link}
                className="group p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-transparent hover:shadow-lg transition-all duration-300 bg-white dark:bg-gray-800 hover:bg-gradient-to-r hover:from-white hover:to-gray-50 dark:hover:from-gray-800 dark:hover:to-gray-700"
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-3 rounded-lg bg-gradient-to-r ${action.color} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <action.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-left">
                    <h4 className="font-semibold text-gray-900 dark:text-white group-hover:text-gray-700 dark:group-hover:text-gray-200">
                      {action.title}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Quick access
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
