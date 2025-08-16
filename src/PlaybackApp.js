// file: src/PlaybackApp.js
import { PlaybackControlsView } from './view/PlaybackControlsView.js';
import { TubsGridView } from './view/TubsGridView.js';
import { InstrumentMixerView } from './view/InstrumentMixerView.js';

export class PlaybackApp {
    constructor(container, props) {
        this.container = container;
        this.props = props; // { rhythm, playbackController, audioScheduler, ... }

        // PlaybackApp owns its specific state
        this.state = {
            isPlaying: false,
            loopPlayback: false,
            globalBPM: this.props.rhythm.global_bpm || 120,
            masterVolume: 1.0,
            currentMeasureIndex: 0,
        };

        // Apply Tailwind classes for layout and Material Design look
        this.container.innerHTML = `
            <div id="grid-view-container" class="flex-grow p-4 overflow-auto"></div>
            <footer id="playback-footer" class="h-32 bg-white shadow-inner flex p-4 items-center gap-4">
                <div id="playback-controls-container" class="flex-grow"></div>
                <div id="instrument-mixer-container" class="w-72 border-l border-slate-200 pl-4 h-full overflow-y-auto"></div>
            </footer>
        `;

        // Instantiate views and bind them to the new containers
        this.tubsGridView = new TubsGridView(
            this.container.querySelector('#grid-view-container'),
            {} // Callbacks for TubsGridView if any
        );

        this.playbackControlsView = new PlaybackControlsView(
            this.container.querySelector('#playback-controls-container'),
            {
                onPlay: this.handlePlay.bind(this),
                onPause: this.handlePause.bind(this),
                onStop: this.handleStop.bind(this),
                onBPMChange: this.handleBPMChange.bind(this),
                onToggleLoop: this.handleToggleLoop.bind(this),
                onMasterVolumeChange: this.handleMasterVolumeChange.bind(this),
            }
        );

        this.instrumentMixerView = new InstrumentMixerView(
            this.container.querySelector('#instrument-mixer-container'),
            {} // Callbacks for InstrumentMixerView
        );

        // Link the AudioScheduler's update callback to our internal handler
        if (this.props.audioScheduler) {
            this.props.audioScheduler.onUpdateCallback = this.handleTickUpdate.bind(this);
            this.props.audioScheduler.onPlaybackEndedCallback = this.handlePlaybackEnded.bind(this);
        }
    }

    setState(newState) {
        this.state = { ...this.state, ...newState };
        this.render(); // Re-render all child views with the new state
    }

    // --- Callback Handlers ---
    handlePlay() {
        this.props.audioScheduler.setBPM(this.state.globalBPM);
        this.props.playbackController.play();
        this.setState({ isPlaying: true });
    }

    handlePause() {
        this.props.playbackController.pause();
        this.setState({ isPlaying: false });
    }

    handleStop() {
        this.props.playbackController.stop();
        this.setState({ isPlaying: false, currentMeasureIndex: 0 });
        this.tubsGridView.updatePlaybackIndicator(0);
    }

    handleBPMChange(newBPM) {
        this.setState({ globalBPM: newBPM });
    }
    
    handleToggleLoop(enabled) {
        this.props.playbackController.toggleLoop(enabled);
        this.setState({ loopPlayback: enabled });
    }

    handleMasterVolumeChange(volume) {
        this.props.playbackController.setMasterVolume(volume);
        this.setState({ masterVolume: volume });
    }

    handleTickUpdate(tickInMeasure, measureIndex) {
        this.tubsGridView.updatePlaybackIndicator(tickInMeasure);
        if (this.state.currentMeasureIndex !== measureIndex) {
            this.setState({ currentMeasureIndex: measureIndex });
        }
    }

    handlePlaybackEnded() {
        this.setState({ isPlaying: false });
    }

    render() {
        this.tubsGridView.render({
            rhythm: this.props.rhythm,
            currentPatternId: this.props.rhythm.playback_flow[0].pattern,
            currentMeasureIndex: this.state.currentMeasureIndex,
        });

        this.playbackControlsView.render({
            isPlaying: this.state.isPlaying,
            isLoading: this.props.isLoading, // Get isLoading from shell props
            loopPlayback: this.state.loopPlayback,
            globalBPM: this.state.globalBPM,
            masterVolume: this.state.masterVolume,
        });
        
        this.instrumentMixerView.render({ rhythm: this.props.rhythm });
    }

    destroy() {
        // Clean up the DOM and remove any listeners if necessary
        this.container.innerHTML = '';
        // Unset callbacks to prevent memory leaks
        if (this.props.audioScheduler) {
            this.props.audioScheduler.onUpdateCallback = () => {};
            this.props.audioScheduler.onPlaybackEndedCallback = () => {};
        }
    }
}