// file: src/view/View.js

// Import all the individual view components we've built
import { AppMenuView } from './AppMenuView.js';
import { PlaybackControlsView } from './PlaybackControlsView.js';
import { TubsGridView } from './TubsGridView.js';
import { InstrumentMixerView } from './InstrumentMixerView.js';
import { RhythmEditorView } from './RhythmEditorView.js';
import { ConfirmationDialogView } from './ConfirmationDialogView.js';
import { ErrorModalView } from './ErrorModalView.js';

/**
 * The main UI manager. It owns all the sub-view modules and orchestrates
 * the rendering of the entire application based on the state.
 */
export class View {
    constructor(callbacks) {
        this.callbacks = callbacks;

        // Find all the container elements in the DOM
        const appMenuContainer = document.getElementById('app-menu-container');
        const playbackControlsContainer = document.getElementById('playback-controls-container');
        const tubsGridContainer = document.getElementById('grid-view-container');
        const instrumentMixerContainer = document.getElementById('instrument-mixer-container');
        const appBody = document.body; // Modals are attached to the body

        // Instantiate all the sub-view modules, passing their containers and callbacks
        this.appMenuView = new AppMenuView(appMenuContainer, {
            onNewProject: () => this.callbacks.onNewProject(),
            onLoadProject: () => this.callbacks.onLoadProject(),
            onSaveProject: () => this.callbacks.onSaveProject()
        });
        
        this.playbackControlsView = new PlaybackControlsView(playbackControlsContainer, {
            onPlay: () => this.callbacks.onPlay(),
            onPause: () => this.callbacks.onPause(),
            onStop: () => this.callbacks.onStop(),
            onMasterVolumeChange: (vol) => this.callbacks.onMasterVolumeChange(vol),
            onToggleLoop: (enabled) => this.callbacks.onToggleLoop(enabled)
        });

        this.tubsGridView = new TubsGridView(tubsGridContainer, {});
        this.instrumentMixerView = new InstrumentMixerView(instrumentMixerContainer, {});
        
        // Modals need a separate flow
        this.confirmationDialogView = new ConfirmationDialogView(appBody);
        this.errorModalView = new ErrorModalView(appBody, {
            onErrorDismiss: () => this.callbacks.onErrorDismiss()
        });
    }

    /**
     * The main rendering method. It takes the entire application state
     * and passes the relevant "slice" of it to each sub-view.
     * @param {object} state The full application state object.
     */
    render(state) {
        // Pass the relevant state slice to each sub-view
        this.appMenuView.render({ isDirty: state.isDirty });
        this.playbackControlsView.render({
            isPlaying: state.isPlaying,
            isLoading: state.isLoading,
            masterVolume: state.masterVolume,
            loopPlayback: state.loopPlayback
        });
        this.tubsGridView.render({
            rhythm: state.rhythm,
            currentPatternId: state.currentPatternId
        });
        this.instrumentMixerView.render({ rhythm: state.rhythm });

        // Modals are driven by their specific state keys
        this.confirmationDialogView.render({ confirmation: state.confirmation });
        this.errorModalView.render({ error: state.error });
    }
}