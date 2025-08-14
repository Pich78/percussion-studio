// file: src/App.js

// Import Layers
import { DataAccessLayer } from './dal/DataAccessLayer.js';
import { AudioPlayer } from './audio/AudioPlayer.js';
import { AudioScheduler } from './audio/AudioScheduler.js';
import { PlaybackController } from './controller/PlaybackController.js';
import { ProjectController } from './controller/ProjectController.js';
import { EditController } from './controller/EditController.js';
import { View } from './view/View.js';

/**
 * The main orchestrator of the application.
 */
class App {
    constructor() {
        // Define the initial state of the application
        this.state = {
            isLoading: true,
            isPlaying: false,
            isDirty: false,
            loopPlayback: false,
            masterVolume: 1.0,
            rhythm: null,
            currentPatternId: null,
            error: null,
            confirmation: null,
        };

        // --- Initialize All Modules ---

        // Audio Layer
        this.audioPlayer = new AudioPlayer();
        this.audioScheduler = new AudioScheduler(this.audioPlayer, (beat) => {
            // This is the onUpdateCallback for the scheduler
            this.view.tubsGridView.updatePlaybackIndicator(beat);
        });

        // Controller Layer (passing dependencies)
        this.playbackController = new PlaybackController(this.audioScheduler, this.audioPlayer);
        this.projectController = new ProjectController(DataAccessLayer, this.audioPlayer, this.audioScheduler);
        this.editController = new EditController();

        // View Layer (passing callbacks)
        this.view = new View({
            onPlay: () => this.playbackController.play(),
            onPause: () => this.playbackController.pause(),
            onStop: () => this.playbackController.stop(),
            // More callbacks will be wired up here...
        });
    }

    /**
     * The main entry point to start the application.
     */
    async init() {
        // Render the initial "loading" state
        this.view.render(this.state);

        try {
            // Use the ProjectController to load our default rhythm
            const resolvedRhythm = await this.projectController.loadRhythm('test_rhythm');
            
            // Update the state with the loaded data
            this.state.rhythm = resolvedRhythm;
            this.state.currentPatternId = resolvedRhythm.playback_flow[0].pattern; // Show the first pattern
        } catch (error) {
            console.error(error);
            this.state.error = { message: 'Failed to load default rhythm.', details: error.message };
        } finally {
            // Update the state and re-render
            this.state.isLoading = false;
            this.view.render(this.state);
        }
    }
}

// Create an instance of the app and start it!
const app = new App();
app.init();