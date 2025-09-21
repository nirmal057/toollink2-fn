import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { motion } from 'framer-motion';
import { PackageIcon, BarChart3Icon, PieChartIcon, RefreshCwIcon } from 'lucide-react';
import { useToast } from '../contexts/GlobalNotificationContext';
import { useAuth } from '../hooks/useAuth';

interface CategoryData {
    _id: string;
    count: number;
    percentage: number;
    color: string;
    shortName: string;
}

interface InventoryStatsData {
    totalItems: number;
    activeItems: number;
    inactiveItems: number;
    lowStockItems: number;
    categories: number;
    categoryDistribution: Array<{
        _id: string;
        count: number;
    }>;
}

interface InventoryCategoryChartProps {
    height?: number;
    showControls?: boolean;
    chartType?: 'pie' | 'bar';
    className?: string;
}

// Color palette for categories
const COLORS = [
    '#FF6B35', '#0B2545', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444',
    '#06B6D4', '#8B5A2B', '#EC4899', '#6366F1', '#84CC16', '#F97316',
    '#3B82F6', '#EAB308', '#22C55E', '#DC2626', '#9333EA', '#059669'
];

const InventoryCategoryChart: React.FC<InventoryCategoryChartProps> = ({
    height = 300,
    showControls = true,
    chartType: initialChartType = 'pie',
    className = ''
}) => {
    const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
    const [loading, setLoading] = useState(true);
    const [chartType, setChartType] = useState<'pie' | 'bar'>(initialChartType);
    const [totalItems, setTotalItems] = useState(0);
    const toast = useToast();
    const { isAuthenticated } = useAuth();

    // Function to create shorter category names for better display
    const createShortName = (fullName: string): string => {
        const shortNameMap: { [key: string]: string } = {
            'Steel & Reinforcement': 'Steel',
            'Paint & Chemicals': 'Paint',
            'Electrical Items': 'Electrical',
            'Plumbing Supplies': 'Plumbing',
            'Tools & Equipment': 'Tools',
            'Hardware & Fasteners': 'Hardware',
            'Tiles & Ceramics': 'Tiles',
            'Roofing Materials': 'Roofing',
            'Safety Equipment': 'Safety',
            'Sand & Aggregate': 'Sand',
            'Masonry Blocks': 'Blocks'
        };

        // Return mapped short name or truncate if too long
        return shortNameMap[fullName] || (fullName.length > 12 ? fullName.substring(0, 12) + '...' : fullName);
    };

    const fetchCategoryData = async () => {
        try {
            setLoading(true);

            // Get the access token from localStorage
            const accessToken = localStorage.getItem('accessToken');
            if (!accessToken) {
                console.error('No access token found');
                toast.error('Authentication required for chart data');
                return;
            }

            const response = await fetch('http://localhost:5001/api/inventory/stats', {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const result = await response.json();
                if (result.success && result.data) {
                    const statsData: InventoryStatsData = result.data;
                    const total = statsData.totalItems || 0;
                    setTotalItems(total);

                    if (statsData.categoryDistribution && statsData.categoryDistribution.length > 0) {
                        const processedData = statsData.categoryDistribution.map((item, index) => ({
                            _id: item._id || 'Unknown',
                            shortName: createShortName(item._id || 'Unknown'),
                            count: item.count || 0,
                            percentage: total > 0 ? Math.round((item.count / total) * 100) : 0,
                            color: COLORS[index % COLORS.length]
                        }));

                        setCategoryData(processedData);
                    } else {
                        setCategoryData([]);
                    }
                }
            } else {
                throw new Error('Failed to fetch category data');
            }
        } catch (error) {
            console.error('Error fetching category data:', error);
            toast.error('Failed to load inventory category data', 'Please try again later');
            setCategoryData([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategoryData();
    }, [isAuthenticated]); // Re-fetch when authentication status changes

    const handleRefresh = () => {
        fetchCategoryData();
    };

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600">
                    <p className="font-semibold text-gray-800 dark:text-white">{data._id}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                        Items: <span className="font-medium">{data.count}</span>
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                        Percentage: <span className="font-medium">{data.percentage}%</span>
                    </p>
                </div>
            );
        }
        return null;
    };

    const PieChartView = () => (
        <ResponsiveContainer width="100%" height={height}>
            <PieChart>
                <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ _id, percentage }) => `${_id}: ${percentage}%`}
                    outerRadius={height * 0.3}
                    innerRadius={height * 0.15}
                    fill="#8884d8"
                    dataKey="count"
                    paddingAngle={2}
                >
                    {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                    wrapperStyle={{ fontSize: '12px' }}
                    iconType="circle"
                />
            </PieChart>
        </ResponsiveContainer>
    );

    const BarChartView = () => (
        <ResponsiveContainer width="100%" height={height + 80}>
            <BarChart
                data={categoryData}
                margin={{ top: 20, right: 30, left: 20, bottom: 120 }}
            >
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis
                    dataKey="shortName"
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    tick={{ fontSize: 10 }}
                    interval={0}
                />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );

    if (loading) {
        return (
            <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}>
                <div className="p-6">
                    <div className="flex items-center justify-center h-64">
                        <RefreshCwIcon className="w-8 h-8 text-blue-500 animate-spin" />
                        <span className="ml-2 text-gray-600 dark:text-gray-300">Loading chart data...</span>
                    </div>
                </div>
            </div>
        );
    }

    if (categoryData.length === 0) {
        return (
            <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}>
                <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                            <PackageIcon className="w-5 h-5 text-blue-500 mr-2" />
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                                Inventory Category Distribution
                            </h3>
                        </div>
                        {showControls && (
                            <button
                                onClick={handleRefresh}
                                className="p-2 text-gray-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400"
                            >
                                <RefreshCwIcon className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                    <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
                        <div className="text-center">
                            <PackageIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>No inventory data available</p>
                            <p className="text-sm mt-1">Add some inventory items to see the distribution</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}
        >
            <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                        <PackageIcon className="w-5 h-5 text-blue-500 mr-2" />
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                                Inventory Category Distribution
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {totalItems} total items across {categoryData.length} categories
                            </p>
                        </div>
                    </div>

                    {showControls && (
                        <div className="flex items-center space-x-2">
                            {/* Chart Type Toggle */}
                            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                                <button
                                    onClick={() => setChartType('pie')}
                                    className={`p-2 rounded-md transition-colors ${chartType === 'pie'
                                        ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                                        }`}
                                    title="Pie Chart"
                                >
                                    <PieChartIcon className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setChartType('bar')}
                                    className={`p-2 rounded-md transition-colors ${chartType === 'bar'
                                        ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                                        }`}
                                    title="Bar Chart"
                                >
                                    <BarChart3Icon className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Refresh Button */}
                            <button
                                onClick={handleRefresh}
                                className="p-2 text-gray-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
                                title="Refresh Data"
                            >
                                <RefreshCwIcon className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>

                {/* Chart */}
                <div className="w-full">
                    {chartType === 'pie' ? <PieChartView /> : <BarChartView />}
                </div>

                {/* Summary Stats */}
                <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {categoryData.slice(0, 4).map((category) => (
                        <div
                            key={category._id}
                            className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3"
                        >
                            <div className="flex items-center mb-1">
                                <div
                                    className="w-3 h-3 rounded-full mr-2"
                                    style={{ backgroundColor: category.color }}
                                />
                                <span className="text-sm font-medium text-gray-800 dark:text-white truncate">
                                    {category._id}
                                </span>
                            </div>
                            <div className="text-lg font-semibold text-gray-900 dark:text-white">
                                {category.count}
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">
                                {category.percentage}% of total
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
};

export default InventoryCategoryChart;
