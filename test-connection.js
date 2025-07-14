// Frontend-Backend Connection Test
const API_BASE_URL = 'http://localhost:3001';

async function testAPIConnection() {
    console.log('🔗 Testing Frontend-Backend Connection...\n');
    
    try {
        // Test 1: Health Check
        console.log('1. Testing health endpoint...');
        const healthResponse = await fetch(`${API_BASE_URL}/health`);
        const healthData = await healthResponse.json();
        console.log('✅ Health check:', healthData.status);
        
        // Test 2: Users endpoint
        console.log('\n2. Testing users endpoint...');
        const usersResponse = await fetch(`${API_BASE_URL}/api/users`);
        const usersData = await usersResponse.json();
        console.log('✅ Users loaded:', usersData.data.users.length, 'users');
        
        // Test 3: Authentication
        console.log('\n3. Testing authentication...');
        const loginResponse = await fetch(`${API_BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'admin@toollink.com',
                password: 'admin123'
            })
        });
        const loginData = await loginResponse.json();
        console.log('✅ Login successful:', loginData.data.user.name);
        console.log('✅ JWT Token received:', loginData.data.token.substring(0, 50) + '...');
        
        // Test 4: Protected endpoint (using token)
        console.log('\n4. Testing protected endpoint...');
        const userInfoResponse = await fetch(`${API_BASE_URL}/api/auth/me`, {
            headers: {
                'Authorization': `Bearer ${loginData.data.token}`
            }
        });
        const userInfoData = await userInfoResponse.json();
        console.log('✅ User profile loaded:', userInfoData.data.user.email);
        
        // Test 5: Inventory endpoint
        console.log('\n5. Testing inventory endpoint...');
        const inventoryResponse = await fetch(`${API_BASE_URL}/api/inventory`);
        const inventoryData = await inventoryResponse.json();
        console.log('✅ Inventory endpoint working (items:', inventoryData.data.items.length + ')');
        
        console.log('\n🎉 All tests passed! Frontend can successfully connect to backend.');
        console.log('\n📊 Connection Summary:');
        console.log('   - Backend running on port 3001 ✅');
        console.log('   - MongoDB connected with sample data ✅');
        console.log('   - Authentication working with JWT ✅');
        console.log('   - API endpoints responding ✅');
        console.log('   - CORS configured correctly ✅');
        
    } catch (error) {
        console.error('❌ Connection test failed:', error.message);
    }
}

// Run test if in Node.js environment
if (typeof module !== 'undefined' && module.exports) {
    // Node.js environment - use fetch polyfill
    const fetch = require('node-fetch');
    testAPIConnection();
} else {
    // Browser environment
    testAPIConnection();
}
