// file: src/components/PatternEditorView/PatternEditorView.js

import { loadCSS } from '/percussion-studio/lib/dom.js';
import { logEvent } from '/percussion-studio/lib/Logger.js';
import { MeasureEditorView } from '/percussion-studio/src/components/MeasureEditorView/MeasureEditorView.js';
import { EditorCursor } from '/percussion-studio/src/components/EditorCursor/EditorCursor.js';
import { RadialSoundSelector } from '/percussion-studio/src/components/RadialSoundSelector/RadialSoundSelector.js';

const HOLD_DURATION_MS = 200;
const DEFAULT_PATTERN_NAME = 'New Pattern';

export class PatternEditorView {
    constructor(container, { soundPacks, onSave, onRequestInstrumentChange }) {
        this.container = container;
        this.callbacks = { 
            onSave, 
            onRequestInstrumentChange // Store the callback from EditorView
        };
        
        this.rootElement = document.createElement('div');
        this.rootElement.className = 'pattern-editor-view';
        this.container.appendChild(this.rootElement);
        
        this.state = {
            measures: [],
            nextMeasureId: 0,
            soundPacks: soundPacks,
            activeSounds: {},
            patternName: DEFAULT_PATTERN_NAME,
            isDirty: false,
        };

        this.cursor = new EditorCursor();
        this.radialMenu = new RadialSoundSelector({
            onSoundSelected: this._handleSoundSelected.bind(this)
        });

        // Remove the modal creation - we'll use the callback instead
        this.modalContext = { mode: 'add', measureId: null, trackId: null };
        this.childInstances = new Map();
        this.holdTimeout = null;
        this.mouseDownInfo = null;
        
        window.addEventListener('mouseup', this._handleGlobalMouseUp.bind(this), true);

        loadCSS('/percussion-studio/src/components/PatternEditorView/PatternEditorView.css');
        
        this._boundHandleClick = this._handleClick.bind(this);
        this._boundHandleInputChange = this._handleInputChange.bind(this);
        this.rootElement.addEventListener('click', this._boundHandleClick);
        this.rootElement.addEventListener('input', this._boundHandleInputChange);

        this.render();
        logEvent('info', 'PatternEditorView', 'constructor', 'Lifecycle', 'Component created.');
    }

    render() {
        const savedMeasureStates = new Map();
        this.childInstances.forEach((instance, id) => {
            savedMeasureStates.set(id, instance.getState());
        });

        this.childInstances.forEach(instance => instance.destroy());
        this.childInstances.clear();
        
        this.rootElement.innerHTML = '';
        this.rootElement.appendChild(this._renderHeader());

        const measuresContainer = document.createElement('div');
        measuresContainer.className = 'pattern-editor-measures-container';

        this.state.measures.forEach(measure => {
            const wrapper = document.createElement('div');
            wrapper.className = 'pattern-measure-wrapper';

            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-measure-btn';
            deleteBtn.innerHTML = '&times;';
            deleteBtn.dataset.measureId = measure.id;

            const measureContainer = document.createElement('div');
            
            wrapper.appendChild(measureContainer);
            wrapper.appendChild(deleteBtn);
            measuresContainer.appendChild(wrapper);

            const initialState = savedMeasureStates.get(measure.id);

            const measureEditor = new MeasureEditorView(measureContainer, {
                soundPacks: this.state.soundPacks,
                initialInstruments: initialState?.instruments,
                callbacks: {
                    onCellMouseDown: this._handleCellMouseDown.bind(this),
                    onGridMouseEnter: this._handleGridMouseEnter.bind(this),
                    onGridMouseLeave: this._handleGridMouseLeave.bind(this),
                    onRequestAddInstrument: () => this._handleRequestAddInstrument(measure.id),
                    onRequestInstrumentChange: (instrument) => this._handleRequestChangeInstrument(measure.id, instrument)
                }
            });
            
            this.childInstances.set(measure.id, measureEditor);
        });

        this.rootElement.appendChild(measuresContainer);

        const addBtn = document.createElement('button');
        addBtn.className = 'add-measure-btn';
        addBtn.textContent = '+ Add Measure';
        this.rootElement.appendChild(addBtn);
    }
    
