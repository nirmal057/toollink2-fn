import React, { useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { rbacService, PERMISSIONS } from '../services/rbacService';

const DebugAuth: React.FC = () => {
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    console.log('=== AUTH DEBUG ===');
    console.log('User:', user);
    console.log('Is Authenticated:', isAuthenticated);
    console.log('Current User in RBAC:', rbacService.getCurrentUser());
    console.log('Has Full System Access:', rbacService.hasPermission(PERMISSIONS.FULL_SYSTEM_ACCESS));
    console.log('Has Admin Role:', rbacService.hasRole('admin'));
    console.log('==================');
  }, [user, isAuthenticated]);

  return (
    <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
      <h3 className="text-lg font-bold mb-4">Authentication Debug</h3>
      <div className="space-y-2 text-sm">
        <p><strong>User:</strong> {user ? JSON.stringify(user, null, 2) : 'null'}</p>
        <p><strong>Authenticated:</strong> {isAuthenticated.toString()}</p>
        <p><strong>RBAC Current User:</strong> {JSON.stringify(rbacService.getCurrentUser(), null, 2)}</p>
        <p><strong>Has Full System Access:</strong> {rbacService.hasPermission(PERMISSIONS.FULL_SYSTEM_ACCESS).toString()}</p>
        <p><strong>Has Admin Role:</strong> {rbacService.hasRole('admin').toString()}</p>
      </div>
    </div>
  );
};

export default DebugAuth;
