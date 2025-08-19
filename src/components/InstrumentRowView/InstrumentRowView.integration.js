// file: src/components/InstrumentRowView/InstrumentRowView.integration.js

import { InstrumentRowView } from './InstrumentRowView.js';
import { EditorCursor } from '../EditorCursor/EditorCursor.js';
import { RadialSoundSelector } from '../RadialSoundSelector/RadialSoundSelector.js';
import { InstrumentSelectionModalView } from '../InstrumentSelectionModalView/InstrumentSelectionModalView.js';
import { Logger, logEvent } from '/percussion-studio/lib/Logger.js';
import { loadCSS } from '/percussion-studio/lib/dom.js';

// --- 1. INITIALIZATION ---
Logger.init({ level: 'debug' });
Logger.setTarget('log-output');

loadCSS('/percussion-studio/src/components/EditorCursor/EditorCursor.css');
loadCSS('/percussion-studio/src/components/RadialSoundSelector/RadialSoundSelector.css');
// CSS for the modal is loaded by its own component JS

// --- 2. MOCK DATA (DATABASE) ---
const mockInstrumentDefs = [
    { symbol: 'KCK', name: 'Kick Drum' },
    { symbol: 'SNR', name: 'Snare Drum' },
    { symbol: 'HHC', name: 'Hi-Hat' },
    { symbol: 'TOM', name: 'Tom Tom' },
];

const mockSoundPacks = [
    // Kicks
    { symbol: 'KCK', pack_name: 'studio-kick', name: 'Studio Kick', sounds: [{letter: 'o', name: 'Hit', svg: '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="currentColor" /></svg>'}] },
    { symbol: 'KCK', pack_name: '808-kick', name: '808 Kick', sounds: [{letter: 'o', name: 'Deep Hit', svg: '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" stroke="currentColor" stroke-width="8" fill="none" /></svg>'}] },
    // Snares
    { symbol: 'SNR', pack_name: 'acoustic-snare', name: 'Acoustic Snare', sounds: [{letter: 'x', name: 'Hit', svg: '<svg viewBox="0 0 100 100"><line x1="15" y1="15" x2="85" y2="85" stroke="currentColor" stroke-width="12"/><line x1="15" y1="85" x2="85" y2="15" stroke="currentColor" stroke-width="12"/></svg>'}, {letter: 'r', name: 'Rim', svg: '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" stroke="currentColor" stroke-width="12" fill="none" /></svg>'}] },
    // Hi-Hats
    { symbol: 'HHC', pack_name: 'standard-hats', name: 'Standard Hi-Hats', sounds: [{letter: 'c', name: 'Closed', svg: '<svg viewBox="0 0 100 100"><line x1="15" y1="15" x2="85" y2="85" stroke="currentColor" stroke-width="10"/><line x1="15" y1="85" x2="85" y2="15" stroke="currentColor" stroke-width="10"/></svg>'}, {letter: 'o', name: 'Open', svg: '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" stroke="currentColor" stroke-width="10" fill="none" stroke-dasharray="15 25"/></svg>'}] },
    // Toms
    { symbol: 'TOM', pack_name: 'floor-tom', name: 'Floor Tom', sounds: [{letter: 't', name: 'Hit', svg: '<svg viewBox="0 0 100 100"><path d="M 20 50 A 30 15 0 0 1 80 50" stroke="currentColor" stroke-width="10" fill="none"/></svg>'}] },
];


// --- 3. APPLICATION STATE ---
let mockState = {
    instruments: [ // This is the current "rack"
        mockSoundPacks.find(p => p.pack_name === 'studio-kick'),
        mockSoundPacks.find(p => p.pack_name === 'acoustic-snare'),
        mockSoundPacks.find(p => p.pack_name === 'standard-hats'),
    ],
    pattern: {
        KCK: '||o-------o-------o-------o-------||',
        SNR: '||----x-------x-------x-------x---||',
        HHC: '||c-c-c-c-c-c-c-c-c-c-c-c-c-c-c-c-||'
    },
    metrics: {},
    activeTool: { instrumentSymbol: 'KCK', soundLetter: 'o' }
};

let instrumentSymbolToReplace = null; // State for tracking modal interaction

// --- 4. DOM REFERENCES & COMPONENT INSTANCES ---
const rowsContainer = document.getElementById('rows-inner-container');
const callbackLogEl = document.getElementById('callback-log');
const activeToolSwatchEl = document.getElementById('active-tool-swatch');
const activeToolNameEl = document.getElementById('active-tool-name');
const modalContainer = document.getElementById('modal-container');

const editorCursor = new EditorCursor();
const radialMenu = new RadialSoundSelector({
    onSoundSelected: (selectedSoundLetter) => {
        const { instrument, tickIndex } = radialMenu.lastContext || {};
        if (!instrument) return;
        setActiveTool(instrument.symbol, selectedSoundLetter);
        setNote(instrument.symbol, tickIndex, selectedSoundLetter, true);
    }
});

const selectionModal = new InstrumentSelectionModalView(modalContainer, {
    onInstrumentSelected: (selection) => {
        logCallback('onInstrumentSelected', selection);
        const newSoundPack = mockSoundPacks.find(p => p.symbol === selection.symbol && p.pack_name === selection.packName);
        if (!newSoundPack || !instrumentSymbolToReplace) return;

        const indexToReplace = mockState.instruments.findIndex(inst => inst.symbol === instrumentSymbolToReplace);
        
        if (indexToReplace !== -1) {
            // Replace instrument in the rack
            mockState.instruments[indexToReplace] = newSoundPack;

            // Delete old pattern and create a new empty one
            delete mockState.pattern[instrumentSymbolToReplace];
            const totalCells = (mockState.metrics.beatsPerMeasure / mockState.metrics.beatUnit) * mockState.metrics.subdivision;
            mockState.pattern[newSoundPack.symbol] = '||' + '-'.repeat(totalCells) + '||';

            // Set the new instrument as the active tool
            setActiveTool(newSoundPack.symbol, newSoundPack.sounds[0].letter);
            rerender();
        }
    },
    onCancel: () => logCallback('ModalCancelled', {})
});

