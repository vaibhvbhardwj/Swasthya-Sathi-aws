const { upload, handleMulterError } = require('../middleware/uploadMiddleware');

/**
 * Upload Middleware Tests
 * Tests for file upload validation and error handling
 */

function testAcceptJPEGFiles() {
  console.log('\n=== Testing JPEG File Acceptance ===');
  
  const file = { mimetype: 'image/jpeg' };
  let accepted = false;
  let error = null;
  
  const cb = (err, result) => {
    error = err;
    accepted = result;
  };
  
  upload.fileFilter(null, file, cb);
  
  if (accepted && !error) {
    console.log('✓ JPEG files accepted correctly');
    return { success: true };
  } else {
    console.error('✗ JPEG files rejected incorrectly');
    return { success: false };
  }
}

function testAcceptPNGFiles() {
  console.log('\n=== Testing PNG File Acceptance ===');
  
  const file = { mimetype: 'image/png' };
  let accepted = false;
  let error = null;
  
  const cb = (err, result) => {
    error = err;
    accepted = result;
  };
  
  upload.fileFilter(null, file, cb);
  
  if (accepted && !error) {
    console.log('✓ PNG files accepted correctly');
    return { success: true };
  } else {
    console.error('✗ PNG files rejected incorrectly');
    return { success: false };
  }
}

function testAcceptHEICFiles() {
  console.log('\n=== Testing HEIC File Acceptance ===');
  
  const file = { mimetype: 'image/heic' };
  let accepted = false;
  let error = null;
  
  const cb = (err, result) => {
    error = err;
    accepted = result;
  };
  
  upload.fileFilter(null, file, cb);
  
  if (accepted && !error) {
    console.log('✓ HEIC files accepted correctly');
    return { success: true };
  } else {
    console.error('✗ HEIC files rejected incorrectly');
    return { success: false };
  }
}

function testAcceptPDFFiles() {
  console.log('\n=== Testing PDF File Acceptance ===');
  
  const file = { mimetype: 'application/pdf' };
  let accepted = false;
  let error = null;
  
  const cb = (err, result) => {
    error = err;
    accepted = result;
  };
  
  upload.fileFilter(null, file, cb);
  
  if (accepted && !error) {
    console.log('✓ PDF files accepted correctly');
    return { success: true };
  } else {
    console.error('✗ PDF files rejected incorrectly');
    return { success: false };
  }
}

function testRejectUnsupportedFileTypes() {
  console.log('\n=== Testing Unsupported File Type Rejection ===');
  
  const file = { mimetype: 'image/gif' };
  let accepted = true;
  let error = null;
  
  const cb = (err, result) => {
    error = err;
    accepted = result;
  };
  
  upload.fileFilter(null, file, cb);
  
  if (!accepted && error && error.message.includes('Invalid file type')) {
    console.log('✓ Unsupported file types rejected correctly');
    console.log('  Error:', error.message);
    return { success: true };
  } else {
    console.error('✗ Unsupported file types not rejected properly');
    return { success: false };
  }
}

function testFileSizeLimit() {
  console.log('\n=== Testing File Size Limit Configuration ===');
  
  const expectedLimit = 10 * 1024 * 1024; // 10MB
  
  if (upload.limits.fileSize === expectedLimit) {
    console.log('✓ File size limit set to 10MB correctly');
    console.log(`  Limit: ${upload.limits.fileSize / (1024 * 1024)}MB`);
    return { success: true };
  } else {
    console.error('✗ File size limit not configured correctly');
    console.error(`  Expected: ${expectedLimit}, Got: ${upload.limits.fileSize}`);
    return { success: false };
  }
}

function testMemoryStorage() {
  console.log('\n=== Testing Memory Storage Configuration ===');
  
  if (upload.storage) {
    console.log('✓ Memory storage configured correctly');
    return { success: true };
  } else {
    console.error('✗ Storage not configured');
    return { success: false };
  }
}

