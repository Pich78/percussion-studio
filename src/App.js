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
            appView: 'playing',
            isLoading: true, isPlaying: false, isDirty: false, loopPlayback: false, metronomeEnabled: false,
            masterVolume: 1.0,
            globalBPM: 100,
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
            // View Mode Callback
            onToggleView: () => this.toggleViewMode(),

            // Playback Callbacks
            onPlay: () => {
                // 1. Explicitly sync the BPM from the UI state to the audio engine.
                this.audioScheduler.setBPM(this.state.globalBPM);
                // 2. Now, tell the controller to play.
                this.playbackController.play();
                this.setState({ isPlaying: true });
            },       
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

            // --- CRITICAL FIX ---
            // Add the missing callback handler for adding a new pattern.
            onAddPatternClick: () => {
                const patternId = prompt("Enter a unique name for the new pattern (e.g., 'new_chorus'):");
                if (patternId && patternId.trim() !== "") {
                    this.handleEdit(() => this.editController.addPattern(this.state.rhythm, {
                        patternId: patternId.trim(),
                        metadata: { name: patternId.trim(), metric: '4/4', resolution: 16 }
                    }));
                }
            },

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

        window.addEventListener('beforeunload', (e) => {
            if (this.state.isDirty) {
                e.preventDefault();
                e.returnValue = '';
            }
        });
    }

    setState(newState) {
        this.state = { ...this.state, ...newState };
        this.view.render(this.state);
    } // --- State Update Helpers ---

    toggleViewMode() {
        const newView = this.state.appView === 'playing' ? 'editing' : 'playing';
        this.setState({ appView: newView });
    }

    handleMixerChange(id, props) {
        const newMixer = {
            ...this.state.rhythm.mixer,
            [id]: { ...this.state.rhythm[id], ...props }
        };
        this.playbackController.setInstrumentMix(newMixer);
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
    } // --- Core Logic Methods ---

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
            appView: 'editing'
        });
    }

    async loadProject(id) {
        console.log(`Loading project: ${id}...`);
        this.setState({ isLoading: true });
        try {
            const resolvedRhythm = await this.projectController.loadRhythm(id);
            this.setState({
                rhythm: resolvedRhythm,
                currentPatternId: resolvedRhythm.playback_flow[0].pattern,
                globalBPM: resolvedRhythm.global_bpm,
                isLoading: false,
                isDirty: false,
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
        const defaultRhythmId = this.projectController.manifest.rhythms;
        if (defaultRhythmId) {
            await this.loadProject(defaultRhythmId);
        } else {
            this.setState({ error: { message: "No rhythms found in manifest.json." }, isLoading: false });
        }
    }

}
const app = new App();
app.init();