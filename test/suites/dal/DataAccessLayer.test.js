// file: test/suites/dal/DataAccessLayer.test.js (Complete and Correct Version)

// ========================================================================
// CRITICAL: These imports make the classes available within this file.
// ========================================================================
import { TestRunner } from '/percussion-studio/test/lib/TestRunner.js';
import { MockLogger } from '/percussion-studio/test/mocks/MockLogger.js';
import { DataAccessLayer } from '/percussion-studio/src/dal/DataAccessLayer.js';
import { dump as dumpYaml } from "https://cdn.jsdelivr.net/npm/js-yaml@4.1.0/dist/js-yaml.mjs";

/**
 * This is the main function that the HTML harness will call.
 * It sets up and runs all tests for the DataAccessLayer.
 */
export async function run() {
    const runner = new TestRunner(); // This will now work because of the import above.

    MockLogger.clearLogs();
    MockLogger.setLogTarget('log-output');

    const originalFetch = window.fetch;
    const cleanup = () => { window.fetch = originalFetch; };

    // --- Define Test Suites (These will queue tests) ---

    runner.describe('DAL Unit Tests', () => {
        runner.it('should correctly throw a 404 error', async () => {
            window.fetch = async () => ({ ok: false, status: 404 });
            try {
                await runner.expect(() => DataAccessLayer.getPattern('non_existent'))
                      .toThrow("Failed to fetch pattern 'non_existent'. Server responded with status: 404");
            } finally {
                cleanup();
            }
        });

        runner.it('should correctly throw a YAML parsing error', async () => {
            window.fetch = async () => ({ ok: true, text: async () => "key: value:\n  - invalid" });
            try {
                await runner.expect(() => DataAccessLayer.getRhythm('bad_syntax'))
                      .toThrow("Failed to parse YAML for rhythm 'bad_syntax'");
            } finally {
                cleanup();
            }
        });
    });

    runner.describe('DAL Integration Tests (Live Fetch)', () => {
        runner.it('should fetch and parse a REAL rhythm file', async () => {
            const result = await DataAccessLayer.getRhythm('test_rhythm');
            runner.expect(result.global_bpm).toBe(95);
        });

        runner.it('should fetch and parse a REAL multi-measure pattern file', async () => {
            const result = await DataAccessLayer.getPattern('test_multi_measure');
            runner.expect(result.metadata.name).toBe("Test Multi Measure");
        });
    });

    runner.describe('DAL Logging & Interaction Test', () => {
        runner.it('should call fetch with the correct URL for getInstrument', async () => {
            const fetchMock = new MockLogger('fetch');
            window.fetch = (url) => {
                fetchMock.log('fetch', { url });
                return Promise.resolve({ ok: true, text: () => Promise.resolve(dumpYaml({ name: 'mock' })) });
            };
            try {
                await DataAccessLayer.getInstrument('awesome_kick');
                const expectedUrl = '/percussion-studio/data/instruments/awesome_kick/awesome_kick.inst.yaml';
                fetchMock.wasCalledWith('fetch', { url: expectedUrl });
                runner.expect(fetchMock.callCount).toBe(1);
            } finally {
                cleanup();
            }
        });
    });
    
    // --- Run Tests Sequentially and Render ---
    await runner.runAll();
    runner.renderResults('test-results');
}