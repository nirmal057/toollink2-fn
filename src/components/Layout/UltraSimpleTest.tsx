import { useState } from 'react';
import { BellIcon, UserIcon } from 'lucide-react';

// Ultra-simple header test - just to verify buttons work
const UltraSimpleTest = () => {
  const [notificationClicked, setNotificationClicked] = useState(false);
  const [userClicked, setUserClicked] = useState(false);

  const handleNotificationClick = () => {
    alert('NOTIFICATION BUTTON WORKS!');
    setNotificationClicked(!notificationClicked);
  };

  const handleUserClick = () => {
    alert('USER BUTTON WORKS!');
    setUserClicked(!userClicked);
  };

  return (
    <div style={{ padding: '20px', fontSize: '18px' }}>
      <h1>Ultra Simple Button Test</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <p>Status: Notification: {notificationClicked ? '✅ CLICKED' : '❌ NOT CLICKED'}</p>
        <p>Status: User: {userClicked ? '✅ CLICKED' : '❌ NOT CLICKED'}</p>
      </div>

      <div style={{ display: 'flex', gap: '20px' }}>
        <button
          onClick={handleNotificationClick}
          style={{
            padding: '15px 20px',
            fontSize: '16px',
            backgroundColor: notificationClicked ? '#3b82f6' : '#f3f4f6',
            color: notificationClicked ? 'white' : 'black',
            border: '2px solid #3b82f6',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <BellIcon size={20} />
          Click for Notification Alert
        </button>

        <button
          onClick={handleUserClick}
          style={{
            padding: '15px 20px',
            fontSize: '16px',
            backgroundColor: userClicked ? '#10b981' : '#f3f4f6',
            color: userClicked ? 'white' : 'black',
            border: '2px solid #10b981',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <UserIcon size={20} />
          Click for User Alert
        </button>
      </div>

      <div style={{ marginTop: '40px', padding: '20px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
        <h3>Expected Behavior:</h3>
        <ul>
          <li>Click either button should show an alert</li>
          <li>Button background should change color when clicked</li>
          <li>Status text should update to show "CLICKED"</li>
        </ul>
      </div>
    </div>
  );
};

export default UltraSimpleTest;
