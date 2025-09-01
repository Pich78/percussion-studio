// file: src/components/PatternEditorView/PatternEditorView.test.js

import { TestRunner } from '/percussion-studio/lib/TestRunner.js';
import { MockLogger } from '/percussion-studio/lib/MockLogger.js';
import { logEvent } from '/percussion-studio/lib/Logger.js';
import { PatternEditorView } from './PatternEditorView.js';

// --- Mocks for isolated unit testing ---
class MockMeasureEditorView {
    constructor(container, props) { this.props = props; }
    destroy() {}
    getState() { return { instruments: this.props.initialInstruments || [], metrics: {} }; }
}
class MockEditorCursor { destroy() {} update() {} }
class MockRadialSoundSelector { destroy() {} show() {} hide() {} }
class MockInstrumentSelectionModalView { destroy() {} show() {} }

// This is a hack for the simple test runner to inject mocks.
PatternEditorView.prototype.MeasureEditorView = MockMeasureEditorView;
PatternEditorView.prototype.EditorCursor = MockEditorCursor;
PatternEditorView.prototype.RadialSoundSelector = MockRadialSoundSelector;
PatternEditorView.prototype.InstrumentSelectionModalView = MockInstrumentSelectionModalView;


export async function run() {
    const runner = new TestRunner();
    MockLogger.clearLogs();
    logEvent('info', 'TestRunner', 'run', 'Setup', 'Starting PatternEditorView test suite.');
    
    const testContainer = document.getElementById('test-sandbox');
    if (!document.getElementById('modal-container')) {
        document.body.appendChild(document.createElement('div')).id = 'modal-container';
    }

    runner.describe('PatternEditorView', () => {
        let view = null;
        
        runner.afterEach(() => {
            if (view) view.destroy();
            testContainer.innerHTML = '';
        });

        runner.it('should start with zero measures and an "add" button', () => {
            view = new PatternEditorView(testContainer, { soundPacks: [] });
            runner.expect(testContainer.querySelectorAll('.pattern-measure-wrapper').length).toBe(0);
            runner.expect(testContainer.querySelector('.add-measure-btn')).not.toBe(null);
        });

        runner.it('should add a measure when the "add" button is clicked', () => {
            view = new PatternEditorView(testContainer, { soundPacks: [] });
            testContainer.querySelector('.add-measure-btn').click();
            runner.expect(testContainer.querySelectorAll('.pattern-measure-wrapper').length).toBe(1);
        });

        runner.it('should remove a measure after user confirmation', () => {
            view = new PatternEditorView(testContainer, { soundPacks: [] });
            testContainer.querySelector('.add-measure-btn').click();
            runner.expect(testContainer.querySelectorAll('.pattern-measure-wrapper').length).toBe(1);

            const originalConfirm = window.confirm;
            window.confirm = () => true;

            testContainer.querySelector('.delete-measure-btn').click();
            runner.expect(testContainer.querySelectorAll('.pattern-measure-wrapper').length).toBe(0);

            window.confirm = originalConfirm;
        });
        
        runner.it('should fire onSave callback when save button is clicked', () => {
            // Use a simple flag-based approach instead of MockLogger
            let callbackCalled = false;
            let callbackData = null;
            
            view = new PatternEditorView(testContainer, { 
                soundPacks: [],
                onSave: (data) => {
                    callbackCalled = true;
                    callbackData = data;
                }
            });
            
            // Add a measure first to enable the save button
            testContainer.querySelector('.add-measure-btn').click();
            
            // The save button should now be enabled since we have changes
            const saveBtn = testContainer.querySelector('.pattern-save-btn');
            runner.expect(saveBtn.disabled).toBe(false);
            
            // Click the save button
            saveBtn.click();
            
            // Check that the callback was called
            runner.expect(callbackCalled).toBe(true);
            runner.expect(callbackData).not.toBe(null);
            runner.expect(callbackData.patternData.name).toBe('New Pattern');
        });
    });

    await runner.runAll();
    runner.renderResults('test-results');
    logEvent('info', 'TestRunner', 'run', 'Teardown', 'PatternEditorView test suite finished.');
}