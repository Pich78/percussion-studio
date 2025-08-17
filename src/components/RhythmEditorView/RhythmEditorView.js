// file: src/components/RhythmEditorView/RhythmEditorView.js

import { loadCSS } from '/percussion-studio/lib/dom.js';
import { logEvent } from '/percussion-studio/lib/Logger.js';

export class RhythmEditorView {
    constructor(container, callbacks) {
        this.container = container;
        this.callbacks = callbacks || {};
        this.state = {};
        this.isFlowHovered = false;
        this.isPaletteHovered = false;
        this.draggedIndex = null;

        loadCSS('/percussion-studio/src/components/RhythmEditorView/RhythmEditorView.css');
        logEvent('info', 'RhythmEditorView', 'constructor', 'Lifecycle', 'Component created.');
        
        this.container.addEventListener('click', this.handleClick.bind(this));
        this.container.addEventListener('mouseenter', this.handleMouseEnter.bind(this), true);
        this.container.addEventListener('mouseleave', this.handleMouseLeave.bind(this), true);
        this.container.addEventListener('dragstart', this.handleDragStart.bind(this));
        this.container.addEventListener('dragover', this.handleDragOver.bind(this));
        this.container.addEventListener('drop', this.handleDrop.bind(this));
        this.container.addEventListener('dragenter', this.handleDragEnter.bind(this));
        this.container.addEventListener('dragleave', this.handleDragLeave.bind(this));
    }

    render(state) {
        logEvent('debug', 'RhythmEditorView', 'render', 'State', 'Rendering with state:', state);
        this.state = state;
        const { rhythm, isFlowPinned, isPalettePinned } = state;

        if (!rhythm) {
            this.container.innerHTML = '<p class="f5 gray i tc pa4">No rhythm loaded.</p>';
            return;
        }

        const gridMarginClasses = `ml-${isFlowPinned ? '64' : '8'} mr-${isPalettePinned ? '64' : '8'}`;

        const html = `
            <div class="relative w-100 h-100">
                ${this._renderFlowPanel(state)}
                <div class="grid-panel absolute top-0 left-0 w-100 h-100 pa3 overflow-auto ${gridMarginClasses}" data-action-scope="grid-panel">
                    ${this._renderGridPanel(state)}
                </div>
                ${this._renderPalettePanel(state)}
            </div>
        `;
        this.container.innerHTML = html;
    }
    
    _renderFlowPanel(state) {
        const { rhythm, currentEditingPatternId, isFlowPinned } = state;
        const isExpanded = isFlowPinned || this.isFlowHovered;

        const flowItems = rhythm.playback_flow.map((item, index) => {
            const selectedClass = item.pattern === currentEditingPatternId ? 'bg-washed-blue b--blue' : 'bg-white';
            return `
                <div data-drop-zone="before" data-drop-index="${index}" class="drop-zone"></div>
                <div data-action="select-pattern" data-pattern-id="${item.pattern}" data-index="${index}" class="flow-item flex items-center justify-between pa2 br1 ba b--black-10 pointer ${selectedClass}" draggable="true">
                    <span class="truncate">${item.pattern}</span>
                    <button data-action="delete-flow-item" data-index="${index}" class="delete-btn pa1 bn bg-transparent f4 red pointer" title="Remove Item">×</button>
                </div>
            `;
        }).join('') + `<div data-drop-zone="after" data-drop-index="${rhythm.playback_flow.length}" class="drop-zone"></div>`;

        return `
            <div id="flow-panel" class="editor-panel absolute top-0 left-0 h-100 bg-near-white shadow-2 pa3 ${isExpanded ? 'is-expanded' : ''}">
                <h3 class="f4 b absolute top-2 left-2 vertical-text">Rhythm Flow</h3>
                <div class="panel-content w-100">
                    <h3 class="f4 b mt0">Rhythm Flow</h3>
                    <div class="flow-list flex flex-column mt3">${flowItems}</div>
                    <button data-action="add-pattern" class="w-100 mt3 pv2 ph3 bn br2 bg-blue white pointer hover-bg-dark-blue f3">+</button>
                </div>
            </div>`;
    }

