/**
 * Bug Condition Exploration and Preservation Tests for Dashboard Lab Report Counter
 * 
 * Task 1: Bug Condition Exploration (Property 1)
 * **Validates: Requirements 2.1, 2.2, 2.3**
 * EXPECTED TO FAIL on unfixed code - confirms bug exists
 * 
 * Task 2: Preservation Tests (Property 2)
 * **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5**
 * EXPECTED TO PASS on unfixed code - confirms baseline behavior to preserve
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
    scrollIntoView: () => {}
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

// Extract and eval the loadAnalytics function
// We need to isolate it for testing
const loadAnalyticsMatch = dashboardCode.match(/async function loadAnalytics\(\) \{[\s\S]*?\n\}/);
if (!loadAnalyticsMatch) {
  throw new Error('Could not find loadAnalytics function in dashboard.js');
}

// Create a test environment with the function
const API_BASE_URL = 'http://localhost:3000/api';
let authToken = 'test-token';

// Eval the function in our test context
eval(loadAnalyticsMatch[0]);

describe('Bug Condition Exploration: Display localStorage Count When Backend Returns Zero', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    
    // Reset fetch mock
    fetch.mockClear();
    
    // Reset DOM elements
    global.document.getElementById = jest.fn((id) => {
      const element = {
        textContent: '',
        innerHTML: '',
        value: '',
        style: {},
        classList: { add: jest.fn(), remove: jest.fn(), toggle: jest.fn() },
        addEventListener: jest.fn(),
        querySelectorAll: jest.fn(() => []),
        querySelector: jest.fn(() => null),
        scrollIntoView: jest.fn()
      };
      return element;
    });
  });

  /**
   * Property 1: Fault Condition - Display localStorage Count When Backend Returns Zero
   * 
   * **Validates: Requirements 2.1, 2.2, 2.3**
   * 
   * This property tests that when:
   * - Backend API succeeds with {count: 0}
   * - localStorage contains 1, 3, or 5 lab reports
   * 
   * Then the counter should display the localStorage count (not 0).
   * 
   * EXPECTED: This test WILL FAIL on unfixed code, confirming the bug exists.
   */
  test('Property 1: Counter displays localStorage count when backend returns 0 and localStorage has reports', async () => {
    // Scoped PBT: Test with concrete failing cases (1, 3, 5 reports)
    const testCases = [1, 3, 5];
    
    for (const reportCount of testCases) {
      // Setup: Create lab reports in localStorage
      const labReports = Array.from({ length: reportCount }, (_, i) => ({
        id: `report-${i}`,
        reportText: `Test report ${i}`,
        parsedValues: [{ name: 'Test', value: '10', unit: 'mg/dL' }],
        abnormals: [],
        aiExplanation: 'Test explanation',
        analyzedAt: new Date().toISOString()
      }));
      
      localStorage.setItem('labReports', JSON.stringify(labReports));
      
      // Mock backend responses
      // Lab reports API returns {count: 0} (the bug condition)
      fetch.mockImplementation((url) => {
        if (url.includes('/lab-report/history')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ reports: [], count: 0 })
          });
        }
        // Other APIs return empty data
        if (url.includes('/medications')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ medications: [] })
          });
        }
        if (url.includes('/consultations')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ consultations: [] })
          });
        }
        if (url.includes('/chat/history')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ count: 0 })
          });
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });
      
      // Track what value was set to the counter
      let labCounterValue = null;
      global.document.getElementById = jest.fn((id) => {
        const element = {
          textContent: '',
          set textContent(value) {
            if (id === 'lab-reports-count') {
              labCounterValue = value;
            }
            this._textContent = value;
          },
          get textContent() {
            return this._textContent;
          },
          innerHTML: '',
          value: '',
          style: {},
          classList: { add: jest.fn(), remove: jest.fn(), toggle: jest.fn() },
          addEventListener: jest.fn(),
          querySelectorAll: jest.fn(() => []),
          querySelector: jest.fn(() => null),
          scrollIntoView: jest.fn()
        };
        return element;
      });
      
      // Execute: Call loadAnalytics
      await loadAnalytics();
      
      // Assert: Counter should display localStorage count, not 0
      // EXPECTED TO FAIL on unfixed code (will show 0 instead of reportCount)
      expect(labCounterValue).toBe(reportCount);
      
      // Log the counterexample if test fails
      if (labCounterValue !== reportCount) {
        console.log(`COUNTEREXAMPLE FOUND: localStorage has ${reportCount} reports, backend returns {count: 0}, counter displays ${labCounterValue} instead of ${reportCount}`);
      }
    }
  });

  /**
   * Edge Case: Empty localStorage with backend returning 0
   * 
   * This should pass even on unfixed code - it's the correct behavior.
   */
  test('Edge case: Counter displays 0 when localStorage is empty and backend returns 0', async () => {
    // Setup: Empty localStorage
    localStorage.setItem('labReports', JSON.stringify([]));
    
    // Mock backend responses
    fetch.mockImplementation((url) => {
      if (url.includes('/lab-report/history')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ reports: [], count: 0 })
        });
      }
      if (url.includes('/medications')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ medications: [] })
        });
      }
      if (url.includes('/consultations')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ consultations: [] })
        });
      }
      if (url.includes('/chat/history')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ count: 0 })
        });
      }
      return Promise.reject(new Error('Unknown endpoint'));
    });
    
    // Track counter value
    let labCounterValue = null;
    global.document.getElementById = jest.fn((id) => {
      const element = {
        textContent: '',
        set textContent(value) {
          if (id === 'lab-reports-count') {
            labCounterValue = value;
          }
          this._textContent = value;
        },
        get textContent() {
          return this._textContent;
        },
        innerHTML: '',
        value: '',
        style: {},
        classList: { add: jest.fn(), remove: jest.fn(), toggle: jest.fn() },
        addEventListener: jest.fn(),
        querySelectorAll: jest.fn(() => []),
        querySelector: jest.fn(() => null),
        scrollIntoView: jest.fn()
      };
      return element;
    });
    
    // Execute
    await loadAnalytics();
    
    // Assert: Counter should display 0 (correct behavior)
    expect(labCounterValue).toBe(0);
  });
});

