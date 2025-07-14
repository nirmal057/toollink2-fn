// Register component for user registration
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserIcon, MailIcon, LockIcon, EyeIcon, EyeOffIcon, PhoneIcon, HomeIcon } from 'lucide-react';
import { userRegistrationService, CustomerRegistrationData } from '../../services/userRegistrationService';
import DarkModeToggle from '../../components/UI/DarkModeToggle';

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '+94',
    password: '',
    confirmPassword: ''
  });
  // Enhanced animation variants for smoother, immediate transitions
  const pageVariants = {
    initial: { opacity: 0, scale: 0.98 },
    animate: { 
      opacity: 1, 
      scale: 1,
      transition: {
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1],
        staggerChildren: 0.05
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.98,
      transition: { duration: 0.2, ease: [0.4, 0, 1, 1] }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Skip phone field as it has custom handling
    if (name === 'phone') return;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      // Validate password confirmation
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match. Please ensure both password fields are identical.');
        return;
      }

      // Validate phone number length
      if (formData.phone.length !== 12) { // +94 + 9 digits = 12 characters
        setError('Please enter a complete 9-digit mobile number.');
        return;
      }

      // Validate form data
      const registrationData: CustomerRegistrationData = {
        fullName: formData.fullName.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        password: formData.password,
        role: 'customer'
      };

      // Validate the registration data
      const validation = userRegistrationService.validateRegistrationData(registrationData);
      if (!validation.isValid) {
        setError(validation.errors.join(', '));
        return;
      }

      // Check if email is already registered
      const emailExists = await userRegistrationService.isEmailRegistered(registrationData.email);
      if (emailExists) {
        setError('An account with this email address already exists. Please use a different email or try signing in.');
        return;
      }

      // Register the customer
      const result = await userRegistrationService.registerCustomer(registrationData);
      
      if (result.success) {
        if (result.requiresApproval) {
          // Account created but requires approval
          setSuccess('Account created successfully! Your account is pending approval. You will receive an email notification once approved by an admin or cashier.');
          console.log('Registration successful, awaiting approval:', result);
          
          // Redirect to login page after a longer delay to let user read the message
          setTimeout(() => {
            navigate('/auth/login');
          }, 4000);
        } else {
          // Account created and approved
          setSuccess('Account created successfully! Redirecting to login...');
          console.log('Registration successful:', result);
          
          // Redirect to login page after a short delay
          setTimeout(() => {
            navigate('/auth/login');
          }, 2000);
        }
      } else {
        setError(result.error || 'Registration failed. Please try again.');
      }
      
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };  return (
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

      {/* Hero Section with Register Form */}
      <div className="flex flex-col items-center justify-center px-3 xs:px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 text-center min-h-screen">        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}          transition={{ duration: 0.3 }}
          className="w-full max-w-xs xs:max-w-sm sm:max-w-md lg:max-w-lg"
        >
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.1 }}
            className="text-center mb-4 sm:mb-6 lg:mb-8"
          >
            <div className="w-10 h-10 xs:w-12 xs:h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg xs:rounded-xl sm:rounded-xl lg:rounded-2xl flex items-center justify-center mx-auto mb-2 sm:mb-3 lg:mb-4">
              <UserIcon className="w-5 h-5 xs:w-6 xs:h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" />
            </div>
            <h1 className="text-2xl xs:text-3xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold bg-gradient-to-r from-primary-400 via-primary-300 to-white text-transparent bg-clip-text mb-1 sm:mb-2">ToolLink</h1>
            <p className="text-xs xs:text-sm sm:text-base lg:text-lg text-gray-400 px-2">Create your ToolLink account</p>
          </motion.div>

          {/* Register Form */}
          <motion.div            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
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
            
            {/* Success Message */}
            {success && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mb-6"
              >
                <div className="flex items-start space-x-2">
                  <div className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0">
                    <svg fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-green-400 text-sm">{success}</p>
                </div>
              </motion.div>
            )}
            
            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Full Name Input */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25, delay: 0.05 }}
              >
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-300 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-3 py-3 bg-[#2a2d40] border border-[#3a3d50] rounded-lg 
                             placeholder-gray-500 text-white focus:outline-none focus:ring-2 
                             focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                    placeholder="e.g., W.A. Saman Kumara Perera"
                  />
                </div>
              </motion.div>

              {/* Email Input */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25, delay: 0.1 }}
              >
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MailIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-3 py-3 bg-[#2a2d40] border border-[#3a3d50] rounded-lg 
                             placeholder-gray-500 text-white focus:outline-none focus:ring-2 
                             focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                    placeholder="user@example.com"
                  />
                </div>
              </motion.div>

              {/* Phone Input */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25, delay: 0.15 }}
              >
                <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">
                  Mobile Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <PhoneIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <span className="absolute left-10 top-1/2 transform -translate-y-1/2 text-gray-400 font-medium">
                    +94
                  </span>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    value={formData.phone.startsWith('+94') ? formData.phone.substring(3) : formData.phone}
                    onChange={e => {
                      const value = e.target.value.replace(/\D/g, ''); // Only allow digits
                      if (value.length <= 9) {
                        setFormData(prev => ({ ...prev, phone: '+94' + value }));
                      }
                    }}
                    className="block w-full pl-16 pr-3 py-3 bg-[#2a2d40] border border-[#3a3d50] rounded-lg 
                             placeholder-gray-500 text-white focus:outline-none focus:ring-2 
                             focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                    placeholder="77 123 4567"
                    maxLength={9}
                  />
                </div>
              </motion.div>

              {/* Password Input */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25, delay: 0.2 }}
              >
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LockIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-12 py-3 bg-[#2a2d40] border border-[#3a3d50] rounded-lg 
                             placeholder-gray-500 text-white focus:outline-none focus:ring-2 
                             focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                    placeholder="Create a password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOffIcon className="h-5 w-5 text-gray-400 hover:text-gray-300 transition-colors" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-300 transition-colors" />
                    )}
                  </button>
                </div>
              </motion.div>

              {/* Confirm Password Input */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25, delay: 0.25 }}
              >
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LockIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-3 py-3 bg-[#2a2d40] border border-[#3a3d50] rounded-lg 
                             placeholder-gray-500 text-white focus:outline-none focus:ring-2 
                             focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                    placeholder="Confirm your password"
                  />
                </div>
                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <p className="mt-1 text-sm text-red-400">Passwords do not match</p>
                )}
              </motion.div>

              {/* Account Type Notice */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
                className="p-4 bg-[#2a2d40] border border-[#3a3d50] rounded-lg"
              >
                <div className="flex items-center">
                  <UserIcon className="h-5 w-5 text-orange-500 mr-3 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-300">Account Type: Customer</p>
                    <p className="text-xs text-gray-400">You will be registered as a customer with access to order placement and tracking</p>
                  </div>
                </div>
              </motion.div>

              {/* Terms and Conditions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.35 }}
                className="flex items-start space-x-3"
              >
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  required
                  className="h-5 w-5 text-orange-500 bg-[#2a2d40] border-[#3a3d50] rounded 
                           focus:ring-orange-500 focus:ring-2 mt-1 flex-shrink-0"
                />
                <label htmlFor="terms" className="text-sm text-gray-300">
                  I agree to the{' '}
                  <a href="#" className="font-medium text-orange-500 hover:text-orange-400 transition-colors duration-200">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="#" className="font-medium text-orange-500 hover:text-orange-400 transition-colors duration-200">
                    Privacy Policy
                  </a>
                </label>
              </motion.div>

              {/* Submit Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.4 }}
              >                <button
                  type="submit"
                  disabled={isLoading}
                  className="group relative w-full flex justify-center py-3 px-4 border border-transparent 
                           text-sm font-medium rounded-lg text-white bg-gradient-to-r from-orange-500 to-red-500 
                           hover:from-orange-600 hover:to-red-600 focus:outline-none focus:ring-2 
                           focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 
                           disabled:cursor-not-allowed transition-all duration-200 transform 
                           hover:scale-[1.02] active:scale-[0.98]"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    'Create Account'
                  )}
                </button>
              </motion.div>
            </form>

            {/* Sign in link */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.45 }}
              className="mt-6 text-center"
            >
              <p className="text-sm text-gray-400">
                Already have an account?{' '}
                <Link
                  to="/auth/login"
                  className="text-orange-500 hover:text-orange-400 transition-colors"
                >
                  Sign in
                </Link>
              </p>
            </motion.div>
          </motion.div>
        </motion.div>      </div>
    </motion.div>
  );
};

export default Register;