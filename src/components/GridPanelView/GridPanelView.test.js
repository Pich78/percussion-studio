// file: src/components/GridPanelView/GridPanelView.test.js

import { TestRunner } from '/percussion-studio/lib/TestRunner.js';
import { MockLogger } from '/percussion-studio/lib/MockLogger.js';
import { logEvent } from '/percussion-studio/lib/Logger.js';
import { GridPanelView } from './GridPanelView.js';

export async function run() {
    const runner = new TestRunner();
    MockLogger.clearLogs();
    logEvent('info', 'TestRunner', 'run', 'Setup', 'Starting GridPanelView test suite.');
    
    const testContainer = document.getElementById('test-sandbox');

    const getMockProps = (overrides = {}) => ({
        instrument: { 
            symbol: 'KCK', 
            sounds: [{letter: 'o', svg: '<svg>o</svg>'}] 
        },
        notation: 'o---o---',
        metrics: { beatGrouping: 2, feel: 'duple' },
        ...overrides
    });

    runner.describe('GridPanelView Rendering', () => {
        let view = null;
        
        runner.afterEach(() => {
            if(view) view.destroy();
        });

        runner.it('should render the correct number of grid cells', () => {
            testContainer.innerHTML = '';
            view = new GridPanelView(testContainer, {});
            view.render(getMockProps());
            runner.expect(testContainer.querySelectorAll('.grid-cell').length).toBe(8);
        });
        
        runner.it('should render notes in the correct cells', () => {
            testContainer.innerHTML = '';
            view = new GridPanelView(testContainer, {});
            view.render(getMockProps());
            
            const cells = testContainer.querySelectorAll('.grid-cell');
            runner.expect(cells[0].querySelector('.note')).not.toBe(null);
            runner.expect(cells[1].querySelector('.note')).toBe(null);
            runner.expect(cells[4].querySelector('.note')).not.toBe(null);
        });

        runner.it('should apply rhythmic shading classes correctly', () => {
            testContainer.innerHTML = '';
            view = new GridPanelView(testContainer, {});
            view.render(getMockProps());
            
            const cells = testContainer.querySelectorAll('.grid-cell');
            runner.expect(cells[0].classList.contains('cell-downbeat')).toBe(true);
            runner.expect(cells[1].classList.contains('cell-weak-beat')).toBe(true);
            runner.expect(cells[2].classList.contains('cell-strong-beat')).toBe(true);
        });
        
        runner.it('should apply triplet shading classes correctly when specified', () => {
            testContainer.innerHTML = '';
            view = new GridPanelView(testContainer, {});
            const props = getMockProps({
                notation: 'o--o--',
                metrics: { feel: 'triplet' }
            });
            view.render(props);

            const cells = testContainer.querySelectorAll('.grid-cell');
            runner.expect(cells.length).toBe(6);
            runner.expect(cells[0].classList.contains('cell-triplet-1')).toBe(true);
            runner.expect(cells[1].classList.contains('cell-triplet-2')).toBe(true);
            runner.expect(cells[3].classList.contains('cell-triplet-1')).toBe(true);
        });
    });

    await runner.runAll();
    runner.renderResults('test-results');
    logEvent('info', 'TestRunner', 'run', 'Teardown', 'GridPanelView test suite finished.');
}