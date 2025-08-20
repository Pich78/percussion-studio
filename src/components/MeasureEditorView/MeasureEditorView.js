// file: src/components/MeasureEditorView/MeasureEditorView.js

import { loadCSS } from '/percussion-studio/lib/dom.js';
import { logEvent } from '/percussion-studio/lib/Logger.js';
import { InstrumentRowView } from '/percussion-studio/src/components/InstrumentRowView/InstrumentRowView.js';
import { InstrumentSelectionModalView } from '/percussion-studio/src/components/InstrumentSelectionModalView/InstrumentSelectionModalView.js';

/**
 * A stateful "smart" container for a single measure.
 * It manages the list of instruments and the metric controls for this measure.
 * It acts as a middle-man, passing user interaction events from its child
 * InstrumentRowView instances up to a higher-level parent controller.
 */
export class MeasureEditorView {
    constructor(container, { instrumentDefs, soundPacks, onMetricsChange, onCellMouseDown, onCellMouseUp, onGridMouseEnter, onGridMouseLeave, onRequestInstrumentChange }) {
        this.container = container;
        // It receives callbacks from its parent to report events
        this.callbacks = { onMetricsChange, onCellMouseDown, onCellMouseUp, onGridMouseEnter, onGridMouseLeave, onRequestInstrumentChange }; 

        // STATE MANAGEMENT: It owns the state for this specific measure
        this.state = {
            instruments: [],
            metrics: { beatsPerMeasure: 4, beatUnit: 4, subdivision: 16, grouping: 4 },
            manifest: { instrumentDefs, soundPacks }
        };

        loadCSS('/percussion-studio/src/components/MeasureEditorView/MeasureEditorView.css');
        
        const modalContainerEl = document.getElementById('modal-container');
        if (!modalContainerEl) {
            throw new Error('MeasureEditorView requires a DOM element with id="modal-container" to exist.');
        }
        
        // It owns the modal used to add instruments TO ITSELF.
        this.instrumentModal = new InstrumentSelectionModalView(
            modalContainerEl,
            { onInstrumentSelected: this._confirmAddInstrument.bind(this) }
        );

        // Bind event handlers for proper removal in destroy()
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
            deleteBtn.dataset.symbol = instrument.symbol;

            const view = new InstrumentRowView(viewContainer, {
                // Pass the events up, adding the `instrument` context
                onCellMouseDown: (tickIndex, event, hasNote) => {
                    this.callbacks.onCellMouseDown?.(instrument, tickIndex, hasNote, event);
                },
                onCellMouseUp: (tickIndex, event) => {
                    this.callbacks.onCellMouseUp?.(instrument, tickIndex, event);
                },
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
        if ([6, 9, 12].includes(beats) && unit === 8) {
            grouping = 3;
        }

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
        if (deleteBtn) this._handleDeleteInstrument(deleteBtn.dataset.symbol);
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
        
        const soundPack = this.state.manifest.soundPacks.find(p => p.symbol === selection.symbol && p.pack_name === selection.packName);
        if (!soundPack) {
            logEvent('error', 'MeasureEditorView', '_confirmAddInstrument', 'State', 'Could not find selected sound pack:', selection);
            return;
        }
        
        if (this.state.instruments.some(inst => inst.symbol === selection.symbol)) {
             window.alert(`The instrument "${soundPack.name}" (${selection.symbol}) is already in this measure.`);
             return;
        }

        const totalCells = (this.state.metrics.beatsPerMeasure / this.state.metrics.beatUnit) * this.state.metrics.subdivision;
        const newInstrument = { ...soundPack, pattern: '||' + '-'.repeat(totalCells) + '||' };

        this.state.instruments.push(newInstrument);
        this.render();
    }

    _handleDeleteInstrument(symbolToDelete) {
        logEvent('info', 'MeasureEditorView', '_handleDeleteInstrument', 'Events', `Request to delete instrument: ${symbolToDelete}`);
        
        const instrumentName = this.state.instruments.find(inst => inst.symbol === symbolToDelete)?.name || symbolToDelete;
        const confirmed = window.confirm(`Are you sure you want to remove the "${instrumentName}" instrument?`);

        if (confirmed) {
            this.state.instruments = this.state.instruments.filter(inst => inst.symbol !== symbolToDelete);
            this.render();
            logEvent('info', 'MeasureEditorView', '_handleDeleteInstrument', 'State', `Instrument ${symbolToDelete} removed.`);
        }
    }
    
    updateInstrumentPattern(symbol, newPattern) {
        const instrument = this.state.instruments.find(inst => inst.symbol === symbol);
        if (instrument) {
            instrument.pattern = newPattern;
            this.render();
            logEvent('info', 'MeasureEditorView', 'updateInstrumentPattern', 'State', `Pattern updated for ${symbol}`);
        } else {
            logEvent('warn', 'MeasureEditorView', 'updateInstrumentPattern', 'State', `Could not find instrument with symbol ${symbol} to update.`);
        }
    }

    replaceInstrument(oldSymbol, selection) {
        const soundPack = this.state.manifest.soundPacks.find(p => p.symbol === selection.symbol && p.pack_name === selection.packName);
        if (!soundPack) {
            logEvent('error', 'MeasureEditorView', 'replaceInstrument', 'State', 'Could not find selected sound pack:', selection);
            return null;
        }

        const existingIndex = this.state.instruments.findIndex(inst => inst.symbol === oldSymbol);
        if (existingIndex === -1) {
            logEvent('error', 'MeasureEditorView', 'replaceInstrument', 'State', `Could not find instrument to replace with symbol: ${oldSymbol}`);
            return null;
        }
        
        if (oldSymbol !== selection.symbol && this.state.instruments.some(inst => inst.symbol === selection.symbol)) {
            window.alert(`The instrument "${soundPack.name}" (${selection.symbol}) is already in this measure.`);
            return null;
        }

        const totalCells = (this.state.metrics.beatsPerMeasure / this.state.metrics.beatUnit) * this.state.metrics.subdivision;
        const newInstrument = { ...soundPack, pattern: '||' + '-'.repeat(totalCells) + '||' };

        this.state.instruments.splice(existingIndex, 1, newInstrument);
        logEvent('info', 'MeasureEditorView', 'replaceInstrument', 'State', `Replaced ${oldSymbol} with ${selection.symbol}`);
        this.render();
        return newInstrument;
    }

    destroy() {
        this.container.removeEventListener('click', this._boundHandleClick);
        this.container.removeEventListener('change', this._boundHandleMetricsChange);
        this.instrumentModal.destroy();
        logEvent('info', 'MeasureEditorView', 'destroy', 'Lifecycle', 'Component destroyed.');
    }
}