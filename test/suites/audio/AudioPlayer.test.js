// file: test/suites/audio/AudioPlayer.test.js

import { TestRunner } from '/percussion-studio/test/lib/TestRunner.js';
import { MockLogger } from '/percussion-studio/test/mocks/MockLogger.js';
import { AudioPlayer } from '/percussion-studio/src/audio/AudioPlayer.js';

export async function run() {
    const runner = new TestRunner();

    MockLogger.clearLogs();
    MockLogger.setLogTarget('log-output');

    // --- Define Test Suites ---

    runner.describe('AudioPlayer Tests', () => {
        // Tests will go here...
    });
    
    // --- Run Tests Sequentially and Render ---
    await runner.runAll();
    runner.renderResults('test-results');
}