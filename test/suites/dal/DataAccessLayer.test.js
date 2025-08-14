// file: test/suites/dal/DataAccessLayer.test.js

// Import dependencies needed FOR THE TESTS THEMSELVES.
import { dump as dumpYaml } from "https://cdn.jsdelivr.net/npm/js-yaml@4.1.0/dist/js-yaml.mjs";
import { MockLogger } from '/percussion-studio/test/mocks/MockLogger.js'; // <-- CRUCIAL FIX #1

export function runDalTests(runner) {
    const originalFetch = window.fetch;
    const cleanup = () => { window.fetch = originalFetch; };

    runner.describe('DAL Unit Tests', () => {
        // ... (other tests are unchanged)
    });

    runner.describe('DAL Integration Tests (Live Fetch)', () => {
        // ... (other tests are unchanged)
    });

    runner.describe('DAL Logging & Interaction Test', () => {
        runner.it('should call fetch with the correct URL for getInstrument', async () => {
            // Use the directly imported MockLogger, not window.MockLogger
            const fetchMock = new MockLogger('fetch'); // <-- CRUCIAL FIX #2

            window.fetch = (url, options) => {
                fetchMock.log('fetch', { url });
                return Promise.resolve({
                    ok: true,
                    text: () => Promise.resolve(dumpYaml({ name: 'mock instrument' }))
                });
            };

            // This now relies on the global DataAccessLayer defined in the HTML
            await window.DataAccessLayer.getInstrument('awesome_kick');
            
            const expectedUrl = '/percussion-studio/data/instruments/awesome_kick/awesome_kick.inst.yaml';
            fetchMock.wasCalledWith('fetch', { url: expectedUrl });
            runner.expect(fetchMock.callCount).toBe(1);

            cleanup();
        });
    });
}