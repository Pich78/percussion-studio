// file: test/suites/controller/EditController.test.js (Complete)

import { TestRunner } from '/percussion-studio/test/lib/TestRunner.js';
import { MockLogger } from '/percussion-studio/test/mocks/MockLogger.js';
import { EditController } from '/percussion-studio/src/controller/EditController.js';

export async function run() {
    const runner = new TestRunner();
    MockLogger.clearLogs();
    MockLogger.setLogTarget('log-output');

    runner.describe('EditController - Note Editing', () => {
        runner.it('should add a note to the correct position', () => {
            const controller = new EditController();
            const initialRhythm = { patterns: { p1: { metadata: { resolution: 8 }, pattern_data: [{ KCK: '||--------||' }] } } };
            const position = { patternId: 'p1', measureIndex: 0, instrumentSymbol: 'KCK', tick: 2, note: 'o' };
            const updatedRhythm = controller.addNote(initialRhythm, position);
            runner.expect(updatedRhythm.patterns.p1.pattern_data[0].KCK).toBe('||--o-----||');
        });

        runner.it('should remove a note from the correct position', () => {
            const controller = new EditController();
            const initialRhythm = { patterns: { p1: { metadata: { resolution: 8 }, pattern_data: [{ KCK: '||--o-----||' }] } } };
            const position = { patternId: 'p1', measureIndex: 0, instrumentSymbol: 'KCK', tick: 2 };
            const updatedRhythm = controller.removeNote(initialRhythm, position);
            runner.expect(updatedRhythm.patterns.p1.pattern_data[0].KCK).toBe('||--------||');
        });
    });

    runner.describe('EditController - Playback Flow', () => {
        runner.it('should update the playback_flow with a new sequence', () => {
            const controller = new EditController();
            const initialRhythm = {
                playback_flow: [{ pattern: 'p1', repetitions: 4 }]
            };
            
            // Define the new sequence we want to apply
            const newFlow = [
                { pattern: 'p1', repetitions: 2 },
                { pattern: 'p2', repetitions: 1 }
            ];

            const updatedRhythm = controller.updatePlaybackFlow(initialRhythm, newFlow);

            // Assert that the returned object has the new flow
            runner.expect(updatedRhythm.playback_flow).toEqual(newFlow);

            // Also assert that the original object was NOT mutated
            runner.expect(initialRhythm.playback_flow).toEqual([{ pattern: 'p1', repetitions: 4 }]);
        });
    });

    await runner.runAll();
    runner.renderResults('test-results');
}