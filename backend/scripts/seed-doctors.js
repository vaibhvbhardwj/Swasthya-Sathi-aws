require('dotenv').config();
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');
const { v4: uuidv4 } = require('uuid');
const { awsConfig, dynamoDBConfig } = require('../config/aws');

const client = new DynamoDBClient(awsConfig);
const docClient = DynamoDBDocumentClient.from(client);

const sampleDoctors = [
  {
    name: 'Dr. Priya Sharma',
    specialization: 'Cardiology',
    experienceYears: 15,
    rating: 4.8,
    baseRate: 500,
    verified: true
  },
  {
    name: 'Dr. Rajesh Kumar',
    specialization: 'General Medicine',
    experienceYears: 10,
    rating: 4.6,
    baseRate: 400,
    verified: true
  },
  {
    name: 'Dr. Anita Desai',
    specialization: 'Endocrinology',
    experienceYears: 12,
    rating: 4.9,
    baseRate: 600,
    verified: true
  },
  {
    name: 'Dr. Vikram Singh',
    specialization: 'Orthopedics',
    experienceYears: 8,
    rating: 4.5,
    baseRate: 450,
    verified: true
  },
  {
    name: 'Dr. Meera Patel',
    specialization: 'Dermatology',
    experienceYears: 6,
    rating: 4.7,
    baseRate: 350,
    verified: true
  }
];

async function seedDoctors() {
  try {
    console.log('🌱 Seeding doctors data...');
    
    for (const doctor of sampleDoctors) {
      const doctorData = {
        doctorId: uuidv4(),
        ...doctor,
        createdAt: new Date().toISOString()
      };
      
      const command = new PutCommand({
        TableName: dynamoDBConfig.tables.doctors,
        Item: doctorData
      });
      
      await docClient.send(command);
      console.log(`✅ Added doctor: ${doctor.name}`);
    }
    
    console.log('\n✅ Doctors seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding doctors:', error);
    throw error;
  }
}

seedDoctors();
