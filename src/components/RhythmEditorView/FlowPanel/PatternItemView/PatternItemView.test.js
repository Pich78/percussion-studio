// file: src/components/RhythmEditorView/FlowPanel/PatternItemView/PatternItemView.test.js

import { TestRunner } from '/percussion-studio/lib/TestRunner.js';
import { MockLogger } from '/percussion-studio/lib/MockLogger.js';
import { logEvent } from '/percussion-studio/lib/Logger.js';
import { PatternItemView } from './PatternItemView.js';

export async function run() {
    const runner = new TestRunner();
    MockLogger.clearLogs();
    logEvent('info', 'TestRunner', 'run', 'Setup', 'Starting PatternItemView test suite.');
    
    const testContainer = document.getElementById('test-sandbox');

    const getMockState = (overrides = {}) => ({
        item: { pattern: 'verse_a', repetitions: 4 },
        index: 0,
        globalBPM: 120,
        isSelected: false,
        ...overrides
    });

    runner.describe('PatternItemView Rendering', () => {
        runner.it('should render the correct pattern name and repetitions', () => {
            testContainer.innerHTML = '';
            const view = new PatternItemView(testContainer, {});
            view.render(getMockState({ item: { pattern: 'test_pattern', repetitions: 8 } }));
            
            const patternSelector = testContainer.querySelector('select[data-property="pattern"]');
            const repsInput = testContainer.querySelector('input[data-property="repetitions"]');

            runner.expect(patternSelector.value).toBe('test_pattern');
            runner.expect(Number(repsInput.value)).toBe(8);
        });

        runner.it('should display the global BPM if no item-specific BPM is set', () => {
            testContainer.innerHTML = '';
            const view = new PatternItemView(testContainer, {});
            view.render(getMockState({ globalBPM: 150 }));
            const bpmInput = testContainer.querySelector('input[data-property="bpm"]');
            runner.expect(Number(bpmInput.value)).toBe(150);
            runner.expect(bpmInput.classList.contains('moon-gray')).toBe(true);
        });
        
        runner.it('should display the item-specific BPM when set', () => {
            testContainer.innerHTML = '';
            const view = new PatternItemView(testContainer, {});
            const state = getMockState({ item: { pattern: 'p1', bpm: 95 } });
            view.render(state);
            const bpmInput = testContainer.querySelector('input[data-property="bpm"]');
            runner.expect(Number(bpmInput.value)).toBe(95);
            runner.expect(bpmInput.classList.contains('dark-gray')).toBe(true);
        });
    });

    runner.describe('PatternItemView Callbacks', () => {
        runner.it('should fire onDelete callback when delete button is clicked', () => {
            testContainer.innerHTML = '';
            const callbackLog = new MockLogger('Callbacks');
            const view = new PatternItemView(testContainer, { onDelete: () => callbackLog.log('onDelete') });
            view.render(getMockState());
            
            testContainer.querySelector('button[data-action="delete"]').click();
            callbackLog.wasCalledWith('onDelete');
        });

        runner.it('should fire onPropertyChange callback when repetitions input is blurred', () => {
            testContainer.innerHTML = '';
            const callbackLog = new MockLogger('Callbacks');
            const view = new PatternItemView(testContainer, { 
                onPropertyChange: (prop, val) => callbackLog.log('onPropertyChange', { prop, val })
            });
            view.render(getMockState());
            
            const repsInput = testContainer.querySelector('input[data-property="repetitions"]');
            repsInput.value = '16';
            // --- FIX: Dispatch the 'blur' event instead of 'change' ---
            repsInput.dispatchEvent(new Event('blur', { bubbles: true }));

            callbackLog.wasCalledWith('onPropertyChange', { prop: 'repetitions', val: 16 });
        });
    });

    await runner.runAll();
    runner.renderResults('test-results');
    logEvent('info', 'TestRunner', 'run', 'Teardown', 'PatternItemView test suite finished.');
}