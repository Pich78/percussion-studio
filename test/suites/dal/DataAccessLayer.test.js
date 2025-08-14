// file: test/suites/dal/DataAccessLayer.test.js

function runDalTests(runner) {
    const originalFetch = window.fetch;
    const cleanup = () => { window.fetch = originalFetch; };

    runner.describe('DAL Unit Tests', () => {
        
        runner.it('getPattern should throw 404 error correctly', async () => {
            window.fetch = async () => ({ ok: false, status: 404 });
            try {
                await DataAccessLayer.getPattern('non_existent');
                throw new Error("Test failed.");
            } catch (e) {
                runner.expect(e.message).toBe("Failed to fetch pattern 'non_existent'. Server responded with status: 404");
            } finally { cleanup(); }
        });

        runner.it('getInstrument should throw 404 error correctly', async () => {
            window.fetch = async () => ({ ok: false, status: 404 });
            try {
                await DataAccessLayer.getInstrument('non_existent');
                throw new Error("Test failed.");
            } catch (e) {
                runner.expect(e.message).toBe("Failed to fetch instrument 'non_existent'. Server responded with status: 404");
            } finally { cleanup(); }
        });

        runner.it('should throw an error for invalid YAML', async () => {
            window.fetch = async () => ({ ok: true, text: async () => "key: value: invalid" });
            try {
                await DataAccessLayer.getRhythm('bad_syntax');
                throw new Error("Test failed.");
            } catch (e) {
                runner.expect(e.message.includes("Failed to parse YAML for rhythm 'bad_syntax'")).toBe(true);
            } finally { cleanup(); }
        });
    });

    runner.describe('DAL Integration Tests (Live Fetch)', () => {
        runner.it('should fetch and parse a REAL rhythm file', async () => {
            const result = await DataAccessLayer.getRhythm('test_rhythm');
            runner.expect(result.global_bpm).toBe(95);
        });

        runner.it('should fetch and parse a REAL pattern file', async () => {
            const result = await DataAccessLayer.getPattern('test_pattern');
            runner.expect(result.metadata.name).toBe("Test Pattern");
        });

        runner.it('should fetch and parse a REAL instrument file', async () => {
            const result = await DataAccessLayer.getInstrument('test_kick');
            runner.expect(result.name).toBe("Test Kick Drum");
        });
    });

    runner.describe('DAL Logging & Interaction Test', () => {

        runner.it('should call fetch with the correct URL for getRhythm', async () => {
            // Setup the mock
            const fetchMock = new MockLogger('fetch');
            // This is our mock's behavior. It logs the call and returns a valid response.
            window.fetch = (url, options) => {
                fetchMock.log('fetch', { url }); 
                return Promise.resolve({
                    ok: true,
                    text: () => Promise.resolve('global_bpm: 100')
                });
            };

            try {
                await DataAccessLayer.getRhythm('my_song');

                // Verify the mock was called correctly
                const expectedUrl = '/percussion-studio/data/rhythms/my_song.rthm.yaml';
                fetchMock.wasCalledWith('fetch', { url: expectedUrl });
                runner.expect(fetchMock.callCount).toBe(1);

            } finally {
                cleanup();
            }
        });
    });
}