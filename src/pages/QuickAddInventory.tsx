import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { PackageIcon, PlusIcon, SaveIcon, RefreshCwIcon, CheckCircleIcon, AlertCircleIcon } from 'lucide-react';
import { inventoryService, CreateInventoryItem } from '../services/inventoryService';
import { useToast } from '../contexts/GlobalNotificationContext';

interface QuickAddInventoryProps {
    userRole: string;
}

// Sri Lankan hardware store inventory categories
const CATEGORIES = [
    'Cement',
    'Steel & Reinforcement',
    'Paint & Chemicals',
    'Electrical Items',
    'Plumbing Supplies',
    'Tools & Equipment',
    'Hardware & Fasteners',
    'Tiles & Ceramics',
    'Roofing Materials',
    'Safety Equipment',
    'Sand & Aggregate',
    'Bricks',
    'Stones'
];

// Location options for Sri Lankan hardware store
const LOCATIONS = [
    { value: 'Main Shop', label: 'Main Shop' },
    { value: 'Warehouse 1 (River Sand)', label: 'Warehouse 1 (River Sand)' },
    { value: 'Warehouse 2 (Bricks)', label: 'Warehouse 2 (Bricks)' },
    { value: 'Warehouse 3 (Black Stones)', label: 'Warehouse 3 (Black Stones)' }
];

// Unit options
const UNITS = [
    'Kg', 'Meters', 'Liters', 'Pieces', 'Bags', 'Boxes', 'Rolls', 'Sheets', 'Feet', 'Sets', 'Packs'
];

// Common Sri Lankan inventory items for quick selection
const QUICK_ITEMS = [
    { name: 'River Sand', category: 'Sand & Aggregate', unit: 'kg', location: 'Warehouse 1 (River Sand)' },
    { name: 'Red Bricks', category: 'Bricks', unit: 'pieces', location: 'Warehouse 2 (Bricks)' },
    { name: 'Black Stones', category: 'Stones', unit: 'kg', location: 'Warehouse 3 (Black Stones)' },
    { name: 'Cement Bags', category: 'Cement', unit: 'bags', location: 'Main Shop' },
    { name: 'Steel Bars (12mm)', category: 'Steel & Reinforcement', unit: 'pieces', location: 'Main Shop' },
    { name: 'White Paint', category: 'Paint & Chemicals', unit: 'liters', location: 'Main Shop' },
    { name: 'Electrical Wire', category: 'Electrical Items', unit: 'meters', location: 'Main Shop' },
    { name: 'PVC Pipes', category: 'Plumbing Supplies', unit: 'pieces', location: 'Main Shop' }
];

