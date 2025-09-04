// Auth Fix Script
// This script helps diagnose and fix authentication issues
// Run this in the browser console

console.log('🔧 ToolLink Auth Fix Script Starting...');

// Step 1: Check current authentication state
function checkAuthState() {
    console.group('🔍 Authentication State Check');

    const token = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    const user = localStorage.getItem('user');

    console.log('Access Token:', token ? `${token.substring(0, 20)}...` : 'Not found');
    console.log('Refresh Token:', refreshToken ? `${refreshToken.substring(0, 20)}...` : 'Not found');
    console.log('User Data:', user ? 'Found' : 'Not found');

    if (token) {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const currentTime = Math.floor(Date.now() / 1000);
            const isExpired = payload.exp < currentTime;
            const timeLeft = payload.exp - currentTime;

            console.log('Token Expiry:', new Date(payload.exp * 1000));
            console.log('Token Expired:', isExpired);
            console.log('Time Left:', isExpired ? 'Expired' : `${Math.floor(timeLeft / 60)} minutes`);

            if (isExpired) {
                console.warn('⚠️ Token is expired!');
                return false;
            }
        } catch (e) {
            console.error('❌ Invalid token format:', e);
            return false;
        }
    }

    if (user) {
        try {
            const userData = JSON.parse(user);
            console.log('User ID:', userData.id);
            console.log('User Email:', userData.email);
            console.log('User Role:', userData.role);
        } catch (e) {
            console.error('❌ Invalid user data format:', e);
            return false;
        }
    }

    console.groupEnd();
    return !!(token && user);
}

// Step 2: Clear authentication data
function clearAuthData() {
    console.log('🗑️ Clearing authentication data...');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    console.log('✅ Authentication data cleared');
}

// Step 3: Test server connectivity
async function testServerConnection() {
    console.log('🌐 Testing server connection...');

    try {
        const response = await fetch('http://localhost:5000/health', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const data = await response.json();
            console.log('✅ Server is reachable:', data);
            return true;
        } else {
            console.error('❌ Server returned error:', response.status);
            return false;
        }
    } catch (error) {
        console.error('❌ Server connection failed:', error);
        return false;
    }
}

// Step 4: Test login
async function testLogin(email = 'admin@toollink.com', password = 'admin123') {
    console.log('🔑 Testing login...');

    try {
        const response = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok && data.success) {
            console.log('✅ Login successful:', data);

            // Store the new tokens
            localStorage.setItem('accessToken', data.accessToken);
            localStorage.setItem('refreshToken', data.refreshToken);
            localStorage.setItem('user', JSON.stringify(data.user));

            console.log('✅ New tokens stored');
            return true;
        } else {
            console.error('❌ Login failed:', data);
            return false;
        }
    } catch (error) {
        console.error('❌ Login request failed:', error);
        return false;
    }
}

// Step 5: Test authenticated request
async function testAuthenticatedRequest() {
    console.log('🔐 Testing authenticated request...');

    const token = localStorage.getItem('accessToken');
    if (!token) {
        console.error('❌ No access token found');
        return false;
    }

    try {
        const response = await fetch('http://localhost:5000/api/auth/me', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (response.ok && data.success) {
            console.log('✅ Authenticated request successful:', data.user);
            return true;
        } else {
            console.error('❌ Authenticated request failed:', data);
            return false;
        }
    } catch (error) {
        console.error('❌ Authenticated request error:', error);
        return false;
    }
}

// Main fix function
async function fixAuthIssues() {
    console.log('🚀 Starting ToolLink Authentication Fix...');

    // Step 1: Check current state
    const hasValidAuth = checkAuthState();

    // Step 2: Test server
    const serverOk = await testServerConnection();
    if (!serverOk) {
        console.error('❌ Cannot proceed - server is not reachable');
        return;
    }

    // Step 3: If auth is invalid, clear and re-login
    if (!hasValidAuth) {
        console.log('🔄 Invalid auth state detected, clearing and re-authenticating...');
        clearAuthData();

        const loginSuccess = await testLogin();
        if (!loginSuccess) {
            console.error('❌ Login failed - please check credentials');
            return;
        }
    }

    // Step 4: Test authenticated request
    const authRequestOk = await testAuthenticatedRequest();
    if (authRequestOk) {
        console.log('🎉 Authentication is working correctly!');
        console.log('💡 You can now refresh the page or navigate to continue using the app.');
    } else {
        console.error('❌ Authentication still not working - manual intervention required');
    }
}

// Export functions for manual use
window.toolLinkAuthFix = {
    checkAuthState,
    clearAuthData,
    testServerConnection,
    testLogin,
    testAuthenticatedRequest,
    fixAuthIssues
};

console.log('✅ Auth Fix Script Loaded!');
console.log('🔧 Available functions:');
console.log('  - toolLinkAuthFix.fixAuthIssues() - Automatic fix');
console.log('  - toolLinkAuthFix.checkAuthState() - Check current state');
console.log('  - toolLinkAuthFix.clearAuthData() - Clear auth data');
console.log('  - toolLinkAuthFix.testLogin(email, password) - Test login');
console.log('');
console.log('🚀 Run: toolLinkAuthFix.fixAuthIssues()');
