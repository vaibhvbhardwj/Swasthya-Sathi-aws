const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const localStore = require('./localStore');

const JWT_SECRET = process.env.JWT_SECRET || 'local-dev-change-me';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
const SALT_ROUNDS = 10;

/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @returns {Object} - { userId, message }
 */
async function registerUser(userData) {
  const { name, email, password, age, gender, phone } = userData;

  if (!name || !email || !password || !age || !gender || !phone) {
    throw new Error('All fields are required: name, email, password, age, gender, phone');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error('Invalid email format');
  }

  if (age < 1 || age > 120) {
    throw new Error('Age must be between 1 and 120');
  }

  const phoneRegex = /^\d{10}$/;
  if (!phoneRegex.test(phone)) {
    throw new Error('Phone must be a 10-digit number');
  }

  const existingUser = await getUserByEmail(email);
  if (existingUser) {
    throw new Error('Email already registered');
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const userId = uuidv4();
  const user = {
    userId,
    name,
    email,
    passwordHash,
    age: parseInt(age),
    gender,
    phone,
    role: 'patient',
    createdAt: new Date().toISOString()
  };

  await localStore.insert('users', user);

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

  if (!email || !password) {
    throw new Error('Email and password are required');
  }

  const startTime = Date.now();
  const user = await getUserByEmail(email);
  if (!user) {
    const elapsed = Date.now() - startTime;
    if (elapsed < 200) {
      await new Promise(resolve => setTimeout(resolve, 200 - elapsed));
    }
    throw new Error('Invalid credentials');
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    const elapsed = Date.now() - startTime;
    if (elapsed < 200) {
      await new Promise(resolve => setTimeout(resolve, 200 - elapsed));
    }
    throw new Error('Invalid credentials');
  }

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
 * Get user by email
 * @param {string} email
 * @returns {Object|null} - User object or null
 */
async function getUserByEmail(email) {
  return localStore.findOne('users', user => user.email === email);
}

/**
 * Get user by userId
 * @param {string} userId
 * @returns {Object|null} - User object or null
 */
async function getUserById(userId) {
  return localStore.findById('users', 'userId', userId);
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