    _renderGridPanel(state) {
        const { rhythm, currentEditingPatternId } = state;
        if (!currentEditingPatternId || !rhythm.patterns[currentEditingPatternId]) {
            return '<p class="f5 gray i tc pa4">Select a pattern from the Rhythm Flow to edit, or add a new one.</p>';
        }

        const pattern = rhythm.patterns[currentEditingPatternId];
        const measure = pattern.pattern_data[0] || {};
        const resolution = pattern.metadata.resolution;
        const instruments = Object.keys(measure).sort();

        let gridHtml = '';
        instruments.forEach(symbol => {
            const noteString = (measure[symbol] || '').replace(/\|/g, '');
            gridHtml += `<div class="instrument-header">${symbol}</div>`;
            for (let i = 0; i < resolution; i++) {
                // This part would be enhanced to render SVG icons in a real implementation
                const noteChar = noteString[i] || '-';
                gridHtml += `<div class="grid-cell" data-action="edit-note" data-symbol="${symbol}" data-tick="${i}">${noteChar}</div>`;
            }
        });

        return `
            <div class="flex items-center justify-between mb3">
                <h2 class="f3 b mv0">Editing: ${currentEditingPatternId}</h2>
                <div class="playback-controls">
                    <button data-action="play-pattern" class="pv2 ph3 bn br2 bg-green white pointer hover-bg-dark-green mr2">Play Pattern</button>
                    <button data-action="play-rhythm" class="pv2 ph3 bn br2 bg-blue white pointer hover-bg-dark-blue">Play Rhythm</button>
                </div>
            </div>
            <div class="grid" style="grid-template-columns: 100px repeat(${resolution}, 1fr);">${gridHtml}</div>`;
    }

    _renderPalettePanel(state) {
        const { rhythm, isPalettePinned, selectedInstrumentSymbol, selectedNoteLetter } = state;
        const isExpanded = isPalettePinned || this.isPaletteHovered;

        let paletteContent = '<p class="f7 gray i">Select an instrument from the grid to see its notes.</p>';
        if (selectedInstrumentSymbol && rhythm.instrumentDefsBySymbol[selectedInstrumentSymbol]) {
            const instDef = rhythm.instrumentDefsBySymbol[selectedInstrumentSymbol];
            paletteContent = (instDef.sounds || []).map(sound => {
                const selectedClass = sound.letter === selectedNoteLetter ? 'bg-washed-blue' : '';
                return `<div data-action="select-note" data-note-letter="${sound.letter}" class="pointer pa2 br1 hover-bg-light-gray ${selectedClass}">${sound.name} (${sound.letter})</div>`;
            }).join('');
        }

        return `
            <div id="palette-panel" class="editor-panel absolute top-0 right-0 h-100 bg-near-white shadow-2 pa3 ${isExpanded ? 'is-expanded' : ''}">
                <h3 class="f4 b absolute top-2 right-2 vertical-text">Palette</h3>
                <div class="panel-content w-100">
                    <h3 class="f4 b mt0">Palette</h3>
                    ${paletteContent}
                </div>
            </div>`;
    }

    handleClick(event) {
        // First check if we're clicking on a specific action element
        const actionTarget = event.target.closest('[data-action]');
        if (actionTarget) {
            const action = actionTarget.dataset.action;
            logEvent('debug', 'RhythmEditorView', 'handleClick', 'Events', `Action: ${action}`);

            if (action === 'delete-flow-item') {
                event.stopPropagation(); // Prevent panel pinning when deleting
                if (window.confirm('Remove this pattern from the flow?')) {
                    this.callbacks.onDeleteFlowItem?.(parseInt(actionTarget.dataset.index, 10));
                }
                return; // Exit early to prevent panel pinning logic
            }
            if (action === 'add-pattern') {
                this.callbacks.onAddPattern?.();
                // Don't return here - we want clicking + to pin the panel if it's not pinned
            }
            if (action === 'select-pattern') {
                this.callbacks.onPatternSelect?.(actionTarget.dataset.patternId);
                // Don't return here - we want clicking a pattern to pin the panel if it's not pinned
            }
        }

        // Now handle panel pinning logic - ANY click within a panel should pin it
        const flowPanel = event.target.closest('#flow-panel');
        if (flowPanel) {
            this.callbacks.onPinFlowPanel?.(!this.state.isFlowPinned);
            return;
        }

        const palettePanel = event.target.closest('#palette-panel');
        if (palettePanel) {
            this.callbacks.onPinPalettePanel?.(!this.state.isPalettePinned);
            return;
        }
        
        // If clicking on the grid panel (not on sidebars), unpin both panels
        const gridPanel = event.target.closest('[data-action-scope="grid-panel"]');
        if (gridPanel) {
            this.callbacks.onPinFlowPanel?.(false);
            this.callbacks.onPinPalettePanel?.(false);
        }
    }
    
