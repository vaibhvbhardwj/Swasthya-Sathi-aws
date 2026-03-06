# 🚀 AWS App Runner Deployment Package

Complete deployment infrastructure for Swasthya Sathi Healthcare Platform.

---

## 📚 Quick Navigation

| Document | Purpose | Time |
|----------|---------|------|
| **[DEPLOYMENT-QUICK-START.md](DEPLOYMENT-QUICK-START.md)** | 5-minute deployment guide | 5 min |
| **[PRE-DEPLOYMENT-CHECKLIST.md](PRE-DEPLOYMENT-CHECKLIST.md)** | Pre-flight checklist | 10 min |
| **[AWS-DEPLOYMENT-GUIDE.md](AWS-DEPLOYMENT-GUIDE.md)** | Comprehensive guide | 30 min |
| **[DEPLOYMENT-SUMMARY.md](DEPLOYMENT-SUMMARY.md)** | Architecture overview | 10 min |
| **[COMMANDS-CHEATSHEET.md](COMMANDS-CHEATSHEET.md)** | Command reference | - |
| **[DEPLOYMENT-COMPLETE.md](DEPLOYMENT-COMPLETE.md)** | Package overview | 5 min |

---

## 🎯 Choose Your Path

### 🏃 Fast Track (Experienced Users)
1. Read: `DEPLOYMENT-QUICK-START.md`
2. Configure: `terraform/terraform.tfvars`
3. Deploy: `terraform apply && ./deploy.sh`
4. Done! ✅

### 🎓 Guided Path (First Time)
1. Read: `PRE-DEPLOYMENT-CHECKLIST.md`
2. Read: `AWS-DEPLOYMENT-GUIDE.md`
3. Configure: `terraform/terraform.tfvars`
4. Deploy: Follow guide step-by-step
5. Done! ✅

### 🔍 Deep Dive (Understanding Everything)
1. Read: `DEPLOYMENT-COMPLETE.md`
2. Read: `DEPLOYMENT-SUMMARY.md`
3. Read: `AWS-DEPLOYMENT-GUIDE.md`
4. Review: Terraform files
5. Deploy: With full understanding
6. Done! ✅

---

## 📦 What's Included

### Infrastructure Files
```
terraform/
├── main.tf              # Main infrastructure
├── variables.tf         # Configuration variables
├── outputs.tf           # Deployment outputs
└── terraform.tfvars.example  # Configuration template
```

### Deployment Scripts
```
deploy.sh                # Linux/Mac deployment
deploy.bat               # Windows deployment
```

### Docker Configuration
```
Dockerfile               # Production container
.dockerignore           # Build exclusions
```

### Documentation
```
AWS-DEPLOYMENT-GUIDE.md          # Complete guide
DEPLOYMENT-QUICK-START.md        # 5-min guide
DEPLOYMENT-SUMMARY.md            # Architecture
PRE-DEPLOYMENT-CHECKLIST.md      # Checklist
COMMANDS-CHEATSHEET.md           # Commands
DEPLOYMENT-COMPLETE.md           # Overview
DEPLOYMENT-README.md             # This file
```

### CI/CD (Optional)
```
.github/workflows/deploy.yml     # GitHub Actions
```

---

## ⚡ Quick Start

```bash
# 1. Configure
cd terraform
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars

# 2. Deploy Infrastructure
terraform init
terraform apply

# 3. Deploy Application
cd ..
./deploy.sh  # or deploy.bat on Windows

# 4. Get URL
cd terraform
terraform output app_runner_service_url
```

**Total Time: ~5 minutes**

---

## 🏗️ What Gets Created

- ✅ Amazon ECR Repository (Docker images)
- ✅ IAM Roles (DynamoDB + Bedrock access)
- ✅ AWS App Runner Service (your app)
- ✅ CloudWatch Log Group (monitoring)
- ✅ HTTPS endpoint (automatic SSL)

---

## 💰 Cost

**~$40-90/month** for low-medium traffic

- App Runner: $25-50
- DynamoDB: $5-20
- ECR: $1-5
- Bedrock: Pay per use
- CloudWatch: $5-10

---

## 🔐 Security

- ✅ HTTPS automatic
- ✅ IAM roles (no hardcoded credentials)
- ✅ Non-root Docker user
- ✅ Security headers
- ✅ CORS configured

---

## 📊 Monitoring

```bash
# View logs
aws logs tail /aws/apprunner/swasthya-sathi --follow --region us-east-1

# Check status
aws apprunner list-services --region us-east-1

# Get URL
terraform output app_runner_service_url
```

---

## 🔄 Updates

```bash
# Redeploy
./deploy.sh  # or deploy.bat
```

Zero-downtime deployments with automatic rollback.

---

## 🆘 Troubleshooting

| Issue | Solution |
|-------|----------|
| Service not found | Deploy Terraform first |
| ECR login fails | Check AWS credentials |
| Bedrock access denied | Enable model access in console |
| Docker build fails | Ensure Docker is running |

See `AWS-DEPLOYMENT-GUIDE.md` for detailed troubleshooting.

---

## 📞 Support

- **Documentation**: See files above
- **AWS Docs**: https://docs.aws.amazon.com/apprunner/
- **Terraform**: https://registry.terraform.io/providers/hashicorp/aws/

---

## ✅ Success Criteria

- [ ] App Runner service running
- [ ] Health check returns 200
- [ ] Can access via HTTPS
- [ ] Can register/login
- [ ] AI features work
- [ ] Data persists

---

## 🎓 Next Steps

After deployment:
1. Test all features
2. Set up monitoring
3. Enable backups
4. Configure custom domain (optional)
5. Set up CI/CD (optional)

---

## 📝 Important Notes

- **JWT Secret**: Must be 32+ characters
- **DynamoDB**: 6 tables must exist before deployment
- **Bedrock**: Enable Nova Pro & Lite model access
- **Region**: Default is us-east-1 (change in terraform.tfvars)

---

## 🚀 Ready to Deploy?

**Start here**: [DEPLOYMENT-QUICK-START.md](DEPLOYMENT-QUICK-START.md)

Good luck! 🎉
