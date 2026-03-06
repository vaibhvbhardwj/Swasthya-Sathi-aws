const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, QueryCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');
const { v4: uuidv4 } = require('uuid');
const { awsConfig, dynamoDBConfig } = require('../config/aws');

const client = new DynamoDBClient(awsConfig);
const docClient = DynamoDBDocumentClient.from(client);

const NOTIFICATIONS_TABLE = dynamoDBConfig.tables.notifications;

/**
 * Create a notification
 */
async function createNotification({ userId, type, message }) {
  const notificationId = uuidv4();
  const notification = {
    notificationId,
    userId,
    type, // medication_reminder, meeting_reminder, system_update
    message,
    isRead: false,
    createdAt: new Date().toISOString()
  };

  const command = new PutCommand({
    TableName: NOTIFICATIONS_TABLE,
    Item: notification
  });

  await docClient.send(command);

  return notificationId;
}

/**
 * Get notifications for a user
 */
async function getNotifications(userId) {
  const command = new QueryCommand({
    TableName: NOTIFICATIONS_TABLE,
    IndexName: 'userId-index',
    KeyConditionExpression: 'userId = :userId',
    ExpressionAttributeValues: {
      ':userId': userId
    },
    ScanIndexForward: false // Sort by createdAt descending
  });

  const response = await docClient.send(command);
  const notifications = response.Items || [];

  // Calculate unread count
  const unreadCount = notifications.filter(n => !n.isRead).length;

  return {
    notifications,
    unreadCount
  };
}

/**
 * Mark notification as read
 */
async function markAsRead(notificationId) {
  const command = new UpdateCommand({
    TableName: NOTIFICATIONS_TABLE,
    Key: { notificationId },
    UpdateExpression: 'SET isRead = :isRead',
    ExpressionAttributeValues: {
      ':isRead': true
    }
  });

  await docClient.send(command);

  return { message: 'Notification marked as read' };
}

module.exports = {
  createNotification,
  getNotifications,
  markAsRead
};
