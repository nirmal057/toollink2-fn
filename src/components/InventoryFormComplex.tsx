import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PackageIcon, PlusIcon, SaveIcon, RefreshCwIcon, CheckCircleIcon, EditIcon } from 'lucide-react';
import { CreateInventoryItem, InventoryItem } from '../services/inventoryService';

interface InventoryFormProps {
    onSubmit: (item: CreateInventoryItem) => void;
    editItem?: InventoryItem | null;
    saving?: boolean;
    userWarehouse?: string;
    isModal?: boolean;
}

// Function to get warehouse display name
const getWarehouseDisplayName = (warehouse: string): string => {
    const displayNames: { [key: string]: string } = {
        'warehouse1': 'W1',
        'warehouse2': 'W2',
        'warehouse3': 'W3',
        'main_warehouse': 'WM',
        'W1': 'W1',
        'W2': 'W2',
        'W3': 'W3',
        'WM': 'WM',
        'all': 'All Warehouses'
    };

    return displayNames[warehouse] || 'WM';
};

// Function to get warehouse key from display name
const getWarehouseKey = (displayName: string): string => {
    const keyMap: { [key: string]: string } = {
        'W1': 'W1',
        'W2': 'W2',
        'W3': 'W3',
        'WM': 'WM',
        'W1 - River Sand & Soil': 'W1',
        'W2 - Bricks & Masonry': 'W2',
        'W3 - Steel & Metal': 'W3',
        'WM - Tools & Equipment': 'WM',
        'All Warehouses': 'all'
    };

    return keyMap[displayName] || 'WM';
};

// Available warehouse options - Using codes as primary identifiers
const WAREHOUSE_OPTIONS = [
    { key: 'W1', name: 'W1 - River Sand & Soil', code: 'W1' },
    { key: 'W2', name: 'W2 - Bricks & Masonry', code: 'W2' },
    { key: 'W3', name: 'W3 - Steel & Metal', code: 'W3' },
    { key: 'WM', name: 'WM - Tools & Equipment', code: 'WM' }
];

// Function to get warehouse code from key
const getWarehouseCode = (warehouseKey: string): string => {
    const option = WAREHOUSE_OPTIONS.find(opt => opt.key === warehouseKey);
    return option?.code || 'WM';
};

// Dynamic categories based on warehouse
const getWarehouseCategories = (warehouse: string): string[] => {
    const warehouseCategories: { [key: string]: string[] } = {
        'warehouse1': [
            'Fine Sand',
            'Medium Sand',
            'Coarse Sand',
            'River Sand',
            'Washed Sand',
            'M-Sand (Crushed Rock)',
            'Aggregate',
            'Gravel',
            'Stone Chips'
        ], // Sand & Aggregate warehouse
        'W1': [
            'Fine Sand',
            'Medium Sand',
            'Coarse Sand',
            'River Sand',
            'Washed Sand',
            'M-Sand (Crushed Rock)',
            'Aggregate',
            'Gravel',
            'Stone Chips'
        ], // Sand & Aggregate warehouse
        'warehouse2': [
            'Solid Cement Blocks',
            'Hollow Cement Blocks',
            'Clay Bricks',
            '4 Inch Blocks',
            '6 Inch Blocks',
            '8 Inch Blocks',
            'Interlocking Pavers',
            'Granite Slabs',
            'Decorative Stones'
        ], // Bricks & Masonry warehouse
        'W2': [
            'Solid Cement Blocks',
            'Hollow Cement Blocks',
            'Clay Bricks',
            '4 Inch Blocks',
            '6 Inch Blocks',
            '8 Inch Blocks',
            'Interlocking Pavers',
            'Granite Slabs',
            'Decorative Stones'
        ], // Bricks & Masonry warehouse
        'warehouse3': [
            '6mm Steel Rods',
            '8mm Steel Rods',
            '10mm Steel Rods',
            '12mm Steel Rods',
            '16mm Steel Rods',
            '20mm Steel Rods',
            'Steel Wire',
            'Wire Mesh',
            'Angle Iron',
            'Steel Plates'
        ], // Steel & Reinforcement warehouse
        'W3': [
            '6mm Steel Rods',
            '8mm Steel Rods',
            '10mm Steel Rods',
            '12mm Steel Rods',
            '16mm Steel Rods',
            '20mm Steel Rods',
            'Steel Wire',
            'Wire Mesh',
            'Angle Iron',
            'Steel Plates'
        ], // Steel & Reinforcement warehouse
        'main_warehouse': [
            'Power Drills',
            'Angle Grinders',
            'Rotary Hammers',
            'Hand Tools',
            'Measuring Tools',
            'Safety Equipment',
            'Hardware',
            'Electrical Tools',
            'Cutting Tools',
            'Cement',
            'Paint & Chemicals',
            'Electrical Items',
            'Plumbing Supplies',
            'Tiles & Ceramics',
            'Roofing Materials',
            'Materials',
            'Other'
        ], // Tools & Equipment + General items
        'WM': [
            'Power Drills',
            'Angle Grinders',
            'Rotary Hammers',
            'Hand Tools',
            'Measuring Tools',
            'Safety Equipment',
            'Hardware',
            'Electrical Tools',
            'Cutting Tools',
            'Cement',
            'Paint & Chemicals',
            'Electrical Items',
            'Plumbing Supplies',
            'Tiles & Ceramics',
            'Roofing Materials',
            'Materials',
            'Other'
        ], // Tools & Equipment + General items
        'all': [
            // Main categories for admin - simplified view
            'Sand & Aggregate',
            'Bricks & Masonry',
            'Steel & Reinforcement',
            'Tools & Equipment',
            'Cement',
            'Paint & Chemicals',
            'Electrical Items',
            'Plumbing Supplies',
            'Tiles & Ceramics',
            'Roofing Materials',
            'Materials',
            'Other'
        ] // Admin - main categories only (simplified)
    };

    return warehouseCategories[warehouse] || warehouseCategories['WM'];
};

