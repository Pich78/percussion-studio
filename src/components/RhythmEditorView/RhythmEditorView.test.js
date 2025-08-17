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
            instrumentDefsBySymbol: { KCK: { sounds: [{ letter: 'o', name: 'Hit' }] } }
        },
        currentEditingPatternId: 'verse',
        isFlowPinned: false,
        isPalettePinned: false,
        selectedInstrumentSymbol: null,
        selectedNoteLetter: null
    });

    runner.describe('RhythmEditorView Rendering', () => {
        runner.it('should render the flow panel with the correct number of items', () => {
            testContainer.innerHTML = '';
            const view = new RhythmEditorView(testContainer, {});
            view.render(getMockState());
            runner.expect(testContainer.querySelectorAll('.flow-item').length).toBe(1);
        });

        runner.it('should render the grid panel with correct title and buttons', () => {
            testContainer.innerHTML = '';
            const view = new RhythmEditorView(testContainer, {});
            view.render(getMockState());
            runner.expect(testContainer.textContent.includes('Editing: verse')).toBe(true);
            runner.expect(testContainer.querySelector('[data-action="play-pattern"]') === null).toBe(false);
        });
    });

    runner.describe('RhythmEditorView Callbacks', () => {
        runner.it('should fire onPatternSelect when a flow item is clicked', () => {
            testContainer.innerHTML = '';
            const callbackLog = new MockLogger('Callbacks');
            const view = new RhythmEditorView(testContainer, { 
                onPatternSelect: (id) => callbackLog.log('onPatternSelect', { id }) 
            });
            view.render(getMockState());
            
            testContainer.querySelector('[data-action="select-pattern"]').click();
            callbackLog.wasCalledWith('onPatternSelect', { id: 'verse' });
        });
    });

    await runner.runAll();
    runner.renderResults('test-results');
    logEvent('info', 'TestRunner', 'run', 'Teardown', 'RhythmEditorView test suite finished.');
}

export function manualTest() {
    logEvent('info', 'Harness', 'manualTest', 'Setup', 'Setting up stateful manual test.');

    let currentState = {
        rhythm: {
            playback_flow: [{ pattern: 'verse', repetitions: 4 }, { pattern: 'chorus', repetitions: 2 }],
            patterns: { 
                verse: { metadata: { resolution: 8 }, pattern_data: [{ KCK: 'o-o-o-o-' }] },
                chorus: { metadata: { resolution: 8 }, pattern_data: [{ KCK: 'o-o--o-o' }] }
            },
            instrumentDefsBySymbol: { KCK: { sounds: [{ letter: 'o', name: 'Hit' }, { letter: 'p', name: 'Soft' }] } }
        },
        currentEditingPatternId: 'verse',
        isFlowPinned: true, isPalettePinned: false,
        selectedInstrumentSymbol: 'KCK', selectedNoteLetter: 'o'
    };

    const container = document.getElementById('view-container');

    const rerender = () => {
        logEvent('info', 'Harness', 'rerender', 'State', 'Rerendering with new state:', currentState);
        view.render(currentState);
    };

    const view = new RhythmEditorView(container, {
        onPatternSelect: (id) => { currentState.currentEditingPatternId = id; rerender(); },
        onAddPattern: () => logEvent('info', 'Harness', 'onAddPattern', 'Callback', 'Add Pattern clicked.'),
        onNoteSelect: (letter) => { currentState.selectedNoteLetter = letter; rerender(); },
    });

    rerender();
}