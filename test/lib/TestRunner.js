// file: test/lib/TestRunner.js

class TestRunner {
    constructor() {
        this.testResults = [];
        this.totalTests = 0;
        this.passedTests = 0;
    }

    describe(description, fn) {
        this.testResults.push({ type: 'describe', description });
        fn();
    }

    it(description, fn) {
        this.totalTests++;
        try {
            fn();
            this.testResults.push({ type: 'it', description, success: true });
            this.passedTests++;
        } catch (error) {
            this.testResults.push({ type: 'it', description, success: false, error: error.message });
        }
    }

    expect(actual) {
        return {
            toBe: (expected) => {
                if (actual !== expected) {
                    throw new Error(`Expected ${actual} to be ${expected}`);
                }
            },
            toEqual: (expected) => {
                if (JSON.stringify(actual) !== JSON.stringify(expected)) {
                    throw new Error(`Expected ${JSON.stringify(actual)} to equal ${JSON.stringify(expected)}`);
                }
            },
            toThrow: () => {
                let caught = false;
                try {
                    actual();
                } catch(e) {
                    caught = true;
                }
                if (!caught) {
                    throw new Error(`Expected function to throw an error.`);
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
        this.testResults.forEach(result => {
            if (result.type === 'describe') {
                html += `<h2>${result.description}</h2>`;
            } else if (result.type === 'it') {
                if (result.success) {
                    html += `<p style="color: green; margin-left: 20px;">✓ ${result.description}</p>`;
                } else {
                    html += `<p style="color: red; margin-left: 20px;">✗ ${result.description}<br><small style="margin-left: 20px;">${result.error}</small></p>`;
                }
            }
        });
        container.innerHTML = html;
    }
}

// Create a global instance for tests to use
const { describe, it, expect } = new TestRunner();
window.TestRunner = new TestRunner();