// file: test/suites/App.test.js (Corrected)

import { TestRunner } from '/percussion-studio/test/lib/TestRunner.js';
import { MockLogger } from '/percussion-studio/test/mocks/MockLogger.js';
import { App } from '/percussion-studio/src/App.js';
import { MockPlaybackApp } from '/percussion-studio/test/mocks/MockPlaybackApp.js';
import { MockEditingApp } from '/percussion-studio/test/mocks/MockEditingApp.js';

const createMockControllers = () => ({
    projectController: { loadManifest: () => Promise.resolve(), loadRhythm: () => Promise.resolve({ global_bpm: 120 }) },
    playbackController: {},
    audioScheduler: {},
    audioPlayer: {},
    dal: {}
});

export async function run() {
    const runner = new TestRunner();
    MockLogger.clearLogs();
    MockLogger.setLogTarget('log-output');

    runner.describe('App Shell Initialization', () => {
        runner.it('should initialize with correct default state', () => {
            const app = new App(document.createElement('div'), { controllers: createMockControllers() });
            runner.expect(app.state.appView).toBe('playing');
            runner.expect(app.state.isLoading).toBe(true);
            runner.expect(app.state.currentRhythm).toBe(null);
        });
    });

    runner.describe('App Shell Routing', () => {
        runner.it('should switch appView state when toggleView is called', () => {
            const app = new App(document.createElement('div'), {
                controllers: createMockControllers(),
                subApps: { PlaybackApp: MockPlaybackApp, EditingApp: MockEditingApp }
            });
            app.toggleView();
            runner.expect(app.state.appView).toBe('editing');
            app.toggleView();
            runner.expect(app.state.appView).toBe('playing');
        });

        runner.it('should instantiate PlaybackApp when view is "playing"', () => {
            const container = document.createElement('div');
            const app = new App(container, {
                controllers: createMockControllers(),
                subApps: { PlaybackApp: MockPlaybackApp, EditingApp: MockEditingApp }
            });
            app.renderApp();
            // --- FIX: Use correct assertion ---
            runner.expect(container.textContent.includes('PlaybackApp is Active')).toBe(true);
        });

        runner.it('should instantiate EditingApp when view is "editing"', () => {
            const container = document.createElement('div');
            const app = new App(container, {
                controllers: createMockControllers(),
                subApps: { PlaybackApp: MockPlaybackApp, EditingApp: MockEditingApp }
            });
            app.toggleView();
            app.renderApp();
            // --- FIX: Use correct assertion ---
            runner.expect(container.textContent.includes('EditingApp is Active')).toBe(true);
        });

        runner.it('should call destroy() on the old sub-app when switching views', () => {
            const container = document.createElement('div');
            const app = new App(container, {
                controllers: createMockControllers(),
                subApps: { PlaybackApp: MockPlaybackApp, EditingApp: MockEditingApp }
            });
            app.renderApp();
            const playbackAppInstance = app.activeSubApp;
            const logger = new MockLogger('destroy-spy');
            playbackAppInstance.destroy = () => logger.log('destroy');

            app.toggleView();

            logger.wasCalledWith('destroy');
        });
    });

    await runner.runAll();
    runner.renderResults('test-results');
}