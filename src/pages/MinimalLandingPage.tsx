import React from 'react';
import { Link } from 'react-router-dom';
import DarkModeToggle from '../components/UI/DarkModeToggle';

const MinimalLandingPage: React.FC = () => {
  return (
    <div style={{
      minHeight: '100vh',
      padding: '20px',
      backgroundColor: '#1a1a2e',
      color: 'white',
      fontFamily: 'Arial, sans-serif',
      position: 'relative'
    }}>
      {/* Dark Mode Toggle */}
      <div style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        zIndex: 10
      }}>
        <DarkModeToggle />
      </div>

      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        textAlign: 'center',
        paddingTop: '100px'
      }}>
        {/* Header */}
        <h1 style={{
          fontSize: '4rem',
          marginBottom: '20px',
          background: 'linear-gradient(45deg, #00d4ff, #ff00d4)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          ToolLink
        </h1>
        
        <p style={{
          fontSize: '1.5rem',
          marginBottom: '40px',
          color: '#cccccc'
        }}>
          Construction Material Management System
        </p>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          gap: '20px',
          justifyContent: 'center',
          marginBottom: '60px'
        }}>
          <Link
            to="/auth/login"
            style={{
              backgroundColor: '#00d4ff',
              color: 'white',
              padding: '15px 30px',
              textDecoration: 'none',
              borderRadius: '8px',
              fontSize: '1.2rem',
              fontWeight: 'bold',
              transition: 'all 0.3s'
            }}
          >
            Login
          </Link>
          
          <Link
            to="/auth/register"
            style={{
              backgroundColor: '#ff00d4',
              color: 'white',
              padding: '15px 30px',
              textDecoration: 'none',
              borderRadius: '8px',
              fontSize: '1.2rem',
              fontWeight: 'bold',
              transition: 'all 0.3s'
            }}
          >
            Register
          </Link>
        </div>

        {/* Features */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px',
          marginBottom: '60px'
        }}>
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            padding: '30px',
            borderRadius: '10px',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <h3 style={{ color: '#00d4ff', marginBottom: '15px' }}>📦 Inventory</h3>
            <p>Manage construction materials efficiently</p>
          </div>
          
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            padding: '30px',
            borderRadius: '10px',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <h3 style={{ color: '#ff00d4', marginBottom: '15px' }}>🚚 Delivery</h3>
            <p>Track deliveries in real-time</p>
          </div>
          
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            padding: '30px',
            borderRadius: '10px',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <h3 style={{ color: '#ffaa00', marginBottom: '15px' }}>📊 Reports</h3>
            <p>Generate detailed analytics</p>
          </div>
        </div>

        {/* Demo Credentials */}
        <div style={{
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          padding: '30px',
          borderRadius: '10px',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <h3 style={{ marginBottom: '20px' }}>Demo Accounts</h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px'
          }}>
            <div>
              <h4 style={{ color: '#00d4ff' }}>Admin</h4>
              <p>Email: admin@toollink.com</p>
              <p>Password: admin123</p>
            </div>
            <div>
              <h4 style={{ color: '#ff00d4' }}>User</h4>
              <p>Email: user@toollink.com</p>
              <p>Password: user123</p>
            </div>
          </div>
        </div>

        {/* Test Links */}
        <div style={{ marginTop: '40px' }}>
          <Link
            to="/test"
            style={{
              color: '#00ff88',
              textDecoration: 'none',
              fontSize: '1.1rem'
            }}
          >
            🧪 System Test Page
          </Link>
        </div>

        {/* Status */}
        <div style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          backgroundColor: 'rgba(0, 255, 136, 0.2)',
          padding: '10px 15px',
          borderRadius: '20px',
          border: '1px solid #00ff88',
          fontSize: '0.9rem'
        }}>
          🟢 System Online
        </div>
      </div>
    </div>
  );
};

export default MinimalLandingPage;
