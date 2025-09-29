import React, { useState, useEffect } from 'react';
import {
    X,
    Truck,
    User,
    Phone,
    MapPin,
    Package,
    Save,
    Search,
    Star,
    Navigation
} from 'lucide-react';
import { useNotification } from '../contexts/NotificationContext';

interface SubOrderItem {
    materialId: string;
    materialName: string;
    qty: number;
    unitPrice: number;
    totalPrice: number;
}

interface SubOrder {
    _id: string;
    subOrderNumber: string;
    mainOrderId: {
        _id: string;
        orderNumber: string;
        customerId: {
            username: string;
            email: string;
            phone?: string;
            address?: string;
        };
        requestedDeliveryDate: string;
    };
    warehouseId: {
        _id: string;
        name: string;
        location: string;
        contact: string;
    };
    materialCategory: string;
    items: SubOrderItem[];
    totalAmount: number;
    status: string;
    scheduledAt: string;
    scheduledTime: string;
    estimatedDuration: number;
    createdAt: string;
}

interface Driver {
    _id: string;
    name: string;
    phone: string;
    vehicleNumber: string;
    isAvailable: boolean;
    vehicleType?: string;
    currentLocation?: string;
    rating?: number;
    totalDeliveries?: number;
}

interface DeliveryForm {
    subOrderId: string;
    driverId: string;
    deliveryDate: string;
    deliveryTime: string;
    estimatedDuration: number;
    deliveryNotes: string;
    priority: 'low' | 'normal' | 'high' | 'urgent';
    specialInstructions: string;
    customerContactNumber: string;
    alternateContactNumber: string;
    deliveryType: 'standard' | 'express' | 'scheduled';
    requireSignature: boolean;
    fragileItems: boolean;
    deliveryInstructions: string;
}

interface CreateDeliveryModalProps {
    isOpen: boolean;
    onClose: () => void;
    subOrder: SubOrder | null;
    onDeliveryCreated: () => void;
}

