# Requirements Document

## Introduction

Swasthya Sathi is a cloud-native AI-powered healthcare support platform that improves patient understanding of medical reports, enables safe AI-assisted health conversations, supports medication tracking, and facilitates doctor consultations through a responsible Doctor-in-the-Loop system. The platform uses Amazon Bedrock for AI capabilities, DynamoDB for data persistence, and implements strict safety guardrails to ensure AI outputs are reviewed by qualified clinicians before reaching patients.

## Glossary

- **Platform**: The Swasthya Sathi healthcare support system
- **Patient**: A registered user seeking healthcare information or services
- **Clinician**: A verified healthcare professional who reviews AI-generated responses
- **Doctor**: A verified healthcare professional available for consultations
- **Lab_Report**: Structured or unstructured medical laboratory test results
- **AI_Engine**: Amazon Bedrock service using Claude 3 Sonnet or Claude 3 Haiku models
- **Report_Analyzer**: The subsystem that processes and explains lab reports
- **Chat_System**: The subsystem that handles patient questions with clinician oversight
- **Medication_Tracker**: The subsystem that manages medication schedules and reminders
- **Consultation_System**: The subsystem that manages doctor appointments
- **Notification_System**: The subsystem that delivers alerts and reminders
- **Profile_Manager**: The subsystem that manages user account information
- **Authentication_Service**: The subsystem that handles user login and JWT tokens
- **Abnormal_Result**: A lab value that falls outside the defined normal reference range
- **Safety_Disclaimer**: A mandatory notice that AI output is not medical advice
- **Doctor_in_the_Loop**: A safety pattern where clinicians approve AI responses before delivery
- **Consultation_Record**: A database entry representing a scheduled appointment
- **Notification**: A timestamped message delivered to a user
- **JWT_Token**: JSON Web Token used for authenticated API access
- **Guardrail**: A prompt-level constraint that prevents unsafe AI outputs

## Requirements

### Requirement 1: User Authentication

**User Story:** As a patient, I want to securely register and log in to the platform, so that my health information remains private and protected.

#### Acceptance Criteria

1. WHEN a patient submits valid registration credentials, THE Authentication_Service SHALL create a new user account with hashed password
2. WHEN a patient submits valid login credentials, THE Authentication_Service SHALL generate a JWT_Token valid for 24 hours
3. WHEN a patient submits invalid login credentials, THE Authentication_Service SHALL return an authentication error within 200ms
4. THE Authentication_Service SHALL hash all passwords using bcrypt with a salt factor of 10 or higher
5. WHEN a JWT_Token expires, THE Platform SHALL require re-authentication before allowing protected operations

### Requirement 2: Lab Report Analysis

**User Story:** As a patient, I want to paste my lab report and receive a patient-friendly explanation, so that I can understand my test results without medical training.

#### Acceptance Criteria

1. WHEN a patient submits a lab report, THE Report_Analyzer SHALL parse structured values including HbA1c, LDL, HDL, WBC, RBC, and hemoglobin
2. WHEN a parsed lab value falls outside the normal reference range, THE Report_Analyzer SHALL mark it as an Abnormal_Result
3. WHEN lab values are parsed, THE Report_Analyzer SHALL send a structured prompt to the AI_Engine within 1 second
4. WHEN the AI_Engine generates an explanation, THE Report_Analyzer SHALL display the explanation with a Safety_Disclaimer within 5 seconds of submission
5. THE Report_Analyzer SHALL include the Safety_Disclaimer text "This is not medical advice. Please consult your doctor for diagnosis and treatment."
6. THE Report_Analyzer SHALL enforce Guardrails preventing the AI_Engine from providing diagnosis, prescription advice, or medication stopping recommendations

### Requirement 3: AI Chat with Doctor-in-the-Loop

**User Story:** As a patient, I want to ask health-related questions and receive safe AI-assisted answers, so that I can get preliminary information while ensuring clinical oversight.

#### Acceptance Criteria

