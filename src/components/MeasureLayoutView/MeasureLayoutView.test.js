// file: src/components/MeasureLayoutView/MeasureLayoutView.test.js

import { TestRunner } from '/percussion-studio/lib/TestRunner.js';
import { MockLogger } from '/percussion-studio/lib/MockLogger.js';
import { logEvent } from '/percussion-studio/lib/Logger.js';
import { MeasureLayoutView } from './MeasureLayoutView.js';

// We import the real child components because we will now test by observing them in the DOM.
import '/percussion-studio/src/components/BeatRulerView/BeatRulerView.js';
import '/percussion-studio/src/components/BeatView/BeatView.js';
import '/percussion-studio/src/components/InstrumentRowView/InstrumentRowView.js';
import '/percussion-studio/src/components/EditorRowHeaderView/EditorRowHeaderView.js';
import '/percussion-studio/src/components/PlaybackRowHeaderView/PlaybackRowHeaderView.js';

export async function run() {
    const runner = new TestRunner();
    MockLogger.clearLogs();
    logEvent('info', 'TestRunner', 'run', 'Setup', 'Starting MeasureLayoutView test suite.');
    
    const testContainer = document.getElementById('test-sandbox');

    const getMockProps = (overrides = {}) => ({
        groupingPattern: [16],
        metrics: { beatGrouping: 4, feel: 'duple' }, // Added 'feel' for robustness
        instruments: [
            { id: 'k1', symbol: 'KCK', name: 'Kick', pack: 'Test', pattern: 'o---o---o---o---', sounds:[{letter: 'o', svg:'<svg/>'}] },
            { id: 's1', symbol: 'SNR', name: 'Snare', pack: 'Test', pattern: '----o-------o---', sounds:[{letter: 'o', svg:'<svg/>'}] }
        ],
        mode: 'editor',
        ...overrides,
    });

    runner.describe('MeasureLayoutView', () => {
        let view = null;
        
        runner.afterEach(() => {
            if (view) view.destroy();
        });

        runner.it('should render a BeatRuler and one BeatView for a single-line layout', () => {
            testContainer.innerHTML = '';
            view = new MeasureLayoutView(testContainer, {});
            view.render(getMockProps());
            
            // Check for the real components' unique classes
            runner.expect(testContainer.querySelector('.beat-ruler')).not.toBe(null);
            runner.expect(testContainer.querySelectorAll('.beat-view').length).toBe(1);
        });

        runner.it('should render multiple BeatViews for a multi-line layout', () => {
            testContainer.innerHTML = '';
            view = new MeasureLayoutView(testContainer, {});
            const props = getMockProps({ groupingPattern: [12, 12] });
            view.render(props);

            runner.expect(testContainer.querySelectorAll('.beat-view').length).toBe(2);
        });
        
        runner.it('should render headers in "editor" mode correctly', () => {
            testContainer.innerHTML = '';
            view = new MeasureLayoutView(testContainer, {});
            view.render(getMockProps({ mode: 'editor' }));

            // All rows should have an editor header
            runner.expect(testContainer.querySelectorAll('.editor-header').length).toBe(2);
            runner.expect(testContainer.querySelector('.mixer-track')).toBe(null);
        });

        runner.it('should render headers in "playback" mode correctly', () => {
            testContainer.innerHTML = '';
            view = new MeasureLayoutView(testContainer, {});
            view.render(getMockProps({ mode: 'playback' }));
            
            // All rows should have a playback/mixer header
            runner.expect(testContainer.querySelectorAll('.mixer-track').length).toBe(2);
            runner.expect(testContainer.querySelector('.editor-header')).toBe(null);
        });

        runner.it('should highlight the active tick when updatePlaybackIndicator is called', () => {
            testContainer.innerHTML = '';
            view = new MeasureLayoutView(testContainer, {});
            view.render(getMockProps());

            view.updatePlaybackIndicator(5);
            const activeCell = testContainer.querySelector('.grid-cell.is-active');
            runner.expect(activeCell).not.toBe(null);
            runner.expect(activeCell.dataset.tickIndex).toBe('5');
            
            // Move the indicator
            view.updatePlaybackIndicator(10);
            runner.expect(testContainer.querySelectorAll('.grid-cell.is-active').length).toBe(1);
            runner.expect(testContainer.querySelector('.grid-cell.is-active').dataset.tickIndex).toBe('10');
        });
    });

    await runner.runAll();
    runner.renderResults('test-results');
    logEvent('info', 'TestRunner', 'run', 'Teardown', 'MeasureLayoutView test suite finished.');
}