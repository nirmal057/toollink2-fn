import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DarkModeToggle from '../components/UI/DarkModeToggle';

const TestPage: React.FC = () => {
  const [backendHealth, setBackendHealth] = useState<any>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const testBackendConnection = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/health');
        const data = await response.json();
        setBackendHealth(data);
        setError('');
      } catch (err: any) {
        setError(err.message || 'Failed to connect to backend');
      } finally {
        setLoading(false);
      }
    };

    testBackendConnection();
  }, []);

  const testLoginEndpoint = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'admin@toollink.com',
          password: 'admin123'
        }),
      });
      const data = await response.json();
      alert('Login test result: ' + JSON.stringify(data, null, 2));
    } catch (err: any) {
      alert('Login test error: ' + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8 relative transition-colors duration-300">
      {/* Dark Mode Toggle */}
      <div className="absolute top-4 right-4 z-10">
        <DarkModeToggle />
      </div>
      
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">ToolLink System Test</h1>
        
        {/* Backend Connection Test */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6 transition-colors duration-300">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Backend Connection</h2>
          
          {loading ? (
            <div className="text-blue-600">Testing backend connection...</div>
          ) : error ? (
            <div className="text-red-600">
              <strong>Error:</strong> {error}
            </div>
          ) : (
            <div className="text-green-600">
              <strong>✅ Backend Connected Successfully</strong>
              <pre className="mt-2 p-3 bg-gray-100 rounded text-sm">
                {JSON.stringify(backendHealth, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Test Login */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Authentication Test</h2>
          <button
            onClick={testLoginEndpoint}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Test Login Endpoint
          </button>
        </div>

        {/* Navigation Links */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Navigation Test</h2>
          <div className="space-y-2">
            <div>
              <Link 
                to="/auth/login" 
                className="text-blue-600 hover:text-blue-800 underline mr-4"
              >
                Go to Login Page
              </Link>
            </div>
            <div>
              <Link 
                to="/auth/register" 
                className="text-blue-600 hover:text-blue-800 underline mr-4"
              >
                Go to Register Page
              </Link>
            </div>
            <div>
              <Link 
                to="/" 
                className="text-blue-600 hover:text-blue-800 underline mr-4"
              >
                Go to Landing Page
              </Link>
            </div>
          </div>
        </div>

        {/* System Information */}
        <div className="bg-white rounded-lg shadow-md p-6 mt-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">System Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Frontend URL:</strong> {window.location.origin}
            </div>
            <div>
              <strong>Backend URL:</strong> http://localhost:5000
            </div>
            <div>
              <strong>Current Path:</strong> {window.location.pathname}
            </div>
            <div>
              <strong>User Agent:</strong> {navigator.userAgent.substring(0, 50)}...
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestPage;
