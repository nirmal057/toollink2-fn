import { useState, useEffect } from 'react';
import { 
  ShoppingCartIcon, 
  PlusIcon, 
  TruckIcon, 
  CalendarIcon, 
  ClockIcon, 
  PackageIcon, 
  AlertTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  MessageSquareIcon,
  StarIcon
} from 'lucide-react';
import { orderApiService, Order } from '../services/orderApiService';

interface OrderWithTracking extends Order {
  tracking?: {
    order: Order;
    delivery?: {
      driver_name?: string;
      driver_phone?: string;
    };
    subOrders?: any[];
    timeline?: Array<{
      timestamp: string;
      status: string;
      description: string;
      user?: string;
    }>;
  };
}

const CustomerDashboard = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<OrderWithTracking | null>(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [feedback, setFeedback] = useState({ rating: 5, comment: '', photos: [] as string[] });
  const [rescheduleData, setRescheduleData] = useState({ date: '', reason: '' });

  useEffect(() => {
    fetchMyOrders();
  }, []);

  const fetchMyOrders = async () => {
    try {
      setLoading(true);
      const response = await orderApiService.getMyOrders({
        limit: 50
      });
      setOrders(response.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const handleOrderTracking = async (orderId: number) => {
    try {
      const response = await orderApiService.getOrderTracking(orderId);
      setSelectedOrder({ 
        ...response.data.order, 
        tracking: response.data 
      } as OrderWithTracking);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get tracking info');
    }
  };

  const handleSubmitFeedback = async () => {
    if (!selectedOrder) return;
    
    try {
      await orderApiService.submitFeedback(
        selectedOrder.id, 
        feedback.comment, 
        feedback.rating, 
        feedback.photos
      );
      setShowFeedbackModal(false);
      setFeedback({ rating: 5, comment: '', photos: [] });
      fetchMyOrders(); // Refresh orders
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit feedback');
    }
  };

  const handleRequestReschedule = async () => {
    if (!selectedOrder) return;
    
    try {
      await orderApiService.requestReschedule(
        selectedOrder.id, 
        rescheduleData.date, 
        rescheduleData.reason
      );
      setShowRescheduleModal(false);
      setRescheduleData({ date: '', reason: '' });
      fetchMyOrders(); // Refresh orders
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to request reschedule');
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'confirmed': 'bg-blue-100 text-blue-800',
      'processing': 'bg-purple-100 text-purple-800',
      'ready': 'bg-indigo-100 text-indigo-800',
      'dispatched': 'bg-orange-100 text-orange-800',
      'delivered': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800',
      'returned': 'bg-gray-100 text-gray-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      'low': 'text-green-600',
      'normal': 'text-blue-600',
      'high': 'text-orange-600',
      'urgent': 'text-red-600'
    };
    return colors[priority as keyof typeof colors] || 'text-gray-600';
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      'pending': <ClockIcon className="w-4 h-4" />,
      'confirmed': <CheckCircleIcon className="w-4 h-4" />,
      'processing': <PackageIcon className="w-4 h-4" />,
      'ready': <CheckCircleIcon className="w-4 h-4" />,
      'dispatched': <TruckIcon className="w-4 h-4" />,
      'delivered': <CheckCircleIcon className="w-4 h-4" />,
      'cancelled': <XCircleIcon className="w-4 h-4" />,
      'returned': <AlertTriangleIcon className="w-4 h-4" />
    };
    return icons[status as keyof typeof icons] || <PackageIcon className="w-4 h-4" />;
  };

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white p-6 rounded-lg shadow border">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
          <p className="text-gray-600 mt-2">Track and manage your orders</p>
        </div>
        <button
          onClick={() => window.location.href = '/create-order'}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <PlusIcon className="w-5 h-5" />
          New Order
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <ShoppingCartIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">No orders yet</h3>
          <p className="text-gray-600 mb-6">Start by creating your first order</p>
          <button
            onClick={() => window.location.href = '/create-order'}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Order
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-lg shadow border hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{order.order_number}</h3>
                    <p className="text-sm text-gray-600">
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                    <span className={`text-xs font-medium ${getPriorityColor(order.priority)}`}>
                      {order.priority.toUpperCase()} PRIORITY
                    </span>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Amount:</span>
                    <span className="text-sm font-medium">${order.total_amount.toFixed(2)}</span>
                  </div>
                  {order.requested_delivery_date && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Delivery Date:</span>
                      <span className="text-sm font-medium">
                        {new Date(order.requested_delivery_date).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  {order.delivery_address && (
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Address:</span>
                      <p className="text-xs mt-1 truncate">{order.delivery_address}</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleOrderTracking(order.id)}
                    className="flex-1 bg-blue-50 text-blue-600 px-3 py-2 rounded text-sm font-medium hover:bg-blue-100 transition-colors flex items-center justify-center gap-1"
                  >
                    <TruckIcon className="w-4 h-4" />
                    Track
                  </button>
                  
                  {order.status === 'delivered' && !order.customer_feedback && (
                    <button
                      onClick={() => {
                        setSelectedOrder(order);
                        setShowFeedbackModal(true);
                      }}
                      className="flex-1 bg-green-50 text-green-600 px-3 py-2 rounded text-sm font-medium hover:bg-green-100 transition-colors flex items-center justify-center gap-1"
                    >
                      <MessageSquareIcon className="w-4 h-4" />
                      Feedback
                    </button>
                  )}
                  
                  {['confirmed', 'ready', 'dispatched'].includes(order.status) && (
                    <button
                      onClick={() => {
                        setSelectedOrder(order);
                        setShowRescheduleModal(true);
                      }}
                      className="flex-1 bg-orange-50 text-orange-600 px-3 py-2 rounded text-sm font-medium hover:bg-orange-100 transition-colors flex items-center justify-center gap-1"
                    >
                      <CalendarIcon className="w-4 h-4" />
                      Reschedule
                    </button>
                  )}
                </div>

                {order.customer_feedback && (
                  <div className="mt-4 p-3 bg-gray-50 rounded">
                    <div className="flex items-center gap-1 mb-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <StarIcon
                          key={star}
                          className={`w-4 h-4 ${
                            star <= (order.feedback_rating || 0)
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                      <span className="text-sm text-gray-600 ml-1">
                        Your feedback
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{order.customer_feedback}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Order Tracking Modal */}
      {selectedOrder && selectedOrder.tracking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-96 overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Order Tracking - {selectedOrder.order_number}</h3>
            
            <div className="space-y-4">
              {selectedOrder.tracking.timeline?.map((event: any, index: number) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{event.description}</p>
                    <p className="text-xs text-gray-600">{new Date(event.timestamp).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>

            {selectedOrder.tracking.delivery && (
              <div className="mt-6 p-4 bg-blue-50 rounded">
                <h4 className="font-medium text-sm mb-2">Delivery Information</h4>
                <p className="text-sm text-gray-700">
                  Driver: {selectedOrder.tracking.delivery.driver_name || 'Not assigned'}
                </p>
                {selectedOrder.tracking.delivery.driver_phone && (
                  <p className="text-sm text-gray-700">
                    Phone: {selectedOrder.tracking.delivery.driver_phone}
                  </p>
                )}
              </div>
            )}

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Submit Feedback</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setFeedback({ ...feedback, rating: star })}
                      className="focus:outline-none"
                    >
                      <StarIcon
                        className={`w-6 h-6 ${
                          star <= feedback.rating
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Comments</label>
                <textarea
                  value={feedback.comment}
                  onChange={(e) => setFeedback({ ...feedback, comment: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                  placeholder="Share your experience..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowFeedbackModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitFeedback}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {showRescheduleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Request Reschedule</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">New Delivery Date</label>
                <input
                  type="date"
                  value={rescheduleData.date}
                  onChange={(e) => setRescheduleData({ ...rescheduleData, date: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reason</label>
                <textarea
                  value={rescheduleData.reason}
                  onChange={(e) => setRescheduleData({ ...rescheduleData, reason: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Why do you need to reschedule?"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowRescheduleModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRequestReschedule}
                disabled={!rescheduleData.date || !rescheduleData.reason}
                className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Request Reschedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerDashboard;
