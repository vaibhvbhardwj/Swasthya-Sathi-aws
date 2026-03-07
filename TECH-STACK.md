# 🏥 Swasthya Sathi - Complete Tech Stack

## 📱 Frontend

### Core Technologies
- **HTML5** - Semantic markup and structure
- **CSS3** - Styling and responsive design
- **Vanilla JavaScript (ES6+)** - Client-side logic and interactivity

### Frontend Features
- Single Page Application (SPA) architecture
- JWT token-based authentication
- Dynamic API configuration (localhost vs production)
- Responsive design for mobile and desktop

### Key Files
- `index.html` - Landing page
- `auth.html` - Login/Register page
- `dashboard.html` - Main application dashboard
- `auth.js` - Authentication logic
- `dashboard.js` - Dashboard functionality
- `config.js` - API endpoint configuration
- `styles.css` - Application styling

---

## 🔧 Backend

### Runtime & Framework
- **Node.js v18+** - JavaScript runtime
- **Express.js** - Web application framework

### Core Dependencies
```json
{
  "express": "Web server framework",
  "cors": "Cross-Origin Resource Sharing",
  "helmet": "Security headers",
  "dotenv": "Environment variable management",
  "bcryptjs": "Password hashing",
  "jsonwebtoken": "JWT authentication",
  "uuid": "Unique ID generation"
}
```

### AWS SDK v3 (Modular)
```json
{
  "@aws-sdk/client-dynamodb": "DynamoDB client",
  "@aws-sdk/lib-dynamodb": "DynamoDB document client",
  "@aws-sdk/client-bedrock-runtime": "Amazon Bedrock AI client",
  "@aws-sdk/client-s3": "S3 storage client"
}
```

### Backend Architecture
- RESTful API design
- Middleware-based authentication
- Service layer pattern
- Route-based organization

### Key Services
- `aiEngineService.js` - Amazon Bedrock integration
- `authService.js` - Authentication & JWT
- `labReportService.js` - Lab report parsing & analysis
- `chatService.js` - AI chat with doctor review
- `profileService.js` - User profile management
- `medicationService.js` - Medication tracking
- `consultationService.js` - Doctor consultations
- `notificationService.js` - User notifications

---

## 🗄️ Database

### Primary Database
- **Amazon DynamoDB** - NoSQL database (serverless)

### Database Tables (7 Total)
1. **SwasthyaSathi-Users**
   - Primary Key: `userId`
   - GSI: `email-index` on `email`
   - Purpose: User accounts and profiles

2. **SwasthyaSathi-Doctors**
   - Primary Key: `doctorId`
   - Purpose: Doctor profiles and specializations

3. **SwasthyaSathi-Consultations**
   - Primary Key: `consultationId`
   - GSI: `userId-index` on `userId`
   - Purpose: Appointment records

4. **SwasthyaSathi-Notifications**
   - Primary Key: `notificationId`
   - GSI: `userId-index` on `userId`
   - Purpose: User notifications

5. **SwasthyaSathi-Medications**
   - Primary Key: `medicationId`
   - GSI: `userId-index` on `userId`
   - Purpose: Medication tracking

6. **SwasthyaSathi-ChatDrafts**
   - Primary Key: `draftId`
   - GSI: `userId-index` on `userId`
   - Purpose: AI chat drafts for clinician review

7. **LabReports**
   - Primary Key: `reportId`
   - GSI: `UserIdIndex` on `userId`
   - Purpose: Lab report analysis history

### Database Features
- On-demand billing mode
- Global Secondary Indexes (GSI) for efficient queries
- Automatic scaling
- Point-in-time recovery ready

---

## 🤖 AI & Machine Learning

### AI Platform
- **Amazon Bedrock** - Fully managed AI service

### AI Models
1. **Amazon Nova Pro (amazon.nova-pro-v1:0)**
   - Primary model for complex tasks
   - Lab report analysis
   - Detailed health explanations

2. **Amazon Nova Lite (amazon.nova-lite-v1:0)**
   - Fallback model
   - Faster responses
   - Cost-effective for simple queries

### AI Features
- Guardrails for safe medical responses
- Doctor-in-the-Loop approval system
- Automatic fallback mechanism
- Safety disclaimers on all responses

