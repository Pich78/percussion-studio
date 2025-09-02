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

    runner.describe('Rendering & Shading', () => {
        let view = null;
        
        runner.afterEach(() => {
            if(view) view.destroy();
        });

        runner.it('should render the correct number of grid cells', () => {
            view = new GridPanelView(testContainer, {});
            view.render(getMockProps());
            runner.expect(testContainer.querySelectorAll('.grid-cell').length).toBe(8);
        });
        
        runner.it('should render notes in the correct cells', () => {
            view = new GridPanelView(testContainer, {});
            view.render(getMockProps());
            const cells = testContainer.querySelectorAll('.grid-cell');
            runner.expect(cells[0].querySelector('.note')).not.toBe(null);
            runner.expect(cells[1].querySelector('.note')).toBe(null);
            runner.expect(cells[4].querySelector('.note')).not.toBe(null);
        });

        runner.it('should apply ADVANCED duple shading classes correctly', () => {
            view = new GridPanelView(testContainer, {});
            view.render(getMockProps({ notation: '-'.repeat(16), metrics: { beatGrouping: 4, feel: 'duple' } }));
            const cells = testContainer.querySelectorAll('.grid-cell');
            runner.expect(cells[0].classList.contains('cell-downbeat')).toBe(true);
            runner.expect(cells[1].classList.contains('cell-weak-beat')).toBe(true);
            runner.expect(cells[2].classList.contains('cell-strong-beat')).toBe(true);
            runner.expect(cells[4].classList.contains('cell-downbeat')).toBe(true);
        });
        
        runner.it('should apply simple triplet shading (beatGrouping: 3)', () => {
            view = new GridPanelView(testContainer, {});
            view.render(getMockProps({ notation: 'o--o--', metrics: { feel: 'triplet', beatGrouping: 3 } }));
            const cells = testContainer.querySelectorAll('.grid-cell');
            runner.expect(cells[0].classList.contains('cell-triplet-1')).toBe(true);
            runner.expect(cells[1].classList.contains('cell-triplet-2')).toBe(true);
            runner.expect(cells[2].classList.contains('cell-triplet-3')).toBe(true);
            runner.expect(cells[3].classList.contains('cell-triplet-1')).toBe(true);
        });

        runner.it('should apply ADVANCED triplet shading (beatGrouping: 6)', () => {
            view = new GridPanelView(testContainer, {});
            view.render(getMockProps({ notation: '-'.repeat(12), metrics: { beatGrouping: 6, feel: 'triplet' } }));
            const cells = testContainer.querySelectorAll('.grid-cell');
            runner.expect(cells[0].classList.contains('cell-triplet-1')).toBe(true);
            runner.expect(cells[1].classList.contains('cell-triplet-3')).toBe(true);
            runner.expect(cells[3].classList.contains('cell-triplet-2')).toBe(true);
            runner.expect(cells[6].classList.contains('cell-triplet-1')).toBe(true);
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
            const cellToClick = testContainer.querySelectorAll('.grid-cell')[2];
            cellToClick.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
            const receivedData = spyCallbacks.getReceived().down;
            runner.expect(receivedData.tickIndex).toBe(2);
            runner.expect(receivedData.hasNote).toBe(false);
        });

        runner.it('should fire onCellMouseUp with correct data', () => {
            view = new GridPanelView(testContainer, spyCallbacks);
            view.render(props);
            const cellToClick = testContainer.querySelectorAll('.grid-cell')[0];
            cellToClick.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
            const receivedData = spyCallbacks.getReceived().up;
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
            // Note: GridPanelView doesn't manage drag state, just reports events.
            view = new GridPanelView(testContainer, spyCallbacks);
            view.render(props);
            const cell = testContainer.querySelectorAll('.grid-cell')[1];
            cell.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true, buttons: 1 }));
             const receivedData = spyCallbacks.getReceived().enter;
            runner.expect(receivedData).not.toBe(undefined);
            runner.expect(receivedData.tickIndex).toBe(1);
        });

        runner.it('should not throw an error if callbacks are not provided', () => {
            view = new GridPanelView(testContainer, {}); // No callbacks
            view.render(props);
            const cell = testContainer.querySelectorAll('.grid-cell')[0];
            runner.expect(() => {
                cell.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
            }).not.toThrow();
        });
    });

    await runner.runAll();
    runner.renderResults('test-results');
    logEvent('info', 'TestRunner', 'run', 'Teardown', 'GridPanelView test suite finished.');
}