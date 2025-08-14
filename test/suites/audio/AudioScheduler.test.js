// file: test/suites/audio/AudioScheduler.test.js

import { TestRunner } from '/percussion-studio/test/lib/TestRunner.js';
import { MockLogger } from '/percussion-studio/test/mocks/MockLogger.js';
import { AudioScheduler } from '/percussion-studio/src/audio/AudioScheduler.js';
import { AudioPlayer } from '/percussion-studio/src/audio/AudioPlayer.js';

export async function run() {
    const runner = new TestRunner();
    MockLogger.clearLogs();
    MockLogger.setLogTarget('log-output');

    // --- Mocks ---
    const createMockPlayer = () => new MockLogger('AudioPlayer');

    // --- Test Suites ---
    runner.describe('AudioScheduler Initialization', () => {
        runner.it('should initialize with correct default state', () => {
            const scheduler = new AudioScheduler(createMockPlayer(), null, null);
            runner.expect(scheduler.isPlaying).toBe(false);
            runner.expect(scheduler.current16thNote).toBe(0);
        });
    });

    runner.describe('AudioScheduler - setRhythm', () => {
        runner.it('should store rhythm data and calculate timing information', () => {
            const scheduler = new AudioScheduler(createMockPlayer(), null, null);
            
            const testRhythm = {
                global_bpm: 120, // 2 beats per second
                playback_flow: [
                    { pattern: 'p1', repetitions: 1 }, // 1 measure * 16 = 16
                    { pattern: 'p2', repetitions: 2 }, // 2 measures * 16 = 32
                ],
                patterns: {
                    p1: { metadata: {}, pattern_data: [{ KCK: '||----------------||' }] }, // 1 measure, 16 steps
                    p2: { metadata: {}, pattern_data: [{}, {}] } // 2 measures long
                }
            };

            scheduler.setRhythm(testRhythm);
            
            // 1. Check if rhythm is stored
            runner.expect(scheduler.rhythm).toEqual(testRhythm);

            // 2. Check timing calculation (120 bpm = 0.5s/beat, 0.125s/16th)
            // Use toBeCloseTo for floating point comparisons
            const secondsPer16th = scheduler.secondsPer16thNote;
            const isClose = Math.abs(secondsPer16th - 0.125) < 0.001;
            runner.expect(isClose).toBe(true);

            // 3. Check total length calculation
            // p1 is 1 measure * 16 steps = 16
            // p2 is 2 measures * 16 steps = 32. Repeated twice = 64
            // Total should be 16 + 64 = 80
            runner.expect(scheduler.total16thNotes).toBe(80);
        });
    });
    
    await runner.runAll();
    runner.renderResults('test-results');
}

// The manualTest function remains unchanged
export function manualTest() { /* ... no change ... */ }