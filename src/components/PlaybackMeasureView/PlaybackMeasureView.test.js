// file: src/components/PlaybackMeasureView/PlaybackMeasureView.test.js

import { TestRunner } from '/percussion-studio/lib/TestRunner.js';
import { MockLogger } from '/percussion-studio/lib/MockLogger.js';
import { logEvent } from '/percussion-studio/lib/Logger.js';
import { PlaybackMeasureView } from './PlaybackMeasureView.js';

// Import all real dependencies, as we will test the component's output in the DOM
import '/percussion-studio/src/components/MeasureLayoutView/MeasureLayoutView.js';

export async function run() {
    const runner = new TestRunner();
    MockLogger.clearLogs();
    logEvent('info', 'TestRunner', 'run', 'Setup', 'Starting PlaybackMeasureView test suite.');
    
    const testContainer = document.getElementById('test-sandbox');

    const getMockMeasureData = () => ({
        timeSignature: '4/4',
        subdivision: '16',
        groupingPattern: [16],
        // --- FIX: Provide complete instrument data that child components require ---
        instruments: [
            { 
                id: 'k1', 
                symbol: 'KCK',
                name: 'Kick',
                pack: 'Test Kit',
                volume: 1.0,
                muted: false,
                pattern: 'o---'.repeat(4),
                sounds: [{ letter: 'o', svg: '<svg></svg>' }]
            }
        ]
    });

    runner.describe('PlaybackMeasureView', () => {
        let view = null;
        
        runner.afterEach(() => {
            if (view) view.destroy();
        });

        runner.it('should render its child MeasureLayoutView', () => {
            testContainer.innerHTML = '';
            view = new PlaybackMeasureView(testContainer, {});
            view.render(getMockMeasureData());
            
            runner.expect(testContainer.querySelector('.measure-layout-view')).not.toBe(null);
        });

        runner.it('should render its child in "playback" mode', () => {
            testContainer.innerHTML = '';
            view = new PlaybackMeasureView(testContainer, {});
            view.render(getMockMeasureData());

            // Check for a class unique to the playback header
            runner.expect(testContainer.querySelector('.mixer-track')).not.toBe(null);
            runner.expect(testContainer.querySelector('.editor-header')).toBe(null);
        });

        runner.it('should correctly render based on the grouping pattern', () => {
            testContainer.innerHTML = '';
            view = new PlaybackMeasureView(testContainer, {});
            const data = getMockMeasureData();
            data.groupingPattern = [8, 8]; // Two beats
            view.render(data);
            
            runner.expect(testContainer.querySelectorAll('.beat-view').length).toBe(2);
        });

        runner.it('should highlight the active tick via its child', () => {
            testContainer.innerHTML = '';
            view = new PlaybackMeasureView(testContainer, {});
            view.render(getMockMeasureData());
            
            view.updatePlaybackIndicator(7, true);
            const activeCell = testContainer.querySelector('.grid-cell.is-active');
            runner.expect(activeCell).not.toBe(null);
            runner.expect(activeCell.dataset.tickIndex).toBe('7');
        });
        
        runner.it('should remove highlight when deactivated', () => {
            testContainer.innerHTML = '';
            view = new PlaybackMeasureView(testContainer, {});
            view.render(getMockMeasureData());
            
            view.updatePlaybackIndicator(7, true); // Activate
            runner.expect(testContainer.querySelector('.grid-cell.is-active')).not.toBe(null);

            view.updatePlaybackIndicator(7, false); // Deactivate
            runner.expect(testContainer.querySelector('.grid-cell.is-active')).toBe(null);
        });
    });

    await runner.runAll();
    runner.renderResults('test-results');
    logEvent('info', 'TestRunner', 'run', 'Teardown', 'PlaybackMeasureView test suite finished.');
}