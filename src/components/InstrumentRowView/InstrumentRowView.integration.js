// file: src/components/InstrumentRowView/InstrumentRowView.integration.js

import { InstrumentRowView } from './InstrumentRowView.js';
import { EditorRowHeaderView } from '/percussion-studio/src/components/EditorRowHeaderView/EditorRowHeaderView.js';
import { PlaybackRowHeaderView } from '/percussion-studio/src/components/PlaybackRowHeaderView/PlaybackRowHeaderView.js';
import { InstrumentSelectionModalView } from '/percussion-studio/src/components/InstrumentSelectionModalView/InstrumentSelectionModalView.js';
import { Logger, logEvent } from '/percussion-studio/lib/Logger.js';

// --- INITIALIZATION ---
Logger.init({ level: 'debug' });
Logger.setTarget('log-output');

// --- MOCK DATA & STATE ---
let mockState = {
    metrics: { beatGrouping: 4, feel: 'duple' },
    instrument: { 
        id: 'kck_1', 
        symbol: 'KCK', 
        name: 'Kick', 
        pack: 'Studio Kick', 
        pattern: 'o---o---o---o---', 
        sounds:[{letter:'o',svg:'<svg/>'}], 
        volume: 0.8, 
        muted: false, 
        unmutedVolume: 0.8 
    },
    manifest: { /* ... for modal ... */ }
};

// --- DOM REFERENCES ---
const editorHeaderPanel = document.getElementById('editor-header-panel');
const editorGridPanel = document.getElementById('editor-grid-panel');
const playbackHeaderPanel = document.getElementById('playback-header-panel');
const playbackGridPanel = document.getElementById('playback-grid-panel');
const modalContainer = document.getElementById('modal-container');
const callbackLogEl = document.getElementById('callback-log');

// --- CALLBACKS & STATE MANAGEMENT ---
const logCallback = (name, data) => {
    const entry = document.createElement('div');
    entry.textContent = `[${name}] Fired with: ${JSON.stringify(data)}`;
    callbackLogEl.prepend(entry);
};

const modal = new InstrumentSelectionModalView(modalContainer, {
    onInstrumentSelected: (selection) => {
        logCallback('Modal selected', selection);
        mockState.instrument.name = 'Snare'; // Simplified update
        mockState.instrument.pack = 'Jazz Snare';
        rerender();
    },
    onCancel: () => logCallback('Modal cancelled', {})
});

const callbacks = {
    onVolumeChange: (id, vol) => {
        logCallback('onVolumeChange', { id, vol });
        mockState.instrument.volume = vol;
        mockState.instrument.muted = (vol === 0);
        if (vol > 0) mockState.instrument.unmutedVolume = vol;
        rerender();
    },
    onToggleMute: (id) => {
        logCallback('onToggleMute', { id });
        mockState.instrument.muted = !mockState.instrument.muted;
        mockState.instrument.volume = mockState.instrument.muted ? 0 : mockState.instrument.unmutedVolume;
        rerender();
    },
    onRequestInstrumentChange: (instrument) => {
        logCallback('onRequestInstrumentChange', instrument);
        modal.show(mockState.manifest);
    }
};

// --- COMPONENT INSTANCES ---
// Create the Editor Row instance in its dedicated panels
const editorRow = new InstrumentRowView(
    { headerPanel: editorHeaderPanel, gridPanel: editorGridPanel }, 
    {
        HeaderComponent: EditorRowHeaderView,
        headerProps: mockState.instrument,
        callbacks
    }
);

// Create the Playback Row instance in its dedicated panels
const playbackRow = new InstrumentRowView(
    { headerPanel: playbackHeaderPanel, gridPanel: playbackGridPanel }, 
    {
        HeaderComponent: PlaybackRowHeaderView,
        headerProps: {
            id: mockState.instrument.id,
            name: mockState.instrument.name,
            volume: mockState.instrument.volume,
            muted: mockState.instrument.muted,
        },
        callbacks
    }
);

// --- RENDER FUNCTION ---
function rerender() {
    logEvent('info', 'Workbench', 'rerender', 'State', 'Re-rendering rows with new state.');
    
    // Render the Editor Row
    editorRow.render({
        instrument: mockState.instrument,
        notation: mockState.instrument.pattern,
        metrics: mockState.metrics,
        headerProps: mockState.instrument
    });

    // Render the Playback Row
    playbackRow.render({
        instrument: mockState.instrument,
        notation: mockState.instrument.pattern,
        metrics: mockState.metrics,
        headerProps: {
            id: mockState.instrument.id,
            name: mockState.instrument.name,
            volume: mockState.instrument.volume,
            muted: mockState.instrument.muted,
        }
    });
}

// --- INITIAL RENDER ---
rerender();
logEvent('info', 'Workbench', 'init', 'Lifecycle', 'Workbench initialized.');