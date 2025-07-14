import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { rbacService } from '../services/rbacService';

const AuthDebugPage: React.FC = () => {
  const { user, isAuthenticated, login, logout } = useAuth();
  const [debugInfo, setDebugInfo] = useState<any>({});

  useEffect(() => {
    const updateDebugInfo = () => {
      setDebugInfo({
        user,
        isAuthenticated,
        localStorage: {
          user: localStorage.getItem('user'),
          token: localStorage.getItem('accessToken'),
        },
        rbac: {
          currentUser: rbacService.getCurrentUser(),
          hasAdminRole: rbacService.hasRole('admin'),
          hasFullAccess: rbacService.hasPermission('*'),
        }
      });
    };

    updateDebugInfo();
    const interval = setInterval(updateDebugInfo, 1000);
    return () => clearInterval(interval);
  }, [user, isAuthenticated]);

  const handleAdminLogin = async () => {
    try {
      const result = await login('admin@toollink.com', 'admin123');
      console.log('Admin login result:', result);
    } catch (error) {
      console.error('Admin login error:', error);
    }
  };

  const forceAdminAccess = () => {
    const adminUser = {
      id: '1',
      email: 'admin@toollink.com',
      name: 'Admin User',
      role: 'admin',
      isActive: true,
      createdAt: new Date().toISOString()
    };

    localStorage.setItem('user', JSON.stringify(adminUser));
    localStorage.setItem('accessToken', 'mock-admin-token');
    rbacService.setCurrentUser({ role: 'admin' });
    
    // Force page reload to sync everything
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">Authentication Debug</h1>
        
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold mb-2">Current State</h2>
            <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>

          <div className="space-y-2">
            <button
              onClick={handleAdminLogin}
              className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
            >
              Login as Admin (Regular)
            </button>
            
            <button
              onClick={forceAdminAccess}
              className="w-full bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
            >
              Force Admin Access (Debug)
            </button>
            
            <button
              onClick={logout}
              className="w-full bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
            >
              Logout
            </button>
          </div>

          <div className="space-y-2">
            <a
              href="/admin"
              className="block w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 text-center"
            >
              Go to Admin Dashboard
            </a>
            
            <a
              href="/dashboard"
              className="block w-full bg-purple-500 text-white py-2 px-4 rounded hover:bg-purple-600 text-center"
            >
              Go to Main Dashboard
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthDebugPage;
