/**
 * Bug Condition Exploration Test for Chat History Chronological Order
 * 
 * Task 1: Bug Condition Exploration (Property 1)
 * **Validates: Requirements 2.1, 2.2, 2.3**
 * EXPECTED TO FAIL on unfixed code - confirms bug exists
 * 
 * This test verifies that messages are displayed in REVERSE chronological order
 * on the unfixed code (newest first, oldest last). When the test FAILS, it proves
 * the bug exists. After the fix, this same test will PASS, confirming the expected
 * behavior (oldest first, newest last).
 */

const fc = require('fast-check');

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

// Extract and eval the loadChatHistory function
const loadChatHistoryMatch = dashboardCode.match(/async function loadChatHistory\(\) \{[\s\S]*?\n\}/);
if (!loadChatHistoryMatch) {
  throw new Error('Could not find loadChatHistory function in dashboard.js');
}

// Extract formatMarkdownText function (needed by loadChatHistory)
const formatMarkdownTextMatch = dashboardCode.match(/function formatMarkdownText\(text\) \{[\s\S]*?\n\}/);
if (!formatMarkdownTextMatch) {
  throw new Error('Could not find formatMarkdownText function in dashboard.js');
}

// Extract pollForApproval function (needed by loadChatHistory)
const pollForApprovalMatch = dashboardCode.match(/async function pollForApproval\(draftId\) \{[\s\S]*?\n\}/);
if (!pollForApprovalMatch) {
  throw new Error('Could not find pollForApproval function in dashboard.js');
}

// Create a test environment with the functions
const API_BASE_URL = 'http://localhost:3000/api';
let authToken = 'test-token';

// Eval the functions in our test context
eval(formatMarkdownTextMatch[0]);
eval(pollForApprovalMatch[0]);
eval(loadChatHistoryMatch[0]);

describe('Bug Condition Exploration: Messages Display in Reverse Chronological Order', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    
    // Reset fetch mock
    fetch.mockClear();
  });

  /**
   * Property 1: Fault Condition - Messages Display in Reverse Chronological Order
   * 
   * **Validates: Requirements 2.1, 2.2, 2.3**
   * 
   * This property tests that when:
   * - API returns messages in chronological order (oldest first)
   * - Messages have identifiable timestamps or content
   * 
   * Then the DOM should display them in CHRONOLOGICAL order (oldest at top, newest at bottom).
   * 
   * EXPECTED: This test WILL FAIL on unfixed code because the code reverses the order.
   * When it fails, it confirms the bug exists.
   */
  test('Property 1: Messages should display in chronological order (oldest first, newest last)', async () => {
    // Scoped PBT: Test with concrete failing cases (reduced to 3 messages for faster execution)
    const testCases = [
      // Test case: 3 messages
      [
        { draftId: 'draft-1', question: 'Message at 10:00', status: 'approved', aiResponse: 'Response 1', createdAt: '2024-01-01T10:00:00Z' },
        { draftId: 'draft-2', question: 'Message at 10:05', status: 'approved', aiResponse: 'Response 2', createdAt: '2024-01-01T10:05:00Z' },
        { draftId: 'draft-3', question: 'Message at 10:10', status: 'approved', aiResponse: 'Response 3', createdAt: '2024-01-01T10:10:00Z' }
      ]
    ];
    
    for (const messages of testCases) {
      // Mock API response with messages in chronological order
      fetch.mockImplementation((url) => {
        if (url.includes('/chat/history')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ chats: messages })
          });
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });
      
      // Track the final HTML content of the messages container
      let finalHTML = '';
      
      global.document.getElementById = jest.fn((id) => {
        const element = {
          innerHTML: '',
          set innerHTML(value) {
            if (id === 'chat-messages') {
              // Store the final HTML content
              finalHTML = value;
            }
            this._innerHTML = value;
          },
          get innerHTML() {
            return this._innerHTML;
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
      
      // Execute: Call loadChatHistory
      // IMPORTANT: Save expected order BEFORE calling loadChatHistory
      // because reverse() mutates the original array
      const expectedOrder = messages.map(m => m.question);
      
      await loadChatHistory();
      
      // Extract the order of messages from the final HTML
      const questionMatches = [...finalHTML.matchAll(/<div class="chat-message user">(.*?)<\/div>/g)];
      const domMessages = questionMatches.map(match => match[1]);
      
      // Debug logging
      console.log('Expected (chronological) order:', expectedOrder);
      console.log('Actual DOM order:', domMessages);
      
      // EXPECTED TO FAIL on unfixed code: domMessages will be in reverse order
      expect(domMessages).toEqual(expectedOrder);
      
      // Log the counterexample if test fails
      if (JSON.stringify(domMessages) !== JSON.stringify(expectedOrder)) {
        console.log(`COUNTEREXAMPLE FOUND:`);
        console.log(`  API returned messages in order: ${expectedOrder.join(' -> ')}`);
        console.log(`  DOM displays messages in order: ${domMessages.join(' -> ')}`);
        console.log(`  Expected: Oldest message "${expectedOrder[0]}" at top`);
        console.log(`  Actual: Newest message "${domMessages[0]}" at top`);
        console.log(`  Root cause: data.chats.reverse() on line 586 reverses the chronological order`);
      }
    }
  });

  /**
   * Edge Case: Single Message
   * 
   * This should pass even on unfixed code - reversing a single-element array
   * has no effect.
   */
  test('Edge case: Single message displays correctly', async () => {
    const messages = [
      { draftId: 'draft-1', question: 'Single message', status: 'approved', aiResponse: 'Response 1', createdAt: '2024-01-01T10:00:00Z' }
    ];
    
    fetch.mockImplementation((url) => {
      if (url.includes('/chat/history')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ chats: messages })
        });
      }
      return Promise.reject(new Error('Unknown endpoint'));
    });
    
    const domMessages = [];
    
    global.document.getElementById = jest.fn((id) => {
      const element = {
        innerHTML: '',
        set innerHTML(value) {
          if (id === 'chat-messages') {
            const questionMatch = value.match(/<div class="chat-message user">(.*?)<\/div>/);
            if (questionMatch && !domMessages.includes(questionMatch[1])) {
              domMessages.push(questionMatch[1]);
            }
          }
          this._innerHTML = value;
        },
        get innerHTML() {
          return this._innerHTML;
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
    
    expect(domMessages).toEqual(['Single message']);
  });

  /**
   * Edge Case: Empty Chat History
   * 
   * This should pass on unfixed code - no messages to reverse.
   */
  test('Edge case: Empty chat history displays nothing', async () => {
    fetch.mockImplementation((url) => {
      if (url.includes('/chat/history')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ chats: [] })
        });
      }
      return Promise.reject(new Error('Unknown endpoint'));
    });
    
    let messagesContainerHTML = '';
    
    global.document.getElementById = jest.fn((id) => {
      const element = {
        innerHTML: '',
        set innerHTML(value) {
          if (id === 'chat-messages') {
            messagesContainerHTML = value;
          }
          this._innerHTML = value;
        },
        get innerHTML() {
          return this._innerHTML;
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
    
    // Should not have added any messages (container should be empty or unchanged)
    expect(messagesContainerHTML).toBe('');
  });
});
