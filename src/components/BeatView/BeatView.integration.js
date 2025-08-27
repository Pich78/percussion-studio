// file: src/components/BeatView/BeatView.integration.js

import { BeatView } from './BeatView.js';
import { Logger, logEvent } from '/percussion-studio/lib/Logger.js';
// We must also import the dependencies of BeatView's children for the workbench to function.
import '/percussion-studio/src/components/InstrumentRowView/InstrumentRowView.js';

// --- INITIALIZATION ---
Logger.init({ level: 'debug' });
Logger.setTarget('log-output');

// --- DOM REFERENCES & COMPONENT INSTANCES ---
const beatContainer = document.getElementById('beat-container');
const beatNumberInput = document.getElementById('beat-number');
const modeSelect = document.getElementById('mode-select');
const instrumentCountInput = document.getElementById('instrument-count');
const callbackLogEl = document.getElementById('callback-log');

// --- MOCK DATA ---
const mockInstruments = [
    { id: 'kck_1', name: 'Kick', pack: 'Studio Kick', pattern: 'o---', volume: 1.0, muted: false },
    { id: 'snr_1', name: 'Snare', pack: 'Rock Snare', pattern: '-o--', volume: 0.8, muted: false },
    { id: 'hhc_1', name: 'Hi-Hat', pack: 'Acoustic Hats', pattern: 'x-x-', volume: 0.6, muted: true },
    { id: 'tom_1', name: 'Tom 1', pack: 'Floor Tom', pattern: '----', volume: 0.9, muted: false },
    { id: 'cr_1', name: 'Crash', pack: 'Acoustic Crash', pattern: 's---', volume: 0.7, muted: false },
];

const mockMetrics = {
    beatsPerMeasure: 4,
    beatUnit: 4,
    subdivision: 16,
    grouping: 4,
};

// --- CORE LOGIC ---
const logCallback = (name, data) => {
    const entry = document.createElement('div');
    entry.textContent = `[${name}] Fired with: ${JSON.stringify(data)}`;
    callbackLogEl.prepend(entry);
    logEvent('info', 'Workbench', 'Callback', 'Event', `${name} bubbled up.`, data);
};

// Instantiate the BeatView with a set of callbacks that log when fired.
const beatView = new BeatView(beatContainer, {
    onRequestInstrumentChange: (instrument) => logCallback('onRequestInstrumentChange', instrument),
    onVolumeChange: (id, vol) => logCallback('onVolumeChange', { id, vol }),
    onToggleMute: (id) => logCallback('onToggleMute', { id }),
    // Grid callbacks can be added here if needed for testing
});

function rerender() {
    const beatNumber = parseInt(beatNumberInput.value, 10);
    const mode = modeSelect.value;
    const instrumentCount = parseInt(instrumentCountInput.value, 10);

    const instrumentsForBeat = mockInstruments.slice(0, instrumentCount);

    logEvent('info', 'Workbench', 'rerender', 'Props', 'Rendering BeatView with new props:', { beatNumber, mode, instrumentCount });

    beatView.render({
        beatNumber,
        instruments: instrumentsForBeat,
        metrics: mockMetrics,
        mode
    });
}

// --- UI EVENT BINDINGS ---
[beatNumberInput, modeSelect, instrumentCountInput].forEach(el => el.addEventListener('change', rerender));

// --- INITIAL RENDER ---
rerender();
logEvent('info', 'Workbench', 'init', 'Lifecycle', 'Workbench initialized and rendered.');