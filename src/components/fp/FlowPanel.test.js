// file: src/components/FlowPanel/FlowPanel.test.js

import { TestRunner } from '/percussion-studio/lib/TestRunner.js';
import { MockLogger } from '/percussion-studio/lib/MockLogger.js';
import { logEvent } from '/percussion-studio/lib/Logger.js';
import { FlowPanel } from './FlowPanel.js';

export async function run() {
    const runner = new TestRunner();
    MockLogger.clearLogs();
    logEvent('info', 'TestRunner', 'run', 'Setup', 'Starting FlowPanel Web Component test suite.');
    
    const testContainer = document.getElementById('test-sandbox');

    runner.describe('FlowPanel Web Component', () => {
        
        // Setup: ensure the component is created before each test
        let panel;
        runner.beforeEach(() => {
            testContainer.innerHTML = '';
            panel = document.createElement('flow-panel');
            testContainer.appendChild(panel);
        });

        runner.it('should render the correct number of slot containers', () => {
            const items = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];
            panel.items = items;
            
            // Query the Shadow DOM for the rendered slots
            const renderedSlots = panel.shadowRoot.querySelectorAll('.flow-item-slot');
            runner.expect(renderedSlots.length).toBe(3);
        });

        runner.it('should create slots with correctly named attributes', () => {
            const items = [{ id: 'item1' }, { id: 'item2' }];
            panel.items = items;

            const slot1 = panel.shadowRoot.querySelector('slot[name="item-item1"]');
            const slot2 = panel.shadowRoot.querySelector('slot[name="item-item2"]');
            runner.expect(slot1).not.toBeNull();
            runner.expect(slot2).not.toBeNull();
        });

        runner.it('should render draggable elements with the correct data-index', () => {
            const items = [{ id: 10 }, { id: 20 }, { id: 30 }];
            panel.items = items;

            const draggableElements = panel.shadowRoot.querySelectorAll('[draggable="true"]');
            runner.expect(draggableElements[0].dataset.index).toBe('0');
            runner.expect(draggableElements[1].dataset.index).toBe('1');
            runner.expect(draggableElements[2].dataset.index).toBe('2');
        });
        
        runner.it('should clear and re-render slots when items property is set again', () => {
            panel.items = [{ id: 'a' }, { id: 'b' }];
            runner.expect(panel.shadowRoot.querySelectorAll('.flow-item-slot').length).toBe(2);

            panel.items = [{ id: 'x' }, { id: 'y' }, { id: 'z' }, { id: 'w' }];
            runner.expect(panel.shadowRoot.querySelectorAll('.flow-item-slot').length).toBe(4);
            const slot = panel.shadowRoot.querySelector('slot[name="item-x"]');
            runner.expect(slot).not.toBeNull();
        });

        // Note: Testing the full D&D interaction via programmatic events is complex
        // and brittle. It's better suited for the visual integration harness or
        // a full end-to-end testing tool like Cypress. This unit test focuses on
        // the component's public API and its direct rendering output.

    });

    await runner.runAll();
    runner.renderResults('test-results');
    logEvent('info', 'TestRunner', 'run', 'Teardown', 'FlowPanel test suite finished.');
}