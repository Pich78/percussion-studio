// file: test/suites/controller/PlaybackController.test.js

import { TestRunner } from '/percussion-studio/test/lib/TestRunner.js';
import { MockLogger } from '/percussion-studio/test/mocks/MockLogger.js';
import { PlaybackController } from '/percussion-studio/src/controller/PlaybackController.js';

export async function run() {
    const runner = new TestRunner();
    MockLogger.clearLogs();
    MockLogger.setLogTarget('log-output');

    // --- Mocks ---
    const createMockScheduler = () => {
        const logger = new MockLogger('AudioScheduler');
        // Define methods that our controller will call
        logger.play = () => logger.log('play', {});
        logger.pause = () => logger.log('pause', {});
        logger.stop = () => logger.log('stop', {});
        return logger;
    };

    const createMockPlayer = () => {
        const logger = new MockLogger('AudioPlayer');
        logger.setMasterVolume = (vol) => logger.log('setMasterVolume', { vol });
        return logger;
    };

    // --- Test Suites ---
    runner.describe('PlaybackController', () => {

        runner.it('should call play on the audio scheduler', () => {
            const mockScheduler = createMockScheduler();
            const controller = new PlaybackController(mockScheduler, createMockPlayer());
            
            controller.play();
            
            mockScheduler.wasCalledWith('play', {});
            runner.expect(mockScheduler.callCount).toBe(1);
        });

        // We will add more tests here for pause, stop, etc.
    });

    // --- Run Tests ---
    await runner.runAll();
    runner.renderResults('test-results');
}