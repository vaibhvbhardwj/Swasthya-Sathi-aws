# 🚀 Quick Start Deployment Guide

## Prerequisites Check
```bash
aws --version          # AWS CLI installed?
docker --version       # Docker installed?
terraform --version    # Terraform installed?
aws sts get-caller-identity  # AWS configured?
```

**If the last command fails**, you need to configure AWS credentials first!

## ⚠️ IMPORTANT: Configure AWS Credentials First

Terraform needs AWS credentials to deploy. Run this helper script:

**Windows:**
```cmd
setup-aws-credentials.bat
```

**Linux/Mac:**
```bash
chmod +x setup-aws-credentials.sh
./setup-aws-credentials.sh
```

**Or manually:**
```bash
aws configure
# Enter your AWS Access Key ID (from backend/.env)
# Enter your AWS Secret Access Key (from backend/.env)
# Enter region: us-east-1
# Enter format: json
```

**Verify it works:**
```bash
aws sts get-caller-identity
```

See `AWS-CREDENTIALS-SETUP.md` for detailed help.

---

## 5-Minute Deployment

### 1. Configure Terraform (2 min)
```bash
cd terraform
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars - CHANGE JWT_SECRET!
```

### 2. Deploy Infrastructure (2 min)
```bash
terraform init
terraform apply  # Type 'yes'
```

### 3. Deploy Application (1 min)

**Linux/Mac:**
```bash
cd ..
chmod +x deploy.sh
./deploy.sh
```

**Windows:**
```cmd
cd ..
.\deploy.bat
```

### 4. Get Your URL
```bash
cd terraform
terraform output app_runner_service_url
```

## Done! 🎉

Visit your URL: `https://YOUR-ID.us-east-1.awsapprunner.com`

---

## Common Commands

### View Logs
```bash
aws logs tail /aws/apprunner/swasthya-sathi --follow --region us-east-1
```

### Check Status
```bash
aws apprunner list-services --region us-east-1
```

### Redeploy
```bash
./deploy.sh  # or deploy.bat on Windows
```

### Destroy Everything
```bash
cd terraform
terraform destroy
```

---

## Troubleshooting

**Deployment fails?**
- Check: `aws sts get-caller-identity`
- Check: `docker ps`
- Check: DynamoDB tables exist

**Can't access app?**
- Wait 2-3 minutes after deployment
- Check: `terraform output app_runner_service_url`
- Check logs: `aws logs tail /aws/apprunner/swasthya-sathi --region us-east-1`

**Bedrock errors?**
- Enable model access in AWS Console → Bedrock → Model access
- Request access to: amazon.nova-pro-v1:0 and amazon.nova-lite-v1:0

---

## Cost: ~$40-90/month

See AWS-DEPLOYMENT-GUIDE.md for full details.
