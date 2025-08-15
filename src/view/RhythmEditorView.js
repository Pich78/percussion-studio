// file: src/view/RhythmEditorView.js (Complete, with 3-Panel Layout & Corrected Event Handling)
export class RhythmEditorView {
    constructor(container, callbacks) {
        this.container = container;
        this.callbacks = callbacks || {};
        this.state = {}; // Full state from App.js
        this.draggedIndex = null;
        
        // Internal UI state
        this.selectedInstrumentSymbol = null;
        this.selectedNoteLetter = null;

        // Use event delegation for all interactions
        this.container.addEventListener('click', this.handleClick.bind(this));
        this.container.addEventListener('dragstart', this.handleDragStart.bind(this));
        this.container.addEventListener('dragover', this.handleDragOver.bind(this));
        this.container.addEventListener('dragleave', this.handleDragLeave.bind(this));
        this.container.addEventListener('drop', this.handleDrop.bind(this));
        this.container.addEventListener('blur', this.handleBlur.bind(this), true);
    }

    render(state) {
        this.state = state;
        const { rhythm, currentEditingPatternId } = state;

        if (!rhythm) {
            this.container.innerHTML = '<div>Loading...</div>';
            return;
        }

        const html = `
            <div class="rhythm-editor-layout">
                <div class="flow-panel">${this._renderFlowPanel(rhythm.playback_flow, currentEditingPatternId)}</div>
                <div class="grid-panel">${this._renderGridPanel(rhythm, currentEditingPatternId)}</div>
                <div class="palette-panel">${this._renderPalettePanel(rhythm)}</div>
            </div>
        `;
        this.container.innerHTML = html;
    }

    // --- Private Render Methods ---
    _renderFlowPanel(playback_flow, selectedPatternId) {
        let flowHtml = '<h3>Rhythm Flow</h3>';
        playback_flow.forEach((item, index) => {
            const isSelected = item.pattern === selectedPatternId ? 'selected' : '';
            flowHtml += `
                <div class="flow-item ${isSelected}" draggable="true" data-index="${index}" data-pattern-id="${item.pattern}">
                    <span class="pattern-name">${item.pattern}</span>
                    <span class="repetitions" contenteditable="true" data-property="repetitions">${item.repetitions}</span>
                    <button class="delete-btn" title="Delete Item">✖</button>
                </div>
            `;
        });
        flowHtml += `<button class="add-pattern-btn">+</button>`;
        return flowHtml;
    }

    _renderGridPanel(rhythm, patternId) {
        if (!patternId || !rhythm.patterns[patternId]) {
            return '<h3>Pattern Grid</h3><p>Select a pattern from the Rhythm Flow to edit.</p>';
        }

        const pattern = rhythm.patterns[patternId];
        // Per spec, pattern_data is an array of measures. We edit the first one.
        const measure = (pattern.pattern_data && pattern.pattern_data[0]) ? pattern.pattern_data[0] : {};
        const { resolution } = pattern.metadata;
        const instruments = Object.keys(measure);

        let gridHtml = `<h3>Editing: ${patternId} (Measure 1 of ${pattern.pattern_data?.length || 0})</h3>`;
        gridHtml += `<div class="pattern-grid" style="grid-template-columns: 100px repeat(${resolution}, 1fr);">`;

        instruments.forEach(symbol => {
            const isSelected = this.selectedInstrumentSymbol === symbol ? 'selected' : '';
            gridHtml += `<div class="instrument-header ${isSelected}" data-symbol="${symbol}">${symbol}<button class="remove-track-btn" title="Remove Track">✖</button></div>`;
            const noteString = (measure[symbol] || '').replace(/\|/g, '');
            const emptyString = '-'.repeat(resolution);

            for (let i = 0; i < resolution; i++) {
                const noteChar = noteString[i] || emptyString[i];
                let cellContent = '';
                let hasNote = false;
                
                if (noteChar && noteChar !== '-') {
                    hasNote = true;
                    const instDef = rhythm.instrumentDefsBySymbol[symbol];
                    const sound = instDef?.sounds.find(s => s.letter === noteChar);
                    if (sound?.svg) {
                        cellContent = `<img src="/percussion-studio/data/instruments/${sound.svg}" alt="${noteChar}">`;
                    }
                }
                
                // Add data attribute to indicate if cell has a note
                gridHtml += `<div class="grid-cell" data-symbol="${symbol}" data-tick="${i}" data-measure="0" data-has-note="${hasNote}">${cellContent}</div>`;
            }
        });

        gridHtml += `</div><button class="add-track-btn">+ Add Track</button>`;
        return gridHtml;
    }

    _renderPalettePanel(rhythm) {
        if (!this.selectedInstrumentSymbol || !rhythm.instrumentDefsBySymbol[this.selectedInstrumentSymbol]) {
            return '<h3>Instrument Palette</h3><p>Select an instrument from the grid to see its notes.</p>';
        }

        const instDef = rhythm.instrumentDefsBySymbol[this.selectedInstrumentSymbol];
        let paletteHtml = `<h3>${instDef.name || this.selectedInstrumentSymbol} Notes</h3><div class="palette-notes">`;

        instDef.sounds.forEach(sound => {
            const isSelected = this.selectedNoteLetter === sound.letter ? 'selected' : '';
            paletteHtml += `
                <div class="palette-note ${isSelected}" data-letter="${sound.letter}">
                    <img src="/percussion-studio/data/instruments/${sound.svg}" alt="${sound.name}">
                    <span>${sound.name} (${sound.letter})</span>
                </div>
            `;
        });

        paletteHtml += `</div>`;
        return paletteHtml;
    }

