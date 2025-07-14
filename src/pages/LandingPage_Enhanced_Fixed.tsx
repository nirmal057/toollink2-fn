import React from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { FeedbackService } from '../services/feedbackService';
import bg1 from '../images/bg1.jpg';

const LandingPage: React.FC = () => {
  // Get public testimonials from feedback service
  const testimonials = FeedbackService.getPublicFeedback().slice(0, 3);
  
  // Parallax scroll effects
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 500], [0, -100]);
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0.8]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  // Custom hook for scroll-triggered animations
  const useScrollAnimation = () => {
    const ref = React.useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });
    return { ref, isInView };
  };

  const featuresAnimation = useScrollAnimation();
  const aboutAnimation = useScrollAnimation();
  const testimonialsAnimation = useScrollAnimation();
  const contactAnimation = useScrollAnimation();
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a1113] to-[#12152c] text-white">
      {/* Enhanced Navigation Bar */}
      <motion.nav 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative flex justify-between items-center px-8 py-4 bg-gradient-to-r from-secondary-950 via-secondary-900 to-secondary-950 backdrop-blur-xl border-b border-secondary-800/50 shadow-lg"
      >
        {/* Subtle background glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 via-transparent to-primary-500/5"></div>
        
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative flex items-center space-x-3"
        >
          <motion.div 
            className="bg-gradient-to-br from-primary-500 to-primary-600 w-10 h-10 rounded-lg flex items-center justify-center shadow-lg"
            whileHover={{ scale: 1.05, rotate: 5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <span className="text-white font-bold text-lg">📦</span>
          </motion.div>
          <span className="text-xl font-bold text-white tracking-wide">ToolLink</span>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="hidden md:flex items-center space-x-8 relative"
        >
          {['Features', 'About', 'Testimonials', 'Contact'].map((item, index) => (
            <motion.a
              key={item}
              href={`#${item.toLowerCase()}`}
              className="relative text-white/80 hover:text-white font-medium transition-all duration-300 group"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
            >
              {item}
              <motion.div
                className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary-400 to-primary-500 group-hover:w-full transition-all duration-300"
              />
            </motion.a>
          ))}
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="relative flex items-center space-x-4"
        >
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Link
              to="/auth/login"
              className="relative px-6 py-2.5 border border-primary-500/60 text-primary-400 hover:text-white rounded-full transition-all duration-300 overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary-500/0 to-primary-500/0 group-hover:from-primary-500/20 group-hover:to-primary-600/20 transition-all duration-300"></div>
              <span className="relative font-medium">Login</span>
            </Link>
          </motion.div>
          
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Link
              to="/auth/register"
              className="relative px-6 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white rounded-full font-medium transition-all duration-300 shadow-lg hover:shadow-primary-500/25"
            >
              Register
            </Link>
          </motion.div>
        </motion.div>
      </motion.nav>

      {/* Enhanced Hero Section */}
      <motion.div 
        className="relative flex flex-col items-center justify-center px-6 py-20 text-center min-h-screen overflow-hidden"
        style={{ y: heroY, opacity: heroOpacity }}
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
          className="relative z-20 text-center"
        >
          <motion.div variants={itemVariants}>
            <h1 className="text-5xl sm:text-7xl font-display font-bold bg-gradient-to-r from-primary-400 via-primary-300 to-white text-transparent bg-clip-text mb-4 leading-tight drop-shadow-2xl">
              ToolLink
            </h1>
          </motion.div>
          
          <motion.h2 
            variants={itemVariants}
            className="text-2xl sm:text-4xl font-heading font-semibold text-white mb-6 leading-relaxed drop-shadow-lg"
          >
            <span className="text-primary-400 animate-pulse">Simple ordering</span> • <span className="text-secondary-400 animate-bounce">Smart scheduling</span> • <span className="text-tertiary-400 animate-pulse">Real-time tracking</span>
          </motion.h2>
          
          <motion.p 
            variants={itemVariants}
            className="mt-6 max-w-2xl mx-auto text-gray-300 text-lg leading-relaxed drop-shadow-md"
          >
            <span className="bg-gradient-to-r from-primary-400 to-secondary-400 text-transparent bg-clip-text font-semibold">Your hassle-free way to manage construction deliveries</span> <motion.span className="inline-block animate-bounce text-2xl" animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 1, repeat: Infinity }}>📦</motion.span>
          </motion.p>

          <motion.div 
            variants={itemVariants}
            className="mt-12 flex flex-wrap justify-center gap-6"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/auth/register"
                className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white px-8 py-4 text-lg rounded-full shadow-xl hover:shadow-2xl hover:shadow-primary-500/30 transition-all duration-300 transform hover:-translate-y-1"
              >
                Start Managing Orders →
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <a
                href="#features"
                className="border-2 border-primary-500 text-primary-400 hover:bg-primary-500 hover:text-white px-8 py-4 text-lg rounded-full transition-all duration-300 hover:shadow-lg hover:shadow-primary-500/25"
              >
                View Features
              </a>
            </motion.div>
          </motion.div>

          <motion.div 
            variants={itemVariants}
            className="mt-8 text-sm text-green-400 flex flex-wrap justify-center gap-6"
          >
            {['✔ Multi-warehouse support', '✔ Real-time tracking', '✔ Automated scheduling'].map((feature, index) => (
              <motion.span
                key={index}
                className="bg-green-500/10 px-4 py-2 rounded-full border border-green-500/20"
                whileHover={{ scale: 1.05, backgroundColor: "rgba(34, 197, 94, 0.2)" }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 + index * 0.2 }}
              >
                {feature}
              </motion.span>
            ))}
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Enhanced Features Section */}
      <section id="features" className="relative py-24 bg-[#0d0f1a]/50 backdrop-blur-sm">
        <motion.div 
          ref={featuresAnimation.ref}
          variants={containerVariants}
          initial="hidden"
          animate={featuresAnimation.isInView ? "visible" : "hidden"}
          className="container mx-auto px-4"
        >
          <motion.h2 
            variants={itemVariants}
            className="text-4xl font-bold text-center mb-16 text-white"
          >
            Key Features
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: "📦", title: "Inventory Management", desc: "Keep track of your stock levels in real-time with our advanced inventory management system." },
              { icon: "🚚", title: "Order Processing", desc: "Efficiently process and manage orders with automated workflows and real-time updates." },
              { icon: "📍", title: "Delivery Tracking", desc: "Monitor deliveries in real-time and keep your customers informed about their orders." }
            ].map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="p-8 border border-[#2a2d40] rounded-xl bg-gradient-to-br from-[#1a1113] to-[#0d0f1a] backdrop-blur-sm hover:border-primary-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary-500/20"
                whileHover={{ y: -5, scale: 1.02 }}
              >
                <motion.div 
                  className="w-16 h-16 bg-gradient-to-r from-primary-500/20 to-primary-600/20 rounded-xl flex items-center justify-center mb-6"
                  whileHover={{ rotate: 10, scale: 1.1 }}
                >
                  <span className="text-primary-400 text-3xl">{feature.icon}</span>
                </motion.div>
                <h3 className="text-xl font-semibold mb-4 text-white">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Enhanced About Section */}
      <section id="about" className="relative py-24 bg-gradient-to-b from-[#12152c] to-[#1a1113]">
        <motion.div 
          ref={aboutAnimation.ref}
          variants={containerVariants}
          initial="hidden"
          animate={aboutAnimation.isInView ? "visible" : "hidden"}
          className="container mx-auto px-4"
        >
          <div className="max-w-4xl mx-auto text-center">
            <motion.h2 
              variants={itemVariants}
              className="text-4xl font-bold mb-8 text-white"
            >
              About ToolLink
            </motion.h2>
            <motion.p 
              variants={itemVariants}
              className="text-lg text-gray-300 mb-12 leading-relaxed"
            >
              ToolLink revolutionizes construction material management by providing a comprehensive platform 
              that connects suppliers, warehouses, and customers. Our solution streamlines the entire supply 
              chain process, from order placement to final delivery.
            </motion.p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-16">
              <motion.div 
                variants={itemVariants}
                className="text-left bg-gradient-to-br from-primary-500/5 to-transparent p-8 rounded-xl border border-primary-500/10"
                whileHover={{ scale: 1.02, borderColor: "rgba(255, 107, 53, 0.3)" }}
              >
                <h3 className="text-2xl font-semibold mb-4 text-primary-400">Our Mission</h3>
                <p className="text-gray-400 leading-relaxed">
                  To simplify construction material logistics and empower businesses with efficient, 
                  transparent, and reliable supply chain management tools.
                </p>
              </motion.div>
              <motion.div 
                variants={itemVariants}
                className="text-left bg-gradient-to-br from-secondary-500/5 to-transparent p-8 rounded-xl border border-secondary-500/10"
                whileHover={{ scale: 1.02, borderColor: "rgba(11, 37, 69, 0.4)" }}
              >
                <h3 className="text-2xl font-semibold mb-4 text-primary-400">Why Choose Us</h3>
                <p className="text-gray-400 leading-relaxed">
                  With years of industry experience and cutting-edge technology, we understand the 
                  unique challenges of construction material logistics and provide tailored solutions.
                </p>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Enhanced Testimonials Section */}
      <section id="testimonials" className="relative py-24 bg-[#0d0f1a]/70 backdrop-blur-sm">
        <motion.div 
          ref={testimonialsAnimation.ref}
          variants={containerVariants}
          initial="hidden"
          animate={testimonialsAnimation.isInView ? "visible" : "hidden"}
          className="container mx-auto px-4"
        >
          <motion.h2 
            variants={itemVariants}
            className="text-4xl font-bold text-center mb-16 text-white"
          >
            What Our Customers Say
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div 
                key={testimonial.id}
                variants={itemVariants}
                className="p-8 border border-[#2a2d40] rounded-xl bg-gradient-to-br from-[#1a1113] to-[#0d0f1a] backdrop-blur-sm hover:border-primary-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary-500/20"
                whileHover={{ y: -5, scale: 1.02 }}
              >
                <div className="mb-6">
                  <motion.div 
                    className="flex text-primary-400 mb-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.2 + 0.5 }}
                  >
                    {[...Array(5)].map((_, starIndex) => (
                      <motion.span 
                        key={starIndex}
                        className="text-xl"
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: starIndex * 0.1 + index * 0.2 + 0.7 }}
                      >
                        {starIndex < testimonial.rating ? '⭐' : '☆'}
                      </motion.span>
                    ))}
                  </motion.div>
                  <p className="text-gray-300 italic leading-relaxed">
                    "{testimonial.comment}"
                  </p>
                </div>
                <div className="flex items-center">
                  <motion.div 
                    className="w-12 h-12 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center mr-4 shadow-lg"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    <span className="text-white font-bold">
                      {FeedbackService.getInitials(testimonial.customer)}
                    </span>
                  </motion.div>
                  <div>
                    <p className="text-white font-semibold">{testimonial.customer}</p>
                    <p className="text-gray-400 text-sm">{testimonial.customerRole}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          <motion.div 
            variants={itemVariants}
            className="text-center mt-12"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/feedback"
                className="inline-flex items-center bg-transparent border-2 border-primary-500 text-primary-400 hover:bg-primary-500 hover:text-white px-8 py-4 rounded-full transition-all duration-300 hover:shadow-lg hover:shadow-primary-500/25"
              >
                View All Reviews →
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* Enhanced Contact Section */}
      <section id="contact" className="relative py-24 bg-gradient-to-b from-[#12152c] to-[#1a1113]">
        <motion.div 
          ref={contactAnimation.ref}
          variants={containerVariants}
          initial="hidden"
          animate={contactAnimation.isInView ? "visible" : "hidden"}
          className="container mx-auto px-4"
        >
          <div className="max-w-6xl mx-auto">
            <motion.h2 
              variants={itemVariants}
              className="text-4xl font-bold text-center mb-16 text-white"
            >
              Get in Touch
            </motion.h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
              <motion.div variants={itemVariants}>
                <h3 className="text-2xl font-semibold mb-8 text-primary-400">Contact Information</h3>
                <div className="space-y-6">
                  {[
                    { icon: "📧", title: "Email", value: "support@toollink.lk" },
                    { icon: "📞", title: "Phone", value: "+94 11 234 5678" },
                    { icon: "📍", title: "Address", value: "Colombo, Sri Lanka" }
                  ].map((contact, index) => (
                    <motion.div 
                      key={index}
                      className="flex items-center group"
                      whileHover={{ x: 10 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <motion.span 
                        className="text-primary-400 text-2xl mr-4 group-hover:scale-110 transition-transform duration-200"
                      >
                        {contact.icon}
                      </motion.span>
                      <div>
                        <p className="text-white font-semibold">{contact.title}</p>
                        <p className="text-gray-400">{contact.value}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <h3 className="text-2xl font-semibold mb-8 text-primary-400">Send us a Message</h3>
                <form className="space-y-6">
                  {[
                    { type: "text", placeholder: "Your Name" },
                    { type: "email", placeholder: "Your Email" }
                  ].map((input, index) => (
                    <motion.div
                      key={index}
                      whileFocus={{ scale: 1.02 }}
                    >
                      <input
                        type={input.type}
                        placeholder={input.placeholder}
                        className="w-full px-6 py-4 bg-[#0d0f1a]/50 border border-[#2a2d40] rounded-xl text-white placeholder-gray-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all duration-300 backdrop-blur-sm"
                      />
                    </motion.div>
                  ))}
                  <motion.div whileFocus={{ scale: 1.02 }}>
                    <textarea
                      rows={5}
                      placeholder="Your Message"
                      className="w-full px-6 py-4 bg-[#0d0f1a]/50 border border-[#2a2d40] rounded-xl text-white placeholder-gray-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 resize-none transition-all duration-300 backdrop-blur-sm"
                    ></textarea>
                  </motion.div>
                  <motion.button
                    type="submit"
                    className="w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white py-4 rounded-xl font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-primary-500/30"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Send Message
                  </motion.button>
                </form>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Enhanced Footer */}
      <motion.footer 
        className="relative bg-[#0d0f1a]/80 backdrop-blur-xl border-t border-[#2a2d40] py-12"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="container mx-auto px-4">
          <div className="text-center text-gray-400">
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              &copy; {new Date().getFullYear()} ToolLink. All rights reserved.
            </motion.p>
          </div>
        </div>
      </motion.footer>
    </div>
  );
};

export default LandingPage;
