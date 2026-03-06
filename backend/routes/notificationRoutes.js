const express = require('express');
const { validateJWT } = require('../middleware/authMiddleware');
const { getNotifications, markAsRead } = require('../services/notificationService');

const router = express.Router();

/**
 * GET /api/notifications
 * Get all notifications for user
 */
router.get('/', validateJWT, async (req, res) => {
  try {
    const result = await getNotifications(req.userId);
    res.json(result);
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Failed to retrieve notifications' });
  }
});

/**
 * PUT /api/notifications/:notificationId/read
 * Mark notification as read
 */
router.put('/:notificationId/read', validateJWT, async (req, res) => {
  try {
    const { notificationId } = req.params;
    const result = await markAsRead(notificationId);
    res.json(result);
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

module.exports = router;
