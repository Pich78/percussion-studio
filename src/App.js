// file: src/App.js (Complete, Final Corrected Version)

import { DataAccessLayer } from './dal/DataAccessLayer.js';
import { AudioPlayer } from './audio/AudioPlayer.js';
import { AudioScheduler } from './audio/AudioScheduler.js';
import { PlaybackController } from './controller/PlaybackController.js';
import { ProjectController } from './controller/ProjectController.js';
import { EditController } from './controller/EditController.js';
import { View } from './view/View.js';

class App {
    constructor() {
        this.state = {
            isLoading: true, isPlaying: false, isDirty: false, loopPlayback: false,
            masterVolume: 1.0, rhythm: null, currentPatternId: null, error: null, confirmation: null,
        };

        this.audioPlayer = new AudioPlayer();
        this.audioScheduler = new AudioScheduler(this.audioPlayer, (beatNumber) => {
            const pattern = this.state.rhythm.patterns[this.state.currentPatternId];
            if (!pattern) return;
            const resolution = pattern.metadata.resolution || 16;
            const ticksPerBeat = resolution / 4.0;
            const beatInMeasure = (beatNumber -1) % 4;
            const currentTick = beatInMeasure * ticksPerBeat;
            this.view.tubsGridView.updatePlaybackIndicator(currentTick);
        }, () => {
            this.setState({ isPlaying: false });
        });

        this.playbackController = new PlaybackController(this.audioScheduler, this.audioPlayer);
        this.projectController = new ProjectController(DataAccessLayer, this.audioPlayer, this.audioScheduler);
        this.editController = new EditController();

        this.view = new View({
            onPlay: () => {
                this.playbackController.play();
                this.setState({ isPlaying: true });
            },
            onPause: () => {
                this.playbackController.pause();
                this.setState({ isPlaying: false });
            },
            onStop: () => {
                this.playbackController.stop();
                this.setState({ isPlaying: false });
                this.view.tubsGridView.updatePlaybackIndicator(0);
            },
            onMasterVolumeChange: (vol) => this.playbackController.setMasterVolume(vol),
            onToggleLoop: (enabled) => this.playbackController.toggleLoop(enabled),
            onNewProject: () => console.log('New Project clicked'),
            onLoadProject: () => console.log('Load Project clicked'),
            // CRITICAL FIX: Wire up the save button to the controller
            onSaveProject: () => {
                // For now, we use a hardcoded filename.
                // We also set isDirty to false, simulating a successful save.
                this.projectController.saveProject(this.state.rhythm, 'my-rhythm');
                this.setState({ isDirty: false });
            },
            onInstrumentVolumeChange: (id, vol) => console.log(`Volume change: ${id}, ${vol}`),
            onInstrumentMuteToggle: (id, muted) => console.log(`Mute toggle: ${id}, ${muted}`),
            onErrorDismiss: () => this.setState({ error: null }),
        });
    }

    setState(newState) {
        this.state = { ...this.state, ...newState };
        this.view.render(this.state);
    }

    async init() {
        this.view.render(this.state);
        try {
            const resolvedRhythm = await this.projectController.loadRhythm('test_rhythm');
            resolvedRhythm.mixer = {
                test_kick: { volume: 1.0, muted: false },
                test_snare: { volume: 0.8, muted: false }
            };
            this.setState({
                rhythm: resolvedRhythm,
                currentPatternId: resolvedRhythm.playback_flow[0].pattern,
                isLoading: false,
                isDirty: true // Start in a "dirty" state to enable the save button
            });
        } catch (error) {
            console.error(error);
            this.setState({ error: { message: 'Failed to load default rhythm.', details: error.message }, isLoading: false });
        }
    }
}

const app = new App();
app.init();