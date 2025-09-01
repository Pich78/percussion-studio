// file: src/components/MeasureEditorView/MeasureEditorView.integration.js

import { MeasureEditorView } from './MeasureEditorView.js';
import { Logger, logEvent } from '/percussion-studio/lib/Logger.js';
import { InstrumentSelectionModalView } from '/percussion-studio/src/components/InstrumentSelectionModalView/InstrumentSelectionModalView.js';

// --- INITIALIZATION ---
Logger.init({ level: 'debug' });
Logger.setTarget('log-output');

// --- MOCK DATA ---
const mockSoundPacks = [
    { symbol: 'KCK', pack_name: 'studio-kick', name: 'Studio Kick', sounds:[] },
    { symbol: 'SNR', pack_name: 'rock-snare', name: 'Rock Snare', sounds:[] },
    { symbol: 'HHC', pack_name: 'acoustic-hats', name: 'Acoustic Hats', sounds:[] },
];

const initialInstruments = [
    { id: 'track-1', symbol: 'KCK', name: 'Kick Drum', pack: 'Studio Kick', pattern: '-'.repeat(64), sounds:[] },
    { id: 'track-2', symbol: 'SNR', name: 'Snare Drum', pack: 'Rock Snare', pattern: '-'.repeat(64), sounds:[] },
];

// --- DOM REFERENCES & INSTANCES ---
const editorContainer = document.getElementById('measure-editor-container');
const modalContainer = document.getElementById('modal-container');
const callbackLogEl = document.getElementById('callback-log');
let measureEditor = null; // To hold the component instance

// --- HELPER ---
const logCallback = (name, data) => {
    const entry = document.createElement('div');
    entry.textContent = `[${name}] Fired with: ${JSON.stringify(data)}`;
    callbackLogEl.prepend(entry);
};

// --- MODAL & CALLBACKS ---
const modal = new InstrumentSelectionModalView(modalContainer, {
    onInstrumentSelected: (selection) => {
        logCallback('onInstrumentSelected', selection);
        measureEditor.addInstrument(selection);
    },
    onCancel: () => logCallback('onCancel', {})
});

const callbacks = {
    onRequestAddInstrument: () => {
        logCallback('onRequestAddInstrument', {});
        modal.show({ soundPacks: mockSoundPacks });
    },
    onMetricsChange: (metrics) => {
        logCallback('onMetricsChange', metrics);
    }
    // Other callbacks like onCellMouseDown would be wired up here in a real app
};

// --- RENDER ---
logEvent('info', 'Workbench', 'init', 'Lifecycle', 'Initializing MeasureEditorView workbench.');

measureEditor = new MeasureEditorView(editorContainer, {
    soundPacks: mockSoundPacks,
    callbacks: callbacks,
    initialInstruments: initialInstruments
});