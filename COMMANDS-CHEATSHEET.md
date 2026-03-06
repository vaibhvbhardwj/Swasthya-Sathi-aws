# 🎯 AWS Deployment Commands Cheat Sheet

Quick reference for all deployment commands.

---

## 🚀 Initial Deployment

```bash
# 1. Configure Terraform
cd terraform
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your values

# 2. Deploy infrastructure
terraform init
terraform plan
terraform apply

# 3. Deploy application
cd ..
./deploy.sh  # Linux/Mac
deploy.bat   # Windows
```

---

## 🔄 Update Deployment

```bash
# Quick redeploy
./deploy.sh  # or deploy.bat

# Manual steps
docker build -t swasthya-sathi:latest .
docker tag swasthya-sathi:latest $ECR_REPO:latest
docker push $ECR_REPO:latest
aws apprunner start-deployment --service-arn $SERVICE_ARN --region us-east-1
```

---

## 📊 Monitoring

```bash
# View real-time logs
aws logs tail /aws/apprunner/swasthya-sathi --follow --region us-east-1

# View last 100 lines
aws logs tail /aws/apprunner/swasthya-sathi --since 1h --region us-east-1

# List all services
aws apprunner list-services --region us-east-1

# Get service details
aws apprunner describe-service --service-arn $SERVICE_ARN --region us-east-1

# Check service status
aws apprunner describe-service \
  --service-arn $SERVICE_ARN \
  --region us-east-1 \
  --query "Service.Status"
```

---

## 🔍 Debugging

```bash
# Get service URL
terraform output app_runner_service_url

# Test health endpoint
curl https://YOUR-APP-URL/health

# Get ECR repository URL
terraform output ecr_repository_url

# List ECR images
aws ecr list-images --repository-name swasthya-sathi --region us-east-1

# View CloudWatch log groups
aws logs describe-log-groups --region us-east-1

# Get service ARN
aws apprunner list-services \
  --region us-east-1 \
  --query "ServiceSummaryList[?ServiceName=='swasthya-sathi'].ServiceArn" \
  --output text
```

---

## 🐳 Docker Commands

```bash
# Build image
docker build -t swasthya-sathi:latest .

# Run locally
docker run -p 3000:3000 swasthya-sathi:latest

# Test health check
curl http://localhost:3000/health

# View running containers
docker ps

# View logs
docker logs <container-id>

# Stop container
docker stop <container-id>

# Remove image
docker rmi swasthya-sathi:latest
```

---

## 🔐 AWS Authentication

```bash
# Check current identity
aws sts get-caller-identity

# Configure AWS CLI
aws configure

# Login to ECR
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin \
  $AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com

# Get account ID
aws sts get-caller-identity --query Account --output text
```

---

## 📦 DynamoDB Commands

```bash
# List all tables
aws dynamodb list-tables --region us-east-1

# Describe table
aws dynamodb describe-table \
  --table-name SwasthyaSathi-Users \
  --region us-east-1

# Scan table (get all items)
aws dynamodb scan \
  --table-name SwasthyaSathi-Users \
  --region us-east-1

# Get item count
aws dynamodb describe-table \
  --table-name SwasthyaSathi-Users \
  --region us-east-1 \
  --query "Table.ItemCount"

# Enable backups
aws dynamodb update-continuous-backups \
  --table-name SwasthyaSathi-Users \
  --point-in-time-recovery-specification PointInTimeRecoveryEnabled=true \
  --region us-east-1
```

---

## 🤖 Bedrock Commands

```bash
# List available models
aws bedrock list-foundation-models --region us-east-1

# Check model access
aws bedrock list-foundation-models \
  --region us-east-1 \
  --query "modelSummaries[?modelId=='amazon.nova-pro-v1:0']"

# Test model invocation (requires proper IAM permissions)
aws bedrock-runtime invoke-model \
  --model-id amazon.nova-pro-v1:0 \
  --body '{"prompt":"Hello","max_tokens":100}' \
  --region us-east-1 \
  output.json
```

---

## 🏗️ Terraform Commands

```bash
# Initialize
terraform init

# Validate configuration
terraform validate

# Plan changes
terraform plan

# Apply changes
terraform apply

# Show current state
terraform show

# List resources
terraform state list

# Get specific output
terraform output app_runner_service_url

# Get all outputs
terraform output

# Destroy everything
terraform destroy

# Format files
terraform fmt

# Refresh state
terraform refresh
```

