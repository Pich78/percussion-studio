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
            // This mock will return a promise that resolves to a dummy "decoded" object
            decodeAudioData: (arrayBuffer) => {
                contextLogger.log('decodeAudioData', { bytes: arrayBuffer.byteLength });
                return Promise.resolve({ decoded: true, buffer: arrayBuffer });
            },
            destination: {},
            currentTime: 0
        };

        return { mockAudioContext, contextLogger, gainNodeLogger, mockGainNode };
    };


    // --- Test Suites ---

    runner.describe('AudioPlayer Constructor and Volume', () => {
        // The two tests from before remain unchanged.
        runner.it('should initialize with an AudioContext and create a master gain node', () => { /* ... no change ... */ });
        runner.it('should set the master volume correctly', () => { /* ... no change ... */ });
    });

    runner.describe('AudioPlayer - loadSounds', () => {

        runner.it('UNIT: should fetch and decode a list of sounds', async () => {
            const { mockAudioContext, contextLogger } = createMockAudioContext();
            const fetchLogger = new MockLogger('fetch');
            
            // Mock fetch to return a simple ArrayBuffer
            window.fetch = async (url) => {
                fetchLogger.log('fetch', { url });
                const buffer = new ArrayBuffer(8); // Dummy 8-byte file
                return { ok: true, arrayBuffer: async () => buffer };
            };
            
            try {
                const player = new AudioPlayer(mockAudioContext);
                const soundList = [
                    { id: 'kick', path: '/sounds/kick.wav' },
                    { id: 'snare', path: '/sounds/snare.wav' }
                ];
                
                await player.loadSounds(soundList);

                // Verify fetch was called for both sounds
                runner.expect(fetchLogger.callCount).toBe(2);
                fetchLogger.wasCalledWith('fetch', { url: '/sounds/kick.wav' });

                // Verify decodeAudioData was called for both sounds
                runner.expect(contextLogger.callCount).toBe(3); // 1 for createGain, 2 for decode
                contextLogger.wasCalledWith('decodeAudioData', { bytes: 8 });

                // Verify the sound buffers were stored
                runner.expect(player.soundBuffers.has('kick')).toBe(true);
                runner.expect(player.soundBuffers.get('snare').decoded).toBe(true);

            } finally {
                cleanup();
            }
        });

        runner.it('INTEGRATION: should load a REAL sound file successfully', async () => {
            // This requires a real browser environment with Web Audio API
            const player = new AudioPlayer();
            const soundList = [{
                id: 'test_kick',
                // This path MUST correspond to a real file in your test data
                path: '/percussion-studio/data/instruments/test_kick/kick.wav'
            }];

            await player.loadSounds(soundList);
            
            runner.expect(player.soundBuffers.has('test_kick')).toBe(true);
            // The decoded buffer should be an actual AudioBuffer object
            runner.expect(player.soundBuffers.get('test_kick') instanceof AudioBuffer).toBe(true);
        });

        runner.it('INTEGRATION: should throw an error if a sound file is not found (404)', async () => {
            const player = new AudioPlayer();
            const soundList = [{ id: 'ghost', path: '/sounds/non_existent.wav' }];
            
            await runner.expect(() => player.loadSounds(soundList))
                  .toThrow("Failed to fetch sound '/sounds/non_existent.wav'");
        });
    });
    
    await runner.runAll();
    runner.renderResults('test-results');
}