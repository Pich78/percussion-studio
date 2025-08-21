// file: src/components/PlaybackControlsView/PlaybackControlsView.integration.js
import { Logger, logEvent } from '/percussion-studio/lib/Logger.js';
import { PlaybackControlsView } from './PlaybackControlsView.js';
function manualTest() {
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
    logEvent('info', 'Harness', 'rerender', 'State', 'Rerendering with new state:', currentState);
    view.render(currentState);
    stateDisplay.textContent = `Current State: ${JSON.stringify(currentState)}`;
};

const view = new PlaybackControlsView(container, {
    onPlay: () => { currentState.isPlaying = true; rerender(); },
    onPause: () => { currentState.isPlaying = false; rerender(); },
    onStop: () => { currentState.isPlaying = false; rerender(); },
    onBPMChange: (bpm) => { currentState.globalBPM = bpm; rerender(); },
    onMasterVolumeChange: (vol) => { currentState.masterVolume = vol; rerender(); },
    onToggleLoop: () => { currentState.loopPlayback = !currentState.loopPlayback; rerender(); }
});

document.getElementById('is-playing-check').addEventListener('change', rerender);
document.getElementById('is-loading-check').addEventListener('change', rerender);
document.getElementById('loop-check').addEventListener('change', rerender);

rerender();
}
Logger.init({ level: 'debug' });
Logger.setTarget('log-output');
manualTest();