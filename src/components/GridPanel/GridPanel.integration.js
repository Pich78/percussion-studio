// file: src/components/GridPanel/GridPanel.integration.js

import { GridModel } from './GridModel.js';
import { GridPanel } from './GridPanel.js';

// --- DOM Element References ---
const gridContainer = document.getElementById('grid-container');
const notationInput = document.getElementById('notation-input');
const resetButton = document.getElementById('reset-btn');
const stateOutput = document.getElementById('state-output');
const cellsOutput = document.getElementById('cells-output');

// --- Mock Data ---
const MOCK_INSTRUMENT = { 
    sounds: [
        { letter: 'o', svg: '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" stroke="currentColor" stroke-width="8" fill="none"/></svg>' },
        { letter: 'x', svg: '<svg viewBox="0 0 100 100"><line x1="10" y1="10" x2="90" y2="90" stroke="currentColor" stroke-width="8"/><line x1="10" y1="90" x2="90" y2="10" stroke="currentColor" stroke-width="8"/></svg>' },
        { letter: 's', svg: '<svg viewBox="0 0 100 100"><rect x="10" y="10" width="80" height="80" stroke="currentColor" stroke-width="8" fill="none"/></svg>' },
        { letter: 't', svg: '<svg viewBox="0 0 100 100"><polygon points="50,10 90,90 10,90" stroke="currentColor" stroke-width="8" fill="none"/></svg>' },
    ]
};
const MOCK_METRICS = { beatGrouping: 4, feel: 'duple' };

// --- State Variables ---
let model = null;
let view = null;

/**
 * The main setup function. Creates the model and the view, and wires them together.
 */
function initialize() {
    // Clear previous view
    gridContainer.innerHTML = '';

    // --- 1. Create the Model ---
    // The model is instantiated with initial data and an `onUpdate` callback.
    model = new GridModel({
        initialProps: {
            notation: notationInput.value,
            metrics: MOCK_METRICS,
            instrument: MOCK_INSTRUMENT
        },
        onUpdate: (newCells) => {
            console.log("Model updated! Firing onUpdate callback to re-render the view.");
            if (view) {
                view.cells = newCells; // Update the view with the new props
            }
            updateOutputDisplays(); // Update the debug text
        }
    });

    // --- 2. Create the View ---
    view = document.createElement('grid-panel');

    // --- 3. Wire them together ---
    // Listen for events FROM the view
    view.addEventListener('cell-mousedown', (event) => {
        const { tickIndex, hasNote } = event.detail;
        console.log(`View fired 'cell-mousedown' for tick ${tickIndex}. Telling model to update.`);

        // Tell the MODEL to update itself based on the event
        const primarySound = MOCK_INSTRUMENT.sounds[0].letter;
        const newSound = hasNote ? '-' : primarySound;
        model.updateCell(tickIndex, newSound);
    });
    
    // --- 4. Initial Render ---
    // Give the view its initial set of cell data from the model
    view.cells = model.cells;
    gridContainer.appendChild(view);
    updateOutputDisplays();

    console.log("Integration harness initialized.");
}

/**
 * Updates the text displays with the current state of the model.
 */
function updateOutputDisplays() {
    if (!model) return;
    stateOutput.textContent = JSON.stringify(model.getCurrentState(), null, 2);
    cellsOutput.textContent = JSON.stringify(model.cells, null, 2);
}

// --- Event Listeners ---
resetButton.addEventListener('click', initialize);

// --- Go! ---
initialize();