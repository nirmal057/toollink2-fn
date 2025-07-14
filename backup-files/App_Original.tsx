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
import DeliveryCalendar from './pages/DeliveryCalendar';
import Notifications from './pages/Notifications';
import Reports from './pages/Reports';
import Feedback from './pages/Feedback';
import Profile from './pages/Profile';
import MaterialPrediction from './pages/MaterialPrediction';
import UserManagement from './pages/UserManagement';
import CustomerApproval from './pages/CustomerApproval';
import AdminDashboard from './pages/AdminDashboard';
import AuditLogs from './pages/AuditLogs';
import SystemReports from './pages/SystemReports';
import { AuthProvider, useAuth, RoleGuard } from './hooks/useAuth';
import { ThemeProvider } from './contexts/ThemeContext';
import { ROLES } from './services/rbacService';
// Test components - REMOVE IN PRODUCTION
// import SimpleHeaderTest from './components/Layout/SimpleHeaderTest';
// import HeaderButtonsTest from './components/Layout/HeaderButtonsTest';
// import UltraSimpleTest from './components/Layout/UltraSimpleTest';
// import DirectHeaderTest from './components/Layout/DirectHeaderTest';
// import DashboardTest from './components/Layout/DashboardTest';
import ZIndexTest from './pages/ZIndexTest';

// Loading component
function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
    </div>
  );
}

// Unauthorized component
function Unauthorized() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
        <p className="text-gray-600 mb-6">You don't have permission to access this page.</p>
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
        element={!isAuthenticated ? <LandingPage /> : <Navigate to="/dashboard" replace />}
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
      {/* Debug routes for header testing - REMOVE IN PRODUCTION */}
      {/* <Route path="/header-test" element={<SimpleHeaderTest />} /> */}
      {/* <Route path="/buttons-test" element={<HeaderButtonsTest />} /> */}
      {/* <Route path="/ultra-simple" element={<UltraSimpleTest />} /> */}
      {/* <Route path="/direct-header" element={<DirectHeaderTest />} /> */}
      {/* <Route path="/dashboard-test" element={<DashboardTest />} /> */}
      {/* <Route path="/direct-header-test" element={<DirectHeaderTest />} /> */}
      <Route path="/z-index-test" element={<ZIndexTest />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Protected Routes */}
      {isAuthenticated && user ? (
        <Route element={<MainLayout userRole={user.role} onLogout={logout} />}>
          <Route path="/dashboard" element={<Dashboard userRole={user.role} />} />
          
          {/* Order routes - accessible by customer, admin, and cashier */}
          <Route 
            path="/orders" 
            element={
              <RoleGuard roles={[ROLES.CUSTOMER, ROLES.ADMIN, ROLES.CASHIER]} fallback={<Unauthorized />}>
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
          
          {/* Delivery routes - accessible by admin, warehouse, cashier */}
          <Route 
            path="/deliveries" 
            element={
              <RoleGuard roles={[ROLES.ADMIN, ROLES.WAREHOUSE, ROLES.CASHIER]} fallback={<Unauthorized />}>
                <DeliveryCalendar userRole={user.role} />
              </RoleGuard>
            } 
          />
          
          {/* Common routes - all authenticated users */}
          <Route path="/notifications" element={<Notifications userRole={user.role} />} />          <Route 
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
              <RoleGuard roles={[ROLES.ADMIN]} fallback={<Unauthorized />}>
                <AdminDashboard />
              </RoleGuard>
            } 
          />
          <Route 
            path="/admin/dashboard" 
            element={
              <RoleGuard roles={[ROLES.ADMIN]} fallback={<Unauthorized />}>
                <AdminDashboard />
              </RoleGuard>
            } 
          />
          <Route 
            path="/admin/audit-logs" 
            element={
              <RoleGuard roles={[ROLES.ADMIN]} fallback={<Unauthorized />}>
                <AuditLogs />
              </RoleGuard>
            } 
          />
          <Route 
            path="/admin/reports" 
            element={
              <RoleGuard roles={[ROLES.ADMIN]} fallback={<Unauthorized />}>
                <SystemReports />
              </RoleGuard>
            } 
          />
          <Route 
            path="/predictions" 
            element={
              <RoleGuard roles={[ROLES.ADMIN]} fallback={<Unauthorized />}>
                <MaterialPrediction userRole={user.role} />
              </RoleGuard>
            } 
          />
          <Route 
            path="/users" 
            element={
              <RoleGuard roles={[ROLES.ADMIN]} fallback={<Unauthorized />}>
                <UserManagement />
              </RoleGuard>
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
        <Router future={{ v7_startTransition: true }}>
          <AppRoutes />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;