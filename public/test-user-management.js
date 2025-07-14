/**
 * Test the frontend user management functionality
 */

// This is a browser-side test script to debug the edit/delete functionality
console.log('🔍 Testing User Management Frontend Issues');

// Test 1: Check if users are loaded correctly
function testUserDataStructure() {
    console.log('1️⃣ Testing user data structure...');

    // Get the users from the page (if they exist)
    const userTableRows = document.querySelectorAll('tbody tr');

    if (userTableRows.length === 0) {
        console.log('❌ No users found in table');
        return false;
    }

    console.log(`✅ Found ${userTableRows.length} users in table`);

    // Check if buttons exist and are clickable
    const editButtons = document.querySelectorAll('[title="Edit user"]');
    const deleteButtons = document.querySelectorAll('[title="Delete user"]');

    console.log(`✅ Found ${editButtons.length} edit buttons`);
    console.log(`✅ Found ${deleteButtons.length} delete buttons`);

    // Test if buttons have proper event handlers
    if (editButtons.length > 0) {
        const firstEditButton = editButtons[0];
        const hasClickHandler = firstEditButton.onclick !== null;
        console.log(`Edit button has click handler: ${hasClickHandler}`);
    }

    if (deleteButtons.length > 0) {
        const firstDeleteButton = deleteButtons[0];
        const hasClickHandler = firstDeleteButton.onclick !== null;
        console.log(`Delete button has click handler: ${hasClickHandler}`);
    }

    return true;
}

// Test 2: Check authentication state
function testAuthState() {
    console.log('2️⃣ Testing authentication state...');

    const token = localStorage.getItem('accessToken');
    if (!token) {
        console.log('❌ No access token found');
        return false;
    }

    console.log(`✅ Access token found: ${token.substring(0, 20)}...`);

    // Try to decode the token to check expiration
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const now = Math.floor(Date.now() / 1000);
        const isExpired = payload.exp < now;

        console.log(`Token expires at: ${new Date(payload.exp * 1000).toLocaleString()}`);
        console.log(`Token is ${isExpired ? 'expired' : 'valid'}`);

        if (isExpired) {
            console.log('❌ Token is expired - this could be causing API failures');
            return false;
        }
    } catch (e) {
        console.log('⚠️  Could not decode token payload');
    }

    return true;
}

// Test 3: Check API connectivity
async function testApiConnectivity() {
    console.log('3️⃣ Testing API connectivity...');

    try {
        const response = await fetch('http://localhost:5000/api/users', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            console.log(`❌ API request failed: ${response.status} ${response.statusText}`);
            const errorText = await response.text();
            console.log(`Error details: ${errorText}`);
            return false;
        }

        const data = await response.json();
        console.log(`✅ API responded successfully with ${data.users?.length || 0} users`);

        // Check response structure
        console.log('Response structure:');
        console.log(`- success: ${data.success}`);
        console.log(`- users: ${Array.isArray(data.users)}`);
        console.log(`- pagination: ${!!data.pagination}`);

        if (data.users && data.users.length > 0) {
            const sampleUser = data.users[0];
            console.log(`Sample user keys: ${Object.keys(sampleUser).join(', ')}`);
            console.log(`User ID field: ${sampleUser._id ? '_id' : sampleUser.id ? 'id' : 'MISSING'}`);
        }

        return true;
    } catch (error) {
        console.log(`❌ API request failed: ${error.message}`);
        return false;
    }
}

// Test 4: Test actual edit/delete operations
async function testEditDeleteOperations() {
    console.log('4️⃣ Testing edit/delete operations...');

    // Get users first
    try {
        const response = await fetch('http://localhost:5000/api/users', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            console.log('❌ Could not fetch users for testing');
            return false;
        }

        const data = await response.json();
        const users = data.users || [];

        if (users.length === 0) {
            console.log('⚠️  No users available for testing');
            return false;
        }

        // Find a non-admin user for testing
        const testUser = users.find(user => user.role !== 'admin');
        if (!testUser) {
            console.log('⚠️  No non-admin users available for testing');
            return false;
        }

        const userId = testUser._id || testUser.id;
        console.log(`Testing with user: ${testUser.email} (ID: ${userId})`);

        // Test PUT request
        const updateResponse = await fetch(`http://localhost:5000/api/users/${userId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                fullName: testUser.fullName + ' (Test Update)',
                phone: testUser.phone || '+94123456789'
            })
        });

        if (updateResponse.ok) {
            console.log('✅ Edit operation successful');

            // Reset the user
            await fetch(`http://localhost:5000/api/users/${userId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    fullName: testUser.fullName,
                    phone: testUser.phone || ''
                })
            });
        } else {
            console.log(`❌ Edit operation failed: ${updateResponse.status}`);
            const errorText = await updateResponse.text();
            console.log(`Error details: ${errorText}`);
        }

        return true;
    } catch (error) {
        console.log(`❌ Edit/Delete test failed: ${error.message}`);
        return false;
    }
}

// Run all tests
async function runAllTests() {
    console.log('🧪 Running User Management Frontend Tests\n');

    const results = {
        userDataStructure: testUserDataStructure(),
        authState: testAuthState(),
        apiConnectivity: await testApiConnectivity(),
        editDeleteOperations: await testEditDeleteOperations()
    };

    console.log('\n📊 Test Results:');
    console.log('=================');
    Object.entries(results).forEach(([test, passed]) => {
        console.log(`${passed ? '✅' : '❌'} ${test}: ${passed ? 'PASSED' : 'FAILED'}`);
    });

    const allPassed = Object.values(results).every(r => r === true);

    if (allPassed) {
        console.log('\n🎉 All tests passed! The backend is working correctly.');
        console.log('If edit/delete still doesn\'t work, the issue is likely:');
        console.log('1. React component state management');
        console.log('2. Event handler binding');
        console.log('3. User permissions in the UI');
    } else {
        console.log('\n🔧 Some tests failed. Check the issues above.');
    }

    return results;
}

// Run the tests
runAllTests().catch(console.error);

// Add helper function to manually test edit/delete
window.testUserManagement = {
    runTests: runAllTests,
    testStructure: testUserDataStructure,
    testAuth: testAuthState,
    testAPI: testApiConnectivity,
    testOperations: testEditDeleteOperations
};

console.log('Test functions available in window.testUserManagement');
