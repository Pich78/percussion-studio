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
    // --- MODIFIED: Keep a reference to the modal container for cleanup ---
    let modalContainer = null;

    const getMockManifest = () => ({
        instrumentDefs: [{ symbol: 'KCK', name: 'Kick Drum' }],
        soundPacks: [{ symbol: 'KCK', pack_name: 'kick_1', name: 'Acoustic Kick' }]
    });

    runner.describe('MeasureEditorView', () => {
        // --- NEW: Keep a reference to the view instance for cleanup ---
        let view = null;

        // --- NEW: Use beforeEach and afterEach for proper setup and teardown ---
        runner.beforeEach(() => {
            // Create the required modal container for each test
            modalContainer = document.createElement('div');
            modalContainer.id = 'modal-container';
            document.body.appendChild(modalContainer);
        });

        runner.afterEach(() => {
            // Guarantee cleanup after each test
            if (view) {
                view.destroy();
                view = null;
            }
            if (modalContainer) {
                modalContainer.remove();
                modalContainer = null;
            }
            testContainer.innerHTML = '';
        });


        runner.it('should start with zero instrument rows and an "add" button', () => {
            view = new MeasureEditorView(testContainer, getMockManifest());
            runner.expect(testContainer.querySelectorAll('.instrument-row-container').length).toBe(0);
            runner.expect(testContainer.querySelector('.add-instrument-btn')).not.toBe(null);
        });

        runner.it('should open the instrument modal when the "add" button is clicked', () => {
            view = new MeasureEditorView(testContainer, getMockManifest());
            let wasModalShown = false;
            view.instrumentModal.show = () => { wasModalShown = true; };
            testContainer.querySelector('.add-instrument-btn').click();
            runner.expect(wasModalShown).toBe(true);
        });

        runner.it('should add an instrument row after modal confirmation', () => {
            view = new MeasureEditorView(testContainer, getMockManifest());
            runner.expect(testContainer.querySelectorAll('.instrument-row-container').length).toBe(0);
            view._confirmAddInstrument({ symbol: 'KCK', packName: 'kick_1' });
            runner.expect(testContainer.querySelectorAll('.instrument-row-container').length).toBe(1);
        });

        runner.it('should remove an instrument row after user confirmation', () => {
            view = new MeasureEditorView(testContainer, getMockManifest());
            view._confirmAddInstrument({ symbol: 'KCK', packName: 'kick_1' });
            runner.expect(testContainer.querySelectorAll('.instrument-row-container').length).toBe(1);

            const originalConfirm = window.confirm;
            window.confirm = () => true;
            testContainer.querySelector('.delete-row-btn').click();
            runner.expect(testContainer.querySelectorAll('.instrument-row-container').length).toBe(0);
            window.confirm = originalConfirm;
        });
    });

    await runner.runAll();
    runner.renderResults('test-results');
    logEvent('info', 'TestRunner', 'run', 'Teardown', 'MeasureEditorView test suite finished.');
}