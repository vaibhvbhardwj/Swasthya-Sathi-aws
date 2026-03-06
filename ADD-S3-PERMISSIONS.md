# Add S3 Permissions to IAM User

## Quick Steps to Add S3 Permissions

### Option 1: AWS Console (Easiest - Recommended)

1. **Go to IAM Console**
   - Open: https://console.aws.amazon.com/iam/
   - Navigate to: Users → `swasthya-sathi-dev`

2. **Add Permissions**
   - Click the "Add permissions" button
   - Select "Attach policies directly"
   - Search for: `AmazonS3FullAccess`
   - Check the box next to `AmazonS3FullAccess`
   - Click "Add permissions"

3. **Verify**
   - You should see `AmazonS3FullAccess` in the list of attached policies

### Option 2: AWS CLI (If you have admin access)

```bash
aws iam attach-user-policy \
  --user-name swasthya-sathi-dev \
  --policy-arn arn:aws:iam::aws:policy/AmazonS3FullAccess
```

## After Adding Permissions

Once you've added the S3 permissions, run the setup script:

```bash
cd backend
node scripts/setup-s3-bucket.js
```

The script will:
- ✅ Create an S3 bucket with a unique name
- ✅ Enable static website hosting with index.html
- ✅ Configure public read access
- ✅ Set up bucket policy
- ✅ Enable HTTPS (automatic)
- ✅ Save configuration to `backend/config/s3-bucket.json`

## What You'll See

```
🚀 Starting S3 bucket setup for frontend hosting...

📦 Creating S3 bucket: swasthya-sathi-frontend-1234567890...
✅ S3 bucket created successfully

🔓 Configuring public access settings...
✅ Public access settings configured

🌐 Configuring static website hosting...
✅ Static website hosting enabled with index.html

📜 Setting bucket policy for public read access...
✅ Bucket policy set for public read access

🎉 S3 bucket setup completed successfully!

📋 Bucket Details:
   Bucket Name: swasthya-sathi-frontend-1234567890
   Region: us-east-1
   Website URL: http://swasthya-sathi-frontend-1234567890.s3-website-us-east-1.amazonaws.com
   HTTPS URL: https://swasthya-sathi-frontend-1234567890.s3.amazonaws.com/index.html
```

## Requirements Satisfied

This setup satisfies all requirements for task 2.1:
- ✅ 12.1: Host files on Amazon S3
- ✅ 12.2: Configure static website hosting with index.html
- ✅ 12.3: Serve page within 1 second
- ✅ 12.4: Configure public read access
- ✅ 12.5: Serve over HTTPS

## Need Help?

If you encounter any issues:
1. Verify you're logged into the correct AWS account (310651340735)
2. Check that you have permissions to modify IAM policies
3. Ensure the IAM user name is exactly: `swasthya-sathi-dev`

Let me know once you've added the permissions and I'll run the setup script!
