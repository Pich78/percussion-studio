// file: test/suites/dal/DataAccessLayer.test.js (Complete, Final Version)

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

        runner.it('should call fetch with the correct URL for getManifest', async () => {
            const fetchMock = new MockLogger('fetch');
            window.fetch = (url) => { fetchMock.log('fetch', { url }); return Promise.resolve({ ok: true, json: async () => ({}) }); };
            try {
                await DataAccessLayer.getManifest();
                fetchMock.wasCalledWith('fetch', { url: '/percussion-studio/manifest.json' });
            } finally { cleanup(); }
        });

        runner.it('should call fetch with the correct URL for getInstrumentDef', async () => {
            const fetchMock = new MockLogger('fetch');
            window.fetch = (url) => { fetchMock.log('fetch', { url }); return Promise.resolve({ ok: true, text: async () => '' }); };
            try {
                await DataAccessLayer.getInstrumentDef('my_inst');
                fetchMock.wasCalledWith('fetch', { url: '/percussion-studio/data/instruments/my_inst.instdef.yaml' });
            } finally { cleanup(); }
        });

        runner.it('should call fetch with the correct URL for getRhythm', async () => {
            const fetchMock = new MockLogger('fetch');
            window.fetch = (url) => { fetchMock.log('fetch', { url }); return Promise.resolve({ ok: true, text: async () => '' }); };
            try {
                await DataAccessLayer.getRhythm('my_rhythm');
                fetchMock.wasCalledWith('fetch', { url: '/percussion-studio/data/rhythms/my_rhythm.rthm.yaml' });
            } finally { cleanup(); }
        });

        runner.it('should call fetch with the correct URL for getPattern', async () => {
            const fetchMock = new MockLogger('fetch');
            window.fetch = (url) => { fetchMock.log('fetch', { url }); return Promise.resolve({ ok: true, text: async () => '' }); };
            try {
                await DataAccessLayer.getPattern('my_pattern');
                fetchMock.wasCalledWith('fetch', { url: '/percussion-studio/data/patterns/my_pattern.patt.yaml' });
            } finally { cleanup(); }
        });

        runner.it('should correctly parse the manifest file', async () => {
            const mockManifest = { "rhythms": ["test_rhythm"] };
            window.fetch = () => Promise.resolve({ ok: true, json: async () => mockManifest });
            const result = await DataAccessLayer.getManifest();
            runner.expect(result).toEqual(mockManifest);
        });

        runner.it('should correctly parse the sound pack YAML file', async () => {
            const mockSoundPackYaml = `name: "Test Kick Sound Pack"\nsound_files:\n  o: "test_kick.normal.wav"\n  p: "test_kick.stopped.wav"`;
            window.fetch = () => Promise.resolve({ ok: true, text: async () => mockSoundPackYaml });
            const result = await DataAccessLayer.getSoundPack('KCK', 'test_kick');
            runner.expect(result.name).toBe("Test Kick Sound Pack");
        });
    });

    runner.describe('DataAccessLayer - Negative Tests', () => {
        runner.it('should throw an error on 404 Not Found for manifest', async () => {
            window.fetch = () => Promise.resolve({ ok: false, status: 404 });
            // Corrected call: pass the async function to toThrow
            await runner.expect(() => DataAccessLayer.getManifest()).toThrow('Failed to fetch manifest');
        });

        runner.it('should throw a specific error on malformed YAML', async () => {
            const malformedYaml = `name: "Test\n  - item`; // Invalid YAML
            window.fetch = () => Promise.resolve({ ok: true, text: async () => malformedYaml });
            // Corrected call: pass the async function to toThrow
            await runner.expect(() => DataAccessLayer.getSoundPack('KCK', 'test_kick')).toThrow('Failed to parse YAML for sound pack');
        });
    });

    runner.describe('DataAccessLayer - Export Test', () => {
        runner.it('should return a Blob containing rhythm and pattern files', async () => {
            const fileLogger = new MockLogger('zip.file');
            const mockJSZip = class {
                constructor() {}
                folder(name) {
                    return {
                        file: (filename, content) => fileLogger.log('file', { path: `${name}/${filename}`, content }),
                    };
                }
                file(path, content) { fileLogger.log('file', { path, content }); }
                async generateAsync() { return new Blob(['zipped content'], { type: 'application/zip' }); }
            };

            const rhythmData = { sound_kit: { KCK: 'test' } };
            const patternsData = [{ id: 'patt1', data: { metadata: { name: 'Verse' } } }];

            const resultBlob = await DataAccessLayer.exportRhythmAsZip(rhythmData, patternsData, 'my_song', mockJSZip);

            // Assert that the function returned a Blob
            runner.expect(resultBlob instanceof Blob).toBe(true);

            // Check that the files were added to the zip object
            runner.expect(fileLogger.callCount).toBe(2);
            fileLogger.wasCalledWith('file', { path: 'my_song.rthm.yaml', content: 'sound_kit:\n  KCK: test\n' });
            fileLogger.wasCalledWith('file', { path: 'patterns/patt1.patt.yaml', content: 'metadata:\n  name: Verse\n' });
        });
    });

    // The logic to run tests and render results is now in the test file.
    await runner.runAll();
    runner.renderResults('test-results');
}
