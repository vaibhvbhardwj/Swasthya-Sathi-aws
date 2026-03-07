# Implementation Plan: Lab Report Image Upload with Chat Integration

## Overview

This implementation extends the existing lab report analyzer to accept image and PDF uploads with OCR text extraction, then integrates the analysis results with the AI chat feature. The implementation follows the existing architecture patterns using Node.js/Express backend, vanilla JavaScript frontend, AWS Bedrock for OCR, and maintains backward compatibility with manual text input.

## Tasks

- [x] 1. Set up OCR service infrastructure
  - [x] 1.1 Install and configure AWS Textract SDK dependencies
    - Add @aws-sdk/client-textract to backend/package.json
    - Configure AWS credentials and region for Textract access
    - _Requirements: 2.1, 2.2, 6.1_

  - [x] 1.2 Create OCR service module
    - Create backend/services/ocrService.js with text extraction functions
    - Implement extractTextFromImage() for JPEG, PNG, HEIC formats
    - Implement extractTextFromPDF() for multi-page PDF processing
    - Add error handling and validation for minimum text length (10 characters)
    - _Requirements: 2.1, 2.2, 2.6_

  - [ ]* 1.3 Write unit tests for OCR service
    - Test image text extraction with sample files
    - Test PDF text extraction with multi-page samples
    - Test error handling for unreadable files
    - _Requirements: 2.1, 2.2, 2.4_

- [x] 2. Implement file upload backend API
  - [x] 2.1 Add file upload middleware
    - Install and configure multer for multipart/form-data handling
    - Configure file size limit (10MB maximum)
    - Configure allowed MIME types (image/jpeg, image/png, image/heic, application/pdf)
    - Set up temporary file storage with automatic cleanup
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.6, 6.3_

  - [x] 2.2 Create file upload endpoint
    - Add POST /api/lab-report/upload endpoint to backend/routes/labReportRoutes.js
    - Validate file format and size before processing
    - Call ocrService to extract text from uploaded file
    - Pass extracted text to existing parseLabReport() function
    - Return analysis results in same format as /analyze endpoint
    - Delete temporary file after processing
    - _Requirements: 1.5, 1.7, 2.1, 2.2, 2.3, 2.5, 3.1, 3.2, 6.2, 6.3_

  - [ ]* 2.3 Write integration tests for upload endpoint
    - Test successful file upload and analysis flow
    - Test file format validation errors
    - Test file size limit enforcement
    - Test OCR failure handling
    - _Requirements: 1.5, 1.6, 2.4_

- [x] 3. Checkpoint - Ensure backend tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Implement frontend file upload UI
  - [x] 4.1 Add file upload interface to dashboard
    - Modify frontend/dashboard.html to add file input element in lab-analyzer module
    - Add visual file selection button with icon
    - Add file format and size information text
    - Style upload UI to match existing design patterns
    - _Requirements: 1.7, 7.2_

  - [x] 4.2 Implement file upload JavaScript logic
    - Add handleFileUpload() function to frontend/dashboard.js
    - Validate file format (JPEG, PNG, HEIC, PDF) client-side
    - Validate file size (10MB max) client-side
    - Display appropriate error messages for invalid files
    - Show upload progress indicator during file transmission
    - _Requirements: 1.5, 1.6, 5.1_

  - [x] 4.3 Integrate file upload with analysis flow
    - Modify handleLabAnalysis() to support both text input and file upload
    - Display OCR processing status message during text extraction
    - Display analysis status message during AI processing
    - Update status indicators as processing stages complete
    - Handle OCR errors with user-friendly messages and retry guidance
    - _Requirements: 2.3, 2.4, 3.3, 5.2, 5.3, 5.4, 5.5_

  - [x] 4.4 Maintain backward compatibility
    - Ensure manual text input continues to work unchanged
    - Provide clear UI toggle or tabs for file upload vs manual text entry
    - Allow users to switch between input methods without losing session
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [x] 5. Implement chat integration after analysis
  - [x] 5.1 Add chat integration button to results display
    - Modify displayLabResults() function in frontend/dashboard.js
    - Add "Ask AI About These Results" button to analysis results section
    - Style button to be prominent and clearly labeled
    - _Requirements: 4.1, 4.2_

  - [x] 5.2 Implement chat navigation with context passing
    - Add navigateToChat() function to handle button click
    - Switch to AI chat module view
    - Pass analysis result data (parsedValues, abnormals, aiExplanation) to chat
    - Store analysis context in sessionStorage or global variable
    - _Requirements: 4.3, 4.4_

  - [x] 5.3 Initialize chat with lab report context
    - Modify handleSendChat() to check for lab report context
    - Prepend lab report summary to first chat message if context exists
    - Format context message to include key findings and abnormal values
    - Maintain conversation history for session duration
    - _Requirements: 4.5, 4.6, 4.7_

- [x] 6. Add user feedback and status indicators
  - [x] 6.1 Implement comprehensive progress indicators
    - Add loading spinner for file upload stage
    - Add status text for OCR processing stage
    - Add status text for AI analysis stage
    - Update progress indicator as each stage completes
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

  - [x] 6.2 Add error handling and user guidance
    - Display specific error messages for each failure type
    - Provide actionable next steps in error messages
    - Add retry button for failed operations
    - Ensure 30-second processing time target for files under 5MB
    - _Requirements: 5.5, 5.6_

- [x] 7. Implement data privacy and cleanup
  - [x] 7.1 Add automatic file cleanup
    - Implement cleanup function in ocrService to delete temp files
    - Schedule cleanup 5 minutes after OCR processing completes
    - Add cleanup on server shutdown or error conditions
    - _Requirements: 6.2, 6.3_

  - [x] 7.2 Ensure HTTPS and data privacy
    - Verify all API calls use HTTPS (already configured in config.js)
    - Confirm no permanent file storage on server
    - Verify no third-party data sharing in upload flow
    - Add session cleanup for uploaded file data
    - _Requirements: 6.1, 6.4, 6.5_

- [x] 8. Final integration and testing
  - [x] 8.1 End-to-end integration testing
    - Test complete flow: upload → OCR → analysis → chat integration
    - Test with various file formats (JPEG, PNG, PDF)
    - Test with multi-page PDF files
    - Test error scenarios and recovery paths
    - Verify backward compatibility with manual text input
    - _Requirements: All requirements_

  - [x] 8.2 Performance validation
    - Verify processing time under 30 seconds for files under 5MB
    - Test with maximum file size (10MB)
    - Verify proper cleanup of temporary files
    - _Requirements: 5.6, 6.3_

- [x] 9. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- All file upload functionality integrates with existing lab report analysis logic
- OCR text extraction uses AWS Textract for high accuracy
- Chat integration reuses existing AI chat infrastructure
- Backward compatibility maintained - manual text input remains fully functional
- Security: HTTPS encryption, temporary file storage, automatic cleanup
- All tasks reference specific requirements for traceability
