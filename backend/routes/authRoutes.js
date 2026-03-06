const express = require('express');
const { registerUser, loginUser } = require('../services/authService');

const router = express.Router();

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, age, gender, phone } = req.body;

    const result = await registerUser({
      name,
      email,
      password,
      age,
      gender,
      phone
    });

    res.status(201).json(result);
  } catch (error) {
    console.error('Registration error:', error);
    
    // Return appropriate status codes
    if (error.message.includes('already registered')) {
      return res.status(409).json({ error: error.message });
    }
    if (error.message.includes('required') || 
        error.message.includes('Invalid') || 
        error.message.includes('must be')) {
      return res.status(400).json({ error: error.message });
    }
    
    res.status(500).json({ 
      error: 'Registration failed',
      message: error.message 
    });
  }
});

/**
 * POST /api/auth/login
 * Login user and return JWT token
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await loginUser({ email, password });

    res.status(200).json(result);
  } catch (error) {
    console.error('Login error:', error);
    
    // Return 401 for authentication errors
    if (error.message.includes('Invalid credentials') || 
        error.message.includes('required')) {
      return res.status(401).json({ 
        error: 'Authentication failed',
        message: error.message 
      });
    }
    
    res.status(500).json({ 
      error: 'Login failed',
      message: error.message 
    });
  }
});

module.exports = router;
