import { useState, useEffect } from 'react';
import { 
  ShoppingCartIcon, PackageIcon, TruckIcon, UsersIcon,
  MessageSquareIcon
} from 'lucide-react';
import { AnimatedElement, SmoothCard, LoadingSpinner } from '../components/UI/SmoothAnimations';

interface DashboardProps {
  userRole: string;
}

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  subtext?: string;
  onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, subtext, onClick }) => (
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
    </div>
    <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium uppercase tracking-wide transition-colors duration-200">{title}</h3>
    <p className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-300 
                  bg-clip-text text-transparent mt-2 transition-all duration-300 ease-out 
                  group-hover:from-blue-600 group-hover:to-purple-600">{value}</p>
    {subtext && <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 transition-colors duration-200">{subtext}</p>}
  </SmoothCard>
);

const Dashboard: React.FC<DashboardProps> = ({ userRole }) => {
  const [isLoading, setIsLoading] = useState(true);

  // Simulate data loading
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

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

  // Clean dashboard for all non-admin users (admins are redirected to AdminDashboard)
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      <AnimatedElement animation="fadeInUp">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 via-blue-600 to-purple-600 dark:from-white dark:via-blue-400 dark:to-purple-400 bg-clip-text text-transparent mb-4">
              Welcome to ToolLink Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Your role: <span className="font-semibold capitalize text-blue-600 dark:text-blue-400">{userRole}</span>
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              title="Your Orders"
              value="12"
              icon={<ShoppingCartIcon size={24} />}
              subtext="Active orders"
            />
            <StatCard
              title="Messages"
              value="3"
              icon={<MessageSquareIcon size={24} />}
              subtext="Unread messages"
            />
            <StatCard
              title="Deliveries"
              value="8"
              icon={<TruckIcon size={24} />}
              subtext="Pending deliveries"
            />
          </div>

          {/* Additional content based on role */}
          <div className="mt-8">
            <SmoothCard className="p-6">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {userRole === 'customer' && (
                  <>
                    <button className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
                      <PackageIcon className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Browse Products</span>
                    </button>
                    <button className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors">
                      <ShoppingCartIcon className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">New Order</span>
                    </button>
                  </>
                )}
                {(userRole === 'cashier' || userRole === 'warehouse') && (
                  <>
                    <button className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors">
                      <UsersIcon className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Manage Orders</span>
                    </button>
                    <button className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors">
                      <PackageIcon className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Check Inventory</span>
                    </button>
                  </>
                )}
              </div>
            </SmoothCard>
          </div>
        </div>
      </AnimatedElement>
    </div>
  );
};

export default Dashboard;
