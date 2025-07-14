import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { SunIcon, MoonIcon } from 'lucide-react';

const DarkModeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      className={`
        relative inline-flex items-center justify-center
        w-12 h-6 rounded-full transition-all duration-300 ease-in-out
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
        ${isDark 
          ? 'bg-blue-600 dark:bg-blue-500' 
          : 'bg-gray-300 dark:bg-gray-600'
        }
        hover:scale-105 transform
      `}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      type="button"
    >
      {/* Toggle Track */}
      <div className="flex items-center justify-between w-full px-1">
        {/* Sun Icon */}
        <SunIcon 
          size={14} 
          className={`
            transition-all duration-300 ease-in-out
            ${isDark 
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
            ${isDark 
              ? 'text-blue-200 opacity-100 scale-100' 
              : 'text-gray-400 opacity-50 scale-75'
            }
          `}
        />
      </div>
      
      {/* Toggle Circle */}
      <div
        className={`
          absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md
          transform transition-all duration-300 ease-in-out
          flex items-center justify-center
          ${isDark ? 'translate-x-6' : 'translate-x-0'}
        `}
      >
        {/* Icon in circle */}
        {isDark ? (
          <MoonIcon size={12} className="text-blue-600" />
        ) : (
          <SunIcon size={12} className="text-yellow-600" />
        )}
      </div>
    </button>
  );
};

export default DarkModeToggle;
