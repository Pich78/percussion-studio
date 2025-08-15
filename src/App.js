// file: src/App.js (Complete, with Mixer Logic)

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
            masterVolume: 1.0, globalBPM: 120,
            rhythm: null, currentPatternId: null, error: null, confirmation: null,
        };

        this.audioPlayer = new AudioPlayer();
        this.audioScheduler = new AudioScheduler(this.audioPlayer, (tickInMeasure) => {
            this.view.tubsGridView.updatePlaybackIndicator(tickInMeasure);
        }, () => {
            this.setState({ isPlaying: false });
        });

        this.playbackController = new PlaybackController(this.audioScheduler, this.audioPlayer);
        // Give the controller a way to access the current state when it needs it
        this.playbackController.setStateProvider(this.state);
        
        this.projectController = new ProjectController(DataAccessLayer, this.audioPlayer, this.audioScheduler);
        this.editController = new EditController();

        this.view = new View({
            onPlay: () => { this.playbackController.play(); this.setState({ isPlaying: true }); },
            onPause: () => { this.playbackController.pause(); this.setState({ isPlaying: false }); },
            onStop: () => {
                this.playbackController.stop();
                this.setState({ isPlaying: false });
                this.view.tubsGridView.updatePlaybackIndicator(0);
            },
            onMasterVolumeChange: (vol) => { this.playbackController.setMasterVolume(vol); this.setState({ masterVolume: vol }); },
            onToggleLoop: (enabled) => { this.playbackController.toggleLoop(enabled); this.setState({ loopPlayback: enabled }); },
            onBPMChange: (newBPM) => { this.audioScheduler.setBPM(newBPM); this.setState({ globalBPM: newBPM }); },
            
            // CRITICAL FIX: Wire up the mixer callbacks
            onInstrumentVolumeChange: (id, vol) => {
                // Update the controller
                this.playbackController.setInstrumentVolume(id, vol);
                // Update the state so the slider position is remembered
                const newMixer = { ...this.state.rhythm.mixer, [id]: { ...this.state.rhythm.mixer[id], volume: vol, muted: false } };
                this.setState({ rhythm: { ...this.state.rhythm, mixer: newMixer } });
            },
            onInstrumentMuteToggle: (id, muted) => {
                this.playbackController.toggleInstrumentMute(id, muted);
                const newMixer = { ...this.state.rhythm.mixer, [id]: { ...this.state.rhythm.mixer[id], muted: muted } };
                this.setState({ rhythm: { ...this.state.rhythm, mixer: newMixer } });
            },

            onNewProject: () => console.log('New Project clicked'),
            onLoadProject: () => console.log('Load Project clicked'),
            onSaveProject: () => { this.projectController.saveProject(this.state.rhythm, 'my-rhythm'); this.setState({ isDirty: false }); },
            onErrorDismiss: () => this.setState({ error: null }),
        });
    }

    setState(newState) {
        this.state = { ...this.state, ...newState };
        // Also update the controller's reference to the state
        this.playbackController.setStateProvider(this.state);
        this.view.render(this.state);
    }

    async init() {
        this.view.render(this.state);
        try {
            await this.projectController.loadManifest();
            const resolvedRhythm = await this.projectController.loadRhythm('test_rhythm');
            
            resolvedRhythm.mixer = {
                test_kick: { volume: 1.0, muted: false },
                test_snare: { volume: 0.8, muted: false }
            };
            
            this.setState({
                rhythm: resolvedRhythm,
                currentPatternId: resolvedRhythm.playback_flow[0].pattern,
                globalBPM: resolvedRhythm.global_bpm,
                isLoading: false,
                isDirty: true
            });
        } catch (error) {
            console.error(error);
            this.setState({ error: { message: 'Failed to load default rhythm.', details: error.message }, isLoading: false });
        }
    }
}

const app = new App();
app.init();