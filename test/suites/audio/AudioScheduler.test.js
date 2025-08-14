// file: test/suites/audio/AudioScheduler.test.js (Complete and Corrected)

import { TestRunner } from '/percussion-studio/test/lib/TestRunner.js';
import { MockLogger } from '/percussion-studio/test/mocks/MockLogger.js';
import { AudioScheduler } from '/percussion-studio/src/audio/AudioScheduler.js';
import { AudioPlayer } from '/percussion-studio/src/audio/AudioPlayer.js';

export async function run() {
    const runner = new TestRunner();
    MockLogger.clearLogs();
    MockLogger.setLogTarget('log-output');

    const createMockPlayer = () => {
        const logger = new MockLogger('AudioPlayer');
        logger.playAt = (id, time) => logger.log('playAt', { id, time: time.toFixed(3) });
        logger.getAudioClockTime = () => 0;
        return logger;
    };

    runner.describe('AudioScheduler Initialization', () => {
        runner.it('should initialize with correct default state', () => {
            const scheduler = new AudioScheduler(createMockPlayer(), null, null);
            runner.expect(scheduler.isPlaying).toBe(false);
            runner.expect(scheduler.currentTick).toBe(0);
        });
    });

    runner.describe('AudioScheduler - setRhythm', () => {
        runner.it('should correctly build a tick map from rhythm data', () => {
            const scheduler = new AudioScheduler(createMockPlayer(), null, null);
            const testRhythm = {
                global_bpm: 120,
                instrument_kit: { KCK: 'kick_sound' },
                playback_flow: [{ pattern: 'p1' }],
                patterns: { p1: { metadata: { resolution: 8 }, pattern_data: [{ KCK: '||o-o-||' }] } }
            };
            scheduler.setRhythm(testRhythm);
            runner.expect(scheduler.tickMap.length).toBe(8);
            runner.expect(scheduler.tickMap[0].instrumentsToPlay).toEqual(['kick_sound']);
            runner.expect(scheduler.tickMap[1].instrumentsToPlay).toEqual([]);
        });

        runner.it('should handle an empty playback_flow without erroring', () => {
            const scheduler = new AudioScheduler(createMockPlayer(), null, null);
            const emptyRhythm = { global_bpm: 120, playback_flow: [], patterns: {} };
            scheduler.setRhythm(emptyRhythm);
            runner.expect(scheduler.tickMap.length).toBe(0);
        });
    });

    runner.describe('AudioScheduler - Playback Control', () => {
        runner.it('should toggle isPlaying flag and timer on play() and pause()', () => {
            const scheduler = new AudioScheduler(createMockPlayer(), null, null);
            // This is the crucial fix: provide a minimal, valid tick object.
            scheduler.tickMap = [{ instrumentsToPlay: [], secondsPerTick: 0.5 }];
            
            scheduler.play();
            runner.expect(scheduler.isPlaying).toBe(true);
            runner.expect(scheduler.timerID === null).toBe(false);
            
            scheduler.pause();
            runner.expect(scheduler.isPlaying).toBe(false);
            runner.expect(scheduler.timerID === null).toBe(true);
        });

        runner.it('should schedule notes from the tick map', () => {
            const playerMock = createMockPlayer();
            const scheduler = new AudioScheduler(playerMock, null, null);
            
            scheduler.tickMap = [
                { instrumentsToPlay: ['kick'], secondsPerTick: 0.25, isBeat: true },
                { instrumentsToPlay: [], secondsPerTick: 0.25, isBeat: false },
                { instrumentsToPlay: ['snare'], secondsPerTick: 0.25, isBeat: true }
            ];
            scheduler.nextNoteTime = 0.0;

            // Simulate scheduling the first 3 ticks
            scheduler.scheduler();

            playerMock.wasCalledWith('playAt', { id: 'kick', time: '0.000' });
            playerMock.wasCalledWith('playAt', { id: 'snare', time: '0.500' });
            runner.expect(playerMock.callCount).toBe(2);
        });
    });
    
    await runner.runAll();
    runner.renderResults('test-results');
}

export function manualTest() {
    console.log("Setting up manual test...");
    const beatDisplay = document.getElementById('beat-display');
    const onUpdate = (beat) => {
        const beatInMeasure = ((beat - 1) % 4) + 1;
        const measure = Math.floor((beat - 1) / 4) + 1;
        beatDisplay.textContent = `Measure: ${measure}, Beat: ${beatInMeasure}`;
    };
    const onEnd = () => { beatDisplay.textContent = 'Playback Ended.'; };
    const audioPlayer = new AudioPlayer();
    
    audioPlayer.loadSounds([{ id: 'test_kick', path: '/percussion-studio/data/instruments/test_kick/kick.wav' }]);
    const scheduler = new AudioScheduler(audioPlayer, onUpdate, onEnd);
    
    const simpleRhythm = {
        instrument_kit: { KCK: 'test_kick' },
        global_bpm: 120,
        playback_flow: [{ pattern: 'four_on_the_floor', repetitions: 2 }],
        patterns: {
            four_on_the_floor: {
                metadata: { resolution: 16 },
                pattern_data: [{ KCK: '||o---|----|o---|----||' }]
            }
        }
    };
    scheduler.setRhythm(simpleRhythm);
    return scheduler;
}