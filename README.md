# 🏥 Swasthya Sathi - AI-Powered Healthcare Platform

A cloud-native healthcare support platform that combines AI-powered medical information assistance with strict clinical oversight through a Doctor-in-the-Loop system.

> **Development Note**: This project was developed with assistance from [Kiro AI](https://kiro.ai). The core idea, architecture decisions, and problem-solving were done by the project creator, while Kiro assisted with implementation and debugging.

> **Current local setup**: The active runtime no longer requires AWS. It uses local JSON storage and Ollama/Llama 3. See [LOCAL-RENDER-SETUP.md](./LOCAL-RENDER-SETUP.md) for the up-to-date local and Render path.

## 🎯 Features

- **🔬 Lab Report Analyzer**: AI-powered explanation of medical lab reports
- **💬 AI Health Chat**: Safe health Q&A with mandatory clinician approval
- **💊 Medication Tracker**: Manage medications with automated reminders
- **👨‍⚕️ Doctor Consultations**: Schedule appointments with verified doctors
- **🔔 Notifications**: Timely alerts for medications and appointments
- **👤 Profile Management**: Secure user account management

## 🏗️ Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Node.js, Express.js
- **Database**: Amazon DynamoDB (7 tables)
- **AI**: Amazon Bedrock (Nova Pro & Nova Lite)
- **Auth**: JWT with bcryptjs
- **Infrastructure**: Terraform, Docker, AWS App Runner
- **Monitoring**: Amazon CloudWatch
- **Deployment**: AWS App Runner with ECR

## 📋 Prerequisites

- Node.js v16 or higher
- AWS Account with appropriate permissions
- AWS CLI (optional but recommended)

## 🚀 Quick Start

### Local Development

#### 1. Clone and Install

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

#### 2. Configure AWS Credentials

```bash
# Option 1: Use AWS CLI
aws configure

# Option 2: Create backend/.env file
cp backend/.env.example backend/.env
# Edit backend/.env with your AWS credentials
```

#### 3. Setup Database

```bash
cd backend

# Create all DynamoDB tables (including LabReports)
node scripts/setup-dynamodb.js

# Seed sample doctors (optional)
node scripts/seed-doctors.js
```

#### 4. Verify Setup

```bash
cd backend
node scripts/verify-aws-setup.js
```

#### 5. Start the Application

**Backend:**
```bash
cd backend
npm run dev
```

**Frontend:**
Open `frontend/index.html` in your browser or use:
```bash
cd frontend
npx http-server -p 8080
```

Visit: `http://localhost:8080`

---

### Production Deployment (AWS App Runner)

#### Prerequisites
- Docker installed
- AWS CLI configured
- Terraform installed
- IAM user with required permissions (see [add-iam-permissions.bat](./add-iam-permissions.bat))

#### Deploy to AWS

1. **Configure Terraform variables:**
```bash
cd terraform
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your settings
```

2. **Create DynamoDB tables:**
```bash
node backend/scripts/setup-dynamodb.js
# OR use AWS CLI
.\create-lab-reports-table.bat
```

3. **Initialize and apply Terraform:**
```bash
cd terraform
terraform init
terraform apply
```

4. **Build and deploy:**
```bash
# Windows
.\deploy.bat

# Linux/Mac
chmod +x deploy.sh
./deploy.sh
```

5. **Monitor deployment:**
```bash
.\wait-for-deployment.bat
```

Your application will be available at the App Runner URL (shown in Terraform outputs).

#### Deployment Files
- `Dockerfile` - Multi-stage Docker build
- `terraform/main.tf` - Infrastructure as Code
- `deploy.bat` / `deploy.sh` - Deployment scripts
- `AWS-DEPLOYMENT-GUIDE.md` - Detailed deployment guide

## 📁 Project Structure

```
swasthya-sathi/
├── backend/
│   ├── config/
│   │   ├── aws.js              # AWS SDK configuration
│   │   └── s3-bucket.json      # S3 bucket config
│   ├── middleware/
│   │   └── authMiddleware.js   # JWT authentication
│   ├── routes/
│   │   ├── authRoutes.js       # Auth endpoints
│   │   ├── labReportRoutes.js  # Lab report analysis
│   │   ├── chatRoutes.js       # AI chat with doctor review
│   │   ├── profileRoutes.js    # User profile management
│   │   ├── medicationRoutes.js # Medication tracking
│   │   ├── consultationRoutes.js # Doctor consultations
│   │   └── notificationRoutes.js # Notifications
│   ├── services/
│   │   ├── aiEngineService.js  # Amazon Bedrock integration
│   │   ├── authService.js      # Authentication logic
│   │   ├── labReportService.js # Lab report parsing
│   │   └── ...                 # Other services
│   ├── scripts/
│   │   ├── setup-dynamodb.js   # Create all DynamoDB tables
│   │   ├── seed-doctors.js     # Seed sample data
│   │   └── verify-aws-setup.js # Verify AWS configuration
│   ├── .env.example            # Environment template
│   ├── package.json
│   └── server.js               # Express server
├── frontend/
│   ├── index.html              # Landing page
│   ├── auth.html               # Login/Register
│   ├── dashboard.html          # Main dashboard
│   ├── auth.js                 # Auth logic
│   ├── dashboard.js            # Dashboard logic
│   ├── config.js               # API configuration
│   └── styles.css              # Styles
├── terraform/
│   ├── main.tf                 # Infrastructure definition
│   ├── variables.tf            # Terraform variables
│   ├── outputs.tf              # Terraform outputs
│   └── terraform.tfvars.example # Configuration template
├── .kiro/
│   └── specs/
│       └── swasthya-sathi-healthcare-platform/
│           ├── requirements.md  # Requirements document
│           ├── design.md        # Design document
│           └── tasks.md         # Implementation tasks
├── Dockerfile                   # Multi-stage Docker build
├── .dockerignore               # Docker ignore rules
├── deploy.bat / deploy.sh      # Deployment scripts
├── AWS-DEPLOYMENT-GUIDE.md     # Deployment documentation
├── AWS-CREDENTIALS-SETUP.md    # Credentials setup guide
├── package.json                # Root dependencies
└── README.md                   # This file
```

## 🔐 Security Features

- JWT-based authentication
- Password hashing with bcryptjs
- Protected API endpoints
- AI guardrails for safe responses
- Doctor-in-the-Loop for health advice
- IAM role-based AWS access

## 📊 DynamoDB Tables

The application uses 7 DynamoDB tables:
- `SwasthyaSathi-Users` - User accounts and profiles
- `SwasthyaSathi-Doctors` - Doctor profiles and specializations
- `SwasthyaSathi-Consultations` - Appointment records
- `SwasthyaSathi-Notifications` - User notifications
- `SwasthyaSathi-Medications` - Medication tracking and reminders
- `SwasthyaSathi-ChatDrafts` - AI chat drafts pending clinician review
- `LabReports` - Lab report analysis history

## 🧠 AI Safety

All AI responses include:
- **Guardrails**: Prevent diagnosis, prescriptions, or unsafe advice
- **Doctor-in-the-Loop**: Clinician approval required for health advice
- **Safety Disclaimers**: Clear notices that AI is not medical advice
- **Fallback**: Automatic switch from Nova Pro to Nova Lite if needed
- **Amazon Bedrock**: Uses Amazon Nova Pro (primary) and Nova Lite (fallback)

## 🛠️ Development

### Environment Variables

Key variables in `backend/.env`:
```env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_key          # Optional for local dev
AWS_SECRET_ACCESS_KEY=your_secret   # Optional for local dev
JWT_SECRET=your_jwt_secret
PORT=3000
BEDROCK_MODEL_ID_SONNET=amazon.nova-pro-v1:0
BEDROCK_MODEL_ID_HAIKU=amazon.nova-lite-v1:0
```

**Note**: In production (App Runner), AWS credentials are provided via IAM roles automatically.

### Running Tests

```bash
cd backend
npm test
```

### Local Development Tips

1. Use AWS CLI for credentials: `aws configure`
2. Enable Bedrock models in AWS Console
3. Run `verify-aws-setup.js` to check configuration
4. Check CloudWatch logs for debugging

## 📖 Documentation

- [AWS Deployment Guide](./AWS-DEPLOYMENT-GUIDE.md) - Complete deployment walkthrough
- [AWS Credentials Setup](./AWS-CREDENTIALS-SETUP.md) - Credentials configuration
- [Deployment Quick Start](./DEPLOYMENT-QUICK-START.md) - Quick deployment guide
- [Backend README](./backend/README.md) - Backend-specific documentation
- [Requirements](./kiro/specs/swasthya-sathi-healthcare-platform/requirements.md) - System requirements
- [Design](./kiro/specs/swasthya-sathi-healthcare-platform/design.md) - Architecture and design
- [Tasks](./kiro/specs/swasthya-sathi-healthcare-platform/tasks.md) - Implementation plan

## 🐛 Troubleshooting

### Local Development

**"Unable to locate credentials"**
- Run `aws configure` to set up AWS CLI
- Or create `backend/.env` with AWS credentials

**"AccessDeniedException" for Bedrock**
- Enable Amazon Nova models in AWS Console → Bedrock → Model access
- Wait 2-5 minutes for access to be granted

**"ResourceNotFoundException" for DynamoDB**
- Run: `node backend/scripts/setup-dynamodb.js`
- Verify tables exist: `aws dynamodb list-tables`

### Production Deployment

**"Can't start deployment - not in RUNNING state"**
- Wait for current deployment to complete
- Run: `.\wait-for-deployment.bat` to monitor status

**"No valid credential sources found" (Terraform)**
- Run: `aws configure` to set up AWS CLI credentials
- See: [AWS-CREDENTIALS-SETUP.md](./AWS-CREDENTIALS-SETUP.md)

**"AccessDeniedException" (ECR/IAM)**
- Add required IAM permissions: `.\add-iam-permissions.bat`
- Required policies: ECR Full Access, App Runner Full Access, IAM Full Access

**500 errors in production**
- Check CloudWatch logs: `.\check-logs.bat`
- Verify IAM role has DynamoDB and Bedrock permissions
- Ensure all 7 DynamoDB tables exist

See [AWS-DEPLOYMENT-GUIDE.md](./AWS-DEPLOYMENT-GUIDE.md) for detailed troubleshooting.

## 💰 AWS Costs

Estimated monthly costs:

**Development/Testing:**
- DynamoDB: $3-5 (on-demand pricing)
- Bedrock (Nova): $5-20 (usage-based)
- App Runner: $5-10 (minimal usage)
- **Total: ~$15-35/month**

**Production (moderate traffic):**
- DynamoDB: $10-30
- Bedrock (Nova): $50-200
- App Runner: $25-50
- CloudWatch: $5-10
- **Total: ~$90-290/month**

All services use pay-as-you-go pricing. Costs scale with usage.

## 🗺️ Roadmap

- [x] Core healthcare features (chat, lab reports, medications)
- [x] Doctor-in-the-Loop system
- [x] AWS App Runner deployment
- [x] Terraform infrastructure as code
- [ ] Bedrock Knowledge Base (RAG) for medical information
- [ ] S3-based report storage with presigned URLs
- [ ] Real-time reminders via EventBridge
- [ ] Multi-tenant architecture
- [ ] Payment integration (Stripe/Razorpay)
- [ ] HIPAA compliance enhancements
- [ ] Mobile app (React Native)

## 📝 License

MIT License - This is a demo/educational project for the Swasthya Sathi healthcare platform.

## 🤝 Contributing

This is a spec-driven development project. See `.kiro/specs/swasthya-sathi-healthcare-platform/tasks.md` for implementation tasks.

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 👨‍💻 Development Credits

- **Project Creator**: [Vaibhav](https://vaughav.netlify.app/) - Original idea, architecture, and problem-solving 
- **Development Assistant**: [Kiro AI](https://kiro.ai) - Implementation and debugging support

## 📞 Support

For issues:
1. Check [Troubleshooting](#-troubleshooting) section
2. Review AWS Console for service status
3. Check CloudWatch logs: `.\check-logs.bat`
4. Verify IAM permissions
5. Run `node backend/scripts/verify-aws-setup.js`

---

Built with ❤️ using AWS, Node.js, and AI | Developed with [Kiro AI](https://kiro.ai)
