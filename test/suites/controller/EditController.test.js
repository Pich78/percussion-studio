// file: test/suites/controller/EditController.test.js

import { TestRunner } from '/percussion-studio/test/lib/TestRunner.js';
import { MockLogger } from '/percussion-studio/test/mocks/MockLogger.js';
import { EditController } from '/percussion-studio/src/controller/EditController.js';

export async function run() {
    const runner = new TestRunner();
    MockLogger.clearLogs();
    MockLogger.setLogTarget('log-output');

    runner.describe('EditController - addNote', () => {
        runner.it('should add a note to the correct position in a pattern string', () => {
            const controller = new EditController();
            
            // 1. Define the initial state of our rhythm
            const initialRhythm = {
                patterns: {
                    p1: {
                        metadata: { resolution: 8 },
                        pattern_data: [{
                            KCK: '||--------||'
                        }]
                    }
                }
            };
            
            // 2. Define the edit we want to make
            const position = {
                patternId: 'p1',
                measureIndex: 0,
                instrumentSymbol: 'KCK',
                tick: 2, // The 3rd position (0-indexed)
                note: 'o'
            };

            // 3. Call the method
            const updatedRhythm = controller.addNote(initialRhythm, position);
            
            // 4. Define what the new state should look like
            const expectedNoteString = '||--o-----||';
            const actualNoteString = updatedRhythm.patterns.p1.pattern_data[0].KCK;

            runner.expect(actualNoteString).toBe(expectedNoteString);
        });
    });

    await runner.runAll();
    runner.renderResults('test-results');
}