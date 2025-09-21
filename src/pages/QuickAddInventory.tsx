import React from 'react';
import { AlertCircleIcon } from 'lucide-react';
import { inventoryService, CreateInventoryItem } from '../services/inventoryService';
import { useToast } from '../contexts/GlobalNotificationContext';
import InventoryForm from '../components/InventoryForm';

interface QuickAddInventoryProps {
    userRole: string;
}

const QuickAddInventory: React.FC<QuickAddInventoryProps> = ({ userRole }) => {
    const toast = useToast();

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

    // Handle form submission
    const handleSubmit = async (formData: CreateInventoryItem) => {
        try {
            await inventoryService.createItem(formData);
            toast.success('Inventory Item Added', `${formData.name} has been added successfully!`);
        } catch (err: any) {
            console.error('Failed to add inventory item:', err);
            const errorMessage = err.response?.data?.error || err.message || 'Unknown error';
            toast.error('Failed to Add Item', errorMessage);
        }
    };

    return (
        <InventoryForm
            onSubmit={handleSubmit}
            userWarehouse="main_warehouse"
            isModal={false}
        />
    );
};

export default QuickAddInventory;
