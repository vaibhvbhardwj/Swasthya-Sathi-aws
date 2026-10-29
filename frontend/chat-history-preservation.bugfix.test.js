/**
 * Preservation Property Tests for Chat History Chronological Order Fix
 * 
 * Task 2: Preservation Property Tests (BEFORE implementing fix)
 * **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5**
 * 
 * These tests observe and capture the baseline behavior of all non-ordering features
 * on the UNFIXED code. They should PASS on unfixed code, confirming the behaviors
 * we need to preserve when implementing the fix.
 * 
 * Property 2: Preservation - All Other Chat Functionality Unchanged
 */

const fc = require('fast-check');
const validIsoDate = () => fc.date({
  min: new Date('2020-01-01T00:00:00.000Z'),
  max: new Date('2035-12-31T23:59:59.999Z')
}).map(d => d.toISOString());

// Mock DOM and localStorage
global.document = {
  getElementById: (id) => ({
    textContent: '',
    innerHTML: '',
    value: '',
    style: {},
    classList: { add: () => {}, remove: () => {}, toggle: () => {} },
    addEventListener: () => {},
    querySelectorAll: () => [],
    querySelector: () => null,
    scrollIntoView: () => {},
    scrollTop: 0,
    scrollHeight: 0
  }),
  querySelectorAll: () => [],
  querySelector: () => null,
  addEventListener: () => {}
};

global.window = {
  location: { hostname: 'localhost', href: '' }
};

global.localStorage = {
  storage: {},
  getItem(key) {
    return this.storage[key] || null;
  },
  setItem(key, value) {
    this.storage[key] = value;
  },
  removeItem(key) {
    delete this.storage[key];
  },
  clear() {
    this.storage = {};
  }
};

// Mock fetch
global.fetch = jest.fn();

// Load the dashboard code
const fs = require('fs');
const path = require('path');
const dashboardCode = fs.readFileSync(path.join(__dirname, 'dashboard.js'), 'utf8');

// Extract necessary functions
const loadChatHistoryMatch = dashboardCode.match(/async function loadChatHistory\(\) \{[\s\S]*?\n\}/);
if (!loadChatHistoryMatch) {
  throw new Error('Could not find loadChatHistory function in dashboard.js');
}

const formatMarkdownTextMatch = dashboardCode.match(/function formatMarkdownText\(text\) \{[\s\S]*?\n\}/);
if (!formatMarkdownTextMatch) {
  throw new Error('Could not find formatMarkdownText function in dashboard.js');
}

const pollForApprovalMatch = dashboardCode.match(/async function pollForApproval\(draftId\) \{[\s\S]*?\n\}/);
if (!pollForApprovalMatch) {
  throw new Error('Could not find pollForApproval function in dashboard.js');
}

// Create test environment
const API_BASE_URL = 'http://localhost:3000/api';
let authToken = 'test-token';

// Eval the functions
eval(formatMarkdownTextMatch[0]);
eval(pollForApprovalMatch[0]);
eval(loadChatHistoryMatch[0]);