describe('Property 2: Preservation - Unchanged Behavior for Non-Zero Backend Counts and API Failures', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    
    // Reset fetch mock
    fetch.mockClear();
    
    // Reset DOM elements
    global.document.getElementById = jest.fn((id) => {
      const element = {
        textContent: '',
        innerHTML: '',
        value: '',
        style: {},
        classList: { add: jest.fn(), remove: jest.fn(), toggle: jest.fn() },
        addEventListener: jest.fn(),
        querySelectorAll: jest.fn(() => []),
        querySelector: jest.fn(() => null),
        scrollIntoView: jest.fn()
      };
      return element;
    });
  });

  /**
   * Preservation Test 1: API Failure Fallback to localStorage
   * 
   * **Validates: Requirement 3.1**
   * 
   * When the backend API fails (network error, 401, 404, 500, etc.),
   * the system should fall back to localStorage count.
   * 
   * EXPECTED: This test PASSES on unfixed code (existing behavior).
   */
  test('Preservation 1: API failure causes fallback to localStorage', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 0, max: 20 }), // localStorage report count
        async (localReportCount) => {
          // Setup: Create lab reports in localStorage
          const labReports = Array.from({ length: localReportCount }, (_, i) => ({
            id: `report-${i}`,
            reportText: `Test report ${i}`,
            parsedValues: [{ name: 'Test', value: '10', unit: 'mg/dL' }],
            abnormals: [],
            aiExplanation: 'Test explanation',
            analyzedAt: new Date().toISOString()
          }));
          
          localStorage.setItem('labReports', JSON.stringify(labReports));
          
          // Mock backend API failure for lab reports
          fetch.mockImplementation((url) => {
            if (url.includes('/lab-report/history')) {
              // Simulate API failure
              return Promise.reject(new Error('Network error'));
            }
            // Other APIs succeed with empty data
            if (url.includes('/medications')) {
              return Promise.resolve({
                ok: true,
                json: async () => ({ medications: [] })
              });
            }
            if (url.includes('/consultations')) {
              return Promise.resolve({
                ok: true,
                json: async () => ({ consultations: [] })
              });
            }
            if (url.includes('/chat/history')) {
              return Promise.resolve({
                ok: true,
                json: async () => ({ count: 0 })
              });
            }
            return Promise.reject(new Error('Unknown endpoint'));
          });
          
          // Track counter value
          let labCounterValue = null;
          global.document.getElementById = jest.fn((id) => {
            const element = {
              textContent: '',
              set textContent(value) {
                if (id === 'lab-reports-count') {
                  labCounterValue = value;
                }
                this._textContent = value;
              },
              get textContent() {
                return this._textContent;
              },
              innerHTML: '',
              value: '',
              style: {},
              classList: { add: jest.fn(), remove: jest.fn(), toggle: jest.fn() },
              addEventListener: jest.fn(),
              querySelectorAll: jest.fn(() => []),
              querySelector: jest.fn(() => null),
              scrollIntoView: jest.fn()
            };
            return element;
          });
          
          // Execute
          await loadAnalytics();
          
          // Assert: Counter should use localStorage count (fallback behavior)
          expect(labCounterValue).toBe(localReportCount);
        }
      ),
      { numRuns: 10 } // Test with 10 random localStorage counts
    );
  });

  /**
   * Preservation Test 2: Non-Zero Backend Count Priority
   * 
   * **Validates: Requirement 3.1**
   * 
   * When the backend API returns a non-zero count, the system should
   * use the backend count as the primary data source, regardless of
   * localStorage content.
   * 
   * EXPECTED: This test PASSES on unfixed code (existing behavior).
   */
  test('Preservation 2: Backend non-zero count takes priority over localStorage', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 1, max: 100 }), // Backend count (non-zero)
        fc.integer({ min: 0, max: 20 }),  // localStorage count (can be different)
        async (backendCount, localReportCount) => {
          // Setup: Create lab reports in localStorage
          const labReports = Array.from({ length: localReportCount }, (_, i) => ({
            id: `report-${i}`,
            reportText: `Test report ${i}`,
            parsedValues: [{ name: 'Test', value: '10', unit: 'mg/dL' }],
            abnormals: [],
            aiExplanation: 'Test explanation',
            analyzedAt: new Date().toISOString()
          }));
          
          localStorage.setItem('labReports', JSON.stringify(labReports));
          
          // Mock backend returning non-zero count
          fetch.mockImplementation((url) => {
            if (url.includes('/lab-report/history')) {
              return Promise.resolve({
                ok: true,
                json: async () => ({ reports: [], count: backendCount })
              });
            }
            if (url.includes('/medications')) {
              return Promise.resolve({
                ok: true,
                json: async () => ({ medications: [] })
              });
            }
            if (url.includes('/consultations')) {
              return Promise.resolve({
                ok: true,
                json: async () => ({ consultations: [] })
              });
            }
            if (url.includes('/chat/history')) {
              return Promise.resolve({
                ok: true,
                json: async () => ({ count: 0 })
              });
            }
            return Promise.reject(new Error('Unknown endpoint'));
          });
          
          // Track counter value
          let labCounterValue = null;
          global.document.getElementById = jest.fn((id) => {
            const element = {
              textContent: '',
              set textContent(value) {
                if (id === 'lab-reports-count') {
                  labCounterValue = value;
                }
                this._textContent = value;
              },
              get textContent() {
                return this._textContent;
              },
              innerHTML: '',
              value: '',
              style: {},
              classList: { add: jest.fn(), remove: jest.fn(), toggle: jest.fn() },
              addEventListener: jest.fn(),
              querySelectorAll: jest.fn(() => []),
              querySelector: jest.fn(() => null),
              scrollIntoView: jest.fn()
            };
            return element;
          });
          
          // Execute
          await loadAnalytics();
          
          // Assert: Counter should use backend count (not localStorage)
          expect(labCounterValue).toBe(backendCount);
        }
      ),
      { numRuns: 10 } // Test with 10 random combinations
    );
  });

  /**
   * Preservation Test 3: Other Counters Unchanged
   * 
   * **Validates: Requirement 3.3**
   * 
   * The medications, consultations, and chats counters should continue
   * to work correctly and be unaffected by the lab report counter fix.
   * 
   * EXPECTED: This test PASSES on unfixed code (existing behavior).
   */
  test('Preservation 3: Other counters (medications, consultations, chats) display correctly', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 0, max: 20 }), // medications count
        fc.integer({ min: 0, max: 20 }), // consultations count
        fc.integer({ min: 0, max: 20 }), // chats count
        async (medCount, consultCount, chatCount) => {
          // Setup: Create data in localStorage
          const medications = Array.from({ length: medCount }, (_, i) => ({
            medicationId: `med-${i}`,
            name: `Medication ${i}`
          }));
          
          const consultations = Array.from({ length: consultCount }, (_, i) => ({
            consultationId: `consult-${i}`,
            doctorName: `Doctor ${i}`
          }));
          
          const chatHistory = Array.from({ length: chatCount }, (_, i) => ({
            draftId: `chat-${i}`,
            question: `Question ${i}`
          }));
          
          localStorage.setItem('medications', JSON.stringify(medications));
          localStorage.setItem('consultations', JSON.stringify(consultations));
          localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
          localStorage.setItem('labReports', JSON.stringify([])); // Empty lab reports
          
          // Mock backend responses
          fetch.mockImplementation((url) => {
            if (url.includes('/lab-report/history')) {
              return Promise.resolve({
                ok: true,
                json: async () => ({ reports: [], count: 0 })
              });
            }
            if (url.includes('/medications')) {
              return Promise.resolve({
                ok: true,
                json: async () => ({ medications })
              });
            }
            if (url.includes('/consultations')) {
              return Promise.resolve({
                ok: true,
                json: async () => ({ consultations })
              });
            }
            if (url.includes('/chat/history')) {
              return Promise.resolve({
                ok: true,
                json: async () => ({ count: chatCount })
              });
            }
            return Promise.reject(new Error('Unknown endpoint'));
          });
          
          // Track counter values
          let medCounterValue = null;
          let consultCounterValue = null;
          let chatCounterValue = null;
          
          global.document.getElementById = jest.fn((id) => {
            const element = {
              textContent: '',
              set textContent(value) {
                if (id === 'medications-count') {
                  medCounterValue = value;
                }
                if (id === 'consultations-count') {
                  consultCounterValue = value;
                }
                if (id === 'chats-count') {
                  chatCounterValue = value;
                }
                this._textContent = value;
              },
              get textContent() {
                return this._textContent;
              },
              innerHTML: '',
              value: '',
              style: {},
              classList: { add: jest.fn(), remove: jest.fn(), toggle: jest.fn() },
              addEventListener: jest.fn(),
              querySelectorAll: jest.fn(() => []),
              querySelector: jest.fn(() => null),
              scrollIntoView: jest.fn()
            };
            return element;
          });
          
          // Execute
          await loadAnalytics();
          
          // Assert: All other counters should display correctly
          expect(medCounterValue).toBe(medCount);
          expect(consultCounterValue).toBe(consultCount);
          expect(chatCounterValue).toBe(chatCount);
        }
      ),
      { numRuns: 10 } // Test with 10 random combinations
    );
  });

  /**
   * Preservation Test 4: Error Handling Fallback
   * 
   * **Validates: Requirement 3.1**
   * 
   * When an error occurs in the catch block (network error, etc.),
   * the system should fall back to loading all counters from localStorage.
   * 
   * EXPECTED: This test PASSES on unfixed code (existing behavior).
   */
  test('Preservation 4: Catch block error handling falls back to localStorage', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 0, max: 20 }), // lab reports count
        fc.integer({ min: 0, max: 20 }), // medications count
        fc.integer({ min: 0, max: 20 }), // consultations count
        fc.integer({ min: 0, max: 20 }), // chats count
        async (labCount, medCount, consultCount, chatCount) => {
          // Setup: Create data in localStorage
          const labReports = Array.from({ length: labCount }, (_, i) => ({
            id: `report-${i}`,
            reportText: `Test report ${i}`,
            parsedValues: [],
            abnormals: [],
            aiExplanation: 'Test',
            analyzedAt: new Date().toISOString()
          }));
          
          const medications = Array.from({ length: medCount }, (_, i) => ({
            medicationId: `med-${i}`,
            name: `Medication ${i}`
          }));
          
          const consultations = Array.from({ length: consultCount }, (_, i) => ({
            consultationId: `consult-${i}`,
            doctorName: `Doctor ${i}`
          }));
          
          const chatHistory = Array.from({ length: chatCount }, (_, i) => ({
            draftId: `chat-${i}`,
            question: `Question ${i}`
          }));
          
          localStorage.setItem('labReports', JSON.stringify(labReports));
          localStorage.setItem('medications', JSON.stringify(medications));
          localStorage.setItem('consultations', JSON.stringify(consultations));
          localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
          
          // Mock all API calls to fail (trigger catch block)
          fetch.mockImplementation(() => {
            return Promise.reject(new Error('Network error'));
          });
          
          // Track counter values
          let labCounterValue = null;
          let medCounterValue = null;
          let consultCounterValue = null;
          let chatCounterValue = null;
          
          global.document.getElementById = jest.fn((id) => {
            const element = {
              textContent: '',
              set textContent(value) {
                if (id === 'lab-reports-count') {
                  labCounterValue = value;
                }
                if (id === 'medications-count') {
                  medCounterValue = value;
                }
                if (id === 'consultations-count') {
                  consultCounterValue = value;
                }
                if (id === 'chats-count') {
                  chatCounterValue = value;
                }
                this._textContent = value;
              },
              get textContent() {
                return this._textContent;
              },
              innerHTML: '',
              value: '',
              style: {},
              classList: { add: jest.fn(), remove: jest.fn(), toggle: jest.fn() },
              addEventListener: jest.fn(),
              querySelectorAll: jest.fn(() => []),
              querySelector: jest.fn(() => null),
              scrollIntoView: jest.fn()
            };
            return element;
          });
          
          // Execute
          await loadAnalytics();
          
          // Assert: All counters should fall back to localStorage
          expect(labCounterValue).toBe(labCount);
          expect(medCounterValue).toBe(medCount);
          expect(consultCounterValue).toBe(consultCount);
          expect(chatCounterValue).toBe(chatCount);
        }
      ),
      { numRuns: 10 } // Test with 10 random combinations
    );
  });
});
