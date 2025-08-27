import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { UserIcon, LogInIcon } from 'lucide-react';
import { FeedbackService } from '../services/feedbackService';
import DarkModeToggle from '../components/UI/DarkModeToggle';
import bg1 from '../images/bg1.jpg';

const LandingPage = () => {
  // Mobile menu state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Get public testimonials from feedback service
  const testimonials = FeedbackService.getPublicFeedback().slice(0, 3);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.user-menu-container') && !target.closest('[data-user-menu-button]')) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Enhanced smooth scroll function with performance optimizations and fallbacks
  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();

    const targetElement = document.getElementById(targetId);
    if (!targetElement) return;

    const navHeight = 80; // Account for fixed navigation height
    const targetPosition = targetElement.offsetTop - navHeight;

    // Close mobile menu immediately for better UX
    setIsMobileMenuOpen(false);

    // Check for native smooth scroll support
    if ('scrollBehavior' in document.documentElement.style) {
      // Native smooth scroll with enhanced options
      window.scrollTo({
        top: targetPosition,
        left: 0,
        behavior: 'smooth'
      });
    } else {
      // Custom smooth scroll fallback for older browsers
      customSmoothScroll(targetPosition, 800);
    }
  };

  // Custom smooth scroll implementation with easing
  const customSmoothScroll = (target: number, duration: number) => {
    const start = window.pageYOffset;
    const distance = target - start;
    const startTime = performance.now();

    const animation = (currentTime: number) => {
      const timeElapsed = currentTime - startTime;
      const progress = Math.min(timeElapsed / duration, 1);

      // Smooth easing function (ease-in-out)
      const easeInOutCubic = progress < 0.5
        ? 4 * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      const currentPosition = start + (distance * easeInOutCubic);
      window.scrollTo(0, currentPosition);

      if (progress < 1) {
        requestAnimationFrame(animation);
      }
    };

    requestAnimationFrame(animation);
  };

  // Parallax scroll effect
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 500], [0, -100]);
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0.3]);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  // Close mobile menu on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isMobileMenuOpen]);  // Enhanced animation variants for immediate, smooth transitions
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1],
        staggerChildren: 0.05,
        delayChildren: 0.1
      }
    }
  };
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1]
      }
    }
  };

  const navVariants = {
    hidden: { y: -20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.4,
        ease: [0.4, 0, 0.2, 1],
        staggerChildren: 0.03
      }
    }
  };

  const heroVariants = {
    hidden: { opacity: 0, scale: 0.98 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: [0.4, 0, 0.2, 1],
        staggerChildren: 0.05,
        delayChildren: 0.1
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a1113] to-[#12152c] dark:from-gray-900 dark:to-gray-800 text-white transition-colors duration-300">
      {/* Navigation Bar */}
      <motion.nav
        variants={navVariants}
        initial="hidden"
        animate="visible"
        className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-4 sm:px-6 lg:px-12 py-4
                   bg-[#1a1113]/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-[#2a2d40]/50 dark:border-gray-700/50 shadow-2xl
                   smooth-transform"        style={{ transform: 'translateZ(0)' }} // Hardware acceleration
      >
        {/* Dark background effect matching app theme */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#1a1113]/60 via-[#12152c]/40 to-[#1a1113]/60 rounded-b-3xl"></div>
        <div className="absolute inset-0 backdrop-blur-xl bg-gradient-to-r from-[#2a2d40]/40 via-[#12152c]/30 to-[#2a2d40]/40"></div>

        {/* Animated border glow */}
        <div className="absolute inset-0 rounded-b-3xl">
          <div className="absolute inset-0 rounded-b-3xl bg-gradient-to-r from-transparent via-orange-500/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-1000"></div>
        </div>          <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="relative flex items-center space-x-2 sm:space-x-4 z-10"
        >
          <motion.div
            className="relative bg-gradient-to-br from-orange-500 via-red-500 to-orange-600 w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center shadow-2xl shadow-orange-500/30"
            whileHover={{
              scale: 1.1,
              rotate: [0, -5, 5, 0],
              boxShadow: "0 20px 40px rgba(251, 146, 60, 0.4)"
            }}
            transition={{ type: "spring", stiffness: 300, damping: 10 }}
          >
            <span className="text-white font-bold text-lg sm:text-xl">📦</span>
            {/* Subtle pulse ring */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 opacity-20 animate-ping"></div>
          </motion.div>
          <motion.span
            className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-white via-orange-100 to-orange-200 bg-clip-text text-transparent tracking-wide"
            whileHover={{ scale: 1.05 }}
          >
            ToolLink
          </motion.span>
        </motion.div>
        {/* Desktop Navigation Menu */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}
          className="hidden lg:flex items-center space-x-6 xl:space-x-10 relative z-10"
        >          {['Features', 'About', 'Testimonials'].map((item, index) => (
          <motion.a
            key={item}
            href={`#${item.toLowerCase()}`}
            onClick={(e) => handleSmoothScroll(e, item.toLowerCase())}
            className="relative text-white/70 hover:text-white font-semibold transition-all duration-500 group cursor-pointer text-sm xl:text-base"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 + index * 0.02 }}
            whileHover={{ y: -2 }}
          >
            <span className="relative z-10">{item}</span>
            {/* Animated underline */}
            <motion.div
              className="absolute -bottom-2 left-0 w-0 h-1 bg-gradient-to-r from-orange-400 via-orange-500 to-red-500 rounded-full group-hover:w-full transition-all duration-500"
              whileHover={{ boxShadow: "0 0 20px rgba(251, 146, 60, 0.6)" }}
            />
            {/* Hover glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/0 via-orange-500/10 to-orange-500/0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 -mx-3 -my-1"></div>
          </motion.a>
        ))}
          {/* Contact navigation - link to contact page */}
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 + 3 * 0.02 }}
            whileHover={{ y: -2 }}
          >
            <Link
              to="/contact"
              className="relative text-white/70 hover:text-white font-semibold transition-all duration-500 group cursor-pointer text-sm xl:text-base"
            >
              <span className="relative z-10">Contact</span>
              {/* Animated underline */}
              <motion.div
                className="absolute -bottom-2 left-0 w-0 h-1 bg-gradient-to-r from-orange-400 via-orange-500 to-red-500 rounded-full group-hover:w-full transition-all duration-500"
                whileHover={{ boxShadow: "0 0 20px rgba(251, 146, 60, 0.6)" }}
              />
              {/* Hover glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/0 via-orange-500/10 to-orange-500/0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 -mx-3 -my-1"></div>
            </Link>
          </motion.div>
        </motion.div>

        {/* Desktop Auth Buttons */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="hidden md:flex items-center space-x-3 lg:space-x-4 relative z-10"
        >
          {/* Dark Mode Toggle */}
          <DarkModeToggle />

          {/* User Icon Dropdown */}
          <div className="relative">
            <motion.button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center p-2 rounded-full text-white/80 hover:text-white hover:bg-[#2a2d40]/50 backdrop-blur-sm border border-[#3a3d50]/50 hover:border-orange-400/60 transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              data-user-menu-button
            >
              <UserIcon size={20} />
            </motion.button>

            {/* User Menu Dropdown */}
            {showUserMenu && (
              <div
                className="user-menu-container absolute right-0 top-12 w-48 bg-[#1a1113]/95 backdrop-blur-md rounded-lg shadow-2xl py-1 border border-[#3a3d50]/50 z-50"
                onClick={(e) => e.stopPropagation()}
              >
                <Link
                  to="/auth/login"
                  className="flex items-center px-4 py-2 text-sm text-white/80 hover:text-white hover:bg-[#2a2d40]/50 transition-all duration-200"
                  onClick={() => setShowUserMenu(false)}
                >
                  <LogInIcon size={16} className="mr-2" />
                  Log In
                </Link>
              </div>
            )}
          </div>

          <motion.div whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.98 }}>
            <Link
              to="/auth/login"
              className="relative px-4 lg:px-6 py-2 lg:py-2.5 text-white/90 hover:text-white font-medium rounded-full
                         transition-all duration-300 overflow-hidden group backdrop-blur-sm text-sm lg:text-base
                         border border-[#3a3d50]/60 dark:border-gray-600/60 hover:border-orange-400/60 hover:bg-[#2a2d40]/30 dark:hover:bg-gray-700/30"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/0 to-orange-500/0 group-hover:from-orange-500/15 group-hover:to-red-500/15 transition-all duration-300"></div>
              <span className="relative">Login</span>
            </Link>
          </motion.div>

          <motion.div whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.98 }}>
            <Link
              to="/auth/register"
              className="relative px-4 lg:px-6 py-2 lg:py-2.5 bg-gradient-to-r from-orange-500 to-red-500
                         hover:from-orange-600 hover:to-red-600 text-white rounded-full
                         font-medium transition-all duration-300 shadow-lg hover:shadow-orange-500/25
                         overflow-hidden group text-sm lg:text-base"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="relative">Register</span>
            </Link>
          </motion.div>
        </motion.div>
        {/* Mobile menu button */}
        <motion.div
          className="md:hidden relative z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
        >
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-white/80 hover:text-white p-2 rounded-lg bg-[#2a2d40]/50 backdrop-blur-sm border border-[#3a3d50]/50 hover:bg-[#3a3d50]/60 transition-all duration-300"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </motion.div>        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <motion.div
            ref={mobileMenuRef}
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-2 mx-4 bg-[#1a1113]/95 backdrop-blur-xl border border-[#2a2d40]/50 rounded-2xl shadow-2xl md:hidden z-50"
          >
            <div className="p-6 space-y-4">
              {/* Mobile Navigation Links */}
              <div className="space-y-3">                {['Features', 'About', 'Testimonials'].map((item, index) => (
                <motion.a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  onClick={(e) => handleSmoothScroll(e, item.toLowerCase())}
                  className="block text-white/80 hover:text-white font-medium py-2 px-4 rounded-lg hover:bg-[#2a2d40]/50 transition-all duration-300"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  {item}
                </motion.a>
              ))}
                {/* Contact navigation - link to contact page */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 3 * 0.05 }}
                >
                  <Link
                    to="/contact"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block text-white/80 hover:text-white font-medium py-2 px-4 rounded-lg hover:bg-[#2a2d40]/50 transition-all duration-300"
                  >
                    Contact
                  </Link>
                </motion.div>
              </div>

              {/* Mobile Auth Buttons */}
              <div className="pt-4 border-t border-[#2a2d40]/50 space-y-3">
                <Link
                  to="/auth/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block w-full text-center px-6 py-3 text-white/90 hover:text-white font-medium rounded-full
                             border border-[#3a3d50]/60 hover:border-orange-400/60 hover:bg-[#2a2d40]/30 transition-all duration-300"
                >
                  Login
                </Link>
                <Link
                  to="/auth/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block w-full text-center px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500
                             hover:from-orange-600 hover:to-red-600 text-white rounded-full
                             font-medium transition-all duration-300 shadow-lg"
                >
                  Register
                </Link>

                {/* Mobile Dark Mode Toggle */}
                <div className="flex justify-center pt-2">
                  <DarkModeToggle />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </motion.nav>      {/* Hero Section */}
      <motion.div
        variants={heroVariants}
        initial="hidden"
        animate="visible"
        className="relative flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-16 sm:py-20 pt-24 sm:pt-32 text-center min-h-screen overflow-hidden
                   smooth-transform"
        style={{
          y: heroY,
          opacity: heroOpacity,
          transform: 'translateZ(0)' // Hardware acceleration for parallax
        }}
      >
        {/* Background Image */}
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url(${bg1})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        />
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-black/40 z-10" />

        {/* Content */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative z-20 text-center max-w-4xl mx-auto"
        >
          <motion.h1
            variants={itemVariants}
            className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 leading-tight"
          >
            <span className="bg-gradient-to-r from-primary-400 via-primary-300 to-white text-transparent bg-clip-text drop-shadow-2xl font-heading">
              ToolLink
            </span>
          </motion.h1>

          <motion.h2
            variants={itemVariants}
            className="text-lg xs:text-xl sm:text-2xl md:text-3xl font-semibold mb-4 sm:mb-6 leading-relaxed"
          >
            <span className="text-primary-400 font-display drop-shadow-lg">Simple ordering</span>
            <span className="text-white/90 hidden xs:inline"> • </span>
            <br className="xs:hidden" />
            <span className="text-secondary-400 font-display drop-shadow-lg">Smart scheduling</span>
            <span className="text-white/90 hidden xs:inline"> • </span>
            <br className="xs:hidden" />
            <span className="text-tertiary-400 font-display drop-shadow-lg">Real-time tracking</span>
          </motion.h2>

          <motion.p
            variants={itemVariants}
            className="mt-4 sm:mt-6 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed px-4"
          >
            <span className="text-primary-300 font-display font-semibold drop-shadow-md">Your hassle-free way</span>
            <span className="text-white/80"> to manage </span>
            <span className="text-secondary-300 font-display font-semibold drop-shadow-md">construction deliveries</span>
            <span className="text-white/80"> </span>
            <span className="text-xl sm:text-2xl animate-bounce">📦</span>
            <span className="text-xl sm:text-2xl animate-pulse">🚚</span>
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="mt-6 sm:mt-8 flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 px-4"
          >            <motion.div
            whileHover={{
              scale: 1.05,
              y: -2,
              boxShadow: "0 15px 30px rgba(251, 146, 60, 0.4)",
              transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
            }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
            className="w-full sm:w-auto"
          >
              <Link
                to="/auth/register"
                className="block w-full sm:w-auto bg-primary-500 hover:bg-primary-600 text-white px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg rounded-full shadow-lg transition-all duration-300 font-medium"
              >
                Start Managing Orders →
              </Link>
            </motion.div>

            <motion.div
              whileHover={{
                scale: 1.05,
                y: -2,
                borderColor: "rgba(251, 146, 60, 0.6)",
                transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
              }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
              className="w-full sm:w-auto"
            ><a
              href="#features"
              onClick={(e) => handleSmoothScroll(e, 'features')}
              className="block w-full sm:w-auto bg-transparent hover:bg-primary-500/10 text-white border-2 border-primary-500 hover:border-primary-600 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg rounded-full transition-all duration-300 font-medium"
            >
                View Features
              </a>
            </motion.div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="mt-4 sm:mt-6 text-xs sm:text-sm text-white/80 flex flex-col sm:flex-row justify-center gap-2 sm:gap-4 px-4"
          >
            <span className="flex items-center justify-center">✔ Multi-warehouse support</span>
            <span className="flex items-center justify-center">✔ Real-time tracking</span>
            <span className="flex items-center justify-center">✔ Automated scheduling</span>
          </motion.div>
        </motion.div>
      </motion.div>      {/* Features Section */}
      <section id="features" className="py-12 sm:py-16 lg:py-20 bg-[#12152c]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center mb-8 sm:mb-12 text-white"
          >
            Key Features
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ y: -10, scale: 1.02 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="p-4 sm:p-6 bg-[#1a1113] border border-[#2a2d40] rounded-lg hover:border-primary-500 transition-all duration-300 hover:shadow-lg hover:shadow-primary-500/20"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary-500/10 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                <span className="text-primary-500 text-xl sm:text-2xl">📦</span>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2 text-white">Inventory Management</h3>
              <p className="text-gray-300 text-sm sm:text-base leading-relaxed">Keep track of your stock levels in real-time with our advanced inventory management system.</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ y: -10, scale: 1.02 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="p-4 sm:p-6 bg-[#1a1113] border border-[#2a2d40] rounded-lg hover:border-primary-500 transition-all duration-300 hover:shadow-lg hover:shadow-primary-500/20"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary-500/10 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                <span className="text-primary-500 text-xl sm:text-2xl">🚚</span>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2 text-white">Order Processing</h3>
              <p className="text-gray-300 text-sm sm:text-base leading-relaxed">Efficiently process and manage orders with automated workflows and real-time updates.</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ y: -10, scale: 1.02 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="p-4 sm:p-6 bg-[#1a1113] border border-[#2a2d40] rounded-lg hover:border-primary-500 transition-all duration-300 hover:shadow-lg hover:shadow-primary-500/20 md:col-span-2 lg:col-span-1"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary-500/10 rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                <span className="text-primary-500 text-xl sm:text-2xl">📍</span>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2 text-white">Delivery Tracking</h3>
              <p className="text-gray-300 text-sm sm:text-base leading-relaxed">Monitor deliveries in real-time and keep your customers informed about their orders.</p>
            </motion.div>
          </div>
        </div>
      </section>      {/* About Section */}
      <section id="about" className="py-12 sm:py-16 lg:py-20 bg-[#1a1113]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center"
          >
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-6 sm:mb-8 text-white"
            >
              About ToolLink
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="text-lg text-gray-300 mb-8"
            >
              ToolLink revolutionizes construction material management by providing a comprehensive platform
              that connects suppliers, warehouses, and customers. Our solution streamlines the entire supply
              chain process, from order placement to final delivery.
            </motion.p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">              <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="text-left"
            >
              <h3 className="text-xl font-semibold mb-4 text-primary-400">Our Mission</h3>                <p className="text-gray-400">
                To simplify construction material logistics and empower businesses with efficient,
                transparent, and reliable supply chain management tools.
              </p>
            </motion.div>              <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
              className="text-left"
            >
                <h3 className="text-xl font-semibold mb-4 text-primary-400">Why Choose Us</h3>
                <p className="text-gray-400">
                  With years of industry experience and cutting-edge technology, we understand the
                  unique challenges of construction material logistics and provide tailored solutions.
                </p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-[#12152c]">
        <div className="container mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-center mb-12 text-white"
          >          What Our Customers Say
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ y: -5, scale: 1.02 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="p-4 sm:p-6 bg-[#1a1113] border border-[#2a2d40] rounded-lg hover:border-primary-500 transition-all duration-300 hover:shadow-lg hover:shadow-primary-500/10"
              >
                <div className="mb-4">
                  <div className="flex text-primary-500 mb-2 text-sm sm:text-base">
                    {[...Array(5)].map((_, index) => (
                      <span key={index}>
                        {index < testimonial.rating ? '⭐' : '☆'}
                      </span>
                    ))}
                  </div>
                  <p className="text-gray-300 italic text-sm sm:text-base leading-relaxed">
                    "{testimonial.comment}"
                  </p>
                </div>
                <div className="flex items-center">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary-500 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                    <span className="text-white font-bold text-sm sm:text-base">
                      {FeedbackService.getInitials(testimonial.customer)}
                    </span>
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm sm:text-base">{testimonial.customer}</p>
                    <p className="text-gray-400 text-xs sm:text-sm">{testimonial.customerRole}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* View All Reviews Button */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="text-center mt-6 sm:mt-8"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <Link
                to="/feedback"
                className="inline-flex items-center bg-transparent border border-primary-500 text-primary-500 hover:bg-primary-500 hover:text-white px-6 py-3 rounded-full transition-all duration-300"
              >
                View All Reviews →
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-[#0d0f1a]">
        <div className="container mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-center mb-12 text-white"
          >
            Get in Touch
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="text-center p-6 bg-[#1a1113] border border-[#2a2d40] rounded-lg hover:border-primary-500 transition-all duration-300"
            >
              <div className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Phone</h3>
              <p className="text-gray-400 mb-2">+94 11 234 5678</p>
              <p className="text-gray-500 text-sm">Mon-Fri 9AM-6PM</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="text-center p-6 bg-[#1a1113] border border-[#2a2d40] rounded-lg hover:border-primary-500 transition-all duration-300"
            >
              <div className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Email</h3>
              <p className="text-gray-400 mb-2">toollinksrilanka@gmail.com</p>
              <p className="text-gray-500 text-sm">We reply within 24hrs</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="text-center p-6 bg-[#1a1113] border border-[#2a2d40] rounded-lg hover:border-primary-500 transition-all duration-300"
            >
              <div className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Location</h3>
              <p className="text-gray-400 mb-2">Nochchiyagama, Sri Lanka</p>
              <p className="text-gray-500 text-sm">Visit our office</p>
            </motion.div>
          </div>

          {/* Contact CTA */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
              Have a question or need assistance? Our team is here to help you with all your construction material needs.
            </p>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <Link
                to="/contact"
                className="inline-flex items-center bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-8 py-3 rounded-full transition-all duration-300 shadow-lg hover:shadow-lg"
              >
                Contact Us Today →
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0d0f1a] border-t border-[#2a2d40] py-12">
        <div className="container mx-auto px-4">
          <div className="text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} ToolLink. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
