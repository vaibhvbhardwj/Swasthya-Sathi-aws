# 🏥 Swasthya Sathi Setup Checklist

Use this checklist to track your setup progress.

## ✅ Phase 1: AWS Account Setup

- [ ] AWS account created
- [ ] IAM user created with appropriate permissions
- [ ] AWS Access Key ID obtained
- [ ] AWS Secret Access Key obtained
- [ ] AWS CLI installed (optional)
- [ ] AWS CLI configured with credentials (optional)

## ✅ Phase 2: Enable AWS Services

- [ ] Logged into AWS Console
- [ ] Navigated to Amazon Bedrock service
- [ ] Clicked "Model access" in sidebar
- [ ] Enabled Claude 3 Sonnet model
- [ ] Enabled Claude 3 Haiku model
- [ ] Waited for "Access granted" status (2-5 minutes)
- [ ] Verified region supports Bedrock (us-east-1, us-west-2, etc.)

## ✅ Phase 3: Project Setup

- [ ] Cloned/downloaded project
- [ ] Ran `npm install` in root directory
- [ ] Ran `npm install` in backend directory
- [ ] Copied `backend/.env.example` to `backend/.env`
- [ ] Updated AWS credentials in `backend/.env`
- [ ] Updated JWT_SECRET in `backend/.env`
- [ ] Verified AWS_REGION matches Bedrock-enabled region

## ✅ Phase 4: Database Setup

- [ ] Ran `node scripts/setup-dynamodb.js` from backend folder
- [ ] Verified all 6 tables created successfully:
  - [ ] SwasthyaSathi-Users
  - [ ] SwasthyaSathi-Doctors
  - [ ] SwasthyaSathi-Consultations
  - [ ] SwasthyaSathi-Notifications
  - [ ] SwasthyaSathi-Medications
  - [ ] SwasthyaSathi-ChatDrafts
- [ ] Ran `node scripts/seed-doctors.js` (optional)
- [ ] Verified sample doctors added (optional)

## ✅ Phase 5: Verification

- [ ] Ran `node scripts/verify-aws-setup.js` from backend folder
- [ ] All checks passed:
  - [ ] ✅ Environment variables configured
  - [ ] ✅ DynamoDB connection successful
  - [ ] ✅ All required tables exist
  - [ ] ✅ Bedrock connection successful
  - [ ] ✅ Claude 3 Sonnet accessible

## ✅ Phase 6: Start Application

- [ ] Started backend server: `npm run dev` from backend folder
- [ ] Backend running on http://localhost:3000
- [ ] Tested health endpoint: `curl http://localhost:3000/health`
- [ ] Opened frontend/index.html in browser
- [ ] Frontend loads without errors

## ✅ Phase 7: Test Basic Functionality

- [ ] Registered a new user account
- [ ] Logged in successfully
- [ ] Received JWT token
- [ ] Dashboard loads with all 6 modules visible
- [ ] Can navigate between modules

## ✅ Phase 8: Test Each Module (Optional)

- [ ] **Lab Analyzer**: Pasted sample lab report and received AI explanation
- [ ] **AI Chat**: Asked a health question (draft created for review)
- [ ] **Medications**: Added a medication successfully
- [ ] **Consultations**: Viewed list of doctors
- [ ] **Notifications**: Viewed notifications list
- [ ] **Profile**: Updated profile information

## 🎯 Ready for Development!

Once all checkboxes above are complete, you're ready to start implementing features!

Next steps:
1. Open `.kiro/specs/swasthya-sathi-healthcare-platform/tasks.md`
2. Start with Task 1: AWS Infrastructure Setup
3. Follow the 24-hour implementation timeline

## 📝 Notes

Use this space to track any issues or customizations:

```
Date: ___________
Issues encountered:


Solutions applied:


Custom configurations:


```

## 🆘 Common Issues

If you're stuck on any step:

1. **AWS Credentials Issue**
   - Double-check `.env` file
   - Verify IAM user has correct permissions
   - Try AWS CLI: `aws sts get-caller-identity`

2. **Bedrock Access Issue**
   - Wait full 5 minutes after enabling models
   - Check correct region in `.env`
   - Verify model IDs match enabled models

3. **DynamoDB Issue**
   - Check AWS region in `.env`
   - Verify IAM permissions include DynamoDB
   - Run: `aws dynamodb list-tables`

4. **Backend Won't Start**
   - Check all dependencies installed: `npm install`
   - Verify `.env` file exists
   - Check port 3000 is not in use

5. **Frontend Issues**
   - Check backend is running
   - Verify API_BASE_URL in `frontend/config.js`
   - Check browser console for errors

## 📚 Reference Documents

- [AWS-SETUP-GUIDE.md](./AWS-SETUP-GUIDE.md) - Detailed setup instructions
- [README.md](./README.md) - Project overview
- [backend/README.md](./backend/README.md) - Backend documentation
- [tasks.md](./.kiro/specs/swasthya-sathi-healthcare-platform/tasks.md) - Implementation tasks

---

Good luck with your setup! 🚀
