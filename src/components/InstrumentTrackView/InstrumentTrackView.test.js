// file: src/components/InstrumentTrackView/InstrumentTrackView.test.js

import { TestRunner } from '/percussion-studio/lib/TestRunner.js';
import { MockLogger } from '/percussion-studio/lib/MockLogger.js';
import { logEvent } from '/percussion-studio/lib/Logger.js';
import { InstrumentTrackView } from './InstrumentTrackView.js';

export async function run() {
    const runner = new TestRunner();
    MockLogger.clearLogs();
    logEvent('info', 'TestRunner', 'run', 'Setup', 'Starting InstrumentTrackView test suite.');
    
    const testContainer = document.getElementById('test-sandbox');

    const getMockState = () => ({
        instrument: { 
            symbol: 'KCK', name: 'Kick', 
            sounds: [{letter: 'o', svg: '<svg>o</svg>'}, {letter: 'p', svg: '<svg>p</svg>'}] 
        },
        notation: '||o-p-||',
        activeSoundLetter: 'o'
    });
    
    // Helper to simulate a tap
    const simulateTap = (element) => {
        element.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
        element.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
    };

    runner.describe('InstrumentTrackView', () => {
        runner.it('should render the correct number of cells and notes', () => {
            testContainer.innerHTML = '';
            const view = new InstrumentTrackView(testContainer, {});
            view.render(getMockState());
            
            runner.expect(testContainer.querySelectorAll('.grid-cell').length).toBe(4);
            runner.expect(testContainer.querySelectorAll('.note').length).toBe(2);
            runner.expect(testContainer.querySelector('.instrument-header').textContent).toBe('Kick');
        });

        runner.it('should fire onNoteEdit with "add" action on tap in an empty cell', () => {
            testContainer.innerHTML = '';
            const callbackLog = new MockLogger('Callbacks');
            const view = new InstrumentTrackView(testContainer, { onNoteEdit: (data) => callbackLog.log('onNoteEdit', data) });
            view.render(getMockState());

            const emptyCell = testContainer.querySelector('.grid-cell[data-tick-index="1"]');
            simulateTap(emptyCell);
            
            callbackLog.wasCalledWith('onNoteEdit', { 
                action: 'add',
                tickIndex: 1,
                soundLetter: 'o'
            });
        });

        runner.it('should fire onNoteEdit with "delete" action on tap in a filled cell', () => {
            testContainer.innerHTML = '';
            const callbackLog = new MockLogger('Callbacks');
            const view = new InstrumentTrackView(testContainer, { onNoteEdit: (data) => callbackLog.log('onNoteEdit', data) });
            view.render(getMockState());

            const filledCell = testContainer.querySelector('.grid-cell[data-tick-index="0"]');
            simulateTap(filledCell);
            
            callbackLog.wasCalledWith('onNoteEdit', { 
                action: 'delete',
                tickIndex: 0
            });
        });

        runner.it('should fire correct callbacks when a radial menu item is clicked', () => {
            testContainer.innerHTML = '';
            const callbackLog = new MockLogger('Callbacks');
            const view = new InstrumentTrackView(testContainer, { 
                onNoteEdit: (data) => callbackLog.log('onNoteEdit', data),
                onActiveSoundChange: (letter) => callbackLog.log('onActiveSoundChange', { letter })
            });
            view.render(getMockState());

            // Manually trigger the radial menu for testing
            const targetCell = testContainer.querySelector('.grid-cell[data-tick-index="1"]');
            view.mouseDownInfo = { tickIndex: 1, cell: targetCell }; // Simulate a mousedown
            view._showRadialMenu(targetCell);

            // There are 2 sounds, 'o' and 'p'. 'o' is active. The first radial item should be the 'other' sound, 'p'.
            const radialButton = document.body.querySelector('.radial-item');
            runner.expect(radialButton).not.toBe(null);
            
            radialButton.click(); // Click the 'p' sound

            callbackLog.wasCalledWith('onNoteEdit', {
                action: 'set',
                tickIndex: 1,
                soundLetter: 'p'
            });
            callbackLog.wasCalledWith('onActiveSoundChange', { letter: 'p' });
            
            view._hideRadialMenu(); // Cleanup
        });
    });

    await runner.runAll();
    runner.renderResults('test-results');
    logEvent('info', 'TestRunner', 'run', 'Teardown', 'InstrumentTrackView test suite finished.');
}