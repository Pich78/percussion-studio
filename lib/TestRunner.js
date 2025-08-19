// file: test/lib/TestRunner.js (Upgraded with beforeEach/afterEach Hooks)

export class TestRunner {
    constructor() {
        this.queuedTests = [];
        this.testResults = [];
        this.totalTests = 0;
        this.passedTests = 0;
        this.currentDescribe = 'Unnamed Suite';

        // --- NEW: Properties to store the hooks for the current suite ---
        this.currentBeforeEach = null;
        this.currentAfterEach = null;
    }

    describe(description, fn) {
        this.currentDescribe = description;

        // --- NEW: Reset hooks at the start of a new suite to prevent leaks ---
        this.currentBeforeEach = null;
        this.currentAfterEach = null;

        fn(); // This synchronously calls beforeEach, afterEach, and it() within the suite
    }

    // --- NEW: Method to register a beforeEach hook for the current suite ---
    beforeEach(fn) {
        this.currentBeforeEach = fn;
    }
    
    // --- NEW: Method to register an afterEach hook for the current suite ---
    afterEach(fn) {
        this.currentAfterEach = fn;
    }

    /**
     * Queues a test to be run.
     * --- MODIFIED: It now also captures the hooks that are active for its suite. ---
     */
    it(description, fn) {
        this.queuedTests.push({
            description,
            fn,
            describe: this.currentDescribe,
            before: this.currentBeforeEach, // Capture the current beforeEach
            after: this.currentAfterEach   // Capture the current afterEach
        });
    }

    /**
     * Executes all queued tests sequentially.
     * --- MODIFIED: It now runs the captured hooks before and after each test. ---
     */
    async runAll() {
        for (const test of this.queuedTests) {
            this.totalTests++;

            // Use a try...finally block to GUARANTEE that the afterEach hook runs
            try {
                // Run the before hook if it exists for this test's suite
                if (test.before) {
                    await test.before();
                }
                
                // Await the test function itself.
                await test.fn();

                // If it completes without error, it's a pass.
                this.testResults.push({ describe: test.describe, description: test.description, success: true });
                this.passedTests++;
            } catch (error) {
                // If it throws an error, it's a fail.
                this.testResults.push({ describe: test.describe, description: test.description, success: false, error: error.message });
            } finally {
                // Run the after hook if it exists, regardless of success or failure
                if (test.after) {
                    await test.after();
                }
            }
        }
    }
    
    expect(actual) {
        const expectObject = {
            toBe: (expected) => {
                if (actual !== expected) {
                    throw new Error(`Expected ${JSON.stringify(actual)} to be ${JSON.stringify(expected)}`);
                }
            },
            toEqual: (expected) => {
                if (JSON.stringify(actual) !== JSON.stringify(expected)) {
                    throw new Error(`Expected ${JSON.stringify(actual)} to equal ${JSON.stringify(expected)}`);
                }
            },
            toBeInstanceOf: (expectedClass) => {
                if (!(actual instanceof expectedClass)) {
                    throw new Error(`Expected ${actual} to be an instance of ${expectedClass.name}`);
                }
            },
            toThrow: async (expectedErrorMessage) => {
                let caught = false;
                let errorMessage = '';
                try {
                    await actual();
                } catch (e) {
                    caught = true;
                    errorMessage = e.message;
                }
                if (!caught) {
                    throw new Error(`Expected function to throw an error, but it did not.`);
                }
                if (expectedErrorMessage && !errorMessage.includes(expectedErrorMessage)) {
                     throw new Error(`Expected error message to include "${expectedErrorMessage}", but got "${errorMessage}".`);
                }
            }
        };

        expectObject.not = {
            toBe: (expected) => {
                if (actual === expected) {
                    throw new Error(`Expected ${JSON.stringify(actual)} not to be ${JSON.stringify(expected)}`);
                }
            },
            toEqual: (expected) => {
                if (JSON.stringify(actual) === JSON.stringify(expected)) {
                    throw new Error(`Expected ${JSON.stringify(actual)} not to equal ${JSON.stringify(expected)}`);
                }
            },
            toBeInstanceOf: (expectedClass) => {
                if (actual instanceof expectedClass) {
                    throw new Error(`Expected ${actual} not to be an instance of ${expectedClass.name}`);
                }
            }
        };

        return expectObject;
    }
    
    renderResults(containerId) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error('TestRunner: Container element not found.');
            return;
        }

        let html = `<h1>Test Results (${this.passedTests}/${this.totalTests} passed)</h1>`;
        let lastDescribe = '';
        this.testResults.forEach(result => {
            if (result.describe !== lastDescribe) {
                html += `<h2>${result.describe}</h2>`;
                lastDescribe = result.describe;
            }
            if (result.success) {
                html += `<p style="color: green; margin-left: 20px;">✓ ${result.description}</p>`;
            } else {
                html += `<p style="color: red; margin-left: 20px;">✗ ${result.description}<br><small style="margin-left: 20px; color: #555;">${result.error}</small></p>`;
            }
        });
        container.innerHTML = html;
    }
}