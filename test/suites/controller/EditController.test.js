// file: test/suites/controller/EditController.test.js

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
            const initialRhythm = {
                patterns: {
                    p1: {
                        metadata: { resolution: 8 },
                        pattern_data: [{ KCK: '||--------||' }]
                    }
                }
            };
            const position = { patternId: 'p1', measureIndex: 0, instrumentSymbol: 'KCK', tick: 2, note: 'o' };
            const updatedRhythm = controller.addNote(initialRhythm, position);
            runner.expect(updatedRhythm.patterns.p1.pattern_data[0].KCK).toBe('||--o-----||');
        });

        runner.it('should remove a note from the correct position', () => {
            const controller = new EditController();
            const initialRhythm = {
                patterns: {
                    p1: {
                        metadata: { resolution: 8 },
                        pattern_data: [{
                            KCK: '||--o-----||'
                        }]
                    }
                }
            };
            
            const position = {
                patternId: 'p1',
                measureIndex: 0,
                instrumentSymbol: 'KCK',
                tick: 2
            };

            const updatedRhythm = controller.removeNote(initialRhythm, position);
            
            const expectedNoteString = '||--------||';
            const actualNoteString = updatedRhythm.patterns.p1.pattern_data[0].KCK;

            runner.expect(actualNoteString).toBe(expectedNoteString);
        });

    });

    await runner.runAll();
    runner.renderResults('test-results');
}