    handleMouseEnter(event) {
        // Only handle mouse enter for the panel elements themselves
        if (event.target.id === 'flow-panel' || event.target.closest('#flow-panel') === document.getElementById('flow-panel')) {
            if (!this.state.isFlowPinned && !this.isFlowHovered) {
                this.isFlowHovered = true;
                this.render(this.state);
            }
        }
        
        if (event.target.id === 'palette-panel' || event.target.closest('#palette-panel') === document.getElementById('palette-panel')) {
            if (!this.state.isPalettePinned && !this.isPaletteHovered) {
                this.isPaletteHovered = true;
                this.render(this.state);
            }
        }
    }

    handleMouseLeave(event) {
        // Check if we're actually leaving the panel (not just moving to a child element)
        if (event.target.id === 'flow-panel') {
            if (!this.state.isFlowPinned && this.isFlowHovered) {
                // Make sure we're actually leaving the panel area
                const rect = event.target.getBoundingClientRect();
                const { clientX, clientY } = event;
                if (clientX < rect.left || clientX > rect.right || clientY < rect.top || clientY > rect.bottom) {
                    this.isFlowHovered = false;
                    this.render(this.state);
                }
            }
        }
        
        if (event.target.id === 'palette-panel') {
            if (!this.state.isPalettePinned && this.isPaletteHovered) {
                // Make sure we're actually leaving the panel area
                const rect = event.target.getBoundingClientRect();
                const { clientX, clientY } = event;
                if (clientX < rect.left || clientX > rect.right || clientY < rect.top || clientY > rect.bottom) {
                    this.isPaletteHovered = false;
                    this.render(this.state);
                }
            }
        }
    }

    handleDragStart(event) {
        const item = event.target.closest('.flow-item');
        if (item) {
            this.draggedIndex = parseInt(item.dataset.index, 10);
            event.dataTransfer.effectAllowed = 'move';
            event.dataTransfer.setData('text/plain', ''); // Required for some browsers
            item.classList.add('dragging');
        }
    }

    handleDragOver(event) {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }

    handleDragEnter(event) {
        const dropZone = event.target.closest('[data-drop-zone]');
        if (dropZone && this.draggedIndex !== null) {
            // Remove previous drop indicators
            this.container.querySelectorAll('.drop-indicator').forEach(el => el.remove());
            
            // Add drop indicator
            const indicator = document.createElement('div');
            indicator.className = 'drop-indicator';
            dropZone.appendChild(indicator);
            
            // Add spacing to adjacent items
            const dropIndex = parseInt(dropZone.dataset.dropIndex, 10);
            const items = this.container.querySelectorAll('.flow-item');
            items.forEach((item, index) => {
                item.classList.remove('drop-spacing-before', 'drop-spacing-after');
                if (index === dropIndex - 1) item.classList.add('drop-spacing-after');
                if (index === dropIndex) item.classList.add('drop-spacing-before');
            });
        }
    }

    handleDragLeave(event) {
        // Only remove indicators when leaving the entire flow panel
        if (!event.target.closest('#flow-panel')) {
            this.container.querySelectorAll('.drop-indicator').forEach(el => el.remove());
            this.container.querySelectorAll('.flow-item').forEach(item => {
                item.classList.remove('drop-spacing-before', 'drop-spacing-after');
            });
        }
    }

    handleDrop(event) {
        event.preventDefault();
        const dropZone = event.target.closest('[data-drop-zone]');
        
        if (dropZone && this.draggedIndex !== null) {
            const dropIndex = parseInt(dropZone.dataset.dropIndex, 10);
            
            // Calculate the new position considering the item being moved
            let newIndex = dropIndex;
            if (this.draggedIndex < dropIndex) {
                newIndex = dropIndex - 1;
            }
            
            if (this.draggedIndex !== newIndex) {
                this.callbacks.onReorderFlow?.(this.draggedIndex, newIndex);
            }
        }
        
        // Clean up
        this.container.querySelectorAll('.drop-indicator').forEach(el => el.remove());
        this.container.querySelectorAll('.flow-item').forEach(item => {
            item.classList.remove('dragging', 'drop-spacing-before', 'drop-spacing-after');
        });
        this.draggedIndex = null;
    }
}