// file: test/suites/dal/DataAccessLayer.test.js

function runDalTests(runner) {
    const originalFetch = window.fetch;
    const cleanup = () => { window.fetch = originalFetch; };

    // ===== Unit Tests for getRhythm =====
    runner.describe('DAL Unit Tests: getRhythm(id)', () => {
        // ... (tests for getRhythm remain the same, no need to copy them here again) ...
    });

    // ===== Unit Tests for getPattern =====
    runner.describe('DAL Unit Tests: getPattern(id)', () => {
        runner.it('should fetch and parse a valid pattern file', async () => {
            const mockData = { metadata: { name: "Test" } };
            const mockYaml = jsyaml.dump(mockData);
            window.fetch = async () => ({ ok: true, text: async () => mockYaml });
            const result = await DataAccessLayer.getPattern('valid_pattern');
            runner.expect(result).toEqual(mockData);
            cleanup();
        });

        runner.it('should throw an error if the pattern file is not found (404)', async () => {
            window.fetch = async () => ({ ok: false, status: 404 });
            try {
                await DataAccessLayer.getPattern('non_existent');
                throw new Error("Test failed: Expected getPattern to throw.");
            } catch (e) {
                runner.expect(e.message).toBe("Failed to fetch pattern 'non_existent'. Server responded with status: 404");
            } finally {
                cleanup();
            }
        });
    });

    // ===== Unit Tests for getInstrument =====
    runner.describe('DAL Unit Tests: getInstrument(id)', () => {
        runner.it('should fetch and parse a valid instrument file', async () => {
            const mockData = { name: "Test Kick" };
            const mockYaml = jsyaml.dump(mockData);
            window.fetch = async () => ({ ok: true, text: async () => mockYaml });
            const result = await DataAccessLayer.getInstrument('valid_instrument');
            runner.expect(result).toEqual(mockData);
            cleanup();
        });

        runner.it('should throw an error if the instrument file is not found (404)', async () => {
            window.fetch = async () => ({ ok: false, status: 404 });
            try {
                await DataAccessLayer.getInstrument('non_existent');
                throw new Error("Test failed: Expected getInstrument to throw.");
            } catch (e) {
                runner.expect(e.message).toBe("Failed to fetch instrument 'non_existent'. Server responded with status: 404");
            } finally {
                cleanup();
            }
        });
    });


    // ===== INTEGRATION TESTS (real fetch) =====
    runner.describe('DAL Integration Tests', () => {
        
        runner.it('should fetch and parse a REAL rhythm file from the server', async () => {
            const result = await DataAccessLayer.getRhythm('test_rhythm');
            const expected = { global_bpm: 95, instrument_kit: { KCK: "test_kick", SNR: "test_snare" }, playback_flow: [{ pattern: "test_pattern_a", repetitions: 2 }] };
            runner.expect(result).toEqual(expected);
        });

        runner.it('should fetch and parse a REAL pattern file from the server', async () => {
            const result = await DataAccessLayer.getPattern('test_pattern');
            const expected = { metadata: { name: "Test Pattern", metric: "4/4", resolution: 16 }, pattern_data: { KCK: "||o---|----|o---|----||", SNR: "||----|o---|----|o---||" } };
            runner.expect(result).toEqual(expected);
        });

        runner.it('should fetch and parse a REAL instrument file from the server', async () => {
            const result = await DataAccessLayer.getInstrument('test_kick');
            const expected = { name: "Test Kick Drum", symbol: "KCK", sounds: [{ letter: "o", svg: "kick.svg", wav: "kick.wav" }] };
            runner.expect(result).toEqual(expected);
        });
    });
    
    // ===== LOGGING DEMONSTRATION =====
    runner.describe('DAL Logging Demonstration', () => {
        runner.it('should log calls to its dependencies via a mock', () => {
            const mockJsYaml = new MockLogger('jsyaml');
            
            // For this test, we pretend jsyaml.load is a method on our mock
            mockJsYaml.load = (text) => {
                mockJsYaml.log('load', { text: `${text.substring(0, 15)}...` }); // Log the call
                return { mocked: true }; // Return a dummy value
            }
            
            // In a real scenario, you would inject this mock into your class.
            // Here, we just call it directly to demonstrate the logger.
            mockJsYaml.load('some yaml content');
            
            runner.expect(mockJsYaml.callCount).toBe(1);
        });
    });
}