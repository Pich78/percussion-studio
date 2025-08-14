// file: test/suites/audio/AudioScheduler.test.js

import { TestRunner } from '/percussion-studio/test/lib/TestRunner.js';
import { MockLogger } from '/percussion-studio/test/mocks/MockLogger.js';
import { AudioScheduler } from '/percussion-studio/src/audio/AudioScheduler.js';
import { AudioPlayer } from '/percussion-studio/src/audio/AudioPlayer.js';

export async function run() {
    const runner = new TestRunner();
    MockLogger.clearLogs();
    MockLogger.setLogTarget('log-output');

    const createMockPlayer = () => new MockLogger('AudioPlayer');

    runner.describe('AudioScheduler Initialization', () => {
        runner.it('should initialize with correct default state', () => {
            const scheduler = new AudioScheduler(createMockPlayer(), null, null);
            runner.expect(scheduler.isPlaying).toBe(false);
            runner.expect(scheduler.currentTick).toBe(0);
        });
    });

    runner.describe('AudioScheduler - setRhythm (Resolution-Aware)', () => {
        runner.it('should correctly calculate total ticks for mixed-resolution patterns', () => {
            const scheduler = new AudioScheduler(createMockPlayer(), null, null);
            
            const testRhythm = {
                global_bpm: 120,
                playback_flow: [
                    { pattern: 'p1', repetitions: 1 }, // 1 measure, 8th notes
                    { pattern: 'p2', repetitions: 2 }, // 1 measure, 16th notes
                ],
                patterns: {
                    p1: { 
                        metadata: { resolution: 8 }, // 4 beats * 2 subs/beat = 8 ticks
                        pattern_data: [{}] 
                    },
                    p2: { 
                        metadata: { resolution: 16 }, // 4 beats * 4 subs/beat = 16 ticks
                        pattern_data: [{}]
                    }
                }
            };

            scheduler.setRhythm(testRhythm);
            
            // p1: 1 measure * 8 ticks/measure * 1 repetition = 8 ticks
            // p2: 1 measure * 16 ticks/measure * 2 repetitions = 32 ticks
            // Total ticks = 8 + 32 = 40
            runner.expect(scheduler.totalTicks).toBe(40);
        });

        runner.it('should throw an error if a pattern in the flow is missing', () => {
             const scheduler = new AudioScheduler(createMockPlayer(), null, null);
             const badRhythm = {
                global_bpm: 120,
                playback_flow: [{ pattern: 'ghost_pattern' }],
                patterns: {}
             };
             runner.expect(() => scheduler.setRhythm(badRhythm)).toThrow("Pattern 'ghost_pattern' not found in rhythm data.");
        });
    });
    
    await runner.runAll();
    runner.renderResults('test-results');
}

export function manualTest() { /* ... no change ... */ }