import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import FloatingChatbox from '../UI/FloatingChatbox';
import { MenuIcon, XIcon } from 'lucide-react';

interface MainLayoutProps {
  userRole: 'admin' | 'warehouse' | 'cashier' | 'customer' | string;
  onLogout?: () => Promise<void>;
}

const MainLayout = ({ userRole, onLogout }: MainLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  // Handle page transitions with minimal delay
  useEffect(() => {
    setIsPageLoading(true);
    const timer = setTimeout(() => setIsPageLoading(false), 100); // Reduced from 300ms to 100ms
    return () => clearTimeout(timer);
  }, [location.pathname]);

  // Close sidebar on mobile when route changes
  useEffect(() => {
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  }, [location.pathname]);

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
      {/* Mobile sidebar toggle */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-md bg-white dark:bg-gray-800 shadow-md text-gray-700 dark:text-gray-300 hover-lift hover-scale transition-all duration-200 ease-in-out"
        >
          <div className="transition-transform duration-200">
            {sidebarOpen ? <XIcon size={24} /> : <MenuIcon size={24} />}
          </div>
        </button>
      </div>

      {/* Sidebar */}      <div className={`
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-40 w-64
        transition-transform duration-200 ease-out
      `}>
        <Sidebar
          userRole={userRole as 'admin' | 'warehouse' | 'cashier' | 'customer'}
          onLogout={onLogout}
        />
      </div>

      {/* Main Content */}
      <div className="flex flex-col flex-1 min-w-0">
        <div className="animate-fade-in-down">
          <Header userRole={userRole} />
        </div>

        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 transition-colors duration-300 pt-16" style={{ minHeight: 'calc(100vh - 4rem)' }}>
          <div className="p-4 md:p-6">
            {/* Page transition loader */}
            {isPageLoading && (
              <div className="fixed inset-0 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm z-30 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            )}
            {/* Page content with smooth transition */}
            <div className={`transition-all duration-200 ${isPageLoading ? 'opacity-80 scale-98' : 'opacity-100 scale-100'}`}>
              <Outlet />
            </div>
          </div>
        </main>
      </div>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 lg:hidden z-30 transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Floating Chatbox - only for non-admin users */}
      {userRole !== 'admin' && <FloatingChatbox />}
    </div>
  );
};

export default MainLayout;
