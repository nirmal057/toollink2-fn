import React, { useState, useEffect } from 'react';
import {
  Activity,
  Search,
  User,
  Shield,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  XCircle,
  Info
} from 'lucide-react';
import { adminApiService, AuditLog } from '../services/adminApiService';
import { rbacService, PERMISSIONS } from '../services/rbacService';

const AuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    pages: 0
  });
  const [filters, setFilters] = useState({
    action: '',
    userId: '',
    search: ''
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAuditLogs();
  }, [pagination.page, filters]);

  const loadAuditLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminApiService.getAuditLogs(
        pagination.page,
        pagination.limit,
        filters.action || filters.userId ? {
          action: filters.action || undefined,
          userId: filters.userId || undefined
        } : undefined
      );
      setLogs(response.logs);
      setPagination(prev => ({
        ...prev,
        total: response.pagination.total,
        pages: response.pagination.pages
      }));
    } catch (err) {
      console.error('Failed to load audit logs:', err);
      setError(err instanceof Error ? err.message : 'Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case 'user_login':
      case 'login':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'user_logout':
      case 'logout':
        return <XCircle className="h-4 w-4 text-gray-500" />;
      case 'user_created':
      case 'user_updated':
      case 'user_deleted':
        return <User className="h-4 w-4 text-blue-500" />;
      case 'permission_granted':
      case 'permission_denied':
        return <Shield className="h-4 w-4 text-orange-500" />;
      case 'system_error':
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Info className="h-4 w-4 text-gray-400" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action.toLowerCase()) {
      case 'user_login':
      case 'login':
        return 'text-green-700 bg-green-50 dark:text-green-300 dark:bg-green-900/20';
      case 'user_logout':
      case 'logout':
        return 'text-gray-700 bg-gray-50 dark:text-gray-300 dark:bg-gray-900/20';
      case 'user_created':
      case 'user_updated':
        return 'text-blue-700 bg-blue-50 dark:text-blue-300 dark:bg-blue-900/20';
      case 'user_deleted':
        return 'text-red-700 bg-red-50 dark:text-red-300 dark:bg-red-900/20';
      case 'permission_granted':
        return 'text-green-700 bg-green-50 dark:text-green-300 dark:bg-green-900/20';
      case 'permission_denied':
        return 'text-red-700 bg-red-50 dark:text-red-300 dark:bg-red-900/20';
      case 'system_error':
      case 'error':
        return 'text-red-700 bg-red-50 dark:text-red-300 dark:bg-red-900/20';
      default:
        return 'text-gray-700 bg-gray-50 dark:text-gray-300 dark:bg-gray-900/20';
    }
  };

  if (!rbacService.hasPermission(PERMISSIONS.VIEW_AUDIT_LOGS)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="text-center bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
          <Shield className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Access Denied</h1>
          <p className="text-gray-600 dark:text-gray-400">You don't have permission to view audit logs.</p>
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
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl shadow-xl">
                  <Activity className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 via-blue-600 to-purple-600 dark:from-white dark:via-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                    System Audit Logs
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">
                    Monitor all system activities and user actions
                  </p>
                </div>
              </div>
              <button
                onClick={loadAuditLogs}
                disabled={loading}
                className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white px-6 py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 transform disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>

        {/* Beautiful Filters */}
        <div className="bg-gradient-to-br from-white via-green-50/30 to-emerald-50/50 dark:from-gray-800 dark:via-green-900/10 dark:to-emerald-900/20 rounded-3xl shadow-xl p-8 mb-8 border border-white/50 dark:border-gray-700/50 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-200/20 to-emerald-300/20 rounded-full blur-2xl transform translate-x-8 -translate-y-8"></div>

          <div className="relative z-10">
            <div className="flex items-center space-x-4 mb-6">
              <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg">
                <Search className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Filter Logs</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
                  Search
                </label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search logs..."
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="pl-12 w-full px-4 py-3 border border-white/50 dark:border-gray-600/50 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white/70 dark:bg-gray-700/70 text-gray-900 dark:text-white backdrop-blur-sm shadow-lg transition-all duration-300 hover:shadow-xl"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
                  Action Type
                </label>
                <select
                  value={filters.action}
                  onChange={(e) => setFilters(prev => ({ ...prev, action: e.target.value }))}
                  className="w-full px-4 py-3 border border-white/50 dark:border-gray-600/50 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white/70 dark:bg-gray-700/70 text-gray-900 dark:text-white backdrop-blur-sm shadow-lg transition-all duration-300 hover:shadow-xl"
                >
                  <option value="">All Actions</option>
                  <option value="user_login">User Login</option>
                  <option value="user_logout">User Logout</option>
                  <option value="user_created">User Created</option>
                  <option value="user_updated">User Updated</option>
                  <option value="user_deleted">User Deleted</option>
                  <option value="inventory_created">Inventory Created</option>
                  <option value="inventory_updated">Inventory Updated</option>
                  <option value="order_created">Order Created</option>
                  <option value="order_updated">Order Updated</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
                  User ID
                </label>
                <input
                  type="text"
                  placeholder="Filter by user ID..."
                  value={filters.userId}
                  onChange={(e) => setFilters(prev => ({ ...prev, userId: e.target.value }))}
                  className="w-full px-4 py-3 border border-white/50 dark:border-gray-600/50 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white/70 dark:bg-gray-700/70 text-gray-900 dark:text-white backdrop-blur-sm shadow-lg transition-all duration-300 hover:shadow-xl"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Beautiful Error State */}
        {error && (
          <div className="bg-gradient-to-r from-red-50 via-red-100 to-red-50 dark:from-red-900/20 dark:via-red-800/30 dark:to-red-900/20 border border-red-200/50 dark:border-red-700/50 rounded-2xl p-6 mb-8 shadow-lg backdrop-blur-sm">
            <div className="flex items-center">
              <div className="p-2 bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg mr-4">
                <AlertCircle className="h-5 w-5 text-white" />
              </div>
              <p className="text-red-700 dark:text-red-300 font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Beautiful Audit Logs Table */}
        <div className="bg-gradient-to-br from-white via-gray-50/30 to-gray-100/50 dark:from-gray-800 dark:via-gray-700/10 dark:to-gray-900/20 rounded-3xl shadow-xl border border-white/50 dark:border-gray-700/50 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-4 border-purple-600"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400 text-lg font-medium">Loading audit logs...</p>
            </div>
          ) : (
            <>
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 px-8 py-6 border-b border-gray-200/50 dark:border-gray-600/50">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                    <Activity className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Activity Timeline</h3>
                  <div className="ml-auto bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-3 py-1 rounded-full text-sm font-semibold">
                    {logs.length} entries
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800">
                    <tr>
                      <th className="px-8 py-4 text-left text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                        Action
                      </th>
                      <th className="px-8 py-4 text-left text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-8 py-4 text-left text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                        Details
                      </th>
                      <th className="px-8 py-4 text-left text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-8 py-4 text-left text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                        IP Address
                      </th>
                      <th className="px-8 py-4 text-left text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                        Timestamp
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800/50 backdrop-blur-sm">
                    {logs.map((log, index) => (
                      <tr key={log._id} className={`hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-all duration-300 ${index % 2 === 0 ? 'bg-gray-50/30 dark:bg-gray-700/30' : ''}`}>
                        <td className="px-8 py-6 whitespace-nowrap">
                          <div className="flex items-center space-x-3">
                            {getActionIcon(log.action)}
                            <span className={`inline-flex px-3 py-2 text-sm font-bold rounded-full shadow-sm ${getActionColor(log.action)}`}>
                              {log.action.replace(/_/g, ' ')}
                            </span>
                          </div>
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap">
                          {log.userId ? (
                            <div className="flex items-center space-x-3">
                              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                                <User className="h-4 w-4 text-white" />
                              </div>
                              <div>
                                <div className="font-bold text-gray-900 dark:text-white">
                                  {log.userId.fullName || log.userId.username || 'Unknown User'}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  {log.userId.email}
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-2">
                              <div className="p-1 bg-gradient-to-br from-gray-500 to-gray-600 rounded-lg shadow-sm">
                                <Shield className="h-3 w-3 text-white" />
                              </div>
                              <span className="font-bold text-gray-600 dark:text-gray-300">System</span>
                            </div>
                          )}
                        </td>
                        <td className="px-8 py-6 text-sm text-gray-900 dark:text-white max-w-xs">
                          <div className="truncate">
                            {typeof log.details === 'object' ? (
                              <div className="space-y-2">
                                {log.details.action && (
                                  <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full shadow-sm ${log.details.action.includes('success')
                                    ? 'text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-900/30'
                                    : log.details.action.includes('failed')
                                      ? 'text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-900/30'
                                      : 'text-blue-700 bg-blue-100 dark:text-blue-300 dark:bg-blue-900/30'
                                    }`}>
                                    {log.details.action.replace(/_/g, ' ')}
                                  </span>
                                )}
                                {log.details.userEmail && (
                                  <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">Email: {log.details.userEmail}</div>
                                )}
                                {log.details.reason && (
                                  <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">Reason: {log.details.reason}</div>
                                )}
                                {log.details.changedFields && (
                                  <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                                    Fields: {log.details.changedFields.join(', ')}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="font-medium">{log.details}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap">
                          <div className="flex items-center">
                            {log.details && typeof log.details === 'object' && log.details.success !== undefined ? (
                              log.details.success ? (
                                <div className="flex items-center space-x-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-3 py-2 rounded-xl shadow-sm">
                                  <CheckCircle className="h-4 w-4" />
                                  <span className="text-sm font-bold">Success</span>
                                </div>
                              ) : (
                                <div className="flex items-center space-x-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 px-3 py-2 rounded-xl shadow-sm">
                                  <XCircle className="h-4 w-4" />
                                  <span className="text-sm font-bold">Failed</span>
                                </div>
                              )
                            ) : (
                              <div className="flex items-center space-x-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-2 rounded-xl shadow-sm">
                                <Info className="h-4 w-4" />
                                <span className="text-sm font-bold">Info</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap text-sm font-medium text-gray-600 dark:text-gray-400">
                          <div className="bg-gray-100 dark:bg-gray-700/50 px-3 py-2 rounded-xl shadow-sm">
                            {log.ipAddress}
                          </div>
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap text-sm font-medium text-gray-600 dark:text-gray-400">
                          <div className="bg-gray-100 dark:bg-gray-700/50 px-3 py-2 rounded-xl shadow-sm">
                            {new Date(log.timestamp).toLocaleString()}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {logs.length === 0 && !loading && (
                  <div className="p-16 text-center">
                    <div className="p-4 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-3xl shadow-lg mx-auto w-24 h-24 flex items-center justify-center mb-6">
                      <Activity className="h-12 w-12 text-gray-400" />
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">No audit logs found matching your criteria.</p>
                  </div>
                )}
              </div>

              {/* Beautiful Pagination */}
              {pagination.pages > 1 && (
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 px-8 py-6 flex items-center justify-between border-t border-gray-200/50 dark:border-gray-600/50">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                      disabled={pagination.page === 1}
                      className="relative inline-flex items-center px-6 py-3 border border-white/50 dark:border-gray-600/50 text-sm font-bold rounded-xl text-gray-700 dark:text-gray-300 bg-white/70 dark:bg-gray-800/70 hover:bg-white dark:hover:bg-gray-700 disabled:opacity-50 backdrop-blur-sm shadow-lg transition-all duration-300 hover:shadow-xl"
                    >
                      <ChevronLeft className="h-4 w-4 mr-2" />
                      Previous
                    </button>
                    <button
                      onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.pages, prev.page + 1) }))}
                      disabled={pagination.page === pagination.pages}
                      className="ml-3 relative inline-flex items-center px-6 py-3 border border-white/50 dark:border-gray-600/50 text-sm font-bold rounded-xl text-gray-700 dark:text-gray-300 bg-white/70 dark:bg-gray-800/70 hover:bg-white dark:hover:bg-gray-700 disabled:opacity-50 backdrop-blur-sm shadow-lg transition-all duration-300 hover:shadow-xl"
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl px-4 py-3 shadow-lg">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Showing{' '}
                        <span className="font-bold text-blue-600">{((pagination.page - 1) * pagination.limit) + 1}</span>
                        {' '}to{' '}
                        <span className="font-bold text-blue-600">
                          {Math.min(pagination.page * pagination.limit, pagination.total)}
                        </span>
                        {' '}of{' '}
                        <span className="font-bold text-blue-600">{pagination.total}</span>
                        {' '}results
                      </p>
                    </div>
                    <div>
                      <nav className="flex items-center space-x-2" aria-label="Pagination">
                        <button
                          onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                          disabled={pagination.page === 1}
                          className="relative inline-flex items-center px-4 py-3 rounded-xl border border-white/50 dark:border-gray-600/50 bg-white/70 dark:bg-gray-800/70 text-sm font-bold text-gray-500 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-700 disabled:opacity-50 backdrop-blur-sm shadow-lg transition-all duration-300 hover:shadow-xl"
                        >
                          <ChevronLeft className="h-5 w-5" />
                        </button>
                        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-xl shadow-lg">
                          <span className="text-sm font-bold">
                            Page {pagination.page} of {pagination.pages}
                          </span>
                        </div>
                        <button
                          onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.pages, prev.page + 1) }))}
                          disabled={pagination.page === pagination.pages}
                          className="relative inline-flex items-center px-4 py-3 rounded-xl border border-white/50 dark:border-gray-600/50 bg-white/70 dark:bg-gray-800/70 text-sm font-bold text-gray-500 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-700 disabled:opacity-50 backdrop-blur-sm shadow-lg transition-all duration-300 hover:shadow-xl"
                        >
                          <ChevronRight className="h-5 w-5" />
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuditLogs;
