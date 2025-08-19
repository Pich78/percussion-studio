// file: src/components/PatternEditorView/PatternEditorView.test.js

import { TestRunner } from '/percussion-studio/lib/TestRunner.js';
import { MockLogger } from '/percussion-studio/lib/MockLogger.js';
import { logEvent } from '/percussion-studio/lib/Logger.js';
import { PatternEditorView } from './PatternEditorView.js';

export async function run() {
    const runner = new TestRunner();
    MockLogger.clearLogs();
    logEvent('info', 'TestRunner', 'run', 'Setup', 'Starting PatternEditorView unit test suite.');
    
    const testContainer = document.getElementById('test-sandbox');
    let modalContainer = null;

    const getMockManifest = () => ({
        instrumentDefs: [], soundPacks: []
    });

    runner.describe('PatternEditorView', () => {
        let view = null;
        
        runner.beforeEach(() => {
            logEvent('info', 'TestRunner', 'beforeEach', 'Lifecycle', 'Setting up test environment.');
            modalContainer = document.createElement('div');
            modalContainer.id = 'modal-container';
            document.body.appendChild(modalContainer);
        });

        runner.afterEach(() => {
            logEvent('info', 'TestRunner', 'afterEach', 'Lifecycle', 'Tearing down test environment.');
            if (view) view.destroy();
            if (modalContainer) modalContainer.remove();
            testContainer.innerHTML = '';
        });

        runner.it('should start with zero measures and an "add" button', () => {
            try {
                view = new PatternEditorView(testContainer, getMockManifest());
                runner.expect(testContainer.querySelectorAll('.pattern-measure-wrapper').length).toBe(0);
                runner.expect(testContainer.querySelector('.add-measure-btn')).not.toBe(null);
                logEvent('info', 'PatternEditorView', 'run', 'Test', 'Successfully verified initial state.');
            } catch (error) {
                logEvent('error', 'PatternEditorView', 'run', 'Test', `Error during "start with zero measures" test: ${error.message}`);
            }
        });

        runner.it('should add a measure when the "add" button is clicked', () => {
            try {
                view = new PatternEditorView(testContainer, getMockManifest());
                testContainer.querySelector('.add-measure-btn').click();
                runner.expect(testContainer.querySelectorAll('.pattern-measure-wrapper').length).toBe(1);
                logEvent('info', 'PatternEditorView', 'run', 'Test', 'Successfully verified adding a measure.');
            } catch (error) {
                logEvent('error', 'PatternEditorView', 'run', 'Test', `Error during "add measure" test: ${error.message}`);
            }
        });

        runner.it('should render a delete button for each added measure', () => {
            try {
                view = new PatternEditorView(testContainer, getMockManifest());
                testContainer.querySelector('.add-measure-btn').click();
                runner.expect(testContainer.querySelector('.delete-measure-btn')).not.toBe(null);
                logEvent('info', 'PatternEditorView', 'run', 'Test', 'Successfully verified delete button rendering.');
            } catch (error) {
                logEvent('error', 'PatternEditorView', 'run', 'Test', `Error during "delete button rendering" test: ${error.message}`);
            }
        });

        runner.it('should remove a measure after user confirmation', () => {
            try {
                view = new PatternEditorView(testContainer, getMockManifest());
                testContainer.querySelector('.add-measure-btn').click();
                runner.expect(testContainer.querySelectorAll('.pattern-measure-wrapper').length).toBe(1);

                const originalConfirm = window.confirm;
                window.confirm = () => true; // Force confirmation

                testContainer.querySelector('.delete-measure-btn').click();
                runner.expect(testContainer.querySelectorAll('.pattern-measure-wrapper').length).toBe(0);

                window.confirm = originalConfirm; // Restore
                logEvent('info', 'PatternEditorView', 'run', 'Test', 'Successfully verified measure removal with confirmation.');
            } catch (error) {
                logEvent('error', 'PatternEditorView', 'run', 'Test', `Error during "remove measure with confirmation" test: ${error.message}`);
            }
        });
        
        runner.it('should NOT remove a measure if user cancels confirmation', () => {
            try {
                view = new PatternEditorView(testContainer, getMockManifest());
                testContainer.querySelector('.add-measure-btn').click();
                runner.expect(testContainer.querySelectorAll('.pattern-measure-wrapper').length).toBe(1);

                const originalConfirm = window.confirm;
                window.confirm = () => false; // Force cancellation

                testContainer.querySelector('.delete-measure-btn').click();
                runner.expect(testContainer.querySelectorAll('.pattern-measure-wrapper').length).toBe(1);

                window.confirm = originalConfirm; // Restore
                logEvent('info', 'PatternEditorView', 'run', 'Test', 'Successfully verified measure is not removed on cancellation.');
            } catch (error) {
                logEvent('error', 'PatternEditorView', 'run', 'Test', `Error during "cancel removal" test: ${error.message}`);
            }
        });
    });

    await runner.runAll();
    runner.renderResults('test-results');
    logEvent('info', 'TestRunner', 'run', 'Teardown', 'PatternEditorView test suite finished.');
}
