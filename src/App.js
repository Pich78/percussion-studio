// file: src/App.js
import { DataAccessLayer } from './dal/DataAccessLayer.js';
import { AudioPlayer } from './audio/AudioPlayer.js';
import { AudioScheduler } from './audio/AudioScheduler.js';
import { PlaybackController } from './controller/PlaybackController.js';
import { ProjectController } from './controller/ProjectController.js';

import { PlaybackApp } from './PlaybackApp.js';
import { EditingApp } from './EditingApp.js';

// --- IMPORT YOUR COMPONENT ---
import { AppMenuView } from './components/AppMenuView/AppMenuView.js';
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
            // --- NEW: Track menu state in App shell (optional but cleaner) ---
            isMenuOpen: false
        };

        this.subApps = testConfig.subApps || {
            PlaybackApp: PlaybackApp,
            EditingApp: EditingApp
        };

        const controllers = testConfig.controllers || this.createRealControllers();
        this.audioPlayer = controllers.audioPlayer;
        this.audioScheduler = controllers.audioScheduler;
        this.playbackController = controllers.playbackController;
        this.projectController = controllers.projectController;

        // Initialize Global Views
        const appMenuContainer = document.getElementById('app-menu-container');
        if (appMenuContainer) {
            this.appMenuView = new AppMenuView(appMenuContainer, {
                onToggleView: this.toggleView.bind(this),
                onLoadProject: () => {
                    // Close menu then load
                    this.setState({ isMenuOpen: false });
                    this.loadProject('test_rhythm');
                },
                onNewProject: () => {
                    this.setState({ isMenuOpen: false });
                    console.log("New Project Requested");
                    // TODO: Implement new project logic
                },
                onSaveProject: () => {
                    this.setState({ isMenuOpen: false });
                    console.log("Save Requested");
                    // TODO: Implement save logic
                },
                // --- NEW: Handle menu toggle ---
                onToggleMenu: (forceState) => {
                    const newState = typeof forceState === 'boolean'
                        ? forceState
                        : !this.state.isMenuOpen;
                    this.setState({ isMenuOpen: newState });
                }
            });
        }

        this.errorModalView = new ErrorModalView(document.body, {});
        this.confirmationDialogView = new ConfirmationDialogView(document.body, {});
    }

    createRealControllers() {
        const audioPlayer = new AudioPlayer();
        const audioScheduler = new AudioScheduler(audioPlayer);
        const playbackController = new PlaybackController(audioScheduler, audioPlayer);
        // Ensure DataAccessLayer is passed correctly (assuming it's a static class or singleton)
        const projectController = new ProjectController(DataAccessLayer, audioPlayer, audioScheduler);
        return { audioPlayer, audioScheduler, playbackController, projectController };
    }

    setState(newState) {
        const oldAppView = this.state.appView;
        this.state = { ...this.state, ...newState };

        // Render Global Views
        if (this.appMenuView) {
            // Pass the minimal necessary state to the menu
            this.appMenuView.render({
                appView: this.state.appView,
                isMenuOpen: this.state.isMenuOpen,
                isDirty: false // TODO: hook up real dirty state from EditingApp
            });
        }

        this.errorModalView.render(this.state);
        this.confirmationDialogView.render(this.state);

        // Pass updates to Sub-App
        if (this.activeSubApp) {
            this.activeSubApp.props.isLoading = this.state.isLoading;
            this.activeSubApp.props.rhythm = this.state.currentRhythm;
            // Only re-render sub-app if necessary (optimization)
            if (typeof this.activeSubApp.update === 'function') {
                this.activeSubApp.update(this.activeSubApp.props);
            } else {
                this.activeSubApp.render();
            }
        }

        if (oldAppView !== this.state.appView) {
            this.renderApp();
        }
    }

    toggleView() {
        const newView = this.state.appView === 'playing' ? 'editing' : 'playing';
        this.setState({ appView: newView, isMenuOpen: false });
    }

    async loadProject(id) {
        this.setState({ isLoading: true });
        try {
            const rhythm = await this.projectController.loadRhythm(id);
            this.setState({ currentRhythm: rhythm, isLoading: false });
            this.renderApp();
        } catch (error) {
            this.setState({
                error: { message: `Failed to load rhythm: ${id}`, details: error.message },
                isLoading: false
            });
        }
    }

    handleRhythmUpdate(newRhythm) {
        this.setState({ currentRhythm: newRhythm });
        this.audioScheduler.setRhythm(newRhythm);
    }

    renderApp() {
        if (this.activeSubApp && typeof this.activeSubApp.destroy === 'function') {
            this.activeSubApp.destroy();
        }

        if (!this.state.currentRhythm) {
            // Simple loading state
            this.container.innerHTML = '<div style="display:flex;justify-content:center;align-items:center;height:100%;">Loading...</div>';
            return;
        }

        const subAppProps = {
            rhythm: this.state.currentRhythm,
            isLoading: this.state.isLoading,
            audioPlayer: this.audioPlayer,
            audioScheduler: this.audioScheduler,
            playbackController: this.playbackController,
            onRhythmUpdate: this.handleRhythmUpdate.bind(this),
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
        // Initial render of the menu
        if (this.appMenuView) this.appMenuView.render({
            appView: this.state.appView,
            isMenuOpen: this.state.isMenuOpen,
            isDirty: false
        });

        await this.projectController.loadManifest();
        const defaultRhythmId = this.projectController.manifest?.rhythms[0];

        if (defaultRhythmId) {
            await this.loadProject(defaultRhythmId);
        } else {
            this.setState({ error: { message: "No rhythms found in manifest." }, isLoading: false });
        }
    }
}