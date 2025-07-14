import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { 
  ShoppingCartIcon, PackageIcon, TruckIcon, UsersIcon, AlertTriangleIcon, 
  BarChart2Icon, BanknoteIcon, MessageSquareIcon
} from 'lucide-react';
import { AnimatedElement, SmoothCard, SmoothButton, LoadingSpinner } from '../components/UI/SmoothAnimations';

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
  onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, isNegative, icon, subtext, onClick }) => (
  <SmoothCard 
    hoverable 
    className={`p-6 group bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl border border-gray-100 dark:border-gray-700 backdrop-blur-lg ${onClick ? 'cursor-pointer' : ''}`}
    onClick={onClick}
  >
    <div className="flex items-center justify-between mb-4">
      <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl text-white
                      transition-all duration-300 ease-out group-hover:scale-110 group-hover:rotate-3
                      shadow-lg shadow-blue-500/25">
        {icon}
      </div>
      {change && (
        <span className={`text-sm font-semibold px-3 py-1 rounded-full transition-all duration-300 ease-out group-hover:scale-105 
                         ${isNegative ? 
                           'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20' : 
                           'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20'}`}>
          {change}
        </span>
      )}
    </div>
    <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium uppercase tracking-wide transition-colors duration-200">{title}</h3>
    <p className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-300 
                  bg-clip-text text-transparent mt-2 transition-all duration-300 ease-out 
                  group-hover:from-blue-600 group-hover:to-purple-600">{value}</p>
    {subtext && <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 transition-colors duration-200">{subtext}</p>}
  </SmoothCard>
);

const QuickActionButton: React.FC<{ icon: React.ReactNode; label: string; onClick: () => void }> = ({ icon, label, onClick }) => (
  <SmoothButton
    variant="ghost"
    onClick={onClick}
    className="group flex items-center space-x-3 p-4 rounded-2xl bg-gradient-to-r from-white to-gray-50 
               dark:from-gray-800 dark:to-gray-750 shadow-lg hover:shadow-2xl 
               border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-500
               hover:from-blue-50 hover:to-purple-50 dark:hover:from-gray-700 dark:hover:to-gray-600
               transition-all duration-300 ease-out hover:scale-105 w-full 
               focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
  >
    <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg text-white 
                    transition-all duration-300 ease-out group-hover:scale-110 group-hover:rotate-3
                    shadow-md shadow-blue-500/25">
      {icon}
    </div>
    <span className="text-sm font-semibold text-gray-700 dark:text-gray-200 transition-colors duration-200 
                     group-hover:text-blue-700 dark:group-hover:text-blue-300">{label}</span>
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

  // Dashboard for all authenticated users (admins are redirected to AdminDashboard)
  return (
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative overflow-hidden">
        {/* Beautiful background pattern */}
        <div className="absolute inset-0 opacity-10 dark:opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='7' cy='7' r='7'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")"
          }}></div>
        </div>
        
        <div className="relative z-10 space-y-6 p-6">
          {/* Header with Period Selector */}
          <AnimatedElement animation="fadeInDown" className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0">
            <div className="relative">
              <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-800 via-blue-600 to-purple-600 dark:from-white dark:via-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                Admin Dashboard
              </h1>
              <p className="text-base text-gray-600 dark:text-gray-400 mt-1">
                Welcome back! Here's your business overview.
              </p>
              <div className="absolute -inset-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg blur-xl opacity-20 -z-10"></div>
            </div>
            <div className="flex items-center space-x-3">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 
                           backdrop-blur-lg text-gray-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-500 
                           focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-500/20 transition-all duration-200
                           shadow-lg hover:shadow-xl"
              >
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
              </select>
            </div>
          </AnimatedElement>

        {/* Quick Actions */}
        <AnimatedElement animation="fadeInUp" delay={0} className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
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
          <AnimatedElement animation="fadeInUp" delay={50}>
            <StatCard
              title="Total Sales"
              value="LKR 856,000"
              change="+23%"
              icon={<BanknoteIcon size={24} className="text-blue-500" />}
              subtext="Compared to last month"
            />
          </AnimatedElement>
          <AnimatedElement animation="fadeInUp" delay={100}>
            <StatCard
              title="Active Orders"
              value="42"
              change="+15%"
              icon={<ShoppingCartIcon size={24} className="text-green-500" />}
              subtext="Orders in progress"
            />
          </AnimatedElement>
          <AnimatedElement animation="fadeInUp" delay={150}>
            <StatCard
              title="Low Stock Items"
              value="8"
              change="-2"
              isNegative={true}
              icon={<AlertTriangleIcon size={24} className="text-red-500" />}
              subtext="Needs restocking"
            />
          </AnimatedElement>
          <AnimatedElement animation="fadeInUp" delay={200}>
            <StatCard
              title="Customer Messages"
              value="23"
              change="+7"
              icon={<MessageSquareIcon size={24} className="text-purple-500" />}
              subtext="Unread messages"
              onClick={() => navigate('/messages')}
            />
          </AnimatedElement>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AnimatedElement animation="fadeInLeft" delay={250}>
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

          <AnimatedElement animation="fadeInRight" delay={300}>
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
                    {categoryData.map((_, index) => (
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
        <AnimatedElement animation="fadeInUp" delay={350}>
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