function testFileSizeLimitError() {
  console.log('\n=== Testing File Size Limit Error Handling ===');
  
  const multer = require('multer');
  const err = new multer.MulterError('LIMIT_FILE_SIZE');
  const req = {};
  let statusCode = null;
  let responseData = null;
  
  const res = {
    status: (code) => {
      statusCode = code;
      return res;
    },
    json: (data) => {
      responseData = data;
    }
  };
  const next = () => {};
  
  handleMulterError(err, req, res, next);
  
  if (statusCode === 400 && 
      responseData && 
      responseData.error === 'File too large' &&
      responseData.message === 'File size must not exceed 10MB') {
    console.log('✓ File size limit error handled correctly');
    console.log('  Response:', responseData);
    return { success: true };
  } else {
    console.error('✗ File size limit error not handled correctly');
    console.error('  Status:', statusCode);
    console.error('  Response:', responseData);
    return { success: false };
  }
}

function testInvalidFileTypeError() {
  console.log('\n=== Testing Invalid File Type Error Handling ===');
  
  const err = new Error('Invalid file type. Only JPEG, PNG, HEIC images and PDF files are allowed.');
  const req = {};
  let statusCode = null;
  let responseData = null;
  
  const res = {
    status: (code) => {
      statusCode = code;
      return res;
    },
    json: (data) => {
      responseData = data;
    }
  };
  const next = () => {};
  
  handleMulterError(err, req, res, next);
  
  if (statusCode === 400 && 
      responseData && 
      responseData.error === 'Invalid file' &&
      responseData.message.includes('Invalid file type')) {
    console.log('✓ Invalid file type error handled correctly');
    console.log('  Response:', responseData);
    return { success: true };
  } else {
    console.error('✗ Invalid file type error not handled correctly');
    console.error('  Status:', statusCode);
    console.error('  Response:', responseData);
    return { success: false };
  }
}

function testNoErrorPassthrough() {
  console.log('\n=== Testing No Error Passthrough ===');
  
  const req = {};
  const res = {};
  let nextCalled = false;
  const next = () => { nextCalled = true; };
  
  handleMulterError(null, req, res, next);
  
  if (nextCalled) {
    console.log('✓ No error passes through to next middleware');
    return { success: true };
  } else {
    console.error('✗ Next middleware not called when no error');
    return { success: false };
  }
}

// Run all tests
async function runAllTests() {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║        Upload Middleware Tests                         ║');
  console.log('╚════════════════════════════════════════════════════════╝');
  
  const results = {
    passed: 0,
    failed: 0
  };
  
  // Test 1: Accept JPEG files
  const test1 = testAcceptJPEGFiles();
  if (test1.success) results.passed++;
  else results.failed++;
  
  // Test 2: Accept PNG files
  const test2 = testAcceptPNGFiles();
  if (test2.success) results.passed++;
  else results.failed++;
  
  // Test 3: Accept HEIC files
  const test3 = testAcceptHEICFiles();
  if (test3.success) results.passed++;
  else results.failed++;
  
  // Test 4: Accept PDF files
  const test4 = testAcceptPDFFiles();
  if (test4.success) results.passed++;
  else results.failed++;
  
  // Test 5: Reject unsupported file types
  const test5 = testRejectUnsupportedFileTypes();
  if (test5.success) results.passed++;
  else results.failed++;
  
  // Test 6: File size limit configuration
  const test6 = testFileSizeLimit();
  if (test6.success) results.passed++;
  else results.failed++;
  
  // Test 7: Memory storage configuration
  const test7 = testMemoryStorage();
  if (test7.success) results.passed++;
  else results.failed++;
  
  // Test 8: File size limit error handling
  const test8 = testFileSizeLimitError();
  if (test8.success) results.passed++;
  else results.failed++;
  
  // Test 9: Invalid file type error handling
  const test9 = testInvalidFileTypeError();
  if (test9.success) results.passed++;
  else results.failed++;
  
  // Test 10: No error passthrough
  const test10 = testNoErrorPassthrough();
  if (test10.success) results.passed++;
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
    console.log('\n🎉 All tests passed! Upload middleware is working correctly.');
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
