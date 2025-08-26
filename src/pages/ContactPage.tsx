import React, { useState } from 'react';
import { Phone, Mail, MapPin, Clock, MessageCircle, Users, Send, User, AlertCircle, CheckCircle, Home, X, Bot } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import DarkModeToggle from '../components/UI/DarkModeToggle';
import { api, API_CONFIG } from '../config/api';

interface ContactPageProps {
    // Reserved for future role-based customization
}

const ContactPage: React.FC<ContactPageProps> = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '+94 ',
        subject: '',
        message: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Chat state
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [chatMessages, setChatMessages] = useState<Array<{ id: number, text: string, isBot: boolean, timestamp: Date }>>([
        {
            id: 1,
            text: "Hi! I'm ToolLink Assistant. How can I help you today?",
            isBot: true,
            timestamp: new Date()
        }
    ]);
    const [chatInput, setChatInput] = useState('');

    const handleInputChange = (field: string, value: string) => {
        if (field === 'phone') {
            // Ensure phone always starts with +94
            if (!value.startsWith('+94')) {
                value = '+94 ' + value.replace(/^\+?94\s*/, '');
            }
            // Prevent deletion of +94 prefix
            if (value.length < 4) {
                value = '+94 ';
            }
            // Limit to exactly 9 digits after +94 (total 13 characters: "+94 " + 9 digits)
            if (value.length > 4) {
                const digits = value.substring(4).replace(/\D/g, ''); // Extract only digits
                if (digits.length > 9) {
                    value = '+94 ' + digits.substring(0, 9); // Limit to 9 digits
                } else {
                    value = '+94 ' + digits;
                }
            }
        }
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) newErrors.name = 'Name is required';
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email';
        }
        if (!formData.subject.trim()) newErrors.subject = 'Subject is required';
        if (!formData.message.trim()) newErrors.message = 'Message is required';

        // Validate phone number if provided
        if (formData.phone && formData.phone.trim() !== '+94 ') {
            const digits = formData.phone.substring(4).replace(/\D/g, '');
            if (digits.length !== 9) {
                newErrors.phone = 'Phone number must be exactly 9 digits after +94';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsSubmitting(true);

        try {
            // Send message to backend
            const response = await api.post(API_CONFIG.ENDPOINTS.MESSAGES.CONTACT, {
                name: formData.name,
                email: formData.email,
                subject: formData.subject,
                message: formData.message,
                phone: formData.phone || undefined
            });

            if (response.data.success) {
                setSubmitStatus('success');
                setFormData({ name: '', email: '', phone: '+94 ', subject: '', message: '' });
            } else {
                setSubmitStatus('error');
            }
        } catch (error) {
            console.error('Error sending message:', error);
            setSubmitStatus('error');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Chatbot functions
    const getBotResponse = (userMessage: string): string => {
        const message = userMessage.toLowerCase();

        if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
            return "Hello! Welcome to ToolLink. How can I assist you today?";
        } else if (message.includes('price') || message.includes('cost') || message.includes('pricing')) {
            return "For pricing information, please contact our sales team at Toollink1234@gmail.com or call +94 71 418 8903. We'll provide you with a detailed quote!";
        } else if (message.includes('support') || message.includes('help') || message.includes('issue')) {
            return "I'm here to help! You can reach our technical support team at Toollink1234@gmail.com or call +94 71 418 8903. What specific issue are you facing?";
        } else if (message.includes('hours') || message.includes('time') || message.includes('open')) {
            return "Our business hours are Monday-Friday 9AM-6PM and Saturday 9AM-2PM. We're closed on Sundays. How can I help you today?";
        } else if (message.includes('demo') || message.includes('trial')) {
            return "Great! We'd love to show you ToolLink in action. Please contact our sales team at Toollink1234@gmail.com to schedule a personalized demo.";
        } else if (message.includes('features') || message.includes('what') || message.includes('about')) {
            return "ToolLink is a comprehensive tool management system with inventory tracking, order management, delivery scheduling, and reporting features. Would you like to know more about any specific feature?";
        } else if (message.includes('contact') || message.includes('reach')) {
            return "You can reach us at Toollink1234@gmail.com, call +94 71 418 8903, or use this chat! What would you prefer?";
        } else if (message.includes('bye') || message.includes('goodbye') || message.includes('thank')) {
            return "Thank you for contacting ToolLink! If you need further assistance, don't hesitate to reach out. Have a great day!";
        } else {
            return "I understand you're asking about: '" + userMessage + "'. For detailed assistance, please contact our team at Toollink1234@gmail.com or call +94 71 418 8903. Is there anything specific I can help you with right now?";
        }
    };

    const handleChatSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!chatInput.trim()) return;

        const userMessage = {
            id: chatMessages.length + 1,
            text: chatInput,
            isBot: false,
            timestamp: new Date()
        };

        const botResponse = {
            id: chatMessages.length + 2,
            text: getBotResponse(chatInput),
            isBot: true,
            timestamp: new Date()
        };

        setChatMessages(prev => [...prev, userMessage, botResponse]);
        setChatInput('');
    };

    const openChat = () => setIsChatOpen(true);
    const closeChat = () => setIsChatOpen(false);
    const contactMethods = [
        {
            icon: <Phone className="w-8 h-8" />,
            title: 'Phone Support',
            primary: '+94 71 418 8903',
            secondary: 'Mon-Fri 9AM-6PM, Sat 9AM-2PM',
            description: 'Call us for immediate assistance',
            action: 'tel:+94714188903',
            actionText: 'Call Now',
            bgColor: 'bg-gradient-to-r from-orange-500 to-red-500',
            hoverBg: 'hover:from-orange-600 hover:to-red-600'
        },
        {
            icon: <Mail className="w-8 h-8" />,
            title: 'Email Support',
            primary: 'Toollink1234@gmail.com',
            secondary: 'We reply within 24 hours',
            description: 'Send us detailed questions via email',
            action: 'mailto:Toollink1234@gmail.com',
            actionText: 'Send Email',
            bgColor: 'bg-gradient-to-r from-orange-500 to-red-500',
            hoverBg: 'hover:from-orange-600 hover:to-red-600'
        },
        {
            icon: <MessageCircle className="w-8 h-8" />,
            title: 'Live Chat',
            primary: 'Available now',
            secondary: 'Average response: 2 minutes',
            description: 'Chat with our support team instantly',
            action: 'javascript:void(0)',
            actionText: 'Start Chat',
            bgColor: 'bg-gradient-to-r from-orange-500 to-red-500',
            hoverBg: 'hover:from-orange-600 hover:to-red-600',
            onClick: openChat
        }
    ];

    const officeInfo = {
        address: 'ToolLink Solutions Pvt Ltd',
        street: 'Nikawewa Junction',
        city: 'Nochchiyagama, Sri Lanka',
        hours: [
            { day: 'Monday - Friday', time: '9:00 AM - 6:00 PM' },
            { day: 'Saturday', time: '9:00 AM - 2:00 PM' },
            { day: 'Sunday', time: 'Closed' }
        ]
    };

    const supportTeam = [
        {
            name: 'Technical Support',
            role: 'For technical issues and system problems',
            contact: 'Toollink1234@gmail.com',
            phone: '+94 71 418 8903'
        },
        {
            name: 'Sales Team',
            role: 'For pricing and product inquiries',
            contact: 'Toollink1234@gmail.com',
            phone: '+94 71 418 8903'
        },
        {
            name: 'Customer Success',
            role: 'For account and billing questions',
            contact: 'Toollink1234@gmail.com',
            phone: '+94 71 418 8903'
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-100 dark:from-gray-900 dark:via-orange-900 dark:to-red-900 text-gray-900 dark:text-white transition-colors duration-300">
            {/* Floating Background Elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-orange-300/20 rounded-full blur-3xl animate-float"></div>
                <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-red-300/20 rounded-full blur-3xl animate-float-delayed"></div>
                <div className="absolute top-3/4 left-1/3 w-48 h-48 bg-yellow-300/20 rounded-full blur-3xl animate-float-slow"></div>
            </div>

            {/* Navigation Bar */}
            <motion.div
                className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-orange-200/50 dark:border-gray-700/50 shadow-lg"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
            >
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    {/* Home Button */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                    >
                        <Link
                            to="/"
                            className="flex items-center space-x-2 text-gray-700 dark:text-white/80 hover:text-orange-600 dark:hover:text-white transition-all duration-300 group"
                        >
                            <motion.div
                                className="p-2 rounded-lg bg-gradient-to-r from-orange-500/20 to-red-500/20 group-hover:from-orange-500/30 group-hover:to-red-500/30 border border-orange-500/30 group-hover:border-orange-400/50 transition-all duration-300"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Home className="w-5 h-5" />
                            </motion.div>
                            <span className="font-medium group-hover:text-orange-600 dark:group-hover:text-orange-300 transition-colors duration-300">
                                Home
                            </span>
                        </Link>
                    </motion.div>

                    {/* Page Title */}
                    <motion.div
                        className="flex items-center space-x-2"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <div className="h-8 w-1 bg-gradient-to-b from-orange-500 to-red-500 rounded-full"></div>
                        <h1 className="text-lg font-semibold text-gray-800 dark:text-white/90">Contact Us</h1>
                    </motion.div>

                    {/* Dark Mode Toggle */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                    >
                        <DarkModeToggle />
                    </motion.div>
                </div>
            </motion.div>

            <div className="relative z-10 max-w-7xl mx-auto p-6 space-y-8">
                {/* Header */}
                <motion.div
                    className="text-center space-y-4"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <h1 className="text-4xl lg:text-6xl font-black bg-gradient-to-r from-orange-600 via-red-600 to-yellow-600 bg-clip-text text-transparent drop-shadow-lg">
                        Contact Us
                    </h1>
                    <p className="text-xl text-gray-700 dark:text-white/80 max-w-2xl mx-auto">
                        We're here to help! Reach out to us through any of the channels below and our team will get back to you promptly.
                    </p>
                </motion.div>

                {/* Contact Methods */}
                <motion.div
                    className="grid grid-cols-1 md:grid-cols-3 gap-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                >
                    {contactMethods.map((method, index) => (
                        <motion.div
                            key={index}
                            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-orange-200/50 dark:border-gray-700/30 rounded-3xl shadow-2xl p-6 hover:shadow-orange-500/20 transition-all duration-300 group"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            whileHover={{ y: -5, scale: 1.02 }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/0 to-orange-500/0 group-hover:from-orange-500/10 group-hover:to-red-500/10 rounded-3xl transition-all duration-300"></div>
                            <div className={`${method.bgColor} text-white p-4 rounded-xl inline-flex mb-4 shadow-lg shadow-orange-500/30 relative z-10`}>
                                {method.icon}
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 relative z-10">
                                {method.title}
                            </h3>
                            <p className="text-lg font-medium text-orange-600 dark:text-orange-400 mb-1 relative z-10">
                                {method.primary}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-white/70 mb-3 relative z-10">
                                {method.secondary}
                            </p>
                            <p className="text-gray-700 dark:text-white/80 mb-4 relative z-10">
                                {method.description}
                            </p>
                            {method.onClick ? (
                                <motion.button
                                    onClick={method.onClick}
                                    className={`${method.bgColor} ${method.hoverBg} text-white px-6 py-3 rounded-xl inline-flex items-center transition-all duration-200 shadow-lg hover:shadow-xl relative z-10 font-semibold`}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    {method.actionText}
                                </motion.button>
                            ) : (
                                <motion.a
                                    href={method.action}
                                    className={`${method.bgColor} ${method.hoverBg} text-white px-6 py-3 rounded-xl inline-flex items-center transition-all duration-200 shadow-lg hover:shadow-xl relative z-10 font-semibold`}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    {method.actionText}
                                </motion.a>
                            )}
                        </motion.div>
                    ))}
                </motion.div>

                {/* Contact Form */}
                <motion.div
                    className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-orange-200/50 dark:border-gray-700/30 rounded-3xl shadow-2xl p-8"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                >
                    <div className="max-w-2xl mx-auto">
                        <motion.div
                            className="text-center mb-8"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.5 }}
                        >
                            <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-600 via-red-600 to-yellow-600 bg-clip-text text-transparent mb-4">
                                Send Us a Message
                            </h2>
                            <p className="text-gray-700 dark:text-white/80">
                                Fill out the form below and we'll get back to you as soon as possible.
                            </p>
                        </motion.div>

                        {/* Status Messages */}
                        {submitStatus === 'success' && (
                            <motion.div
                                className="mb-6 p-4 bg-green-100 dark:bg-green-500/20 border border-green-500/50 text-green-700 dark:text-green-300 rounded-xl flex items-center space-x-2 backdrop-blur-sm"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.3 }}
                            >
                                <CheckCircle className="w-5 h-5" />
                                <span>Message sent successfully! We'll get back to you soon.</span>
                            </motion.div>
                        )}

                        {submitStatus === 'error' && (
                            <motion.div
                                className="mb-6 p-4 bg-red-100 dark:bg-red-500/20 border border-red-500/50 text-red-700 dark:text-red-300 rounded-xl flex items-center space-x-2 backdrop-blur-sm"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.3 }}
                            >
                                <AlertCircle className="w-5 h-5" />
                                <span>Failed to send message. Please try again.</span>
                            </motion.div>
                        )}

                        <motion.form
                            onSubmit={handleSubmit}
                            className="space-y-6"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.6 }}
                        >
                            {/* Name and Email Row */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.5, delay: 0.7 }}
                                >
                                    <label className="block text-sm font-medium text-gray-700 dark:text-white/90 mb-2">
                                        Name *
                                    </label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-white/50" />
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => handleInputChange('name', e.target.value)}
                                            className={`w-full pl-10 pr-4 py-3 border rounded-xl bg-white/50 dark:bg-gray-800/60 backdrop-blur-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-300 ${errors.name ? 'border-red-500' : 'border-orange-200/50 dark:border-gray-600/50 hover:border-orange-400/60'
                                                }`}
                                            placeholder="Your full name"
                                        />
                                    </div>
                                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.5, delay: 0.8 }}
                                >
                                    <label className="block text-sm font-medium text-gray-700 dark:text-white/90 mb-2">
                                        Email *
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-white/50" />
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => handleInputChange('email', e.target.value)}
                                            className={`w-full pl-10 pr-4 py-3 border rounded-xl bg-white/50 dark:bg-gray-800/60 backdrop-blur-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-300 ${errors.email ? 'border-red-500' : 'border-orange-200/50 dark:border-gray-600/50 hover:border-orange-400/60'
                                                }`}
                                            placeholder="your.email@example.com"
                                        />
                                    </div>
                                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                                </motion.div>
                            </div>

                            {/* Phone and Subject Row */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.5, delay: 0.9 }}
                                >
                                    <label className="block text-sm font-medium text-gray-700 dark:text-white/90 mb-2">
                                        Phone (Optional)
                                    </label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-white/50" />
                                        <input
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => handleInputChange('phone', e.target.value)}
                                            onKeyDown={(e) => {
                                                // Prevent deleting the +94 prefix
                                                if ((e.key === 'Backspace' || e.key === 'Delete') &&
                                                    (e.target as HTMLInputElement).selectionStart! <= 4) {
                                                    e.preventDefault();
                                                }
                                            }}
                                            onFocus={(e) => {
                                                // Set cursor after +94 prefix
                                                setTimeout(() => {
                                                    e.target.setSelectionRange(4, 4);
                                                }, 10);
                                            }}
                                            className={`w-full pl-10 pr-4 py-3 border rounded-xl bg-white/50 dark:bg-gray-800/60 backdrop-blur-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-300 ${errors.phone ? 'border-red-500' : 'border-orange-200/50 dark:border-gray-600/50 hover:border-orange-400/60'
                                                }`}
                                            placeholder="+94 712345678"
                                        />
                                    </div>
                                    {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.5, delay: 1.0 }}
                                >
                                    <label className="block text-sm font-medium text-gray-700 dark:text-white/90 mb-2">
                                        Subject *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.subject}
                                        onChange={(e) => handleInputChange('subject', e.target.value)}
                                        className={`w-full px-4 py-3 border rounded-xl bg-white/50 dark:bg-gray-800/60 backdrop-blur-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-300 ${errors.subject ? 'border-red-500' : 'border-orange-200/50 dark:border-gray-600/50 hover:border-orange-400/60'
                                            }`}
                                        placeholder="What can we help you with?"
                                    />
                                    {errors.subject && <p className="text-red-500 text-sm mt-1">{errors.subject}</p>}
                                </motion.div>
                            </div>

                            {/* Message */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 1.1 }}
                            >
                                <label className="block text-sm font-medium text-gray-700 dark:text-white/90 mb-2">
                                    Message *
                                </label>
                                <textarea
                                    rows={5}
                                    value={formData.message}
                                    onChange={(e) => handleInputChange('message', e.target.value)}
                                    className={`w-full px-4 py-3 border rounded-xl bg-white/50 dark:bg-gray-800/60 backdrop-blur-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-300 resize-none ${errors.message ? 'border-red-500' : 'border-orange-200/50 dark:border-gray-600/50 hover:border-orange-400/60'
                                        }`}
                                    placeholder="Tell us how we can help you..."
                                />
                                {errors.message && <p className="text-red-500 text-sm mt-1">{errors.message}</p>}
                            </motion.div>

                            {/* Submit Button */}
                            <motion.div
                                className="flex justify-center"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 1.2 }}
                            >
                                <motion.button
                                    type="submit"
                                    disabled={isSubmitting || submitStatus === 'success'}
                                    className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 disabled:from-gray-500 disabled:to-gray-600 text-white px-8 py-3 rounded-xl font-semibold flex items-center space-x-2 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-orange-500/25 disabled:cursor-not-allowed"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            <span>Sending...</span>
                                        </>
                                    ) : submitStatus === 'success' ? (
                                        <>
                                            <CheckCircle className="w-5 h-5" />
                                            <span>Sent!</span>
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-5 h-5" />
                                            <span>Send Message</span>
                                        </>
                                    )}
                                </motion.button>
                            </motion.div>

                            {/* Form Footer */}
                            <motion.div
                                className="text-center pt-4 border-t border-orange-200/50 dark:border-gray-600/50"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.5, delay: 1.3 }}
                            >
                                <p className="text-sm text-gray-600 dark:text-white/60">
                                    We typically respond within 24 hours during business days.
                                </p>
                            </motion.div>
                        </motion.form>
                    </div>
                </motion.div>

                {/* Office Information */}
                <motion.div
                    className="grid grid-cols-1 lg:grid-cols-2 gap-8"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                >
                    {/* Address & Hours */}
                    <motion.div
                        className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-orange-200/50 dark:border-gray-700/30 rounded-3xl shadow-2xl p-6"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.7 }}
                    >
                        <div className="flex items-center mb-4">
                            <MapPin className="w-6 h-6 text-orange-500 mr-3" />
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                Office Location
                            </h3>
                        </div>
                        <div className="space-y-2 mb-6">
                            <p className="font-medium text-gray-900 dark:text-white">{officeInfo.address}</p>
                            <p className="text-gray-700 dark:text-white/80">{officeInfo.street}</p>
                            <p className="text-gray-700 dark:text-white/80">{officeInfo.city}</p>
                        </div>

                        <div className="flex items-center mb-4">
                            <Clock className="w-6 h-6 text-orange-500 mr-3" />
                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Business Hours
                            </h4>
                        </div>
                        <div className="space-y-2">
                            {officeInfo.hours.map((hour, index) => (
                                <div key={index} className="flex justify-between items-center">
                                    <span className="text-gray-700 dark:text-white/80">{hour.day}</span>
                                    <span className="font-medium text-gray-900 dark:text-white">{hour.time}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Support Teams */}
                    <motion.div
                        className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-orange-200/50 dark:border-gray-700/30 rounded-3xl shadow-2xl p-6"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.8 }}
                    >
                        <div className="flex items-center mb-4">
                            <Users className="w-6 h-6 text-orange-500 mr-3" />
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                Support Teams
                            </h3>
                        </div>
                        <div className="space-y-4">
                            {supportTeam.map((team, index) => (
                                <motion.div
                                    key={index}
                                    className="border-b border-orange-200/50 dark:border-gray-600/50 pb-4 last:border-b-0"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: 0.9 + index * 0.1 }}
                                >
                                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                                        {team.name}
                                    </h4>
                                    <p className="text-sm text-gray-700 dark:text-white/80 mb-2">
                                        {team.role}
                                    </p>
                                    <div className="space-y-1">
                                        <motion.a
                                            href={`mailto:${team.contact}`}
                                            className="text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 text-sm block transition-colors duration-200"
                                            whileHover={{ scale: 1.02 }}
                                        >
                                            {team.contact}
                                        </motion.a>
                                        <motion.a
                                            href={`tel:${team.phone.replace(/\s/g, '')}`}
                                            className="text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 text-sm block transition-colors duration-200"
                                            whileHover={{ scale: 1.02 }}
                                        >
                                            {team.phone}
                                        </motion.a>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </motion.div>
            </div>

            {/* Chat Modal */}
            {isChatOpen && (
                <motion.div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={closeChat}
                >
                    <motion.div
                        className="bg-white dark:bg-gray-800 border border-orange-200/50 dark:border-gray-700/50 rounded-3xl shadow-2xl w-full max-w-md h-96 flex flex-col"
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Chat Header */}
                        <div className="flex items-center justify-between p-4 border-b border-orange-200/50 dark:border-gray-700/50">
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                                    <Bot className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-gray-900 dark:text-white font-semibold">ToolLink Assistant</h3>
                                    <p className="text-gray-600 dark:text-white/60 text-sm">Online now</p>
                                </div>
                            </div>
                            <button
                                onClick={closeChat}
                                className="text-gray-600 dark:text-white/60 hover:text-gray-900 dark:hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Chat Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {chatMessages.map((message) => (
                                <div
                                    key={message.id}
                                    className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
                                >
                                    <div
                                        className={`max-w-xs px-3 py-2 rounded-xl ${message.isBot
                                            ? 'bg-gray-100 dark:bg-gray-700/50 text-gray-900 dark:text-white/90'
                                            : 'bg-gradient-to-r from-orange-500 to-red-500 text-white'
                                            }`}
                                    >
                                        <p className="text-sm">{message.text}</p>
                                        <p className="text-xs opacity-70 mt-1">
                                            {message.timestamp.toLocaleTimeString([], {
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Chat Input */}
                        <form onSubmit={handleChatSubmit} className="p-4 border-t border-orange-200/50 dark:border-gray-700/50">
                            <div className="flex space-x-2">
                                <input
                                    type="text"
                                    value={chatInput}
                                    onChange={(e) => setChatInput(e.target.value)}
                                    placeholder="Type your message..."
                                    className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-700/50 border border-orange-200/50 dark:border-gray-600/50 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                                />
                                <motion.button
                                    type="submit"
                                    className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:from-orange-600 hover:to-red-600 transition-all"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <Send className="w-4 h-4" />
                                </motion.button>
                            </div>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </div>
    );
};

export default ContactPage;
