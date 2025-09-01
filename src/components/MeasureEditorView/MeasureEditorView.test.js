// file: src/components/MeasureEditorView/MeasureEditorView.test.js

import { TestRunner } from '/percussion-studio/lib/TestRunner.js';
import { MockLogger } from '/percussion-studio/lib/MockLogger.js';
import { logEvent } from '/percussion-studio/lib/Logger.js';
import { MeasureEditorView } from './MeasureEditorView.js';
import { METRICS_CONFIG } from '/percussion-studio/src/config/MetricsConfiguration.js';

// Mock the child MeasureLayoutView for isolated unit testing
let lastLayoutProps = null;
class MockMeasureLayoutView {
    constructor() {}
    render(props) { lastLayoutProps = props; }
    destroy() {}
}

export async function run() {
    const runner = new TestRunner();
    MockLogger.clearLogs();
    logEvent('info', 'TestRunner', 'run', 'Setup', 'Starting MeasureEditorView test suite.');
    
    const testContainer = document.getElementById('test-sandbox');
    const mockDependencies = {
        MeasureLayoutView: MockMeasureLayoutView
    };

    const getMockProps = () => ({
        soundPacks: [{ symbol: 'KCK', pack_name: 'kick_1', name: 'Acoustic Kick' }]
    });

    runner.describe('MeasureEditorView', () => {
        let view = null;
        
        runner.afterEach(() => {
            if (view) view.destroy();
        });

        runner.it('should render a rhythm dropdown and an "add" button', () => {
            testContainer.innerHTML = '';
            view = new MeasureEditorView(testContainer, getMockProps(), mockDependencies);
            
            runner.expect(testContainer.querySelector('select[data-control="rhythm-select"]')).not.toBe(null);
            runner.expect(testContainer.querySelector('.add-instrument-btn')).not.toBe(null);
        });

        runner.it('should instantiate and render its child MeasureLayoutView', () => {
            lastLayoutProps = null;
            testContainer.innerHTML = '';
            view = new MeasureEditorView(testContainer, getMockProps(), mockDependencies);
            
            runner.expect(lastLayoutProps).not.toBe(null);
        });

        runner.it('should pass the correct HeaderComponent to its child', async () => {
            lastLayoutProps = null;
            testContainer.innerHTML = '';
            view = new MeasureEditorView(testContainer, getMockProps(), mockDependencies);

            const { EditorRowHeaderView } = await import('/percussion-studio/src/components/EditorRowHeaderView/EditorRowHeaderView.js');
            runner.expect(lastLayoutProps.HeaderComponent).toBe(EditorRowHeaderView);
        });

        runner.it('should fire onMetricsChange and update child props when rhythm changes', () => {
            const callbackLog = new MockLogger('Callbacks');
            testContainer.innerHTML = '';
            view = new MeasureEditorView(testContainer, {
                ...getMockProps(),
                callbacks: { onMetricsChange: (metrics) => callbackLog.log('onMetricsChange', metrics) }
            }, mockDependencies);
            
            const select = testContainer.querySelector('select[data-control="rhythm-select"]');
            select.value = '6/8|16';
            select.dispatchEvent(new Event('change', { bubbles: true }));

            // --- FIX: Provide the expected object to wasCalledWith ---
            const expectedMetrics = METRICS_CONFIG['6/8'].subdivisions['16'];
            callbackLog.wasCalledWith('onMetricsChange', expectedMetrics);

            // Verify the new props were passed down to the child
            runner.expect(lastLayoutProps.groupingPattern[0]).toBe(12);
        });
    });

    await runner.runAll();
    runner.renderResults('test-results');
    logEvent('info', 'TestRunner', 'run', 'Teardown', 'MeasureEditorView test suite finished.');
}