    _renderHeader() {
        const header = document.createElement('div');
        header.className = 'pattern-editor-header';
        header.innerHTML = `
            <div class="pattern-info">
                <input type="text" class="pattern-name-input" data-control="patternName" value="${this.state.patternName}" />
                <button class="pattern-save-btn" data-action="save" ${!this.state.isDirty ? 'disabled' : ''}>Save</button>
            </div>
        `;
        return header;
    }

    _handleCellMouseDown(instrument, tickIndex, hasNote, event) {
        this.mouseDownInfo = { instrument, tickIndex, hasNote, event };
        this._ensureActiveSound(instrument);

        this.holdTimeout = setTimeout(() => {
            this.holdTimeout = null;
            this.cursor.update({ isVisible: false });
            this.radialMenu.activeInstrumentSymbol = instrument.symbol;
            this.radialMenu.show({
                x: event.clientX,
                y: event.clientY,
                sounds: instrument.sounds,
                activeSoundLetter: this.state.activeSounds[instrument.symbol]
            });
        }, HOLD_DURATION_MS);
    }

    _handleGlobalMouseUp() {
        if (this.radialMenu.isDragging) return;
        
        if (this.holdTimeout) {
            clearTimeout(this.holdTimeout);
            this.holdTimeout = null;
            if (this.mouseDownInfo) {
                const { instrument, tickIndex, hasNote } = this.mouseDownInfo;
                this._performCellEdit(instrument, tickIndex, hasNote);
            }
        }
        this.mouseDownInfo = null;
    }

    _performCellEdit(instrument, tickIndex, hasNote) {
        const measureInstance = Array.from(this.childInstances.values()).find(measure => 
            measure.state.instruments.some(inst => inst.trackId === instrument.trackId)
        );
        if (!measureInstance) return;

        let patternArr = (instrument.pattern || '').split('');
        if (hasNote) {
            patternArr[tickIndex] = '-';
        } else {
            patternArr[tickIndex] = this.state.activeSounds[instrument.symbol] || instrument.sounds[0].letter;
        }
        
        measureInstance.updateInstrumentPattern(instrument.trackId, patternArr.join(''));
        this.state.isDirty = true;
        this.render();
    }

    _handleSoundSelected(selectedLetter) {
        const symbol = this.radialMenu.activeInstrumentSymbol;
        this.state.activeSounds[symbol] = selectedLetter;
        if (this.mouseDownInfo?.instrument) {
            const sound = this.mouseDownInfo.instrument.sounds.find(s => s.letter === selectedLetter);
            if (sound) this.cursor.update({ isVisible: true, svg: sound.svg });
        }
        this.mouseDownInfo = null;
    }

    _handleGridMouseEnter(instrument) {
        this._ensureActiveSound(instrument);
        const activeLetter = this.state.activeSounds[instrument.symbol];
        const sound = instrument.sounds?.find(s => s.letter === activeLetter);
        this.cursor.update({ isVisible: true, svg: sound?.svg });
    }

    _handleGridMouseLeave() {
        this.cursor.update({ isVisible: false });
    }
    
    _ensureActiveSound(instrument) {
        if (!this.state.activeSounds[instrument.symbol] && instrument.sounds?.length > 0) {
            this.state.activeSounds[instrument.symbol] = instrument.sounds[0].letter;
        }
    }

    _handleRequestAddInstrument(measureId) {
        logEvent('debug', 'PatternEditorView', '_handleRequestAddInstrument', 'Action', `Requesting add instrument for measure ${measureId}`);
        this.modalContext = { mode: 'add', measureId, trackId: null };
        
        // Use the callback instead of direct modal call
        if (this.callbacks.onRequestInstrumentChange) {
            this.callbacks.onRequestInstrumentChange();
        } else {
            logEvent('error', 'PatternEditorView', '_handleRequestAddInstrument', 'Error', 'No onRequestInstrumentChange callback provided');
        }
    }

