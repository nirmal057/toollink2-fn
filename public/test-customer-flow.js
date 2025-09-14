// Test the complete flow: customer login -> fetch orders
const testCustomerFlow = async () => {
    console.log('=== Testing Complete Customer Flow ===');

    // Step 1: Login as customer
    console.log('1. Logging in as customer...');
    const loginResponse = await fetch('http://localhost:5001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: 'chathursha@gmail.com',
            password: 'customer123'
        })
    });

    if (!loginResponse.ok) {
        console.error('Login failed:', loginResponse.status);
        return;
    }

    const loginData = await loginResponse.json();
    const token = loginData.accessToken;
    console.log('✅ Login successful');

    // Step 2: Store token (like frontend does)
    localStorage.setItem('token', token);
    console.log('✅ Token stored in localStorage');

    // Step 3: Fetch orders using the same endpoint the frontend uses
    console.log('2. Fetching orders...');
    const ordersResponse = await fetch('http://localhost:5001/api/orders?limit=50', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });

    if (!ordersResponse.ok) {
        console.error('Orders fetch failed:', ordersResponse.status);
        return;
    }

    const ordersData = await ordersResponse.json();
    console.log('✅ Orders fetched successfully');
    console.log('Orders data:', ordersData);
    console.log(`Found ${ordersData.data?.length || 0} orders for customer`);

    if (ordersData.data && ordersData.data.length > 0) {
        ordersData.data.forEach((order, index) => {
            console.log(`Order ${index + 1}: ${order.orderNumber} - Customer: ${order.customer?.fullName}`);
        });
    }
};

// Run the test
testCustomerFlow();
