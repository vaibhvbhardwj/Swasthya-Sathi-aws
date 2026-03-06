const express = require('express');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, QueryCommand } = require('@aws-sdk/lib-dynamodb');
const { parseLabReport, detectAbnormals, generateAIExplanation } = require('../services/labReportService');
const { validateJWT } = require('../middleware/authMiddleware');
const { awsConfig } = require('../config/aws');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();
const dynamoClient = new DynamoDBClient(awsConfig);
const docClient = DynamoDBDocumentClient.from(dynamoClient);

const SAFETY_DISCLAIMER = "⚠️ IMPORTANT: This analysis is for informational purposes only and does not constitute medical advice, diagnosis, or treatment. Always consult with a qualified healthcare professional for medical concerns.";

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
        await docClient.send(new PutCommand({
          TableName: 'LabReports',
          Item: {
            reportId,
            userId,
            reportText,
            parsedValues: labReport.tests,
            abnormals,
            aiExplanation,
            analyzedAt: timestamp,
            createdAt: timestamp
          }
        }));
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
 * GET /api/lab-report/history
 * Get user's lab report history
 */
router.get('/history', validateJWT, async (req, res) => {
  try {
    const userId = req.userId;
    const limit = parseInt(req.query.limit) || 10;

    const result = await docClient.send(new QueryCommand({
      TableName: 'LabReports',
      IndexName: 'UserIdIndex',
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      },
      ScanIndexForward: false, // Most recent first
      Limit: limit
    }));

    res.json({
      reports: result.Items || [],
      count: result.Items?.length || 0
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
