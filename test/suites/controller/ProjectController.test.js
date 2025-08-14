// file: test/suites/controller/ProjectController.test.js

import { TestRunner } from '/percussion-studio/test/lib/TestRunner.js';
import { MockLogger } from '/percussion-studio/test/mocks/MockLogger.js';
import { ProjectController } from '/percussion-studio/src/controller/ProjectController.js';

export async function run() {
    const runner = new TestRunner();
    MockLogger.clearLogs();
    MockLogger.setLogTarget('log-output');

    // --- Mocks for all dependencies ---
    const createMockDAL = () => new MockLogger('DataAccessLayer');
    const createMockPlayer = () => new MockLogger('AudioPlayer');
    const createMockScheduler = () => new MockLogger('AudioScheduler');

    // --- Test Suites ---
    runner.describe('ProjectController', () => {
        runner.it('should create a new, default rhythm structure', () => {
            // This method doesn't use dependencies, so mocks can be simple.
            const controller = new ProjectController(
                createMockDAL(),
                createMockPlayer(),
                createMockScheduler()
            );

            const newRhythm = controller.createNewRhythm();

            const expected = {
                global_bpm: 120,
                instrument_kit: {},
                patterns: {
                    'untitled_pattern': {
                        metadata: { name: 'Untitled Pattern', resolution: 16, metric: '4/4' },
                        pattern_data: [{}]
                    }
                },
                playback_flow: [{ pattern: 'untitled_pattern', repetitions: 1 }]
            };

            runner.expect(newRhythm).toEqual(expected);
        });
    });

    // --- Run Tests ---
    await runner.runAll();
    runner.renderResults('test-results');
}