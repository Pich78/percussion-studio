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
        logger.playAt = (id, time) => {
            logger.log('playAt', { id, time: time.toFixed(3) }); // Log time with precision
        };
        logger.getAudioClockTime = () => 0; // Mock clock
        return logger;
    };

    runner.describe('AudioScheduler Initialization', () => { /* no change */ });
    runner.describe('AudioScheduler - setRhythm (Resolution-Aware)', () => { /* no change */ });

    runner.describe('AudioScheduler - Playback Control', () => {
        runner.it('should toggle isPlaying flag and timer on play() and pause()', () => {
            const scheduler = new AudioScheduler(createMockPlayer(), null, null);
            scheduler.setRhythm({ global_bpm: 120, playback_flow: [], patterns: {} });

            scheduler.play();
            runner.expect(scheduler.isPlaying).toBe(true);
            runner.expect(scheduler.timerID === null).toBe(false); // Timer should be active

            scheduler.pause();
            runner.expect(scheduler.isPlaying).toBe(false);
            runner.expect(scheduler.timerID === null).toBe(true); // Timer should be cleared
        });

        runner.it('should schedule notes correctly when played', async () => {
            const playerMock = createMockPlayer();
            const scheduler = new AudioScheduler(playerMock, null, null);

            const testRhythm = {
                global_bpm: 120, // 0.125s per 16th tick
                instrument_kit: { KCK: 'kick_sound', SNR: 'snare_sound' },
                playback_flow: [{ pattern: 'p1' }],
                patterns: {
                    p1: { 
                        metadata: { resolution: 16 },
                        pattern_data: [{ KCK: '||o---|o---||', SNR: '||----|o---||' }] // A short 2-beat pattern
                    }
                }
            };
            scheduler.setRhythm(testRhythm);
            
            // We can't test the setTimeout loop directly, so we call the scheduler's internal
            // methods to simulate one pass of the loop.
            scheduler.nextNoteTime = 0.0;
            // Schedule the first two ticks
            scheduler.scheduleTick(); // tick 0
            scheduler.advanceTick();
            scheduler.scheduleTick(); // tick 1
            scheduler.advanceTick();
            scheduler.scheduleTick(); // tick 2
            scheduler.advanceTick();
            scheduler.scheduleTick(); // tick 3
            scheduler.advanceTick();
            scheduler.scheduleTick(); // tick 4
            scheduler.advanceTick();


            // Tick 0: KCK at time 0.000
            playerMock.wasCalledWith('playAt', { id: 'kick_sound', time: '0.000' });
            // Tick 4: KCK at time 0.500
            playerMock.wasCalledWith('playAt', { id: 'kick_sound', time: '0.500' });
            // Tick 4: SNR at time 0.500
            playerMock.wasCalledWith('playAt', { id: 'snare_sound', time: '0.500' });

            runner.expect(playerMock.callCount).toBe(3);
        });
    });
    
    await runner.runAll();
    runner.renderResults('test-results');
}

export function manualTest() { /* no change */ }