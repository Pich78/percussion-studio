// file: src/components/InstrumentRowView/InstrumentRowView.test.js

import { TestRunner } from '/percussion-studio/lib/TestRunner.js';
import { MockLogger } from '/percussion-studio/lib/MockLogger.js';
import { logEvent } from '/percussion-studio/lib/Logger.js';
import { InstrumentRowView } from './InstrumentRowView.js';

export async function run() {
    const runner = new TestRunner();
    MockLogger.clearLogs();
    logEvent('info', 'TestRunner', 'run', 'Setup', 'Starting InstrumentRowView test suite.');
    
    const testContainer = document.getElementById('test-sandbox');

    const getMockProps = () => ({
        instrument: { 
            symbol: 'KCK', name: 'Kick Test', 
            sounds: [{letter: 'o', svg: '<svg>o</svg>'}, {letter: 'p', svg: '<svg>p</svg>'}] 
        },
        notation: '||o-p-o---||',
        metrics: { beatsPerMeasure: 4, beatUnit: 4, subdivision: 8, grouping: 2 }, // 4/4 with 8ths
        // --- FIX: Add the missing densityClass prop required by the component ---
        densityClass: 'density-medium' 
    });

    runner.describe('InstrumentRowView', () => {
        // ... all test cases below this line remain exactly the same ...
        runner.it('should render the correct number of cells based on metrics', () => {
            testContainer.innerHTML = '';
            const view = new InstrumentRowView(testContainer, {});
            let props = getMockProps();
            
            view.render(props);
            runner.expect(testContainer.querySelectorAll('.grid-cell').length).toBe(8);

            props.metrics = { beatsPerMeasure: 6, beatUnit: 8, subdivision: 16, grouping: 3 };
            view.render(props);
            runner.expect(testContainer.querySelectorAll('.grid-cell').length).toBe(12);
        });

        runner.it('should render notes in the correct cells based on notation string', () => {
            testContainer.innerHTML = '';
            const view = new InstrumentRowView(testContainer, {});
            view.render(getMockProps());

            const cells = testContainer.querySelectorAll('.grid-cell');
            runner.expect(cells[0].querySelector('.note')).not.toBe(null);
            runner.expect(cells[2].querySelector('.note')).not.toBe(null);
            runner.expect(cells[4].querySelector('.note')).not.toBe(null);
            runner.expect(cells[1].querySelector('.note')).toBe(null);
            runner.expect(cells[5].querySelector('.note')).toBe(null);
        });

        runner.it('should apply highlighted-beat class to the correct cells', () => {
            testContainer.innerHTML = '';
            const view = new InstrumentRowView(testContainer, {});
            
            let props = getMockProps();
            view.render(props);
            let highlighted = testContainer.querySelectorAll('.highlighted-beat');
            runner.expect(highlighted.length).toBe(4);
            runner.expect(highlighted[0].dataset.tickIndex).toBe('0');
            runner.expect(highlighted[1].dataset.tickIndex).toBe('2');

            props.metrics = { beatsPerMeasure: 12, beatUnit: 8, subdivision: 8, grouping: 3 };
            view.render(props);
            highlighted = testContainer.querySelectorAll('.highlighted-beat');
            runner.expect(highlighted.length).toBe(4);
            runner.expect(highlighted[0].dataset.tickIndex).toBe('0');
            runner.expect(highlighted[1].dataset.tickIndex).toBe('3');
            runner.expect(highlighted[2].dataset.tickIndex).toBe('6');
        });

        runner.it('should fire onRequestInstrumentChange when header is clicked', () => {
            testContainer.innerHTML = '';
            const callbackLog = new MockLogger('Callbacks');
            const view = new InstrumentRowView(testContainer, {
                onRequestInstrumentChange: (symbol) => callbackLog.log('onRequestInstrumentChange', symbol)
            });
            view.render(getMockProps());
            
            testContainer.querySelector('.instrument-row-header').click();
            callbackLog.wasCalledWith('onRequestInstrumentChange', 'KCK');
        });

        runner.it('should fire onCellMouseDown with correct index when a cell is clicked', () => {
            testContainer.innerHTML = '';
            const callbackLog = new MockLogger('Callbacks');
            const view = new InstrumentRowView(testContainer, {
                onCellMouseDown: (index, event) => callbackLog.log('onCellMouseDown', { index })
            });
            view.render(getMockProps());

            const cellToClick = testContainer.querySelector('[data-tick-index="3"]');
            cellToClick.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
            
            callbackLog.wasCalledWith('onCellMouseDown', { index: 3 });
        });
    });

    await runner.runAll();
    runner.renderResults('test-results');
    logEvent('info', 'TestRunner', 'run', 'Teown', 'InstrumentRowView test suite finished.');
}
