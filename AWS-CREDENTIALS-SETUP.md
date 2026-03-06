# 🔐 AWS Credentials Setup for Terraform

## The Issue

Terraform cannot find your AWS credentials. The `.env` file in your backend folder is only used by your Node.js application, NOT by Terraform.

---

## ✅ Solution: Configure AWS CLI

You need to configure AWS credentials that Terraform can access. Here are 3 methods:

---

## Method 1: AWS CLI Configure (Recommended)

This is the easiest and most common method.

### Step 1: Install AWS CLI (if not installed)

**Windows:**
Download from: https://awscli.amazonaws.com/AWSCLIV2.msi

**Mac:**
```bash
brew install awscli
```

**Linux:**
```bash
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
```

### Step 2: Configure AWS Credentials

Run this command and enter your credentials:

```bash
aws configure
```

You'll be prompted for:
```
AWS Access Key ID [None]: YOUR_ACCESS_KEY_ID
AWS Secret Access Key [None]: YOUR_SECRET_ACCESS_KEY
Default region name [None]: us-east-1
Default output format [None]: json
```

### Step 3: Verify Configuration

```bash
aws sts get-caller-identity
```

You should see your AWS account information.

### Step 4: Try Terraform Again

```bash
cd terraform
terraform init
terraform plan
```

---

## Method 2: Environment Variables (Windows)

If you prefer to use environment variables:

### PowerShell:
```powershell
$env:AWS_ACCESS_KEY_ID="your-access-key-id"
$env:AWS_SECRET_ACCESS_KEY="your-secret-access-key"
$env:AWS_DEFAULT_REGION="us-east-1"
```

### Command Prompt (CMD):
```cmd
set AWS_ACCESS_KEY_ID=your-access-key-id
set AWS_SECRET_ACCESS_KEY=your-secret-access-key
set AWS_DEFAULT_REGION=us-east-1
```

**Note:** These are temporary and only last for the current session.

### To Make Permanent (Windows):

1. Open System Properties → Advanced → Environment Variables
2. Add these User Variables:
   - `AWS_ACCESS_KEY_ID` = your access key
   - `AWS_SECRET_ACCESS_KEY` = your secret key
   - `AWS_DEFAULT_REGION` = us-east-1

---

## Method 3: Terraform Variables (Not Recommended for Security)

You can add credentials directly to `terraform.tfvars`, but this is NOT recommended as it's less secure.

**Only use this for testing, never commit to git!**

Edit `terraform/terraform.tfvars`:
```hcl
aws_access_key_id     = "your-access-key-id"
aws_secret_access_key = "your-secret-access-key"
```

Then update `terraform/variables.tf`:
```hcl
variable "aws_access_key_id" {
  description = "AWS Access Key ID"
  type        = string
  sensitive   = true
}

variable "aws_secret_access_key" {
  description = "AWS Secret Access Key"
  type        = string
  sensitive   = true
}
```

And update `terraform/main.tf`:
```hcl
provider "aws" {
  region     = var.aws_region
  access_key = var.aws_access_key_id
  secret_key = var.aws_secret_access_key
}
```

---

## 🔍 Where to Find Your AWS Credentials

### Option A: Existing Credentials (from your .env file)

If you already have credentials in `backend/.env`, you can use those same credentials for AWS CLI:

1. Open `backend/.env`
2. Find `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`
3. Use those values in `aws configure`

### Option B: Create New IAM User

If you don't have credentials or want to create new ones:

1. Go to AWS Console: https://console.aws.amazon.com/
2. Navigate to: IAM → Users → Add User
3. User name: `terraform-deploy`
4. Access type: ✅ Programmatic access
5. Permissions: Attach existing policies:
   - `AmazonEC2ContainerRegistryFullAccess`
   - `AWSAppRunnerFullAccess`
   - `IAMFullAccess`
   - `AmazonDynamoDBFullAccess`
   - `CloudWatchLogsFullAccess`
6. Click through and download the credentials CSV
7. Use the Access Key ID and Secret Access Key

---

## ✅ Verification Steps

After configuring credentials, verify everything works:

### 1. Check AWS CLI:
```bash
aws sts get-caller-identity
```

Expected output:
```json
{
    "UserId": "AIDAXXXXXXXXXXXXXXXXX",
    "Account": "123456789012",
    "Arn": "arn:aws:iam::123456789012:user/your-user"
}
```

### 2. Check Terraform:
```bash
cd terraform
terraform init
```

Should complete without errors.

### 3. Test Terraform Plan:
```bash
terraform plan
```

Should show the resources that will be created.

---

## 🔒 Security Best Practices

1. **Never commit credentials to git**
   - Add to `.gitignore`: `*.tfvars`, `.env`, `*.pem`

2. **Use AWS CLI method** (Method 1)
   - Credentials stored securely in `~/.aws/credentials`
   - Encrypted on disk

3. **Rotate credentials regularly**
   - Change access keys every 90 days

4. **Use IAM roles in production**
   - For EC2/ECS/Lambda, use IAM roles instead of access keys

5. **Enable MFA** on your AWS account

---

## 🐛 Troubleshooting

### Error: "No valid credential sources found"
→ Run `aws configure` and enter your credentials

### Error: "The security token included in the request is invalid"
→ Your credentials are incorrect or expired. Run `aws configure` again

### Error: "Access Denied"
→ Your IAM user doesn't have sufficient permissions. Add required policies

### Credentials work for backend but not Terraform
→ Backend uses `.env` file, Terraform uses AWS CLI config. They're separate!

---

## 📝 Quick Fix Summary

**For most users, this is all you need:**

```bash
# 1. Configure AWS CLI
aws configure
# Enter your Access Key ID
# Enter your Secret Access Key
# Enter region: us-east-1
# Enter format: json

# 2. Verify
aws sts get-caller-identity

# 3. Try Terraform again
cd terraform
terraform init
terraform plan
```

---

## 🎯 Next Steps

Once credentials are configured:

1. ✅ Run `aws sts get-caller-identity` to verify
2. ✅ Run `terraform init` in the terraform directory
3. ✅ Run `terraform plan` to preview changes
4. ✅ Run `terraform apply` to deploy
5. ✅ Continue with deployment: `../deploy.sh`

---

**Need help? Check the credentials in your `backend/.env` file and use those same values with `aws configure`!**
