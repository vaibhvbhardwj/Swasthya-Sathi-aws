# Implementation Plan

- [x] 1. Write bug condition exploration test
  - **Property 1: Fault Condition** - Display localStorage Count When Backend Returns Zero
  - **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior - it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate the bug exists
  - **Scoped PBT Approach**: Scope the property to concrete failing cases where backend returns `{count: 0}` while localStorage contains 1, 3, or 5 lab reports
  - Test that when backend API succeeds with `count: 0` and localStorage contains lab reports, the counter displays the localStorage count (not 0)
  - The test assertions should verify: counter displays localStorage.length when backend count is 0 and localStorage has reports
  - Run test on UNFIXED code
  - **EXPECTED OUTCOME**: Test FAILS (this is correct - it proves the bug exists)
  - Document counterexamples found (e.g., "localStorage has 3 reports, backend returns {count: 0}, counter displays 0 instead of 3")
  - Mark task complete when test is written, run, and failure is documented
  - _Requirements: 2.1, 2.2, 2.3_

- [x] 2. Write preservation property tests (BEFORE implementing fix)
  - **Property 2: Preservation** - Unchanged Behavior for Non-Zero Backend Counts and API Failures
  - **IMPORTANT**: Follow observation-first methodology
  - Observe behavior on UNFIXED code for non-buggy inputs:
    - API failure scenarios → observe fallback to localStorage
    - Backend returning non-zero counts → observe backend count is used
    - Other counters (medications, consultations, chats) → observe their display logic
    - Error handling in catch block → observe localStorage fallback
  - Write property-based tests capturing observed behavior patterns:
    - For all API failures, counter uses localStorage count
    - For all non-zero backend counts, counter uses backend count
    - For all other analytics counters, behavior is unchanged
    - For all error scenarios, fallback to localStorage works
  - Property-based testing generates many test cases for stronger guarantees
  - Run tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (this confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 3. Fix lab report counter to use localStorage when backend returns zero

  - [x] 3.1 Implement the fix in loadAnalytics()
    - Modify the lab reports section in `frontend/dashboard.js` (lines 149-158)
    - Add logic to check if backend count is 0 when API succeeds
    - When backend count is 0, check localStorage for actual report count
    - If localStorage has reports, use localStorage count instead of 0
    - Preserve existing else block for API failures (unchanged)
    - Add console.log for debugging when using localStorage count due to backend returning 0
    - _Bug_Condition: isBugCondition(input) where input.backendResponse.ok === true AND input.backendResponse.data.count === 0 AND input.localStorageData.length > 0_
    - _Expected_Behavior: counter displays localStorage count when backend returns 0 and localStorage has reports_
    - _Preservation: API failure fallback, non-zero backend count priority, other counters, and error handling remain unchanged_
    - _Requirements: 2.1, 2.2, 2.3, 3.1, 3.2, 3.3, 3.4, 3.5_

  - [x] 3.2 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - Display localStorage Count When Backend Returns Zero
    - **IMPORTANT**: Re-run the SAME test from task 1 - do NOT write a new test
    - The test from task 1 encodes the expected behavior
    - When this test passes, it confirms the expected behavior is satisfied
    - Run bug condition exploration test from step 1
    - **EXPECTED OUTCOME**: Test PASSES (confirms bug is fixed)
    - _Requirements: 2.1, 2.2, 2.3_

  - [x] 3.3 Verify preservation tests still pass
    - **Property 2: Preservation** - Unchanged Behavior for Non-Zero Backend Counts and API Failures
    - **IMPORTANT**: Re-run the SAME tests from task 2 - do NOT write new tests
    - Run preservation property tests from step 2
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)
    - Confirm all tests still pass after fix (no regressions)
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 4. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
