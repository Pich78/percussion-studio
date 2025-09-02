// file: src/components/InstrumentRowView/InstrumentRowView.test.js

import { TestRunner } from '/percussion-studio/lib/TestRunner.js';
import { MockLogger } from '/percussion-studio/lib/MockLogger.js';
import { logEvent } from '/percussion-studio/lib/Logger.js';
import { InstrumentRowView } from './InstrumentRowView.js';

// --- Mocks for Children ---
let headerRenderCount = 0;
let lastHeaderProps = null;
class MockHeader {
    constructor(container, props) {
        lastHeaderProps = props;
    }
    render(props) {
        headerRenderCount++;
        lastHeaderProps = props;
    }
    destroy() {}
}

let gridRenderCount = 0;
let lastGridProps = null;
class MockGridPanel {
    constructor(container, callbacks) {
        // Test that callbacks are passed
        this.callbacks = callbacks;
    }
    render(props) {
        gridRenderCount++;
        lastGridProps = props;
    }
    destroy() {}
}


export async function run() {
    const runner = new TestRunner();
    MockLogger.clearLogs();
    logEvent('info', 'TestRunner', 'run', 'Setup', 'Starting InstrumentRowView test suite.');
    
    const testContainer = document.getElementById('test-sandbox');

    const getMockProps = () => ({
        instrument: { id: 'k1', symbol: 'KCK', sounds: [] },
        notation: 'o---',
        metrics: { beatGrouping: 4, feel: 'duple' },
        HeaderComponent: MockHeader,
        GridPanelComponent: MockGridPanel, // Add mock grid panel
        headerProps: { name: 'Test Kick' },
        callbacks: { onTest: () => {} },
    });

    runner.describe('InstrumentRowView Orchestration Logic', () => {
        let view, headerPanel, gridPanel;
        
        runner.beforeEach(() => {
            headerRenderCount = 0;
            lastHeaderProps = null;
            gridRenderCount = 0;
            lastGridProps = null;

            testContainer.innerHTML = `
                <div id="header-panel-test"></div>
                <div id="grid-panel-test"></div>
            `;
            headerPanel = document.getElementById('header-panel-test');
            gridPanel = document.getElementById('grid-panel-test');
        });

        runner.afterEach(() => {
            if(view) view.destroy();
        });

        runner.it('should pass headerProps to the injected header component on construction', () => {
            const props = getMockProps();
            view = new InstrumentRowView({ headerPanel, gridPanel }, props);
            runner.expect(lastHeaderProps.name).toBe('Test Kick');
        });
        
        runner.it('should pass callbacks to the injected grid panel component on construction', () => {
            const props = getMockProps();
            view = new InstrumentRowView({ headerPanel, gridPanel }, props);
            runner.expect(typeof view.gridComponent.callbacks.onTest).toBe('function');
        });

        runner.it('should call render on its header component with updated props', () => {
            const props = getMockProps();
            view = new InstrumentRowView({ headerPanel, gridPanel }, props);
            
            const newRenderProps = { ...props, headerProps: { name: 'New Name' } };
            view.render(newRenderProps);

            runner.expect(headerRenderCount).toBe(1);
            runner.expect(lastHeaderProps.name).toBe('New Name');
        });

        runner.it('should call render on its grid panel component with the correct props', () => {
            const props = getMockProps();
            view = new InstrumentRowView({ headerPanel, gridPanel }, props);
            
            const newRenderProps = { ...props, notation: 'x-x-' };
            view.render(newRenderProps);
            
            runner.expect(gridRenderCount).toBe(1);
            runner.expect(lastGridProps.notation).toBe('x-x-');
            runner.expect(lastGridProps.instrument.symbol).toBe('KCK');
        });
    });

    await runner.runAll();
    runner.renderResults('test-results');
    logEvent('info', 'TestRunner', 'run', 'Teardown', 'InstrumentRowView test suite finished.');
}