import React from 'react';
import { Link } from 'react-router-dom';
import DarkModeToggle from '../components/UI/DarkModeToggle';

const SimpleLandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 text-white relative">
      {/* Dark Mode Toggle */}
      <div className="absolute top-4 right-4 z-10">
        <DarkModeToggle />
      </div>
      
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            ToolLink
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Professional Construction Material Management System
          </p>
          <div className="flex justify-center space-x-4">
            <Link
              to="/auth/login"
              className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Sign In
            </Link>
            <Link
              to="/auth/register"
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Register
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-300">
            <div className="text-cyan-400 text-4xl mb-4">📦</div>
            <h3 className="text-xl font-semibold mb-3">Inventory Management</h3>
            <p className="text-gray-300">
              Track and manage construction materials with real-time inventory updates and automated reordering.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-300">
            <div className="text-purple-400 text-4xl mb-4">🚚</div>
            <h3 className="text-xl font-semibold mb-3">Delivery Tracking</h3>
            <p className="text-gray-300">
              Monitor deliveries in real-time with GPS tracking and automated notifications for clients.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-300">
            <div className="text-pink-400 text-4xl mb-4">📊</div>
            <h3 className="text-xl font-semibold mb-3">Analytics & Reports</h3>
            <p className="text-gray-300">
              Generate detailed reports and analytics to optimize your construction material operations.
            </p>
          </div>
        </div>

        {/* Demo Credentials */}
        <div className="bg-white/5 backdrop-blur-lg rounded-xl p-8 border border-white/10 max-w-2xl mx-auto">
          <h3 className="text-2xl font-semibold mb-4 text-center">Demo Access</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-cyan-500/20 rounded-lg p-4">
              <h4 className="font-semibold text-cyan-300 mb-2">Admin Account</h4>
              <p className="text-sm text-gray-300">
                <strong>Email:</strong> admin@toollink.com<br />
                <strong>Password:</strong> admin123
              </p>
            </div>
            <div className="bg-purple-500/20 rounded-lg p-4">
              <h4 className="font-semibold text-purple-300 mb-2">User Account</h4>
              <p className="text-sm text-gray-300">
                <strong>Email:</strong> user@toollink.com<br />
                <strong>Password:</strong> user123
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-16 text-gray-400">
          <p>&copy; 2025 ToolLink. Professional Construction Material Management.</p>
          <div className="mt-4">
            <Link to="/test" className="text-cyan-400 hover:text-cyan-300 mr-4">
              System Test
            </Link>
            <a href="http://localhost:5000/api" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300">
              API Documentation
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleLandingPage;
