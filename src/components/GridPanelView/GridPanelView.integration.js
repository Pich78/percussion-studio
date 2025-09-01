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

// --- MOCK DATA ---
const mockInstrument = { 
    symbol: 'KCK', 
    sounds: [
        { letter: 'o', svg: '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="currentColor"/></svg>' }
    ] 
};

// --- COMPONENT INSTANCE ---
const gridView = new GridPanelView(gridContainer, {});

// --- CORE LOGIC ---
function rerender() {
    const notation = notationInput.value;
    const feel = feelSelect.value;
    const beatGrouping = parseInt(groupingInput.value, 10);
    
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
[notationInput, feelSelect, groupingInput].forEach(el => el.addEventListener('change', rerender));

// --- INITIAL RENDER ---
rerender();
logEvent('info', 'Workbench', 'init', 'Lifecycle', 'Workbench initialized.');