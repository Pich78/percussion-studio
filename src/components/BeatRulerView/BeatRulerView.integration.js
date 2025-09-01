// file: src/components/BeatRulerView/BeatRulerView.integration.js

import { BeatRulerView } from './BeatRulerView.js';
import { Logger, logEvent } from '/percussion-studio/lib/Logger.js';

// --- INITIALIZATION ---
Logger.init({ level: 'debug' });
Logger.setTarget('log-output');

// --- DOM REFERENCES ---
const rulerContainer = document.getElementById('ruler-container');
const dummyGridContainer = document.getElementById('dummy-grid-container');
const boxesInput = document.getElementById('boxes-input');
const groupingInput = document.getElementById('grouping-input');
const startingBeatInput = document.getElementById('starting-beat-input');

const beatRulerView = new BeatRulerView(rulerContainer);

// --- CORE LOGIC ---
function renderDummyGrid(boxesInLine) {
    dummyGridContainer.innerHTML = '';
    for (let i = 0; i < boxesInLine; i++) {
        const cellEl = document.createElement('div');
        cellEl.className = 'dummy-cell';
        dummyGridContainer.appendChild(cellEl);
    }
}

function rerender() {
    const boxesInLine = parseInt(boxesInput.value, 10);
    const beatGrouping = parseInt(groupingInput.value, 10);
    const startingBeat = parseInt(startingBeatInput.value, 10);

    if (isNaN(boxesInLine) || isNaN(beatGrouping) || isNaN(startingBeat)) return;
    
    const props = {
        groupingPattern: [boxesInLine],
        beatGrouping: beatGrouping,
        startingBeat: startingBeat
    };
    
    logEvent('info', 'Workbench', 'rerender', 'Props', 'Rendering with props:', props);
    
    beatRulerView.render(props);
    renderDummyGrid(boxesInLine);
}

// --- UI EVENT BINDINGS ---
[boxesInput, groupingInput, startingBeatInput].forEach(el => el.addEventListener('change', rerender));

// --- INITIAL RENDER ---
rerender();
logEvent('info', 'Workbench', 'init', 'Lifecycle', 'Workbench initialized.');