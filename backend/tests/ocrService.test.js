const { extractTextFromImage, extractTextFromPDF } = require('../services/ocrService');

/**
 * OCR Service Tests
 * Tests for text extraction from images and PDFs
 */

async function testInvalidImageBuffer() {
  console.log('\n=== Testing Invalid Image Buffer ===');
  
  try {
    await extractTextFromImage(null, 'jpeg');
    console.error('✗ Should have thrown error for null buffer');
    return { success: false };
  } catch (error) {
    if (error.message.includes('Invalid image buffer')) {
      console.log('✓ Invalid buffer rejected correctly');
      console.log('  Error:', error.message);
      return { success: true };
    } else {
      console.error('✗ Wrong error message:', error.message);
      return { success: false };
    }
  }
}

async function testUnsupportedImageFormat() {
  console.log('\n=== Testing Unsupported Image Format ===');
  
  try {
    const buffer = Buffer.from('test');
    await extractTextFromImage(buffer, 'bmp');
    console.error('✗ Should have thrown error for unsupported format');
    return { success: false };
  } catch (error) {
    if (error.message.includes('Unsupported image format')) {
      console.log('✓ Unsupported format rejected correctly');
      console.log('  Error:', error.message);
      return { success: true };
    } else {
      console.error('✗ Wrong error message:', error.message);
      return { success: false };
    }
  }
}

async function testSupportedImageFormats() {
  console.log('\n=== Testing Supported Image Formats ===');
  
  const formats = ['jpeg', 'jpg', 'png', 'heic'];
  let passed = 0;
  
  for (const format of formats) {
    try {
      const buffer = Buffer.from('test');
      await extractTextFromImage(buffer, format);
      // If we get here without error, format was accepted (AWS call will fail with test data)
      console.log(`✓ Format ${format.toUpperCase()} accepted`);
      passed++;
    } catch (error) {
      // Format validation should pass, AWS call will fail
      if (!error.message.includes('Unsupported image format')) {
        console.log(`✓ Format ${format.toUpperCase()} accepted (AWS call failed as expected)`);
        passed++;
      } else {
        console.error(`✗ Format ${format.toUpperCase()} rejected incorrectly`);
      }
    }
  }
  
  console.log(`\nFormat Tests: ${passed}/${formats.length} passed`);
  return { success: passed === formats.length, passed, total: formats.length };
}

async function testInvalidPDFBuffer() {
  console.log('\n=== Testing Invalid PDF Buffer ===');
  
  try {
    await extractTextFromPDF(null);
    console.error('✗ Should have thrown error for null buffer');
    return { success: false };
  } catch (error) {
    if (error.message.includes('Invalid PDF buffer')) {
      console.log('✓ Invalid PDF buffer rejected correctly');
      console.log('  Error:', error.message);
      return { success: true };
    } else {
      console.error('✗ Wrong error message:', error.message);
      return { success: false };
    }
  }
}

async function testNonBufferPDFInput() {
  console.log('\n=== Testing Non-Buffer PDF Input ===');
  
  try {
    await extractTextFromPDF('not a buffer');
    console.error('✗ Should have thrown error for non-buffer input');
    return { success: false };
  } catch (error) {
    if (error.message.includes('Invalid PDF buffer')) {
      console.log('✓ Non-buffer input rejected correctly');
      console.log('  Error:', error.message);
      return { success: true };
    } else {
      console.error('✗ Wrong error message:', error.message);
      return { success: false };
    }
  }
}

// Run all tests
async function runAllTests() {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║        Swasthya Sathi OCR Service Tests               ║');
  console.log('╚════════════════════════════════════════════════════════╝');
  
  const results = {
    passed: 0,
    failed: 0
  };
  
  // Test 1: Invalid image buffer
  const test1 = await testInvalidImageBuffer();
  if (test1.success) results.passed++;
  else results.failed++;
  
  // Test 2: Unsupported image format
  const test2 = await testUnsupportedImageFormat();
  if (test2.success) results.passed++;
  else results.failed++;
  
  // Test 3: Supported image formats
  const test3 = await testSupportedImageFormats();
  if (test3.success) results.passed++;
  else results.failed++;
  
  // Test 4: Invalid PDF buffer
  const test4 = await testInvalidPDFBuffer();
  if (test4.success) results.passed++;
  else results.failed++;
  
  // Test 5: Non-buffer PDF input
  const test5 = await testNonBufferPDFInput();
  if (test5.success) results.passed++;
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
    console.log('\n🎉 All tests passed! OCR service validation is working correctly.');
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