1. WHEN a patient submits a health question, THE Chat_System SHALL generate an AI draft response within 5 seconds
2. WHEN an AI draft is generated, THE Chat_System SHALL store the draft in DynamoDB with status "pending_review"
3. WHEN a draft is stored, THE Chat_System SHALL notify an available Clinician for review within 10 seconds
4. WHEN a Clinician approves a draft, THE Chat_System SHALL update the status to "approved" and deliver the response to the patient
5. WHEN a Clinician rejects a draft, THE Chat_System SHALL update the status to "rejected" and request a new AI draft
6. THE Chat_System SHALL enforce Guardrails restricting AI outputs from providing diagnosis, prescriptions, or emergency medical advice
7. THE Chat_System SHALL prevent delivery of any AI response to a patient without Clinician approval

### Requirement 4: Medication Tracking

**User Story:** As a patient, I want to track my medications and receive reminders, so that I can maintain my medication schedule consistently.

#### Acceptance Criteria

1. WHEN a patient adds a medication, THE Medication_Tracker SHALL store the name, dosage, frequency, and notes in DynamoDB partitioned by userId
2. WHEN a medication schedule time arrives, THE Medication_Tracker SHALL generate a reminder Notification within 60 seconds of the scheduled time
3. WHEN a patient requests their medication list, THE Medication_Tracker SHALL retrieve all medications for that userId within 500ms
4. WHEN a patient deletes a medication, THE Medication_Tracker SHALL remove the medication record and cancel future reminders within 1 second
5. THE Medication_Tracker SHALL support frequencies of once daily, twice daily, three times daily, and custom intervals

### Requirement 5: Doctor Consultation Scheduling

**User Story:** As a patient, I want to schedule a consultation with a verified doctor, so that I can receive professional medical guidance.

#### Acceptance Criteria

1. WHEN a patient requests the doctor list, THE Consultation_System SHALL display all verified Doctors with name, specialization, experience years, and rating
2. WHEN a patient views a Doctor profile, THE Consultation_System SHALL calculate pricing as base_rate plus (experience_years multiplied by 50)
3. WHEN a patient schedules a consultation, THE Consultation_System SHALL create a Consultation_Record for the next day at 10:00 AM
4. WHEN a Consultation_Record is created, THE Consultation_System SHALL generate a meeting reminder Notification for both patient and Doctor
5. WHEN a Consultation_Record is created, THE Consultation_System SHALL store userId, doctorId, scheduledFor timestamp, and status in DynamoDB
6. THE Consultation_System SHALL set initial consultation status to "scheduled"

### Requirement 6: Notification Management

**User Story:** As a patient, I want to receive and manage notifications for medications and appointments, so that I stay informed about my healthcare activities.

#### Acceptance Criteria

1. WHEN a Notification is created, THE Notification_System SHALL store notificationId, userId, type, message, isRead flag, and createdAt timestamp in DynamoDB
2. WHEN a patient views their dashboard, THE Notification_System SHALL display an unread badge count for notifications where isRead is false
3. WHEN a patient opens a Notification, THE Notification_System SHALL update the isRead flag to true within 200ms
4. THE Notification_System SHALL support notification types: medication_reminder, meeting_reminder, and system_update
5. WHEN a patient requests their notifications, THE Notification_System SHALL retrieve all notifications for that userId sorted by createdAt in descending order

### Requirement 7: Profile Management

**User Story:** As a patient, I want to view and update my profile information, so that my account details remain current and accurate.

#### Acceptance Criteria

1. WHEN a patient requests their profile, THE Profile_Manager SHALL retrieve name, email, age, gender, and phone from DynamoDB within 300ms
2. WHEN a patient updates profile fields, THE Profile_Manager SHALL validate and save the changes within 500ms
3. WHEN a patient changes their password, THE Profile_Manager SHALL hash the new password using bcrypt before storage
4. THE Profile_Manager SHALL require JWT_Token authentication for all profile operations
5. WHEN a patient updates their email, THE Profile_Manager SHALL verify the email is not already registered to another account

### Requirement 8: AI Engine Integration

**User Story:** As the platform, I want to integrate with Amazon Bedrock AI services with fallback capability, so that AI features remain available even during service degradation.

#### Acceptance Criteria

