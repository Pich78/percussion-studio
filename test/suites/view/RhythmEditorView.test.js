// file: test/suites/view/RhythmEditorView.test.js

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

    await runner.runAll();
    runner.renderResults('test-results');
}

export function manualTest() {
    const log = new MockLogger('Callbacks');
    MockLogger.setLogTarget('log-output');
    
    const callbacks = {
        // This callback expects the *new*, updated flow array
        onFlowChange: (newFlow) => log.log('onFlowChange', { newFlow })
    };

    const container = document.getElementById('view-container');
    const view = new RhythmEditorView(container, callbacks);

    const mockState = {
        rhythm: {
            playback_flow: [
                { pattern: 'intro', repetitions: 1 },
                { pattern: 'verse_a', repetitions: 2 },
                { pattern: 'fill_1', repetitions: 1 },
                { pattern: 'chorus', repetitions: 4 }
            ]
        }
    };
    
    view.render(mockState);
}