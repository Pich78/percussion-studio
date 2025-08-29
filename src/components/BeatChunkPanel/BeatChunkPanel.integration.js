// file: src/components/BeatChunkPanel/BeatChunkPanel.integration.js

import { BeatChunkPanel } from './BeatChunkPanel.js';
import { Logger, logEvent } from '/percussion-studio/lib/Logger.js';

// Import all real dependencies that the panel will instantiate
import { EditorRowHeaderView } from '/percussion-studio/src/components/EditorRowHeaderView/EditorRowHeaderView.js';
import { PlaybackRowHeaderView } from '/percussion-studio/src/components/PlaybackRowHeaderView/PlaybackRowHeaderView.js';

// --- INITIALIZATION ---
Logger.init({ level: 'debug' });
Logger.setTarget('log-output');

// --- MOCK DATA ---
const mockInstruments = [
    { id: 'kck_1', name: 'Kick', pack: 'Studio Kick', pattern: 'o---o---o---o---', sounds:[] },
    { id: 'snr_1', name: 'Snare', pack: 'Rock Snare', pattern: '----o-------o---', sounds:[] },
    { id: 'hhc_1', name: 'Hi-Hat', pack: 'Acoustic Hats', pattern: 'x-x-x-x-x-x-x-x-', sounds:[] },
    { id: 'tom_1', name: 'Tom 1', pack: 'Floor Tom', pattern: '------------o---', sounds:[] },
    { id: 'cr_1', name: 'Crash', pack: 'Acoustic Crash', pattern: 's---------------', sounds:[] },
];

const mockMetrics = {
    beatsPerMeasure: 4, beatUnit: 4, subdivision: 16, 
    beatGrouping: 4, feel: 'duple'
};

// --- DOM REFERENCES ---
const panelContainer = document.getElementById('panel-container');
const modeSelect = document.getElementById('mode-select');
const instrumentCountInput = document.getElementById('instrument-count');

// --- COMPONENT INSTANCE ---
const beatChunkPanel = new BeatChunkPanel(panelContainer, {});

// --- CORE LOGIC ---
function rerender() {
    const mode = modeSelect.value;
    const instrumentCount = parseInt(instrumentCountInput.value, 10);

    // --- The Core of Dependency Injection ---
    // The workbench, acting as the "smart parent", decides which component class to inject.
    const HeaderComponentToInject = (mode === 'editor') ? EditorRowHeaderView : PlaybackRowHeaderView;
    
    logEvent('info', 'Workbench', 'rerender', 'DependencyInjection', `Injecting '${HeaderComponentToInject.name}' into the panel.`);

    const instrumentsForPanel = mockInstruments.slice(0, instrumentCount);
    
    beatChunkPanel.render({
        beatNumber: 1,
        boxesInChunk: 16,
        instruments: instrumentsForPanel,
        metrics: mockMetrics,
        HeaderComponent: HeaderComponentToInject
    });
}

// --- UI EVENT BINDINGS ---
[modeSelect, instrumentCountInput].forEach(el => el.addEventListener('change', rerender));

// --- INITIAL RENDER ---
rerender();
logEvent('info', 'Workbench', 'init', 'Lifecycle', 'Workbench initialized.');