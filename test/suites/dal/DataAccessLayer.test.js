// file: test/suites/dal/DataAccessLayer.test.js (Complete and Correct Final Version)

import { TestRunner } from '/percussion-studio/test/lib/TestRunner.js';
import { MockLogger } from '/percussion-studio/test/mocks/MockLogger.js';
import { DataAccessLayer } from '/percussion-studio/src/dal/DataAccessLayer.js';
import { dump as dumpYaml } from "https://cdn.jsdelivr.net/npm/js-yaml@4.1.0/dist/js-yaml.mjs";

/**
 * This is the main function that the HTML harness will call.
 * It sets up and runs all tests for the DataAccessLayer.
 */
export async function run() {
    const runner = new TestRunner();

    MockLogger.clearLogs();
    MockLogger.setLogTarget('log-output');

    const originalFetch = window.fetch;
    const cleanup = () => { window.fetch = originalFetch; };

    // --- Define Test Suites (These will queue tests) ---

    runner.describe('DAL Unit Tests', () => {
        runner.it('should successfully parse valid mock YAML data', async () => {
            const mockData = { success: true };
            window.fetch = async () => ({ ok: true, text: async () => dumpYaml(mockData) });
            try {
                const result = await DataAccessLayer.getRhythm('any');
                runner.expect(result).toEqual(mockData);
            } finally {
                cleanup();
            }
        });

        runner.it('should correctly throw a 404 error on failure', async () => {
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

        runner.it('should fetch and parse a REAL instrument file', async () => {
            const result = await DataAccessLayer.getInstrument('test_kick');
            runner.expect(result.name).toBe("Test Kick Drum");
        });
    });

    runner.describe('DAL Logging & Interaction Tests', () => {
        runner.it('should call fetch with the correct URL for getRhythm', async () => {
            const fetchMock = new MockLogger('fetch');
            window.fetch = (url) => { fetchMock.log('fetch', { url }); return Promise.resolve({ ok: true, text: () => Promise.resolve('') }); };
            try {
                await DataAccessLayer.getRhythm('a_rhythm');
                fetchMock.wasCalledWith('fetch', { url: '/percussion-studio/data/rhythms/a_rhythm.rthm.yaml' });
            } finally { cleanup(); }
        });

        runner.it('should call fetch with the correct URL for getPattern', async () => {
            const fetchMock = new MockLogger('fetch');
            window.fetch = (url) => { fetchMock.log('fetch', { url }); return Promise.resolve({ ok: true, text: () => Promise.resolve('') }); };
            try {
                await DataAccessLayer.getPattern('a_pattern');
                fetchMock.wasCalledWith('fetch', { url: '/percussion-studio/data/patterns/a_pattern.patt.yaml' });
            } finally { cleanup(); }
        });

        runner.it('should call fetch with the correct URL for getInstrument', async () => {
            const fetchMock = new MockLogger('fetch');
            window.fetch = (url) => { fetchMock.log('fetch', { url }); return Promise.resolve({ ok: true, text: () => Promise.resolve('') }); };
            try {
                await DataAccessLayer.getInstrument('an_instrument');
                fetchMock.wasCalledWith('fetch', { url: '/percussion-studio/data/instruments/an_instrument/an_instrument.inst.yaml' });
            } finally { cleanup(); }
        });
    });

    runner.describe('DAL Export Tests', () => {
        runner.it('should call an injected JSZip mock with the correct file structure', async () => {
            const fileLogger = new MockLogger('zip.file');
            
            // 1. Create a local mock of the JSZip library. This is clean and self-contained.
            const mockJSZip = class {
                constructor() { this.folders = {}; }
                folder(name) {
                    this.folders[name] = {
                        file: (filename, content) => fileLogger.log('file', { path: `${name}/${filename}`, content }),
                        folder: this.folder
                    };
                    return this.folders[name];
                }
                file(filename, content) { fileLogger.log('file', { path: filename, content }); }
                async generateAsync() { return new Blob(); }
            };

            // 2. Define sample data
            const mockRhythm = { global_bpm: 120 };
            const mockPatterns = [{ id: 'patt1', data: { metadata: { name: 'Verse' } } }];
            const mockInstruments = [{ id: 'kick1', data: { name: 'Acoustic Kick' } }];

            // 3. Run the function and INJECT our mock class. No 'try...finally' is needed here.
            await DataAccessLayer.exportRhythmAsZip(mockRhythm, mockPatterns, mockInstruments, 'my_song', mockJSZip);
            
            // 4. Assert that our mock was used.
            runner.expect(fileLogger.callCount).toBe(3);
            fileLogger.wasCalledWith('file', { path: 'my_song.rthm.yaml', content: 'global_bpm: 120\n' });
            fileLogger.wasCalledWith('file', { path: 'patterns/patt1.patt.yaml', content: 'metadata:\n  name: Verse\n' });
            fileLogger.wasCalledWith('file', { path: 'instruments/kick1/kick1.inst.yaml', content: 'name: Acoustic Kick\n' });
        });
    });
    
    // --- Run Tests Sequentially and Render ---
    await runner.runAll();
    runner.renderResults('test-results');
}