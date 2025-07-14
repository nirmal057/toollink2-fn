import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../contexts/GlobalNotificationContext';
import { API_CONFIG, createApiHeaders } from '../config/api';

interface PendingUser {
  _id: string;
  username: string;
  email: string;
  fullName: string;
  phone?: string;
  createdAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

const CustomerApproval: React.FC = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<{ [key: string]: boolean }>({});
  const [rejectionReason, setRejectionReason] = useState<{ [key: string]: string }>({});
  const [showRejectDialog, setShowRejectDialog] = useState<string | null>(null);

  // Check if user has permission to approve users
  const canApprove = user?.role === 'cashier' || user?.role === 'admin';

  useEffect(() => {
    if (canApprove) {
      console.log('User has permission to approve, fetching pending users...');
      fetchPendingUsers();
    } else {
      console.log('User does not have permission to approve users');
    }
  }, [canApprove]);  const fetchPendingUsers = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      
      console.log('Fetching pending users...');
      
      // Try the primary endpoint first
      let response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.PENDING_USERS}`, {
        headers: createApiHeaders(token || undefined)
      });
      
      // If the primary endpoint fails, try the alternative endpoint
      if (!response.ok && response.status === 404) {
        console.log('Primary endpoint not found, trying alternative endpoint');
        response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.PENDING_CUSTOMERS}`, {
          headers: createApiHeaders(token || undefined)
        });
      }
      
      if (response.ok) {
        const data = await response.json();
        console.log('Pending users response:', data);
        
        // Handle both response formats
        const users = data.users || data.customers || [];
        console.log('Found pending users:', users.length);
        
        setPendingUsers(users.map((user: any) => ({
          _id: user._id || user.id,
          username: user.username || user.email?.split('@')[0] || '',
          email: user.email || '',
          fullName: user.fullName || user.name || '',
          phone: user.phone || '',
          createdAt: user.createdAt || new Date().toISOString(),
          status: 'pending'
        })));
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to fetch pending users:', errorData.error || response.statusText);
        // Show user-friendly error message
        if (response.status === 401) {
          toast.error('Session expired', 'Please login again.');
        } else if (response.status === 403) {
          toast.error('Access denied', 'You need cashier or admin privileges.');
        } else {
          toast.error('Failed to load pending customers', 'Please try again.');
        }
      }
    } catch (error) {
      console.error('Error fetching pending customers:', error);
      toast.error('Connection error', 'Could not connect to the server. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };  const handleApprove = async (userId: string) => {
    setActionLoading(prev => ({ ...prev, [userId]: true }));
    
    try {
      console.log(`Approving user ${userId}...`);
      const token = localStorage.getItem('accessToken');
      
      // Try the primary endpoint first
      console.log('Trying primary approval endpoint...');
      let response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.APPROVE_USER}`, {
        method: 'POST',
        headers: createApiHeaders(token || undefined),
        body: JSON.stringify({ userId: userId })
      });
      
      // If the primary endpoint fails, try the alternative endpoint
      if (!response.ok && response.status === 404) {
        console.log('Primary approval endpoint not found, trying alternative endpoint');
        response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.APPROVE_CUSTOMER(userId)}`, {
          method: 'POST',
          headers: createApiHeaders(token || undefined),
          body: JSON.stringify({ reason: 'Customer approved via CustomerApproval page' })
        });
      }
      
      if (response.ok) {
        const data = await response.json();
        await fetchPendingUsers(); // Refresh the list
        const userName = data.user?.fullName || data.customer?.fullName || data.user?.name || data.customer?.name || 'Customer';
        toast.success('Customer approved successfully!', `${userName} has been approved and can now log in.`);
      } else {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || 'Failed to approve customer';
        console.error('Approve customer error:', errorMessage);
        toast.error('Failed to approve customer', errorMessage);
      }
    } catch (error) {
      console.error('Error approving customer:', error);
      toast.error('Error approving customer', 'An unexpected error occurred.');
    } finally {
      setActionLoading(prev => ({ ...prev, [userId]: false }));
    }
  };  const handleReject = async (userId: string) => {
    const reason = rejectionReason[userId] || '';
    setActionLoading(prev => ({ ...prev, [userId]: true }));
    
    try {
      console.log(`Attempting to reject user ${userId} with reason: ${reason}`);
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        console.error('No access token found');
        toast.error('Authentication error', 'Please log in again.');
        setActionLoading(prev => ({ ...prev, [userId]: false }));
        return;
      }
      
      console.log('Sending reject request to primary endpoint');
      
      // Try the primary endpoint first
      let response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.REJECT_USER}`, {
        method: 'POST',
        headers: createApiHeaders(token),
        body: JSON.stringify({ userId, reason })
      });
      
      // If the primary endpoint fails, try the alternative endpoint
      if (!response.ok && response.status === 404) {
        console.log('Primary rejection endpoint not found, trying alternative endpoint');
        response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.REJECT_CUSTOMER(userId)}`, {
          method: 'POST',
          headers: createApiHeaders(token),
          body: JSON.stringify({ reason })
        });
      }
      
      console.log('Rejection response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Rejection successful:', data);
        
        // Update the UI to remove the rejected user
        await fetchPendingUsers();
        setShowRejectDialog(null);
        setRejectionReason(prev => ({ ...prev, [userId]: '' }));
        
        toast.success('User rejected successfully!', reason ? `Reason: ${reason}` : 'User registration has been rejected.');
      } else {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || errorData.message || 'Failed to reject user';
        console.error('Reject user error:', errorData);
        toast.error('Failed to reject user', errorMessage);
      }
    } catch (error) {
      console.error('Error rejecting user:', error);
      toast.error('Error rejecting user', 'An unexpected error occurred. Check console for details.');
    } finally {
      setActionLoading(prev => ({ ...prev, [userId]: false }));
    }
  };  if (!canApprove) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center transition-colors duration-300 px-4">
        <div className="max-w-md mx-auto text-center w-full">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 xs:p-8 transition-colors duration-300">
            <div className="text-red-500 text-4xl xs:text-6xl mb-4">🚫</div>
            <h2 className="text-xl xs:text-2xl font-bold text-gray-800 dark:text-white mb-4">Access Denied</h2>
            <p className="text-sm xs:text-base text-gray-600 dark:text-gray-300">
              You don't have permission to access customer approval management. 
              Only cashiers and admins can approve customer registrations.
            </p>
          </div>
        </div>
      </div>
    );
  }  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center transition-colors duration-300 px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 xs:h-12 xs:w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-sm xs:text-base text-gray-600 dark:text-gray-300">Loading pending customers...</p>
        </div>
      </div>
    );
  }  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      <div className="container mx-auto px-4 py-4 xs:py-6 sm:py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 xs:p-6 mb-6 xs:mb-8 transition-colors duration-300">
            <h1 className="text-xl xs:text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white mb-2">Customer Approval Management</h1>
            <p className="text-sm xs:text-base text-gray-600 dark:text-gray-300">
              Review and approve pending customer registrations. Only approved customers can access their accounts.
            </p>
          </div>          {/* Stats Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 xs:p-6 mb-6 xs:mb-8 transition-colors duration-300">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base xs:text-lg font-semibold text-gray-800 dark:text-white">Pending Approvals</h3>
                <p className="text-2xl xs:text-3xl font-bold text-blue-600 dark:text-blue-400">{pendingUsers.length}</p>
              </div>
              <div className="text-blue-500 text-3xl xs:text-4xl">👥</div>
            </div>
          </div>          {/* Pending Users List */}
          {pendingUsers.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 xs:p-8 text-center transition-colors duration-300">
              <div className="text-green-500 text-4xl xs:text-6xl mb-4">✅</div>
              <h3 className="text-lg xs:text-xl font-semibold text-gray-800 dark:text-white mb-2">All Caught Up!</h3>
              <p className="text-sm xs:text-base text-gray-600 dark:text-gray-300">No pending customer registrations at the moment.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingUsers.map((user) => (
                <div key={user._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 xs:p-6 transition-colors duration-300">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start lg:items-center">
                    {/* User Info */}
                    <div className="lg:col-span-2">
                      <h3 className="text-base xs:text-lg font-semibold text-gray-800 dark:text-white mb-1">{user.fullName}</h3>
                      <div className="space-y-1">
                        <p className="text-xs xs:text-sm text-gray-600 dark:text-gray-300">
                          <span className="font-medium">Username:</span> {user.username}
                        </p>
                        <p className="text-xs xs:text-sm text-gray-600 dark:text-gray-300 break-all">
                          <span className="font-medium">Email:</span> {user.email}
                        </p>
                        {user.phone && (
                          <p className="text-xs xs:text-sm text-gray-600 dark:text-gray-300">
                            <span className="font-medium">Phone:</span> {user.phone}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          <span className="font-medium">Registered:</span> {new Date(user.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col xs:flex-row lg:flex-col xl:flex-row gap-2 lg:gap-3 xl:gap-2">                      <button
                        onClick={() => handleApprove(user._id)}
                        disabled={actionLoading[user._id]}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 xs:px-4 py-2 rounded-lg text-sm xs:text-base font-medium transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {actionLoading[user._id] ? '⏳' : '✅'} Approve
                      </button>
                      <button
                        onClick={() => setShowRejectDialog(user._id)}
                        disabled={actionLoading[user._id]}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white px-3 xs:px-4 py-2 rounded-lg text-sm xs:text-base font-medium transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        ❌ Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>      {/* Rejection Dialog */}
      {showRejectDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-4 xs:p-6 transition-colors duration-300">
            <h3 className="text-base xs:text-lg font-semibold text-gray-800 dark:text-white mb-4">Reject Customer Registration</h3>
            <p className="text-sm xs:text-base text-gray-600 dark:text-gray-300 mb-4">
              Please provide a reason for rejecting this customer registration:
            </p>
            <textarea
              value={rejectionReason[showRejectDialog!] || ''}
              onChange={(e) => setRejectionReason(prev => ({ ...prev, [showRejectDialog!]: e.target.value }))}
              placeholder="Enter rejection reason (optional)"
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-300 text-sm xs:text-base"
              rows={3}
            />
            <div className="flex flex-col xs:flex-row gap-3 mt-6">
              <button
                onClick={() => setShowRejectDialog(null)}
                className="flex-1 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-800 dark:text-white px-4 py-2 rounded-lg text-sm xs:text-base font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleReject(showRejectDialog!)}
                disabled={actionLoading[showRejectDialog!]}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm xs:text-base font-medium transition-colors disabled:opacity-50"
              >
                {actionLoading[showRejectDialog!] ? (
                  <>
                    <span className="inline-block animate-spin mr-2">⏳</span>
                    Rejecting...
                  </>
                ) : (
                  'Reject User'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerApproval;
