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
            metadata: { metric: '4/4', resolution: 16 },
            pattern_data: [{ KCK: '||o-o-||' }, { KCK: '||-o-o||' }]
        },
        resolvedInstruments: {
            KCK: { symbol: 'KCK', name: 'Kick', sounds: [{ letter: 'o', svg: '<svg>' }] }
        }
    });

    runner.describe('EditingGridView: Structural Editing', () => {
        runner.it('should fire onMeasureUpdate when metric/resolution is changed and applied', () => {
            testContainer.innerHTML = '';
            const callbackLog = new MockLogger('Callbacks');
            const view = new EditingGridView(testContainer, { onMeasureUpdate: (data) => callbackLog.log('onMeasureUpdate', data) });
            view.render(getMockState());

            const measureHeader = testContainer.querySelector('.measure-container[data-measure-index="0"] .measure-header');
            const beatsInput = measureHeader.querySelector('input[data-prop="beats"]');
            
            // 1. Change the input value
            beatsInput.value = '3';
            // 2. Dispatch an 'input' event to trigger the 'Apply' button
            beatsInput.dispatchEvent(new Event('input', { bubbles: true }));

            // 3. Verify the 'Apply' button appeared
            const applyBtn = measureHeader.querySelector('button[data-action="apply-metric"]');
            runner.expect(applyBtn).not.toBe(null);

            // 4. Click 'Apply' and check the callback
            applyBtn.click();
            callbackLog.wasCalledWith('onMeasureUpdate', {
                measureIndex: 0,
                metric: '3/4',
                resolution: 16
            });
        });
        
        // ... (other structural tests remain unchanged)
        runner.it('should fire onMeasureAdd when "Add Measure" button is clicked', () => {
            testContainer.innerHTML = '';
            const callbackLog = new MockLogger('Callbacks');
            const view = new EditingGridView(testContainer, { onMeasureAdd: () => callbackLog.log('onMeasureAdd') });
            view.render(getMockState());
            testContainer.querySelector('button[data-action="add-measure"]').click();
            callbackLog.wasCalledWith('onMeasureAdd');
        });

        runner.it('should fire onInstrumentAdd when "Add Instrument" button is clicked', () => {
            testContainer.innerHTML = '';
            const callbackLog = new MockLogger('Callbacks');
            const view = new EditingGridView(testContainer, { onInstrumentAdd: () => callbackLog.log('onInstrumentAdd') });
            view.render(getMockState());
            testContainer.querySelector('button[data-action="add-instrument"]').click();
            callbackLog.wasCalledWith('onInstrumentAdd');
        });

        runner.it('should fire onMeasureRemove with correct index', () => {
            testContainer.innerHTML = '';
            const callbackLog = new MockLogger('Callbacks');
            const view = new EditingGridView(testContainer, { onMeasureRemove: (data) => callbackLog.log('onMeasureRemove', data) });
            view.render(getMockState());
            testContainer.querySelector('.measure-container[data-measure-index="1"] .remove-btn').click();
            callbackLog.wasCalledWith('onMeasureRemove', { measureIndex: 1 });
        });

        runner.it('should fire onInstrumentRemove with correct symbol', () => {
            testContainer.innerHTML = '';
            const callbackLog = new MockLogger('Callbacks');
            const view = new EditingGridView(testContainer, { onInstrumentRemove: (data) => callbackLog.log('onInstrumentRemove', data) });
            view.render(getMockState());
            testContainer.querySelector('.instrument-row[data-instrument="KCK"] .remove-btn').click();
            callbackLog.wasCalledWith('onInstrumentRemove', { symbol: 'KCK' });
        });
    });

    runner.describe('EditingGridView: Note Editing', () => {
        // ... (note editing tests remain unchanged)
        const simulateTap = (element) => {
            element.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
            element.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
        };
        runner.it('should fire onNoteEdit with "add" action on tap in an empty cell', () => {
            testContainer.innerHTML = '';
            const callbackLog = new MockLogger('Callbacks');
            const view = new EditingGridView(testContainer, { onNoteEdit: (data) => callbackLog.log('onNoteEdit', data) });
            const state = getMockState();
            state.currentPattern.pattern_data = [{ KCK: '||----||' }]; // Use the smaller resolution for simplicity
            view.render(state);
            const emptyCell = testContainer.querySelector('.measure-container[data-measure-index="0"] .grid-cell[data-tick-index="1"]');
            simulateTap(emptyCell);
            callbackLog.wasCalledWith('onNoteEdit', { action: 'add', symbol: 'KCK', tickIndex: 1, measureIndex: 0, soundLetter: 'o' });
        });

        runner.it('should fire onNoteEdit with "delete" action on tap in a filled cell', () => {
            testContainer.innerHTML = '';
            const callbackLog = new MockLogger('Callbacks');
            const view = new EditingGridView(testContainer, { onNoteEdit: (data) => callbackLog.log('onNoteEdit', data) });
            const state = getMockState();
            state.currentPattern.pattern_data = [{ KCK: '||o---||' }];
            view.render(state);
            const filledCell = testContainer.querySelector('.measure-container[data-measure-index="0"] .grid-cell[data-tick-index="0"]');
            simulateTap(filledCell);
            callbackLog.wasCalledWith('onNoteEdit', { action: 'delete', symbol: 'KCK', tickIndex: 0, measureIndex: 0 });
        });
    });

    await runner.runAll();
    runner.renderResults('test-results');
    logEvent('info', 'TestRunner', 'run', 'Teardown', 'EditingGridView test suite finished.');
}