describe('Preservation Property Tests: All Other Chat Functionality Unchanged', () => {
  beforeEach(() => {
    localStorage.clear();
    fetch.mockClear();
    jest.clearAllTimers();
  });

  /**
   * Property 2.1: Auto-scroll to bottom after loading
   * **Validates: Requirement 3.1**
   * 
   * For any chat history load event, the system SHALL auto-scroll to the bottom
   * to show the most recent message (messagesContainer.scrollTop = messagesContainer.scrollHeight)
   */
  test('Property 2.1: Auto-scroll to bottom is preserved', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate arrays of 1-10 approved messages
        fc.array(
          fc.record({
            draftId: fc.string({ minLength: 5, maxLength: 20 }),
            question: fc.string({ minLength: 5, maxLength: 100 }),
            status: fc.constant('approved'),
            aiResponse: fc.string({ minLength: 10, maxLength: 200 }),
            createdAt: validIsoDate()
          }),
          { minLength: 1, maxLength: 10 }
        ),
        async (messages) => {
          // Mock API response
          fetch.mockImplementation((url) => {
            if (url.includes('/chat/history')) {
              return Promise.resolve({
                ok: true,
                json: async () => ({ chats: messages })
              });
            }
            return Promise.reject(new Error('Unknown endpoint'));
          });

          let scrollTopSet = false;
          let finalScrollTop = 0;
          let finalScrollHeight = 1000;

          global.document.getElementById = jest.fn((id) => {
            const element = {
              innerHTML: '',
              set innerHTML(value) {
                this._innerHTML = value;
              },
              get innerHTML() {
                return this._innerHTML || '';
              },
              textContent: '',
              value: '',
              style: {},
              classList: { add: jest.fn(), remove: jest.fn(), toggle: jest.fn() },
              addEventListener: jest.fn(),
              querySelectorAll: jest.fn(() => []),
              querySelector: jest.fn(() => null),
              scrollIntoView: jest.fn(),
              scrollTop: 0,
              scrollHeight: finalScrollHeight
            };

            if (id === 'chat-messages') {
              Object.defineProperty(element, 'scrollTop', {
                get() { return finalScrollTop; },
                set(value) {
                  scrollTopSet = true;
                  finalScrollTop = value;
                }
              });
            }

            return element;
          });

          await loadChatHistory();

          // Verify auto-scroll was triggered
          expect(scrollTopSet).toBe(true);
          expect(finalScrollTop).toBe(finalScrollHeight);
        }
      ),
      { numRuns: 20 }
    );
  });

  /**
   * Property 2.2: Approved responses show edited responses when available, otherwise original
   * **Validates: Requirement 3.2**
   * 
   * For any approved message, the system SHALL display the edited response if available,
   * otherwise the original AI response.
   */
  test('Property 2.2: Approved response display logic is preserved', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate messages with and without edited responses
        fc.array(
          fc.record({
            draftId: fc.string({ minLength: 5, maxLength: 20 }),
            question: fc.string({ minLength: 5, maxLength: 100 }),
            status: fc.constant('approved'),
            aiResponse: fc.string({ minLength: 10, maxLength: 200 }),
            editedResponse: fc.option(fc.string({ minLength: 10, maxLength: 200 }), { nil: null }),
            createdAt: validIsoDate()
          }),
          { minLength: 1, maxLength: 5 }
        ),
        async (messages) => {
          fetch.mockImplementation((url) => {
            if (url.includes('/chat/history')) {
              return Promise.resolve({
                ok: true,
                json: async () => ({ chats: messages })
              });
            }
            return Promise.reject(new Error('Unknown endpoint'));
          });

          let finalHTML = '';

          global.document.getElementById = jest.fn((id) => {
            const element = {
              innerHTML: '',
              set innerHTML(value) {
                if (id === 'chat-messages') {
                  finalHTML = value;
                }
                this._innerHTML = value;
              },
              get innerHTML() {
                return this._innerHTML || '';
              },
              textContent: '',
              value: '',
              style: {},
              classList: { add: jest.fn(), remove: jest.fn(), toggle: jest.fn() },
              addEventListener: jest.fn(),
              querySelectorAll: jest.fn(() => []),
              querySelector: jest.fn(() => null),
              scrollIntoView: jest.fn(),
              scrollTop: 0,
              scrollHeight: 1000
            };
            return element;
          });

          await loadChatHistory();

          // Verify each message displays the correct response
          messages.forEach(msg => {
            const expectedResponse = msg.editedResponse || msg.aiResponse;
            // The response should be in the HTML (formatted with markdown)
            const formattedResponse = formatMarkdownText(expectedResponse);
            expect(finalHTML).toContain(formattedResponse);
          });
        }
      ),
      { numRuns: 20 }
    );
  });

  /**
   * Property 2.3: Clinician notes badge and content display for approved responses with notes
   * **Validates: Requirement 3.3**
   * 
   * For any approved message with clinician notes, the system SHALL display
   * the clinician notes badge and content.
   */
  test('Property 2.3: Clinician notes display is preserved', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate messages with and without clinician notes
        fc.array(
          fc.record({
            draftId: fc.string({ minLength: 5, maxLength: 20 }),
            question: fc.string({ minLength: 5, maxLength: 100 }),
            status: fc.constant('approved'),
            aiResponse: fc.string({ minLength: 10, maxLength: 200 }),
            clinicianNotes: fc.option(fc.string({ minLength: 10, maxLength: 200 }), { nil: null }),
            createdAt: validIsoDate()
          }),
          { minLength: 1, maxLength: 5 }
        ),
        async (messages) => {
          fetch.mockImplementation((url) => {
            if (url.includes('/chat/history')) {
              return Promise.resolve({
                ok: true,
                json: async () => ({ chats: messages })
              });
            }
            return Promise.reject(new Error('Unknown endpoint'));
          });

          let finalHTML = '';

          global.document.getElementById = jest.fn((id) => {
            const element = {
              innerHTML: '',
              set innerHTML(value) {
                if (id === 'chat-messages') {
                  finalHTML = value;
                }
                this._innerHTML = value;
              },
              get innerHTML() {
                return this._innerHTML || '';
              },
              textContent: '',
              value: '',
              style: {},
              classList: { add: jest.fn(), remove: jest.fn(), toggle: jest.fn() },
              addEventListener: jest.fn(),
              querySelectorAll: jest.fn(() => []),
              querySelector: jest.fn(() => null),
              scrollIntoView: jest.fn(),
              scrollTop: 0,
              scrollHeight: 1000
            };
            return element;
          });

          await loadChatHistory();

          // Verify clinician notes are displayed when present
          messages.forEach(msg => {
            if (msg.clinicianNotes) {
              // Should contain the clinician notes badge
              expect(finalHTML).toContain('Clinician\'s Note');
              expect(finalHTML).toContain('fa-user-md');
              // Should contain the formatted notes content
              const formattedNotes = formatMarkdownText(msg.clinicianNotes);
              expect(finalHTML).toContain(formattedNotes);
            }
          });
        }
      ),
      { numRuns: 20 }
    );
  });

  /**
   * Property 2.4: Pending review messages show pending status and start polling
   * **Validates: Requirement 3.4**
   * 
   * For any pending_review message, the system SHALL display the pending review status
   * and start polling for approval.
   */
  test('Property 2.4: Pending review handling is preserved', async () => {
    // Use jest.useFakeTimers to control polling
    jest.useFakeTimers();

    const messages = [
      {
        draftId: 'draft-pending-1',
        question: 'Pending question 1',
        status: 'pending_review',
        createdAt: '2024-01-01T10:00:00Z'
      },
      {
        draftId: 'draft-pending-2',
        question: 'Pending question 2',
        status: 'pending_review',
        createdAt: '2024-01-01T10:05:00Z'
      }
    ];

    fetch.mockImplementation((url) => {
      if (url.includes('/chat/history')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ chats: messages })
        });
      }
      // Mock polling responses
      if (url.includes('/chat/response/')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ status: 'pending_review' })
        });
      }
      return Promise.reject(new Error('Unknown endpoint'));
    });

    let finalHTML = '';

    global.document.getElementById = jest.fn((id) => {
      const element = {
        innerHTML: '',
        set innerHTML(value) {
          if (id === 'chat-messages') {
            finalHTML = value;
          }
          this._innerHTML = value;
        },
        get innerHTML() {
          return this._innerHTML || '';
        },
        textContent: '',
        value: '',
        style: {},
        classList: { add: jest.fn(), remove: jest.fn(), toggle: jest.fn() },
        addEventListener: jest.fn(),
        querySelectorAll: jest.fn(() => []),
        querySelector: jest.fn((selector) => {
          // Mock querySelector for polling updates
          if (selector && selector.includes('[data-draft-id=')) {
            return {
              innerHTML: '',
              textContent: '',
              style: {},
              classList: { add: jest.fn(), remove: jest.fn() }
            };
          }
          return null;
        }),
        scrollIntoView: jest.fn(),
        scrollTop: 0,
        scrollHeight: 1000
      };
      return element;
    });

    await loadChatHistory();

    // Verify pending status is displayed
    expect(finalHTML).toContain('pending-review');
    expect(finalHTML).toContain('Waiting for clinician approval');
    expect(finalHTML).toContain('fa-clock');

    // Verify data-draft-id attributes are present for polling
    messages.forEach(msg => {
      expect(finalHTML).toContain(`data-draft-id="${msg.draftId}"`);
    });

    // Verify polling was initiated (check that fetch is called after delay)
    const initialFetchCount = fetch.mock.calls.length;
    
    // Fast-forward time to trigger polling
    jest.advanceTimersByTime(5000);
    await Promise.resolve(); // Allow promises to resolve

    // Polling should have been triggered
    expect(fetch.mock.calls.length).toBeGreaterThan(initialFetchCount);

    jest.useRealTimers();
  });

  /**
   * Property 2.5: Markdown formatting applied to both questions and responses
   * **Validates: Requirement 3.5**
   * 
   * For any message, the system SHALL apply markdown formatting to both
   * questions and responses using formatMarkdownText().
   */
  test('Property 2.5: Markdown formatting is preserved', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate messages with markdown content
        fc.array(
          fc.record({
            draftId: fc.string({ minLength: 5, maxLength: 20 }),
            question: fc.constantFrom(
              'This is **bold** text',
              'This is *italic* text',
              'Line 1\nLine 2',
              'Mix of **bold** and *italic*'
            ),
            status: fc.constant('approved'),
            aiResponse: fc.constantFrom(
              'Response with **bold**',
              'Response with *italic*',
              'Multi\nline\nresponse',
              '**Important:** This is a note'
            ),
            createdAt: validIsoDate()
          }),
          { minLength: 1, maxLength: 3 }
        ),
        async (messages) => {
          fetch.mockImplementation((url) => {
            if (url.includes('/chat/history')) {
              return Promise.resolve({
                ok: true,
                json: async () => ({ chats: messages })
              });
            }
            return Promise.reject(new Error('Unknown endpoint'));
          });

          let finalHTML = '';

          global.document.getElementById = jest.fn((id) => {
            const element = {
              innerHTML: '',
              set innerHTML(value) {
                if (id === 'chat-messages') {
                  finalHTML = value;
                }
                this._innerHTML = value;
              },
              get innerHTML() {
                return this._innerHTML || '';
              },
              textContent: '',
              value: '',
              style: {},
              classList: { add: jest.fn(), remove: jest.fn(), toggle: jest.fn() },
              addEventListener: jest.fn(),
              querySelectorAll: jest.fn(() => []),
              querySelector: jest.fn(() => null),
              scrollIntoView: jest.fn(),
              scrollTop: 0,
              scrollHeight: 1000
            };
            return element;
          });

          await loadChatHistory();

          // Verify markdown formatting is applied
          messages.forEach(msg => {
            const formattedResponse = formatMarkdownText(msg.aiResponse);
            
            // Check that markdown is converted to HTML
            if (msg.aiResponse.includes('**')) {
              expect(formattedResponse).toContain('<strong>');
            }
            if (msg.aiResponse.includes('*') && !msg.aiResponse.includes('**')) {
              expect(formattedResponse).toContain('<em>');
            }
            if (msg.aiResponse.includes('\n')) {
              expect(formattedResponse).toContain('<br>');
            }
            
            // Verify formatted content is in the final HTML
            expect(finalHTML).toContain(formattedResponse);
          });
        }
      ),
      { numRuns: 20 }
    );
  });

  /**
   * Integration Test: All preservation properties together
   * 
   * This test verifies that all preservation properties work together
   * in a realistic scenario with mixed message types.
   */
  test('Integration: All preservation properties work together', async () => {
    const messages = [
      {
        draftId: 'draft-1',
        question: 'What is **diabetes**?',
        status: 'approved',
        aiResponse: 'Diabetes is a *chronic* condition.',
        editedResponse: 'Diabetes is a **chronic** metabolic condition.',
        clinicianNotes: 'Added more detail about metabolic aspect.',
        createdAt: '2024-01-01T10:00:00Z'
      },
      {
        draftId: 'draft-2',
        question: 'How to manage it?',
        status: 'approved',
        aiResponse: 'Diet and exercise\nare important.',
        createdAt: '2024-01-01T10:05:00Z'
      },
      {
        draftId: 'draft-3',
        question: 'What about medication?',
        status: 'pending_review',
        createdAt: '2024-01-01T10:10:00Z'
      }
    ];

    fetch.mockImplementation((url) => {
      if (url.includes('/chat/history')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ chats: messages })
        });
      }
      if (url.includes('/chat/response/')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ status: 'pending_review' })
        });
      }
      return Promise.reject(new Error('Unknown endpoint'));
    });

    let finalHTML = '';
    let scrollTopSet = false;
    let finalScrollTop = 0;
    const finalScrollHeight = 1000;

    global.document.getElementById = jest.fn((id) => {
      const element = {
        innerHTML: '',
        set innerHTML(value) {
          if (id === 'chat-messages') {
            finalHTML = value;
          }
          this._innerHTML = value;
        },
        get innerHTML() {
          return this._innerHTML || '';
        },
        textContent: '',
        value: '',
        style: {},
        classList: { add: jest.fn(), remove: jest.fn(), toggle: jest.fn() },
        addEventListener: jest.fn(),
        querySelectorAll: jest.fn(() => []),
        querySelector: jest.fn((selector) => {
          if (selector && selector.includes('[data-draft-id=')) {
            return {
              innerHTML: '',
              textContent: '',
              style: {},
              classList: { add: jest.fn(), remove: jest.fn() }
            };
          }
          return null;
        }),
        scrollIntoView: jest.fn(),
        scrollTop: 0,
        scrollHeight: finalScrollHeight
      };

      if (id === 'chat-messages') {
        Object.defineProperty(element, 'scrollTop', {
          get() { return finalScrollTop; },
          set(value) {
            scrollTopSet = true;
            finalScrollTop = value;
          }
        });
      }

      return element;
    });

    await loadChatHistory();

    // Verify all preservation properties:
    
    // 1. Auto-scroll
    expect(scrollTopSet).toBe(true);
    expect(finalScrollTop).toBe(finalScrollHeight);

    // 2. Edited response is used (not original)
    // The edited response should be formatted with markdown
    expect(finalHTML).toContain('<strong>chronic</strong> metabolic condition');
    expect(finalHTML).not.toContain('Diabetes is a <em>chronic</em> condition');

    // 3. Clinician notes are displayed
    expect(finalHTML).toContain('Clinician\'s Note');
    expect(finalHTML).toContain('Added more detail about metabolic aspect');

    // 4. Pending review status
    expect(finalHTML).toContain('pending-review');
    expect(finalHTML).toContain('Waiting for clinician approval');

    // 5. Markdown formatting
    expect(finalHTML).toContain('<strong>');
    expect(finalHTML).toContain('<br>');
  });
});
