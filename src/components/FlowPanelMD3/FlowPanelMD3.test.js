// file: src/components/FlowPanelMD3/FlowPanelMD3.test.js

import { TestRunner } from '/percussion-studio/lib/TestRunner.js';
import { MockLogger } from '/percussion-studio/lib/MockLogger.js';
import { logEvent } from '/percussion-studio/lib/Logger.js';
import './FlowPanelMD3.js';

export async function run() {
    const runner = new TestRunner();
    MockLogger.clearLogs();
    logEvent('info', 'TestRunner', 'run', 'Setup', 'Starting FlowPanelMD3 test suite.');
    
    const testContainer = document.getElementById('test-sandbox');

    const getMockState = (overrides = {}) => ({
        flow: [{ pattern: 'verse', repetitions: 4 }, { pattern: 'chorus', repetitions: 2 }],
        currentPatternId: 'verse',
        isExpanded: false,
        globalBPM: 120,
        patternList: ['verse', 'chorus'],
        ...overrides
    });

    const createComponent = (state) => {
        testContainer.innerHTML = '';
        const component = document.createElement('flow-panel-md3');
        component.flowData = state.flow;
        component.currentPatternId = state.currentPatternId;
        component.globalBPM = state.globalBPM;
        component.patternList = state.patternList;
        if (state.isExpanded) {
            component.setAttribute('expanded', '');
        }
        testContainer.appendChild(component);
        // Wait for component to render its children
        return new Promise(resolve => setTimeout(() => resolve(component), 0));
    };

    runner.describe('FlowPanelMD3 Rendering', () => {
        runner.it('should render the correct number of flow items', async () => {
            const component = await createComponent(getMockState());
            const items = component.shadowRoot.querySelectorAll('pattern-item-view-md3');
            runner.expect(items.length).toBe(2);
        });

        runner.it('should have "expanded" attribute when expanded', async () => {
            const component = await createComponent(getMockState({ isExpanded: true }));
            runner.expect(component.hasAttribute('expanded')).toBe(true);
        });

        runner.it('should mark the correct item as selected', async () => {
            const state = getMockState({ currentPatternId: 'chorus' });
            const component = await createComponent(state);
            const selectedItem = component.shadowRoot.querySelector('pattern-item-view-md3[selected]');
            const unselectedItem = component.shadowRoot.querySelector('pattern-item-view-md3:not([selected])');
            
            // FIX: Corrected assertion syntax and made it more robust.
            runner.expect(selectedItem !== null).toBe(true, 'Expected to find a selected item');
            runner.expect(selectedItem.dataset.patternId).toBe('chorus', 'The selected item should be "chorus"');
            
            runner.expect(unselectedItem !== null).toBe(true, 'Expected to find an unselected item');
            runner.expect(unselectedItem.dataset.patternId).toBe('verse', 'The unselected item should be "verse"');
        });
    });

    runner.describe('FlowPanelMD3 Events', () => {
        runner.it('should fire "pattern-select" when a flow item is clicked', async () => {
            const component = await createComponent(getMockState());
            const eventPromise = new Promise(resolve => {
                component.addEventListener('pattern-select', resolve, { once: true });
            });

            const itemToClick = component.shadowRoot.querySelector('[data-pattern-id="chorus"]');
            itemToClick.click();
            
            const event = await eventPromise;
            runner.expect(event.detail.patternId).toBe('chorus');
        });

        runner.it('should fire "add-pattern" when the add button is clicked', async () => {
            const component = await createComponent(getMockState());
            const eventPromise = new Promise(resolve => {
                component.addEventListener('add-pattern', resolve, { once: true });
            });

            component.shadowRoot.querySelector('#add-btn').click();
            
            const event = await eventPromise;
            runner.expect(event.type).toBe('add-pattern');
        });
    });

    await runner.runAll();
    runner.renderResults('test-results');
    logEvent('info', 'TestRunner', 'run', 'Teardown', 'FlowPanelMD3 test suite finished.');
}