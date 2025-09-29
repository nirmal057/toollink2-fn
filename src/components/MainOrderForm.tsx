import React, { useState, useEffect } from 'react';
import {
    Package,
    User,
    MapPin,
    Plus,
    Trash2,
    CheckCircle,
    AlertTriangle,
    Info,
    Clock,
    Truck,
    Wrench,
    Hammer,
    Zap,
    Home,
    Car,
    Palette,
    Shield,
    Settings,
    ChevronDown,
    ChevronRight,
    Search,
    Filter,
    Tag,
    Building2,
    Warehouse
} from 'lucide-react';
import { useNotification } from '../contexts/NotificationContext';
// Simple UI components - replace with your actual UI library imports
const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) =>
    <div className={`bg-white rounded-lg border shadow-sm ${className}`}>{children}</div>;

const CardHeader = ({ children }: { children: React.ReactNode }) =>
    <div className="p-6 pb-2">{children}</div>;

const CardTitle = ({ children, className = '' }: { children: React.ReactNode; className?: string }) =>
    <h3 className={`text-lg font-semibold ${className}`}>{children}</h3>;

const CardContent = ({ children, className = '' }: { children: React.ReactNode; className?: string }) =>
    <div className={`p-6 pt-2 ${className}`}>{children}</div>;

const Button = ({ children, type = 'button', variant = 'default', size = 'default', disabled = false, onClick, className = '' }: {
    children: React.ReactNode;
    type?: 'button' | 'submit';
    variant?: 'default' | 'outline' | 'destructive';
    size?: 'default' | 'sm';
    disabled?: boolean;
    onClick?: () => void;
    className?: string;
}) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
    const variants = {
        default: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
        outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-blue-500',
        destructive: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
    };
    const sizes = {
        default: 'px-4 py-2 text-sm',
        sm: 'px-3 py-1.5 text-xs'
    };

    return (
        <button
            type={type}
            disabled={disabled}
            onClick={onClick}
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
        >
            {children}
        </button>
    );
};

const Input = ({ type = 'text', value, onChange, placeholder, required = false, min, id, className = '' }: {
    type?: string;
    value?: string | number;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    required?: boolean;
    min?: string;
    id?: string;
    className?: string;
}) => (
    <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        min={min}
        id={id}
        className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${className}`}
    />
);

const Textarea = ({ value, onChange, placeholder, rows = 3, id, className = '' }: {
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    placeholder?: string;
    rows?: number;
    id?: string;
    className?: string;
}) => (
    <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        id={id}
        className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${className}`}
    />
);

