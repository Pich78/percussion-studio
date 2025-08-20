// file: src/components/MeasureEditorView/MeasureEditorView.js

import { loadCSS } from '/percussion-studio/lib/dom.js';
import { logEvent } from '/percussion-studio/lib/Logger.js';
import { InstrumentRowView } from '/percussion-studio/src/components/InstrumentRowView/InstrumentRowView.js';
// The component no longer manages the modal directly
// import { InstrumentSelectionModalView } from '/percussion-studio/src/components/InstrumentSelectionModalView/InstrumentSelectionModalView.js';

/**
 * A stateful "smart" container for a single measure.
 * It manages the list of instruments and the metric controls for this measure.
 * It acts as a middle-man, passing user interaction events from its child
 * InstrumentRowView instances up to a higher-level parent controller.
 */
export class MeasureEditorView {
    static nextTrackId = 1;
    static generateTrackId() {
        return `track-${MeasureEditorView.nextTrackId++}`;
    }

    constructor(container, { instrumentDefs, soundPacks, onMetricsChange, onCellMouseDown, onCellMouseUp, onGridMouseEnter, onGridMouseLeave, onRequestInstrumentChange, onRequestAddInstrument, initialInstruments, initialMetrics }) {
        this.container = container;
        this.callbacks = { onMetricsChange, onCellMouseDown, onCellMouseUp, onGridMouseEnter, onGridMouseLeave, onRequestInstrumentChange, onRequestAddInstrument }; 

        // --- FIX: Initialize state from props if provided, otherwise use defaults ---
        this.state = {
            instruments: initialInstruments || [],
            metrics: initialMetrics || { beatsPerMeasure: 4, beatUnit: 4, subdivision: 16, grouping: 4 },
            manifest: { instrumentDefs, soundPacks }
        };

        loadCSS('/percussion-studio/src/components/MeasureEditorView/MeasureEditorView.css');
        
        // The component no longer creates its own modal instance.
        // This responsibility is moved to the integration/application layer.

        this._boundHandleClick = this._handleClick.bind(this);
        this.container.addEventListener('click', this._boundHandleClick);
        this._boundHandleMetricsChange = this._handleMetricsChange.bind(this);
        this.container.addEventListener('change', this._boundHandleMetricsChange);

        this.render();
        logEvent('info', 'MeasureEditorView', 'constructor', 'Lifecycle', 'Component created.');
    }

    render() {
        this.container.innerHTML = '';
        this.container.className = 'measure-editor-view';

        this.container.appendChild(this._renderHeaderControls());
        
        const scrollingWrapper = document.createElement('div');
        scrollingWrapper.className = 'measure-rows-wrapper';
        const innerContainer = document.createElement('div');
        innerContainer.className = 'measure-rows-inner-container';

        this.state.instruments.forEach(instrument => {
            const rowWrapper = document.createElement('div');
            rowWrapper.className = 'measure-instrument-row';
            const viewContainer = document.createElement('div');
            viewContainer.className = 'instrument-row-container';
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-row-btn';
            deleteBtn.innerHTML = '×';
            deleteBtn.dataset.trackId = instrument.trackId;

            const view = new InstrumentRowView(viewContainer, {
                onCellMouseDown: (tickIndex, event, hasNote) => this.callbacks.onCellMouseDown?.(instrument, tickIndex, hasNote, event),
                onCellMouseUp: (tickIndex, event) => this.callbacks.onCellMouseUp?.(instrument, tickIndex, event),
                onGridMouseEnter: () => this.callbacks.onGridMouseEnter?.(instrument),
                onGridMouseLeave: () => this.callbacks.onGridMouseLeave?.(),
                onRequestInstrumentChange: () => this.callbacks.onRequestInstrumentChange?.(instrument),
            });

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
            innerContainer.appendChild(rowWrapper);
        });

        scrollingWrapper.appendChild(innerContainer);
        this.container.appendChild(scrollingWrapper);

        const addBtnContainer = document.createElement('div');
        addBtnContainer.className = 'add-instrument-container';
        const addBtn = document.createElement('button');
        addBtn.className = 'add-instrument-btn';
        addBtn.textContent = '+';
        addBtnContainer.appendChild(addBtn);
        this.container.appendChild(addBtnContainer);
    }

    _renderHeaderControls() {
        const header = document.createElement('div');
        header.className = 'measure-editor-header';
        const { beatsPerMeasure, beatUnit, subdivision } = this.state.metrics;
        header.innerHTML = `
            <div class="flex items-center">
                <div class="mr3">
                    <label class="f6 b db mb2">Time Signature</label>
                    <input data-metric="numerator" type="number" value="${beatsPerMeasure}" class="w3 tc"> /
                    <input data-metric="denominator" type="number" value="${beatUnit}" class="w3 tc">
                </div>
                <div>
                    <label class="f6 b db mb2">Subdivision</label>
                    <select data-metric="subdivision" class="w5">
                        <option value="4" ${subdivision === 4 ? 'selected' : ''}>4th Notes</option>
                        <option value="8" ${subdivision === 8 ? 'selected' : ''}>8th Notes</option>
                        <option value="16" ${subdivision === 16 ? 'selected' : ''}>16th Notes</option>
                        <option value="32" ${subdivision === 32 ? 'selected' : ''}>32nd Notes</option>
                        <option value="64" ${subdivision === 64 ? 'selected' : ''}>64th Notes</option>
                    </select>
                </div>
            </div>
        `;
        return header;
    }

