// test-customer-rejection.js
import axios from 'axios';

const API_URL = 'http://localhost:3001';
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    cyan: '\x1b[36m',
    magenta: '\x1b[35m'
};

async function testCustomerRejection() {
    console.log(`${colors.cyan}======= CUSTOMER REJECTION TEST =======${colors.reset}`);
    
    try {
        // Step 1: Create a new customer for rejection
        console.log(`\n${colors.yellow}Step 1: Creating test customer for rejection${colors.reset}`);
        const customerEmail = `rejection.test.${Date.now()}@toollink.lk`;
        
        const registerResponse = await axios.post(`${API_URL}/api/auth/register`, {
            email: customerEmail,
            password: 'customer123',
            fullName: 'Rejection Test Customer',
            role: 'customer'
        });
        
        console.log(`${colors.green}✓ Test customer created: ${customerEmail}${colors.reset}`);
        const customerId = registerResponse.data.user.id;
        console.log(`Customer ID: ${customerId}`);
        
        // Step 2: Login as admin
        console.log(`\n${colors.yellow}Step 2: Login as admin${colors.reset}`);
        let adminToken;
        try {
            const adminLoginResponse = await axios.post(`${API_URL}/api/auth/login`, {
                email: 'admin@toollink.lk',
                password: 'admin123'
            });
            
            adminToken = adminLoginResponse.data.data.token;
            console.log(`${colors.green}✓ Admin login successful${colors.reset}`);
        } catch (error) {
            console.log(`${colors.red}✗ Failed to login as admin${colors.reset}`);
            console.log(`Error: ${error.message}`);
            return;
        }
        
        // Step 3: Fetch pending customers
        console.log(`\n${colors.yellow}Step 3: Fetching pending customers${colors.reset}`);
        let pendingUsers;
        
        try {
            const pendingResponse = await axios.get(`${API_URL}/api/auth/pending-users`, {
                headers: { Authorization: `Bearer ${adminToken}` }
            });
            
            pendingUsers = pendingResponse.data.users || [];
            console.log(`${colors.green}✓ Found ${pendingUsers.length} pending customers${colors.reset}`);
            
            // Find our test customer
            const testCustomer = pendingUsers.find(user => user.email === customerEmail);
            if (testCustomer) {
                console.log(`${colors.green}✓ Found our test customer in the pending list${colors.reset}`);
            } else {
                console.log(`${colors.yellow}! Test customer not found in pending list${colors.reset}`);
            }
        } catch (error) {
            console.log(`${colors.red}✗ Failed to fetch pending customers${colors.reset}`);
            console.log(`Error: ${error.response?.data?.message || error.message}`);
        }
        
        // Step 4: Reject the customer
        console.log(`\n${colors.yellow}Step 4: Rejecting the customer${colors.reset}`);
        try {
            const rejectionReason = "Test rejection - Customer does not meet requirements";
            
            const rejectResponse = await axios.post(
                `${API_URL}/api/auth/reject-user`, 
                { 
                    userId: customerId,
                    reason: rejectionReason
                },
                { headers: { Authorization: `Bearer ${adminToken}` } }
            );
            
            console.log(`${colors.green}✓ Customer rejected successfully${colors.reset}`);
            console.log(`Response: ${rejectResponse.data.message}`);
            console.log(`Rejection reason: ${rejectResponse.data.user.rejectionReason}`);
        } catch (error) {
            console.log(`${colors.red}✗ Failed to reject customer${colors.reset}`);
            console.log(`Error: ${error.response?.data?.message || error.message}`);
            
            // Try alternative endpoint
            console.log(`\n${colors.yellow}Trying alternative endpoint...${colors.reset}`);
            try {
                const rejectionReason = "Test rejection - Customer does not meet requirements";
                
                const altRejectResponse = await axios.post(
                    `${API_URL}/api/reject-customer/${customerId}`, 
                    { reason: rejectionReason },
                    { headers: { Authorization: `Bearer ${adminToken}` } }
                );
                
                console.log(`${colors.green}✓ Customer rejected successfully via alternative endpoint${colors.reset}`);
                console.log(`Response: ${altRejectResponse.data.message}`);
            } catch (altError) {
                console.log(`${colors.red}✗ Both rejection endpoints failed${colors.reset}`);
                console.log(`Error: ${altError.response?.data?.message || altError.message}`);
            }
        }
        
        // Step 5: Try to login with rejected customer
        console.log(`\n${colors.yellow}Step 5: Trying to login with rejected customer${colors.reset}`);
        try {
            await axios.post(`${API_URL}/api/auth/login`, {
                email: customerEmail,
                password: 'customer123'
            });
            
            console.log(`${colors.red}✗ ERROR: Rejected customer was able to login!${colors.reset}`);
        } catch (error) {
            if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                console.log(`${colors.green}✓ Login correctly rejected for rejected customer${colors.reset}`);
                console.log(`Status code: ${error.response.status}`);
                console.log(`Message: ${error.response.data.message}`);
            } else {
                console.log(`${colors.red}✗ Unexpected error during login${colors.reset}`);
                console.log(`Error: ${error.message}`);
            }
        }
        
        // Step 6: Verify customer is no longer in the pending list
        console.log(`\n${colors.yellow}Step 6: Verifying customer is no longer in pending list${colors.reset}`);
        try {
            const pendingResponse = await axios.get(`${API_URL}/api/auth/pending-users`, {
                headers: { Authorization: `Bearer ${adminToken}` }
            });
            
            const stillPending = pendingResponse.data.users.some(user => user.email === customerEmail);
            
            if (stillPending) {
                console.log(`${colors.red}✗ Customer is still in the pending list after rejection${colors.reset}`);
            } else {
                console.log(`${colors.green}✓ Customer no longer appears in pending list${colors.reset}`);
            }
        } catch (error) {
            console.log(`${colors.red}✗ Failed to check pending list${colors.reset}`);
            console.log(`Error: ${error.response?.data?.message || error.message}`);
        }
        
        console.log(`\n${colors.cyan}======= TEST COMPLETED =======${colors.reset}`);
        
    } catch (error) {
        console.log(`\n${colors.red}✗ Test failed with error:${colors.reset}`);
        console.log(error);
    }
}

// Run the test
testCustomerRejection();
