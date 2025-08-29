// file: src/components/MeasureLayoutView/MeasureLayoutView.integration.js

import { MeasureLayoutView } from './MeasureLayoutView.js';
import { Logger, logEvent } from '/percussion-studio/lib/Logger.js';

// --- INITIALIZATION ---
Logger.init({ level: 'debug' });
Logger.setTarget('log-output');

// --- MOCK DATA & CONFIGURATION ---
const MOCK_LAYOUTS = {
    "4/4 @ 16th (1 Line)": {
        groupingPattern: [16],
        metrics: { beatsPerMeasure: 4, beatUnit: 4, subdivision: 16, beatGrouping: 4, feel: 'duple' },
        notationLength: 16,
    },
    "12/8 @ 16th (2 Lines)": {
        groupingPattern: [12, 12],
        metrics: { beatsPerMeasure: 12, beatUnit: 8, subdivision: 16, beatGrouping: 3, feel: 'triplet' },
        notationLength: 24,
    },
    "7/4 @ 32nd (Asymmetrical)": {
        groupingPattern: [32, 24],
        metrics: { beatsPerMeasure: 7, beatUnit: 4, subdivision: 32, beatGrouping: 8, feel: 'duple' },
        notationLength: 56,
    },
};

const mockInstruments = [
    { id: 'kck_1', name: 'Kick', pack: 'Studio Kick', volume: 1.0, muted: false, sounds: [{letter: 'o', svg: '<svg></svg>'}]},
    { id: 'snr_1', name: 'Snare', pack: 'Rock Snare', volume: 0.8, muted: false, sounds: [{letter: 'o', svg: '<svg></svg>'}] },
    { id: 'hhc_1', name: 'Hi-Hat', pack: 'Acoustic', volume: 0.6, muted: true, sounds: [{letter: 'o', svg: '<svg></svg>'}] },
];

// --- DOM REFERENCES ---
const layoutContainer = document.getElementById('layout-container');
const layoutSelect = document.getElementById('layout-select');
const modeSelect = document.getElementById('mode-select');
const playheadSlider = document.getElementById('playhead-slider');
const playheadValueEl = document.getElementById('playhead-value');

// --- COMPONENT INSTANCE ---
// Callbacks can be empty for this dumb component, as we only care about its rendering.
const measureLayoutView = new MeasureLayoutView(layoutContainer, {});

// --- CORE LOGIC ---
function generatePattern(char, length) {
    let pattern = '';
    for (let i = 0; i < length; i++) {
        pattern += (i % 4 === 0) ? char : '-';
    }
    return pattern;
}

function rerender() {
    const layoutKey = layoutSelect.value;
    const config = MOCK_LAYOUTS[layoutKey];
    const mode = modeSelect.value;
    const activeTick = parseInt(playheadSlider.value, 10);
    
    if (!config) return;

    // Update slider for the new layout
    playheadSlider.max = config.notationLength -1;
    if (activeTick >= config.notationLength) {
        playheadSlider.value = -1;
        playheadValueEl.textContent = '-1';
    } else {
        playheadValueEl.textContent = activeTick;
    }

    // Prepare instrument data with correct notation length
    const instrumentsWithNotation = mockInstruments.map((inst, i) => ({
        ...inst,
        pattern: generatePattern(i === 0 ? 'o' : 'x', config.notationLength)
    }));
    
    const props = {
        groupingPattern: config.groupingPattern,
        metrics: config.metrics,
        instruments: instrumentsWithNotation,
        mode: mode,
        activeTick: activeTick
    };
    
    logEvent('info', 'Workbench', 'rerender', 'Props', 'Rendering with props:', props);
    measureLayoutView.render(props);
}

// --- UI EVENT BINDINGS ---
Object.keys(MOCK_LAYOUTS).forEach(key => {
    const option = document.createElement('option');
    option.value = key;
    option.textContent = key;
    layoutSelect.appendChild(option);
});

layoutSelect.addEventListener('change', () => {
    // Reset slider when layout changes, then re-render
    playheadSlider.value = -1;
    playheadValueEl.textContent = "-1";
    rerender();
});
modeSelect.addEventListener('change', rerender);
playheadSlider.addEventListener('input', () => {
    // A full re-render is needed to pass the activeTick prop
    rerender();
});
// Use 'input' for live updates, but if performance is an issue, 'change' is better.
playheadSlider.addEventListener('input', () => {
    const tick = playheadSlider.value;
    playheadValueEl.textContent = tick;
    // For this component, we can call the more efficient update method directly
    // instead of a full re-render.
    measureLayoutView.updatePlaybackIndicator(parseInt(tick, 10));
});


// --- INITIAL RENDER ---
rerender();
logEvent('info', 'Workbench', 'init', 'Lifecycle', 'Workbench initialized.');