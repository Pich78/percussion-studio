// file: src/components/MeasureEditorView/MeasureEditorView.js

import { loadCSS } from '/percussion-studio/lib/dom.js';
import { logEvent } from '/percussion-studio/lib/Logger.js';
import { InstrumentRowView } from '/percussion-studio/src/components/InstrumentRowView/InstrumentRowView.js';
import { InstrumentSelectionModalView } from '/percussion-studio/src/components/InstrumentSelectionModalView/InstrumentSelectionModalView.js';

export class MeasureEditorView {
    constructor(container, { instrumentDefs, soundPacks }) {
        this.container = container;
        this.callbacks = {}; // Future use for reporting changes up

        // --- STATE MANAGEMENT ---
        // This component is stateful. It manages the list of instruments in the measure.
        this.state = {
            instruments: [], // Starts empty
            metrics: { beatsPerMeasure: 4, beatUnit: 4, subdivision: 16, grouping: 4 },
            manifest: { instrumentDefs, soundPacks } // Data needed for the modal
        };

        loadCSS('/percussion-studio/src/components/MeasureEditorView/MeasureEditorView.css');
        
        // --- SERVICE INSTANTIATION ---
        // The MeasureEditor owns the modal it uses to add new instruments.
        // It's created once and reused.
        this.instrumentModal = new InstrumentSelectionModalView(
            document.getElementById('modal-container'), // Assumes a global modal container
            { onInstrumentSelected: this._confirmAddInstrument.bind(this) }
        );

        // Use event delegation for add/delete buttons
        this.container.addEventListener('click', this._handleClick.bind(this));
        
        this.render();
        logEvent('info', 'MeasureEditorView', 'constructor', 'Lifecycle', 'Component created.');
    }

    render() {
        this.container.innerHTML = ''; // Clear the container

        // --- Render Instrument Rows ---
        this.state.instruments.forEach(instrument => {
            const rowWrapper = document.createElement('div');
            rowWrapper.className = 'measure-instrument-row';

            // Container for the InstrumentRowView component
            const viewContainer = document.createElement('div');
            viewContainer.className = 'instrument-row-container';
            
            // Delete button for this row
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-row-btn';
            deleteBtn.innerHTML = '×'; // Simple X symbol
            deleteBtn.dataset.symbol = instrument.symbol; // Link button to instrument

            const view = new InstrumentRowView(viewContainer, {});

            const totalCells = (this.state.metrics.beatsPerMeasure / this.state.metrics.beatUnit) * this.state.metrics.subdivision;
            let densityClass = 'density-medium';
            if (totalCells <= 8) densityClass = 'density-low';
            if (totalCells > 20) densityClass = 'density-high';
            
            view.render({
                instrument,
                notation: instrument.pattern,
                metrics: this.state.metrics,
                densityClass
            });
            
            rowWrapper.appendChild(viewContainer);
            rowWrapper.appendChild(deleteBtn);
            this.container.appendChild(rowWrapper);
        });

        // --- Render "Add Instrument" Button ---
        const addBtnContainer = document.createElement('div');
        addBtnContainer.className = 'add-instrument-container';
        const addBtn = document.createElement('button');
        addBtn.className = 'add-instrument-btn';
        addBtn.textContent = '+';
        addBtnContainer.appendChild(addBtn);
        this.container.appendChild(addBtnContainer);
    }

    // --- EVENT HANDLING & ACTIONS ---

    _handleClick(event) {
        const addBtn = event.target.closest('.add-instrument-btn');
        const deleteBtn = event.target.closest('.delete-row-btn');

        if (addBtn) {
            this._handleAddInstrument();
            return;
        }

        if (deleteBtn) {
            this._handleDeleteInstrument(deleteBtn.dataset.symbol);
            return;
        }
    }

    _handleAddInstrument() {
        logEvent('info', 'MeasureEditorView', '_handleAddInstrument', 'Events', 'Requesting to add new instrument.');
        this.instrumentModal.show({
            instrumentDefs: this.state.manifest.instrumentDefs,
            soundPacks: this.state.manifest.soundPacks
        });
    }

    _confirmAddInstrument(selection) {
        logEvent('info', 'MeasureEditorView', '_confirmAddInstrument', 'State', 'Adding instrument:', selection);
        
        // In a real app, you would fetch the full instrument data based on the selection.
        // Here, we'll just create a mock instrument.
        const newInstrument = {
            symbol: selection.symbol,
            name: this.state.manifest.instrumentDefs.find(def => def.symbol === selection.symbol)?.name || 'New Instrument',
            sounds: [{ letter: 'x', svg: '<svg viewBox="0 0 100 100"><line x1="10" y1="10" x2="90" y2="90" stroke="black" stroke-width="8"/><line x1="10" y1="90" x2="90" y2="10" stroke="black" stroke-width="8"/></svg>' }],
            pattern: '||' + '-'.repeat(32) + '||' // Default empty pattern
        };

        this.state.instruments.push(newInstrument);
        this.render(); // Re-render the entire view with the new instrument
    }

    _handleDeleteInstrument(symbolToDelete) {
        logEvent('info', 'MeasureEditorView', '_handleDeleteInstrument', 'Events', `Request to delete instrument: ${symbolToDelete}`);
        
        const instrumentName = this.state.instruments.find(inst => inst.symbol === symbolToDelete)?.name || symbolToDelete;
        const confirmed = window.confirm(`Are you sure you want to remove the "${instrumentName}" instrument?`);

        if (confirmed) {
            this.state.instruments = this.state.instruments.filter(inst => inst.symbol !== symbolToDelete);
            this.render(); // Re-render the view without the deleted instrument
            logEvent('info', 'MeasureEditorView', '_handleDeleteInstrument', 'State', `Instrument ${symbolToDelete} removed.`);
        }
    }
}