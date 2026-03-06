const { registerUser, loginUser, verifyToken } = require('../services/authService');
const { v4: uuidv4 } = require('uuid');

/**
 * Authentication Service Tests
 * Tests for user registration, login, and JWT validation
 */

// Test helper to generate unique test data
function generateTestUser() {
  const uniqueId = uuidv4().substring(0, 8);
  return {
    name: `Test User ${uniqueId}`,
    email: `test${uniqueId}@example.com`,
    password: 'TestPassword123!',
    age: 30,
    gender: 'male',
    phone: '1234567890'
  };
}

async function testRegistration() {
  console.log('\n=== Testing User Registration ===');
  
  try {
    const testUser = generateTestUser();
    console.log('Registering user:', testUser.email);
    
    const result = await registerUser(testUser);
    
    console.log('✓ Registration successful');
    console.log('  User ID:', result.userId);
    console.log('  Message:', result.message);
    
    return { success: true, userId: result.userId, email: testUser.email, password: testUser.password };
  } catch (error) {
    console.error('✗ Registration failed:', error.message);
    return { success: false, error: error.message };
  }
}

async function testLogin(email, password) {
  console.log('\n=== Testing User Login ===');
  
  try {
    console.log('Logging in user:', email);
    
    const startTime = Date.now();
    const result = await loginUser({ email, password });
    const elapsed = Date.now() - startTime;
    
    console.log('✓ Login successful');
    console.log('  User ID:', result.userId);
    console.log('  Token:', result.token.substring(0, 20) + '...');
    console.log('  Expires In:', result.expiresIn);
    console.log('  Response Time:', elapsed + 'ms');
    
    return { success: true, token: result.token, userId: result.userId };
  } catch (error) {
    console.error('✗ Login failed:', error.message);
    return { success: false, error: error.message };
  }
}

async function testInvalidLogin() {
  console.log('\n=== Testing Invalid Login ===');
  
  try {
    const startTime = Date.now();
    await loginUser({ 
      email: 'nonexistent@example.com', 
      password: 'wrongpassword' 
    });
    
    console.error('✗ Should have thrown error for invalid credentials');
    return { success: false };
  } catch (error) {
    const elapsed = Date.now() - startTime;
    console.log('✓ Invalid login rejected correctly');
    console.log('  Error:', error.message);
    console.log('  Response Time:', elapsed + 'ms');
    console.log('  Within 200ms requirement:', elapsed <= 200 ? 'Yes' : 'No');
    
    return { success: true, elapsed };
  }
}

async function testTokenVerification(token) {
  console.log('\n=== Testing JWT Token Verification ===');
  
  try {
    console.log('Verifying token...');
    
    const decoded = verifyToken(token);
    
    console.log('✓ Token verified successfully');
    console.log('  User ID:', decoded.userId);
    console.log('  Email:', decoded.email);
    console.log('  Role:', decoded.role);
    console.log('  Expires:', new Date(decoded.exp * 1000).toISOString());
    
    return { success: true, decoded };
  } catch (error) {
    console.error('✗ Token verification failed:', error.message);
    return { success: false, error: error.message };
  }
}

async function testInvalidToken() {
  console.log('\n=== Testing Invalid Token ===');
  
  try {
    verifyToken('invalid.token.here');
    console.error('✗ Should have thrown error for invalid token');
    return { success: false };
  } catch (error) {
    console.log('✓ Invalid token rejected correctly');
    console.log('  Error:', error.message);
    return { success: true };
  }
}

async function testDuplicateRegistration(email) {
  console.log('\n=== Testing Duplicate Registration ===');
  
  try {
    await registerUser({
      name: 'Duplicate User',
      email: email,
      password: 'Password123!',
      age: 25,
      gender: 'female',
      phone: '9876543210'
    });
    
    console.error('✗ Should have thrown error for duplicate email');
    return { success: false };
  } catch (error) {
    console.log('✓ Duplicate registration rejected correctly');
    console.log('  Error:', error.message);
    return { success: true };
  }
}

async function testValidation() {
  console.log('\n=== Testing Input Validation ===');
  
  const tests = [
    {
      name: 'Missing fields',
      data: { name: 'Test', email: 'test@example.com' },
      expectedError: 'required'
    },
    {
      name: 'Invalid email format',
      data: {
        name: 'Test User',
        email: 'invalid-email',
        password: 'Password123!',
        age: 30,
        gender: 'male',
        phone: '1234567890'
      },
      expectedError: 'Invalid email'
    },
    {
      name: 'Invalid age',
      data: {
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123!',
        age: 150,
        gender: 'male',
        phone: '1234567890'
      },
      expectedError: 'Age must be'
    },
    {
      name: 'Invalid phone',
      data: {
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123!',
        age: 30,
        gender: 'male',
        phone: '123'
      },
      expectedError: 'Phone must be'
    }
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    try {
      await registerUser(test.data);
      console.error(`✗ ${test.name}: Should have thrown error`);
      failed++;
    } catch (error) {
      if (error.message.includes(test.expectedError)) {
        console.log(`✓ ${test.name}: Validation working`);
        passed++;
      } else {
        console.error(`✗ ${test.name}: Wrong error - ${error.message}`);
        failed++;
      }
    }
  }
  
  console.log(`\nValidation Tests: ${passed} passed, ${failed} failed`);
  return { success: failed === 0, passed, failed };
}

// Run all tests
async function runAllTests() {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║   Swasthya Sathi Authentication Service Tests         ║');
  console.log('╚════════════════════════════════════════════════════════╝');
  
  const results = {
    passed: 0,
    failed: 0
  };
  
  // Test 1: Registration
  const regResult = await testRegistration();
  if (regResult.success) {
    results.passed++;
    
    // Test 2: Login with valid credentials
    const loginResult = await testLogin(regResult.email, regResult.password);
    if (loginResult.success) {
      results.passed++;
      
      // Test 3: Token verification
      const tokenResult = await testTokenVerification(loginResult.token);
      if (tokenResult.success) results.passed++;
      else results.failed++;
    } else {
      results.failed++;
    }
    
    // Test 4: Duplicate registration
    const dupResult = await testDuplicateRegistration(regResult.email);
    if (dupResult.success) results.passed++;
    else results.failed++;
  } else {
    results.failed++;
  }
  
  // Test 5: Invalid login
  const invalidLoginResult = await testInvalidLogin();
  if (invalidLoginResult.success) results.passed++;
  else results.failed++;
  
  // Test 6: Invalid token
  const invalidTokenResult = await testInvalidToken();
  if (invalidTokenResult.success) results.passed++;
  else results.failed++;
  
  // Test 7: Input validation
  const validationResult = await testValidation();
  if (validationResult.success) results.passed++;
  else results.failed++;
  
  // Summary
  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║                    Test Summary                        ║');
  console.log('╚════════════════════════════════════════════════════════╝');
  console.log(`Total Tests: ${results.passed + results.failed}`);
  console.log(`✓ Passed: ${results.passed}`);
  console.log(`✗ Failed: ${results.failed}`);
  console.log(`Success Rate: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(1)}%`);
  
  if (results.failed === 0) {
    console.log('\n🎉 All tests passed! Authentication system is working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Please review the errors above.');
  }
  
  process.exit(results.failed === 0 ? 0 : 1);
}

// Run tests
runAllTests().catch(error => {
  console.error('Test execution failed:', error);
  process.exit(1);
});
