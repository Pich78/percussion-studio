// file: src/components/MeasureEditorView/MeasureEditorView.integration.js

import { MeasureEditorView } from './MeasureEditorView.js';
import { EditorCursor } from '/percussion-studio/src/components/EditorCursor/EditorCursor.js';
import { RadialSoundSelector } from '/percussion-studio/src/components/RadialSoundSelector/RadialSoundSelector.js';
import { Logger, logEvent } from '/percussion-studio/lib/Logger.js';

// --- 1. CONFIG & INITIALIZATION ---
Logger.init({ level: 'debug' });
Logger.setTarget('log-output');

const HOLD_DURATION_MS = 200;
let holdTimeout = null;
let mouseDownInfo = null;

// --- 2. MOCK DATA & SVGs ---
const svgs = {
    hit: '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="currentColor" /></svg>',
    stopped: '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" stroke="currentColor" stroke-width="12" fill="none" /></svg>',
    rim: '<svg viewBox="0 0 100 100"><path d="M 50 15 A 40 40 0 0 1 50 85" stroke="currentColor" stroke-width="12" fill="none"/></svg>',
    pedal: '<svg viewBox="0 0 100 100"><line x1="15" y1="85" x2="85" y2="85" stroke="currentColor" stroke-width="12"/><line x1="50" y1="15" x2="50" y2="85" stroke="currentColor" stroke-width="12"/></svg>',
};
const manifestData = {
    instrumentDefs: [
        { symbol: 'KCK', name: 'Kick Drum' },
        { symbol: 'SNR', name: 'Snare Drum' },
        { symbol: 'HHC', name: 'Hi-Hat Closed' },
    ],
    soundPacks: [] // Not directly used here, but needed for the modal
};

// --- 3. APPLICATION STATE ---
let mockState = {
    instruments: [
        { symbol: 'KCK', name: 'Kick Drum', sounds: [{letter: 'o', name: 'Hit', svg: svgs.hit}], pattern: '||o-------o-------||' },
        { symbol: 'SNR', name: 'Snare Drum', sounds: [{letter: 'o', name: 'Hit', svg: svgs.hit}, {letter: 'r', name: 'Rimshot', svg: svgs.rim}], pattern: '||----o-------r---||' },
        { symbol: 'HHC', name: 'Hi-Hat', sounds: [{letter: 'o', name: 'Closed', svg: svgs.hit}, {letter: 'p', name: 'Pedal', svg: svgs.pedal}], pattern: '||o-o-o-o-o-o-o-o-||' },
    ],
    activeSounds: {
        KCK: 'o',
        SNR: 'o',
        HHC: 'o',
    },
};

// --- 4. DOM & COMPONENT INSTANCES ---
const editorContainer = document.getElementById('measure-editor-container');
const callbackLogEl = document.getElementById('callback-log');
let measureEditor; // To be initialized later

const editorCursor = new EditorCursor();
const radialMenu = new RadialSoundSelector({
    onSoundSelected: (selectedSoundLetter) => {
        const { instrument } = radialMenu.lastContext || {};
        if (!instrument) return;

        mockState.activeSounds[instrument.symbol] = selectedSoundLetter;
        logEvent('info', 'Integration', 'onSoundSelected', 'State', `Active sound for ${instrument.symbol} changed to -> ${selectedSoundLetter}`);
        updateActiveTool(instrument);
    }
});

// --- 5. CORE LOGIC & STATE MANAGEMENT ---
function logCallback(name, data) {
    const entry = document.createElement('div');
    const time = new Date().toLocaleTimeString();
    entry.textContent = `[${time}] [${name}] Fired with: ${JSON.stringify(data)}`;
    callbackLogEl.prepend(entry);
}

function updateActiveTool(instrument) {
    const soundLetter = mockState.activeSounds[instrument.symbol];
    const sound = instrument.sounds.find(s => s.letter === soundLetter);
    const toolContainer = document.getElementById('active-tool-container');
    
    if (sound && toolContainer) {
        toolContainer.innerHTML = `
            <label class="f6 b db mb2">Active Tool</label>
            <div class="active-tool">
                <div class="swatch">${sound.svg}</div>
                <span class="f6">${instrument.name} / ${sound.name}</span>
            </div>
        `;
        editorCursor.update({ isVisible: true, svg: sound.svg });
    }
}

function handleNoteEdit(instrument, tickIndex, hasNote) {
    const instrumentState = mockState.instruments.find(i => i.symbol === instrument.symbol);
    if (!instrumentState) return;
    
    let patternStr = (instrumentState.pattern || '').replace(/\|/g, '');
    let patternArr = patternStr.split('');

    // Ensure pattern is long enough
    while(patternArr.length <= tickIndex) patternArr.push('-');

    if (hasNote) {
        patternArr[tickIndex] = '-';
    } else {
        const soundLetter = mockState.activeSounds[instrument.symbol];
        patternArr[tickIndex] = soundLetter;
    }

    instrumentState.pattern = '||' + patternArr.join('') + '||';
    logEvent('info', 'Integration', 'handleNoteEdit', 'State', `New pattern for ${instrument.symbol}: ${instrumentState.pattern}`);
    measureEditor.setInstruments(mockState.instruments);
}

// --- 6. EVENT BINDINGS & INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    measureEditor = new MeasureEditorView(editorContainer, {
        instrumentDefs: manifestData.instrumentDefs,
        soundPacks: manifestData.soundPacks,
        onMetricsChange: (newMetrics) => logCallback('onMetricsChange', newMetrics),
        
        onGridMouseEnter: (instrument) => {
            updateActiveTool(instrument);
        },
        onGridMouseLeave: () => {
            editorCursor.update({ isVisible: false, svg: null });
        },
        onCellMouseDown: (instrument, tickIndex, hasNote, event) => {
            logCallback('onCellMouseDown', { symbol: instrument.symbol, tickIndex, hasNote });
            event.preventDefault();
            clearTimeout(holdTimeout);
            mouseDownInfo = { instrument, tickIndex, hasNote };

            if (instrument.sounds.length > 1) {
                holdTimeout = setTimeout(() => {
                    logEvent('info', 'Integration', 'holdAction', 'Events', 'Hold detected, showing radial menu.');
                    radialMenu.lastContext = { instrument, tickIndex };
                    radialMenu.show({
                        x: event.clientX,
                        y: event.clientY,
                        sounds: instrument.sounds,
                        activeSoundLetter: mockState.activeSounds[instrument.symbol]
                    });
                    mouseDownInfo = null; // Prevent click action after menu shows
                }, HOLD_DURATION_MS);
            }
        }
    });

    // Global listener for mouseup to handle clicks
    document.addEventListener('mouseup', () => {
        clearTimeout(holdTimeout);
        if (mouseDownInfo) {
            logEvent('info', 'Integration', 'clickAction', 'Events', 'Click detected, performing toggle edit.');
            const { instrument, tickIndex, hasNote } = mouseDownInfo;
            handleNoteEdit(instrument, tickIndex, hasNote);
        }
        mouseDownInfo = null;
    });

    // Initial population of the editor
    measureEditor.setInstruments(mockState.instruments);
    if (mockState.instruments.length > 0) {
        updateActiveTool(mockState.instruments[0]);
    }
    logEvent('info', 'Integration', 'init', 'Lifecycle', 'Workbench initialized and rendered.');
});