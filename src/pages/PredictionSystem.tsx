import React, { useState, useEffect } from 'react';
import {
    TrendingUp,
    TrendingDown,
    AlertTriangle,
    Package,
    Calendar,
    DollarSign,
    BarChart3,
    Clock,
    Target,
    Zap,
    RefreshCw
} from 'lucide-react';
import { adminApiService, MaterialDemandPrediction, PredictionDashboard, SmartRefillAlert } from '../services/adminApiService';

const PredictionSystem: React.FC = () => {
    const [dashboard, setDashboard] = useState<PredictionDashboard | null>(null);
    const [predictions, setPredictions] = useState<MaterialDemandPrediction[]>([]);
    const [alerts, setAlerts] = useState<SmartRefillAlert[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedWarehouse, setSelectedWarehouse] = useState('');
    const [activeTab, setActiveTab] = useState<'overview' | 'predictions' | 'alerts' | 'analytics'>('overview');

    useEffect(() => {
        loadData();
    }, [selectedWarehouse]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [dashboardData, predictionsData, alertsData] = await Promise.all([
                adminApiService.getPredictionDashboard(selectedWarehouse || undefined),
                adminApiService.getMaterialPredictions({
                    warehouseId: selectedWarehouse || undefined,
                    limit: 20
                }),
                adminApiService.getRefillAlerts(false)
            ]);

            setDashboard(dashboardData);
            setPredictions(predictionsData);
            setAlerts(alertsData);
        } catch (error) {
            console.error('Error loading prediction data:', error);
        } finally {
            setLoading(false);
        }
    };

    const getUrgencyColor = (urgency: string) => {
        switch (urgency) {
            case 'critical': return 'bg-red-100 text-red-800 border-red-200';
            case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            default: return 'bg-blue-100 text-blue-800 border-blue-200';
        }
    };

    const getTrendIcon = (trend: string) => {
        switch (trend) {
            case 'increasing': return <TrendingUp className="h-4 w-4 text-green-600" />;
            case 'decreasing': return <TrendingDown className="h-4 w-4 text-red-600" />;
            case 'seasonal': return <Calendar className="h-4 w-4 text-purple-600" />;
            default: return <Target className="h-4 w-4 text-gray-600" />;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="flex items-center space-x-2">
                    <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
                    <span className="text-lg text-gray-600 dark:text-gray-300">Loading ToolLink DemandSense...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Beautiful Header */}
                <div className="mb-8 bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/50 dark:from-gray-800 dark:via-blue-900/10 dark:to-indigo-900/20 rounded-3xl shadow-xl p-8 border border-white/50 dark:border-gray-700/50 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-200/20 to-indigo-300/20 rounded-full blur-3xl transform translate-x-16 -translate-y-16"></div>

                    <div className="relative z-10">
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                            <div className="flex items-center space-x-4">
                                <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl shadow-xl">
                                    <Zap className="h-8 w-8 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 via-blue-600 to-purple-600 dark:from-white dark:via-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                                        ToolLink DemandSense
                                    </h1>
                                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                                        AI-Powered Material Refill Prediction & Smart Inventory Optimization
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
                                <select
                                    value={selectedWarehouse}
                                    onChange={(e) => setSelectedWarehouse(e.target.value)}
                                    className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white shadow-lg"
                                >
                                    <option value="">All Warehouses</option>
                                    {dashboard?.warehouseInsights.map(warehouse => (
                                        <option key={warehouse.warehouseId} value={warehouse.warehouseId}>
                                            {warehouse.warehouseName}
                                        </option>
                                    ))}
                                </select>
                                <button
                                    onClick={loadData}
                                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
                                >
                                    <RefreshCw className="h-4 w-4 mr-2" />
                                    Refresh
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="mb-6">
                    <div className="border-b border-gray-200 dark:border-gray-700">
                        <nav className="-mb-px flex space-x-8">
                            {[
                                { id: 'overview', label: 'Overview', icon: BarChart3 },
                                { id: 'predictions', label: 'Material Predictions', icon: Package },
                                { id: 'alerts', label: 'Smart Alerts', icon: AlertTriangle },
                                { id: 'analytics', label: 'Performance Analytics', icon: TrendingUp }
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
                                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    <tab.icon className="h-4 w-4 mr-2" />
                                    {tab.label}
                                </button>
                            ))}
                        </nav>
                    </div>
                </div>

                {/* Overview Tab */}
                {activeTab === 'overview' && dashboard && (
                    <div className="space-y-6">
                        {/* Key Metrics */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[
                                {
                                    label: 'Items Tracked',
                                    value: dashboard.overview.totalItemsTracked,
                                    icon: Package,
                                    color: 'blue'
                                },
                                {
                                    label: 'Critical Items',
                                    value: dashboard.overview.criticalItems,
                                    icon: AlertTriangle,
                                    color: 'red'
                                },
                                {
                                    label: 'Predicted Cost',
                                    value: `$${dashboard.overview.totalPredictedCost.toLocaleString()}`,
                                    icon: DollarSign,
                                    color: 'green'
                                },
                                {
                                    label: 'Potential Stockouts',
                                    value: dashboard.overview.potentialStockouts,
                                    icon: Clock,
                                    color: 'orange'
                                }
                            ].map((metric, index) => (
                                <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                                    <div className="flex items-center">
                                        <div className={`p-2 rounded-lg bg-${metric.color}-100 dark:bg-${metric.color}-900`}>
                                            <metric.icon className={`h-6 w-6 text-${metric.color}-600 dark:text-${metric.color}-400`} />
                                        </div>
                                        <div className="ml-4">
                                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                                {metric.label}
                                            </p>
                                            <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                                                {metric.value}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Warehouse Insights */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                Warehouse Performance
                            </h3>
                            <div className="space-y-4">
                                {dashboard.warehouseInsights.map(warehouse => (
                                    <div key={warehouse.warehouseId} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                                        <div>
                                            <h4 className="font-medium text-gray-900 dark:text-white">
                                                {warehouse.warehouseName}
                                            </h4>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                {warehouse.totalItems} items tracked
                                            </p>
                                        </div>
                                        <div className="flex items-center space-x-4">
                                            <div className="text-right">
                                                <p className="text-sm text-gray-600 dark:text-gray-400">Critical Items</p>
                                                <p className="font-semibold text-red-600">{warehouse.criticalItems}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm text-gray-600 dark:text-gray-400">Monthly Demand</p>
                                                <p className="font-semibold text-gray-900 dark:text-white">
                                                    ${warehouse.predictedMonthlyDemand.toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Seasonal Insights */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                Seasonal Intelligence
                            </h3>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Current Season</p>
                                    <p className="text-xl font-semibold text-gray-900 dark:text-white">
                                        {dashboard.seasonalInsights.currentSeason}
                                    </p>
                                    <p className="text-sm text-blue-600 mt-1">
                                        {dashboard.seasonalInsights.seasonalMultiplier}x demand multiplier
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Upcoming Events</p>
                                    <div className="space-y-2">
                                        {dashboard.seasonalInsights.upcomingEvents.map((event, index) => (
                                            <div key={index} className="flex items-center justify-between">
                                                <span className="text-sm text-gray-900 dark:text-white">{event.event}</span>
                                                <span className="text-sm text-green-600">+{event.expectedImpact}%</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Material Predictions Tab */}
                {activeTab === 'predictions' && (
                    <div className="space-y-6">
                        <div className="grid gap-6">
                            {predictions.map(prediction => (
                                <div key={`${prediction.itemId}-${prediction.warehouseId}`}
                                    className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                {prediction.itemName}
                                            </h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                {prediction.warehouseName} • {prediction.category}
                                            </p>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            {getTrendIcon(prediction.trendAnalysis.trend)}
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getUrgencyColor(prediction.refillRecommendation.urgencyLevel)
                                                }`}>
                                                {prediction.refillRecommendation.urgencyLevel.toUpperCase()}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                        {/* Current Status */}
                                        <div>
                                            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Current Status</h4>
                                            <div className="space-y-2">
                                                <div className="flex justify-between">
                                                    <span className="text-sm text-gray-600 dark:text-gray-400">Stock:</span>
                                                    <span className="text-sm font-medium">{prediction.currentStock} {prediction.unit}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-sm text-gray-600 dark:text-gray-400">Avg Monthly:</span>
                                                    <span className="text-sm font-medium">{prediction.historicalData.averageMonthlyDemand} {prediction.unit}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Predictions */}
                                        <div>
                                            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Demand Forecast</h4>
                                            <div className="space-y-2">
                                                <div className="flex justify-between">
                                                    <span className="text-sm text-gray-600 dark:text-gray-400">Next Month:</span>
                                                    <span className="text-sm font-medium">{prediction.predictedDemand.nextMonth} {prediction.unit}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-sm text-gray-600 dark:text-gray-400">Next 3 Months:</span>
                                                    <span className="text-sm font-medium">{prediction.predictedDemand.next3Months} {prediction.unit}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-sm text-gray-600 dark:text-gray-400">Confidence:</span>
                                                    <span className="text-sm font-medium text-green-600">{prediction.trendAnalysis.confidence}%</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Recommendations */}
                                        <div>
                                            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Refill Recommendation</h4>
                                            <div className="space-y-2">
                                                <div className="flex justify-between">
                                                    <span className="text-sm text-gray-600 dark:text-gray-400">Quantity:</span>
                                                    <span className="text-sm font-medium">{prediction.refillRecommendation.recommendedQuantity} {prediction.unit}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-sm text-gray-600 dark:text-gray-400">Est. Cost:</span>
                                                    <span className="text-sm font-medium">${prediction.refillRecommendation.estimatedCost.toLocaleString()}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-sm text-gray-600 dark:text-gray-400">Order By:</span>
                                                    <span className="text-sm font-medium text-orange-600">
                                                        {new Date(prediction.refillRecommendation.orderByDate).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="mt-4 flex space-x-3">
                                        <button
                                            onClick={() => adminApiService.generateRefillOrder(prediction.itemId, prediction.warehouseId)}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                                        >
                                            Generate Order
                                        </button>
                                        <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm">
                                            View Details
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Smart Alerts Tab */}
                {activeTab === 'alerts' && (
                    <div className="space-y-4">
                        {alerts.map(alert => (
                            <div key={alert.id} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border-l-4 border-orange-500">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-2 mb-2">
                                            <AlertTriangle className={`h-5 w-5 ${alert.severity === 'critical' ? 'text-red-600' :
                                                alert.severity === 'high' ? 'text-orange-600' : 'text-yellow-600'
                                                }`} />
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${alert.severity === 'critical' ? 'bg-red-100 text-red-800' :
                                                alert.severity === 'high' ? 'bg-orange-100 text-orange-800' : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                {alert.severity.toUpperCase()}
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                {new Date(alert.createdAt).toLocaleString()}
                                            </span>
                                        </div>
                                        <h3 className="font-semibold text-gray-900 dark:text-white">
                                            {alert.itemName} - {alert.warehouseName}
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-400 mt-1">{alert.message}</p>
                                        <p className="text-sm text-blue-600 mt-2">{alert.recommendedAction}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Quantity Needed</p>
                                        <p className="font-semibold text-gray-900 dark:text-white">{alert.quantityNeeded}</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                            Est. ${alert.estimatedCost.toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-4 flex space-x-3">
                                    <button
                                        onClick={() => adminApiService.acknowledgeAlert(alert.id)}
                                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                                    >
                                        Acknowledge
                                    </button>
                                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                                        Create Order
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Performance Analytics Tab */}
                {activeTab === 'analytics' && (
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                Prediction Accuracy & Performance
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-green-600">94.2%</div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">Prediction Accuracy</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-blue-600">23%</div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">Cost Reduction</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-purple-600">87%</div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">Stockout Prevention</div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                ROI Impact
                            </h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600 dark:text-gray-400">Avoided Stockout Costs</span>
                                    <span className="font-semibold text-green-600">+$45,230</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600 dark:text-gray-400">Reduced Emergency Orders</span>
                                    <span className="font-semibold text-green-600">+$12,890</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600 dark:text-gray-400">Storage Optimization</span>
                                    <span className="font-semibold text-green-600">+$8,450</span>
                                </div>
                                <hr className="border-gray-200 dark:border-gray-700" />
                                <div className="flex justify-between items-center text-lg font-semibold">
                                    <span className="text-gray-900 dark:text-white">Total Monthly Savings</span>
                                    <span className="text-green-600">$66,570</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PredictionSystem;
