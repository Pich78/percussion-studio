// file: src/components/InstrumentSelectionModalView/InstrumentSelectionModalView.integration.js

import { InstrumentSelectionModalView } from './InstrumentSelectionModalView.js';
import { Logger, logEvent } from '/percussion-studio/lib/Logger.js';

// --- INITIALIZATION ---
Logger.init({ level: 'debug' });
Logger.setTarget('log-output');

// --- MOCK DATA (simulates data from a manifest file) ---
const mockData = {
    instrumentDefs: [
        { symbol: 'KCK', name: 'Kick Drum' },
        { symbol: 'SNR', name: 'Snare Drum' },
        { symbol: 'HHC', name: 'Hi-Hat' },
        { symbol: 'TOM', name: 'Tom' },
    ],
    soundPacks: [
        { symbol: 'KCK', pack_name: 'acoustic_kick', name: 'Acoustic Kick' },
        { symbol: 'KCK', pack_name: '808_kick', name: '808 Kick' },
        { symbol: 'SNR', pack_name: 'rock_snare', name: 'Rock Snare' },
        { symbol: 'SNR', pack_name: 'jazz_snare', name: 'Jazz Snare (Brushes)' },
        { symbol: 'SNR', pack_name: 'marching_snare', name: 'Marching Snare' },
        { symbol: 'HHC', pack_name: 'acoustic_hats', name: 'Acoustic Hats' },
    ]
};

// --- DOM REFERENCES & COMPONENT INSTANCE ---
const modalContainer = document.getElementById('modal-container');
const showBtn = document.getElementById('show-modal-btn');
const resultEl = document.getElementById('selection-result');

const view = new InstrumentSelectionModalView(modalContainer, {
    onInstrumentSelected: (selection) => {
        logEvent('info', 'Workbench', 'onInstrumentSelected', 'Callback', 'Instrument selected:', selection);
        resultEl.textContent = `SUCCESS: Selected ${JSON.stringify(selection)}`;
    },
    onCancel: () => {
        logEvent('info', 'Workbench', 'onCancel', 'Callback', 'Modal was cancelled.');
        resultEl.textContent = 'CANCELLED: Selection was cancelled.';
    }
});

// --- UI EVENT BINDINGS ---
showBtn.addEventListener('click', () => {
    logEvent('info', 'Workbench', 'showModal', 'UI', 'Requesting to show modal.');
    resultEl.textContent = 'Modal is open. Make a selection or cancel.';
    view.show(mockData);
});

logEvent('info', 'Workbench', 'init', 'Lifecycle', 'Workbench initialized.');