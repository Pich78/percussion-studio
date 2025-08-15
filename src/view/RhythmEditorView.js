// file: src/view/RhythmEditorView.js (Complete, with 3-Panel Layout)
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
        // For now, we only edit the first measure. Multi-measure editing is a future enhancement.
        const measure = pattern.pattern_data;
        const { resolution } = pattern.metadata;
        const instruments = Object.keys(measure);

        let gridHtml = `<h3>Editing: ${patternId} (Measure 1/${pattern.pattern_data.length})</h3>`;
        gridHtml += `<div class="pattern-grid" style="grid-template-columns: 100px repeat(${resolution}, 1fr);">`;

        instruments.forEach(symbol => {
            const isSelected = this.selectedInstrumentSymbol === symbol ? 'selected' : '';
            gridHtml += `<div class="instrument-header ${isSelected}" data-symbol="${symbol}">${symbol}<button class="remove-track-btn" title="Remove Track">✖</button></div>`;
            const noteString = measure[symbol].replace(/\|/g, '');
            for (let i = 0; i < resolution; i++) {
                const noteChar = noteString[i];
                let cellContent = '';
                if (noteChar && noteChar !== '-') {
                    const instDef = rhythm.instrumentDefsBySymbol[symbol];
                    const sound = instDef?.sounds.find(s => s.letter === noteChar);
                    if (sound?.svg) {
                        cellContent = `<img src="/percussion-studio/data/instruments/${sound.svg}" alt="${noteChar}">`;
                    }
                }
                gridHtml += `<div class="grid-cell" data-symbol="${symbol}" data-tick="${i}" data-measure="0">${cellContent}</div>`;
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
        const flowItem = event.target.closest('.flow-item');
        if (flowItem) {
            return this.callbacks.onPatternSelect?.(flowItem.dataset.patternId);
        }

        if (event.target.classList.contains('delete-btn')) {
            const indexToDelete = parseInt(event.target.closest('.flow-item').dataset.index, 10);
            if (window.confirm('Are you sure you want to delete this item?')) {
                const newFlow = this.state.rhythm.playback_flow.filter((_, index) => index !== indexToDelete);
                this.callbacks.onFlowChange?.(newFlow);
            }
        } else if (event.target.classList.contains('add-pattern-btn')) {
            this.callbacks.onAddPatternClick?.();
        } else if (event.target.closest('.instrument-header')) {
            this.selectedInstrumentSymbol = event.target.closest('.instrument-header').dataset.symbol;
            this.selectedNoteLetter = null; // Reset note selection
            this.render(this.state); // Re-render to update selection
        } else if (event.target.closest('.palette-note')) {
            this.selectedNoteLetter = event.target.closest('.palette-note').dataset.letter;
            this.render(this.state); // Re-render to update selection
        } else if (event.target.closest('.grid-cell')) {
            this._handleGridClick(event.target.closest('.grid-cell'));
        } else if (event.target.classList.contains('add-track-btn')) {
            const newSymbol = prompt("Enter the symbol for the new track (e.g., HHC):")?.toUpperCase();
            if (newSymbol) this.callbacks.onAddTrack?.(this.state.currentEditingPatternId, newSymbol);
        } else if (event.target.classList.contains('remove-track-btn')) {
            const symbolToRemove = event.target.closest('.instrument-header').dataset.symbol;
            if (window.confirm(`Remove track "${symbolToRemove}" from this pattern?`)) {
                this.callbacks.onRemoveTrack?.(this.state.currentEditingPatternId, symbolToRemove);
            }
        }
    }

    _handleGridClick(cellElement) {
        const position = {
            patternId: this.state.currentEditingPatternId,
            measureIndex: parseInt(cellElement.dataset.measure, 10),
            instrumentSymbol: cellElement.dataset.symbol,
            tick: parseInt(cellElement.dataset.tick, 10)
        };

        const hasNote = cellElement.innerHTML.trim() !== '';

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
        if (target) {
            target.classList.add('drag-over');
        }
    }

    handleDragLeave(event) {
        const target = event.target.closest('.flow-item');
        if (target) {
            target.classList.remove('drag-over');
        }
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