const Select = ({ value, onValueChange, children }: {
    value?: string;
    onValueChange?: (value: string) => void;
    children: React.ReactNode;
}) => {
    return (
        <select
            value={value}
            onChange={(e) => onValueChange?.(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
            {children}
        </select>
    );
};

const SelectTrigger = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => <div className={className}>{children}</div>;
const SelectValue = ({ placeholder }: { placeholder?: string }) =>
    <option value="" disabled>{placeholder}</option>;
const SelectContent = ({ children }: { children: React.ReactNode }) => <>{children}</>;
const SelectItem = ({ value, children }: { value: string; children: React.ReactNode }) =>
    <option value={value}>{children}</option>;

const Label = ({ htmlFor, children, className = '' }: { htmlFor?: string; children: React.ReactNode; className?: string }) => (
    <label htmlFor={htmlFor} className={`block text-sm font-medium text-gray-700 mb-1 ${className}`}>
        {children}
    </label>
);

const Alert = ({ variant = 'default', children }: { variant?: 'default' | 'destructive'; children: React.ReactNode }) => {
    const variants = {
        default: 'bg-blue-50 border-blue-200 text-blue-800',
        destructive: 'bg-red-50 border-red-200 text-red-800'
    };
    return (
        <div className={`p-4 border rounded-md ${variants[variant]}`}>
            {children}
        </div>
    );
};

const AlertDescription = ({ children }: { children: React.ReactNode }) => (
    <div className="text-sm">{children}</div>
);

interface Material {
    _id: string;
    name: string;
    category: string;
    unit: string;
    sku: string;
    currentStock?: number;
    isActive?: boolean;
}



interface OrderItem {
    materialId: string;
    requestedQty: number;
}

interface CategoryOrder {
    category: string;
    items: OrderItem[];
    isExpanded: boolean;
}

interface DeliveryAddress {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    phone?: string;
    instructions?: string;
}

interface MainOrderFormData {
    categoryOrders: CategoryOrder[];
    deliveryAddress: DeliveryAddress;
    requestedDeliveryDate: string;
    notes: string;
    customerEmail?: string;
    customerName?: string;
}

interface MainOrderFormProps {
    user: {
        id: string;
        name: string;
        email: string;
        role: string;
    };
    onOrderCreated?: (mainOrder: any, subOrders: any[]) => void;
    onClose?: () => void;
}

const MainOrderForm: React.FC<MainOrderFormProps> = ({ user, onOrderCreated, onClose }) => {
    const { showError, showSuccess, showInfo } = useNotification();
    const [materials, setMaterials] = useState<Material[]>([]);

    const [loading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState<MainOrderFormData>({
        categoryOrders: [],
        deliveryAddress: {
            street: '',
            city: '',
            state: '',
            zipCode: '',
            phone: '',
            instructions: ''
        },
        requestedDeliveryDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Tomorrow
        notes: '',
        customerEmail: user.role === 'customer' ? user.email : '',
        customerName: user.role === 'customer' ? user.name : ''
    });

    const [orderPreview, setOrderPreview] = useState<any>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');

    // Category icon and color mapping
    const getCategoryIcon = (category: string) => {
        const iconMap: { [key: string]: any } = {
            'construction': Hammer,
            'electrical': Zap,
            'plumbing': Wrench,
            'paint': Palette,
            'hardware': Settings,
            'safety': Shield,
            'automotive': Car,
            'home': Home,
            'building': Building2,
            'tools': Wrench,
            'default': Package
        };

        const categoryLower = category.toLowerCase();
        for (const [key, icon] of Object.entries(iconMap)) {
            if (categoryLower.includes(key)) return icon;
        }
        return iconMap.default;
    };

    const getCategoryColor = (category: string) => {
        const colorMap: { [key: string]: string } = {
            'construction': 'bg-orange-500',
            'electrical': 'bg-yellow-500',
            'plumbing': 'bg-blue-500',
            'paint': 'bg-purple-500',
            'hardware': 'bg-gray-500',
            'safety': 'bg-red-500',
            'automotive': 'bg-green-500',
            'home': 'bg-pink-500',
            'building': 'bg-indigo-500',
            'tools': 'bg-teal-500',
            'default': 'bg-blue-500'
        };

        const categoryLower = category.toLowerCase();
        for (const [key, color] of Object.entries(colorMap)) {
            if (categoryLower.includes(key)) return color;
        }
        return colorMap.default;
    };

    useEffect(() => {
        loadMaterials();
    }, []);

    // Auto-generate preview when form data changes
    useEffect(() => {
        const validItems = getAllItems().filter((item: OrderItem) => item.materialId && item.requestedQty > 0);
        if (validItems.length > 0 && materials.length > 0) {
            generateOrderPreview();
        }
    }, [formData.categoryOrders, formData.requestedDeliveryDate, materials]);

    const loadMaterials = async () => {
        try {
            const response = await fetch('/api/materials', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const data = await response.json();
            if (data.success) {
                setMaterials(data.data);
            }
        } catch (error) {
            console.error('Failed to load materials:', error);
            setError('Failed to load materials');
        }
    };



    const handleAddCategory = (category: string) => {
        const existingCategory = formData.categoryOrders.find(co => co.category === category);
        if (!existingCategory) {
            setFormData(prev => ({
                ...prev,
                categoryOrders: [...prev.categoryOrders, {
                    category,
                    items: [{ materialId: '', requestedQty: 1 }],
                    isExpanded: true
                }]
            }));
            showInfo('Category Added', `${category} category added to your order. Add materials to this category.`);
        } else {
            // Just expand the existing category
            setFormData(prev => ({
                ...prev,
                categoryOrders: prev.categoryOrders.map(co =>
                    co.category === category ? { ...co, isExpanded: true } : co
                )
            }));
        }
    };

    const handleRemoveCategory = (category: string) => {
        setFormData(prev => ({
            ...prev,
            categoryOrders: prev.categoryOrders.filter(co => co.category !== category)
        }));
    };

    const handleAddItemToCategory = (category: string) => {
        setFormData(prev => ({
            ...prev,
            categoryOrders: prev.categoryOrders.map(co =>
                co.category === category ? {
                    ...co,
                    items: [...co.items, { materialId: '', requestedQty: 1 }]
                } : co
            )
        }));
    };

    const handleRemoveItemFromCategory = (category: string, itemIndex: number) => {
        setFormData(prev => ({
            ...prev,
            categoryOrders: prev.categoryOrders.map(co =>
                co.category === category ? {
                    ...co,
                    items: co.items.length > 1 ? co.items.filter((_, i) => i !== itemIndex) : co.items
                } : co
            )
        }));
    };

    const handleCategoryItemChange = (category: string, itemIndex: number, field: keyof OrderItem, value: string | number) => {
        setFormData(prev => ({
            ...prev,
            categoryOrders: prev.categoryOrders.map(co =>
                co.category === category ? {
                    ...co,
                    items: co.items.map((item, i) =>
                        i === itemIndex ? { ...item, [field]: value } : item
                    )
                } : co
            )
        }));
        // Auto-generate preview when items change
        setTimeout(generateOrderPreview, 100);
    };

    const toggleCategoryExpansion = (category: string) => {
        setFormData(prev => ({
            ...prev,
            categoryOrders: prev.categoryOrders.map(co =>
                co.category === category ? { ...co, isExpanded: !co.isExpanded } : co
            )
        }));
    };

    const handleAddressChange = (field: keyof DeliveryAddress, value: string) => {
        setFormData(prev => ({
            ...prev,
            deliveryAddress: { ...prev.deliveryAddress, [field]: value }
        }));
    };

    // Order management system - no pricing calculations needed
    const calculateItemCount = () => {
        return formData.categoryOrders.reduce((total, categoryOrder) => {
            return total + categoryOrder.items.filter(item => item.materialId).length;
        }, 0);
    };

    const getAllItems = () => {
        return formData.categoryOrders.flatMap(co => co.items);
    };

    const generateOrderPreview = () => {
        // Only generate preview if we have valid items
        const validItems = getAllItems().filter(item => item.materialId && item.requestedQty > 0);
        if (validItems.length === 0) {
            setOrderPreview(null);
            return;
        }

        const groupedItems = new Map<string, { materials: any[], warehouse?: string, warehouseLocation?: string }>();

        validItems.forEach(item => {
            const material = materials.find(m => m._id === item.materialId);

            if (material) {
                const key = material.category;

                if (!groupedItems.has(key)) {
                    groupedItems.set(key, {
                        materials: [],
                        warehouse: 'Best Available Warehouse',
                        warehouseLocation: 'Optimally selected for fast delivery'
                    });
                }

                groupedItems.get(key)?.materials.push({
                    ...material,
                    requestedQty: item.requestedQty
                });
            }
        });

        const preview = Array.from(groupedItems.entries()).map(([key, group], index) => {
            const [category] = key.split('-');
            const totalItems = group.materials.reduce((sum, m) => sum + m.requestedQty, 0);

            // Calculate delivery sequence based on material priority
            const categoryPriority = {
                'Cement': 1,
                'Steel & Reinforcement': 2,
                'Aggregates': 3,
                'Bricks & Blocks': 4,
                'Roofing Materials': 5,
                'Electrical': 6,
                'Plumbing': 7,
                'Paint & Chemicals': 8,
                'Wood & Lumber': 9,
                'Insulation': 10,
                'Hardware & Fasteners': 11,
                'Other': 12
            };

            const priority = categoryPriority[category as keyof typeof categoryPriority] || 12;
            const baseDeliveryDate = new Date(formData.requestedDeliveryDate || Date.now());
            const deliveryDate = new Date(baseDeliveryDate.getTime() + (priority - 1) * 2 * 60 * 60 * 1000); // 2 hour intervals

            return {
                deliveryNumber: index + 1,
                category,
                warehouse: group.warehouse,
                warehouseLocation: group.warehouseLocation,
                materials: group.materials,

                totalItems,
                estimatedDate: deliveryDate.toLocaleDateString(),
                estimatedTime: deliveryDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                priority,
                estimatedDuration: Math.max(30, totalItems * 5) // 5 minutes per item, minimum 30 minutes
            };
        }).sort((a, b) => a.priority - b.priority); // Sort by delivery priority

        setOrderPreview(preview);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);

        try {
            // Validate form
            const allItems = getAllItems();
            if (allItems.length === 0 || allItems.some(item => !item.materialId || item.requestedQty < 1)) {
                throw new Error('Please select materials and specify quantities for all items');
            }

            if (!formData.deliveryAddress.street || !formData.deliveryAddress.city || !formData.deliveryAddress.zipCode) {
                throw new Error('Please fill in all required delivery address fields');
            }

            if (user.role !== 'customer' && (!formData.customerEmail || !formData.customerName)) {
                throw new Error('Please specify customer details');
            }

            const payload = {
                items: getAllItems(),
                deliveryAddress: formData.deliveryAddress,
                requestedDeliveryDate: formData.requestedDeliveryDate,
                notes: formData.notes,
                customerEmail: formData.customerEmail,
                customerName: formData.customerName
            };

            const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
            const response = await fetch('http://localhost:5001/api/orders/main-order', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (result.success) {
                setSuccess(true);
                const { mainOrder, subOrders } = result.data;

                // Show success notification with role-specific details
                if (user.role === 'customer') {
                    showSuccess(
                        'Order Submitted Successfully!',
                        `Your order #${mainOrder.orderNumber} has been submitted for approval. You will be notified once it's approved by our team.`
                    );
                } else {
                    showSuccess(
                        'Order Created Successfully!',
                        `Main order ${mainOrder.orderNumber} has been approved and split into ${subOrders.length} delivery batches. Warehouses have been notified.`
                    );
                }

                if (onOrderCreated) {
                    onOrderCreated(mainOrder, subOrders);
                }

                // Reset form after success
                setTimeout(() => {
                    if (onClose) onClose();
                }, 3000);
            } else {
                throw new Error(result.error || 'Failed to create order');
            }

        } catch (error: any) {
            const errorMessage = error.message || 'Failed to create main order';
            setError(errorMessage);
            showError('Order Creation Failed', errorMessage);
        } finally {
            setSubmitting(false);
        }
    };

    const getMaterialsByCategory = (category: string) => {
        return materials.filter(m => m.category === category && m.isActive !== false);
    };

    const getAvailableCategories = () => {
        const categories = [...new Set(materials.filter(m => m.isActive !== false).map(m => m.category))];
        return categories.sort();
    };

    if (success) {
        return (
            <Card className="max-w-2xl mx-auto">
                <CardContent className="p-8 text-center">
                    <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
                    <h3 className="text-2xl font-bold text-green-800 mb-3">
                        Order Created Successfully!
                    </h3>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6 text-left">
                        <h4 className="font-semibold text-green-800 mb-3 text-center">What happens next?</h4>
                        <div className="space-y-3 text-green-700">
                            <div className="flex items-start gap-3">
                                <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">1</div>
                                <p>Your order has been automatically split by material category and warehouse for optimal delivery</p>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">2</div>
                                <p>Relevant warehouse managers have been notified about their materials</p>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">3</div>
                                <p>You'll receive email confirmation with detailed delivery schedule</p>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">4</div>
                                <p>Track each delivery separately through your dashboard</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-3 justify-center">
                        <Button variant="outline" onClick={() => window.location.href = '/orders'}>
                            View Orders
                        </Button>
                        <Button onClick={onClose}>
                            Continue
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Package className="w-5 h-5" />
                        Create Main Order with Auto-Splitting
                    </CardTitle>
                    <p className="text-sm text-gray-600">
                        Your order will be automatically split by material category and warehouse for optimized delivery scheduling.
                    </p>
                </CardHeader>
            </Card>

            {/* Approval Process Information for Customers */}
            {user.role === 'customer' && (
                <Alert variant="default">
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                        <strong>Order Approval Process:</strong> Your order will be submitted for approval by our team.
                        You'll receive a notification and email confirmation once it's approved. Orders are typically reviewed within 2-4 hours during business hours.
                    </AlertDescription>
                </Alert>
            )}

            {error && (
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Customer Information (for non-customers) */}
                {user.role !== 'customer' && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="w-5 h-5" />
                                Customer Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="customerName">Customer Name *</Label>
                                    <Input
                                        id="customerName"
                                        required
                                        value={formData.customerName}
                                        onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                                        placeholder="Full customer name"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="customerEmail">Customer Email *</Label>
                                    <Input
                                        id="customerEmail"
                                        type="email"
                                        required
                                        value={formData.customerEmail}
                                        onChange={(e) => setFormData(prev => ({ ...prev, customerEmail: e.target.value }))}
                                        placeholder="customer@email.com"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Enhanced Material Selection Interface */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-xl">
                            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                                <Package className="w-6 h-6 text-white" />
                            </div>
                            Create New Order
                        </CardTitle>
                        <p className="text-gray-600 mt-2">
                            Fill in the details to create a new order - Browse materials by category for easy identification
                        </p>
                    </CardHeader>
                    <CardContent className="space-y-8">

                        {/* Search and Filter Section */}
                        <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-6 rounded-xl border">
                            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
                                <div className="flex-1">
                                    <Label className="text-sm font-medium text-gray-700 mb-2 block">Search Materials</Label>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                        <Input
                                            className="pl-10 bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                                            placeholder="Search by material name, SKU, or category..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="min-w-[200px]">
                                    <Label className="text-sm font-medium text-gray-700 mb-2 block">Filter by Category</Label>
                                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                        <SelectTrigger className="bg-white border-gray-200 focus:border-blue-500">
                                            <Filter className="w-4 h-4 mr-2 text-gray-400" />
                                            <SelectValue placeholder="All Categories" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Categories</SelectItem>
                                            {getAvailableCategories().map(category => (
                                                <SelectItem key={category} value={category}>
                                                    {category}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        {/* Category Grid Selection */}
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                    <Tag className="w-5 h-5" />
                                    Material Categories
                                </h3>
                                <span className="text-sm text-gray-500">
                                    {formData.categoryOrders.length} categories selected
                                </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {getAvailableCategories()
                                    .filter(category =>
                                        selectedCategory === 'all' || selectedCategory === category
                                    )
                                    .filter(category =>
                                        searchTerm === '' ||
                                        category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                        getMaterialsByCategory(category).some(material =>
                                            material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                            material.sku.toLowerCase().includes(searchTerm.toLowerCase())
                                        )
                                    )
                                    .map(category => {
                                        const Icon = getCategoryIcon(category);
                                        const colorClass = getCategoryColor(category);
                                        const isAdded = formData.categoryOrders.some(co => co.category === category);
                                        const materialsInCategory = getMaterialsByCategory(category);
                                        const filteredMaterials = searchTerm ?
                                            materialsInCategory.filter(material =>
                                                material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                                material.sku.toLowerCase().includes(searchTerm.toLowerCase())
                                            ) : materialsInCategory;

                                        return (
                                            <div
                                                key={category}
                                                className={`relative border-2 rounded-xl p-6 cursor-pointer transition-all duration-200 hover:shadow-lg ${isAdded
                                                    ? 'border-green-500 bg-green-50 shadow-md'
                                                    : 'border-gray-200 bg-white hover:border-blue-300'
                                                    }`}
                                                onClick={() => handleAddCategory(category)}
                                            >
                                                {/* Category Header */}
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`p-3 ${colorClass} rounded-lg shadow-sm`}>
                                                            <Icon className="w-6 h-6 text-white" />
                                                        </div>
                                                        <div>
                                                            <h4 className="font-semibold text-gray-800">{category}</h4>
                                                            <p className="text-xs text-gray-500">
                                                                {filteredMaterials.length} materials available
                                                            </p>
                                                        </div>
                                                    </div>
                                                    {isAdded && (
                                                        <CheckCircle className="w-6 h-6 text-green-500" />
                                                    )}
                                                </div>

                                                {/* Material Preview */}
                                                <div className="space-y-2">
                                                    <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                                                        Materials Preview
                                                    </p>
                                                    <div className="space-y-1 max-h-24 overflow-hidden">
                                                        {filteredMaterials.slice(0, 3).map(material => (
                                                            <div key={material._id} className="flex items-center justify-between text-xs bg-gray-50 p-2 rounded border">
                                                                <span className="font-medium text-gray-700 truncate">
                                                                    {material.name}
                                                                </span>
                                                                <span className="text-blue-600 font-semibold ml-2">
                                                                    {material.unit}
                                                                </span>
                                                            </div>
                                                        ))}
                                                        {filteredMaterials.length > 3 && (
                                                            <p className="text-xs text-gray-500 italic">
                                                                +{filteredMaterials.length - 3} more materials...
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Warehouse Info */}
                                                <div className="mt-4 pt-3 border-t border-gray-200">
                                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                                        <Warehouse className="w-3 h-3" />
                                                        <span>Available across all warehouses</span>
                                                    </div>
                                                </div>

                                                {/* Add/Remove Button */}
                                                <div className="absolute top-3 right-3">
                                                    {isAdded ? (
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleRemoveCategory(category)}
                                                            className="text-xs bg-white border-red-200 text-red-600 hover:bg-red-50"
                                                        >
                                                            <Trash2 className="w-3 h-3" />
                                                        </Button>
                                                    ) : (
                                                        <div className="w-8 h-8 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                                                            <Plus className="w-4 h-4 text-gray-400" />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                            </div>
                        </div>

                        {/* Selected Categories - Order Management */}
                        {formData.categoryOrders.length === 0 && (
                            <div className="text-center py-16 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl border-2 border-dashed border-blue-200">
                                <div className="max-w-md mx-auto">
                                    <div className="p-4 bg-white rounded-full shadow-lg mx-auto w-fit mb-6">
                                        <Package className="w-12 h-12 text-blue-500" />
                                    </div>
                                    <h4 className="text-xl font-bold text-gray-800 mb-3">Ready to Build Your Order?</h4>
                                    <p className="text-gray-600 mb-6">
                                        Select categories above to start adding materials. Our organized system makes it easy to find exactly what you need across all warehouses.
                                    </p>
                                    <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4 text-green-500" />
                                            <span>Smart categorization</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4 text-green-500" />
                                            <span>Multi-warehouse access</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {formData.categoryOrders.map((categoryOrder) => {
                            const Icon = getCategoryIcon(categoryOrder.category);
                            const colorClass = getCategoryColor(categoryOrder.category);
                            const categoryTotal = categoryOrder.items.reduce((total, item) => {
                                return total + item.requestedQty;
                            }, 0);

                            return (
                                <div key={categoryOrder.category} className="bg-white border-2 border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                                    {/* Enhanced Category Header */}
                                    <div
                                        className={`p-6 cursor-pointer transition-all duration-200 ${categoryOrder.isExpanded
                                            ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                                            : 'bg-gradient-to-r from-gray-50 to-gray-100 text-gray-800 hover:from-blue-50 hover:to-blue-100'
                                            }`}
                                        onClick={() => toggleCategoryExpansion(categoryOrder.category)}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className={`p-3 ${colorClass} rounded-xl shadow-md transition-transform ${categoryOrder.isExpanded ? 'scale-110' : ''
                                                    }`}>
                                                    <Icon className="w-6 h-6 text-white" />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-xl">{categoryOrder.category}</h3>
                                                    <div className="flex items-center gap-4 mt-1">
                                                        <span className={`text-sm ${categoryOrder.isExpanded ? 'text-blue-100' : 'text-gray-600'}`}>
                                                            {categoryOrder.items.filter(item => item.materialId).length} materials selected
                                                        </span>
                                                        {categoryTotal > 0 && (
                                                            <>
                                                                <span className={`text-sm ${categoryOrder.isExpanded ? 'text-blue-100' : 'text-gray-400'}`}>•</span>
                                                                <span className={`text-lg font-semibold ${categoryOrder.isExpanded ? 'text-blue-200' : 'text-blue-600'}`}>
                                                                    {categoryTotal} items
                                                                </span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-lg ${categoryOrder.isExpanded ? 'bg-blue-500' : 'bg-gray-200'}`}>
                                                    {categoryOrder.isExpanded ?
                                                        <ChevronDown className="w-5 h-5 text-white" /> :
                                                        <ChevronRight className="w-5 h-5 text-gray-600" />
                                                    }
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleRemoveCategory(categoryOrder.category)}
                                                    className={`${categoryOrder.isExpanded
                                                        ? 'bg-red-500 border-red-400 text-white hover:bg-red-600'
                                                        : 'bg-white border-red-200 text-red-600 hover:bg-red-50'
                                                        }`}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Enhanced Category Items */}
                                    {categoryOrder.isExpanded && (
                                        <div className="p-4 space-y-4 bg-white">
                                            {categoryOrder.items.map((item, itemIndex) => (
                                                <div key={itemIndex} className="p-4 border rounded-lg bg-gray-50 space-y-4">
                                                    <div className="flex justify-between items-center">
                                                        <h5 className="font-medium text-gray-700">Material {itemIndex + 1}</h5>
                                                        {categoryOrder.items.length > 1 && (
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handleRemoveItemFromCategory(categoryOrder.category, itemIndex)}
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        )}
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div className="space-y-2">
                                                            <Label>Select Material *</Label>
                                                            <Select
                                                                value={item.materialId}
                                                                onValueChange={(value) => handleCategoryItemChange(categoryOrder.category, itemIndex, 'materialId', value)}
                                                            >
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder={`Choose ${categoryOrder.category.toLowerCase()} material`} />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {getMaterialsByCategory(categoryOrder.category).map(material => (
                                                                        <SelectItem key={material._id} value={material._id}>
                                                                            <div className="flex flex-col">
                                                                                <span className="font-medium">{material.name}</span>
                                                                                <span className="text-xs text-gray-500">
                                                                                    Unit: {material.unit} • SKU: {material.sku}
                                                                                    {material.currentStock !== undefined &&
                                                                                        ` • Stock: ${material.currentStock}`
                                                                                    }
                                                                                </span>
                                                                            </div>
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        </div>

                                                        <div className="space-y-2">
                                                            <Label>Quantity *</Label>
                                                            <div className="flex items-center gap-2">
                                                                <Input
                                                                    type="number"
                                                                    min="1"
                                                                    value={item.requestedQty}
                                                                    onChange={(e) => handleCategoryItemChange(categoryOrder.category, itemIndex, 'requestedQty', parseInt(e.target.value) || 1)}
                                                                    placeholder="1"
                                                                    className="flex-1"
                                                                />
                                                                {(() => {
                                                                    const material = materials.find(m => m._id === item.materialId);
                                                                    return material && (
                                                                        <span className="text-sm font-medium text-blue-600 min-w-0">
                                                                            {material.unit}
                                                                        </span>
                                                                    );
                                                                })()}
                                                            </div>
                                                            {(() => {
                                                                const material = materials.find(m => m._id === item.materialId);
                                                                return material && (
                                                                    <div className="text-xs space-y-1">
                                                                        <p className="text-gray-600">
                                                                            Unit: {material.unit} • SKU: {material.sku}
                                                                        </p>
                                                                        <p className="font-medium text-blue-600">
                                                                            Quantity: {item.requestedQty} {material.unit}
                                                                        </p>
                                                                    </div>
                                                                );
                                                            })()}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}

                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => handleAddItemToCategory(categoryOrder.category)}
                                                className="w-full border-dashed"
                                            >
                                                <Plus className="w-4 h-4 mr-2" />
                                                Add Another {categoryOrder.category} Material
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                        {/* Order Summary */}
                        {formData.categoryOrders.length > 0 && (
                            <div className="p-6 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="font-semibold text-lg text-gray-800">Order Summary</h4>
                                        <p className="text-sm text-gray-600">
                                            {formData.categoryOrders.length} categories • {getAllItems().filter(item => item.materialId).length} materials
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-bold text-blue-600">
                                            {calculateItemCount()} Items
                                        </p>
                                        <p className="text-xs text-gray-500">Total Items</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Delivery Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MapPin className="w-5 h-5" />
                            Delivery Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="street">Street Address *</Label>
                                <Input
                                    id="street"
                                    required
                                    value={formData.deliveryAddress.street}
                                    onChange={(e) => handleAddressChange('street', e.target.value)}
                                    placeholder="Street address"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="city">City *</Label>
                                <Input
                                    id="city"
                                    required
                                    value={formData.deliveryAddress.city}
                                    onChange={(e) => handleAddressChange('city', e.target.value)}
                                    placeholder="City"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="state">State/Province</Label>
                                <Input
                                    id="state"
                                    value={formData.deliveryAddress.state}
                                    onChange={(e) => handleAddressChange('state', e.target.value)}
                                    placeholder="State or Province"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="zipCode">Zip Code *</Label>
                                <Input
                                    id="zipCode"
                                    required
                                    value={formData.deliveryAddress.zipCode}
                                    onChange={(e) => handleAddressChange('zipCode', e.target.value)}
                                    placeholder="Zip code"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Contact Phone</Label>
                                <Input
                                    id="phone"
                                    type="tel"
                                    value={formData.deliveryAddress.phone}
                                    onChange={(e) => handleAddressChange('phone', e.target.value)}
                                    placeholder="+94 XX XXX XXXX"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="requestedDate">Requested Delivery Date</Label>
                                <Input
                                    id="requestedDate"
                                    type="date"
                                    value={formData.requestedDeliveryDate}
                                    onChange={(e) => setFormData(prev => ({ ...prev, requestedDeliveryDate: e.target.value }))}
                                    min={new Date().toISOString().split('T')[0]}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="instructions">Delivery Instructions</Label>
                            <Textarea
                                id="instructions"
                                value={formData.deliveryAddress.instructions}
                                onChange={(e) => handleAddressChange('instructions', e.target.value)}
                                placeholder="Special delivery instructions, access codes, etc."
                                rows={3}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Notes */}
                <Card>
                    <CardHeader>
                        <CardTitle>Additional Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Textarea
                            value={formData.notes}
                            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                            placeholder="Any additional notes or special requirements..."
                            rows={3}
                        />
                    </CardContent>
                </Card>

                {/* Enhanced Order Preview */}
                {getAllItems().some((item: OrderItem) => item.materialId && item.requestedQty > 0) && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Info className="w-5 h-5 text-blue-500" />
                                Smart Order Splitting Preview
                            </CardTitle>
                            <p className="text-sm text-gray-600">
                                Your order will be intelligently split by material category and warehouse for optimal delivery scheduling.
                            </p>
                        </CardHeader>
                        <CardContent>
                            {!orderPreview && (
                                <div className="text-center py-8 bg-gray-50 rounded-lg">
                                    <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                    <p className="text-gray-600">Add materials to see delivery preview</p>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={generateOrderPreview}
                                        className="mt-3"
                                    >
                                        Generate Preview
                                    </Button>
                                </div>
                            )}

                            {orderPreview && orderPreview.length > 0 && (
                                <>
                                    <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Truck className="w-5 h-5 text-blue-600" />
                                            <h4 className="font-semibold text-blue-800">Delivery Summary</h4>
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                            <div>
                                                <p className="text-gray-600">Total Deliveries:</p>
                                                <p className="font-semibold text-blue-600">{orderPreview.length}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-600">Total Items:</p>
                                                <p className="font-semibold text-blue-600">
                                                    {orderPreview.reduce((sum: number, d: any) => sum + d.totalItems, 0)}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-gray-600">Total Categories:</p>
                                                <p className="font-semibold text-blue-600">
                                                    {formData.categoryOrders.length} categories
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-gray-600">Est. Duration:</p>
                                                <p className="font-semibold text-blue-600">
                                                    {Math.max(...orderPreview.map((d: any) => d.estimatedDuration))} min max
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        {orderPreview.map((delivery: any, index: number) => (
                                            <div key={index} className="p-5 border-2 border-gray-200 rounded-xl bg-gradient-to-r from-white to-gray-50 hover:shadow-md transition-shadow">
                                                <div className="flex justify-between items-start mb-3">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                                                                {delivery.deliveryNumber}
                                                            </div>
                                                            <h4 className="font-semibold text-lg text-gray-800">
                                                                {delivery.category} Materials
                                                            </h4>
                                                            <div className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                                                Priority {delivery.priority}
                                                            </div>
                                                        </div>

                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                                            <div>
                                                                <div className="flex items-center gap-1 text-gray-600 mb-1">
                                                                    <MapPin className="w-4 h-4" />
                                                                    <span>Source:</span>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <p className="font-medium text-green-600">Best Available Warehouse</p>
                                                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                                                </div>
                                                                <p className="text-xs text-gray-500">Automatically selected for optimal delivery</p>
                                                            </div>

                                                            <div>
                                                                <div className="flex items-center gap-1 text-gray-600 mb-1">
                                                                    <Clock className="w-4 h-4" />
                                                                    <span>Estimated Delivery:</span>
                                                                </div>
                                                                <p className="font-medium">{delivery.estimatedDate}</p>
                                                                <p className="text-xs text-gray-500">
                                                                    {delivery.estimatedTime} ({delivery.estimatedDuration} min)
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="text-right">
                                                        <p className="text-lg font-bold text-blue-600">{delivery.totalItems} items</p>
                                                        <p className="text-xs text-gray-500">from {delivery.warehouse}</p>
                                                    </div>
                                                </div>

                                                <div className="border-t pt-3 mt-3">
                                                    <h5 className="font-medium text-gray-700 mb-2">Items in this delivery:</h5>
                                                    <div className="space-y-1 max-h-32 overflow-y-auto">
                                                        {delivery.materials.map((material: any, mIndex: number) => (
                                                            <div key={mIndex} className="flex justify-between items-center text-sm bg-white p-2 rounded border">
                                                                <span className="flex-1">{material.name}</span>
                                                                <span className="text-gray-600 mx-2">{material.requestedQty} {material.unit}</span>
                                                                <span className="font-medium text-blue-600">{material.sku}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                                        <div className="flex items-start gap-2">
                                            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                            <div className="text-sm">
                                                <p className="font-medium text-amber-800 mb-1">Important Notes:</p>
                                                <ul className="text-amber-700 space-y-1">
                                                    <li>• Each delivery will be handled separately with its own driver and schedule</li>
                                                    <li>• You'll receive notifications for each delivery acceptance and dispatch</li>
                                                    <li>• Delivery times may vary based on warehouse availability and traffic</li>
                                                    <li>• Priority materials (Cement, Steel) are scheduled first for faster delivery</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Submit Buttons */}
                <div className="flex justify-end gap-3">
                    {onClose && (
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                    )}
                    <Button type="submit" disabled={submitting || loading}>
                        {submitting ? (
                            <>
                                <Clock className="w-4 h-4 mr-2 animate-spin" />
                                {user.role === 'customer' ? 'Submitting Order...' : 'Creating Order...'}
                            </>
                        ) : (
                            user.role === 'customer' ? 'Submit Order for Approval' : 'Create Main Order'
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default MainOrderForm;
