import { useState, useEffect } from 'react';
import { BellIcon, ShoppingCartIcon, TruckIcon, AlertTriangleIcon, CheckCircleIcon, XIcon, RefreshCwIcon, FilterIcon, PackageIcon, UserIcon, ShieldIcon, SettingsIcon } from 'lucide-react';
import { notificationService, Notification, NotificationFilters } from '../services/notificationService';

const NotificationsBeautiful = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<string>('all');
    const [notificationFilter, setNotificationFilter] = useState<NotificationFilters>({
        page: 1,
        limit: 20,
        unreadOnly: false
    });
    const [unreadCount, setUnreadCount] = useState(0);

    // Load notifications
    const loadNotifications = async (filters: NotificationFilters = notificationFilter) => {
        try {
            setLoading(true);
            setError(null);
            const response = await notificationService.getNotifications(filters);
            setNotifications(response.notifications);
            setUnreadCount(response.unreadCount);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load notifications');
            console.error('Error loading notifications:', err);
        } finally {
            setLoading(false);
        }
    };

    // Load notifications on component mount and filter changes
    useEffect(() => {
        const newFilter = { ...notificationFilter };

        if (filter === 'unread') {
            newFilter.unreadOnly = true;
        } else if (filter !== 'all') {
            newFilter.category = filter;
            newFilter.unreadOnly = false;
        } else {
            newFilter.unreadOnly = false;
            delete newFilter.category;
        }

        setNotificationFilter(newFilter);
        loadNotifications(newFilter);
    }, [filter]);

    const markAsRead = async (notificationId: string) => {
        try {
            await notificationService.markAsRead(notificationId);
            setNotifications(prev =>
                prev.map(notif =>
                    notif._id === notificationId
                        ? { ...notif, isRead: true, status: 'read' as const }
                        : notif
                )
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error('Error marking notification as read:', err);
        }
    };

    const deleteNotification = async (notificationId: string) => {
        try {
            await notificationService.deleteNotification(notificationId);
            setNotifications(prev => prev.filter(notif => notif._id !== notificationId));
        } catch (err) {
            console.error('Error deleting notification:', err);
        }
    };

    const markAllAsRead = async () => {
        try {
            await notificationService.markAllAsRead();
            setNotifications(prev =>
                prev.map(notif => ({ ...notif, isRead: true, status: 'read' as const }))
            );
            setUnreadCount(0);
        } catch (err) {
            console.error('Error marking all as read:', err);
        }
    };

    const filteredNotifications = notifications.filter((notif: Notification) => {
        if (filter === 'all') return true;
        if (filter === 'unread') return !notif.isRead;
        return notif.category === filter;
    });

    const getIcon = (category: string) => {
        switch (category) {
            case 'order':
                return <ShoppingCartIcon size={20} className="text-blue-500" />;
            case 'delivery':
                return <TruckIcon size={20} className="text-green-500" />;
            case 'inventory':
                return <PackageIcon size={20} className="text-orange-500" />;
            case 'user':
                return <UserIcon size={20} className="text-purple-500" />;
            case 'security':
                return <ShieldIcon size={20} className="text-red-500" />;
            case 'system':
                return <SettingsIcon size={20} className="text-gray-500" />;
            case 'payment':
                return <AlertTriangleIcon size={20} className="text-yellow-500" />;
            default:
                return <BellIcon size={20} className="text-gray-500" />;
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-slate-800 dark:to-indigo-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center">
                        <RefreshCwIcon className="h-8 w-8 text-white animate-spin" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Loading notifications...</h3>
                    <p className="text-gray-600 dark:text-gray-300">Please wait while we fetch your latest updates</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-slate-800 dark:to-indigo-900 flex items-center justify-center">
                <div className="text-center max-w-md">
                    <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl flex items-center justify-center">
                        <AlertTriangleIcon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Failed to load notifications</h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">{error}</p>
                    <button
                        onClick={() => loadNotifications()}
                        className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-medium hover:from-indigo-600 hover:to-purple-600 transition-all duration-300 hover:scale-105 shadow-lg"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-slate-800 dark:to-indigo-900 p-4 sm:p-6 lg:p-8">
            <div className="max-w-6xl mx-auto space-y-8">

                {/* Beautiful Header */}
                <div className="relative">
                    <div className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-8 text-white overflow-hidden shadow-2xl">
                        {/* Animated Background Elements */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 via-transparent to-pink-300/20"></div>
                        <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full animate-pulse"></div>
                        <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-white/5 rounded-full"></div>
                        <div className="absolute top-1/3 right-1/4 w-8 h-8 bg-white/20 rounded-full animate-ping"></div>

                        <div className="relative z-10">
                            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                                <div className="space-y-3">
                                    <div className="flex items-center space-x-3">
                                        <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl border border-white/30">
                                            <BellIcon className="h-8 w-8 text-yellow-300 animate-pulse" />
                                        </div>
                                        <h1 className="text-4xl lg:text-5xl font-black bg-gradient-to-r from-white via-yellow-100 to-pink-100 bg-clip-text text-transparent">
                                            Notifications
                                        </h1>
                                    </div>
                                    {unreadCount > 0 && (
                                        <div className="flex items-center space-x-2 bg-red-500/20 backdrop-blur-sm rounded-full px-4 py-2 border border-red-400/30">
                                            <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                                            <span className="text-red-100 text-sm font-medium">
                                                {unreadCount} unread notification{unreadCount === 1 ? '' : 's'}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => loadNotifications()}
                                        className="group p-3 bg-white/20 backdrop-blur-sm rounded-2xl border border-white/30 hover:bg-white/30 transition-all duration-300 hover:scale-110"
                                        title="Refresh"
                                    >
                                        <RefreshCwIcon className="h-5 w-5 text-white group-hover:animate-spin" />
                                    </button>
                                    {unreadCount > 0 && (
                                        <button
                                            onClick={markAllAsRead}
                                            className="px-6 py-3 bg-green-500/80 backdrop-blur-sm text-white rounded-2xl font-medium hover:bg-green-400 transition-all duration-300 hover:scale-105 shadow-lg border border-green-400/30"
                                        >
                                            Mark all read
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Modern Filter Tabs */}
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 dark:border-gray-700/50">
                    <div className="flex items-center gap-2 mb-6">
                        <FilterIcon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                        <span className="text-lg font-semibold text-gray-800 dark:text-white">Filter Notifications</span>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        {[
                            { key: 'all', label: 'All', icon: BellIcon, color: 'indigo' },
                            { key: 'unread', label: 'Unread', icon: AlertTriangleIcon, color: 'red' },
                            { key: 'order', label: 'Orders', icon: ShoppingCartIcon, color: 'blue' },
                            { key: 'delivery', label: 'Delivery', icon: TruckIcon, color: 'green' },
                            { key: 'inventory', label: 'Inventory', icon: PackageIcon, color: 'orange' },
                            { key: 'user', label: 'Users', icon: UserIcon, color: 'purple' },
                            { key: 'security', label: 'Security', icon: ShieldIcon, color: 'red' },
                            { key: 'system', label: 'System', icon: SettingsIcon, color: 'gray' }
                        ].map(({ key, label, icon: Icon }) => (
                            <button
                                key={key}
                                onClick={() => setFilter(key)}
                                className={`group flex items-center space-x-2 px-4 py-3 rounded-xl font-medium transition-all duration-300 hover:scale-105 ${filter === key
                                        ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30'
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                    }`}
                            >
                                <Icon className={`h-4 w-4 ${filter === key ? 'text-white' : 'text-indigo-500'} group-hover:animate-pulse`} />
                                <span>{label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Beautiful Notifications Grid */}
                <div className="grid gap-6">
                    {filteredNotifications.map((notification: Notification, index: number) => (
                        <div
                            key={notification._id}
                            className={`group relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 dark:border-gray-700/50 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl ${!notification.isRead ? 'ring-2 ring-indigo-500/30 bg-gradient-to-r from-indigo-50/50 to-purple-50/50 dark:from-indigo-900/20 dark:to-purple-900/20' : ''
                                }`}
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            {/* Unread Indicator */}
                            {!notification.isRead && (
                                <div className="absolute -top-2 -right-2 w-4 h-4 bg-gradient-to-r from-red-500 to-pink-500 rounded-full animate-pulse shadow-lg"></div>
                            )}

                            <div className="flex items-start gap-4">
                                {/* Category Icon */}
                                <div className={`flex-shrink-0 p-3 rounded-2xl ${notification.category === 'order' ? 'bg-blue-100 dark:bg-blue-900/30' :
                                        notification.category === 'delivery' ? 'bg-green-100 dark:bg-green-900/30' :
                                            notification.category === 'inventory' ? 'bg-orange-100 dark:bg-orange-900/30' :
                                                notification.category === 'user' ? 'bg-purple-100 dark:bg-purple-900/30' :
                                                    notification.category === 'security' ? 'bg-red-100 dark:bg-red-900/30' :
                                                        'bg-gray-100 dark:bg-gray-700'
                                    }`}>
                                    {getIcon(notification.category)}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                                {notification.title}
                                            </h3>
                                            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-4">
                                                {notification.message}
                                            </p>

                                            {/* Meta Information */}
                                            <div className="flex flex-wrap items-center gap-3">
                                                <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                                                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                                                    <span>{formatDate(notification.createdAt)}</span>
                                                </div>

                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${notification.category === 'order' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                                                        notification.category === 'delivery' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                                                            notification.category === 'inventory' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' :
                                                                notification.category === 'user' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' :
                                                                    notification.category === 'security' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
                                                                        'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                                                    }`}>
                                                    {notification.category}
                                                </span>

                                                {notification.priority === 'high' && (
                                                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-orange-400 to-red-400 text-white shadow-lg">
                                                        High Priority
                                                    </span>
                                                )}
                                                {notification.priority === 'critical' && (
                                                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg animate-pulse">
                                                        Critical
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex items-center gap-2">
                                            {!notification.isRead && (
                                                <button
                                                    onClick={() => markAsRead(notification._id)}
                                                    className="p-2 rounded-xl bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50 transition-all duration-300 hover:scale-110"
                                                    title="Mark as read"
                                                >
                                                    <CheckCircleIcon className="h-5 w-5" />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => deleteNotification(notification._id)}
                                                className="p-2 rounded-xl bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-all duration-300 hover:scale-110"
                                                title="Delete"
                                            >
                                                <XIcon className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Empty State */}
                    {filteredNotifications.length === 0 && (
                        <div className="text-center py-16">
                            <div className="relative">
                                <div className="w-24 h-24 mx-auto mb-8 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-3xl flex items-center justify-center">
                                    <BellIcon className="h-12 w-12 text-indigo-400 dark:text-indigo-500" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">No notifications</h3>
                                <p className="text-gray-600 dark:text-gray-400 text-lg max-w-md mx-auto">
                                    {filter === 'all'
                                        ? "You're all caught up! No new notifications at this time."
                                        : `No ${filter} notifications found. Try checking other categories.`
                                    }
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NotificationsBeautiful;
