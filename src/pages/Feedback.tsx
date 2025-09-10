import { useState, useRef } from 'react';
import { StarIcon, MessageSquareIcon, ThumbsUpIcon, ThumbsDownIcon, FilterIcon, SearchIcon, CameraIcon, XIcon, PlusIcon } from 'lucide-react';
import { FeedbackService, Feedback as FeedbackType } from '../services/feedbackService';
import { useLocation } from 'react-router-dom';
import DarkModeToggle from '../components/UI/DarkModeToggle';

const Feedback = ({
  userRole
}: {
  userRole: string;
}) => {
  const location = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [feedback, setFeedback] = useState<FeedbackType[]>(FeedbackService.getAllFeedback());
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackType | null>(null);
  const [replyText, setReplyText] = useState('');

  // Customer feedback submission state
  const [newFeedback, setNewFeedback] = useState({
    orderId: location.state?.orderId || '',
    rating: 0,
    comment: '',
    photos: [] as File[]
  });

  // General message state
  const [newMessage, setNewMessage] = useState({
    subject: '',
    message: '',
    category: 'general',
    priority: 'medium'
  });

  const stats = FeedbackService.getStats();
  const filteredFeedback = feedback.filter(item => {
    const matchesSearch = item.customer.toLowerCase().includes(searchTerm.toLowerCase()) || item.orderId.toLowerCase().includes(searchTerm.toLowerCase()) || item.comment.toLowerCase().includes(searchTerm.toLowerCase());
    if (filter === 'all') return matchesSearch;
    if (filter === 'positive') return matchesSearch && item.rating >= 4;
    if (filter === 'negative') return matchesSearch && item.rating <= 2;
    if (filter === 'pending') return matchesSearch && !item.replied;
    return matchesSearch;
  });

  const handleReply = (feedbackId: number) => {
    const selectedItem = feedback.find(f => f.id === feedbackId);
    if (selectedItem) {
      setSelectedFeedback(selectedItem);
      setShowReplyModal(true);
    }
  };

  const submitReply = () => {
    if (selectedFeedback && replyText.trim()) {
      const updatedFeedback = FeedbackService.addReply(selectedFeedback.id, replyText);
      setFeedback(prev => prev.map(f => f.id === selectedFeedback.id ? updatedFeedback : f));
      setReplyText('');
      setShowReplyModal(false);
      setSelectedFeedback(null);
    }
  };

  const submitFeedback = () => {
    if (newFeedback.rating > 0 && newFeedback.comment.trim()) {
      const feedback = FeedbackService.submitFeedback(
        newFeedback.orderId || `#${Date.now()}`,
        'Current User',
        newFeedback.rating,
        newFeedback.comment,
        newFeedback.photos
      );
      setFeedback(prev => [feedback, ...prev]);
      setNewFeedback({ orderId: '', rating: 0, comment: '', photos: [] });
      setShowSubmitModal(false);
    }
  };

  const submitMessage = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please log in to send messages');
        return;
      }

      const response = await fetch('http://localhost:5001/api/messages', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          subject: newMessage.subject,
          message: newMessage.message,
          category: newMessage.category,
          priority: newMessage.priority
        })
      });

      if (response.ok) {
        alert('Message sent successfully!');
        setNewMessage({ subject: '', message: '', category: 'general', priority: 'medium' });
        setShowMessageModal(false);
      } else {
        alert('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Error sending message');
    }
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setNewFeedback(prev => ({
      ...prev,
      photos: [...prev.photos, ...files].slice(0, 3) // Max 3 photos
    }));
  };

  const removePhoto = (index: number) => {
    setNewFeedback(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };

  const renderStars = (rating: number, interactive = false, size = 20) => {
    return Array.from({ length: 5 }, (_, index) => (
      <StarIcon
        key={index}
        size={size}
        className={`${index < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
          } ${interactive ? 'cursor-pointer hover:text-yellow-400' : ''}`}
        onClick={interactive ? () => setNewFeedback(prev => ({ ...prev, rating: index + 1 })) : undefined}
      />
    ));
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Dark Mode Toggle */}
        <div className="absolute top-4 right-4 z-10">
          <DarkModeToggle />
        </div>

        {/* Beautiful Header */}
        <div className="mb-8 bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/50 dark:from-gray-800 dark:via-blue-900/10 dark:to-indigo-900/20 rounded-3xl shadow-xl p-8 border border-white/50 dark:border-gray-700/50 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-200/20 to-indigo-300/20 rounded-full blur-3xl transform translate-x-16 -translate-y-16"></div>

          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl shadow-xl">
                  <StarIcon className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 via-blue-600 to-purple-600 dark:from-white dark:via-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                    {userRole === 'customer' ? 'Submit Feedback' : 'Customer Feedback'}
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">
                    {userRole === 'customer' ? 'Share your experience with us' : 'Manage customer feedback and reviews'}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
                {userRole === 'customer' && (
                  <>
                    <button
                      onClick={() => setShowSubmitModal(true)}
                      className="flex items-center justify-center px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-2xl hover:from-orange-600 hover:to-red-600 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                    >
                      <PlusIcon size={20} className="mr-2" />
                      Submit Feedback
                    </button>
                    <button
                      onClick={() => setShowMessageModal(true)}
                      className="flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl hover:from-blue-600 hover:to-indigo-700 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                    >
                      <MessageSquareIcon size={20} className="mr-2" />
                      Send Message
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Beautiful Stats Cards */}
        {userRole !== 'customer' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="group relative bg-gradient-to-br from-yellow-50 via-yellow-100 to-orange-100 dark:from-yellow-900/20 dark:via-yellow-800/30 dark:to-orange-900/20 rounded-3xl p-6 shadow-xl border border-white/50 dark:border-gray-700/50 hover:shadow-2xl transition-all duration-500 hover:scale-105 cursor-pointer overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full blur-lg transform translate-x-4 -translate-y-4 group-hover:scale-125 transition-transform duration-500"></div>

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-br from-yellow-500 via-yellow-600 to-orange-700 rounded-2xl shadow-xl group-hover:rotate-6 transition-transform duration-500">
                    <StarIcon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Reviews</p>
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
                    <ThumbsUpIcon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Positive Reviews</p>
                  <p className="text-3xl font-bold text-gray-800 dark:text-white group-hover:scale-105 transition-transform duration-300">
                    {stats.positive}
                  </p>
                </div>
              </div>
            </div>

            <div className="group relative bg-gradient-to-br from-red-50 via-red-100 to-red-100 dark:from-red-900/20 dark:via-red-800/30 dark:to-red-900/20 rounded-3xl p-6 shadow-xl border border-white/50 dark:border-gray-700/50 hover:shadow-2xl transition-all duration-500 hover:scale-105 cursor-pointer overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full blur-lg transform translate-x-4 -translate-y-4 group-hover:scale-125 transition-transform duration-500"></div>

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-br from-red-500 via-red-600 to-red-700 rounded-2xl shadow-xl group-hover:rotate-6 transition-transform duration-500">
                    <ThumbsDownIcon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Negative Reviews</p>
                  <p className="text-3xl font-bold text-gray-800 dark:text-white group-hover:scale-105 transition-transform duration-300">
                    {stats.negative}
                  </p>
                </div>
              </div>
            </div>

            <div className="group relative bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-100 dark:from-blue-900/20 dark:via-blue-800/30 dark:to-indigo-900/20 rounded-3xl p-6 shadow-xl border border-white/50 dark:border-gray-700/50 hover:shadow-2xl transition-all duration-500 hover:scale-105 cursor-pointer overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full blur-lg transform translate-x-4 -translate-y-4 group-hover:scale-125 transition-transform duration-500"></div>

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 rounded-2xl shadow-xl group-hover:rotate-6 transition-transform duration-500">
                    <MessageSquareIcon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Average Rating</p>
                  <p className="text-3xl font-bold text-gray-800 dark:text-white group-hover:scale-105 transition-transform duration-300">
                    {stats.averageRating}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Beautiful Filters */}
        {userRole !== 'customer' && (
          <div className="mb-8 bg-white/70 dark:bg-gray-800/70 rounded-3xl shadow-xl p-6 backdrop-blur-sm border border-white/50 dark:border-gray-700/50">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="flex items-center space-x-2">
                <FilterIcon size={20} className="text-gray-600 dark:text-gray-400" />
                <span className="text-gray-700 dark:text-gray-300 font-medium">Filter:</span>
              </div>

              <div className="flex flex-wrap gap-2">
                {['all', 'positive', 'negative', 'pending'].map((filterOption) => (
                  <button
                    key={filterOption}
                    onClick={() => setFilter(filterOption)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${filter === filterOption
                        ? 'bg-blue-500 text-white shadow-lg'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                      }`}
                  >
                    {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
                  </button>
                ))}
              </div>

              <div className="flex-1 max-w-md">
                <div className="relative">
                  <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search feedback..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Beautiful Feedback List */}
        <div className="bg-white/70 dark:bg-gray-800/70 rounded-3xl shadow-xl backdrop-blur-sm border border-white/50 dark:border-gray-700/50 overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">
              {userRole === 'customer' ? 'Your Feedback History' : 'Customer Feedback'} ({filteredFeedback.length})
            </h2>

            {filteredFeedback.length === 0 ? (
              <div className="text-center py-12">
                <StarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No feedback found</p>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredFeedback.map((item) => (
                  <div
                    key={item.id}
                    className="group bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-gray-800 dark:text-white text-lg">
                          {item.customer}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Order: {item.orderId} • {formatDate(item.date)}
                        </p>
                      </div>

                      <div className="flex items-center space-x-2">
                        <div className="flex">{renderStars(item.rating)}</div>
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          ({item.rating}/5)
                        </span>
                      </div>
                    </div>

                    <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                      {item.comment}
                    </p>

                    {item.photos && item.photos.length > 0 && (
                      <div className="flex space-x-2 mb-4">
                        {item.photos.map((photo, index) => (
                          <img
                            key={index}
                            src={photo}
                            alt={`Feedback photo ${index + 1}`}
                            className="w-16 h-16 object-cover rounded-xl border border-gray-200 dark:border-gray-600"
                          />
                        ))}
                      </div>
                    )}

                    {item.reply && (
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 mt-4 border-l-4 border-blue-500">
                        <p className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">Admin Reply:</p>
                        <p className="text-blue-700 dark:text-blue-400">{item.reply}</p>
                      </div>
                    )}

                    {userRole !== 'customer' && !item.replied && (
                      <div className="flex justify-end mt-4">
                        <button
                          onClick={() => handleReply(item.id)}
                          className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105"
                        >
                          Reply
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Reply Modal */}
        {showReplyModal && selectedFeedback && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-2xl w-full">
              <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 p-6 text-white rounded-t-3xl">
                <h2 className="text-2xl font-bold">Reply to {selectedFeedback.customer}'s Feedback</h2>
                <div className="flex items-center mt-2 space-x-2">
                  {renderStars(selectedFeedback.rating)}
                </div>
                <p className="text-blue-100 italic mt-2">"{selectedFeedback.comment}"</p>
              </div>

              <div className="p-6">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your reply..."
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                  rows={4}
                />

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => {
                      setShowReplyModal(false);
                      setSelectedFeedback(null);
                      setReplyText('');
                    }}
                    className="px-6 py-3 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={submitReply}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-105"
                    disabled={!replyText.trim()}
                  >
                    Send Reply
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Submit Feedback Modal */}
        {showSubmitModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-2xl w-full">
              <div className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-600 p-6 text-white rounded-t-3xl">
                <h2 className="text-2xl font-bold">Submit Your Feedback</h2>
                <p className="text-orange-100 mt-2">Share your experience with us</p>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Order ID (Optional)
                  </label>
                  <input
                    type="text"
                    value={newFeedback.orderId}
                    onChange={(e) => setNewFeedback(prev => ({ ...prev, orderId: e.target.value }))}
                    placeholder="Enter order ID"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Rating *
                  </label>
                  <div className="flex space-x-1">
                    {renderStars(newFeedback.rating, true, 32)}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Comment *
                  </label>
                  <textarea
                    value={newFeedback.comment}
                    onChange={(e) => setNewFeedback(prev => ({ ...prev, comment: e.target.value }))}
                    placeholder="Tell us about your experience..."
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                    rows={4}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Photos (Optional, max 3)
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {newFeedback.photos.map((photo, index) => (
                      <div key={index} className="relative">
                        <img
                          src={URL.createObjectURL(photo)}
                          alt={`Upload ${index + 1}`}
                          className="w-20 h-20 object-cover rounded-xl border border-gray-200 dark:border-gray-600"
                        />
                        <button
                          onClick={() => removePhoto(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                        >
                          <XIcon size={12} />
                        </button>
                      </div>
                    ))}

                    {newFeedback.photos.length < 3 && (
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-20 h-20 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl flex items-center justify-center hover:border-orange-500 transition-colors"
                      >
                        <CameraIcon size={24} className="text-gray-400" />
                      </button>
                    )}
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </div>
              </div>

              <div className="p-6 bg-gray-50 dark:bg-gray-900 rounded-b-3xl">
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setShowSubmitModal(false);
                      setNewFeedback({ orderId: '', rating: 0, comment: '', photos: [] });
                    }}
                    className="px-6 py-3 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={submitFeedback}
                    className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:from-orange-600 hover:to-red-600 transition-all transform hover:scale-105"
                    disabled={newFeedback.rating === 0 || !newFeedback.comment.trim()}
                  >
                    Submit Feedback
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Send Message Modal */}
        {showMessageModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-2xl w-full">
              <div className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 p-6 text-white rounded-t-3xl">
                <h2 className="text-2xl font-bold">Send Message</h2>
                <p className="text-blue-100 mt-2">Contact our support team</p>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    value={newMessage.subject}
                    onChange={(e) => setNewMessage(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="Message subject"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Category
                    </label>
                    <select
                      value={newMessage.category}
                      onChange={(e) => setNewMessage(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="general">General</option>
                      <option value="support">Support</option>
                      <option value="billing">Billing</option>
                      <option value="complaint">Complaint</option>
                      <option value="feature_request">Feature Request</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Priority
                    </label>
                    <select
                      value={newMessage.priority}
                      onChange={(e) => setNewMessage(prev => ({ ...prev, priority: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Message *
                  </label>
                  <textarea
                    value={newMessage.message}
                    onChange={(e) => setNewMessage(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Type your message here..."
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                    rows={5}
                  />
                </div>
              </div>

              <div className="p-6 bg-gray-50 dark:bg-gray-900 rounded-b-3xl">
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setShowMessageModal(false);
                      setNewMessage({ subject: '', message: '', category: 'general', priority: 'medium' });
                    }}
                    className="px-6 py-3 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={submitMessage}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all transform hover:scale-105"
                    disabled={!newMessage.subject.trim() || !newMessage.message.trim()}
                  >
                    Send Message
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

export default Feedback;
