// file: src/components/EditingGridView/EditingGridView.test.js

import { TestRunner } from '/percussion-studio/lib/TestRunner.js';
import { MockLogger } from '/percussion-studio/lib/MockLogger.js';
import { logEvent } from '/percussion-studio/lib/Logger.js';
import { EditingGridView } from './EditingGridView.js';

export async function run() {
    const runner = new TestRunner();
    MockLogger.clearLogs();
    logEvent('info', 'TestRunner', 'run', 'Setup', 'Starting EditingGridView test suite.');
    
    const testContainer = document.getElementById('test-sandbox');

    const getMockState = () => ({
        currentPattern: {
            metadata: { metric: '4/4', resolution: 4 },
            pattern_data: [{ KCK: '||o-o-||' }]
        },
        resolvedInstruments: {
            KCK: { symbol: 'KCK', name: 'Kick', sounds: [{ letter: 'o', svg: '<svg>' }] }
        }
    });

    runner.describe('EditingGridView', () => {
        runner.it('should render zero state when pattern data is empty', () => {
            testContainer.innerHTML = '';
            const view = new EditingGridView(testContainer, {});
            const state = getMockState();
            state.currentPattern.pattern_data = [];
            view.render(state);
            runner.expect(testContainer.querySelector('.zero-state-container')).not.toBe(null);
            runner.expect(testContainer.querySelector('.add-measure-btn')).not.toBe(null);
        });

        runner.it('should fire onMeasureAdd when "Add Measure" button is clicked in zero state', () => {
            testContainer.innerHTML = '';
            const callbackLog = new MockLogger('Callbacks');
            const view = new EditingGridView(testContainer, { onMeasureAdd: () => callbackLog.log('onMeasureAdd') });
            const state = getMockState();
            state.currentPattern.pattern_data = [];
            view.render(state);
            
            testContainer.querySelector('.add-measure-btn').click();
            callbackLog.wasCalledWith('onMeasureAdd');
        });
        
        // Helper to simulate a tap
        const simulateTap = (element) => {
            element.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
            element.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
        };

        runner.it('should fire onNoteEdit with "add" action on tap in an empty cell', () => {
            testContainer.innerHTML = '';
            const callbackLog = new MockLogger('Callbacks');
            const view = new EditingGridView(testContainer, { onNoteEdit: (data) => callbackLog.log('onNoteEdit', data) });
            view.render(getMockState());

            const emptyCell = testContainer.querySelector('.grid-cell[data-tick-index="1"]');
            simulateTap(emptyCell);
            
            callbackLog.wasCalledWith('onNoteEdit', { 
                action: 'add',
                symbol: 'KCK',
                tickIndex: 1,
                measureIndex: 0,
                soundLetter: 'o' // The default active sound
            });
        });

        runner.it('should fire onNoteEdit with "delete" action on tap in a filled cell', () => {
            testContainer.innerHTML = '';
            const callbackLog = new MockLogger('Callbacks');
            const view = new EditingGridView(testContainer, { onNoteEdit: (data) => callbackLog.log('onNoteEdit', data) });
            view.render(getMockState());

            const filledCell = testContainer.querySelector('.grid-cell[data-tick-index="0"]');
            simulateTap(filledCell);
            
            callbackLog.wasCalledWith('onNoteEdit', { 
                action: 'delete',
                symbol: 'KCK',
                tickIndex: 0,
                measureIndex: 0
            });
        });

        runner.it('NOTE: Hold gesture and radial menu are tested manually in the harness', () => {
            // This test serves as a documentation reminder
            runner.expect(true).toBe(true);
        });
    });

    await runner.runAll();
    runner.renderResults('test-results');
    logEvent('info', 'TestRunner', 'run', 'Teardown', 'EditingGridView test suite finished.');
}