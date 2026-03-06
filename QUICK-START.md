# ⚡ Quick Start Guide

Get Swasthya Sathi running in 10 minutes!

## 🎯 Prerequisites Check

```bash
# Check Node.js (need v16+)
node --version

# Check npm
npm --version
```

## 🚀 5-Step Setup

### Step 1: Run Setup Script (2 min)

**Windows:**
```bash
setup.bat
```

**Mac/Linux:**
```bash
chmod +x setup.sh
./setup.sh
```

This installs all dependencies automatically.

### Step 2: Configure AWS (3 min)

1. **Get AWS Credentials:**
   - Go to AWS Console → IAM → Users → Create user
   - Attach policies: `AmazonDynamoDBFullAccess`, `AmazonBedrockFullAccess`
   - Create access key → Copy credentials

2. **Update .env file:**
   ```bash
   # Edit backend/.env
   AWS_REGION=us-east-1
   AWS_ACCESS_KEY_ID=AKIA...your_key
   AWS_SECRET_ACCESS_KEY=your_secret_key
   ```

3. **Enable Bedrock Models:**
   - AWS Console → Bedrock → Model access
   - Enable: Claude 4.6 Sonnet + Claude 3.5 Haiku
   - Wait 2-5 minutes

### Step 3: Create Database (1 min)

```bash
cd backend
node scripts/setup-dynamodb.js
node scripts/seed-doctors.js
```

### Step 4: Verify Setup (1 min)

```bash
cd backend
node scripts/verify-aws-setup.js
```

Expected output:
```
✅ All checks passed! Your AWS setup is ready.
```

### Step 5: Start Application (1 min)

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
# Just open index.html in your browser
# Or use: npx http-server -p 8080
```

## 🎉 You're Ready!

Open `http://localhost:8080` or `frontend/index.html`

1. Register a new account
2. Try the Lab Analyzer with this sample:
   ```
   HbA1c: 6.5% (Normal: 4.0-5.6%)
   LDL: 150 mg/dL (Normal: <100 mg/dL)
   HDL: 45 mg/dL (Normal: >40 mg/dL)
   ```

## 🐛 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| "Unable to locate credentials" | Add AWS credentials to `backend/.env` |
| "AccessDeniedException" (Bedrock) | Enable models in AWS Console, wait 5 min |
| "ResourceNotFoundException" (DynamoDB) | Run `node scripts/setup-dynamodb.js` |
| Backend won't start | Check `.env` exists, run `npm install` |
| Frontend errors | Make sure backend is running on port 3000 |

## 📋 Command Cheat Sheet

```bash
# Setup
npm install                              # Install root deps
cd backend && npm install                # Install backend deps
node backend/scripts/setup-dynamodb.js   # Create tables
node backend/scripts/seed-doctors.js     # Add sample data

# Verify
node backend/scripts/verify-aws-setup.js # Check everything

# Run
cd backend && npm run dev                # Start backend
cd frontend && npx http-server -p 8080   # Start frontend

# AWS CLI (optional)
aws dynamodb list-tables                 # List tables
aws bedrock list-foundation-models       # List models
```

## 📚 Need More Help?

- **Detailed Setup**: [AWS-SETUP-GUIDE.md](./AWS-SETUP-GUIDE.md)
- **Step-by-Step**: [SETUP-CHECKLIST.md](./SETUP-CHECKLIST.md)
- **Full Docs**: [README.md](./README.md)
- **Implementation**: [tasks.md](./.kiro/specs/swasthya-sathi-healthcare-platform/tasks.md)

## 🎯 What's Next?

After setup is complete:

1. ✅ Environment is ready
2. 📖 Read `tasks.md` for implementation plan
3. 🔨 Start building features (24-hour timeline)
4. 🧪 Test each module as you build
5. 🚀 Deploy to AWS (EC2 + S3)

---

**Estimated Setup Time**: 10 minutes  
**Estimated Build Time**: 24 hours (following tasks.md)

Good luck! 🚀
