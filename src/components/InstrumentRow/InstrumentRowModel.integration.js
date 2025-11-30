// file: src/components/InstrumentRow/InstrumentRowModel.integration.js

import { InstrumentRowModel } from './InstrumentRowModel.js';

const modeSelect = document.getElementById('mode-select');
const notationInput = document.getElementById('notation-input');
const createBtn = document.getElementById('create-btn');

// Action Sections
const playbackActions = document.getElementById('playback-actions');
const editorActions = document.getElementById('editor-actions');

// Action Buttons/Controls
const toggleMuteBtn = document.getElementById('toggle-mute-btn');
const volumeSlider = document.getElementById('volume-slider');
const updateCellBtn = document.getElementById('update-cell-btn');

const output = document.getElementById('view-model-output');

let model = null;

const MOCK_ROW_DATA = {
    instrument: { name: '808 Kit', volume: 0.8, sounds: [{letter: 'o', svg: 'o'}, {letter: 'x', svg: 'x'}] },
    metrics: { beatGrouping: 4, feel: 'duple' },
};

function createNewModel() {
    const selectedMode = modeSelect.value;
    const initialProps = {
        mode: selectedMode,
        rowData: {
            ...MOCK_ROW_DATA,
            instrument: { // Create a fresh instrument object to reset volume
                ...MOCK_ROW_DATA.instrument,
                volume: parseFloat(volumeSlider.value)
            },
            notation: notationInput.value,
        }
    };

    model = new InstrumentRowModel({
        initialProps,
        onUpdate: (updatedModel) => {
            console.log('Model updated! Firing onUpdate callback.');
            render(updatedModel);
        }
    });

    console.log("New InstrumentRowModel created.");
    render(model);
    updateActionUI(selectedMode);
}

function render(modelInstance) {
    if (!modelInstance) {
        output.textContent = 'No model instance.';
        return;
    }

    const viewModel = {
        headerTagName: modelInstance.headerTagName,
        gridColumnSpan: modelInstance.gridColumnSpan,
        instrumentData: modelInstance.instrumentData,
        gridCells: modelInstance.gridModel.cells,
        currentState: modelInstance.getCurrentState(),
    };

    output.textContent = JSON.stringify(viewModel, null, 2);
    
    // Keep the slider in sync with the model's actual volume
    volumeSlider.value = modelInstance.instrumentData.volume;
}

/**
 * Updates the visibility of the action panels based on the current mode.
 * @param {string} mode - 'playback' or 'editor'
 */
function updateActionUI(mode) {
    if (mode === 'playback') {
        playbackActions.classList.remove('hidden');
        editorActions.classList.add('hidden');
    } else if (mode === 'editor') {
        playbackActions.classList.add('hidden');
        editorActions.classList.remove('hidden');
    }
}

// --- Event Listeners ---
createBtn.addEventListener('click', createNewModel);
modeSelect.addEventListener('change', createNewModel);

toggleMuteBtn.addEventListener('click', () => {
    model?.toggleMute();
});

// NEW: Wire up the volume slider to the setVolume method
volumeSlider.addEventListener('input', () => {
    const newVolume = parseFloat(volumeSlider.value);
    model?.setVolume(newVolume);
});

updateCellBtn.addEventListener('click', () => {
    const currentState = model.gridModel.getCurrentState();
    const firstChar = currentState.notation.charAt(0);
    const newChar = firstChar === '-' ? 'x' : '-';
    model.gridModel.updateCell(0, newChar);
});

// --- Initial Setup ---
createNewModel();