# Implementation Plan: Swasthya Sathi Healthcare Platform

## Overview

This implementation plan breaks down the Swasthya Sathi healthcare platform into actionable tasks following a 24-hour development timeline. The platform uses Node.js/Express.js backend on EC2, vanilla JavaScript frontend on S3, DynamoDB for data persistence, and Amazon Bedrock for AI capabilities. The implementation prioritizes safety through Doctor-in-the-Loop patterns and AI guardrails.

## Timeline Reference

- H 0-4: AWS Environment setup
- H 4-10: Backend API development
- H 10-14: AI Layer integration
- H 14-18: Frontend Dashboard & UI
- H 18-22: Integration, Testing, and Deployment
- H 22-24: Final Bug Fixes & Demo Prep

## Tasks

### Phase 1: AWS Infrastructure Setup (H 0-4)

- [x] 1. Set up AWS DynamoDB tables with proper schemas
  - [x] 1.1 Create Users table with userId partition key
    - Define schema: userId (PK), name, email, passwordHash, age, gender, phone, role, createdAt
    - Configure on-demand billing mode
    - _Requirements: 9.1, 1.1_
  
  - [x] 1.2 Create Doctors table with doctorId partition key
    - Define schema: doctorId (PK), name, specialization, experienceYears, rating, baseRate, verified, createdAt
    - Configure on-demand billing mode
    - _Requirements: 9.2, 5.1_
  
  - [x] 1.3 Create Consultations table with GSI for userId
    - Define schema: consultationId (PK), userId, doctorId, scheduledFor, status, createdAt
    - Create GSI: userId-index with userId as partition key
    - _Requirements: 9.3, 5.5_
  
  - [x] 1.4 Create Notifications table with GSI for userId
    - Define schema: notificationId (PK), userId, type, message, isRead, createdAt
    - Create GSI: userId-index with userId as partition key
    - _Requirements: 9.4, 6.1_
  
  - [x] 1.5 Create Medications table with GSI for userId
    - Define schema: medicationId (PK), userId, name, dosage, frequency, customInterval, notes, nextReminderAt, createdAt
    - Create GSI: userId-index with userId as partition key
    - _Requirements: 9.5, 4.1_

- [x] 2. Configure Amazon S3 bucket for frontend hosting
  - [x] 2.1 Create S3 bucket with static website hosting enabled
    - Set index document to index.html
    - Configure bucket for public read access
    - Enable HTTPS
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_

- [x] 3. Set up Amazon Bedrock access and IAM roles
  - [x] 3.1 Configure IAM role for EC2 with Bedrock access
    - Grant permissions for Amazon Nova Pro model (amazon.nova-pro-v1:0)
    - Grant permissions for Amazon Nova Lite model (amazon.nova-lite-v1:0)
    - Grant DynamoDB read/write permissions for all tables
    - _Requirements: 8.5, 10.7_
  
  - [x] 3.2 Verify Bedrock model availability in target region
    - Test Amazon Nova Pro access
    - Test Amazon Nova Lite fallback
    - _Requirements: 8.1, 8.2_

- [x] 4. Provision EC2 instance for backend deployment
  - [x] 4.1 Launch EC2 instance with Node.js environment
    - Configure security groups for ports 80, 443, and 3000
    - Attach IAM role from task 3.1
    - Install Node.js 18+ and npm
    - _Requirements: 13.1, 13.4_
  
  - [x] 4.2 Configure CloudWatch logging
    - Set up log groups for API requests, errors, and AI interactions
    - Configure log retention policies
    - _Requirements: 13.2, 8.3_

### Phase 2: Backend Core Services (H 4-10)

- [x] 5. Implement Authentication Service
  - [x] 5.1 Create Express.js server with basic middleware
    - Initialize Express app on port 3000
    - Add body-parser, cors, and helmet middleware
    - Create health check endpoint at /health
    - _Requirements: 13.3, 13.5_
  
  - [x] 5.2 Implement user registration endpoint
    - POST /api/auth/register with validation
    - Hash passwords using bcryptjs with salt factor 10
    - Store user in DynamoDB Users table
    - Return userId and success message
    - _Requirements: 1.1, 1.4_
  
  - [x] 5.3 Implement user login endpoint
    - POST /api/auth/login with credential validation
    - Verify password against hashed value
    - Generate JWT token with 24-hour expiration
    - Return token, userId, and expiresIn
    - _Requirements: 1.2, 1.3_
  
  - [x] 5.4 Create JWT validation middleware
    - Extract token from Authorization header
    - Verify token signature and expiration
    - Return 401 for invalid/expired tokens
    - Attach userId to request object
    - _Requirements: 1.5, 10.1, 10.2_

