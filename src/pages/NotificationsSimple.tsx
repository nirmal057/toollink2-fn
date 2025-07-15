import { useState, useEffect } from 'react';
import { notificationService } from '../services/notificationService';

const Notifications = ({ userRole }: { userRole: string }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [notifications, setNotifications] = useState<any[]>([]);

    useEffect(() => {
        console.log('🔔 Notifications component mounted for user role:', userRole);

        const loadData = async () => {
            try {
                setLoading(true);
                setError(null);

                console.log('📡 Fetching notifications...');
                const result = await notificationService.getNotifications({ page: 1, limit: 10 });
                console.log('✅ Notifications loaded:', result);

                setNotifications(result.notifications || []);
            } catch (err) {
                console.error('❌ Failed to load notifications:', err);
                setError(err instanceof Error ? err.message : 'Failed to load notifications');
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [userRole]);

    // Loading state
    if (loading) {
        return (
            <div className="p-8">
                <h1 className="text-2xl font-bold mb-4">🔔 Notifications</h1>
                <div className="flex items-center space-x-2">
                    <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                    <span>Loading notifications...</span>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="p-8">
                <h1 className="text-2xl font-bold mb-4">🔔 Notifications</h1>
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    <strong>Error:</strong> {error}
                </div>
                <button
                    onClick={() => window.location.reload()}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                    Retry
                </button>
            </div>
        );
    }

    // Success state
    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-6">🔔 Notifications</h1>

            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
                ✅ Successfully loaded {notifications.length} notifications for user role: {userRole}
            </div>

            {notifications.length === 0 ? (
                <div className="text-center py-12">
                    <div className="text-6xl mb-4">🔕</div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">No notifications</h3>
                    <p className="text-gray-500">You're all caught up!</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {notifications.map((notification, index) => (
                        <div key={notification._id || index} className="bg-white border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-start space-x-4">
                                <div className="text-3xl">
                                    {notification.category === 'system' && '⚙️'}
                                    {notification.category === 'inventory' && '📦'}
                                    {notification.category === 'order' && '🛒'}
                                    {notification.category === 'delivery' && '🚚'}
                                    {!['system', 'inventory', 'order', 'delivery'].includes(notification.category) && '🔔'}
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{notification.title}</h3>
                                    <p className="text-gray-600 mb-3">{notification.message}</p>
                                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                                        <span className="bg-gray-100 px-2 py-1 rounded">
                                            📁 {notification.category}
                                        </span>
                                        <span className={`px-2 py-1 rounded ${notification.priority === 'high' ? 'bg-red-100 text-red-700' :
                                                notification.priority === 'normal' ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-green-100 text-green-700'
                                            }`}>
                                            ⚡ {notification.priority}
                                        </span>
                                        <span className={`px-2 py-1 rounded ${notification.isRead ? 'bg-gray-100 text-gray-600' : 'bg-blue-100 text-blue-700'
                                            }`}>
                                            {notification.isRead ? '✅ Read' : '📬 New'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Notifications;
