// file: src/components/InstrumentRowView/InstrumentRowView.integration.js

import { BeatChunkPanel } from '/percussion-studio/src/components/BeatChunkPanel/BeatChunkPanel.js';
import { EditorRowHeaderView } from '/percussion-studio/src/components/EditorRowHeaderView/EditorRowHeaderView.js';
import { PlaybackRowHeaderView } from '/percussion-studio/src/components/PlaybackRowHeaderView/PlaybackRowHeaderView.js';
import { InstrumentSelectionModalView } from '/percussion-studio/src/components/InstrumentSelectionModalView/InstrumentSelectionModalView.js';
import { Logger, logEvent } from '/percussion-studio/lib/Logger.js';

// --- INITIALIZATION ---
Logger.init({ level: 'debug' });
Logger.setTarget('log-output');

// --- MOCK DATA & STATE ---
// This is now the central, mutable state for our workbench "application"
let mockState = {
    metrics: { beatsPerMeasure: 4, beatUnit: 4, subdivision: 16, beatGrouping: 4, feel: 'duple' },
    instruments: [
        { id: 'kck_1', symbol: 'KCK', name: 'Kick', pack: 'Studio Kick', pattern: 'o---o---o---o---', sounds:[{letter:'o',svg:'<svg/>'}], volume: 0.8, muted: false, unmutedVolume: 0.8 },
        { id: 'snr_1', symbol: 'SNR', name: 'Snare', pack: 'Rock Snare', pattern: '----o-------o---', sounds:[{letter:'o',svg:'<svg/>'}], volume: 0.6, muted: false, unmutedVolume: 0.6 },
    ],
    // Data for the modal
    manifest: {
        instrumentDefs: [{ symbol: 'KCK', name: 'Kick' }, { symbol: 'SNR', name: 'Snare' }],
        soundPacks: [{ symbol: 'SNR', pack_name: 'jazz_snare', name: 'Jazz Snare' }]
    }
};

// --- DOM REFERENCES ---
const editorContainer = document.getElementById('editor-panel-container');
const playbackContainer = document.getElementById('playback-panel-container');
const modalContainer = document.getElementById('modal-container');
const callbackLogEl = document.getElementById('callback-log');

// --- CORE LOGIC & CALLBACKS ---
const logCallback = (name, data) => {
    const entry = document.createElement('div');
    entry.textContent = `[${name}] Fired with: ${JSON.stringify(data)}`;
    callbackLogEl.prepend(entry);
};

// --- FIX: Implement the full interactive feedback loop ---
const callbacks = {
    onVolumeChange: (id, vol) => {
        logCallback('onVolumeChange', { id, vol });
        const instrument = mockState.instruments.find(i => i.id === id);
        if (instrument) {
            instrument.volume = vol;
            instrument.muted = (vol === 0);
            if (vol > 0) instrument.unmutedVolume = vol;
            rerender(); // Re-render to show the change
        }
    },
    onToggleMute: (id) => {
        logCallback('onToggleMute', { id });
        const instrument = mockState.instruments.find(i => i.id === id);
        if (instrument) {
            instrument.muted = !instrument.muted;
            instrument.volume = instrument.muted ? 0 : instrument.unmutedVolume;
            rerender(); // Re-render to show the change
        }
    },
    onRequestInstrumentChange: (instrument) => {
        logCallback('onRequestInstrumentChange', instrument);
        modal.show(mockState.manifest); // Show the modal
    }
};

// --- FIX: Instantiate the modal and its callbacks ---
const modal = new InstrumentSelectionModalView(modalContainer, {
    onInstrumentSelected: (selection) => {
        logCallback('Modal selected', selection);
        // This is a simplified update for the workbench
        const instrument = mockState.instruments[1]; // Assume we're changing the snare
        instrument.name = 'Snare';
        instrument.pack = 'Jazz Snare';
        rerender();
    },
    onCancel: () => logCallback('Modal cancelled', {})
});


// Create two panel instances, one for each mode
const editorPanel = new BeatChunkPanel(editorContainer, callbacks);
const playbackPanel = new BeatChunkPanel(playbackContainer, callbacks);

function rerender() {
    logEvent('info', 'Workbench', 'rerender', 'State', 'Re-rendering with new state.');
    
    // Render the Editor Panel
    editorPanel.render({
        beatNumber: 1,
        boxesInChunk: 16,
        instruments: mockState.instruments,
        metrics: mockState.metrics,
        HeaderComponent: EditorRowHeaderView
    });

    // Render the Playback Panel
    playbackPanel.render({
        beatNumber: 1,
        boxesInChunk: 16,
        instruments: mockState.instruments,
        metrics: mockState.metrics,
        HeaderComponent: PlaybackRowHeaderView
    });
}

// --- INITIAL RENDER ---
rerender();
logEvent('info', 'Workbench', 'init', 'Lifecycle', 'Workbench initialized.');