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
const legendContainer = document.getElementById('legend-container');

// --- MOCK DATA ---
const svgCircle = '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" stroke="currentColor" stroke-width="8" fill="none"/></svg>';
const svgCross = '<svg viewBox="0 0 100 100"><line x1="10" y1="10" x2="90" y2="90" stroke="currentColor" stroke-width="8"/><line x1="10" y1="90" x2="90" y2="10" stroke="currentColor" stroke-width="8"/></svg>';
const svgSquare = '<svg viewBox="0 0 100 100"><rect x="10" y="10" width="80" height="80" stroke="currentColor" stroke-width="8" fill="none"/></svg>';
const svgTriangle = '<svg viewBox="0 0 100 100"><polygon points="50,10 90,90 10,90" stroke="currentColor" stroke-width="8" fill="none"/></svg>';
const svgDiamond = '<svg viewBox="0 0 100 100"><polygon points="50,10 90,50 50,90 10,50" stroke="currentColor" stroke-width="8" fill="none"/></svg>';

const ALL_SOUNDS = [
    { letter: 'o', svg: svgCircle },
    { letter: 'x', svg: svgCross },
    { letter: 's', svg: svgSquare },
    { letter: 't', svg: svgTriangle },
    { letter: 'd', svg: svgDiamond },
];

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
    timeSignatureSelect.value = '4/4';
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

function updateLegend() {
    legendContainer.innerHTML = '';
    ALL_SOUNDS.forEach(sound => {
        const item = document.createElement('div');
        item.className = 'legend-item mr2 mb2';
        item.innerHTML = `
            <div class="legend-svg">${sound.svg}</div>
            <code class="f5 b">${sound.letter}</code>
        `;
        legendContainer.appendChild(item);
    });
}

// --- CORE RENDER LOGIC ---
function rerender() {
    gridWrapper.innerHTML = '';
    const tsKey = timeSignatureSelect.value;
    const subKey = subdivisionSelect.value;
    const metrics = METRICS_CONFIG[tsKey]?.subdivisions[subKey];

    if (!metrics) return;
    
    logEvent('debug', 'Workbench', 'rerender', 'State', 'Rerendering grid...');
    const rawNotation = notationInput.value;
    const expectedLength = metrics.totalBoxes;
    const finalNotation = rawNotation.padEnd(expectedLength, '-').slice(0, expectedLength);

    const instrument = { symbol: 'DRM', sounds: ALL_SOUNDS };

    let notationCursor = 0;
    metrics.groupingPattern.forEach((rowLength) => {
        const rowContainer = document.createElement('div');
        gridWrapper.appendChild(rowContainer);
        const gridView = new GridPanelView(rowContainer, interactiveCallbacks);

        const notationForRow = finalNotation.substring(notationCursor, notationCursor + rowLength);
        notationCursor += rowLength;

        gridView.render({
            instrument: instrument,
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
notationInput.addEventListener('input', rerender);

// --- INITIALIZATION ---
populateTimeSignatures();
populateSubdivisions();
updateLegend();
logEvent('info', 'Workbench', 'init', 'Lifecycle', 'Workbench initialized.');