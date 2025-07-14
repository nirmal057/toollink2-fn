// check-servers.js
import http from 'http';
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    cyan: '\x1b[36m'
};

// Define the server endpoints to check
const servers = [
    { name: 'Backend Server', url: 'http://localhost:3001', path: '/api/auth/me' },
    { name: 'Frontend Server', url: 'http://localhost:5173', path: '/' }
];

// Function to check if a server is running
function checkServer(server) {
    return new Promise((resolve) => {
        const url = new URL(server.path, server.url);
        
        const req = http.get(url, (res) => {
            resolve({
                name: server.name,
                isRunning: true,
                statusCode: res.statusCode
            });
        });
        
        req.on('error', (err) => {
            resolve({
                name: server.name,
                isRunning: false,
                error: err.message
            });
        });
        
        // Set a timeout
        req.setTimeout(3000, () => {
            req.destroy();
            resolve({
                name: server.name,
                isRunning: false,
                error: 'Request timed out'
            });
        });
    });
}

// Check all servers and display results
async function checkAllServers() {
    console.log(`${colors.cyan}======= SERVER STATUS CHECK =======${colors.reset}\n`);
    
    const results = await Promise.all(servers.map(checkServer));
    
    results.forEach(result => {
        if (result.isRunning) {
            console.log(`${colors.green}✓ ${result.name} is running (Status: ${result.statusCode})${colors.reset}`);
        } else {
            console.log(`${colors.red}✗ ${result.name} is NOT running${colors.reset}`);
            console.log(`  Error: ${result.error}`);
            
            if (result.name === 'Backend Server') {
                console.log(`\n  ${colors.yellow}Start the backend server with:${colors.reset}`);
                console.log(`  cd backend && npm run dev`);
            } else if (result.name === 'Frontend Server') {
                console.log(`\n  ${colors.yellow}Start the frontend server with:${colors.reset}`);
                console.log(`  npm run dev`);
            }
        }
    });
    
    console.log(`\n${colors.cyan}======= CHECK COMPLETED =======${colors.reset}`);
}

// Run the check
checkAllServers();
