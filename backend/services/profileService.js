const bcrypt = require('bcryptjs');
const localStore = require('./localStore');

/**
 * Get user profile by userId
 */
async function getProfile(userId) {
  const user = await localStore.findById('users', 'userId', userId);

  if (!user) {
    throw new Error('User not found');
  }

  const { passwordHash, ...profile } = user;
  return profile;
}

/**
 * Update user profile
 */
async function updateProfile(userId, updates) {
  const { name, email, age, gender, phone, password } = updates;

  if (email) {
    const existingUser = await getUserByEmail(email);
    if (existingUser && existingUser.userId !== userId) {
      throw new Error('Email already in use by another account');
    }
  }

  const fieldsToUpdate = {};

  if (name) {
    fieldsToUpdate.name = name;
  }

  if (email) {
    fieldsToUpdate.email = email;
  }

  if (age) {
    fieldsToUpdate.age = parseInt(age);
  }

  if (gender) {
    fieldsToUpdate.gender = gender;
  }

  if (phone) {
    fieldsToUpdate.phone = phone;
  }

  if (password) {
    fieldsToUpdate.passwordHash = await bcrypt.hash(password, 10);
  }

  if (Object.keys(fieldsToUpdate).length === 0) {
    throw new Error('No fields to update');
  }

  const updatedUser = await localStore.updateById('users', 'userId', userId, fieldsToUpdate);
  if (!updatedUser) {
    throw new Error('User not found');
  }

  const { passwordHash, ...updatedProfile } = updatedUser;

  return updatedProfile;
}

/**
 * Helper: Get user by email
 */
async function getUserByEmail(email) {
  return localStore.findOne('users', user => user.email === email);
}

module.exports = {
  getProfile,
  updateProfile
};
