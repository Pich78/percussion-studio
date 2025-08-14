// file: test/suites/dal/DataAccessLayer.test.js (CORRECTED for Test Runner)

// Wrap all tests in a function that the HTML harness can call.
function runTests(runner) {

    runner.describe('DataAccessLayer', () => {

        runner.describe('getRhythm(id)', () => {
            const originalFetch = window.fetch;
            const cleanup = () => { window.fetch = originalFetch; };

            runner.it('should fetch and parse a valid rhythm file', async () => {
                // ... (test logic remains the same)
            });

            runner.it('should throw an error if the rhythm file is not found (404)', async () => {
                // ... (test logic remains the same)
            });

            runner.it('should throw an error if the rhythm file has invalid YAML syntax', async () => {
                // ... (test logic remains the same)
            });
        });
    });
}