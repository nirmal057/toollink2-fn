import { useState, useEffect } from 'react';

interface SimpleNotification {
    _id: string;
    title: string;
    message: string;
    category: string;
    priority: string;
    isRead: boolean;
}

const SimpleNotifications = () => {
    const [notifications, setNotifications] = useState<SimpleNotification[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const testNotifications = async () => {
            try {
                console.log('🔄 Starting notification test...');

                // Test 1: Check if we can reach the backend
                const baseUrl = 'http://localhost:3000/api';
                console.log('📡 Testing backend connection...');

                // Test 2: Get auth token
                const authResponse = await fetch(`${baseUrl}/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: 'admin@toollink.com',
                        password: 'admin123'
                    })
                });

                const authData = await authResponse.json();
                console.log('🔐 Auth result:', authData.success ? 'SUCCESS' : 'FAILED');

                if (!authData.success) {
                    throw new Error('Authentication failed: ' + authData.error);
                }

                // Test 3: Get notifications
                console.log('📋 Testing notifications API...');
                const notifResponse = await fetch(`${baseUrl}/notifications`, {
                    headers: {
                        'Authorization': `Bearer ${authData.accessToken}`,
                        'Content-Type': 'application/json'
                    }
                });

                const notifData = await notifResponse.json();
                console.log('📬 Notifications result:', notifData);

                if (notifData.success) {
                    setNotifications(notifData.notifications || []);
                    console.log('✅ Successfully loaded', notifData.notifications?.length || 0, 'notifications');
                } else {
                    throw new Error('Failed to fetch notifications: ' + notifData.error);
                }

            } catch (err) {
                console.error('❌ Error:', err);
                setError(err instanceof Error ? err.message : 'Unknown error');
            } finally {
                setLoading(false);
            }
        };

        testNotifications();
    }, []);

    if (loading) {
        return (
            <div className="p-8">
                <h1 className="text-2xl font-bold mb-4">🔔 Simple Notifications Test</h1>
                <div className="flex items-center space-x-2">
                    <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                    <span>Loading notifications...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8">
                <h1 className="text-2xl font-bold mb-4">🔔 Simple Notifications Test</h1>
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    <strong>Error:</strong> {error}
                </div>
                <button
                    onClick={() => window.location.reload()}
                    className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">🔔 Simple Notifications Test</h1>

            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                ✅ Successfully connected to backend and loaded {notifications.length} notifications!
            </div>

            <div className="space-y-4">
                {notifications.length === 0 ? (
                    <p className="text-gray-600">No notifications found.</p>
                ) : (
                    notifications.map((notification, index) => (
                        <div key={notification._id || index} className="bg-white border rounded-lg p-4 shadow">
                            <div className="flex items-start space-x-3">
                                <div className="text-2xl">
                                    {notification.category === 'system' && '⚙️'}
                                    {notification.category === 'inventory' && '📦'}
                                    {notification.category === 'order' && '🛒'}
                                    {notification.category === 'delivery' && '🚚'}
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-lg">{notification.title}</h3>
                                    <p className="text-gray-600">{notification.message}</p>
                                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                                        <span>Category: {notification.category}</span>
                                        <span>Priority: {notification.priority}</span>
                                        <span>Status: {notification.isRead ? 'Read' : 'Unread'}</span>
                                    </div>
                                </div>
                                <div className={`px-2 py-1 rounded text-xs font-medium ${notification.isRead ? 'bg-gray-100 text-gray-600' : 'bg-blue-100 text-blue-600'
                                    }`}>
                                    {notification.isRead ? 'Read' : 'New'}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default SimpleNotifications;
