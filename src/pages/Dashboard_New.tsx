import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { 
  ShoppingCartIcon, PackageIcon, TruckIcon, UsersIcon, AlertTriangleIcon, 
  CheckCircleIcon, BarChart2Icon, BanknoteIcon, MessageSquareIcon
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
  }

  if (userRole === 'admin') {
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
            icon={<UsersIcon size={20} />}
            label="Manage Users"
            onClick={() => handleQuickAction('users')}
          />
          <QuickActionButton
            icon={<PackageIcon size={20} />}
            label="Add Inventory"
            onClick={() => handleQuickAction('inventory')}
          />
          <QuickActionButton
            icon={<ShoppingCartIcon size={20} />}
            label="Process Orders"
            onClick={() => handleQuickAction('orders')}
          />
          <QuickActionButton
            icon={<BarChart2Icon size={20} />}
            label="View Reports"
            onClick={() => handleQuickAction('reports')}
          />
        </AnimatedElement>

        {/* Stats Overview */}
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
              icon={<ShoppingCartIcon size={24} className="text-green-500" />}
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
              icon={<MessageSquareIcon size={24} className="text-purple-500" />}
              subtext="Unread messages"
            />
          </AnimatedElement>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AnimatedElement animation="fadeInLeft" delay={700}>
            <SmoothCard className="p-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Sales Trend</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis dataKey="month" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e0e0e0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }} 
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="sales" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 6 }}
                    activeDot={{ r: 8, stroke: '#3b82f6', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </SmoothCard>
          </AnimatedElement>

          <AnimatedElement animation="fadeInRight" delay={800}>
            <SmoothCard className="p-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Sales by Category</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </SmoothCard>
          </AnimatedElement>
        </div>

        {/* Recent Activity */}
        <AnimatedElement animation="fadeInUp" delay={900}>
          <SmoothCard className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {[
                { action: 'New order received', time: '2 minutes ago', icon: <ShoppingCartIcon size={16} className="text-green-500" /> },
                { action: 'Inventory updated', time: '15 minutes ago', icon: <PackageIcon size={16} className="text-blue-500" /> },
                { action: 'Customer message', time: '1 hour ago', icon: <MessageSquareIcon size={16} className="text-purple-500" /> },
                { action: 'Delivery completed', time: '2 hours ago', icon: <TruckIcon size={16} className="text-orange-500" /> },
              ].map((activity, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                  {activity.icon}
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{activity.action}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </SmoothCard>
        </AnimatedElement>
      </div>
    );
  }

  // Default dashboard for other roles
  return (
    <AnimatedElement animation="fadeInUp">
      <SmoothCard className="p-8 text-center">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
          Welcome to ToolLink Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Your role: <span className="font-semibold capitalize">{userRole}</span>
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            title="Your Orders"
            value="12"
            icon={<ShoppingCartIcon size={24} className="text-blue-500" />}
            subtext="Active orders"
          />
          <StatCard
            title="Messages"
            value="3"
            icon={<MessageSquareIcon size={24} className="text-green-500" />}
            subtext="Unread messages"
          />
          <StatCard
            title="Deliveries"
            value="8"
            icon={<TruckIcon size={24} className="text-orange-500" />}
            subtext="Pending deliveries"
          />
        </div>
      </SmoothCard>
    </AnimatedElement>
  );
};

export default Dashboard;
