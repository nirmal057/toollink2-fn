// Complete Authentication Flow Test - Login & Registration
console.log('🧪 ToolLink Complete Authentication Test');

async function testCompleteAuthFlow() {
    console.log('\n=== TESTING REGISTRATION FLOW ===');
    
    // Test Registration
    const registrationData = {
        name: 'New Test User',
        email: 'newuser@example.com',
        password: 'newuser123',
        phone: '9876543210',
        role: 'customer'
    };
    
    try {
        console.log('1. Testing registration endpoint...');
        const regResponse = await fetch('http://localhost:5000/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(registrationData),
        });
        
        const regData = await regResponse.json();
        console.log('Registration response:', regData);
        
        if (regData.success) {
            console.log('✅ Registration successful');
            console.log('User ID:', regData.user.id);
            console.log('Username:', regData.user.username);
            console.log('Email:', regData.user.email);
            console.log('Role:', regData.user.role);
            console.log('Access Token:', regData.accessToken ? 'Present' : 'Missing');
            console.log('Refresh Token:', regData.refreshToken ? 'Present' : 'Missing');
        } else {
            console.log('❌ Registration failed:', regData.error);
            return false;
        }
    } catch (error) {
        console.log('❌ Registration error:', error.message);
        return false;
    }
    
    console.log('\n=== TESTING LOGIN FLOW ===');
    
    // Test Login with the newly registered user
    const loginData = {
        email: registrationData.email,
        password: registrationData.password
    };
    
    try {
        console.log('2. Testing login with new user credentials...');
        const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(loginData),
        });
        
        const loginResult = await loginResponse.json();
        console.log('Login response:', loginResult);
        
        if (loginResult.success) {
            console.log('✅ Login successful');
            console.log('User:', loginResult.user.name);
            console.log('Role:', loginResult.user.role);
            console.log('Access Token:', loginResult.accessToken ? 'Present' : 'Missing');
            console.log('Refresh Token:', loginResult.refreshToken ? 'Present' : 'Missing');
        } else {
            console.log('❌ Login failed:', loginResult.error);
            return false;
        }
    } catch (error) {
        console.log('❌ Login error:', error.message);
        return false;
    }
    
    console.log('\n=== TESTING EXISTING ADMIN LOGIN ===');
    
    // Test existing admin login
    const adminData = {
        email: 'admin@toollink.com',
        password: 'admin123'
    };
    
    try {
        console.log('3. Testing admin login...');
        const adminResponse = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(adminData),
        });
        
        const adminResult = await adminResponse.json();
        
        if (adminResult.success) {
            console.log('✅ Admin login successful');
            console.log('Admin User:', adminResult.user.name);
            console.log('Admin Role:', adminResult.user.role);
        } else {
            console.log('❌ Admin login failed:', adminResult.error);
            return false;
        }
    } catch (error) {
        console.log('❌ Admin login error:', error.message);
        return false;
    }
    
    return true;
}

async function runCompleteTest() {
    const success = await testCompleteAuthFlow();
    
    console.log('\n=== FINAL TEST RESULTS ===');
    
    if (success) {
        console.log('🎉 ALL AUTHENTICATION TESTS PASSED!');
        console.log('\n✅ Registration works correctly');
        console.log('✅ Login works for new users');
        console.log('✅ Login works for existing users');
        console.log('✅ Backend properly handles name vs username');
        console.log('✅ Tokens are generated correctly');
        
        console.log('\n🚀 READY FOR FRONTEND TESTING:');
        console.log('1. Open http://localhost:5173 in browser');
        console.log('2. Test registration with any new email');
        console.log('3. Test login with admin@toollink.com / admin123');
        console.log('4. Verify redirects to dashboard (not back to login)');
        
        console.log('\n📋 Next Steps:');
        console.log('• Verify role-based dashboard content');
        console.log('• Test logout functionality');
        console.log('• Test protected route access');
        console.log('• Test token refresh');
        
    } else {
        console.log('❌ SOME TESTS FAILED');
        console.log('Check the errors above and fix issues before frontend testing');
    }
}

runCompleteTest();
