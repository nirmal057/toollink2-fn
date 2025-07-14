// test-approval-system-status.js
import axios from 'axios';
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    cyan: '\x1b[36m'
};

const API_URL = 'http://localhost:3001';
const FRONTEND_URL = 'http://localhost:5173';

async function testSystemStatus() {
    console.log(`${colors.cyan}======= SYSTEM STATUS CHECK =======${colors.reset}`);
    
    // Step 1: Check if backend is running
    console.log(`\n${colors.yellow}Step 1: Checking if backend server is running...${colors.reset}`);
    try {
        const response = await axios.get(`${API_URL}/api/auth/me`, { 
            validateStatus: () => true 
        });
        console.log(`${colors.green}✓ Backend is running. Status: ${response.status}${colors.reset}`);
    } catch (error) {
        console.log(`${colors.red}✗ Backend server is not reachable${colors.reset}`);
        console.log(`Error: ${error.message}`);
        console.log(`\nTry starting the backend server with: cd backend && npm run dev`);
        return;
    }
    
    // Step 2: Login as admin to check authentication
    console.log(`\n${colors.yellow}Step 2: Testing admin login...${colors.reset}`);
    let adminToken;
    try {
        const loginResponse = await axios.post(`${API_URL}/api/auth/login`, {
            email: 'admin@toollink.lk',
            password: 'admin123'
        });
        
        adminToken = loginResponse.data.data.token;
        console.log(`${colors.green}✓ Admin login successful${colors.reset}`);
    } catch (error) {
        console.log(`${colors.red}✗ Admin login failed${colors.reset}`);
        console.log(`Error: ${error.response?.data?.message || error.message}`);
        console.log(`\nCheck the admin credentials or create an admin using: cd backend && node clean-and-seed-users.js`);
        return;
    }
    
    // Step 3: Check pending users endpoint
    console.log(`\n${colors.yellow}Step 3: Testing pending users endpoints...${colors.reset}`);
    try {
        // Try primary endpoint
        const pendingResponse = await axios.get(`${API_URL}/api/auth/pending-users`, {
            headers: { Authorization: `Bearer ${adminToken}` },
            validateStatus: () => true
        });
        
        if (pendingResponse.status === 200) {
            console.log(`${colors.green}✓ Primary pending users endpoint works (${pendingResponse.status})${colors.reset}`);
            console.log(`Found ${(pendingResponse.data.users || []).length} pending users`);
        } else {
            console.log(`${colors.yellow}! Primary endpoint returned status: ${pendingResponse.status}${colors.reset}`);
        }
        
        // Try alternative endpoint
        const altResponse = await axios.get(`${API_URL}/api/pending-customers`, {
            headers: { Authorization: `Bearer ${adminToken}` },
            validateStatus: () => true
        });
        
        if (altResponse.status === 200) {
            console.log(`${colors.green}✓ Alternative pending users endpoint works (${altResponse.status})${colors.reset}`);
            console.log(`Found ${(altResponse.data.customers || []).length} pending customers`);
        } else {
            console.log(`${colors.yellow}! Alternative endpoint returned status: ${altResponse.status}${colors.reset}`);
        }
        
        if (pendingResponse.status !== 200 && altResponse.status !== 200) {
            console.log(`${colors.red}✗ Both pending users endpoints failed${colors.reset}`);
            console.log(`\nCheck if the endpoints are implemented in backend/routes/auth.js and users.js`);
        }
    } catch (error) {
        console.log(`${colors.red}✗ Error checking pending users endpoints${colors.reset}`);
        console.log(`Error: ${error.message}`);
    }
    
    // Step 4: Register a test customer to check approval flow
    console.log(`\n${colors.yellow}Step 4: Creating a test customer for approval...${colors.reset}`);
    const testEmail = `test.customer.${Date.now()}@toollink.lk`;
    let customerId;
    
    try {
        const registerResponse = await axios.post(`${API_URL}/api/auth/register`, {
            email: testEmail,
            password: 'customer123',
            fullName: 'Test Customer for Approval',
            role: 'customer'
        });
        
        customerId = registerResponse.data.user.id;
        console.log(`${colors.green}✓ Test customer created: ${testEmail}${colors.reset}`);
        console.log(`Customer ID: ${customerId}`);
    } catch (error) {
        console.log(`${colors.red}✗ Failed to create test customer${colors.reset}`);
        console.log(`Error: ${error.response?.data?.message || error.message}`);
        return;
    }
    
    // Step 5: Approve the customer to test approval endpoint
    console.log(`\n${colors.yellow}Step 5: Testing customer approval...${colors.reset}`);
    let approvalSuccess = false;
    
    try {
        // Try primary endpoint
        const approveResponse = await axios.post(
            `${API_URL}/api/auth/approve-user`, 
            { userId: customerId },
            { headers: { Authorization: `Bearer ${adminToken}` }, validateStatus: () => true }
        );
        
        if (approveResponse.status === 200) {
            approvalSuccess = true;
            console.log(`${colors.green}✓ Primary approval endpoint works${colors.reset}`);
        } else {
            console.log(`${colors.yellow}! Primary approval endpoint returned: ${approveResponse.status}${colors.reset}`);
            
            // Try alternative endpoint
            const altApproveResponse = await axios.post(
                `${API_URL}/api/approve-customer/${customerId}`,
                {},
                { headers: { Authorization: `Bearer ${adminToken}` }, validateStatus: () => true }
            );
            
            if (altApproveResponse.status === 200) {
                approvalSuccess = true;
                console.log(`${colors.green}✓ Alternative approval endpoint works${colors.reset}`);
            } else {
                console.log(`${colors.red}✗ Alternative approval endpoint failed: ${altApproveResponse.status}${colors.reset}`);
            }
        }
        
        if (!approvalSuccess) {
            console.log(`${colors.red}✗ Both approval endpoints failed${colors.reset}`);
            console.log(`\nCheck the approve-user and approve-customer implementations in the backend`);
        }
    } catch (error) {
        console.log(`${colors.red}✗ Error approving customer${colors.reset}`);
        console.log(`Error: ${error.message}`);
    }
    
    // Step 6: Check login with approved customer
    if (approvalSuccess) {
        console.log(`\n${colors.yellow}Step 6: Testing login with approved customer...${colors.reset}`);
        try {
            const loginResponse = await axios.post(`${API_URL}/api/auth/login`, {
                email: testEmail,
                password: 'customer123'
            });
            
            if (loginResponse.status === 200) {
                console.log(`${colors.green}✓ Approved customer login successful${colors.reset}`);
            }
        } catch (error) {
            console.log(`${colors.red}✗ Approved customer login failed${colors.reset}`);
            console.log(`Error: ${error.response?.data?.message || error.message}`);
            console.log(`\nCheck the login endpoint implementation in backend/routes/auth.js`);
        }
    }
    
    console.log(`\n${colors.cyan}======= STATUS CHECK COMPLETED =======${colors.reset}`);
    
    // Summary
    console.log(`\n${colors.cyan}SUMMARY:${colors.reset}`);
    console.log(`1. Backend server: ${colors.green}Running${colors.reset}`);
    console.log(`2. Authentication system: ${colors.green}Working${colors.reset}`);
    console.log(`3. Customer approval endpoints: ${approvalSuccess ? colors.green + 'Working' : colors.red + 'Issues detected'}${colors.reset}`);
    console.log(`\nFrontend Instructions:`);
    console.log(`1. Start the frontend server with: npm run dev`);
    console.log(`2. Navigate to http://localhost:5173`);
    console.log(`3. Login as admin with email: admin@toollink.lk and password: admin123`);
    console.log(`4. Go to the Customer Approval page to manage pending customers`);
}

// Run the status check
testSystemStatus();
