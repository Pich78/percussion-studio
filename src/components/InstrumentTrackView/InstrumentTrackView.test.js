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
    
    const simulateTap = (element) => {
        const event = new MouseEvent('mousedown', { bubbles: true, clientX: 1, clientY: 1 });
        element.dispatchEvent(event);
        const upEvent = new MouseEvent('mouseup', { bubbles: true, clientX: 1, clientY: 1 });
        window.dispatchEvent(upEvent);
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
            callbackLog.wasCalledWith('onNoteEdit', { action: 'add', tickIndex: 1, soundLetter: 'o' });
        });

        runner.it('should fire onNoteEdit with "delete" action on tap in a filled cell', () => {
            testContainer.innerHTML = '';
            const callbackLog = new MockLogger('Callbacks');
            const view = new InstrumentTrackView(testContainer, { onNoteEdit: (data) => callbackLog.log('onNoteEdit', data) });
            view.render(getMockState());
            const filledCell = testContainer.querySelector('.grid-cell[data-tick-index="0"]');
            simulateTap(filledCell);
            callbackLog.wasCalledWith('onNoteEdit', { action: 'delete', tickIndex: 0 });
        });

        runner.it('should fire onActiveSoundChange callback when a radial menu item is selected via drag-release', () => {
            testContainer.innerHTML = '';
            const callbackLog = new MockLogger('Callbacks');
            const view = new InstrumentTrackView(testContainer, { 
                onNoteEdit: (data) => callbackLog.log('onNoteEdit', data),
                onActiveSoundChange: (letter) => callbackLog.log('onActiveSoundChange', letter)
            });
            view.render(getMockState());

            // --- Simulate the full gesture ---
            const targetCell = testContainer.querySelector('.grid-cell[data-tick-index="1"]');
            
            // Create a proper mock event object
            const mockMouseDownEvent = {
                target: targetCell,
                clientX: 100,
                clientY: 100,
                preventDefault: () => {} // Add preventDefault method
            };
            
            // 1. Mousedown (starts the process)
            view._handleMouseDown(mockMouseDownEvent);
            
            // 2. Manually trigger the drag state and show the menu
            view.isDragging = true;
            view._showRadialMenu(100, 100);

            // 3. Manually set the highlighted sound (simulating mousemove)
            view.highlightedSound = 'p'; // The sound we want to select

            // 4. Mouseup (completes the gesture)
            view._handleMouseUp();
            
            // --- Assertions - only check for onActiveSoundChange since we removed onNoteEdit from radial selection ---
            callbackLog.wasCalledWith('onActiveSoundChange', 'p');
            
            view._hideRadialMenu(); // Cleanup
        });
    });

    await runner.runAll();
    runner.renderResults('test-results');
    logEvent('info', 'TestRunner', 'run', 'Teardown', 'InstrumentTrackView test suite finished.');
}