import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { 
  ShoppingCartIcon, PackageIcon, TruckIcon, UsersIcon, AlertTriangleIcon, 
  CheckCircleIcon, BarChart2Icon, BanknoteIcon, MessageSquareIcon, UserIcon
} from 'lucide-react';
import { AnimatedElement, SmoothCard, SmoothButton, LoadingSpinner } from '../components/ui/SmoothAnimations';

interface DashboardProps {
  userRole: string;
}

// Sample data for charts
const salesData = [
  { month: 'Jan', sales: 4200 },
  { month: 'Feb', sales: 3800 },
  { month: 'Mar', sales: 4100 },
  { month: 'Apr', sales: 3900 },
  { month: 'May', sales: 4300 },
  { month: 'Jun', sales: 4500 }
];

const categoryData = [
  { name: 'Construction', value: 35 },
  { name: 'Plumbing', value: 25 },
  { name: 'Electrical', value: 20 },
  { name: 'Tools', value: 15 },
  { name: 'Other', value: 5 }
];

const COLORS = ['#FF6B35', '#0B2545', '#f8b595', '#1a4268', '#fdeee0'];

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  isNegative?: boolean;
  icon: React.ReactNode;
  subtext?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, isNegative, icon, subtext }) => (
  <SmoothCard hoverable className="p-6 group">
    <div className="flex items-center justify-between mb-2">
      <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300 
                      transition-all duration-300 ease-out group-hover:bg-gray-100 dark:group-hover:bg-gray-600 
                      group-hover:scale-110">
        {icon}
      </div>
      {change && (
        <span className={`text-sm font-medium transition-all duration-300 ease-out group-hover:scale-105 
                         ${isNegative ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
          {change}
        </span>
      )}
    </div>
    <h3 className="text-gray-600 dark:text-gray-400 text-sm transition-colors duration-200">{title}</h3>
    <p className="text-2xl font-bold text-gray-800 dark:text-white mt-1 transition-all duration-300 ease-out 
                  group-hover:text-blue-600 dark:group-hover:text-blue-400">{value}</p>
    {subtext && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 transition-colors duration-200">{subtext}</p>}
  </SmoothCard>
);

const QuickActionButton: React.FC<{ icon: React.ReactNode; label: string; onClick: () => void }> = ({ icon, label, onClick }) => (
  <SmoothButton
    variant="ghost"
    onClick={onClick}
    className="group flex items-center space-x-2 p-3 rounded-lg bg-white dark:bg-gray-800 shadow-md dark:shadow-lg 
               hover:bg-gray-50 dark:hover:bg-gray-700 w-full 
               border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-500
               hover:shadow-lg dark:hover:shadow-xl hover:shadow-gray-200/50 dark:hover:shadow-gray-900/50
               focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
  >
    <span className="text-gray-600 dark:text-gray-300 transition-all duration-300 ease-out group-hover:scale-110 group-hover:text-blue-600 dark:group-hover:text-blue-400">{icon}</span>
    <span className="text-sm font-medium text-gray-700 dark:text-gray-200 transition-colors duration-200 group-hover:text-blue-700 dark:group-hover:text-blue-300">{label}</span>
  </SmoothButton>
);

const Dashboard: React.FC<DashboardProps> = ({ userRole }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('today');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Simulate data loading
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'users':
        navigate('/users');
        break;
      case 'inventory':
        navigate('/inventory');
        break;
      case 'orders':
        navigate('/orders');
        break;
      case 'reports':
        navigate('/reports');
        break;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }  if (userRole === 'admin') {
    return (
      <div className="space-y-4 sm:space-y-6">
        {/* Header with Period Selector */}
        <AnimatedElement animation="fadeInDown" className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 dark:text-white">Admin Dashboard</h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Welcome back! Here's your business overview.</p>
          </div>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="w-full sm:w-auto rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-500 focus:ring focus:ring-blue-500 dark:focus:ring-blue-500 focus:ring-opacity-50 text-sm sm:text-base transition-all duration-200"
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
        </AnimatedElement>

        {/* Quick Actions */}
        <AnimatedElement animation="fadeInUp" delay={200} className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <QuickActionButton
            icon={<UsersIcon size={20} className="text-secondary-500" />}
            label="Manage Users"
            onClick={() => handleQuickAction('users')}
          />
          <QuickActionButton
            icon={<PackageIcon size={20} className="text-blue-500" />}
            label="Add Inventory"
            onClick={() => handleQuickAction('inventory')}
          />
          <QuickActionButton
            icon={<ShoppingCartIcon size={20} className="text-secondary-600" />}
            label="Process Orders"
            onClick={() => handleQuickAction('orders')}
          />
          <QuickActionButton
            icon={<BarChart2Icon size={20} className="text-blue-600" />}
            label="View Reports"
            onClick={() => handleQuickAction('reports')}
          />
        </AnimatedElement>        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <AnimatedElement animation="fadeInUp" delay={300}>
            <StatCard
              title="Total Sales"
              value="LKR 856,000"
              change="+23%"
              icon={<BanknoteIcon size={24} className="text-blue-500" />}
              subtext="Compared to last month"
            />
          </AnimatedElement>
          <AnimatedElement animation="fadeInUp" delay={400}>
            <StatCard
              title="Active Orders"
              value="42"
              change="+15%"
              icon={<ShoppingCartIcon size={24} className="text-secondary-500" />}
              subtext="Orders in progress"
            />
          </AnimatedElement>
          <AnimatedElement animation="fadeInUp" delay={500}>
            <StatCard
              title="Low Stock Items"
              value="8"
              change="-2"
              isNegative={true}
              icon={<AlertTriangleIcon size={24} className="text-red-500" />}
              subtext="Needs restocking"
            />
          </AnimatedElement>
          <AnimatedElement animation="fadeInUp" delay={600}>
            <StatCard
              title="Customer Messages"
              value="23"
              change="+7"
              icon={<MessageSquareIcon size={24} className="text-green-500" />}
              subtext="Unread messages"
            />
          </AnimatedElement>
        </div>
            subtext="12 pending delivery"
          />
          <StatCard
            title="Low Stock Items"
            value="8"
            change="+3"
            isNegative
            icon={<AlertTriangleIcon size={24} className="text-error-500" />}
            subtext="Below threshold"
          />
          <StatCard
            title="Active Users"
            value="128"
            change="+18%"
            icon={<UsersIcon size={24} className="text-secondary-600" />}
            subtext="24 new this month"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sales Trend */}
          <div className="bg-white rounded-lg shadow p-6">            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800 ">Sales Trend</h3>
              <button 
                onClick={() => handleNavigation('/reports')}
                className="text-sm text-primary-500 hover:text-primary-600"
              >
                View Full Report
              </button>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="sales" 
                  stroke="#FF6B35" 
                  strokeWidth={2}
                  name="Sales (LKR)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>          {/* Category Distribution */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Sales by Category</h3>
              <button 
                onClick={() => handleNavigation('/reports')}
                className="text-sm text-primary-500 dark:text-blue-400 hover:text-primary-600 dark:hover:text-blue-300"
              >
                View Details
              </button>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activities and Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Orders */}
          <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800 ">Recent Orders</h3>
              <button 
                onClick={() => handleNavigation('/orders')}
                className="text-sm text-[#FF6B35] hover:text-[#FF6B35]/80"
              >
                View All
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 ">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 ">
                  {/* Sample order rows */}
                  <tr>
                    <td className="px-4 py-3 text-sm text-gray-900 ">#ORD-7892</td>
                    <td className="px-4 py-3 text-sm text-gray-900 ">John Doe</td>
                    <td className="px-4 py-3">                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-primary-100 text-primary-800">
                        Delivered
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 ">LKR 25,000</td>
                  </tr>
                  {/* Add more rows as needed */}
                </tbody>
              </table>
            </div>
          </div>

          {/* System Alerts */}
          <div className="bg-white rounded-lg shadow p-6">            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800 ">System Alerts</h3>
              <button 
                onClick={() => handleNavigation('/notifications')}
                className="text-sm text-primary-500 hover:text-primary-600"
              >
                View All
              </button>
            </div>
            <div className="space-y-4">              <div className="flex items-start space-x-3 p-3 bg-warning-50 rounded-lg">
                <AlertTriangleIcon size={20} className="text-warning-500 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-warning-800 ">Low Stock Alert</p>
                  <p className="text-xs text-warning-700 ">5 items are below threshold</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-3 bg-secondary-50 rounded-lg">
                <TruckIcon size={20} className="text-secondary-500 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-secondary-800 ">Delivery Update</p>
                  <p className="text-xs text-secondary-700 ">12 deliveries scheduled for today</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-3 bg-primary-50 rounded-lg">
                <CheckCircleIcon size={20} className="text-primary-500 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-primary-800 ">System Status</p>
                  <p className="text-xs text-green-700 ">All systems operational</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Inventory Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800 ">Low Stock Items</h3>
            <div className="space-x-4">
              <button 
                onClick={() => handleNavigation('/inventory')}
                className="text-sm text-[#FF6B35] hover:text-[#FF6B35]/80"
              >
                View Inventory
              </button>
              <button 
                onClick={() => handleNavigation('/predictions')}
                className="text-sm text-[#FF6B35] hover:text-[#FF6B35]/80"
              >
                View Predictions
              </button>
            </div>
          </div>
          {/* ...existing inventory content... */}
        </div>
      </div>
    );
  }

  // Customer Dashboard
  if (userRole === 'customer') {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 ">My Dashboard</h1>
            <p className="text-gray-600 ">Track your orders and manage your account.</p>
          </div>
          <button
            onClick={() => handleNavigation('/orders')}
            className="bg-[#FF6B35] text-white px-4 py-2 rounded-lg hover:bg-[#FF6B35]/80 transition-colors"
          >
            Place New Order
          </button>
        </div>

        {/* Customer Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">          <StatCard
            title="Active Orders"
            value="3"
            icon={<ShoppingCartIcon size={24} className="text-secondary-500" />}
            subtext="2 in transit"
          />
          <StatCard
            title="Order History"
            value="24"
            icon={<CheckCircleIcon size={24} className="text-primary-500" />}
            subtext="Completed orders"
          />
          <StatCard
            title="Total Spent"
            value="LKR 86,500"
            icon={<BanknoteIcon size={24} className="text-secondary-600" />}
            subtext="This year"
          />
          <StatCard
            title="Avg Delivery"
            value="2.3 days"
            icon={<TruckIcon size={24} className="text-primary-600" />}
            subtext="Average time"
          />
        </div>

        {/* Order Tracking Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Current Orders */}
          <div className="bg-white rounded-lg shadow p-6">            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800 ">Current Orders</h3>
              <button 
                onClick={() => handleNavigation('/orders')}
                className="text-sm text-primary-500 hover:text-primary-600"
              >
                View All
              </button>
            </div>
            <div className="space-y-4">
              {/* Active Order 1 */}
              <div className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-medium text-gray-800 ">#ORD-7892</h4>
                    <p className="text-sm text-gray-600 ">Placed on July 20, 2023</p>
                  </div>                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-warning-100 text-warning-800 ">
                    In Transit
                  </span>
                </div>
                <div className="mb-3">
                  <p className="text-sm text-gray-600 ">Portland Cement (10 bags), Steel Rebar (20 pcs)</p>
                  <p className="text-sm font-medium text-gray-800 ">LKR 25,000</p>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-500 ">
                    Expected: July 22, 2023
                  </div>
                  <button
                    onClick={() => handleNavigation('/orders')}
                    className="text-xs text-[#FF6B35] hover:text-[#FF6B35]/80"
                  >
                    Track Order
                  </button>
                </div>
              </div>

              {/* Active Order 2 */}
              <div className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-medium text-gray-800 ">#ORD-7891</h4>
                    <p className="text-sm text-gray-600 ">Placed on July 19, 2023</p>
                  </div>
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 ">
                    Processing
                  </span>
                </div>
                <div className="mb-3">
                  <p className="text-sm text-gray-600 ">Power Drill (2 units), Screws (5 boxes)</p>
                  <p className="text-sm font-medium text-gray-800 ">LKR 18,500</p>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-500 ">
                    Expected: July 21, 2023
                  </div>
                  <button
                    onClick={() => handleNavigation('/orders')}
                    className="text-xs text-[#FF6B35] hover:text-[#FF6B35]/80"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800 ">Recent Activity</h3>
              <button 
                onClick={() => handleNavigation('/notifications')}
                className="text-sm text-[#FF6B35] hover:text-[#FF6B35]/80"
              >
                View All
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                <TruckIcon size={20} className="text-green-500 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-green-800 ">Order Shipped</p>
                  <p className="text-xs text-green-700 ">Order #ORD-7892 is out for delivery</p>
                  <p className="text-xs text-gray-500 ">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                <CheckCircleIcon size={20} className="text-blue-500 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-blue-800 ">Order Confirmed</p>
                  <p className="text-xs text-blue-700 ">Order #ORD-7891 has been confirmed</p>
                  <p className="text-xs text-gray-500 ">1 day ago</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
                <AlertTriangleIcon size={20} className="text-yellow-500 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-yellow-800 ">Delivery Rescheduled</p>
                  <p className="text-xs text-yellow-700 ">Order #ORD-7890 delivery moved to tomorrow</p>
                  <p className="text-xs text-gray-500 ">2 days ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <QuickActionButton
              icon={<ShoppingCartIcon size={20} className="text-blue-500" />}
              label="Place New Order"
              onClick={() => handleNavigation('/orders')}
            />
            <QuickActionButton
              icon={<MessageSquareIcon size={20} className="text-green-500" />}
              label="Submit Feedback"
              onClick={() => handleNavigation('/feedback')}
            />
            <QuickActionButton
              icon={<UserIcon size={20} className="text-purple-500" />}
              label="Update Profile"
              onClick={() => handleNavigation('/profile')}
            />
          </div>
        </div>
      </div>
    );
  }

  // Default dashboard for other user roles
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 ">{userRole.charAt(0).toUpperCase() + userRole.slice(1)} Dashboard</h1>
          <p className="text-gray-600 ">Welcome back! Here's your overview.</p>
        </div>
      </div>

      {/* Basic Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          title="Active Orders"
          value="12"
          icon={<ShoppingCartIcon size={24} className="text-blue-500" />}
          subtext="3 pending delivery"
        />
        <StatCard
          title="Completed Orders"
          value="48"
          icon={<CheckCircleIcon size={24} className="text-green-500" />}
          subtext="This month"
        />
        <StatCard
          title="Total Value"
          value="LKR 125,000"
          icon={<BanknoteIcon size={24} className="text-purple-500" />}
          subtext="This month"
        />
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h3>
        <div className="space-y-4">
          <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
            <ShoppingCartIcon size={20} className="text-blue-500 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-blue-800 ">New Order Placed</p>
              <p className="text-xs text-blue-700 ">Order #ORD-7892 has been placed</p>
            </div>
          </div>
          <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
            <TruckIcon size={20} className="text-green-500 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-green-800 ">Delivery Complete</p>
              <p className="text-xs text-green-700 ">Order #ORD-7890 has been delivered</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
