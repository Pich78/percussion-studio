// file: src/components/GridPanelView/GridPanelView.integration.js

import { GridPanelView } from './GridPanelView.js';
import { Logger, logEvent } from '/percussion-studio/lib/Logger.js';

// --- INITIALIZATION ---
Logger.init({ level: 'debug' });
Logger.setTarget('log-output');

// --- DOM REFERENCES ---
const gridContainer = document.getElementById('grid-container');
const notationInput = document.getElementById('notation-input');
const feelSelect = document.getElementById('feel-select');
const groupingInput = document.getElementById('grouping-input');
const callbackLogOutput = document.getElementById('callback-log-output');

// --- MOCK DATA ---
const mockInstrument = { 
    symbol: 'KCK', 
    sounds: [
        { letter: 'o', svg: '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="currentColor"/></svg>' }
    ] 
};

// --- FAKE CALLBACKS for MANUAL TESTING ---
function logCallback(eventName, data) {
    const logEntry = document.createElement('div');
    const simpleData = { 
        tickIndex: data.tickIndex, 
        hasNote: data.hasNote,
        instrument: data.instrument.symbol,
    };
    logEntry.textContent = `[${eventName}] - ${JSON.stringify(simpleData)}`;
    callbackLogOutput.appendChild(logEntry);
    callbackLogOutput.scrollTop = callbackLogOutput.scrollHeight;
}

const interactiveCallbacks = {
    onCellMouseDown: (data) => logCallback('onCellMouseDown', data),
    onCellMouseUp: (data) => logCallback('onCellMouseUp', data),
    onCellMouseEnter: (data) => logCallback('onCellMouseEnter', data),
};

// --- COMPONENT INSTANCE ---
// Pass the fake callbacks to the constructor
const gridView = new GridPanelView(gridContainer, interactiveCallbacks);

// --- CORE LOGIC ---
function rerender() {
    const notation = notationInput.value;
    const feel = feelSelect.value;
    const beatGrouping = parseInt(groupingInput.value, 10) || 4;
    
    const props = {
        instrument: mockInstrument,
        notation: notation,
        metrics: {
            feel: feel,
            beatGrouping: beatGrouping
        }
    };

    logEvent('info', 'Workbench', 'rerender', 'Props', 'Rendering with new props:', props);
    gridView.render(props);
}

// --- UI EVENT BINDINGS ---
[notationInput, feelSelect, groupingInput].forEach(el => {
    el.addEventListener('change', rerender);
    el.addEventListener('input', rerender);
});

// --- INITIAL RENDER ---
rerender();
logEvent('info', 'Workbench', 'init', 'Lifecycle', 'Workbench initialized.');