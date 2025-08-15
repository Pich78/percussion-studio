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
            isLoading: true, isPlaying: false, isDirty: false, loopPlayback: false, metronomeEnabled: false,
            masterVolume: 1.0, globalBPM: 120,
            rhythm: null, currentPatternId: null, currentMeasureIndex: 0,
            error: null, confirmation: null,
        };
        this.audioPlayer = new AudioPlayer();
        this.audioScheduler = new AudioScheduler(this.audioPlayer, 
            (tick, measure) => { // onTick callback
                this.view.tubsGridView.updatePlaybackIndicator(tick);
                if (this.state.currentMeasureIndex !== measure) {
                    this.setState({ currentMeasureIndex: measure });
                }
            }, 
            () => { // onPlaybackEnded callback
                this.setState({ isPlaying: false });
            }
        );

        this.playbackController = new PlaybackController(this.audioScheduler, this.audioPlayer);
        this.projectController = new ProjectController(DataAccessLayer, this.audioPlayer, this.audioScheduler);
        this.editController = new EditController();

        this.view = new View({
            // Playback Callbacks
            onPlay: () => { this.playbackController.play(this.state); this.setState({ isPlaying: true }); },
            onPause: () => { this.playbackController.pause(); this.setState({ isPlaying: false }); },
            onStop: () => {
                this.playbackController.stop();
                this.setState({ isPlaying: false, currentMeasureIndex: 0 });
                this.view.tubsGridView.updatePlaybackIndicator(0);
            },
            onMasterVolumeChange: (vol) => { this.playbackController.setMasterVolume(vol); this.setState({ masterVolume: vol }); },
            onToggleLoop: (enabled) => { this.playbackController.toggleLoop(enabled); this.setState({ loopPlayback: enabled }); },
            onBPMChange: (newBPM) => { this.audioScheduler.setBPM(newBPM); this.setState({ globalBPM: newBPM }); },
            onToggleMetronome: (enabled) => { this.setState({ metronomeEnabled: enabled }); },

            // Mixer Callbacks
            onInstrumentVolumeChange: (id, vol) => this.handleMixerChange(id, { volume: vol }),
            onInstrumentMuteToggle: (id, muted) => this.handleMixerChange(id, { muted }),

            // Project Lifecycle Callbacks
            onNewProject: () => this.handleProjectAction(() => this.newProject()),
            onLoadProject: (id) => this.handleProjectAction(() => this.loadProject(id)),
            onSaveProject: () => { this.projectController.saveProject(this.state.rhythm, 'my-rhythm'); this.setState({ isDirty: false }); },
            
            // Editing Callbacks
            onFlowChange: (newFlow) => this.handleEdit(() => this.editController.updatePlaybackFlow(this.state.rhythm, newFlow)),
            
            // TubsGridView Callbacks
            onToggleInstrumentMute: (symbol) => {
                const soundPackName = this.state.rhythm.sound_kit[symbol];
                const isMuted = this.state.rhythm.mixer[soundPackName]?.muted ?? false;
                this.handleMixerChange(soundPackName, { muted: !isMuted });
            },

            // Modal Callbacks
            onErrorDismiss: () => this.setState({ error: null }),
            onConfirmationAccept: () => {
                const action = this.state.confirmation.onAccept;
                this.setState({ confirmation: null });
                action();
            },
            onConfirmationCancel: () => this.setState({ confirmation: null }),
        });
        
        // Add safety net for unsaved changes
        window.addEventListener('beforeunload', (e) => {
            if (this.state.isDirty) {
                e.preventDefault();
                e.returnValue = ''; // Required for modern browsers
            }
        });
    }

    setState(newState) {
        this.state = { ...this.state, ...newState };
        this.view.render(this.state);
    }
    // --- State Update Helpers ---

    handleMixerChange(id, props) {
        const newMixer = { 
            ...this.state.rhythm.mixer, 
            [id]: { ...this.state.rhythm.mixer[id], ...props } 
        };
        // Update the controller for immediate audio changes
        this.playbackController.setInstrumentMix(newMixer);
        // Update state to reflect in UI and make it persistent
        this.setState({ rhythm: { ...this.state.rhythm, mixer: newMixer }, isDirty: true });
    }

    handleEdit(editFunction) {
        const newRhythm = editFunction();
        this.setState({ rhythm: newRhythm, isDirty: true });
    }

    handleProjectAction(action) {
        if (this.state.isDirty) {
            this.setState({
                confirmation: {
                    message: 'You have unsaved changes. Are you sure you want to continue?',
                    onAccept: action,
                }
            });
        } else {
            action();
        }
    }
    // --- Core Logic Methods ---

    async newProject() {
        console.log("Creating new project...");
        const newRhythm = this.projectController.createNewRhythm();
        this.setState({
            rhythm: newRhythm,
            currentPatternId: newRhythm.playback_flow.pattern,
            globalBPM: newRhythm.global_bpm,
            isDirty: true,
            isPlaying: false,
            isLoading: false,
        });
    }

    async loadProject(id) {
        console.log(`Loading project: ${id}...`);
        this.setState({ isLoading: true });
        try {
            const resolvedRhythm = await this.projectController.loadRhythm(id);
            this.setState({
                rhythm: resolvedRhythm,
                currentPatternId: resolvedRhythm.playback_flow.pattern,
                globalBPM: resolvedRhythm.global_bpm,
                isLoading: false,
                isDirty: false, // Freshly loaded project is not dirty
                isPlaying: false,
            });
        } catch (error) {
            console.error(error);
            this.setState({ error: { message: `Failed to load rhythm: ${id}.`, details: error.message }, isLoading: false });
        }
    }

    async init() {
        this.view.render(this.state);
        await this.projectController.loadManifest();
        await this.loadProject('test_rhythm');
    }
      
}
const app = new App();
app.init();
