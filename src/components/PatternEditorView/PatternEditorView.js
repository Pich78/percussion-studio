// file: src/components/PatternEditorView/PatternEditorView.js

import { loadCSS } from '/percussion-studio/lib/dom.js';
import { logEvent } from '/percussion-studio/lib/Logger.js';
import { MeasureEditorView } from '/percussion-studio/src/components/MeasureEditorView/MeasureEditorView.js';
// --- NEW: Importing the services it will own ---
import { EditorCursor } from '/percussion-studio/src/components/EditorCursor/EditorCursor.js';
import { RadialSoundSelector } from '/percussion-studio/src/components/RadialSoundSelector/RadialSoundSelector.js';
// --- FIX: Import the modal view ---
import { InstrumentSelectionModalView } from '/percussion-studio/src/components/InstrumentSelectionModalView/InstrumentSelectionModalView.js';

const HOLD_DURATION_MS = 200;

export class PatternEditorView {
    constructor(container, { instrumentDefs, soundPacks }) {
        this.container = container;
        
        this.state = {
            measures: [],
            nextMeasureId: 0,
            manifest: { instrumentDefs, soundPacks },
            // NEW: The top-level editor now owns the active sound state
            activeSounds: { KCK: 'o', SNR: 'x' } // Default active sounds
        };

        // --- NEW: Instantiate and own the global UI services ---
        this.cursor = new EditorCursor();
        this.radialMenu = new RadialSoundSelector({
            onSoundSelected: (selectedLetter) => {
                logEvent('debug', 'PatternEditorView', 'RadialMenuCallback', 'Events', `RadialSoundSelector callback fired with: ${selectedLetter}`);
                this._handleSoundSelected(selectedLetter);
            }
        });

        // --- FIX: Instantiate and own the instrument selection modal ---
        this.instrumentModal = new InstrumentSelectionModalView(
            document.getElementById('modal-container'), 
            {
                onInstrumentSelected: this._handleInstrumentSelected.bind(this),
                onCancel: this._handleModalCancel.bind(this)
            }
        );
        // --- FIX: State to manage modal context ---
        this.modalMode = 'add'; // 'add' or 'replace'
        this.activeMeasureId = null; // To track which measure is being edited
        this.activeTrackId = null; // To track which track is being replaced

        this.childInstances = new Map();
        this.holdTimeout = null;
        this.mouseDownInfo = null;
        
        // Global listener to ensure the radial menu always closes
        window.addEventListener('mouseup', this._handleGlobalMouseUp.bind(this), true);

        loadCSS('/percussion-studio/src/components/PatternEditorView/PatternEditorView.css');
        
        this._boundHandleClick = this._handleClick.bind(this);
        this.container.addEventListener('click', this._boundHandleClick);

        this.render();
        logEvent('info', 'PatternEditorView', 'constructor', 'Lifecycle', 'Component created.');
    }

    render() {
        this.childInstances.forEach(instance => instance.destroy());
        this.childInstances.clear();
        
        this.container.innerHTML = '';
        this.container.className = 'pattern-editor-view';

        this.state.measures.forEach(measure => {
            const wrapper = document.createElement('div');
            wrapper.className = 'pattern-measure-wrapper';

            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-measure-btn';
            deleteBtn.innerHTML = '×';
            deleteBtn.dataset.measureId = measure.id;

            const measureContainer = document.createElement('div');
            
            wrapper.appendChild(measureContainer);
            wrapper.appendChild(deleteBtn);
            this.container.appendChild(wrapper);

            // Create a new MeasureEditorView for this measure
            // --- MODIFIED: Pass down callbacks for events ---
            const measureEditor = new MeasureEditorView(measureContainer, {
                instrumentDefs: this.state.manifest.instrumentDefs,
                soundPacks: this.state.manifest.soundPacks,
                // Pass down callbacks so the PatternEditor can handle interactions
                onCellMouseDown: this._handleCellMouseDown.bind(this),
                onGridMouseEnter: this._handleGridMouseEnter.bind(this),
                onGridMouseLeave: this._handleGridMouseLeave.bind(this),
                // --- FIX: Handle request to add an instrument to this specific measure ---
                onRequestAddInstrument: () => this._handleRequestAddInstrument(measure.id),
                // --- FIX: Handle request to change an instrument in this specific measure ---
                onRequestInstrumentChange: (instrument) => this._handleRequestChangeInstrument(measure.id, instrument)
            });
            
            this.childInstances.set(measure.id, measureEditor);
        });

        const addBtn = document.createElement('button');
        addBtn.className = 'add-measure-btn';
        addBtn.textContent = '+ Add Measure';
        this.container.appendChild(addBtn);
    }
    
    // --- Centralized Interaction Handlers ---

    _ensureActiveSound(instrument) {
        if (!instrument || !instrument.symbol) return;

        if (!this.state.activeSounds[instrument.symbol] && instrument.sounds?.length > 0) {
            const defaultLetter = instrument.sounds[0].letter;
            this.state.activeSounds[instrument.symbol] = defaultLetter;
            logEvent('info', 'PatternEditorView', '_ensureActiveSound', 'State', `Setting default active sound for ${instrument.symbol} to '${defaultLetter}'`);
        }
        
        logEvent('debug', 'PatternEditorView', '_ensureActiveSound', 'State', `Active sound for ${instrument.symbol} is '${this.state.activeSounds[instrument.symbol]}'`);
    }

