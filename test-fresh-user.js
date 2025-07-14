// Test Registration + Login flow with a completely new user
console.log('🧪 Testing Fresh User Registration + Login Flow');

async function testFreshUserFlow() {
    const timestamp = Date.now();
    const testUser = {
        name: `Fresh User ${timestamp}`,
        email: `fresh.user.${timestamp}@example.com`,
        password: 'freshpass123',
        phone: '5555555555',
        role: 'customer'
    };
    
    console.log('\n1. Testing Registration...');
    console.log('Email:', testUser.email);
    
    try {
        // Register the user
        const regResponse = await fetch('http://localhost:5000/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testUser),
        });
        
        const regData = await regResponse.json();
        
        if (regData.success) {
            console.log('✅ Registration successful');
            console.log('User ID:', regData.user.id);
            console.log('Username:', regData.user.username);
            
            // Wait a moment then test login
            console.log('\n2. Testing Login with same credentials...');
            
            const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: testUser.email,
                    password: testUser.password
                }),
            });
            
            const loginData = await loginResponse.json();
            
            if (loginData.success) {
                console.log('✅ Login successful');
                console.log('User:', loginData.user.name);
                console.log('Role:', loginData.user.role);
                console.log('\n🎉 REGISTRATION + LOGIN FLOW WORKING!');
                return true;
            } else {
                console.log('❌ Login failed:', loginData.error);
                return false;
            }
            
        } else {
            console.log('❌ Registration failed:', regData.error);
            return false;
        }
        
    } catch (error) {
        console.log('❌ Error:', error.message);
        return false;
    }
}

testFreshUserFlow().then(success => {
    if (success) {
        console.log('\n✅ Complete auth flow is working correctly!');
        console.log('\nNow test the frontend:');
        console.log('1. Visit http://localhost:5173');
        console.log('2. Go to registration page');
        console.log('3. Register a new user');
        console.log('4. Login with existing user (admin@toollink.com / admin123)');
        console.log('5. Verify dashboard redirect works');
    } else {
        console.log('\n❌ Auth flow still has issues - check server logs');
    }
});
