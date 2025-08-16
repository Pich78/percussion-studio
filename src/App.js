// file: src/App.js (Refactored as Application Shell - Corrected)
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

        this.subApps = testConfig.subApps || {
            PlaybackApp: MockPlaybackApp,
            EditingApp: MockEditingApp
        };
        const controllers = testConfig.controllers || this.createRealControllers();

        this.audioPlayer = controllers.audioPlayer;
        this.audioScheduler = controllers.audioScheduler;
        this.playbackController = controllers.playbackController;
        this.projectController = controllers.projectController;

        // --- FIX: Safely initialize global views ---
        const appMenuContainer = document.getElementById('app-menu-container');
        if (appMenuContainer) {
            this.appMenuView = new AppMenuView(appMenuContainer, {
                onToggleView: this.toggleView.bind(this),
                onLoadProject: this.loadProject.bind(this, 'test_rhythm'),
                 // ... other menu callbacks
            });
        }
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
        const oldAppView = this.state.appView;
        this.state = { ...this.state, ...newState };

        if (this.appMenuView) {
            this.appMenuView.render(this.state);
        }
        this.errorModalView.render(this.state);
        this.confirmationDialogView.render(this.state);

        if (oldAppView !== this.state.appView) {
            this.renderApp();
        }
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
            this.renderApp();
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
        // Initial render of global views
        if (this.appMenuView) this.appMenuView.render(this.state);
    }
}