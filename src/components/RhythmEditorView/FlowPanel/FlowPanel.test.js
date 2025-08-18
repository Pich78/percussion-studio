// file: src/components/RhythmEditorView/FlowPanel/FlowPanel.test.js

import { TestRunner } from '/percussion-studio/lib/TestRunner.js';
import { MockLogger } from '/percussion-studio/lib/MockLogger.js';
import { logEvent } from '/percussion-studio/lib/Logger.js';
import { FlowPanel } from './FlowPanel.js';

export async function run() {
    const runner = new TestRunner();
    MockLogger.clearLogs();
    logEvent('info', 'TestRunner', 'run', 'Setup', 'Starting FlowPanel test suite.');
    
    const testContainer = document.getElementById('test-sandbox');

    const getMockState = (overrides = {}) => ({
        flow: [{ pattern: 'verse', repetitions: 4 }, { pattern: 'chorus', repetitions: 2 }],
        currentPatternId: 'verse', isPinned: false,
        ...overrides
    });

    runner.describe('FlowPanel Rendering', () => {
        runner.it('should render the correct number of flow items', () => {
            testContainer.innerHTML = '';
            const view = new FlowPanel(testContainer, {});
            view.render(getMockState());
            runner.expect(testContainer.querySelectorAll('.flow-item').length).toBe(2);
        });

        runner.it('should apply "is-pinned" class when pinned', () => {
            testContainer.innerHTML = '';
            const view = new FlowPanel(testContainer, {});
            // --- FIX: Check for the new class name ---
            view.render(getMockState({ isPinned: true }));
            runner.expect(testContainer.classList.contains('is-pinned')).toBe(true);
        });
    });

    runner.describe('FlowPanel Callbacks', () => {
        runner.it('should fire onPatternSelect when a flow item is clicked', () => {
            testContainer.innerHTML = '';
            const callbackLog = new MockLogger('Callbacks');
            const view = new FlowPanel(testContainer, { onPatternSelect: (id) => callbackLog.log('onPatternSelect', { id }) });
            view.render(getMockState());
            
            testContainer.querySelector('[data-pattern-id="chorus"]').click();
            callbackLog.wasCalledWith('onPatternSelect', { id: 'chorus' });
        });
    });

    await runner.runAll();
    runner.renderResults('test-results');
    logEvent('info', 'TestRunner', 'run', 'Teardown', 'FlowPanel test suite finished.');
}

export function manualTest() {
    // Harness script is in the HTML file
}