// file: src/components/EditorView/EditorView.test.js

import { TestRunner } from '/percussion-studio/lib/TestRunner.js';
import { MockLogger } from '/percussion-studio/lib/MockLogger.js';
import { logEvent } from '/percussion-studio/lib/Logger.js';
import { EditorView } from './EditorView.js';

// --- Mocks for isolated unit testing ---
let playbackControlsInstance = null;
let flowPanelInstance = null;
let patternEditorInstance = null;
let modalInstance = null;

// --- FIX: Ensure all mocks have the methods the component under test will call ---
class MockPlaybackControls { constructor() { playbackControlsInstance = this; } render() {} destroy() {} }
class MockFlowPanel { constructor() { flowPanelInstance = this; } render() {} destroy() {} }
class MockPatternEditor { constructor(c, p) { patternEditorInstance = this; this.props = p; } render() {} destroy() {} }
class MockModal { constructor() { modalInstance = this; } show() {} destroy() {} }

export async function run() {
    const runner = new TestRunner();
    MockLogger.clearLogs();
    logEvent('info', 'TestRunner', 'run', 'Setup', 'Starting EditorView test suite.');
    
    // Inject mocks into the prototype for the test environment
    // This is a necessary step for our simple HTML-based test runner.
    EditorView.prototype.EditorPlaybackControlsView = MockPlaybackControls;
    EditorView.prototype.FlowPanel = MockFlowPanel;
    EditorView.prototype.PatternEditorView = MockPatternEditor;
    EditorView.prototype.InstrumentSelectionModalView = MockModal;

    const testContainer = document.getElementById('test-sandbox');
    
    const getMockProps = () => ({
        flow: [{ pattern: 'Pattern 1' }],
        manifest: { soundPacks: [] }
    });

    runner.describe('EditorView', () => {
        let view = null;
        
        runner.beforeEach(() => {
            playbackControlsInstance = null;
            flowPanelInstance = null;
            patternEditorInstance = null;
            modalInstance = null;
        });

        runner.afterEach(() => {
            if (view) view.destroy();
        });

        runner.it('should instantiate all its main child components on render', () => {
            testContainer.innerHTML = '';
            view = new EditorView(testContainer, getMockProps());
            
            runner.expect(playbackControlsInstance).not.toBe(null);
            runner.expect(flowPanelInstance).not.toBe(null);
            runner.expect(patternEditorInstance).not.toBe(null);
            runner.expect(modalInstance).not.toBe(null);
        });

        runner.it('should pass an onRequestInstrumentChange callback to PatternEditorView', () => {
            testContainer.innerHTML = '';
            view = new EditorView(testContainer, getMockProps());
            
            // The `PatternEditorView` is a child of the `EditorView` and receives props.
            // We can inspect the props that were passed to our mock instance.
            const passedCallback = patternEditorInstance.props.onRequestInstrumentChange;
            runner.expect(typeof passedCallback).toBe('function');
        });
    });

    await runner.runAll();
    runner.renderResults('test-results');
    logEvent('info', 'TestRunner', 'run', 'Teardown', 'EditorView test suite finished.');
}