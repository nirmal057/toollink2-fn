// Simple working app without any complex dependencies
function SimpleApp() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        textAlign: 'center',
        padding: '40px',
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '20px',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        <h1 style={{
          fontSize: '3rem',
          marginBottom: '20px',
          background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          ToolLink System
        </h1>
        
        <p style={{ fontSize: '1.2rem', marginBottom: '30px' }}>
          React App is Working! ✅
        </p>
        
        <div style={{ marginBottom: '20px' }}>
          <button 
            onClick={() => window.location.href = '/auth/login'}
            style={{
              padding: '12px 25px',
              margin: '5px',
              background: 'linear-gradient(45deg, #ff6b6b, #ee5a52)',
              color: 'white',
              border: 'none',
              borderRadius: '25px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Go to Login
          </button>
          
          <button 
            onClick={() => window.location.href = '/auth/register'}
            style={{
              padding: '12px 25px',
              margin: '5px',
              background: 'linear-gradient(45deg, #4ecdc4, #44a08d)',
              color: 'white',
              border: 'none',
              borderRadius: '25px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Go to Register
          </button>
        </div>
        
        <div style={{
          marginTop: '30px',
          padding: '20px',
          background: 'rgba(0, 0, 0, 0.2)',
          borderRadius: '10px',
          fontSize: '0.9rem'
        }}>
          <h3>System Status</h3>
          <p>✅ React App Loaded</p>
          <p>✅ Styling Working</p>
          <p>✅ JavaScript Working</p>
          <p>🔗 Frontend: http://localhost:5173</p>
          <p>🔗 Backend: http://localhost:5000</p>
        </div>
      </div>
    </div>
  );
}

export default SimpleApp;
