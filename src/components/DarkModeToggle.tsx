import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Sun, Moon } from 'lucide-react';

interface DarkModeToggleProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const DarkModeToggle: React.FC<DarkModeToggleProps> = ({ 
  className = '', 
  size = 'md',
  showLabel = false 
}) => {
  const { theme, toggleTheme } = useTheme();

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {showLabel && (
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-200">
          {theme === 'dark' ? 'Dark' : 'Light'} Mode
        </span>
      )}
      <button
        onClick={toggleTheme}
        className={`
          ${sizeClasses[size]}
          relative flex items-center justify-center
          rounded-full overflow-hidden
          bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800
          hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-600 dark:hover:to-gray-700
          border border-gray-300 dark:border-gray-600
          shadow-md hover:shadow-lg dark:shadow-gray-900/50
          transition-all duration-300 ease-out
          transform hover:scale-105 active:scale-95
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800
          group
        `}
        title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      >
        {/* Animated background */}
        <div className={`
          absolute inset-0 rounded-full 
          bg-gradient-to-br from-orange-400 to-yellow-500
          transition-all duration-500 ease-out
          ${theme === 'dark' ? 'opacity-0 scale-75' : 'opacity-100 scale-100'}
        `} />
        <div className={`
          absolute inset-0 rounded-full 
          bg-gradient-to-br from-blue-600 to-purple-700
          transition-all duration-500 ease-out
          ${theme === 'dark' ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}
        `} />
        
        {/* Icon container */}
        <div className="relative z-10 flex items-center justify-center">
          {theme === 'dark' ? (
            <Sun className={`
              ${iconSizes[size]} 
              text-yellow-100 
              transition-all duration-300 ease-out
              transform rotate-0 group-hover:rotate-12 group-hover:scale-110
              drop-shadow-sm
            `} />
          ) : (
            <Moon className={`
              ${iconSizes[size]} 
              text-gray-700 dark:text-gray-300
              transition-all duration-300 ease-out
              transform rotate-0 group-hover:-rotate-12 group-hover:scale-110
              drop-shadow-sm
            `} />
          )}
        </div>
        
        {/* Ripple effect */}
        <div className={`
          absolute inset-0 rounded-full
          bg-white/20 dark:bg-white/10
          transition-all duration-300 ease-out
          transform scale-0 group-active:scale-100
          opacity-0 group-active:opacity-100
        `} />
      </button>
    </div>
  );
};

export default DarkModeToggle;