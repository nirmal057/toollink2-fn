import React from 'react';
import { motion } from 'framer-motion';
import { ClockIcon, UserCheckIcon, MailIcon } from 'lucide-react';

interface PendingApprovalMessageProps {
  userEmail?: string;
  onReturnHome?: () => void;
}

const PendingApprovalMessage: React.FC<PendingApprovalMessageProps> = ({ 
  userEmail, 
  onReturnHome 
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-sm sm:max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 sm:p-8 text-center transition-colors duration-300"
      >        {/* Icon Animation */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mb-4 sm:mb-6"
        >
          <ClockIcon className="w-6 h-6 sm:w-8 sm:h-8 text-amber-600 dark:text-amber-400" />
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4"
        >
          Account Pending Approval
        </motion.h1>        {/* Message */}        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="space-y-3 sm:space-y-4 mb-4 sm:mb-6"
        >
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
            Your account is waiting for approval.
          </p>
          
          {userEmail && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-3 sm:p-4">
              <div className="flex items-center justify-center space-x-2">
                <MailIcon className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <span className="text-xs sm:text-sm text-blue-800 dark:text-blue-200 font-medium break-all">{userEmail}</span>
              </div>
            </div>
          )}

          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg p-3 sm:p-4">
            <div className="flex items-start space-x-3">
              <UserCheckIcon className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
              <div className="text-left">
                <p className="text-sm font-medium text-amber-800 dark:text-amber-200 mb-1">
                  What happens next?
                </p>
                <ul className="text-xs text-amber-700 dark:text-amber-300 space-y-1">
                  <li>• A cashier or admin will review your registration</li>
                  <li>• You cannot access the customer portal until approved</li>
                  <li>• Once approved, you can log in and access all features</li>
                </ul>
              </div>
            </div>
          </div>
        </motion.div>{/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="space-y-3"
        >
          {onReturnHome && (
            <button
              onClick={onReturnHome}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 sm:py-3 px-4 rounded-lg transition-colors duration-200 text-sm sm:text-base touch-manipulation"
            >
              Return to Home
            </button>
          )}
          
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Need help? Contact our support team
          </p>
        </motion.div>

        {/* Loading Animation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-4 sm:mt-6 flex items-center justify-center space-x-1"
        >
          <div className="flex space-x-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 bg-blue-500 rounded-full"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
            Waiting for approval...
          </span>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default PendingApprovalMessage;