- [x] 6. Implement Lab Report Analyzer Service
  - [x] 6.1 Create lab report parser function
    - Parse structured lab values: HbA1c, LDL, HDL, WBC, RBC, Hemoglobin
    - Extract test name, value, unit, and reference range
    - Return LabReport object with tests array
    - Handle parsing errors with descriptive messages within 500ms
    - _Requirements: 2.1, 11.1, 11.2_
  
  - [x] 6.2 Create pretty printer function for LabReport objects
    - Format LabReport back to human-readable text
    - Preserve test names, values, units, and reference ranges
    - _Requirements: 11.3_
  
  - [ ]* 6.3 Write property test for round-trip consistency
    - **Property 1: Round-trip preservation**
    - **Validates: Requirements 11.4, 11.5**
    - Test that parse(prettyPrint(parse(text))) produces equivalent LabReport
  
  - [x] 6.4 Implement abnormal result detection
    - Compare each test value against reference range min/max
    - Mark values outside range as abnormal
    - Return array of abnormal test names
    - _Requirements: 2.2_
  
  - [x] 6.5 Create POST /api/lab-report/analyze endpoint
    - Accept reportText in request body
    - Parse lab report and identify abnormals within 1 second
    - Send structured prompt with guardrails to Bedrock
    - Return parsed values, abnormals, AI explanation, and safety disclaimer within 5 seconds
    - _Requirements: 2.3, 2.4, 2.5, 2.6_

- [x] 7. Implement Profile Management Service
  - [x] 7.1 Create GET /api/profile endpoint
    - Require JWT authentication
    - Query DynamoDB Users table by userId
    - Return name, email, age, gender, phone within 300ms
    - _Requirements: 7.1, 7.4_
  
  - [x] 7.2 Create PUT /api/profile endpoint
    - Require JWT authentication
    - Validate updated fields
    - Check email uniqueness if email changed
    - Hash new password with bcryptjs if password changed
    - Update DynamoDB Users table within 500ms
    - _Requirements: 7.2, 7.3, 7.5_

- [x] 8. Checkpoint - Verify core backend services
  - Ensure all tests pass, ask the user if questions arise.

### Phase 3: AI Integration and Doctor-in-the-Loop (H 10-14)

- [x] 9. Implement AI Engine Integration Module
  - [x] 9.1 Create Bedrock client wrapper with fallback logic
    - Initialize AWS Bedrock client with IAM role credentials
    - Implement primary call to Amazon Nova Pro
    - Implement automatic fallback to Amazon Nova Lite within 2 seconds on failure
    - Add 5-second timeout for all AI requests
    - _Requirements: 8.1, 8.2, 8.4_
  
  - [x] 9.2 Add CloudWatch logging for AI interactions
    - Log model used (Sonnet or Haiku)
    - Log token count from response metadata
    - Log latency for each request
    - _Requirements: 8.3_
  
  - [x] 9.3 Create prompt construction helper with guardrails
    - Accept base prompt and guardrail rules
    - Inject safety constraints: no diagnosis, no prescriptions, no medication stopping advice
    - Format prompt for Bedrock API
    - _Requirements: 2.6, 10.3_

