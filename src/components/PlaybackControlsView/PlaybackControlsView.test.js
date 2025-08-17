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

    runner.describe('PlaybackControlsView Rendering', () => {
        runner.it('should disable Pause and Stop when stopped', () => {
            testContainer.innerHTML = '';
            const view = new PlaybackControlsView(testContainer, {});
            view.render(getBaseState());
            runner.expect(testContainer.querySelector('[data-action="play"]').disabled).toBe(false);
            runner.expect(testContainer.querySelector('[data-action="pause"]').disabled).toBe(true);
            runner.expect(testContainer.querySelector('[data-action="stop"]').disabled).toBe(true);
        });

        runner.it('should disable Play and BPM slider when playing', () => {
            testContainer.innerHTML = '';
            const view = new PlaybackControlsView(testContainer, {});
            view.render({ ...getBaseState(), isPlaying: true });
            runner.expect(testContainer.querySelector('[data-action="play"]').disabled).toBe(true);
            runner.expect(testContainer.querySelector('#bpm-slider').disabled).toBe(true);
            runner.expect(testContainer.querySelector('[data-action="pause"]').disabled).toBe(false);
        });
    });

    runner.describe('PlaybackControlsView Callbacks', () => {
        runner.it('should fire onPlay callback', () => {
            testContainer.innerHTML = '';
            const callbackLog = new MockLogger('Callbacks');
            const view = new PlaybackControlsView(testContainer, { onPlay: () => callbackLog.log('onPlay') });
            view.render(getBaseState());
            testContainer.querySelector('[data-action="play"]').click();
            callbackLog.wasCalledWith('onPlay');
        });

        runner.it('should fire onToggleLoop with the new desired state', () => {
            testContainer.innerHTML = '';
            const callbackLog = new MockLogger('Callbacks');
            const view = new PlaybackControlsView(testContainer, { onToggleLoop: (enabled) => callbackLog.log('onToggleLoop', {enabled}) });
            
            view.render({ ...getBaseState(), loopPlayback: false });
            testContainer.querySelector('[data-action="toggle-loop"]').click();
            callbackLog.wasCalledWith('onToggleLoop', {enabled: true});
        });
    });

    await runner.runAll();
    runner.renderResults('test-results');
    logEvent('info', 'TestRunner', 'run', 'Teardown', 'PlaybackControlsView test suite finished.');
}

export function manualTest() {
    logEvent('info', 'Harness', 'manualTest', 'Setup', 'Setting up stateful manual test.');
    
    let currentState = {
        isPlaying: false, isLoading: false, masterVolume: 0.8, loopPlayback: false, globalBPM: 120
    };

    const container = document.getElementById('view-container');
    const stateDisplay = document.getElementById('current-state-display');

    const rerender = () => {
        currentState.isPlaying = document.getElementById('is-playing-check').checked;
        currentState.isLoading = document.getElementById('is-loading-check').checked;
        currentState.loopPlayback = document.getElementById('loop-check').checked;
        logEvent('info', 'Harness', 'rerender', 'State', 'Rerendering component with new state:', currentState);
        view.render(currentState);
        stateDisplay.textContent = `Current State: ${JSON.stringify(currentState)}`;
    };

    const view = new PlaybackControlsView(container, {
        onPlay: () => { logEvent('info', 'Harness', 'onPlay', 'Callback', 'Play clicked.'); currentState.isPlaying = true; rerender(); },
        onPause: () => { logEvent('info', 'Harness', 'onPause', 'Callback', 'Pause clicked.'); currentState.isPlaying = false; rerender(); },
        onStop: () => { logEvent('info', 'Harness', 'onStop', 'Callback', 'Stop clicked.'); currentState.isPlaying = false; rerender(); },
        onBPMChange: (bpm) => { currentState.globalBPM = bpm; rerender(); },
        onMasterVolumeChange: (vol) => { currentState.masterVolume = vol; },
        onToggleLoop: (enabled) => { currentState.loopPlayback = enabled; rerender(); }
    });
    
    document.getElementById('is-playing-check').addEventListener('change', rerender);
    document.getElementById('is-loading-check').addEventListener('change', rerender);
    document.getElementById('loop-check').addEventListener('change', rerender);

    rerender();
}