// file: src/components/MeasureLayoutView/MeasureLayoutView.test.js

import { TestRunner } from '/percussion-studio/lib/TestRunner.js';
import { MockLogger } from '/percussion-studio/lib/MockLogger.js';
import { logEvent } from '/percussion-studio/lib/Logger.js';
import { MeasureLayoutView } from './MeasureLayoutView.js';

// --- Mocks ---
let panelInstances = [];
class MockBeatChunkPanel {
    constructor(container, callbacks) {
        this.lastTick = -1;
        panelInstances.push(this);
    }
    render(props) {}
    destroy() {}
    updatePlaybackIndicator(tick) {
        this.lastTick = tick;
    }
}

class MockEditorHeader {}

export async function run() {
    const runner = new TestRunner();
    MockLogger.clearLogs();
    logEvent('info', 'TestRunner', 'run', 'Setup', 'Starting MeasureLayoutView test suite.');
    
    // Inject mock for isolated testing
    MeasureLayoutView.prototype.BeatChunkPanel = MockBeatChunkPanel;

    const testContainer = document.getElementById('test-sandbox');

    const getMockProps = (overrides = {}) => ({
        groupingPattern: [16],
        metrics: { beatGrouping: 4 },
        instruments: [],
        HeaderComponent: MockEditorHeader,
        ...overrides
    });

    runner.describe('MeasureLayoutView', () => {
        let view = null;
        
        runner.beforeEach(() => {
            panelInstances = [];
        });
        
        runner.afterEach(() => {
            if (view) view.destroy();
        });

        runner.it('should render the correct number of BeatChunkPanels', () => {
            testContainer.innerHTML = '';
            view = new MeasureLayoutView(testContainer, {});
            view.render(getMockProps({ groupingPattern: [12, 12] }));
            runner.expect(panelInstances.length).toBe(2);
        });

        runner.it('should delegate updatePlaybackIndicator to the correct child panel', () => {
            testContainer.innerHTML = '';
            view = new MeasureLayoutView(testContainer, {});
            view.render(getMockProps({ groupingPattern: [16, 12] })); // Two panels

            // Tick 18 is in the second panel (size 16), so relative tick should be 2
            view.updatePlaybackIndicator(18);

            runner.expect(panelInstances[0].lastTick).toBe(-1); // First panel should be told to deactivate
            runner.expect(panelInstances[1].lastTick).toBe(2); // Second panel should be told to activate at tick 2
        });
        
        runner.it('should deactivate all panels when tick is -1', () => {
            testContainer.innerHTML = '';
            view = new MeasureLayoutView(testContainer, {});
            view.render(getMockProps({ groupingPattern: [16, 12] }));
            
            view.updatePlaybackIndicator(5); // Activate one first
            view.updatePlaybackIndicator(-1); // Then deactivate all

            runner.expect(panelInstances[0].lastTick).toBe(-1);
            runner.expect(panelInstances[1].lastTick).toBe(-1);
        });
    });

    await runner.runAll();
    runner.renderResults('test-results');
    logEvent('info', 'TestRunner', 'run', 'Teardown', 'MeasureLayoutView test suite finished.');
}