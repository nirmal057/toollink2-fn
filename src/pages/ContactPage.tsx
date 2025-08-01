import React from 'react';
import { Phone, Mail, MapPin, Clock, MessageCircle, Users, Headphones } from 'lucide-react';

interface ContactPageProps {
    // Reserved for future role-based customization
}

const ContactPage: React.FC<ContactPageProps> = () => {
    const contactMethods = [
        {
            icon: <Phone className="w-8 h-8" />,
            title: 'Phone Support',
            primary: '+94 11 234 5678',
            secondary: 'Mon-Fri 9AM-6PM, Sat 9AM-2PM',
            description: 'Call us for immediate assistance',
            action: 'tel:+94112345678',
            actionText: 'Call Now',
            bgColor: 'bg-green-500',
            hoverBg: 'hover:bg-green-600'
        },
        {
            icon: <Mail className="w-8 h-8" />,
            title: 'Email Support',
            primary: 'support@toollink.lk',
            secondary: 'We reply within 24 hours',
            description: 'Send us detailed questions via email',
            action: 'mailto:support@toollink.lk',
            actionText: 'Send Email',
            bgColor: 'bg-blue-500',
            hoverBg: 'hover:bg-blue-600'
        },
        {
            icon: <MessageCircle className="w-8 h-8" />,
            title: 'Live Chat',
            primary: 'Available now',
            secondary: 'Average response: 2 minutes',
            description: 'Chat with our support team instantly',
            action: '#',
            actionText: 'Start Chat',
            bgColor: 'bg-purple-500',
            hoverBg: 'hover:bg-purple-600'
        }
    ];

    const officeInfo = {
        address: 'ToolLink Solutions Pvt Ltd',
        street: '123 Business District',
        city: 'Colombo 03, Sri Lanka',
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
            contact: 'tech@toollink.lk',
            phone: '+94 11 234 5679'
        },
        {
            name: 'Sales Team',
            role: 'For pricing and product inquiries',
            contact: 'sales@toollink.lk',
            phone: '+94 11 234 5680'
        },
        {
            name: 'Customer Success',
            role: 'For account and billing questions',
            contact: 'success@toollink.lk',
            phone: '+94 11 234 5681'
        }
    ];

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-8">
            {/* Header */}
            <div className="text-center space-y-4">
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                    Contact Us
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                    We're here to help! Reach out to us through any of the channels below and our team will get back to you promptly.
                </p>
            </div>

            {/* Contact Methods */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {contactMethods.map((method, index) => (
                    <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
                        <div className={`${method.bgColor} text-white p-4 rounded-lg inline-flex mb-4`}>
                            {method.icon}
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            {method.title}
                        </h3>
                        <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-1">
                            {method.primary}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                            {method.secondary}
                        </p>
                        <p className="text-gray-600 dark:text-gray-300 mb-4">
                            {method.description}
                        </p>
                        <a
                            href={method.action}
                            className={`${method.bgColor} ${method.hoverBg} text-white px-4 py-2 rounded-lg inline-flex items-center transition-colors duration-200`}
                        >
                            {method.actionText}
                        </a>
                    </div>
                ))}
            </div>

            {/* Office Information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Address & Hours */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                    <div className="flex items-center mb-4">
                        <MapPin className="w-6 h-6 text-blue-500 mr-3" />
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                            Office Location
                        </h3>
                    </div>
                    <div className="space-y-2 mb-6">
                        <p className="font-medium text-gray-900 dark:text-white">{officeInfo.address}</p>
                        <p className="text-gray-600 dark:text-gray-300">{officeInfo.street}</p>
                        <p className="text-gray-600 dark:text-gray-300">{officeInfo.city}</p>
                    </div>

                    <div className="flex items-center mb-4">
                        <Clock className="w-6 h-6 text-blue-500 mr-3" />
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Business Hours
                        </h4>
                    </div>
                    <div className="space-y-2">
                        {officeInfo.hours.map((hour, index) => (
                            <div key={index} className="flex justify-between items-center">
                                <span className="text-gray-600 dark:text-gray-300">{hour.day}</span>
                                <span className="font-medium text-gray-900 dark:text-white">{hour.time}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Support Teams */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                    <div className="flex items-center mb-4">
                        <Users className="w-6 h-6 text-blue-500 mr-3" />
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                            Support Teams
                        </h3>
                    </div>
                    <div className="space-y-4">
                        {supportTeam.map((team, index) => (
                            <div key={index} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-b-0">
                                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                                    {team.name}
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                                    {team.role}
                                </p>
                                <div className="space-y-1">
                                    <a
                                        href={`mailto:${team.contact}`}
                                        className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm block"
                                    >
                                        {team.contact}
                                    </a>
                                    <a
                                        href={`tel:${team.phone.replace(/\s/g, '')}`}
                                        className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm block"
                                    >
                                        {team.phone}
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* FAQ Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <div className="flex items-center mb-6">
                    <Headphones className="w-6 h-6 text-blue-500 mr-3" />
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Frequently Asked Questions
                    </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                            What are your response times?
                        </h4>
                        <p className="text-gray-600 dark:text-gray-300 text-sm">
                            Live chat: 2-5 minutes, Email: Within 24 hours, Phone: Immediate during business hours
                        </p>
                    </div>
                    <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                            Do you offer 24/7 support?
                        </h4>
                        <p className="text-gray-600 dark:text-gray-300 text-sm">
                            Our chat support is available 24/7. Phone and email support follow business hours.
                        </p>
                    </div>
                    <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                            Can I schedule a demo?
                        </h4>
                        <p className="text-gray-600 dark:text-gray-300 text-sm">
                            Yes! Contact our sales team to schedule a personalized demo of ToolLink.
                        </p>
                    </div>
                    <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                            What information should I include?
                        </h4>
                        <p className="text-gray-600 dark:text-gray-300 text-sm">
                            Please include your account details, describe the issue clearly, and mention any error messages.
                        </p>
                    </div>
                </div>
            </div>

            {/* Emergency Contact */}
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
                    Emergency Support
                </h3>
                <p className="text-red-700 dark:text-red-300 mb-3">
                    For critical system outages or urgent technical issues that affect your business operations:
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                    <a
                        href="tel:+94112345999"
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg inline-flex items-center justify-center transition-colors duration-200"
                    >
                        <Phone className="w-4 h-4 mr-2" />
                        Emergency: +94 11 234 5999
                    </a>
                    <a
                        href="mailto:emergency@toollink.lk"
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg inline-flex items-center justify-center transition-colors duration-200"
                    >
                        <Mail className="w-4 h-4 mr-2" />
                        emergency@toollink.lk
                    </a>
                </div>
            </div>
        </div>
    );
};

export default ContactPage;