// --- 5. CORE LOGIC & STATE MANAGEMENT ---
function logCallback(name, data) {
    const entry = document.createElement('div');
    entry.textContent = `[${name}] Fired with: ${JSON.stringify(data)}`;
    callbackLogEl.appendChild(entry);
    callbackLogEl.scrollTop = callbackLogEl.scrollHeight;
}

function setActiveTool(instrumentSymbol, soundLetter) {
    mockState.activeTool = { instrumentSymbol, soundLetter };
    updateActiveToolUI();
    logEvent('info', 'Workbench', 'setActiveTool', 'State', `Active tool changed to ${instrumentSymbol} -> ${soundLetter}`);
}

function updateActiveToolUI() {
    const { instrumentSymbol, soundLetter } = mockState.activeTool;
    const instrument = mockState.instruments.find(i => i.symbol === instrumentSymbol);
    const sound = instrument.sounds.find(s => s.letter === soundLetter);
    
    if (sound) {
        activeToolSwatchEl.innerHTML = sound.svg;
        activeToolNameEl.textContent = `${instrument.name} / ${sound.name}`;
    }
}

function getActiveSoundSVG() {
    const { instrumentSymbol, soundLetter } = mockState.activeTool;
    const instrument = mockState.instruments.find(i => i.symbol === instrumentSymbol);
    const sound = instrument?.sounds.find(s => s.letter === soundLetter);
    return sound?.svg;
}

function setNote(instrumentSymbol, tickIndex, soundLetter, forceSet = false) {
    let patternStr = (mockState.pattern[instrumentSymbol] || '').replace(/\|/g, '');
    let patternArr = patternStr.split('');

    if (patternArr[tickIndex] === soundLetter && !forceSet) {
        patternArr[tickIndex] = '-';
    } else {
        patternArr[tickIndex] = soundLetter;
    }
    
    mockState.pattern[instrumentSymbol] = '||' + patternArr.join('') + '||';
    rerender();
}

function rerender() {
    rowsContainer.innerHTML = '';
    
    const totalCells = (mockState.metrics.beatsPerMeasure / mockState.metrics.beatUnit) * mockState.metrics.subdivision;
    let densityClass = 'density-medium';
    if (totalCells <= 12) densityClass = 'density-low';
    else if (totalCells > 32) densityClass = 'density-high';

    mockState.instruments.forEach((inst) => {
        const container = document.createElement('div');
        rowsContainer.appendChild(container);

        const view = new InstrumentRowView(container, {
            onRequestInstrumentChange: (symbol) => {
                logCallback('onRequestInstrumentChange', { symbol });
                instrumentSymbolToReplace = symbol; // Remember which instrument row was clicked
                selectionModal.show({
                    instrumentDefs: mockInstrumentDefs,
                    soundPacks: mockSoundPacks
                });
            },
            onGridMouseEnter: (instrument) => {
                editorCursor.update({ isVisible: true, svg: getActiveSoundSVG() });
                logCallback('onGridMouseEnter', { symbol: instrument.symbol });
            },
            onGridMouseLeave: () => {
                editorCursor.update({ isVisible: false, svg: null });
                logCallback('onGridMouseLeave', {});
            },
            onCellMouseDown: (tickIndex, event, hasNote) => {
                logCallback('onCellMouseDown', { tickIndex, hasNote });
                const instrument = inst;
                if (instrument.sounds.length > 1) {
                    radialMenu.lastContext = { instrument, tickIndex }; 
                    radialMenu.show({ x: event.clientX, y: event.clientY, sounds: instrument.sounds, activeSoundLetter: mockState.activeTool.soundLetter });
                } else {
                    setNote(instrument.symbol, tickIndex, instrument.sounds[0].letter);
                }
            },
        });

        view.render({
            instrument: inst,
            notation: mockState.pattern[inst.symbol],
            metrics: mockState.metrics,
            densityClass: densityClass
        });
    });
}

// --- 6. UI EVENT BINDINGS ---
const numeratorInput = document.getElementById('ts-numerator');
const denominatorInput = document.getElementById('ts-denominator');
const subdivisionSelect = document.getElementById('subdivision-select');

function updateMetrics() {
    const beats = parseInt(numeratorInput.value, 10) || 4;
    const unit = parseInt(denominatorInput.value, 10) || 4;
    const subdivision = Number(subdivisionSelect.value);
    
    let grouping = (subdivision / unit);
    if ([6, 9, 12].includes(beats) && unit === 8) {
        grouping = 3;
    }

    mockState.metrics = { beatsPerMeasure: beats, beatUnit: unit, subdivision: subdivision, grouping: grouping };
    rerender();
}

[numeratorInput, denominatorInput, subdivisionSelect].forEach(el => {
    el.addEventListener('change', updateMetrics);
});

// --- 7. INITIAL RENDER ---
updateMetrics();
updateActiveToolUI();
logEvent('info', 'Workbench', 'init', 'Lifecycle', 'Workbench initialized and rendered.');