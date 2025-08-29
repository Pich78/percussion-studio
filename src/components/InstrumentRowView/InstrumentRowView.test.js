// file: src/components/InstrumentRowView/InstrumentRowView.test.js

import { TestRunner } from '/percussion-studio/lib/TestRunner.js';
import { MockLogger } from '/percussion-studio/lib/MockLogger.js';
import { logEvent } from '/percussion-studio/lib/Logger.js';
import { InstrumentRowView } from './InstrumentRowView.js';

// --- Mocks for Headers ---
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
        headerProps: { name: 'Test Kick' }, // The generic props object
        callbacks: {},
    });

    runner.describe('InstrumentRowView Rendering', () => {
        let view, headerPanel, gridPanel;
        
        runner.beforeEach(() => {
            headerRenderCount = 0;
            lastHeaderProps = null;
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

        runner.it('should pass headerProps to the injected header component', () => {
            const props = getMockProps();
            view = new InstrumentRowView({ headerPanel, gridPanel }, props);
            runner.expect(lastHeaderProps.name).toBe('Test Kick');
        });

        runner.it('should render the correct number of grid cells', () => {
            const props = getMockProps();
            view = new InstrumentRowView({ headerPanel, gridPanel }, props);
            view.render(props);
            runner.expect(gridPanel.querySelectorAll('.grid-cell').length).toBe(4);
        });

        runner.it('should call render on its header component with updated props', () => {
            const props = getMockProps();
            view = new InstrumentRowView({ headerPanel, gridPanel }, props);
            
            const newRenderProps = { ...props, headerProps: { name: 'New Name' } };
            view.render(newRenderProps);

            runner.expect(headerRenderCount).toBe(1);
            runner.expect(lastHeaderProps.name).toBe('New Name');
        });
    });

    await runner.runAll();
    runner.renderResults('test-results');
    logEvent('info', 'TestRunner', 'run', 'Teardown', 'InstrumentRowView test suite finished.');
}