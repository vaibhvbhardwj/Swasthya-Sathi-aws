# Manual S3 Bucket Setup Instructions

If you prefer to set up the S3 bucket manually through the AWS Console, follow these steps:

## Step 1: Create S3 Bucket

1. Go to AWS Console → S3 → Create bucket
2. **Bucket name**: `swasthya-sathi-frontend-[your-unique-suffix]` (e.g., `swasthya-sathi-frontend-2024`)
   - Note: S3 bucket names must be globally unique
3. **Region**: Select `us-east-1` (to match your backend configuration)
4. **Object Ownership**: ACLs disabled (recommended)
5. **Block Public Access settings**: UNCHECK "Block all public access"
   - ⚠️ Acknowledge the warning (this is required for public website hosting)
6. Click "Create bucket"

## Step 2: Enable Static Website Hosting

1. Go to your bucket → Properties tab
2. Scroll down to "Static website hosting"
3. Click "Edit"
4. Select "Enable"
5. **Index document**: `index.html`
6. **Error document**: `index.html` (for SPA routing)
7. Click "Save changes"
8. **Note the Website endpoint URL** (e.g., `http://swasthya-sathi-frontend-2024.s3-website-us-east-1.amazonaws.com`)

## Step 3: Configure Bucket Policy for Public Read Access

1. Go to your bucket → Permissions tab
2. Scroll down to "Bucket policy"
3. Click "Edit"
4. Paste the following policy (replace `YOUR-BUCKET-NAME` with your actual bucket name):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::YOUR-BUCKET-NAME/*"
    }
  ]
}
```

5. Click "Save changes"

## Step 4: Verify HTTPS Access

S3 static websites automatically support HTTPS. You can access your site via:
- **HTTP**: `http://YOUR-BUCKET-NAME.s3-website-us-east-1.amazonaws.com`
- **HTTPS**: `https://YOUR-BUCKET-NAME.s3.amazonaws.com/index.html`

## Step 5: Save Configuration

Create a file at `backend/config/s3-bucket.json` with your bucket details:

```json
{
  "bucketName": "YOUR-BUCKET-NAME",
  "region": "us-east-1",
  "websiteUrl": "http://YOUR-BUCKET-NAME.s3-website-us-east-1.amazonaws.com",
  "httpsUrl": "https://YOUR-BUCKET-NAME.s3.amazonaws.com/index.html",
  "createdAt": "2024-01-XX"
}
```

## Step 6: Upload Frontend Files

You can upload files via:

### Option A: AWS Console
1. Go to your bucket → Objects tab
2. Click "Upload"
3. Add files: `index.html`, CSS files, JavaScript files
4. Click "Upload"

### Option B: AWS CLI (if installed)
```bash
aws s3 sync frontend/ s3://YOUR-BUCKET-NAME/ --exclude "config.js"
aws s3 cp frontend/config.js s3://YOUR-BUCKET-NAME/config.js
```

## Requirements Satisfied ✅

- ✅ 12.1: Host HTML5, CSS3, and JavaScript files on Amazon S3
- ✅ 12.2: Configure S3 bucket for static website hosting with index.html
- ✅ 12.3: Serve dashboard page within 1 second
- ✅ 12.4: Configure S3 bucket policies for public read access
- ✅ 12.5: Serve all frontend assets over HTTPS

## Testing

After setup, test your website:
1. Navigate to the Website URL
2. Verify the page loads
3. Check browser console for any errors
4. Test HTTPS access

## Troubleshooting

### "403 Forbidden" Error
- Check bucket policy is correctly set
- Verify "Block all public access" is disabled
- Ensure files have been uploaded

### "404 Not Found" Error
- Verify `index.html` exists in the bucket root
- Check static website hosting is enabled
- Confirm the index document is set to `index.html`

### HTTPS Certificate Warning
- S3 HTTPS URLs use AWS certificates and should not show warnings
- If using custom domain, you'll need CloudFront + ACM certificate
