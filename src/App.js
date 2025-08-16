// file: src/App.js (Refactored as Application Shell)
import { DataAccessLayer } from './dal/DataAccessLayer.js';
import { AudioPlayer } from './audio/AudioPlayer.js';
import { AudioScheduler } from './audio/AudioScheduler.js';
import { PlaybackController } from './controller/PlaybackController.js';
import { ProjectController } from './controller/ProjectController.js';

// Sub-App placeholders - will be real imports later
import { MockPlaybackApp } from '/percussion-studio/test/mocks/MockPlaybackApp.js';
import { MockEditingApp } from '/percussion-studio/test/mocks/MockEditingApp.js';
// import { PlaybackApp } from './PlaybackApp.js';
// import { EditingApp } from './EditingApp.js';

import { AppMenuView } from './view/AppMenuView.js';
import { ConfirmationDialogView } from './view/ConfirmationDialogView.js';
import { ErrorModalView } from './view/ErrorModalView.js';

export class App {
    constructor(container, testConfig = {}) {
        this.container = container;
        this.activeSubApp = null;

        this.state = {
            appView: 'playing',
            isLoading: true,
            currentRhythm: null,
            error: null,
            confirmation: null,
        };

        // Allow injecting mocks for testing
        this.subApps = testConfig.subApps || {
            PlaybackApp: MockPlaybackApp, // Replace with real PlaybackApp
            EditingApp: MockEditingApp    // Replace with real EditingApp
        };
        const controllers = testConfig.controllers || this.createRealControllers();

        this.audioPlayer = controllers.audioPlayer;
        this.audioScheduler = controllers.audioScheduler;
        this.playbackController = controllers.playbackController;
        this.projectController = controllers.projectController;

        // Global views managed by the shell
        this.appMenuView = new AppMenuView(document.getElementById('app-menu-container'), {
            onToggleView: this.toggleView.bind(this),
            onLoadProject: this.loadProject.bind(this, 'test_rhythm'), // Example ID
            // ... other menu callbacks
        });
        this.errorModalView = new ErrorModalView(document.body, {});
        this.confirmationDialogView = new ConfirmationDialogView(document.body, {});
    }

    createRealControllers() {
        const audioPlayer = new AudioPlayer();
        const audioScheduler = new AudioScheduler(audioPlayer, () => {}, () => {});
        const playbackController = new PlaybackController(audioScheduler, audioPlayer);
        const projectController = new ProjectController(DataAccessLayer, audioPlayer, audioScheduler);
        return { audioPlayer, audioScheduler, playbackController, projectController, dal: DataAccessLayer };
    }

    setState(newState) {
        const oldState = { ...this.state };
        this.state = { ...this.state, ...newState };

        // If the view has changed, re-route the sub-app
        if (oldState.appView !== this.state.appView) {
            this.renderApp();
        }

        // Always render global components
        this.appMenuView.render(this.state);
        this.errorModalView.render(this.state);
        this.confirmationDialogView.render(this.state);
    }

    toggleView() {
        const newView = this.state.appView === 'playing' ? 'editing' : 'playing';
        this.setState({ appView: newView });
    }

    async loadProject(id) {
        this.setState({ isLoading: true });
        try {
            const rhythm = await this.projectController.loadRhythm(id);
            this.setState({ currentRhythm: rhythm, isLoading: false });
            this.renderApp(); // Re-render the sub-app with the new rhythm
        } catch (error) {
            this.setState({ error: { message: `Failed to load rhythm: ${id}`, details: error.message }, isLoading: false });
        }
    }

    renderApp() {
        if (this.activeSubApp && typeof this.activeSubApp.destroy === 'function') {
            this.activeSubApp.destroy();
        }

        const subAppProps = {
            rhythm: this.state.currentRhythm,
            audioPlayer: this.audioPlayer,
            audioScheduler: this.audioScheduler,
            playbackController: this.playbackController,
        };

        if (this.state.appView === 'playing') {
            this.activeSubApp = new this.subApps.PlaybackApp(this.container, subAppProps);
        } else {
            this.activeSubApp = new this.subApps.EditingApp(this.container, subAppProps);
        }

        if (this.activeSubApp) {
            this.activeSubApp.render();
        }
    }

    async init() {
        this.setState({ isLoading: true });
        await this.projectController.loadManifest();
        const defaultRhythmId = this.projectController.manifest?.rhythms[0];
        if (defaultRhythmId) {
            await this.loadProject(defaultRhythmId);
        } else {
            this.setState({ error: { message: "No rhythms found." }, isLoading: false });
        }
    }
}