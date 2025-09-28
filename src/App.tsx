import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import ForgotPassword from './pages/Auth/ForgotPassword';
import ResetPassword from './pages/Auth/ResetPassword';
import Dashboard from './pages/Dashboard';
import MainLayout from './components/Layout/MainLayout';
import LandingPage from './pages/LandingPage';
import OrderManagement from './pages/OrderManagement';
import InventoryManagement from './pages/InventoryManagement';
import QuickAddInventory from './pages/QuickAddInventory';
import DriverPortal from './pages/DriverPortal';
import DriverManagement from './pages/DriverManagement';
import DeliveryCalendar from './pages/DeliveryCalendar';
import DeliveryManagementSystem from './pages/DeliveryManagementSystem';
import Reports from './pages/Reports';
import Feedback from './pages/Feedback';
import ContactPage from './pages/ContactPage';
import Profile from './pages/Profile';
import MaterialPrediction from './pages/MaterialPrediction';
import UserManagement from './pages/UserManagement';
import NewUserManagement from './components/UserManagement';
import CustomerApproval from './pages/CustomerApproval';
import CustomerMessages from './pages/CustomerMessages';
import AdminDashboard from './pages/AdminDashboard';
import ActivitiesPage from './pages/ActivitiesPage';
import AuditLogs from './pages/AuditLogs';
import SystemReports from './pages/SystemReports';
import WarehouseOrderReceived from './pages/WarehouseOrderReceived';
import { AuthProvider, useAuth, RoleGuard } from './hooks/useAuth';
import { ThemeProvider } from './contexts/ThemeContext';
import { GlobalNotificationProvider } from './contexts/GlobalNotificationContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { ROLES } from './services/rbacService';
import ToastContainer from './components/UI/ToastContainer';
import SimpleAdminGuard from './components/SimpleAdminGuard';

// Loading component
function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
    </div>
  );
}

// Unauthorized component
function Unauthorized() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Access Denied</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">You don't have permission to access this page.</p>
        <button
          onClick={() => window.history.back()}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
        >
          Go Back
        </button>
      </div>
    </div>
  );
}

