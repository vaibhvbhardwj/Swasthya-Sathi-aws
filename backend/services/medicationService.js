const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, QueryCommand, DeleteCommand } = require('@aws-sdk/lib-dynamodb');
const { v4: uuidv4 } = require('uuid');
const { awsConfig, dynamoDBConfig } = require('../config/aws');
const { createNotification } = require('./notificationService');

const client = new DynamoDBClient(awsConfig);
const docClient = DynamoDBDocumentClient.from(client);

const MEDICATIONS_TABLE = dynamoDBConfig.tables.medications;

/**
 * Calculate next reminder time based on frequency
 */
function calculateNextReminder(frequency, customInterval) {
  const now = new Date();
  
  switch (frequency) {
    case 'once_daily':
      now.setHours(now.getHours() + 24);
      break;
    case 'twice_daily':
      now.setHours(now.getHours() + 12);
      break;
    case 'thrice_daily':
      now.setHours(now.getHours() + 8);
      break;
    case 'custom':
      if (customInterval) {
        now.setHours(now.getHours() + parseInt(customInterval));
      } else {
        now.setHours(now.getHours() + 24); // Default to 24 hours
      }
      break;
    default:
      now.setHours(now.getHours() + 24);
  }
  
  return now.toISOString();
}

/**
 * Add medication
 */
async function addMedication({ userId, name, dosage, frequency, customInterval, notes }) {
  if (!name || !dosage || !frequency) {
    throw new Error('name, dosage, and frequency are required');
  }

  const validFrequencies = ['once_daily', 'twice_daily', 'thrice_daily', 'custom'];
  if (!validFrequencies.includes(frequency)) {
    throw new Error('Invalid frequency. Must be: once_daily, twice_daily, thrice_daily, or custom');
  }

  const medicationId = uuidv4();
  const nextReminderAt = calculateNextReminder(frequency, customInterval);

  const medication = {
    medicationId,
    userId,
    name,
    dosage,
    frequency,
    customInterval: customInterval || null,
    notes: notes || '',
    nextReminderAt,
    createdAt: new Date().toISOString()
  };

  const command = new PutCommand({
    TableName: MEDICATIONS_TABLE,
    Item: medication
  });

  await docClient.send(command);

  return { medicationId, message: 'Medication added successfully' };
}

/**
 * Get all medications for user
 */
async function getMedications(userId) {
  const command = new QueryCommand({
    TableName: MEDICATIONS_TABLE,
    IndexName: 'userId-index',
    KeyConditionExpression: 'userId = :userId',
    ExpressionAttributeValues: {
      ':userId': userId
    }
  });

  const response = await docClient.send(command);
  return response.Items || [];
}

/**
 * Delete medication
 */
async function deleteMedication(medicationId) {
  const command = new DeleteCommand({
    TableName: MEDICATIONS_TABLE,
    Key: { medicationId }
  });

  await docClient.send(command);

  return { message: 'Medication deleted successfully' };
}

/**
 * Check for due medications and send reminders
 * This should be called by a background scheduler
 */
async function checkAndSendReminders() {
  const { ScanCommand } = require('@aws-sdk/lib-dynamodb');
  
  const now = new Date().toISOString();

  const command = new ScanCommand({
    TableName: MEDICATIONS_TABLE,
    FilterExpression: 'nextReminderAt <= :now',
    ExpressionAttributeValues: {
      ':now': now
    }
  });

  const response = await docClient.send(command);
  const dueMedications = response.Items || [];

  for (const med of dueMedications) {
    // Send notification
    await createNotification({
      userId: med.userId,
      type: 'medication_reminder',
      message: `Time to take your medication: ${med.name} (${med.dosage})`
    });

    // Update next reminder time
    const { UpdateCommand } = require('@aws-sdk/lib-dynamodb');
    const nextReminder = calculateNextReminder(med.frequency, med.customInterval);
    
    const updateCommand = new UpdateCommand({
      TableName: MEDICATIONS_TABLE,
      Key: { medicationId: med.medicationId },
      UpdateExpression: 'SET nextReminderAt = :nextReminder',
      ExpressionAttributeValues: {
        ':nextReminder': nextReminder
      }
    });

    await docClient.send(updateCommand);
  }

  return { processedCount: dueMedications.length };
}

module.exports = {
  addMedication,
  getMedications,
  deleteMedication,
  checkAndSendReminders
};
