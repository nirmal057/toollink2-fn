import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PackageIcon, PlusIcon, SearchIcon, FilterIcon, EditIcon, TrashIcon, AlertTriangleIcon, XIcon, RefreshCwIcon } from 'lucide-react';
import { inventoryService, InventoryItem, CreateInventoryItem, InventoryStats } from '../services/inventoryService';
import { useToast } from '../contexts/GlobalNotificationContext';
import { useAuth } from '../hooks/useAuth';
import InventoryCategoryChart from '../components/InventoryCategoryChart';
import InventoryForm from '../components/InventoryForm';

interface InventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (item: CreateInventoryItem) => void;
  editItem?: InventoryItem | null;
  saving?: boolean;
  userWarehouse?: string;
}

interface InventoryManagementProps {
  userRole: 'admin' | 'warehouse' | 'cashier' | 'customer' | string;
}

// Function to determine user's warehouse based on email
const getUserWarehouse = (email: string, role: string): string => {
  if (role === 'admin') return 'all'; // Admin can see all warehouses

  const warehouseMap: { [key: string]: string } = {
    'house1@toollink.com': 'warehouse1',
    'house2@toollink.com': 'warehouse2',
    'house3@toollink.com': 'warehouse3',
    'main_house@toollink.com': 'main_warehouse'
  };

  return warehouseMap[email] || 'main_warehouse';
};

const InventoryModal: React.FC<InventoryModalProps> = ({ isOpen, onClose, onSubmit, editItem, saving = false, userWarehouse = 'main_warehouse' }) => {
  if (!isOpen) return null;

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
          className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-4xl max-h-[95vh] overflow-y-auto relative transition-colors duration-300"
        >
          <button
            onClick={onClose}
            className="absolute right-6 top-6 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors z-10"
          >
            <XIcon size={24} />
          </button>

          {/* Header - Matching QuickAddInventory */}
          <div className="bg-gradient-to-br from-slate-50 via-green-50 to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6 rounded-t-xl">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-4">
                <div className="bg-gradient-to-r from-green-500 to-blue-600 p-3 rounded-xl">
                  <PackageIcon size={32} className="text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    {editItem ? 'Edit Inventory Item' : 'Quick Add Inventory'}
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    {editItem ? 'Update the item details below' : 'Quickly add new inventory items to the system'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-6">
            <InventoryForm
              onSubmit={onSubmit}
              editItem={editItem}
              saving={saving}
              userWarehouse={userWarehouse}
              isModal={true}
            />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const InventoryManagement: React.FC<InventoryManagementProps> = ({ userRole }) => {
  const { user } = useAuth();
  const toast = useToast();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [stats, setStats] = useState<InventoryStats>({ total: 0, active: 0, inactive: 0, low_stock: 0, categories: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  // Delete confirmation modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<InventoryItem | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Get current user's warehouse
  const currentUserWarehouse = getUserWarehouse(user?.email || '', userRole);

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
      console.log('Loading inventory stats...');
      const statsData = await inventoryService.getStats();
      console.log('Received stats data:', statsData);
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
    const item = inventory.find(i => i.id === itemId);
    if (!item) {
      toast.error('Item not found');
      return;
    }

    // Show beautiful delete confirmation modal
    setItemToDelete(item);
    setShowDeleteModal(true);
  };

  const confirmDeleteItem = async () => {
    if (!itemToDelete) return;

    setDeleteLoading(true);
    try {
      await inventoryService.deleteItem(itemToDelete.id);
      setInventory(inventory.filter(item => item.id !== itemToDelete.id));
      await loadStats(); // Refresh stats
      toast.success('Item deleted successfully');
    } catch (err: any) {
      console.error('Failed to delete item:', err);
      toast.error('Failed to delete item', err.message || 'Unknown error');
    } finally {
      setDeleteLoading(false);
      setShowDeleteModal(false);
      setItemToDelete(null);
    }
  };

  const cancelDeleteItem = () => {
    setShowDeleteModal(false);
    setItemToDelete(null);
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
                             focus:outline-none focus:ring-2 focus:ring-green-500/20 group relative overflow-hidden"
                >
                  {/* Animated background effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <PlusIcon size={20} className="mr-2 relative z-10 group-hover:scale-110 transition-transform duration-200" />
                  <span className="relative z-10 font-medium">➕ Add New Item</span>
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

          {/* Inventory Category Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <InventoryCategoryChart
              height={350}
              showControls={true}
              chartType="pie"
              className="mb-6"
            />
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
                <option value="Cement">Cement</option>
                <option value="Steel & Reinforcement">Steel & Reinforcement</option>
                <option value="Paint & Chemicals">Paint & Chemicals</option>
                <option value="Electrical Items">Electrical Items</option>
                <option value="Plumbing Supplies">Plumbing Supplies</option>
                <option value="Tools & Equipment">Tools & Equipment</option>
                <option value="Hardware & Fasteners">Hardware & Fasteners</option>
                <option value="Tiles & Ceramics">Tiles & Ceramics</option>
                <option value="Roofing Materials">Roofing Materials</option>
                <option value="Safety Equipment">Safety Equipment</option>
                <option value="Sand & Aggregate">Sand & Aggregate</option>
                <option value="Bricks">Bricks</option>
                <option value="Masonry Blocks">Masonry Blocks</option>
                <option value="Stones">Stones</option>
                <option value="Materials">Materials</option>
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
            userWarehouse={currentUserWarehouse}
          />

          {/* Beautiful Delete Confirmation Modal */}
          {showDeleteModal && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300 border border-gray-200 dark:border-gray-700">
                <div className="p-6 text-center">
                  {/* Warning Icon */}
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/30 dark:to-red-800/30 rounded-full flex items-center justify-center">
                    <AlertTriangleIcon
                      size={32}
                      className="text-red-600 dark:text-red-400"
                    />
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Delete Inventory Item
                  </h3>

                  {/* Message */}
                  <p className="text-gray-600 dark:text-gray-300 mb-6">
                    Are you sure you want to permanently delete{' '}
                    <span className="font-semibold text-gray-900 dark:text-white">
                      "{itemToDelete?.name}"
                    </span>{' '}
                    from inventory?<br />
                    <span className="text-sm text-red-600 dark:text-red-400 font-medium">
                      This action cannot be undone!
                    </span>
                  </p>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                    <button
                      onClick={cancelDeleteItem}
                      disabled={deleteLoading}
                      className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={confirmDeleteItem}
                      disabled={deleteLoading}
                      className="flex-1 px-4 py-2.5 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg font-medium transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {deleteLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Deleting...
                        </>
                      ) : (
                        <>
                          <TrashIcon size={16} />
                          Delete Item
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default InventoryManagement;
