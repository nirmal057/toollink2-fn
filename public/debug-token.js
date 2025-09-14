// Test script to debug frontend token usage
console.log('=== Frontend Token Debug ===');

// Check what token is in localStorage
const token = localStorage.getItem('token');
console.log('Current token:', token ? token.substring(0, 50) + '...' : 'No token found');

// Decode and check the token
if (token) {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log('Token payload:', payload);

        // Test calling the orders endpoint
        fetch('http://localhost:5001/api/orders', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        })
            .then(response => response.json())
            .then(data => {
                console.log('Orders response:', data);
                console.log('Number of orders:', data.data?.length || 0);
                if (data.data && data.data.length > 0) {
                    console.log('First order customer:', data.data[0].customer?.fullName);
                }
            })
            .catch(error => {
                console.error('Error fetching orders:', error);
            });

    } catch (e) {
        console.error('Error decoding token:', e);
    }
}
