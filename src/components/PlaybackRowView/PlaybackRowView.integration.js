// file: src/components/PlaybackRowView/PlaybackRowView.integration.js

import { PlaybackRowView } from './PlaybackRowView.js';
import { EditorCursor } from '../EditorCursor/EditorCursor.js';
import { Logger, logEvent } from '/percussion-studio/lib/Logger.js';
import { loadCSS } from '/percussion-studio/lib/dom.js';

// --- INITIALIZATION ---
Logger.init({ level: 'debug' });
Logger.setTarget('log-output');
loadCSS('/percussion-studio/src/components/EditorCursor/EditorCursor.css');
let nextTrackId = 1;

// --- UTILITY ---
const generateTrackId = () => `track-${nextTrackId++}`;

// --- MOCK DATA (DATABASE) ---
const svgs = {
    hit: '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="currentColor" /></svg>',
    stopped: '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" stroke="currentColor" stroke-width="12" fill="none" /></svg>',
    pedal: '<svg viewBox="0 0 100 100"><line x1="15" y1="85" x2="85" y2="85" stroke="currentColor" stroke-width="12"/><line x1="50" y1="15" x2="50" y2="85" stroke="currentColor" stroke-width="12"/></svg>',
};
const mockSoundPacks = [
    { symbol: 'KCK', pack_name: 'studio-kick', name: 'Studio Kick', sounds: [{letter: 'o', name: 'Hit', svg: svgs.hit}, {letter: 's', name: 'Stopped Hit', svg: svgs.stopped}] },
    { symbol: 'SNR', pack_name: 'acoustic-snare', name: 'Acoustic Snare', sounds: [{letter: 'o', name: 'Hit', svg: svgs.hit}, {letter: 's', name: 'Stopped Hit', svg: svgs.stopped}] },
    { symbol: 'HHC', pack_name: 'standard-hats', name: 'Standard Hi-Hats', sounds: [{letter: 'o', name: 'Hit', svg: svgs.hit}, {letter: 'p', name: 'Pedal', svg: svgs.pedal}] },
];

// --- APPLICATION STATE ---
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
    tracks: initialTracks,
    pattern: {
        [initialTracks[0].trackId]: '||o-s-o-s-o-s-o-s-o-s-o-s-o-s-o-s-||',
        [initialTracks[1].trackId]: '||----o-------s-------o-------s---||',
        [initialTracks[2].trackId]: '||o-p-o-p-o-p-o-p-o-p-o-p-o-p-o-p-||'
    },
    // Mixer state is now part of the main state object, keyed by trackId
    mixer: {
        [initialTracks[0].trackId]: { volume: 1.0, muted: false, unmutedVolume: 1.0 },
        [initialTracks[1].trackId]: { volume: 0.8, muted: false, unmutedVolume: 0.8 },
        [initialTracks[2].trackId]: { volume: 0.6, muted: true, unmutedVolume: 0.6 },
    },
    metrics: {},
    activeSounds: Object.fromEntries(
        initialTracks.map(track => [track.trackId, track.instrument.sounds[0].letter])
    ),
};

// --- DOM REFERENCES & COMPONENT INSTANCES ---
const rowsContainer = document.getElementById('rows-inner-container');
const callbackLogEl = document.getElementById('callback-log');
const editorCursor = new EditorCursor();

// --- CORE LOGIC & STATE MANAGEMENT ---
function logCallback(name, data) {
    const entry = document.createElement('div');
    entry.textContent = `[${name}] Fired with: ${JSON.stringify(data)}`;
    callbackLogEl.appendChild(entry);
    callbackLogEl.scrollTop = callbackLogEl.scrollHeight;
}

function rerender() {
    rowsContainer.innerHTML = '';
    const totalCells = (mockState.metrics.beatsPerMeasure / mockState.metrics.beatUnit) * mockState.metrics.subdivision;
    let densityClass = 'density-medium';
    if (totalCells <= 12) densityClass = 'density-low';
    else if (totalCells > 32) densityClass = 'density-high';

    mockState.tracks.forEach((track) => {
        const container = document.createElement('div');
        rowsContainer.appendChild(container);
        const trackId = track.trackId;

        const view = new PlaybackRowView(container, {
            onGridMouseEnter: (instrument) => {
                const soundLetter = mockState.activeSounds[trackId];
                const sound = instrument.sounds.find(s => s.letter === soundLetter);
                if (sound) {
                    editorCursor.update({ isVisible: true, svg: sound.svg });
                }
            },
            onGridMouseLeave: () => editorCursor.update({ isVisible: false, svg: null }),
            onCellMouseDown: (tickIndex, event, hasNote) => {
                logCallback('onCellMouseDown', { trackId, tickIndex, hasNote });
                let patternArr = (mockState.pattern[trackId] || '').replace(/\|/g, '').split('');
                if (hasNote) {
                    patternArr[tickIndex] = '-';
                } else {
                    patternArr[tickIndex] = mockState.activeSounds[trackId];
                }
                mockState.pattern[trackId] = '||' + patternArr.join('') + '||';
                rerender(); // Simple rerender on click
            },
            // Mixer Callbacks
            onVolumeChange: (id, vol) => {
                logCallback('onVolumeChange', { id, vol });
                const trackState = mockState.mixer[id];
                if (trackState) {
                    trackState.volume = vol;
                    trackState.muted = (vol === 0);
                    if (vol > 0) trackState.unmutedVolume = vol;
                    rerender();
                }
            },
            onToggleMute: (id) => {
                logCallback('onToggleMute', { id });
                const trackState = mockState.mixer[id];
                if (trackState) {
                    trackState.muted = !trackState.muted;
                    trackState.volume = trackState.muted ? 0 : trackState.unmutedVolume;
                    rerender();
                }
            },
        });

        // Pass combined props to the new component
        const mixerState = mockState.mixer[trackId];
        view.render({
            instrument: track.instrument,
            notation: mockState.pattern[trackId],
            metrics: mockState.metrics,
            densityClass: densityClass,
            id: trackId,
            volume: mixerState.volume,
            muted: mixerState.muted,
        });
    });
}

// --- UI EVENT BINDINGS ---
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

// --- INITIAL RENDER ---
updateMetrics();
logEvent('info', 'Workbench', 'init', 'Lifecycle', 'Workbench initialized and rendered.');