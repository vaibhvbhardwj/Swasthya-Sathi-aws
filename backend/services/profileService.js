const bcrypt = require('bcryptjs');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, UpdateCommand, ScanCommand } = require('@aws-sdk/lib-dynamodb');
const { awsConfig, dynamoDBConfig } = require('../config/aws');

const client = new DynamoDBClient(awsConfig);
const docClient = DynamoDBDocumentClient.from(client);

const USERS_TABLE = dynamoDBConfig.tables.users;

/**
 * Get user profile by userId
 */
async function getProfile(userId) {
  const command = new GetCommand({
    TableName: USERS_TABLE,
    Key: { userId }
  });

  const response = await docClient.send(command);
  
  if (!response.Item) {
    throw new Error('User not found');
  }

  const { passwordHash, ...profile } = response.Item;
  return profile;
}

/**
 * Update user profile
 */
async function updateProfile(userId, updates) {
  const { name, email, age, gender, phone, password } = updates;

  // Check email uniqueness if email is being changed
  if (email) {
    const existingUser = await getUserByEmail(email);
    if (existingUser && existingUser.userId !== userId) {
      throw new Error('Email already in use by another account');
    }
  }

  // Build update expression
  let updateExpression = 'SET';
  const expressionAttributeNames = {};
  const expressionAttributeValues = {};
  const fieldsToUpdate = [];

  if (name) {
    fieldsToUpdate.push(' #name = :name');
    expressionAttributeNames['#name'] = 'name';
    expressionAttributeValues[':name'] = name;
  }

  if (email) {
    fieldsToUpdate.push(' email = :email');
    expressionAttributeValues[':email'] = email;
  }

  if (age) {
    fieldsToUpdate.push(' age = :age');
    expressionAttributeValues[':age'] = parseInt(age);
  }

  if (gender) {
    fieldsToUpdate.push(' gender = :gender');
    expressionAttributeValues[':gender'] = gender;
  }

  if (phone) {
    fieldsToUpdate.push(' phone = :phone');
    expressionAttributeValues[':phone'] = phone;
  }

  if (password) {
    const passwordHash = await bcrypt.hash(password, 10);
    fieldsToUpdate.push(' passwordHash = :passwordHash');
    expressionAttributeValues[':passwordHash'] = passwordHash;
  }

  if (fieldsToUpdate.length === 0) {
    throw new Error('No fields to update');
  }

  updateExpression += fieldsToUpdate.join(',');

  const command = new UpdateCommand({
    TableName: USERS_TABLE,
    Key: { userId },
    UpdateExpression: updateExpression,
    ExpressionAttributeNames: Object.keys(expressionAttributeNames).length > 0 ? expressionAttributeNames : undefined,
    ExpressionAttributeValues: expressionAttributeValues,
    ReturnValues: 'ALL_NEW'
  });

  const response = await docClient.send(command);
  const { passwordHash, ...updatedProfile } = response.Attributes;
  
  return updatedProfile;
}

/**
 * Helper: Get user by email
 */
async function getUserByEmail(email) {
  const command = new ScanCommand({
    TableName: USERS_TABLE,
    FilterExpression: 'email = :email',
    ExpressionAttributeValues: {
      ':email': email
    }
  });

  const response = await docClient.send(command);
  return response.Items && response.Items.length > 0 ? response.Items[0] : null;
}

module.exports = {
  getProfile,
  updateProfile
};
