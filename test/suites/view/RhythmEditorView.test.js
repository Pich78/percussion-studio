// file: test/suites/view/RhythmEditorView.test.js (Complete)
import { TestRunner } from '/percussion-studio/test/lib/TestRunner.js';
import { MockLogger } from '/percussion-studio/test/mocks/MockLogger.js';
import { RhythmEditorView } from '/percussion-studio/src/view/RhythmEditorView.js';

export async function run() {
    const runner = new TestRunner();
    MockLogger.clearLogs();
    MockLogger.setLogTarget('log-output');

    let testContainer = document.getElementById('test-sandbox');
    const getMockState = () => ({
        rhythm: {
            playback_flow: [
                { pattern: 'verse', repetitions: 4 },
                { pattern: 'chorus', repetitions: 8 }
            ]
        }
    });

    runner.describe('RhythmEditorView Rendering', () => {
        runner.it('should render a list item for each flow item and an add button', () => {
            testContainer.innerHTML = '';
            const view = new RhythmEditorView(testContainer, {});
            view.render(getMockState());

            runner.expect(testContainer.querySelectorAll('.flow-item').length).toBe(2);
            runner.expect(testContainer.querySelector('.add-pattern-btn') !== null).toBe(true);
        });
    });

    runner.describe('RhythmEditorView Callbacks', () => {
        runner.it('should fire onFlowChange with item removed on delete click', () => {
            testContainer.innerHTML = '';
            let newFlowResult = null;
            const view = new RhythmEditorView(testContainer, { onFlowChange: (nf) => newFlowResult = nf });
            view.render(getMockState());
            
            testContainer.querySelector('.delete-btn').click();

            runner.expect(newFlowResult.length).toBe(1);
            // --- FIX ---
            // The callback returns the whole array, so we check the first element.
            runner.expect(newFlowResult.pattern).toBe('chorus');
        });

        runner.it('should NOT fire onFlowChange if delete is cancelled', () => {
            window.confirm = () => false; // Mock user clicking "Cancel"
            testContainer.innerHTML = '';
            let callbackFired = false;
            const view = new RhythmEditorView(testContainer, { onFlowChange: () => callbackFired = true });
            view.render(getMockState());
            
            testContainer.querySelector('.delete-btn').click();
            
            runner.expect(callbackFired).toBe(false);
            window.confirm = () => true; // Reset mock
        });

        runner.it('should fire onAddPatternClick when add button is clicked', () => {
            testContainer.innerHTML = '';
            let callbackFired = false;
            const view = new RhythmEditorView(testContainer, { onAddPatternClick: () => callbackFired = true });
            view.render(getMockState());

            testContainer.querySelector('.add-pattern-btn').click();
            runner.expect(callbackFired).toBe(true);
        });

        runner.it('should fire onFlowChange with updated value after editing', () => {
            testContainer.innerHTML = '';
            let newFlowResult = null;
            const view = new RhythmEditorView(testContainer, { onFlowChange: (nf) => newFlowResult = nf });
            view.render(getMockState());

            const repsSpan = testContainer.querySelector('.repetitions');
            repsSpan.textContent = '12';
            repsSpan.dispatchEvent(new FocusEvent('blur')); // Simulate user finishing edit

            // --- FIX ---
            // The callback returns the whole array, so we check the first element.
            runner.expect(newFlowResult.repetitions).toBe(12);
        });
    });

    await runner.runAll();
    runner.renderResults('test-results');
}

export function manualTest() {
    const log = new MockLogger('Callbacks');
    MockLogger.setLogTarget('log-output');

    // Un-mock confirm for manual testing
    const originalConfirm = window.confirm;
    window.confirm = (message) => {
        log.log(`window.confirm called with: "${message}"`);
        return originalConfirm(message);
    };

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
            currentState.rhythm.playback_flow = newFlow;
            view.render(currentState);
        },
        onAddPatternClick: () => {
            log.log('onAddPatternClick called!');
        }
    };
    
    const view = new RhythmEditorView(container, callbacks);
    view.render(currentState);
}
