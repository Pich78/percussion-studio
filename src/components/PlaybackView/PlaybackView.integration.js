// file: src/components/PlaybackView/PlaybackView.integration.js

import { PlaybackView } from './PlaybackView.js';
import { Logger, logEvent } from '/percussion-studio/lib/Logger.js';

// --- INITIALIZATION ---
Logger.init({ level: 'debug' });
Logger.setTarget('log-output');

// --- MOCK CHILD COMPONENT (Placeholder) ---
// This simulates the real PlaybackMeasureView for this workbench.
class PlaybackMeasureViewPlaceholder {
    constructor(container) {
        this.container = container;
        this.isActive = false;
    }
    render(measureData) {
        this.container.style.border = '1px solid #ccc';
        this.container.style.padding = '1rem';
        this.container.style.backgroundColor = '#fff';
        this.container.style.transition = 'background-color 0.2s ease';
        
        this.container.innerHTML = `
            <h4 class="mt0 mb2">Measure #${measureData.id}</h4>
            <p class="f6 gray mv0">Ticks: ${measureData.startTick} to ${measureData.endTick - 1}</p>
        `;
    }
    updatePlaybackIndicator(tick, isActive) {
        if (this.isActive !== isActive) {
            this.isActive = isActive;
            this.container.style.backgroundColor = isActive ? '#fffde7' : '#fff'; // Highlight yellow
        }
    }
    destroy() {
        this.container.innerHTML = '';
    }
}

// --- MOCK RHYTHM DATA ---
const mockRhythms = {
    simple: {
        measures: [
            { id: 'm1', startTick: 0, endTick: 16 },
        ]
    },
    complex: {
        measures: [
            { id: 'm1', startTick: 0, endTick: 16 },
            { id: 'm2', startTick: 16, endTick: 28 }, // 12 ticks (e.g., a 6/8 measure)
            { id: 'm3', startTick: 28, endTick: 44 },
        ]
    }
};

// --- DOM REFERENCES & COMPONENT INSTANCE ---
const viewContainer = document.getElementById('playback-view-container');
const rhythmSelect = document.getElementById('rhythm-select');
const playheadSlider = document.getElementById('playhead-slider');
const playheadValueEl = document.getElementById('playhead-value');

// Instantiate the main view, injecting our mock child component
const playbackView = new PlaybackView(viewContainer, {
    PlaybackMeasureView: PlaybackMeasureViewPlaceholder
});

// --- CORE LOGIC ---
function rerender() {
    const selectedKey = rhythmSelect.value;
    const rhythm = mockRhythms[selectedKey];
    if (!rhythm) return;

    logEvent('info', 'Workbench', 'rerender', 'State', `Rendering rhythm: '${selectedKey}'`);
    playbackView.render(rhythm);
    
    // Update slider max value based on the rhythm length
    const totalTicks = rhythm.measures[rhythm.measures.length - 1].endTick;
    playheadSlider.max = totalTicks - 1;
    playheadSlider.value = 0;
    playheadValueEl.textContent = '0';
    playbackView.updatePlaybackIndicator(0);
}

// --- UI EVENT BINDINGS ---
// Populate select dropdown
Object.keys(mockRhythms).forEach(key => {
    const option = document.createElement('option');
    option.value = key;
    option.textContent = key.charAt(0).toUpperCase() + key.slice(1) + ` (${mockRhythms[key].measures.length} Measures)`;
    rhythmSelect.appendChild(option);
});

rhythmSelect.addEventListener('change', rerender);

playheadSlider.addEventListener('input', (event) => {
    const tick = parseInt(event.target.value, 10);
    playheadValueEl.textContent = tick;
    playbackView.updatePlaybackIndicator(tick);
});


// --- INITIAL RENDER ---
rerender();
logEvent('info', 'Workbench', 'init', 'Lifecycle', 'Workbench initialized.');