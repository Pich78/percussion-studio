// file: test/suites/view/RhythmEditorView.test.js (Complete)

import { TestRunner } from '/percussion-studio/test/lib/TestRunner.js';
import { MockLogger } from '/percussion-studio/test/mocks/MockLogger.js';
import { RhythmEditorView } from '/percussion-studio/src/view/RhythmEditorView.js';

export async function run() {
    const runner = new TestRunner();
    MockLogger.clearLogs();
    MockLogger.setLogTarget('log-output');
    
    let testContainer = document.getElementById('test-sandbox');
    if (!testContainer) {
        testContainer = document.createElement('div');
        testContainer.id = 'test-sandbox';
        document.body.appendChild(testContainer);
    }

    const getMockState = () => ({
        rhythm: {
            playback_flow: [
                { pattern: 'verse', repetitions: 4 },
                { pattern: 'chorus', repetitions: 8 }
            ]
        }
    });

    runner.describe('RhythmEditorView Rendering', () => {
        runner.it('should render a list item for each item in the playback_flow', () => {
            testContainer.innerHTML = '';
            const view = new RhythmEditorView(testContainer, {});
            view.render(getMockState());

            const items = testContainer.querySelectorAll('.flow-item');
            runner.expect(items.length).toBe(2);
            runner.expect(items[0].textContent.includes('verse')).toBe(true);
            runner.expect(items[1].textContent.includes('chorus')).toBe(true);
        });
    });

    runner.describe('RhythmEditorView Callbacks', () => {
        runner.it('should fire onFlowChange with the item removed when delete is clicked', () => {
            testContainer.innerHTML = '';
            const callbackLog = new MockLogger('Callbacks');
            const callbacks = { onFlowChange: (newFlow) => callbackLog.log('onFlowChange', { newFlow }) };
            const view = new RhythmEditorView(testContainer, callbacks);
            
            view.render(getMockState());
            
            // Find the delete button for the first item (verse) and click it
            const firstDeleteButton = testContainer.querySelector('.flow-item[data-index="0"] .delete-btn');
            firstDeleteButton.click();

            // The new flow should only contain the 'chorus' item
            const expectedNewFlow = [{ pattern: 'chorus', repetitions: 8 }];
            callbackLog.wasCalledWith('onFlowChange', { newFlow: expectedNewFlow });
        });
    });

    await runner.runAll();
    runner.renderResults('test-results');
}

export function manualTest() {
    const log = new MockLogger('Callbacks');
    MockLogger.setLogTarget('log-output');
    
    let currentState = {
        rhythm: {
            playback_flow: [
                { pattern: 'intro', repetitions: 1 },
                { pattern: 'verse_a', repetitions: 2 },
                { pattern: 'fill_1', repetitions: 1 },
                { pattern: 'chorus', repetitions: 4 }
            ]
        }
    };

    const container = document.getElementById('view-container');

    const callbacks = {
        onFlowChange: (newFlow) => {
            log.log('onFlowChange', { newFlow });
            // In a real app, this would trigger a re-render. We simulate it here.
            currentState.rhythm.playback_flow = newFlow;
            view.render(currentState);
        }
    };

    const view = new RhythmEditorView(container, callbacks);
    view.render(currentState);
}