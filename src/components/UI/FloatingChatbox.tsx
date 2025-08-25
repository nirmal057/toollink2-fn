import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Phone, Mail, MapPin, Clock, Minimize2, Maximize2, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Message {
    id: string;
    text: string;
    isUser: boolean;
    timestamp: Date;
}

interface FloatingChatboxProps {
    // Reserved for future use
}

const FloatingChatbox: React.FC<FloatingChatboxProps> = () => {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: 'Hello! How can we help you today?',
            isUser: false,
            timestamp: new Date()
        }
    ]);
    const [showContactInfo, setShowContactInfo] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = () => {
        if (message.trim()) {
            const newMessage: Message = {
                id: Date.now().toString(),
                text: message,
                isUser: true,
                timestamp: new Date()
            };

            setMessages(prev => [...prev, newMessage]);
            setMessage('');

            // Auto-reply after a short delay
            setTimeout(() => {
                const autoReply: Message = {
                    id: (Date.now() + 1).toString(),
                    text: "Thank you for your message! Our team will get back to you soon.",
                    isUser: false,
                    timestamp: new Date()
                };
                setMessages(prev => [...prev, autoReply]);
            }, 1000);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const contactInfo = [
        {
            icon: <Phone size={16} />,
            label: 'Phone',
            value: '+94 11 234 5678',
            subtext: 'Mon-Fri 9AM-6PM'
        },
        {
            icon: <Mail size={16} />,
            label: 'Email',
            value: 'support@toollink.lk',
            subtext: 'We reply within 24hrs'
        },
        {
            icon: <MapPin size={16} />,
            label: 'Address',
            value: 'Nikawewa Junction, Nochchiyagama, Sri Lanka',
            subtext: 'Visit our office'
        },
        {
            icon: <Clock size={16} />,
            label: 'Business Hours',
            value: 'Mon-Fri 9AM-6PM',
            subtext: 'Sat 9AM-2PM'
        }
    ];

    if (!isOpen) {
        return (
            <div className="fixed bottom-6 right-6 z-50">
                <button
                    onClick={() => setIsOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 animate-pulse"
                    aria-label="Open chat"
                >
                    <MessageCircle size={24} />
                </button>
            </div>
        );
    }

    return (
        <div className="fixed bottom-6 right-6 z-50">
            <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 transition-all duration-300 ${isMinimized ? 'w-80 h-16' : 'w-80 h-96'
                }`}>
                {/* Header */}
                <div className="flex items-center justify-between p-4 bg-blue-600 text-white rounded-t-lg">
                    <div className="flex items-center space-x-2">
                        <MessageCircle size={20} />
                        <h3 className="font-semibold">ToolLink Support</h3>
                    </div>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => setIsMinimized(!isMinimized)}
                            className="hover:bg-blue-700 p-1 rounded transition-colors"
                            aria-label={isMinimized ? "Maximize" : "Minimize"}
                        >
                            {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
                        </button>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="hover:bg-blue-700 p-1 rounded transition-colors"
                            aria-label="Close chat"
                        >
                            <X size={16} />
                        </button>
                    </div>
                </div>

                {!isMinimized && (
                    <>
                        {/* Navigation Tabs */}
                        <div className="flex border-b border-gray-200 dark:border-gray-700">
                            <button
                                onClick={() => setShowContactInfo(false)}
                                className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${!showContactInfo
                                    ? 'text-blue-600 border-b-2 border-blue-600'
                                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                                    }`}
                            >
                                Chat
                            </button>
                            <button
                                onClick={() => setShowContactInfo(true)}
                                className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${showContactInfo
                                    ? 'text-blue-600 border-b-2 border-blue-600'
                                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                                    }`}
                            >
                                Contact Info
                            </button>
                        </div>

                        {/* Content */}
                        {showContactInfo ? (
                            /* Contact Information */
                            <div className="p-4 space-y-4 h-64 overflow-y-auto">
                                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Get in Touch</h4>
                                {contactInfo.map((info, index) => (
                                    <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                        <div className="text-blue-600 dark:text-blue-400 mt-1">
                                            {info.icon}
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-medium text-gray-900 dark:text-white text-sm">
                                                {info.label}
                                            </div>
                                            <div className="text-gray-700 dark:text-gray-300 text-sm">
                                                {info.value}
                                            </div>
                                            <div className="text-gray-500 dark:text-gray-400 text-xs">
                                                {info.subtext}
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {/* Quick Actions */}
                                <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
                                    <h5 className="font-medium text-gray-900 dark:text-white text-sm mb-2">Quick Actions</h5>
                                    <div className="space-y-2">
                                        <a
                                            href="tel:+94112345678"
                                            className="flex items-center space-x-2 p-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors text-sm"
                                        >
                                            <Phone size={14} />
                                            <span>Call Now</span>
                                        </a>
                                        <a
                                            href="mailto:support@toollink.lk"
                                            className="flex items-center space-x-2 p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors text-sm"
                                        >
                                            <Mail size={14} />
                                            <span>Send Email</span>
                                        </a>
                                        <button
                                            onClick={() => {
                                                navigate('/contact');
                                                setIsOpen(false);
                                            }}
                                            className="flex items-center space-x-2 p-2 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors text-sm w-full"
                                        >
                                            <ExternalLink size={14} />
                                            <span>View Full Contact Info</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            /* Chat Messages */
                            <>
                                <div className="h-64 overflow-y-auto p-4 space-y-3">
                                    {messages.map((msg) => (
                                        <div
                                            key={msg.id}
                                            className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div
                                                className={`max-w-xs px-3 py-2 rounded-lg text-sm ${msg.isUser
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                                                    }`}
                                            >
                                                <p>{msg.text}</p>
                                                <p className={`text-xs mt-1 ${msg.isUser ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                                                    }`}>
                                                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Message Input */}
                                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                                    <div className="flex space-x-2">
                                        <textarea
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            onKeyPress={handleKeyPress}
                                            placeholder="Type your message..."
                                            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm resize-none"
                                            rows={1}
                                        />
                                        <button
                                            onClick={handleSendMessage}
                                            disabled={!message.trim()}
                                            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white p-2 rounded-lg transition-colors"
                                            aria-label="Send message"
                                        >
                                            <Send size={16} />
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default FloatingChatbox;
