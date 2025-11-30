// file: src/components/PatternItemViewMD3/PatternItemViewMD3.test.js

import { TestRunner } from '/percussion-studio/lib/TestRunner.js';
import { MockLogger } from '/percussion-studio/lib/MockLogger.js';
import { logEvent } from '/percussion-studio/lib/Logger.js';
import './PatternItemViewMD3.js'; // Ensure the custom element is defined

export async function run() {
    const runner = new TestRunner();
    MockLogger.clearLogs();
    logEvent('info', 'TestRunner', 'run', 'Setup', 'Starting PatternItemViewMD3 test suite.');
    
    const testContainer = document.getElementById('test-sandbox');

    const createComponent = (props = {}) => {
        testContainer.innerHTML = '';
        const component = document.createElement('pattern-item-view-md3');
        component.itemData = props.itemData || { pattern: 'verse_a' };
        component.globalBPM = props.globalBPM || 120;
        component.patternList = props.patternList || ['verse_a', 'chorus_b'];
        if (props.selected) {
            component.setAttribute('selected', '');
        }
        testContainer.appendChild(component);
        return component;
    };

    runner.describe('PatternItemViewMD3 Rendering', () => {
        runner.it('should render with correct default values when properties are missing', () => {
            const component = createComponent();
            const shadow = component.shadowRoot;
            
            const repsInput = shadow.querySelector('input[part="reps-input"]');
            const bpmValue = shadow.querySelector('span[part="bpm-value"]');
            const accelValue = shadow.querySelector('span[part="accel-value"]');

            runner.expect(Number(repsInput.value)).toBe(1);
            runner.expect(Number(bpmValue.textContent)).toBe(120); // Uses globalBPM
            runner.expect(Number(accelValue.textContent)).toBe(100); // Uses internal default
        });
        
        runner.it('should display the item-specific BPM when set', () => {
            const component = createComponent({ itemData: { pattern: 'p1', bpm: 95 } });
            const bpmValue = component.shadowRoot.querySelector('span[part="bpm-value"]');
            runner.expect(Number(bpmValue.textContent)).toBe(95);
        });

        runner.it('should have the "selected" attribute when selected prop is true', () => {
            const component = createComponent({ selected: true });
            runner.expect(component.hasAttribute('selected')).toBe(true);
        });
    });

    runner.describe('PatternItemViewMD3 Events', () => {
        runner.it('should dispatch "delete-item" event when delete button is clicked', async () => {
            const component = createComponent();
            const eventPromise = new Promise(resolve => {
                component.addEventListener('delete-item', resolve, { once: true });
            });
            
            component.shadowRoot.querySelector('button[part="delete-button"]').click();
            const event = await eventPromise;
            runner.expect(event.type).toBe('delete-item');
        });

        runner.it('should dispatch "property-change" event when repetitions input value is changed', async () => {
            const component = createComponent();
            const eventPromise = new Promise(resolve => {
                component.addEventListener('property-change', resolve, { once: true });
            });
            
            const repsInput = component.shadowRoot.querySelector('input[part="reps-input"]');
            repsInput.value = '16';
            repsInput.dispatchEvent(new Event('change', { bubbles: true }));

            const event = await eventPromise;
            runner.expect(event.detail.property).toBe('repetitions');
            runner.expect(event.detail.value).toBe(16);
        });
    });

    await runner.runAll();
    runner.renderResults('test-results');
    logEvent('info', 'TestRunner', 'run', 'Teardown', 'PatternItemViewMD3 test suite finished.');
}