---

## 🔄 App Runner Specific

```bash
# Start deployment
aws apprunner start-deployment \
  --service-arn $SERVICE_ARN \
  --region us-east-1

# Pause service
aws apprunner pause-service \
  --service-arn $SERVICE_ARN \
  --region us-east-1

# Resume service
aws apprunner resume-service \
  --service-arn $SERVICE_ARN \
  --region us-east-1

# Delete service
aws apprunner delete-service \
  --service-arn $SERVICE_ARN \
  --region us-east-1

# List operations
aws apprunner list-operations \
  --service-arn $SERVICE_ARN \
  --region us-east-1
```

---

## 📈 CloudWatch Commands

```bash
# Tail logs (follow)
aws logs tail /aws/apprunner/swasthya-sathi --follow --region us-east-1

# Get logs from last hour
aws logs tail /aws/apprunner/swasthya-sathi --since 1h --region us-east-1

# Get logs from specific time
aws logs tail /aws/apprunner/swasthya-sathi \
  --since 2024-01-01T00:00:00 \
  --region us-east-1

# Filter logs
aws logs tail /aws/apprunner/swasthya-sathi \
  --filter-pattern "ERROR" \
  --region us-east-1

# List log streams
aws logs describe-log-streams \
  --log-group-name /aws/apprunner/swasthya-sathi \
  --region us-east-1
```

---

## 🧹 Cleanup Commands

```bash
# Destroy Terraform resources
cd terraform
terraform destroy

# Delete ECR images
aws ecr batch-delete-image \
  --repository-name swasthya-sathi \
  --image-ids imageTag=latest \
  --region us-east-1

# Delete DynamoDB tables (careful!)
aws dynamodb delete-table --table-name SwasthyaSathi-Users --region us-east-1
# Repeat for all 6 tables

# Delete CloudWatch log group
aws logs delete-log-group \
  --log-group-name /aws/apprunner/swasthya-sathi \
  --region us-east-1
```

---

## 🔑 Environment Variables

```bash
# Set for deployment scripts
export AWS_REGION=us-east-1
export APP_NAME=swasthya-sathi
export IMAGE_TAG=latest

# Get AWS account ID
export AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

# Set ECR repository URL
export ECR_REPO=${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${APP_NAME}

# Get service ARN
export SERVICE_ARN=$(aws apprunner list-services \
  --region ${AWS_REGION} \
  --query "ServiceSummaryList[?ServiceName=='${APP_NAME}'].ServiceArn" \
  --output text)
```

---

## 🎯 One-Liners

```bash
# Full deployment
cd terraform && terraform apply -auto-approve && cd .. && ./deploy.sh

# Quick status check
aws apprunner describe-service --service-arn $(terraform output -raw app_runner_service_arn) --region us-east-1 --query "Service.Status"

# Get URL and test
curl $(terraform output -raw app_runner_service_url)/health

# View latest logs
aws logs tail /aws/apprunner/swasthya-sathi --since 5m --region us-east-1

# Redeploy
docker build -t swasthya-sathi:latest . && docker tag swasthya-sathi:latest $ECR_REPO:latest && docker push $ECR_REPO:latest && aws apprunner start-deployment --service-arn $SERVICE_ARN --region us-east-1
```

---

## 💡 Pro Tips

```bash
# Create alias for common commands
alias app-logs='aws logs tail /aws/apprunner/swasthya-sathi --follow --region us-east-1'
alias app-status='aws apprunner describe-service --service-arn $SERVICE_ARN --region us-east-1 --query "Service.Status"'
alias app-url='terraform output app_runner_service_url'

# Save service ARN for easy access
echo "export SERVICE_ARN=$(aws apprunner list-services --region us-east-1 --query \"ServiceSummaryList[?ServiceName=='swasthya-sathi'].ServiceArn\" --output text)" >> ~/.bashrc

# Watch deployment progress
watch -n 5 'aws apprunner describe-service --service-arn $SERVICE_ARN --region us-east-1 --query "Service.Status"'
```

---

## 📝 Notes

- Replace `$SERVICE_ARN` with your actual service ARN
- Replace `$ECR_REPO` with your ECR repository URL
- Replace `$AWS_ACCOUNT_ID` with your AWS account ID
- All commands assume `us-east-1` region (change if different)

---

**Bookmark this page for quick reference! 📌**
