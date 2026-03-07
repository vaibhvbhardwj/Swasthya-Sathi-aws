const express = require('express');
const { validateJWT, requireRole } = require('../middleware/authMiddleware');
const { submitQuestion, getDraftResponse, reviewDraft } = require('../services/chatService');

const router = express.Router();

/**
 * POST /api/chat/ask
 * Submit a health question (patient)
 */
router.post('/ask', validateJWT, async (req, res) => {
  try {
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }

    const result = await submitQuestion(req.userId, question);

    res.json(result);
  } catch (error) {
    console.error('Submit question error:', error);
    res.status(500).json({ error: 'Failed to submit question', message: error.message });
  }
});

/**
 * GET /api/chat/response/:draftId
 * Get draft response status
 */
router.get('/response/:draftId', validateJWT, async (req, res) => {
  try {
    const { draftId } = req.params;

    const result = await getDraftResponse(draftId, req.userId);

    res.json(result);
  } catch (error) {
    console.error('Get draft response error:', error);
    
    if (error.message === 'Draft not found') {
      return res.status(404).json({ error: error.message });
    }
    
    if (error.message === 'Unauthorized access to draft') {
      return res.status(403).json({ error: error.message });
    }

    res.status(500).json({ error: 'Failed to retrieve response' });
  }
});

/**
 * POST /api/chat/review
 * Review and approve/reject draft (clinician only)
 */
router.post('/review', validateJWT, async (req, res) => {
  try {
    const { draftId, action, editedResponse, clinicianNotes } = req.body;

    if (!draftId || !action) {
      return res.status(400).json({ error: 'draftId and action are required' });
    }

    const result = await reviewDraft(draftId, req.userId, action, editedResponse, clinicianNotes);

    res.json(result);
  } catch (error) {
    console.error('Review draft error:', error);
    
    if (error.message === 'Draft not found') {
      return res.status(404).json({ error: error.message });
    }
    
    if (error.message.includes('must be')) {
      return res.status(400).json({ error: error.message });
    }

    res.status(500).json({ error: 'Failed to review draft' });
  }
});

/**
 * GET /api/chat/pending
 * Get all pending drafts for clinician review
 */
router.get('/pending', validateJWT, async (req, res) => {
  try {
    const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
    const { DynamoDBDocumentClient, ScanCommand } = require('@aws-sdk/lib-dynamodb');
    const { awsConfig, dynamoDBConfig } = require('../config/aws');
    
    const client = new DynamoDBClient(awsConfig);
    const docClient = DynamoDBDocumentClient.from(client);
    
    const command = new ScanCommand({
      TableName: dynamoDBConfig.tables.chatDrafts,
      FilterExpression: '#status = :status',
      ExpressionAttributeNames: {
        '#status': 'status'
      },
      ExpressionAttributeValues: {
        ':status': 'pending_review'
      }
    });

    const response = await docClient.send(command);

    res.json({
      drafts: response.Items || [],
      count: response.Items?.length || 0
    });
  } catch (error) {
    console.error('Get pending drafts error:', error);
    res.status(500).json({ error: 'Failed to retrieve pending drafts' });
  }
});

/**
 * GET /api/chat/history
 * Get user's chat history (approved responses only)
 */
router.get('/history', validateJWT, async (req, res) => {
  try {
    const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
    const { DynamoDBDocumentClient, QueryCommand } = require('@aws-sdk/lib-dynamodb');
    const { awsConfig, dynamoDBConfig } = require('../config/aws');
    
    const client = new DynamoDBClient(awsConfig);
    const docClient = DynamoDBDocumentClient.from(client);
    
    const command = new QueryCommand({
      TableName: dynamoDBConfig.tables.chatDrafts,
      IndexName: 'userId-index',
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': req.userId
      },
      ScanIndexForward: false // Most recent first
    });

    const response = await docClient.send(command);

    res.json({
      chats: response.Items || [],
      count: response.Items?.length || 0
    });
  } catch (error) {
    console.error('Get chat history error:', error);
    res.status(500).json({ error: 'Failed to retrieve chat history' });
  }
});

module.exports = router;
