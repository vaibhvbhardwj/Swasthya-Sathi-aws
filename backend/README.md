# Swasthya Sathi Backend

## Setup Instructions

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure AWS Credentials

You have two options:

#### Option A: Using Environment Variables (Recommended for Development)
Edit the `.env` file and add your AWS credentials:
```
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
```

#### Option B: Using AWS CLI Configuration
If you have AWS CLI installed, configure it:
```bash
aws configure
```
Then remove the AWS credentials from `.env` file (the SDK will use CLI credentials automatically).

### 3. Enable Amazon Bedrock Models

Before running the application, you need to enable Claude models in Amazon Bedrock:

1. Go to AWS Console → Amazon Bedrock
2. Navigate to "Model access" in the left sidebar
3. Click "Manage model access"
4. Enable the following models:
   - Claude 4.6 Sonnet (flagship - recommended)
   - Claude 3.5 Haiku (for fallback)
5. Wait for access to be granted (usually takes a few minutes)

### 4. Create DynamoDB Tables

Run the setup script to create all required DynamoDB tables:
```bash
node scripts/setup-dynamodb.js
```

This will create the following tables:
- SwasthyaSathi-Users
- SwasthyaSathi-Doctors
- SwasthyaSathi-Consultations
- SwasthyaSathi-Notifications
- SwasthyaSathi-Medications
- SwasthyaSathi-ChatDrafts

### 5. Seed Sample Data (Optional)

Add sample doctors to the database:
```bash
node scripts/seed-doctors.js
```

### 6. Start the Server

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will start on `http://localhost:3000`

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| AWS_REGION | AWS region for services | us-east-1 |
| AWS_ACCESS_KEY_ID | AWS access key | - |
| AWS_SECRET_ACCESS_KEY | AWS secret key | - |
| BEDROCK_MODEL_ID_SONNET | Claude 4.6 Sonnet model ID | us.anthropic.claude-4-6-sonnet-20250514-v1:0 |
| BEDROCK_MODEL_ID_HAIKU | Claude 3.5 Haiku model ID | anthropic.claude-3-5-haiku-20241022-v1:0 |
| JWT_SECRET | Secret key for JWT tokens | - |
| JWT_EXPIRES_IN | JWT token expiration | 24h |
| PORT | Server port | 3000 |

**Note**: You can also use Claude 4.6 Sonnet (flagship) by setting:
```
BEDROCK_MODEL_ID_SONNET=us.anthropic.claude-4-6-sonnet-20250514-v1:0
```
Claude 3.7 Sonnet is recommended for stability, while Claude 4.6 Sonnet offers cutting-edge performance.

## Testing AWS Connection

You can test your AWS setup by checking:
1. DynamoDB tables are created: `aws dynamodb list-tables`
2. Bedrock access: Check AWS Console → Bedrock → Model access

## Troubleshooting

### "Unable to locate credentials"
- Make sure you've configured AWS credentials in `.env` or via AWS CLI
- Verify credentials have correct permissions for DynamoDB and Bedrock

### "ResourceNotFoundException" for DynamoDB
- Run the setup script: `node scripts/setup-dynamodb.js`
- Check table names match in `.env` file

### Bedrock "AccessDeniedException"
- Enable model access in AWS Console → Bedrock → Model access
- Wait a few minutes for access to be granted
- Verify your AWS region supports Bedrock (us-east-1, us-west-2, etc.)

### "ValidationException" for Bedrock
- Check model IDs are correct in `.env`
- Ensure you're using the correct model version
