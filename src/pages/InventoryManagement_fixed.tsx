import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PackageIcon, PlusIcon, SearchIcon, FilterIcon, EditIcon, TrashIcon, AlertTriangleIcon, XIcon, RefreshCwIcon } from 'lucide-react';
import { inventoryService, InventoryItem, CreateInventoryItem, InventoryStats } from '../services/inventoryService';

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
const CATEGORIES = [
  'Construction Materials',
  'Tiles & Flooring',
  'Steel & Metal',
  'Plumbing',
  'Electrical',
  'Paint & Chemicals',
  'Tools & Machinery',
  'Roofing Materials',
  'Bathroom Fittings',
  'Hardware & Accessories'
];

const InventoryModal: React.FC<InventoryModalProps> = ({ isOpen, onClose, onSubmit, editItem, saving = false }) => {
  const [formData, setFormData] = useState({
    name: editItem?.name || '',
    category: editItem?.category || CATEGORIES[0],
    quantity: editItem?.quantity || 0,
    unit: editItem?.unit || '',
    threshold: editItem?.threshold || 0,
    location: editItem?.location || '',
    description: editItem?.description || '',
    unit_price: editItem?.unit_price || 0,
    supplier_info: editItem?.supplier_info || ''
  });

  useEffect(() => {
    if (editItem) {
      setFormData({
        name: editItem.name || '',
        category: editItem.category || CATEGORIES[0],
        quantity: editItem.quantity || 0,
        unit: editItem.unit || '',
        threshold: editItem.threshold || 0,
        location: editItem.location || '',
        description: editItem.description || '',
        unit_price: editItem.unit_price || 0,
        supplier_info: editItem.supplier_info || ''
      });
    } else {
      setFormData({
        name: '',
        category: CATEGORIES[0],
        quantity: 0,
        unit: '',
        threshold: 0,
        location: '',
        description: '',
        unit_price: 0,
        supplier_info: ''
      });
    }
  }, [editItem]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
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
          className="bg-white dark:bg-gray-800 rounded-lg p-4 xs:p-6 w-full max-w-md relative transition-colors duration-300"
        >
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
          >
            <XIcon size={20} />
          </button>
          <h2 className="text-lg xs:text-xl font-semibold mb-4 text-gray-800 dark:text-white pr-8">
            {editItem ? 'Edit Item' : 'Add New Item'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 focus:ring-opacity-50 dark:bg-gray-700 dark:text-white text-sm xs:text-base"
                placeholder="Enter item name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
              <select
                required
                value={formData.category}
                onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 focus:ring-opacity-50 dark:bg-gray-700 dark:text-white text-sm xs:text-base"
              >
                {CATEGORIES.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Quantity</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.quantity}
                  onChange={e => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 0 }))}
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 focus:ring-opacity-50 dark:bg-gray-700 dark:text-white text-sm xs:text-base"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Unit</label>
                <input
                  type="text"
                  required
                  value={formData.unit}
                  onChange={e => setFormData(prev => ({ ...prev, unit: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 focus:ring-opacity-50 dark:bg-gray-700 dark:text-white text-sm xs:text-base"
                  placeholder="e.g., pieces"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Low Stock Threshold</label>
              <input
                type="number"
                required
                min="0"
                value={formData.threshold}
                onChange={e => setFormData(prev => ({ ...prev, threshold: parseInt(e.target.value) || 0 }))}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 focus:ring-opacity-50 dark:bg-gray-700 dark:text-white text-sm xs:text-base"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Location</label>
              <input
                type="text"
                required
                value={formData.location}
                onChange={e => setFormData(prev => ({ ...prev, location: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 focus:ring-opacity-50 dark:bg-gray-700 dark:text-white text-sm xs:text-base"
                placeholder="Enter storage location"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description (Optional)</label>
              <textarea
                value={formData.description}
                onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 focus:ring-opacity-50 dark:bg-gray-700 dark:text-white text-sm xs:text-base"
                placeholder="Item description"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Unit Price</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.unit_price}
                  onChange={e => setFormData(prev => ({ ...prev, unit_price: parseFloat(e.target.value) || 0 }))}
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 focus:ring-opacity-50 dark:bg-gray-700 dark:text-white text-sm xs:text-base"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Supplier Info</label>
                <input
                  type="text"
                  value={formData.supplier_info}
                  onChange={e => setFormData(prev => ({ ...prev, supplier_info: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 focus:ring-opacity-50 dark:bg-gray-700 dark:text-white text-sm xs:text-base"
                  placeholder="Supplier name"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {saving && <RefreshCwIcon size={16} className="animate-spin mr-2" />}
                {editItem ? 'Save Changes' : 'Add Item'}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const InventoryManagement: React.FC<InventoryManagementProps> = ({ userRole }) => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [stats, setStats] = useState<InventoryStats>({ total: 0, active: 0, inactive: 0, low_stock: 0, total_value: 0, categories: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load inventory data from backend
  useEffect(() => {
    loadInventoryData();
    loadStats();
  }, []);

  const loadInventoryData = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await inventoryService.getAllItems();
      setInventory(result.items);
    } catch (err: any) {
      console.error('Failed to load inventory:', err);
      setError(err.message || 'Failed to load inventory data');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await inventoryService.getStats();
      setStats(statsData);
    } catch (err: any) {
      console.error('Failed to load stats:', err);
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
        setError(null); // Clear any previous errors
        await inventoryService.deleteItem(itemId);
        setInventory(inventory.filter(item => item.id !== itemId));
        await loadStats(); // Refresh stats
      } catch (err: any) {
        console.error('Failed to delete item:', err);
        setError('Failed to delete item: ' + (err.message || 'Unknown error'));
      }
    }
  };

  const handleSubmitItem = async (itemData: CreateInventoryItem) => {
    try {
      setSaving(true);
      setError(null); // Clear any previous errors
      if (selectedItem) {
        // Edit existing item
        const updatedItem = await inventoryService.updateItem(selectedItem.id, itemData);
        setInventory(prevInventory => prevInventory.map(item =>
          item.id === selectedItem.id ? updatedItem : item
        ));
      } else {
        // Add new item
        const newItem = await inventoryService.createItem(itemData);
        setInventory(prevInventory => [...prevInventory, newItem]);
      }
      setShowCreateModal(false);
      setSelectedItem(null);
      await loadStats(); // Refresh stats
    } catch (err: any) {
      console.error('Failed to save item:', err);
      setError('Failed to save item: ' + (err.message || 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-4 xs:space-y-6 p-4 xs:p-6"
    >
      <div className="flex flex-col xs:flex-row justify-between items-start xs:items-center gap-4">
        <h1 className="text-xl xs:text-2xl font-bold text-gray-800 dark:text-white">
          Inventory Management
        </h1>
        {['admin', 'warehouse'].includes(userRole) && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center px-3 xs:px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 text-sm xs:text-base w-full xs:w-auto justify-center"
          >
            <PlusIcon size={18} className="mr-2" />
            Add Item
          </button>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-200 px-4 py-3 rounded-lg">
          <div className="flex items-center">
            <AlertTriangleIcon size={20} className="mr-2" />
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-auto"
            >
              <XIcon size={20} />
            </button>
          </div>
        </div>
      )}

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
                {loading ? '...' : stats.total || inventory.length}
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
                {loading ? '...' : stats.active || inventory.length}
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
                {loading ? '...' : stats.low_stock || inventory.filter(item => item.quantity <= item.threshold).length}
              </p>
            </div>
            <AlertTriangleIcon size={20} className="text-warning-500" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 xs:p-6 rounded-lg shadow transition-colors duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Value</p>
              <p className="text-xl xs:text-2xl font-semibold text-gray-800 dark:text-white">
                {loading ? '...' : `$${(stats.total_value || 0).toFixed(2)}`}
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
            {CATEGORIES.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
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
          setError(null); // Clear any errors when closing modal
        }}
        onSubmit={handleSubmitItem}
        editItem={selectedItem}
        saving={saving}
      />
    </motion.div>
  );
};

export default InventoryManagement;
