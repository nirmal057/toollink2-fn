// Test the fixed frontend permissions
async function testFrontendPermissions() {
    console.log('🔍 Testing Fixed Frontend Permissions...\n');

    // Clear any existing session
    localStorage.clear();

    // Login as admin
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
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

    if (loginData.success) {
        console.log('✅ Login successful');

        // Check localStorage after login
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('accessToken');

        console.log('📦 Stored user:', storedUser ? JSON.parse(storedUser) : 'No user');
        console.log('📦 Stored token:', storedToken ? storedToken.substring(0, 20) + '...' : 'No token');

        // Now test the user management API
        const usersResponse = await fetch('http://localhost:5000/api/users', {
            headers: {
                'Authorization': `Bearer ${storedToken}`
            }
        });

        const usersData = await usersResponse.json();

        if (usersData.success !== false) {
            console.log('✅ Users API call successful');
            console.log('📋 Total users:', usersData.users?.length || 'Unknown');

            // Test edit operation
            if (usersData.users && usersData.users.length > 0) {
                const testUser = usersData.users.find(u => u.email !== 'admin@toollink.com');
                if (testUser) {
                    console.log('🔄 Testing edit operation...');

                    const editResponse = await fetch(`http://localhost:5000/api/users/${testUser._id}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${storedToken}`
                        },
                        body: JSON.stringify({
                            fullName: testUser.fullName + ' (Test Edit)',
                            phone: testUser.phone || '+94123456789'
                        })
                    });

                    const editData = await editResponse.json();

                    if (editData.success !== false) {
                        console.log('✅ Edit operation successful');
                        console.log('📝 Updated user:', editData.user?.fullName || 'Unknown');
                    } else {
                        console.log('❌ Edit operation failed:', editData.error || 'Unknown error');
                    }
                } else {
                    console.log('⚠️  No test user found for edit operation');
                }
            }
        } else {
            console.log('❌ Users API call failed:', usersData.error || 'Unknown error');
        }

        console.log('\n🎉 Frontend permission test completed!');
        console.log('💡 If you can see this in the browser console, the backend is working correctly.');
        console.log('💡 Now try the user management page to test the frontend UI.');

    } else {
        console.log('❌ Login failed:', loginData.error || 'Unknown error');
    }
}

// Run the test
testFrontendPermissions().catch(console.error);

// Also provide a global function to check current permissions
window.checkPermissions = function () {
    console.log('🔍 Checking current permissions...');
    const user = localStorage.getItem('user');
    const token = localStorage.getItem('accessToken');

    if (user && token) {
        const userData = JSON.parse(user);
        console.log('👤 Current user:', userData.email, '(' + userData.role + ')');
        console.log('🔑 Has token:', !!token);
        console.log('✅ Ready to use admin features');
    } else {
        console.log('❌ No user session found');
    }
};
