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
            playback_flow: [{ pattern: 'verse' }],
            patterns: { verse: { metadata: {}, pattern_data: [{}] } },
            instrumentDefsBySymbol: {}
        },
        currentEditingPatternId: 'verse', isFlowPinned: false, isPalettePinned: false,
        ...overrides
    });

    runner.describe('RhythmEditorView Pinning and Expansion', () => {
        runner.it('should fire onPinFlowPanel callback when the flow panel is clicked', () => {
            testContainer.innerHTML = '';
            const callbackLog = new MockLogger('Callbacks');
            const view = new RhythmEditorView(testContainer, { 
                onPinFlowPanel: (isPinned) => callbackLog.log('onPinFlowPanel', { isPinned }) 
            });
            view.render(getMockState());
            
            testContainer.querySelector('#flow-panel').click();
            callbackLog.wasCalledWith('onPinFlowPanel', { isPinned: true });
        });

        runner.it('should apply "is-expanded" class when isFlowPinned is true', () => {
            testContainer.innerHTML = '';
            const view = new RhythmEditorView(testContainer, {});
            view.render(getMockState({ isFlowPinned: true }));

            const flowPanel = testContainer.querySelector('#flow-panel');
            runner.expect(flowPanel.classList.contains('is-expanded')).toBe(true);
        });
    });

    await runner.runAll();
    runner.renderResults('test-results');
    logEvent('info', 'TestRunner', 'run', 'Teardown', 'RhythmEditorView test suite finished.');
}

export function manualTest() {
    // Harness script will be in the HTML file
}