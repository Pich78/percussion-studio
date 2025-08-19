// file: src/components/MeasureEditorView/MeasureEditorView.integration.js

import { MeasureEditorView } from './MeasureEditorView.js';
import { Logger, logEvent } from '/percussion-studio/lib/Logger.js';
import { EditorCursor } from '/percussion-studio/src/components/EditorCursor/EditorCursor.js';
import { RadialSoundSelector } from '/percussion-studio/src/components/RadialSoundSelector/RadialSoundSelector.js';

// --- CONSTANTS ---
const HOLD_DURATION_MS = 200;

// --- GLOBAL STATE & INSTANCES ---
let measureEditor = null;
let holdTimeout = null;
let mouseDownInfo = null;
const editorCursor = new EditorCursor();
const radialMenu = new RadialSoundSelector({ onSoundSelected: handleSoundSelection });
let activeSounds = {}; // e.g., { 'KCK': 'o', 'SNR': 's' }

// --- MOCK DATA (DATABASE) ---
const svgs = {
    hit: '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="currentColor" /></svg>',
    stopped: '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" stroke="currentColor" stroke-width="12" fill="none" /></svg>',
    triangle: '<svg viewBox="0 0 100 100"><polygon points="50,15 90,85 10,85" stroke="currentColor" stroke-width="12" fill="none"/></svg>',
    cross: '<svg viewBox="0 0 100 100"><line x1="15" y1="15" x2="85" y2="85" stroke="currentColor" stroke-width="12"/><line x1="15" y1="85" x2="85" y2="15" stroke="currentColor" stroke-width="12"/></svg>',
    pedal: '<svg viewBox="0 0 100 100"><line x1="15" y1="85" x2="85" y2="85" stroke="currentColor" stroke-width="12"/><line x1="50" y1="15" x2="50" y2="85" stroke="currentColor" stroke-width="12"/></svg>',
    sizzle: '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" stroke="currentColor" stroke-width="10" fill="none" /><line x1="30" y1="70" x2="70" y2="30" stroke="currentColor" stroke-width="10" /></svg>',
    rim: '<svg viewBox="0 0 100 100"><path d="M 50 15 A 40 40 0 0 1 50 85" stroke="currentColor" stroke-width="12" fill="none"/></svg>',
    muted: '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="currentColor" /><line x1="25" y1="25" x2="75" y2="75" stroke="white" stroke-width="14" /></svg>',
    velocity: '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="25" fill="currentColor" /><path d="M 50 5 L 50 25 M 50 75 L 50 95 M 5 50 L 25 50 M 75 50 L 95 50" stroke="currentColor" stroke-width="8" fill="none"/></svg>'
};
const mockInstrumentDefs = [
    { symbol: 'KCK', name: 'Kick Drum' }, { symbol: 'SNR', name: 'Snare Drum' },
    { symbol: 'HHC', name: 'Hi-Hat' }, { symbol: 'TOM', name: 'Tom Tom' },
];
const mockSoundPacks = [
    { symbol: 'KCK', pack_name: 'studio-kick', name: 'Studio Kick', sounds: [{letter: 'o', name: 'Hit', svg: svgs.hit}, {letter: 's', name: 'Stopped Hit', svg: svgs.stopped}] },
    { symbol: 'KCK', pack_name: '808-kick', name: '808 Kick', sounds: [{letter: 'o', name: 'Hit', svg: svgs.hit}, {letter: 's', name: 'Stopped Hit', svg: svgs.stopped}] },
    { symbol: 'SNR', pack_name: 'acoustic-snare', name: 'Acoustic Snare', sounds: [{letter: 'o', name: 'Hit', svg: svgs.hit}, {letter: 's', name: 'Stopped Hit', svg: svgs.stopped}, {letter: 't', name: 'Triangle Hit', svg: svgs.triangle}] },
    { symbol: 'HHC', pack_name: 'standard-hats', name: 'Standard Hi-Hats', sounds: [{letter: 'o', name: 'Hit', svg: svgs.hit}, {letter: 's', name: 'Stopped Hit', svg: svgs.stopped}, {letter: 'p', name: 'Pedal', svg: svgs.pedal}, {letter: 'z', name: 'Sizzle', svg: svgs.sizzle}] },
    { symbol: 'TOM', pack_name: 'floor-tom', name: 'Floor Tom', sounds: [{letter: 'o', name: 'Hit', svg: svgs.hit}, {letter: 's', name: 'Stopped Hit', svg: svgs.stopped}, {letter: 'r', name: 'Rimshot', svg: svgs.rim}, {letter: 'm', name: 'Muted Hit', svg: svgs.muted}, {letter: 'v', name: 'High Velocity', svg: svgs.velocity}] },
];

