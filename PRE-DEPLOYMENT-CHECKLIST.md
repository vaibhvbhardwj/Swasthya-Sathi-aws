# ✅ Pre-Deployment Checklist

Complete this checklist before deploying to AWS App Runner.

---

## 🔧 Local Environment

- [ ] AWS CLI installed and configured
  ```bash
  aws --version
  aws configure list
  ```

- [ ] Docker installed and running
  ```bash
  docker --version
  docker ps
  ```

- [ ] Terraform installed (v1.0+)
  ```bash
  terraform --version
  ```

- [ ] Git installed (optional but recommended)
  ```bash
  git --version
  ```

---

## 🔐 AWS Account Setup

- [ ] AWS account created and active
- [ ] IAM user with appropriate permissions:
  - ECR (full access)
  - App Runner (full access)
  - DynamoDB (read/write)
  - Bedrock (invoke model)
  - IAM (create roles and policies)
  - CloudWatch (logs)

- [ ] AWS credentials configured locally
  ```bash
  aws sts get-caller-identity
  ```

- [ ] Bedrock model access enabled:
  - [ ] amazon.nova-pro-v1:0
  - [ ] amazon.nova-lite-v1:0
  
  Check: AWS Console → Bedrock → Model access

---

## 📊 DynamoDB Tables

Verify all 6 tables exist:

- [ ] SwasthyaSathi-Users
- [ ] SwasthyaSathi-Doctors
- [ ] SwasthyaSathi-Consultations
- [ ] SwasthyaSathi-Notifications
- [ ] SwasthyaSathi-Medications
- [ ] SwasthyaSathi-ChatDrafts

```bash
aws dynamodb list-tables --region us-east-1
```

If missing, create them:
```bash
cd backend
node scripts/setup-dynamodb.js
```

---

## 🔑 Configuration Files

- [ ] `terraform/terraform.tfvars` created and configured
  - [ ] JWT secret changed (32+ characters)
  - [ ] AWS region set correctly
  - [ ] DynamoDB table names match your tables
  - [ ] App name configured

- [ ] Generate secure JWT secret:
  ```bash
  # Linux/Mac:
  openssl rand -base64 32
  
  # Windows PowerShell:
  [Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
  ```

---

## 🧪 Local Testing

- [ ] Backend runs locally without errors
  ```bash
  cd backend
  npm install
  npm start
  ```

- [ ] Health check responds
  ```bash
  curl http://localhost:3000/health
  ```

- [ ] Can register a test user
- [ ] Can login with test user
- [ ] DynamoDB connection works
- [ ] Bedrock API works (if configured locally)

---

## 🐳 Docker Testing

- [ ] Docker image builds successfully
  ```bash
  docker build -t swasthya-sathi:test .
  ```

- [ ] Docker container runs
  ```bash
  docker run -p 3000:3000 swasthya-sathi:test
  ```

- [ ] Health check works in container
  ```bash
  curl http://localhost:3000/health
  ```

---

## 💰 Cost Awareness

- [ ] Understand estimated monthly costs (~$40-90)
- [ ] Set up AWS billing alerts
- [ ] Review AWS Free Tier eligibility
- [ ] Plan for DynamoDB usage patterns

---

## 📝 Documentation Review

- [ ] Read `AWS-DEPLOYMENT-GUIDE.md`
- [ ] Review `DEPLOYMENT-QUICK-START.md`
- [ ] Understand `DEPLOYMENT-SUMMARY.md`
- [ ] Bookmark troubleshooting section

---

## 🔒 Security Review

- [ ] JWT secret is strong and unique
- [ ] No secrets committed to git
- [ ] `.env` files in `.gitignore`
- [ ] IAM roles follow least-privilege principle
- [ ] DynamoDB tables have appropriate access controls

---

## 🚀 Deployment Readiness

- [ ] All above items checked
- [ ] Team notified of deployment
- [ ] Backup plan in place
- [ ] Rollback strategy understood
- [ ] Monitoring plan ready

---

## 📋 Post-Deployment Tasks

After successful deployment:

- [ ] Test all application features
- [ ] Verify health check endpoint
- [ ] Check CloudWatch logs
- [ ] Test user registration and login
- [ ] Test AI chat functionality
- [ ] Test lab report analyzer
- [ ] Verify DynamoDB data persistence
- [ ] Set up CloudWatch alarms
- [ ] Enable DynamoDB backups
- [ ] Document the live URL
- [ ] Update team documentation

---

## 🆘 Emergency Contacts

Before deploying, ensure you have:

- [ ] AWS Support plan (if needed)
- [ ] Team contact information
- [ ] Escalation procedures documented
- [ ] Rollback commands ready

---

## ✅ Final Check

All items above are checked? You're ready to deploy!

```bash
# Start deployment
cd terraform
terraform init
terraform apply

# Then deploy the application
cd ..
./deploy.sh  # or deploy.bat on Windows
```

---

## 📞 Need Help?

- Review `AWS-DEPLOYMENT-GUIDE.md` for detailed instructions
- Check CloudWatch logs for errors
- Verify IAM permissions
- Ensure DynamoDB tables exist
- Confirm Bedrock model access

---

**Good luck with your deployment! 🚀**
