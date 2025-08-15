// file: test/suites/audio/AudioScheduler.test.js (Complete, Final Corrected Version)

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
            
            // CRITICAL FIX: The mock rhythm must have a sound_kit.
            const testRhythm = {
                global_bpm: 120,
                sound_kit: { KCK: 'test_kick' },
                playback_flow: [{ pattern: 'p1' }],
                patterns: {
                    p1: {
                        metadata: { resolution: 8 },
                        pattern_data: [{ KCK: '||o-o-||' }]
                    }
                }
            };

            scheduler.setRhythm(testRhythm);
            runner.expect(scheduler.tickMap.length).toBe(8);
            runner.expect(scheduler.tickMap[0].instrumentsToPlay).toEqual(['KCK_o']);
            runner.expect(scheduler.tickMap[1].instrumentsToPlay).toEqual([]);
            runner.expect(scheduler.tickMap[2].instrumentsToPlay).toEqual(['KCK_o']);
        });

        runner.it('should handle an empty playback_flow without erroring', () => {
            const scheduler = new AudioScheduler(createMockPlayer(), null, null);
            const emptyRhythm = { global_bpm: 120, playback_flow: [], patterns: {} };
            scheduler.setRhythm(emptyRhythm);
            runner.expect(scheduler.tickMap.length).toBe(0);
        });
    });

    runner.describe('AudioScheduler - Playback Control', () => {
        runner.it('should toggle isPlaying flag and start timer on play()', () => {
            const scheduler = new AudioScheduler(createMockPlayer(), null, null);
            scheduler.tickMap = [
                { instrumentsToPlay: [], secondsPerTick: 0.5 },
                { instrumentsToPlay: [], secondsPerTick: 0.5 }
            ];
            scheduler.play();
            runner.expect(scheduler.isPlaying).toBe(true);
            runner.expect(scheduler.timerID === null).toBe(false);
            scheduler.pause();
            runner.expect(scheduler.isPlaying).toBe(false);
            runner.expect(scheduler.timerID === null).toBe(true);
        });

        runner.it('should schedule notes from the tick map step-by-step', () => {
            const playerMock = createMockPlayer();
            const scheduler = new AudioScheduler(playerMock, null, null);
            scheduler.tickMap = [
                { instrumentsToPlay: ['kick'], secondsPerTick: 0.25, isBeat: true },
                { instrumentsToPlay: [], secondsPerTick: 0.25, isBeat: false },
                { instrumentsToPlay: ['snare'], secondsPerTick: 0.25, isBeat: true }
            ];
            scheduler.nextNoteTime = 0.0;
            scheduler.scheduleTick();
            scheduler.advanceTick();
            scheduler.scheduleTick();
            scheduler.advanceTick();
            scheduler.scheduleTick();
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
    const onUpdate = (beatNumber) => {
        const beatInMeasure = ((beatNumber - 1) % 4) + 1;
        const measure = Math.floor((beatNumber - 1) / 4) + 1;
        beatDisplay.textContent = `Measure: ${measure}, Beat: ${beatInMeasure}`;
    };
    const onEnd = () => { beatDisplay.textContent = 'Playback Ended.'; };

    const audioPlayer = new AudioPlayer();
    
    // CRITICAL FIX: Use the correct new path for the sound file.
    audioPlayer.loadSounds([{
        id: 'KCK_o',
        path: '/percussion-studio/data/sounds/test_kick/test_kick.normal.wav'
    },
    {
        id: 'SNR_o',
        path: '/percussion-studio/data/sounds/test_snare/test_snare.normal.wav'
    }]);

    const scheduler = new AudioScheduler(audioPlayer, onUpdate, onEnd);

    const simpleRhythm = {
        sound_kit: { KCK: 'test_kick', SNR: 'test_snare' },
        global_bpm: 120,
        playback_flow: [{ pattern: 'four_on_the_floor', repetitions: 4 }],
        patterns: {
            four_on_the_floor: {
                metadata: { resolution: 16 },
                pattern_data: [{ 
                    KCK: '||o---|----|o---|----||',
                    SNR: '||----|o---|----|o---||'
                }]
            }
        }
    };
    scheduler.setRhythm(simpleRhythm);
    
    return scheduler;
}