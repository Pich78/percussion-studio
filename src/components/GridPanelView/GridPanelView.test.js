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
        metrics: { beatGrouping: 4, feel: 'duple' },
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

        runner.it('should apply duple shading classes correctly', () => {
            testContainer.innerHTML = '';
            view = new GridPanelView(testContainer, {});
            view.render(getMockProps({ notation: 'o-o-o-o-o-o-o-o-' }));
            
            const cells = testContainer.querySelectorAll('.grid-cell');
            runner.expect(cells[0].classList.contains('cell-downbeat')).toBe(true);
            runner.expect(cells[1].classList.contains('cell-weak-beat')).toBe(true);
            runner.expect(cells[4].classList.contains('cell-downbeat')).toBe(true);
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
            runner.expect(cells[2].classList.contains('cell-triplet-3')).toBe(true);
        });
    });

    runner.describe('User Interactions', () => {
        let view = null;
        let spyCallbacks;
        let props;

        runner.beforeEach(() => {
            let received = {};
            spyCallbacks = {
                onCellMouseDown: (data) => received.down = data,
                onCellMouseUp: (data) => received.up = data,
                onCellMouseEnter: (data) => received.enter = data,
                getReceived: () => received,
                clear: () => { received = {}; },
            };

            testContainer.innerHTML = '';
            props = getMockProps();
        });

        runner.afterEach(() => {
            if(view) view.destroy();
            spyCallbacks.clear();
        });

        runner.it('should fire onCellMouseDown with correct data when a cell is clicked', () => {
            view = new GridPanelView(testContainer, spyCallbacks);
            view.render(props);

            const cellToClick = testContainer.querySelectorAll('.grid-cell')[2]; // Click the 3rd cell (index 2)
            cellToClick.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
            const receivedData = spyCallbacks.getReceived().down;

            runner.expect(receivedData).not.toBe(undefined);
            runner.expect(receivedData.tickIndex).toBe(2);
            runner.expect(receivedData.hasNote).toBe(false);
            runner.expect(receivedData.instrument.symbol).toBe('KCK');
        });

        runner.it('should fire onCellMouseUp with correct data when a mouse is released on a cell', () => {
            view = new GridPanelView(testContainer, spyCallbacks);
            view.render(props);

            const cellToClick = testContainer.querySelectorAll('.grid-cell')[0]; // Click the 1st cell (has a note)
            cellToClick.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
            const receivedData = spyCallbacks.getReceived().up;
            
            runner.expect(receivedData).not.toBe(undefined);
            runner.expect(receivedData.tickIndex).toBe(0);
            runner.expect(receivedData.hasNote).toBe(true);
        });
        
        runner.it('should NOT fire onCellMouseEnter if mouse button is not pressed', () => {
            view = new GridPanelView(testContainer, spyCallbacks);
            view.render(props);
            
            const cell = testContainer.querySelectorAll('.grid-cell')[1];
            cell.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true, buttons: 0 }));

            runner.expect(spyCallbacks.getReceived().enter).toBe(undefined);
        });

        runner.it('should fire onCellMouseEnter if mouse button IS pressed (drag)', () => {
            view = new GridPanelView(testContainer, spyCallbacks);
            view.render(props);

            const cell = testContainer.querySelectorAll('.grid-cell')[1];
            cell.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true, buttons: 1 }));

            runner.expect(spyCallbacks.getReceived().enter).not.toBe(undefined);
        });

        runner.it('should not throw an error if callbacks are not provided', () => {
            view = new GridPanelView(testContainer, {}); // No callbacks
            view.render(props);
            
            const cell = testContainer.querySelectorAll('.grid-cell')[0];
            
            // --- FIX: Corrected test to use the new `not.toThrow` assertion ---
            runner.expect(() => {
                cell.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
                cell.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
                cell.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true, buttons: 1 }));
            }).not.toThrow();
        });
    });


    await runner.runAll();
    runner.renderResults('test-results');
    logEvent('info', 'TestRunner', 'run', 'Teardown', 'GridPanelView test suite finished.');
}