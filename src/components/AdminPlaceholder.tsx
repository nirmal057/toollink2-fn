import React from 'react';

interface AdminPlaceholderProps {
    title: string;
    description?: string;
}

const AdminPlaceholder: React.FC<AdminPlaceholderProps> = ({ title, description }) => {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mx-auto mb-6 flex items-center justify-center">
                            <span className="text-white text-2xl font-bold">⚙️</span>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                            {title}
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
                            {description || `The ${title} section is currently under development. More features will be available soon.`}
                        </p>
                        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-6 mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                Coming Soon
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                This admin section will include advanced management tools and comprehensive controls for system administrators.
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-3 justify-center">
                            <button
                                onClick={() => window.history.back()}
                                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
                            >
                                Go Back
                            </button>
                            <button
                                onClick={() => window.location.href = '/admin'}
                                className="px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
                            >
                                Admin Dashboard
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminPlaceholder;
