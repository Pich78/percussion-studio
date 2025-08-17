// file: src/components/RhythmEditorView/RhythmEditorView.test.js

import { TestRunner } from '/percussion-studio/lib/TestRunner.js';
import { MockLogger } from '/percussion-studio/lib/MockLogger.js';
import { logEvent } from '/percussion-studio/lib/Logger.js';
import { RhythmEditorView } from './RhythmEditorView.js';

export async function run() {
    const runner = new TestRunner();
    MockLogger.clearLogs();
    logEvent('info', 'TestRunner', 'run', 'Setup', 'Starting RhythmEditorView test suite.');
    
    const testContainer = document.getElementById('test-sandbox');

    const getMockState = (overrides = {}) => ({
        rhythm: {
            playback_flow: [{ pattern: 'verse', repetitions: 4 }, { pattern: 'chorus', repetitions: 2 }],
            patterns: { verse: { metadata: {} }, chorus: { metadata: {} } },
            instrumentDefsBySymbol: {}
        },
        currentEditingPatternId: 'verse', isFlowPinned: true, isPalettePinned: false,
        ...overrides
    });

    runner.describe('RhythmEditorView: Flow Panel Interactions', () => {
        runner.it('should fire onPatternSelect when a flow item is clicked', () => {
            testContainer.innerHTML = '';
            const callbackLog = new MockLogger('Callbacks');
            const view = new RhythmEditorView(testContainer, { onPatternSelect: (id) => callbackLog.log('onPatternSelect', { id }) });
            view.render(getMockState());
            
            // Click the second item ('chorus')
            testContainer.querySelector('[data-pattern-id="chorus"]').click();
            callbackLog.wasCalledWith('onPatternSelect', { id: 'chorus' });
        });

        runner.it('should fire onAddPattern when the add button is clicked', () => {
            testContainer.innerHTML = '';
            const callbackLog = new MockLogger('Callbacks');
            const view = new RhythmEditorView(testContainer, { onAddPattern: () => callbackLog.log('onAddPattern') });
            view.render(getMockState());
            
            testContainer.querySelector('[data-action="add-pattern"]').click();
            callbackLog.wasCalledWith('onAddPattern');
        });

        runner.it('should fire onDeleteFlowItem with the correct index when delete is clicked', () => {
            testContainer.innerHTML = '';
            window.confirm = () => true; // Auto-confirm the dialog for the test
            const callbackLog = new MockLogger('Callbacks');
            const view = new RhythmEditorView(testContainer, { onDeleteFlowItem: (index) => callbackLog.log('onDeleteFlowItem', { index }) });
            view.render(getMockState());
            
            // Delete the first item (index 0)
            testContainer.querySelector('[data-action="delete-flow-item"][data-index="0"]').click();
            callbackLog.wasCalledWith('onDeleteFlowItem', { index: 0 });
        });
    });

    await runner.runAll();
    runner.renderResults('test-results');
    logEvent('info', 'TestRunner', 'run', 'Teardown', 'RhythmEditorView test suite finished.');
}

export function manualTest() {
    // Harness script will be in the HTML file
}