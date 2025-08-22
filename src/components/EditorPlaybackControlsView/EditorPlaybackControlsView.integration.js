// file: src/components/EditorPlaybackControlsView/EditorPlaybackControlsView.integration.js
import { EditorPlaybackControlsView } from './EditorPlaybackControlsView.js';
import { Logger, logEvent } from '/percussion-studio/lib/Logger.js';
function handleTransport({ action }) {
logEvent('info', 'Controller', 'handleTransport', 'Callback', 'Transport action received: ${action}');
}
function handleSettingsChange(settings) {
logEvent('info', 'Controller', 'handleSettingsChange', 'Callback', 'Settings changed, settings');
}
document.addEventListener('DOMContentLoaded', () => {
Logger.init({ level: 'debug' });
Logger.setTarget('log-output');
const container = document.getElementById('playback-controls-container');
let playbackControls = null;

try {
    playbackControls = new EditorPlaybackControlsView(container, {
        onTransport: handleTransport,
        onSettingsChange: handleSettingsChange,
        initialDisplayText: "No Pattern Loaded"
    });
    logEvent('info', 'IntegrationTest', 'DOMContentLoaded', 'App', 'EditorPlaybackControlsView component initialized successfully.');
} catch (error) {
    logEvent('error', 'IntegrationTest', 'DOMContentLoaded', 'App', `Failed to initialize component: ${error.message}`);
}

document.getElementById('update-text-btn-1').addEventListener('click', () => {
    if (playbackControls) {
        playbackControls.updateDisplayText("My Cool Beat");
    }
});

document.getElementById('update-text-btn-2').addEventListener('click', () => {
    if (playbackControls) {
        playbackControls.updateDisplayText("Another Pattern Name");
    }
});
});