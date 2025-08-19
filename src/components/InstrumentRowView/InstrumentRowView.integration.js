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
let nextTrackId = 1;

// --- UTILITY ---
const generateTrackId = () => `track-${nextTrackId++}`;

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

// --- 3. APPLICATION STATE (REFACTORED) ---
const createInitialTrack = (instrument) => {
    const trackId = generateTrackId();
    return { trackId, instrument };
};

const initialTracks = [
    createInitialTrack(mockSoundPacks.find(p => p.pack_name === 'studio-kick')),
    createInitialTrack(mockSoundPacks.find(p => p.pack_name === 'acoustic-snare')),
    createInitialTrack(mockSoundPacks.find(p => p.pack_name === 'standard-hats')),
];

let mockState = {
    // instruments is now an array of track objects, each with a unique ID
    instruments: initialTracks,
    // patterns and activeSounds are now keyed by trackId, not symbol
    pattern: {
        [initialTracks[0].trackId]: '||o-s-o-s-o-s-o-s-o-s-o-s-o-s-o-s-||',
        [initialTracks[1].trackId]: '||----o-------s-------o-------t---||',
        [initialTracks[2].trackId]: '||o-s-p-z-o-s-p-z-o-s-p-z-o-s-p-z-||'
    },
    metrics: {},
    activeSounds: Object.fromEntries(
        initialTracks.map(track => [track.trackId, track.instrument.sounds[0].letter])
    ),
};
let trackIdToReplace = null;

// --- 4. DOM REFERENCES & COMPONENT INSTANCES ---
const rowsContainer = document.getElementById('rows-inner-container');
const callbackLogEl = document.getElementById('callback-log');
const activeToolSwatchEl = document.getElementById('active-tool-swatch');
const activeToolNameEl = document.getElementById('active-tool-name');
const modalContainer = document.getElementById('modal-container');
const addTrackBtn = document.getElementById('add-track-btn');

const editorCursor = new EditorCursor();
const radialMenu = new RadialSoundSelector({
    onSoundSelected: (selectedSoundLetter) => {
        const { track } = radialMenu.lastContext || {};
        if (!track) return;
        mockState.activeSounds[track.trackId] = selectedSoundLetter;
        logEvent('info', 'Workbench', 'setActiveSound', 'State', `Active sound for ${track.trackId} changed to -> ${selectedSoundLetter}`);
        updateActiveTool(track);
    }
});
const selectionModal = new InstrumentSelectionModalView(modalContainer, {
    onInstrumentSelected: (selection) => {
        logCallback('onInstrumentSelected', selection);
        const newSoundPack = mockSoundPacks.find(p => p.symbol === selection.symbol && p.pack_name === selection.packName);
        if (!newSoundPack || !trackIdToReplace) return;
        const trackToUpdate = mockState.instruments.find(t => t.trackId === trackIdToReplace);
        if (trackToUpdate) {
            trackToUpdate.instrument = newSoundPack;
            mockState.activeSounds[trackIdToReplace] = newSoundPack.sounds[0].letter;
            const totalCells = (mockState.metrics.beatsPerMeasure / mockState.metrics.beatUnit) * mockState.metrics.subdivision;
            mockState.pattern[trackIdToReplace] = '||' + '-'.repeat(totalCells) + '||';
            rerender();
            updateActiveTool(trackToUpdate);
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

function updateActiveTool(track) {
    const { trackId, instrument } = track;
    const soundLetter = mockState.activeSounds[trackId];
    const sound = instrument.sounds.find(s => s.letter === soundLetter);
    if (sound) {
        activeToolSwatchEl.innerHTML = sound.svg;
        activeToolNameEl.textContent = `${instrument.name} / ${sound.name}`;
        editorCursor.update({ isVisible: true, svg: sound.svg });
    }
}

function rerender() {
    rowsContainer.innerHTML = '';
    const totalCells = (mockState.metrics.beatsPerMeasure / mockState.metrics.beatUnit) * mockState.metrics.subdivision;
    let densityClass = 'density-medium';
    if (totalCells <= 12) densityClass = 'density-low';
    else if (totalCells > 32) densityClass = 'density-high';

    mockState.instruments.forEach((track) => {
        const container = document.createElement('div');
        rowsContainer.appendChild(container);

        const view = new InstrumentRowView(container, {
            onRequestInstrumentChange: () => {
                logCallback('onRequestInstrumentChange', { trackId: track.trackId });
                trackIdToReplace = track.trackId;
                selectionModal.show({ instrumentDefs: mockInstrumentDefs, soundPacks: mockSoundPacks });
            },
            onGridMouseEnter: () => {
                updateActiveTool(track);
            },
            onGridMouseLeave: () => editorCursor.update({ isVisible: false, svg: null }),
            onCellMouseDown: (tickIndex, event, hasNote) => {
                logCallback('onCellMouseDown', { trackId: track.trackId, tickIndex, hasNote });
                event.preventDefault();
                clearTimeout(holdTimeout);
                mouseDownInfo = { track, tickIndex, hasNote };
                if (track.instrument.sounds.length > 1) {
                    holdTimeout = setTimeout(() => {
                        logEvent('info', 'Workbench', 'holdAction', 'Events', 'Hold detected, showing radial menu.');
                        radialMenu.lastContext = { track, tickIndex };
                        radialMenu.show({
                            x: event.clientX,
                            y: event.clientY,
                            sounds: track.instrument.sounds,
                            activeSoundLetter: mockState.activeSounds[track.trackId]
                        });
                        mouseDownInfo = null;
                    }, HOLD_DURATION_MS);
                }
            },
            onCellMouseUp: (tickIndex) => {
                logCallback('onCellMouseUp', { trackId: track.trackId, tickIndex });
                clearTimeout(holdTimeout);
                if (mouseDownInfo) {
                    const { track: currentTrack, hasNote } = mouseDownInfo;
                    const trackId = currentTrack.trackId;
                    let patternArr = (mockState.pattern[trackId] || '').replace(/\|/g, '').split('');
                    if (hasNote) {
                        patternArr[tickIndex] = '-';
                    } else {
                        patternArr[tickIndex] = mockState.activeSounds[trackId];
                    }
                    mockState.pattern[trackId] = '||' + patternArr.join('') + '||';
                    rerender();
                }
                mouseDownInfo = null;
            },
        });

        view.render({
            instrument: track.instrument,
            notation: mockState.pattern[track.trackId],
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

[numeratorInput, denominatorInput, subdivisionSelect].forEach(el => el.addEventListener('change', updateMetrics));

addTrackBtn.addEventListener('click', () => {
    logEvent('info', 'Workbench', 'addTrack', 'Events', 'Add Track button clicked.');
    const newTrack = createInitialTrack(mockSoundPacks.find(p => p.pack_name === 'studio-kick'));
    const totalCells = (mockState.metrics.beatsPerMeasure / mockState.metrics.beatUnit) * mockState.metrics.subdivision;
    mockState.instruments.push(newTrack);
    mockState.pattern[newTrack.trackId] = '||' + '-'.repeat(totalCells) + '||';
    mockState.activeSounds[newTrack.trackId] = newTrack.instrument.sounds[0].letter;
    rerender();
});

// --- 7. INITIAL RENDER ---
updateMetrics();
if (mockState.instruments.length > 0) {
    updateActiveTool(mockState.instruments[0]);
}
logEvent('info', 'Workbench', 'init', 'Lifecycle', 'Workbench initialized and rendered.');