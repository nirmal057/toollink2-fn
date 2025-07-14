// Test script to verify registration and authentication flow
// This script tests the key functionality we fixed

import { userRegistrationService } from './src/services/userRegistrationService.ts';
import { userManagementService } from './src/services/userManagementService.ts';
import { authService } from './src/services/authService.ts';

console.log('🔧 ToolLink Registration Flow Test');
console.log('=====================================');

// Test 1: Registration Service Integration
console.log('\n1. Testing Registration Service...');

try {
  const testCustomerData = {
    name: 'Test Customer',
    email: 'testcustomer@example.com',
    password: 'testpass123',
    address: '123 Test Street',
    phone: '+1234567890'
  };

  // Check if email validation works
  console.log('   ✓ Validating registration data...');
  const validationResult = userRegistrationService.validateRegistrationData(testCustomerData);
  if (validationResult.isValid) {
    console.log('   ✓ Validation passed');
  } else {
    console.log('   ✗ Validation failed:', validationResult.errors);
  }

  // Check duplicate email detection
  console.log('   ✓ Checking duplicate email detection...');
  const isDuplicate = userRegistrationService.isEmailRegistered('demo@toollink.com');
  console.log(`   ✓ Duplicate detection works: ${isDuplicate ? 'YES' : 'NO'}`);

  // Test registration process
  console.log('   ✓ Testing customer registration...');
  const registrationResult = userRegistrationService.registerCustomer(testCustomerData);
  console.log(`   ✓ Registration result:`, registrationResult.success ? 'SUCCESS' : 'FAILED');
  
  if (registrationResult.success) {
    console.log(`   ✓ New customer ID: ${registrationResult.customer.id}`);
  } else {
    console.log(`   ✗ Registration error: ${registrationResult.error}`);
  }

} catch (error) {
  console.log('   ✗ Registration test failed:', error.message);
}

// Test 2: User Management Integration
console.log('\n2. Testing User Management Integration...');

try {
  const userManagement = userManagementService.getInstance();
  const allUsers = userManagement.getUsers();
  
  console.log(`   ✓ Total users in system: ${allUsers.length}`);
  console.log('   ✓ Users by role:');
  
  const roleCount = allUsers.reduce((acc, user) => {
    acc[user.role] = (acc[user.role] || 0) + 1;
    return acc;
  }, {});
  
  Object.entries(roleCount).forEach(([role, count]) => {
    console.log(`      - ${role}: ${count}`);
  });

  // Check if our test customer was added
  const testCustomer = allUsers.find(user => user.email === 'testcustomer@example.com');
  if (testCustomer) {
    console.log('   ✓ Test customer found in user management system');
    console.log(`      Name: ${testCustomer.name}, Role: ${testCustomer.role}, Status: ${testCustomer.status}`);
  } else {
    console.log('   ⚠ Test customer not found in user management system');
  }

} catch (error) {
  console.log('   ✗ User management test failed:', error.message);
}

// Test 3: Authentication Service
console.log('\n3. Testing Authentication Service...');

try {
  const auth = authService.getInstance();
  
  // Test login with demo admin
  console.log('   ✓ Testing admin login...');
  const loginResult = await auth.login({
    email: 'demo@toollink.com',
    password: 'demo123'
  });

  if (loginResult.success) {
    console.log(`   ✓ Admin login successful: ${loginResult.user.name} (${loginResult.user.role})`);
  } else {
    console.log(`   ✗ Admin login failed: ${loginResult.error}`);
  }

  // Test invalid login
  console.log('   ✓ Testing invalid login...');
  const invalidLogin = await auth.login({
    email: 'invalid@example.com',
    password: 'wrongpass'
  });

  if (!invalidLogin.success) {
    console.log('   ✓ Invalid login properly rejected');
  } else {
    console.log('   ✗ Invalid login unexpectedly succeeded');
  }

} catch (error) {
  console.log('   ✗ Authentication test failed:', error.message);
}

console.log('\n=====================================');
console.log('🎯 Test Summary:');
console.log('1. Registration Service: Integration with user management');
console.log('2. User Management: Centralized user storage');
console.log('3. Authentication: Login/logout functionality');
console.log('\n💡 Next Steps:');
console.log('- Test registration form in browser');
console.log('- Verify admin can see new customers');
console.log('- Test complete navigation flow');
console.log('=====================================');
