// file: src/components/PlaybackView/PlaybackView.test.js

import { TestRunner } from '/percussion-studio/lib/TestRunner.js';
import { MockLogger } from '/percussion-studio/lib/MockLogger.js';
import { logEvent } from '/percussion-studio/lib/Logger.js';
import { PlaybackView } from './PlaybackView.js';

// --- Enhanced Mock Child Component ---
// It now tracks its own state, allowing us to inspect multiple instances.
let mockInstances = [];
class MockPlaybackMeasureView {
    constructor(container) {
        this.container = container;
        this.isActive = false;
        this.lastTick = -1;
        mockInstances.push(this); // Add self to a global list for inspection
    }
    render(data) { /* no-op for this test */ }
    destroy() { /* no-op */ }
    updatePlaybackIndicator(tick, isActive) {
        this.lastTick = tick;
        this.isActive = isActive;
    }
}

export async function run() {
    const runner = new TestRunner();
    MockLogger.clearLogs();
    logEvent('info', 'TestRunner', 'run', 'Setup', 'Starting PlaybackView test suite.');
    
    const testContainer = document.getElementById('test-sandbox');

    const getMockRhythm = () => ({
        measures: [
            { id: 'm1', startTick: 0, endTick: 16, data: {} },
            { id: 'm2', startTick: 16, endTick: 32, data: {} },
        ]
    });

    runner.describe('PlaybackView', () => {
        let view = null;

        runner.beforeEach(() => {
            // Reset the mock instances list before each test
            mockInstances = [];
        });

        runner.afterEach(() => {
            if (view) view.destroy();
        });

        runner.it('should render one child view for each measure', () => {
            testContainer.innerHTML = '';
            view = new PlaybackView(testContainer, { PlaybackMeasureView: MockPlaybackMeasureView });
            view.render(getMockRhythm());

            runner.expect(testContainer.querySelectorAll('.playback-view__measure-container').length).toBe(2);
            runner.expect(mockInstances.length).toBe(2);
        });

        runner.it('should destroy its children when destroyed', () => {
            testContainer.innerHTML = '';
            // We need to spy on the destroy method
            let destroyCount = 0;
            class MockWithDestroy extends MockPlaybackMeasureView {
                destroy() { destroyCount++; }
            }
            view = new PlaybackView(testContainer, { PlaybackMeasureView: MockWithDestroy });
            view.render(getMockRhythm());
            
            view.destroy();
            runner.expect(destroyCount).toBe(2);
            runner.expect(testContainer.innerHTML).toBe('');
        });

        runner.it('should update the correct child with the playback indicator', () => {
            testContainer.innerHTML = '';
            view = new PlaybackView(testContainer, { PlaybackMeasureView: MockPlaybackMeasureView });
            view.render(getMockRhythm());

            view.updatePlaybackIndicator(18); // This tick falls within the second measure (16-32)
            
            const measure1Instance = mockInstances[0];
            const measure2Instance = mockInstances[1];

            runner.expect(measure1Instance.isActive).toBe(false);
            runner.expect(measure2Instance.isActive).toBe(true);
            // The relative tick passed to the child should be 18 - 16 = 2
            runner.expect(measure2Instance.lastTick).toBe(2);
        });

        runner.it('should deactivate indicators on children that are not being played', () => {
            testContainer.innerHTML = '';
            const rhythm = getMockRhythm();
            // Add a third measure to make the test more robust
            rhythm.measures.push({ id: 'm3', startTick: 32, endTick: 48 });
            
            view = new PlaybackView(testContainer, { PlaybackMeasureView: MockPlaybackMeasureView });
            view.render(rhythm);

            // First, activate the indicator in measure 2
            view.updatePlaybackIndicator(20);
            const measure1 = mockInstances[0];
            const measure2 = mockInstances[1];
            const measure3 = mockInstances[2];

            runner.expect(measure1.isActive).toBe(false);
            runner.expect(measure2.isActive).toBe(true);
            runner.expect(measure3.isActive).toBe(false);

            // Now, move the indicator to measure 3
            view.updatePlaybackIndicator(35);

            // Verify that measure 2 is now inactive
            runner.expect(measure1.isActive).toBe(false);
            runner.expect(measure2.isActive).toBe(false);
            runner.expect(measure3.isActive).toBe(true);
        });
    });

    await runner.runAll();
    runner.renderResults('test-results');
    logEvent('info', 'TestRunner', 'run', 'Teardown', 'PlaybackView test suite finished.');
}