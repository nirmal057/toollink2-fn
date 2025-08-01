import React, { useState, useCallback } from 'react';
import { X, Send, User, Mail, Phone, MessageSquare, CheckCircle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ContactModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface ContactForm {
    name: string;
    email: string;
    phone: string;
    subject: string;
    message: string;
}

const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose }) => {
    const [form, setForm] = useState<ContactForm>({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [errors, setErrors] = useState<Partial<ContactForm>>({});

    const validateForm = (): boolean => {
        const newErrors: Partial<ContactForm> = {};

        if (!form.name.trim()) newErrors.name = 'Name is required';
        if (!form.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
            newErrors.email = 'Please enter a valid email';
        }
        if (!form.subject.trim()) newErrors.subject = 'Subject is required';
        if (!form.message.trim()) newErrors.message = 'Message is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = useCallback((field: keyof ContactForm, value: string) => {
        setForm(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    }, [errors]);

    const resetForm = () => {
        setForm({
            name: '',
            email: '',
            phone: '',
            subject: '',
            message: ''
        });
        setErrors({});
        setSubmitStatus('idle');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsSubmitting(true);
        setSubmitStatus('idle');

        try {
            const response = await fetch('http://localhost:5000/api/messages/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: form.name,
                    email: form.email,
                    phone: form.phone || undefined,
                    subject: form.subject,
                    message: form.message
                }),
            });

            if (response.ok) {
                setSubmitStatus('success');
                resetForm();
                setTimeout(() => {
                    onClose();
                }, 3000);
            } else {
                throw new Error('Failed to send message');
            }
        } catch (error) {
            console.error('Error sending message:', error);
            setSubmitStatus('error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                        onClick={handleClose}
                    />

                    {/* Modal Container */}
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0, y: 50 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.8, opacity: 0, y: 50 }}
                            transition={{
                                type: "spring",
                                stiffness: 300,
                                damping: 25,
                                duration: 0.3
                            }}
                            className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-lg max-h-[95vh] overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <motion.div
                                            initial={{ rotate: -10 }}
                                            animate={{ rotate: 0 }}
                                            className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm"
                                        >
                                            <MessageSquare className="w-6 h-6" />
                                        </motion.div>
                                        <div>
                                            <h2 className="text-2xl font-bold">Contact Us</h2>
                                            <p className="text-blue-100">We'd love to hear from you</p>
                                        </div>
                                    </div>
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={handleClose}
                                        className="p-2 hover:bg-white/20 rounded-full transition-colors"
                                    >
                                        <X className="w-6 h-6" />
                                    </motion.button>
                                </div>
                            </div>

                            {/* Form Content */}
                            <div className="p-6 max-h-[calc(95vh-120px)] overflow-y-auto">
                                {/* Success Message */}
                                {submitStatus === 'success' && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="mb-6 p-4 bg-green-50 border-2 border-green-200 text-green-800 rounded-2xl"
                                    >
                                        <div className="flex items-center space-x-3">
                                            <CheckCircle className="w-6 h-6 text-green-600" />
                                            <div>
                                                <h3 className="font-semibold">Message Sent Successfully!</h3>
                                                <p className="text-sm text-green-700">We'll get back to you within 24 hours.</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {/* Error Message */}
                                {submitStatus === 'error' && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="mb-6 p-4 bg-red-50 border-2 border-red-200 text-red-800 rounded-2xl"
                                    >
                                        <div className="flex items-center space-x-3">
                                            <AlertCircle className="w-6 h-6 text-red-600" />
                                            <div>
                                                <h3 className="font-semibold">Failed to Send Message</h3>
                                                <p className="text-sm text-red-700">Please try again or contact us directly.</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {/* Form */}
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* Name Field */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.1 }}
                                    >
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                            Full Name *
                                        </label>
                                        <div className="relative">
                                            <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input
                                                type="text"
                                                value={form.name}
                                                onChange={(e) => handleInputChange('name', e.target.value)}
                                                className={`w-full pl-12 pr-4 py-4 text-base border-2 rounded-xl
                                                    bg-gray-50 dark:bg-gray-800 dark:text-white
                                                    placeholder-gray-500 dark:placeholder-gray-400
                                                    focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500
                                                    transition-all duration-200 ${
                                                        errors.name
                                                            ? 'border-red-500 bg-red-50'
                                                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                                                    }`}
                                                placeholder="Enter your full name"
                                                autoComplete="name"
                                            />
                                        </div>
                                        {errors.name && (
                                            <motion.p
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="text-red-500 text-sm mt-2 flex items-center space-x-1"
                                            >
                                                <AlertCircle className="w-4 h-4" />
                                                <span>{errors.name}</span>
                                            </motion.p>
                                        )}
                                    </motion.div>

                                    {/* Email Field */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 }}
                                    >
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                            Email Address *
                                        </label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input
                                                type="email"
                                                value={form.email}
                                                onChange={(e) => handleInputChange('email', e.target.value)}
                                                className={`w-full pl-12 pr-4 py-4 text-base border-2 rounded-xl
                                                    bg-gray-50 dark:bg-gray-800 dark:text-white
                                                    placeholder-gray-500 dark:placeholder-gray-400
                                                    focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500
                                                    transition-all duration-200 ${
                                                        errors.email
                                                            ? 'border-red-500 bg-red-50'
                                                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                                                    }`}
                                                placeholder="your.email@example.com"
                                                autoComplete="email"
                                            />
                                        </div>
                                        {errors.email && (
                                            <motion.p
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="text-red-500 text-sm mt-2 flex items-center space-x-1"
                                            >
                                                <AlertCircle className="w-4 h-4" />
                                                <span>{errors.email}</span>
                                            </motion.p>
                                        )}
                                    </motion.div>

                                    {/* Phone Field */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 }}
                                    >
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                            Phone Number (Optional)
                                        </label>
                                        <div className="relative">
                                            <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input
                                                type="tel"
                                                value={form.phone}
                                                onChange={(e) => handleInputChange('phone', e.target.value)}
                                                className="w-full pl-12 pr-4 py-4 text-base border-2 rounded-xl
                                                    bg-gray-50 dark:bg-gray-800 dark:text-white
                                                    placeholder-gray-500 dark:placeholder-gray-400
                                                    border-gray-200 dark:border-gray-700 hover:border-gray-300
                                                    focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500
                                                    transition-all duration-200"
                                                placeholder="+94 77 123 4567"
                                                autoComplete="tel"
                                            />
                                        </div>
                                    </motion.div>

                                    {/* Subject Field */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.4 }}
                                    >
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                            Subject *
                                        </label>
                                        <input
                                            type="text"
                                            value={form.subject}
                                            onChange={(e) => handleInputChange('subject', e.target.value)}
                                            className={`w-full px-4 py-4 text-base border-2 rounded-xl
                                                bg-gray-50 dark:bg-gray-800 dark:text-white
                                                placeholder-gray-500 dark:placeholder-gray-400
                                                focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500
                                                transition-all duration-200 ${
                                                    errors.subject
                                                        ? 'border-red-500 bg-red-50'
                                                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                                                }`}
                                            placeholder="What can we help you with?"
                                        />
                                        {errors.subject && (
                                            <motion.p
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="text-red-500 text-sm mt-2 flex items-center space-x-1"
                                            >
                                                <AlertCircle className="w-4 h-4" />
                                                <span>{errors.subject}</span>
                                            </motion.p>
                                        )}
                                    </motion.div>

                                    {/* Message Field */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.5 }}
                                    >
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                            Message *
                                        </label>
                                        <textarea
                                            value={form.message}
                                            onChange={(e) => handleInputChange('message', e.target.value)}
                                            rows={4}
                                            className={`w-full px-4 py-4 text-base border-2 rounded-xl
                                                bg-gray-50 dark:bg-gray-800 dark:text-white
                                                placeholder-gray-500 dark:placeholder-gray-400
                                                focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500
                                                transition-all duration-200 resize-none ${
                                                    errors.message
                                                        ? 'border-red-500 bg-red-50'
                                                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                                                }`}
                                            placeholder="Tell us more about your inquiry..."
                                        />
                                        {errors.message && (
                                            <motion.p
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="text-red-500 text-sm mt-2 flex items-center space-x-1"
                                            >
                                                <AlertCircle className="w-4 h-4" />
                                                <span>{errors.message}</span>
                                            </motion.p>
                                        )}
                                    </motion.div>

                                    {/* Submit Button */}
                                    <motion.button
                                        type="submit"
                                        disabled={isSubmitting || submitStatus === 'success'}
                                        whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                                        whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.6 }}
                                        className={`w-full py-4 px-6 rounded-xl font-semibold text-lg
                                            flex items-center justify-center space-x-3 transition-all duration-200
                                            ${isSubmitting || submitStatus === 'success'
                                                ? 'bg-gray-400 cursor-not-allowed'
                                                : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl'
                                            }`}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <motion.div
                                                    animate={{ rotate: 360 }}
                                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                                                />
                                                <span>Sending Message...</span>
                                            </>
                                        ) : submitStatus === 'success' ? (
                                            <>
                                                <CheckCircle className="w-5 h-5" />
                                                <span>Message Sent!</span>
                                            </>
                                        ) : (
                                            <>
                                                <Send className="w-5 h-5" />
                                                <span>Send Message</span>
                                            </>
                                        )}
                                    </motion.button>
                                </form>

                                {/* Footer */}
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.7 }}
                                    className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700"
                                >
                                    <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                                        🚀 We typically respond within 24 hours during business days
                                    </p>
                                </motion.div>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
};

export default ContactModal;
