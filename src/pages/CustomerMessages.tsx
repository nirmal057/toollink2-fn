import React, { useState, useEffect } from 'react';
import {
  MessageSquareIcon,
  SendIcon,
  SearchIcon,
  UserIcon,
  MailIcon,
  PhoneIcon,
  RefreshCwIcon,
  CheckCircleIcon,
  AlertCircleIcon
} from 'lucide-react';
import { useNotification } from '../contexts/NotificationContext';

// API Configuration
const API_BASE = 'http://localhost:5001';

// Simple interfaces for the new implementation
interface CustomerMessage {
  _id: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  subject: string;
  message: string;
  status: 'new' | 'replied' | 'resolved';
  createdAt: string;
  replies?: MessageReply[];
}

interface MessageReply {
  _id?: string;
  content: string;
  sender: string;
  senderName: string;
  timestamp: string;
}

interface CustomerMessagesProps {
  userRole?: string;
}

const CustomerMessages: React.FC<CustomerMessagesProps> = () => {
  const [messages, setMessages] = useState<CustomerMessage[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<CustomerMessage | null>(null);
  const [replyText, setReplyText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const { showSuccess, showError } = useNotification();
  const [error, setError] = useState<string | null>(null);

  // Get auth token from localStorage
  const getAuthToken = () => {
    return localStorage.getItem('accessToken');
  };

  // Fetch messages from API
  const fetchMessages = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_BASE}/api/messages`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch messages: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.data) {
        // Transform backend data to match our interface
        const transformedMessages = (data.data.messages || data.data || []).map((msg: any) => ({
          _id: msg._id || msg.id,
          customerName: msg.customerName || msg.name || 'Unknown Customer',
          customerEmail: msg.customerEmail || msg.email || '',
          customerPhone: msg.customerPhone || msg.phone || '',
          subject: msg.subject || 'No Subject',
          message: msg.messages && msg.messages[0] ? msg.messages[0].content : (msg.message || msg.content || ''),
          status: msg.status === 'open' ? 'new' : (msg.status || 'new'),
          createdAt: msg.createdAt || msg.timestamp || new Date().toISOString(),
          replies: msg.messages && msg.messages.length > 1 ? msg.messages.slice(1).map((reply: any) => ({
            content: reply.content,
            sender: reply.sender,
            senderName: reply.senderName,
            timestamp: reply.timestamp
          })) : []
        }));

        setMessages(transformedMessages);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      setError(error instanceof Error ? error.message : 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  // Send reply email
  const sendReply = async () => {
    if (!selectedMessage || !replyText.trim()) return;

    setSending(true);
    setError(null);

    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_BASE}/api/messages/${selectedMessage._id}/reply`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: replyText.trim(),
          sender: 'admin',
          senderName: 'Admin Support',
          markAsResolved: false
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to send reply: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        // Create new reply object
        const newReply: MessageReply = {
          content: replyText.trim(),
          sender: 'admin',
          senderName: 'Admin Support',
          timestamp: new Date().toISOString()
        };

        // Update the selected message
        const updatedMessage = {
          ...selectedMessage,
          status: 'replied' as const,
          replies: [...(selectedMessage.replies || []), newReply]
        };

        // Update messages list
        setMessages(prev => prev.map(msg =>
          msg._id === selectedMessage._id ? updatedMessage : msg
        ));

        // Update selected message
        setSelectedMessage(updatedMessage);

        // Clear reply text
        setReplyText('');

        showSuccess('Success', 'Reply sent successfully! The customer will receive your response via email.');
      } else {
        throw new Error(data.error || 'Failed to send reply');
      }
    } catch (error) {
      console.error('Error sending reply:', error);
      setError(error instanceof Error ? error.message : 'Failed to send reply');
      showError('Error', 'Failed to send reply: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setSending(false);
    }
  };

  // Mark message as resolved
  const markAsResolved = async (messageId: string) => {
    try {
      const token = getAuthToken();
      if (!token) return;

      const response = await fetch(`${API_BASE}/api/messages/${messageId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'resolved' })
      });

      if (response.ok) {
        setMessages(prev => prev.map(msg =>
          msg._id === messageId ? { ...msg, status: 'resolved' } : msg
        ));

        if (selectedMessage?._id === messageId) {
          setSelectedMessage(prev => prev ? { ...prev, status: 'resolved' } : null);
        }

        showSuccess('Success', 'Message marked as resolved successfully!');
      }
    } catch (error) {
      console.error('Error marking as resolved:', error);
      showError('Error', 'Failed to mark message as resolved');
    }
  };

  // Filter messages
  const filteredMessages = messages.filter(message => {
    const matchesSearch =
      message.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.message.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || message.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Load messages on component mount
  useEffect(() => {
    fetchMessages();
  }, []);

  // Format date
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return 'Unknown date';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm mb-6 p-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <MessageSquareIcon className="h-6 w-6 text-blue-600" />
                Customer Messages
              </h1>
              <p className="text-gray-600 mt-1">
                Manage and respond to customer inquiries ({messages.length} total)
              </p>
            </div>
            <button
              onClick={fetchMessages}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <RefreshCwIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircleIcon className="h-5 w-5" />
              <span className="font-medium">Error:</span>
              {error}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Messages List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm">
              {/* Search and Filter */}
              <div className="p-4 border-b border-gray-200">
                <div className="relative mb-3">
                  <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search messages..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="new">New</option>
                  <option value="replied">Replied</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>

              {/* Messages List */}
              <div className="max-h-96 overflow-y-auto">
                {loading ? (
                  <div className="p-4 text-center text-gray-500">Loading messages...</div>
                ) : filteredMessages.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">No messages found</div>
                ) : (
                  filteredMessages.map((message) => (
                    <div
                      key={message._id}
                      onClick={() => setSelectedMessage(message)}
                      className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${selectedMessage?._id === message._id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                        }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium text-gray-900 truncate">{message.customerName}</h3>
                        <span className={`px-2 py-1 text-xs rounded-full ${message.status === 'new' ? 'bg-red-100 text-red-800' :
                          message.status === 'replied' ? 'bg-blue-100 text-blue-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                          {message.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{message.subject}</p>
                      <p className="text-xs text-gray-500">{formatDate(message.createdAt)}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Message Detail */}
          <div className="lg:col-span-2">
            {selectedMessage ? (
              <div className="bg-white rounded-lg shadow-sm">
                {/* Message Header */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">{selectedMessage.subject}</h2>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <UserIcon className="h-4 w-4" />
                          {selectedMessage.customerName}
                        </div>
                        <div className="flex items-center gap-1">
                          <MailIcon className="h-4 w-4" />
                          {selectedMessage.customerEmail}
                        </div>
                        {selectedMessage.customerPhone && (
                          <div className="flex items-center gap-1">
                            <PhoneIcon className="h-4 w-4" />
                            {selectedMessage.customerPhone}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {selectedMessage.status !== 'resolved' && (
                        <button
                          onClick={() => markAsResolved(selectedMessage._id)}
                          className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
                        >
                          <CheckCircleIcon className="h-4 w-4" />
                          Mark Resolved
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Message Content */}
                <div className="p-6">
                  {/* Original Message */}
                  <div className="mb-6">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-gray-900">Original Message</span>
                        <span className="text-sm text-gray-500">{formatDate(selectedMessage.createdAt)}</span>
                      </div>
                      <p className="text-gray-700 whitespace-pre-wrap">{selectedMessage.message}</p>
                    </div>
                  </div>

                  {/* Replies */}
                  {selectedMessage.replies && selectedMessage.replies.length > 0 && (
                    <div className="mb-6">
                      <h3 className="font-medium text-gray-900 mb-3">Replies</h3>
                      <div className="space-y-3">
                        {selectedMessage.replies.map((reply, index) => (
                          <div key={index} className="bg-blue-50 rounded-lg p-4">
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-medium text-blue-900">{reply.senderName || reply.sender}</span>
                              <span className="text-sm text-blue-600">{formatDate(reply.timestamp)}</span>
                            </div>
                            <p className="text-blue-800 whitespace-pre-wrap">{reply.content}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Reply Form */}
                  {selectedMessage.status !== 'resolved' && (
                    <div>
                      <h3 className="font-medium text-gray-900 mb-3">Send Reply</h3>
                      <div className="space-y-3">
                        <textarea
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Type your reply here..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                          rows={4}
                        />
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500">
                            Reply will be sent to: {selectedMessage.customerEmail}
                          </span>
                          <button
                            onClick={sendReply}
                            disabled={!replyText.trim() || sending}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <SendIcon className="h-4 w-4" />
                            {sending ? 'Sending...' : 'Send Reply'}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <MessageSquareIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Message</h3>
                <p className="text-gray-600">Choose a message from the list to view details and reply</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerMessages;

