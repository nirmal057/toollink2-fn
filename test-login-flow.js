// Test script to verify login functionality works correctly
// This script tests the frontend-backend integration

console.log('🧪 Testing ToolLink Authentication Flow...\n');

const API_BASE = 'http://localhost:5000';
const FRONTEND_BASE = 'http://localhost:5173';

// Test cases
const testUsers = [
  { email: 'admin@toollink.com', password: 'admin123', expectedRole: 'admin' },
  { email: 'warehouse@toollink.com', password: 'warehouse123', expectedRole: 'warehouse' },
  { email: 'cashier@toollink.com', password: 'cashier123', expectedRole: 'cashier' }
];

async function testLoginAPI(user) {
  try {
    const response = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user)
    });
    
    const data = await response.json();
    
    if (data.success && data.user) {
      console.log(`✅ API Login Test PASSED for ${user.email}`);
      console.log(`   - Role: ${data.user.role}`);
      console.log(`   - Access Token: ${data.accessToken ? 'Present' : 'Missing'}`);
      return true;
    } else {
      console.log(`❌ API Login Test FAILED for ${user.email}: ${data.message}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ API Login Test ERROR for ${user.email}: ${error.message}`);
    return false;
  }
}

async function runTests() {
  console.log('📡 Testing Backend API Endpoints...\n');
  
  for (const user of testUsers) {
    await testLoginAPI(user);
  }
  
  console.log('\n🌐 Frontend Application Status:');
  console.log(`   - Frontend URL: ${FRONTEND_BASE}`);
  console.log(`   - Backend URL: ${API_BASE}`);
  console.log('\n📋 Manual Testing Steps:');
  console.log('   1. Open http://localhost:5173/auth/login');
  console.log('   2. Try logging in with any of these accounts:');
  
  testUsers.forEach(user => {
    console.log(`      - ${user.email} / ${user.password} (${user.expectedRole})`);
  });
  
  console.log('   3. Verify you are redirected to /dashboard');
  console.log('   4. Check that the navigation menu shows role-appropriate options');
  console.log('\n✨ Integration Test Complete!');
}

runTests();
