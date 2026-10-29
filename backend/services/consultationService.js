const { v4: uuidv4 } = require('uuid');
const localStore = require('./localStore');
const { createNotification } = require('./notificationService');

/**
 * Get all verified doctors
 */
async function getDoctors() {
  return localStore.list('doctors', doctor => doctor.verified === true);
}

/**
 * Get doctor by ID with calculated pricing
 */
async function getDoctorById(doctorId) {
  const doctor = await localStore.findById('doctors', 'doctorId', doctorId);

  if (!doctor) {
    throw new Error('Doctor not found');
  }

  const calculatedPrice = doctor.baseRate + (doctor.experienceYears * 50);

  return {
    ...doctor,
    calculatedPrice
  };
}

/**
 * Book consultation
 */
async function bookConsultation(userId, doctorId) {
  const doctor = await getDoctorById(doctorId);

  const scheduledFor = new Date();
  scheduledFor.setDate(scheduledFor.getDate() + 1);
  scheduledFor.setHours(10, 0, 0, 0);

  const consultationId = uuidv4();
  const consultation = {
    consultationId,
    userId,
    doctorId,
    scheduledFor: scheduledFor.toISOString(),
    status: 'scheduled',
    visited: false,
    createdAt: new Date().toISOString()
  };

  await localStore.insert('consultations', consultation);

  await createNotification({
    userId,
    type: 'meeting_reminder',
    message: `Consultation scheduled with Dr. ${doctor.name} on ${scheduledFor.toLocaleDateString()} at 10:00 AM`
  });

  if (doctor.userId) {
    await createNotification({
      userId: doctor.userId,
      type: 'meeting_reminder',
      message: `Consultation scheduled with patient on ${scheduledFor.toLocaleDateString()} at 10:00 AM`
    });
  }

  return {
    consultationId,
    scheduledFor: scheduledFor.toISOString(),
    status: 'scheduled',
    doctor: {
      name: doctor.name,
      specialization: doctor.specialization
    }
  };
}

/**
 * Get consultations for a user
 */
async function getConsultations(userId) {
  return localStore.list(
    'consultations',
    consultation => consultation.userId === userId,
    { sortBy: 'createdAt', desc: true }
  );
}

/**
 * Mark consultation as visited
 */
async function markConsultationVisited(consultationId) {
  const updated = await localStore.updateById('consultations', 'consultationId', consultationId, {
    visited: true,
    visitedAt: new Date().toISOString()
  });

  if (!updated) {
    throw new Error('Consultation not found');
  }

  return { message: 'Consultation marked as visited' };
}

/**
 * Seed sample doctors
 */
async function seedDoctors() {
  const existingDoctors = await localStore.list('doctors');
  if (existingDoctors.length > 0) {
    return { message: `Doctors already seeded (${existingDoctors.length} found)` };
  }

  for (const doctor of localStore.SAMPLE_DOCTORS) {
    await localStore.insert('doctors', doctor);
  }

  return { message: `Seeded ${localStore.SAMPLE_DOCTORS.length} doctors successfully` };
}

module.exports = {
  getDoctors,
  getDoctorById,
  bookConsultation,
  getConsultations,
  markConsultationVisited,
  seedDoctors
};