// App routes component
function AppRoutes() {
  const { isAuthenticated, user, isLoading, logout } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <Routes>      {/* Public routes */}
      <Route
        path="/"
        element={<LandingPage />}
      />
      <Route
        path="/auth/login"
        element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" replace />}
      />
      <Route
        path="/login"
        element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" replace />}
      />
      <Route
        path="/auth/register"
        element={!isAuthenticated ? <Register /> : <Navigate to="/dashboard" replace />}
      />      <Route
        path="/register"
        element={!isAuthenticated ? <Register /> : <Navigate to="/dashboard" replace />}
      />
      <Route
        path="/auth/forgot-password"
        element={!isAuthenticated ? <ForgotPassword /> : <Navigate to="/dashboard" replace />}
      />
      <Route
        path="/auth/reset-password"
        element={!isAuthenticated ? <ResetPassword /> : <Navigate to="/dashboard" replace />}
      />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Protected Routes */}
      {isAuthenticated && user ? (
        <Route element={<MainLayout userRole={user.role} onLogout={logout} />}>
          {/* Dashboard route - general dashboard accessible to all authenticated users */}
          <Route
            path="/dashboard"
            element={<Dashboard userRole={user.role} />}
          />

          {/* Order routes - accessible by customer, admin, and cashier */}
          <Route
            path="/orders"
            element={
              <RoleGuard roles={[ROLES.CUSTOMER, ROLES.ADMIN, ROLES.CASHIER, ROLES.WAREHOUSE]} fallback={<Unauthorized />}>
                <OrderManagement userRole={user.role} />
              </RoleGuard>
            }
          />

          {/* Inventory routes - accessible by admin, warehouse, user */}
          <Route
            path="/inventory"
            element={
              <RoleGuard roles={[ROLES.ADMIN, ROLES.WAREHOUSE, ROLES.USER]} fallback={<Unauthorized />}>
                <InventoryManagement userRole={user.role} />
              </RoleGuard>
            }
          />

          {/* Quick Add Inventory route - accessible by admin and warehouse */}
          <Route
            path="/inventory/quick-add"
            element={
              <RoleGuard roles={[ROLES.ADMIN, ROLES.WAREHOUSE]} fallback={<Unauthorized />}>
                <QuickAddInventory userRole={user.role} />
              </RoleGuard>
            }
          />

          {/* Driver Management route - accessible by admin and warehouse */}
          <Route
            path="/driver-management"
            element={
              <RoleGuard roles={[ROLES.ADMIN, ROLES.WAREHOUSE]} fallback={<Unauthorized />}>
                <DriverManagement userRole={user.role} />
              </RoleGuard>
            }
          />

          {/* Driver Portal route - accessible by drivers only */}
          <Route
            path="/driver-portal"
            element={<DriverPortal />}
          />

          {/* Delivery Management System - accessible by admin, warehouse, cashier, drivers, and customers */}
          <Route
            path="/deliveries"
            element={
              <RoleGuard roles={[ROLES.ADMIN, ROLES.WAREHOUSE, ROLES.CASHIER, ROLES.DRIVER, ROLES.CUSTOMER]} fallback={<Unauthorized />}>
                <DeliveryManagementSystem userRole={user.role} />
              </RoleGuard>
            }
          />

          {/* Alternative delivery management route */}
          <Route
            path="/delivery-management"
            element={
              <RoleGuard roles={[ROLES.ADMIN, ROLES.WAREHOUSE, ROLES.CASHIER, ROLES.DRIVER, ROLES.CUSTOMER]} fallback={<Unauthorized />}>
                <DeliveryManagementSystem userRole={user.role} />
              </RoleGuard>
            }
          />

          {/* Delivery Calendar - accessible by admin, warehouse, cashier */}
          <Route
            path="/delivery-calendar"
            element={
              <RoleGuard roles={[ROLES.ADMIN, ROLES.WAREHOUSE, ROLES.CASHIER]} fallback={<Unauthorized />}>
                <DeliveryCalendar userRole={user.role} />
              </RoleGuard>
            }
          />

          {/* Warehouse Order Reception - accessible by warehouse and admin */}
          <Route
            path="/warehouse/orders/received/:mainOrderId"
            element={
              <RoleGuard roles={[ROLES.ADMIN, ROLES.WAREHOUSE]} fallback={<Unauthorized />}>
                <WarehouseOrderReceived />
              </RoleGuard>
            }
          />

          {/* Common routes - all authenticated users */}
          <Route path="/messages" element={<CustomerMessages userRole={user.role} />} />
          {/* Admin and Cashier Message Dashboard */}
          <Route
            path="/admin/messages"
            element={
              <RoleGuard roles={[ROLES.ADMIN, ROLES.CASHIER]} fallback={<Unauthorized />}>
                <CustomerMessages userRole={user.role} />
              </RoleGuard>
            }
          />
          <Route
            path="/reports"
            element={
              <RoleGuard roles={[ROLES.ADMIN, ROLES.WAREHOUSE, ROLES.CASHIER, ROLES.USER]} fallback={<Unauthorized />}>
                <Reports userRole={user.role} />
              </RoleGuard>
            }
          />
          <Route path="/feedback" element={<Feedback userRole={user.role} />} />
          <Route path="/profile" element={<Profile userRole={user.role} />} />

          {/* Admin-only routes */}
          <Route
            path="/admin"
            element={
              <SimpleAdminGuard>
                <AdminDashboard />
              </SimpleAdminGuard>
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <SimpleAdminGuard>
                <AdminDashboard />
              </SimpleAdminGuard>
            }
          />
          <Route
            path="/admin/audit-logs"
            element={
              <SimpleAdminGuard>
                <AuditLogs />
              </SimpleAdminGuard>
            }
          />
          <Route
            path="/admin/reports"
            element={
              <SimpleAdminGuard>
                <SystemReports />
              </SimpleAdminGuard>
            }
          />
          <Route
            path="/admin/activities"
            element={
              <SimpleAdminGuard>
                <ActivitiesPage />
              </SimpleAdminGuard>
            }
          />
          <Route
            path="/admin/messages"
            element={
              <SimpleAdminGuard>
                <CustomerMessages userRole={user.role} />
              </SimpleAdminGuard>
            }
          />
          <Route
            path="/predictions"
            element={
              <SimpleAdminGuard>
                <MaterialPrediction userRole={user.role} />
              </SimpleAdminGuard>
            }
          />
          <Route
            path="/users"
            element={
              <SimpleAdminGuard>
                <UserManagement />
              </SimpleAdminGuard>
            }
          />
          <Route
            path="/users-new"
            element={
              <SimpleAdminGuard>
                <NewUserManagement />
              </SimpleAdminGuard>
            }
          />

          {/* Customer approval route - accessible by admin and cashier */}
          <Route
            path="/customer-approval"
            element={
              <RoleGuard roles={[ROLES.ADMIN, ROLES.CASHIER]} fallback={<Unauthorized />}>
                <CustomerApproval />
              </RoleGuard>
            }
          />
        </Route>
      ) : null}

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <GlobalNotificationProvider>
          <NotificationProvider>
            <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
              <AppRoutes />
              <ToastContainer />
            </Router>
          </NotificationProvider>
        </GlobalNotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
