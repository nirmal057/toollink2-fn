import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PackageIcon, PlusIcon, SearchIcon, FilterIcon, EditIcon, TrashIcon, AlertTriangleIcon, XIcon, RefreshCwIcon } from 'lucide-react';
import { inventoryService, InventoryItem, CreateInventoryItem, InventoryStats } from '../services/inventoryService';
import { useToast } from '../contexts/GlobalNotificationContext';

interface InventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (item: CreateInventoryItem) => void;
  editItem?: InventoryItem | null;
  saving?: boolean;
}

interface InventoryManagementProps {
  userRole: 'admin' | 'warehouse' | 'cashier' | 'customer' | string;
}

// Sri Lankan hardware store inventory categories
const CATEGORIES = {
  ALL: [
    'Cement',
    'Steel & Reinforcement',
    'Paint & Chemicals',
    'Electrical Items',
    'Plumbing Supplies',
    'Tools & Equipment',
    'Hardware & Fasteners',
    'Tiles & Ceramics',
    'Roofing Materials',
    'Safety Equipment'
  ],
  'Sand & Aggregate': ['Sand & Aggregate'],
  'Bricks': ['Bricks'],
  'Stones': ['Stones']
};

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

const InventoryModal: React.FC<InventoryModalProps> = ({ isOpen, onClose, onSubmit, editItem, saving = false }) => {
  const [formData, setFormData] = useState({
    name: '',
    location: 'Main Shop',
    category: '',
    quantity: 0,
    unit: '',
    threshold: 0,
    description: '',
    supplier_info: ''
  });

  // Form validation state
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Get available categories based on selected location
  const getAvailableCategories = (location: string): string[] => {
    switch (location) {
      case 'Warehouse 1 (River Sand)':
        return CATEGORIES['Sand & Aggregate'];
      case 'Warehouse 2 (Bricks)':
        return CATEGORIES['Bricks'];
      case 'Warehouse 3 (Black Stones)':
        return CATEGORIES['Stones'];
      case 'Main Shop':
      default:
        return CATEGORIES.ALL;
    }
  };

  const availableCategories = getAvailableCategories(formData.location);

  // Initialize form data
  useEffect(() => {
    if (editItem) {
      setFormData({
        name: editItem.name || '',
        location: editItem.location || 'Main Shop',
        category: editItem.category || '',
        quantity: editItem.quantity || 0,
        unit: editItem.unit || '',
        threshold: editItem.threshold || 0,
        description: editItem.description || '',
        supplier_info: editItem.supplier_info || ''
      });
    } else {
      const defaultCategories = getAvailableCategories('Main Shop');
      setFormData({
        name: '',
        location: 'Main Shop',
        category: defaultCategories[0] || '',
        quantity: 0,
        unit: '',
        threshold: 0,
        description: '',
        supplier_info: ''
      });
    }
    setErrors({});
  }, [editItem, isOpen]);

  // Update category when location changes
  useEffect(() => {
    const categories = getAvailableCategories(formData.location);
    if (categories.length > 0 && !categories.includes(formData.category)) {
      setFormData(prev => ({ ...prev, category: categories[0] }));
    }
  }, [formData.location, formData.category]);

  // Form validation
  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
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
    if (!formData.supplier_info.trim()) {
      newErrors.supplier_info = 'Supplier info is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Check if form is valid
  const isFormValid = () => {
    return formData.name.trim() && 
           formData.category && 
           formData.unit && 
           formData.supplier_info.trim() &&
           formData.quantity >= 0 && 
           formData.threshold >= 0;
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      >
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: "spring", duration: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto relative transition-colors duration-300"
        >
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
          >
            <XIcon size={24} />
          </button>

          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
              {editItem ? 'Edit Inventory Item' : 'Add New Inventory Item'}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {editItem ? 'Update the item details below' : 'Fill in the details to add a new item to inventory'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Responsive Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Left Column */}
              <div className="space-y-4">
                {/* Name Field */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Item Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={e => handleInputChange('name', e.target.value)}
                    className={`w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${
                      errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600 focus:border-blue-500'
                    }`}
                    placeholder="e.g., River Sand, Red Bricks, Cement"
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>

                {/* Location Field */}
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

                {/* Category Field */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={e => handleInputChange('category', e.target.value)}
                    className={`w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${
                      errors.category ? 'border-red-500' : 'border-gray-300 dark:border-gray-600 focus:border-blue-500'
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

                {/* Quantity and Unit */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Quantity *
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.quantity}
                      onChange={e => handleInputChange('quantity', parseInt(e.target.value) || 0)}
                      className={`w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${
                        errors.quantity ? 'border-red-500' : 'border-gray-300 dark:border-gray-600 focus:border-blue-500'
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
                      className={`w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${
                        errors.unit ? 'border-red-500' : 'border-gray-300 dark:border-gray-600 focus:border-blue-500'
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
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                {/* Low Stock Threshold */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Low Stock Threshold *
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.threshold}
                    onChange={e => handleInputChange('threshold', parseInt(e.target.value) || 0)}
                    className={`w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${
                      errors.threshold ? 'border-red-500' : 'border-gray-300 dark:border-gray-600 focus:border-blue-500'
                    }`}
                    placeholder="e.g., 10"
                  />
                  {errors.threshold && <p className="text-red-500 text-sm mt-1">{errors.threshold}</p>}
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Alert when stock falls below this amount
                  </p>
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
                    className={`w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white ${
                      errors.supplier_info ? 'border-red-500' : 'border-gray-300 dark:border-gray-600 focus:border-blue-500'
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
                    rows={4}
                  />
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="px-6 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving || !isFormValid()}
                className="px-6 py-3 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-200"
              >
                {saving && <RefreshCwIcon size={16} className="animate-spin mr-2" />}
                {editItem ? 'Update Item' : 'Add Item'}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const InventoryManagement: React.FC<InventoryManagementProps> = ({ userRole }) => {
  const toast = useToast();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [stats, setStats] = useState<InventoryStats>({ total: 0, active: 0, inactive: 0, low_stock: 0, categories: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load inventory data from backend
  useEffect(() => {
    loadInventoryData();
    loadStats();
  }, []);

  const loadInventoryData = async () => {
    try {
      setLoading(true);
      const result = await inventoryService.getAllItems();
      setInventory(result.items || []);
    } catch (err: any) {
      console.error('Failed to load inventory:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Failed to load inventory data';
      toast.error('Failed to load inventory', errorMessage);
      // Set empty inventory if loading fails
      setInventory([]);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await inventoryService.getStats();
      if (statsData) {
        setStats(statsData);
      }
    } catch (err: any) {
      console.error('Failed to load stats:', err);
      // Set default stats if loading fails
      setStats({ total: 0, active: 0, inactive: 0, low_stock: 0, categories: 0 });
    }
  };

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         item.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const handleEditItem = (item: InventoryItem) => {
    setSelectedItem(item);
    setShowCreateModal(true);
  };

  const handleDeleteItem = async (itemId: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await inventoryService.deleteItem(itemId);
        setInventory(inventory.filter(item => item.id !== itemId));
        await loadStats(); // Refresh stats
        toast.success('Item deleted successfully');
      } catch (err: any) {
        console.error('Failed to delete item:', err);
        toast.error('Failed to delete item', err.message || 'Unknown error');
      }
    }
  };

  const handleSubmitItem = async (itemData: CreateInventoryItem) => {
    try {
      setSaving(true);
      if (selectedItem) {
        // Edit existing item
        const updatedItem = await inventoryService.updateItem(selectedItem.id, itemData);
        setInventory(prevInventory => prevInventory.map(item =>
          item.id === selectedItem.id ? updatedItem : item
        ));
        toast.success('Item updated successfully');
      } else {
        // Add new item
        const newItem = await inventoryService.createItem(itemData);
        setInventory(prevInventory => [...prevInventory, newItem]);
        toast.success('Item created successfully');
      }
      setShowCreateModal(false);
      setSelectedItem(null);
      await loadStats(); // Refresh stats
    } catch (err: any) {
      console.error('Failed to save item:', err);
      toast.error('Failed to save item', err.message || 'Unknown error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 xs:p-6">
      {/* Beautiful background pattern */}
      <div className="absolute inset-0 opacity-5 dark:opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0l-2 4 2 4z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")"
        }}></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          <div className="flex flex-col xs:flex-row justify-between items-start xs:items-center gap-4">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-800 via-green-600 to-blue-600 dark:from-white dark:via-green-400 dark:to-blue-400 bg-clip-text text-transparent">
                Inventory Management
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">Manage your hardware store inventory with Sri Lankan suppliers and local pricing</p>
            </div>
            
            <div className="flex gap-2">
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                onClick={() => {
                  loadInventoryData();
                  loadStats();
                }}
                disabled={loading}
                className="flex items-center px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl 
                           hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 shadow-lg hover:shadow-xl
                           focus:outline-none focus:ring-2 focus:ring-gray-500/20 disabled:opacity-50"
              >
                <RefreshCwIcon size={20} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </motion.button>
              
              {['admin', 'warehouse'].includes(userRole) && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-xl 
                             hover:from-green-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl
                             focus:outline-none focus:ring-2 focus:ring-green-500/20"
                >
                  <PlusIcon size={20} className="mr-2" />
                  Add Item
                </motion.button>
              )}
            </div>
          </div>



      {/* Stats Overview */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <div className="bg-white dark:bg-gray-800 p-4 xs:p-6 rounded-lg shadow transition-colors duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Items</p>
              <p className="text-xl xs:text-2xl font-semibold text-gray-800 dark:text-white">
                {loading ? '...' : (stats?.total ?? inventory.length)}
              </p>
            </div>
            <PackageIcon size={20} className="text-primary-500" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 xs:p-6 rounded-lg shadow transition-colors duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Active Items</p>
              <p className="text-xl xs:text-2xl font-semibold text-gray-800 dark:text-white">
                {loading ? '...' : (stats?.active ?? inventory.length)}
              </p>
            </div>
            <PackageIcon size={20} className="text-green-500" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 xs:p-6 rounded-lg shadow transition-colors duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Low Stock Items</p>
              <p className="text-xl xs:text-2xl font-semibold text-gray-800 dark:text-white">
                {loading ? '...' : (stats?.low_stock ?? inventory.filter(item => item.quantity <= item.threshold).length)}
              </p>
            </div>
            <AlertTriangleIcon size={20} className="text-warning-500" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 xs:p-6 rounded-lg shadow transition-colors duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Categories</p>
              <p className="text-xl xs:text-2xl font-semibold text-gray-800 dark:text-white">
                {loading ? '...' : (stats?.categories ?? 0)}
              </p>
            </div>
            <PackageIcon size={20} className="text-blue-500" />
          </div>
        </div>
      </motion.div>

      {/* Refresh Button */}
      <div className="flex justify-end">
        <button
          onClick={() => {
            loadInventoryData();
            loadStats();
          }}
          disabled={loading}
          className="flex items-center px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 disabled:opacity-50"
        >
          <RefreshCwIcon size={16} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <SearchIcon size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Search inventory..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-10 w-full rounded-lg border-gray-300 dark:border-gray-600 focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-50 dark:bg-gray-700 dark:text-white text-sm xs:text-base"
          />
        </div>
        <div className="flex items-center gap-2">
          <FilterIcon size={18} className="text-gray-400 dark:text-gray-500" />
          <select
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
            className="rounded-lg border-gray-300 dark:border-gray-600 focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-50 dark:bg-gray-700 dark:text-white text-sm xs:text-base"
          >
            <option value="all">All Categories</option>
            {CATEGORIES.ALL.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
            <option value="Sand & Aggregate">Sand & Aggregate</option>
            <option value="Bricks">Bricks</option>
            <option value="Stones">Stones</option>
          </select>
        </div>
      </div>

      {/* Inventory List */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden transition-colors duration-300"
      >
        {loading ? (
          <div className="p-8 text-center">
            <RefreshCwIcon size={32} className="animate-spin mx-auto text-primary-500 mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Loading inventory...</p>
          </div>
        ) : filteredInventory.length === 0 ? (
          <div className="p-8 text-center">
            <PackageIcon size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 dark:text-gray-400 text-lg mb-2">No inventory items found</p>
            <p className="text-gray-500 dark:text-gray-500 text-sm">
              {inventory.length === 0 
                ? 'Get started by adding your first inventory item.'
                : 'Try adjusting your search or filter criteria.'
              }
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Item
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Last Updated
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredInventory.map(item => (
                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">{item.name}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{item.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">{item.category}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {item.quantity} {item.unit}
                        </div>
                        {item.quantity <= item.threshold && (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                            Low Stock
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {item.location}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {item.lastUpdated}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {['admin', 'warehouse'].includes(userRole) && (
                          <>
                            <button
                              onClick={() => handleEditItem(item)}
                              className="text-primary-500 hover:text-primary-600 mr-4"
                            >
                              <EditIcon size={18} />
                            </button>
                            <button
                              onClick={() => handleDeleteItem(item.id)}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                            >
                              <TrashIcon size={18} />
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden">
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredInventory.map(item => (
                  <div key={item.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">{item.name}</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{item.id}</p>
                      </div>
                      {['admin', 'warehouse'].includes(userRole) && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditItem(item)}
                            className="text-primary-500 hover:text-primary-600"
                          >
                            <EditIcon size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          >
                            <TrashIcon size={16} />
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Category:</span>
                        <span className="ml-1 text-gray-900 dark:text-white">{item.category}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Location:</span>
                        <span className="ml-1 text-gray-900 dark:text-white">{item.location}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Quantity:</span>
                        <span className="ml-1 text-gray-900 dark:text-white">{item.quantity} {item.unit}</span>
                        {item.quantity <= item.threshold && (
                          <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                            Low Stock
                          </span>
                        )}
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Updated:</span>
                        <span className="ml-1 text-gray-900 dark:text-white">{item.lastUpdated}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </motion.div>

      {/* Inventory Modal */}
      <InventoryModal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setSelectedItem(null);
          // Clear any errors when closing modal (now handled by toast)
        }}
        onSubmit={handleSubmitItem}
        editItem={selectedItem}
        saving={saving}
      />
        </motion.div>
      </div>
    </div>
  );
};

export default InventoryManagement;
