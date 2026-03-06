# IAM Role Setup Guide for Swasthya Sathi EC2 Instances

This guide provides instructions for configuring an IAM role for EC2 instances with access to Amazon Bedrock (Nova models) and DynamoDB tables.

**Requirements**: 8.5, 10.7

---

## Overview

The EC2 instances running the Swasthya Sathi backend need permissions to:
- ✅ Invoke Amazon Nova Pro model (`amazon.nova-pro-v1:0`)
- ✅ Invoke Amazon Nova Lite model (`amazon.nova-lite-v1:0`)
- ✅ Read/write to all DynamoDB tables
- ✅ Write logs to CloudWatch
- ✅ Access S3 buckets (optional)

---

## Option 1: Automated Setup (Recommended)

### Prerequisites
- AWS credentials configured with IAM permissions
- Node.js installed
- AWS SDK for JavaScript v3

### Steps

1. **Navigate to the backend directory**:
   ```bash
   cd backend
   ```

2. **Install dependencies** (if not already installed):
   ```bash
   npm install
   ```

3. **Run the IAM setup script**:
   ```bash
   node scripts/setup-iam-role.js
   ```

4. **Verify the output**:
   - The script will create:
     - IAM Role: `SwasthyaSathi-EC2-Role`
     - Instance Profile: `SwasthyaSathi-EC2-InstanceProfile`
   - Check for success messages

5. **Use the instance profile when launching EC2**:
   - When launching your EC2 instance, select the instance profile: `SwasthyaSathi-EC2-InstanceProfile`

---

## Option 2: Manual Setup via AWS Console

### Step 1: Create IAM Role

1. **Open AWS IAM Console**:
   - Navigate to: https://console.aws.amazon.com/iam/
   - Click **Roles** in the left sidebar
   - Click **Create role**

2. **Select Trusted Entity**:
   - Choose **AWS service**
   - Select **EC2**
   - Click **Next**

3. **Skip Policy Selection**:
   - Click **Next** (we'll add inline policy later)

4. **Name the Role**:
   - Role name: `SwasthyaSathi-EC2-Role`
   - Description: `IAM role for Swasthya Sathi EC2 instances with Bedrock and DynamoDB access`
   - Add tags (optional):
     - Key: `Project`, Value: `SwasthyaSathi`
     - Key: `Environment`, Value: `Production`
   - Click **Create role**

### Step 2: Attach Permissions Policy

1. **Open the Role**:
   - Find and click on `SwasthyaSathi-EC2-Role`

2. **Add Inline Policy**:
   - Click **Add permissions** → **Create inline policy**
   - Click **JSON** tab
   - Copy and paste the policy from `backend/scripts/iam-policy-ec2-bedrock.json`

3. **Review and Create**:
   - Policy name: `SwasthyaSathi-EC2-Policy`
   - Click **Create policy**

### Step 3: Create Instance Profile (Automatic)

The instance profile is automatically created when you create the role for EC2. The profile name will be the same as the role name: `SwasthyaSathi-EC2-Role`.

### Step 4: Attach Role to EC2 Instance

**For New EC2 Instances**:
1. When launching EC2, in the **Configure Instance** step
2. Under **IAM role**, select: `SwasthyaSathi-EC2-Role`
3. Complete the launch process

**For Existing EC2 Instances**:
1. Select your EC2 instance
2. Click **Actions** → **Security** → **Modify IAM role**
3. Select: `SwasthyaSathi-EC2-Role`
4. Click **Update IAM role**

---

## Option 3: Manual Setup via AWS CLI

### Step 1: Create Trust Policy File

Create a file named `trust-policy.json`:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "ec2.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
```

### Step 2: Create IAM Role

```bash
aws iam create-role \
  --role-name SwasthyaSathi-EC2-Role \
  --assume-role-policy-document file://trust-policy.json \
  --description "IAM role for Swasthya Sathi EC2 instances with Bedrock and DynamoDB access" \
  --tags Key=Project,Value=SwasthyaSathi Key=Environment,Value=Production
```

### Step 3: Attach Permissions Policy

```bash
aws iam put-role-policy \
  --role-name SwasthyaSathi-EC2-Role \
  --policy-name SwasthyaSathi-EC2-Policy \
  --policy-document file://backend/scripts/iam-policy-ec2-bedrock.json
```

### Step 4: Create Instance Profile

```bash
aws iam create-instance-profile \
  --instance-profile-name SwasthyaSathi-EC2-InstanceProfile
```

### Step 5: Add Role to Instance Profile

```bash
aws iam add-role-to-instance-profile \
  --instance-profile-name SwasthyaSathi-EC2-InstanceProfile \
  --role-name SwasthyaSathi-EC2-Role
```

### Step 6: Launch EC2 with Instance Profile

```bash
aws ec2 run-instances \
  --image-id ami-0c55b159cbfafe1f0 \
  --instance-type t3.medium \
  --iam-instance-profile Name=SwasthyaSathi-EC2-InstanceProfile \
  --security-group-ids sg-xxxxxxxxx \
  --subnet-id subnet-xxxxxxxxx \
  --key-name your-key-pair \
  --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=SwasthyaSathi-Backend}]'
