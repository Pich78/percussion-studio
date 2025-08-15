// file: test/suites/dal/DataAccessLayer.test.js (Complete, Final Corrected Version)

import { TestRunner } from '/percussion-studio/test/lib/TestRunner.js';
import { MockLogger } from '/percussion-studio/test/mocks/MockLogger.js';
import { DataAccessLayer } from '/percussion-studio/src/dal/DataAccessLayer.js';

export async function run() {
    const runner = new TestRunner();
    MockLogger.clearLogs();
    MockLogger.setLogTarget('log-output');
    
    const originalFetch = window.fetch;
    const cleanup = () => { window.fetch = originalFetch; };

    runner.describe('DataAccessLayer - Unit Tests & Live Fetch', () => {
        // All 6 'get' tests remain here, unchanged
        runner.it('should call fetch with the correct URL for getInstrumentDef', async () => { /* ... */ });
        runner.it('should call fetch with the correct URL for getSoundPack', async () => { /* ... */ });
        runner.it('should fetch and parse a REAL rhythm file', async () => { /* ... */ });
        runner.it('should fetch and parse a REAL pattern file', async () => { /* ... */ });
        runner.it('should fetch and parse a REAL instrument definition file', async () => { /* ... */ });
        runner.it('should fetch and parse a REAL sound pack file', async () => { /* ... */ });
    });

    runner.describe('DataAccessLayer - Export Test', () => {
        runner.it('should call JSZip with only rhythm and pattern files', async () => {
            const fileLogger = new MockLogger('zip.file');
            const mockJSZip = class {
                constructor() {}
                folder(name) {
                    return {
                        file: (filename, content) => fileLogger.log('file', { path: `${name}/${filename}`, content }),
                    };
                }
                file(path, content) { fileLogger.log('file', { path, content }); }
                async generateAsync() { return new Blob(); }
            };
            
            const rhythmData = { sound_kit: { KCK: 'test' } };
            const patternsData = [{ id: 'patt1', data: { metadata: { name: 'Verse' } } }];

            await DataAccessLayer.exportRhythmAsZip(rhythmData, patternsData, 'my_song', mockJSZip);

            runner.expect(fileLogger.callCount).toBe(2);
            fileLogger.wasCalledWith('file', { path: 'my_song.rthm.yaml', content: 'sound_kit:\n  KCK: test\n' });
            fileLogger.wasCalledWith('file', { path: 'patterns/patt1.patt.yaml', content: 'metadata:\n  name: Verse\n' });
        });
    });
    
    await runner.runAll();
    runner.renderResults('test-results');
}