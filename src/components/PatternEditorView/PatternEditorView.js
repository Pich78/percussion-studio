// file: src/components/PatternEditorView/PatternEditorView.js

import { loadCSS } from '/percussion-studio/lib/dom.js';
import { logEvent } from '/percussion-studio/lib/Logger.js';
import { MeasureEditorView } from '/percussion-studio/src/components/MeasureEditorView/MeasureEditorView.js';

export class PatternEditorView {
    constructor(container, { instrumentDefs, soundPacks }) {
        this.container = container;
        
        // --- STATE MANAGEMENT ---
        this.state = {
            measures: [], // Starts with an empty list of measures
            nextMeasureId: 0,
            manifest: { instrumentDefs, soundPacks }
        };

        // Keep track of child component instances for proper cleanup
        this.childInstances = new Map();

        loadCSS('/percussion-studio/src/components/PatternEditorView/PatternEditorView.css');
        
        this._boundHandleClick = this._handleClick.bind(this);
        this.container.addEventListener('click', this._boundHandleClick);

        this.render();
        logEvent('info', 'PatternEditorView', 'constructor', 'Lifecycle', 'Component created.');
    }

    render() {
        // Clean up old instances before re-rendering to prevent memory leaks
        this.childInstances.forEach(instance => instance.destroy());
        this.childInstances.clear();
        
        this.container.innerHTML = '';
        this.container.className = 'pattern-editor-view';

        // --- Render Each Measure ---
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
            const measureEditor = new MeasureEditorView(measureContainer, {
                instrumentDefs: this.state.manifest.instrumentDefs,
                soundPacks: this.state.manifest.soundPacks
            });
            
            // Store the instance so we can clean it up later
            this.childInstances.set(measure.id, measureEditor);
        });

        // --- Render "Add Measure" Button ---
        const addBtn = document.createElement('button');
        addBtn.className = 'add-measure-btn';
        addBtn.textContent = '+ Add Measure';
        this.container.appendChild(addBtn);
    }
    
    _handleClick(event) {
        const addBtn = event.target.closest('.add-measure-btn');
        const deleteBtn = event.target.closest('.delete-measure-btn');

        if (addBtn) {
            this._addMeasure();
            return;
        }

        if (deleteBtn) {
            const measureId = parseInt(deleteBtn.dataset.measureId, 10);
            this._deleteMeasure(measureId);
            return;
        }
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
        // Destroy all remaining child instances
        this.childInstances.forEach(instance => instance.destroy());
        this.childInstances.clear();
        logEvent('info', 'PatternEditorView', 'destroy', 'Lifecycle', 'Component destroyed.');
    }
}