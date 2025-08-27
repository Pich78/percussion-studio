// file: src/components/BeatView/BeatView.test.js

import { TestRunner } from '/percussion-studio/lib/TestRunner.js';
import { MockLogger } from '/percussion-studio/lib/MockLogger.js';
import { logEvent } from '/percussion-studio/lib/Logger.js';
import { BeatView } from './BeatView.js';
// We need to import the real InstrumentRowView as it's a dependency of our component under test
import { InstrumentRowView } from '/percussion-studio/src/components/InstrumentRowView/InstrumentRowView.js';

export async function run() {
    const runner = new TestRunner();
    MockLogger.clearLogs();
    logEvent('info', 'TestRunner', 'run', 'Setup', 'Starting BeatView test suite.');
    
    const testContainer = document.getElementById('test-sandbox');

    const getMockProps = () => ({
        beatNumber: 1,
        instruments: [
            // --- FIX 1: Provide complete and realistic mock instrument data ---
            { 
                id: 'kck_1', 
                symbol: 'KCK', 
                name: 'Kick', 
                pattern: 'o---', 
                sounds: [{ letter: 'o', name: 'Hit', svg: '<svg></svg>' }] 
            },
            { 
                id: 'snr_1', 
                symbol: 'SNR', 
                name: 'Snare', 
                pattern: '----', 
                sounds: [{ letter: 'o', name: 'Hit', svg: '<svg></svg>' }] 
            },
        ],
        metrics: { beatsPerMeasure: 4, beatUnit: 4, subdivision: 16, grouping: 4 },
        mode: 'editor'
    });

    runner.describe('BeatView Rendering and Lifecycle', () => {
        let view = null;

        runner.afterEach(() => {
            if (view) view.destroy();
        });

        runner.it('should render a header with the correct beat number', () => {
            testContainer.innerHTML = '';
            view = new BeatView(testContainer, {});
            view.render(getMockProps());
            
            const header = testContainer.querySelector('.beat-view__header');
            runner.expect(header).not.toBe(null);
            runner.expect(header.textContent).toBe('Beat 1');
        });

        runner.it('should render one InstrumentRowView container for each instrument', () => {
            testContainer.innerHTML = '';
            view = new BeatView(testContainer, {});
            view.render(getMockProps());

            const rowContainers = testContainer.querySelectorAll('.instrument-row-view');
            runner.expect(rowContainers.length).toBe(2);
        });

        runner.it('should clean up its children when destroy is called', () => {
            testContainer.innerHTML = '';
            view = new BeatView(testContainer, {});
            view.render(getMockProps());
            
            runner.expect(view.childInstances.size).toBe(2);
            view.destroy();
            runner.expect(view.childInstances.size).toBe(0);
            runner.expect(testContainer.innerHTML).toBe('');
        });

        runner.it('should re-render correctly with new data', () => {
            testContainer.innerHTML = '';
            view = new BeatView(testContainer, {});
            view.render(getMockProps());
            runner.expect(testContainer.querySelectorAll('.instrument-row-view').length).toBe(2);

            const newProps = getMockProps();
            newProps.instruments.push({ id: 'hhc_1', symbol: 'HHC', name: 'Hi-Hat', pattern: 'x-x-', sounds: [{letter: 'x', svg: '<svg></svg>'}] });
            view.render(newProps);
            
            runner.expect(testContainer.querySelectorAll('.instrument-row-view').length).toBe(3);
        });
    });

    await runner.runAll();
    runner.renderResults('test-results');
    logEvent('info', 'TestRunner', 'run', 'Teardown', 'BeatView test suite finished.');
}