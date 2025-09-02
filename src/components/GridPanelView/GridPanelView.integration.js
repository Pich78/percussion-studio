// file: src/components/GridPanelView/GridPanelView.integration.js

import { GridPanelView } from './GridPanelView.js';
import { Logger, logEvent } from '/percussion-studio/lib/Logger.js';
import { METRICS_CONFIG } from '/percussion-studio/src/config/MetricsConfiguration.js';

// --- INITIALIZATION ---
Logger.init({ level: 'debug' });
Logger.setTarget('log-output');

// --- DOM REFERENCES ---
const gridWrapper = document.getElementById('grid-wrapper');
const timeSignatureSelect = document.getElementById('time-signature-select');
const subdivisionSelect = document.getElementById('subdivision-select');
const notationInput = document.getElementById('notation-input');

// --- MOCK DATA ---
const mockInstrument = { 
    symbol: 'KCK', 
    sounds: [
        { letter: 'o', svg: '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="currentColor"/></svg>' }
    ] 
};

// --- FAKE CALLBACKS ---
const interactiveCallbacks = {
    onCellMouseDown: (data) => {
        logEvent('info', 'Workbench', 'onCellMouseDown', 'Callback', `Clicked cell ${data.tickIndex}`);
    },
};

// --- UI LOGIC ---
function populateTimeSignatures() {
    Object.keys(METRICS_CONFIG).forEach(ts => {
        const option = document.createElement('option');
        option.value = ts;
        option.textContent = METRICS_CONFIG[ts].label;
        timeSignatureSelect.appendChild(option);
    });
    timeSignatureSelect.value = '4/4'; // Default
}

function populateSubdivisions() {
    const selectedTs = timeSignatureSelect.value;
    const subdivisions = METRICS_CONFIG[selectedTs]?.subdivisions || {};
    subdivisionSelect.innerHTML = '';

    Object.keys(subdivisions).forEach(sub => {
        const option = document.createElement('option');
        option.value = sub;
        option.textContent = subdivisions[sub].label;
        subdivisionSelect.appendChild(option);
    });
    rerender();
}

// --- CORE RENDER LOGIC ---
function rerender() {
    gridWrapper.innerHTML = '';
    
    const tsKey = timeSignatureSelect.value;
    const subKey = subdivisionSelect.value;
    const metrics = METRICS_CONFIG[tsKey]?.subdivisions[subKey];

    if (!metrics) {
        logEvent('error', 'Workbench', 'rerender', 'Config', 'Could not find metrics config for', {tsKey, subKey});
        return;
    }

    logEvent('info', 'Workbench', 'rerender', 'Config', 'Rendering with metrics:', metrics);
    
    // Adjust the raw notation string to fit the required length
    const rawNotation = notationInput.value;
    const expectedLength = metrics.totalBoxes;
    const finalNotation = rawNotation.padEnd(expectedLength, '-').slice(0, expectedLength);

    let notationCursor = 0;
    // For each row defined in the grouping pattern...
    metrics.groupingPattern.forEach((rowLength) => {
        const rowContainer = document.createElement('div');
        gridWrapper.appendChild(rowContainer);
        const gridView = new GridPanelView(rowContainer, interactiveCallbacks);

        const notationForRow = finalNotation.substring(notationCursor, notationCursor + rowLength);
        notationCursor += rowLength;

        gridView.render({
            instrument: mockInstrument,
            notation: notationForRow,
            metrics: {
                beatGrouping: metrics.beatGrouping,
                feel: metrics.feel,
            },
        });
    });
}

// --- UI EVENT BINDINGS ---
timeSignatureSelect.addEventListener('change', populateSubdivisions);
subdivisionSelect.addEventListener('change', rerender);
notationInput.addEventListener('input', rerender); // Re-render on notation change

// --- INITIAL RENDER ---
populateTimeSignatures();
populateSubdivisions();
logEvent('info', 'Workbench', 'init', 'Lifecycle', 'Workbench initialized.');