1. THE Platform SHALL use Claude 3 Sonnet as the primary AI_Engine model
2. WHEN Claude 3 Sonnet is unavailable, THE Platform SHALL automatically fallback to Claude 3 Haiku within 2 seconds
3. WHEN the AI_Engine returns a response, THE Platform SHALL log the model used, token count, and latency to CloudWatch
4. THE Platform SHALL enforce a maximum AI_Engine response time of 5 seconds before returning a timeout error
5. THE Platform SHALL use IAM roles for secure authentication to Amazon Bedrock services

### Requirement 9: Data Persistence

**User Story:** As the platform, I want to store user data in DynamoDB with efficient access patterns, so that the system scales reliably and maintains low latency.

#### Acceptance Criteria

1. THE Platform SHALL maintain a Users table with userId as partition key
2. THE Platform SHALL maintain a Doctors table with doctorId as partition key
3. THE Platform SHALL maintain a Consultations table with consultationId as partition key and userId as GSI
4. THE Platform SHALL maintain a Notifications table with notificationId as partition key and userId as GSI
5. THE Platform SHALL maintain a Medications table with medicationId as partition key and userId as GSI
6. WHEN querying by userId, THE Platform SHALL use Global Secondary Indexes to retrieve results within 300ms
7. THE Platform SHALL implement stateless backend design with no session data stored on EC2 instances

### Requirement 10: Security and Safety Guardrails

**User Story:** As a healthcare platform operator, I want to enforce strict safety and security controls, so that patient data remains protected and AI outputs remain safe.

#### Acceptance Criteria

1. THE Platform SHALL protect all API endpoints except registration and login with JWT_Token validation
2. WHEN an invalid or expired JWT_Token is presented, THE Platform SHALL return a 401 unauthorized error
3. THE Platform SHALL enforce Guardrails in all AI prompts preventing diagnosis statements, prescription recommendations, and advice to stop medications
4. THE Platform SHALL not persist Protected Health Information beyond the demo scope defined in the system design
5. THE Platform SHALL implement role-based access control where only Clinicians can approve AI chat responses
6. WHEN an AI_Engine response violates Guardrails, THE Platform SHALL reject the response and log the violation to CloudWatch
7. THE Platform SHALL use AWS IAM policies to restrict DynamoDB and Bedrock access to authorized services only

### Requirement 11: Lab Report Parser and Pretty Printer

**User Story:** As a developer, I want to parse lab reports into structured data and format them back to readable text, so that the system can reliably process and display lab information.

#### Acceptance Criteria

1. WHEN a lab report text is provided, THE Report_Analyzer SHALL parse it into a structured LabReport object containing test names and values
2. WHEN a lab report contains unrecognized format, THE Report_Analyzer SHALL return a descriptive parsing error within 500ms
3. THE Report_Analyzer SHALL include a pretty printer that formats LabReport objects back into human-readable text
4. FOR ALL valid LabReport objects, parsing the text then printing then parsing again SHALL produce an equivalent LabReport object (round-trip property)
5. THE Report_Analyzer SHALL preserve all test names, values, units, and reference ranges through the round-trip transformation

### Requirement 12: Frontend Deployment

**User Story:** As a platform operator, I want to deploy the frontend on Amazon S3 with public access, so that patients can access the application through a web browser.

#### Acceptance Criteria

1. THE Platform SHALL host all HTML5, CSS3, and JavaScript files on Amazon S3
2. THE Platform SHALL configure the S3 bucket for static website hosting with index.html as the default document
3. WHEN a patient navigates to the S3 website URL, THE Platform SHALL serve the dashboard page within 1 second
4. THE Platform SHALL configure S3 bucket policies to allow public read access to frontend assets
5. THE Platform SHALL serve all frontend assets over HTTPS

### Requirement 13: Backend Deployment

**User Story:** As a platform operator, I want to deploy the backend on Amazon EC2 with proper monitoring, so that the API services run reliably and issues are detected quickly.

#### Acceptance Criteria

1. THE Platform SHALL deploy the Node.js Express backend on Amazon EC2 instances
2. THE Platform SHALL configure CloudWatch logging for all API requests, errors, and AI_Engine interactions
3. WHEN the EC2 instance starts, THE Platform SHALL initialize the Express server on port 3000 within 10 seconds
4. THE Platform SHALL configure security groups to allow inbound HTTPS traffic on port 443 and HTTP traffic on port 80
5. THE Platform SHALL implement health check endpoint at /health that returns status 200 when services are operational
