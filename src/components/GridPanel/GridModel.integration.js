// file: src/components/GridPanel/GridModel.integration.js

import { GridModel } from './GridModel.js';

const notationInput = document.getElementById('notation-input');
const gridContainer = document.getElementById('interactive-grid-container');
const cellsOutput = document.getElementById('cells-output');
const stateOutput = document.getElementById('state-output');

let model = null;

const MOCK_PROPS = {
    instrument: { sounds: [{letter: 'o', svg: '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" stroke="currentColor" stroke-width="8" fill="none"/></svg>'}, {letter: 'x', svg: '<svg viewBox="0 0 100 100"><line x1="10" y1="10" x2="90" y2="90" stroke="currentColor" stroke-width="8"/><line x1="10" y1="90" x2="90" y2="10" stroke="currentColor" stroke-width="8"/></svg>'}] },
    metrics: { beatGrouping: 4, feel: 'duple' },
};

function createNewModel() {
    const initialProps = {
        ...MOCK_PROPS,
        notation: notationInput.value,
    };

    model = new GridModel({
        initialProps,
        onUpdate: (newCells) => {
            console.log('Model updated! Firing onUpdate callback.');
            render(newCells);
        }
    });

    // Initial render
    render(model.cells);
}

function render(cells) {
    // Render the interactive view
    gridContainer.innerHTML = '';
    cells.forEach(cell => {
        const cellEl = document.createElement('div');
        cellEl.className = 'interactive-cell';
        cellEl.style.backgroundColor = cell.shadingClass.includes('downbeat') ? '#ced4da' : '#fff';
        cellEl.innerHTML = cell.symbolSVG || '';
        
        cellEl.addEventListener('click', () => {
            // Tell the model to update itself
            const newSound = cell.hasNote ? '-' : MOCK_PROPS.instrument.sounds[0].letter;
            model.updateCell(cell.tickIndex, newSound);
        });
        gridContainer.appendChild(cellEl);
    });

    // Render the output data
    cellsOutput.textContent = JSON.stringify(cells, null, 2);
    stateOutput.textContent = JSON.stringify(model.getCurrentState(), null, 2);
}

notationInput.addEventListener('change', createNewModel);

// Initial creation
createNewModel();