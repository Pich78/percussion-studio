// file: src/components/PlaybackControlsView/PlaybackControlsView.test.js

import { TestRunner } from '/percussion-studio/lib/TestRunner.js';
import { MockLogger } from '/percussion-studio/lib/MockLogger.js';
import { logEvent } from '/percussion-studio/lib/Logger.js';
import { PlaybackControlsView } from './PlaybackControlsView.js';

export async function run() {
    const runner = new TestRunner();
    MockLogger.clearLogs();
    logEvent('info', 'TestRunner', 'run', 'Setup', 'Starting PlaybackControlsView test suite.');
    
    const testContainer = document.getElementById('test-sandbox');

    const getBaseState = () => ({
        isPlaying: false, isLoading: false, masterVolume: 1.0, loopPlayback: false, globalBPM: 120
    });

    runner.describe('PlaybackControlsView Rendering and Styles', () => {
        runner.it('should apply primary color to active buttons when stopped', () => {
            testContainer.innerHTML = '';
            const view = new PlaybackControlsView(testContainer, {});
            view.render(getBaseState());
            runner.expect(testContainer.querySelector('[data-action="play"]').classList.contains('bg-blue')).toBe(true);
            runner.expect(testContainer.querySelector('[data-action="pause"]').classList.contains('bg-light-gray')).toBe(true);
        });

        runner.it('should apply primary color to active buttons when playing', () => {
            testContainer.innerHTML = '';
            const view = new PlaybackControlsView(testContainer, {});
            view.render({ ...getBaseState(), isPlaying: true });
            runner.expect(testContainer.querySelector('[data-action="play"]').classList.contains('bg-light-gray')).toBe(true);
            runner.expect(testContainer.querySelector('[data-action="pause"]').classList.contains('bg-blue')).toBe(true);
        });

        runner.it('should apply toggled (green) class to loop button only when active', () => {
            testContainer.innerHTML = '';
            const view = new PlaybackControlsView(testContainer, {});
            
            view.render({ ...getBaseState(), loopPlayback: true });
            runner.expect(testContainer.querySelector('[data-action="toggle-loop"]').classList.contains('bg-green')).toBe(true);

            view.render({ ...getBaseState(), loopPlayback: false });
            runner.expect(testContainer.querySelector('[data-action="toggle-loop"]').classList.contains('bg-green')).toBe(false);
        });
    });

    runner.describe('PlaybackControlsView Callbacks', () => {
        runner.it('should fire onToggleLoop callback on click', () => {
            testContainer.innerHTML = '';
            const callbackLog = new MockLogger('Callbacks');
            const view = new PlaybackControlsView(testContainer, { onToggleLoop: () => callbackLog.log('onToggleLoop') });
            
            view.render(getBaseState());
            testContainer.querySelector('[data-action="toggle-loop"]').click();
            callbackLog.wasCalledWith('onToggleLoop');
        });
    });

    await runner.runAll();
    runner.renderResults('test-results');
    logEvent('info', 'TestRunner', 'run', 'Teardown', 'PlaybackControlsView test suite finished.');
}