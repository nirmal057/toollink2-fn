import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGlobalNotifications } from '../../contexts/GlobalNotificationContext';
import { CheckCircleIcon, XCircleIcon, AlertTriangleIcon, InfoIcon, XIcon } from 'lucide-react';

interface ToastNotification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
}

const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useGlobalNotifications();

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon className="h-6 w-6 text-white" />;
      case 'error':
        return <XCircleIcon className="h-6 w-6 text-white" />;
      case 'warning':
        return <AlertTriangleIcon className="h-6 w-6 text-white" />;
      case 'info':
        return <InfoIcon className="h-6 w-6 text-white" />;
      default:
        return <InfoIcon className="h-6 w-6 text-white" />;
    }
  };

  const getToastStyles = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-gradient-to-r from-green-500 to-emerald-600 shadow-green-200';
      case 'error':
        return 'bg-gradient-to-r from-red-500 to-red-600 shadow-red-200';
      case 'warning':
        return 'bg-gradient-to-r from-yellow-500 to-amber-600 shadow-yellow-200';
      case 'info':
        return 'bg-gradient-to-r from-blue-500 to-indigo-600 shadow-blue-200';
      default:
        return 'bg-gradient-to-r from-blue-500 to-indigo-600 shadow-blue-200';
    }
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onRemove={removeToast}
            styles={getToastStyles(toast.type)}
            icon={getIcon(toast.type)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

interface ToastItemProps {
  toast: ToastNotification;
  onRemove: (id: string) => void;
  styles: string;
  icon: React.ReactNode;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onRemove, styles, icon }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(toast.id);
    }, toast.duration || 5000);

    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onRemove]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 100, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.9 }}
      transition={{
        duration: 0.3,
        ease: [0.16, 1, 0.3, 1],
        exit: { duration: 0.2 }
      }}
      whileHover={{ scale: 1.02 }}
      className={`
        flex items-start p-4 rounded-xl shadow-xl max-w-sm transform transition-all duration-300 ease-in-out
        ${styles} text-white backdrop-blur-sm border-0
        hover:shadow-2xl cursor-pointer
      `}
      onClick={() => onRemove(toast.id)}
    >
      <div className="flex-shrink-0 mr-3">
        <div className="p-1 bg-white/20 rounded-full backdrop-blur-sm">
          {icon}
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white leading-tight">
          {toast.title}
        </p>
        {toast.message && (
          <p className="mt-1 text-sm text-white/90 leading-relaxed">
            {toast.message}
          </p>
        )}
      </div>

      <div className="ml-3 flex-shrink-0">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove(toast.id);
          }}
          className="inline-flex items-center justify-center w-8 h-8 rounded-full text-white/70 hover:text-white hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-200"
        >
          <XIcon className="h-4 w-4" />
        </button>
      </div>

      {/* Progress bar */}
      <motion.div
        initial={{ width: "100%" }}
        animate={{ width: "0%" }}
        transition={{ duration: (toast.duration || 5000) / 1000, ease: "linear" }}
        className="absolute bottom-0 left-0 h-1 bg-white/30 rounded-b-xl"
      />
    </motion.div>
  );
};

export default ToastContainer;
