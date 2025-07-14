import Header from './Header';

// Simple dashboard test that uses the header
const DashboardTest = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <Header userRole="admin" />
      
      {/* Main Content */}
      <div className="pt-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="py-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
              Dashboard Test
            </h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Card 1 */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  📋 Orders
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Manage and track orders
                </p>
              </div>
              
              {/* Card 2 */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  📦 Inventory
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Monitor inventory levels
                </p>
              </div>
              
              {/* Card 3 */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  📊 Reports
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  View analytics and reports
                </p>
              </div>
            </div>
            
            {/* Test Instructions */}
            <div className="mt-12 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4">
                🧪 Header Functionality Test
              </h3>
              <div className="space-y-2 text-blue-800 dark:text-blue-200">
                <p><strong>Notification Bell (🔔):</strong> Click to open/close notifications dropdown</p>
                <p><strong>Theme Toggle (🌓):</strong> Click to switch between light and dark mode</p>
                <p><strong>User Icon (👤):</strong> Click to open/close user menu dropdown</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardTest;
