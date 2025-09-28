import React, { useState, useEffect } from 'react';

interface CashierDashboardProps { }

export const CashierDashboard: React.FC<CashierDashboardProps> = () => {
    const [dashboardData, setDashboardData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/roles/cashier/dashboard', {
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

    const processPayment = async (orderId: string, paymentData: any) => {
        try {
            const response = await fetch(`/api/roles/cashier/payments/${orderId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(paymentData)
            });
            const data = await response.json();
            if (data.success) {
                fetchDashboardData(); // Refresh dashboard
            }
            return data;
        } catch (err) {
            console.error('Payment processing error:', err);
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
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">💰 Cashier Dashboard</h1>
                            <p className="text-gray-600 dark:text-gray-400">Payment processing and POS operations</p>
                        </div>
                        <div className="flex space-x-2">
                            <button
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                onClick={() => window.location.href = '/cashier/new-sale'}
                            >
                                💳 New Sale
                            </button>
                            <button
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                onClick={() => window.location.href = '/cashier/payments'}
                            >
                                💵 Process Payments
                            </button>
                        </div>
                    </div>
                </div>

                {/* Daily Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Today's Orders</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {dashboardData?.summary?.todayOrders || 0}
                                </p>
                            </div>
                            <div className="text-blue-500 text-3xl">🛒</div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Today's Revenue</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    Rs. {dashboardData?.summary?.todayRevenue?.toLocaleString() || '0'}
                                </p>
                            </div>
                            <div className="text-green-500 text-3xl">💰</div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Payments</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {dashboardData?.summary?.pendingPayments || 0}
                                </p>
                            </div>
                            <div className="text-orange-500 text-3xl">⏳</div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Cash Transactions</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {dashboardData?.summary?.cashTransactions || 0}
                                </p>
                            </div>
                            <div className="text-purple-500 text-3xl">💵</div>
                        </div>
                    </div>
                </div>

                {/* Main Actions */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            💳 Payment Operations
                        </h3>
                        <div className="space-y-3">
                            <button
                                className="w-full text-left p-3 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                                onClick={() => window.location.href = '/cashier/process-payment'}
                            >
                                <div className="flex items-center justify-between">
                                    <span className="font-medium">💳 Process Card Payment</span>
                                    <span className="text-green-600">→</span>
                                </div>
                            </button>

                            <button
                                className="w-full text-left p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                                onClick={() => window.location.href = '/cashier/cash-payment'}
                            >
                                <div className="flex items-center justify-between">
                                    <span className="font-medium">💵 Process Cash Payment</span>
                                    <span className="text-blue-600">→</span>
                                </div>
                            </button>

                            <button
                                className="w-full text-left p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
                                onClick={() => window.location.href = '/cashier/refunds'}
                            >
                                <div className="flex items-center justify-between">
                                    <span className="font-medium">🔄 Process Refunds</span>
                                    <span className="text-purple-600">→</span>
                                </div>
                            </button>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            📊 Sales Management
                        </h3>
                        <div className="space-y-3">
                            <button
                                className="w-full text-left p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors"
                                onClick={() => window.location.href = '/cashier/new-order'}
                            >
                                <div className="flex items-center justify-between">
                                    <span className="font-medium">🛒 Create New Order</span>
                                    <span className="text-indigo-600">→</span>
                                </div>
                            </button>

                            <button
                                className="w-full text-left p-3 bg-teal-50 dark:bg-teal-900/20 rounded-lg hover:bg-teal-100 dark:hover:bg-teal-900/30 transition-colors"
                                onClick={() => window.location.href = '/cashier/receipts'}
                            >
                                <div className="flex items-center justify-between">
                                    <span className="font-medium">🧾 Generate Receipts</span>
                                    <span className="text-teal-600">→</span>
                                </div>
                            </button>

                            <button
                                className="w-full text-left p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors"
                                onClick={() => window.location.href = '/cashier/daily-report'}
                            >
                                <div className="flex items-center justify-between">
                                    <span className="font-medium">📈 Daily Sales Report</span>
                                    <span className="text-orange-600">→</span>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Recent Transactions & Pending Payments */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            💳 Recent Transactions
                        </h3>
                        <div className="space-y-3">
                            {dashboardData?.recentTransactions?.slice(0, 5).map((transaction: any, index: number) => (
                                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white">
                                            {transaction.orderNumber || `Transaction ${index + 1}`}
                                        </p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {transaction.paymentMethod || 'Cash'} - {new Date().toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium text-green-600">
                                            +Rs. {transaction.amount?.toLocaleString() || '0'}
                                        </p>
                                    </div>
                                </div>
                            )) || (
                                    <p className="text-gray-500 text-sm">No recent transactions</p>
                                )}
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            ⏳ Pending Payments
                        </h3>
                        <div className="space-y-3">
                            {dashboardData?.pendingPayments?.slice(0, 5).map((payment: any, index: number) => (
                                <div key={index} className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="font-medium text-gray-900 dark:text-white">
                                            {payment.orderNumber || `Order ${index + 1}`}
                                        </p>
                                        <p className="text-sm text-orange-600 font-medium">
                                            Rs. {payment.totalAmount?.toLocaleString() || '0'}
                                        </p>
                                    </div>
                                    <div className="flex space-x-2">
                                        <button
                                            className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                                            onClick={() => processPayment(payment._id, {
                                                status: 'paid',
                                                method: 'cash',
                                                amount: payment.totalAmount
                                            })}
                                        >
                                            Mark Paid
                                        </button>
                                        <button
                                            className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                                            onClick={() => window.location.href = `/cashier/payment/${payment._id}`}
                                        >
                                            Process
                                        </button>
                                    </div>
                                </div>
                            )) || (
                                    <p className="text-gray-500 text-sm">No pending payments</p>
                                )}
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        ⚡ Quick Actions
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <button
                            className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors text-center"
                            onClick={() => window.location.href = '/orders/create'}
                        >
                            <div className="text-2xl mb-2">🛒</div>
                            <p className="text-sm font-medium">New Sale</p>
                        </button>

                        <button
                            className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors text-center"
                            onClick={() => window.print()}
                        >
                            <div className="text-2xl mb-2">🖨️</div>
                            <p className="text-sm font-medium">Print Receipt</p>
                        </button>

                        <button
                            className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors text-center"
                            onClick={() => window.location.href = '/inventory'}
                        >
                            <div className="text-2xl mb-2">📦</div>
                            <p className="text-sm font-medium">Check Stock</p>
                        </button>

                        <button
                            className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors text-center"
                            onClick={() => window.location.href = '/cashier/reports'}
                        >
                            <div className="text-2xl mb-2">📊</div>
                            <p className="text-sm font-medium">View Reports</p>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CashierDashboard;
