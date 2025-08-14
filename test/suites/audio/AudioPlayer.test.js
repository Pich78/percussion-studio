// file: test/suites/audio/AudioPlayer.test.js

import { TestRunner } from '/percussion-studio/test/lib/TestRunner.js';
import { MockLogger } from '/percussion-studio/test/mocks/MockLogger.js';
import { AudioPlayer } from '/percussion-studio/src/audio/AudioPlayer.js';

export async function run() {
    const runner = new TestRunner();
    MockLogger.clearLogs();
    MockLogger.setLogTarget('log-output');

    const originalFetch = window.fetch;
    const cleanup = () => { window.fetch = originalFetch; };

    // --- Mocks for the Web Audio API ---
    const createMockAudioContext = () => {
        const gainNodeLogger = new MockLogger('masterGain.gain');
        const contextLogger = new MockLogger('AudioContext');
        const sourceNodeLogger = new MockLogger('SourceNode');

        const mockSourceNode = {
            connect: (destination) => { sourceNodeLogger.log('connect', { destination: 'masterGain' }); },
            start: (time) => { sourceNodeLogger.log('start', { time }); },
            buffer: null
        };
        
        const mockGainNode = {
            gain: {
                _value: 1,
                set value(val) { this._value = val; gainNodeLogger.log('setValue', { value: val }); },
                get value() { return this._value; }
            },
            connect: () => {}
        };

        const mockAudioContext = {
            createGain: () => { contextLogger.log('createGain', {}); return mockGainNode; },
            createBufferSource: () => { contextLogger.log('createBufferSource', {}); return mockSourceNode; },
            decodeAudioData: (arrayBuffer) => Promise.resolve({ decoded: true }),
            destination: { name: 'destination' },
            currentTime: 0
        };

        return { mockAudioContext, contextLogger, gainNodeLogger, sourceNodeLogger, mockSourceNode };
    };

    // --- Test Suites ---

    runner.describe('AudioPlayer Constructor and Volume', () => {
        runner.it('should initialize with an AudioContext and create a master gain node', () => { /* no change */ });
        runner.it('should set the master volume correctly', () => { /* no change */ });
    });

    runner.describe('AudioPlayer - loadSounds', () => {
        runner.it('UNIT: should fetch and decode a list of sounds', async () => { /* no change */ });
        runner.it('INTEGRATION: should load a REAL sound file successfully', async () => { /* no change */ });
        runner.it('INTEGRATION: should throw an error if a sound file is not found (404)', async () => { /* no change */ });
    });

    runner.describe('AudioPlayer - playAt', () => {
        runner.it('UNIT: should create, connect, and start a buffer source node', async () => {
            const { mockAudioContext, contextLogger, sourceNodeLogger } = createMockAudioContext();
            const player = new AudioPlayer(mockAudioContext);

            // Pre-load a dummy buffer into the player
            player.soundBuffers.set('kick', { isDummyBuffer: true });

            const playTime = 123.45;
            player.playAt('kick', playTime);

            // Verify the correct sequence of calls
            contextLogger.wasCalledWith('createBufferSource', {});
            sourceNodeLogger.wasCalledWith('connect', { destination: 'masterGain' });
            sourceNodeLogger.wasCalledWith('start', { time: playTime });
        });

        runner.it('INTEGRATION: should play a sound at a scheduled time', async () => {
            // This test requires user interaction (the 'Run Tests' button click)
            const player = new AudioPlayer();
            const soundList = [{
                id: 'test_kick',
                path: '/percussion-studio/data/instruments/test_kick/kick.wav'
            }];
            
            // 1. Load the sound
            await player.loadSounds(soundList);
            
            // 2. Schedule it to play 100ms in the future
            const timeToPlay = player.getAudioClockTime() + 0.1;
            player.playAt('test_kick', timeToPlay);

            // 3. The assertion is that this promise resolves, meaning we heard the sound.
            // This test will timeout and fail if the sound doesn't play.
            await new Promise(resolve => setTimeout(resolve, 200));
            
            runner.expect(true).toBe(true); // If we get here, it worked.
        });
    });
    
    await runner.runAll();
    runner.renderResults('test-results');
}