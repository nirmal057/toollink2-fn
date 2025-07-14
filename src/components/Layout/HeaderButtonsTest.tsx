import { useState, useEffect } from 'react';
import { BellIcon, UserIcon, SunIcon, MoonIcon } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const HeaderButtonsTest = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { theme, toggleTheme } = useTheme();

  // Notification toggle
  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
    setShowUserMenu(false); // Close user menu when opening notifications
  };

  // User menu toggle
  const handleUserClick = () => {
    setShowUserMenu(!showUserMenu);
    setShowNotifications(false); // Close notifications when opening user menu
  };

  // Theme toggle
  const handleThemeToggle = () => {
    toggleTheme();
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.dropdown-container')) {
        setShowNotifications(false);
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcuts for testing
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === '1') {
        event.preventDefault();
        handleNotificationClick();
      }
      if (event.ctrlKey && event.key === '2') {
        event.preventDefault();
        handleUserClick();
      }
      if (event.ctrlKey && event.key === '3') {
        event.preventDefault();
        handleThemeToggle();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showNotifications, showUserMenu]);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <header className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm border-b transition-colors duration-300`}>
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'} transition-colors duration-300`}>
              Header Buttons Test
            </h1>
            
            <div className="flex items-center space-x-4">
              {/* Notification Button */}
              <div className="relative">
                <button 
                  onClick={handleNotificationClick}
                  className={`p-2 rounded-full ${theme === 'dark' ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'} focus:outline-none focus:ring-2 focus:ring-blue-500 relative transition-all duration-300 ease-in-out transform hover:scale-105`}
                  title="View notifications"
                  type="button"
                >
                  <span className="sr-only">View notifications</span>
                  <BellIcon size={24} className="transition-transform duration-200 ease-in-out" />
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-medium">
                    3
                  </span>
                </button>
              </div>

              {/* Theme Toggle Button */}
              <button
                onClick={handleThemeToggle}
                className={`
                  relative inline-flex items-center justify-center
                  w-12 h-6 rounded-full transition-all duration-300 ease-in-out
                  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                  ${theme === 'dark' 
                    ? 'bg-blue-600' 
                    : 'bg-gray-300'
                  }
                  hover:scale-105 transform
                `}
                aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                type="button"
              >
                {/* Toggle Track */}
                <div className="flex items-center justify-between w-full px-1">
                  {/* Sun Icon */}
                  <SunIcon 
                    size={14} 
                    className={`
                      transition-all duration-300 ease-in-out
                      ${theme === 'dark' 
                        ? 'text-gray-400 opacity-50 scale-75' 
                        : 'text-yellow-500 opacity-100 scale-100'
                      }
                    `}
                  />
                  
                  {/* Moon Icon */}
                  <MoonIcon 
                    size={14} 
                    className={`
                      transition-all duration-300 ease-in-out
                      ${theme === 'dark' 
                        ? 'text-blue-200 opacity-100 scale-100' 
                        : 'text-gray-400 opacity-50 scale-75'
                      }
                    `}
                  />
                </div>

                {/* Toggle Slider */}
                <div 
                  className={`
                    absolute w-4 h-4 bg-white rounded-full shadow-lg transition-all duration-300 ease-in-out
                    ${theme === 'dark' ? 'translate-x-3' : 'translate-x-0'}
                  `}
                />
              </button>

              {/* User Menu Button */}
              <div className="relative">
                <button 
                  onClick={handleUserClick}
                  className={`flex items-center p-2 rounded-full ${theme === 'dark' ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'} focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ease-in-out transform hover:scale-105`}
                  title="User menu"
                  type="button"
                >
                  <span className="sr-only">Open user menu</span>
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white transition-all duration-300 ease-in-out">
                    <UserIcon size={18} />
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="p-8">
        <div className={`max-w-4xl mx-auto ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          <h2 className="text-2xl font-bold mb-6">Header Buttons Functionality Test</h2>
          
          {/* Status Display */}
          <div className={`p-6 rounded-lg mb-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
            <h3 className="text-lg font-semibold mb-4">Current Status:</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className={`p-4 rounded ${showNotifications ? 'bg-blue-500 text-white' : (theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100')}`}>
                <div className="font-medium">Notifications</div>
                <div className="text-sm">{showNotifications ? '✅ OPEN' : '❌ CLOSED'}</div>
              </div>
              <div className={`p-4 rounded ${theme === 'dark' ? 'bg-blue-600 text-white' : 'bg-yellow-400 text-gray-900'}`}>
                <div className="font-medium">Theme</div>
                <div className="text-sm">{theme === 'dark' ? '🌙 DARK' : '☀️ LIGHT'}</div>
              </div>
              <div className={`p-4 rounded ${showUserMenu ? 'bg-green-500 text-white' : (theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100')}`}>
                <div className="font-medium">User Menu</div>
                <div className="text-sm">{showUserMenu ? '✅ OPEN' : '❌ CLOSED'}</div>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className={`p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
            <h3 className="text-lg font-semibold mb-4">🧪 Test Instructions:</h3>
            <ol className="list-decimal list-inside space-y-2">
              <li><strong>Notification Bell:</strong> Click the bell icon to toggle notifications dropdown</li>
              <li><strong>Theme Toggle:</strong> Click the theme toggle button to switch between light/dark mode</li>
              <li><strong>User Icon:</strong> Click the user avatar to toggle user menu dropdown</li>
            </ol>
            
            <div className={`mt-6 p-4 rounded ${theme === 'dark' ? 'bg-blue-900/20 border-blue-600' : 'bg-blue-50 border-blue-300'} border`}>
              <h4 className="font-semibold mb-2">⌨️ Keyboard Shortcuts:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li><kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded">Ctrl + 1</kbd> - Toggle Notifications</li>
                <li><kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded">Ctrl + 2</kbd> - Toggle User Menu</li>
                <li><kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded">Ctrl + 3</kbd> - Toggle Theme</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Dropdown */}
      {showNotifications && (
        <div 
          className="fixed inset-0 z-[9998] bg-transparent"
          onClick={() => setShowNotifications(false)}
        >
          <div 
            className={`dropdown-container fixed top-16 right-4 w-80 max-h-[80vh] z-[9999] ${theme === 'dark' ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'} rounded-lg shadow-2xl border overflow-hidden`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`px-4 py-3 border-b ${theme === 'dark' ? 'border-gray-600' : 'border-gray-200'}`}>
              <div className="flex justify-between items-center">
                <h3 className={`text-sm font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Notifications</h3>
                <button className={`text-sm ${theme === 'dark' ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'} transition-colors duration-200`}>
                  View all
                </button>
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {[1, 2, 3].map((i) => (
                <div key={i} className={`px-4 py-3 ${theme === 'dark' ? 'hover:bg-gray-700 border-gray-600' : 'hover:bg-gray-50 border-gray-100'} transition-all duration-200 ease-in-out ${i < 3 ? 'border-b' : ''}`}>
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        Notification {i}
                      </p>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        Sample notification message {i}
                      </p>
                      <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'} mt-1`}>
                        {i} hour{i > 1 ? 's' : ''} ago
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* User Menu Dropdown */}
      {showUserMenu && (
        <div 
          className="fixed inset-0 z-[9998] bg-transparent"
          onClick={() => setShowUserMenu(false)}
        >
          <div 
            className={`dropdown-container fixed top-16 right-4 w-48 z-[9999] ${theme === 'dark' ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'} rounded-lg shadow-2xl border overflow-hidden`}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className={`flex items-center w-full px-4 py-3 text-sm ${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'} transition-all duration-200 ease-in-out`}
              onClick={() => setShowUserMenu(false)}
            >
              <UserIcon size={16} className="mr-2" />
              Your Profile
            </button>
            <div className={`border-t ${theme === 'dark' ? 'border-gray-600' : 'border-gray-100'}`} />
            <button
              className={`flex w-full items-center px-4 py-3 text-sm font-medium ${theme === 'dark' ? 'text-red-400 hover:bg-red-900/20' : 'text-red-600 hover:bg-red-50'} transition-all duration-200 ease-in-out`}
              type="button"
              onClick={() => {
                alert('Logout clicked!');
                setShowUserMenu(false);
              }}
            >
              <svg className="mr-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HeaderButtonsTest;
