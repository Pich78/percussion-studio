// file: src/components/MeasureLayoutView/MeasureLayoutView.integration.js

import { MeasureLayoutView } from './MeasureLayoutView.js';
import { Logger, logEvent } from '/percussion-studio/lib/Logger.js';
import { EditorRowHeaderView } from '/percussion-studio/src/components/EditorRowHeaderView/EditorRowHeaderView.js';
import { PlaybackRowHeaderView } from '/percussion-studio/src/components/PlaybackRowHeaderView/PlaybackRowHeaderView.js';

// --- INITIALIZATION ---
Logger.init({ level: 'debug' });
Logger.setTarget('log-output');

// --- MOCK DATA & CONFIGURATION ---
const MOCK_LAYOUTS = {
    "4/4 @ 16th (1 Line)": {
        groupingPattern: [16],
        metrics: { beatGrouping: 4, feel: 'duple' },
        notationLength: 16,
    },
    "12/8 @ 16th (2 Lines)": {
        groupingPattern: [12, 12],
        metrics: { beatGrouping: 3, feel: 'triplet' },
        notationLength: 24,
    },
    "7/4 @ 32nd (Asymmetrical)": {
        groupingPattern: [32, 24],
        metrics: { beatGrouping: 8, feel: 'duple' },
        notationLength: 56,
    },
};

const mockInstruments = [
    { id: 'k1', symbol: 'KCK', name: 'Kick', pack:'K', pattern:'', sounds:[]},
    { id: 's1', symbol: 'SNR', name: 'Snare', pack:'S', pattern:'', sounds:[]},
];

// --- DOM REFERENCES & INSTANCE ---
const layoutContainer = document.getElementById('layout-container');
const layoutSelect = document.getElementById('layout-select');
const modeSelect = document.getElementById('mode-select');
const playheadSlider = document.getElementById('playhead-slider');
const playheadValueEl = document.getElementById('playhead-value');
const measureLayoutView = new MeasureLayoutView(layoutContainer, {});

// --- CORE LOGIC ---
function rerender() {
    const layoutKey = layoutSelect.value;
    const config = MOCK_LAYOUTS[layoutKey];
    const mode = modeSelect.value;
    if (!config) return;

    // The core of dependency injection: select the class to inject
    const HeaderComponent = (mode === 'editor') ? EditorRowHeaderView : PlaybackRowHeaderView;

    const instrumentsWithNotation = mockInstruments.map((inst, i) => ({
        ...inst,
        pattern: '-'.repeat(config.notationLength)
    }));
    
    const props = {
        groupingPattern: config.groupingPattern,
        metrics: { ...config.metrics, groupingPattern: config.groupingPattern },
        instruments: instrumentsWithNotation,
        HeaderComponent: HeaderComponent
    };
    
    logEvent('info', 'Workbench', 'rerender', 'Props', `Rendering with injected '${HeaderComponent.name}'`);
    measureLayoutView.render(props);
    
    // Update slider properties and reset playhead after a full re-render
    playheadSlider.max = config.notationLength - 1;
    playheadSlider.value = -1;
    playheadValueEl.textContent = '-1';
    measureLayoutView.updatePlaybackIndicator(-1);
}

function handleSliderInput() {
    const activeTick = parseInt(playheadSlider.value, 10);
    playheadValueEl.textContent = activeTick;
    measureLayoutView.updatePlaybackIndicator(activeTick);
}


// --- UI EVENT BINDINGS ---
Object.keys(MOCK_LAYOUTS).forEach(key => {
    const option = document.createElement('option');
    option.value = key;
    option.textContent = key;
    layoutSelect.appendChild(option);
});

layoutSelect.addEventListener('change', rerender);
modeSelect.addEventListener('change', rerender);
playheadSlider.addEventListener('input', handleSliderInput);


// --- INITIAL RENDER ---
rerender();
logEvent('info', 'Workbench', 'init', 'Lifecycle', 'Workbench initialized.');