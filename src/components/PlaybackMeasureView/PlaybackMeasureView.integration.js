// file: src/components/PlaybackMeasureView/PlaybackMeasureView.integration.js

import { PlaybackMeasureView } from './PlaybackMeasureView.js';
import { Logger, logEvent } from '/percussion-studio/lib/Logger.js';

// --- INITIALIZATION ---
Logger.init({ level: 'debug' });
Logger.setTarget('log-output');

// --- MOCK SAVED DATA ---
// This simulates the data that would be retrieved from a saved pattern file.
const mockSavedMeasures = {
    "4/4 @ 16th": {
        timeSignature: '4/4',
        subdivision: '16',
        groupingPattern: [16], // Decided by editor
        instruments: [
            { id: 'k1', name: 'Kick', pattern: 'o---o---o---o---', sounds:[] },
            { id: 's1', name: 'Snare', pattern: '----o-------o---', sounds:[] },
        ]
    },
    "12/8 @ 16th": {
        timeSignature: '12/8',
        subdivision: '16',
        groupingPattern: [12, 12], // Decided by editor
        instruments: [
            { id: 'k1', name: 'Kick', pattern: 'o--o--o--o--'.repeat(2), sounds:[] },
            { id: 'h1', name: 'Hi-Hat', pattern: 'x-xx-xx-xx-x'.repeat(2), sounds:[] },
        ]
    },
};

// --- DOM REFERENCES ---
const measureContainer = document.getElementById('measure-container');
const measureSelect = document.getElementById('measure-select');
const playheadSlider = document.getElementById('playhead-slider');
const playheadValueEl = document.getElementById('playhead-value');

// --- COMPONENT INSTANCE ---
const measureView = new PlaybackMeasureView(measureContainer, {});

// --- CORE LOGIC ---
function rerender() {
    const selectedKey = measureSelect.value;
    const measureData = mockSavedMeasures[selectedKey];
    if (!measureData) return;

    logEvent('info', 'Workbench', 'rerender', 'State', `Rendering measure: '${selectedKey}'`);
    measureView.render(measureData);
    
    // Update slider based on measure length
    const totalTicks = measureData.groupingPattern.reduce((sum, val) => sum + val, 0);
    playheadSlider.max = totalTicks - 1;
    playheadSlider.value = -1;
    playheadValueEl.textContent = '-1';
    measureView.updatePlaybackIndicator(-1, false);
}

// --- UI EVENT BINDINGS ---
Object.keys(mockSavedMeasures).forEach(key => {
    const option = document.createElement('option');
    option.value = key;
    option.textContent = key;
    measureSelect.appendChild(option);
});

measureSelect.addEventListener('change', rerender);

playheadSlider.addEventListener('input', (event) => {
    const tick = parseInt(event.target.value, 10);
    playheadValueEl.textContent = tick;
    measureView.updatePlaybackIndicator(tick, tick > -1);
});

// --- INITIAL RENDER ---
rerender();
logEvent('info', 'Workbench', 'init', 'Lifecycle', 'Workbench initialized.');