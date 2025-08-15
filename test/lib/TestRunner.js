// file: test/lib/TestRunner.js (Sequential Runner)

export class TestRunner {
    constructor() {
        this.queuedTests = []; // Will store functions to run, not promises.
        this.testResults = [];
        this.totalTests = 0;
        this.passedTests = 0;
        this.currentDescribe = 'Unnamed Suite';
    }

    describe(description, fn) {
        this.currentDescribe = description;
        fn();
    }

    /**
     * Queues a test to be run. It does NOT execute it immediately.
     */
    it(description, fn) {
        this.queuedTests.push({
            description,
            fn,
            describe: this.currentDescribe
        });
    }

    /**
     * Executes all queued tests sequentially, one after another.
     */
    async runAll() {
        for (const test of this.queuedTests) {
            this.totalTests++;
            try {
                // Await the test function itself.
                await test.fn();
                // If it completes without error, it's a pass.
                this.testResults.push({ describe: test.describe, description: test.description, success: true });
                this.passedTests++;
            } catch (error) {
                // If it throws an error, it's a fail.
                this.testResults.push({ describe: test.describe, description: test.description, success: false, error: error.message });
            }
        }
    }
    
    expect(actual) {
        return {
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