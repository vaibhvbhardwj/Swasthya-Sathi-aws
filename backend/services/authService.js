const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, GetCommand, QueryCommand } = require('@aws-sdk/lib-dynamodb');
const { v4: uuidv4 } = require('uuid');
const { awsConfig, dynamoDBConfig } = require('../config/aws');

// Initialize DynamoDB client
const client = new DynamoDBClient({
  region: awsConfig.region,
  credentials: awsConfig.credentials
});
const docClient = DynamoDBDocumentClient.from(client);

const USERS_TABLE = dynamoDBConfig.tables.users;
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
const SALT_ROUNDS = 10;

/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @returns {Object} - { userId, message }
 */
async function registerUser(userData) {
  const { name, email, password, age, gender, phone } = userData;

  // Validate required fields
  if (!name || !email || !password || !age || !gender || !phone) {
    throw new Error('All fields are required: name, email, password, age, gender, phone');
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error('Invalid email format');
  }

  // Validate age
  if (age < 1 || age > 120) {
    throw new Error('Age must be between 1 and 120');
  }

  // Validate phone (10-digit numeric)
  const phoneRegex = /^\d{10}$/;
  if (!phoneRegex.test(phone)) {
    throw new Error('Phone must be a 10-digit number');
  }

  // Check if email already exists
  const existingUser = await getUserByEmail(email);
  if (existingUser) {
    throw new Error('Email already registered');
  }

  // Hash password with bcrypt salt factor 10
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  // Create user object
  const userId = uuidv4();
  const user = {
    userId,
    name,
    email,
    passwordHash,
    age: parseInt(age),
    gender,
    phone,
    role: 'patient', // Default role
    createdAt: new Date().toISOString()
  };

  // Store in DynamoDB
  const command = new PutCommand({
    TableName: USERS_TABLE,
    Item: user,
    ConditionExpression: 'attribute_not_exists(userId)'
  });

  await docClient.send(command);

  return {
    userId,
    message: 'Registration successful'
  };
}

/**
 * Login user and generate JWT token
 * @param {Object} credentials - { email, password }
 * @returns {Object} - { token, userId, expiresIn }
 */
async function loginUser(credentials) {
  const { email, password } = credentials;

  // Validate required fields
  if (!email || !password) {
    throw new Error('Email and password are required');
  }

  const startTime = Date.now();

  // Get user by email
  const user = await getUserByEmail(email);
  if (!user) {
    // Return error within 200ms requirement
    const elapsed = Date.now() - startTime;
    if (elapsed < 200) {
      await new Promise(resolve => setTimeout(resolve, 200 - elapsed));
    }
    throw new Error('Invalid credentials');
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    // Return error within 200ms requirement
    const elapsed = Date.now() - startTime;
    if (elapsed < 200) {
      await new Promise(resolve => setTimeout(resolve, 200 - elapsed));
    }
    throw new Error('Invalid credentials');
  }

  // Generate JWT token with 24-hour expiration
  const token = jwt.sign(
    { 
      userId: user.userId,
      email: user.email,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  return {
    token,
    userId: user.userId,
    expiresIn: JWT_EXPIRES_IN
  };
}

/**
 * Get user by email (helper function)
 * @param {string} email
 * @returns {Object|null} - User object or null
 */
async function getUserByEmail(email) {
  // Scan for user by email (in production, use GSI for better performance)
  const command = new QueryCommand({
    TableName: USERS_TABLE,
    IndexName: 'email-index', // Assumes GSI exists, fallback to scan if not
    KeyConditionExpression: 'email = :email',
    ExpressionAttributeValues: {
      ':email': email
    }
  });

  try {
    const response = await docClient.send(command);
    return response.Items && response.Items.length > 0 ? response.Items[0] : null;
  } catch (error) {
    // If GSI doesn't exist, fall back to scan (less efficient)
    if (error.name === 'ValidationException') {
      const { ScanCommand } = require('@aws-sdk/lib-dynamodb');
      const scanCommand = new ScanCommand({
        TableName: USERS_TABLE,
        FilterExpression: 'email = :email',
        ExpressionAttributeValues: {
          ':email': email
        }
      });
      const scanResponse = await docClient.send(scanCommand);
      return scanResponse.Items && scanResponse.Items.length > 0 ? scanResponse.Items[0] : null;
    }
    throw error;
  }
}

/**
 * Get user by userId
 * @param {string} userId
 * @returns {Object|null} - User object or null
 */
async function getUserById(userId) {
  const command = new GetCommand({
    TableName: USERS_TABLE,
    Key: { userId }
  });

  const response = await docClient.send(command);
  return response.Item || null;
}

/**
 * Verify JWT token
 * @param {string} token
 * @returns {Object} - Decoded token payload
 */
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token expired');
    }
    throw new Error('Invalid token');
  }
}

module.exports = {
  registerUser,
  loginUser,
  getUserById,
  getUserByEmail,
  verifyToken
};