// --- HELPER FUNCTIONS ---
function logCallback(name, data) {
    const logEl = document.getElementById('callback-log');
    const entry = document.createElement('div');
    const time = new Date().toLocaleTimeString();
    entry.textContent = `[${time}] [${name}] Fired with: ${JSON.stringify(data)}`;
    logEl.prepend(entry);
}

function updateActiveTool(instrument) {
    if (!instrument) {
        editorCursor.update({ isVisible: false, svg: null });
        return;
    }
    const soundLetter = activeSounds[instrument.symbol] || instrument.sounds[0].letter;
    const sound = instrument.sounds.find(s => s.letter === soundLetter);
    if (sound) {
        document.getElementById('active-tool-swatch').innerHTML = sound.svg;
        document.getElementById('active-tool-name').textContent = `${instrument.name} / ${sound.name}`;
        editorCursor.update({ isVisible: true, svg: sound.svg });
    }
}

// --- EVENT HANDLERS ---
function handleSoundSelection(selectedSoundLetter) {
    const { instrument } = radialMenu.lastContext || {};
    if (!instrument) return;
    activeSounds[instrument.symbol] = selectedSoundLetter;
    logEvent('info', 'Workbench', 'setActiveSound', 'State', `Active sound for ${instrument.symbol} changed to -> ${selectedSoundLetter}`);
    updateActiveTool(instrument);
}

function handleGridMouseEnter(instrument) {
    logCallback('onGridMouseEnter', { symbol: instrument.symbol });
    if (!activeSounds[instrument.symbol]) {
        activeSounds[instrument.symbol] = instrument.sounds[0].letter;
    }
    updateActiveTool(instrument);
}

function handleGridMouseLeave() {
    logCallback('onGridMouseLeave', {});
    updateActiveTool(null);
}

function handleCellMouseDown(instrument, tickIndex, hasNote, event) {
    logCallback('onCellMouseDown', { symbol: instrument.symbol, tickIndex, hasNote });
    event.preventDefault();
    clearTimeout(holdTimeout);
    mouseDownInfo = { instrument, tickIndex, hasNote };
    if (instrument.sounds.length > 1) {
        holdTimeout = setTimeout(() => {
            logEvent('info', 'Workbench', 'holdAction', 'Events', 'Hold detected, showing radial menu.');
            radialMenu.lastContext = { instrument, tickIndex };
            radialMenu.show({
                x: event.clientX,
                y: event.clientY,
                sounds: instrument.sounds,
                activeSoundLetter: activeSounds[instrument.symbol]
            });
            mouseDownInfo = null; // Prevent click action on mouseup
        }, HOLD_DURATION_MS);
    }
}

function handleCellMouseUp() {
    clearTimeout(holdTimeout);
    if (mouseDownInfo) {
        const { instrument, tickIndex, hasNote } = mouseDownInfo;
        let patternArr = (instrument.pattern || '').replace(/\|/g, '').split('');
        
        if (hasNote) {
            patternArr[tickIndex] = '-';
        } else {
            patternArr[tickIndex] = activeSounds[instrument.symbol] || instrument.sounds[0].letter;
        }
        
        const newPattern = '||' + patternArr.join('') + '||';
        measureEditor.updateInstrumentPattern(instrument.symbol, newPattern);
    }
    mouseDownInfo = null;
}

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    Logger.init({ level: 'debug' });
    Logger.setTarget('log-output');

    document.addEventListener('mouseup', handleCellMouseUp);

    const editorContainer = document.getElementById('measure-editor-container');
    measureEditor = new MeasureEditorView(editorContainer, {
        instrumentDefs: mockInstrumentDefs,
        soundPacks: mockSoundPacks,
        onMetricsChange: (newMetrics) => logCallback('onMetricsChange', newMetrics),
        onCellMouseDown: handleCellMouseDown,
        onGridMouseEnter: handleGridMouseEnter,
        onGridMouseLeave: handleGridMouseLeave
    });
    
    logEvent('info', 'Workbench', 'init', 'Lifecycle', 'MeasureEditorView Workbench initialized.');
});