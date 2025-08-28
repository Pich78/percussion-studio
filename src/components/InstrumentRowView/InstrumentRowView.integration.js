// file: src/components/InstrumentRowView/InstrumentRowView.integration.js

import { InstrumentRowView } from './InstrumentRowView.js';
import { InstrumentSelectionModalView } from '/percussion-studio/src/components/InstrumentSelectionModalView/InstrumentSelectionModalView.js';
import { Logger, logEvent } from '/percussion-studio/lib/Logger.js';

// --- INITIALIZATION ---
Logger.init({ level: 'debug' });
Logger.setTarget('log-output');

// --- MOCK DATA & CONFIGURATION ---
const MOCK_METRICS_CONFIG = {
    '4/4 @ 16th': {
        notation: 'o-o-o-o-o-o-o-o-',
        metrics: { beatsPerMeasure: 4, beatUnit: 4, subdivision: 16, grouping: 4, feel: 'duple' },
        densityClass: 'density-medium'
    },
    '6/8 @ 16th': {
        notation: 'o-o-o-o-o-o-',
        metrics: { beatsPerMeasure: 6, beatUnit: 8, subdivision: 16, grouping: 3, feel: 'duple' },
        densityClass: 'density-medium'
    },
    '12/8 @ 8th (Triplet)': {
        notation: 'o--o--o--o--',
        metrics: { beatsPerMeasure: 12, beatUnit: 8, subdivision: 8, grouping: 3, feel: 'triplet' },
        densityClass: 'density-medium'
    },
    '4/4 @ 32nd': {
        notation: 'o-o-o-o-o-o-o-o-o-o-o-o-o-o-o-o-',
        metrics: { beatsPerMeasure: 4, beatUnit: 4, subdivision: 32, grouping: 8, feel: 'duple' },
        densityClass: 'density-high'
    }
};

let mockInstrument = { 
    id: 'kck_1', 
    symbol: 'KCK', 
    name: 'Kick Drum', 
    pack: 'Studio Kit', 
    volume: 0.85, 
    muted: false,
    unmutedVolume: 0.85,
    sounds: [
        { letter: 'o', name: 'Hit', svg: '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="currentColor"/></svg>' }
    ] 
};

// --- FIX: More comprehensive mock data for the selection modal ---
const mockModalData = {
    instrumentDefs: [
        { symbol: 'KCK', name: 'Kick Drum' },
        { symbol: 'SNR', name: 'Snare Drum' }
    ],
    soundPacks: [
        { symbol: 'KCK', pack_name: 'studio_kit', name: 'Studio Kit' },
        { symbol: 'KCK', pack_name: '808_kit', name: '808 Kit' },
        { symbol: 'SNR', pack_name: 'rock_snare', name: 'Rock Snare' },
        { symbol: 'SNR', pack_name: 'jazz_snare', name: 'Jazz Snare' }
    ]
};


// --- DOM REFERENCES & COMPONENT INSTANCES ---
const editorContainer = document.getElementById('editor-row-container');
const playbackContainer = document.getElementById('playback-row-container');
const rhythmSelect = document.getElementById('rhythm-select');
const callbackLogEl = document.getElementById('callback-log');
const modalContainer = document.getElementById('modal-container');

// --- CORE LOGIC ---
const logCallback = (name, data) => {
    const entry = document.createElement('div');
    entry.textContent = `[${name}] Fired with: ${JSON.stringify(data)}`;
    callbackLogEl.prepend(entry);
    logEvent('info', 'Workbench', 'Callback', 'Event', `${name} bubbled up.`, data);
};

// --- FIX: Instantiate the modal with a callback that updates state ---
const modal = new InstrumentSelectionModalView(modalContainer, {
    onInstrumentSelected: (selection) => {
        logCallback('Modal selected', selection);

        const newInstrumentDef = mockModalData.instrumentDefs.find(def => def.symbol === selection.symbol);
        const newSoundPack = mockModalData.soundPacks.find(pack => pack.symbol === selection.symbol && pack.pack_name === selection.packName);

        if (newInstrumentDef && newSoundPack) {
            // Update the central mockInstrument state
            mockInstrument.symbol = newInstrumentDef.symbol;
            mockInstrument.name = newInstrumentDef.name;
            mockInstrument.pack = newSoundPack.name;
            mockInstrument.id = `${selection.symbol.toLowerCase()}_${selection.packName}`;

            // IMPORTANT: Trigger a re-render to show the changes
            rerender();
        } else {
            logEvent('error', 'Workbench', 'onInstrumentSelected', 'State', 'Could not find selected instrument/pack in mock data', selection);
        }
    },
    onCancel: () => logCallback('Modal cancelled', {})
});

const callbacks = {
    onRequestInstrumentChange: (instrument) => {
        logCallback('onRequestInstrumentChange', instrument);
        modal.show(mockModalData);
    },
    onVolumeChange: (id, vol) => {
        logCallback('onVolumeChange', { id, vol });
        mockInstrument.volume = vol;
        mockInstrument.muted = (vol === 0);
        if (vol > 0) {
            mockInstrument.unmutedVolume = vol;
        }
        rerender();
    },
    onToggleMute: (id) => {
        logCallback('onToggleMute', { id });
        mockInstrument.muted = !mockInstrument.muted;
        mockInstrument.volume = mockInstrument.muted ? 0 : mockInstrument.unmutedVolume;
        rerender();
    },
};

const editorRow = new InstrumentRowView(editorContainer, { mode: 'editor', instrument: mockInstrument, callbacks });
const playbackRow = new InstrumentRowView(playbackContainer, { mode: 'playback', instrument: mockInstrument, callbacks });

function rerender() {
    const selectedKey = rhythmSelect.value;
    const config = MOCK_METRICS_CONFIG[selectedKey];
    if (!config) return;

    logEvent('info', 'Workbench', 'rerender', 'State', `Re-rendering with state:`, mockInstrument);
    
    const renderPayload = {
        instrument: mockInstrument,
        notation: config.notation,
        metrics: config.metrics,
        densityClass: config.densityClass
    };
    
    editorRow.render(renderPayload);
    playbackRow.render(renderPayload);
}

// --- SETUP ---
Object.keys(MOCK_METRICS_CONFIG).forEach(key => {
    const option = document.createElement('option');
    option.value = key;
    option.textContent = key;
    rhythmSelect.appendChild(option);
});

rhythmSelect.addEventListener('change', rerender);

// --- INITIAL RENDER ---
rerender();
logEvent('info', 'Workbench', 'init', 'Lifecycle', 'Workbench initialized.');