- [x] 10. Implement Chat Service with Doctor-in-the-Loop
  - [x] 10.1 Create ChatDrafts DynamoDB table
    - Define schema: draftId (PK), userId, question, aiResponse, status, reviewedBy, createdAt, reviewedAt
    - Configure on-demand billing
    - _Requirements: 3.2_
  
  - [x] 10.2 Create POST /api/chat/ask endpoint
    - Require JWT authentication
    - Construct prompt with guardrails
    - Generate AI draft response within 5 seconds
    - Store draft in DynamoDB with status "pending_review"
    - Return draftId and status
    - _Requirements: 3.1, 3.2, 3.6_
  
  - [x] 10.3 Create notification for clinician review
    - Generate notification within 10 seconds of draft creation
    - Store in Notifications table with type "system_update"
    - Target available clinicians (role="clinician")
    - _Requirements: 3.3_
  
  - [x] 10.4 Create GET /api/chat/response/:draftId endpoint
    - Require JWT authentication
    - Query ChatDrafts table by draftId
    - Return status and response if approved
    - _Requirements: 3.4, 3.7_
  
  - [x] 10.5 Create POST /api/chat/review endpoint (clinician only)
    - Require JWT authentication with role="clinician"
    - Accept draftId and action (approve/reject)
    - Update draft status to "approved" or "rejected"
    - If approved: deliver response to patient
    - If rejected: trigger new AI draft generation
    - _Requirements: 3.4, 3.5, 10.5_

- [x] 11. Integrate AI guardrails into Lab Report Analyzer
  - [x] 11.1 Update lab report analysis prompt with guardrails
    - Add constraint: "Do not provide diagnosis"
    - Add constraint: "Do not provide prescription advice"
    - Add constraint: "Do not recommend stopping medications"
    - Append safety disclaimer to all responses
    - _Requirements: 2.6, 10.3, 10.6_

### Phase 4: Medication Tracking and Consultation Services (H 10-14 continued)

- [x] 12. Implement Medication Tracker Service
  - [x] 12.1 Create POST /api/medications endpoint
    - Require JWT authentication
    - Validate medication data: name, dosage, frequency
    - Support frequencies: once_daily, twice_daily, thrice_daily, custom
    - Calculate nextReminderAt based on frequency
    - Store in DynamoDB Medications table
    - Return medicationId
    - _Requirements: 4.1, 4.5_
  
  - [x] 12.2 Create GET /api/medications endpoint
    - Require JWT authentication
    - Query Medications table by userId using GSI
    - Return all medications within 500ms
    - _Requirements: 4.3, 9.6_
  
  - [x] 12.3 Create DELETE /api/medications/:medicationId endpoint
    - Require JWT authentication
    - Remove medication from DynamoDB
    - Cancel future reminders within 1 second
    - _Requirements: 4.4_
  
  - [x] 12.4 Implement background medication reminder scheduler
    - Run every minute to check for due medications
    - Query medications where nextReminderAt <= current time
    - Generate notification within 60 seconds of scheduled time
    - Update nextReminderAt for next occurrence
    - _Requirements: 4.2_

- [x] 13. Implement Consultation Scheduling Service
  - [x] 13.1 Seed Doctors table with sample verified doctors
    - Create 3-5 sample doctors with varied specializations
    - Set experienceYears, rating, baseRate, verified=true
    - _Requirements: 5.1_
  
  - [x] 13.2 Create GET /api/doctors endpoint
    - Return all verified doctors from Doctors table
    - Include doctorId, name, specialization, experienceYears, rating, baseRate
    - _Requirements: 5.1_
  
  - [x] 13.3 Create GET /api/doctors/:doctorId endpoint
    - Query Doctors table by doctorId
    - Calculate pricing: baseRate + (experienceYears × 50)
    - Return doctor details and calculatedPrice
    - _Requirements: 5.2_
  
  - [x] 13.4 Create POST /api/consultations endpoint
    - Require JWT authentication
    - Accept doctorId and userId
    - Calculate scheduledFor as next day at 10:00 AM
    - Create Consultation record with status "scheduled"
    - Generate meeting reminder notifications for patient and doctor
    - Return consultationId, scheduledFor, status
    - _Requirements: 5.3, 5.4, 5.5, 5.6_

- [x] 14. Checkpoint - Verify AI and service integrations
  - Ensure all tests pass, ask the user if questions arise.

### Phase 5: Notification System (H 14-16)

- [x] 15. Implement Notification Service
  - [x] 15.1 Create internal createNotification helper function
    - Accept userId, type, message
    - Generate unique notificationId
    - Store in DynamoDB Notifications table with isRead=false
    - Set createdAt timestamp
    - _Requirements: 6.1_
  
  - [x] 15.2 Create GET /api/notifications endpoint
    - Require JWT authentication
    - Query Notifications table by userId using GSI
    - Sort by createdAt in descending order
    - Calculate unreadCount where isRead=false
    - Return notifications array and unreadCount
    - _Requirements: 6.2, 6.5, 9.6_
  
  - [x] 15.3 Create PUT /api/notifications/:notificationId/read endpoint
    - Require JWT authentication
    - Update isRead flag to true in DynamoDB
    - Complete update within 200ms
    - Return success message
    - _Requirements: 6.3_
  
  - [ ]* 15.4 Write unit tests for notification types
    - Test medication_reminder creation
    - Test meeting_reminder creation
    - Test system_update creation
    - _Requirements: 6.4_

