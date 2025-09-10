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
    userId?: string;
}

const MessageDashboard: React.FC<MessageDashboardProps> = ({ userId }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [filteredMessages, setFilteredMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
    const [replyText, setReplyText] = useState('');
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
        low: 'bg-green-100 text-green-800',
        medium: 'bg-yellow-100 text-yellow-800',
        high: 'bg-orange-100 text-orange-800',
        urgent: 'bg-red-100 text-red-800'
    };

    const statusColors = {
        unread: 'bg-gray-100 text-gray-800',
        read: 'bg-blue-100 text-blue-800',
        in_progress: 'bg-yellow-100 text-yellow-800',
        resolved: 'bg-green-100 text-green-800'
    };

    const categoryLabels = {
        general: 'General Inquiry',
        support: 'Technical Support',
        billing: 'Billing Issue',
        complaint: 'Complaint',
        feature_request: 'Feature Request',
        other: 'Other'
    };

    useEffect(() => {
        fetchMessages();
    }, []);

    useEffect(() => {
        filterMessages();
    }, [messages, filters]);

    const fetchMessages = async () => {
        try {
            setLoading(true);
            setError('');

            const token = localStorage.getItem('token');
            if (!token) {
                setError('Authentication token not found');
                return;
            }

            const response = await fetch('http://localhost:5001/api/messages', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch messages: ${response.status}`);
            }

            const data = await response.json();

            if (data.success && Array.isArray(data.data)) {
                setMessages(data.data);

                // Calculate stats
                const total = data.data.length;
                const unread = data.data.filter((msg: Message) => msg.status === 'unread').length;
                const inProgress = data.data.filter((msg: Message) => msg.status === 'in_progress').length;
                const resolved = data.data.filter((msg: Message) => msg.status === 'resolved').length;

                setStats({ total, unread, inProgress, resolved });
            } else {
                setMessages([]);
                setStats({ total: 0, unread: 0, inProgress: 0, resolved: 0 });
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
            setError(error instanceof Error ? error.message : 'Failed to fetch messages');
            setMessages([]);
        } finally {
            setLoading(false);
        }
    };

    const filterMessages = () => {
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

        if (filters.search.trim()) {
            const searchTerm = filters.search.toLowerCase().trim();
            filtered = filtered.filter(msg =>
                msg.senderName.toLowerCase().includes(searchTerm) ||
                msg.senderEmail.toLowerCase().includes(searchTerm) ||
                msg.subject.toLowerCase().includes(searchTerm) ||
                msg.message.toLowerCase().includes(searchTerm)
            );
        }

        setFilteredMessages(filtered);
    };

    const updateMessageStatus = async (messageId: string, status: string, assignToMe: boolean = false) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const updateData: any = { status };
            if (assignToMe && userId) {
                updateData.assignedTo = userId;
            }

            const response = await fetch(`http://localhost:5001/api/messages/${messageId}/status`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updateData)
            });

            if (response.ok) {
                fetchMessages(); // Refresh messages
            }
        } catch (error) {
            console.error('Error updating message status:', error);
        }
    };

    const sendReply = async () => {
        if (!selectedMessage || !replyText.trim() || sendingReply) return;

        try {
            setSendingReply(true);
            const token = localStorage.getItem('token');
            if (!token) return;

            const response = await fetch(`http://localhost:5001/api/messages/${selectedMessage._id}/reply`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message: replyText })
            });

            if (response.ok) {
                setReplyText('');
                fetchMessages(); // Refresh messages
                // Optionally close modal or refresh selected message
            }
        } catch (error) {
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
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">Loading messages...</p>
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
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl shadow-xl">
                                <MessageSquare className="h-8 w-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 via-blue-600 to-purple-600 dark:from-white dark:via-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                                    Message Center
                                </h1>
                                <p className="text-gray-600 dark:text-gray-400 mt-2">
                                    Manage customer messages and inquiries
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Beautiful Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="group relative bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-100 dark:from-blue-900/20 dark:via-blue-800/30 dark:to-indigo-900/20 rounded-3xl p-6 shadow-xl border border-white/50 dark:border-gray-700/50 hover:shadow-2xl transition-all duration-500 hover:scale-105 cursor-pointer overflow-hidden">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full blur-lg transform translate-x-4 -translate-y-4 group-hover:scale-125 transition-transform duration-500"></div>

                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 rounded-2xl shadow-xl group-hover:rotate-6 transition-transform duration-500">
                                    <MessageSquare className="w-6 h-6 text-white" />
                                </div>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Messages</p>
                                <p className="text-3xl font-bold text-gray-800 dark:text-white group-hover:scale-105 transition-transform duration-300">
                                    {stats.total}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="group relative bg-gradient-to-br from-green-50 via-emerald-100 to-green-100 dark:from-green-900/20 dark:via-emerald-800/30 dark:to-green-900/20 rounded-3xl p-6 shadow-xl border border-white/50 dark:border-gray-700/50 hover:shadow-2xl transition-all duration-500 hover:scale-105 cursor-pointer overflow-hidden">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full blur-lg transform translate-x-4 -translate-y-4 group-hover:scale-125 transition-transform duration-500"></div>

                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-gradient-to-br from-green-500 via-emerald-600 to-green-700 rounded-2xl shadow-xl group-hover:rotate-6 transition-transform duration-500">
                                    <CheckCircle2 className="w-6 h-6 text-white" />
                                </div>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Resolved</p>
                                <p className="text-3xl font-bold text-gray-800 dark:text-white group-hover:scale-105 transition-transform duration-300">
                                    {stats.resolved}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="group relative bg-gradient-to-br from-red-50 via-red-100 to-red-100 dark:from-red-900/20 dark:via-red-800/30 dark:to-red-900/20 rounded-3xl p-6 shadow-xl border border-white/50 dark:border-gray-700/50 hover:shadow-2xl transition-all duration-500 hover:scale-105 cursor-pointer overflow-hidden">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full blur-lg transform translate-x-4 -translate-y-4 group-hover:scale-125 transition-transform duration-500"></div>

                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-gradient-to-br from-red-500 via-red-600 to-red-700 rounded-2xl shadow-xl group-hover:rotate-6 transition-transform duration-500">
                                    <AlertCircle className="w-6 h-6 text-white" />
                                </div>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Unread</p>
                                <p className="text-3xl font-bold text-gray-800 dark:text-white group-hover:scale-105 transition-transform duration-300">
                                    {stats.unread}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="group relative bg-gradient-to-br from-purple-50 via-indigo-100 to-purple-100 dark:from-purple-900/20 dark:via-indigo-800/30 dark:to-purple-900/20 rounded-3xl p-6 shadow-xl border border-white/50 dark:border-gray-700/50 hover:shadow-2xl transition-all duration-500 hover:scale-105 cursor-pointer overflow-hidden">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full blur-lg transform translate-x-4 -translate-y-4 group-hover:scale-125 transition-transform duration-500"></div>

                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-gradient-to-br from-purple-500 via-indigo-600 to-purple-700 rounded-2xl shadow-xl group-hover:rotate-6 transition-transform duration-500">
                                    <Clock className="w-6 h-6 text-white" />
                                </div>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">In Progress</p>
                                <p className="text-3xl font-bold text-gray-800 dark:text-white group-hover:scale-105 transition-transform duration-300">
                                    {stats.inProgress}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Beautiful Filters */}
                <div className="mb-8 bg-white/70 dark:bg-gray-800/70 rounded-3xl shadow-xl p-6 backdrop-blur-sm border border-white/50 dark:border-gray-700/50">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                            <select
                                value={filters.status}
                                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            >
                                <option value="all">All Status</option>
                                <option value="unread">Unread</option>
                                <option value="read">Read</option>
                                <option value="in_progress">In Progress</option>
                                <option value="resolved">Resolved</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority</label>
                            <select
                                value={filters.priority}
                                onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            >
                                <option value="all">All Priorities</option>
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                                <option value="urgent">Urgent</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                            <select
                                value={filters.category}
                                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            >
                                <option value="all">All Categories</option>
                                <option value="general">General</option>
                                <option value="support">Support</option>
                                <option value="billing">Billing</option>
                                <option value="complaint">Complaint</option>
                                <option value="feature_request">Feature Request</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Search</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                    type="text"
                                    placeholder="Search messages..."
                                    value={filters.search}
                                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                                    className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Error Display */}
                {error && (
                    <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                        <div className="flex items-center">
                            <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                            <p className="text-red-700 dark:text-red-400">{error}</p>
                        </div>
                    </div>
                )}

                {/* Beautiful Messages List */}
                <div className="bg-white/70 dark:bg-gray-800/70 rounded-3xl shadow-xl backdrop-blur-sm border border-white/50 dark:border-gray-700/50 overflow-hidden">
                    <div className="p-6">
                        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                            Messages ({filteredMessages.length})
                        </h2>

                        {filteredMessages.length === 0 ? (
                            <div className="text-center py-12">
                                <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-500 dark:text-gray-400">No messages found</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {filteredMessages.map((message) => (
                                    <div
                                        key={message._id}
                                        className="group bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer"
                                        onClick={() => setSelectedMessage(message)}
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center space-x-3">
                                                <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
                                                    <User className="w-5 h-5 text-white" />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-gray-800 dark:text-white">
                                                        {message.senderName}
                                                    </h3>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                                        {message.senderEmail}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${priorityColors[message.priority]}`}>
                                                    {message.priority.charAt(0).toUpperCase() + message.priority.slice(1)}
                                                </span>
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[message.status]}`}>
                                                    {message.status.replace('_', ' ').charAt(0).toUpperCase() + message.status.replace('_', ' ').slice(1)}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="mb-3">
                                            <h4 className="font-medium text-gray-800 dark:text-white mb-2">
                                                {message.subject}
                                            </h4>
                                            <p className="text-gray-600 dark:text-gray-400 line-clamp-2">
                                                {message.message}
                                            </p>
                                        </div>

                                        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                                            <div className="flex items-center space-x-4">
                                                <span className="flex items-center">
                                                    <Calendar className="w-4 h-4 mr-1" />
                                                    {formatDate(message.createdAt)}
                                                </span>
                                                {message.senderPhone && (
                                                    <span className="flex items-center">
                                                        <Phone className="w-4 h-4 mr-1" />
                                                        {message.senderPhone}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                {message.replies.length > 0 && (
                                                    <span className="flex items-center text-blue-600 dark:text-blue-400">
                                                        <Reply className="w-4 h-4 mr-1" />
                                                        {message.replies.length} replies
                                                    </span>
                                                )}
                                                <Eye className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Beautiful Message Detail Modal */}
                {selectedMessage && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                            <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 p-6 text-white">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-2xl font-bold">Message Details</h2>
                                    <button
                                        onClick={() => setSelectedMessage(null)}
                                        className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                                    >
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p><strong>From:</strong> {selectedMessage.senderName}</p>
                                        <p><strong>Email:</strong> {selectedMessage.senderEmail}</p>
                                        {selectedMessage.senderPhone && (
                                            <p><strong>Phone:</strong> {selectedMessage.senderPhone}</p>
                                        )}
                                    </div>
                                    <div>
                                        <p><strong>Priority:</strong> {selectedMessage.priority}</p>
                                        <p><strong>Category:</strong> {categoryLabels[selectedMessage.category as keyof typeof categoryLabels] || selectedMessage.category}</p>
                                        <p><strong>Status:</strong> {selectedMessage.status}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 max-h-[50vh] overflow-y-auto">
                                <div className="mb-6">
                                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                                        {selectedMessage.subject}
                                    </h3>
                                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                                        {selectedMessage.message}
                                    </p>
                                </div>

                                {selectedMessage.replies.length > 0 && (
                                    <div className="mb-6">
                                        <h4 className="text-md font-semibold text-gray-800 dark:text-white mb-3">Replies</h4>
                                        <div className="space-y-3">
                                            {selectedMessage.replies.map((reply) => (
                                                <div key={reply._id} className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="font-medium text-gray-800 dark:text-white">
                                                            {reply.repliedBy.username}
                                                        </span>
                                                        <span className="text-sm text-gray-500 dark:text-gray-400">
                                                            {formatDate(reply.repliedAt)}
                                                        </span>
                                                    </div>
                                                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                                                        {reply.message}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                                <div className="flex items-center space-x-3 mb-4">
                                    <button
                                        onClick={() => updateMessageStatus(selectedMessage._id, 'read')}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                                    >
                                        Mark as Read
                                    </button>
                                    <button
                                        onClick={() => updateMessageStatus(selectedMessage._id, 'in_progress', true)}
                                        className="px-4 py-2 bg-yellow-600 text-white rounded-xl hover:bg-yellow-700 transition-colors"
                                    >
                                        Take Ownership
                                    </button>
                                    <button
                                        onClick={() => updateMessageStatus(selectedMessage._id, 'resolved')}
                                        className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
                                    >
                                        Mark Resolved
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    <textarea
                                        value={replyText}
                                        onChange={(e) => setReplyText(e.target.value)}
                                        placeholder="Type your reply..."
                                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                                        rows={3}
                                    />
                                    <button
                                        onClick={sendReply}
                                        disabled={!replyText.trim() || sendingReply}
                                        className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                    >
                                        <Send className="w-4 h-4" />
                                        <span>{sendingReply ? 'Sending...' : 'Send Reply'}</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MessageDashboard;