```

---

## Permissions Breakdown

### 1. Amazon Bedrock Access

**Models**:
- `amazon.nova-pro-v1:0` (Primary)
- `amazon.nova-lite-v1:0` (Fallback)

**Actions**:
- `bedrock:InvokeModel` - Synchronous model invocation
- `bedrock:InvokeModelWithResponseStream` - Streaming responses

**Resource ARNs**:
```
arn:aws:bedrock:us-east-1::foundation-model/amazon.nova-pro-v1:0
arn:aws:bedrock:us-east-1::foundation-model/amazon.nova-lite-v1:0
```

### 2. DynamoDB Access

**Tables**:
- `SwasthyaSathi-Users`
- `SwasthyaSathi-Doctors`
- `SwasthyaSathi-Consultations`
- `SwasthyaSathi-Notifications`
- `SwasthyaSathi-Medications`
- `SwasthyaSathi-ChatDrafts`

**Actions**:
- `dynamodb:PutItem` - Create items
- `dynamodb:GetItem` - Read items
- `dynamodb:UpdateItem` - Update items
- `dynamodb:DeleteItem` - Delete items
- `dynamodb:Query` - Query with partition key
- `dynamodb:Scan` - Full table scan
- `dynamodb:BatchGetItem` - Batch reads
- `dynamodb:BatchWriteItem` - Batch writes
- `dynamodb:DescribeTable` - Get table metadata

**Includes**: Access to all Global Secondary Indexes (GSI)

### 3. CloudWatch Logs Access

**Actions**:
- `logs:CreateLogGroup` - Create log groups
- `logs:CreateLogStream` - Create log streams
- `logs:PutLogEvents` - Write log events
- `logs:DescribeLogStreams` - List log streams

**Resource Pattern**:
```
arn:aws:logs:us-east-1:*:log-group:/aws/swasthya-sathi/*
```

### 4. S3 Access (Optional)

**Actions**:
- `s3:GetObject` - Read objects
- `s3:PutObject` - Write objects
- `s3:ListBucket` - List bucket contents

**Resource Pattern**:
```
arn:aws:s3:::swasthya-sathi-frontend-*
arn:aws:s3:::swasthya-sathi-frontend-*/*
```

---

## Verification

### Verify Role Creation

```bash
aws iam get-role --role-name SwasthyaSathi-EC2-Role
```

### Verify Policy Attachment

```bash
aws iam get-role-policy \
  --role-name SwasthyaSathi-EC2-Role \
  --policy-name SwasthyaSathi-EC2-Policy
```

### Verify Instance Profile

```bash
aws iam get-instance-profile \
  --instance-profile-name SwasthyaSathi-EC2-InstanceProfile
```

### Test from EC2 Instance

Once the role is attached to your EC2 instance, test access:

```bash
# SSH into EC2 instance
ssh -i your-key.pem ec2-user@your-ec2-ip

# Test AWS credentials (should show the role)
aws sts get-caller-identity

# Test Bedrock access
aws bedrock list-foundation-models --region us-east-1

# Test DynamoDB access
aws dynamodb list-tables --region us-east-1
```

---

## Security Best Practices

### ✅ Least Privilege
- The policy grants only the permissions needed for the application
- Access is restricted to specific Bedrock models
- DynamoDB access is limited to Swasthya Sathi tables only

### ✅ Resource-Based Restrictions
- Bedrock access limited to Nova Pro and Nova Lite models
- DynamoDB access limited to specific table names
- CloudWatch logs scoped to `/aws/swasthya-sathi/*` prefix

### ✅ No Hardcoded Credentials
- EC2 instances use IAM roles (no access keys needed)
- Credentials are automatically rotated by AWS
- No risk of credential exposure in code

### ✅ Audit and Monitoring
- All API calls are logged in CloudTrail
- CloudWatch logs capture application activity
- IAM role usage can be monitored

---

## Troubleshooting

### Error: "Access Denied" when invoking Bedrock

**Cause**: IAM role doesn't have Bedrock permissions

**Solution**:
1. Verify the role has the correct policy attached
2. Check the model ARN matches exactly:
   - `arn:aws:bedrock:us-east-1::foundation-model/amazon.nova-pro-v1:0`
   - `arn:aws:bedrock:us-east-1::foundation-model/amazon.nova-lite-v1:0`
3. Ensure the region is `us-east-1`

### Error: "The provided model identifier is invalid"

**Cause**: Model ID doesn't exist in your region

**Solution**:
1. Verify model availability:
   ```bash
   aws bedrock list-foundation-models --region us-east-1
   ```
2. Check the model IDs in your `.env` file match the policy

### Error: "User is not authorized to perform: iam:CreateRole"

**Cause**: Your AWS credentials lack IAM permissions

**Solution**:
1. Contact your AWS administrator
2. Request the following permissions:
   - `iam:CreateRole`
   - `iam:PutRolePolicy`
   - `iam:CreateInstanceProfile`
   - `iam:AddRoleToInstanceProfile`

### EC2 Instance Can't Access DynamoDB

**Cause**: Role not attached to EC2 instance

**Solution**:
1. Check if role is attached:
   ```bash
   aws ec2 describe-instances --instance-ids i-xxxxxxxxx \
     --query 'Reservations[0].Instances[0].IamInstanceProfile'
   ```
2. If not attached, modify the instance:
   ```bash
   aws ec2 associate-iam-instance-profile \
     --instance-id i-xxxxxxxxx \
     --iam-instance-profile Name=SwasthyaSathi-EC2-InstanceProfile
   ```

---

## Additional Resources

- [AWS IAM Roles for EC2](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/iam-roles-for-amazon-ec2.html)
- [Amazon Bedrock Security](https://docs.aws.amazon.com/bedrock/latest/userguide/security-iam.html)
- [DynamoDB IAM Policies](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/security-iam.html)
- [IAM Best Practices](https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html)

---

## Summary

After completing this setup:
- ✅ EC2 instances can invoke Amazon Nova Pro and Nova Lite models
- ✅ EC2 instances can read/write to all DynamoDB tables
- ✅ EC2 instances can write logs to CloudWatch
- ✅ No AWS credentials needed on EC2 instances
- ✅ Secure, auditable access using IAM roles

**Next Steps**: Proceed to task 3.2 to verify Bedrock model availability.
