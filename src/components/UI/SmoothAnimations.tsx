import React, { useState, useEffect, useRef } from 'react';

interface AnimatedElementProps {
  children: React.ReactNode;
  animation?: 'fadeIn' | 'fadeInUp' | 'fadeInDown' | 'fadeInLeft' | 'fadeInRight' | 'scaleIn' | 'slideIn';
  delay?: number;
  duration?: number;
  className?: string;
  threshold?: number;
}

export const AnimatedElement: React.FC<AnimatedElementProps> = ({
  children,
  animation = 'fadeInUp',
  delay = 0,
  duration = 300, // Reduced from 500ms
  className = '',
  threshold = 0.1
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          // Reduced delay for snappier animations
          const actualDelay = Math.min(delay, 100); // Cap delay at 100ms
          setTimeout(() => {
            setIsVisible(true);
            setHasAnimated(true);
          }, actualDelay);
        }
      },
      { threshold }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, [delay, threshold, hasAnimated]);

  return (
    <div
      ref={elementRef}
      className={`
        ${className}
        ${isVisible ? `animate-${animation}` : 'opacity-0'}
      `}
      style={{
        animationDuration: `${duration}ms`,
        animationFillMode: 'both'
      }}
    >
      {children}
    </div>
  );
};

interface SmoothTransitionProps {
  children: React.ReactNode;
  show: boolean;
  enter?: string;
  enterFrom?: string;
  enterTo?: string;
  leave?: string;
  leaveFrom?: string;
  leaveTo?: string;
  duration?: number;
}

export const SmoothTransition: React.FC<SmoothTransitionProps> = ({
  children,
  show,
  enter = 'transition-all duration-200 ease-out', // Reduced from 300ms
  enterFrom = 'opacity-0 scale-98', // Less dramatic scale
  enterTo = 'opacity-100 scale-100',
  leave = 'transition-all duration-150 ease-in', // Reduced from 200ms
  leaveFrom = 'opacity-100 scale-100',
  leaveTo = 'opacity-0 scale-98', // Less dramatic scale
  duration = 200 // Reduced from 300ms
}) => {
  const [shouldRender, setShouldRender] = useState(show);
  const [isVisible, setIsVisible] = useState(show);

  useEffect(() => {
    if (show) {
      setShouldRender(true);
      setTimeout(() => setIsVisible(true), 10);
    } else {
      setIsVisible(false);
      setTimeout(() => setShouldRender(false), duration);
    }
  }, [show, duration]);

  if (!shouldRender) return null;

  return (
    <div
      className={`
        ${isVisible ? enter : leave}
        ${isVisible ? enterTo : enterFrom}
        ${!isVisible ? leaveTo : ''}
      `}
    >
      {children}
    </div>
  );
};

interface StaggeredAnimationProps {
  children: React.ReactNode[];
  staggerDelay?: number;
  animation?: string;
  className?: string;
}

export const StaggeredAnimation: React.FC<StaggeredAnimationProps> = ({
  children,
  staggerDelay = 100,
  animation = 'animate-fade-in-up',
  className = ''
}) => {
  return (
    <div className={className}>
      {children.map((child, index) => (
        <div
          key={index}
          className={animation}
          style={{
            animationDelay: `${index * staggerDelay}ms`,
            animationFillMode: 'both'
          }}
        >
          {child}
        </div>
      ))}
    </div>
  );
};

interface SmoothButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

export const SmoothButton: React.FC<SmoothButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses = 'btn-animated hover-lift relative overflow-hidden font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200';
  
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white focus:ring-gray-500',
    outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white focus:ring-blue-500',
    ghost: 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  return (
    <button
      className={`
        ${baseClasses}
        ${variants[variant]}
        ${sizes[size]}
        ${disabled || loading ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
      disabled={disabled || loading}
      {...props}
    >
      <span className="flex items-center justify-center space-x-2">
        {loading ? (
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : icon ? (
          <span className="transition-transform duration-200 group-hover:scale-110">{icon}</span>
        ) : null}
        <span>{children}</span>
      </span>
    </button>
  );
};

interface SmoothCardProps {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
  clickable?: boolean;
  onClick?: () => void;
}

export const SmoothCard: React.FC<SmoothCardProps> = ({
  children,
  className = '',
  hoverable = true,
  clickable = false,
  onClick
}) => {
  const baseClasses = 'bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 transition-all duration-300';
  const hoverClasses = hoverable ? 'card-smooth' : '';
  const clickableClasses = clickable ? 'cursor-pointer' : '';

  return (
    <div
      className={`${baseClasses} ${hoverClasses} ${clickableClasses} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'text-blue-600'
}) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-transparent ${sizes[size]} ${color}`}>
      <span className="sr-only">Loading...</span>
    </div>
  );
};

interface SmoothPageProps {
  children: React.ReactNode;
  className?: string;
}

export const SmoothPage: React.FC<SmoothPageProps> = ({
  children,
  className = ''
}) => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 50);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`
      ${className}
      ${isLoaded ? 'animate-fade-in-up' : 'opacity-0'}
    `}>
      {children}
    </div>
  );
};
