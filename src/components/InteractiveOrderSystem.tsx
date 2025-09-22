import React, { useState, useEffect } from 'react';
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
    Button,
    Input,
    Textarea,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    Badge,
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    Alert,
    AlertDescription,
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
    Label,
    RadioGroup,
    RadioGroupItem,
    Progress,
    Separator
} from '@/components/ui';
import {
    Edit3,
    Camera,
    Upload,
    Star,
    Clock,
    CheckCircle,
    XCircle,
    AlertTriangle,
    Package,
    Truck,
    Calendar,
    MapPin,
    MessageSquare,
    ThumbsUp,
    ThumbsDown,
    RefreshCw,
    Eye,
    Filter,
    Search,
    Download
} from 'lucide-react';

interface Order {
    _id: string;
    orderNumber: string;
    customer: {
        fullName: string;
        email: string;
        phone: string;
    };
    items: Array<{
        _id: string;
        inventory: {
            name: string;
            sku: string;
        };
        quantity: number;
    }>;
    status: string;
    shippingAddress: {
        street: string;
        city: string;
        state: string;
        zipCode: string;
    };
    delivery: {
        estimatedDate: string;
        actualDate?: string;
    };
    adjustments?: Array<any>;
    customerFeedback?: {
        deliveryFeedback?: any;
        productFeedback?: any;
        overallSatisfaction?: number;
    };
    flexibilityMetrics?: {
        totalAdjustments: number;
        customerSatisfactionScore?: number;
        responseTime?: {
            averageMinutes: number;
        };
    };
}

interface OrderAdjustmentProps {
    order: Order;
    onOrderUpdate: (updatedOrder: Order) => void;
}

