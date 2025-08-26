import React, { useState, useEffect } from 'react';
import {
    MessageSquare,
    Mail,
    Phone,
    Calendar,
    User,
    AlertCircle,
    Clock,
    CheckCircle2,
    Reply,
    Send,
    Search,
    Eye,
    X,
    UserCheck
} from 'lucide-react';

interface Message {
    _id: string;
    senderName: string;
    senderEmail: string;
    senderPhone?: string;
    subject: string;
    message: string;
    category: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    status: 'unread' | 'read' | 'in_progress' | 'resolved';
    assignedTo?: {
        _id: string;
        username: string;
        email: string;
    };
    replies: Array<{
        _id: string;
        message: string;
        repliedBy: {
            _id: string;
            username: string;
            email: string;
        };
        repliedAt: string;
    }>;
    emailSent: boolean;
    createdAt: string;
    updatedAt: string;
}

interface MessageDashboardProps {
    userRole: string;
    userId: string;
}

const MessageDashboard: React.FC<MessageDashboardProps> = ({ userRole, userId }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [filteredMessages, setFilteredMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
    const [replyMessage, setReplyMessage] = useState('');
    const [sendingReply, setSendingReply] = useState(false);
    const [filters, setFilters] = useState({
        status: 'all',
        priority: 'all',
        category: 'all',
        search: ''
    });
    const [stats, setStats] = useState({
        total: 0,
        unread: 0,
        inProgress: 0,
        resolved: 0
    });

    const priorityColors = {
        low: 'bg-gray-100 text-gray-800',
        medium: 'bg-blue-100 text-blue-800',
        high: 'bg-orange-100 text-orange-800',
        urgent: 'bg-red-100 text-red-800'
    };

    const statusColors = {
        unread: 'bg-red-100 text-red-800',
        read: 'bg-yellow-100 text-yellow-800',
        in_progress: 'bg-blue-100 text-blue-800',
        resolved: 'bg-green-100 text-green-800'
    };

    const categoryLabels = {
        inquiry: 'General Inquiry',
        support: 'Technical Support',
        complaint: 'Complaint',
        suggestion: 'Suggestion',
        order_related: 'Order Related',
        general: 'General'
    };

    useEffect(() => {
        fetchMessages();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [messages, filters]);

    const fetchMessages = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch('http://localhost:5000/api/messages', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.status === 401 || response.status === 403) {
                // Token expired or invalid, redirect to login
                localStorage.removeItem('accessToken');
                localStorage.removeItem('user');
                setError('Session expired. Please login again.');
                window.location.href = '/login';
                return;
            }

            const result = await response.json();
            if (result.success) {
                setMessages(result.data);
                calculateStats(result.data);
            } else {
                setError(result.error || 'Failed to fetch messages');
            }
        } catch (error) {
            setError('Failed to fetch messages');
            console.error('Error fetching messages:', error);
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = (messageList: Message[]) => {
        const stats = {
            total: messageList.length,
            unread: messageList.filter(m => m.status === 'unread').length,
            inProgress: messageList.filter(m => m.status === 'in_progress').length,
            resolved: messageList.filter(m => m.status === 'resolved').length
        };
        setStats(stats);
    };

    const applyFilters = () => {
        let filtered = [...messages];

        if (filters.status !== 'all') {
            filtered = filtered.filter(msg => msg.status === filters.status);
        }

        if (filters.priority !== 'all') {
            filtered = filtered.filter(msg => msg.priority === filters.priority);
        }

        if (filters.category !== 'all') {
            filtered = filtered.filter(msg => msg.category === filters.category);
        }

        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            filtered = filtered.filter(msg =>
                msg.senderName.toLowerCase().includes(searchLower) ||
                msg.senderEmail.toLowerCase().includes(searchLower) ||
                msg.subject.toLowerCase().includes(searchLower) ||
                msg.message.toLowerCase().includes(searchLower)
            );
        }

        setFilteredMessages(filtered);
    };

    const updateMessageStatus = async (messageId: string, status: string, assignToMe: boolean = false) => {
        try {
            const token = localStorage.getItem('token');
            const payload: any = { status };

            if (assignToMe) {
                payload.assignedTo = userId;
            }

            const response = await fetch(`http://localhost:5000/api/messages/${messageId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json();
            if (result.success) {
                await fetchMessages(); // Refresh messages
                if (selectedMessage && selectedMessage._id === messageId) {
                    setSelectedMessage(result.data);
                }
            } else {
                setError(result.error || 'Failed to update message');
            }
        } catch (error) {
            setError('Failed to update message');
            console.error('Error updating message:', error);
        }
    };

    const sendReply = async () => {
        if (!selectedMessage || !replyMessage.trim()) return;

        setSendingReply(true);
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`http://localhost:5000/api/messages/${selectedMessage._id}/reply`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ message: replyMessage })
            });

            const result = await response.json();
            if (result.success) {
                setReplyMessage('');
                setSelectedMessage(result.data);
                await fetchMessages(); // Refresh messages
            } else {
                setError(result.error || 'Failed to send reply');
            }
        } catch (error) {
            setError('Failed to send reply');
            console.error('Error sending reply:', error);
        } finally {
            setSendingReply(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-6">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Message Center</h1>
                <p className="text-gray-600">Manage customer messages and inquiries</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Messages</p>
                            <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                        </div>
                        <MessageSquare className="w-8 h-8 text-blue-600" />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Unread</p>
                            <p className="text-3xl font-bold text-red-600">{stats.unread}</p>
                        </div>
                        <AlertCircle className="w-8 h-8 text-red-600" />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">In Progress</p>
                            <p className="text-3xl font-bold text-blue-600">{stats.inProgress}</p>
                        </div>
                        <Clock className="w-8 h-8 text-blue-600" />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Resolved</p>
                            <p className="text-3xl font-bold text-green-600">{stats.resolved}</p>
                        </div>
                        <CheckCircle2 className="w-8 h-8 text-green-600" />
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select
                            value={filters.status}
                            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Status</option>
                            <option value="unread">Unread</option>
                            <option value="read">Read</option>
                            <option value="in_progress">In Progress</option>
                            <option value="resolved">Resolved</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                        <select
                            value={filters.priority}
                            onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Priorities</option>
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                            <option value="urgent">Urgent</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                        <select
                            value={filters.category}
                            onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Categories</option>
                            <option value="inquiry">General Inquiry</option>
                            <option value="support">Technical Support</option>
                            <option value="complaint">Complaint</option>
                            <option value="suggestion">Suggestion</option>
                            <option value="order_related">Order Related</option>
                            <option value="general">General</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search messages..."
                                value={filters.search}
                                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center">
                        <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                        <span className="text-red-700">{error}</span>
                    </div>
                </div>
            )}

            {/* Messages List */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                {filteredMessages.length === 0 ? (
                    <div className="p-8 text-center">
                        <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No messages found</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200">
                        {filteredMessages.map((message) => (
                            <div key={message._id} className="p-6 hover:bg-gray-50 transition-colors">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-3 mb-2">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[message.status]}`}>
                                                {message.status.replace('_', ' ').toUpperCase()}
                                            </span>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[message.priority]}`}>
                                                {message.priority.toUpperCase()}
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                {categoryLabels[message.category as keyof typeof categoryLabels]}
                                            </span>
                                        </div>

                                        <h3 className="text-lg font-semibold text-gray-900 mb-1">{message.subject}</h3>

                                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                                            <div className="flex items-center">
                                                <User className="w-4 h-4 mr-1" />
                                                {message.senderName}
                                            </div>
                                            <div className="flex items-center">
                                                <Mail className="w-4 h-4 mr-1" />
                                                {message.senderEmail}
                                            </div>
                                            {message.senderPhone && (
                                                <div className="flex items-center">
                                                    <Phone className="w-4 h-4 mr-1" />
                                                    {message.senderPhone}
                                                </div>
                                            )}
                                            <div className="flex items-center">
                                                <Calendar className="w-4 h-4 mr-1" />
                                                {formatDate(message.createdAt)}
                                            </div>
                                        </div>

                                        <p className="text-gray-700 mb-3 line-clamp-2">{message.message}</p>

                                        {message.assignedTo && (
                                            <div className="flex items-center text-sm text-blue-600 mb-3">
                                                <UserCheck className="w-4 h-4 mr-1" />
                                                Assigned to: {message.assignedTo.username}
                                            </div>
                                        )}

                                        {message.replies.length > 0 && (
                                            <div className="text-sm text-gray-600">
                                                <Reply className="w-4 h-4 inline mr-1" />
                                                {message.replies.length} {message.replies.length === 1 ? 'reply' : 'replies'}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex flex-col space-y-2 ml-4">
                                        <button
                                            onClick={() => setSelectedMessage(message)}
                                            className="flex items-center px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                                        >
                                            <Eye className="w-4 h-4 mr-1" />
                                            View
                                        </button>

                                        {message.status === 'unread' && (
                                            <button
                                                onClick={() => updateMessageStatus(message._id, 'in_progress', true)}
                                                className="flex items-center px-3 py-1 text-sm bg-orange-600 text-white rounded hover:bg-orange-700"
                                            >
                                                Take
                                            </button>
                                        )}

                                        {message.status !== 'resolved' && (
                                            <button
                                                onClick={() => updateMessageStatus(message._id, 'resolved')}
                                                className="flex items-center px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                                            >
                                                Resolve
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Message Detail Modal */}
            {selectedMessage && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-4xl w-full max-h-screen overflow-y-auto">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-bold text-gray-900">{selectedMessage.subject}</h2>
                                <button
                                    onClick={() => setSelectedMessage(null)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="flex items-center space-x-4 mt-4">
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[selectedMessage.status]}`}>
                                    {selectedMessage.status.replace('_', ' ').toUpperCase()}
                                </span>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${priorityColors[selectedMessage.priority]}`}>
                                    {selectedMessage.priority.toUpperCase()}
                                </span>
                                <span className="text-sm text-gray-600">
                                    {categoryLabels[selectedMessage.category as keyof typeof categoryLabels]}
                                </span>
                            </div>
                        </div>

                        <div className="p-6">
                            {/* Original Message */}
                            <div className="bg-gray-50 p-4 rounded-lg mb-6">
                                <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                                    <div className="flex items-center">
                                        <User className="w-4 h-4 mr-1" />
                                        {selectedMessage.senderName}
                                    </div>
                                    <div className="flex items-center">
                                        <Mail className="w-4 h-4 mr-1" />
                                        {selectedMessage.senderEmail}
                                    </div>
                                    {selectedMessage.senderPhone && (
                                        <div className="flex items-center">
                                            <Phone className="w-4 h-4 mr-1" />
                                            {selectedMessage.senderPhone}
                                        </div>
                                    )}
                                    <div className="flex items-center">
                                        <Calendar className="w-4 h-4 mr-1" />
                                        {formatDate(selectedMessage.createdAt)}
                                    </div>
                                </div>
                                <p className="text-gray-800 whitespace-pre-wrap">{selectedMessage.message}</p>
                            </div>

                            {/* Replies */}
                            {selectedMessage.replies.length > 0 && (
                                <div className="space-y-4 mb-6">
                                    <h3 className="text-lg font-semibold text-gray-900">Replies</h3>
                                    {selectedMessage.replies.map((reply) => (
                                        <div key={reply._id} className="bg-blue-50 p-4 rounded-lg">
                                            <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                                                <span className="font-medium">{reply.repliedBy.username}</span>
                                                <span>•</span>
                                                <span>{formatDate(reply.repliedAt)}</span>
                                            </div>
                                            <p className="text-gray-800 whitespace-pre-wrap">{reply.message}</p>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Reply Form */}
                            {selectedMessage.status !== 'resolved' && (
                                <div className="border-t border-gray-200 pt-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Send Reply</h3>
                                    <textarea
                                        value={replyMessage}
                                        onChange={(e) => setReplyMessage(e.target.value)}
                                        rows={6}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical"
                                        placeholder="Type your reply here..."
                                    />
                                    <div className="flex justify-between items-center mt-4">
                                        <div className="flex space-x-2">
                                            {selectedMessage.status === 'unread' && (
                                                <button
                                                    onClick={() => updateMessageStatus(selectedMessage._id, 'in_progress', true)}
                                                    className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
                                                >
                                                    Mark In Progress
                                                </button>
                                            )}
                                            <button
                                                onClick={() => updateMessageStatus(selectedMessage._id, 'resolved')}
                                                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                                            >
                                                Mark Resolved
                                            </button>
                                        </div>
                                        <button
                                            onClick={sendReply}
                                            disabled={!replyMessage.trim() || sendingReply}
                                            className="flex items-center px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {sendingReply ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                    Sending...
                                                </>
                                            ) : (
                                                <>
                                                    <Send className="w-4 h-4 mr-2" />
                                                    Send Reply
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MessageDashboard;
