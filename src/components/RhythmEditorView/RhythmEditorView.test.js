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

    const getMockState = () => ({
        rhythm: {
            playback_flow: [{ pattern: 'verse', repetitions: 4 }],
            patterns: { verse: { metadata: { resolution: 8 }, pattern_data: [{ KCK: 'o---o---' }] } },
            instrumentDefsBySymbol: { KCK: { sounds: [] } }
        },
        currentEditingPatternId: 'verse', isFlowPinned: false, isPalettePinned: false,
    });

    runner.describe('RhythmEditorView Pinning Logic', () => {
        runner.it('should fire onPinFlowPanel(true) when the flow panel is clicked', () => {
            testContainer.innerHTML = '';
            const callbackLog = new MockLogger('Callbacks');
            const view = new RhythmEditorView(testContainer, { 
                onPinFlowPanel: (isPinned) => callbackLog.log('onPinFlowPanel', { isPinned }) 
            });
            view.render(getMockState());
            
            testContainer.querySelector('#flow-panel').click();
            callbackLog.wasCalledWith('onPinFlowPanel', { isPinned: true });
        });

        runner.it('should fire unpin callbacks when the center grid panel is clicked', () => {
            testContainer.innerHTML = '';
            const callbackLog = new MockLogger('Callbacks');
            const view = new RhythmEditorView(testContainer, { 
                onPinFlowPanel: (isPinned) => callbackLog.log('onPinFlowPanel', { isPinned }),
                onPinPalettePanel: (isPinned) => callbackLog.log('onPinPalettePanel', { isPinned }) 
            });
            view.render(getMockState());
            
            testContainer.querySelector('[data-action-scope="grid-panel"]').click();
            callbackLog.wasCalledWith('onPinFlowPanel', { isPinned: false });
            callbackLog.wasCalledWith('onPinPalettePanel', { isPinned: false });
        });
    });

    await runner.runAll();
    runner.renderResults('test-results');
    logEvent('info', 'TestRunner', 'run', 'Teardown', 'RhythmEditorView test suite finished.');
}

export function manualTest() {
    logEvent('info', 'Harness', 'manualTest', 'Setup', 'Setting up stateful manual test.');

    let currentState = { /* ... full state object ... */ };

    const container = document.getElementById('view-container');
    const rerender = () => { /* ... */ };

    const view = new RhythmEditorView(container, {
        onPinFlowPanel: (isPinned) => { currentState.isFlowPinned = isPinned; rerender(); },
        onPinPalettePanel: (isPinned) => { currentState.isPalettePinned = isPinned; rerender(); },
        // ... other callbacks
    });

    rerender();
}