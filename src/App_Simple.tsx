import React from 'react';

function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">ToolLink System</h1>
        <p className="text-gray-600 mb-4">MongoDB Backend Connected ✅</p>
        <p className="text-gray-600 mb-4">Frontend React App Loading ✅</p>
        <div className="space-y-2">
          <button 
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
            onClick={() => window.location.href = '/login'}
          >
            Go to Login
          </button>
          <button 
            className="w-full bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700"
            onClick={() => {
              fetch('http://localhost:5001/api/health')
                .then(res => res.json())
                .then(data => alert('Backend Status: ' + data.status))
                .catch(err => alert('Backend Error: ' + err.message));
            }}
          >
            Test Backend Connection
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
