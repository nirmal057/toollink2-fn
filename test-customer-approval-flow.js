// test-customer-approval-flow.js
import axios from 'axios';
import readline from 'readline';
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    cyan: '\x1b[36m',
    blue: '\x1b[34m'
};

const API_URL = 'http://localhost:3001';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function prompt(question) {
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            resolve(answer);
        });
    });
}

async function testCustomerApprovalFlow() {
    console.log(`${colors.cyan}======= CUSTOMER APPROVAL FLOW TEST =======${colors.reset}`);
    
    // Step 1: Create a new customer for testing
    console.log(`\n${colors.yellow}Step 1: Creating a new customer...${colors.reset}`);
    const customerEmail = `test.customer.${Date.now()}@toollink.lk`;
    const customerPassword = 'customer123';
    
    try {
        const registerResponse = await axios.post(`${API_URL}/api/auth/register`, {
            email: customerEmail,
            password: customerPassword,
            fullName: 'Test Pending Customer',
            role: 'customer',
            phone: '0771234567'
        });
        
        if (registerResponse.status === 201) {
            console.log(`${colors.green}✓ Customer created successfully${colors.reset}`);
            console.log(`Email: ${customerEmail}`);
            console.log(`Password: ${customerPassword}`);
            console.log(`ID: ${registerResponse.data.user.id}`);
        } else {
            throw new Error(`Unexpected status: ${registerResponse.status}`);
        }
    } catch (error) {
        console.log(`${colors.red}✗ Failed to create customer${colors.reset}`);
        console.log(`Error: ${error.response?.data?.message || error.message}`);
        rl.close();
        return;
    }
    
    // Step 2: Try to login with the new customer (should be rejected)
    console.log(`\n${colors.yellow}Step 2: Verifying that unapproved customer cannot login...${colors.reset}`);
    try {
        await axios.post(`${API_URL}/api/auth/login`, {
            email: customerEmail,
            password: customerPassword
        });
        
        console.log(`${colors.red}✗ ERROR: Unapproved customer was allowed to login${colors.reset}`);
    } catch (error) {
        if (error.response && error.response.status === 403 && error.response.data.pendingApproval) {
            console.log(`${colors.green}✓ Correctly rejected with 'pending approval' message${colors.reset}`);
            console.log(`Message: ${error.response.data.message}`);
        } else {
            console.log(`${colors.yellow}! Login failed but not with the expected error${colors.reset}`);
            console.log(`Status: ${error.response?.status}`);
            console.log(`Message: ${error.response?.data?.message || error.message}`);
        }
    }
    
    // Step 3: Frontend instructions and validation
    console.log(`\n${colors.blue}===== FRONTEND TESTING INSTRUCTIONS =====${colors.reset}`);
    console.log(`1. Start the frontend server with: npm run dev`);
    console.log(`2. Navigate to http://localhost:5173`);
    console.log(`3. Login as admin with email: admin@toollink.lk and password: admin123`);
    console.log(`4. Go to the Customer Approval page`);
    console.log(`5. You should see the newly created customer in the list of pending customers`);
    console.log(`6. Approve the customer with email: ${customerEmail}`);
    
    const continueTest = await prompt(`\n${colors.yellow}Have you completed the frontend approval process? (y/n) ${colors.reset}`);
    if (continueTest.toLowerCase() !== 'y') {
        console.log(`${colors.yellow}Test interrupted by user${colors.reset}`);
        rl.close();
        return;
    }
    
    // Step 4: Verify that approved customer can now login
    console.log(`\n${colors.yellow}Step 4: Verifying that approved customer can now login...${colors.reset}`);
    try {
        const loginResponse = await axios.post(`${API_URL}/api/auth/login`, {
            email: customerEmail,
            password: customerPassword
        });
        
        if (loginResponse.status === 200 && loginResponse.data.success) {
            console.log(`${colors.green}✓ Customer login successful after approval${colors.reset}`);
            console.log(`Token received: ${loginResponse.data.data.token ? 'Yes' : 'No'}`);
            console.log(`User role: ${loginResponse.data.data.user?.role || 'Not provided'}`);
        } else {
            console.log(`${colors.red}✗ Customer login after approval returned unexpected response${colors.reset}`);
            console.log(loginResponse.data);
        }
    } catch (error) {
        console.log(`${colors.red}✗ Customer login after approval failed${colors.reset}`);
        console.log(`Error: ${error.response?.data?.message || error.message}`);
        console.log(`\nThis suggests that either:`);
        console.log(`1. The customer was not actually approved in the frontend`);
        console.log(`2. The approval endpoint is not working correctly`);
        console.log(`3. There's a database connectivity issue`);
    }
    
    console.log(`\n${colors.cyan}======= TEST COMPLETED =======${colors.reset}`);
    rl.close();
}

testCustomerApprovalFlow();
