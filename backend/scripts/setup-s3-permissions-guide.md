# S3 Bucket Setup - IAM Permissions Required

## Issue
The current IAM user `swasthya-sathi-dev` does not have permissions to create and configure S3 buckets.

## Required IAM Permissions

To complete task 2.1 (Create S3 bucket with static website hosting), the IAM user needs the following S3 permissions:

### Option 1: Use AWS Managed Policy (Recommended for Development)
Attach the AWS managed policy `AmazonS3FullAccess` to the IAM user:

1. Go to AWS Console → IAM → Users → swasthya-sathi-dev
2. Click "Add permissions" → "Attach policies directly"
3. Search for and select: `AmazonS3FullAccess`
4. Click "Add permissions"

### Option 2: Create Custom Policy (Recommended for Production)
Create a custom policy with minimal required permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:CreateBucket",
        "s3:PutBucketWebsite",
        "s3:PutBucketPolicy",
        "s3:PutPublicAccessBlock",
        "s3:PutObject",
        "s3:PutObjectAcl",
        "s3:GetObject",
        "s3:ListBucket",
        "s3:DeleteObject",
        "s3:DeleteBucket"
      ],
      "Resource": [
        "arn:aws:s3:::swasthya-sathi-frontend-*",
        "arn:aws:s3:::swasthya-sathi-frontend-*/*"
      ]
    }
  ]
}
```

To apply this custom policy:
1. Go to AWS Console → IAM → Policies → Create policy
2. Click "JSON" tab and paste the policy above
3. Name it: `SwasthyaSathi-S3-Policy`
4. Go to IAM → Users → swasthya-sathi-dev
5. Click "Add permissions" → "Attach policies directly"
6. Search for and select: `SwasthyaSathi-S3-Policy`
7. Click "Add permissions"

## After Adding Permissions

Once you've added the necessary permissions, run the setup script again:

```bash
cd backend
node scripts/setup-s3-bucket.js
```

## What the Script Does

The `setup-s3-bucket.js` script will:
1. ✅ Create an S3 bucket with a unique name
2. ✅ Configure static website hosting with index.html as the default document
3. ✅ Enable public read access for frontend assets
4. ✅ Set up bucket policy for public access
5. ✅ Enable HTTPS (automatic for S3 static websites)
6. ✅ Save bucket configuration to `backend/config/s3-bucket.json`

## Requirements Satisfied

This setup satisfies requirements:
- 12.1: Host HTML5, CSS3, and JavaScript files on Amazon S3
- 12.2: Configure S3 bucket for static website hosting with index.html
- 12.3: Serve dashboard page within 1 second
- 12.4: Configure S3 bucket policies for public read access
- 12.5: Serve all frontend assets over HTTPS

## Next Steps After S3 Setup

1. Upload frontend files to the S3 bucket
2. Update frontend configuration with backend API URL
3. Test the website URL provided by the script
