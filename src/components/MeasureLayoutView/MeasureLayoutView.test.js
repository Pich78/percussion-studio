// file: src/components/MeasureLayoutView/MeasureLayoutView.test.js

import { TestRunner } from '/percussion-studio/lib/TestRunner.js';
import { MockLogger } from '/percussion-studio/lib/MockLogger.js';
import { logEvent } from '/percussion-studio/lib/Logger.js';
import { MeasureLayoutView } from './MeasureLayoutView.js';

// Import the real header components for testing injection
import { EditorRowHeaderView } from '/percussion-studio/src/components/EditorRowHeaderView/EditorRowHeaderView.js';
import { PlaybackRowHeaderView } from '/percussion-studio/src/components/PlaybackRowHeaderView/PlaybackRowHeaderView.js';

// All other dependencies are loaded via the test HTML

export async function run() {
    const runner = new TestRunner();
    MockLogger.clearLogs();
    logEvent('info', 'TestRunner', 'run', 'Setup', 'Starting MeasureLayoutView test suite.');
    
    const testContainer = document.getElementById('test-sandbox');

    const getMockProps = (overrides = {}) => ({
        groupingPattern: [16],
        metrics: { beatGrouping: 4, feel: 'duple' },
        instruments: [
            { id: 'k1', symbol: 'KCK', name: 'Kick', pack: 'Test', pattern: 'o---'.repeat(4), sounds:[] },
        ],
        HeaderComponent: EditorRowHeaderView,
        ...overrides,
    });

    runner.describe('MeasureLayoutView', () => {
        let view = null;
        
        runner.afterEach(() => {
            if (view) view.destroy();
        });

        runner.it('should render one BeatChunkPanel for a single-line layout', () => {
            testContainer.innerHTML = '';
            view = new MeasureLayoutView(testContainer, {});
            view.render(getMockProps());
            
            // Test the behavior: is there one panel in the DOM?
            runner.expect(testContainer.querySelectorAll('.beat-chunk-panel').length).toBe(1);
        });

        runner.it('should render multiple BeatChunkPanels for a multi-line layout', () => {
            testContainer.innerHTML = '';
            view = new MeasureLayoutView(testContainer, {});
            view.render(getMockProps({ groupingPattern: [12, 12] }));

            runner.expect(testContainer.querySelectorAll('.beat-chunk-panel').length).toBe(2);
        });

        runner.it('should render the correct header type in its children', () => {
            testContainer.innerHTML = '';
            view = new MeasureLayoutView(testContainer, {});
            
            // Test Editor Mode
            view.render(getMockProps({ HeaderComponent: EditorRowHeaderView }));
            runner.expect(testContainer.querySelector('.editor-header')).not.toBe(null);
            runner.expect(testContainer.querySelector('.mixer-track')).toBe(null);

            // Test Playback Mode
            view.render(getMockProps({ HeaderComponent: PlaybackRowHeaderView }));
            runner.expect(testContainer.querySelector('.mixer-track')).not.toBe(null);
            runner.expect(testContainer.querySelector('.editor-header')).toBe(null);
        });
    });

    await runner.runAll();
    runner.renderResults('test-results');
    logEvent('info', 'TestRunner', 'run', 'Teardown', 'MeasureLayoutView test suite finished.');
}