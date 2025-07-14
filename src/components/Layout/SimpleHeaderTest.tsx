import { useState } from 'react';
import { BellIcon, UserIcon } from 'lucide-react';

const SimpleHeaderTest = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleNotificationClick = () => {
    console.log('🔔 Notification clicked!');
    alert('Notification button works!');
    setShowNotifications(!showNotifications);
    setShowUserMenu(false);
  };

  const handleUserClick = () => {
    console.log('👤 User menu clicked!');
    alert('User menu button works!');
    setShowUserMenu(!showUserMenu);
    setShowNotifications(false);
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#f0f0f0', minHeight: '100vh' }}>
      <div style={{ 
        backgroundColor: 'white', 
        padding: '16px', 
        borderRadius: '8px', 
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <h1 style={{ margin: 0, color: '#333' }}>Simple Header Test</h1>
        
        <div style={{ display: 'flex', gap: '16px' }}>
          {/* Notification Button */}
          <button
            onClick={handleNotificationClick}
            style={{
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              border: '3px solid #007bff',
              backgroundColor: showNotifications ? '#007bff' : '#fff',
              color: showNotifications ? '#fff' : '#007bff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              fontSize: '16px',
              fontWeight: 'bold'
            }}
          >
            <BellIcon size={24} />
            <span style={{
              position: 'absolute',
              top: '-5px',
              right: '-5px',
              backgroundColor: '#dc3545',
              color: 'white',
              borderRadius: '50%',
              width: '24px',
              height: '24px',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold'
            }}>3</span>
          </button>

          {/* User Button */}
          <button
            onClick={handleUserClick}
            style={{
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              border: '3px solid #28a745',
              backgroundColor: showUserMenu ? '#28a745' : '#fff',
              color: showUserMenu ? '#fff' : '#28a745',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
              fontWeight: 'bold'
            }}
          >
            <UserIcon size={24} />
          </button>
        </div>
      </div>

      {/* State Display */}
      <div style={{
        backgroundColor: '#333',
        color: 'white',
        padding: '12px',
        borderRadius: '4px',
        fontFamily: 'monospace',
        marginBottom: '20px',
        fontSize: '16px'
      }}>
        <strong>STATE:</strong> Notifications: {showNotifications ? '✅ OPEN' : '❌ CLOSED'} | 
        User Menu: {showUserMenu ? '✅ OPEN' : '❌ CLOSED'}
      </div>

      {/* Notification Dropdown */}
      {showNotifications && (
        <div style={{
          position: 'fixed',
          top: '100px',
          right: '20px',
          width: '320px',
          backgroundColor: 'white',
          border: '2px solid #007bff',
          borderRadius: '8px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
          zIndex: 999999
        }}>
          <div style={{ 
            padding: '16px', 
            borderBottom: '1px solid #eee', 
            fontWeight: 'bold',
            backgroundColor: '#007bff',
            color: 'white',
            borderRadius: '6px 6px 0 0'
          }}>
            🔔 Notifications
          </div>
          <div style={{ padding: '16px' }}>
            <div style={{ marginBottom: '12px', padding: '8px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
              ✉️ New message received
            </div>
            <div style={{ marginBottom: '12px', padding: '8px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
              📦 Order has been shipped
            </div>
            <div style={{ padding: '8px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
              ⚠️ Low inventory alert
            </div>
          </div>
        </div>
      )}

      {/* User Menu Dropdown */}
      {showUserMenu && (
        <div style={{
          position: 'fixed',
          top: '100px',
          right: '20px',
          width: '200px',
          backgroundColor: 'white',
          border: '2px solid #28a745',
          borderRadius: '8px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
          zIndex: 999999
        }}>
          <div style={{ 
            padding: '12px', 
            cursor: 'pointer',
            backgroundColor: '#f8f9fa',
            borderRadius: '6px 6px 0 0'
          }} onClick={() => alert('Profile clicked!')}>
            👤 Profile
          </div>
          <div style={{ 
            padding: '12px', 
            cursor: 'pointer', 
            borderTop: '1px solid #eee', 
            color: '#dc3545',
            fontWeight: 'bold'
          }} onClick={() => alert('Logout clicked!')}>
            🚪 Logout
          </div>
        </div>
      )}

      <div style={{ marginTop: '40px', backgroundColor: 'white', padding: '20px', borderRadius: '8px' }}>
        <h2 style={{ color: '#333', marginTop: 0 }}>🧪 Test Instructions:</h2>
        <ol style={{ fontSize: '16px', lineHeight: '1.6' }}>
          <li><strong>Click the notification button</strong> (blue with bell icon) - should show alert and dropdown</li>
          <li><strong>Click the user button</strong> (green with user icon) - should show alert and dropdown</li>
          <li><strong>Check the state display</strong> above to see if state changes</li>
          <li><strong>Check console</strong> for debug messages</li>
          <li><strong>Verify dropdowns</strong> appear with maximum z-index</li>
        </ol>
        
        <div style={{ 
          backgroundColor: '#fff3cd', 
          border: '1px solid #ffeaa7', 
          padding: '12px', 
          borderRadius: '4px',
          marginTop: '16px'
        }}>
          <strong>💡 Expected Behavior:</strong>
          <ul style={{ marginBottom: 0 }}>
            <li>Alert should appear when clicking buttons</li>
            <li>State should toggle between OPEN/CLOSED</li>
            <li>Dropdowns should appear with high z-index</li>
            <li>Only one dropdown should be open at a time</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SimpleHeaderTest;
