// file: src/components/BeatRulerView/BeatRulerView.integration.js

import { BeatRulerView } from './BeatRulerView.js';
import { Logger, logEvent } from '/percussion-studio/lib/Logger.js';
import { METRICS_CONFIG } from '../../config/MetricsConfiguration.js';

// --- INITIALIZATION ---
Logger.init({ level: 'debug' });
Logger.setTarget('log-output');

// --- DOM REFERENCES ---
const timeSignatureSelect = document.getElementById('time-signature-select');
const subdivisionSelect = document.getElementById('subdivision-select');
const measureContainer = document.getElementById('measure-container');

// --- UI POPULATION ---
function populateTimeSignatures() {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}][Workbench][populateTimeSignatures][UI][Populating time signatures]`);
    logEvent('debug', 'Workbench', 'populateTimeSignatures', 'UI', 'Populating time signatures');
    timeSignatureSelect.innerHTML = '';
    for (const key in METRICS_CONFIG) {
        const option = document.createElement('option');
        option.value = key;
        option.textContent = METRICS_CONFIG[key].label;
        timeSignatureSelect.appendChild(option);
    }
}

function populateSubdivisions() {
    const timeSigKey = timeSignatureSelect.value;
    logEvent('debug', 'Workbench', 'populateSubdivisions', 'UI', `Populating subdivisions for ${timeSigKey}`);
    subdivisionSelect.innerHTML = '';
    const subdivisions = METRICS_CONFIG[timeSigKey]?.subdivisions || {};
    for (const key in subdivisions) {
        const option = document.createElement('option');
        option.value = key;
        option.textContent = subdivisions[key].label;
        subdivisionSelect.appendChild(option);
    }
}

// --- CORE LOGIC ---
function renderDummyGrid(container, boxesInLine) {
    container.innerHTML = '';
    for (let i = 0; i < boxesInLine; i++) {
        const cellEl = document.createElement('div');
        cellEl.className = 'dummy-cell';
        container.appendChild(cellEl);
    }
}

function rerender() {
    const timeSigKey = timeSignatureSelect.value;
    const subdivisionKey = subdivisionSelect.value;
    
    if (!timeSigKey || !subdivisionKey) {
        logEvent('warn', 'Workbench', 'rerender', 'State', 'Cannot render, missing selection.');
        return;
    }

    const config = METRICS_CONFIG[timeSigKey].subdivisions[subdivisionKey];
    logEvent('info', 'Workbench', 'rerender', 'Props', 'Rendering with config:', config);

    measureContainer.innerHTML = '';
    let startingBeat = 1;

    config.groupingPattern.forEach((boxesInThisLine, index) => {
        logEvent('debug', 'Workbench', 'rerender', 'Loop', `Rendering line ${index + 1} with ${boxesInThisLine} boxes, starting at beat ${startingBeat}`);

        // Create the structure for one line
        const panelEl = document.createElement('div');
        panelEl.className = 'mock-panel';
        
        const emptyHeaderEl = document.createElement('div');
        emptyHeaderEl.className = 'mock-empty-header';

        const rulerContainerEl = document.createElement('div');
        rulerContainerEl.className = 'mock-ruler-container';

        const emptyHeaderCell2 = document.createElement('div'); // For alignment in grid
        
        const dummyGridContainerEl = document.createElement('div');
        dummyGridContainerEl.className = 'mock-dummy-grid';

        panelEl.append(emptyHeaderEl, rulerContainerEl, emptyHeaderCell2, dummyGridContainerEl);
        measureContainer.appendChild(panelEl);

        // Render the ruler for this line
        const beatRulerView = new BeatRulerView(rulerContainerEl);
        const props = {
            groupingPattern: [boxesInThisLine], // Component expects an array for width
            beatGrouping: config.beatGrouping,
            startingBeat: startingBeat
        };
        beatRulerView.render(props);

        // Render the corresponding dummy grid
        renderDummyGrid(dummyGridContainerEl, boxesInThisLine);

        // Update the starting beat for the next line
        startingBeat += (boxesInThisLine / config.beatGrouping);
    });
}

// --- UI EVENT BINDINGS ---
timeSignatureSelect.addEventListener('change', () => {
    populateSubdivisions();
    rerender();
});
subdivisionSelect.addEventListener('change', rerender);

// --- INITIAL RENDER ---
populateTimeSignatures();
populateSubdivisions();
rerender();
logEvent('info', 'Workbench', 'init', 'Lifecycle', 'Workbench initialized with dynamic metrics.');