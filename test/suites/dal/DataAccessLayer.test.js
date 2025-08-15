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

    runner.describe('DataAccessLayer - Unit Tests', () => {
        runner.it('should call fetch with the correct URL for getInstrumentDef', async () => {
            const fetchMock = new MockLogger('fetch');
            window.fetch = (url) => { fetchMock.log('fetch', { url }); return Promise.resolve({ ok: true, text: () => Promise.resolve('') }); };
            try {
                await DataAccessLayer.getInstrumentDef('my_inst');
                fetchMock.wasCalledWith('fetch', { url: '/percussion-studio/data/instruments/my_inst.instdef.yaml' });
            } finally { cleanup(); }
        });

        runner.it('should call fetch with the correct URL for getSoundPack', async () => {
            const fetchMock = new MockLogger('fetch');
            window.fetch = (url) => { fetchMock.log('fetch', { url }); return Promise.resolve({ ok: true, text: () => Promise.resolve('') }); };
            try {
                await DataAccessLayer.getSoundPack('SYM', 'my_pack');
                fetchMock.wasCalledWith('fetch', { url: '/percussion-studio/data/sounds/my_pack/SYM.my_pack.sndpack.yaml' });
            } finally { cleanup(); }
        });
    });

    runner.describe('DataAccessLayer - Integration Tests (Live Fetch)', () => {
        runner.it('should fetch and parse a REAL rhythm file', async () => {
            const result = await DataAccessLayer.getRhythm('test_rhythm');
            runner.expect(result.global_bpm).toBe(95);
        });

        runner.it('should fetch and parse a REAL pattern file', async () => {
            const result = await DataAccessLayer.getPattern('test_pattern');
            runner.expect(result.metadata.name).toBe("Test Pattern");
        });

        runner.it('should fetch and parse a REAL instrument definition file', async () => {
            const result = await DataAccessLayer.getInstrumentDef('drum_kick');
            runner.expect(result.symbol).toBe("KCK");
        });

        runner.it('should fetch and parse a REAL sound pack file', async () => {
            const result = await DataAccessLayer.getSoundPack('KCK', 'test_kick');
            runner.expect(result.name).toBe("Test Kick Sound Pack");
        });
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