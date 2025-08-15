// file: src/view/View.js (Complete, Corrected Version)
import { AppMenuView } from './AppMenuView.js';
import { PlaybackControlsView } from './PlaybackControlsView.js';
import { TubsGridView } from './TubsGridView.js';
import { InstrumentMixerView } from './InstrumentMixerView.js';
import { RhythmEditorView } from './RhythmEditorView.js'; // Import the editor view
import { ConfirmationDialogView } from './ConfirmationDialogView.js';
import { ErrorModalView } from './ErrorModalView.js';
export class View {
    constructor(callbacks) {
        this.callbacks = callbacks;
        // Get all containers from the DOM
        const appMenuContainer = document.getElementById('app-menu-container');
        const playbackControlsContainer = document.getElementById('playback-controls-container');
        const tubsGridContainer = document.getElementById('grid-view-container');
        const instrumentMixerContainer = document.getElementById('instrument-mixer-container');
        const rhythmEditorContainer = document.getElementById('rhythm-editor-container'); // Get editor container
        const appBody = document.body;

        // Instantiate all sub-views
        this.appMenuView = new AppMenuView(appMenuContainer, {
            onNewProject: () => this.callbacks.onNewProject(),
            onLoadProject: () => this.callbacks.onLoadProject('test_rhythm'), // Example wiring
            onSaveProject: () => this.callbacks.onSaveProject()
        });
        
        this.playbackControlsView = new PlaybackControlsView(playbackControlsContainer, {
            onPlay: () => this.callbacks.onPlay(),
            onPause: () => this.callbacks.onPause(),
            onStop: () => this.callbacks.onStop(),
            onMasterVolumeChange: (vol) => this.callbacks.onMasterVolumeChange(vol),
            onToggleLoop: (enabled) => this.callbacks.onToggleLoop(enabled)
        });

        this.tubsGridView = new TubsGridView(tubsGridContainer, {
            onToggleMute: (symbol) => this.callbacks.onToggleInstrumentMute(symbol)
        });
        
        this.instrumentMixerView = new InstrumentMixerView(instrumentMixerContainer, {
            onVolumeChange: (id, vol) => this.callbacks.onInstrumentVolumeChange(id, vol),
            onToggleMute: (id, muted) => this.callbacks.onInstrumentMuteToggle(id, muted),
        });
        
        // Instantiate the RhythmEditorView and wire its callbacks
        this.rhythmEditorView = new RhythmEditorView(rhythmEditorContainer, {
            onFlowChange: (newFlow) => this.callbacks.onFlowChange(newFlow),
            onAddPatternClick: () => this.callbacks.onAddPatternClick(), // Wire up add pattern
        });
        
        this.confirmationDialogView = new ConfirmationDialogView(appBody, {
            onAccept: () => this.callbacks.onConfirmationAccept(),
            onCancel: () => this.callbacks.onConfirmationCancel(),
        });
        
        this.errorModalView = new ErrorModalView(appBody, {
            onErrorDismiss: () => this.callbacks.onErrorDismiss()
        });
    }
    render(state) {
        // Delegate rendering to all sub-views with the relevant slice of state
        this.appMenuView.render({ isDirty: state.isDirty });
        this.playbackControlsView.render({
            isPlaying: state.isPlaying,
            isLoading: state.isLoading,
            masterVolume: state.masterVolume,
            loopPlayback: state.loopPlayback
        });
        this.tubsGridView.render({
            rhythm: state.rhythm,
            currentPatternId: state.currentPatternId,
            currentMeasureIndex: state.currentMeasureIndex
        });
        this.instrumentMixerView.render({ rhythm: state.rhythm });
        this.rhythmEditorView.render({ rhythm: state.rhythm }); // Render the editor view
        this.confirmationDialogView.render({ confirmation: state.confirmation });
        this.errorModalView.render({ error: state.error });
    }
      
}
