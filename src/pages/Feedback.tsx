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
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackType | null>(null);
  const [replyText, setReplyText] = useState('');
  
  // Customer feedback submission state
  const [newFeedback, setNewFeedback] = useState({
    orderId: location.state?.orderId || '',
    rating: 0,
    comment: '',
    photos: [] as File[]
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
      FeedbackService.markAsReplied(selectedFeedback.id);
      setFeedback(FeedbackService.getAllFeedback());
      setShowReplyModal(false);
      setReplyText('');
      setSelectedFeedback(null);
    }
  };

  const handleHelpful = (feedbackId: number, isHelpful: boolean) => {
    const item = feedback.find(f => f.id === feedbackId);
    if (item) {
      if (isHelpful) {
        FeedbackService.updateFeedback(feedbackId, { helpful: item.helpful + 1 });
      } else {
        FeedbackService.updateFeedback(feedbackId, { notHelpful: item.notHelpful + 1 });
      }
      setFeedback(FeedbackService.getAllFeedback());
    }
  };

  // Customer feedback submission handlers
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setNewFeedback(prev => ({
      ...prev,
      photos: [...prev.photos, ...files].slice(0, 5) // Max 5 photos
    }));
  };

  const removePhoto = (index: number) => {
    setNewFeedback(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };

  const submitCustomerFeedback = () => {
    if (newFeedback.rating === 0 || !newFeedback.comment.trim()) {
      alert('Please provide a rating and comment');
      return;
    }

    const feedbackData = {
      id: Date.now(),
      customer: 'Current User', // This would come from auth context
      orderId: newFeedback.orderId,
      rating: newFeedback.rating,
      comment: newFeedback.comment,
      date: new Date().toISOString(),
      replied: false,
      helpful: 0,
      notHelpful: 0,
      isPublic: true,
      photos: newFeedback.photos.map(file => URL.createObjectURL(file)) // In real app, upload to server
    };

    // Add to feedback list (in real app, this would be an API call)
    setFeedback(prev => [feedbackData, ...prev]);
    
    // Reset form
    setNewFeedback({
      orderId: '',
      rating: 0,
      comment: '',
      photos: []
    });
    setShowSubmitModal(false);
    
    alert('Thank you for your feedback!');
  };
  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, index) => <StarIcon key={index} size={16} className={index < rating ? 'text-yellow-400' : 'text-gray-300 '} fill={index < rating ? 'currentColor' : 'none'} />);
  };  return (
    <div className="space-y-4 xs:space-y-6 p-4 xs:p-6 relative">
      {/* Dark Mode Toggle */}
      <div className="absolute top-4 right-4 z-10">
        <DarkModeToggle />
      </div>
      
      <div className="flex flex-col xs:flex-row justify-between items-start xs:items-center gap-4">
        <h1 className="text-xl xs:text-2xl font-bold text-gray-800 dark:text-white">
          {userRole === 'customer' ? 'Submit Feedback' : 'Customer Feedback'}
        </h1>
        <div className="flex flex-col xs:flex-row items-stretch xs:items-center space-y-2 xs:space-y-0 xs:space-x-4 w-full xs:w-auto">
          {userRole === 'customer' && (
            <button
              onClick={() => setShowSubmitModal(true)}
              className="flex items-center justify-center px-3 xs:px-4 py-2 bg-[#FF6B35] text-white rounded-lg hover:bg-[#FF6B35]/90 text-sm xs:text-base"
            >
              <PlusIcon size={18} className="mr-2" />
              Submit Feedback
            </button>
          )}
          <div className="flex items-center space-x-2">
            <FilterIcon size={18} className="text-gray-400 dark:text-gray-500" />
            <select 
              value={filter} 
              onChange={(e) => setFilter(e.target.value)} 
              className="flex-1 xs:flex-none rounded-lg border-gray-300 dark:border-gray-600 focus:border-[#FF6B35] focus:ring focus:ring-[#FF6B35] focus:ring-opacity-50 dark:bg-gray-700 dark:text-white text-sm xs:text-base"
            >
              <option value="all">All Feedback</option>
              <option value="positive">Positive</option>
              <option value="negative">Negative</option>
              <option value="pending">Pending Reply</option>
            </select>
          </div>
        </div>
      </div>
      {/* Search */}
      <div className="relative">
        <SearchIcon size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
        <input type="text" placeholder="Search feedback..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10 w-full rounded-lg border-gray-300 dark:border-gray-600 focus:border-[#FF6B35] focus:ring focus:ring-[#FF6B35] focus:ring-opacity-50 dark:bg-gray-700 dark:text-white text-sm xs:text-base" />
      </div>
      {/* Feedback Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 xs:gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 xs:p-6 rounded-lg shadow transition-colors duration-300">
          <p className="text-xs xs:text-sm text-gray-600 dark:text-gray-400">Average Rating</p>
          <div className="flex items-center mt-1">
            <p className="text-lg xs:text-2xl font-semibold text-gray-800 dark:text-white">{stats.averageRating}</p>
            <div className="flex ml-2">{renderStars(stats.averageRating)}</div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 xs:p-6 rounded-lg shadow transition-colors duration-300">
          <p className="text-xs xs:text-sm text-gray-600 dark:text-gray-400">Total Reviews</p>
          <p className="text-lg xs:text-2xl font-semibold text-gray-800 dark:text-white">
            {stats.total}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm text-gray-600 ">Positive Feedback</p>
          <p className="text-2xl font-semibold text-green-600 ">{stats.positivePercentage}%</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm text-gray-600 ">Response Rate</p>
          <p className="text-2xl font-semibold text-[#FF6B35]">{stats.responseRate}%</p>
        </div>
      </div>
      {/* Feedback List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="divide-y divide-gray-200 ">
          {filteredFeedback.map(item => <div key={item.id} className="p-6 hover:bg-gray-50 ">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 ">
                        {item.customer}
                      </p>
                      <p className="text-sm text-gray-500 ">
                        Order: {item.orderId}
                      </p>
                    </div>
                    <p className="text-sm text-gray-500 ">
                      {new Date(item.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center mt-2">
                    {renderStars(item.rating)}
                  </div>
                  <p className="mt-2 text-gray-600 ">{item.comment}</p>
                  <div className="flex items-center space-x-4 mt-4">
                    <button 
                      onClick={() => handleHelpful(item.id, true)}
                      className="flex items-center text-sm text-gray-500 hover:text-gray-700 "
                    >
                      <ThumbsUpIcon size={16} className="mr-1" />
                      {item.helpful}
                    </button>
                    <button 
                      onClick={() => handleHelpful(item.id, false)}
                      className="flex items-center text-sm text-gray-500 hover:text-gray-700 "
                    >
                      <ThumbsDownIcon size={16} className="mr-1" />
                      {item.notHelpful}
                    </button>
                    {!item.replied && userRole !== 'customer' && <button onClick={() => handleReply(item.id)} className="flex items-center text-sm text-[#FF6B35] hover:text-[#FF6B35]/80">
                        <MessageSquareIcon size={16} className="mr-1" />
                        Reply
                      </button>}
                    {item.isPublic && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                        Featured
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>)}
        </div>
      </div>
      {/* Reply Modal */}
      {showReplyModal && selectedFeedback && <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <h2 className="text-xl font-bold mb-4 text-gray-900 ">
              Reply to {selectedFeedback.customer}'s Feedback
            </h2>
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex mb-2">
                {renderStars(selectedFeedback.rating)}
              </div>
              <p className="text-gray-700 italic">"{selectedFeedback.comment}"</p>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Reply
              </label>
              <textarea 
                rows={4} 
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="w-full rounded-lg border-gray-300 focus:border-[#FF6B35] focus:ring focus:ring-[#FF6B35] focus:ring-opacity-50" 
                placeholder="Type your reply here..." 
              />
            </div>
            <div className="flex justify-end space-x-4">
              <button 
                onClick={() => {
                  setShowReplyModal(false);
                  setReplyText('');
                  setSelectedFeedback(null);
                }} 
                className="px-4 py-2 text-gray-600 hover:text-gray-800 "
              >
                Cancel
              </button>
              <button 
                onClick={submitReply}
                className="px-4 py-2 bg-[#FF6B35] text-white rounded hover:bg-[#FF6B35]/90"
                disabled={!replyText.trim()}
              >
                Send Reply
              </button>
            </div>
          </div>
        </div>}

      {/* Customer Feedback Submission Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 ">
                Submit Feedback
              </h2>
              <button
                onClick={() => setShowSubmitModal(false)}
                className="text-gray-500 hover:text-gray-700 "
              >
                <XIcon size={20} />
              </button>
            </div>

            <div className="space-y-6">
              {/* Order ID */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Order ID
                </label>
                <input
                  type="text"
                  value={newFeedback.orderId}
                  onChange={(e) => setNewFeedback(prev => ({ ...prev, orderId: e.target.value }))}
                  placeholder="Enter order ID (e.g., ORD-7892)"
                  className="w-full rounded-lg border-gray-300 focus:border-[#FF6B35] focus:ring focus:ring-[#FF6B35] focus:ring-opacity-50"
                />
              </div>

              {/* Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rating
                </label>
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewFeedback(prev => ({ ...prev, rating: star }))}
                      className="focus:outline-none"
                    >
                      <StarIcon
                        size={24}
                        className={star <= newFeedback.rating ? 'text-yellow-400' : 'text-gray-300 '}
                        fill={star <= newFeedback.rating ? 'currentColor' : 'none'}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Comment */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Feedback
                </label>
                <textarea
                  rows={4}
                  value={newFeedback.comment}
                  onChange={(e) => setNewFeedback(prev => ({ ...prev, comment: e.target.value }))}
                  placeholder="Share your experience with this order..."
                  className="w-full rounded-lg border-gray-300 focus:border-[#FF6B35] focus:ring focus:ring-[#FF6B35] focus:ring-opacity-50"
                />
              </div>

              {/* Photo Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Photos (Optional)
                </label>
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 "
                  >
                    <CameraIcon size={20} className="mr-2" />
                    Add Photos
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                  
                  {/* Photo Preview */}
                  {newFeedback.photos.length > 0 && (
                    <div className="grid grid-cols-3 gap-2">
                      {newFeedback.photos.map((photo, index) => (
                        <div key={index} className="relative">
                          <img
                            src={URL.createObjectURL(photo)}
                            alt={`Upload ${index + 1}`}
                            className="w-full h-20 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removePhoto(index)}
                            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                          >
                            <XIcon size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4 mt-6">
              <button
                onClick={() => {
                  setShowSubmitModal(false);
                  setNewFeedback({ orderId: '', rating: 0, comment: '', photos: [] });
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 "
              >
                Cancel
              </button>
              <button
                onClick={submitCustomerFeedback}
                className="px-4 py-2 bg-[#FF6B35] text-white rounded hover:bg-[#FF6B35]/90"
                disabled={newFeedback.rating === 0 || !newFeedback.comment.trim()}
              >
                Submit Feedback
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Feedback;