// Unit options
const UNITS = [
    'Kg', 'Meters', 'Liters', 'Pieces', 'Bags', 'Boxes', 'Rolls', 'Sheets', 'Feet', 'Sets', 'Packs'
];

// Common Sri Lankan inventory items for quick selection
const QUICK_ITEMS = [
    // Warehouse-specific detailed items
    { name: 'Kelani River Sand - Fine', category: 'Fine Sand', unit: 'cubic_ft', location: 'W1', warehouse: 'W1' },
    { name: 'Medium Sand for Masonry', category: 'Medium Sand', unit: 'cubic_ft', location: 'W1', warehouse: 'W1' },
    { name: 'Aggregate 10mm', category: 'Aggregate', unit: 'cubic_ft', location: 'W1', warehouse: 'W1' },

    { name: 'Cement Block 6"', category: '6 Inch Blocks', unit: 'pieces', location: 'W2', warehouse: 'W2' },
    { name: 'Hollow Block 4"', category: '4 Inch Blocks', unit: 'pieces', location: 'W2', warehouse: 'W2' },
    { name: 'Clay Brick - Solid', category: 'Clay Bricks', unit: 'pieces', location: 'W2', warehouse: 'W2' },

    { name: 'Lanwa Steel Rod 10mm', category: '10mm Steel Rods', unit: 'pieces', location: 'W3', warehouse: 'W3' },
    { name: 'Steel Rod 12mm', category: '12mm Steel Rods', unit: 'pieces', location: 'W3', warehouse: 'W3' },
    { name: 'Binding Wire 20kg', category: 'Steel Wire', unit: 'kg', location: 'W3', warehouse: 'W3' },

    { name: 'Makita Electric Drill 750W', category: 'Power Drills', unit: 'pieces', location: 'WM', warehouse: 'WM' },
    { name: 'Angle Grinder 900W', category: 'Angle Grinders', unit: 'pieces', location: 'WM', warehouse: 'WM' },
    { name: 'Measuring Tape 5m', category: 'Measuring Tools', unit: 'pieces', location: 'WM', warehouse: 'WM' },
    { name: 'Safety Helmet', category: 'Safety Equipment', unit: 'pieces', location: 'WM', warehouse: 'WM' },

    // Admin main category items (simplified)
    { name: 'River Sand - Mixed', category: 'Sand & Aggregate', unit: 'cubic_ft', location: 'All Warehouses', warehouse: 'all' },
    { name: 'Cement Blocks - Standard', category: 'Bricks & Masonry', unit: 'pieces', location: 'All Warehouses', warehouse: 'all' },
    { name: 'Steel Rods - Mixed', category: 'Steel & Reinforcement', unit: 'pieces', location: 'All Warehouses', warehouse: 'all' },
    { name: 'Construction Tools - General', category: 'Tools & Equipment', unit: 'pieces', location: 'All Warehouses', warehouse: 'all' }
];

