// file: src/view/View.js (Modified with Logging and CRITICAL FIX)
import { AppMenuView } from './AppMenuView.js';
import { PlaybackControlsView } from './PlaybackControlsView.js';
import { TubsGridView } from './TubsGridView.js';
import { InstrumentMixerView } from './InstrumentMixerView.js';
import { RhythmEditorView } from './RhythmEditorView.js';
import { ConfirmationDialogView } from './ConfirmationDialogView.js';
import { ErrorModalView } from './ErrorModalView.js';

const getTime = () => new Date().toISOString();

export class View {
constructor(callbacks) {
this.callbacks = callbacks;

    const appMenuContainer = document.getElementById('app-menu-container');
    const playbackControlsContainer = document.getElementById('playback-controls-container');
    const tubsGridContainer = document.getElementById('grid-view-container');
    const instrumentMixerContainer = document.getElementById('instrument-mixer-container');
    const rhythmEditorContainer = document.getElementById('rhythm-editor-container');
    const appBody = document.body;

    this.appMenuView = new AppMenuView(appMenuContainer, {
        onNewProject: () => this.callbacks.onNewProject(),
        onLoadProject: () => this.callbacks.onLoadProject('test_rhythm'),
        onSaveProject: () => this.callbacks.onSaveProject(),
        onToggleView: () => this.callbacks.onToggleView(), // Wire up the view toggle
    });
    
    this.playbackControlsView = new PlaybackControlsView(playbackControlsContainer, {
        onPlay: () => this.callbacks.onPlay(),
        onPause: () => this.callbacks.onPause(),
        onStop: () => this.callbacks.onStop(),
        onMasterVolumeChange: (vol) => this.callbacks.onMasterVolumeChange(vol),
        onToggleLoop: (enabled) => this.callbacks.onToggleLoop(enabled),
        // Pass the BPM callback through
        onBPMChange: (newBPM) => this.callbacks.onBPMChange(newBPM)
    });

    this.tubsGridView = new TubsGridView(tubsGridContainer, {
        onToggleMute: (symbol) => this.callbacks.onToggleInstrumentMute(symbol)
    });
    
    this.instrumentMixerView = new InstrumentMixerView(instrumentMixerContainer, {
        onVolumeChange: (id, vol) => this.callbacks.onInstrumentVolumeChange(id, vol),
        onToggleMute: (id, muted) => this.callbacks.onInstrumentMuteToggle(id, muted),
    });
    
    this.rhythmEditorView = new RhythmEditorView(rhythmEditorContainer, {
        onFlowChange: (newFlow) => this.callbacks.onFlowChange(newFlow),
        onAddPatternClick: () => this.callbacks.onAddPatternClick(),
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
    console.log(`[${getTime()}][View][render][BPM] Main view rendering. Passing state down to sub-views. Current globalBPM: ${state.globalBPM}. Full state:`, state);
    // Add/remove a class on the body to control which main view is visible via CSS
    document.body.classList.toggle('editing-mode', state.appView === 'editing');

    this.appMenuView.render({ isDirty: state.isDirty, appView: state.appView });
    
    // --- CRITICAL FIX IS HERE ---
    // You must pass the globalBPM state down to the playback controls view.
    this.playbackControlsView.render({
        isPlaying: state.isPlaying,
        isLoading: state.isLoading,
        masterVolume: state.masterVolume,
        loopPlayback: state.loopPlayback,
        globalBPM: state.globalBPM 
    });
    // --- END OF CRITICAL FIX ---

    this.tubsGridView.render({
        rhythm: state.rhythm,
        currentPatternId: state.currentPatternId,
        currentMeasureIndex: state.currentMeasureIndex
    });
    this.instrumentMixerView.render({ rhythm: state.rhythm });
    this.rhythmEditorView.render({ rhythm: state.rhythm });
    this.confirmationDialogView.render({ confirmation: state.confirmation });
    this.errorModalView.render({ error: state.error });
}
  
}