### Phase 6: Frontend Development (H 14-18)

- [x] 16. Create frontend project structure and authentication UI
  - [x] 16.1 Create HTML5 structure with index.html
    - Set up basic HTML5 boilerplate
    - Include meta tags for responsive design
    - Link CSS and JavaScript files
    - _Requirements: 12.1_
  
  - [x] 16.2 Create login and registration forms
    - Build registration form: name, email, password, age, gender, phone
    - Build login form: email, password
    - Add client-side validation
    - _Requirements: 1.1, 1.2_
  
  - [x] 16.3 Implement authentication JavaScript module
    - Create functions for register and login API calls
    - Store JWT token in localStorage
    - Implement token expiration handling
    - Redirect to dashboard on successful login
    - _Requirements: 1.2, 1.5_

- [x] 17. Build main dashboard UI
  - [x] 17.1 Create dashboard HTML layout
    - Build navigation menu for 6 modules
    - Create notification badge display area
    - Add logout functionality
    - _Requirements: 6.2_
  
  - [x] 17.2 Implement dashboard JavaScript controller
    - Load user profile on dashboard load
    - Fetch and display unread notification count
    - Handle navigation between modules
    - Include JWT token in all API requests
    - _Requirements: 7.1, 6.2, 10.1_

- [x] 18. Build Lab Report Analyzer UI
  - [x] 18.1 Create lab report input form
    - Add textarea for pasting lab report text
    - Add submit button with loading state
    - _Requirements: 2.1_
  
  - [x] 18.2 Create results display component
    - Display parsed lab values in table format
    - Highlight abnormal results in red
    - Show AI explanation in readable format
    - Display safety disclaimer prominently
    - _Requirements: 2.2, 2.4, 2.5_
  
  - [x] 18.3 Implement lab report analyzer JavaScript
    - Call POST /api/lab-report/analyze
    - Handle loading states and errors
    - Render results within 5 seconds
    - _Requirements: 2.4_

- [x] 19. Build AI Chat UI
  - [x] 19.1 Create chat interface
    - Build message input field
    - Create message display area with chat bubbles
    - Add loading indicator for pending responses
    - _Requirements: 3.1_
  
  - [x] 19.2 Implement chat JavaScript module
    - Call POST /api/chat/ask to submit questions
    - Poll GET /api/chat/response/:draftId for status updates
    - Display "Awaiting clinician review" message for pending drafts
    - Show approved responses with safety disclaimer
    - _Requirements: 3.1, 3.2, 3.4, 3.7_

- [x] 20. Build Medication Tracker UI
  - [x] 20.1 Create medication list display
    - Show medication cards with name, dosage, frequency
    - Add delete button for each medication
    - _Requirements: 4.3_
  
  - [x] 20.2 Create add medication form
    - Input fields: name, dosage, frequency dropdown, notes
    - Support frequency options: once_daily, twice_daily, thrice_daily, custom
    - Add custom interval input for custom frequency
    - _Requirements: 4.1, 4.5_
  
  - [x] 20.3 Implement medication tracker JavaScript
    - Call GET /api/medications to load list
    - Call POST /api/medications to add new medication
    - Call DELETE /api/medications/:medicationId to remove
    - Refresh list after add/delete operations
    - _Requirements: 4.1, 4.3, 4.4_

- [x] 21. Build Consultation Scheduling UI
  - [x] 21.1 Create doctor list display
    - Show doctor cards with name, specialization, experience, rating
    - Display calculated pricing
    - Add "Book Consultation" button for each doctor
    - _Requirements: 5.1, 5.2_
  
  - [x] 21.2 Create consultation booking flow
    - Show confirmation dialog with doctor details and price
    - Display scheduled time (next day 10:00 AM)
    - Show success message after booking
    - _Requirements: 5.3_
  
  - [x] 21.3 Implement consultation JavaScript module
    - Call GET /api/doctors to load doctor list
    - Call GET /api/doctors/:doctorId for pricing calculation
    - Call POST /api/consultations to book appointment
    - _Requirements: 5.1, 5.2, 5.3_

