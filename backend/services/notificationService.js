const { v4: uuidv4 } = require('uuid');
const localStore = require('./localStore');

/**
 * Create a notification
 */
async function createNotification({ userId, type, message }) {
  const notificationId = uuidv4();
  const notification = {
    notificationId,
    userId,
    type,
    message,
    isRead: false,
    createdAt: new Date().toISOString()
  };

  await localStore.insert('notifications', notification);

  return notificationId;
}

/**
 * Get notifications for a user
 */
async function getNotifications(userId) {
  const notifications = await localStore.list(
    'notifications',
    notification => notification.userId === userId,
    { sortBy: 'createdAt', desc: true }
  );

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
  await localStore.updateById('notifications', 'notificationId', notificationId, { isRead: true });

  return { message: 'Notification marked as read' };
}

module.exports = {
  createNotification,
  getNotifications,
  markAsRead
};
