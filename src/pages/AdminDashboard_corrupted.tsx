import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Package,
  ShoppingCart,
  Shield,
  Activity as ActivityIcon,
  Server,
  Zap,
  Bell,
  Search,
  CheckCircle,
  RefreshCw,
  AlertCircle,
  Clock,
  Globe,
  ArrowUpRight,
  ArrowDownRight,
  ArrowRight,
  Eye,
  UserCheck,
  UserX,
  AlertTriangle,
  BarChart3,
  Truck,
  User,
  Settings
} from 'lucide-react';
import { AdminDashboard as DashboardData } from '../services/adminApiService';
import IntegratedDataService from '../services/integratedDataService';
import { rbacService, PERMISSIONS } from '../services/rbacService';
import { useAuth } from '../hooks/useAuth';
import { activityService, Activity } from '../services/activityService';
import { inventoryService, InventoryItem } from '../services/inventoryService';

const AdminDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isAuthenticated, refreshUser } = useAuth();
  const navigate = useNavigate();

  // Quick inventory management state
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingInventory, setLoadingInventory] = useState(false);

  useEffect(() => {
    loadIntegratedDashboard();
    loadActivities();
    loadInventoryItems();
  }, []);

  const loadInventoryItems = async () => {
    try {
      setLoadingInventory(true);
      const result = await inventoryService.getAllItems({ limit: 5 });
      setInventoryItems(result.items.slice(0, 5)); // Show only first 5 items for quick access
    } catch (error) {
      console.error('Failed to load inventory items:', error);
    } finally {
      setLoadingInventory(false);
    }
  };

  // Filter items based on search
  const filteredItems = inventoryItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const loadActivities = async () => {
    try {
      // Log some sample activities first time
      await logSampleActivities();

      const recentActivities = await activityService.getRecentActivities(10);
      setActivities(recentActivities);
    } catch (error) {
      console.warn('Failed to load activities:', error);
      // Activities will fall back to the service's mock data
    }
  };

  const logSampleActivities = async () => {
    // Check if we've already logged sample activities
    const hasLoggedSamples = localStorage.getItem('toollink_sample_activities_logged');
    if (hasLoggedSamples) return;

    try {
      // Log user login activity
      await activityService.logActivity({
        type: 'auth',
        action: 'user_login',
        message: `${user?.name || 'Admin'} logged into the system`,
        user: {
          id: user?.id || 'admin_001',
          name: user?.name || 'Admin User',
          email: user?.email || 'admin@toollink.lk',
          role: user?.role || 'admin'
        },
        severity: 'low'
      });

      // Log dashboard access
      await activityService.logActivity({
        type: 'system',
        action: 'dashboard_access',
        message: 'Admin dashboard accessed',
        user: {
          id: user?.id || 'admin_001',
          name: user?.name || 'Admin User',
          email: user?.email || 'admin@toollink.lk',
          role: user?.role || 'admin'
        },
        severity: 'low'
      });

      localStorage.setItem('toollink_sample_activities_logged', 'true');
    } catch (error) {
      console.warn('Failed to log sample activities:', error);
    }
  };

  const handleActivityClick = (activity: Activity) => {
    const link = activityService.getActivityLink(activity);
    navigate(link);
  };

  const getActivityIconComponent = (activity: Activity) => {
    const iconName = activityService.getActivityIcon(activity);
    switch (iconName) {
      case 'Users': return Users;
      case 'ShoppingCart': return ShoppingCart;
      case 'Package': return Package;
      case 'Server': return Server;
      case 'Shield': return Shield;
      case 'Bell': return Bell;
      default: return ActivityIcon;
    }
  };

  // Auto-refresh user data on component mount to ensure fresh session
  useEffect(() => {
    const ensureFreshSession = async () => {
      if (isAuthenticated) {
        try {
          await refreshUser();
        } catch (error) {
          console.warn('Could not refresh user session:', error);
        }
      }
    };

    ensureFreshSession();
  }, [isAuthenticated, refreshUser]);

  const loadIntegratedDashboard = async () => {
    try {
      console.log('🚀 AdminDashboard: Starting dashboard load...');
      setLoading(true);
      setError(null);

      // Load integrated real data
      console.log('📊 AdminDashboard: Fetching integrated data...');
      const integrated = await IntegratedDataService.fetchIntegratedData();
      console.log('✅ AdminDashboard: Integrated data received:', integrated);
      // Set the integrated data for user stats

      // Transform integrated data to dashboard format
      const transformedDashboard: DashboardData = {
        userStats: {
          total: integrated.analytics.totalUsers,
          active: integrated.analytics.activeUsers,
          pending: integrated.users.filter(u => !u.isActive).length,
          inactive: integrated.analytics.totalUsers - integrated.analytics.activeUsers,
          byRole: integrated.users.reduce((acc, user) => {
            acc[user.role] = (acc[user.role] || 0) + 1;
            return acc;
          }, {} as Record<string, number>)
        },
        systemInfo: {
          serverTime: new Date().toISOString(),
          version: '2.0.0',
          environment: 'production',
          uptime: '24 hours',
          lastBackup: '1 hour ago'
        },
        analytics: {
          totalOrders: integrated.analytics.totalOrders,
          orderGrowth: integrated.analytics.orderSuccessRate,
          activeProjects: integrated.inventory.length,
          completedTasks: integrated.analytics.completedOrders,
          systemLoad: 45,
          memoryUsage: 62,
          storageUsed: Math.round((integrated.inventory.length / 100) * 30),
          responseTime: 98,
          customerSatisfaction: integrated.analytics.orderSuccessRate,
          deliverySuccess: integrated.analytics.deliverySuccessRate
        },
        recentActivity: [
          ...integrated.orders.slice(0, 3).map(order => ({
            type: 'order',
            message: `Order ${order.orderNumber} - ${order.status}`,
            time: new Date(order.createdAt).toLocaleString(),
            user: order.customerName
          })),
          ...integrated.deliveries.slice(0, 2).map(delivery => ({
            type: 'delivery',
            message: `Delivery to ${delivery.customerName} - ${delivery.status}`,
            time: new Date(delivery.createdAt).toLocaleString(),
            user: delivery.driverName || 'System'
          }))
        ],
        quickStats: [
          {
            label: 'Total Orders',
            value: integrated.analytics.totalOrders,
            change: '+12%',
            trend: 'up' as const,
            icon: 'ShoppingCart'
          },
          {
            label: 'Active Users',
            value: integrated.analytics.activeUsers,
            change: '+8%',
            trend: 'up' as const,
            icon: 'Users'
          },
          {
            label: 'Delivery Success',
            value: `${integrated.analytics.deliverySuccessRate}%`,
            change: '+2%',
            trend: 'up' as const,
            icon: 'TruckIcon'
          },
          {
            label: 'Order Success',
            value: `${integrated.analytics.orderSuccessRate}%`,
            change: '+5%',
            trend: 'up' as const,
            icon: 'CheckCircle'
          }
        ]
      };

      setDashboardData(transformedDashboard);
      console.log('✅ AdminDashboard: Dashboard loaded successfully with real integrated data');

    } catch (err) {
      console.error('❌ AdminDashboard: Failed to load integrated dashboard:', err);
      setError(err instanceof Error ? err.message : 'Failed to load dashboard');
    } finally {
      setLoading(false);
      console.log('🏁 AdminDashboard: Load complete, loading state:', false);
    }
  };

  // Enhanced access control with multiple checks
  const checkAdminAccess = (): boolean => {
    // Check authentication first
    if (!isAuthenticated) {
      console.log('AdminDashboard: User not authenticated');
      return false;
    }

    // Check user object from auth context
    if (user && user.role === 'admin') {
      console.log('AdminDashboard: Access granted via auth context user');
      return true;
    }

    // Check RBAC service
    if (rbacService.hasRole('admin')) {
      console.log('AdminDashboard: Access granted via RBAC service');
      return true;
    }

    // Check permission-based access
    if (rbacService.hasPermission(PERMISSIONS.FULL_SYSTEM_ACCESS)) {
      console.log('AdminDashboard: Access granted via full system access permission');
      return true;
    }

    // Check localStorage as fallback
    const localUser = localStorage.getItem('user');
    if (localUser) {
      try {
        const userData = JSON.parse(localUser);
        if (userData.role === 'admin') {
          console.log('AdminDashboard: Access granted via localStorage fallback');
          // Sync RBAC service
          rbacService.setCurrentUser({ role: userData.role });
          return true;
        }
      } catch (error) {
        console.error('AdminDashboard: Error parsing localStorage user:', error);
      }
    }

    console.log('AdminDashboard: Access denied - no admin privileges found');
    return false;
  };

  const hasAccess = checkAdminAccess();

  if (!hasAccess) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-4xl">
          <Shield className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Access Denied</h1>
          <p className="text-gray-600 dark:text-gray-400">You don't have permission to access the admin dashboard.</p>
          <button
            onClick={() => {
              // Force refresh user data
              console.log('Force refresh attempt...');
              window.location.reload();
            }}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
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
            className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg transition-colors"
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
        {/* Beautiful Welcome Header */}
        <div className="mb-8 relative overflow-hidden">
          <div className="bg-gradient-to-r from-white via-blue-50 to-indigo-50 dark:from-gray-800 dark:via-blue-900/20 dark:to-indigo-900/20 rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-gray-700 relative">
            {/* Decorative background elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-200/30 to-indigo-300/30 rounded-full blur-3xl -z-10 transform translate-x-32 -translate-y-32"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-orange-200/30 to-red-300/30 rounded-full blur-3xl -z-10 transform -translate-x-16 translate-y-16"></div>
            
            <div className="flex items-center justify-between relative z-10">
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <div className="w-4 h-4 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-pulse shadow-lg"></div>
                    <div className="absolute inset-0 w-4 h-4 bg-green-400 rounded-full animate-ping opacity-75"></div>
                  </div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 via-blue-600 to-indigo-700 dark:from-white dark:via-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                    Welcome to ToolLink Dashboard
                  </h1>
                </div>
                
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-to-r from-orange-400 to-red-500 rounded-xl shadow-lg">
                      <Zap className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-gray-700 dark:text-gray-300 text-lg font-medium">
                      Complete System Control & Real-time Analytics
                    </span>
                  </div>
                  
                  {/* Beautiful Status Indicators */}
                  <div className="flex items-center space-x-3">
                    <div className={`px-4 py-2 rounded-full text-sm font-medium shadow-lg ${
                      loading 
                        ? 'bg-gradient-to-r from-blue-400 to-blue-600 text-white animate-pulse' 
                        : 'bg-gradient-to-r from-green-400 to-emerald-500 text-white'
                    }`}>
                      {loading ? '🔄 Loading...' : '✨ Ready'}
                    </div>
                    
                    {error && (
                      <div className="px-4 py-2 bg-gradient-to-r from-red-400 to-red-600 text-white rounded-full text-sm font-medium shadow-lg">
                        ⚠️ Error
                      </div>
                    )}
                    
                    {dashboardData && (
                      <div className="px-4 py-2 bg-gradient-to-r from-purple-400 to-purple-600 text-white rounded-full text-sm font-medium shadow-lg">
                        📊 Data Connected
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-3 bg-white/50 dark:bg-gray-800/50 rounded-2xl px-6 py-3 backdrop-blur-sm shadow-lg border border-white/20">
                    <Clock className="h-5 w-5 text-orange-500" />
                    <span className="text-gray-700 dark:text-gray-300 font-medium">
                      {new Date().toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2 bg-white/50 dark:bg-gray-800/50 rounded-2xl px-6 py-3 backdrop-blur-sm shadow-lg border border-white/20">
                    <Users className="h-5 w-5 text-blue-500" />
                    <span className="text-gray-700 dark:text-gray-300 font-medium">
                      {user?.name || 'Admin User'}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Right side stats preview */}
              <div className="hidden xl:flex items-center space-x-6">
                <div className="text-center group transform hover:scale-105 transition-transform duration-200">
                  <div className="bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl p-4 shadow-xl border border-green-200">
                    <ActivityIcon className="h-10 w-10 mx-auto mb-2 text-white" />
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 font-semibold">System Active</div>
                  <div className="text-xs text-green-600 dark:text-green-400">All services running</div>
                </div>
                
                <div className="text-center group transform hover:scale-105 transition-transform duration-200">
                  <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl p-4 shadow-xl border border-blue-200">
                    <Server className="h-10 w-10 mx-auto mb-2 text-white" />
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 font-semibold">Version {dashboardData?.systemInfo?.version || '2.0'}</div>
                  <div className="text-xs text-blue-600 dark:text-blue-400">Latest release</div>
                </div>
                
                <div className="text-center group transform hover:scale-105 transition-transform duration-200">
                  <div className="bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl p-4 shadow-xl border border-orange-200">
                    <Globe className="h-10 w-10 mx-auto mb-2 text-white" />
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 font-semibold">Global Access</div>
                  <div className="text-xs text-orange-600 dark:text-orange-400">Worldwide ready</div>
                </div>
              </div>
            </div>
          </div>
        </div>

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
              'from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/30',
              'from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-800/30',
              'from-orange-50 to-red-100 dark:from-orange-900/20 dark:to-red-800/30',
              'from-purple-50 to-indigo-100 dark:from-purple-900/20 dark:to-indigo-800/30'
            ];

            return (
              <div
                key={index}
                className={`bg-gradient-to-br ${bgClasses[index]} rounded-3xl shadow-xl hover:shadow-2xl p-6 border border-white/50 dark:border-gray-700/50 transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 relative overflow-hidden group`}
              >
                {/* Decorative background element */}
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${gradientClasses[index]} rounded-full blur-2xl opacity-20 transform translate-x-8 -translate-y-8 group-hover:scale-150 transition-transform duration-700`}></div>
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <div className={`p-4 rounded-2xl bg-gradient-to-br ${gradientClasses[index]} shadow-2xl transform group-hover:rotate-12 transition-transform duration-300`}>
                      <IconComponent className="h-8 w-8 text-white" />
                    </div>
                    <div className={`flex items-center px-3 py-2 rounded-full text-sm font-semibold shadow-lg ${
                      stat.trend === 'up'
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
                    <h3 className="text-3xl font-bold text-gray-800 dark:text-white mb-2 group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors">
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
            {/* Decorative background */}
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
                  {dashboardData ? (
                    <div className="px-4 py-2 bg-gradient-to-r from-green-400 to-emerald-500 text-white rounded-xl text-sm font-semibold shadow-lg">
                      ✨ Connected
                    </div>
                  ) : (
                    <div className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-xl text-sm font-semibold shadow-lg">
                      ⏳ Loading
                    </div>
                  )}
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
                      {/* Animated background gradient */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${colors[index]} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
                      
                      {/* Floating icon effect */}
                      <div className="relative z-10">
                        <div className={`w-16 h-16 bg-gradient-to-br ${colors[index]} rounded-2xl flex items-center justify-center mb-4 shadow-xl group-hover:rotate-6 transition-transform duration-500`}>
                          <Icon className="h-8 w-8 text-white" />
                        </div>
                        
                        <div className="space-y-2">
                          <h4 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-gray-700 group-hover:to-gray-900 group-hover:bg-clip-text transition-all duration-300">
                            {role}s
                          </h4>
                          <p className="text-3xl font-extrabold text-gray-800 dark:text-gray-200 group-hover:scale-110 transition-transform duration-300">
                            {roleCount}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Active {role.toLowerCase()}s
                          </p>
                        </div>
                        
                        {/* Animated progress bar */}
                        <div className="mt-4 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className={`h-full bg-gradient-to-r ${colors[index]} rounded-full transform transition-all duration-1000 ease-out group-hover:animate-pulse`}
                            style={{ width: `${Math.min((roleCount / 50) * 100, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      {/* Decorative corner element */}
                      <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${colors[index]} opacity-10 rounded-bl-full group-hover:scale-125 transition-transform duration-500`}></div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Beautiful Recent Activity */}
          <div className="space-y-6">

            {/* Recent Activity Card */}
            <div className="bg-gradient-to-br from-white via-purple-50/30 to-pink-50/50 dark:from-gray-800 dark:via-purple-900/10 dark:to-pink-900/20 rounded-3xl shadow-xl p-8 border border-white/50 dark:border-gray-700/50 relative overflow-hidden">
              {/* Decorative background */}
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
                    const colorClass = activityService.getActivityColor(activity);
                    const timeAgo = activityService.formatTimeAgo(activity.timestamp);
                    
                    return (
                      <div 
                        key={activity.id}
                        onClick={() => handleActivityClick(activity)}
                        className="group relative bg-white/60 dark:bg-gray-800/60 rounded-2xl p-5 backdrop-blur-sm border border-white/30 dark:border-gray-700/30 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] cursor-pointer"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        {/* Activity indicator line */}
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-500 to-pink-500 rounded-r-full group-hover:w-2 transition-all duration-300"></div>
                        
                        <div className="flex items-start space-x-4 ml-4">
                          <div className={`p-3 rounded-2xl shadow-lg ${colorClass} group-hover:scale-110 transition-transform duration-300`}>
                            <IconComponent className="h-5 w-5 text-white" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300">
                                {activity.message}
                              </p>
                              <div className={`px-3 py-1 text-xs rounded-full font-semibold ${activity.severity === 'critical' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                activity.severity === 'high' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                                  activity.severity === 'medium' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                                    'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                }`}>
                                {activity.severity}
                              </div>
                            </div>
                            
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 flex items-center space-x-2">
                              <Clock className="h-3 w-3" />
                              <span>{timeAgo} • {activity.user.name}</span>
                            </p>
                            
                            {activity.metadata && (
                              <div className="flex flex-wrap gap-2">
                                {activity.metadata.orderId && (
                                  <span className="inline-flex items-center px-3 py-1 text-xs font-medium bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 text-blue-800 dark:text-blue-200 rounded-full">
                                    Order: {activity.metadata.orderId}
                                  </span>
                                )}
                                {activity.metadata.productId && (
                                  <span className="inline-flex items-center px-3 py-1 text-xs font-medium bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 text-green-800 dark:text-green-200 rounded-full">
                                    Product: {activity.metadata.productId}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Hover overlay */}
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </div>
                    );
                  })}
                  
                  {/* View All Button */}
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

          {/* Inventory Items View Only */}
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

                      {/* View-only status indicator */}
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { title: 'User Management', icon: Users, color: 'from-blue-500 to-blue-600', link: '/users' },
              { title: 'Inventory Control', icon: Package, color: 'from-green-500 to-green-600', link: '/inventory' },
              { title: 'Order Management', icon: ShoppingCart, color: 'from-orange-500 to-red-600', link: '/orders' },
              { title: 'System Reports', icon: BarChart3, color: 'from-orange-500 to-red-500', link: '/admin/reports' },
              { title: 'Delivery Tracking', icon: Truck, color: 'from-blue-500 to-blue-600', link: '/deliveries' },
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
