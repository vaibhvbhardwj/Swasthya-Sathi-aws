# 🔧 Fix: ECR Access Denied Error

## The Problem

```
User: arn:aws:iam::310651340735:user/swasthya-sathi-dev is not authorized 
to perform: ecr:GetAuthorizationToken
```

Your IAM user doesn't have permission to access Amazon ECR (Elastic Container Registry).

---

## ✅ Solution: Add ECR Permissions

You need to add ECR permissions to your IAM user. Choose one method:

---

## Method 1: AWS Console (Easiest)

### Step 1: Go to IAM Console
1. Open: https://console.aws.amazon.com/iam/
2. Click **Users** in the left sidebar
3. Find and click your user: **swasthya-sathi-dev**

### Step 2: Add ECR Policy
1. Click the **Permissions** tab
2. Click **Add permissions** → **Attach policies directly**
3. Search for and select: **`AmazonEC2ContainerRegistryFullAccess`**
4. Click **Next** → **Add permissions**

### Step 3: Verify
```bash
aws ecr describe-repositories --region us-east-1
```

Should work now! ✅

---

## Method 2: AWS CLI (Faster)

Run this command to attach the ECR policy:

```bash
aws iam attach-user-policy \
  --user-name swasthya-sathi-dev \
  --policy-arn arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryFullAccess
```

Verify:
```bash
aws ecr describe-repositories --region us-east-1
```

---

## Method 3: Add All Required Permissions at Once

Your user needs these permissions for full deployment:

```bash
# ECR (Docker images)
aws iam attach-user-policy \
  --user-name swasthya-sathi-dev \
  --policy-arn arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryFullAccess

# App Runner
aws iam attach-user-policy \
  --user-name swasthya-sathi-dev \
  --policy-arn arn:aws:iam::aws:policy/AWSAppRunnerFullAccess

# IAM (for creating roles)
aws iam attach-user-policy \
  --user-name swasthya-sathi-dev \
  --policy-arn arn:aws:iam::aws:policy/IAMFullAccess

# CloudWatch Logs
aws iam attach-user-policy \
  --user-name swasthya-sathi-dev \
  --policy-arn arn:aws:iam::aws:policy/CloudWatchLogsFullAccess
```

**Note:** You already have DynamoDB and Bedrock access based on your backend working.

---

## 🔍 Check Current Permissions

To see what permissions your user currently has:

```bash
aws iam list-attached-user-policies --user-name swasthya-sathi-dev
```

---

## ✅ After Adding Permissions

Try the deployment again:

```bash
.\deploy.bat
```

Or if you haven't run Terraform yet:

```bash
cd terraform
terraform init
terraform apply
cd ..
.\deploy.bat
```

---

## 🎯 Minimum Required Permissions

For deployment, your IAM user needs:

| Service | Policy | Why |
|---------|--------|-----|
| ECR | `AmazonEC2ContainerRegistryFullAccess` | Store Docker images |
| App Runner | `AWSAppRunnerFullAccess` | Deploy application |
| IAM | `IAMFullAccess` | Create service roles |
| CloudWatch | `CloudWatchLogsFullAccess` | View logs |
| DynamoDB | Already have ✅ | Database access |
| Bedrock | Already have ✅ | AI models |

---

## 🆘 If You Can't Add Permissions Yourself

If you don't have permission to modify IAM users:

1. Contact your AWS account administrator
2. Ask them to add the policies listed above
3. Or ask them to add the **`AdministratorAccess`** policy (full access)

---

## 💡 Alternative: Use Administrator Access (Development Only)

**For development/testing only**, you can give your user full access:

```bash
aws iam attach-user-policy \
  --user-name swasthya-sathi-dev \
  --policy-arn arn:aws:iam::aws:policy/AdministratorAccess
```

**⚠️ Warning:** This gives full access to everything. Only use for development!

---

## ✅ Verification Checklist

After adding permissions, verify each service:

```bash
# ECR
aws ecr describe-repositories --region us-east-1

# App Runner
aws apprunner list-services --region us-east-1

# IAM
aws iam list-roles --max-items 1

# CloudWatch
aws logs describe-log-groups --region us-east-1 --max-items 1
```

All should work without errors. ✅

---

**Quick Fix: Add ECR policy via AWS Console, then try `.\deploy.bat` again!**
