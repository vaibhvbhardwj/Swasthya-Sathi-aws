const express = require('express');
const { parseLabReport, detectAbnormals, generateAIExplanation } = require('../services/labReportService');
const { validateJWT } = require('../middleware/authMiddleware');
const { upload, handleMulterError } = require('../middleware/uploadMiddleware');
const { extractTextFromImage, extractTextFromPDF } = require('../services/ocrService');
const localStore = require('../services/localStore');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

const SAFETY_DISCLAIMER = "IMPORTANT: This analysis is for informational purposes only and does not constitute medical advice, diagnosis, or treatment. Always consult with a qualified healthcare professional for medical concerns.";

/**
 * POST /api/lab-report/analyze
 * Analyze lab report and generate AI explanation
 * Authentication is optional - saves history if authenticated
 */
router.post('/analyze', async (req, res) => {
  try {
    const { reportText } = req.body;
    
    // Try to get userId from token if provided
    let userId = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1];
        const { verifyToken } = require('../services/authService');
        const decoded = verifyToken(token);
        userId = decoded.userId;
      } catch (err) {
        // Token invalid or expired, continue without userId
        console.log('Invalid token, continuing without authentication');
      }
    }

    if (!reportText) {
      return res.status(400).json({ error: 'reportText is required' });
    }

    const startTime = Date.now();

    // Parse lab report (within 1 second)
    const labReport = parseLabReport(reportText);
    
    if (labReport.tests.length === 0) {
      return res.status(400).json({ 
        error: 'No valid lab values found in the report',
        message: 'Please ensure the report contains recognized test names and values'
      });
    }

    // Detect abnormals
    const abnormals = detectAbnormals(labReport);

    // Generate AI explanation (within 5 seconds total)
    const aiExplanation = await generateAIExplanation(labReport, abnormals);

    const elapsed = Date.now() - startTime;

    // Save to history only if authenticated
    let reportId = null;
    if (userId) {
      reportId = uuidv4();
      const timestamp = new Date().toISOString();
      
      try {
        await localStore.insert('labReports', {
          reportId,
          userId,
          reportText,
          parsedValues: labReport.tests,
          abnormals,
          aiExplanation,
          analyzedAt: timestamp,
          createdAt: timestamp
        });
      } catch (dbError) {
        console.error('Failed to save lab report history:', dbError);
        // Continue even if history save fails
      }
    }

    res.json({
      reportId,
      parsedValues: labReport.tests,
      abnormals,
      aiExplanation,
      disclaimer: SAFETY_DISCLAIMER,
      processingTime: `${elapsed}ms`
    });
  } catch (error) {
    console.error('Lab report analysis error:', error);
    res.status(500).json({
      error: 'Analysis failed',
      message: error.message
    });
  }
});

/**
 * POST /api/lab-report/upload
 * Upload and analyze lab report from image or PDF file
 * Authentication is optional - saves history if authenticated
 */
router.post('/upload', upload.single('file'), handleMulterError, async (req, res) => {
  try {
    // Validate file was uploaded
    if (!req.file) {
      return res.status(400).json({ 
        error: 'No file uploaded',
        message: 'Please provide a file in the request'
      });
    }

    // Try to get userId from token if provided
    let userId = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1];
        const { verifyToken } = require('../services/authService');
        const decoded = verifyToken(token);
        userId = decoded.userId;
      } catch (err) {
        // Token invalid or expired, continue without userId
        console.log('Invalid token, continuing without authentication');
      }
    }

    const startTime = Date.now();

    // Extract text using OCR based on file type
    let extractedText;
    try {
      // Determine file type from both MIME type and file extension
      const mimeType = req.file.mimetype.toLowerCase();
      const fileName = req.file.originalname.toLowerCase();
      
      // Check if it's a PDF
      if (mimeType === 'application/pdf' || fileName.endsWith('.pdf')) {
        extractedText = await extractTextFromPDF(req.file.buffer);
      }
      // Handle all image formats
      else {
        // Determine image format from extension or mime type
        let format = 'jpeg'; // default
        if (fileName.endsWith('.png') || mimeType === 'image/png') {
          format = 'png';
        } else if (fileName.endsWith('.gif') || mimeType === 'image/gif') {
          format = 'gif';
        } else if (fileName.endsWith('.webp') || mimeType === 'image/webp') {
          format = 'webp';
        } else if (fileName.endsWith('.jpg') || fileName.endsWith('.jpeg') || mimeType.includes('jpeg')) {
          format = 'jpeg';
        }
        
        extractedText = await extractTextFromImage(req.file.buffer, format);
      }
    } catch (ocrError) {
      return res.status(400).json({
        error: 'Text extraction failed',
        message: ocrError.message
      });
    }

    // Parse lab report using existing function
    const labReport = parseLabReport(extractedText);
    
    if (labReport.tests.length === 0) {
      console.log('No lab values found. Extracted text:', extractedText);
      return res.status(400).json({ 
        error: 'No valid lab values found in the file',
        message: 'Please ensure the file contains a readable lab report with recognized test names and values',
        extractedText: extractedText.substring(0, 500), // Show first 500 chars for debugging
        hint: 'Supported tests: HbA1c, Glucose, Cholesterol, LDL, HDL, Triglycerides, WBC, RBC, Hemoglobin, Creatinine, Sodium, Potassium, and more'
      });
    }

    // Detect abnormals
    const abnormals = detectAbnormals(labReport);

    // Generate AI explanation
    const aiExplanation = await generateAIExplanation(labReport, abnormals);

    const elapsed = Date.now() - startTime;

    // Save to history only if authenticated
    let reportId = null;
    if (userId) {
      reportId = uuidv4();
      const timestamp = new Date().toISOString();
      
      try {
        await localStore.insert('labReports', {
          reportId,
          userId,
          reportText: extractedText,
          parsedValues: labReport.tests,
          abnormals,
          aiExplanation,
          analyzedAt: timestamp,
          createdAt: timestamp
        });
      } catch (dbError) {
        console.error('Failed to save lab report history:', dbError);
        // Continue even if history save fails
      }
    }

    // Return same format as /analyze endpoint
    res.json({
      reportId,
      parsedValues: labReport.tests,
      abnormals,
      aiExplanation,
      disclaimer: SAFETY_DISCLAIMER,
      processingTime: `${elapsed}ms`
    });
  } catch (error) {
    console.error('Lab report upload error:', error);
    res.status(500).json({
      error: 'Upload processing failed',
      message: error.message
    });
  }
});

/**
 * GET /api/lab-report/history
 * Get user's lab report history
 */
router.get('/history', validateJWT, async (req, res) => {
  try {
    const userId = req.userId;
    const limit = parseInt(req.query.limit) || 10;

    const reports = await localStore.list(
      'labReports',
      report => report.userId === userId,
      { sortBy: 'createdAt', desc: true, limit }
    );

    res.json({
      reports,
      count: reports.length
    });
  } catch (error) {
    console.error('Failed to fetch lab report history:', error);
    res.status(500).json({
      error: 'Failed to fetch history',
      message: error.message
    });
  }
});

module.exports = router;
