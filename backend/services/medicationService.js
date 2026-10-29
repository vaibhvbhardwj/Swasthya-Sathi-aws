const { v4: uuidv4 } = require('uuid');
const localStore = require('./localStore');
const { createNotification } = require('./notificationService');

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
        now.setHours(now.getHours() + 24);
      }
      break;
    default:
      now.setHours(now.getHours() + 24);
  }

  return now.toISOString();
}

function formatMedication(medication) {
  const now = new Date();
  const nextReminder = medication.nextReminderAt ? new Date(medication.nextReminderAt) : null;
  const takenHistory = medication.takenHistory || [];
  const skippedHistory = medication.skippedHistory || [];
  const lastTakenAt = medication.lastTakenAt || null;
  const todayKey = now.toISOString().slice(0, 10);

  return {
    ...medication,
    takenHistory,
    skippedHistory,
    takenCount: medication.takenCount || takenHistory.length,
    skippedCount: medication.skippedCount || skippedHistory.length,
    lastTakenAt,
    isDue: nextReminder ? nextReminder <= now : false,
    takenToday: takenHistory.some(entry => String(entry.takenAt || '').startsWith(todayKey)),
    nextReminderInMinutes: nextReminder ? Math.ceil((nextReminder - now) / 60000) : null
  };
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
    takenCount: 0,
    skippedCount: 0,
    takenHistory: [],
    skippedHistory: [],
    lastTakenAt: null,
    nextReminderAt,
    createdAt: new Date().toISOString()
  };

  await localStore.insert('medications', medication);

  return { medicationId, message: 'Medication added successfully' };
}

/**
 * Get all medications for user
 */
async function getMedications(userId) {
  const medications = await localStore.list(
    'medications',
    medication => medication.userId === userId,
    { sortBy: 'nextReminderAt', desc: false }
  );

  return medications.map(formatMedication);
}

/**
 * Delete medication
 */
async function deleteMedication(medicationId) {
  await localStore.removeById('medications', 'medicationId', medicationId);

  return { message: 'Medication deleted successfully' };
}

async function markMedicationTaken(medicationId, userId) {
  const medication = await localStore.findById('medications', 'medicationId', medicationId);

  if (!medication || medication.userId !== userId) {
    throw new Error('Medication not found');
  }

  const takenAt = new Date().toISOString();
  const nextReminderAt = calculateNextReminder(medication.frequency, medication.customInterval);
  const takenHistory = [
    ...(medication.takenHistory || []),
    { takenAt, scheduledFor: medication.nextReminderAt || null }
  ].slice(-30);

  const updated = await localStore.updateById('medications', 'medicationId', medicationId, {
    lastTakenAt: takenAt,
    nextReminderAt,
    takenHistory,
    takenCount: (medication.takenCount || 0) + 1
  });

  await createNotification({
    userId,
    type: 'system_update',
    message: `${medication.name} marked as taken. Next reminder updated.`
  });

  return {
    message: 'Medication marked as taken',
    medication: formatMedication(updated)
  };
}

async function skipMedication(medicationId, userId) {
  const medication = await localStore.findById('medications', 'medicationId', medicationId);

  if (!medication || medication.userId !== userId) {
    throw new Error('Medication not found');
  }

  const skippedAt = new Date().toISOString();
  const nextReminderAt = calculateNextReminder(medication.frequency, medication.customInterval);
  const skippedHistory = [
    ...(medication.skippedHistory || []),
    { skippedAt, scheduledFor: medication.nextReminderAt || null }
  ].slice(-30);

  const updated = await localStore.updateById('medications', 'medicationId', medicationId, {
    nextReminderAt,
    skippedHistory,
    skippedCount: (medication.skippedCount || 0) + 1
  });

  return {
    message: 'Medication skipped',
    medication: formatMedication(updated)
  };
}

/**
 * Check for due medications and send reminders.
 */
async function checkAndSendReminders() {
  const now = new Date().toISOString();
  const dueMedications = await localStore.list('medications', medication => medication.nextReminderAt <= now);

  for (const med of dueMedications) {
    await createNotification({
      userId: med.userId,
      type: 'medication_reminder',
      message: `Time to take your medication: ${med.name} (${med.dosage})`
    });

    const nextReminder = calculateNextReminder(med.frequency, med.customInterval);
    await localStore.updateById('medications', 'medicationId', med.medicationId, { nextReminderAt: nextReminder });
  }

  return { processedCount: dueMedications.length };
}

module.exports = {
  addMedication,
  getMedications,
  deleteMedication,
  markMedicationTaken,
  skipMedication,
  checkAndSendReminders
};
