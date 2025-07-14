// Browser console test script - Run in browser DevTools console
// This script tests the complete login flow from the browser

console.log('🧪 ToolLink Login Flow Browser Test');

async function testBrowserLoginFlow() {
    console.log('\n1. Testing authService login...');
    
    // Import authService (assuming it's available globally or via module)
    // For testing in browser console, we'll make direct API calls
    
    const credentials = {
        email: 'admin@toollink.com',
        password: 'admin123'
    };
    
    try {
        // Test the API endpoint directly
        const response = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials),
        });
        
        const data = await response.json();
        console.log('✅ API Response:', data);
        
        if (data.success) {
            // Simulate what authService.login() does
            localStorage.setItem('accessToken', data.accessToken);
            localStorage.setItem('refreshToken', data.refreshToken);
            localStorage.setItem('user', JSON.stringify(data.user));
            
            console.log('✅ Tokens stored in localStorage');
            
            // Test authentication state
            const token = localStorage.getItem('accessToken');
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            
            console.log('✅ Authentication State:');
            console.log('  - Has Token:', !!token);
            console.log('  - User:', user.name);
            console.log('  - Role:', user.role);
            
            // Test what useAuth would detect
            const isAuthenticated = !!token && !!user.id;
            console.log('✅ Should be authenticated:', isAuthenticated);
            
            if (isAuthenticated) {
                console.log('✅ Login flow should work! Try logging in through the UI.');
                return true;
            }
        } else {
            console.log('❌ Login failed:', data.error);
        }
    } catch (error) {
        console.log('❌ API Error:', error.message);
    }
    
    return false;
}

async function cleanupTest() {
    console.log('\n🧹 Cleaning up test data...');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    console.log('✅ Test data cleaned up');
}

// Run the test
testBrowserLoginFlow().then(success => {
    if (success) {
        console.log('\n🎉 BROWSER TEST PASSED!');
        console.log('\nNow test the actual login form:');
        console.log('1. Navigate to /login');
        console.log('2. Enter: admin@toollink.com / admin123');
        console.log('3. Should redirect to /dashboard');
    } else {
        console.log('\n❌ BROWSER TEST FAILED - Check errors above');
    }
    
    // Clean up after test
    setTimeout(cleanupTest, 2000);
});

// Alternative: Test with current page's authService if available
if (typeof window !== 'undefined' && window.authService) {
    console.log('\n🔧 Testing with page authService...');
    window.authService.login({ email: 'admin@toollink.com', password: 'admin123' })
        .then(result => {
            console.log('authService.login result:', result);
        })
        .catch(error => {
            console.log('authService.login error:', error);
        });
}
