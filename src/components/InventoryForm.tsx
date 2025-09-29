import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PackageIcon, PlusIcon, SaveIcon, RefreshCwIcon } from 'lucide-react';
import { CreateInventoryItem, InventoryItem } from '../services/inventoryService';
import {
    WarehouseCategoryUtils,
    WAREHOUSE_OPTIONS,
    CategoryItem
} from '../config/warehouseCategories';

interface InventoryFormProps {
    onSubmit: (item: CreateInventoryItem) => void;
    editItem?: InventoryItem | null;
    saving?: boolean;
    userWarehouse?: string;
    isModal?: boolean;
}

const UNITS = ['pieces', 'kg', 'liters', 'meters', 'boxes', 'sets', 'cubic_ft', 'bags', 'sheets', 'rolls'];

const InventoryForm: React.FC<InventoryFormProps> = ({
    onSubmit,
    editItem,
    saving = false,
    userWarehouse = 'WM',
    isModal = false
}) => {
    const [formData, setFormData] = useState<CreateInventoryItem>({
        name: '',
        category: '',
        quantity: 0,
        unit: '',
        threshold: 10,
        location: userWarehouse,
        warehouse: userWarehouse,
        warehouseCode: userWarehouse,
        description: '',
        supplier_info: { name: '', contact: '', phone: '' }
    });
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    // Get categories for selected warehouse using the new system
    const getCategories = (warehouse: string): string[] => {
        return WarehouseCategoryUtils.getLegacyCategoriesForWarehouse(warehouse);
    };

    // Get categories with IDs for selected warehouse
    const getCategoriesWithIds = (warehouse: string): CategoryItem[] => {
        return WarehouseCategoryUtils.getCategoriesForWarehouse(warehouse);
    };

    // Handle warehouse change
    const handleWarehouseChange = (warehouse: string) => {
        const categories = getCategories(warehouse);
        setFormData(prev => ({
            ...prev,
            warehouse,
            warehouseCode: warehouse,
            location: warehouse,
            category: categories[0] || ''
        }));
    };

    // Load edit item data
    useEffect(() => {
        if (editItem) {
            setFormData({
                name: editItem.name || '',
                category: editItem.category || '',
                quantity: editItem.quantity || 0,
                unit: editItem.unit || '',
                threshold: editItem.threshold || 10,
                location: editItem.location || userWarehouse,
                warehouse: editItem.warehouse || userWarehouse,
                warehouseCode: editItem.warehouseCode || userWarehouse,
                description: editItem.description || '',
                supplier_info: typeof editItem.supplier_info === 'string'
                    ? { name: editItem.supplier_info, contact: '', phone: '' }
                    : editItem.supplier_info || { name: '', contact: '', phone: '' }
            });
        } else {
            // Reset form for new item
            const categories = getCategories(userWarehouse);
            setFormData({
                name: '',
                category: categories[0] || '',
                quantity: 0,
                unit: '',
                threshold: 10,
                location: userWarehouse,
                warehouse: userWarehouse,
                warehouseCode: userWarehouse,
                description: '',
                supplier_info: { name: '', contact: '', phone: '' }
            });
        }
        setErrors({});
    }, [editItem, userWarehouse]);

    // Validate form
    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};

        if (!formData.name.trim()) newErrors.name = 'Name is required';
        if (!formData.category) newErrors.category = 'Category is required';
        if (!formData.unit) newErrors.unit = 'Unit is required';
        if (formData.quantity < 0) newErrors.quantity = 'Quantity must be 0 or greater';
        if (formData.threshold < 0) newErrors.threshold = 'Threshold must be 0 or greater';
        if (!formData.supplier_info?.name?.trim()) newErrors.supplier = 'Supplier name is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        // Submit the form
        onSubmit({
            ...formData,
            current_stock: formData.quantity, // Set current stock to initial quantity
            min_stock_level: formData.threshold,
            max_stock_level: formData.quantity * 10, // Default max to 10x initial
            status: 'active',
            low_stock_alert: true
        });

        // Reset form after successful submission (if not editing)
        if (!editItem) {
            const categories = getCategories(userWarehouse);
            setFormData({
                name: '',
                category: categories[0] || '',
                quantity: 0,
                unit: '',
                threshold: 10,
                location: userWarehouse,
                warehouse: userWarehouse,
                warehouseCode: userWarehouse,
                description: '',
                supplier_info: { name: '', contact: '', phone: '' }
            });
            setErrors({});
        }
    };

    // Handle input changes
    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };



    return (
        <div className={`${isModal ? '' : 'max-w-4xl mx-auto p-6'}`}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700"
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-t-xl">
                    <div className="flex items-center gap-3">
                        <PackageIcon size={28} />
                        <div>
                            <h2 className="text-2xl font-bold">
                                {editItem ? 'Edit Inventory Item' : 'Quick Add Inventory'}
                            </h2>
                            <p className="text-blue-100 mt-1">
                                {editItem ? 'Update item details' : 'Add new inventory item quickly'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Warehouse Selection (only show for admin or when editing) */}
                    {(userWarehouse === 'all' || editItem) && (
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Warehouse
                            </label>
                            <select
                                value={formData.warehouse}
                                onChange={e => handleWarehouseChange(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white transition-all duration-200"
                            >
                                {WAREHOUSE_OPTIONS.map(option => (
                                    <option key={option.key} value={option.key}>
                                        {option.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Basic Information Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Item Name */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Item Name *
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={e => handleChange('name', e.target.value)}
                                className={`w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600 focus:border-blue-500'
                                    }`}
                                placeholder="Enter item name..."
                            />
                            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                        </div>

                        {/* Category with ID System */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Category * <span className="text-xs text-gray-500">(Warehouse-Category ID System)</span>
                            </label>
                            <select
                                value={formData.category}
                                onChange={e => handleChange('category', e.target.value)}
                                className={`w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${errors.category ? 'border-red-500' : 'border-gray-300 dark:border-gray-600 focus:border-blue-500'
                                    }`}
                            >
                                <option value="">Select Category</option>
                                {getCategoriesWithIds(formData.warehouse || userWarehouse).map((categoryItem: CategoryItem) => (
                                    <option key={categoryItem.id} value={categoryItem.name}>
                                        {categoryItem.id} - {categoryItem.name}
                                    </option>
                                ))}
                            </select>
                            {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}

                            {/* Show selected category ID */}
                            {formData.category && (
                                <div className="mt-2 text-xs text-blue-600 dark:text-blue-400">
                                    Selected Category ID: {getCategoriesWithIds(formData.warehouse || userWarehouse)
                                        .find(cat => cat.name === formData.category)?.id || 'N/A'}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Quantity and Unit Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Quantity *
                            </label>
                            <input
                                type="number"
                                value={formData.quantity}
                                onChange={e => handleChange('quantity', parseInt(e.target.value) || 0)}
                                className={`w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${errors.quantity ? 'border-red-500' : 'border-gray-300 dark:border-gray-600 focus:border-blue-500'
                                    }`}
                                placeholder="0"
                                min="0"
                            />
                            {errors.quantity && <p className="text-red-500 text-sm mt-1">{errors.quantity}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Unit *
                            </label>
                            <select
                                value={formData.unit}
                                onChange={e => handleChange('unit', e.target.value)}
                                className={`w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${errors.unit ? 'border-red-500' : 'border-gray-300 dark:border-gray-600 focus:border-blue-500'
                                    }`}
                            >
                                <option value="">Select Unit</option>
                                {UNITS.map(unit => (
                                    <option key={unit} value={unit}>
                                        {unit}
                                    </option>
                                ))}
                            </select>
                            {errors.unit && <p className="text-red-500 text-sm mt-1">{errors.unit}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Low Stock Alert
                            </label>
                            <input
                                type="number"
                                value={formData.threshold}
                                onChange={e => handleChange('threshold', parseInt(e.target.value) || 0)}
                                className={`w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${errors.threshold ? 'border-red-500' : 'border-gray-300 dark:border-gray-600 focus:border-blue-500'
                                    }`}
                                placeholder="10"
                                min="0"
                            />
                            {errors.threshold && <p className="text-red-500 text-sm mt-1">{errors.threshold}</p>}
                        </div>
                    </div>

                    {/* Supplier Information */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Supplier Name *
                            </label>
                            <input
                                type="text"
                                value={formData.supplier_info?.name || ''}
                                onChange={e => handleChange('supplier_info', { ...formData.supplier_info, name: e.target.value })}
                                className={`w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${errors.supplier ? 'border-red-500' : 'border-gray-300 dark:border-gray-600 focus:border-blue-500'
                                    }`}
                                placeholder="Supplier name..."
                            />
                            {errors.supplier && <p className="text-red-500 text-sm mt-1">{errors.supplier}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Contact Person
                            </label>
                            <input
                                type="text"
                                value={formData.supplier_info?.contact || ''}
                                onChange={e => handleChange('supplier_info', { ...formData.supplier_info, contact: e.target.value })}
                                className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                placeholder="Contact person..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Phone Number
                            </label>
                            <input
                                type="tel"
                                value={formData.supplier_info?.phone || ''}
                                onChange={e => handleChange('supplier_info', { ...formData.supplier_info, phone: e.target.value })}
                                className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                placeholder="Phone number..."
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Description (Optional)
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={e => handleChange('description', e.target.value)}
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
                                    {editItem ? 'Updating...' : 'Adding...'}
                                </>
                            ) : (
                                <>
                                    {editItem ? <SaveIcon size={20} /> : <PlusIcon size={20} />}
                                    {editItem ? 'Update Item' : 'Add Item'}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default InventoryForm;
