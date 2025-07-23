import { useState, useEffect } from 'react';
import {
    BellIcon,
    ShoppingCartIcon,
    TruckIcon,
    AlertTriangleIcon,
    CheckCircleIcon,
    XIcon,
    RefreshCwIcon,
    FilterIcon,
    PackageIcon,
    UserIcon,
    ShieldIcon,
    SettingsIcon,
    StarIcon,
    ClockIcon,
    EyeIcon,
    TrashIcon,
    MailIcon
} from 'lucide-react';
import { notificationService, Notification, NotificationFilters } from '../services/notificationService';

const Notifications = () => {
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

    const getCategoryIcon = (category: string) => {
        const iconClass = "h-5 w-5";
        switch (category) {
            case 'order':
                return <ShoppingCartIcon className={`${iconClass} text-blue-500`} />;
            case 'delivery':
                return <TruckIcon className={`${iconClass} text-green-500`} />;
            case 'inventory':
                return <PackageIcon className={`${iconClass} text-orange-500`} />;
            case 'user':
                return <UserIcon className={`${iconClass} text-purple-500`} />;
            case 'security':
                return <ShieldIcon className={`${iconClass} text-red-500`} />;
            case 'system':
                return <SettingsIcon className={`${iconClass} text-gray-500`} />;
            case 'payment':
                return <AlertTriangleIcon className={`${iconClass} text-yellow-500`} />;
            default:
                return <BellIcon className={`${iconClass} text-gray-500`} />;
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
            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900 flex items-center justify-center">
                <div className="text-center space-y-6">
                    <div className="relative">
                        <div className="w-20 h-20 mx-auto bg-gradient-to-tr from-purple-500 to-pink-500 rounded-3xl flex items-center justify-center shadow-2xl">
                            <RefreshCwIcon className="h-10 w-10 text-white animate-spin" />
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-tr from-purple-400 to-pink-400 rounded-3xl animate-ping opacity-20"></div>
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Loading Notifications</h3>
                        <p className="text-gray-600 dark:text-gray-300">Fetching your latest updates...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900 flex items-center justify-center">
                <div className="text-center max-w-md space-y-6">
                    <div className="w-20 h-20 mx-auto bg-gradient-to-tr from-red-500 to-pink-500 rounded-3xl flex items-center justify-center shadow-2xl">
                        <AlertTriangleIcon className="h-10 w-10 text-white" />
                    </div>
                    <div className="space-y-4">
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Oops! Something went wrong</h3>
                        <p className="text-gray-600 dark:text-gray-300">{error}</p>
                        <button
                            onClick={() => loadNotifications()}
                            className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900">
            {/* Floating Background Elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-300/20 rounded-full blur-3xl animate-float"></div>
                <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-pink-300/20 rounded-full blur-3xl animate-float-delayed"></div>
                <div className="absolute top-3/4 left-1/3 w-48 h-48 bg-blue-300/20 rounded-full blur-3xl animate-float-slow"></div>
            </div>

            <div className="relative z-10 p-4 sm:p-6 lg:p-8">
                <div className="max-w-6xl mx-auto space-y-8">

                    {/* Stunning Header */}
                    <div className="relative">
                        <div className="relative bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 rounded-3xl p-8 text-white overflow-hidden shadow-2xl transform hover:scale-[1.01] transition-all duration-500">
                            {/* Animated Background */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-white/5"></div>
                            <div className="absolute -top-4 -right-4 w-32 h-32 bg-white/10 rounded-full animate-pulse"></div>
                            <div className="absolute -bottom-6 -left-6 w-40 h-40 bg-white/5 rounded-full"></div>
                            <div className="absolute top-1/3 right-1/4 w-12 h-12 bg-white/20 rounded-full animate-ping"></div>
                            <div className="absolute bottom-1/4 left-1/3 w-8 h-8 bg-white/30 rounded-full animate-bounce"></div>

                            <div className="relative z-10">
                                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                                    <div className="space-y-4">
                                        <div className="flex items-center space-x-4">
                                            <div className="p-4 bg-white/20 backdrop-blur-sm rounded-3xl border border-white/30 shadow-lg">
                                                <BellIcon className="h-10 w-10 text-yellow-300 animate-pulse" />
                                            </div>
                                            <div>
                                                <h1 className="text-4xl lg:text-6xl font-black bg-gradient-to-r from-white via-yellow-100 to-pink-100 bg-clip-text text-transparent drop-shadow-lg">
                                                    Notifications
                                                </h1>
                                                <p className="text-purple-100 text-lg font-medium">Stay updated with your latest activity</p>
                                            </div>
                                        </div>

                                        {unreadCount > 0 && (
                                            <div className="inline-flex items-center space-x-3 bg-red-500/20 backdrop-blur-sm rounded-full px-6 py-3 border border-red-400/30 shadow-lg">
                                                <div className="relative">
                                                    <div className="w-3 h-3 bg-red-400 rounded-full animate-pulse"></div>
                                                    <div className="absolute inset-0 w-3 h-3 bg-red-400 rounded-full animate-ping"></div>
                                                </div>
                                                <span className="text-red-100 font-semibold">
                                                    {unreadCount} unread notification{unreadCount === 1 ? '' : 's'}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <button
                                            onClick={() => loadNotifications()}
                                            className="group p-4 bg-white/20 backdrop-blur-sm rounded-2xl border border-white/30 hover:bg-white/30 transition-all duration-300 hover:scale-110 shadow-lg"
                                            title="Refresh notifications"
                                        >
                                            <RefreshCwIcon className="h-6 w-6 text-white group-hover:animate-spin" />
                                        </button>
                                        {unreadCount > 0 && (
                                            <button
                                                onClick={markAllAsRead}
                                                className="px-6 py-3 bg-green-500/80 backdrop-blur-sm text-white rounded-2xl font-semibold hover:bg-green-400 transition-all duration-300 hover:scale-105 shadow-lg border border-green-400/30"
                                            >
                                                <CheckCircleIcon className="h-5 w-5 inline mr-2" />
                                                Mark all read
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Modern Filter Section */}
                    <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/30 dark:border-gray-700/30">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
                                <FilterIcon className="h-5 w-5 text-white" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Filter by Category</h2>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
                            {[
                                { key: 'all', label: 'All', icon: BellIcon, color: 'from-purple-500 to-pink-500' },
                                { key: 'unread', label: 'Unread', icon: MailIcon, color: 'from-red-500 to-orange-500' },
                                { key: 'order', label: 'Orders', icon: ShoppingCartIcon, color: 'from-blue-500 to-cyan-500' },
                                { key: 'delivery', label: 'Delivery', icon: TruckIcon, color: 'from-green-500 to-emerald-500' },
                                { key: 'inventory', label: 'Stock', icon: PackageIcon, color: 'from-orange-500 to-yellow-500' },
                                { key: 'user', label: 'Users', icon: UserIcon, color: 'from-purple-500 to-indigo-500' },
                                { key: 'security', label: 'Security', icon: ShieldIcon, color: 'from-red-500 to-pink-500' },
                                { key: 'system', label: 'System', icon: SettingsIcon, color: 'from-gray-500 to-slate-500' }
                            ].map(({ key, label, icon: Icon, color }) => (
                                <button
                                    key={key}
                                    onClick={() => setFilter(key)}
                                    className={`group flex flex-col items-center space-y-2 p-4 rounded-2xl font-medium transition-all duration-300 hover:scale-105 ${filter === key
                                            ? `bg-gradient-to-r ${color} text-white shadow-lg`
                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                        }`}
                                >
                                    <Icon className={`h-5 w-5 ${filter === key ? 'text-white' : ''} group-hover:animate-pulse`} />
                                    <span className="text-sm font-medium">{label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Beautiful Notifications Grid */}
                    <div className="space-y-4">
                        {filteredNotifications.map((notification: Notification, index: number) => (
                            <div
                                key={notification._id}
                                className={`group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/30 dark:border-gray-700/30 transition-all duration-500 hover:scale-[1.01] hover:shadow-2xl transform ${!notification.isRead ? 'ring-2 ring-purple-400/50 bg-gradient-to-r from-purple-50/80 to-pink-50/80 dark:from-purple-900/20 dark:to-pink-900/20' : ''
                                    }`}
                                style={{
                                    animationDelay: `${index * 100}ms`,
                                    animation: 'slideInUp 0.6s ease-out forwards'
                                }}
                            >
                                {/* Unread Indicator */}
                                {!notification.isRead && (
                                    <div className="absolute -top-2 -right-2">
                                        <div className="relative">
                                            <div className="w-5 h-5 bg-gradient-to-r from-red-500 to-pink-500 rounded-full shadow-lg"></div>
                                            <div className="absolute inset-0 w-5 h-5 bg-red-400 rounded-full animate-ping opacity-75"></div>
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-start gap-4">
                                    {/* Category Icon */}
                                    <div className={`flex-shrink-0 p-3 rounded-2xl shadow-lg ${notification.category === 'order' ? 'bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30' :
                                            notification.category === 'delivery' ? 'bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30' :
                                                notification.category === 'inventory' ? 'bg-gradient-to-r from-orange-100 to-yellow-100 dark:from-orange-900/30 dark:to-yellow-900/30' :
                                                    notification.category === 'user' ? 'bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30' :
                                                        notification.category === 'security' ? 'bg-gradient-to-r from-red-100 to-pink-100 dark:from-red-900/30 dark:to-pink-900/30' :
                                                            'bg-gradient-to-r from-gray-100 to-slate-100 dark:from-gray-700 dark:to-slate-700'
                                        }`}>
                                        {getCategoryIcon(notification.category)}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1 space-y-3">
                                                <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors line-clamp-2">
                                                    {notification.title}
                                                </h3>
                                                <p className="text-gray-600 dark:text-gray-300 leading-relaxed line-clamp-3">
                                                    {notification.message}
                                                </p>

                                                {/* Meta Information */}
                                                <div className="flex flex-wrap items-center gap-3">
                                                    <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                                                        <ClockIcon className="h-4 w-4" />
                                                        <span>{formatDate(notification.createdAt)}</span>
                                                    </div>

                                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium shadow-sm ${notification.category === 'order' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                                                            notification.category === 'delivery' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                                                                notification.category === 'inventory' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' :
                                                                    notification.category === 'user' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' :
                                                                        notification.category === 'security' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
                                                                            'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                                                        }`}>
                                                        {notification.category}
                                                    </span>

                                                    {notification.priority === 'high' && (
                                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-orange-400 to-red-400 text-white shadow-lg">
                                                            <StarIcon className="h-3 w-3 mr-1" />
                                                            High Priority
                                                        </span>
                                                    )}
                                                    {notification.priority === 'critical' && (
                                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg animate-pulse">
                                                            <AlertTriangleIcon className="h-3 w-3 mr-1" />
                                                            Critical
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex flex-col gap-2">
                                                {!notification.isRead && (
                                                    <button
                                                        onClick={() => markAsRead(notification._id)}
                                                        className="p-3 rounded-xl bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50 transition-all duration-300 hover:scale-110 shadow-lg"
                                                        title="Mark as read"
                                                    >
                                                        <EyeIcon className="h-5 w-5" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => deleteNotification(notification._id)}
                                                    className="p-3 rounded-xl bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-all duration-300 hover:scale-110 shadow-lg"
                                                    title="Delete notification"
                                                >
                                                    <TrashIcon className="h-5 w-5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Beautiful Empty State */}
                        {filteredNotifications.length === 0 && (
                            <div className="text-center py-20">
                                <div className="relative max-w-md mx-auto">
                                    <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-3xl flex items-center justify-center shadow-2xl">
                                        <BellIcon className="h-16 w-16 text-purple-400 dark:text-purple-500" />
                                    </div>
                                    <div className="space-y-4">
                                        <h3 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                            All caught up!
                                        </h3>
                                        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-sm mx-auto">
                                            {filter === 'all'
                                                ? "You don't have any notifications right now. We'll let you know when something new comes up!"
                                                : `No ${filter} notifications found. Try checking other categories or come back later.`
                                            }
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Notifications;
