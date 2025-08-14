// file: test/suites/controller/PlaybackController.test.js (Complete)

import { TestRunner } from '/percussion-studio/test/lib/TestRunner.js';
import { MockLogger } from '/percussion-studio/test/mocks/MockLogger.js';
import { PlaybackController } from '/percussion-studio/src/controller/PlaybackController.js';

export async function run() {
    const runner = new TestRunner();
    MockLogger.clearLogs();
    MockLogger.setLogTarget('log-output');

    // --- Mocks ---
    // A mock for the AudioScheduler that logs method calls and property changes.
    const createMockScheduler = () => {
        const logger = new MockLogger('AudioScheduler');
        logger.play = () => logger.log('play', {});
        logger.pause = () => logger.log('pause', {});
        logger.stop = () => logger.log('stop', {});
        // Mock the 'loop' property with a setter to log changes
        let _loop = false;
        Object.defineProperty(logger, 'loop', {
            get: () => _loop,
            set: (val) => {
                _loop = val;
                logger.log('setLoop', { enabled: val });
            }
        });
        return logger;
    };

    // A mock for the AudioPlayer that logs method calls.
    const createMockPlayer = () => {
        const logger = new MockLogger('AudioPlayer');
        logger.setMasterVolume = (vol) => logger.log('setMasterVolume', { vol });
        return logger;
    };

    // --- Test Suites ---
    runner.describe('PlaybackController', () => {

        runner.it('should call play() on the audio scheduler', () => {
            const mockScheduler = createMockScheduler();
            const controller = new PlaybackController(mockScheduler, createMockPlayer());
            controller.play();
            mockScheduler.wasCalledWith('play', {});
        });

        runner.it('should call pause() on the audio scheduler', () => {
            const mockScheduler = createMockScheduler();
            const controller = new PlaybackController(mockScheduler, createMockPlayer());
            controller.pause();
            mockScheduler.wasCalledWith('pause', {});
        });

        runner.it('should call stop() on the audio scheduler', () => {
            const mockScheduler = createMockScheduler();
            const controller = new PlaybackController(mockScheduler, createMockPlayer());
            controller.stop();
            mockScheduler.wasCalledWith('stop', {});
        });

        runner.it('should set the loop property on the audio scheduler', () => {
            const mockScheduler = createMockScheduler();
            const controller = new PlaybackController(mockScheduler, createMockPlayer());

            // Test enabling loop
            controller.toggleLoop(true);
            mockScheduler.wasCalledWith('setLoop', { enabled: true });

            // Test disabling loop
            controller.toggleLoop(false);
            mockScheduler.wasCalledWith('setLoop', { enabled: false });
        });

        runner.it('should call setMasterVolume() on the audio player', () => {
            const mockPlayer = createMockPlayer();
            const controller = new PlaybackController(createMockScheduler(), mockPlayer);

            controller.setMasterVolume(0.75);
            
            mockPlayer.wasCalledWith('setMasterVolume', { vol: 0.75 });
        });
    });

    // --- Run Tests ---
    await runner.runAll();
    runner.renderResults('test-results');
}