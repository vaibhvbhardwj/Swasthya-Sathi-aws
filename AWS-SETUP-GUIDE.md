# AWS Setup Guide for Swasthya Sathi

## Prerequisites
- AWS Account with appropriate permissions
- Node.js installed (v16 or higher)
- AWS CLI installed (optional but recommended)

## Step 1: Get AWS Credentials

### Option A: Create IAM User (Recommended for Development)

1. Go to AWS Console → IAM → Users
2. Click "Create user"
3. User name: `swasthya-sathi-dev`
4. Click "Next"
5. Select "Attach policies directly"
6. Add these policies:
   - `AmazonDynamoDBFullAccess`
   - `AmazonBedrockFullAccess`
   - `CloudWatchLogsFullAccess`
7. Click "Next" → "Create user"
8. Click on the created user → "Security credentials" tab
9. Click "Create access key"
10. Select "Application running outside AWS"
11. Copy the Access Key ID and Secret Access Key

### Option B: Use AWS CLI Configuration

If you already have AWS CLI configured:
```bash
aws configure
```

## Step 2: Enable Amazon Bedrock Models

**IMPORTANT**: This step is required before running the application!

1. Go to AWS Console → Amazon Bedrock
2. Select your region (e.g., us-east-1)
3. Click "Model access" in the left sidebar
4. Click "Manage model access" button
5. Find and enable:
   - ✅ Claude 4.6 Sonnet (flagship - recommended)
   - ✅ Claude 3.5 Haiku (fallback)
6. Click "Save changes"
7. Wait for status to change to "Access granted" (takes 2-5 minutes)

**Note**: If you don't see Bedrock in your region, switch to a supported region:
- us-east-1 (N. Virginia)
- us-west-2 (Oregon)
- eu-west-1 (Ireland)
- ap-southeast-1 (Singapore)

## Step 3: Configure Backend Environment

1. Navigate to backend folder:
```bash
cd backend
```

2. Edit the `.env` file with your AWS credentials:
```bash
# Open .env file and update these values:
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
```

3. Update JWT secret (important for production):
```bash
JWT_SECRET=your_secure_random_string_here
```

## Step 4: Install Backend Dependencies

```bash
cd backend
npm install
```

This will install:
- Express.js (API server)
- AWS SDK (DynamoDB & Bedrock)
- bcryptjs (password hashing)
- jsonwebtoken (authentication)
- Other dependencies

## Step 5: Create DynamoDB Tables

Run the setup script:
```bash
node scripts/setup-dynamodb.js
```

Expected output:
```
🔍 Checking existing tables...
📋 Existing tables: []
🔨 Creating table SwasthyaSathi-Users...
✅ Table SwasthyaSathi-Users created successfully
🔨 Creating table SwasthyaSathi-Doctors...
✅ Table SwasthyaSathi-Doctors created successfully
...
✅ DynamoDB setup complete!
```

**Verify tables created**:
```bash
aws dynamodb list-tables
```

## Step 6: Seed Sample Data (Optional)

Add sample doctors to test consultations:
```bash
node scripts/seed-doctors.js
```

Expected output:
```
🌱 Seeding doctors data...
✅ Added doctor: Dr. Priya Sharma
✅ Added doctor: Dr. Rajesh Kumar
...
✅ Doctors seeded successfully!
```

## Step 7: Test Backend Setup

Start the backend server:
```bash
npm run dev
```

Expected output:
```
Server running on port 3000
```

Test the health endpoint:
```bash
curl http://localhost:3000/health
```

Expected response:
```json
{"status":"ok"}
```

## Step 8: Configure Frontend

1. Navigate to frontend folder:
```bash
cd ../frontend
```

2. Update `config.js` if your backend runs on a different port:
```javascript
const CONFIG = {
  API_BASE_URL: 'http://localhost:3000/api',
  // ...
};
```

3. Open `index.html` in a browser or use a local server:
```bash
# Option 1: Using Python
python -m http.server 8080

# Option 2: Using Node.js http-server
npx http-server -p 8080

# Option 3: Just open the file
# Open frontend/index.html in your browser
```

## Step 9: Test the Application

1. Open browser to `http://localhost:8080` (or open index.html directly)
2. Register a new account
3. Try the Lab Analyzer with sample data
4. Test other modules

## Troubleshooting

### Issue: "Unable to locate credentials"
**Solution**: 
- Check `.env` file has correct AWS credentials
- Or configure AWS CLI: `aws configure`

### Issue: "AccessDeniedException" for Bedrock
**Solution**:
- Go to AWS Console → Bedrock → Model access
- Enable Claude 3 Sonnet and Haiku
- Wait 2-5 minutes for access to be granted

### Issue: "ResourceNotFoundException" for DynamoDB
**Solution**:
- Run: `node scripts/setup-dynamodb.js`
- Verify tables exist: `aws dynamodb list-tables`

### Issue: "ValidationException" for Bedrock
**Solution**:
- Check model IDs in `.env` match enabled models
- Verify region supports Bedrock
- Ensure model access is granted

### Issue: CORS errors in browser
**Solution**:
- Backend includes CORS middleware
- Make sure backend is running on port 3000
- Check `API_BASE_URL` in frontend/config.js

## AWS Cost Considerations

### DynamoDB
- Using provisioned capacity (5 RCU/WCU per table)
- Estimated cost: ~$3-5/month for development
- Consider switching to on-demand for production

### Bedrock
- Pay per token usage
- Claude 4.6 Sonnet: ~$4 per 1M input tokens, ~$20 per 1M output tokens
- Claude 3.5 Haiku: ~$1 per 1M input tokens, ~$5 per 1M output tokens
- Estimated cost: $10-30/month depending on usage

### Total Estimated Monthly Cost
- Development: $10-30/month
- Production: Varies based on traffic

## Security Best Practices

1. **Never commit `.env` file** - It's in `.gitignore`
2. **Rotate AWS credentials** regularly
3. **Use IAM roles** instead of access keys in production
4. **Enable MFA** on AWS account
5. **Use AWS Secrets Manager** for production credentials
6. **Restrict IAM permissions** to minimum required
7. **Enable CloudWatch logging** for monitoring
8. **Use HTTPS** in production (not HTTP)

## Next Steps

1. ✅ AWS credentials configured
2. ✅ Bedrock models enabled
3. ✅ DynamoDB tables created
4. ✅ Backend running
5. ✅ Frontend accessible
6. 🚀 Start implementing features from tasks.md!

## Quick Reference Commands

```bash
# Start backend
cd backend && npm run dev

# Create tables
cd backend && node scripts/setup-dynamodb.js

# Seed doctors
cd backend && node scripts/seed-doctors.js

# List DynamoDB tables
aws dynamodb list-tables

# Check Bedrock models
aws bedrock list-foundation-models --region us-east-1

# Start frontend (if using http-server)
cd frontend && npx http-server -p 8080
```

## Support

If you encounter issues:
1. Check AWS Console for service status
2. Review CloudWatch logs for errors
3. Verify IAM permissions
4. Check AWS region supports all services
5. Ensure Bedrock model access is granted
