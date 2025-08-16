// file: test/suites/EditingApp.test.js

import { TestRunner } from '/percussion-studio/test/lib/TestRunner.js';
import { MockLogger } from '/percussion-studio/test/mocks/MockLogger.js';
import { EditingApp } from '/percussion-studio/src/EditingApp.js';

// --- Mocks ---
// Mock the controller to spy on its method calls
class MockEditController {
    constructor() { this.logger = new MockLogger('MockEditController'); }
    updatePlaybackFlow(rhythm, newFlow) { this.logger.log('updatePlaybackFlow', { newFlow }); return { ...rhythm, playback_flow: newFlow, updated: true }; }
    addNote(rhythm, pos) { this.logger.log('addNote', { pos }); return { ...rhythm, updated: true }; }
    removeNote(rhythm, pos) { this.logger.log('removeNote', { pos }); return { ...rhythm, updated: true }; }
    addTrack(rhythm, payload) { this.logger.log('addTrack', { payload }); return { ...rhythm, updated: true }; }
    removeTrack(rhythm, payload) { this.logger.log('removeTrack', { payload }); return { ...rhythm, updated: true }; }
    addPattern(rhythm, payload) { this.logger.log('addPattern', { payload }); return { ...rhythm, patterns: {...rhythm.patterns, [payload.patternId]: {}}, playback_flow: [...rhythm.playback_flow], updated: true }; }
}

// Mock the view since we are not testing the DOM here
class MockRhythmEditorView {
    constructor() { this.logger = new MockLogger('MockRhythmEditorView'); }
    render(state) { this.logger.log('render', state); }
}

// Helper to create props for the EditingApp
const createMockProps = (rhythm) => {
    const logger = new MockLogger('AppShell');
    return {
        rhythm: rhythm || { global_bpm: 120, playback_flow: [{ pattern: 'p1' }], patterns: {p1: {}} },
        onRhythmUpdate: (newRhythm) => logger.log('onRhythmUpdate', newRhythm),
        shellLogger: logger // Expose the logger for assertions
    };
};

export async function run() {
    const runner = new TestRunner();
    MockLogger.clearLogs();
    MockLogger.setLogTarget('log-output');
    
    // Inject the mock EditController into the EditingApp prototype for testing
    EditingApp.prototype.editController = new MockEditController();
    EditingApp.prototype.rhythmEditorView = new MockRhythmEditorView();


    runner.describe('EditingApp Initialization', () => {
        runner.it('should initialize with correct default state', () => {
            const container = document.createElement('div');
            const props = createMockProps({ playback_flow: [{ pattern: 'verse' }] });
            const editingApp = new EditingApp(container, props);

            runner.expect(editingApp.state.isDirty).toBe(false);
            runner.expect(editingApp.state.currentEditingPatternId).toBe('verse');
        });
    });

    runner.describe('EditingApp Logic and State', () => {
        runner.it('should update state and call onRhythmUpdate on handleFlowChange', () => {
            const container = document.createElement('div');
            const props = createMockProps();
            const editingApp = new EditingApp(container, props);
            
            const newFlow = [{ pattern: 'new_p', repetitions: 1 }];
            editingApp.handleFlowChange(newFlow);

            runner.expect(editingApp.state.isDirty).toBe(true);
            props.shellLogger.wasCalledWith('onRhythmUpdate', { ...props.rhythm, playback_flow: newFlow, updated: true });
            editingApp.editController.logger.wasCalledWith('updatePlaybackFlow', { newFlow });
        });

        runner.it('should update state and call onRhythmUpdate on handleAddNote', () => {
            const container = document.createElement('div');
            const props = createMockProps();
            const editingApp = new EditingApp(container, props);

            const position = { patternId: 'p1', tick: 0, note: 'o' };
            editingApp.handleAddNote(position);

            runner.expect(editingApp.state.isDirty).toBe(true);
            props.shellLogger.wasCalledWith('onRhythmUpdate', { ...props.rhythm, updated: true });
            editingApp.editController.logger.wasCalledWith('addNote', { pos: position });
        });
        
        runner.it('should update its internal state on handlePatternSelect', () => {
            const container = document.createElement('div');
            const props = createMockProps();
            const editingApp = new EditingApp(container, props);
            
            editingApp.handlePatternSelect('new_pattern_id');
            
            runner.expect(editingApp.state.currentEditingPatternId).toBe('new_pattern_id');
            // Check that onRhythmUpdate was NOT called for an internal state change
            runner.expect(props.shellLogger.callCount).toBe(0);
        });
    });

    await runner.runAll();
    runner.renderResults('test-results');
}