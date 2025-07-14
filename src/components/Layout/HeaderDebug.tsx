import { useState, useCallback } from 'react';
import { BellIcon, UserIcon, MoonIcon, SunIcon } from 'lucide-react';

const HeaderDebug = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleNotifications = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Notifications clicked!');
    setShowNotifications(prev => !prev);
    setShowUserMenu(false);
  }, []);

  const toggleUserMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('User menu clicked!');
    setShowUserMenu(prev => !prev);
    setShowNotifications(false);
  }, []);

  const toggleDarkMode = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Dark mode clicked!');
    setIsDarkMode(prev => !prev);
  }, []);

  return (
    <div className="bg-white border-b p-4">
      <div className="flex justify-end space-x-4">
        {/* Notification Button */}
        <div className="relative">
          <button 
            onClick={toggleNotifications}
            className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600"
            type="button"
          >
            <BellIcon size={20} />
            <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              3
            </span>
          </button>
          
          {/* Notification Dropdown */}
          {showNotifications && (
            <div 
              className="absolute right-0 mt-2 w-64 bg-white border rounded-lg shadow-lg z-50"
              style={{ zIndex: 9999 }}
            >
              <div className="p-4">
                <h3 className="font-bold mb-2">Notifications</h3>
                <div className="space-y-2">
                  <div className="p-2 bg-gray-100 rounded">
                    <p className="text-sm">New order received</p>
                  </div>
                  <div className="p-2 bg-gray-100 rounded">
                    <p className="text-sm">Low stock alert</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Dark Mode Toggle */}
        <button 
          onClick={toggleDarkMode}
          className="p-2 bg-gray-500 text-white rounded-full hover:bg-gray-600"
          type="button"
        >
          {isDarkMode ? <SunIcon size={20} /> : <MoonIcon size={20} />}
        </button>

        {/* User Menu */}
        <div className="relative">
          <button 
            onClick={toggleUserMenu}
            className="p-2 bg-green-500 text-white rounded-full hover:bg-green-600"
            type="button"
          >
            <UserIcon size={20} />
          </button>
          
          {/* User Menu Dropdown */}
          {showUserMenu && (
            <div 
              className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-50"
              style={{ zIndex: 9999 }}
            >
              <div className="p-4">
                <div className="space-y-2">
                  <button className="block w-full text-left p-2 hover:bg-gray-100 rounded">
                    Profile
                  </button>
                  <button className="block w-full text-left p-2 hover:bg-gray-100 rounded text-red-600">
                    Logout
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 text-sm text-gray-600">
        <p>State Debug:</p>
        <p>Notifications: {showNotifications ? 'OPEN' : 'CLOSED'}</p>
        <p>User Menu: {showUserMenu ? 'OPEN' : 'CLOSED'}</p>
        <p>Dark Mode: {isDarkMode ? 'ON' : 'OFF'}</p>
      </div>
    </div>
  );
};

export default HeaderDebug;
