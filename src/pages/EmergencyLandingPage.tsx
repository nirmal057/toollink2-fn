import React from 'react';

const EmergencyLandingPage: React.FC = () => {
  return (
    <div>
      <style dangerouslySetInnerHTML={{
        __html: `
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: Arial, sans-serif;
            background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
            color: white;
            min-height: 100vh;
          }
          
          .container {
            max-width: 800px;
            margin: 0 auto;
            padding: 50px 20px;
            text-align: center;
          }
          
          .title {
            font-size: 3rem;
            margin-bottom: 20px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
          }
          
          .subtitle {
            font-size: 1.2rem;
            margin-bottom: 40px;
            opacity: 0.9;
          }
          
          .button {
            display: inline-block;
            padding: 15px 30px;
            margin: 10px;
            background: rgba(255,255,255,0.2);
            color: white;
            text-decoration: none;
            border-radius: 8px;
            transition: background 0.3s;
            font-weight: bold;
          }
          
          .button:hover {
            background: rgba(255,255,255,0.3);
          }
          
          .login-btn {
            background: #007bff;
          }
          
          .register-btn {
            background: #28a745;
          }
          
          .features {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin: 50px 0;
          }
          
          .feature {
            background: rgba(255,255,255,0.1);
            padding: 20px;
            border-radius: 8px;
            border: 1px solid rgba(255,255,255,0.2);
          }
          
          .status {
            position: fixed;
            top: 20px;
            right: 20px;
            background: #28a745;
            padding: 10px 15px;
            border-radius: 20px;
            font-size: 0.9rem;
          }
        `
      }} />
      
      <div className="status">
        🟢 System Online
      </div>
      
      <div className="container">
        <h1 className="title">ToolLink</h1>
        <p className="subtitle">Construction Material Management System</p>
        
        <div>
          <a href="/auth/login" className="button login-btn">Login</a>
          <a href="/auth/register" className="button register-btn">Register</a>
          <a href="/test" className="button">System Test</a>
        </div>
        
        <div className="features">
          <div className="feature">
            <h3>📦 Inventory</h3>
            <p>Manage materials efficiently</p>
          </div>
          <div className="feature">
            <h3>🚚 Delivery</h3>
            <p>Track shipments</p>
          </div>
          <div className="feature">
            <h3>📊 Analytics</h3>
            <p>Generate reports</p>
          </div>
        </div>
        
        <div style={{
          background: 'rgba(0,0,0,0.3)',
          padding: '20px',
          borderRadius: '8px',
          marginTop: '40px'
        }}>
          <h3>Demo Accounts</h3>
          <p><strong>Admin:</strong> admin@toollink.com / admin123</p>
          <p><strong>User:</strong> user@toollink.com / user123</p>
        </div>
        
        <div style={{ marginTop: '30px', fontSize: '0.9rem', opacity: '0.7' }}>
          <p>Frontend: http://localhost:5173</p>
          <p>Backend: http://localhost:5000</p>
        </div>
      </div>
    </div>
  );
};

export default EmergencyLandingPage;
