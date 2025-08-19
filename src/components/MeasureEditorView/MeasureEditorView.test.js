// file: src/components/MeasureEditorView/MeasureEditorView.test.js

import { TestRunner } from '/percussion-studio/lib/TestRunner.js';
import { MockLogger } from '/percussion-studio/lib/MockLogger.js';
import { logEvent } from '/percussion-studio/lib/Logger.js';
import { MeasureEditorView } from './MeasureEditorView.js';

export async function run() {
    const runner = new TestRunner();
    MockLogger.clearLogs();
    logEvent('info', 'TestRunner', 'run', 'Setup', 'Starting MeasureEditorView test suite.');
    
    const testContainer = document.getElementById('test-sandbox');
    // The modal needs a container in the test environment too
    const modalContainer = document.createElement('div');
    modalContainer.id = 'modal-container';
    document.body.appendChild(modalContainer);

    const getMockManifest = () => ({
        instrumentDefs: [{ symbol: 'KCK', name: 'Kick Drum' }],
        soundPacks: [{ symbol: 'KCK', pack_name: 'kick_1', name: 'Acoustic Kick' }]
    });

    runner.describe('MeasureEditorView', () => {

        runner.it('should start with zero instrument rows and an "add" button', () => {
            testContainer.innerHTML = '';
            const view = new MeasureEditorView(testContainer, getMockManifest());
            
            runner.expect(testContainer.querySelectorAll('.instrument-row-container').length).toBe(0);
            runner.expect(testContainer.querySelector('.add-instrument-btn')).not.toBe(null);
        });

        runner.it('should open the instrument modal when the "add" button is clicked', () => {
            testContainer.innerHTML = '';
            const view = new MeasureEditorView(testContainer, getMockManifest());
            
            // We can "spy" on the modal's show method to see if it was called.
            let wasModalShown = false;
            view.instrumentModal.show = () => { wasModalShown = true; };

            testContainer.querySelector('.add-instrument-btn').click();
            runner.expect(wasModalShown).toBe(true);
        });

        runner.it('should add an instrument row after modal confirmation', () => {
            testContainer.innerHTML = '';
            const view = new MeasureEditorView(testContainer, getMockManifest());
            
            // Initially 0 rows
            runner.expect(testContainer.querySelectorAll('.instrument-row-container').length).toBe(0);

            // Manually call the confirmation callback, simulating the modal's action
            view._confirmAddInstrument({ symbol: 'KCK', packName: 'kick_1' });
            
            // Now there should be 1 row
            runner.expect(testContainer.querySelectorAll('.instrument-row-container').length).toBe(1);
        });

        runner.it('should remove an instrument row after user confirmation', () => {
            testContainer.innerHTML = '';
            const view = new MeasureEditorView(testContainer, getMockManifest());
            view._confirmAddInstrument({ symbol: 'KCK', packName: 'kick_1' });
            runner.expect(testContainer.querySelectorAll('.instrument-row-container').length).toBe(1);

            // Spy on window.confirm and make it return `true`
            const originalConfirm = window.confirm;
            window.confirm = () => true;

            testContainer.querySelector('.delete-row-btn').click();

            runner.expect(testContainer.querySelectorAll('.instrument-row-container').length).toBe(0);

            // Restore the original confirm function
            window.confirm = originalConfirm;
        });
    });

    await runner.runAll();
    runner.renderResults('test-results');
    logEvent('info', 'TestRunner', 'run', 'Teardown', 'MeasureEditorView test suite finished.');
}