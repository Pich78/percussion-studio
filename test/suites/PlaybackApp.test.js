// file: test/suites/PlaybackApp.test.js

import { TestRunner } from '/percussion-studio/test/lib/TestRunner.js';
import { MockLogger } from '/percussion-studio/test/mocks/MockLogger.js';
import { PlaybackApp } from '/percussion-studio/src/PlaybackApp.js';

// Mock the global controllers that PlaybackApp expects as props
const createMockProps = (rhythm) => {
    const logger = new MockLogger('GlobalControllers');
    return {
        rhythm: rhythm || { global_bpm: 120, playback_flow: [{ pattern: 'p1' }], patterns: {p1: {}} },
        playbackController: {
            play: () => logger.log('play'),
            pause: () => logger.log('pause'),
            stop: () => logger.log('stop'),
            toggleLoop: (enabled) => logger.log('toggleLoop', { enabled }),
            setMasterVolume: (vol) => logger.log('setMasterVolume', { vol }),
        },
        audioScheduler: {
            setBPM: (bpm) => logger.log('setBPM', { bpm }),
        },
        logger // Expose the logger for assertions
    };
};

export async function run() {
    const runner = new TestRunner();
    MockLogger.clearLogs();
    MockLogger.setLogTarget('log-output');

    runner.describe('PlaybackApp Initialization', () => {
        runner.it('should initialize with correct default state from rhythm', () => {
            const container = document.createElement('div');
            const props = createMockProps({ global_bpm: 95, playback_flow: [{ pattern: 'p1' }], patterns: {p1: {}} });
            const playbackApp = new PlaybackApp(container, props);

            runner.expect(playbackApp.state.isPlaying).toBe(false);
            runner.expect(playbackApp.state.globalBPM).toBe(95);
        });
    });

    runner.describe('PlaybackApp State and Controller Interaction', () => {
        runner.it('should update state and call controller on handlePlay', () => {
            const container = document.createElement('div');
            const props = createMockProps();
            const playbackApp = new PlaybackApp(container, props);

            playbackApp.handlePlay();

            runner.expect(playbackApp.state.isPlaying).toBe(true);
            props.logger.wasCalledWith('setBPM', { bpm: 120 });
            props.logger.wasCalledWith('play');
        });

        runner.it('should update state and call controller on handleBPMChange', () => {
            const container = document.createElement('div');
            const props = createMockProps();
            const playbackApp = new PlaybackApp(container, props);

            playbackApp.handleBPMChange(150);

            runner.expect(playbackApp.state.globalBPM).toBe(150);
        });
        
        runner.it('should call controller on handleToggleLoop', () => {
            const container = document.createElement('div');
            const props = createMockProps();
            const playbackApp = new PlaybackApp(container, props);
            
            playbackApp.handleToggleLoop(true);
            
            props.logger.wasCalledWith('toggleLoop', { enabled: true });
        });
    });

    await runner.runAll();
    runner.renderResults('test-results');
}