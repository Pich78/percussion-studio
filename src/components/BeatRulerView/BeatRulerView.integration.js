// file: src/components/BeatRulerView/BeatRulerView.integration.js

import { BeatRulerView } from './BeatRulerView.js';
import { Logger, logEvent } from '/percussion-studio/lib/Logger.js';

// --- INITIALIZATION ---
Logger.init({ level: 'debug' });
Logger.setTarget('log-output');

// --- DOM REFERENCES & COMPONENT INSTANCES ---
const rulerContainer = document.getElementById('ruler-container');
const dummyGridContainer = document.getElementById('dummy-grid-container');
const numeratorInput = document.getElementById('ts-numerator');
const denominatorInput = document.getElementById('ts-denominator');
const subdivisionSelect = document.getElementById('subdivision-select');

const beatRulerView = new BeatRulerView(rulerContainer);

// --- CORE LOGIC & STATE MANAGEMENT ---

/**
 * This function simulates the layout algorithm from our design specification.
 * It takes user-friendly inputs and converts them into the props the ruler needs.
 */
function calculateLayout(metrics) {
    const { beatsPerMeasure, beatUnit, subdivision } = metrics;
    const totalBoxes = (beatsPerMeasure / beatUnit) * subdivision;
    const beatGrouping = subdivision / beatUnit;

    const IDEAL_MAX_BOXES = 16;
    const ABSOLUTE_MAX_BOXES = 20;

    // Rule 1 & 2: The "Comfort" and "Tolerance" Zones
    if (totalBoxes <= ABSOLUTE_MAX_BOXES) {
        return { groupingPattern: [totalBoxes], beatGrouping };
    }

    // Rule 3: Asymmetrical Splits (add more as needed)
    if (beatsPerMeasure === 7) {
        const beat1Boxes = 4 * beatGrouping;
        const beat2Boxes = 3 * beatGrouping;
        return { groupingPattern: [beat1Boxes, beat2Boxes], beatGrouping };
    }

    // Rule 4: Symmetric Split (Minimal Fragmentation)
    let bestChunkSize = beatGrouping; // Start with single beats
    for (let beatsInChunk = beatsPerMeasure; beatsInChunk > 1; beatsInChunk--) {
        if ((beatsPerMeasure % beatsInChunk) === 0) { // Only check even divisions
            let boxesInChunk = beatsInChunk * beatGrouping;
            if (boxesInChunk <= IDEAL_MAX_BOXES) {
                bestChunkSize = boxesInChunk;
                break;
            }
        }
    }
    
    const groupingPattern = Array(totalBoxes / bestChunkSize).fill(bestChunkSize);
    return { groupingPattern, beatGrouping };
}

function renderDummyGrid(layout) {
    const { groupingPattern, beatGrouping } = layout;
    dummyGridContainer.innerHTML = '';
    for (const boxesInLine of groupingPattern) {
        const lineEl = document.createElement('div');
        lineEl.className = 'dummy-grid-line';
        for (let i = 0; i < boxesInLine; i++) {
            const cellEl = document.createElement('div');
            cellEl.className = 'dummy-cell';
            if ((i % beatGrouping) === 0) {
                cellEl.classList.add('strong-beat');
            }
            lineEl.appendChild(cellEl);
        }
        dummyGridContainer.appendChild(lineEl);
    }
}


function rerender() {
    const beatsPerMeasure = parseInt(numeratorInput.value, 10);
    const beatUnit = parseInt(denominatorInput.value, 10);
    const subdivision = parseInt(subdivisionSelect.value, 10);

    if (!beatsPerMeasure || !beatUnit || !subdivision) return;
    
    const metrics = { beatsPerMeasure, beatUnit, subdivision };
    logEvent('info', 'Workbench', 'rerender', 'Metrics', 'Calculating new layout with metrics:', metrics);

    const layout = calculateLayout(metrics);
    logEvent('info', 'Workbench', 'rerender', 'Layout', 'Calculated layout props:', layout);
    
    // Render the actual component
    beatRulerView.render(layout);
    // Render the dummy grid for visual alignment
    renderDummyGrid(layout);
}

// --- UI EVENT BINDINGS ---
[numeratorInput, denominatorInput, subdivisionSelect].forEach(el => el.addEventListener('change', rerender));

// --- INITIAL RENDER ---
rerender();
logEvent('info', 'Workbench', 'init', 'Lifecycle', 'Workbench initialized and rendered.');