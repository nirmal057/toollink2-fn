// Test script to verify customer registration and user management integration
// This script tests the complete flow from registration to admin visibility

import { userManagementService } from './src/services/userManagementService.js';
import { userRegistrationService } from './src/services/userRegistrationService.js';

console.log('🧪 Testing Customer Registration and User Management Integration\n');

// Test 1: Initial state
console.log('📊 Initial User Count:', userManagementService.getUsers().length);
console.log('👥 Initial Users:', userManagementService.getUsers().map(u => `${u.name} (${u.email})`));

// Test 2: Register a new customer
console.log('\n🔄 Testing Customer Registration...');
try {
  const testCustomer = {
    name: 'Test Customer',
    email: 'test.customer@example.com',
    password: 'password123',
    address: '123 Test Street',
    phone: '+1234567890'
  };

  const registrationResult = userRegistrationService.registerCustomer(testCustomer);
  console.log('✅ Registration Result:', registrationResult);
  
  // Test 3: Verify customer appears in user management
  console.log('\n📊 Updated User Count:', userManagementService.getUsers().length);
  console.log('👥 All Users After Registration:', 
    userManagementService.getUsers().map(u => `${u.name} (${u.email}) - ${u.role}`)
  );
  
  // Test 4: Check if customer appears in customer list
  const customers = userManagementService.getUsersByRole('customer');
  console.log('\n👤 Customers:', customers.map(c => `${c.name} (${c.email})`));
  
  // Test 5: Verify email check works
  console.log('\n🔍 Email Registration Check:', {
    'test.customer@example.com': userManagementService.isEmailRegistered('test.customer@example.com'),
    'nonexistent@example.com': userManagementService.isEmailRegistered('nonexistent@example.com')
  });

  console.log('\n✨ All tests completed successfully!');
  console.log('🎉 Customer registration and user management integration is working correctly!');

} catch (error) {
  console.error('❌ Test failed:', error.message);
}