const InteractiveOrderSystem: React.FC<OrderAdjustmentProps> = ({ order, onOrderUpdate }) => {
    const [activeTab, setActiveTab] = useState('adjustments');
    const [pendingAdjustments, setPendingAdjustments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Adjustment Form State
    const [adjustmentForm, setAdjustmentForm] = useState({
        type: '',
        reason: '',
        urgency: 'medium',
        newValue: {}
    });

    // Feedback Form State
    const [feedbackForm, setFeedbackForm] = useState({
        deliveryRating: 0,
        deliveryComment: '',
        productRating: 0,
        productComment: '',
        overallSatisfaction: 0,
        wouldRecommend: null,
        additionalComments: '',
        customerName: '',
        customerPhone: '',
        photos: []
    });

    const [previewPhotos, setPreviewPhotos] = useState([]);

    useEffect(() => {
        loadPendingAdjustments();
    }, []);

    const loadPendingAdjustments = async () => {
        try {
            const response = await fetch('/api/orders/adjustments/pending', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const data = await response.json();
            if (data.success) {
                setPendingAdjustments(data.data);
            }
        } catch (error) {
            console.error('Failed to load pending adjustments:', error);
        }
    };

    const handleAdjustmentRequest = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch(`/api/orders/${order._id}/request-adjustment`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(adjustmentForm)
            });

            const data = await response.json();
            if (data.success) {
                setSuccess('Adjustment request submitted successfully');
                setAdjustmentForm({ type: '', reason: '', urgency: 'medium', newValue: {} });
                loadPendingAdjustments();
            } else {
                setError(data.error || 'Failed to submit adjustment request');
            }
        } catch (error) {
            setError('Network error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleAdjustmentProcess = async (adjustmentId: string, status: string, notes: string = '') => {
        setLoading(true);
        try {
            const response = await fetch(`/api/orders/${order._id}/adjustments/${adjustmentId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ status, notes })
            });

            const data = await response.json();
            if (data.success) {
                setSuccess(`Adjustment ${status} successfully`);
                loadPendingAdjustments();
            } else {
                setError(data.error || 'Failed to process adjustment');
            }
        } catch (error) {
            setError('Network error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length > 5) {
            setError('Maximum 5 photos allowed');
            return;
        }

        // Validate file types and sizes
        const validFiles = files.filter(file => {
            const isValidType = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type);
            const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB
            return isValidType && isValidSize;
        });

        if (validFiles.length !== files.length) {
            setError('Some files were rejected. Only JPEG, PNG, WebP under 5MB are allowed.');
        }

        setFeedbackForm(prev => ({ ...prev, photos: validFiles }));

        // Create preview URLs
        const previews = validFiles.map(file => ({
            file,
            url: URL.createObjectURL(file),
            name: file.name
        }));
        setPreviewPhotos(previews);
    };

    const handleFeedbackSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const formData = new FormData();

            // Add text fields
            Object.keys(feedbackForm).forEach(key => {
                if (key !== 'photos' && feedbackForm[key] !== '') {
                    formData.append(key, feedbackForm[key]);
                }
            });

            // Add photos
            feedbackForm.photos.forEach(photo => {
                formData.append('photos', photo);
            });

            const response = await fetch(`/api/feedback-enhanced/order/${order._id}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: formData
            });

            const data = await response.json();
            if (data.success) {
                setSuccess('Customer feedback recorded successfully');
                setFeedbackForm({
                    deliveryRating: 0,
                    deliveryComment: '',
                    productRating: 0,
                    productComment: '',
                    overallSatisfaction: 0,
                    wouldRecommend: null,
                    additionalComments: '',
                    customerName: '',
                    customerPhone: '',
                    photos: []
                });
                setPreviewPhotos([]);
            } else {
                setError(data.error || 'Failed to record feedback');
            }
        } catch (error) {
            setError('Network error occurred');
        } finally {
            setLoading(false);
        }
    };

    const renderStarRating = (rating: number, onRatingChange: (rating: number) => void) => {
        return (
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        onClick={() => onRatingChange(star)}
                        className={`p-1 ${star <= rating ? 'text-yellow-500' : 'text-gray-300'}`}
                    >
                        <Star size={20} fill={star <= rating ? 'currentColor' : 'none'} />
                    </button>
                ))}
            </div>
        );
    };

    const getStatusBadge = (status: string) => {
        const statusColors = {
            pending: 'bg-yellow-100 text-yellow-800',
            approved: 'bg-green-100 text-green-800',
            rejected: 'bg-red-100 text-red-800',
            processing: 'bg-blue-100 text-blue-800',
            completed: 'bg-purple-100 text-purple-800'
        };

        return (
            <Badge className={statusColors[status] || 'bg-gray-100 text-gray-800'}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
        );
    };

    const getUrgencyColor = (urgency: string) => {
        const colors = {
            low: 'text-green-600',
            medium: 'text-yellow-600',
            high: 'text-orange-600',
            urgent: 'text-red-600'
        };
        return colors[urgency] || 'text-gray-600';
    };

    return (
        <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
            {error && (
                <Alert className="border-red-200 bg-red-50">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription className="text-red-800">{error}</AlertDescription>
                </Alert>
            )}

            {success && (
                <Alert className="border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription className="text-green-800">{success}</AlertDescription>
                </Alert>
            )}

            {/* Order Overview */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span>Order {order.orderNumber}</span>
                        <div className="flex items-center gap-2">
                            {getStatusBadge(order.status)}
                            {order.flexibilityMetrics?.totalAdjustments > 0 && (
                                <Badge variant="outline">
                                    {order.flexibilityMetrics.totalAdjustments} Adjustments
                                </Badge>
                            )}
                        </div>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <p className="text-sm text-gray-600">Customer</p>
                            <p className="font-medium">{order.customer.fullName}</p>
                            <p className="text-sm text-gray-500">{order.customer.phone}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Delivery</p>
                            <p className="font-medium">{new Date(order.delivery.estimatedDate).toLocaleDateString()}</p>
                        </div>
                    </div>

                    {order.flexibilityMetrics && (
                        <div className="mt-4 pt-4 border-t">
                            <h4 className="font-medium mb-2">Flexibility Metrics</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                <div>
                                    <p className="text-gray-600">Response Time</p>
                                    <p className="font-medium">
                                        {order.flexibilityMetrics.responseTime?.averageMinutes || 0} minutes avg
                                    </p>
                                </div>
                                <div>
                                    <p className="text-gray-600">Customer Satisfaction</p>
                                    <div className="flex items-center gap-2">
                                        {order.flexibilityMetrics.customerSatisfactionScore && (
                                            <>
                                                <div className="flex">
                                                    {renderStarRating(order.flexibilityMetrics.customerSatisfactionScore, () => { })}
                                                </div>
                                                <span className="font-medium">
                                                    {order.flexibilityMetrics.customerSatisfactionScore}/5
                                                </span>
                                            </>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-gray-600">Total Adjustments</p>
                                    <p className="font-medium">{order.flexibilityMetrics.totalAdjustments}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Main Interface Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="adjustments" className="flex items-center gap-2">
                        <Edit3 size={16} />
                        Order Adjustments
                    </TabsTrigger>
                    <TabsTrigger value="feedback" className="flex items-center gap-2">
                        <MessageSquare size={16} />
                        Customer Feedback
                    </TabsTrigger>
                    <TabsTrigger value="pending" className="flex items-center gap-2">
                        <Clock size={16} />
                        Pending Requests
                        {pendingAdjustments.length > 0 && (
                            <Badge variant="secondary" className="ml-1">
                                {pendingAdjustments.length}
                            </Badge>
                        )}
                    </TabsTrigger>
                </TabsList>

                {/* Order Adjustments Tab */}
                <TabsContent value="adjustments">
                    <Card>
                        <CardHeader>
                            <CardTitle>Request Order Adjustment</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleAdjustmentRequest} className="space-y-4">
                                <div>
                                    <Label htmlFor="adjustment-type">Adjustment Type</Label>
                                    <Select
                                        value={adjustmentForm.type}
                                        onValueChange={(value) => setAdjustmentForm(prev => ({ ...prev, type: value }))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select adjustment type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="material_change">
                                                <div className="flex items-center gap-2">
                                                    <Package size={16} />
                                                    Material Change
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="quantity_change">
                                                <div className="flex items-center gap-2">
                                                    <RefreshCw size={16} />
                                                    Quantity Change
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="delivery_date_change">
                                                <div className="flex items-center gap-2">
                                                    <Calendar size={16} />
                                                    Delivery Date Change
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="address_change">
                                                <div className="flex items-center gap-2">
                                                    <MapPin size={16} />
                                                    Address Change
                                                </div>
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label htmlFor="urgency">Urgency Level</Label>
                                    <Select
                                        value={adjustmentForm.urgency}
                                        onValueChange={(value) => setAdjustmentForm(prev => ({ ...prev, urgency: value }))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="low">Low</SelectItem>
                                            <SelectItem value="medium">Medium</SelectItem>
                                            <SelectItem value="high">High</SelectItem>
                                            <SelectItem value="urgent">Urgent</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label htmlFor="reason">Reason for Adjustment</Label>
                                    <Textarea
                                        id="reason"
                                        value={adjustmentForm.reason}
                                        onChange={(e) => setAdjustmentForm(prev => ({ ...prev, reason: e.target.value }))}
                                        placeholder="Please explain why this adjustment is needed..."
                                        rows={3}
                                        required
                                    />
                                </div>

                                <Button type="submit" disabled={loading || !adjustmentForm.type || !adjustmentForm.reason}>
                                    {loading ? 'Submitting...' : 'Submit Adjustment Request'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Customer Feedback Tab */}
                <TabsContent value="feedback">
                    <Card>
                        <CardHeader>
                            <CardTitle>Record Customer Feedback</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {order.status !== 'delivered' ? (
                                <Alert>
                                    <AlertTriangle className="h-4 w-4" />
                                    <AlertDescription>
                                        Feedback can only be recorded for delivered orders.
                                    </AlertDescription>
                                </Alert>
                            ) : (
                                <form onSubmit={handleFeedbackSubmit} className="space-y-6">
                                    {/* Customer Information */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="customer-name">Customer Name</Label>
                                            <Input
                                                id="customer-name"
                                                value={feedbackForm.customerName}
                                                onChange={(e) => setFeedbackForm(prev => ({ ...prev, customerName: e.target.value }))}
                                                placeholder="Customer's name"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="customer-phone">Customer Phone</Label>
                                            <Input
                                                id="customer-phone"
                                                value={feedbackForm.customerPhone}
                                                onChange={(e) => setFeedbackForm(prev => ({ ...prev, customerPhone: e.target.value }))}
                                                placeholder="Customer's phone number"
                                            />
                                        </div>
                                    </div>

                                    <Separator />

                                    {/* Delivery Feedback */}
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-medium flex items-center gap-2">
                                            <Truck size={20} />
                                            Delivery Feedback
                                        </h3>

                                        <div>
                                            <Label>Delivery Rating</Label>
                                            {renderStarRating(
                                                feedbackForm.deliveryRating,
                                                (rating) => setFeedbackForm(prev => ({ ...prev, deliveryRating: rating }))
                                            )}
                                        </div>

                                        <div>
                                            <Label htmlFor="delivery-comment">Delivery Comments</Label>
                                            <Textarea
                                                id="delivery-comment"
                                                value={feedbackForm.deliveryComment}
                                                onChange={(e) => setFeedbackForm(prev => ({ ...prev, deliveryComment: e.target.value }))}
                                                placeholder="Customer's feedback about the delivery..."
                                                rows={2}
                                            />
                                        </div>
                                    </div>

                                    <Separator />

                                    {/* Product Feedback */}
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-medium flex items-center gap-2">
                                            <Package size={20} />
                                            Product Feedback
                                        </h3>

                                        <div>
                                            <Label>Product Rating</Label>
                                            {renderStarRating(
                                                feedbackForm.productRating,
                                                (rating) => setFeedbackForm(prev => ({ ...prev, productRating: rating }))
                                            )}
                                        </div>

                                        <div>
                                            <Label htmlFor="product-comment">Product Comments</Label>
                                            <Textarea
                                                id="product-comment"
                                                value={feedbackForm.productComment}
                                                onChange={(e) => setFeedbackForm(prev => ({ ...prev, productComment: e.target.value }))}
                                                placeholder="Customer's feedback about the products..."
                                                rows={2}
                                            />
                                        </div>
                                    </div>

                                    <Separator />

                                    {/* Overall Feedback */}
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-medium">Overall Experience</h3>

                                        <div>
                                            <Label>Overall Satisfaction</Label>
                                            {renderStarRating(
                                                feedbackForm.overallSatisfaction,
                                                (rating) => setFeedbackForm(prev => ({ ...prev, overallSatisfaction: rating }))
                                            )}
                                        </div>

                                        <div>
                                            <Label>Would recommend to others?</Label>
                                            <RadioGroup
                                                value={feedbackForm.wouldRecommend?.toString()}
                                                onValueChange={(value) => setFeedbackForm(prev => ({
                                                    ...prev,
                                                    wouldRecommend: value === 'true'
                                                }))}
                                                className="flex gap-4 mt-2"
                                            >
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="true" id="recommend-yes" />
                                                    <Label htmlFor="recommend-yes" className="flex items-center gap-1">
                                                        <ThumbsUp size={16} />
                                                        Yes
                                                    </Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="false" id="recommend-no" />
                                                    <Label htmlFor="recommend-no" className="flex items-center gap-1">
                                                        <ThumbsDown size={16} />
                                                        No
                                                    </Label>
                                                </div>
                                            </RadioGroup>
                                        </div>

                                        <div>
                                            <Label htmlFor="additional-comments">Additional Comments</Label>
                                            <Textarea
                                                id="additional-comments"
                                                value={feedbackForm.additionalComments}
                                                onChange={(e) => setFeedbackForm(prev => ({ ...prev, additionalComments: e.target.value }))}
                                                placeholder="Any additional feedback or suggestions..."
                                                rows={3}
                                            />
                                        </div>
                                    </div>

                                    <Separator />

                                    {/* Photo Upload */}
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-medium flex items-center gap-2">
                                            <Camera size={20} />
                                            Photo Upload
                                        </h3>

                                        <div>
                                            <Label htmlFor="photos">Upload Photos (Max 5, 5MB each)</Label>
                                            <Input
                                                id="photos"
                                                type="file"
                                                multiple
                                                accept="image/jpeg,image/jpg,image/png,image/webp"
                                                onChange={handlePhotoUpload}
                                                className="mt-1"
                                            />
                                        </div>

                                        {previewPhotos.length > 0 && (
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                                {previewPhotos.map((photo, index) => (
                                                    <div key={index} className="relative">
                                                        <img
                                                            src={photo.url}
                                                            alt={`Preview ${index + 1}`}
                                                            className="w-full h-32 object-cover rounded-lg border"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const newPhotos = previewPhotos.filter((_, i) => i !== index);
                                                                setPreviewPhotos(newPhotos);
                                                                setFeedbackForm(prev => ({
                                                                    ...prev,
                                                                    photos: newPhotos.map(p => p.file)
                                                                }));
                                                            }}
                                                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 text-xs"
                                                        >
                                                            ×
                                                        </button>
                                                        <p className="text-xs text-gray-500 mt-1 truncate">
                                                            {photo.name}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <Button type="submit" disabled={loading} className="w-full">
                                        {loading ? 'Recording Feedback...' : 'Record Customer Feedback'}
                                    </Button>
                                </form>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Pending Requests Tab */}
                <TabsContent value="pending">
                    <Card>
                        <CardHeader>
                            <CardTitle>Pending Adjustment Requests</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {pendingAdjustments.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    <Clock size={48} className="mx-auto mb-4 opacity-50" />
                                    <p>No pending adjustment requests</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {pendingAdjustments.map((request) => (
                                        <div key={request._id} className="border rounded-lg p-4">
                                            <div className="flex items-start justify-between mb-2">
                                                <div>
                                                    <h4 className="font-medium">
                                                        Order {request.orderNumber}
                                                    </h4>
                                                    <p className="text-sm text-gray-600">
                                                        Customer: {request.customer}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    {getStatusBadge(request.adjustment.status)}
                                                    <p className={`text-sm font-medium ${getUrgencyColor(request.adjustment.urgency)}`}>
                                                        {request.adjustment.urgency} priority
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="mb-3">
                                                <p className="text-sm text-gray-600 mb-1">
                                                    Type: {request.adjustment.type.replace('_', ' ').toUpperCase()}
                                                </p>
                                                <p className="text-sm">
                                                    <strong>Reason:</strong> {request.adjustment.reason}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Requested by {request.requestedBy} ({request.requestedByRole}) on{' '}
                                                    {new Date(request.adjustment.requestedAt).toLocaleString()}
                                                </p>
                                            </div>

                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleAdjustmentProcess(request.adjustment.adjustmentId, 'approved')}
                                                    disabled={loading}
                                                >
                                                    <CheckCircle size={16} className="mr-1" />
                                                    Approve
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() => handleAdjustmentProcess(request.adjustment.adjustmentId, 'rejected')}
                                                    disabled={loading}
                                                >
                                                    <XCircle size={16} className="mr-1" />
                                                    Reject
                                                </Button>
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <Button size="sm" variant="outline">
                                                            <Eye size={16} className="mr-1" />
                                                            View Details
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent className="max-w-2xl">
                                                        <DialogHeader>
                                                            <DialogTitle>
                                                                Adjustment Request Details
                                                            </DialogTitle>
                                                        </DialogHeader>
                                                        <div className="space-y-4">
                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div>
                                                                    <p className="font-medium">Order Number</p>
                                                                    <p>{request.orderNumber}</p>
                                                                </div>
                                                                <div>
                                                                    <p className="font-medium">Customer</p>
                                                                    <p>{request.customer}</p>
                                                                </div>
                                                                <div>
                                                                    <p className="font-medium">Type</p>
                                                                    <p>{request.adjustment.type.replace('_', ' ')}</p>
                                                                </div>
                                                                <div>
                                                                    <p className="font-medium">Urgency</p>
                                                                    <p className={getUrgencyColor(request.adjustment.urgency)}>
                                                                        {request.adjustment.urgency}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <p className="font-medium">Reason</p>
                                                                <p className="mt-1 p-3 bg-gray-50 rounded">
                                                                    {request.adjustment.reason}
                                                                </p>
                                                            </div>
                                                            {request.adjustment.originalValue && (
                                                                <div>
                                                                    <p className="font-medium">Original Value</p>
                                                                    <pre className="mt-1 p-3 bg-gray-50 rounded text-sm overflow-x-auto">
                                                                        {JSON.stringify(request.adjustment.originalValue, null, 2)}
                                                                    </pre>
                                                                </div>
                                                            )}
                                                            {request.adjustment.newValue && (
                                                                <div>
                                                                    <p className="font-medium">Requested Changes</p>
                                                                    <pre className="mt-1 p-3 bg-gray-50 rounded text-sm overflow-x-auto">
                                                                        {JSON.stringify(request.adjustment.newValue, null, 2)}
                                                                    </pre>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </DialogContent>
                                                </Dialog>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default InteractiveOrderSystem;
