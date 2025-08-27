import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserIcon, LockIcon, EyeIcon, EyeOffIcon, HomeIcon } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import DarkModeToggle from '../../components/UI/DarkModeToggle';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const { login, isLoading } = useAuth();

  // Enhanced animation variants for smoother transitions
  const pageVariants = {
    initial: { opacity: 0, scale: 0.95 },
    animate: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: [0.4, 0, 0.2, 1],
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      transition: { duration: 0.3, ease: [0.4, 0, 1, 1] }
    }
  };

  const formVariants = {
    initial: { opacity: 0, y: 20 },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: [0.4, 0, 0.2, 1],
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const inputVariants = {
    initial: { opacity: 0, x: -20, scale: 0.95 },
    animate: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: [0.4, 0, 0.2, 1]
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const result = await login(email, password);
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.error || 'Login failed');
      }
    } catch (err) {
      setError('An error occurred during login');
    }
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-screen bg-gradient-to-b from-[#1a1113] to-[#12152c] dark:from-gray-900 dark:to-gray-800 text-white transition-colors duration-300"
    >
      {/* Dark Mode Toggle */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="absolute top-3 sm:top-4 lg:top-6 right-3 sm:right-4 lg:right-6 z-10"
      >
        <DarkModeToggle />
      </motion.div>

      {/* Home Icon */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="absolute top-3 sm:top-4 lg:top-6 left-3 sm:left-4 lg:left-6 z-10"
      >
        <Link
          to="/"
          className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-[#2a2d40] dark:bg-gray-700 hover:bg-[#3a3d50] dark:hover:bg-gray-600
                     rounded-full border border-[#3a3d50] dark:border-gray-600 hover:border-orange-500
                     transition-all duration-200 group"
        >
          <HomeIcon className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-gray-300 group-hover:text-orange-500 transition-colors duration-200" />
        </Link>
      </motion.div>

      {/* Hero Section with Login Form */}
      <div className="flex flex-col items-center justify-center px-3 xs:px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 text-center min-h-screen">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="w-full max-w-xs xs:max-w-sm sm:max-w-md lg:max-w-lg"
        >
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-center mb-4 sm:mb-6 lg:mb-8"
          >
            <div className="w-10 h-10 xs:w-12 xs:h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg xs:rounded-xl sm:rounded-xl lg:rounded-2xl flex items-center justify-center mx-auto mb-2 sm:mb-3 lg:mb-4">
              <LockIcon className="w-5 h-5 xs:w-6 xs:h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" />
            </div>
            <h1 className="text-2xl xs:text-3xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold bg-gradient-to-r from-primary-400 via-primary-300 to-white text-transparent bg-clip-text mb-1 sm:mb-2">ToolLink</h1>
            <p className="text-xs xs:text-sm sm:text-base lg:text-lg text-gray-400 px-2">Sign in to your account</p>
          </motion.div>

          {/* Login Form */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="bg-[#1a1113] backdrop-blur-sm rounded-lg xs:rounded-xl sm:rounded-xl lg:rounded-2xl shadow-2xl p-4 xs:p-5 sm:p-6 lg:p-8 border border-[#2a2d40]"
          >
            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6"
              >
                <div className="flex items-start space-x-2">
                  <div className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0">
                    <svg fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              </motion.div>
            )}

            <motion.form
              variants={formVariants}
              initial="initial"
              animate="animate"
              className="space-y-6"
              onSubmit={handleSubmit}
            >
              {/* Email Input */}
              <motion.div variants={inputVariants}>
                <label className="block text-sm font-medium text-gray-300 mb-2 text-left">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 bg-[#2a2d40] border border-[#3a3d50] rounded-lg
                             focus:ring-2 focus:ring-orange-500 focus:border-orange-500
                             text-white placeholder-gray-400 transition-all duration-200
                             hover:border-[#4a4d60]"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </motion.div>

              {/* Password Input */}
              <motion.div variants={inputVariants}>
                <label className="block text-sm font-medium text-gray-300 mb-2 text-left">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LockIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-12 py-3 bg-[#2a2d40] border border-[#3a3d50] rounded-lg
                             focus:ring-2 focus:ring-orange-500 focus:border-orange-500
                             text-white placeholder-gray-400 transition-all duration-200
                             hover:border-[#4a4d60]"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOffIcon className="h-5 w-5 text-gray-400 hover:text-orange-400 transition-colors duration-200" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-400 hover:text-orange-400 transition-colors duration-200" />
                    )}
                  </button>
                </div>
              </motion.div>

              {/* Remember Me & Forgot Password */}
              <motion.div variants={inputVariants} className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-600 rounded bg-[#2a2d40]"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-300">
                    Remember me
                  </label>
                </div>
                <Link
                  to="/forgot-password"
                  className="text-sm text-orange-400 hover:text-orange-300 transition-colors duration-200"
                >
                  Forgot password?
                </Link>
              </motion.div>

              {/* Login Button */}
              <motion.div variants={inputVariants}>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg
                           text-sm font-medium text-white bg-gradient-to-r from-orange-500 to-red-500
                           hover:from-orange-600 hover:to-red-600 focus:outline-none focus:ring-2
                           focus:ring-offset-2 focus:ring-orange-500 transition-all duration-200
                           disabled:opacity-50 disabled:cursor-not-allowed
                           shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Signing in...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </button>
              </motion.div>
            </motion.form>

            {/* Register Link */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 1 }}
              className="mt-6 text-center"
            >
              <p className="text-sm text-gray-400">
                Don't have an account?{' '}
                <Link
                  to="/register"
                  className="text-orange-400 hover:text-orange-300 font-medium transition-colors duration-200"
                >
                  Sign up here
                </Link>
              </p>
            </motion.div>

            {/* Login Information */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 1.2 }}
              className="mt-6 pt-4 border-t border-[#2a2d40] text-center"
            >
              <div className="text-xs text-gray-500">
                <p className="mb-1">Please use your registered credentials to log in.</p>
                <p>Contact your administrator if you need assistance.</p>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Login;
