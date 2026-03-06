# 🔧 Fix: "No valid credential sources found"

## The Problem

You're seeing this error:
```
Error: No valid credential sources found
```

This means Terraform can't find your AWS credentials.

---

## ✅ Quick Fix (3 Steps)

### Step 1: Run the Setup Script

**Windows:**
```cmd
setup-aws-credentials.bat
```

**Linux/Mac:**
```bash
chmod +x setup-aws-credentials.sh
./setup-aws-credentials.sh
```

### Step 2: Enter Your Credentials

When prompted, enter:
- **AWS Access Key ID**: (from your `backend/.env` file)
- **AWS Secret Access Key**: (from your `backend/.env` file)
- **Default region**: `us-east-1`
- **Default output format**: `json`

### Step 3: Verify

```bash
aws sts get-caller-identity
```

You should see your AWS account info. ✅

---

## 📋 Where to Find Your Credentials

Open `backend/.env` and look for:
```
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
```

Use these same values when running `aws configure`.

---

## 🎯 Now Try Terraform Again

```bash
cd terraform
terraform init
terraform plan
```

Should work now! 🎉

---

## 🆘 Still Not Working?

See `AWS-CREDENTIALS-SETUP.md` for detailed troubleshooting.

---

## 💡 Why This Happens

- Your `backend/.env` file is only for Node.js
- Terraform uses AWS CLI configuration (separate)
- You need to configure both separately

---

**Quick Summary:**
1. Run `setup-aws-credentials.bat` (Windows) or `setup-aws-credentials.sh` (Mac/Linux)
2. Enter credentials from `backend/.env`
3. Try `terraform init` again
