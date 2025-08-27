// file: src/components/PlaybackRowHeaderView/PlaybackRowHeaderView.integration.js

import { PlaybackRowHeaderView } from './PlaybackRowHeaderView.js';
import { Logger, logEvent } from '/percussion-studio/lib/Logger.js';

// --- INITIALIZATION ---
Logger.init({ level: 'debug' });
Logger.setTarget('log-output');

// --- APPLICATION STATE ---
const appState = {
    mixer: {
        'kick_1': { name: 'Kick', volume: 1.0, muted: false, unmutedVolume: 1.0 },
        'snare_1': { name: 'Snare', volume: 0.8, muted: false, unmutedVolume: 0.8 },
        'hihat_1': { name: 'Hi-Hat', volume: 0.6, muted: true, unmutedVolume: 0.6 },
    }
};

const viewInstances = new Map();
const viewContainer = document.getElementById('view-container');
const callbackLogEl = document.getElementById('callback-log');

// --- CORE LOGIC ---
const logCallback = (name, data) => {
    const entry = document.createElement('div');
    const time = new Date().toLocaleTimeString();
    entry.textContent = `[${time}] [${name}] Fired with: ${JSON.stringify(data)}`;
    callbackLogEl.prepend(entry);
    logEvent('info', 'Workbench', 'Callback', 'Event', `${name} bubbled up.`, data);
};

const rerenderSingleInstance = (id) => {
    const view = viewInstances.get(id);
    const trackState = appState.mixer[id];
    if (view && trackState) {
        view.render({
            id: id,
            name: trackState.name,
            volume: trackState.volume,
            muted: trackState.muted,
        });
    }
};

const handleVolumeChange = (id, vol) => {
    logCallback('onVolumeChange', { id, vol });
    const trackState = appState.mixer[id];
    if (trackState) {
        trackState.volume = vol;
        trackState.muted = (vol === 0);
        if (vol > 0) trackState.unmutedVolume = vol;
        rerenderSingleInstance(id);
    }
};

const handleToggleMute = (id) => {
    logCallback('onToggleMute', { id });
    const trackState = appState.mixer[id];
    if (trackState) {
        trackState.muted = !trackState.muted;
        trackState.volume = trackState.muted ? 0 : trackState.unmutedVolume;
        rerenderSingleInstance(id);
    }
};

// --- SETUP ---
for (const [id, trackState] of Object.entries(appState.mixer)) {
    // Create a host div for each component instance
    const hostEl = document.createElement('div');
    hostEl.style.height = '60px'; // Simulate the row height
    viewContainer.appendChild(hostEl);

    const view = new PlaybackRowHeaderView(hostEl, {
        onVolumeChange: handleVolumeChange,
        onToggleMute: handleToggleMute,
    });

    view.render({
        id: id,
        name: trackState.name,
        volume: trackState.volume,
        muted: trackState.muted,
    });
    
    viewInstances.set(id, view);
}

logEvent('info', 'Workbench', 'init', 'Lifecycle', 'Workbench initialized with 3 instances.');