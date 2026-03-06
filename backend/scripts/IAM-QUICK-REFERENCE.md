# IAM Role Quick Reference

## Role Details

| Property | Value |
|----------|-------|
| **Role Name** | `SwasthyaSathi-EC2-Role` |
| **Instance Profile** | `SwasthyaSathi-EC2-InstanceProfile` |
| **Policy Name** | `SwasthyaSathi-EC2-Policy` |
| **Region** | `us-east-1` |

---

## Quick Setup

### Automated (Recommended)
```bash
cd backend
node scripts/setup-iam-role.js
```

### Manual via AWS CLI
```bash
# 1. Create role
aws iam create-role \
  --role-name SwasthyaSathi-EC2-Role \
  --assume-role-policy-document file://backend/scripts/iam-trust-policy-ec2.json

# 2. Attach policy
aws iam put-role-policy \
  --role-name SwasthyaSathi-EC2-Role \
  --policy-name SwasthyaSathi-EC2-Policy \
  --policy-document file://backend/scripts/iam-policy-ec2-bedrock.json

# 3. Create instance profile
aws iam create-instance-profile \
  --instance-profile-name SwasthyaSathi-EC2-InstanceProfile

# 4. Add role to profile
aws iam add-role-to-instance-profile \
  --instance-profile-name SwasthyaSathi-EC2-InstanceProfile \
  --role-name SwasthyaSathi-EC2-Role
```

---

## Permissions Summary

### Amazon Bedrock
- ✅ **amazon.nova-pro-v1:0** (Primary model)
- ✅ **amazon.nova-lite-v1:0** (Fallback model)
- Actions: `InvokeModel`, `InvokeModelWithResponseStream`

### DynamoDB Tables
- ✅ SwasthyaSathi-Users
- ✅ SwasthyaSathi-Doctors
- ✅ SwasthyaSathi-Consultations
- ✅ SwasthyaSathi-Notifications
- ✅ SwasthyaSathi-Medications
- ✅ SwasthyaSathi-ChatDrafts
- Actions: Full read/write access + GSI access

### CloudWatch Logs
- ✅ Create log groups/streams
- ✅ Write log events
- Pattern: `/aws/swasthya-sathi/*`

### S3 (Optional)
- ✅ Read/write to frontend buckets
- Pattern: `swasthya-sathi-frontend-*`

---

## Attach to EC2

### During Launch
```bash
aws ec2 run-instances \
  --image-id ami-xxxxxxxxx \
  --instance-type t3.medium \
  --iam-instance-profile Name=SwasthyaSathi-EC2-InstanceProfile \
  ...
```

### Existing Instance
```bash
aws ec2 associate-iam-instance-profile \
  --instance-id i-xxxxxxxxx \
  --iam-instance-profile Name=SwasthyaSathi-EC2-InstanceProfile
```

---

## Verification Commands

```bash
# Check role exists
aws iam get-role --role-name SwasthyaSathi-EC2-Role

# Check policy
aws iam get-role-policy \
  --role-name SwasthyaSathi-EC2-Role \
  --policy-name SwasthyaSathi-EC2-Policy

# Check instance profile
aws iam get-instance-profile \
  --instance-profile-name SwasthyaSathi-EC2-InstanceProfile

# Test from EC2 (after attaching role)
aws sts get-caller-identity
aws bedrock list-foundation-models --region us-east-1
aws dynamodb list-tables --region us-east-1
```

---

## Files Created

| File | Purpose |
|------|---------|
| `iam-policy-ec2-bedrock.json` | Permissions policy document |
| `iam-trust-policy-ec2.json` | Trust policy for EC2 service |
| `setup-iam-role.js` | Automated setup script |
| `iam-setup-guide.md` | Detailed setup instructions |
| `IAM-QUICK-REFERENCE.md` | This quick reference |

---

## Requirements Satisfied

- ✅ **Requirement 8.5**: IAM roles for secure authentication to Amazon Bedrock services
- ✅ **Requirement 10.7**: AWS IAM policies to restrict DynamoDB and Bedrock access to authorized services only

---

## Next Steps

1. ✅ Run setup script or create role manually
2. ⏭️ Attach instance profile to EC2 instance
3. ⏭️ Verify Bedrock model availability (Task 3.2)
4. ⏭️ Deploy backend application to EC2 (Phase 7)
