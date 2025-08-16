// file: test/suites/EditingApp.test.js (Corrected with Robust Mocks)

import { TestRunner } from '/percussion-studio/test/lib/TestRunner.js';
import { MockLogger } from '/percussion-studio/test/mocks/MockLogger.js';
import { EditingApp } from '/percussion-studio/src/EditingApp.js';

// --- Mocks ---
class MockEditController {
    constructor() { this.logger = new MockLogger('MockEditController'); }
    updatePlaybackFlow(rhythm, newFlow) { this.logger.log('updatePlaybackFlow', { newFlow }); return { ...rhythm, playback_flow: newFlow, updated: true }; }
    addNote(rhythm, pos) { this.logger.log('addNote', { pos }); return { ...rhythm, updated: true }; }
    removeNote(rhythm, pos) { this.logger.log('removeNote', { pos }); return { ...rhythm, updated: true }; }
    addTrack(rhythm, payload) { this.logger.log('addTrack', { payload }); return { ...rhythm, updated: true }; }
    removeTrack(rhythm, payload) { this.logger.log('removeTrack', { payload }); return { ...rhythm, updated: true }; }
    addPattern(rhythm, payload) { this.logger.log('addPattern', { payload }); return { ...rhythm, patterns: {...rhythm.patterns, [payload.patternId]: {}}, playback_flow: [...rhythm.playback_flow], updated: true }; }
}

class MockRhythmEditorView {
    constructor() { this.logger = new MockLogger('MockRhythmEditorView'); }
    render(state) { this.logger.log('render', state); }
}

// --- FIX: Create a more realistic mock rhythm object ---
const createMockRhythm = () => ({
    global_bpm: 120,
    playback_flow: [{ pattern: 'p1', repetitions: 4 }],
    patterns: {
        p1: {
            metadata: { resolution: 16, metric: '4/4' },
            pattern_data: [{ KCK: '||----------------||' }]
        }
    }
});

const createMockProps = (rhythm) => {
    const logger = new MockLogger('AppShell');
    return {
        rhythm: rhythm || createMockRhythm(),
        onRhythmUpdate: (newRhythm) => logger.log('onRhythmUpdate', newRhythm),
        shellLogger: logger
    };
};

export async function run() {
    const runner = new TestRunner();
    MockLogger.clearLogs();
    MockLogger.setLogTarget('log-output');
    
    runner.describe('EditingApp Initialization', () => {
        runner.it('should initialize with correct default state', () => {
            const container = document.createElement('div');
            const rhythm = createMockRhythm();
            rhythm.playback_flow[0].pattern = 'verse'; // Customize for test
            const props = createMockProps(rhythm);
            const editingApp = new EditingApp(container, props);
            // Inject mocks post-construction for a cleaner test
            editingApp.rhythmEditorView = new MockRhythmEditorView();

            runner.expect(editingApp.state.isDirty).toBe(false);
            runner.expect(editingApp.state.currentEditingPatternId).toBe('verse');
        });
    });

    runner.describe('EditingApp Logic and State', () => {
        runner.it('should update state and call onRhythmUpdate on handleFlowChange', () => {
            const container = document.createElement('div');
            const props = createMockProps();
            const editingApp = new EditingApp(container, props);
            editingApp.editController = new MockEditController(); // Inject mock
            editingApp.rhythmEditorView = new MockRhythmEditorView();
            
            const newFlow = [{ pattern: 'new_p', repetitions: 1 }];
            editingApp.handleFlowChange(newFlow);

            runner.expect(editingApp.state.isDirty).toBe(true);
            const expectedRhythm = { ...props.rhythm, playback_flow: newFlow, updated: true };
            props.shellLogger.wasCalledWith('onRhythmUpdate', expectedRhythm);
            editingApp.editController.logger.wasCalledWith('updatePlaybackFlow', { newFlow });
        });

        runner.it('should update state and call onRhythmUpdate on handleAddNote', () => {
            const container = document.createElement('div');
            const props = createMockProps();
            const editingApp = new EditingApp(container, props);
            editingApp.editController = new MockEditController(); // Inject mock
            editingApp.rhythmEditorView = new MockRhythmEditorView();

            const position = { patternId: 'p1', tick: 0, note: 'o' };
            editingApp.handleAddNote(position);

            runner.expect(editingApp.state.isDirty).toBe(true);
            const expectedRhythm = { ...props.rhythm, updated: true };
            props.shellLogger.wasCalledWith('onRhythmUpdate', expectedRhythm);
            editingApp.editController.logger.wasCalledWith('addNote', { pos: position });
        });
        
        runner.it('should update its internal state on handlePatternSelect', () => {
            const container = document.createElement('div');
            const props = createMockProps();
            const editingApp = new EditingApp(container, props);
            editingApp.rhythmEditorView = new MockRhythmEditorView();
            
            editingApp.handlePatternSelect('new_pattern_id');
            
            runner.expect(editingApp.state.currentEditingPatternId).toBe('new_pattern_id');
            runner.expect(props.shellLogger.callCount).toBe(0);
        });
    });

    await runner.runAll();
    runner.renderResults('test-results');
}