    // --- Event Handlers (Delegated) ---
    handleClick(event) {
        const target = event.target;

        // Check for the most specific targets FIRST to prevent parent handlers from firing
        const deleteBtn = target.closest('.delete-btn');
        if (deleteBtn) {
            const flowItemElement = deleteBtn.closest('.flow-item');
            const indexToDelete = parseInt(flowItemElement.dataset.index, 10);
            if (window.confirm('Are you sure you want to delete this item?')) {
                const newFlow = this.state.rhythm.playback_flow.filter((_, index) => index !== indexToDelete);
                this.callbacks.onFlowChange?.(newFlow);
            }
            return;
        }

        const addPatternBtn = target.closest('.add-pattern-btn');
        if (addPatternBtn) {
            this.callbacks.onAddPatternClick?.();
            return;
        }

        const removeTrackBtn = target.closest('.remove-track-btn');
        if (removeTrackBtn) {
            const symbolToRemove = removeTrackBtn.closest('.instrument-header').dataset.symbol;
            if (window.confirm(`Remove track "${symbolToRemove}" from this pattern?`)) {
                this.callbacks.onRemoveTrack?.(this.state.currentEditingPatternId, symbolToRemove);
            }
            return;
        }

        const addTrackBtn = target.closest('.add-track-btn');
        if (addTrackBtn) {
            const newSymbol = prompt("Enter the symbol for the new track (e.g., HHC):")?.toUpperCase();
            if (newSymbol) this.callbacks.onAddTrack?.(this.state.currentEditingPatternId, newSymbol);
            return;
        }

        const paletteNote = target.closest('.palette-note');
        if (paletteNote) {
            this.selectedNoteLetter = paletteNote.dataset.letter;
            this.render(this.state);
            return;
        }

        const gridCell = target.closest('.grid-cell');
        if (gridCell) {
            this._handleGridClick(gridCell);
            return;
        }

        const instrumentHeader = target.closest('.instrument-header');
        if (instrumentHeader) {
            this.selectedInstrumentSymbol = instrumentHeader.dataset.symbol;
            this.selectedNoteLetter = null;
            this.render(this.state);
            return;
        }

        const flowItem = target.closest('.flow-item');
        if (flowItem && !target.closest('[contenteditable="true"]')) {
            this.callbacks.onPatternSelect?.(flowItem.dataset.patternId);
        }
    }

    _handleGridClick(cellElement) {
        const position = {
            patternId: this.state.currentEditingPatternId,
            measureIndex: parseInt(cellElement.dataset.measure, 10),
            instrumentSymbol: cellElement.dataset.symbol,
            tick: parseInt(cellElement.dataset.tick, 10)
        };

        // Use the data-has-note attribute to determine if cell has a note
        const hasNote = cellElement.dataset.hasNote === 'true';

        if (hasNote) {
            this.callbacks.onRemoveNote?.(position);
        } else if (this.selectedNoteLetter) {
            position.note = this.selectedNoteLetter;
            this.callbacks.onAddNote?.(position);
        }
    }

    handleBlur(event) {
        if (event.target.hasAttribute('contenteditable')) {
            const flowItemElement = event.target.closest('.flow-item');
            const index = parseInt(flowItemElement.dataset.index, 10);
            const property = event.target.dataset.property;
            const newValue = parseInt(event.target.textContent, 10);

            if (isNaN(newValue) || newValue < 1) {
                this.render(this.state);
                return;
            }

            const newFlow = structuredClone(this.state.rhythm.playback_flow);
            if (newFlow[index][property] !== newValue) {
                newFlow[index][property] = newValue;
                this.callbacks.onFlowChange?.(newFlow);
            }
        }
    }

    handleDragStart(event) {
        if (event.target.classList.contains('flow-item')) {
            this.draggedIndex = parseInt(event.target.dataset.index, 10);
            event.dataTransfer.effectAllowed = 'move';
        }
    }

    handleDragOver(event) {
        event.preventDefault();
        const target = event.target.closest('.flow-item');
        if (target) target.classList.add('drag-over');
    }

    handleDragLeave(event) {
        const target = event.target.closest('.flow-item');
        if (target) target.classList.remove('drag-over');
    }

    handleDrop(event) {
        event.preventDefault();
        const targetElement = event.target.closest('.flow-item');
        if (!targetElement || this.draggedIndex === null) return;

        targetElement.classList.remove('drag-over');
        const dropIndex = parseInt(targetElement.dataset.index, 10);
        if (this.draggedIndex === dropIndex) return;

        const flow = [...this.state.rhythm.playback_flow];
        const [draggedItem] = flow.splice(this.draggedIndex, 1);
        flow.splice(dropIndex, 0, draggedItem);

        this.draggedIndex = null;
        this.callbacks.onFlowChange?.(flow);
    }
}