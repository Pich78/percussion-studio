// file: src/components/PatternEditorView/PatternEditorView.js

import { loadCSS } from '/percussion-studio/lib/dom.js';
import { logEvent } from '/percussion-studio/lib/Logger.js';
import { MeasureEditorView } from '/percussion-studio/src/components/MeasureEditorView/MeasureEditorView.js';
// --- NEW: Importing the services it will own ---
import { EditorCursor } from '/percussion-studio/src/components/EditorCursor/EditorCursor.js';
import { RadialSoundSelector } from '/percussion-studio/src/components/RadialSoundSelector/RadialSoundSelector.js';

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
            onSoundSelected: this._handleSoundSelected.bind(this)
        });

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
                onGridMouseLeave: this._handleGridMouseLeave.bind(this)
            });
            
            this.childInstances.set(measure.id, measureEditor);
        });

        const addBtn = document.createElement('button');
        addBtn.className = 'add-measure-btn';
        addBtn.textContent = '+ Add Measure';
        this.container.appendChild(addBtn);
    }
    
    // --- NEW: Centralized Interaction Handlers ---

    _handleCellMouseDown(instrument, tickIndex, hasNote, event) {
        this.mouseDownInfo = { instrument, tickIndex, hasNote, event };

        this.holdTimeout = setTimeout(() => {
            this.holdTimeout = null; // Mark as fired
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
        if (this.holdTimeout) {
            clearTimeout(this.holdTimeout);
            // This was a tap, not a hold.
            // In a full app, we would call the EditController here.
            const { instrument, tickIndex, hasNote } = this.mouseDownInfo;
            logEvent('info', 'PatternEditorView', 'TapAction', 'Events', `Tapped cell ${tickIndex} for ${instrument.symbol}. HasNote: ${hasNote}`);
        }
        
        // This handles closing the menu after a selection is made or the gesture is cancelled.
        if (this.radialMenu.isDragging) {
            this.radialMenu.hide();
        }
    }

    _handleSoundSelected(selectedLetter) {
        const symbol = this.radialMenu.activeInstrumentSymbol;
        logEvent('info', 'PatternEditorView', '_handleSoundSelected', 'State', `New active sound for ${symbol}: ${selectedLetter}`);
        this.state.activeSounds[symbol] = selectedLetter;
    }

    _handleGridMouseEnter(instrument) {
        const activeLetter = this.state.activeSounds[instrument.symbol];
        const sound = instrument.sounds.find(s => s.letter === activeLetter);
        this.cursor.update({ isVisible: true, svg: sound?.svg });
    }

    _handleGridMouseLeave() {
        this.cursor.update({ isVisible: false, svg: null });
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
        logEvent('info', 'PatternEditorView', 'destroy', 'Lifecycle', 'Component destroyed.');
    }
}