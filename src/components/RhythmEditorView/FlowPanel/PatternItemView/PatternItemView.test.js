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
        item: { pattern: 'verse_a' }, // Minimal item by default
        index: 0,
        globalBPM: 120,
        isSelected: false,
        ...overrides
    });

    runner.describe('PatternItemView Rendering', () => {
        runner.it('should render with correct default values when properties are missing', () => {
            testContainer.innerHTML = '';
            const view = new PatternItemView(testContainer, {});
            view.render(getMockState()); // Use the minimal state
            
            const repsInput = testContainer.querySelector('input[data-property="repetitions"]');
            const bpmValue = testContainer.querySelector('span[data-property="bpm"]');
            const accelValue = testContainer.querySelector('span[data-property="bpm_accel_cents"]');

            runner.expect(Number(repsInput.value)).toBe(1);
            runner.expect(Number(bpmValue.textContent)).toBe(120); // Uses globalBPM
            runner.expect(Number(accelValue.textContent)).toBe(100); // Uses new default
        });
        
        runner.it('should display the item-specific BPM when set', () => {
            testContainer.innerHTML = '';
            const view = new PatternItemView(testContainer, {});
            const state = getMockState({ item: { pattern: 'p1', bpm: 95 } });
            view.render(state);
            const bpmValue = testContainer.querySelector('span[data-property="bpm"]');
            runner.expect(Number(bpmValue.textContent)).toBe(95);
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

        runner.it('should fire onPropertyChange callback when repetitions input value is changed', () => {
            testContainer.innerHTML = '';
            const callbackLog = new MockLogger('Callbacks');
            const view = new PatternItemView(testContainer, { 
                onPropertyChange: (prop, val) => callbackLog.log('onPropertyChange', { prop, val })
            });
            view.render(getMockState());
            
            const repsInput = testContainer.querySelector('input[data-property="repetitions"]');
            repsInput.value = '16';
            // The component now listens for the 'change' event on number inputs.
            repsInput.dispatchEvent(new Event('change', { bubbles: true }));

            callbackLog.wasCalledWith('onPropertyChange', { prop: 'repetitions', val: 16 });
        });
    });

    await runner.runAll();
    runner.renderResults('test-results');
    logEvent('info', 'TestRunner', 'run', 'Teardown', 'PatternItemView test suite finished.');
}