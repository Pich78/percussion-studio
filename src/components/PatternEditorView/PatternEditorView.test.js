// file: src/components/PatternEditorView/PatternEditorView.test.js

import { TestRunner } from '/percussion-studio/lib/TestRunner.js';
import { MockLogger } from '/percussion-studio/lib/MockLogger.js';
import { logEvent } from '/percussion-studio/lib/Logger.js';
import { PatternEditorView } from './PatternEditorView.js';

export async function run() {
    const runner = new TestRunner();
    MockLogger.clearLogs();
    logEvent('info', 'TestRunner', 'run', 'Setup', 'Starting PatternEditorView test suite.');
    
    const testContainer = document.getElementById('test-sandbox');
    let modalContainer = null;

    const getMockManifest = () => ({
        instrumentDefs: [], soundPacks: []
    });

    runner.describe('PatternEditorView', () => {
        let view = null;
        
        runner.beforeEach(() => {
            modalContainer = document.createElement('div');
            modalContainer.id = 'modal-container';
            document.body.appendChild(modalContainer);
        });

        runner.afterEach(() => {
            if (view) view.destroy();
            if (modalContainer) modalContainer.remove();
            testContainer.innerHTML = '';
        });

        runner.it('should start with zero measures and an "add" button', () => {
            view = new PatternEditorView(testContainer, getMockManifest());
            runner.expect(testContainer.querySelectorAll('.pattern-measure-wrapper').length).toBe(0);
            runner.expect(testContainer.querySelector('.add-measure-btn')).not.toBe(null);
        });

        runner.it('should add a measure when the "add" button is clicked', () => {
            view = new PatternEditorView(testContainer, getMockManifest());
            testContainer.querySelector('.add-measure-btn').click();
            runner.expect(testContainer.querySelectorAll('.pattern-measure-wrapper').length).toBe(1);
        });

        runner.it('should render a delete button for each added measure', () => {
            view = new PatternEditorView(testContainer, getMockManifest());
            testContainer.querySelector('.add-measure-btn').click();
            runner.expect(testContainer.querySelector('.delete-measure-btn')).not.toBe(null);
        });

        runner.it('should remove a measure after user confirmation', () => {
            view = new PatternEditorView(testContainer, getMockManifest());
            testContainer.querySelector('.add-measure-btn').click();
            runner.expect(testContainer.querySelectorAll('.pattern-measure-wrapper').length).toBe(1);

            const originalConfirm = window.confirm;
            window.confirm = () => true; // Force confirmation

            testContainer.querySelector('.delete-measure-btn').click();
            runner.expect(testContainer.querySelectorAll('.pattern-measure-wrapper').length).toBe(0);

            window.confirm = originalConfirm; // Restore
        });
        
        runner.it('should NOT remove a measure if user cancels confirmation', () => {
            view = new PatternEditorView(testContainer, getMockManifest());
            testContainer.querySelector('.add-measure-btn').click();
            runner.expect(testContainer.querySelectorAll('.pattern-measure-wrapper').length).toBe(1);

            const originalConfirm = window.confirm;
            window.confirm = () => false; // Force cancellation

            testContainer.querySelector('.delete-measure-btn').click();
            runner.expect(testContainer.querySelectorAll('.pattern-measure-wrapper').length).toBe(1);

            window.confirm = originalConfirm; // Restore
        });
    });

    await runner.runAll();
    runner.renderResults('test-results');
    logEvent('info', 'TestRunner', 'run', 'Teardown', 'PatternEditorView test suite finished.');
}