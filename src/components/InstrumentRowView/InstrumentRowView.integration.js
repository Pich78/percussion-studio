// file: src/components/InstrumentRowView/InstrumentRowView.integration.js

import { InstrumentRowView } from './InstrumentRowView.js';
import { EditorCursor } from '../EditorCursor/EditorCursor.js';
import { RadialSoundSelector } from '../RadialSoundSelector/RadialSoundSelector.js';
import { Logger, logEvent } from '/percussion-studio/lib/Logger.js';
import { loadCSS } from '/percussion-studio/lib/dom.js';

// --- 1. INITIALIZATION ---
Logger.init({ level: 'debug' });
Logger.setTarget('log-output');

// Load CSS for all components
loadCSS('/percussion-studio/src/components/EditorCursor/EditorCursor.css');
loadCSS('/percussion-studio/src/components/RadialSoundSelector/RadialSoundSelector.css');

// Instantiate the singleton services
const editorCursor = new EditorCursor();
const radialMenu = new RadialSoundSelector({
    onSoundSelected: (selectedSoundLetter) => {
        const { instrument, tickIndex } = radialMenu.lastContext || {};
        if (!instrument) return;

        setActiveTool(instrument.symbol, selectedSoundLetter);
        setNote(instrument.symbol, tickIndex, selectedSoundLetter, true);
    }
});

// --- 2. APPLICATION STATE ---
let mockState = {
    instruments: [
        { 
            symbol: 'KCK', name: 'Kick Drum', 
            sounds: [
                {letter: 'o', name: 'Normal Hit', svg: '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="currentColor" /></svg>'}
            ] 
        },
        { 
            symbol: 'SNR', name: 'Snare Drum', 
            sounds: [
                {letter: 'x', name: 'Center Hit', svg: '<svg viewBox="0 0 100 100"><line x1="15" y1="15" x2="85" y2="85" stroke="currentColor" stroke-width="12"/><line x1="15" y1="85" x2="85" y2="15" stroke="currentColor" stroke-width="12"/></svg>'}, 
                {letter: 'r', name: 'Rimshot', svg: '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" stroke="currentColor" stroke-width="12" fill="none" /></svg>'}
            ] 
        },
        { 
            symbol: 'HHC', name: 'Hi-Hat', 
            sounds: [
                {letter: 'c', name: 'Closed', svg: '<svg viewBox="0 0 100 100"><line x1="15" y1="15" x2="85" y2="85" stroke="currentColor" stroke-width="10"/><line x1="15" y1="85" x2="85" y2="15" stroke="currentColor" stroke-width="10"/></svg>'}, 
                {letter: 'o', name: 'Open', svg: '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" stroke="currentColor" stroke-width="10" fill="none" stroke-dasharray="15 25"/></svg>'}, 
                {letter: 'p', name: 'Pedal', svg: '<svg viewBox="0 0 100 100"><line x1="15" y1="50" x2="85" y2="50" stroke="currentColor" stroke-width="10"/><line x1="50" y1="15" x2="50" y2="85" stroke="currentColor" stroke-width="10"/></svg>'}
            ] 
        },
    ],
    pattern: {
        KCK: '||o-------o-------o-------o-------||',
        SNR: '||----x-------x-------x-------x---||',
        HHC: '||c-c-c-c-c-c-c-c-c-c-c-c-c-c-c-c-||'
    },
    metrics: {},
    activeTool: {
        instrumentSymbol: 'KCK',
        soundLetter: 'o'
    }
};

// --- 3. DOM REFERENCES ---
const rowsContainer = document.getElementById('rows-inner-container');
const callbackLogEl = document.getElementById('callback-log');
const activeToolSwatchEl = document.getElementById('active-tool-swatch');
const activeToolNameEl = document.getElementById('active-tool-name');


// --- 4. CORE LOGIC & STATE MANAGEMENT ---
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
    let patternStr = mockState.pattern[instrumentSymbol].replace(/\|/g, '');
    let patternArr = patternStr.split('');

    if (patternArr[tickIndex] === soundLetter && !forceSet) {
        patternArr[tickIndex] = '-'; // Toggle off
    } else {
        patternArr[tickIndex] = soundLetter; // Set note
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
                const instrument = mockState.instruments.find(i => i.symbol === symbol);
                if (instrument && instrument.sounds.length > 0) {
                    setActiveTool(symbol, instrument.sounds[0].letter);
                }
                logCallback('onRequestInstrumentChange', { symbol });
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
                    radialMenu.show({
                        x: event.clientX,
                        y: event.clientY,
                        sounds: instrument.sounds,
                        activeSoundLetter: mockState.activeTool.soundLetter
                    });
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

// --- 5. UI EVENT BINDINGS ---
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

// --- 6. INITIAL RENDER ---
updateMetrics();
updateActiveToolUI();
logEvent('info', 'Workbench', 'init', 'Lifecycle', 'Workbench initialized and rendered.');