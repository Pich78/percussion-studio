// file: src/components/GridPanel/GridPanel.workbench.js

import './GridPanel.js';
import { Logger, logEvent } from '/percussion-studio/lib/Logger.js';
import { METRICS_CONFIG } from '/percussion-studio/src/config/MetricsConfiguration.js';

Logger.init({ level: 'debug' });
Logger.setTarget('log-output');

const gridContainer = document.getElementById('grid-container');
const timeSignatureSelect = document.getElementById('time-signature-select');
const subdivisionSelect = document.getElementById('subdivision-select');
const notationInput = document.getElementById('notation-input');
const legendContainer = document.getElementById('legend-container');

const ALL_SOUNDS = [
    { letter: 'o', svg: '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" stroke="currentColor" stroke-width="8" fill="none"/></svg>' },
    { letter: 'x', svg: '<svg viewBox="0 0 100 100"><line x1="10" y1="10" x2="90" y2="90" stroke="currentColor" stroke-width="8"/><line x1="10" y1="90" x2="90" y2="10" stroke="currentColor" stroke-width="8"/></svg>' },
    { letter: 's', svg: '<svg viewBox="0 0 100 100"><rect x="10" y="10" width="80" height="80" stroke="currentColor" stroke-width="8" fill="none"/></svg>' },
    { letter: 't', svg: '<svg viewBox="0 0 100 100"><polygon points="50,10 90,90 10,90" stroke="currentColor" stroke-width="8" fill="none"/></svg>' },
];

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
        const option = new Option(subdivisions[sub].label, sub);
        subdivisionSelect.add(option);
    });
    rerender();
}

function updateLegend() {
    legendContainer.innerHTML = ALL_SOUNDS.map(sound => `
        <div class="legend-item mr2 mb2">
            <div class="legend-svg">${sound.svg}</div>
            <code class="f5 b">${sound.letter}</code>
        </div>
    `).join('');
}

function rerender() {
    gridContainer.innerHTML = '';
    const tsKey = timeSignatureSelect.value;
    const subKey = subdivisionSelect.value;
    const metrics = METRICS_CONFIG[tsKey]?.subdivisions[subKey];
    if (!metrics) return;
    
    const rawNotation = notationInput.value.padEnd(metrics.totalBoxes, '-');
    const instrument = { sounds: ALL_SOUNDS };
    let notationCursor = 0;

    metrics.groupingPattern.forEach((rowLength, index) => {
        const lineWrapper = document.createElement('div');
        lineWrapper.style.width = '100%';
        if (index > 0) lineWrapper.style.marginTop = '0.25rem';

        const gridPanel = document.createElement('grid-panel');
        
        // Pass data via properties
        gridPanel.instrument = instrument;
        gridPanel.metrics = { beatGrouping: metrics.beatGrouping, feel: metrics.feel };
        gridPanel.notation = rawNotation.substring(notationCursor, notationCursor + rowLength);
        
        // Listen for custom events
        gridPanel.addEventListener('cell-mousedown', (e) => {
            logEvent('info', 'Workbench', 'cell-mousedown', 'Event', `Cell ${e.detail.tickIndex} clicked.`);
        });
        
        lineWrapper.appendChild(gridPanel);
        gridContainer.appendChild(lineWrapper);
        notationCursor += rowLength;
    });
}

timeSignatureSelect.addEventListener('change', populateSubdivisions);
subdivisionSelect.addEventListener('change', rerender);
notationInput.addEventListener('input', rerender);

populateTimeSignatures();
populateSubdivisions();
updateLegend();
logEvent('info', 'Workbench', 'init', 'Lifecycle', 'Workbench initialized.');