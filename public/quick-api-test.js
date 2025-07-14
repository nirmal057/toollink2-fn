// Quick test to check if frontend can access the API
console.log('🧪 Testing API access from frontend...');

fetch('http://localhost:3000/api/users-new?limit=5')
    .then(response => {
        console.log('Response status:', response.status);
        console.log('Response headers:', [...response.headers.entries()]);
        return response.json();
    })
    .then(data => {
        console.log('✅ Success! Data received:', data);
        console.log(`📊 Found ${data.length} users`);
        console.log('🎯 First user:', data[0]);
    })
    .catch(error => {
        console.error('❌ Error:', error);
        console.error('Error details:', error.message);
    });
