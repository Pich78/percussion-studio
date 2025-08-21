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
            playback_flow: [{ pattern: 'verse', repetitions: 4 }],
            patterns: { verse: { metadata: { resolution: 8 }, pattern_data: [{}] } },
        },
        currentEditingPatternId: 'verse', isFlowPinned: false,
        ...overrides
    });

    runner.describe('RhythmEditorView Pinning Logic', () => {
        runner.it('should fire onPinFlowPanel(true) when any part of the flow panel is clicked', () => {
            testContainer.innerHTML = '';
            const callbackLog = new MockLogger('Callbacks');
            const view = new RhythmEditorView(testContainer, { 
                onPinFlowPanel: (isPinned) => callbackLog.log('onPinFlowPanel', { isPinned }) 
            });
            view.render(getMockState());
            
            // Clicking the panel itself should pin it
            testContainer.querySelector('#flow-panel').click();
            callbackLog.wasCalledWith('onPinFlowPanel', { isPinned: true });
        });

        runner.it('should fire an unpin callback when the center grid panel is clicked', () => {
            testContainer.innerHTML = '';
            const callbackLog = new MockLogger('Callbacks');
            const view = new RhythmEditorView(testContainer, { 
                onPinFlowPanel: (isPinned) => callbackLog.log('onPinFlowPanel', { isPinned })
            });
            // Start with the panel pinned
            view.render(getMockState({ isFlowPinned: true }));
            
            testContainer.querySelector('[data-action-scope="grid-panel"]').click();
            callbackLog.wasCalledWith('onPinFlowPanel', { isPinned: false });
        });
    });

    await runner.runAll();
    runner.renderResults('test-results');
    logEvent('info', 'TestRunner', 'run', 'Teardown', 'RhythmEditorView test suite finished.');
}