    _handleRequestChangeInstrument(measureId, instrument) {
        logEvent('debug', 'PatternEditorView', '_handleRequestChangeInstrument', 'Action', `Requesting change instrument for measure ${measureId}, track ${instrument.trackId}`);
        this.modalContext = { mode: 'replace', measureId, trackId: instrument.trackId };
        
        // Use the callback instead of direct modal call
        if (this.callbacks.onRequestInstrumentChange) {
            this.callbacks.onRequestInstrumentChange();
        } else {
            logEvent('error', 'PatternEditorView', '_handleRequestChangeInstrument', 'Error', 'No onRequestInstrumentChange callback provided');
        }
    }

    // This method will be called by EditorView when the modal selection is made
    handleInstrumentSelected(selection) {
        logEvent('debug', 'PatternEditorView', 'handleInstrumentSelected', 'Action', 'Processing instrument selection', { selection, context: this.modalContext });
        
        const { mode, measureId, trackId } = this.modalContext;
        const measureInstance = this.childInstances.get(measureId);
        if (!measureInstance) {
            logEvent('error', 'PatternEditorView', 'handleInstrumentSelected', 'Error', `No measure instance found for ID ${measureId}`);
            return;
        }

        if (mode === 'add') {
            measureInstance.addInstrument(selection);
        } else if (mode === 'replace' && trackId) {
            measureInstance.replaceInstrument(trackId, selection);
        }
        
        this.state.isDirty = true;
        this.render();
    }
    
    _handleModalCancel() {
        logEvent('debug', 'PatternEditorView', '_handleModalCancel', 'Events', 'Modal cancelled.');
    }

    _handleClick(event) {
        const addBtn = event.target.closest('.add-measure-btn');
        const deleteBtn = event.target.closest('.delete-measure-btn');
        const saveBtn = event.target.closest('.pattern-save-btn');

        if (addBtn) this._addMeasure();
        if (deleteBtn) this._deleteMeasure(parseInt(deleteBtn.dataset.measureId, 10));
        if (saveBtn) this._handleSave();
    }

    _handleInputChange(event) {
        const control = event.target.dataset.control;
        if (control === 'patternName') {
            this.state.patternName = event.target.value;
            if (!this.state.isDirty) {
                this.state.isDirty = true;
                this.rootElement.querySelector('.pattern-save-btn').disabled = false;
            }
        }
    }

    _handleSave() {
        const patternData = {
            name: this.state.patternName,
            measures: Array.from(this.childInstances.values()).map(m => m.getState())
        };
        this.callbacks.onSave?.({ isNew: this.state.patternName === DEFAULT_PATTERN_NAME, patternData });
        this.state.isDirty = false;
        this.render();
    }

    _addMeasure() {
        const newMeasure = { id: this.state.nextMeasureId++ };
        this.state.measures.push(newMeasure);
        this.state.isDirty = true;
        this.render();
    }

    _deleteMeasure(measureId) {
        if (window.confirm('Are you sure you want to delete this measure?')) {
            this.state.measures = this.state.measures.filter(m => m.id !== measureId);
            this.childInstances.get(measureId)?.destroy();
            this.childInstances.delete(measureId);
            this.state.isDirty = true;
            this.render();
        }
    }

    destroy() {
        this.rootElement.removeEventListener('click', this._boundHandleClick);
        this.rootElement.removeEventListener('input', this._boundHandleInputChange);
        window.removeEventListener('mouseup', this._handleGlobalMouseUp, true);
        this.childInstances.forEach(instance => instance.destroy());
        this.cursor.destroy();
        this.radialMenu.destroy();
        // Remove the modal destroy since we're not creating it anymore
        this.container.innerHTML = '';
        logEvent('info', 'PatternEditorView', 'destroy', 'Lifecycle', 'Component destroyed.');
    }
}