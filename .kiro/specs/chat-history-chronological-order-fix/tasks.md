# Implementation Plan

- [x] 1. Write bug condition exploration test
  - **Property 1: Fault Condition** - Messages Display in Reverse Chronological Order
  - **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior - it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate messages are displayed in reverse order
  - **Scoped PBT Approach**: Scope the property to concrete failing cases with 2-5 messages in chronological order
  - Test that loadChatHistory displays messages in reverse order when API returns chronological data
  - Mock API response with messages in chronological order (e.g., timestamps [10:00, 10:05, 10:10])
  - Verify that DOM renders them in reverse order [10:10, 10:05, 10:00]
  - Run test on UNFIXED code
  - **EXPECTED OUTCOME**: Test FAILS (this is correct - it proves the bug exists)
  - Document counterexamples found (e.g., "First API message appears last in DOM")
  - Mark task complete when test is written, run, and failure is documented
  - _Requirements: 2.1, 2.2, 2.3_

- [x] 2. Write preservation property tests (BEFORE implementing fix)
  - **Property 2: Preservation** - All Other Chat Functionality Unchanged
  - **IMPORTANT**: Follow observation-first methodology
  - Observe behavior on UNFIXED code for all non-ordering features
  - Write property-based tests capturing observed behavior patterns:
    - Auto-scroll to bottom after loading (messagesContainer.scrollTop = messagesContainer.scrollHeight)
    - Approved responses show edited responses when available, otherwise original AI responses
    - Clinician notes badge and content display for approved responses with notes
    - Pending review messages show pending status and start polling
    - Markdown formatting applied to both questions and responses
  - Property-based testing generates many test cases for stronger guarantees
  - Run tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (this confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 3. Fix for chat history reverse chronological order

  - [x] 3.1 Implement the fix
    - Remove the `.reverse()` call on line 586 of `frontend/dashboard.js`
    - Change `data.chats.reverse().forEach(chat => {` to `data.chats.forEach(chat => {`
    - Verify auto-scroll behavior remains unchanged (line 632: `messagesContainer.scrollTop = messagesContainer.scrollHeight`)
    - _Bug_Condition: isBugCondition(input) where input.moduleActivated == 'ai-chat' AND input.chatsArray.length > 0 AND reverseMethodCalled(input.chatsArray)_
    - _Expected_Behavior: Messages display in chronological order with oldest at top, newest at bottom_
    - _Preservation: Auto-scroll to bottom, approved response display, clinician notes display, pending review status handling, markdown formatting_
    - _Requirements: 2.1, 2.2, 2.3, 3.1, 3.2, 3.3, 3.4, 3.5_

  - [x] 3.2 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - Messages Display in Chronological Order
    - **IMPORTANT**: Re-run the SAME test from task 1 - do NOT write a new test
    - The test from task 1 encodes the expected behavior
    - When this test passes, it confirms the expected behavior is satisfied
    - Run bug condition exploration test from step 1
    - **EXPECTED OUTCOME**: Test PASSES (confirms bug is fixed)
    - _Requirements: 2.1, 2.2, 2.3_

  - [x] 3.3 Verify preservation tests still pass
    - **Property 2: Preservation** - All Other Chat Functionality Unchanged
    - **IMPORTANT**: Re-run the SAME tests from task 2 - do NOT write new tests
    - Run preservation property tests from step 2
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)
    - Confirm all tests still pass after fix (no regressions)
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 4. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