const InventoryForm: React.FC<InventoryFormProps> = ({
    onSubmit,
    editItem,
    saving = false,
    userWarehouse = 'WM',
    isModal = false
}) => {
    const [formData, setFormData] = useState<CreateInventoryItem>({
        name: '',
        location: getWarehouseDisplayName(userWarehouse),
        category: '',
        quantity: 0,
        unit: '',
        threshold: 10,
        description: '',
        supplier_info: {
            name: '',
            contact: '',
            email: '',
            phone: '',
            address: ''
        },
        warehouse: userWarehouse,
        warehouseCode: getWarehouseCode(userWarehouse),
        min_stock_level: 10,
        max_stock_level: 1000,
        current_stock: 0,
        status: 'active',
        low_stock_alert: true,
        barcode: '',
        weight: 0,
        dimensions: {
            length: 0,
            width: 0,
            height: 0,
            unit: 'cm'
        },
        tags: []
    });
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [selectedWarehouse, setSelectedWarehouse] = useState<string>(userWarehouse);

    // Get available categories based on selected warehouse
    const getAvailableCategories = (): string[] => {
        return getWarehouseCategories(selectedWarehouse);
    };

    const availableCategories = getAvailableCategories();

    // Handle warehouse change
    const handleWarehouseChange = (warehouseKey: string) => {
        setSelectedWarehouse(warehouseKey);
        const newLocation = getWarehouseDisplayName(warehouseKey);
        const newCategories = getWarehouseCategories(warehouseKey);
        const warehouseCode = getWarehouseCode(warehouseKey);

        setFormData(prev => ({
            ...prev,
            location: newLocation,
            category: newCategories[0] || '', // Auto-select first category
            warehouse: warehouseKey,
            warehouseCode: warehouseCode
        }));

        // Clear category error if it exists
        if (errors.category) {
            setErrors(prev => ({ ...prev, category: '' }));
        }
    };

    // Initialize form data
    useEffect(() => {
        if (editItem) {
            // When editing, determine warehouse from location
            const warehouseKey = getWarehouseKey(editItem.location || '') || userWarehouse;
            setSelectedWarehouse(warehouseKey);

            setFormData({
                name: editItem.name || '',
                location: editItem.location || getWarehouseDisplayName(userWarehouse),
                category: editItem.category || '',
                quantity: editItem.quantity || 0,
                unit: editItem.unit || '',
                threshold: editItem.threshold || 10,
                description: editItem.description || '',
                supplier_info: typeof editItem.supplier_info === 'string'
                    ? { name: editItem.supplier_info, contact: '', email: '', phone: '', address: '' }
                    : editItem.supplier_info || { name: '', contact: '', email: '', phone: '', address: '' },
                warehouse: editItem.warehouse || warehouseKey,
                warehouseCode: editItem.warehouseCode || getWarehouseCode(warehouseKey),
                min_stock_level: editItem.min_stock_level || 10,
                max_stock_level: editItem.max_stock_level || 1000,
                current_stock: editItem.current_stock || editItem.quantity || 0,
                status: editItem.status || 'active',
                low_stock_alert: editItem.low_stock_alert ?? true,
                barcode: editItem.barcode || '',
                weight: editItem.weight || 0,
                dimensions: editItem.dimensions || { length: 0, width: 0, height: 0, unit: 'cm' },
                tags: editItem.tags || []
            });
        } else {
            setSelectedWarehouse(userWarehouse);
            const defaultCategories = getWarehouseCategories(userWarehouse);
            setFormData({
                name: '',
                location: getWarehouseDisplayName(userWarehouse),
                category: defaultCategories[0] || '',
                quantity: 0,
                unit: '',
                threshold: 10,
                description: '',
                supplier_info: { name: '', contact: '', email: '', phone: '', address: '' },
                warehouse: userWarehouse,
                warehouseCode: getWarehouseCode(userWarehouse),
                min_stock_level: 10,
                max_stock_level: 1000,
                current_stock: 0,
                status: 'active',
                low_stock_alert: true,
                barcode: '',
                weight: 0,
                dimensions: { length: 0, width: 0, height: 0, unit: 'cm' },
                tags: []
            });
        }
        setErrors({});
    }, [editItem, userWarehouse]);

    // Update category when warehouse changes - removed as it's now handled by handleWarehouseChange

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
        if (!formData.supplier_info?.name?.trim()) {
            newErrors.supplier_info = 'Supplier name is required';
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

        onSubmit(formData);

        // Reset form after successful submission (when adding new item)
        if (!editItem) {
            setFormData({
                name: '',
                location: getWarehouseDisplayName(userWarehouse),
                category: availableCategories[0] || '',
                quantity: 0,
                warehouse: userWarehouse,
                warehouseCode: getWarehouseCode(userWarehouse),
                unit: '',
                threshold: 10,
                description: '',
                supplier_info: { name: '', contact: '', email: '', phone: '', address: '' },
                min_stock_level: 10,
                max_stock_level: 1000,
                current_stock: 0,
                status: 'active',
                low_stock_alert: true,
                barcode: '',
                weight: 0,
                dimensions: { length: 0, width: 0, height: 0, unit: 'cm' },
                tags: []
            });
            setErrors({});
        }
    };

    // Handle input changes
    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => {
            const newData = { ...prev, [field]: value };

            // Automatically set current_stock to match quantity for new items
            if (field === 'quantity' && !editItem) {
                newData.current_stock = value;
            }

            return newData;
        });

        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    // Quick item selection
    const handleQuickSelect = (item: typeof QUICK_ITEMS[0]) => {
        // Update the selected warehouse first
        const warehouseKey = item.warehouse;
        setSelectedWarehouse(warehouseKey);

        // Set form data with the selected item
        setFormData(prev => ({
            ...prev,
            name: item.name,
            category: item.category,
            unit: item.unit,
            location: item.location,
            warehouse: warehouseKey,
            warehouseCode: getWarehouseCode(warehouseKey)
        }));

        // Clear any errors
        setErrors({});
    };

    // Check if form is valid
    const isFormValid = () => {
        return formData.name.trim() &&
            formData.category &&
            formData.unit &&
            (formData.supplier_info?.name?.trim()) &&
            formData.quantity >= 0 &&
            formData.threshold >= 0;
    };

    const FormContent = () => (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Quick Selection Panel - Only show if not editing and not in modal */}
            {!editItem && !isModal && (
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
            )}

            {/* Main Form */}
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className={!editItem && !isModal ? "lg:col-span-2" : "lg:col-span-3"}
            >
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                        {editItem ? <EditIcon size={20} className="text-blue-500" /> : <PlusIcon size={20} className="text-blue-500" />}
                        {editItem ? 'Edit Inventory Item' : 'Add New Inventory Item'}
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
                                    value={getWarehouseKey(formData.location)}
                                    onChange={e => {
                                        const warehouseKey = e.target.value;
                                        const warehouseName = getWarehouseDisplayName(warehouseKey);
                                        handleInputChange('location', warehouseName);
                                        handleWarehouseChange(warehouseKey);
                                    }}
                                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white transition-all duration-200"
                                >
                                    <option value="">Select Storage Location</option>
                                    {WAREHOUSE_OPTIONS.map(warehouse => (
                                        <option key={warehouse.key} value={warehouse.key}>
                                            {warehouse.name}
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
                                    <option value="">Select Category</option>
                                    {availableCategories.map(category => (
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
                        {/* Supplier Information */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Supplier Information *
                            </label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <input
                                    type="text"
                                    value={formData.supplier_info?.name || ''}
                                    onChange={e => handleInputChange('supplier_info', { ...formData.supplier_info, name: e.target.value })}
                                    className={`w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${errors.supplier_info ? 'border-red-500' : 'border-gray-300 dark:border-gray-600 focus:border-blue-500'
                                        }`}
                                    placeholder="Supplier Name *"
                                />
                                <input
                                    type="text"
                                    value={formData.supplier_info?.contact || ''}
                                    onChange={e => handleInputChange('supplier_info', { ...formData.supplier_info, contact: e.target.value })}
                                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                    placeholder="Contact Person"
                                />
                                <input
                                    type="tel"
                                    value={formData.supplier_info?.phone || ''}
                                    onChange={e => handleInputChange('supplier_info', { ...formData.supplier_info, phone: e.target.value })}
                                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                    placeholder="Phone Number"
                                />
                                <input
                                    type="email"
                                    value={formData.supplier_info?.email || ''}
                                    onChange={e => handleInputChange('supplier_info', { ...formData.supplier_info, email: e.target.value })}
                                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                    placeholder="Email Address"
                                />
                            </div>
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

                        {/* Stock Management */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Min Stock Level
                                </label>
                                <input
                                    type="number"
                                    value={formData.min_stock_level}
                                    onChange={e => handleInputChange('min_stock_level', parseInt(e.target.value) || 0)}
                                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white transition-all duration-200"
                                    placeholder="Minimum stock"
                                    min="0"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Max Stock Level
                                </label>
                                <input
                                    type="number"
                                    value={formData.max_stock_level}
                                    onChange={e => handleInputChange('max_stock_level', parseInt(e.target.value) || 0)}
                                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white transition-all duration-200"
                                    placeholder="Maximum stock"
                                    min="0"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Status
                                </label>
                                <select
                                    value={formData.status}
                                    onChange={e => handleInputChange('status', e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white transition-all duration-200"
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                    <option value="discontinued">Discontinued</option>
                                </select>
                            </div>
                        </div>

                        {/* Additional Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Barcode (Optional)
                                </label>
                                <input
                                    type="text"
                                    value={formData.barcode}
                                    onChange={e => handleInputChange('barcode', e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white transition-all duration-200"
                                    placeholder="Enter barcode"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Weight (kg)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.weight}
                                    onChange={e => handleInputChange('weight', parseFloat(e.target.value) || 0)}
                                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white transition-all duration-200"
                                    placeholder="Item weight"
                                    min="0"
                                />
                            </div>
                        </div>

                        {/* Dimensions */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Dimensions (Optional)
                            </label>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.dimensions?.length}
                                    onChange={e => handleInputChange('dimensions', { ...formData.dimensions, length: parseFloat(e.target.value) || 0 })}
                                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white transition-all duration-200"
                                    placeholder="Length"
                                    min="0"
                                />
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.dimensions?.width}
                                    onChange={e => handleInputChange('dimensions', { ...formData.dimensions, width: parseFloat(e.target.value) || 0 })}
                                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white transition-all duration-200"
                                    placeholder="Width"
                                    min="0"
                                />
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.dimensions?.height}
                                    onChange={e => handleInputChange('dimensions', { ...formData.dimensions, height: parseFloat(e.target.value) || 0 })}
                                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white transition-all duration-200"
                                    placeholder="Height"
                                    min="0"
                                />
                                <select
                                    value={formData.dimensions?.unit}
                                    onChange={e => handleInputChange('dimensions', { ...formData.dimensions, unit: e.target.value })}
                                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white transition-all duration-200"
                                >
                                    <option value="cm">cm</option>
                                    <option value="mm">mm</option>
                                    <option value="m">m</option>
                                    <option value="in">inch</option>
                                </select>
                            </div>
                        </div>

                        {/* Low Stock Alert */}
                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                id="low_stock_alert"
                                checked={formData.low_stock_alert}
                                onChange={e => handleInputChange('low_stock_alert', e.target.checked)}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                            />
                            <label htmlFor="low_stock_alert" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Enable low stock alerts for this item
                            </label>
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-end pt-6 border-t border-gray-200 dark:border-gray-700">
                            <button
                                type="submit"
                                disabled={saving || !isFormValid()}
                                className="px-8 py-3 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-lg hover:from-green-600 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed flex items-center gap-2 font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                            >
                                {saving ? (
                                    <>
                                        <RefreshCwIcon size={20} className="animate-spin" />
                                        {editItem ? 'Updating...' : 'Adding Item...'}
                                    </>
                                ) : (
                                    <>
                                        {editItem ? <EditIcon size={20} /> : <SaveIcon size={20} />}
                                        {editItem ? 'Update Item' : 'Add to Inventory'}
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </motion.div>
        </div>
    );

    if (isModal) {
        return <FormContent />;
    }

    // Standalone page layout (for QuickAddInventory)
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

                <FormContent />
            </div>
        </div>
    );
};

export default InventoryForm;