    _handleCellMouseDown(instrument, tickIndex, hasNote, event) {
        this.mouseDownInfo = { instrument, tickIndex, hasNote, event };
        this._ensureActiveSound(instrument);

        this.holdTimeout = setTimeout(() => {
            this.holdTimeout = null; // Mark as fired
            logEvent('info', 'PatternEditorView', '_handleCellMouseDown', 'Events', `Hold timeout fired - showing radial menu for ${instrument.symbol}`);
            this.cursor.update({ isVisible: false, svg: null }); // Hide cursor before showing menu
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
        logEvent('debug', 'PatternEditorView', '_handleGlobalMouseUp', 'Events', `Global mouseup - holdTimeout: ${!!this.holdTimeout}, radialDragging: ${this.radialMenu.isDragging}`);
        
        // If the radial menu is active, let it handle the mouseup - don't interfere
        if (this.radialMenu.isDragging) {
            logEvent('debug', 'PatternEditorView', '_handleGlobalMouseUp', 'Events', 'Radial menu is active, letting it handle mouseup');
            return;
        }
        
        if (this.holdTimeout) {
            clearTimeout(this.holdTimeout);
            this.holdTimeout = null; // Reset timeout
            
            // This was a tap, not a hold - perform the edit action
            if (this.mouseDownInfo) {
                const { instrument, tickIndex, hasNote } = this.mouseDownInfo;
                this._performCellEdit(instrument, tickIndex, hasNote);
                logEvent('info', 'PatternEditorView', 'TapAction', 'Events', `Tapped cell ${tickIndex} for ${instrument.symbol}. HasNote: ${hasNote}`);
            }
        }
        
        // Reset mouse down info after processing
        this.mouseDownInfo = null;
    }

    // New method to perform cell editing
    _performCellEdit(instrument, tickIndex, hasNote) {
        // Find the measure that contains this instrument
        const measureInstance = Array.from(this.childInstances.values()).find(measure => 
            measure.state.instruments.some(inst => inst.trackId === instrument.trackId)
        );
        
        if (!measureInstance) {
            logEvent('error', 'PatternEditorView', '_performCellEdit', 'State', 'Could not find measure instance for instrument', instrument);
            return;
        }

        // Get the current pattern and convert to array
        let patternArr = (instrument.pattern || '').replace(/\|/g, '').split('');
        
        if (hasNote) {
            // Remove the note (set to empty)
            patternArr[tickIndex] = '-';
            logEvent('info', 'PatternEditorView', '_performCellEdit', 'Events', `Removing note at tick ${tickIndex} for ${instrument.symbol}`);
        } else {
            // Add a note using the active sound
            const activeLetter = this.state.activeSounds[instrument.symbol] || instrument.sounds[0].letter;
            patternArr[tickIndex] = activeLetter;
            logEvent('info', 'PatternEditorView', '_performCellEdit', 'Events', `Adding note '${activeLetter}' at tick ${tickIndex} for ${instrument.symbol}`);
        }
        
        // Reconstruct the pattern with delimiters
        const newPattern = '||' + patternArr.join('') + '||';
        
        // Update the pattern in the measure
        measureInstance.updateInstrumentPattern(instrument.trackId, newPattern);
    }

    _handleSoundSelected(selectedLetter) {
        const symbol = this.radialMenu.activeInstrumentSymbol;
        logEvent('info', 'PatternEditorView', '_handleSoundSelected', 'State', `New active sound for ${symbol}: ${selectedLetter}`);
        this.state.activeSounds[symbol] = selectedLetter;
        
        // Update the cursor to show the newly selected sound
        if (this.mouseDownInfo && this.mouseDownInfo.instrument) {
            const instrument = this.mouseDownInfo.instrument;
            const sound = instrument.sounds?.find(s => s.letter === selectedLetter);
            if (sound) {
                // Update cursor immediately
                this.cursor.update({ isVisible: true, svg: sound.svg });
            }
            
            // --- FIX: Do not auto-place the sound after selection from the radial menu ---
            // const { tickIndex, hasNote } = this.mouseDownInfo;
            // this._performCellEdit(instrument, tickIndex, false); // false = treat as empty cell to place new sound
        } else {
            // If no mouseDownInfo, just update the active sound and cursor for the symbol
            // Find any instrument with this symbol to get the sound definition
            let foundInstrument = null;
            for (const measureInstance of this.childInstances.values()) {
                foundInstrument = measureInstance.state.instruments.find(inst => inst.symbol === symbol);
                if (foundInstrument) break;
            }
            
            if (foundInstrument) {
                const sound = foundInstrument.sounds?.find(s => s.letter === selectedLetter);
                if (sound) {
                    this.cursor.update({ isVisible: true, svg: sound.svg });
                }
            }
        }
        
        // Always reset mouse down info after handling radial selection
        this.mouseDownInfo = null;
    }

    _handleGridMouseEnter(instrument) {
        // [Time][Class Name][Method Name][Feature][Log line]
        logEvent('debug', 'PatternEditorView', '_handleGridMouseEnter', 'Cursor', 'Hovering over instrument:', instrument ? JSON.parse(JSON.stringify(instrument)) : 'null');
        this._ensureActiveSound(instrument);

        const activeLetter = this.state.activeSounds[instrument.symbol];
        const sound = instrument.sounds?.find(s => s.letter === activeLetter);
        
        // Always update cursor when entering a grid, regardless of radial menu state
        this.cursor.update({ isVisible: true, svg: sound?.svg });
    }

    _handleGridMouseLeave() {
        this.cursor.update({ isVisible: false, svg: null });
    }

    // --- Handlers for Modal Workflow ---

    _handleRequestAddInstrument(measureId) {
        logEvent('info', 'PatternEditorView', '_handleRequestAddInstrument', 'Events', `Request to add instrument to measure ${measureId}`);
        this.modalMode = 'add';
        this.activeMeasureId = measureId;
        this.instrumentModal.show({
            instrumentDefs: this.state.manifest.instrumentDefs,
            soundPacks: this.state.manifest.soundPacks
        });
    }

    _handleRequestChangeInstrument(measureId, instrument) {
        logEvent('info', 'PatternEditorView', '_handleRequestChangeInstrument', 'Events', `Request to change instrument ${instrument.trackId} in measure ${measureId}`);
        this.modalMode = 'replace';
        this.activeMeasureId = measureId;
        this.activeTrackId = instrument.trackId;
        this.instrumentModal.show({
            instrumentDefs: this.state.manifest.instrumentDefs,
            soundPacks: this.state.manifest.soundPacks
        });
    }

    _handleInstrumentSelected(selection) {
        logEvent('info', 'PatternEditorView', '_handleInstrumentSelected', 'Events', `Instrument selected for measure ${this.activeMeasureId} in mode ${this.modalMode}`, selection);
        if (this.activeMeasureId === null) {
            logEvent('warn', 'PatternEditorView', '_handleInstrumentSelected', 'State', 'No active measure ID.');
            return;
        }

        const measureInstance = this.childInstances.get(this.activeMeasureId);
        if (!measureInstance) {
            logEvent('error', 'PatternEditorView', '_handleInstrumentSelected', 'State', `Could not find measure instance for ID: ${this.activeMeasureId}`);
            this._resetModalState();
            return;
        }

        if (this.modalMode === 'add') {
            measureInstance.addInstrument(selection);
        } else if (this.modalMode === 'replace' && this.activeTrackId) {
            measureInstance.replaceInstrument(this.activeTrackId, selection);
        }
        
        this._resetModalState();
    }
    
    _handleModalCancel() {
        logEvent('info', 'PatternEditorView', '_handleModalCancel', 'Events', 'Instrument selection cancelled.');
        this._resetModalState();
    }

    _resetModalState() {
        this.modalMode = 'add';
        this.activeMeasureId = null; 
        this.activeTrackId = null;
    }

    // --- Component Lifecycle Handlers ---

    _handleClick(event) {
        const addBtn = event.target.closest('.add-measure-btn');
        const deleteBtn = event.target.closest('.delete-measure-btn');

        if (addBtn) this._addMeasure();
        if (deleteBtn) this._deleteMeasure(parseInt(deleteBtn.dataset.measureId, 10));
    }

    _addMeasure() {
        const newMeasure = {
            id: this.state.nextMeasureId,
            // In a real app, other measure-specific data would go here
        };
        this.state.measures.push(newMeasure);
        this.state.nextMeasureId++;
        logEvent('info', 'PatternEditorView', '_addMeasure', 'State', 'Adding new measure', newMeasure);
        this.render();
    }

    _deleteMeasure(measureId) {
        logEvent('info', 'PatternEditorView', '_deleteMeasure', 'Events', `Request to delete measure ID: ${measureId}`);
        const confirmed = window.confirm('Are you sure you want to delete this measure?');

        if (confirmed) {
            // Clean up the specific child instance before removing from state
            if (this.childInstances.has(measureId)) {
                this.childInstances.get(measureId).destroy();
                this.childInstances.delete(measureId);
            }
            
            this.state.measures = this.state.measures.filter(m => m.id !== measureId);
            this.render();
            logEvent('info', 'PatternEditorView', '_deleteMeasure', 'State', `Measure ${measureId} removed.`);
        }
    }

    destroy() {
        this.container.removeEventListener('click', this._boundHandleClick);
        window.removeEventListener('mouseup', this._handleGlobalMouseUp, true);
        this.childInstances.forEach(instance => instance.destroy());
        this.childInstances.clear();
        // Destroy the owned services
        this.cursor.destroy();
        this.radialMenu.destroy();
        // --- FIX: Destroy the modal instance ---
        this.instrumentModal.destroy();
        logEvent('info', 'PatternEditorView', 'destroy', 'Lifecycle', 'Component destroyed.');
    }
}