---

## 🔐 Security & Authentication

### Authentication
- **JWT (JSON Web Tokens)** - Stateless authentication
- **bcryptjs** - Password hashing (10 rounds)

### Security Middleware
- **Helmet.js** - HTTP security headers
- **CORS** - Cross-origin resource sharing
- **Express rate limiting** - API protection

### AWS Security
- **IAM Roles** - Service-to-service authentication
- **IAM Policies** - Fine-grained permissions
- **Security Groups** - Network-level security

---

## ☁️ Cloud Infrastructure (AWS)

### Compute
- **AWS App Runner** - Fully managed container service
  - Auto-scaling
  - Load balancing
  - HTTPS by default
  - Health checks

### Container
- **Docker** - Containerization
  - Multi-stage builds
  - Alpine Linux base (lightweight)
  - Production-optimized

### Container Registry
- **Amazon ECR** - Docker image storage
  - Private repository
  - Image scanning
  - Lifecycle policies

### Monitoring & Logging
- **Amazon CloudWatch**
  - Application logs
  - Performance metrics
  - Custom dashboards
  - Log retention (7 days)

### Storage (Future)
- **Amazon S3** - Object storage for reports

---

## 🏗️ Infrastructure as Code

### IaC Tool
- **Terraform v1.0+** - Infrastructure provisioning

### Terraform Resources
```hcl
- aws_ecr_repository          # Docker registry
- aws_iam_role                # IAM roles (2)
- aws_iam_policy              # Custom policies (2)
- aws_iam_role_policy_attachment # Policy attachments
- aws_apprunner_service       # App Runner service
- aws_cloudwatch_log_group    # Logging
- data sources for DynamoDB tables
```

### Terraform Features
- State management
- Resource dependencies
- Output values
- Variable management

---

## 🚀 Deployment & DevOps

### Containerization
- **Docker**
  - Multi-stage builds
  - Node.js 18 Alpine
  - Non-root user (security)
  - Health checks

### CI/CD (Manual)
- Build scripts (`deploy.bat`, `deploy.sh`)
- Automated image building
- ECR push automation
- App Runner deployment triggers

### Deployment Process
1. Docker image build
2. ECR authentication
3. Image push to ECR
4. App Runner auto-deployment
5. Health check validation

### Deployment Scripts
- `deploy.bat` - Windows deployment
- `deploy.sh` - Linux/Mac deployment
- `wait-for-deployment.bat` - Deployment monitoring
- `check-logs.bat` - Log viewing
- `diagnose-apprunner.bat` - Diagnostics

---

## 🛠️ Development Tools

### Version Control
- **Git** - Source control
- **GitHub** - Repository hosting

### Development Environment
- **Node.js v18+** - Runtime
- **npm** - Package manager
- **AWS CLI** - AWS management
- **Terraform CLI** - Infrastructure management
- **Docker Desktop** - Container development

### Code Organization
- **Spec-driven development** - Structured planning
- **Service layer pattern** - Clean architecture
- **Route-based organization** - Modular endpoints
- **Middleware pattern** - Reusable logic

### Development Scripts
```json
{
  "dev": "nodemon server.js",
  "start": "node server.js",
  "test": "jest"
}
```

---

## 📦 Package Management

### Root Dependencies
```json
{
  "@aws-sdk/client-dynamodb": "^3.x",
  "@aws-sdk/lib-dynamodb": "^3.x",
  "@aws-sdk/client-bedrock-runtime": "^3.x"
}
```

### Backend Dependencies
```json
{
  "express": "^4.18.x",
  "cors": "^2.8.x",
  "helmet": "^7.x",
  "dotenv": "^16.x",
  "bcryptjs": "^2.4.x",
  "jsonwebtoken": "^9.x",
  "uuid": "^9.x"
}
```

### Dev Dependencies
```json
{
  "nodemon": "^3.x",
  "jest": "^29.x"
}
```

---

## 🌐 Networking & DNS

### Current Setup
- **App Runner URL** - Auto-generated HTTPS endpoint
- **CloudFront** (Future) - CDN for static assets
- **Route 53** (Future) - Custom domain management

---

