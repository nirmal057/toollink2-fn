import React, { useState, useEffect } from 'react';

interface EditorDashboardProps { }

export const EditorDashboard: React.FC<EditorDashboardProps> = () => {
    const [dashboardData, setDashboardData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/roles/editor/dashboard', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await response.json();
            setDashboardData(data.data);
        } catch (err) {
            console.error('Dashboard fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const manageContent = async (action: string, contentData: any) => {
        try {
            const response = await fetch(`/api/roles/editor/content/${action}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(contentData)
            });
            const data = await response.json();
            if (data.success) {
                fetchDashboardData(); // Refresh dashboard
            }
            return data;
        } catch (err) {
            console.error('Content management error:', err);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">✏️ Editor Dashboard</h1>
                            <p className="text-gray-600 dark:text-gray-400">Content management and inventory editing</p>
                        </div>
                        <div className="flex space-x-2">
                            <button
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                onClick={() => window.location.href = '/editor/inventory'}
                            >
                                📝 Edit Inventory
                            </button>
                            <button
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                onClick={() => window.location.href = '/editor/bulk-update'}
                            >
                                📊 Bulk Update
                            </button>
                        </div>
                    </div>
                </div>

                {/* Editor Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Items Managed</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {dashboardData?.summary?.itemsManaged || 0}
                                </p>
                            </div>
                            <div className="text-blue-500 text-3xl">📝</div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Recent Updates</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {dashboardData?.summary?.recentUpdates || 0}
                                </p>
                            </div>
                            <div className="text-green-500 text-3xl">🔄</div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Approvals</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {dashboardData?.summary?.pendingApprovals || 0}
                                </p>
                            </div>
                            <div className="text-orange-500 text-3xl">⏳</div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Categories</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">12</p>
                            </div>
                            <div className="text-purple-500 text-3xl">📂</div>
                        </div>
                    </div>
                </div>

                {/* Main Actions */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            📝 Content Management
                        </h3>
                        <div className="space-y-3">
                            <button
                                className="w-full text-left p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                                onClick={() => window.location.href = '/editor/inventory/edit'}
                            >
                                <div className="flex items-center justify-between">
                                    <span className="font-medium">📝 Edit Inventory Items</span>
                                    <span className="text-blue-600">→</span>
                                </div>
                            </button>

                            <button
                                className="w-full text-left p-3 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                                onClick={() => window.location.href = '/editor/inventory/add'}
                            >
                                <div className="flex items-center justify-between">
                                    <span className="font-medium">➕ Add New Items</span>
                                    <span className="text-green-600">→</span>
                                </div>
                            </button>

                            <button
                                className="w-full text-left p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
                                onClick={() => window.location.href = '/editor/categories'}
                            >
                                <div className="flex items-center justify-between">
                                    <span className="font-medium">📂 Manage Categories</span>
                                    <span className="text-purple-600">→</span>
                                </div>
                            </button>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            📊 Bulk Operations
                        </h3>
                        <div className="space-y-3">
                            <button
                                className="w-full text-left p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors"
                                onClick={() => window.location.href = '/editor/bulk-update/prices'}
                            >
                                <div className="flex items-center justify-between">
                                    <span className="font-medium">💰 Update Prices</span>
                                    <span className="text-indigo-600">→</span>
                                </div>
                            </button>

                            <button
                                className="w-full text-left p-3 bg-teal-50 dark:bg-teal-900/20 rounded-lg hover:bg-teal-100 dark:hover:bg-teal-900/30 transition-colors"
                                onClick={() => window.location.href = '/editor/bulk-update/descriptions'}
                            >
                                <div className="flex items-center justify-between">
                                    <span className="font-medium">📄 Update Descriptions</span>
                                    <span className="text-teal-600">→</span>
                                </div>
                            </button>

                            <button
                                className="w-full text-left p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors"
                                onClick={() => window.location.href = '/editor/import-export'}
                            >
                                <div className="flex items-center justify-between">
                                    <span className="font-medium">📤 Import/Export Data</span>
                                    <span className="text-orange-600">→</span>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Recent Activity & Pending Approvals */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            🔄 Recent Activity
                        </h3>
                        <div className="space-y-3">
                            {dashboardData?.recentActivity?.slice(0, 5).map((activity: any, index: number) => (
                                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white">
                                            {activity.action || `Activity ${index + 1}`}
                                        </p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {activity.targetModel || 'Unknown'} - {new Date(activity.timestamp || Date.now()).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <span className={`px-2 py-1 text-xs rounded-full ${activity.action?.includes('updated')
                                            ? 'bg-blue-100 text-blue-800'
                                            : activity.action?.includes('created')
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-gray-100 text-gray-800'
                                        }`}>
                                        {activity.action?.split('_')[0] || 'action'}
                                    </span>
                                </div>
                            )) || (
                                    <p className="text-gray-500 text-sm">No recent activity</p>
                                )}
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            ⏳ Pending Approvals
                        </h3>
                        <div className="space-y-3">
                            {dashboardData?.approvals?.slice(0, 5).map((approval: any, index: number) => (
                                <div key={index} className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="font-medium text-gray-900 dark:text-white">
                                            {approval.name || `Item ${index + 1}`}
                                        </p>
                                        <p className="text-sm text-orange-600 font-medium">
                                            {approval.category || 'No category'}
                                        </p>
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                        Changes need approval before going live
                                    </p>
                                    <div className="flex space-x-2">
                                        <button
                                            className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                                            onClick={() => manageContent('approve', { inventoryId: approval._id })}
                                        >
                                            Approve
                                        </button>
                                        <button
                                            className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                                            onClick={() => manageContent('reject', { inventoryId: approval._id })}
                                        >
                                            Reject
                                        </button>
                                    </div>
                                </div>
                            )) || (
                                    <p className="text-gray-500 text-sm">No pending approvals</p>
                                )}
                        </div>
                    </div>
                </div>

                {/* Inventory Overview */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        📦 Inventory Overview
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {dashboardData?.inventory?.slice(0, 6).map((item: any, index: number) => (
                            <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="font-medium text-gray-900 dark:text-white">
                                        {item.name || `Item ${index + 1}`}
                                    </p>
                                    <span className="text-sm text-gray-500">
                                        {item.category || 'No category'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Stock: {item.current_stock || 0}
                                    </p>
                                    <p className="text-sm font-medium text-green-600">
                                        Rs. {item.price || 0}
                                    </p>
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                                        onClick={() => window.location.href = `/editor/item/${item._id}`}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        className="px-3 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700"
                                        onClick={() => window.location.href = `/inventory/${item._id}`}
                                    >
                                        View
                                    </button>
                                </div>
                            </div>
                        )) || (
                                <div className="col-span-full">
                                    <p className="text-gray-500 text-sm text-center">No inventory items found</p>
                                </div>
                            )}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        ⚡ Quick Actions
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <button
                            className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors text-center"
                            onClick={() => window.location.href = '/editor/inventory/new'}
                        >
                            <div className="text-2xl mb-2">➕</div>
                            <p className="text-sm font-medium">Add New Item</p>
                        </button>

                        <button
                            className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors text-center"
                            onClick={() => window.location.href = '/editor/bulk-edit'}
                        >
                            <div className="text-2xl mb-2">📊</div>
                            <p className="text-sm font-medium">Bulk Edit</p>
                        </button>

                        <button
                            className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors text-center"
                            onClick={() => window.location.href = '/editor/categories/manage'}
                        >
                            <div className="text-2xl mb-2">📂</div>
                            <p className="text-sm font-medium">Categories</p>
                        </button>

                        <button
                            className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors text-center"
                            onClick={() => window.location.href = '/editor/reports'}
                        >
                            <div className="text-2xl mb-2">📈</div>
                            <p className="text-sm font-medium">View Reports</p>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditorDashboard;
