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

const HOLD_DURATION_MS = 200;
let holdTimeout = null;
let mouseDownInfo = null;

// --- 2. MOCK DATA (DATABASE) ---
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

// --- 3. APPLICATION STATE ---
let mockState = {
    instruments: [
        mockSoundPacks.find(p => p.pack_name === 'studio-kick'),
        mockSoundPacks.find(p => p.pack_name === 'acoustic-snare'),
        mockSoundPacks.find(p => p.pack_name === 'standard-hats'),
    ],
    pattern: {
        KCK: '||o-s-o-s-o-s-o-s-o-s-o-s-o-s-o-s-||',
        SNR: '||----o-------s-------o-------t---||',
        HHC: '||o-s-p-z-o-s-p-z-o-s-p-z-o-s-p-z-||'
    },
    metrics: {},
    activeTool: { instrumentSymbol: 'KCK', soundLetter: 'o' }
};
let instrumentSymbolToReplace = null;

// --- 4. DOM REFERENCES & COMPONENT INSTANCES ---
const rowsContainer = document.getElementById('rows-inner-container');
const callbackLogEl = document.getElementById('callback-log');
const activeToolSwatchEl = document.getElementById('active-tool-swatch');
const activeToolNameEl = document.getElementById('active-tool-name');
const modalContainer = document.getElementById('modal-container');

const editorCursor = new EditorCursor();
const radialMenu = new RadialSoundSelector({
    onSoundSelected: (selectedSoundLetter) => {
        const { instrument } = radialMenu.lastContext || {};
        if (!instrument) return;
        setActiveTool(instrument.symbol, selectedSoundLetter);
    }
});
const selectionModal = new InstrumentSelectionModalView(modalContainer, {
    onInstrumentSelected: (selection) => {
        logCallback('onInstrumentSelected', selection);
        const newSoundPack = mockSoundPacks.find(p => p.symbol === selection.symbol && p.pack_name === selection.packName);
        if (!newSoundPack || !instrumentSymbolToReplace) return;
        const indexToReplace = mockState.instruments.findIndex(inst => inst.symbol === instrumentSymbolToReplace);
        if (indexToReplace !== -1) {
            delete mockState.pattern[instrumentSymbolToReplace];
            mockState.instruments[indexToReplace] = newSoundPack;
            const totalCells = (mockState.metrics.beatsPerMeasure / mockState.metrics.beatUnit) * mockState.metrics.subdivision;
            mockState.pattern[newSoundPack.symbol] = '||' + '-'.repeat(totalCells) + '||';
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
                instrumentSymbolToReplace = symbol;
                selectionModal.show({ instrumentDefs: mockInstrumentDefs, soundPacks: mockSoundPacks });
            },
            onGridMouseEnter: (instrument) => editorCursor.update({ isVisible: true, svg: getActiveSoundSVG() }),
            onGridMouseLeave: () => editorCursor.update({ isVisible: false, svg: null }),
            onCellMouseDown: (tickIndex, event, hasNote) => {
                logCallback('onCellMouseDown', { tickIndex, hasNote });
                event.preventDefault();
                const instrument = inst;
                clearTimeout(holdTimeout);
                mouseDownInfo = { instrument, tickIndex, hasNote };

                // Only set up a hold timeout if the instrument has multiple sounds to choose from
                if (instrument.sounds.length > 1) {
                    holdTimeout = setTimeout(() => {
                        logEvent('info', 'Workbench', 'holdAction', 'Events', 'Hold detected, showing radial menu.');
                        radialMenu.lastContext = { instrument, tickIndex };
                        radialMenu.show({
                            x: event.clientX,
                            y: event.clientY,
                            sounds: instrument.sounds,
                            activeSoundLetter: mockState.activeTool.soundLetter
                        });
                        mouseDownInfo = null; // Invalidate the click action
                    }, HOLD_DURATION_MS);
                }
            },
            // --- MODIFIED: Rewritten to be a simple toggle ---
            onCellMouseUp: (tickIndex, event) => {
                logCallback('onCellMouseUp', { tickIndex });
                clearTimeout(holdTimeout);

                if (mouseDownInfo) {
                    logEvent('info', 'Workbench', 'clickAction', 'Events', 'Click detected, performing toggle edit.');
                    const { instrument, hasNote } = mouseDownInfo;
                    const instrumentSymbol = instrument.symbol;

                    let patternStr = (mockState.pattern[instrumentSymbol] || '').replace(/\|/g, '');
                    let patternArr = patternStr.split('');
                    
                    if (hasNote) {
                        // If the cell had a note, clear it.
                        patternArr[tickIndex] = '-';
                        logEvent('debug', 'Workbench', 'toggle', 'State', `Deleting note at ${instrumentSymbol}[${tickIndex}]`);
                    } else {
                        // If the cell was empty, add a note using the active tool.
                        // For single-sound instruments, this will be its only sound.
                        const soundLetter = (instrument.sounds.length > 1)
                            ? mockState.activeTool.soundLetter
                            : instrument.sounds[0].letter;
                        patternArr[tickIndex] = soundLetter;
                        logEvent('debug', 'Workbench', 'toggle', 'State', `Adding note '${soundLetter}' at ${instrumentSymbol}[${tickIndex}]`);
                    }
                    
                    mockState.pattern[instrumentSymbol] = '||' + patternArr.join('') + '||';
                    rerender();
                }
                mouseDownInfo = null; // Reset for the next interaction
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