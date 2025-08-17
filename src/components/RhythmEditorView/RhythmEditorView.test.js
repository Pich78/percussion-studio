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
            patterns: { verse: {}, chorus: {} },
        },
        currentEditingPatternId: 'verse', isFlowPinned: false, isPalettePinned: false,
        ...overrides
    });

    runner.describe('RhythmEditorView: Flow Panel', () => {
        runner.it('should fire onPinFlowPanel with a toggled value when clicked', () => {
            testContainer.innerHTML = '';
            const callbackLog = new MockLogger('Callbacks');
            const view = new RhythmEditorView(testContainer, { 
                onPinFlowPanel: (isPinned) => callbackLog.log('onPinFlowPanel', { isPinned }) 
            });
            // Initial state is NOT pinned
            view.render(getMockState({ isFlowPinned: false }));
            testContainer.querySelector('#flow-panel').click();
            // Should be called with TRUE
            callbackLog.wasCalledWith('onPinFlowPanel', { isPinned: true });
        });

        runner.it('should fire onAddPattern when the add button is clicked', () => {
            testContainer.innerHTML = '';
            const callbackLog = new MockLogger('Callbacks');
            const view = new RhythmEditorView(testContainer, { onAddPattern: () => callbackLog.log('onAddPattern') });
            view.render(getMockState({ isFlowPinned: true })); // Render expanded
            
            testContainer.querySelector('[data-action="add-pattern"]').click();
            callbackLog.wasCalledWith('onAddPattern');
        });
    });

    await runner.runAll();
    runner.renderResults('test-results');
    logEvent('info', 'TestRunner', 'run', 'Teardown', 'RhythmEditorView test suite finished.');
}

export function manualTest() { /* Harness script is in the HTML file */ }