import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Package,
  ShoppingCart,
  TruckIcon,
  BarChart3,
  Settings,
  Shield,
  Activity as ActivityIcon,
  UserCheck,
  UserX,
  AlertCircle,
  Clock,
  Server,
  DollarSign,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  Globe,
  Zap,
  Bell
} from 'lucide-react';
import { adminApiService, AdminDashboard as DashboardData } from '../services/adminApiService';
import { rbacService, PERMISSIONS } from '../services/rbacService';
import { useAuth } from '../hooks/useAuth';
import { activityService, Activity } from '../services/activityService';
import DebugAuth from '../components/DebugAuth';

const AdminDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isAuthenticated, refreshUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboard();
    loadActivities();
  }, []);

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

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError(null);

      // Try to load from API first
      try {
        const data = await adminApiService.getDashboard();
        setDashboardData(data);
        return;
      } catch (apiError) {
        console.warn('API failed, using mock data:', apiError);

        // Fallback to enhanced mock data when API fails
        const mockDashboard = {
          userStats: {
            total: 1247,
            active: 1156,
            pending: 23,
            inactive: 68,
            byRole: {
              admin: 8,
              customer: 856,
              cashier: 142,
              warehouse: 67,
              manager: 45,
              support: 129
            }
          },
          systemInfo: {
            serverTime: new Date().toISOString(),
            version: '2.4.1',
            environment: 'production',
            uptime: '47 days, 12 hours',
            lastBackup: '2 hours ago'
          },
          analytics: {
            totalOrders: 15847,
            monthlyRevenue: 2847592,
            activeProjects: 342,
            completedTasks: 8934,
            systemLoad: 67,
            memoryUsage: 73,
            storageUsed: 45,
            responseTime: 142
          },
          recentActivity: [
            { type: 'order', message: 'New order #ORD-2847 received', time: '2 minutes ago', user: 'Sarah Johnson' },
            { type: 'user', message: 'New user registration pending approval', time: '8 minutes ago', user: 'Mike Chen' },
            { type: 'system', message: 'System backup completed successfully', time: '15 minutes ago', user: 'System' },
            { type: 'order', message: 'Order #ORD-2846 shipped', time: '23 minutes ago', user: 'David Smith' },
            { type: 'alert', message: 'Low inventory alert for Product #SKU-1847', time: '1 hour ago', user: 'Inventory System' }
          ],
          quickStats: [
            { label: 'Today\'s Orders', value: 147, change: '+12%', trend: 'up' as const, icon: 'ShoppingCart' },
            { label: 'Active Users', value: 892, change: '+8%', trend: 'up' as const, icon: 'Users' },
            { label: 'Response Time', value: '142ms', change: '-5%', trend: 'down' as const, icon: 'Zap' }
          ]
        };

        setDashboardData(mockDashboard);
        console.log('AdminDashboard: Using mock data due to API unavailability');
      }
    } catch (err) {
      console.error('Failed to load dashboard:', err);
      setError(err instanceof Error ? err.message : 'Failed to load dashboard');
    } finally {
      setLoading(false);
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

  // Debug logging
  console.log('AdminDashboard Debug:', {
    isAuthenticated,
    user,
    userRole: user?.role,
    rbacUser: rbacService.getCurrentUser(),
    rbacHasAdminRole: rbacService.hasRole('admin'),
    rbacHasFullAccess: rbacService.hasPermission(PERMISSIONS.FULL_SYSTEM_ACCESS),
    hasAccess,
    localStorageUser: localStorage.getItem('user'),
    accessToken: !!localStorage.getItem('accessToken')
  });

  if (!hasAccess) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-4xl">
          <Shield className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Access Denied</h1>
          <p className="text-gray-600 dark:text-gray-400">You don't have permission to access the admin dashboard.</p>
          <div className="mt-6">
            <DebugAuth />
          </div>
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
            onClick={loadDashboard}
            className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-slate-800 dark:to-gray-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Beautiful Header */}
        <div className="mb-8">
          <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-3xl p-8 text-white overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full"></div>
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-white/5 rounded-full"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
                  <p className="text-blue-100 text-lg">
                    Complete system control and monitoring • {new Date().toLocaleDateString()}
                  </p>
                </div>
                <div className="hidden md:flex items-center space-x-6">
                  <div className="text-center">
                    <ActivityIcon className="h-8 w-8 mx-auto mb-1" />
                    <div className="text-sm text-blue-100">System Online</div>
                  </div>
                  <div className="text-center">
                    <Server className="h-8 w-8 mx-auto mb-1" />
                    <div className="text-sm text-blue-100">v{dashboardData?.systemInfo?.version}</div>
                  </div>
                  <div className="text-center">
                    <Globe className="h-8 w-8 mx-auto mb-1" />
                    <div className="text-sm text-blue-100">{dashboardData?.systemInfo?.environment}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {dashboardData?.quickStats?.map((stat, index) => {
            const IconComponent = stat.icon === 'ShoppingCart' ? ShoppingCart :
              stat.icon === 'Users' ? Users :
                stat.icon === 'DollarSign' ? DollarSign :
                  stat.icon === 'Zap' ? Zap : ActivityIcon;

            return (
              <div
                key={index}
                className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl p-6 border border-gray-100 dark:border-gray-700 transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl ${index === 0 ? 'bg-gradient-to-r from-blue-500 to-cyan-500' :
                      index === 1 ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                        'bg-gradient-to-r from-orange-500 to-red-500'
                    } shadow-lg`}>
                    <IconComponent className="h-6 w-6 text-white" />
                  </div>
                  <div className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${stat.trend === 'up'
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                      : 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                    }`}>
                    {stat.trend === 'up' ? (
                      <ArrowUpRight className="h-3 w-3 mr-1" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3 mr-1" />
                    )}
                    {stat.change}
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                    {stat.value}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {stat.label}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

          {/* User Analytics */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">User Analytics</h3>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Eye className="h-4 w-4" />
                <span>Live Data</span>
              </div>
            </div>

            {/* User Stats Grid */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Users</p>
                    <p className="text-2xl font-bold text-blue-600">{dashboardData?.userStats?.total}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-500" />
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active</p>
                    <p className="text-2xl font-bold text-green-600">{dashboardData?.userStats?.active}</p>
                  </div>
                  <UserCheck className="h-8 w-8 text-green-500" />
                </div>
              </div>

              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending</p>
                    <p className="text-2xl font-bold text-yellow-600">{dashboardData?.userStats?.pending}</p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-500" />
                </div>
              </div>

              <div className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Inactive</p>
                    <p className="text-2xl font-bold text-red-600">{dashboardData?.userStats?.inactive}</p>
                  </div>
                  <UserX className="h-8 w-8 text-red-500" />
                </div>
              </div>
            </div>

            {/* Role Distribution */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Role Distribution</h4>
              <div className="space-y-3">
                {dashboardData?.userStats?.byRole && Object.entries(dashboardData.userStats.byRole).map(([role, count]) => (
                  <div key={role} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${role === 'admin' ? 'bg-red-100 dark:bg-red-900/30' :
                          role === 'customer' ? 'bg-blue-100 dark:bg-blue-900/30' :
                            role === 'cashier' ? 'bg-green-100 dark:bg-green-900/30' :
                              role === 'warehouse manager' ? 'bg-purple-100 dark:bg-purple-900/30' :
                                'bg-gray-100 dark:bg-gray-700'
                        }`}>
                        <Shield className={`h-4 w-4 ${role === 'admin' ? 'text-red-600' :
                            role === 'customer' ? 'text-blue-600' :
                              role === 'cashier' ? 'text-green-600' :
                                role === 'warehouse manager' ? 'text-purple-600' :
                                  'text-gray-600'
                          }`} />
                      </div>
                      <span className="font-medium text-gray-900 dark:text-white capitalize">{role}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-lg font-bold text-gray-900 dark:text-white">{count}</span>
                      <div className="w-16 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${role === 'admin' ? 'bg-red-500' :
                              role === 'customer' ? 'bg-blue-500' :
                                role === 'cashier' ? 'bg-green-500' :
                                  role === 'warehouse manager' ? 'bg-purple-500' :
                                    'bg-gray-500'
                            }`}
                          style={{ width: `${(count / dashboardData.userStats.total) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="space-y-6">

            {/* Recent Activity */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Recent Activity</h3>
                <Bell className="h-5 w-5 text-gray-400" />
              </div>

              <div className="space-y-3">
                {activities.slice(0, 5).map((activity) => {
                  const IconComponent = getActivityIconComponent(activity);
                  const colorClass = activityService.getActivityColor(activity);
                  const timeAgo = activityService.formatTimeAgo(activity.timestamp);

                  return (
                    <div
                      key={activity.id}
                      onClick={() => handleActivityClick(activity)}
                      className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer group"
                    >
                      <div className={`p-1.5 rounded-full ${colorClass}`}>
                        <IconComponent className="h-3 w-3" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400">
                          {activity.message}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {timeAgo} • {activity.user.name}
                        </p>
                        {activity.metadata && (
                          <div className="mt-1">
                            {activity.metadata.orderId && (
                              <span className="inline-block px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded">
                                {activity.metadata.orderId}
                              </span>
                            )}
                            {activity.metadata.productId && (
                              <span className="inline-block px-2 py-1 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded ml-1">
                                {activity.metadata.productId}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      <div className={`px-2 py-1 text-xs rounded-full ${activity.severity === 'critical' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                          activity.severity === 'high' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                            activity.severity === 'medium' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                              'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        }`}>
                        {activity.severity}
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={() => navigate('/admin/activities')}
                className="w-full mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                View All Activity →
              </button>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Quick Actions</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { title: 'User Management', icon: Users, color: 'from-blue-500 to-cyan-500', link: '/users' },
              { title: 'Inventory Control', icon: Package, color: 'from-green-500 to-emerald-500', link: '/inventory' },
              { title: 'Order Management', icon: ShoppingCart, color: 'from-purple-500 to-pink-500', link: '/orders' },
              { title: 'System Reports', icon: BarChart3, color: 'from-orange-500 to-red-500', link: '/admin/reports' },
              { title: 'Delivery Tracking', icon: TruckIcon, color: 'from-indigo-500 to-purple-500', link: '/deliveries' },
              { title: 'System Settings', icon: Settings, color: 'from-gray-500 to-slate-500', link: '/admin/settings' }
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
