// file: test/suites/dal/DataAccessLayer.test.js (snippet to replace)

// ... all the import statements at the top remain the same ...

export async function run() {
    const runner = new TestRunner();

    MockLogger.clearLogs();
    MockLogger.setLogTarget('log-output');

    const originalFetch = window.fetch;
    const cleanup = () => { window.fetch = originalFetch; };

    // --- All describe/it blocks remain exactly the same ---
    // They will now queue tests instead of running them.
    runner.describe('DAL Unit Tests', () => { /* ... no changes inside ... */ });
    runner.describe('DAL Integration Tests (Live Fetch)', () => { /* ... no changes inside ... */ });
    runner.describe('DAL Logging & Interaction Test', () => { /* ... no changes inside ... */ });

    // --- This is the key change in this file ---
    // Use the new sequential runner method.
    await runner.runAll();
    
    // Now render the results.
    runner.renderResults('test-results');
}