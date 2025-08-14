// file: test/suites/dal/DataAccessLayer.test.js

// This test suite is an ES Module. It exports the function that runs the tests.
// It also imports its own dependencies for creating test data.
import { dump as dumpYaml } from "https://cdn.jsdelivr.net/npm/js-yaml@4.1.0/dist/js-yaml.mjs";

// The 'export' keyword here is the crucial fix.
export function runDalTests(runner) {
    const originalFetch = window.fetch;
    const cleanup = () => { window.fetch = originalFetch; };

    runner.describe('DAL Unit Tests', () => {

        runner.it('should correctly throw a 404 error', async () => {
            window.fetch = async () => ({ ok: false, status: 404 });
            await runner.expect(() => DataAccessLayer.getPattern('non_existent'))
                  .toThrow("Failed to fetch pattern 'non_existent'. Server responded with status: 404");
            cleanup();
        });

        runner.it('should correctly throw a YAML parsing error', async () => {
            const invalidYaml = "key: value:\n  - improperly indented";
            window.fetch = async () => ({ ok: true, text: async () => invalidYaml });
            await runner.expect(() => DataAccessLayer.getRhythm('bad_syntax'))
                  .toThrow("Failed to parse YAML for rhythm 'bad_syntax'");
            cleanup();
        });
    });

    runner.describe('DAL Integration Tests (Live Fetch)', () => {
        runner.it('should fetch and parse a REAL rhythm file', async () => {
            const result = await DataAccessLayer.getRhythm('test_rhythm');
            const expected = { global_bpm: 95, instrument_kit: { KCK: "test_kick", SNR: "test_snare" }, playback_flow: [{ pattern: "test_pattern_a", repetitions: 2 }] };
            runner.expect(result).toEqual(expected);
        });

        runner.it('should fetch and parse a REAL multi-measure pattern file', async () => {
            const result = await DataAccessLayer.getPattern('test_multi_measure');
            const expectedData = {
                metadata: { name: "Test Multi Measure", metric: "2/4", resolution: 8 },
                pattern_data: [
                    { KCK: "||o-|-o||", HHC: "||x-x-||" },
                    { KCK: "||o-|--||", HHC: "||x-x-||" }
                ]
            };
            runner.expect(result).toEqual(expectedData);
        });
    });

    runner.describe('DAL Logging & Interaction Test', () => {
        runner.it('should call fetch with the correct URL for getInstrument', async () => {
            const fetchMock = new window.MockLogger('fetch');
            window.fetch = (url, options) => {
                fetchMock.log('fetch', { url });
                return Promise.resolve({
                    ok: true,
                    text: () => Promise.resolve(dumpYaml({ name: 'mock instrument' }))
                });
            };

            await DataAccessLayer.getInstrument('awesome_kick');
            
            const expectedUrl = '/percussion-studio/data/instruments/awesome_kick/awesome_kick.inst.yaml';
            fetchMock.wasCalledWith('fetch', { url: expectedUrl });
            runner.expect(fetchMock.callCount).toBe(1);

            cleanup();
        });
    });
}