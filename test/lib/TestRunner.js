// file: test/lib/TestRunner.js

export class TestRunner {
    constructor() {
        this.testResults = [];
        this.totalTests = 0;
        this.passedTests = 0;
        this.currentDescribe = 'Unnamed Suite';
        this.pendingTests = []; // <-- ADD THIS: To track running tests
    }

    describe(description, fn) {
        this.currentDescribe = description;
        fn();
    }

    it(description, fn) {
        // This is the core change. We now wrap the test execution in a promise
        // and store that promise so we can wait for it later.
        const testPromise = (async () => {
            this.totalTests++;
            try {
                await fn();
                this.testResults.push({ describe: this.currentDescribe, description, success: true });
                this.passedTests++;
            } catch (error) {
                this.testResults.push({ describe: this.currentDescribe, description, success: false, error: error.message });
            }
        })(); // Immediately invoke the async function
        
        this.pendingTests.push(testPromise); // <-- ADD THIS
    }

    /**
     * Waits for all queued tests to complete.
     */
    async awaitForAll() {
        await Promise.all(this.pendingTests);
    }

    // ... The 'expect' and 'renderResults' methods remain exactly the same ...
    expect(actual) { /* ... no change ... */ }
    renderResults(containerId) { /* ... no change ... */ }
}