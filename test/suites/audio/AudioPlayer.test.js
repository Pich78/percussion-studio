// file: test/suites/audio/AudioPlayer.test.js

import { TestRunner } from '/percussion-studio/test/lib/TestRunner.js';
import { MockLogger } from '/percussion-studio/test/mocks/MockLogger.js';
import { AudioPlayer } from '/percussion-studio/src/audio/AudioPlayer.js';

export async function run() {
    const runner = new TestRunner();

    MockLogger.clearLogs();
    MockLogger.setLogTarget('log-output');

    // --- Mocks for the Web Audio API ---
    // This mock simulates the parts of the AudioContext that our AudioPlayer uses.
    const createMockAudioContext = () => {
        const gainNodeLogger = new MockLogger('masterGain.gain');
        
        const mockGainNode = {
            // The 'gain' property itself has a 'value' we can set.
            gain: {
                // We'll track changes to this value.
                _value: 1, // Default value
                set value(val) {
                    this._value = val;
                    gainNodeLogger.log('setValue', { value: val });
                },
                get value() {
                    return this._value;
                }
            },
            connect: () => {} // A dummy connect function
        };

        const contextLogger = new MockLogger('AudioContext');
        const mockAudioContext = {
            createGain: () => {
                contextLogger.log('createGain', {});
                return mockGainNode;
            },
            destination: {}, // A dummy destination object
            currentTime: 0
        };

        return { mockAudioContext, contextLogger, gainNodeLogger, mockGainNode };
    };


    // --- Define Test Suites ---

    runner.describe('AudioPlayer Constructor and Volume', () => {

        runner.it('should initialize with an AudioContext and create a master gain node', () => {
            const { mockAudioContext, contextLogger } = createMockAudioContext();

            // Create the player with our mock context
            new AudioPlayer(mockAudioContext);

            // Verify that the constructor used the context to create a gain node
            contextLogger.wasCalledWith('createGain', {});
            runner.expect(contextLogger.callCount).toBe(1);
        });

        runner.it('should set the master volume correctly', () => {
            const { mockAudioContext, gainNodeLogger, mockGainNode } = createMockAudioContext();
            
            const player = new AudioPlayer(mockAudioContext);
            
            // Set the volume to half
            player.setMasterVolume(0.5);

            // Check that the gain node's value was updated
            runner.expect(mockGainNode.gain.value).toBe(0.5);

            // Verify that our logger also saw the change
            gainNodeLogger.wasCalledWith('setValue', { value: 0.5 });
        });
    });
    
    // --- Run Tests Sequentially and Render ---
    await runner.runAll();
    runner.renderResults('test-results');
}