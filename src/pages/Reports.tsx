import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';
import { CalendarIcon, DownloadIcon, FilterIcon } from 'lucide-react';
import { motion } from 'framer-motion';

// Simulated data
const orderData = [{
  month: 'Jan',
  orders: 240,
  deliveries: 220
}, {
  month: 'Feb',
  orders: 198,
  deliveries: 180
}, {
  month: 'Mar',
  orders: 305,
  deliveries: 290
}, {
  month: 'Apr',
  orders: 189,
  deliveries: 175
}, {
  month: 'May',
  orders: 239,
  deliveries: 220
}, {
  month: 'Jun',
  orders: 314,
  deliveries: 295
}, {
  month: 'Jul',
  orders: 411,
  deliveries: 380
}];

const categoryData = [{
  name: 'Construction Materials',
  value: 400
}, {
  name: 'Tools',
  value: 300
}, {
  name: 'Electrical',
  value: 300
}, {
  name: 'Plumbing',
  value: 200
}];

const COLORS = ['#FF6B35', '#0B2545', '#f8b595', '#1a4268'];

interface ReportsProps {
  userRole: string;
}

const Reports: React.FC<ReportsProps> = ({ userRole: _userRole }) => {
  const [timeRange, setTimeRange] = useState('7d');
  const [reportType, setReportType] = useState('orders');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-red-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 space-y-6 p-4 xs:p-6 relative">
      {/* Beautiful background pattern */}
      <div className="absolute inset-0 opacity-5 dark:opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0l-2 4 2 4z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")"
        }}></div>
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col xs:flex-row justify-between items-start xs:items-center gap-4"
        >
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-800 via-orange-600 to-red-600 dark:from-white dark:via-orange-400 dark:to-red-400 bg-clip-text text-transparent">
              Reports & Analytics
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Business insights and performance metrics</p>
          </div>
          <div className="flex flex-col xs:flex-row items-stretch xs:items-center space-y-2 xs:space-y-0 xs:space-x-4 w-full xs:w-auto">
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="flex items-center justify-center px-4 py-2 text-sm bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg text-gray-700 dark:text-gray-300 rounded-xl shadow-lg hover:shadow-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
            >
              <DownloadIcon size={16} className="mr-2" />
              Export
            </motion.button>
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="flex items-center justify-center px-4 py-2 text-sm bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg text-gray-700 dark:text-gray-300 rounded-xl shadow-lg hover:shadow-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
            >
              <FilterIcon size={16} className="mr-2" />
              Refresh
            </motion.button>
          </div>
        </motion.div>

      {/* Filters */}
      <div className="flex flex-col xs:flex-row gap-4">
        <div className="flex items-center space-x-2">
          <CalendarIcon size={18} className="text-gray-400 dark:text-gray-500" />
          <select 
            value={timeRange}
            onChange={e => setTimeRange(e.target.value)}
            className="flex-1 xs:flex-none rounded-lg border-gray-300 dark:border-gray-600 focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-50 dark:bg-gray-700 dark:text-white text-sm xs:text-base"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
        </div>
        <div className="flex items-center space-x-2">
          <FilterIcon size={18} className="text-gray-400 dark:text-gray-500" />
          <select 
            value={reportType}
            onChange={e => setReportType(e.target.value)}
            className="flex-1 xs:flex-none rounded-lg border-gray-300 dark:border-gray-600 focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-50 dark:bg-gray-700 dark:text-white text-sm xs:text-base"
          >
            <option value="orders">Orders</option>
            <option value="deliveries">Deliveries</option>
            <option value="inventory">Inventory</option>
          </select>
        </div>
      </div>      {/* Reports Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 xs:gap-6">
        {/* Orders & Deliveries Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 xs:p-6 transition-colors duration-300">
          <h3 className="text-base xs:text-lg font-semibold text-gray-800 dark:text-white mb-4">
            Orders & Deliveries
          </h3>
          <div className="w-full overflow-x-auto">
            <div style={{ width: '100%', minWidth: '400px', height: '250px' }}>
              <BarChart
                width={400}
                height={250}
                data={orderData}
                margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="orders" fill="#FF6B35" name="Orders" />
                <Bar dataKey="deliveries" fill="#0B2545" name="Deliveries" />
              </BarChart>
            </div>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 xs:p-6 transition-colors duration-300">
          <h3 className="text-base xs:text-lg font-semibold text-gray-800 dark:text-white mb-4">
            Category Distribution
          </h3>
          <div className="w-full overflow-x-auto">
            <div style={{ width: '100%', minWidth: '400px', height: '250px' }}>
              <PieChart width={400} height={250}>
                <Pie
                  data={categoryData}
                  cx={200}
                  cy={125}
                  innerRadius={50}
                  outerRadius={70}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name }) => name}
                >
                  {categoryData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>                <Tooltip />
              </PieChart>
            </div>
          </div>
        </div>

        {/* Monthly Stats */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 xs:p-6 transition-colors duration-300">
          <h3 className="text-base xs:text-lg font-semibold text-gray-800 dark:text-white mb-4">
            Monthly Stats
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Orders</p>
                <p className="text-xl xs:text-2xl font-semibold text-gray-800 dark:text-white">1,284</p>
              </div>
              <div className="text-sm text-green-600 dark:text-green-400 font-medium">
                +12.5%
              </div>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Successful Deliveries</p>
                <p className="text-xl xs:text-2xl font-semibold text-gray-800 dark:text-white">1,147</p>
              </div>
              <div className="text-sm text-green-600 dark:text-green-400 font-medium">
                +8.2%
              </div>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Delivery Rate</p>
                <p className="text-xl xs:text-2xl font-semibold text-gray-800 dark:text-white">89.3%</p>
              </div>
              <div className="text-sm text-green-600 dark:text-green-400 font-medium">
                +2.1%
              </div>
            </div>
          </div>
        </div>

        {/* Alerts Summary */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 xs:p-6 transition-colors duration-300">
          <h3 className="text-base xs:text-lg font-semibold text-gray-800 dark:text-white mb-4">
            Alerts Summary
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Low Stock Items</p>
                <p className="text-xl xs:text-2xl font-semibold text-gray-800 dark:text-white">8</p>
              </div>
              <div className="text-sm text-red-600 dark:text-red-400 font-medium">
                +3
              </div>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Delayed Deliveries</p>
                <p className="text-xl xs:text-2xl font-semibold text-gray-800 dark:text-white">12</p>
              </div>
              <div className="text-sm text-yellow-600 dark:text-yellow-400 font-medium">
                -2
              </div>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Equipment Maintenance</p>
                <p className="text-xl xs:text-2xl font-semibold text-gray-800 dark:text-white">4</p>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                No change
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
