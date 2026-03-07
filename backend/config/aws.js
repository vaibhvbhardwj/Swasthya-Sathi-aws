require('dotenv').config();

// AWS Config - use explicit credentials if provided (local dev), otherwise use IAM role (App Runner)
const awsConfig = {
  region: process.env.AWS_REGION || 'us-east-1'
};

// Only add explicit credentials if they exist (for local development)
if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
  awsConfig.credentials = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  };
}

const bedrockConfig = {
  modelIdSonnet: process.env.BEDROCK_MODEL_ID_SONNET || 'amazon.nova-pro-v1:0',
  modelIdHaiku: process.env.BEDROCK_MODEL_ID_HAIKU || 'amazon.nova-lite-v1:0',
  maxTokens: 2048,
  temperature: 0.7,
  timeout: 5000 // 5 seconds
};

const dynamoDBConfig = {
  tables: {
    users: process.env.DYNAMODB_USERS_TABLE || 'SwasthyaSathi-Users',
    doctors: process.env.DYNAMODB_DOCTORS_TABLE || 'SwasthyaSathi-Doctors',
    consultations: process.env.DYNAMODB_CONSULTATIONS_TABLE || 'SwasthyaSathi-Consultations',
    notifications: process.env.DYNAMODB_NOTIFICATIONS_TABLE || 'SwasthyaSathi-Notifications',
    medications: process.env.DYNAMODB_MEDICATIONS_TABLE || 'SwasthyaSathi-Medications',
    chatDrafts: process.env.DYNAMODB_CHAT_DRAFTS_TABLE || 'SwasthyaSathi-ChatDrafts'
  }
};

const textractConfig = {
  timeout: 30000 // 30 seconds for OCR processing
};

module.exports = {
  awsConfig,
  bedrockConfig,
  dynamoDBConfig,
  textractConfig
};