## 📊 Monitoring & Observability

### Logging
- **CloudWatch Logs** - Centralized logging
- **Log Groups** - `/aws/apprunner/swasthya-sathi`
- **Log Streams** - Per-instance logs

### Metrics (Available)
- Request count
- Response time
- Error rates
- CPU/Memory usage
- Active connections

---

## 🔧 Configuration Management

### Environment Variables
```env
# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=xxx          # Local dev only
AWS_SECRET_ACCESS_KEY=xxx      # Local dev only

# Application
PORT=3000
NODE_ENV=production
JWT_SECRET=xxx

# AI Models
BEDROCK_MODEL_ID_SONNET=amazon.nova-pro-v1:0
BEDROCK_MODEL_ID_HAIKU=amazon.nova-lite-v1:0

# DynamoDB Tables
DYNAMODB_USERS_TABLE=SwasthyaSathi-Users
DYNAMODB_DOCTORS_TABLE=SwasthyaSathi-Doctors
DYNAMODB_CONSULTATIONS_TABLE=SwasthyaSathi-Consultations
DYNAMODB_NOTIFICATIONS_TABLE=SwasthyaSathi-Notifications
DYNAMODB_MEDICATIONS_TABLE=SwasthyaSathi-Medications
DYNAMODB_CHAT_DRAFTS_TABLE=SwasthyaSathi-ChatDrafts
```

---

## 📋 System Requirements

### Development Environment
- **OS**: Windows 10+, macOS 10.15+, or Linux
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **Docker**: v20.10.0 or higher
- **Terraform**: v1.0.0 or higher
- **AWS CLI**: v2.0.0 or higher
- **Git**: v2.30.0 or higher

### AWS Requirements
- **AWS Account** with billing enabled
- **IAM User** with permissions:
  - DynamoDB Full Access
  - Bedrock Full Access
  - ECR Full Access
  - App Runner Full Access
  - IAM Full Access
  - CloudWatch Logs Full Access
- **Bedrock Model Access**:
  - Amazon Nova Pro enabled
  - Amazon Nova Lite enabled

### Local Development
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 2GB free space
- **Network**: Internet connection for AWS services

### Production (AWS)
- **App Runner**: 1 vCPU, 2GB RAM (configurable)
- **DynamoDB**: On-demand capacity
- **Bedrock**: Pay-per-use
- **ECR**: Storage for Docker images

---

## 💰 Cost Breakdown

### Development (~$15-35/month)
- DynamoDB: $3-5
- Bedrock: $5-20
- App Runner: $5-10
- CloudWatch: $2-5

### Production (~$90-290/month)
- DynamoDB: $10-30
- Bedrock: $50-200
- App Runner: $25-50
- CloudWatch: $5-10

---

## 🎯 Key Features Enabled by Tech Stack

1. **Serverless Architecture** - No server management
2. **Auto-scaling** - Handles traffic spikes
3. **High Availability** - Multi-AZ deployment
4. **Security** - IAM roles, JWT, encryption
5. **AI-Powered** - Amazon Bedrock integration
6. **Cost-Effective** - Pay-per-use pricing
7. **Fast Deployment** - Docker + Terraform
8. **Monitoring** - CloudWatch integration
9. **HTTPS by Default** - Secure communication
10. **Infrastructure as Code** - Reproducible deployments

---

## 📚 Documentation Stack

- **Markdown** - All documentation
- **Spec-driven development** - `.kiro/specs/`
- **Inline comments** - Code documentation
- **README files** - Setup guides
- **Architecture diagrams** - System design

---

## 🔄 Development Workflow

1. **Planning** - Spec documents (requirements, design, tasks)
2. **Development** - Local Node.js + DynamoDB
3. **Testing** - Manual testing + Jest (future)
4. **Containerization** - Docker build
5. **Infrastructure** - Terraform apply
6. **Deployment** - ECR push + App Runner
7. **Monitoring** - CloudWatch logs
8. **Iteration** - Based on metrics and feedback

---

**Total Technologies**: 30+ tools, services, and frameworks
**Cloud Provider**: AWS (100%)
**Architecture**: Serverless + Containerized
**Deployment**: Fully automated with IaC
