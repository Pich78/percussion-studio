// file: src/components/BeatChunkPanel/BeatChunkPanel.integration.js

import { BeatChunkPanel } from './BeatChunkPanel.js';
import { Logger, logEvent } from '/percussion-studio/lib/Logger.js';
import { EditorRowHeaderView } from '/percussion-studio/src/components/EditorRowHeaderView/EditorRowHeaderView.js';
import { PlaybackRowHeaderView } from '/percussion-studio/src/components/PlaybackRowHeaderView/PlaybackRowHeaderView.js';

// --- INITIALIZATION ---
Logger.init({ level: 'debug' });
Logger.setTarget('log-output');

// --- MOCK DATA & STATE ---
let mockState = {
    metrics: { beatGrouping: 4, feel: 'duple' },
    instruments: [
        { id: 'kck_1', name: 'Kick', pack: 'Studio Kick', pattern: 'o---'.repeat(4), volume: 1.0, muted: false, unmutedVolume: 1.0, sounds:[] },
        { id: 'snr_1', name: 'Snare', pack: 'Rock Snare', pattern: '----o---'.repeat(2), volume: 0.8, muted: false, unmutedVolume: 0.8, sounds:[] },
        { id: 'hhc_1', name: 'Hi-Hat', pack: 'Acoustic', pattern: 'x-x-'.repeat(4), volume: 0.6, muted: true, unmutedVolume: 0.6, sounds:[] },
        { id: 'tom_1', name: 'Tom 1', pack: 'Floor Tom', pattern: '------------o---', volume: 0.9, muted: false, unmutedVolume: 0.9, sounds:[] },
        { id: 'cr_1', name: 'Crash', pack: 'Acoustic', pattern: 's---------------', volume: 0.7, muted: false, unmutedVolume: 0.7, sounds:[] },
    ]
};

// --- DOM REFERENCES ---
const panelContainer = document.getElementById('panel-container');
const modeSelect = document.getElementById('mode-select');
const instrumentCountInput = document.getElementById('instrument-count');

// --- CALLBACKS & STATE MANAGEMENT ---
const callbacks = {
    onVolumeChange: (id, vol) => {
        const instrument = mockState.instruments.find(i => i.id === id);
        if (instrument) {
            instrument.volume = vol;
            instrument.muted = (vol === 0);
            if (vol > 0) instrument.unmutedVolume = vol;
            // Granular update: only re-render the one instrument that changed
            beatChunkPanel.updateInstrument(instrument);
        }
    },
    onToggleMute: (id) => {
        const instrument = mockState.instruments.find(i => i.id === id);
        if (instrument) {
            instrument.muted = !instrument.muted;
            instrument.volume = instrument.muted ? 0 : instrument.unmutedVolume;
            // Granular update
            beatChunkPanel.updateInstrument(instrument);
        }
    },
    onRequestInstrumentChange: (instrument) => {
        window.alert(`Request to change ${instrument.name}.`);
    }
};

// --- COMPONENT INSTANCE ---
const beatChunkPanel = new BeatChunkPanel(panelContainer, callbacks);

// --- CORE LOGIC ---
function rerender() {
    const mode = modeSelect.value;
    const instrumentCount = parseInt(instrumentCountInput.value, 10);
    const HeaderComponentToInject = (mode === 'editor') ? EditorRowHeaderView : PlaybackRowHeaderView;
    
    logEvent('info', 'Workbench', 'rerender', 'FullRender', `Performing full re-render for mode: ${mode}`);

    const instrumentsForPanel = mockState.instruments.slice(0, instrumentCount);
    
    beatChunkPanel.render({
        beatNumber: 1,
        boxesInChunk: 16,
        instruments: instrumentsForPanel,
        metrics: mockState.metrics,
        HeaderComponent: HeaderComponentToInject
    });
}

// --- UI EVENT BINDINGS ---
[modeSelect, instrumentCountInput].forEach(el => el.addEventListener('change', rerender));

// --- INITIAL RENDER ---
rerender();
logEvent('info', 'Workbench', 'init', 'Lifecycle', 'Workbench initialized.');