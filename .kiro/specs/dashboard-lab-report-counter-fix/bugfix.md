# Bugfix Requirements Document

## Introduction

The dashboard analytics counter for lab reports displays 0 even after a user has successfully analyzed 1 or more lab reports. This bug affects the analytics dashboard's accuracy and prevents users from seeing their actual lab report analysis history count. The issue occurs because the analytics counter loads data from the backend API, but newly analyzed reports are saved to localStorage without updating the backend count, creating a data synchronization mismatch.

### Technical Context

**Affected Files:**
- `frontend/dashboard.js` - Contains `loadAnalytics()` function that loads the counter and `handleLabAnalysis()` that saves reports

**Relevant Endpoints:**
- `POST /api/lab-report/analyze` - Analyzes lab report and saves to DynamoDB (when authenticated)
- `GET /api/lab-report/history` - Retrieves user's lab report history with count

**Current Data Flow:**
1. User analyzes report → `POST /api/lab-report/analyze` → Backend saves to DynamoDB and returns `reportId`
2. Frontend saves full report data to localStorage: `labReports` array
3. Analytics loads → `GET /api/lab-report/history` → Backend returns `{ reports: [], count: 0 }`
4. Counter displays backend count (0) instead of localStorage count

**Response Structure from `/api/lab-report/history`:**
```json
{
  "reports": [],
  "count": 0
}
```

**localStorage Structure:**
```json
[
  {
    "id": "reportId or timestamp",
    "reportText": "original report text",
    "parsedValues": [...],
    "abnormals": [...],
    "aiExplanation": "...",
    "analyzedAt": "ISO timestamp"
  }
]
```

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN a user analyzes a lab report THEN the system saves the report to localStorage but the analytics counter remains at 0

1.2 WHEN the analytics dashboard loads THEN the system fetches the count from the backend API which returns 0 because the backend has no record of the localStorage-saved reports

1.3 WHEN a user analyzes multiple lab reports in a session THEN the system increments the localStorage array but the analytics counter continues to show 0 instead of the actual count

### Expected Behavior (Correct)

2.1 WHEN a user analyzes a lab report THEN the system SHALL update the analytics counter to reflect the new total count immediately

2.2 WHEN the analytics dashboard loads after analyzing reports THEN the system SHALL display the correct count of all analyzed lab reports including those saved to localStorage

2.3 WHEN a user analyzes multiple lab reports THEN the system SHALL increment the analytics counter for each successful analysis

### Unchanged Behavior (Regression Prevention)

3.1 WHEN the backend API successfully returns lab report history THEN the system SHALL CONTINUE TO use the backend count as the primary data source

3.2 WHEN a user has not analyzed any lab reports THEN the system SHALL CONTINUE TO display 0 in the analytics counter

3.3 WHEN the analytics dashboard loads other counters (medications, consultations, chats) THEN the system SHALL CONTINUE TO display their counts correctly without being affected by the lab report counter fix

3.4 WHEN a user views the lab report history list THEN the system SHALL CONTINUE TO display all previously analyzed reports from localStorage

3.5 WHEN a user clicks on a previous lab report from history THEN the system SHALL CONTINUE TO display the full analysis results correctly
