console.log('=== ToolLink Order Approval Debug ===');

// Function to test order approval
async function testApproval() {
    try {
        console.log('1. Checking tokens in localStorage...');
        const accessToken = localStorage.getItem('accessToken');
        const token = localStorage.getItem('token');

        console.log('Access Token:', accessToken ? 'Present' : 'Missing');
        console.log('Token:', token ? 'Present' : 'Missing');

        if (!accessToken && !token) {
            console.error('❌ No tokens found - user needs to login');
            return;
        }

        const authToken = accessToken || token;
        console.log('Using token:', authToken.substring(0, 20) + '...');

        console.log('\n2. Testing API connection...');
        const ordersResponse = await fetch('http://localhost:5001/api/orders', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json',
            },
        });

        console.log('Orders API Response Status:', ordersResponse.status);
        const ordersData = await ordersResponse.json();

        if (!ordersData.success) {
            console.error('❌ API Error:', ordersData.error);
            return;
        }

        console.log('✅ API connection working');
        console.log('Orders found:', ordersData.data?.length || 0);

        // Find pending approval orders
        const orders = ordersData.data || [];
        const pendingOrders = orders.filter(order => order.status === 'Pending Approval');

        console.log('\n3. Pending approval orders:', pendingOrders.length);

        if (pendingOrders.length === 0) {
            console.log('No pending approval orders to test with');
            return;
        }

        const testOrder = pendingOrders[0];
        console.log('\n4. Testing approval for order:', testOrder.orderNumber);

        const approvalResponse = await fetch(`http://localhost:5001/api/orders/${testOrder._id}/approve`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ notes: 'Test approval from debug console' })
        });

        console.log('Approval Response Status:', approvalResponse.status);
        const approvalData = await approvalResponse.json();
        console.log('Approval Response:', approvalData);

        if (approvalData.success) {
            console.log('✅ ORDER APPROVAL SUCCESSFUL!');
        } else {
            console.error('❌ Order approval failed:', approvalData.error);
        }

    } catch (error) {
        console.error('❌ Test failed with error:', error);
    }
}

// Run the test
testApproval();
