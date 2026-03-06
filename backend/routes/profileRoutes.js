const express = require('express');
const { validateJWT } = require('../middleware/authMiddleware');
const { getProfile, updateProfile } = require('../services/profileService');

const router = express.Router();

/**
 * GET /api/profile
 * Get user profile (requires JWT)
 */
router.get('/', validateJWT, async (req, res) => {
  try {
    const profile = await getProfile(req.userId);
    res.json(profile);
  } catch (error) {
    console.error('Get profile error:', error);
    
    if (error.message === 'User not found') {
      return res.status(404).json({ error: error.message });
    }
    
    res.status(500).json({ error: 'Failed to retrieve profile' });
  }
});

/**
 * PUT /api/profile
 * Update user profile (requires JWT)
 */
router.put('/', validateJWT, async (req, res) => {
  try {
    const { name, email, age, gender, phone, password } = req.body;

    const updatedProfile = await updateProfile(req.userId, {
      name,
      email,
      age,
      gender,
      phone,
      password
    });

    res.json({
      message: 'Profile updated successfully',
      profile: updatedProfile
    });
  } catch (error) {
    console.error('Update profile error:', error);
    
    if (error.message.includes('already in use')) {
      return res.status(409).json({ error: error.message });
    }
    
    if (error.message === 'No fields to update') {
      return res.status(400).json({ error: error.message });
    }
    
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

module.exports = router;