const CreateDeliveryModal: React.FC<CreateDeliveryModalProps> = ({
    isOpen,
    onClose,
    subOrder,
    onDeliveryCreated
}) => {
    const { showError, showSuccess } = useNotification();

    // State for drivers and form
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [driversLoading, setDriversLoading] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [driverSearch, setDriverSearch] = useState('');

    // Form state
    const [deliveryForm, setDeliveryForm] = useState<DeliveryForm>({
        subOrderId: '',
        driverId: '',
        deliveryDate: '',
        deliveryTime: '',
        estimatedDuration: 60,
        deliveryNotes: '',
        priority: 'normal',
        specialInstructions: '',
        customerContactNumber: '',
        alternateContactNumber: '',
        deliveryType: 'standard',
        requireSignature: false,
        fragileItems: false,
        deliveryInstructions: ''
    });

    // Initialize form when subOrder changes
    useEffect(() => {
        if (subOrder && isOpen) {
            setDeliveryForm(prev => ({
                ...prev,
                subOrderId: subOrder._id,
                deliveryDate: subOrder.scheduledAt ? new Date(subOrder.scheduledAt).toISOString().split('T')[0] : '',
                deliveryTime: subOrder.scheduledTime || '',
                estimatedDuration: subOrder.estimatedDuration || 60,
                customerContactNumber: subOrder.mainOrderId.customerId.phone || ''
            }));
            setCurrentStep(1);
        }
    }, [subOrder, isOpen]);

    // Fetch available drivers
    useEffect(() => {
        if (isOpen) {
            fetchAvailableDrivers();
        }
    }, [isOpen]);

    const fetchAvailableDrivers = async () => {
        try {
            setDriversLoading(true);
            const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
            const response = await fetch('http://localhost:5001/api/drivers?available=true', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setDrivers(data.data || []);
                }
            }
        } catch (error) {
            console.error('Error fetching drivers:', error);
        } finally {
            setDriversLoading(false);
        }
    };

    const createDelivery = async () => {
        // Validation
        if (!deliveryForm.driverId) {
            showError('Error', 'Please select a driver');
            return;
        }

        if (!deliveryForm.deliveryDate) {
            showError('Error', 'Please select a delivery date');
            return;
        }

        if (!deliveryForm.customerContactNumber) {
            showError('Error', 'Customer contact number is required');
            return;
        }

        setProcessing(true);
        try {
            const token = localStorage.getItem('accessToken') || localStorage.getItem('token');

            // Combine date and time for estimated delivery
            const estimatedDeliveryTime = deliveryForm.deliveryTime
                ? `${deliveryForm.deliveryDate}T${deliveryForm.deliveryTime}:00`
                : null;

            const response = await fetch(`http://localhost:5001/api/orders/sub-order/${deliveryForm.subOrderId}/accept-and-create-delivery`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    driverId: deliveryForm.driverId,
                    deliveryNotes: deliveryForm.deliveryNotes,
                    estimatedDeliveryTime,
                    priority: deliveryForm.priority,
                    specialInstructions: deliveryForm.specialInstructions,
                    estimatedDuration: deliveryForm.estimatedDuration,
                    customerContactNumber: deliveryForm.customerContactNumber,
                    alternateContactNumber: deliveryForm.alternateContactNumber,
                    deliveryType: deliveryForm.deliveryType,
                    requireSignature: deliveryForm.requireSignature,
                    fragileItems: deliveryForm.fragileItems,
                    deliveryInstructions: deliveryForm.deliveryInstructions
                })
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    showSuccess('Success', 'Delivery created successfully and added to calendar');
                    onDeliveryCreated();
                    handleClose();
                } else {
                    showError('Error', data.error || 'Failed to create delivery');
                }
            } else {
                showError('Error', 'Failed to create delivery');
            }
        } catch (error) {
            console.error('Error creating delivery:', error);
            showError('Error', 'Failed to create delivery');
        } finally {
            setProcessing(false);
        }
    };

    const handleClose = () => {
        setCurrentStep(1);
        setDeliveryForm({
            subOrderId: '',
            driverId: '',
            deliveryDate: '',
            deliveryTime: '',
            estimatedDuration: 60,
            deliveryNotes: '',
            priority: 'normal',
            specialInstructions: '',
            customerContactNumber: '',
            alternateContactNumber: '',
            deliveryType: 'standard',
            requireSignature: false,
            fragileItems: false,
            deliveryInstructions: ''
        });
        setDriverSearch('');
        onClose();
    };

    const nextStep = () => {
        if (currentStep < 3) {
            setCurrentStep(currentStep + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    // Filter drivers based on search
    const filteredDrivers = drivers.filter(driver =>
        driver.name.toLowerCase().includes(driverSearch.toLowerCase()) ||
        driver.vehicleNumber.toLowerCase().includes(driverSearch.toLowerCase()) ||
        driver.phone.includes(driverSearch)
    );

    const selectedDriver = drivers.find(driver => driver._id === deliveryForm.driverId);

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
            case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'normal': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'low': return 'bg-gray-100 text-gray-800 border-gray-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    if (!isOpen || !subOrder) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-screen overflow-y-auto">
                {/* Header */}
                <div className="p-6 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Create Delivery</h2>
                            <p className="text-gray-600">Create a new delivery from sub-order {subOrder.subOrderNumber}</p>
                        </div>
                        <button
                            onClick={handleClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X className="h-6 w-6" />
                        </button>
                    </div>

                    {/* Progress Steps */}
                    <div className="mt-6">
                        <div className="flex items-center">
                            {[1, 2, 3].map((step) => (
                                <React.Fragment key={step}>
                                    <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${step <= currentStep
                                            ? 'bg-blue-500 text-white'
                                            : 'bg-gray-200 text-gray-600'
                                        }`}>
                                        {step}
                                    </div>
                                    {step < 3 && (
                                        <div className={`flex-1 h-1 mx-2 ${step < currentStep ? 'bg-blue-500' : 'bg-gray-200'
                                            }`} />
                                    )}
                                </React.Fragment>
                            ))}
                        </div>
                        <div className="flex justify-between mt-2 text-sm text-gray-600">
                            <span>Sub-Order Details</span>
                            <span>Driver & Schedule</span>
                            <span>Delivery Options</span>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    {/* Step 1: Sub-Order Details */}
                    {currentStep === 1 && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Sub-Order Information</h3>

                                {/* Sub-Order Summary */}
                                <div className="bg-gray-50 rounded-lg p-6 mb-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <h4 className="font-medium text-gray-900 mb-3">Order Details</h4>
                                            <div className="space-y-2 text-sm">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Sub-Order:</span>
                                                    <span className="font-medium">{subOrder.subOrderNumber}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Main Order:</span>
                                                    <span className="font-medium">{subOrder.mainOrderId.orderNumber}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Category:</span>
                                                    <span className="font-medium">{subOrder.materialCategory}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Total Amount:</span>
                                                    <span className="font-medium">Rs. {subOrder.totalAmount.toFixed(2)}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <h4 className="font-medium text-gray-900 mb-3">Customer Details</h4>
                                            <div className="space-y-2 text-sm">
                                                <div className="flex items-center gap-2">
                                                    <User className="h-4 w-4 text-gray-500" />
                                                    <span>{subOrder.mainOrderId.customerId.username}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Phone className="h-4 w-4 text-gray-500" />
                                                    <span>{subOrder.mainOrderId.customerId.phone || 'N/A'}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="h-4 w-4 text-gray-500" />
                                                    <span>{subOrder.mainOrderId.customerId.address || 'N/A'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Items Table */}
                                <div>
                                    <h4 className="font-medium text-gray-900 mb-3">Items to Deliver</h4>
                                    <div className="overflow-x-auto border border-gray-200 rounded-lg">
                                        <table className="w-full">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="text-left p-3 font-medium text-gray-900">Material</th>
                                                    <th className="text-center p-3 font-medium text-gray-900">Quantity</th>
                                                    <th className="text-right p-3 font-medium text-gray-900">Unit Price</th>
                                                    <th className="text-right p-3 font-medium text-gray-900">Total</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {subOrder.items.map((item, index) => (
                                                    <tr key={index} className="border-t border-gray-200">
                                                        <td className="p-3">{item.materialName}</td>
                                                        <td className="text-center p-3">{item.qty}</td>
                                                        <td className="text-right p-3">Rs. {item.unitPrice.toFixed(2)}</td>
                                                        <td className="text-right p-3 font-medium">Rs. {item.totalPrice.toFixed(2)}</td>
                                                    </tr>
                                                ))}
                                                <tr className="border-t bg-gray-50">
                                                    <td colSpan={3} className="p-3 font-medium text-right">Total Amount:</td>
                                                    <td className="p-3 font-bold text-right">Rs. {subOrder.totalAmount.toFixed(2)}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Customer Contact Information */}
                                <div>
                                    <h4 className="font-medium text-gray-900 mb-3">Contact Information</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Primary Contact Number *
                                            </label>
                                            <input
                                                type="tel"
                                                value={deliveryForm.customerContactNumber}
                                                onChange={(e) => setDeliveryForm({ ...deliveryForm, customerContactNumber: e.target.value })}
                                                placeholder="Customer's primary phone number"
                                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Alternate Contact Number
                                            </label>
                                            <input
                                                type="tel"
                                                value={deliveryForm.alternateContactNumber}
                                                onChange={(e) => setDeliveryForm({ ...deliveryForm, alternateContactNumber: e.target.value })}
                                                placeholder="Alternate contact (optional)"
                                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Driver & Schedule */}
                    {currentStep === 2 && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Driver Selection & Schedule</h3>

                                {/* Driver Search */}
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Search and Select Driver *
                                    </label>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <input
                                            type="text"
                                            value={driverSearch}
                                            onChange={(e) => setDriverSearch(e.target.value)}
                                            placeholder="Search by name, vehicle number, or phone..."
                                            className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                {/* Available Drivers */}
                                <div className="mb-6">
                                    <h4 className="font-medium text-gray-900 mb-3">Available Drivers</h4>
                                    {driversLoading ? (
                                        <div className="text-center py-8">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                                            <p className="text-gray-500 mt-2">Loading drivers...</p>
                                        </div>
                                    ) : filteredDrivers.length === 0 ? (
                                        <div className="text-center py-8 bg-gray-50 rounded-lg">
                                            <Truck className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                                            <p className="text-gray-500">No available drivers found</p>
                                            <p className="text-gray-400 text-sm">Try adjusting your search criteria</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-60 overflow-y-auto">
                                            {filteredDrivers.map((driver) => (
                                                <div
                                                    key={driver._id}
                                                    onClick={() => setDeliveryForm({ ...deliveryForm, driverId: driver._id })}
                                                    className={`p-4 border rounded-lg cursor-pointer transition-all ${deliveryForm.driverId === driver._id
                                                            ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                                                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                                        }`}
                                                >
                                                    <div className="flex items-center justify-between mb-2">
                                                        <h5 className="font-medium text-gray-900">{driver.name}</h5>
                                                        {driver.rating && (
                                                            <div className="flex items-center gap-1">
                                                                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                                                                <span className="text-sm text-gray-600">{driver.rating}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="space-y-1 text-sm text-gray-600">
                                                        <div className="flex items-center gap-2">
                                                            <Truck className="h-3 w-3" />
                                                            <span>{driver.vehicleNumber}</span>
                                                            {driver.vehicleType && (
                                                                <span className="text-gray-400">({driver.vehicleType})</span>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Phone className="h-3 w-3" />
                                                            <span>{driver.phone}</span>
                                                        </div>
                                                        {driver.totalDeliveries && (
                                                            <div className="flex items-center gap-2">
                                                                <Package className="h-3 w-3" />
                                                                <span>{driver.totalDeliveries} deliveries</span>
                                                            </div>
                                                        )}
                                                        {driver.currentLocation && (
                                                            <div className="flex items-center gap-2">
                                                                <Navigation className="h-3 w-3" />
                                                                <span className="text-xs">{driver.currentLocation}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Selected Driver Display */}
                                {selectedDriver && (
                                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                                        <h4 className="font-medium text-green-900 mb-2">Selected Driver</h4>
                                        <div className="flex items-center gap-4">
                                            <div className="flex-1">
                                                <p className="font-medium text-green-900">{selectedDriver.name}</p>
                                                <p className="text-green-700 text-sm">{selectedDriver.vehicleNumber} • {selectedDriver.phone}</p>
                                            </div>
                                            {selectedDriver.rating && (
                                                <div className="flex items-center gap-1">
                                                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                                                    <span className="text-sm text-green-700">{selectedDriver.rating}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Schedule Information */}
                                <div>
                                    <h4 className="font-medium text-gray-900 mb-3">Schedule Information</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Delivery Date *
                                            </label>
                                            <input
                                                type="date"
                                                value={deliveryForm.deliveryDate}
                                                onChange={(e) => setDeliveryForm({ ...deliveryForm, deliveryDate: e.target.value })}
                                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                required
                                                min={new Date().toISOString().split('T')[0]}
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Delivery Time
                                            </label>
                                            <input
                                                type="time"
                                                value={deliveryForm.deliveryTime}
                                                onChange={(e) => setDeliveryForm({ ...deliveryForm, deliveryTime: e.target.value })}
                                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Duration (minutes)
                                            </label>
                                            <input
                                                type="number"
                                                value={deliveryForm.estimatedDuration}
                                                onChange={(e) => setDeliveryForm({ ...deliveryForm, estimatedDuration: parseInt(e.target.value) || 60 })}
                                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                min="15"
                                                max="480"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Priority Selection */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-3">
                                        Delivery Priority
                                    </label>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        {(['low', 'normal', 'high', 'urgent'] as const).map((priority) => (
                                            <button
                                                key={priority}
                                                type="button"
                                                onClick={() => setDeliveryForm({ ...deliveryForm, priority })}
                                                className={`p-3 rounded-lg border text-sm font-medium transition-all ${deliveryForm.priority === priority
                                                        ? getPriorityColor(priority)
                                                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                                                    }`}
                                            >
                                                {priority.charAt(0).toUpperCase() + priority.slice(1)}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Delivery Options */}
                    {currentStep === 3 && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Delivery Options & Instructions</h3>

                                {/* Delivery Type */}
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-3">
                                        Delivery Type
                                    </label>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        {([
                                            { value: 'standard', label: 'Standard', desc: 'Regular delivery service' },
                                            { value: 'express', label: 'Express', desc: 'Priority fast delivery' },
                                            { value: 'scheduled', label: 'Scheduled', desc: 'Specific time slot' }
                                        ] as const).map((type) => (
                                            <button
                                                key={type.value}
                                                type="button"
                                                onClick={() => setDeliveryForm({ ...deliveryForm, deliveryType: type.value })}
                                                className={`p-4 rounded-lg border text-left transition-all ${deliveryForm.deliveryType === type.value
                                                        ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                                                        : 'border-gray-300 hover:bg-gray-50'
                                                    }`}
                                            >
                                                <div className="font-medium text-gray-900">{type.label}</div>
                                                <div className="text-sm text-gray-600">{type.desc}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Special Options */}
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-3">
                                        Special Handling Options
                                    </label>
                                    <div className="space-y-3">
                                        <label className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg hover:bg-gray-50">
                                            <input
                                                type="checkbox"
                                                checked={deliveryForm.requireSignature}
                                                onChange={(e) => setDeliveryForm({ ...deliveryForm, requireSignature: e.target.checked })}
                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                            />
                                            <div>
                                                <div className="font-medium text-gray-900">Signature Required</div>
                                                <div className="text-sm text-gray-600">Delivery requires customer signature</div>
                                            </div>
                                        </label>

                                        <label className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg hover:bg-gray-50">
                                            <input
                                                type="checkbox"
                                                checked={deliveryForm.fragileItems}
                                                onChange={(e) => setDeliveryForm({ ...deliveryForm, fragileItems: e.target.checked })}
                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                            />
                                            <div>
                                                <div className="font-medium text-gray-900">Fragile Items</div>
                                                <div className="text-sm text-gray-600">Contains fragile or breakable items</div>
                                            </div>
                                        </label>
                                    </div>
                                </div>

                                {/* Notes and Instructions */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Delivery Notes
                                        </label>
                                        <textarea
                                            value={deliveryForm.deliveryNotes}
                                            onChange={(e) => setDeliveryForm({ ...deliveryForm, deliveryNotes: e.target.value })}
                                            placeholder="Internal notes for warehouse and driver..."
                                            rows={3}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Special Instructions
                                        </label>
                                        <textarea
                                            value={deliveryForm.specialInstructions}
                                            onChange={(e) => setDeliveryForm({ ...deliveryForm, specialInstructions: e.target.value })}
                                            placeholder="Special handling or delivery requirements..."
                                            rows={2}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Customer Delivery Instructions
                                        </label>
                                        <textarea
                                            value={deliveryForm.deliveryInstructions}
                                            onChange={(e) => setDeliveryForm({ ...deliveryForm, deliveryInstructions: e.target.value })}
                                            placeholder="Instructions for the customer (building access, location details, etc.)..."
                                            rows={2}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                {/* Delivery Summary */}
                                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                    <h4 className="font-medium text-blue-900 mb-3">Delivery Summary</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <div className="flex justify-between mb-1">
                                                <span className="text-blue-700">Driver:</span>
                                                <span className="font-medium text-blue-900">
                                                    {selectedDriver?.name || 'Not selected'}
                                                </span>
                                            </div>
                                            <div className="flex justify-between mb-1">
                                                <span className="text-blue-700">Date:</span>
                                                <span className="font-medium text-blue-900">
                                                    {deliveryForm.deliveryDate ? new Date(deliveryForm.deliveryDate).toLocaleDateString() : 'Not set'}
                                                </span>
                                            </div>
                                            <div className="flex justify-between mb-1">
                                                <span className="text-blue-700">Time:</span>
                                                <span className="font-medium text-blue-900">
                                                    {deliveryForm.deliveryTime || 'Not set'}
                                                </span>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex justify-between mb-1">
                                                <span className="text-blue-700">Priority:</span>
                                                <span className="font-medium text-blue-900 capitalize">
                                                    {deliveryForm.priority}
                                                </span>
                                            </div>
                                            <div className="flex justify-between mb-1">
                                                <span className="text-blue-700">Type:</span>
                                                <span className="font-medium text-blue-900 capitalize">
                                                    {deliveryForm.deliveryType}
                                                </span>
                                            </div>
                                            <div className="flex justify-between mb-1">
                                                <span className="text-blue-700">Duration:</span>
                                                <span className="font-medium text-blue-900">
                                                    {deliveryForm.estimatedDuration} minutes
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-gray-200 bg-gray-50">
                    <div className="flex justify-between items-center">
                        <div className="flex gap-2">
                            {currentStep > 1 && (
                                <button
                                    onClick={prevStep}
                                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                    disabled={processing}
                                >
                                    Previous
                                </button>
                            )}
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={handleClose}
                                className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                disabled={processing}
                            >
                                Cancel
                            </button>

                            {currentStep < 3 ? (
                                <button
                                    onClick={nextStep}
                                    disabled={
                                        (currentStep === 1 && !deliveryForm.customerContactNumber) ||
                                        (currentStep === 2 && (!deliveryForm.driverId || !deliveryForm.deliveryDate))
                                    }
                                    className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Next
                                </button>
                            ) : (
                                <button
                                    onClick={createDelivery}
                                    disabled={processing || !deliveryForm.driverId || !deliveryForm.deliveryDate || !deliveryForm.customerContactNumber}
                                    className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                                >
                                    {processing ? (
                                        <>
                                            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                                            Creating Delivery...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="h-4 w-4" />
                                            Create Delivery
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateDeliveryModal;