    _handleMetricsChange(event) {
        const target = event.target;
        const metricType = target.dataset.metric;
        if (!metricType) return;

        const beats = metricType === 'numerator' ? parseInt(target.value, 10) : this.state.metrics.beatsPerMeasure;
        const unit = metricType === 'denominator' ? parseInt(target.value, 10) : this.state.metrics.beatUnit;
        const subdivision = metricType === 'subdivision' ? parseInt(target.value, 10) : this.state.metrics.subdivision;

        let grouping = (subdivision / unit);
        if ([6, 9, 12].includes(beats) && unit === 8) grouping = 3;

        const newMetrics = { beatsPerMeasure: beats, beatUnit: unit, subdivision, grouping };
        this.state.metrics = newMetrics;
        
        const totalCells = (newMetrics.beatsPerMeasure / newMetrics.beatUnit) * newMetrics.subdivision;
        this.state.instruments.forEach(inst => {
            const currentPattern = inst.pattern.replace(/\|/g, '');
            let newPattern = currentPattern.slice(0, totalCells);
            if (newPattern.length < totalCells) {
                newPattern += '-'.repeat(totalCells - newPattern.length);
            }
            inst.pattern = '||' + newPattern + '||';
        });

        logEvent('info', 'MeasureEditorView', '_handleMetricsChange', 'State', 'Metrics changed', newMetrics);
        this.render();
        this.callbacks.onMetricsChange?.(newMetrics);
    }

    _handleClick(event) {
        const addBtn = event.target.closest('.add-instrument-btn');
        const deleteBtn = event.target.closest('.delete-row-btn');

        if (addBtn) this._handleAddInstrument();
        if (deleteBtn) this._handleDeleteInstrument(deleteBtn.dataset.trackId);
    }

    _handleAddInstrument() {
        logEvent('info', 'MeasureEditorView', '_handleAddInstrument', 'Events', 'Requesting to add new instrument.');
        // Fire callback instead of showing a modal
        this.callbacks.onRequestAddInstrument?.();
    }

    // This is now a public method for the application layer to call
    addInstrument(selection) {
        logEvent('info', 'MeasureEditorView', 'addInstrument', 'State', 'Adding instrument:', selection);
        
        const soundPack = this.state.manifest.soundPacks.find(p => p.symbol === selection.symbol && p.pack_name === selection.packName);
        if (!soundPack) {
            logEvent('error', 'MeasureEditorView', 'addInstrument', 'State', 'Could not find selected sound pack:', selection);
            return;
        }

        const totalCells = (this.state.metrics.beatsPerMeasure / this.state.metrics.beatUnit) * this.state.metrics.subdivision;
        const newInstrument = { 
            ...soundPack, 
            pattern: '||' + '-'.repeat(totalCells) + '||',
            trackId: MeasureEditorView.generateTrackId()
        };

        this.state.instruments.push(newInstrument);
        this.render();
    }

    _handleDeleteInstrument(trackIdToDelete) {
        if (!trackIdToDelete) return;
        logEvent('info', 'MeasureEditorView', '_handleDeleteInstrument', 'Events', `Request to delete instrument: ${trackIdToDelete}`);
        
        const instrumentName = this.state.instruments.find(inst => inst.trackId === trackIdToDelete)?.name || trackIdToDelete;
        const confirmed = window.confirm(`Are you sure you want to remove the "${instrumentName}" instrument?`);

        if (confirmed) {
            this.state.instruments = this.state.instruments.filter(inst => inst.trackId !== trackIdToDelete);
            this.render();
            logEvent('info', 'MeasureEditorView', '_handleDeleteInstrument', 'State', `Instrument ${trackIdToDelete} removed.`);
        }
    }
    
    updateInstrumentPattern(trackId, newPattern) {
        const instrument = this.state.instruments.find(inst => inst.trackId === trackId);
        if (instrument) {
            instrument.pattern = newPattern;
            this.render();
            logEvent('info', 'MeasureEditorView', 'updateInstrumentPattern', 'State', `Pattern updated for ${trackId}`);
        } else {
            logEvent('warn', 'MeasureEditorView', 'updateInstrumentPattern', 'State', `Could not find instrument with trackId ${trackId} to update.`);
        }
    }

    replaceInstrument(trackIdToReplace, selection) {
        const soundPack = this.state.manifest.soundPacks.find(p => p.symbol === selection.symbol && p.pack_name === selection.packName);
        if (!soundPack) {
            logEvent('error', 'MeasureEditorView', 'replaceInstrument', 'State', 'Could not find selected sound pack:', selection);
            return null;
        }

        const existingIndex = this.state.instruments.findIndex(inst => inst.trackId === trackIdToReplace);
        if (existingIndex === -1) {
            logEvent('error', 'MeasureEditorView', 'replaceInstrument', 'State', `Could not find instrument to replace with trackId: ${trackIdToReplace}`);
            return null;
        }

        const totalCells = (this.state.metrics.beatsPerMeasure / this.state.metrics.beatUnit) * this.state.metrics.subdivision;
        const newInstrument = { 
            ...soundPack, 
            pattern: '||' + '-'.repeat(totalCells) + '||',
            trackId: trackIdToReplace
        };

        this.state.instruments.splice(existingIndex, 1, newInstrument);
        logEvent('info', 'MeasureEditorView', 'replaceInstrument', 'State', `Replaced instrument ${trackIdToReplace} with ${selection.symbol}`);
        this.render();
        return newInstrument;
    }
    
    /**
     * --- NEW: Method to export state for parent component ---
     */
    getState() {
        return {
            instruments: this.state.instruments,
            metrics: this.state.metrics
        };
    }

    destroy() {
        this.container.removeEventListener('click', this._boundHandleClick);
        this.container.removeEventListener('change', this._boundHandleMetricsChange);
        logEvent('info', 'MeasureEditorView', 'destroy', 'Lifecycle', 'Component destroyed.');
    }
}