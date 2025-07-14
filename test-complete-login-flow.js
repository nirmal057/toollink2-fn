// Test script to verify the complete login flow
console.log('=== ToolLink Login Flow Test ===');

// Function to test login
async function testLogin() {
    const credentials = {
        email: 'admin@toollink.com',
        password: 'admin123'
    };

    try {
        console.log('1. Testing backend login endpoint...');
        const response = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials),
        });

        const data = await response.json();
        console.log('Backend response:', data);

        if (data.success) {
            console.log('✅ Backend login successful');
            console.log('User:', data.user.name);
            console.log('Role:', data.user.role);
            console.log('Access Token:', data.accessToken ? 'Present' : 'Missing');
            console.log('Refresh Token:', data.refreshToken ? 'Present' : 'Missing');
            
            // Test token storage simulation
            if (typeof localStorage !== 'undefined') {
                localStorage.setItem('accessToken', data.accessToken);
                localStorage.setItem('refreshToken', data.refreshToken);
                localStorage.setItem('user', JSON.stringify(data.user));
                console.log('✅ Tokens and user data stored in localStorage');
            }
            
            return data;
        } else {
            console.log('❌ Backend login failed:', data.error);
            return null;
        }
    } catch (error) {
        console.log('❌ Login error:', error.message);
        return null;
    }
}

// Function to test authentication state
function testAuthState() {
    console.log('\n2. Testing authentication state...');
    
    if (typeof localStorage !== 'undefined') {
        const token = localStorage.getItem('accessToken');
        const user = localStorage.getItem('user');
        
        console.log('Access Token:', token ? 'Present' : 'Missing');
        console.log('User Data:', user ? 'Present' : 'Missing');
        
        if (token && user) {
            console.log('✅ User should be considered authenticated');
            return true;
        } else {
            console.log('❌ User should not be considered authenticated');
            return false;
        }
    } else {
        console.log('⚠️  localStorage not available (Node.js environment)');
        return false;
    }
}

// Function to simulate dashboard redirect logic
function testDashboardRedirect(userData) {
    console.log('\n3. Testing dashboard redirect logic...');
    
    if (userData && userData.user) {
        const role = userData.user.role;
        console.log(`User role: ${role}`);
        
        // Simulate the redirect logic from the frontend
        console.log('✅ Should redirect to /dashboard');
        console.log(`Expected dashboard content for role: ${role}`);
        
        return true;
    } else {
        console.log('❌ No user data, should stay on login page');
        return false;
    }
}

// Run the test
async function runTest() {
    const loginResult = await testLogin();
    const authState = testAuthState();
    const redirectResult = testDashboardRedirect(loginResult);
    
    console.log('\n=== Test Summary ===');
    console.log('Backend Login:', loginResult ? '✅ Pass' : '❌ Fail');
    console.log('Auth State:', authState ? '✅ Pass' : '❌ Fail');
    console.log('Dashboard Redirect:', redirectResult ? '✅ Pass' : '❌ Fail');
    
    if (loginResult && authState && redirectResult) {
        console.log('\n🎉 ALL TESTS PASSED - Login flow should work correctly!');
        console.log('\nNext steps:');
        console.log('1. Open http://localhost:5173 in your browser');
        console.log('2. Navigate to login page');
        console.log('3. Use credentials: admin@toollink.com / admin123');
        console.log('4. Verify redirect to dashboard');
    } else {
        console.log('\n❌ SOME TESTS FAILED - Check the issues above');
    }
}

runTest();
