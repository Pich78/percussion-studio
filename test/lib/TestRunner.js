// file: test/lib/TestRunner.js

/**
 * A simple class for defining and running test suites.
 * It is designed to be imported as an ES Module.
 */
export class TestRunner {
    constructor() {
        this.testResults = [];
        this.totalTests = 0;
        this.passedTests = 0;
        this.currentDescribe = 'Unnamed Suite';
    }

    /**
     * Groups related tests under a description.
     * @param {string} description The name of the test group.
     * @param {function} fn The function containing the 'it' blocks.
     */
    describe(description, fn) {
        this.currentDescribe = description;
        fn();
    }

    /**
     * Defines an individual test case.
     * @param {string} description The description of what this test should do.
     * @param {function} fn The function containing the test logic and expectations.
     */
    async it(description, fn) {
        this.totalTests++;
        try {
            // Support async test functions
            await fn();
            this.testResults.push({ describe: this.currentDescribe, description, success: true });
            this.passedTests++;
        } catch (error) {
            this.testResults.push({ describe: this.currentDescribe, description, success: false, error: error.message });
        }
    }

    /**
     * Creates an expectation object to make assertions.
     * @param {*} actual The actual value produced by the code under test.
     * @returns {object} An object with assertion methods.
     */
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

    /**
     * Renders the collected test results to an HTML element.
     * @param {string} containerId The ID of the HTML element to render into.
     */
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