const QuickAddInventory: React.FC<QuickAddInventoryProps> = ({ userRole }) => {
    const toast = useToast();
    const [formData, setFormData] = useState<CreateInventoryItem>({
        name: '',
        location: 'Main Shop',
        category: 'Cement',
        quantity: 0,
        unit: '',
        threshold: 10,
        description: '',
        supplier_info: ''
    });
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    // Check if user has permission
    if (!['admin', 'warehouse'].includes(userRole)) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-orange-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 flex items-center justify-center">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8 max-w-md w-full text-center">
                    <AlertCircleIcon size={64} className="mx-auto text-red-500 mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Access Denied</h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        Only admin and warehouse managers can add inventory items.
                    </p>
                </div>
            </div>
        );
    }

    // Form validation
    const validateForm = (): boolean => {
        const newErrors: { [key: string]: string } = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Item name is required';
        }
        if (!formData.category) {
            newErrors.category = 'Category is required';
        }
        if (formData.quantity < 0) {
            newErrors.quantity = 'Quantity must be 0 or greater';
        }
        if (!formData.unit) {
            newErrors.unit = 'Unit is required';
        }
        if (formData.threshold < 0) {
            newErrors.threshold = 'Threshold must be 0 or greater';
        }
        if (!formData.supplier_info || !formData.supplier_info.trim()) {
            newErrors.supplier_info = 'Supplier information is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            setSaving(true);
            await inventoryService.createItem(formData);

            toast.success('Inventory Item Added', `${formData.name} has been added successfully!`);

            // Reset form
            setFormData({
                name: '',
                location: 'Main Shop',
                category: 'Cement',
                quantity: 0,
                unit: '',
                threshold: 10,
                description: '',
                supplier_info: ''
            });
            setErrors({});

        } catch (err: any) {
            console.error('Failed to add inventory item:', err);
            const errorMessage = err.response?.data?.error || err.message || 'Unknown error';
            toast.error('Failed to Add Item', errorMessage);
        } finally {
            setSaving(false);
        }
    };

    // Handle input changes
    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    // Quick item selection
    const handleQuickSelect = (item: typeof QUICK_ITEMS[0]) => {
        setFormData(prev => ({
            ...prev,
            name: item.name,
            category: item.category,
            unit: item.unit,
            location: item.location
        }));
        setErrors({});
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-4">
                            <div className="bg-gradient-to-r from-green-500 to-blue-600 p-3 rounded-xl">
                                <PackageIcon size={32} className="text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                    Quick Add Inventory
                                </h1>
                                <p className="text-gray-600 dark:text-gray-400 mt-1">
                                    Quickly add new inventory items to the system
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Quick Selection Panel */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="lg:col-span-1"
                    >
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <CheckCircleIcon size={20} className="text-green-500" />
                                Quick Select Items
                            </h3>
                            <div className="space-y-2">
                                {QUICK_ITEMS.map((item, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleQuickSelect(item)}
                                        className="w-full text-left p-3 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-green-50 dark:hover:bg-green-900/20 border border-gray-200 dark:border-gray-600 hover:border-green-300 dark:hover:border-green-700 transition-all duration-200"
                                    >
                                        <div className="font-medium text-gray-900 dark:text-white">{item.name}</div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                            {item.category} • {item.location}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    {/* Main Form */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="lg:col-span-2"
                    >
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                <PlusIcon size={20} className="text-blue-500" />
                                Add New Inventory Item
                            </h3>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Item Name */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                        Item Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={e => handleInputChange('name', e.target.value)}
                                        className={`w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600 focus:border-blue-500'
                                            }`}
                                        placeholder="e.g., River Sand, Red Bricks, Cement"
                                    />
                                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                                </div>

                                {/* Location and Category */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                            Storage Location *
                                        </label>
                                        <select
                                            value={formData.location}
                                            onChange={e => handleInputChange('location', e.target.value)}
                                            className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white transition-all duration-200"
                                        >
                                            {LOCATIONS.map(location => (
                                                <option key={location.value} value={location.value}>
                                                    {location.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                            Category *
                                        </label>
                                        <select
                                            value={formData.category}
                                            onChange={e => handleInputChange('category', e.target.value)}
                                            className={`w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${errors.category ? 'border-red-500' : 'border-gray-300 dark:border-gray-600 focus:border-blue-500'
                                                }`}
                                        >
                                            {CATEGORIES.map(category => (
                                                <option key={category} value={category}>
                                                    {category}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
                                    </div>
                                </div>

                                {/* Quantity, Unit, and Threshold */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                            Quantity *
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={formData.quantity}
                                            onChange={e => handleInputChange('quantity', parseInt(e.target.value) || 0)}
                                            className={`w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${errors.quantity ? 'border-red-500' : 'border-gray-300 dark:border-gray-600 focus:border-blue-500'
                                                }`}
                                            placeholder="0"
                                        />
                                        {errors.quantity && <p className="text-red-500 text-sm mt-1">{errors.quantity}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                            Unit *
                                        </label>
                                        <select
                                            value={formData.unit}
                                            onChange={e => handleInputChange('unit', e.target.value)}
                                            className={`w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${errors.unit ? 'border-red-500' : 'border-gray-300 dark:border-gray-600 focus:border-blue-500'
                                                }`}
                                        >
                                            <option value="">Select Unit</option>
                                            {UNITS.map(unit => (
                                                <option key={unit} value={unit.toLowerCase()}>
                                                    {unit}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.unit && <p className="text-red-500 text-sm mt-1">{errors.unit}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                            Low Stock Alert *
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={formData.threshold}
                                            onChange={e => handleInputChange('threshold', parseInt(e.target.value) || 0)}
                                            className={`w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${errors.threshold ? 'border-red-500' : 'border-gray-300 dark:border-gray-600 focus:border-blue-500'
                                                }`}
                                            placeholder="10"
                                        />
                                        {errors.threshold && <p className="text-red-500 text-sm mt-1">{errors.threshold}</p>}
                                    </div>
                                </div>

                                {/* Supplier Info */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                        Supplier Information *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.supplier_info}
                                        onChange={e => handleInputChange('supplier_info', e.target.value)}
                                        className={`w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${errors.supplier_info ? 'border-red-500' : 'border-gray-300 dark:border-gray-600 focus:border-blue-500'
                                            }`}
                                        placeholder="e.g., ABC Suppliers, Contact: 0771234567"
                                    />
                                    {errors.supplier_info && <p className="text-red-500 text-sm mt-1">{errors.supplier_info}</p>}
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                        Description (Optional)
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={e => handleInputChange('description', e.target.value)}
                                        className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white transition-all duration-200"
                                        placeholder="Additional details about the item..."
                                        rows={3}
                                    />
                                </div>

                                {/* Submit Button */}
                                <div className="flex justify-end pt-6 border-t border-gray-200 dark:border-gray-700">
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="px-8 py-3 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-lg hover:from-green-600 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed flex items-center gap-2 font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                                    >
                                        {saving ? (
                                            <>
                                                <RefreshCwIcon size={20} className="animate-spin" />
                                                Adding Item...
                                            </>
                                        ) : (
                                            <>
                                                <SaveIcon size={20} />
                                                Add to Inventory
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default QuickAddInventory;
