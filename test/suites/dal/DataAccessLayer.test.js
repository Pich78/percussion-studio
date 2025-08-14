// file: test/suites/dal/DataAccessLayer.test.js

function runTests(runner) {

    // ===== UNIT TESTS (with mocks) =====
    runner.describe('DataAccessLayer - Unit Tests', () => {

        runner.describe('getRhythm(id)', () => {
            const originalFetch = window.fetch;
            const cleanup = () => { window.fetch = originalFetch; };

            runner.it('should fetch and parse a valid rhythm file', async () => {
                const mockRhythmData = {
                    global_bpm: 120,
                    instrument_kit: { KCK: "acoustic_kick" },
                    playback_flow: [{ pattern: "rock_verse", repetitions: 4 }]
                };
                const mockYamlText = jsyaml.dump(mockRhythmData);

                window.fetch = async (url) => ({
                    ok: true,
                    status: 200,
                    text: async () => mockYamlText
                });

                try {
                    const result = await DataAccessLayer.getRhythm('valid_rhythm');
                    runner.expect(result).toEqual(mockRhythmData);
                } finally {
                    cleanup();
                }
            });

            runner.it('should throw an error if the rhythm file is not found (404)', async () => {
                window.fetch = async (url) => ({ ok: false, status: 404 });

                try {
                    await DataAccessLayer.getRhythm('non_existent_rhythm');
                    throw new Error("Test failed: Expected getRhythm to throw, but it did not.");
                } catch (error) {
                    runner.expect(error.message).toBe("Failed to fetch rhythm 'non_existent_rhythm'. Server responded with status: 404");
                } finally {
                    cleanup();
                }
            });

            runner.it('should throw an error if the rhythm file has invalid YAML syntax', async () => {
                const invalidYamlText = "global_bpm: 120\n instrument_kit: { KCK: acoustic_kick } \n - pattern: oops";
                window.fetch = async (url) => ({
                    ok: true,
                    status: 200,
                    text: async () => invalidYamlText
                });

                try {
                    await DataAccessLayer.getRhythm('bad_syntax_rhythm');
                    throw new Error("Test failed: Expected getRhythm to throw for bad YAML, but it did not.");
                } catch (error) {
                    const expected = error.message.includes("Failed to parse YAML for rhythm 'bad_syntax_rhythm'");
                    runner.expect(expected).toBe(true);
                } finally {
                    cleanup();
                }
            });
        });
    });

    // ===== INTEGRATION TESTS (real fetch) =====
    runner.describe('DataAccessLayer - Integration Tests', () => {
        
        runner.it('should fetch and parse a REAL rhythm file from the server', async () => {
            try {
                // This calls the actual getRhythm method with a real file ID
                const result = await DataAccessLayer.getRhythm('test_rhythm');

                // Define what we expect the content of the real file to be
                const expectedData = {
                    global_bpm: 95,
                    instrument_kit: { KCK: "test_kick", SNR: "test_snare" },
                    playback_flow: [{ pattern: "test_pattern_a", repetitions: 2 }]
                };

                runner.expect(result).toEqual(expectedData);

            } catch (error) {
                // If this test fails, it will be very informative. It could be a
                // pathing issue, a CORS problem, or a genuine 404.
                throw new Error(`Integration test failed: ${error.message}`);
            }
        });
    });
}