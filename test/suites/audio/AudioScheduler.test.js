// file: test/suites/audio/AudioScheduler.test.js

import { TestRunner } from '/percussion-studio/test/lib/TestRunner.js';
import { MockLogger } from '/percussion-studio/test/mocks/MockLogger.js';
import { AudioScheduler } from '/percussion-studio/src/audio/AudioScheduler.js';
import { AudioPlayer } from '/percussion-studio/src/audio/AudioPlayer.js';

/**
 * This function runs the automated, headless tests.
 */
export async function run() {
    const runner = new TestRunner();
    MockLogger.clearLogs();
    MockLogger.setLogTarget('log-output');

    // --- Define Test Suites ---
    runner.describe('AudioScheduler Initialization', () => {
        runner.it('should initialize with correct default state', () => {
            const mockPlayer = new MockLogger('AudioPlayer');
            const scheduler = new AudioScheduler(mockPlayer, () => {}, () => {});

            runner.expect(scheduler.isPlaying).toBe(false);
            runner.expect(scheduler.current16thNote).toBe(0);
        });
    });

    // We will add more tests for setRhythm, play, and pause here.
    
    // --- Run Tests Sequentially and Render ---
    await runner.runAll();
    runner.renderResults('test-results');
}

/**
 * This function sets up a real scheduler for manual, interactive testing.
 */
export function manualTest() {
    console.log("Setting up manual test...");
    const beatDisplay = document.getElementById('beat-display');
    const onUpdate = (beat) => {
        beatDisplay.textContent = `Beat: ${beat}`;
    };
    const onEnd = () => {
        beatDisplay.textContent = 'Playback Ended.';
    };

    // Use a real AudioPlayer for the manual test
    const audioPlayer = new AudioPlayer();
    
    // Load the test sound
    audioPlayer.loadSounds([{
        id: 'test_kick',
        path: '/percussion-studio/data/instruments/test_kick/kick.wav'
    }]);

    const scheduler = new AudioScheduler(audioPlayer, onUpdate, onEnd);

    // Give it a simple rhythm to play
    const simpleRhythm = {
        instrument_kit: { KCK: 'test_kick' },
        global_bpm: 120,
        playback_flow: [{
            pattern: 'four_on_the_floor'
        }],
        patterns: {
            four_on_the_floor: {
                metadata: { name: '4/4', metric: '4/4', resolution: 16 },
                pattern_data: [{
                    KCK: '||o---|----|o---|----||'
                }]
            }
        }
    };
    scheduler.setRhythm(simpleRhythm);
    
    return scheduler;
}