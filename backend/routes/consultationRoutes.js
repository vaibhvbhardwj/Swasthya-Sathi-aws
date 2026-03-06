const express = require('express');
const { validateJWT } = require('../middleware/authMiddleware');
const { getDoctors, getDoctorById, bookConsultation } = require('../services/consultationService');

const router = express.Router();

/**
 * GET /api/doctors
 * Get all verified doctors
 */
router.get('/doctors', async (req, res) => {
  try {
    const doctors = await getDoctors();
    res.json({ doctors });
  } catch (error) {
    console.error('Get doctors error:', error);
    res.status(500).json({ error: 'Failed to retrieve doctors' });
  }
});

/**
 * GET /api/doctors/:doctorId
 * Get doctor by ID with pricing
 */
router.get('/doctors/:doctorId', async (req, res) => {
  try {
    const { doctorId } = req.params;
    const doctor = await getDoctorById(doctorId);
    res.json(doctor);
  } catch (error) {
    console.error('Get doctor error:', error);
    
    if (error.message === 'Doctor not found') {
      return res.status(404).json({ error: error.message });
    }

    res.status(500).json({ error: 'Failed to retrieve doctor' });
  }
});

/**
 * POST /api/consultations
 * Book consultation
 */
router.post('/', validateJWT, async (req, res) => {
  try {
    const { doctorId } = req.body;

    if (!doctorId) {
      return res.status(400).json({ error: 'doctorId is required' });
    }

    const result = await bookConsultation(req.userId, doctorId);

    res.status(201).json(result);
  } catch (error) {
    console.error('Book consultation error:', error);
    
    if (error.message === 'Doctor not found') {
      return res.status(404).json({ error: error.message });
    }

    res.status(500).json({ error: 'Failed to book consultation' });
  }
});

/**
 * GET /api/consultations
 * Get user's consultations
 */
router.get('/', validateJWT, async (req, res) => {
  try {
    const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
    const { DynamoDBDocumentClient, QueryCommand } = require('@aws-sdk/lib-dynamodb');
    const { awsConfig, dynamoDBConfig } = require('../config/aws');
    
    const client = new DynamoDBClient(awsConfig);
    const docClient = DynamoDBDocumentClient.from(client);
    
    const command = new QueryCommand({
      TableName: dynamoDBConfig.tables.consultations,
      IndexName: 'userId-index',
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': req.userId
      },
      ScanIndexForward: false
    });

    const response = await docClient.send(command);

    res.json({
      consultations: response.Items || [],
      count: response.Items?.length || 0
    });
  } catch (error) {
    console.error('Get consultations error:', error);
    res.status(500).json({ error: 'Failed to retrieve consultations' });
  }
});

/**
 * PUT /api/consultations/:consultationId/visited
 * Mark consultation as visited
 */
router.put('/:consultationId/visited', validateJWT, async (req, res) => {
  try {
    const { consultationId } = req.params;
    const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
    const { DynamoDBDocumentClient, UpdateCommand } = require('@aws-sdk/lib-dynamodb');
    const { awsConfig, dynamoDBConfig } = require('../config/aws');
    
    const client = new DynamoDBClient(awsConfig);
    const docClient = DynamoDBDocumentClient.from(client);
    
    const command = new UpdateCommand({
      TableName: dynamoDBConfig.tables.consultations,
      Key: { consultationId },
      UpdateExpression: 'SET visited = :visited, visitedAt = :visitedAt',
      ExpressionAttributeValues: {
        ':visited': true,
        ':visitedAt': new Date().toISOString()
      }
    });

    await docClient.send(command);

    res.json({ message: 'Consultation marked as visited' });
  } catch (error) {
    console.error('Mark visited error:', error);
    res.status(500).json({ error: 'Failed to mark as visited' });
  }
});

module.exports = router;
