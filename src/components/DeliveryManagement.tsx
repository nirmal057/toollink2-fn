import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DeliveryManagementSystem from '../pages/DeliveryManagementSystem';
import { useAuth } from '../hooks/useAuth';

/**
 * Delivery Management Integration Component
 *
 * This component provides role-based access to the comprehensive delivery management system.
 * It integrates with the existing authentication system and provides appropriate functionality
 * based on user roles.
 *
 * Features per role:
 * - Admin: Complete delivery oversight, analytics, driver management
 * - Warehouse: Outbound delivery management, driver assignments
 * - Cashier: Customer delivery processing and tracking
 * - Driver: Personal delivery assignments and status updates
 * - Customer: Track personal orders and deliveries
 */

const DeliveryManagement: React.FC = () => {
    const { user, isAuthenticated } = useAuth();

    // Redirect if not authenticated
    if (!isAuthenticated || !user) {
        return <Navigate to="/auth/login" replace />;
    }

    // Check if user has access to delivery management
    const allowedRoles = ['admin', 'warehouse', 'cashier', 'driver', 'customer'];
    if (!allowedRoles.includes(user.role)) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                    <div className="text-center">
                        <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                            <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                            Access Denied
                        </h2>
                        <p className="text-gray-600 dark:text-gray-300 mb-6">
                            You don't have permission to access the delivery management system.
                        </p>
                        <button
                            onClick={() => window.history.back()}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Go Back
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <Routes>
            <Route
                path="/*"
                element={<DeliveryManagementSystem userRole={user.role} />}
            />
            <Route
                path=""
                element={<DeliveryManagementSystem userRole={user.role} />}
            />
        </Routes>
    );
};

export default DeliveryManagement;

/**
 * Usage Examples:
 *
 * 1. In your main App.tsx or routing file:
 *
 * import DeliveryManagement from './components/DeliveryManagement';
 *
 * <Routes>
 *   <Route path="/delivery-management/*" element={<DeliveryManagement />} />
 * </Routes>
 *
 * 2. In role-based dashboard components:
 *
 * // For Admin Dashboard
 * <Link to="/delivery-management" className="nav-link">
 *   Delivery Management
 * </Link>
 *
 * // For Driver Dashboard
 * <Link to="/delivery-management" className="nav-link">
 *   My Deliveries
 * </Link>
 *
 * // For Customer Dashboard
 * <Link to="/delivery-management" className="nav-link">
 *   Track Orders
 * </Link>
 *
 * 3. Role-based menu items:
 *
 * const menuItems = {
 *   admin: [
 *     { path: '/delivery-management', label: 'Delivery Management', icon: TruckIcon },
 *     // ... other admin items
 *   ],
 *   warehouse: [
 *     { path: '/delivery-management', label: 'Outbound Deliveries', icon: TruckIcon },
 *     // ... other warehouse items
 *   ],
 *   driver: [
 *     { path: '/delivery-management', label: 'My Deliveries', icon: TruckIcon },
 *     // ... other driver items
 *   ],
 *   customer: [
 *     { path: '/delivery-management', label: 'Track Orders', icon: PackageIcon },
 *     // ... other customer items
 *   ]
 * };
 *
 * 4. Integration with existing order system:
 *
 * // When creating orders, automatically create deliveries
 * const handleOrderApproval = async (orderId) => {
 *   try {
 *     // Approve order
 *     await approveOrder(orderId);
 *
 *     // Create delivery automatically
 *     const deliveryResponse = await fetch('/api/delivery-management/deliveries', {
 *       method: 'POST',
 *       headers: {
 *         'Authorization': `Bearer ${token}`,
 *         'Content-Type': 'application/json'
 *       },
 *       body: JSON.stringify({
 *         orderId,
 *         warehouseId: order.warehouseId,
 *         warehouseName: order.warehouseName,
 *         items: order.items,
 *         deliveryDate: order.preferredDeliveryDate,
 *         timeSlot: order.preferredTimeSlot,
 *         priority: order.priority || 'normal',
 *         deliveryAddress: order.deliveryAddress,
 *         customerName: order.customerName,
 *         customerEmail: order.customerEmail,
 *         contactNumber: order.contactNumber
 *       })
 *     });
 *
 *     if (deliveryResponse.ok) {
 *       showSuccess('Order approved and delivery scheduled');
 *     }
 *   } catch (error) {
 *     showError('Failed to process order approval');
 *   }
 * };
 */
