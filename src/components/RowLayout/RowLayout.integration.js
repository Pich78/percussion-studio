// file: src/components/RowLayout/RowLayout.integration.js

import { RowLayout } from './RowLayout.js';
import { GridPanelView } from '../GridPanelView/GridPanelView.js';
import { EditorRowHeaderView } from '../EditorRowHeaderView/EditorRowHeaderView.js';
import { PlaybackRowHeaderView } from '../PlaybackRowHeaderView/PlaybackRowHeaderView.js';
import { Logger, logEvent } from '/percussion-studio/lib/Logger.js';

// --- INITIALIZATION ---
Logger.init({ level: 'debug' });
Logger.setTarget('log-output');

// --- DOM REFERENCES ---
const wrapper = document.getElementById('row-layout-wrapper');
const controls = document.querySelectorAll('input[name="header-type"]');

// --- MOCK DATA & STATE ---

const mockGridCallbacks = {
    onCellMouseDown: (data) => {
        logEvent('info', 'Workbench', 'onCellMouseDown', 'Callback', `Grid cell mousedown at index: ${data.tickIndex}, HasNote: ${data.hasNote}`);
    },
    onCellMouseEnter: (data) => {
        logEvent('info', 'Workbench', 'onCellMouseEnter', 'Callback', `Grid cell mouseenter at index: ${data.tickIndex}`);
    },
    onCellMouseUp: (data) => {
        logEvent('info', 'Workbench', 'onCellMouseUp', 'Callback', `Grid cell mouseup at index: ${data.tickIndex}`);
    }
};

const mockGridProps = {
    instrument: { 
        symbol: 'HH', 
        sounds: [
            { letter: 'x', svg: '<svg viewBox="0 0 100 100"><line x1="10" y1="10" x2="90" y2="90" stroke="currentColor" stroke-width="8"/><line x1="10" y1="90" x2="90" y2="10" stroke="currentColor" stroke-width="8"/></svg>' },
            { letter: 'o', svg: '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" stroke="currentColor" stroke-width="8" fill="none"/></svg>' }
        ]
    },
    notation: 'x-o-x-o-x-o-x-o-',
    metrics: { beatGrouping: 4, feel: 'duple' }
};

const mockEditorHeaderProps = {
    instrument: {
        id: 'inst-1',
        name: 'Kick Drum',
        pack: 'Acoustic Kit'
    },
    callbacks: {
        onRequestInstrumentChange: (inst) => logEvent('info', 'Workbench', 'onRequestInstrumentChange', 'Callback', `Requested change for: ${inst.name}`)
    }
};

// --- REFACTORED STATE MANAGEMENT FOR PLAYBACK HEADER ---
const playbackHeaderState = {
    id: 'inst-1',
    name: 'Kick Drum',
    volume: 0.8,
    muted: false,
    unmutedVolume: 0.8, // Store the volume before muting
};

const playbackHeaderCallbacks = {
    onToggleMute: (id) => {
        logEvent('info', 'Workbench', 'onToggleMute', 'Callback', `Toggled mute for ${id}.`);
        const state = playbackHeaderState;
        state.muted = !state.muted;
        state.volume = state.muted ? 0 : state.unmutedVolume;
        updatePlaybackHeader(); // Targeted update, not a full re-render
    },
    onVolumeChange: (id, volume) => {
        logEvent('info', 'Workbench', 'onVolumeChange', 'Callback', `Volume for ${id} set to ${volume}`);
        const state = playbackHeaderState;
        state.volume = volume;
        state.muted = (volume === 0);
        if (volume > 0) {
            state.unmutedVolume = volume;
        }
        updatePlaybackHeader(); // Targeted update
    }
};

// --- GLOBAL COMPONENT INSTANCES ---
let currentLayout = null;
let currentHeader = null;
let currentGrid = null;
let currentHeaderType = 'editor';

/**
 * Updates just the PlaybackRowHeaderView with the latest state.
 * This prevents the entire layout from being destroyed on a simple volume change.
 */
function updatePlaybackHeader() {
    if (currentHeader && currentHeader instanceof PlaybackRowHeaderView) {
        logEvent('debug', 'Workbench', 'updatePlaybackHeader', 'State', 'Performing targeted update on PlaybackRowHeaderView.');
        currentHeader.render(playbackHeaderState);
    }
}

/**
 * Sets up the entire row layout. Called on initial load and when switching header types.
 * This function performs a full teardown and rebuild.
 */
function setupLayout() {
    logEvent('debug', 'Workbench', 'setupLayout', 'State', `Setting up layout with header: ${currentHeaderType}`);

    // Teardown existing components
    if (currentHeader) currentHeader.destroy();
    if (currentGrid) currentGrid.destroy();
    if (currentLayout) currentLayout.destroy();
    
    wrapper.innerHTML = ''; // Clear the container

    // Instantiate Layout
    currentLayout = new RowLayout(wrapper);
    const { headerArea, gridArea } = currentLayout;

    // Instantiate Header Component based on type
    if (currentHeaderType === 'editor') {
        currentHeader = new EditorRowHeaderView(headerArea, mockEditorHeaderProps);
        currentHeader.render();
    } else {
        currentHeader = new PlaybackRowHeaderView(headerArea, { callbacks: playbackHeaderCallbacks });
        currentHeader.render(playbackHeaderState);
    }

    // Instantiate Grid Component (it doesn't change)
    currentGrid = new GridPanelView(gridArea, mockGridCallbacks);
    currentGrid.render(mockGridProps);
}

// --- EVENT BINDINGS ---
controls.forEach(radio => {
    radio.addEventListener('change', (event) => {
        currentHeaderType = event.target.value;
        setupLayout(); // Full rebuild is correct when changing component types
    });
});

// --- INITIALIZATION ---
setupLayout();
logEvent('info', 'Workbench', 'init', 'Lifecycle', 'RowLayout workbench initialized.');