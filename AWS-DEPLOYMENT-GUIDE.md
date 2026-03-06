# AWS App Runner Deployment Guide
## Swasthya Sathi Healthcare Platform

This guide walks you through deploying the Swasthya Sathi application to AWS App Runner with full infrastructure setup.

---

## 📋 Prerequisites

Before you begin, ensure you have:

1. **AWS Account** with appropriate permissions
2. **AWS CLI** installed and configured
   ```bash
   aws --version
   aws configure
   ```
3. **Docker** installed and running
   ```bash
   docker --version
   ```
4. **Terraform** installed (v1.0+)
   ```bash
   terraform --version
   ```
5. **Git** installed
   ```bash
   git --version
   ```

---

## 🏗️ Architecture Overview

The deployment includes:

- **AWS App Runner**: Hosts the containerized Node.js application
- **Amazon ECR**: Stores Docker images
- **DynamoDB**: 6 tables for data storage (Users, Doctors, Consultations, Notifications, Medications, ChatDrafts)
- **Amazon Bedrock**: AI models (Nova Pro & Nova Lite)
- **IAM Roles**: Secure access to AWS services
- **CloudWatch**: Logging and monitoring

---

## 🚀 Step-by-Step Deployment

### Step 1: Verify DynamoDB Tables

Ensure your 6 DynamoDB tables exist:

```bash
aws dynamodb list-tables --region us-east-1
```

Expected tables:
- `SwasthyaSathi-Users`
- `SwasthyaSathi-Doctors`
- `SwasthyaSathi-Consultations`
- `SwasthyaSathi-Notifications`
- `SwasthyaSathi-Medications`
- `SwasthyaSathi-ChatDrafts`

If tables don't exist, create them using:
```bash
cd backend
node scripts/setup-dynamodb.js
```

---

### Step 2: Configure Terraform Variables

1. Navigate to the terraform directory:
   ```bash
   cd terraform
   ```

2. Copy the example variables file:
   ```bash
   cp terraform.tfvars.example terraform.tfvars
   ```

3. Edit `terraform.tfvars` with your values:
   ```hcl
   aws_region  = "us-east-1"
   app_name    = "swasthya-sathi"
   environment = "production"
   
   # IMPORTANT: Change this to a secure random string!
   jwt_secret = "your-super-secret-jwt-key-min-32-chars-long"
   
   # Update table names if different
   dynamodb_users_table         = "SwasthyaSathi-Users"
   dynamodb_doctors_table       = "SwasthyaSathi-Doctors"
   dynamodb_consultations_table = "SwasthyaSathi-Consultations"
   dynamodb_notifications_table = "SwasthyaSathi-Notifications"
   dynamodb_medications_table   = "SwasthyaSathi-Medications"
   dynamodb_chat_drafts_table   = "SwasthyaSathi-ChatDrafts"
   ```

4. Generate a secure JWT secret:
   ```bash
   # On Linux/Mac:
   openssl rand -base64 32
   
   # On Windows (PowerShell):
   [Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
   ```

---

### Step 3: Initialize and Deploy Infrastructure

1. Initialize Terraform:
   ```bash
   terraform init
   ```

2. Review the deployment plan:
   ```bash
   terraform plan
   ```

3. Deploy the infrastructure:
   ```bash
   terraform apply
   ```
   
   Type `yes` when prompted.

4. Save the outputs:
   ```bash
   terraform output > ../deployment-outputs.txt
   ```

   This creates:
   - ECR repository
   - IAM roles with DynamoDB and Bedrock permissions
   - App Runner service
   - CloudWatch log group

---

### Step 4: Build and Push Docker Image

#### On Linux/Mac:

```bash
# Make the script executable
chmod +x deploy.sh

# Run the deployment script
./deploy.sh
```

#### On Windows:

```cmd
deploy.bat
```

#### Manual Deployment (if scripts fail):

```bash
# Set variables
export AWS_REGION=us-east-1
export APP_NAME=swasthya-sathi
export AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
export ECR_REPO=${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${APP_NAME}

# Login to ECR
aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com

# Build image
docker build -t ${APP_NAME}:latest .

# Tag image
docker tag ${APP_NAME}:latest ${ECR_REPO}:latest

# Push to ECR
docker push ${ECR_REPO}:latest

# Trigger deployment
SERVICE_ARN=$(aws apprunner list-services --region ${AWS_REGION} --query "ServiceSummaryList[?ServiceName=='${APP_NAME}'].ServiceArn" --output text)
aws apprunner start-deployment --service-arn ${SERVICE_ARN} --region ${AWS_REGION}
```

---

### Step 5: Verify Deployment

1. **Check deployment status:**
   ```bash
   aws apprunner describe-service \
     --service-arn $(terraform output -raw app_runner_service_arn) \
     --region us-east-1 \
     --query "Service.Status"
   ```

   Wait until status is `RUNNING`.

2. **Get your application URL:**
   ```bash
   terraform output app_runner_service_url
   ```

3. **Test the health endpoint:**
   ```bash
   curl https://YOUR-APP-URL/health
   ```

4. **View logs:**
   ```bash
   aws logs tail /aws/apprunner/swasthya-sathi --follow --region us-east-1
   ```