- [x] 22. Build Notifications UI
  - [x] 22.1 Create notifications panel
    - Display notification list sorted by date
    - Show notification type icons
    - Highlight unread notifications
    - _Requirements: 6.2, 6.5_
  
  - [x] 22.2 Implement notifications JavaScript module
    - Call GET /api/notifications to load list
    - Call PUT /api/notifications/:notificationId/read on click
    - Update unread badge count in dashboard
    - Auto-refresh notifications every 30 seconds
    - _Requirements: 6.2, 6.3, 6.5_

- [x] 23. Build Profile Management UI
  - [x] 23.1 Create profile display and edit form
    - Show current profile information
    - Add edit mode with input fields for name, email, age, gender, phone
    - Add password change section
    - _Requirements: 7.1, 7.2_
  
  - [x] 23.2 Implement profile JavaScript module
    - Call GET /api/profile to load current data
    - Call PUT /api/profile to save changes
    - Validate email format and uniqueness
    - Show success/error messages
    - _Requirements: 7.1, 7.2, 7.5_

- [x] 24. Create CSS styling for all components
  - [x] 24.1 Design responsive layout with CSS3
    - Create mobile-first responsive design
    - Style navigation, forms, buttons, cards
    - Add color scheme for healthcare theme
    - Ensure accessibility compliance (WCAG guidelines)
    - _Requirements: 12.1_

### Phase 7: Integration, Testing, and Deployment (H 18-22)

- [ ] 25. Backend integration and end-to-end wiring
  - [ ] 25.1 Wire all API endpoints to Express router
    - Register all route handlers
    - Apply JWT middleware to protected routes
    - Add error handling middleware
    - _Requirements: 10.1_
  
  - [ ] 25.2 Test medication reminder background scheduler
    - Add sample medications with near-future reminder times
    - Verify notifications are created within 60 seconds
    - Check nextReminderAt is updated correctly
    - _Requirements: 4.2_
  
  - [ ] 25.3 Test consultation booking notification flow
    - Book a consultation
    - Verify meeting reminders created for patient and doctor
    - Check notification delivery
    - _Requirements: 5.4_
  
  - [ ]* 25.4 Write integration tests for authentication flow
    - Test registration → login → protected endpoint access
    - Test expired token handling
    - Test invalid credentials
    - _Requirements: 1.1, 1.2, 1.3, 1.5_
  
  - [ ]* 25.5 Write integration tests for Doctor-in-the-Loop workflow
    - Test question submission → draft creation → clinician review → response delivery
    - Test rejection and re-generation flow
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 26. Deploy backend to EC2
  - [ ] 26.1 Package backend application
    - Create package.json with all dependencies
    - Set up npm start script
    - Configure environment variables for AWS credentials and region
    - _Requirements: 13.1_
  
  - [ ] 26.2 Deploy to EC2 instance
    - Transfer application files to EC2
    - Install dependencies with npm install
    - Start Express server on port 3000
    - Verify server starts within 10 seconds
    - _Requirements: 13.3_
  
  - [ ] 26.3 Configure process manager for auto-restart
    - Install PM2 or similar process manager
    - Configure auto-restart on failure
    - Set up startup script
    - _Requirements: 13.1_
  
  - [ ] 26.4 Verify CloudWatch logging
    - Check API request logs appear in CloudWatch
    - Verify error logs are captured
    - Confirm AI interaction logs include model, tokens, latency
    - _Requirements: 13.2, 8.3_

- [ ] 27. Deploy frontend to S3
  - [ ] 27.1 Update frontend API endpoint URLs
    - Replace localhost URLs with EC2 public IP or domain
    - Ensure all API calls use HTTPS
    - _Requirements: 12.5_
  
  - [ ] 27.2 Upload frontend files to S3 bucket
    - Upload index.html, CSS, JavaScript files
    - Set correct content types
    - Verify public read permissions
    - _Requirements: 12.1, 12.4_
  
  - [ ] 27.3 Test S3 website hosting
    - Navigate to S3 website URL
    - Verify page loads within 1 second
    - Test all navigation and API calls
    - _Requirements: 12.3_

