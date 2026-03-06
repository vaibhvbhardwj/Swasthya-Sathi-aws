const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, ScanCommand, GetCommand } = require('@aws-sdk/lib-dynamodb');
const { v4: uuidv4 } = require('uuid');
const { awsConfig, dynamoDBConfig } = require('../config/aws');
const { createNotification } = require('./notificationService');

const client = new DynamoDBClient(awsConfig);
const docClient = DynamoDBDocumentClient.from(client);

const DOCTORS_TABLE = dynamoDBConfig.tables.doctors;
const CONSULTATIONS_TABLE = dynamoDBConfig.tables.consultations;

/**
 * Get all verified doctors
 */
async function getDoctors() {
  const command = new ScanCommand({
    TableName: DOCTORS_TABLE,
    FilterExpression: 'verified = :verified',
    ExpressionAttributeValues: {
      ':verified': true
    }
  });

  const response = await docClient.send(command);
  return response.Items || [];
}

/**
 * Get doctor by ID with calculated pricing
 */
async function getDoctorById(doctorId) {
  const command = new GetCommand({
    TableName: DOCTORS_TABLE,
    Key: { doctorId }
  });

  const response = await docClient.send(command);
  
  if (!response.Item) {
    throw new Error('Doctor not found');
  }

  const doctor = response.Item;
  
  // Calculate pricing: baseRate + (experienceYears × 50)
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
  // Verify doctor exists
  const doctor = await getDoctorById(doctorId);

  // Calculate scheduledFor as next day at 10:00 AM
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
    createdAt: new Date().toISOString()
  };

  const command = new PutCommand({
    TableName: CONSULTATIONS_TABLE,
    Item: consultation
  });

  await docClient.send(command);

  // Generate meeting reminder for patient
  await createNotification({
    userId,
    type: 'meeting_reminder',
    message: `Consultation scheduled with Dr. ${doctor.name} on ${scheduledFor.toLocaleDateString()} at 10:00 AM`
  });

  // Generate meeting reminder for doctor (if doctor has userId)
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
 * Seed sample doctors
 */
async function seedDoctors() {
  const sampleDoctors = [
    {
      doctorId: uuidv4(),
      name: 'Dr. Sarah Johnson',
      specialization: 'General Physician',
      experienceYears: 10,
      rating: 4.8,
      baseRate: 500,
      verified: true,
      createdAt: new Date().toISOString()
    },
    {
      doctorId: uuidv4(),
      name: 'Dr. Rajesh Kumar',
      specialization: 'Cardiologist',
      experienceYears: 15,
      rating: 4.9,
      baseRate: 800,
      verified: true,
      createdAt: new Date().toISOString()
    },
    {
      doctorId: uuidv4(),
      name: 'Dr. Emily Chen',
      specialization: 'Endocrinologist',
      experienceYears: 8,
      rating: 4.7,
      baseRate: 600,
      verified: true,
      createdAt: new Date().toISOString()
    },
    {
      doctorId: uuidv4(),
      name: 'Dr. Michael Brown',
      specialization: 'Neurologist',
      experienceYears: 12,
      rating: 4.9,
      baseRate: 750,
      verified: true,
      createdAt: new Date().toISOString()
    }
  ];

  for (const doctor of sampleDoctors) {
    const command = new PutCommand({
      TableName: DOCTORS_TABLE,
      Item: doctor
    });

    await docClient.send(command);
  }

  return { message: `Seeded ${sampleDoctors.length} doctors successfully` };
}

module.exports = {
  getDoctors,
  getDoctorById,
  bookConsultation,
  seedDoctors
};