---

## 🌐 Accessing Your Application

Once deployed, your application will be available at:

```
https://YOUR-UNIQUE-ID.us-east-1.awsapprunner.com
```

The URL is shown in the Terraform output as `app_runner_service_url`.

### Application Endpoints:

- **Homepage**: `https://YOUR-APP-URL/`
- **Login/Register**: `https://YOUR-APP-URL/auth.html`
- **Dashboard**: `https://YOUR-APP-URL/dashboard.html`
- **Health Check**: `https://YOUR-APP-URL/health`
- **API**: `https://YOUR-APP-URL/api`

---

## 🔄 Updating Your Application

To deploy updates:

1. Make your code changes
2. Commit to git (optional but recommended)
3. Run the deployment script:
   ```bash
   ./deploy.sh  # Linux/Mac
   deploy.bat   # Windows
   ```

App Runner will automatically:
- Pull the new image from ECR
- Deploy with zero downtime
- Roll back if health checks fail

---

## 📊 Monitoring and Logs

### View Real-time Logs:

```bash
aws logs tail /aws/apprunner/swasthya-sathi --follow --region us-east-1
```

### View Service Metrics:

```bash
aws apprunner describe-service \
  --service-arn $(terraform output -raw app_runner_service_arn) \
  --region us-east-1
```

### CloudWatch Dashboard:

1. Go to AWS Console → CloudWatch
2. Navigate to Log Groups
3. Find `/aws/apprunner/swasthya-sathi`

---

## 🔐 Security Best Practices

1. **JWT Secret**: Use a strong, random 32+ character secret
2. **Environment Variables**: Never commit secrets to git
3. **IAM Roles**: Use least-privilege permissions
4. **HTTPS**: App Runner provides automatic HTTPS
5. **DynamoDB**: Enable point-in-time recovery
6. **Backups**: Regular DynamoDB backups

### Enable DynamoDB Backups:

```bash
aws dynamodb update-continuous-backups \
  --table-name SwasthyaSathi-Users \
  --point-in-time-recovery-specification PointInTimeRecoveryEnabled=true \
  --region us-east-1
```

Repeat for all 6 tables.

---

## 💰 Cost Estimation

Approximate monthly costs (us-east-1):

- **App Runner**: $25-50 (1 vCPU, 2GB RAM, low traffic)
- **DynamoDB**: $5-20 (on-demand pricing, depends on usage)
- **ECR**: $1-5 (image storage)
- **Bedrock**: Pay per request (~$0.003 per 1K tokens)
- **CloudWatch**: $5-10 (logs and metrics)

**Total**: ~$40-90/month for low-medium traffic

### Cost Optimization:

1. Use DynamoDB on-demand pricing for variable workloads
2. Enable ECR lifecycle policies (already configured)
3. Set CloudWatch log retention to 7 days (already configured)
4. Use App Runner auto-scaling

---

## 🧹 Cleanup / Destroy Infrastructure

To remove all resources:

```bash
cd terraform
terraform destroy
```

Type `yes` when prompted.

**Note**: This will NOT delete DynamoDB tables (they're referenced, not created by Terraform). Delete them manually if needed:

```bash
aws dynamodb delete-table --table-name SwasthyaSathi-Users --region us-east-1
# Repeat for all 6 tables
```

---

## 🐛 Troubleshooting

### Issue: Deployment fails with "Service not found"

**Solution**: Ensure Terraform infrastructure is deployed first:
```bash
cd terraform
terraform apply
```

### Issue: Docker build fails

**Solution**: Ensure you're in the project root directory and Docker is running:
```bash
docker ps
```

### Issue: ECR login fails

**Solution**: Check AWS credentials:
```bash
aws sts get-caller-identity
```

### Issue: App shows "Cannot connect to backend"

**Solution**: 
1. Check App Runner service status
2. View CloudWatch logs for errors
3. Verify DynamoDB table names match configuration

### Issue: Bedrock access denied

**Solution**: Ensure you have Bedrock model access:
```bash
aws bedrock list-foundation-models --region us-east-1
```

Request access in AWS Console → Bedrock → Model access if needed.

---

## 📞 Support

For issues:
1. Check CloudWatch logs
2. Review Terraform state: `terraform show`
3. Verify IAM permissions
4. Check AWS Service Health Dashboard

---

## 🎉 Success Checklist

- [ ] DynamoDB tables created and populated
- [ ] Terraform infrastructure deployed
- [ ] Docker image built and pushed to ECR
- [ ] App Runner service running
- [ ] Health check passing
- [ ] Application accessible via HTTPS
- [ ] Can register and login
- [ ] AI chat working (Bedrock access)
- [ ] Lab report analyzer working
- [ ] CloudWatch logs visible

---

## 📚 Additional Resources

- [AWS App Runner Documentation](https://docs.aws.amazon.com/apprunner/)
- [Amazon Bedrock Documentation](https://docs.aws.amazon.com/bedrock/)
- [DynamoDB Best Practices](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/best-practices.html)
- [Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)

---

**Congratulations! Your Swasthya Sathi application is now live on AWS! 🚀**
