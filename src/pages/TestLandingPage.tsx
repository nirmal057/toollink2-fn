import React from 'react';
import { Link } from 'react-router-dom';
import DarkModeToggle from '../components/UI/DarkModeToggle';

const TestLandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a1113] to-[#12152c] text-white relative">
      {/* Dark Mode Toggle */}
      <div className="absolute top-4 right-4 z-20">
        <DarkModeToggle />
      </div>
      
      {/* Simple Navigation */}
      <nav className="flex justify-between items-center px-8 py-4 bg-secondary-950">
        <div className="flex items-center space-x-3">
          <div className="bg-primary-500 w-10 h-10 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">📦</span>
          </div>
          <span className="text-xl font-bold text-white">ToolLink</span>
        </div>
        
        <div className="flex items-center space-x-4">
          <Link
            to="/auth/login"
            className="px-6 py-2.5 border border-primary-500 text-primary-400 hover:text-white rounded-full"
          >
            Login
          </Link>
          <Link
            to="/auth/register"
            className="px-6 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-full"
          >
            Register
          </Link>
        </div>
      </nav>

      {/* Simple Hero */}
      <div className="flex flex-col items-center justify-center px-6 py-20 text-center min-h-screen">
        <h1 className="text-6xl font-bold mb-4">
          <span className="bg-gradient-to-r from-primary-400 to-white text-transparent bg-clip-text">
            ToolLink
          </span>
        </h1>
        <h2 className="text-3xl font-semibold mb-6 text-white">
          Smart platform for construction deliveries
        </h2>
        <p className="text-xl mb-8 max-w-2xl text-white/80">
          The easiest way to manage construction deliveries and inventory tracking.
        </p>
        
        <div className="flex gap-4">
          <Link
            to="/auth/register"
            className="bg-primary-500 hover:bg-primary-600 text-white px-8 py-4 text-lg rounded-full"
          >
            Start Managing Orders →
          </Link>
          <a
            href="#features"
            className="border-2 border-primary-500 hover:bg-primary-500 text-primary-400 hover:text-white px-8 py-4 text-lg rounded-full"
          >
            View Features
          </a>
        </div>
      </div>
    </div>
  );
};

export default TestLandingPage;