- [ ] 28. End-to-end testing and validation
  - [ ] 28.1 Test complete user registration and login flow
    - Register new user
    - Login and verify JWT token
    - Access dashboard
    - _Requirements: 1.1, 1.2_
  
  - [ ] 28.2 Test lab report analysis end-to-end
    - Submit sample lab report
    - Verify parsing and abnormal detection
    - Check AI explanation and disclaimer display
    - _Requirements: 2.1, 2.2, 2.4, 2.5_
  
  - [ ] 28.3 Test AI chat with Doctor-in-the-Loop
    - Submit health question as patient
    - Review and approve draft as clinician
    - Verify response delivery to patient
    - _Requirements: 3.1, 3.2, 3.3, 3.4_
  
  - [ ] 28.4 Test medication tracking and reminders
    - Add medication with near-future reminder
    - Wait for reminder notification
    - Verify notification appears in dashboard
    - _Requirements: 4.1, 4.2, 6.1_
  
  - [ ] 28.5 Test consultation booking
    - View doctor list
    - Book consultation
    - Verify meeting reminder notifications
    - _Requirements: 5.1, 5.3, 5.4_
  
  - [ ] 28.6 Test profile management
    - View profile
    - Update profile fields
    - Change password
    - _Requirements: 7.1, 7.2, 7.3_

- [ ] 29. Checkpoint - Final integration verification
  - Ensure all tests pass, ask the user if questions arise.

### Phase 8: Final Polish and Demo Preparation (H 22-24)

- [ ] 30. Bug fixes and performance optimization
  - [ ] 30.1 Review and fix any identified bugs
    - Check error logs in CloudWatch
    - Fix any API errors or timeouts
    - Resolve frontend display issues
  
  - [ ] 30.2 Optimize API response times
    - Verify all endpoints meet latency requirements
    - Add caching where appropriate
    - Optimize DynamoDB queries
    - _Requirements: 1.3, 2.4, 4.3, 6.3, 7.1, 7.2, 9.6_
  
  - [ ] 30.3 Test AI fallback mechanism
    - Simulate Sonnet failure
    - Verify automatic fallback to Haiku within 2 seconds
    - Check CloudWatch logs show correct model usage
    - _Requirements: 8.2, 8.3_

- [ ] 31. Security and safety validation
  - [ ] 31.1 Verify JWT authentication on all protected endpoints
    - Test with invalid tokens
    - Test with expired tokens
    - Confirm 401 responses
    - _Requirements: 10.1, 10.2_
  
  - [ ] 31.2 Validate AI guardrails enforcement
    - Test prompts that should trigger guardrails
    - Verify diagnosis/prescription requests are blocked
    - Check safety disclaimers appear on all AI responses
    - _Requirements: 2.6, 3.6, 10.3, 10.6_
  
  - [ ] 31.3 Verify Doctor-in-the-Loop enforcement
    - Confirm no AI chat responses delivered without approval
    - Test clinician-only endpoints require correct role
    - _Requirements: 3.7, 10.5_
  
  - [ ] 31.4 Review IAM permissions and security groups
    - Verify least privilege access for all services
    - Check security group rules are restrictive
    - Confirm no sensitive data in logs
    - _Requirements: 10.7, 10.4_

- [ ] 32. Demo preparation and documentation
  - [ ] 32.1 Create sample data for demo
    - Seed 3-5 verified doctors
    - Create sample patient account
    - Create sample clinician account
    - Prepare sample lab report text
  
  - [ ] 32.2 Prepare demo script
    - Document user flows for each module
    - Prepare talking points for safety features
    - Note key technical achievements
  
  - [ ] 32.3 Final smoke test of all features
    - Run through complete demo script
    - Verify all 6 modules work correctly
    - Check notification badge updates
    - Confirm AI responses include disclaimers

- [ ] 33. Final checkpoint - Production readiness
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP delivery
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at key milestones
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- Integration tests verify end-to-end workflows
- The 24-hour timeline is aggressive; prioritize core functionality over optional testing tasks
- Doctor-in-the-Loop and AI guardrails are critical safety features and must not be skipped
- All AI responses must include safety disclaimers
- JWT authentication must be enforced on all protected endpoints
