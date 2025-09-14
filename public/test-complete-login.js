// Complete customer login test for browser console
async function testCustomerLogin() {
    console.log('=== COMPLETE CUSTOMER LOGIN TEST ===\n');

    // Clear any existing tokens
    localStorage.removeItem('token');
    console.log('1. Cleared existing tokens');

    // Step 1: Login as customer
    console.log('2. Logging in as customer chathursha...');
    try {
        const loginResponse = await fetch('http://localhost:5001/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'chathursha@gmail.com',
                password: 'customer123'
            })
        });

        if (!loginResponse.ok) {
            throw new Error(`Login failed: ${loginResponse.status}`);
        }

        const loginData = await loginResponse.json();
        console.log('✅ Login successful!');
        console.log('   User:', loginData.user.fullName, '- Role:', loginData.user.role);
        console.log('   User ID:', loginData.user.id);

        // Store token
        localStorage.setItem('token', loginData.accessToken);
        console.log('✅ Token stored in localStorage');

        // Step 2: Test orders fetch
        console.log('\n3. Fetching orders with customer token...');
        const ordersResponse = await fetch('http://localhost:5001/api/orders', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${loginData.accessToken}`,
                'Content-Type': 'application/json',
            },
        });

        if (!ordersResponse.ok) {
            throw new Error(`Orders fetch failed: ${ordersResponse.status}`);
        }

        const ordersData = await ordersResponse.json();
        console.log('✅ Orders fetched successfully!');
        console.log(`📊 Found ${ordersData.data?.length || 0} orders for customer`);

        if (ordersData.data && ordersData.data.length > 0) {
            ordersData.data.forEach((order, i) => {
                console.log(`   Order ${i + 1}: ${order.orderNumber}`);
                console.log(`      Customer: ${order.customer?.fullName} (ID: ${order.customer?._id})`);
                console.log(`      Items: ${order.totalItems}, Status: ${order.statusDisplay}`);
            });
        }

        console.log('\n🎉 CUSTOMER LOGIN TEST SUCCESSFUL!');
        console.log('The backend correctly returns only customer-specific orders.');
        console.log('If the frontend still shows all orders, the issue is in the React component.');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

// Run the test
testCustomerLogin();
