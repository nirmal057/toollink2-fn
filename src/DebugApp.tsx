// Simple React App Test
import { useState, useEffect } from 'react';

function DebugApp() {
    const [backendStatus, setBackendStatus] = useState('checking...');
    const [apiTest, setApiTest] = useState('not tested');

    useEffect(() => {
        // Test backend connection
        fetch('http://localhost:5001/health')
            .then(response => response.json())
            .then(data => {
                console.log('Backend health check:', data);
                setBackendStatus('✅ Connected');
            })
            .catch(error => {
                console.error('Backend connection failed:', error);
                setBackendStatus('❌ Failed');
            });

        // Test API endpoints
        fetch('http://localhost:5001/api/docs')
            .then(response => response.json())
            .then(data => {
                console.log('API docs:', data);
                setApiTest('✅ Working');
            })
            .catch(error => {
                console.error('API test failed:', error);
                setApiTest('❌ Failed');
            });
    }, []);

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
            <h1>ToolLink Debug Status</h1>
            <div style={{ background: '#f5f5f5', padding: '15px', borderRadius: '5px', margin: '10px 0' }}>
                <h3>System Status</h3>
                <p><strong>Backend Health:</strong> {backendStatus}</p>
                <p><strong>API Test:</strong> {apiTest}</p>
                <p><strong>Frontend:</strong> ✅ Running on port 5173</p>
                <p><strong>Timestamp:</strong> {new Date().toLocaleString()}</p>
            </div>

            <div style={{ background: '#e8f4fd', padding: '15px', borderRadius: '5px', margin: '10px 0' }}>
                <h3>Quick Tests</h3>
                <button
                    onClick={() => window.location.href = '/login'}
                    style={{ margin: '5px', padding: '10px', background: '#007bff', color: 'white', border: 'none', borderRadius: '3px' }}
                >
                    Go to Login
                </button>
                <button
                    onClick={() => window.location.href = '/dashboard'}
                    style={{ margin: '5px', padding: '10px', background: '#28a745', color: 'white', border: 'none', borderRadius: '3px' }}
                >
                    Go to Dashboard
                </button>
                <button
                    onClick={() => window.location.href = '/'}
                    style={{ margin: '5px', padding: '10px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '3px' }}
                >
                    Go to Home
                </button>
            </div>

            <div style={{ background: '#fff3cd', padding: '15px', borderRadius: '5px', margin: '10px 0' }}>
                <h3>Console Logs</h3>
                <p>Check the browser console (F12) for detailed logs and errors.</p>
                <p>Backend URL: http://localhost:5001</p>
                <p>Frontend URL: http://localhost:5173</p>
            </div>
        </div>
    );
}

export default DebugApp;
